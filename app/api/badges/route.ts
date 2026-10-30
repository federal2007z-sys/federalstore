import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ALL_BADGES, badgeEarned, type Badge } from '@/lib/badges';

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Требуется вход' }, { status: 401 });
  }

  const today = new Date();

  // 1. Профиль (роль, ник, аватар, дата регистрации)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, nickname, prefix, avatar_url, created_at')
    .eq('id', user.id)
    .single();

  const isOwner = profile?.role === 'owner' || profile?.role === 'admin';
  const profileFilled = Boolean(profile?.nickname || profile?.prefix);
  const hasAvatar = Boolean(profile?.avatar_url);
  const regDate = profile?.created_at ? new Date(profile.created_at) : today;
  const daysSinceRegister = Math.max(0, Math.floor((today.getTime() - regDate.getTime()) / 86400000));

  // 2. Заказы (оплаченные)
  const { count: orders } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'paid');

  // 3. Отзывы
  const { count: reviews } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // 4. Сообщения в чате
  const { count: chat } = await supabase
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const stats = {
    orders: orders || 0,
    reviews: reviews || 0,
    chat: chat || 0,
    daysSinceRegister,
    profileFilled,
    hasAvatar,
    isOwner,
  };

  const earned: Badge[] = ALL_BADGES.filter((b) => badgeEarned(b, stats));
  const locked: Badge[] = ALL_BADGES.filter((b) => !badgeEarned(b, stats));

  return NextResponse.json({
    stats,
    earned,
    locked,
  });
}