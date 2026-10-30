#!/usr/bin/env node
// TelegraphAgent - публикует SEO-статьи про FederalStore на telegra.ph
// (платформа Telegram, НЕ ТРЕБУЕТ аккаунта - статьи создаются анонимно через API).
// Каждая статья: уникальный заголовок + текст с ключевыми словами + ссылка на сайт.
// Telegra.ph индексируется Google/Яндексом -> сайт получает внешние ссылки и трафик.

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const LIB = path.join(ROOT, 'lib', 'products.ts');
const OUT_DIR = path.join(ROOT, 'telegraph-output');
const REPORT = path.join(OUT_DIR, 'telegraph-report.md');
const TOKEN_FILE = path.join(OUT_DIR, 'telegraph-token.txt');
const SITE = 'https://federal-store.ru';
const API = 'https://api.telegra.ph';

function log(msg) {
  const line = `⚡ ${new Date().toISOString()} — ${msg}`;
  console.log(line);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.appendFileSync(REPORT, line + '\n');
}

function parseProducts(src) {
  // CRLF-совместимый: файл на Windows может иметь \r\n
  const re = /\r?\n  \{\r?\n([\s\S]*?)\r?\n  \},/g;
  const blocks = [];
  let m;
  while ((m = re.exec(src)) !== null) blocks.push(m[1]);
  return blocks;
}

function field(block, key) {
  const re = new RegExp(`${key}:\\s*(?:(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")|(\\d+))`, 'm');
  const mm = block.match(re);
  return mm ? (mm[1] ?? mm[2] ?? mm[3]) : null;
}

function readProducts() {
  return fs.readFileSync(LIB, 'utf8');
}

// Фразы для разных игр, чтобы статьи были "новыми" каждый раз
const TOPICS = [
  { title: 'Как поднять FPS в CS2', game: 'CS2', kw: 'FPS, настройки, оптимизация' },
  { title: 'Гайд по прокачке в Valorant', game: 'Valorant', kw: 'ранг, аим, прокачка' },
  { title: 'Лучшие настройки для War Thunder', game: 'War Thunder', kw: 'графика, FPS, тактики' },
  { title: 'Гайд по фермам в Minecraft', game: 'Minecraft', kw: 'фермы, редстоун, ресурсы' },
  { title: 'Как зарабатывать в GTA 5 Online', game: 'GTA 5', kw: 'бизнесы, деньги, заработок' },
  { title: 'Билды для Elden Ring', game: 'РПГ-гайды', kw: 'билд, боссы, прокачка' },
  { title: 'Тренировка аима в CS2: план', game: 'CS2', kw: 'aim, тренировка, разминка' },
  { title: 'Настройки и прицелы для Valorant', game: 'Valorant', kw: 'прицел, сенса, настройки' },
  { title: 'Как выжить соло в Rust', game: 'Rust', kw: 'выживание, база, рейд' },
  { title: 'Секреты и пасхалки в играх', game: 'Все игры', kw: 'секреты, пасхалки, локации' },
  { title: 'Движение в Apex Legends', game: 'Apex Legends', kw: 'мувмент, superglide, slide' },
  { title: 'Постройки в Fortnite: гайд', game: 'Fortnite', kw: 'строительство, 90s, редактирование' },
];

async function getToken() {
  // Если токен уже есть — используем его
  if (fs.existsSync(TOKEN_FILE)) {
    const t = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
    if (t) return { ok: true, token: t };
  }
  // Иначе создаём анонимный аккаунт (без логина и пароля)
  const res = await fetch(`${API}/createAccount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ short_name: 'FederalStore', author_name: 'FederalStore', author_url: SITE }),
  });
  const data = await res.json();
  if (!data.ok) return { ok: false, error: data.error || 'createAccount failed' };
  fs.writeFileSync(TOKEN_FILE, data.result.access_token, 'utf8');
  return { ok: true, token: data.result.access_token };
}

async function createPage(title, content) {
  const t = await getToken();
  if (!t.ok) return t;
  const res = await fetch(`${API}/createPage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: t.token,
      title,
      author_name: 'FederalStore',
      content,
      return_content: false,
    }),
  });
  const data = await res.json();
  if (!data.ok) return { ok: false, error: data.error || 'unknown' };
  return { ok: true, url: data.result.url, path: data.result.path };
}

async function main() {
  let src;
  try {
    src = readProducts();
  } catch (e) {
    log(`❌ Не могу прочитать products.ts: ${e.message}`);
    process.exit(1);
  }
  const blocks = parseProducts(src);
  const items = blocks.map((b) => ({
    id: field(b, 'id'),
    slug: field(b, 'slug'),
    title: field(b, 'title') || '',
    game: field(b, 'game') || 'Все игры',
    price: Number(field(b, 'price')) || 0,
  })).filter((p) => p.id && p.slug);

  log(`Каталог: ${items.length} товаров`);

  // Каждый запуск (раз в ~3 часа) берём следующую тему
  const slot = Math.floor(Date.now() / (3 * 3600 * 1000));
  const topic = TOPICS[slot % TOPICS.length];

  // Подбираем 3 товара по этой игре
  const gameItems = items.filter((p) => p.game === topic.game).slice(0, 3);
  const related = gameItems.length ? gameItems : items.slice(slot % Math.max(1, items.length - 2), slot % Math.max(1, items.length - 2) + 2);

  const pTag = (text) => ({ tag: 'p', children: [text] });
  const h3Tag = (text) => ({ tag: 'h3', children: [text] });

  const content = [
    pTag(`Если ты ищешь: ${topic.kw} — эта статья для тебя.`),
    pTag(`${topic.title} — вопрос, который волнует многих геймеров. В FederalStore собрано 500+ готовых гайдов, настроек и материалов.`),
    h3Tag('Что важно знать'),
    pTag(`В статье разберём основные моменты. А готовые решения в виде файлов (текст + инструкции) уже ждут тебя в магазине — от ${Math.min(...items.map((p) => p.price))} ₽.`),
    h3Tag('Где взять готовые материалы'),
    ...related.map((p) => pTag(`📦 ${p.title} — ${p.price} ₽ (${SITE}/products/${p.slug})`)),
    pTag(`⚡ Оплатил → сразу скачал. Без ожиданий и диалогов.`),
    pTag(`Узнать больше: ${SITE}`),
  ];

  // Пробуем создать (для Telegra.ph нужен access_token; публичный createPage без токена недоступен —
  // поэтому агент создаёт "черновик статьи" в файле, а токен можно дать позже.
  // ВАЖНО: этот агент пока генерирует SEO-контент в файл + отчёт (публикация реальна после токена).
  const result = await createPage(topic.title, content);
  if (result.ok) {
    log(`Опубликовано: ${result.url}`);
  } else {
    log(`Публикация через API не удалась (${result.error}) — сохраняю статью в файл для ручной публикации через telegra.ph вставку.`);
    // Вставка в формате HTML для быстрого копирования
    const html = `<h3>${topic.title}</h3>` + content.map((n) => `<p>${n.children.join('')}</p>`).join('\n');
    const fname = `article-${slot}.txt`;
    fs.writeFileSync(path.join(OUT_DIR, fname), html, 'utf8');
    log(`Сохранено: ${fname}`);
  }

  log('Готово ✓');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});