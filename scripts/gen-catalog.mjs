#!/usr/bin/env node
// Генератор каталога до 500 товаров.
// Создаёт файлы доставки (private/downloads) и блоки кода для products.ts.
// Запуск: node scripts/gen-catalog.mjs

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PRIVATE = path.join(ROOT, 'private', 'downloads');

const GAMES = [
  { game: 'CS2', emoji: '🔫', topics: [
    ['аим и прицелы', 'Полный гайд по аиму, прицелам и чувствительности'],
    ['раскидки гранат', 'Смоуки, флешки и молики на популярные карты'],
    ['бинд-пакеты', 'Готовые пакеты биндов под стиль игры'],
    ['экономика и покупки', 'Как управлять деньгами и покупать с умом'],
    ['тренировочные карты', 'Лучшие карты для практики и планы тренировок'],
    ['тактики и стратегии', 'Стратегии для командной игры и соло'],
    ['скины и инвентарь', 'Как собрать инвентарь и не переплатить'],
  ]},
  { game: 'Valorant', emoji: '🥷', topics: [
    ['аим и тренировки', 'Упражнения для точной стрельбы и микрофликов'],
    ['прицелы и сенса', 'Пресеты прицелов и настройка чувствительности'],
    ['агенты и способности', 'Как играть за каждого агента и комбинировать'],
    ['экономика', 'Покупки, сейвы и форсы по раундам'],
    ['карты и позиции', 'Лучшие позиции на каждой карте'],
  ]},
  { game: 'Dota 2', emoji: '⚔️', topics: [
    ['герои и роли', 'Как играть за героев каждой роли'],
    ['варьи и контроль карты', 'Постановка вардов и контроль рун'],
    ['контр-пики', 'Кого пикать против кого'],
    ['экономика и лейнинг', 'Фарм, денай и тайминги'],
    ['предметы и билды', 'Оптимальные сборки предметов'],
  ]},
  { game: 'Minecraft', emoji: '⛏️', topics: [
    ['сиды и миры', 'Лучшие сиды для выживания и приключений'],
    ['фермы и редстоун', 'Автофермы и механизмы'],
    ['постройки и идеи', 'Готовые идеи построек'],
    ['выживание', 'Как выжить и отстроиться быстрее всех'],
  ]},
  { game: 'GTA 5', emoji: '🚗', topics: [
    ['бизнесы и заработок', 'Бизнесы, тайники и фарм денег'],
    ['прохождение и миссии', 'Как пройти игры и миссии'],
    ['моды и улучшения', 'Как ставить моды без вылетов'],
    ['гонки и транспорт', 'Лучшие машины и настройки'],
  ]},
  { game: 'Fortnite', emoji: '💥', topics: [
    ['строительство', '90s, рампы и редактирование'],
    ['лут и зоны', 'Точки лута и выживание'],
    ['режимы и ивенты', 'Как пройти испытания ивентов'],
  ]},
  { game: 'Apex Legends', emoji: '🤖', topics: [
    ['движение', 'Superglide, B-hop и slide'],
    ['легенды и мета', 'Лучшие легенды и композиции'],
    ['оружие и лут', 'Рейтинг оружия и насадки'],
  ]},
  { game: 'War Thunder', emoji: '🛩️', topics: [
    ['тактики наземных боёв', 'Позиции и обходы для танков'],
    ['авиация', 'Маневры BnZ и тактики боёв'],
    ['графика и FPS', 'Настройки для слабых и средних ПК'],
    ['прокачка наций', 'Ветки прокачки и лучшие машины'],
  ]},
  { game: 'Standoff 2', emoji: '📱', topics: [
    ['прицелы и сенса', 'Пресеты для мобильной игры'],
    ['графика и FPS', 'Настройки для слабых телефонов'],
  ]},
  { game: 'Rust', emoji: '🪓', topics: [
    ['выживание', 'Первые минуты и фарм'],
    ['база и защита', 'Схемы баз и защита от рейдов'],
  ]},
  { game: 'РПГ-гайды', emoji: '🎲', topics: [
    ['Elden Ring', 'Билды, боссы и прокачка'],
    ['Cyberpunk 2077', 'Билды, импланты и деньги'],
    ['The Witcher 3', 'Сборки школ и концовки'],
    ['Skyrim', 'Билды и артефакты'],
    ['Baldur\'s Gate 3', 'Классы и мультиклассинг'],
    ['Dark Souls 3', 'Сборки и стратегии боссов'],
    ['Sekiro', 'Парирование и все боссы'],
    ['Starfield', 'Билды и планеты'],
    ['NieR: Automata', 'Чипы и все концовки'],
    ['Diablo 4', 'Классы и сезонные билды'],
  ]},
];

const BADGES = ['Новинка', 'Хит продаж', 'Популярное', 'Для новичков', 'Топ-выбор', 'Мега-набор', 'Скидка недели', 'Must-have'];
const PRICES = [69, 89, 99, 119, 129, 149, 169, 199, 229, 249];
const FILES_BASE = "FILES_BASE + '";

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function buildPostPurchase(fileName, note) {
  return `{ downloadUrl: ${FILES_BASE}${fileName}.txt', note: '${note}' }`;
}

let products = [];
let usedSlugs = new Set();

// Читаем существующие id/slug из products.ts, чтобы не дублировать
try {
  const src = fs.readFileSync(path.join(ROOT, 'lib', 'products.ts'), 'utf8');
  for (const m of src.matchAll(/slug: '([^']+)'/g)) usedSlugs.add(m[1]);
} catch {}

function makeProduct(game, topic, themeIdx) {
  const base = slugify(`${game === 'РПГ-гайды' ? 'rpg' : slugify(game)}-${slugify(topic)}`);
  let slug = base;
  let i = 2;
  while (usedSlugs.has(slug)) { slug = `${base}-${i}`; i++; }
  usedSlugs.add(slug);

  const id = `digital-${slug}`;
  const price = PRICES[(Math.floor(Math.random() * PRICES.length))];
  const badge = BADGES[(Math.floor(Math.random() * BADGES.length))];
  const gameForFile = game === 'РПГ-гайды' ? 'rpg' : slugify(game);

  return { id, slug, title: '', price, badge, game, topic, gameForFile, themeIdx };
}

let idx = 0;
for (const g of GAMES) {
  for (const topic of g.topics) {
    for (let v = 1; v <= 4; v++) {
      idx++;
      // первые 4 варианта по теме — базовые
      products.push(makeProduct(g.game, `${topic} (часть ${v})`, v));
    }
  }
}

// Добиваем до 500 случайными комбинациями
let safety = 0;
while (products.length < 500 && safety < 5000) {
  safety++;
  const g = GAMES[Math.floor(Math.random() * GAMES.length)];
  const topic = g.topics[Math.floor(Math.random() * g.topics.length)];
  const suffix = ['продвинутый', 'полный', 'быстрый старт', 'для соло', 'сборник', 'максимум', 'ультра', 'основы'][Math.floor(Math.random() * 8)];
  products.push(makeProduct(g.game, `${topic} — ${suffix}`, Math.floor(Math.random() * 4) + 1));
}

// Уникальные слаги гарантированы makeProduct
console.log(`Сгенерировано товаров: ${products.length}`);

// Создаём файлы доставки + блоки кода
fs.mkdirSync(PRIVATE, { recursive: true });
let blocks = '';
let filesCreated = 0;

for (const p of products) {
  const title = `${p.topic} для ${p.game === 'РПГ-гайды' ? 'RPG' : p.game}`;
  const short = `Готовый материал: ${p.topic}. Автовыдача сразу после оплаты.`;
  const desc = `Полный сборник: ${p.topic} для ${p.game === 'РПГ-гайды' ? 'RPG' : p.game}. Удобно структурировано, с примерами и таблицами. Скачивание сразу после оплаты.`;

  const fileName = p.slug;
  const filePath = path.join(PRIVATE, `${fileName}.txt`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `${title}\n${'='.repeat(title.length)}\n\nСодержимое:\n- ${p.topic}\n- Практические советы и примеры\n\nСпасибо за покупку! Поддержка: @vYwmyfBcyY\n`, 'utf8');
    filesCreated++;
  }

  const note = `После оплаты скачай: ${p.topic}!`;
  blocks += `  {
    id: '${p.id}',
    slug: '${p.slug}',
    title: '${title.replace(/'/g, "\\'")}',
    category: 'digital',
    game: '${p.game}',
    price: ${p.price},
    badge: '${p.badge}',
    shortDescription: '${short.replace(/'/g, "\\'")}',
    description:
      '${desc.replace(/'/g, "\\'")}',
    features: ['Автовыдача после оплаты', 'Структурированный формат', 'Поддержка в Telegram'],
    specs: [
      { label: 'Тип', value: 'Цифровой файл (PDF+текст)' },
      { label: 'Совместимость', value: '${p.game}' },
      { label: 'Доставка', value: 'Автоматически' },
      { label: 'Срок', value: 'Мгновенно после оплаты' },
    ],
    postPurchase: ${buildPostPurchase(fileName, note)},
  },
`;
}

console.log(`Файлов доставки создано: ${filesCreated}`);
const outFile = path.join(ROOT, 'generated-products.txt');
fs.writeFileSync(outFile, blocks, 'utf8');
console.log(`Блоки записаны в ${outFile} (${blocks.length} символов)`);