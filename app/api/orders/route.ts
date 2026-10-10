import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProductById, paymentFor } from '@/lib/products';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Требуется вход' }, { status: 401 });
  }

  let body: { productId?: string; paymentMethod?: 'funpay' | 'discord' | 'sbp' };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }

  const product = getProductById(body.productId || '');
  if (!product) {
    return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
  }

  const payment = paymentFor(product);

  // Пользователь может выбрать СБП для любого товара
  let method = body.paymentMethod || payment.method;
  if (!['funpay', 'discord', 'sbp'].includes(method)) {
    method = payment.method;
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      product_id: product.id,
      amount: product.price,
      payment_method: method,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: data, paymentUrl: payment.url });
}