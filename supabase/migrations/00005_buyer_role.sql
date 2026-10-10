-- Добавление роли 'buyer' и авто-выдачи её при оплате (для существующих БД).
-- Выполните в SQL Editor, если таблицы уже созданы ранее.

-- 1) Разрешить роль 'buyer'
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'buyer', 'admin', 'owner'));

-- 2) Триггер: при оплате заказа выдавать роль 'buyer'
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

-- 3) Профили видны всем (для отображения бейджей)
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (true);