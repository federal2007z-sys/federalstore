import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/auth';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/account');
  }

  return (
    <div className="container">
      <div className="account-layout">
        <aside className="account-nav">
          <Link href="/account">Мои заказы</Link>
          <Link href="/account/profile">Профиль</Link>
          <div className="logout">
            <LogoutButton />
          </div>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}