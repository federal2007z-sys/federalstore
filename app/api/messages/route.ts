import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Требуется вход' }, { status: 401 });

  const other = new URL(request.url).searchParams.get('other') || '';
  if (!other) return NextResponse.json({ error: 'Укажите собеседника' }, { status: 400 });

const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, content, created_at')
    .or(`and(sender_id.eq.${user.id},recipient_id.eq.${other}),and(sender_id.eq.${other},recipient_id.eq.${user.id})`)
    .order('created_at', { ascending: true })
    .limit(200);

  // Помечаем входящие от собеседника как прочитанные
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('recipient_id', user.id)
    .eq('sender_id', other)
    .eq('is_read', false);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data || [] });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Требуется вход' }, { status: 401 });

  let body: { recipientId?: string; content?: string };
  try {
    const raw = await request.text();
    if (raw.length > 10000) {
      return NextResponse.json({ error: 'Слишком большой запрос' }, { status: 413 });
    }
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }

  const recipientId = body.recipientId || '';
  const content = (body.content || '').trim();
  if (!recipientId || !content) {
    return NextResponse.json({ error: 'Укажите собеседника и текст' }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: 'Сообщение слишком длинное (макс. 2000 символов)' }, { status: 413 });
  }
  if (recipientId === user.id) {
    return NextResponse.json({ error: 'Нельзя писать самому себе' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: user.id, recipient_id: recipientId, content })
    .select('id, sender_id, content, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: data });
}