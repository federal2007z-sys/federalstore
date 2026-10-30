-- FederalStore: ник и префикс в профиле
alter table public.profiles
  add column if not exists nickname text,
  add column if not exists prefix text;

-- Пользователь может читать и обновлять свои nickname/prefix
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);