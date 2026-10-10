'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { sendTelegram, fmtRegistration } from '@/lib/telegram';

export async function login(formData: FormData) {
  const supabase = createClient();
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const next = String(formData.get('next') || '/account');

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect(next);
}

export async function register(formData: FormData) {
  const supabase = createClient();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const fullName = String(formData.get('full_name') || '').trim();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  // Уведомление владельцу в Telegram о новой регистрации
  await sendTelegram(
    fmtRegistration({
      email,
      fullName: fullName || undefined,
    })
  );

  // Если подтверждение email выключено в Supabase — пользователь сразу вошёл
  if (data.session) {
    redirect('/account');
  }

  // Иначе — отправляем на страницу «проверь почту»
  redirect('/register/check');
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/');
}