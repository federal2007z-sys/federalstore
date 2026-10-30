import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/products';

export default async function PublicProfilePage({ params }: { params: { uid: string } }) {
  const uid = Number(params.uid);
  if (!Number.isInteger(uid) || uid < 1) notFound();

  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, uid, nickname, prefix, avatar_url, role, created_at, views')
    .eq('uid', uid)
    .single();

  if (!profile) notFound();

  // Считаем просмотр профиля (не для себя) — бесшумно, даже если гость
  let viewerId: string | null = null;
  try {
    const { data: v } = await supabase.auth.getUser();
    viewerId = v.user?.id || null;
  } catch {
    viewerId = null;
  }
  if (viewerId && viewerId !== profile.id) {
    try {
      await supabase.rpc('increment_profile_views', { row_id: profile.id });
    } catch {
      // ignore
    }
  }

  const roleLabel =
    profile.role === 'owner' ? 'Владелец · Seller'
    : profile.role === 'seller' ? 'Seller'
    : profile.role === 'admin' ? 'Администратор'
    : profile.role === 'buyer' ? 'Участник'
    : 'Неизвестный';

  const roleIcon =
    profile.role === 'owner' ? '👑 🛒'
    : profile.role === 'seller' ? '🛒'
    : profile.role === 'admin' ? '🛡️'
    : profile.role === 'buyer' ? '✓' : '';

  const stat = (icon: string, num: string | number, label: string) => (
    <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 10px', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{icon} {num}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="breadcrumb">
            <Link href="/">Главная</Link> / <Link href="/account">Кабинет</Link> / UID {profile.uid}
          </p>
          <h1>Профиль #{profile.uid}</h1>
        </div>
      </div>

      <section>
        <div className="container" style={{ maxWidth: 720 }}>
          {/* Шапка профиля */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt="Аватар"
                width={110}
                height={110}
                style={{ borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)', boxShadow: 'var(--shadow)' }}
              />
            ) : (
              <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'var(--card)', border: '3px solid var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800 }}>
                {profile.nickname?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h2 style={{ fontSize: '1.7rem', margin: 0 }}>
                {profile.prefix ? `${profile.prefix} ` : `${roleLabel} `}
                {profile.nickname || 'Без имени'}
              </h2>
              <div style={{ marginTop: 8, fontSize: '0.95rem' }}>{roleIcon} {roleLabel}</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>
                Регистрация: {new Date(profile.created_at).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>

          {/* Статистика */}
          <h3 style={{ fontSize: '1.1rem', margin: '20px 0 12px', letterSpacing: '0.5px' }}>СТАТИСТИКА</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
            {stat('👁️', profile.views ?? 0, 'Просмотров профиля')}
            {stat('📅', new Date(profile.created_at).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' }), 'На сайте с')}
            {stat('🛒', 0, 'Покупок')}
            {stat('💬', 0, 'Сообщений')}
          </div>

          {/* Вкладки */}
          <div style={{ display: 'flex', gap: 8, margin: '24px 0 16px', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            {['Сводка', 'Активность', 'Значки'].map((tab, i) => (
              <span
                key={tab}
                style={{
                  padding: '8px 18px', borderRadius: 10, cursor: 'pointer',
                  background: i === 0 ? 'var(--accent)' : 'var(--bg-soft)',
                  color: i === 0 ? '#17110a' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.9rem', border: '1px solid var(--border)',
                }}
              >
                {tab}
              </span>
            ))}
          </div>

          {/* Сводка */}
          <div style={{ display: 'grid', gap: 12 }}>
            <div className="card" style={{ padding: 18 }}>
              <h4 style={{ marginBottom: 6 }}>👋 О себе</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Пока не заполнено. Скоро здесь появится информация об этом пользователе.</p>
            </div>
            <div className="card" style={{ padding: 18 }}>
              <h4 style={{ marginBottom: 6 }}>🛒 Последние покупки</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Здесь будут отображаться купленные товары.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export const dynamic = 'force-dynamic';