'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type PaymentMethod = 'funpay' | 'discord' | 'sbp';

type Props = {
  productId: string;
  isLoggedIn: boolean;
  defaultPayment: PaymentMethod;
  paymentUrl?: string;
  price: number;
};

const SBP_CARD = '2204 2304 6044 7194 8';

export default function BuyButton({
  productId,
  isLoggedIn,
  defaultPayment,
  paymentUrl,
  price,
}: Props) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>(defaultPayment);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

  async function handleOrder(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, paymentMethod: method }),
      });
      if (res.status === 401) {
        router.push(`/login?next=/products/${productId}`);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при оформлении заказа');
      }
      setOrderCreated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  }

  async function copyCard() {
    try {
      await navigator.clipboard.writeText(SBP_CARD.replace(/\s+/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError('Не удалось скопировать. Номер: ' + SBP_CARD.replace(/\s+/g, ''));
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
    <div>
      {/* Выбор способа оплаты */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Способ оплаты:</p>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          style={{
            width: '100%', padding: '10px 12px', background: 'var(--bg-soft)',
            border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.95rem',
          }}
        >
          <option value="sbp">СБП (карта / QR) — на карту {SBP_CARD}</option>
          <option value={defaultPayment}>
            {defaultPayment === 'discord' ? 'Discord-сервер' : 'FunPay'}
          </option>
        </select>
      </div>

      {method === 'sbp' ? (
        <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
          <p style={{ fontWeight: 700, marginBottom: '6px' }}>Перевод по СБП ({price.toLocaleString('ru-RU')} ₽)</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
            Оплати по номеру карты — и укажи в комментарии к заказу свой ник (если банк позволяет).
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <code style={{ background: 'var(--card)', padding: '10px 14px', borderRadius: '8px', fontSize: '1.05rem', letterSpacing: '1px', flex: 1 }}>
              {SBP_CARD}
            </code>
            <button
              onClick={copyCard}
              className={copied ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ padding: '10px 16px', fontSize: '0.9rem', margin: 0, whiteSpace: 'nowrap' }}
            >
              {copied ? 'Скопировано ✓' : 'Копировать'}
            </button>
          </div>
          <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: '8px' }}>
            💳 Деньги приходят мгновенно. После оплаты мы подтвердим заказ — файл появится в кабинете.
          </p>
        </div>
      ) : (
        paymentUrl && (
          <a href={paymentUrl} target="_blank" rel="noopener" className="btn btn-primary" style={{ marginBottom: '8px' }}>
            Оплатить через {defaultPayment === 'discord' ? 'Discord' : 'FunPay'}
          </a>
        )
      )}

      <button
        className="btn btn-primary"
        onClick={handleOrder}
        disabled={loading}
        style={method !== 'sbp' ? { marginTop: '8px' } : undefined}
      >
        {loading ? 'Оформляем...' : orderCreated ? 'Заказ создан ✓' : 'Оформить заказ'}
      </button>

      {orderCreated && (
        <div className="form-success" style={{ marginTop: '12px' }}>
          Заказ создан! Оплати выбранным способом — после подтверждения файл появится в{' '}
          <Link href="/account" style={{ color: 'var(--green)', textDecoration: 'underline' }}>личном кабинете</Link>.
        </div>
      )}

      {error && <p style={{ color: 'var(--red)', fontSize: '0.9rem', textAlign: 'center', marginTop: '8px' }}>{error}</p>}
    </div>
  );
}