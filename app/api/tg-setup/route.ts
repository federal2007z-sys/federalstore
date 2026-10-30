import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = process.env.TG_BOT_TOKEN || '';
  const secret = process.env.TG_WEBHOOK_SECRET || '';
  const url = `https://federal-store.ru/api/tg-bot`;
  const action = new URL(request.url).searchParams.get('action') || '';

  if (!token) return NextResponse.json({ ok: false, error: 'Token не задан' }, { status: 500 });

  try {
    if (action === 'delete') {
      const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, { method: 'POST' });
      const data = await res.json();
      console.log('[tg-setup] deleteWebhook:', JSON.stringify(data));
      return NextResponse.json(data);
    }

    // Переустановка webhook (сначала сброс, потом установка)
    await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, { method: 'POST' });
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, secret_token: secret, drop_pending_updates: true }),
    });
    const data = await res.json();
    console.log('[tg-setup] setWebhook:', JSON.stringify(data));
    return NextResponse.json(data);
  } catch (e) {
    console.error('[tg-setup] error:', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}