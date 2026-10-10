import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="auth-wrap">
      <div className="auth-form" style={{ textAlign: 'center' }}>
        <h1>404</h1>
        <p className="auth-sub">Страница не найдена.</p>
        <Link href="/" className="btn btn-primary btn-block">На главную</Link>
      </div>
    </div>
  );
}