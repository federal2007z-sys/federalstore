-- FederalStore schema
-- Выполнить в SQL Editor Supabase.

-- Профиль пользователя
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

-- Автоматическое создание профиля при регистрации
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', null));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Заказы
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

-- ============ Row Level Security ============
alter table public.profiles enable row level security;
alter table public.orders enable row level security;

-- Профиль: видит только свой
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Заказы: пользователь видит только свои
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

-- Заказы: пользователь может создать свой заказ (только со своим user_id)
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);