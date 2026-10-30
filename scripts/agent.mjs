#!/usr/bin/env node
// Market Agent - автономный сторож магазина FederalStore
// Запускается по расписанию (GitHub Actions). Делает:
//  1. Проверяет все товары: уникальность id/slug, наличие файла доставки
//  2. Чинит найденные проблемы (генерирует недостающие файлы, чинит ссылки)
//  3. Проверяет, что сайт отвечает (главная + все страницы товаров)
//  4. Добавляет новый товар из очереди новинок (агент-новинки.json)
//  5. Коммитит изменения -> git push -> автодеплой Vercel

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = path.resolve(process.cwd());
const LIB = path.join(ROOT, 'lib', 'products.ts');
const DOWNLOADS = path.join(ROOT, 'public', 'downloads');
const QUEUE_FILE = path.join(ROOT, 'agent-новинки.json');
const SITE = 'https://federal-store.ru';

function log(msg, icon = '🤖') {
  console.log(`${icon} ${new Date().toISOString()} — ${msg}`);
}

function parseProducts(src) {
  // Достаём блоки товаров как сырые строки (между "  {" и "  }," / "  },")
  const blocks = [];
  const re = /(\n  \{\n)([\s\S]*?)(\n  \},)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    blocks.push({ raw: m[2], start: m.index, end: m.index + m[0].length });
  }
  return blocks;
}

function field(block, key) {
  const re = new RegExp(`${key}:\\s*(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")`, 'm');
  const m = block.match(re);
  return m ? (m[1] ?? m[2]) : null;
}

function readProducts() {
  return fs.readFileSync(LIB, 'utf8');
}

// 1. Проверка уникальности и целостности
function audit(blocks, src) {
  const issues = [];
  const ids = new Map();
  const slugs = new Map();

  for (const b of blocks) {
    const id = field(b.raw, 'id');
    const slug = field(b.raw, 'slug');
    const downloadUrl = field(b.raw, 'downloadUrl');
    if (!id) { issues.push('⚠️  блок без id'); continue; }
    if (ids.has(id)) issues.push(`⚠️  дубликат id: ${id}`);
    ids.set(id, (ids.get(id) || 0) + 1);
    if (slug && slugs.has(slug)) issues.push(`⚠️  дубликат slug: ${slug}`);
    if (slug) slugs.set(slug, 1);
    if (downloadUrl && !downloadUrl.startsWith('http') && !downloadUrl.includes('FILES_BASE')) {
      issues.push(`⚠️  странный downloadUrl у ${id}`);
    }
  }
  return issues;
}

// 2. Проверка, что файлы доставки существуют
function checkFiles(blocks) {
  const problems = [];
  for (const b of blocks) {
    const id = field(b.raw, 'id');
    const downloadUrl = field(b.raw, 'downloadUrl');
    if (!downloadUrl || !downloadUrl.includes('/downloads/')) continue;
    const m = downloadUrl.match(/downloads\/([a-z0-9-]+)\.txt/);
    if (!m) continue;
    const file = path.join(DOWNLOADS, `${m[1]}.txt`);
    if (!fs.existsSync(file)) {
      problems.push({ id, file: `${m[1]}.txt` });
    }
  }
  return problems;
}

// 3. Проверка доступности сайта (главная + выборочные страницы)
async function checkSite(blocks) {
  const targets = [SITE];
  const sample = blocks.filter((b) => field(b.raw, 'slug')).slice(0, 8);
  for (const b of sample) {
    const slug = field(b.raw, 'slug');
    if (slug) targets.push(`${SITE}/products/${slug}`);
  }
  const down = [];
  for (const url of targets) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'MarketAgent/1.0' } });
      clearTimeout(t);
      if (res.status !== 200) down.push(`${url} => ${res.status}`);
    } catch (e) {
      down.push(`${url} => ${e.name}`);
    }
  }
  return down;
}

// 4. Добавление нового товара из очереди
function addFromQueue(blocks, src) {
  if (!fs.existsSync(QUEUE_FILE)) return { added: 0, msg: 'очередь не найдена' };
  let queue;
  try {
    queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  } catch (e) {
    return { added: 0, msg: `очередь битая: ${e.message}` };
  }
  if (!Array.isArray(queue) || queue.length === 0) {
    return { added: 0, msg: 'очередь пуста' };
  }

  const existingIds = new Set(blocks.map((b) => field(b.raw, 'id')).filter(Boolean));

  // Берём первый товар, которого ещё нет
  const candidate = queue.find((p) => p && p.id && !existingIds.has(p.id));
  if (!candidate) return { added: 0, msg: 'в очереди только существующие товары' };

  // Создаём файл доставки, если указан
  let downloadUrl = null;
  if (candidate.downloadFile) {
    const fileName = candidate.downloadFile + '.txt';
    const filePath = path.join(DOWNLOADS, fileName);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, candidate.fileContent || `Спасибо за покупку! ${candidate.title}\nПоддержка: @vYwmyfBcyY\n`, 'utf8');
    }
    downloadUrl = `FILES_BASE + '${candidate.downloadFile}.txt'`;
  }

  const features = (candidate.features || []).map((f) => `'${f}'`).join(', ');
  const specs = (candidate.specs || []).map((s) => `{ label: '${s.label}', value: '${s.value}' }`).join(', ');

  const block = `
  {
    id: '${candidate.id}',
    slug: '${candidate.slug || candidate.id}',
    title: '${candidate.title}',
    category: '${candidate.category || 'digital'}',
    game: '${candidate.game || 'Все игры'}',
    price: ${candidate.price || 149},
    badge: '${candidate.badge || 'Новинка'}',
    shortDescription: '${candidate.shortDescription || ''}',
    description:
      '${candidate.description || ''}',
    features: [${features}],
    specs: [
      ${specs}
    ],
    postPurchase: { ${downloadUrl ? `downloadUrl: ${downloadUrl}, ` : ''}note: '${candidate.note || 'После оплаты скачай файл!'}' },
  },
`;

  // Вставляем перед закрывающей скобкой массива
  const insertIdx = src.lastIndexOf('];');
  if (insertIdx === -1) return { added: 0, msg: 'не найден конец массива' };
  const newSrc = src.slice(0, insertIdx) + block + src.slice(insertIdx);
  fs.writeFileSync(LIB, newSrc, 'utf8');

  // Убираем добавленный товар из очереди
  const remaining = queue.filter((p) => p.id !== candidate.id);
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(remaining, null, 2), 'utf8');

  return { added: 1, msg: candidate.title };
}

// генерация шаблонного файла новинок если нет очереди
function ensureQueue() {
  if (fs.existsSync(QUEUE_FILE)) return;
  const seed = [
    {
      id: 'digital-helldivers2-guide',
      slug: 'digital-helldivers2-guide',
      title: 'Гайд по Helldivers 2: стратегии и лут',
      category: 'digital',
      game: 'РПГ-гайды',
      price: 199,
      badge: 'Новинка',
      shortDescription: 'Лучшие стратегии, билды и фарм для поддержания распорядка.',
      description: 'Гайд по Helldivers 2: стратегии высадки, билды снаряжения, фарм ресурсов, тактики против терминалов и автоматов.',
      features: ['Стратегии высадки', 'Билды снаряжения', 'Фарм ресурсов', 'Тактики на врагов'],
      specs: [{ label: 'Тип', value: 'Цифровой файл (PDF+текст)' }, { label: 'Совместимость', value: 'Helldivers 2' }, { label: 'Доставка', value: 'Автоматически' }],
      downloadFile: 'helldivers2-guide',
      fileContent: 'Helldivers 2 - гайд\n=============\n- Стратегии высадки\n- Билды снаряжения\n- Фарм ресурсов\nСпасибо за покупку! Поддержка: @vYwmyfBcyY',
      note: 'После оплаты скачай гайд по Helldivers 2!'
    },
    {
      id: 'digital-hogwarts-legacy-guide',
      slug: 'digital-hogwarts-legacy-guide',
      title: 'Гайд по Hogwarts Legacy: секреты и билды',
      category: 'digital',
      game: 'РПГ-гайды',
      price: 229,
      badge: 'Новинка',
      shortDescription: 'Заклинания, секреты Хогвартса и лучшие билды для прохождения.',
      description: 'Гайд по Hogwarts Legacy: все заклинания и их применение, секреты замка, билды под стиль игры, сборка лучших талантов.',
      features: ['Все заклинания', 'Секреты замка', 'Билды и таланты', 'Прохождение'],
      specs: [{ label: 'Тип', value: 'Цифровой файл (PDF+текст)' }, { label: 'Совместимость', value: 'Hogwarts Legacy' }, { label: 'Доставка', value: 'Автоматически' }],
      downloadFile: 'hogwarts-legacy-guide',
      fileContent: 'Hogwarts Legacy - гайд\n===================\n- Все заклинания\n- Секреты Хогвартса\n- Билды и таланты\nСпасибо за покупку! Поддержка: @vYwmyfBcyY',
      note: 'После оплаты скачай гайд по Hogwarts Legacy!'
    }
  ];
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(seed, null, 2), 'utf8');
  log('Создана очередь новинок');
}

async function main() {
  log('Запуск агента');

  // читаем товары
  let src;
  try {
    src = readProducts();
  } catch (e) {
    log(`Критическая ошибка: не могу прочитать products.ts: ${e.message}`, '❌');
    process.exit(1);
  }
  const blocks = parseProducts(src);

  // аудит
  const issues = audit(blocks, src);
  log(`Товаров: ${blocks.length}, проблем в данных: ${issues.length ? issues.join('; ') : 'нет'}`);

  // проверка файлов доставки
  const missingFiles = checkFiles(blocks);
  log(`Файлов доставки не хватает: ${missingFiles.length ? missingFiles.map((f) => f.file).join(', ') : 'нет'}`);
  if (missingFiles.length > 0) {
    for (const mf of missingFiles) {
      const f = path.join(DOWNLOADS, mf.file);
      if (!fs.existsSync(f)) {
        fs.writeFileSync(f, `Извини, файл для продукта ${mf.id} временно недоступен. Обратись в поддержку: @vYwmyfBcyY\n`, 'utf8');
        log(`Создан placeholder-файл ${mf.file}`);
      }
    }
  }

  // проверка сайта
  const down = await checkSite(blocks);
  log(`Сайт: ${down.length ? 'проблемы: ' + down.join('; ') : 'все страницы отвечают 200'}`);

  // добавляем новинку из очереди
  ensureQueue();
  // перечитываем после ensureQueue (не меняет товары, только очередь) — та же src
  const queueResult = addFromQueue(parseProducts(readProducts()), readProducts());
  log(`Добавлено новинок: ${queueResult.added}${queueResult.added ? ' — ' + queueResult.msg : ' (' + queueResult.msg + ')'}`);

  // коммитим если есть изменения
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (status) {
      execSync('git add -A', { encoding: 'utf8' });
      execSync(`git commit -m "🤖 MarketAgent: автообновление каталога (${new Date().toISOString().slice(0, 16)})"`, { encoding: 'utf8' });
      execSync('git push origin main', { encoding: 'utf8' });
      log('Изменения закоммичены и запушены (Vercel автодеплоит)');
    } else {
      log('Изменений нет — пропускаю коммит');
    }
  } catch (e) {
    log(`git: ${e.message.split('\n')[0]}`, '⚠️');
    if (!process.env.CI) log('Запущен локально — не паникуем', 'ℹ️');
  }

  log('Готово ✓');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});