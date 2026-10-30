import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProductById } from '@/lib/products';
import fs from 'fs';
import path from 'path';

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

  // Если у товара задана прямая ссылка на скачивание (внешняя) — ведём туда
  const product = getProductById(order.product_id);

  if (!product) {
    return NextResponse.json(
      { error: 'Этот товар снят с продажи. Обратитесь в поддержку.' },
      { status: 404 }
    );
  }

  const external = product.postPurchase?.downloadUrl;
  // Внутренние ссылки (federal-store.ru/downloads/...) игнорируем —
  // файлы отдаём из приватной папки после проверки оплаты
  if (external && !external.includes('federal-store.ru/downloads/')) {
    return NextResponse.redirect(external);
  }

  // Файл лежит в private/downloads/{product_id}.txt
  const fileName = `${order.product_id}.txt`;
  const filePath = path.join(process.cwd(), 'private', 'downloads', fileName);

  if (!fs.existsSync(filePath)) {
    // Пробуем по slug — некоторые товары имеют файл с другим именем
    const sl = product.slug;
    const altPath = path.join(process.cwd(), 'private', 'downloads', `${sl}.txt`);
    if (fs.existsSync(altPath)) {
      const content = fs.readFileSync(altPath, 'utf8');
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${sl}.txt"`,
          'Cache-Control': 'private, no-store',
        },
      });
    }
    return NextResponse.json(
      { error: 'Файл ещё не загружен. Ожидайте, мы пришлём его в ближайшее время.' },
      { status: 404 }
    );
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}