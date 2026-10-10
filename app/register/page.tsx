import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth';

export default function RegisterPage() {
  return (
    <div className="auth-wrap">
      <Suspense fallback={<div className="auth-form">Загрузка...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}