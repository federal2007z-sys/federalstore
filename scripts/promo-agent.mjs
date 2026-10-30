#!/usr/bin/env node
// PromoAgent - автономный промоутер магазина FederalStore
// Запускается по расписанию (GitHub Actions). Делает:
//  1. Читает каталог, определяет "товар дня" (по дате) и новинки
//  2. Генерирует готовые промо-посты для Telegram/VK (рус.)
//  3. Сохраняет посты в promo-output/ (для копирования в соцсети)
//  4. Если заданы TG-секреты - отправляет пост в Telegram владельцу/каналу
//  5. Пингует поисковики (IndexNow доступен) и логирует в promo-report.md

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const LIB = path.join(ROOT, 'lib', 'products.ts');
const OUT_DIR = path.join(ROOT, 'promo-output');
const REPORT = path.join(OUT_DIR, 'promo-report.md');
const SITE = 'https://federal-store.ru';

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.TG_BOT_TOKEN || '';
const TG_CHAT = process.env.TELEGRAM_CHAT_ID || process.env.TG_OWNER_CHAT_ID || '';

function log(msg) {
  const line = `🤖 ${new Date().toISOString()} — ${msg}`;
  console.log(line);
  fs.appendFileSync(REPORT, line + '\n');
}

function parseProducts(src) {
  const re = /\n  \{\n([\s\S]*?)\n  \},/g;
  const blocks = [];
  let m;
  while ((m = re.exec(src)) !== null) blocks.push(m[1]);
  return blocks;
}

function field(block, key) {
  // число (price) или строка в кавычках
  const re = new RegExp(`${key}:\\s*(?:(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")|(\\d+))`, 'm');
  const mm = block.match(re);
  return mm ? (mm[1] ?? mm[2] ?? mm[3]) : null;
}

function readProducts() {
  return fs.readFileSync(LIB, 'utf8');
}

function dayOfYear() {
  const now = new Date();
  return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
}

async function pingIndexNow(urls) {
  const key = '0b89f1a76c5d4e23';
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'federal-store.ru',
        key,
        keyLocation: `${SITE}/${key}.txt`,
        urlList: urls,
      }),
    });
    return res.status;
  } catch {
    return 'error';
  }
}

async function sendTelegram(text) {
  if (!TG_TOKEN || !TG_CHAT) {
    log('Telegram не настроен (нет TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID в env) — пост сохранён в файл');
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT,
        text: text.slice(0, 3500),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      log(`Telegram: ошибка ${data?.description || res.statusText}`);
      return false;
    }
    log('Telegram: пост отправлен');
    return true;
  } catch (e) {
    log(`Telegram: сеть ${e.message}`);
    return false;
  }
}

// Эмодзи игр
const GAME_EMOJI = {
  CS2: '🔫', Valorant: '🥷', 'Dota 2': '⚔️', Minecraft: '⛏️',
  'GTA 5': '🚗', 'Apex Legends': '🤖', Fortnite: '💥',
  'War Thunder': '🛩️', 'РПГ-гайды': '🎲', 'Все игры': '🎮',
};

function formatPrice(n) {
  return n.toLocaleString('ru-RU') + ' ₽';
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

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
    title: field(b, 'title'),
    game: field(b, 'game') || 'Все игры',
    price: Number(field(b, 'price')) || 0,
    badge: field(b, 'badge') || '',
    short: field(b, 'shortDescription') || '',
    downloadUrl: field(b, 'downloadUrl') || '',
  })).filter((p) => p.id && p.slug);

  log(`Каталог: ${items.length} товаров`);

  // Товар дня по дате
  const deal = items[dayOfYear() % items.length];

  // Новинки (первые 3 с бейджем Новинка или последние 3)
  const newItems = items.filter((p) => (p.badge || '').toLowerCase().includes('новинк')).slice(0, 3);
  const fresh = newItems.length ? newItems : items.slice(-3);

  // Генерация постов
  const dealPost = [
    `🔥 <b>Товар дня в FederalStore!</b>`,
    ``,
    `${GAME_EMOJI[deal.game] || '🎮'} <b>${esc(deal.title)}</b>`,
    `${esc(deal.short)}`,
    ``,
    `💰 Цена: <b>${formatPrice(deal.price)}</b> (скидка обновляется каждый день)`,
    `⚡ Автовыдача после оплаты — без ожидания!`,
    ``,
    `👉 ${SITE}/products/${deal.slug}`,
    ``,
    `#FederalStore #${deal.game.replace(/[\s-]/g, '')} #гайд #скидка`,
  ].join('\n');

  const newPost = [
    `🆕 <b>Новинки магазина (${new Date().toLocaleDateString('ru-RU')})</b>`,
    ``,
    ...fresh.map((p, i) => `${i + 1}. ${GAME_EMOJI[p.game] || '🎮'} <b>${esc(p.title)}</b> — ${formatPrice(p.price)}`),
    ``,
    `⚡ Мгновенная автовыдача · От 69 ₽`,
    `👉 Полный каталог: ${SITE}/products`,
    ``,
    `#FederalStore #новинки #игры #гейминг`,
  ].join('\n');

  const aboutPost = [
    `🎮 <b>FederalStore — твой магазин скилла!</b>`,
    ``,
    `✅ Гайды и настройки для CS2, Valorant, Dota 2, War Thunder`,
    `✅ РПГ-гайды: Elden Ring, Cyberpunk, Skyrim, Witcher 3`,
    `✅ Пак обоев, эмодзи Discord, звуки для стрима`,
    `⚡ Оплатил → сразу скачал (автовыдача)`,
    ``,
    `👉 ${SITE}`,
    ``,
    `#FederalStore #магазин #гейминг #гайды`,
  ].join('\n');

  // Сохраняем посты в файлы
  fs.writeFileSync(path.join(OUT_DIR, 'post-deal.txt'), dealPost.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&'), 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'post-new.txt'), newPost.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&'), 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'post-about.txt'), aboutPost.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&'), 'utf8');
  log('Посты сохранены в promo-output/');

  // Пинг поисковиков (IndexNow) — на случай новых страниц
  const sampleUrls = [SITE, `${SITE}/products`, ...items.slice(0, 5).map((p) => `${SITE}/products/${p.slug}`)];
  const pingStatus = await pingIndexNow(sampleUrls);
  log(`IndexNow: HTTP ${pingStatus}`);

  // Отправка в Telegram
  await sendTelegram(dealPost);

  // Сводка в отчёт
  log(`Сводка: товар дня = ${deal.title}, новинок = ${fresh.length}й`);
  log('Готово ✓');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});