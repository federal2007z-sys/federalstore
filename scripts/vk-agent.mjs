#!/usr/bin/env node
// VkAgent - автономный постер в VK-сообщество FederalStore
// Каждый час (или по расписанию) генерирует новый пост и публикует в VK через VK API.
// Требует теокен VK (см. README): секрет VK_TOKEN в GitHub Actions.
// без токена — генерирует пост в файл vk-output/ (для ручной публикации)

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const LIB = path.join(ROOT, 'lib', 'products.ts');
const OUT_DIR = path.join(ROOT, 'vk-output');
const REPORT = path.join(OUT_DIR, 'vk-report.md');
const SITE = 'https://federal-store.ru';

const VK_TOKEN = process.env.VK_TOKEN || '';
const VK_GROUP_ID = process.env.VK_GROUP_ID || '242202219'; // club242202219 -> 242202219
const VK_API = 'https://api.vk.com/method/';

function log(msg) {
  const line = `📘 ${new Date().toISOString()} — ${msg}`;
  console.log(line);
  fs.mkdirSync(OUT_DIR, { recursive: true });
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
  const re = new RegExp(`${key}:\\s*(?:(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")|(\\d+))`, 'm');
  const mm = block.match(re);
  return mm ? (mm[1] ?? mm[2] ?? mm[3]) : null;
}

function readProducts() {
  return fs.readFileSync(LIB, 'utf8');
}

const GAME_EMOJI = {
  CS2: '🔫', Valorant: '🥷', 'Dota 2': '⚔️', Minecraft: '⛏️',
  'GTA 5': '🚗', 'Apex Legends': '🤖', Fortnite: '💥',
  'War Thunder': '🛩️', 'РПГ-гайды': '🎲', 'Все игры': '🎮',
};

function formatPrice(n) {
  return n.toLocaleString('ru-RU') + ' ₽';
}

function generatePost(items, variant) {
  const deal = items[0];
  if (variant === 0) {
    return [
      `🔥 Товар дня в FederalStore!`,
      ``,
      `${GAME_EMOJI[deal.game] || '🎮'} ${deal.title}`,
      `${deal.short || ''}`,
      ``,
      `💰 ${formatPrice(deal.price)} — автовыдача после оплаты`,
      ``,
      `👉 ${SITE}/products/${deal.slug}`,
      ``,
      `#FederalStore #игры #гайды`,
    ].join('\n');
  }
  if (variant === 1) {
    const picks = items.slice(0, 4);
    return [
      `🎮 Лучшее из FederalStore этой недели:`,
      ``,
      ...picks.map((p, i) => `${i + 1}. ${GAME_EMOJI[p.game] || '🎮'} ${p.title} — ${formatPrice(p.price)}`),
      ``,
      `⚡ Всё выдаётся сразу после оплаты`,
      `👉 ${SITE}/products`,
      ``,
      `#FederalStore #скидки #гейминг`,
    ].join('\n');
  }
  // вариант 2 — общий анонс
  return [
    `🎯 FederalStore — твой магазин скилла!`,
    ``,
    `✅ Гайды и настройки для CS2, Valorant, War Thunder, Dota 2`,
    `✅ РПГ-гайды (Elden Ring, Cyberpunk, Skyrim)`,
    `✅ Аватарки, обои, звуки для стрима`,
    ``,
    `⚡ Оплатил → сразу скачал. От 69 ₽`,
    `👉 ${SITE}`,
    ``,
    `#FederalStore #магазин #гейминг`,
  ].join('\n');
}

async function postToVk(text) {
  if (!VK_TOKEN) {
    log('Нет VK_TOKEN — пост сохранён в файл');
    return false;
  }
  const params = new URLSearchParams({
    owner_id: `-${VK_GROUP_ID}`,
    message: text.slice(0, 4000),
    from_group: '1',
    access_token: VK_TOKEN,
    v: '5.199',
  });

  try {
    const res = await fetch(`${VK_API}wall.post?${params}`, { method: 'GET' });
    const data = await res.json();
    if (data.error) {
      log(`VK API ошибка: ${data.error.error_msg} (${data.error.error_code})`);
      return false;
    }
    log(`Опубликовано в VK: post_id=${data.response.post_id}`);
    return true;
  } catch (e) {
    log(`VK сеть: ${e.message}`);
    return false;
  }
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
    short: field(b, 'shortDescription') || '',
  })).filter((p) => p.id && p.slug);

  log(`Каталог: ${items.length} товаров`);

  // Вариант поста — по часу (0/1/2 по кругу)
  const hour = new Date().getHours();
  const variant = hour % 3;

  const post = generatePost(items, variant);
  fs.writeFileSync(path.join(OUT_DIR, 'latest-post.txt'), post.replace(/\*\*/g, ''), 'utf8');
  log(`Пост сгенерирован (вариант ${variant}), сохранён в vk-output/`);

  const ok = await postToVk(post);
  log(ok ? 'Готово ✓' : 'Пост не опубликован (токен отсутствует или ошибка)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});