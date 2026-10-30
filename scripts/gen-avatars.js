const fs = require('fs');
const path = require('path');

// Простая генерация SVG-аватарок с инициалами и случайными яркими цветами
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const palettes = [
  ['#8b5cf6', '#6d28d9'], ['#ec4899', '#be185d'], ['#f59e0b', '#d97706'],
  ['#10b981', '#059669'], ['#3b82f6', '#2563eb'], ['#ef4444', '#b91c1c'],
  ['#14b8a6', '#0f766e'], ['#f97316', '#c2410c'], ['#6366f1', '#4338ca'],
  ['#84cc16', '#4d7c0f'],
];

function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const outDir = path.join(__dirname, '..', 'public', 'avatars');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (let i = 0; i < 100; i++) {
  const c1 = randomPick(palettes);
  const c2 = randomPick(palettes.filter((p) => p !== c1));
  const letter1 = letters[Math.floor(Math.random() * letters.length)];
  const letter2 = letters[Math.floor(Math.random() * letters.length)];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="48" fill="url(#g)"/>
  <text x="128" y="148" font-family="Arial, sans-serif" font-size="90" font-weight="bold" fill="#ffffff" text-anchor="middle">${letter1}${letter2}</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, `avatar-${String(i + 1).padStart(3, '0')}.svg`), svg, 'utf8');
}

console.log('Сгенерировано 100 SVG-аватарок в public/avatars/');