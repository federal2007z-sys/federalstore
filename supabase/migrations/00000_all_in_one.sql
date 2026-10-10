-- ============================================================
-- FederalSeller/ShulmirovSeller — ВСЕ ОДНИМ БЛОКОМ
-- Выполните в: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1) Профили пользователей (с ролью)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user', 'buyer', 'admin', 'owner')),
  created_at timestamptz not null default now()
);

-- Автоматическое создание профиля при регистрации
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', null), 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) Заказы
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  amount integer not null,
  payment_method text not null check (payment_method in ('funpay', 'discord', 'sbp')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  buyer_email text,
  buyer_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_product_id_idx on public.orders (product_id);

-- 3) Функция проверки админа/владельца
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'owner')
  );
$$;

-- 4) RLS
alter table public.profiles enable row level security;
alter table public.orders enable row level security;

-- Профиль: видно всем (для бейджа «Владелец»), но правил только свой
create policy "profiles_select_all" on public.profiles
  for select using (true);

-- Заказы: пользователь видит только свои
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

-- Заказы: пользователь может создать свой заказ
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);

-- Админ видит все заказы
create policy "orders_select_admin" on public.orders
  for select using (public.is_admin());

-- Админ может обновлять статус заказов
create policy "orders_update_admin" on public.orders
  for update using (public.is_admin());

-- 5) НАЗНАЧЕНИЕ ВЛАДЕЛЬЦА
-- Меняет роль на 'owner' для пользователя с email federal2007z@gmail.com
update public.profiles p
set role = 'owner'
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('federal2007z@gmail.com');

-- 6) АВТО-ВЫДАЧА РОЛИ «ПОКУПАТЕЛЬ»
-- При переходе заказа в статус 'paid' пользователю выдаётся роль 'buyer'
-- (если у него сейчас обычная роль 'user').
create or replace function public.on_order_paid()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status = 'paid' and (old.status is distinct from 'paid') then
    update public.profiles
    set role = 'buyer'
    where id = new.user_id and role = 'user';
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_paid on public.orders;
create trigger on_order_paid
  after update on public.orders
  for each row execute procedure public.on_order_paid();