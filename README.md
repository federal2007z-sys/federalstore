# FederalSeller / ShulmirovSeller — сайт с личным кабинетом

Магазин конфигов и Lua-скриптов для CS:GO/CS2 с личным кабинетом:
регистрация, вход, заказы, подтверждение оплаты админом и скачивание файлов.

**Стек:** Next.js 14 (App Router) + Supabase (база данных, авторизация, файлы) + Vercel (хостинг).

---

## Что нужно сделать (по шагам)

### Шаг 1. Создать аккаунт Supabase
1. Зайдите на https://supabase.com и нажмите **Start your project** (бесплатно).
2. Создайте новый проект (имя любое, пароль БД запомните).
3. В левом меню откройте **SQL Editor** → New query.

### Шаг 2. Выполнить SQL-миграции
Скопируйте и выполните каждый файл по очереди в SQL Editor:
1. `supabase/migrations/00001_init.sql` — таблицы `profiles`, `orders`, RLS, триггер.
2. `supabase/migrations/00002_admin.sql` — функция админа.
   - **ВАЖНО:** перед выполнением второго файла замените `admin@example.com` на ваш email.

### Шаг 3. Создать bucket для файлов
1. В Supabase откройте **Storage** → **New bucket**.
2. Название: `products`, тип **Private**.
3. Загрузите в него файлы товаров (имена обязательны):
   - `cfg-federal.txt` — файл для Cfg by Federal
   - `cfg-shulmirov.txt` — файл для Cfg by Шульмиров
   - `lua-federal.txt` — файл для Lua by Federal
   > Пока купите любой текстовый файл с содержимым конфига, позже замените.

### Шаг 4. Получить ключи Supabase
1. Supabase → **Settings** → **API**.
2. Скопируйте `Project URL` и `anon public` key.
3. Запишите их — понадобятся на Шаге 6.

> **Проверка email:** в Supabase → Authentication → Providers → Email убедитесь, что "Confirm email" включён.

### Шаг 5. Создать репозиторий GitHub и загрузить проект
1. На https://github.com создайте новый репозиторий (публичный или приватный — любой).
2. В терминале в папке `federalstore` выполните:
   ```
   git init
   git add .
   git commit -m "FederalStore"
   git branch -M main
   git remote add origin https://github.com/ВАШ_НИК/НАЗВАНИЕ_РЕПО.git
   git push -u origin main
   ```
   (замените URL на свой).

### Шаг 6. Опубликовать на Vercel
1. На https://vercel.com зарегистрируйтесь (можно через GitHub).
2. **Add New Project** → импортируйте ваш репозиторий.
3. В разделе **Environment Variables** добавьте:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL (из шага 4)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key (из шага 4)
   - `NEXT_PUBLIC_FUNPAY_URL` = `https://funpay.com/users/18704750/`
   - `NEXT_PUBLIC_DISCORD_URL` = ваша ссылка Discord (если изменится)
4. Нажмите **Deploy**. Через минуту получите ссылку вида `https://название.vercel.app`.

---

## Telegram-уведомления
Сайт автоматически присылает владельцу сообщения в Telegram:
- 👤 новая регистрация пользователя
- 🛒 новый заказ (товар, сумма, способ оплаты, покупатель)
- ✅ подтверждение оплаты

### Настройка
1. В Telegram найдите **@BotFather** → `/newbot` → следуйте инструкциям → получите токен (вида `123456:ABC...`).
2. В Telegram **напишите своему боту** любое сообщение (например «привет») — это нужно, чтобы бот мог писать вам.
3. Получите ваш `chat_id`:
   ```
   node scripts/get-chat-id.js <ТОКЕН_БОТА>
   ```
   Скрипт выведет ваш chat_id.
4. Добавьте переменные окружения:
   - `TELEGRAM_BOT_TOKEN` = токен из шага 1
   - `TELEGRAM_CHAT_ID` = chat_id из шага 3

После этого уведомления будут приходить автоматически. Если переменные не заданы — сайт работает как обычно, просто без уведомлений.

---

## Как всё работает

| Действие | Где |
|---|---|
| Просмотр каталога | Главная / `/products` |
| Регистрация и вход | `/register`, `/login` |
| Заказ товара | Кнопка «Оформить заказ» на странице товара |
| Оплата | Вне сайта: FunPay / Discord (ссылки показываются после заказа) |
| Подтверждение оплаты | Вы в админ-панели `/admin` |
| Скачивание файла | После подтверждения — в личном кабинете `/account` |

## Порядок заказа
1. Покупатель регистрируется и оформляет заказ.
2. Заказ виден в админ-панели (только вам) со статусом `pending`.
3. Покупатель платит через FunPay/Discord (как договоритесь).
4. Вы нажимаете «Подтвердить оплату» — статус меняется на `paid`.
5. Покупатель видит кнопку «Скачать» в личном кабинете и получает файл.

## Локальный запуск (для разработки)
```
npm install
npm run dev
```
Откройте `http://localhost:3000`. (Нужен установленный Node.js.)

## Настройка после запуска
- **Цены и описания** — в файле `lib/products.ts`.
- **Ссылки оплаты** — в переменных окружения (см. шаг 6) или в `lib/products.ts`.
- **Email администратора** — в SQL-миграции `00002_admin.sql`.
- **Файлы товаров** — в Supabase Storage (bucket `products`).

---

## Структура проекта
```
app/
  page.tsx                 — лендинг
  products/page.tsx        — каталог
  products/[slug]/page.tsx — страница товара
  login, register/         — вход и регистрация
  account/                 — личный кабинет (заказы, профиль)
  admin/                   — админ-панель
  api/orders, api/download, api/admin/orders — API
components/
  Header.tsx, Footer.tsx, FaqList.tsx, BuyButton.tsx, auth.tsx, admin/AdminOrders.tsx
lib/
  products.ts              — данные товаров и цены
  supabase/                — клиенты Supabase
  auth/actions.ts          — вход/регистрация/выход
supabase/migrations/       — SQL-скрипты
```