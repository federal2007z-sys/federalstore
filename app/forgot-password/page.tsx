import { Suspense } from 'react';
import { ForgotPasswordForm } from '@/components/auth';

export default function ForgotPasswordPage() {
  return (
    <div className="auth-wrap">
      <Suspense fallback={<div className="auth-form">Загрузка...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}