'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { products, gameLabels } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

export type SortKey = 'default' | 'price-asc' | 'price-desc';

export default function ProductsCatalog({
  initialQuery = '',
  initialGame = 'all',
  initialMax = 600,
  initialSort = 'default',
}: {
  initialQuery?: string;
  initialGame?: string;
  initialMax?: number;
  initialSort?: SortKey;
}) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [game, setGame] = useState(initialGame);
  const [maxPrice, setMaxPrice] = useState(initialMax);
  const [sort, setSort] = useState<SortKey>(initialSort);

  const syncUrl = useCallback((q: string, g: string, m: number, s: SortKey) => {
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (g && g !== 'all') sp.set('game', g);
    if (m && m !== 600) sp.set('max', String(m));
    if (s && s !== 'default') sp.set('sort', s);
    const qs = sp.toString();
    router.replace(qs ? `/products?${qs}` : '/products', { scroll: false });
  }, [router]);

  const setQuerySafe = (v: string) => { setQuery(v); syncUrl(v, game, maxPrice, sort); };
  const setGameSafe = (v: string) => { setGame(v); syncUrl(query, v, maxPrice, sort); };
  const setMaxSafe = (v: number) => { setMaxPrice(v); syncUrl(query, game, v, sort); };
  const setSortSafe = (v: SortKey) => { setSort(v); syncUrl(query, game, maxPrice, v); };

  const games = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.game));
    return ['all', ...Array.from(set)];
  }, []);

  const maxAvailable = useMemo(() => Math.max(...products.map((p) => p.price)), []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let list = products.filter((p) => {
      const inGame = game === 'all' || p.game === game;
      const inQuery = !q || `${p.title} ${p.description} ${p.shortDescription} ${p.features.join(' ')}`.toLowerCase().includes(q);
      const inPrice = p.price <= maxPrice;
      return inGame && inQuery && inPrice;
    });

    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    return list;
  }, [query, game, maxPrice, sort]);

  const pricePresets = [100, 200, 300, 500, maxAvailable];
  const activeFilters = [query, game !== 'all' ? game : '', maxPrice !== 600 ? String(maxPrice) : '', sort !== 'default' ? sort : ''].filter(Boolean).length;

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="breadcrumb">Главная / Каталог</p>
          <h1>Каталог</h1>
          <p>Цифровые товары и дизайн-услуги для популярных игр. Мгновенная автовыдача после оплаты.</p>
        </div>
      </div>

      <section id="products">
        <div className="container">
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              {games.map((g) => (
                <button
                  key={g}
                  onClick={() => setGameSafe(g)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 30,
                    border: `1px solid ${game === g ? 'var(--accent)' : 'var(--border)'}`,
                    background: game === g ? 'rgba(139, 92, 246, 0.18)' : 'var(--bg-soft)',
                    color: game === g ? 'var(--accent)' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all .2s',
                  }}
                >
                  {g === 'all' ? '✨ Все категории' : `${gameLabels[g] || ''} ${g}`}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <input
                id="product-search"
                placeholder="🔍 Поиск по каталогу..."
                value={query}
                onChange={(e) => setQuerySafe(e.target.value)}
                style={{
                  flex: 1, minWidth: 220, padding: '11px 16px', fontSize: '0.95rem',
                  borderRadius: 10, border: '1px solid var(--border)',
                  background: 'var(--bg-soft)', color: 'var(--text)', fontFamily: 'inherit', outline: 'none',
                }}
              />
              <select
                value={sort}
                onChange={(e) => setSortSafe(e.target.value as SortKey)}
                style={{
                  padding: '11px 14px', fontSize: '0.9rem', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'var(--bg-soft)',
                  color: 'var(--text)', fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
                }}
              >
                <option value="default">Сортировка: по умолчанию</option>
                <option value="price-asc">Сначала дешевле</option>
                <option value="price-desc">Сначала дороже</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Цена до:</span>
              <input
                type="range"
                min={50}
                max={maxAvailable}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxSafe(Number(e.target.value))}
                style={{ flex: 1, minWidth: 160, accentColor: 'var(--accent)' }}
              />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent)', minWidth: 50 }}>
                {maxPrice >= maxAvailable ? 'все' : `${maxPrice} ₽`}
              </span>
              <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {pricePresets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setMaxSafe(p)}
                    style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: '0.8rem', cursor: 'pointer',
                      border: `1px solid ${maxPrice === p ? 'var(--accent)' : 'var(--border)'}`,
                      background: maxPrice === p ? 'rgba(139,92,246,0.18)' : 'var(--bg-soft)',
                      color: maxPrice === p ? 'var(--accent)' : 'var(--text-muted)',
                      fontWeight: 700, fontFamily: 'inherit',
                    }}
                  >
                    {p >= maxAvailable ? 'все' : `до ${p} ₽`}
                  </button>
                ))}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Найдено товаров: <b style={{ color: 'var(--text)' }}>{filtered.length}</b>
                {activeFilters > 0 && (
                  <button
                    onClick={() => { setQuerySafe(''); setGameSafe('all'); setMaxSafe(600); setSortSafe('default'); }}
                    style={{ marginLeft: 10, padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-soft)', color: 'var(--text-muted)', fontFamily: 'inherit' }}
                  >
                    ✕ Сбросить фильтры
                  </button>
                )}
              </p>
            </div>
          </div>

          <div className="grid-3" id="products-grid">
            {filtered.map((p) => (
              <div key={p.id} data-search={`${p.title} ${p.shortDescription || ''} ${p.features.join(' ')}`.toLowerCase()} style={{ display: 'block' }}>
                <ProductCard p={p} />
              </div>
            ))}
          </div>
          <p id="products-empty" style={{ display: filtered.length ? 'none' : 'block', textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0' }}>Ничего не найдено. Попробуй изменить фильтры.</p>

          <div style={{ textAlign: 'center', marginTop: 30, padding: '20px', border: '1px dashed var(--border)', borderRadius: '14px' }}>
            <p style={{ color: 'var(--text-muted)' }}>Не нашли нужное? Напиши нам в Telegram и мы что-нибудь придумаем специально для тебя.</p>
            <a href="https://t.me/vYwmyfBcyY" target="_blank" rel="noopener" className="btn btn-outline" style={{ marginTop: 10 }}>💬 Связаться: @vYwmyfBcyY</a>
          </div>
        </div>
      </section>
    </>
  );
}