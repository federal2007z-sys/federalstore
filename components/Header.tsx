import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="logo">
          FederalSeller / <span>ShulmirovSeller</span>
        </Link>
        <nav>
          <ul className="nav-links">
            <li><Link href="/">Главная</Link></li>
            <li><Link href="/products">Каталог</Link></li>
            {user ? (
              <>
                <li className="nav-user">
                  <Link href="/account" className="btn btn-outline">
                    Личный кабинет
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li><Link href="/login">Войти</Link></li>
                <li><Link href="/register" className="btn btn-primary">Регистрация</Link></li>
              </>
            )}
          </ul>
        </nav>
        <button className="burger" aria-label="Меню">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}