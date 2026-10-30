'use client';

import { useEffect, useState } from 'react';
import { ALL_BADGES, type Badge } from '@/lib/badges';

type Stats = {
  orders: number;
  reviews: number;
  chat: number;
  daysSinceRegister: number;
  profileFilled: boolean;
  hasAvatar: boolean;
  isOwner: boolean;
};

export default function BadgesWall({ compact = false }: { compact?: boolean }) {
  const [earned, setEarned] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/badges')
      .then((r) => r.json())
      .then((d) => {
        if (d.earned) {
          setEarned(d.earned.map((b: Badge) => b.id));
          setStats(d.stats || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Загрузка значков…</p>;

  const earnedList = ALL_BADGES.filter((b) => earned.includes(b.id));
  const lockedList = compact ? [] : ALL_BADGES.filter((b) => !earned.includes(b.id));
  const progress = stats ? Math.round((earned.length / ALL_BADGES.length) * 100) : 0;

  return (
    <div>
      {stats && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontWeight: 700 }}>Значки: {earned.length} из {ALL_BADGES.length}</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{progress}%</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-soft)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent), #ec4899)', transition: 'width .5s' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {earnedList.map((b) => (
          <div
            key={b.id}
            title={b.desc}
            style={{
              border: '1px solid rgba(139,92,246,0.4)',
              borderRadius: 14,
              padding: '14px 10px',
              textAlign: 'center',
              background: 'linear-gradient(180deg, rgba(139,92,246,0.14), rgba(139,92,246,0.03))',
              position: 'relative',
            }}
          >
            <span style={{ position: 'absolute', top: 6, left: 10, fontWeight: 800, color: 'var(--accent)', fontSize: '0.8rem' }}>
              {b.letter}
            </span>
            <div style={{ fontSize: '2rem', lineHeight: 1.2, marginBottom: 6 }}>{b.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{b.title}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{b.desc}</div>
          </div>
        ))}
      </div>

      {lockedList.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 12, color: 'var(--text-muted)' }}>🔒 Ещё не открыты</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, opacity: 0.55 }}>
            {lockedList.map((b) => (
              <div
                key={b.id}
                title={b.desc}
                style={{
                  border: '1px dashed var(--border)',
                  borderRadius: 14,
                  padding: '14px 10px',
                  textAlign: 'center',
                  filter: 'grayscale(0.7)',
                }}
              >
                <span style={{ position: 'absolute', top: 6, left: 10, fontWeight: 800, fontSize: '0.8rem' }}>{b.letter}</span>
                <div style={{ fontSize: '2rem', lineHeight: 1.2, marginBottom: 6 }}>{b.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{b.title}</div>
                <div style={{ fontSize: '0.7rem', marginTop: 4 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}