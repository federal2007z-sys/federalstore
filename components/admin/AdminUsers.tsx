'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type UserRow = {
  id: string;
  full_name?: string | null;
  nickname?: string | null;
  prefix?: string | null;
  role: string;
  banned_at?: string | null;
  created_at: string;
};

export default function AdminUsers({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [feed, setFeed] = useState(users);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function toggle(userId: string, banned: boolean) {
    setBusyId(userId);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, banned }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка');
        return;
      }
      setFeed((prev) => prev.map((u) => (u.id === userId ? data.user : u)));
    } catch {
      setError('Ошибка сети');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {error && <p style={{ color: 'var(--red)', marginBottom: 12 }}>{error}</p>}
      <table className="orders-table">
        <thead>
          <tr>
            <th>Пользователь</th>
            <th>Роль</th>
            <th>Регистрация</th>
            <th>Статус</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {feed.map((u) => {
            const displayName = [u.prefix, u.nickname || u.full_name].filter(Boolean).join(' ') || '—';
            const isBanned = !!u.banned_at;
            const isProtected = u.role === 'owner' || u.role === 'admin';
            return (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{displayName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {u.id.slice(0, 8)}…
                  </div>
                </td>
                <td>
                  <span className="card-badge">{u.role}</span>
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(u.created_at).toLocaleDateString('ru-RU')}
                </td>
                <td>
                  <span className={`status ${isBanned ? 'status-cancelled' : 'status-paid'}`}>
                    {isBanned ? 'Забанен' : 'Активен'}
                  </span>
                  {isBanned && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(u.banned_at!).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                </td>
                <td>
                  {isProtected ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                  ) : (
                    <button
                      className={isBanned ? 'btn btn-primary' : 'btn btn-outline'}
                      style={{ padding: '6px 14px', fontSize: '0.85rem', borderColor: isBanned ? undefined : 'var(--red)' }}
                      disabled={busyId === u.id}
                      onClick={() => toggle(u.id, !isBanned)}
                    >
                      {busyId === u.id ? '...' : isBanned ? 'Разбанить' : 'Забанить'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}