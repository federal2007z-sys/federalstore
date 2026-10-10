-- Роль владельца (owner) и админов (admin) через таблицу profiles.
-- Владелец настраивается отдельно — см. 00003 или инструкцию.

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

-- Админ видит все заказы
create policy "orders_select_admin" on public.orders
  for select using (public.is_admin());

-- Админ может обновлять статус заказов
create policy "orders_update_admin" on public.orders
  for update using (public.is_admin());