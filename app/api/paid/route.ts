import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProductById } from '@/lib/products';
import { sendTelegram } from '@/lib/telegram';

// POST /api/paid — покупатель нажал «Я оплатил».
// Ищем его активный (pending) заказ на этот товар и шлём владельцу уведомление в Telegram,
// чтобы он подтвердил оплату в пару кликов (в админке /admin).

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Требуется вход' }, { status: 401 });

  let body: { productId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }
  const productId = body.productId || '';
  if (!productId) return NextResponse.json({ error: 'Не указан товар' }, { status: 400 });

  // Берём последний незакрытый заказ пользователя на этот товар
  const { data: order } = await supabase
    .from('orders')
    .select('id, product_id, amount, status, created_at')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .in('status', ['pending'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: 'Активный заказ не найден. Оформите заказ заново.' }, { status: 404 });
  }

  const product = getProductById(order.product_id);

  await sendTelegram(
    `💳 <b>Покупатель сообщил об оплате!</b>\n\n` +
      `Товар: <b>${product?.title || order.product_id}</b>\n` +
      `Сумма: ${order.amount} ₽\n` +
      `Заказ: <code>${order.id.slice(0, 8)}</code>\n\n` +
      `Проверьте поступление и подтвердите: /admin`
  );

  return NextResponse.json({ ok: true, orderId: order.id });
}