import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { products, formatPrice } from '@/lib/products';

const BOT_TOKEN = process.env.TG_BOT_TOKEN || '';
const OWNER_CHAT_ID = process.env.TG_OWNER_CHAT_ID || '8876410360';

async function tg(method: string, payload: Record<string, unknown>) {
  if (!BOT_TOKEN) return { ok: false };
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendMenu(chatId: number) {
  return tg('sendMessage', {
    chat_id: chatId,
    text: '👋 <b>Добро пожаловать в FederalStore!</b>\n\nГайды, аватарки, настройки прицелов и прокачка скилла для твоих любимых игр. Выбери действие:',
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🛒 Каталог товаров', callback_data: 'catalog' }],
        [{ text: '⭐ Оставить отзыв', callback_data: 'review' }],
        [{ text: '💬 Поддержка', callback_data: 'support' }],
      ],
    },
  });
}

export async function POST(request: Request) {
  const secret = request.headers.get('x-telegram-bot-api-secret-token') || '';
  if (secret && secret !== process.env.TG_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const update = await request.json().catch(() => null);
  if (!update) return NextResponse.json({ ok: false });

  console.log('[tg-bot] update id:', update.update_id, 'type:', update.message ? 'message' : update.callback_query ? 'callback' : 'other');
  if (update.message) {
    console.log('[tg-bot] msg from:', JSON.stringify(update.message.from), 'text:', (update.message.text || '').slice(0, 80));
  }
  if (update.callback_query) {
    console.log('[tg-bot] cb data:', update.callback_query.data, 'from:', JSON.stringify(update.callback_query.from));
  }

  const message = update.message;
  const callback = update.callback_query;
  const chatId = message?.chat?.id ?? callback?.message?.chat?.id;
  if (!chatId) return NextResponse.json({ ok: true });

  // Игнорируем сообщения от самого бота — защита от зацикливания
  if (message?.from?.is_bot) {
    console.log('[tg-bot] ignoring bot message');
    return NextResponse.json({ ok: true });
  }

  const supabase = createClient();

  try {
    // Callback-кнопки
    if (callback) {
      const data = callback.data as string;
      const from = callback.from as { id: number; username?: string; first_name?: string };
      const cId = callback.message.chat.id;

      if (data === 'catalog') {
        await tg('answerCallbackQuery', { callback_query_id: callback.id });
        const rows = products.map((p) => [
          { text: `${p.title} — ${formatPrice(p.price)}`, callback_data: `product:${p.id}` },
        ]);
        return await tg('sendMessage', {
          chat_id: cId,
          text: '🗂 <b>Наш каталог:</b>',
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: rows },
        });
      }

      if (data.startsWith('product:')) {
        await tg('answerCallbackQuery', { callback_query_id: callback.id });
        const p = products.find((x) => x.id === data.split(':')[1]);
        if (!p) return NextResponse.json({ ok: false });
        return await tg('sendMessage', {
          chat_id: cId,
          text:
            `<b>${esc(p.title)}</b>\n\n` +
            `${esc(p.shortDescription || p.description)}\n\n` +
            `💰 <b>${formatPrice(p.price)}</b> / навсегда\n\n` +
            `Для покупки нажмите кнопку ниже.`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ Оформить заказ', callback_data: `order:${p.id}` }],
              [{ text: '⬅️ Назад', callback_data: 'catalog' }],
            ],
          },
        });
      }

      if (data.startsWith('order:')) {
        const p = products.find((x) => x.id === data.split(':')[1]);
        if (!p) return NextResponse.json({ ok: false });
        const { data: order, error } = await supabase
          .from('orders')
          .insert({
            user_id: null,
            tg_user_id: from.id,
            product_id: p.id,
            amount: p.price,
            payment_method: 'sbp',
            status: 'pending',
            buyer_name: from.username || from.first_name || null,
            buyer_email: null,
          })
          .select()
          .single();
        if (error) return NextResponse.json({ ok: false });
        await tg('sendMessage', {
          chat_id: OWNER_CHAT_ID,
          text: `🛒 <b>Новый заказ из Telegram!</b>\n\nТовар: ${p.title}\nСумма: ${formatPrice(p.price)}\nПокупатель: @${from.username || from.first_name || from.id}\nЗаказ: ${order.id.slice(0, 8)}`,
          parse_mode: 'HTML',
        });
        await tg('sendMessage', {
          chat_id: cId,
          text:
            `✅ <b>Заказ сформирован!</b> №${order.id.slice(0, 8)}\n\n` +
            `Переведите <b>${formatPrice(p.price)}</b> на карту:\n<code>2204 2304 6044 7194 8</code>\n\n` +
            `В комментарии к переводу укажите <b>№${order.id.slice(0, 8)}</b>\n\n` +
            `Как только продавец подтвердит оплату, вы получите тут ссылку на скачивание.`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '⬅️ В меню', callback_data: 'menu' }]],
          },
        });
        return NextResponse.json({ ok: true });
      }

      if (data === 'menu') {
        await tg('answerCallbackQuery', { callback_query_id: callback.id });
        return await sendMenu(cId);
      }

      if (data === 'support') {
        await tg('sendMessage', {
          chat_id: OWNER_CHAT_ID,
          text: `💬 Обращение в поддержку от @${from.username || from.first_name || from.id} (id ${from.id})`,
          parse_mode: 'HTML',
        });
        await tg('sendMessage', {
          chat_id: cId,
          text: '💬 Напишите ваш вопрос — продавец получит его и ответит вам сюда.',
          reply_markup: {
            inline_keyboard: [[{ text: '⬅️ В меню', callback_data: 'menu' }]],
          },
        });
        return NextResponse.json({ ok: true });
      }

      if (data === 'review') {
        await tg('sendMessage', {
          chat_id: cId,
          text: '⭐ Напишите отзыв одним сообщением: что купили + оценка (1-5) + впечатления.\n\nНапример: <code>TRACELESS, 5 звёзд, топ!</code>',
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '⬅️ Отмена', callback_data: 'menu' }]],
          },
        });
        return NextResponse.json({ ok: true });
      }

      // Всегда отвечаем на callback, чтобы Telegram не повторял update
      await tg('answerCallbackQuery', { callback_query_id: callback.id });
      return NextResponse.json({ ok: true });
    }

    // Обычное текстовое сообщение
    const textMsg = message.text || '';
    const from = message.from as { id: number; username?: string; first_name?: string };

    // Команда /start или меню
    if (textMsg === '/start' || textMsg.toLowerCase() === 'старт' || textMsg.toLowerCase() === 'меню') {
      return await sendMenu(chatId);
    }

    if (textMsg === '/catalog' || textMsg.toLowerCase() === 'каталог') {
      const rows = products.map((p) => [
        { text: `${p.title} — ${formatPrice(p.price)}`, callback_data: `product:${p.id}` },
      ]);
      return await tg('sendMessage', {
        chat_id: chatId,
        text: '🗂 <b>Наш каталог:</b>',
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: rows },
      });
    }

    if (textMsg === '/support' || textMsg.toLowerCase() === 'поддержка') {
      await tg('sendMessage', {
        chat_id: OWNER_CHAT_ID,
        text: `💬 Обращение в поддержку от @${from.username || from.first_name || from.id} (id ${from.id})`,
        parse_mode: 'HTML',
      });
      return await tg('sendMessage', {
        chat_id: chatId,
        text: '💬 Напишите ваш вопрос — продавец получит его и ответит вам сюда.',
      });
    }

    if (textMsg === '/review' || textMsg.toLowerCase() === 'отзыв') {
      return await tg('sendMessage', {
        chat_id: chatId,
        text: '⭐ Напишите отзыв одним сообщением: что купили + оценка (1-5) + впечатления.\n\nНапример: <code>TRACELESS, 5 звёзд, топ!</code>',
        parse_mode: 'HTML',
      });
    }

    // Любой другой текст — если ждали отзыв (после /review), сохраняем его
    const lastText = (message.text || '').trim();
    if (lastText && !lastText.startsWith('/')) {
      const { data: savedReview, error: reviewErr } = await supabase
        .from('reviews')
        .insert({ user_id: null, tg_user_id: from.id, product_id: 'telegram', rating: 5, text: lastText.slice(0, 1000) })
        .select()
        .single();
      if (!reviewErr && savedReview) {
        await tg('sendMessage', {
          chat_id: OWNER_CHAT_ID,
          text: `⭐ Новый отзыв от @${from.username || from.first_name || from.id} (id ${from.id}):\n${lastText.slice(0, 1000)}`,
          parse_mode: 'HTML',
        });
        return await tg('sendMessage', {
          chat_id: chatId,
          text: '✅ Спасибо! Ваш отзыв отправлен продавцу и скоро появится на сайте.',
        });
      }
    }

    // Всё остальное — подсказка
    await tg('sendMessage', {
      chat_id: chatId,
      text: 'Не совсем понял вас. Используйте /start для меню, /catalog для каталога, /support для поддержки или /review для отзыва.',
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[tg-bot] error:', e);
    return NextResponse.json({ ok: false });
  }
}