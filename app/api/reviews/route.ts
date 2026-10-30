import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const productId = new URL(request.url).searchParams.get('product') || '';
  if (!productId) return NextResponse.json({ error: 'Не указан товар' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('id, user_id, tg_user_id, rating, text, created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Подгружаем профили отдельно, так как прямой связи может не быть
  const userIds = (data || []).map((r) => r.user_id).filter(Boolean);
  let profilesById: Record<string, { nickname: string | null; avatar_url: string | null; prefix: string | null }> = {};
  if (userIds.length > 0) {
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, nickname, avatar_url, prefix')
      .in('id', userIds);
    (profs || []).forEach((p) => {
      profilesById[p.id] = { nickname: p.nickname, avatar_url: p.avatar_url, prefix: p.prefix };
    });
  }

  const reviews = (data || []).map((r) => ({
    ...r,
    profiles: r.user_id ? profilesById[r.user_id] || null : null,
  }));

  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Требуется вход' }, { status: 401 });

  let body: { productId?: string; rating?: number; text?: string };
  try {
    const raw = await request.text();
    if (raw.length > 5000) return NextResponse.json({ error: 'Слишком большой запрос' }, { status: 413 });
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }

  const productId = body.productId || '';
  const rating = Number(body.rating);
  const text = (body.text || '').trim();
  if (!productId || !Number.isInteger(rating) || rating < 1 || rating > 5 || !text) {
    return NextResponse.json({ error: 'Заполните все поля корректно' }, { status: 400 });
  }
  if (text.length > 1000) return NextResponse.json({ error: 'Отзыв слишком длинный' }, { status: 413 });

const { data, error } = await supabase
    .from('reviews')
    .insert({ user_id: user.id, product_id: productId, rating, text })
    .select('id, user_id, tg_user_id, rating, text, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const newReview = { ...data, profiles: null };
  return NextResponse.json({ review: newReview });
}