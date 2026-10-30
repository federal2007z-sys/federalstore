'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';

type PaymentMethod = 'sbp' | 'paypal' | 'usdt' | 'card_global';

const SBP_CARD = '2204 2304 6044 7194 8';
const PAYPAL_EMAIL = 'federalstore@example.com';
const USDT_WALLET = '0xC12b843DB5e458C069f87925a320d0f7E556fA75';
const GLOBAL_CARD_BANK = 'GB29 NWBK 6016 1331 9268 19';
const USDT_MIN_AMOUNT = 50;

export default function BuyButton({
  productId,
  isLoggedIn,
  price,
}: {
  productId: string;
  isLoggedIn: boolean;
  price: number;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>('sbp');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [promo, setPromo] = useState('');
  const [promoMsg, setPromoMsg] = useState('');

  const USD_RATE = 90;
  const convertPrice = price / USD_RATE;

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError('Не удалось скопировать. Скопируйте вручную: ' + text);
    }
  }

  async function handleOrder(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, paymentMethod: method, promo: promo || undefined }),
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

  if (!isLoggedIn) {
    return (
      <Link href={`/login?next=/products/${productId}`} className="btn btn-primary">
        Войти, чтобы купить
      </Link>
    );
  }

  return (
    <div>
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
          <option value="sbp">СБП (карта / QR) — для РФ</option>
          <option value="paypal">PayPal — для всех стран</option>
          <option value="usdt">Криптовалюта (USDT ERC-20) — для всех стран</option>
          <option value="card_global">Международная карта — для всех стран</option>
        </select>
      </div>

      {method === 'sbp' ? (
        <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
          <p style={{ fontWeight: 700, marginBottom: '6px' }}>Перевод по СБП ({price.toLocaleString('ru-RU')} ₽)</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
            Отсканируй QR-код или оплати по номеру карты — и укажи в комментарии к заказу свой ник (если банк позволяет).
          </p>
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <QRCodeCanvas
              value={SBP_CARD.replace(/\s+/g, '')}
              size={200}
              marginSize={2}
              style={{ borderRadius: '10px', background: '#fff', padding: '8px' }}
            />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
              Наведи камеру банковского приложения
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <code style={{ background: 'var(--card)', padding: '10px 14px', borderRadius: '8px', fontSize: '1.05rem', letterSpacing: '1px', flex: 1 }}>
              {SBP_CARD}
            </code>
            <button
              onClick={() => copyText(SBP_CARD.replace(/\s+/g, ''))}
              className={copied ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ padding: '10px 16px', fontSize: '0.9rem', margin: 0, whiteSpace: 'nowrap' }}
            >
              {copied ? 'Скопировано ✓' : 'Копировать'}
            </button>
          </div>
          <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: '8px' }}>
            💳 Деньги приходят мгновенно. После оплаты мы подтвердим заказ — товар будет выдан автоматически.
          </p>
        </div>
      ) : method === 'paypal' ? (
        <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
          <p style={{ fontWeight: 700, marginBottom: '6px' }}>Оплата через PayPal ({convertPrice.toFixed(2)} $)</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
            Отправьте деньги на наш PayPal-аккаунт. В комментарии укажите номер заказа.
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <code style={{ background: 'var(--card)', padding: '10px 14px', borderRadius: '8px', fontSize: '1rem', flex: 1 }}>{PAYPAL_EMAIL}</code>
            <button onClick={() => copyText(PAYPAL_EMAIL)} className={copied ? 'btn btn-primary' : 'btn btn-outline'} style={{ padding: '10px 16px', fontSize: '0.9rem', margin: 0, whiteSpace: 'nowrap' }}>
              {copied ? 'Скопировано ✓' : 'Копировать'}
            </button>
          </div>
        </div>
      ) : method === 'usdt' ? (
        <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
          <p style={{ fontWeight: 700, marginBottom: '6px' }}>Криптовалюта USDT (ERC-20) — от ${USDT_MIN_AMOUNT}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
            Переведите USDT на кошелёк ниже (сеть <b>Ethereum ERC-20</b>). Минимальная сумма пополнения — <b>${USDT_MIN_AMOUNT}</b>.
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <code style={{ background: 'var(--card)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', flex: 1, wordBreak: 'break-all' }}>{USDT_WALLET}</code>
            <button onClick={() => copyText(USDT_WALLET)} className={copied ? 'btn btn-primary' : 'btn btn-outline'} style={{ padding: '10px 16px', fontSize: '0.9rem', margin: 0, whiteSpace: 'nowrap' }}>
              {copied ? 'Скопировано ✓' : 'Копировать'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
          <p style={{ fontWeight: 700, marginBottom: '6px' }}>Международная карта ({convertPrice.toFixed(2)} $)</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
            Перевод на международный банковский счёт (IBAN). Работает для всех стран.
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <code style={{ background: 'var(--card)', padding: '10px 14px', borderRadius: '8px', fontSize: '1rem', flex: 1 }}>{GLOBAL_CARD_BANK}</code>
            <button onClick={() => copyText(GLOBAL_CARD_BANK)} className={copied ? 'btn btn-primary' : 'btn btn-outline'} style={{ padding: '10px 16px', fontSize: '0.9rem', margin: 0, whiteSpace: 'nowrap' }}>
              {copied ? 'Скопировано ✓' : 'Копировать'}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: '12px' }}>
        <input
          type="text"
          placeholder="Промокод (например FEDERAL)"
          value={promo}
          onChange={(e) => { setPromo(e.target.value); setPromoMsg(''); }}
          style={{
            flex: 1, padding: '10px 12px', fontSize: '0.9rem',
            borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--bg-soft)', color: 'var(--text)',
            fontFamily: 'inherit', outline: 'none', textTransform: 'uppercase' as const,
          }}
        />
        {promo && (
          <span style={{ fontSize: '0.8rem', color: 'var(--green)', whiteSpace: 'nowrap' }}>
            {promo.toUpperCase() === 'FEDERAL' ? '-20%' : '—'}
          </span>
        )}
      </div>
      {promoMsg && <p style={{ fontSize: '0.85rem', color: 'var(--green)', marginBottom: 8 }}>{promoMsg}</p>}

      <button
        className="btn btn-primary"
        onClick={handleOrder}
        disabled={loading}
        style={method !== 'sbp' ? { marginTop: '8px' } : undefined}
      >
        {loading ? 'Оформляем...' : orderCreated ? 'Заказ создан ✓' : 'Оформить заказ'}
      </button>

      {orderCreated && (
        <div className="form-success" style={{ marginTop: '12px', textAlign: 'left' }}>
          <p style={{ marginBottom: '8px', fontWeight: 700, textAlign: 'center' }}>Заказ создан! ✅ Что делать дальше:</p>
          <ol style={{ margin: 0, paddingLeft: 18, color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.7 }}>
            <li><b>Оплати заказ</b> выбранным способом (переведи деньги, как указано выше).</li>
            <li>Мы получим уведомление и <b>подтвердим оплату</b> в течение пары минут (обычно мгновенно).</li>
            <li>После подтверждения заказ станет доступен в <Link href="/account" style={{ color: 'var(--green)', textDecoration: 'underline', fontWeight: 700 }}>личном кабинете</Link> — там появится кнопка <b>Скачать</b>.</li>
            <li>Нажми <b>Скачать</b> — и ты получишь файл (или ссылку на него) мгновенно.</li>
          </ol>
          <div style={{ marginTop: 12 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8 }}>
              🔒 Файл откроется в <Link href="/account" style={{ color: 'var(--green)', textDecoration: 'underline', fontWeight: 700 }}>личном кабинете</Link> после подтверждения оплаты.
            </p>
            <Link href="/account" className="btn btn-primary" style={{ width: '100%' }}>
              📥 Перейти в личный кабинет
            </Link>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 10, textAlign: 'center' }}>
            Проблемы с оплатой? Пиши нам — поможем! Поддержка: @vYwmyfBcyY
          </p>
        </div>
      )}

      {error && <p style={{ color: 'var(--red)', fontSize: '0.9rem', textAlign: 'center', marginTop: '8px' }}>{error}</p>}
    </div>
  );
}