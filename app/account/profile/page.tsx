import { createClient } from '@/lib/supabase/server';

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Профиль</h1>
      <div className="auth-form">
        <div className="form-group">
          <label>Имя / никнейм</label>
          <input type="text" value={user?.user_metadata?.full_name || ''} readOnly />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="text" value={user?.email || ''} readOnly />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Аккаунт создан: {user?.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '—'}
        </p>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';