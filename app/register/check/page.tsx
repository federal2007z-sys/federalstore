import Link from 'next/link';

export default function RegisterCheckPage() {
  return (
    <div className="auth-wrap">
      <div className="auth-form">
        <h1>Проверь почту</h1>
        <p className="auth-sub">
          Мы отправили письмо для подтверждения email. Перейди по ссылке из письма, чтобы завершить регистрацию.
        </p>
        <Link href="/" className="btn btn-outline btn-block">На главную</Link>
      </div>
    </div>
  );
}