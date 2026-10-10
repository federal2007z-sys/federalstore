'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Order } from '@/lib/types';
import { formatPrice } from '@/lib/products';

type Props = {
  orders: Order[];
  titleMap: Record<string, string>;
};

export default function AdminOrders({ orders, titleMap }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setStatus(orderId: string, status: string) {
    setBusyId(orderId);
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    });
    setBusyId(null);
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <table className="orders-table">
      <thead>
        <tr>
          <th>Продукт</th>
          <th>Покупатель</th>
          <th>Сумма</th>
          <th>Способ оплаты</th>
          <th>Статус</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id}>
            <td>{titleMap[o.product_id] || o.product_id}</td>
            <td>{o.user_id.slice(0, 8)}</td>
            <td>{formatPrice(o.amount)}</td>
            <td>{o.payment_method === 'discord' ? 'Discord' : o.payment_method === 'sbp' ? 'СБП' : 'FunPay'}</td>
            <td>
              <span className={`status status-${o.status}`}>{o.status}</span>
            </td>
            <td>
              {o.status === 'pending' && (
                <button
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                  disabled={busyId === o.id}
                  onClick={() => setStatus(o.id, 'paid')}
                >
                  Подтвердить оплату
                </button>
              )}
              {o.status === 'paid' && (
                <button
                  className="btn btn-outline"
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                  disabled={busyId === o.id}
                  onClick={() => setStatus(o.id, 'cancelled')}
                >
                  Отменить
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}