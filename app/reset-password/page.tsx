import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth';

export default function ResetPasswordPage() {
  return (
    <div className="auth-wrap">
      <Suspense fallback={<div className="auth-form">Загрузка...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}