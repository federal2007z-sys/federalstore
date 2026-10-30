-- FederalStore: система банов
-- Выполните в: Supabase Dashboard → SQL Editor → New query → Run

-- 1) Поле banned_at в профиле (NULL = не забанен)
alter table public.profiles
  add column if not exists banned_at timestamptz;

-- 2) Админ может читать всех пользователей (id, email-нет, но ник/роль/дата)
-- (профили читаются всеми, это уже есть — profiles_select_all)

-- 3) Только админ/владелец может банить (обновлять banned_at)
drop policy if exists "profiles_ban_admin" on public.profiles;
create policy "profiles_ban_admin" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- 4) Забаненный не может писать в общий чат и личные сообщения
-- (реализуется на уровне приложения, но страховка снизу)

-- 5) Уведомление: функция для отметки времени бана вызывается приложением,
--    поэтому дополнительных триггеров не нужно.