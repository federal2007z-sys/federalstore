import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

// Простой in-memory rate limiter (на edge — per-instance, но для защиты от спама достаточно)
const RATE_WINDOW_MS = 60 * 1000; // 1 минута
const RATE_MAX = 30; // макс запросов в минуту с одного IP (для API)
const rateStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function rateLimited(ip: string, limit: number): boolean {
  const now = Date.now();
  const entry = rateStore.get(ip);
  if (!entry || entry.resetAt < now) {
    rateStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

// Заголовки безопасности
function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  // Яндекс подтверждение: любой файл вида /yandex_XXXX.html отдаём с содержимым = код из имени
  const yandexMatch = pathname.match(/^\/yandex_([a-f0-9]+)\.html$/);
  if (yandexMatch) {
    const code = yandexMatch[1];
    return new NextResponse(code, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  }

  // Google подтверждение: /googleXXXXX.html отдаём содержимое из XXXX
  const googleMatch = pathname.match(/^\/google([a-f0-9]+)\.html$/);
  if (googleMatch) {
    const code = googleMatch[1];
    return new NextResponse(code, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  }

  // Блокируем опасные методы на API (против CSRF/манипуляций)
  const isApi = pathname.startsWith('/api/');

  // Блокируем прямой доступ к файлам автовыдачи в public/downloads
  // (должны скачиваться только через /api/download после оплаты)
  if (pathname.startsWith('/downloads/')) {
    return new NextResponse('Доступ только через личный кабинет после оплаты', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  if (isApi) {
    const method = request.method;
    // На API разрешены только нужные методы
    if (!['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'].includes(method)) {
      return NextResponse.json({ error: 'Метод запрещён' }, { status: 405 });
    }
    // OPTIONS (preflight) — просто отдаём заголовки
    if (method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Rate limit для мутирующих запросов (POST/PATCH/DELETE) — защита от спама/брутфорса
    if (['POST', 'PATCH', 'DELETE'].includes(method)) {
      if (rateLimited(ip + ':write', 15)) {
        return NextResponse.json(
          { error: 'Слишком много запросов. Подождите минуту.' },
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      }
    } else if (rateLimited(ip + ':read', RATE_MAX)) {
      return NextResponse.json(
        { error: 'Слишком много запросов. Подождите минуту.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  }

  // Блокируем известные плохие боты/сканеры (по User-Agent)
  const ua = request.headers.get('user-agent') || '';
  const badPatterns = [
    /sqlmap/i, /nikto/i, /nessus/i, /acunetix/i, /masscan/i,
    /wpscan/i, /dirbuster/i, /hydra/i, /jaws/i, /zgrab/i,
    /python-requests/i, /curl\/(7\.6[0-9]|8\.0)/i, /libwww/i,
  ];
  if (badPatterns.some((re) => re.test(ua))) {
    return new NextResponse(ip, {
      status: 429,
      headers: { 'Retry-After': '3600' },
    });
  }

  // Объединяем с обновлением сессии Supabase
  const res = await updateSession(request);

  // Добавляем security-заголовки к ответу
  Object.entries(securityHeaders()).forEach(([k, v]) => {
    res.headers.set(k, v);
  });

  // HSTS даже на http-редирект
  return res;
}

export const config = {
  matcher: [
    /*
     * Не запускать middleware на статических файлах и изображениях,
     * но обрабатывать yandex/google файлы подтверждения до статики.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|txt|xml|woff2?)$).*)',
  ],
};