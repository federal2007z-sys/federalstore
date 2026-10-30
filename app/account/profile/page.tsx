import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { updateProfile } from '@/lib/auth/profile-actions';
import AccentPicker from '@/components/AccentPicker';
import BadgesWall from '@/components/BadgesWall';

export default async function ProfilePage(props: {
  searchParams?: Promise<{ ok?: string; error?: string }>;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const params = await props.searchParams;

let profile: {
    role: string | null;
    nickname: string | null;
    prefix: string | null;
    avatar_url: string | null;
    uid: number | null;
    accent_color: string | null;
    bg_color: string | null;
  } | null = null;

  if (user) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role, nickname, prefix, avatar_url, uid, accent_color, bg_color')
        .eq('id', user.id)
        .single();
      profile = data || null;
    } catch {
      profile = null;
    }
  }

  const role = profile?.role || null;

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Профиль</h1>

      {params?.ok && (
        <div className="form-success">Профиль обновлён</div>
      )}
      {params?.error && (
        <div className="form-error">{params.error}</div>
      )}

      <form action={updateProfile} className="auth-form">
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile?.avatar_url || '/default-avatar.png'}
            alt="Аватар"
            width={72}
            height={72}
            style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
          />
          <div style={{ flex: 1 }}>
            <label>Аватар</label>
            <input type="file" name="avatar" accept="image/*" />
          </div>
        </div>

        <div className="form-group">
          <label>Ник</label>
          <input type="text" name="nickname" defaultValue={profile?.nickname || ''} placeholder="Ваш ник" />
        </div>

        <div className="form-group">
          <label>Префикс</label>
          <input type="text" name="prefix" defaultValue={profile?.prefix || ''} placeholder="Например: #" maxLength={8} />
        </div>

        <AccentPicker accent={profile?.accent_color || null} bg={profile?.bg_color || null} isLoggedIn={!!user} />

        <div className="form-group">
          <label>Email</label>
          <input type="text" value={user?.email || ''} readOnly />
        </div>

        {role && (
          <div className="form-group">
            <label>Роль</label>
            <div>
              {role === 'owner' && <span className="owner-badge">👑 Владелец</span>}
              {role === 'admin' && <span className="admin-badge">Администратор</span>}
              {role === 'buyer' && <span className="buyer-badge">✓ Покупатель</span>}
              {role === 'user' && <span style={{ color: 'var(--text-muted)' }}>Пользователь</span>}
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '8px' }}>
          Сохранить
        </button>

        {profile?.uid ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '14px', textAlign: 'center' }}>
            Мой профиль:{' '}
            <Link href={`/profile/uid/${profile.uid}`} style={{ color: 'var(--accent)' }}>
              /profile/uid/{profile.uid}
            </Link>
          </p>
        ) : null}

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px', textAlign: 'center' }}>
          Аккаунт создан: {user?.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '—'}
        </p>
      </form>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 12 }}>🏅 Мои значки</h2>
        <BadgesWall />
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';