-- Добавление колонок buyer_email/buyer_name для существующей таблицы orders.
-- Выполните в SQL Editor, если таблица уже создана ранее.

alter table public.orders
  add column if not exists buyer_email text;

alter table public.orders
  add column if not exists buyer_name text;