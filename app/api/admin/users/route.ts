import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdminUser } from '@/lib/isAdmin';

export async function GET() {
  const supabase = createClient();
  const isAdmin = await isAdminUser();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }

  // Список пользователей из profiles + метаданные пользователей (email) через auth
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, nickname, prefix, role, banned_at, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: profiles || [] });
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  const isAdmin = await isAdminUser();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }

  let body: { userId?: string; banned?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }

  const userId = body.userId;
  const banned = body.banned;

  if (!userId || typeof banned !== 'boolean') {
    return NextResponse.json({ error: 'Неверные параметры' }, { status: 400 });
  }

  // Нельзя забанить самого себя (владельца)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && user.id === userId) {
    return NextResponse.json({ error: 'Нельзя забанить самого себя' }, { status: 400 });
  }

  // Нельзя банить владельца/админа
  const { data: target } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (target?.role === 'owner' || target?.role === 'admin') {
    return NextResponse.json({ error: 'Нельзя забанить владельца или админа' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ banned_at: banned ? new Date().toISOString() : null })
    .eq('id', userId)
    .select('id, full_name, nickname, prefix, role, banned_at, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}