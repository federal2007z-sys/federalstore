export type Product = {
  id: string;
  slug: string;
  title: string;
  author: 'Federal' | 'Шульмиров';
  type: 'cfg' | 'lua';
  price: number;
  badge: string;
  description: string;
  features: string[];
  specs: { label: string; value: string }[];
};

// Единый источник данных о продуктах. Правь здесь — изменится везде.
export const products: Product[] = [
  {
    id: 'cfg-federal',
    slug: 'cfg-federal',
    title: 'Cfg by Federal',
    author: 'Federal',
    type: 'cfg',
    price: 1900,
    badge: 'Хит продаж',
    description:
      'Универсальный конфиг для агрессивной и точной игры. Баланс между FPS, отдачей и кликом.',
    features: [
      'Оптимизация FPS',
      'Точный райтклайк',
      'Бесплатные обновления',
      'Оплата через FunPay',
    ],
    specs: [
      { label: 'Игра', value: 'CS:GO / CS2' },
      { label: 'Оптимизация FPS', value: 'Да, под слабое и среднее железо' },
      { label: 'Райтклайк', value: 'Точный, откалиброванный' },
      { label: 'Обновления', value: 'Бесплатные, навсегда' },
      { label: 'Формат', value: 'Готовый файл + инструкция' },
      { label: 'Доставка', value: 'Скачать в личном кабинете' },
    ],
  },
  {
    id: 'cfg-shulmirov',
    slug: 'cfg-shulmirov',
    title: 'Cfg by Шульмиров',
    author: 'Шульмиров',
    type: 'cfg',
    price: 1900,
    badge: 'Для снайпера',
    description:
      'Конфиг, отточенный под AWP и стабильный флик. Максимум контроля и плавность прицела.',
    features: [
      'Снайперская настройка',
      'Стабильный флик',
      'Индивидуальная калибровка',
      'Оплата через Discord',
    ],
    specs: [
      { label: 'Игра', value: 'CS:GO / CS2' },
      { label: 'Профиль', value: 'AWP, снайпер' },
      { label: 'Флик', value: 'Стабильный, отточенный' },
      { label: 'Обновления', value: 'Бесплатные, навсегда' },
      { label: 'Формат', value: 'Готовый файл + инструкция' },
      { label: 'Доставка', value: 'Скачать в личном кабинете' },
    ],
  },
  {
    id: 'lua-federal',
    slug: 'lua-federal',
    title: 'Lua by Federal',
    author: 'Federal',
    type: 'lua',
    price: 2500,
    badge: 'Скрипты',
    description:
      'Набор Lua-скриптов для автоматизации рутинных действий и ускорения игровых процессов.',
    features: [
      'Автоматизация действий',
      'Лёгкая установка',
      'Поддержка обновлений',
      'Оплата через FunPay',
    ],
    specs: [
      { label: 'Игра', value: 'CS:GO / CS2' },
      { label: 'Тип', value: 'Набор Lua-скриптов' },
      { label: 'Установка', value: 'Лёгкая, по инструкции' },
      { label: 'Обновления', value: 'Бесплатные, навсегда' },
      { label: 'Формат', value: 'Файлы + инструкция' },
      { label: 'Доставка', value: 'Скачать в личном кабинете' },
    ],
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

// Единая информация об оплате по СБП (карта / QR) — действует для всех продуктов
export const sbpPayment = {
  method: 'sbp' as const,
  label: 'СБП — перевод на карту',
  card: '2204 2304 6044 7194 8',
  note: 'Оплата по СБП, карте или QR-коду. Деньги приходят мгновенно.',
};

// Способ оплаты товара
export function paymentFor(product: Product): {
  method: 'funpay' | 'discord' | 'sbp';
  label: string;
  url?: string;
} {
  if (product.author === 'Шульмиров') {
    return {
      method: 'discord',
      label: 'Discord-сервер',
      url: process.env.NEXT_PUBLIC_DISCORD_URL || 'https://discord.gg/q2YsdfZyD',
    };
  }
  return {
    method: 'funpay',
    label: 'FunPay',
    url: process.env.NEXT_PUBLIC_FUNPAY_URL || 'https://funpay.com/users/18704750/',
  };
}

export function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU') + ' ₽';
}