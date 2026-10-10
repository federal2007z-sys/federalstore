'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Props = {
  productId: string;
  isLoggedIn: boolean;
  paymentUrl: string;
};

export default function BuyButton({ productId, isLoggedIn, paymentUrl }: Props) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleOrder(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (res.status === 401) {
        router.push(`/login?next=/products/${productId}`);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при оформлении заказа');
      }
      // Переход к заказу: после оплаты заказ будет в кабинете
      router.push('/account');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <Link href={`/login?next=/products/${productId}`} className="btn btn-primary">
        Войти, чтобы купить
      </Link>
    );
  }

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={handleOrder}
        disabled={loading}
      >
        {loading ? 'Оформляем...' : 'Оформить заказ'}
      </button>
      <p style={{ textAlign: 'center' }}>
        <a href={paymentUrl} target="_blank" rel="noopener" style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>
          Оплатить через FunPay/Discord
        </a>
      </p>
      {error && <p style={{ color: 'var(--red)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}
    </>
  );
}