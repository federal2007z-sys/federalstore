import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Яндекс подтверждение: любой файл вида /yandex_XXXX.html отдаём с содержимым = код из имени
  const yandexMatch = request.nextUrl.pathname.match(/^\/yandex_([a-f0-9]+)\.html$/);
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
  const googleMatch = request.nextUrl.pathname.match(/^\/google([a-f0-9]+)\.html$/);
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

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Не запускать middleware на статических файлах и изображениях,
     * но обрабатывать yandex/google файлы подтверждения до статики.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|txt)$).*)',
  ],
};