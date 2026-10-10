import Link from 'next/link';

export default function RegisterCheckPage() {
  return (
    <div className="auth-wrap">
      <div className="auth-form">
        <h1>Проверь почту</h1>
        <p className="auth-sub">
          Если в Supabase включено подтверждение email — мы отправили письмо. Перейди по ссылке из
          письма, чтобы завершить регистрацию.
        </p>
        <p className="auth-sub">
          Если письмо не нужно (подтверждение выключено) — просто{' '}
          <Link href="/login" style={{ color: 'var(--accent)' }}>
            войди
          </Link>
          .
        </p>
        <Link href="/" className="btn btn-outline btn-block">На главную</Link>
      </div>
    </div>
  );
}