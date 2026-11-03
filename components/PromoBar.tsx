'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PromoBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Показываем после скролла или сразу — на выбор; сделаем сразу
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="promo-bar">
      <Link href="/products" style={{ color: 'inherit', textDecoration: 'none' }}>
        🎁 <b>Промокод FEDERAL</b> — скидка <b>−20%</b> на все товары! Забирай сейчас →
      </Link>
    </div>
  );
}