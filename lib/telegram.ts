// Отправка уведомлений в Telegram владельцу магазина.
// Требуются переменные окружения:
//   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
//   TELEGRAM_CHAT_ID   — chat_id владельца (числовой ID)

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

export function telegramEnabled(): boolean {
  return Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);
}

export async function sendTelegram(text: string): Promise<boolean> {
  if (!telegramEnabled()) {
    console.warn('[telegram] Уведомления не настроены: нет TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID');
    return false;
  }

  // API Telegram не принимает HTML с ошибками и не любит длинные сообщения (~4000)
  const safeText = text.slice(0, 3500);

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: safeText,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      console.error('[telegram] Ошибка отправки:', data?.description || res.statusText);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[telegram] Ошибка сети:', err);
    return false;
  }
}

// Форматирование сообщений — простая помощь

export function fmtOrder(order: {
  id: string;
  productTitle: string;
  amount: number;
  paymentLabel: string;
  buyerName?: string | null;
  buyerEmail?: string | null;
}): string {
  const lines = [
    '🛒 <b>Новый заказ!</b>',
    '',
    `📍 Товар: <b>${order.productTitle}</b>`,
    `💰 Сумма: ${order.amount.toLocaleString('ru-RU')} ₽`,
    `💳 Оплата: ${order.paymentLabel}`,
    `👤 Покупатель: ${order.buyerName || '—'}`,
    `📧 Email: ${order.buyerEmail || '—'}`,
    '',
    `🆔 Заказ: ${order.id.slice(0, 8)}`,
  ];
  return lines.join('\n');
}

export function fmtPayment(order: {
  id: string;
  productTitle: string;
  amount: number;
  paymentLabel: string;
}): string {
  const lines = [
    '✅ <b>Оплата подтверждена!</b>',
    '',
    `📍 Товар: <b>${order.productTitle}</b>`,
    `💰 Сумма: ${order.amount.toLocaleString('ru-RU')} ₽`,
    `💳 Способ: ${order.paymentLabel}`,
    '',
    `🆔 Заказ: ${order.id.slice(0, 8)}`,
    'Покупателю теперь доступно скачивание файла.',
  ];
  return lines.join('\n');
}

export function fmtRegistration(user: {
  email?: string;
  fullName?: string;
}): string {
  const lines = [
    '👤 <b>Новая регистрация на сайте!</b>',
    '',
    `📧 Email: ${user.email || '—'}`,
    `👤 Имя: ${user.fullName || '—'}`,
    '',
    'Теперь загляни в админ-панель, когда появится заказ.',
  ];
  return lines.join('\n');
}