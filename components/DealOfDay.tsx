'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/products';
import type { Product } from '@/lib/products';

function timeLeft(): { h: string; m: string; s: string } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const diff = Math.max(0, end.getTime() - now.getTime());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return {
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    s: String(s).padStart(2, '0'),
  };
}

export default function DealOfDay({ product }: { product: Product }) {
  const [time, setTime] = useState(timeLeft());

  useEffect(() => {
    const t = setInterval(() => setTime(timeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  const oldPrice = Math.round(product.price * 1.4);
  const discount = Math.round((1 - product.price / oldPrice) * 100);

  return (
    <section className="deal-of-day reveal">
      <div className="container">
        <div className="deal-card">
          <div className="deal-top">
            <span className="deal-label">🔥 Товар дня</span>
            <span className="deal-timer">
              ⏳ {time.h}:{time.m}:{time.s}
            </span>
          </div>
          <div className="deal-body">
            <div className="deal-info">
              <h3>{product.title}</h3>
              <p>{product.shortDescription || product.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span className="deal-old-price">{formatPrice(oldPrice)}</span>
                <span className="deal-price">{formatPrice(product.price)}</span>
                <span className="deal-badge">-{discount}%</span>
                <Link href={`/products/${product.slug}`} className="btn btn-primary">Забрать скидку</Link>
              </div>
              <div className="deal-note">Скидка сгорает в 00:00 — цена меняется каждый день</div>
            </div>
            <div className="deal-emoji">{product.game === 'Все игры' ? '🎮' : '🕹️'}</div>
          </div>
        </div>
      </div>
    </section>
  );
}