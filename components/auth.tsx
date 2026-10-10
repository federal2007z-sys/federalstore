'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { login, register, signOut } from '@/lib/auth/actions';

export function LoginForm() {
  const params = useSearchParams();
  const error = params.get('error');
  const next = params.get('next') || '/account';

  return (
    <div className="auth-form">
      <h1>Вход</h1>
      <p className="auth-sub">Войди, чтобы получить доступ к своим покупкам.</p>
      {error && <div className="form-error">{error}</div>}
      <form action={login}>
        <input type="hidden" name="next" value={next} />
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required autoComplete="email" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input type="password" id="password" name="password" required autoComplete="current-password" />
        </div>
        <button type="submit" className="btn btn-primary btn-block">Войти</button>
      </form>
      <div className="form-foot">
        Нет аккаунта? <a href={`/register?next=${encodeURIComponent(next)}`}>Зарегистрируйся</a>
      </div>
    </div>
  );
}

export function RegisterForm() {
  const [error, setError] = useState('');
  const params = useSearchParams();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') || '');
    const password = String(fd.get('password') || '');
    const confirm = String(fd.get('confirm') || '');

    if (password.length < 6) {
      setError('Пароль должен быть не короче 6 символов');
      return;
    }
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    await register(fd);
  }

  return (
    <div className="auth-form">
      <h1>Регистрация</h1>
      <p className="auth-sub">Создай аккаунт — и все покупки будут сохранены за тобой.</p>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="full_name">Имя / никнейм</label>
          <input type="text" id="full_name" name="full_name" autoComplete="name" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required autoComplete="email" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input type="password" id="password" name="password" required autoComplete="new-password" />
        </div>
        <div className="form-group">
          <label htmlFor="confirm">Повторите пароль</label>
          <input type="password" id="confirm" name="confirm" required autoComplete="new-password" />
        </div>
        <button type="submit" className="btn btn-primary btn-block">Создать аккаунт</button>
      </form>
      <div className="form-foot">
        Уже есть аккаунт? <a href="/login">Войти</a>
      </div>
    </div>
  );
}

export function LogoutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="btn btn-outline btn-block">Выйти</button>
    </form>
  );
}