import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ChatPanel from '@/components/ChatPanel';
import ProfileList from '@/components/ProfileList';

export default async function SocialSection() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Помечаем, что пользователь сейчас на сайте
  await supabase
    .from('profiles')
    .update({ last_seen: new Date().toISOString() })
    .eq('id', user.id);

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, uid, nickname, prefix, avatar_url, role, last_seen')
    .order('uid', { ascending: true })
    .limit(50);

  // Показываем всех пользователей (включая себя), чтобы список не был пустым
  const all = profiles || [];

  return (
    <section id="social" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-soft)' }}>
      <div className="container">
        <h2 className="sec-title">Сообщество</h2>
        <p className="sec-sub">Смотри профили других игроков и общайся — доступно после входа.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
          <ChatPanel me={user} users={all} />
          <ProfileList profiles={all} />
        </div>
      </div>
    </section>
  );
}

export const dynamic = 'force-dynamic';