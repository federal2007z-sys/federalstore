import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdminUser } from '@/lib/isAdmin';
import { getProductById } from '@/lib/products';
import { sendTelegram, fmtPayment } from '@/lib/telegram';

const paymentLabels: Record<string, string> = {
  sbp: 'СБП (карта / QR)',
  funpay: 'FunPay',
  discord: 'Discord',
};

export async function PATCH(request: Request) {
  const supabase = createClient();

  const isAdmin = await isAdminUser();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }

  let body: { orderId?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }

  const { orderId, status } = body;
  if (!orderId || !['pending', 'paid', 'cancelled'].includes(status || '')) {
    return NextResponse.json({ error: 'Неверные параметры' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Уведомление владельцу при подтверждении оплаты
  if (status === 'paid') {
    const product = getProductById(data.product_id);
    await sendTelegram(
      fmtPayment({
        id: data.id,
        productTitle: product?.title || data.product_id,
        amount: data.amount,
        paymentLabel: paymentLabels[data.payment_method] || data.payment_method,
      })
    );
  }

  return NextResponse.json({ order: data });
}