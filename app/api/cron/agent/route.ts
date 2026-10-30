import { NextResponse } from 'next/server';

// Запускает агентов (GitHub Actions) по сигналу внешнего пингера (UptimeRobot и т.п.)
// или по Vercel Cron. Каждый вызов запускает одного агента по очереди,
// чтобы нагрузка распределялась, а не все разом.
//
// Внешний пингер: GET /api/cron/agent?secret=...  (или простая проверка секрета)
// Частота внешнего пингера задаёт частоту агентов (например каждые 15 минут).

const GH_TOKEN = process.env.GH_PAT || '';
const AGENT_SECRET = process.env.AGENT_SECRET || '';
const REPO = 'federal2007z-sys/federalstore';

const WORKFLOWS: Record<string, string> = {
  promo: 'promo-agent.yml',
  market: 'market-agent.yml',
  boss: 'boss-agent.yml',
  vk: 'vk-agent.yml',
};

// Приоритет: промо чаще всего, остальные реже (простая ротация)
const ROTATION = ['promo', 'promo', 'boss', 'promo', 'market', 'promo', 'vk', 'promo'];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret') || '';
  const explicitAgent = url.searchParams.get('agent') || '';

  const ua = request.headers.get('user-agent') || '';
  const fromVercelCron = ua.includes('vercel-cron');
  if (!fromVercelCron && (!AGENT_SECRET || secret !== AGENT_SECRET)) {
    return NextResponse.json({ ok: false, error: 'Доступ запрещён' }, { status: 403 });
  }
  if (!GH_TOKEN) {
    return NextResponse.json({ ok: false, error: 'GH_PAT не задан' }, { status: 500 });
  }

  // Выбираем агента: явный или ротация по времени (15-мин окна)
  let which = explicitAgent;
  if (!which) {
    const windowIdx = Math.floor(Date.now() / (15 * 60 * 1000));
    which = ROTATION[windowIdx % ROTATION.length];
  }
  const wf = WORKFLOWS[which];
  if (!wf) return NextResponse.json({ ok: false, error: 'Неизвестный агент' }, { status: 400 });

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${wf}/dispatches`, {
      method: 'POST',
      headers: {
        'User-Agent': 'FederalStoreCron',
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: 'main' }),
    });
    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ ok: false, error: `GitHub: ${res.status} ${txt.slice(0, 120)}` }, { status: 502 });
    }
    return NextResponse.json({ ok: true, agent: which });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}