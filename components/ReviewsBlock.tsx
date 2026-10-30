'use client';

import { useEffect, useState } from 'react';

type Review = {
  id: number;
  user_id: string;
  rating: number;
  text: string;
  created_at: string;
  profiles: { nickname: string | null; avatar_url: string | null; prefix: string | null } | null;
};

export default function ReviewsBlock({ productId, isLoggedIn }: { productId: string; isLoggedIn: boolean }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function load() {
    try {
      const res = await fetch(`/api/reviews?product=${productId}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function submit() {
    if (!text.trim()) {
      setError('Напишите текст отзыва');
      return;
    }
    setError('');
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, rating, text }),
    });
    if (res.status === 401) {
      window.location.href = `/login?next=/products/${productId}`;
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Ошибка при отправке');
      return;
    }
    setSaved(true);
    setText('');
    setRating(5);
    await load();
    setTimeout(() => setSaved(false), 3000);
  }

  const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

  return (
    <div style={{ marginTop: 40 }}>
      <h3 style={{ marginBottom: 16 }}>Отзывы покупателей ({reviews.length})</h3>

      {isLoggedIn && (
        <div className="card" style={{ marginBottom: 16, padding: 20 }}>
          <h4 style={{ marginBottom: 12 }}>Оставить отзыв</h4>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '1.6rem', color: n <= rating ? 'var(--accent)' : 'var(--border)',
                }}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Поделитесь впечатлениями о продукте..."
            maxLength={1000}
            rows={3}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--bg-soft)',
              color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical',
            }}
          />
          {error && <p style={{ color: 'var(--red)', fontSize: '0.85rem', marginTop: 8 }}>{error}</p>}
          <button className="btn btn-primary" onClick={submit} style={{ marginTop: 10, padding: '10px 22px' }}>
            {saved ? 'Отправлено ✓' : 'Отправить отзыв'}
          </button>
        </div>
      )}

      {loading && <p style={{ color: 'var(--text-muted)' }}>Загрузка...</p>}
      {!loading && reviews.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>Отзывов пока нет. Будьте первым!</p>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {reviews.map((r) => (
          <div key={r.id} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              {r.profiles?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.profiles.avatar_url}
                  alt=""
                  width={38}
                  height={38}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--bg-soft)', border: '1px solid var(--border)' }} />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {r.profiles?.prefix ? `${r.profiles.prefix} ` : ''}
                  {r.profiles?.nickname || 'Пользователь'}
                </div>
                <div style={{ color: 'var(--accent)', fontSize: '0.95rem' }}>{stars(r.rating)}</div>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{r.text}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 8 }}>
              {new Date(r.created_at).toLocaleDateString('ru-RU')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}