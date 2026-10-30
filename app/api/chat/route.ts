import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Требуется вход' }, { status: 401 });

  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, user_id, content, created_at')
    .order('created_at', { ascending: true })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Добавляем отображаемое имя из таблицы profiles
  const ids = Array.from(new Set((data || []).map((m) => m.user_id)));
  let names: Record<string, string> = {};
  if (ids.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, nickname, prefix')
      .in('id', ids);
    (profiles || []).forEach((p) => {
      names[p.id] = p.prefix ? `${p.prefix} ${p.nickname || ''}` : (p.nickname || 'Пользователь');
    });
  }

  const messages = (data || []).map((m) => ({
    ...m,
    displayName: names[m.user_id] || 'Пользователь',
  }));

  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Требуется вход' }, { status: 401 });

  let body: { content?: string };
  try {
    const raw = await request.text();
    if (raw.length > 5000) return NextResponse.json({ error: 'Слишком большой запрос' }, { status: 413 });
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }

  const content = (body.content || '').trim();
  if (!content) return NextResponse.json({ error: 'Введите текст сообщения' }, { status: 400 });
  if (content.length > 2000) return NextResponse.json({ error: 'Сообщение слишком длинное (макс. 2000 символов)' }, { status: 413 });

  // Проверка бана
  const { data: profile } = await supabase
    .from('profiles')
    .select('banned_at')
    .eq('id', user.id)
    .single();
  if (profile?.banned_at) {
    return NextResponse.json({ error: 'Ваш аккаунт заблокирован' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ user_id: user.id, content })
    .select('id, user_id, content, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: { ...data, displayName: 'Пользователь' } });
}