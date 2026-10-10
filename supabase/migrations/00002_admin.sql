-- Админ-доступ: пользователь с указанным email становится админом.
-- Замените admin@example.com на ваш email. Выполнить в SQL Editor.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid()
      and lower(email) = lower('admin@example.com')
  );
$$;

-- Админ видит все заказы
create policy "orders_select_admin" on public.orders
  for select using (public.is_admin());

-- Админ может обновлять статус заказов
create policy "orders_update_admin" on public.orders
  for update using (public.is_admin());