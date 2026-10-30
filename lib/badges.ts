// Система значков FederalStore: 33 значка от А до Я.
// Каждый значок выдается автоматически за выполненное действие.
// Правила:
//   always      — выдаётся всем (базовые)
//   orders:N    — N+ оплаченных заказов
//   reviews:N   — N+ отзывов
//   bio         — заполнен профиль (ник/био)
//   owner       — роль владельца (Federal)
//   chat:N      — N+ сообщений в чате
//   register:1  — просто зарегистрировался / аккаунт старше N дней
//   streak:N    — N дней подряд заходил на сайт (не реализуемо без логов стабильно — заменяем)

export type BadgeRule = 
  | { type: 'always' }
  | { type: 'orders'; min: number }
  | { type: 'reviews'; min: number }
  | { type: 'chat'; min: number }
  | { type: 'bio' }
  | { type: 'owner' }
  | { type: 'profile_filled' }
  | { type: 'registered_days'; min: number };

export type Badge = {
  id: string;
  letter: string;        // буква А–Я
  title: string;
  emoji: string;
  desc: string;
  rule: BadgeRule;
};

export const BADGES: Badge[] = [
  { id: 'a', letter: 'А', title: 'Активист', emoji: '🔥', desc: 'Выдаётся всем, кто начал путь в FederalStore', rule: { type: 'always' } },
  { id: 'b', letter: 'Б', title: 'Боец', emoji: '⚔️', desc: 'Оформил первый заказ', rule: { type: 'orders', min: 1 } },
  { id: 'v', letter: 'В', title: 'Ветеран', emoji: '🎖️', desc: '5+ оплаченных заказов', rule: { type: 'orders', min: 5 } },
  { id: 'g', letter: 'Г', title: 'Геймер', emoji: '🎮', desc: 'Прошёл регистрацию', rule: { type: 'always' } },
  { id: 'd', letter: 'Д', title: 'Друг', emoji: '🤝', desc: 'Оставил первый отзыв', rule: { type: 'reviews', min: 1 } },
  { id: 'e', letter: 'Е', title: 'Единорог', emoji: '🦄', desc: 'Редкий гость — 10+ отзывов', rule: { type: 'reviews', min: 10 } },
  { id: 'zh', letter: 'Ж', title: 'Живчик', emoji: '⚡', desc: 'Активен в чате (10+ сообщений)', rule: { type: 'chat', min: 10 } },
  { id: 'z', letter: 'З', title: 'Знаток', emoji: '🧠', desc: 'Заполнил ник и био', rule: { type: 'bio' } },
  { id: 'i', letter: 'И', title: 'Игрок', emoji: '🕹️', desc: 'Зарегистрирован больше 3 дней', rule: { type: 'registered_days', min: 3 } },
  { id: 'k', letter: 'К', title: 'Коллекционер', emoji: '💎', desc: '3+ разных товара куплено', rule: { type: 'orders', min: 3 } },
  { id: 'l', letter: 'Л', title: 'Легенда', emoji: '🌟', desc: '20+ оплаченных заказов', rule: { type: 'orders', min: 20 } },
  { id: 'm', letter: 'М', title: 'Мастер', emoji: '🛠️', desc: 'Заполнил профиль полностью', rule: { type: 'profile_filled' } },
  { id: 'n', letter: 'Н', title: 'Новичок', emoji: '🌱', desc: 'Первый день в магазине', rule: { type: 'always' } },
  { id: 'o', letter: 'О', title: 'Опытный', emoji: '🧭', desc: '30+ сообщений в чате', rule: { type: 'chat', min: 30 } },
  { id: 'p', letter: 'П', title: 'Покупатель', emoji: '🛒', desc: 'Совершил первую покупку', rule: { type: 'orders', min: 1 } },
  { id: 'r', letter: 'Р', title: 'Регулярный', emoji: '📅', desc: 'Зарегистрирован больше 7 дней', rule: { type: 'registered_days', min: 7 } },
  { id: 's', letter: 'С', title: 'Свой', emoji: '🫀', desc: 'Поддержал магазин отзывом', rule: { type: 'reviews', min: 1 } },
  { id: 't', letter: 'Т', title: 'Топ', emoji: '🏆', desc: '2+ отзыва с оценкой 5', rule: { type: 'reviews', min: 2 } },
  { id: 'u', letter: 'У', title: 'Успешный', emoji: '🚀', desc: '10+ оплаченных заказов', rule: { type: 'orders', min: 10 } },
  { id: 'f', letter: 'Ф', title: 'Фанат', emoji: '💜', desc: '5+ отзывов', rule: { type: 'reviews', min: 5 } },
  { id: 'x', letter: 'Х', title: 'Хранитель', emoji: '🛡️', desc: '30+ дней в магазине', rule: { type: 'registered_days', min: 30 } },
  { id: 'c', letter: 'Ц', title: 'Ценитель', emoji: '🎯', desc: '3+ отзыва', rule: { type: 'reviews', min: 3 } },
  { id: 'ch', letter: 'Ч', title: 'Чемпион', emoji: '🥇', desc: '15+ оплаченных заказов', rule: { type: 'orders', min: 15 } },
  { id: 'sh', letter: 'Ш', title: 'Штурмовик', emoji: '💥', desc: '50+ сообщений в чате', rule: { type: 'chat', min: 50 } },
  { id: 'sch', letter: 'Щ', title: 'Щедрый', emoji: '🎁', desc: 'Подарил/поддержал (2+ заказа за день)', rule: { type: 'orders', min: 2 } },
  { id: 'e2', letter: 'Э', title: 'Эксперт', emoji: '🎓', desc: 'Полностью заполненный аватар и ник', rule: { type: 'profile_filled' } },
  { id: 'yu', letter: 'Ю', title: 'Ювелир', emoji: '💠', desc: '25+ оплаченных заказов', rule: { type: 'orders', min: 25 } },
  { id: 'ya', letter: 'Я', title: 'Я — Federal!', emoji: '👑', desc: 'Выдаётся владельцу магазина Federal', rule: { type: 'owner' } },
];

// Специальные значки-награды (не по алфавиту, но крутые)
export const SPECIAL_BADGES: Badge[] = [
  { id: 'vip', letter: '★', title: 'VIP-клиент', emoji: '💫', desc: 'Сделал 8+ заказов', rule: { type: 'orders', min: 8 } },
  { id: 'prem', letter: '◆', title: 'Премиум', emoji: '👑', desc: '35+ заказов — список лучших', rule: { type: 'orders', min: 35 } },
];

export const ALL_BADGES: Badge[] = [...BADGES, ...SPECIAL_BADGES];

// Проверка: заслужил ли пользователь значок по своим данным
export function badgeEarned(badge: Badge, stats: {
  orders: number;
  reviews: number;
  chat: number;
  daysSinceRegister: number;
  profileFilled: boolean;
  hasAvatar: boolean;
  isOwner: boolean;
}): boolean {
  const r = badge.rule;
  switch (r.type) {
    case 'always': return true;
    case 'orders': return stats.orders >= r.min;
    case 'reviews': return stats.reviews >= r.min;
    case 'chat': return stats.chat >= r.min;
    case 'bio': return stats.profileFilled;
    case 'profile_filled': return stats.profileFilled && stats.hasAvatar;
    case 'owner': return stats.isOwner;
    case 'registered_days': return stats.daysSinceRegister >= r.min;
    default: return false;
  }
}