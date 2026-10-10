import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { products, getProductById, formatPrice } from '@/lib/products';
import type { Order } from '@/lib/types';

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  const paidOrders = (orders || []).filter((o) => o.status === 'paid');

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Мои заказы</h1>

      {!orders || orders.length === 0 ? (
        <div className="empty-state">
          <p>У тебя пока нет заказов.</p>
          <p><Link href="/products">Перейти в каталог</Link></p>
        </div>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Продукт</th>
              <th>Статус</th>
              <th>Оплата</th>
              <th>Сумма</th>
              <th>Дата</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(orders as Order[]).map((order) => {
              const product = getProductById(order.product_id);
              return (
                <tr key={order.id}>
                  <td>{product?.title || order.product_id}</td>
                  <td>
                    <span className={`status status-${order.status}`}>
                      {order.status === 'pending' && 'Ожидает оплаты'}
                      {order.status === 'paid' && 'Оплачен'}
                      {order.status === 'cancelled' && 'Отменён'}
                    </span>
                  </td>
                  <td>
                    {order.payment_method === 'discord' ? 'Discord' : order.payment_method === 'sbp' ? 'СБП' : 'FunPay'}
                  </td>
                  <td>{formatPrice(order.amount)}</td>
                  <td>{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                  <td>
                    {order.status === 'paid' && product && (
                      <Link
                        href={`/api/download?order=${order.id}`}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                      >
                        Скачать
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';