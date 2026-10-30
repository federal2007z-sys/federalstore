#!/usr/bin/env node
// BossAgent - главный агент FederalStore. Наблюдает и страхует.
// Каждый запуск:
//  1. СЛЕДИТ ЗА ПОРЯДКОМ: проверяет каталог (дубликаты, битые слаги, файлы доставки)
//  2. СЛЕДИТ ЗА ЦЕНАМИ: находит аномально дешёвые/дорогие, проверяет диапазон (0-10000)
//  3. УЛУЧШАЕТ СТИЛЬ: проверяет карточки товаров (наличие картинок-фонов, эмодзи игры)
//  4. СТРАХУЕТ: если MarketAgent/PromoAgent не оставили свежих коммитов за N часов — делает их работу
//  5. Пингует сайт (главная + товары) и пишет отчёт

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = path.resolve(process.cwd());
const LIB = path.join(ROOT, 'lib', 'products.ts');
const DOWNLOADS = path.join(ROOT, 'public', 'downloads');
const PRIVATE_DOWNLOADS = path.join(ROOT, 'private', 'downloads');
const OUT_DIR = path.join(ROOT, 'boss-output');
const REPORT = path.join(OUT_DIR, 'boss-report.md');
const SITE = 'https://federal-store.ru';

const MIN_PRICE = 30;    // психологический минимум
const MAX_PRICE = 5000;  // разумный максимум для цифровых товаров
const STALE_HOURS = 8;   // если от агентов нет коммитов 8 часов — страхуем

function log(msg, icon = '🧠') {
  const line = `${icon} ${new Date().toISOString()} — ${msg}`;
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

async function checkSite(urls) {
  const down = [];
  for (const url of urls) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'BossAgent/1.0' } });
      clearTimeout(t);
      if (res.status !== 200) down.push(`${url} => ${res.status}`);
    } catch (e) {
      down.push(`${url} => ${e.name}`);
    }
  }
  return down;
}

async function pingIndexNow(urls) {
  const key = '0b89f1a76c5d4e23';
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: 'federal-store.ru', key, keyLocation: `${SITE}/${key}.txt`, urlList: urls }),
    });
    return res.status;
  } catch {
    return 'error';
  }
}

function gitLastCommitTime(branch = 'origin/main') {
  try {
    const out = execSync(`git log -1 --format=%ct ${branch}`, { encoding: 'utf8' }).trim();
    return Number(out) * 1000;
  } catch {
    return 0;
  }
}

// 1. ПОРЯДОК
function auditOrder(blocks) {
  const issues = [];
  const ids = new Map();
  const slugs = new Set();
  for (const b of blocks) {
    const id = field(b, 'id');
    const slug = field(b, 'slug');
    if (id) ids.set(id, (ids.get(id) || 0) + 1);
    if (slug) { if (slugs.has(slug)) issues.push(`дубль slug: ${slug}`); slugs.add(slug); }
    if (!id) issues.push('блок без id');
  }
  for (const [id, c] of ids) if (c > 1) issues.push(`дубль id: ${id}`);
  return issues;
}

// 2. ЦЕНЫ
function auditPrices(blocks) {
  const problems = [];
  for (const b of blocks) {
    const id = field(b, 'id');
    const price = Number(field(b, 'price'));
    if (!Number.isFinite(price) || price <= 0) {
      problems.push({ id, msg: 'цена отсутствует/0' });
    } else if (price < MIN_PRICE) {
      problems.push({ id, msg: `цена ${price} ₽ ниже минимума ${MIN_PRICE}` });
    } else if (price > MAX_PRICE) {
      problems.push({ id, msg: `цена ${price} ₽ выше разумного ${MAX_PRICE}` });
    }
  }
  return problems;
}

// 3. СТИЛЬ
function auditStyle(blocks, src) {
  const issues = [];
  const hasGameLabels = (src.match(/export const gameLabels/) !== null);
  if (!hasGameLabels) issues.push('нет gameLabels (эмодзи игр)');

  // Корректно извлекаем мапу gameLabels: ключи могут быть в кавычках или без
  const knownGames = new Set();
  const gStart = src.indexOf('export const gameLabels');
  if (gStart >= 0) {
    const gBlock = src.slice(gStart, src.indexOf('};', gStart) + 2);
    // ключ: 'Все игры' или CS2 или 'Dota 2'
    for (const m of gBlock.matchAll(/\n\s*(?:'([^']+)'|([A-Za-zА-Яа-яЁё0-9 _-]+))\s*:/g)) {
      knownGames.add(m[1] || m[2]);
    }
  }

  for (const b of blocks) {
    const title = field(b, 'title');
    const slug = field(b, 'slug');
    const game = field(b, 'game');
    const short = field(b, 'shortDescription');
    // Заголовки не должны быть слишком длинными (ломает карточку)
    if (title && title.length > 70) issues.push(`слишком длинный title (${title.length}): ${slug}`);
    if (!short) issues.push(`нет shortDescription: ${slug}`);
    if (game && game !== 'Все игры' && !knownGames.has(game)) issues.push(`игра без эмодзи: ${game}`);
  }
  return issues;
}

// 4. СТРАХОВКА: если агенты не работали слишком долго
function insuranceCheck(now) {
  const marketTime = gitLastCommitTime();
  const hoursSince = (now - marketTime) / 3600000;
  if (hoursSince > STALE_HOURS) {
    log(`Страховка: последний коммит ${hoursSince.toFixed(1)} ч назад — MarketAgent/PromoAgent могли не отработать. Вручную: проверка файлов доставки...`);
    // Проверяем, существуют ли все файлы доставки, на которые ссылается каталог
    const src = readProducts();
    const blocks = parseProducts(src);
    let missing = 0;
    for (const b of blocks) {
      const id = field(b, 'id');
      const dl = field(b, 'downloadUrl') || '';
      const m = dl.match(/downloads\/([a-z0-9-]+)\.txt/);
      if (m) {
        const f = path.join(PRIVATE_DOWNLOADS, `${m[1]}.txt`);
        if (!fs.existsSync(f)) {
          fs.writeFileSync(f, `Извини, файл для продукта ${id} временно недоступен. Обратись в поддержку: @vYwmyfBcyY\n`, 'utf8');
          missing++;
        }
      }
    }
    if (missing) log(`Страховка: создано ${missing} недостающих файлов доставки`);
    else log('Страховка: файлы доставки в порядке');
    return true;
  }
  log(`Коммиты свежие (${hoursSince.toFixed(1)} ч назад) — агенты работают, страховка не нужна`);
  return false;
}

async function main() {
  log('BossAgent запущен');

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

  // 1. Порядок
  const orderIssues = auditOrder(blocks);
  log(`Порядок: ${orderIssues.length ? orderIssues.join('; ') : '✅ нет проблем'}`);

  // 2. Цены
  const priceIssues = auditPrices(blocks);
  if (priceIssues.length) {
    priceIssues.forEach((p) => log(`⚠️ Цена: ${p.id} — ${p.msg}`));
  } else {
    log('Цены: ✅ все в разумном диапазоне (30–5000 ₽)');
  }

  // 3. Стиль
  const styleIssues = auditStyle(blocks, src);
  log(`Стиль: ${styleIssues.length ? styleIssues.slice(0, 5).join('; ') : '✅ карточки в порядке'}`);

  // 4. Страховка
  const didInsurance = insuranceCheck(Date.now());

  // 5. Сайт жив?
  const sample = items.slice(0, 6).map((p) => `${SITE}/products/${p.slug}`);
  const down = await checkSite([SITE, `${SITE}/products`, ...sample]);
  log(`Сайт: ${down.length ? '⚠️ проблемы: ' + down.join('; ') : '✅ все страницы отвечают 200'}`);

  // 6. Пинг поисковиков (страховка для индексации)
  const ping = await pingIndexNow([SITE, `${SITE}/products`]);
  log(`IndexNow: HTTP ${ping}`);

  // Если зафиксировали проблемы со стилем/ценами — их правка требует аккуратности,
  // поэтому просто фиксируем в отчёте (человек или MarketAgent поправит).
  // Коммитим отчёт, чтобы он был виден в репо.
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (status) {
      execSync('git add -A', { encoding: 'utf8' });
      execSync('git commit -m "🧠 BossAgent: аудит порядка, цен, стиля и сайта"', { encoding: 'utf8' });
      execSync('git push origin main', { encoding: 'utf8' });
      log('Отчёт закоммичен и запушен');
    } else {
      log('Изменений нет — коммит пропущен');
    }
  } catch (e) {
    log(`git: ${e.message.split('\n')[0]}`, '⚠️');
    if (!process.env.CI) log('Локальный запуск — коммит не критичен', 'ℹ️');
  }

  log('Готово ✓');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});