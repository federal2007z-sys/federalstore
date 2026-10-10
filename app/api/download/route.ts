import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('order');

  if (!orderId) {
    return NextResponse.json({ error: 'Не указан заказ' }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Требуется вход' }, { status: 401 });
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
  }

  if (order.status !== 'paid') {
    return NextResponse.json({ error: 'Заказ не оплачен' }, { status: 403 });
  }

  // Файл хранится в Supabase Storage, bucket "products", путь = product_id.txt
  const fileName = `${order.product_id}.txt`;

  const { data, error } = await supabase.storage
    .from('products')
    .createSignedUrl(fileName, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: 'Файл не найден. Обратитесь в поддержку.' },
      { status: 404 }
    );
  }

  return NextResponse.redirect(data.signedUrl);
}