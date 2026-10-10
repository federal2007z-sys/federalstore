import { Suspense } from 'react';
import { LoginForm } from '@/components/auth';

export default function LoginPage() {
  return (
    <div className="auth-wrap">
      <Suspense fallback={<div className="auth-form">Загрузка...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}