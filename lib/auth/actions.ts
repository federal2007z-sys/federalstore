'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { sendTelegram, fmtRegistration } from '@/lib/telegram';

// Защита аккаунтов: требования к паролю, защита от слива (одинаковые сообщения),
// honeypot для ботов, блокировка подозрительных адресов.

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Пароль должен быть не короче 8 символов';
  if (password.length > 100) return 'Пароль слишком длинный';
  if (!/[A-Za-zА-Яа-яЁё]/.test(password)) return 'Пароль должен содержать буквы';
  if (!/\d/.test(password)) return 'Пароль должен содержать хотя бы одну цифру';
  // Запрещаем совсем примитивные пароли
  const weak = ['12345678', '123456789', 'qwerty123', 'password', 'пароль', 'qwertyui', '11111111', '00000000', 'qweasdzxc'];
  if (weak.includes(password.toLowerCase())) return 'Слишком простой пароль';
  return null;
}

// Простой переборщик: повторные попытки входа с одного email — замедляем
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_BLOCK_MS = 5 * 60 * 1000; // 5 минут

function checkLoginBlock(email: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(email);
  if (!entry) return false;
  if (entry.blockedUntil > now) return true;
  if (entry.count >= LOGIN_MAX_ATTEMPTS && entry.blockedUntil <= now) {
    entry.count = 0;
    return false;
  }
  return false;
}

function recordLoginFail(email: string) {
  const now = Date.now();
  const entry = loginAttempts.get(email) || { count: 0, blockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= LOGIN_MAX_ATTEMPTS) {
    entry.blockedUntil = now + LOGIN_BLOCK_MS;
    entry.count = 0;
    console.warn(`[auth] Блокировка входа для ${email} на 5 минут (много неудачных попыток)`);
  }
  loginAttempts.set(email, entry);
}

export async function login(formData: FormData) {
  const supabase = createClient();
  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') || '');
  const next = String(formData.get('next') || '/account');
  // Honeypot: скрытое поле — боты его заполняют
  const honeypot = String(formData.get('company_website') || '');
  if (honeypot) {
    redirect('/login?error=Некорректный запрос');
  }

  if (!email || !password) {
    redirect('/login?error=Введите email и пароль');
  }

  // Много неудачных попыток — блокируем
  if (checkLoginBlock(email)) {
    redirect('/login?error=Слишком много попыток. Подождите 5 минут.');
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Не раскрываем, существует ли аккаунт — одинаковое сообщение
    recordLoginFail(email);
    redirect('/login?error=Неверный email или пароль');
  }
  redirect(next);
}

export async function register(formData: FormData) {
  const supabase = createClient();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const fullName = String(formData.get('full_name') || '').trim();

  // Honeypot: скрытое поле для отлова ботов
  const honeypot = String(formData.get('company_website') || '');
  if (honeypot) {
    redirect('/register?error=Регистрация временно недоступна');
  }

  if (!email || !password) {
    redirect('/register?error=Заполните все поля');
  }

  // Проверка пароля
  const passError = validatePassword(password);
  if (passError) {
    redirect(`/register?error=${encodeURIComponent(passError)}`);
  }

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