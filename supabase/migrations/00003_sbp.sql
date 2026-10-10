-- Обновление: добавляем метод оплаты 'sbp' (СБП) к существующей таблице.
-- Выполните в SQL Editor, если таблица orders уже создана ранее (до этой миграции).

alter table public.orders
  drop constraint orders_payment_method_check;

alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('funpay', 'discord', 'sbp'));