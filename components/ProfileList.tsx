import Link from 'next/link';

function isOnline(lastSeen?: string | null): boolean {
  if (!lastSeen) return false;
  const delta = Date.now() - new Date(lastSeen).getTime();
  return delta < 2 * 60 * 1000; // 2 минуты
}

type Props = {
  profiles: {
    id: string;
    uid: number | null;
    nickname: string | null;
    prefix: string | null;
    avatar_url: string | null;
    role: string | null;
    last_seen?: string | null;
  }[];
};

export default function ProfileList({ profiles }: Props) {
  if (profiles.length === 0) {
    return (
      <div className="card" style={{ position: 'sticky', top: 84 }}>
        <h3>Профили</h3>
        <p style={{ marginTop: 8 }}>Пока здесь пусто. Поделись ссылкой на сайт с друзьями!</p>
      </div>
    );
  }

  const roleLabel = (r: string | null) =>
    r === 'owner' ? 'Владелец · Seller'
    : r === 'seller' ? 'Seller'
    : r === 'admin' ? 'Админ'
    : r === 'buyer' ? 'Участник'
    : 'Неизвестный';

  const roleIcon = (r: string | null) =>
    r === 'owner' ? '👑 🛒' : r === 'admin' ? '🛡️' : r === 'buyer' ? '✓' : r === 'seller' ? '🛒' : '';

  return (
    <div className="card" style={{ position: 'sticky', top: 84, maxHeight: '70vh', overflowY: 'auto' }}>
      <h3 style={{ marginBottom: 14 }}>Профили ({profiles.length})</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {profiles.map((p) => (
          <Link
            key={p.id}
            href={`/profile/uid/${p.uid}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--card)',
              transition: 'border-color .2s',
            }}
          >
            {p.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.avatar_url}
                alt=""
                width={36}
                height={36}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-soft)', border: '1px solid var(--border)' }} />
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.prefix ? `${p.prefix} ` : roleLabel(p.role) + ' '}
                {p.nickname || 'Без имени'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                UID #{p.uid} {roleIcon(p.role)}
              </div>
            </div>
            <span
              title={isOnline(p.last_seen) ? 'В сети' : 'Не в сети'}
              style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: isOnline(p.last_seen) ? 'var(--green)' : 'var(--border)',
                boxShadow: isOnline(p.last_seen) ? '0 0 6px var(--green)' : 'none',
              }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}