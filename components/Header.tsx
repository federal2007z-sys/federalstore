'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [prefix, setPrefix] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadForSeller, setUnreadForSeller] = useState(0);

  useEffect(() => {
    // Применяем сохранённую тему при загрузке
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light') {
        const root = document.documentElement;
        root.setAttribute('data-theme', 'light');
        root.style.setProperty('--bg', '#eef1f5');
        root.style.setProperty('--bg-soft', '#ffffff');
        root.style.setProperty('--card', '#ffffff');
        root.style.setProperty('--border', '#d7dce5');
        root.style.setProperty('--text', '#111418');
        root.style.setProperty('--text-muted', '#4b5563');
      }
    } catch { /* ignore */ }

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      setUser(u);
      if (u) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, nickname, prefix, avatar_url')
          .eq('id', u.id)
          .single();
        setRole(profile?.role || null);
        setNickname(profile?.nickname || null);
        setPrefix(profile?.prefix || null);
        setAvatarUrl(profile?.avatar_url || null);

        if (profile?.role === 'seller' || profile?.role === 'owner' || profile?.role === 'admin') {
          checkUnread();
          const t = setInterval(checkUnread, 5000);
          return () => clearInterval(t);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkUnread() {
    try {
      const supabase = createClient();
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);
      setUnreadForSeller(count || 0);
    } catch {
      // ignore
    }
  }

  const isOwnerOrAdmin = role === 'owner' || role === 'admin' || role === 'seller';

  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="logo">
          FederalSeller
        </Link>
        <nav>
          <ul className="nav-links">
            <li><Link href="/">Главная</Link></li>
            <li className="has-menu">
              <Link href="/products">Каталог ▾</Link>
              <ul className="mega-menu">
                <li><Link href="/products/category/cs2">🔫 CS2</Link></li>
                <li><Link href="/products/category/valorant">🥷 Valorant</Link></li>
                <li><Link href="/products/category/dota2">⚔️ Dota 2</Link></li>
                <li><Link href="/products/category/warthunder">🛩️ War Thunder</Link></li>
                <li><Link href="/products/category/minecraft">⛏️ Minecraft</Link></li>
                <li><Link href="/products/category/gta5">🚗 GTA 5</Link></li>
                <li><Link href="/products/category/apex">🤖 Apex Legends</Link></li>
                <li><Link href="/products/category/fortnite">💥 Fortnite</Link></li>
                <li><Link href="/products/category/pc-optimization">🛠️ Оптимизация ПК</Link></li>
                <li><Link href="/products/category/services">🎨 Услуги и дизайн</Link></li>
              </ul>
            </li>
            <li><Link href="/about">О нас</Link></li>
            <li>
              <a href="https://t.me/vYwmyfBcyY" target="_blank" rel="noopener">Поддержка</a>
            </li>
            {user ? (
              <>
                {role === 'owner' && (
                  <li>
                    <span className="owner-badge">👑 Владелец · Seller</span>
                  </li>
                )}
                {role === 'seller' && (
                  <li>
                    <span className="seller-badge">🛒 Seller</span>
                  </li>
                )}
                {role === 'buyer' && (
                  <li>
                    <span className="buyer-badge">✓ Покупатель</span>
                  </li>
                )}
                {isOwnerOrAdmin && (
                  <li><Link href="/admin">Админ</Link></li>
                )}
                <li className="nav-user">
                  <button
                    onClick={() => {
                      const root = document.documentElement;
                      const isDark = root.style.getPropertyValue('--bg') !== '#eef1f5' && root.getAttribute('data-theme') !== 'light';
                      root.setAttribute('data-theme', isDark ? 'light' : 'dark');
                      const theme = isDark ? 'light' : 'dark';
                      try { localStorage.setItem('theme', theme); } catch { /* ignore */ }
                      if (theme === 'light') {
                        root.style.setProperty('--bg', '#eef1f5');
                        root.style.setProperty('--bg-soft', '#ffffff');
                        root.style.setProperty('--card', '#ffffff');
                        root.style.setProperty('--border', '#d7dce5');
                        root.style.setProperty('--text', '#111418');
                        root.style.setProperty('--text-muted', '#4b5563');
                      } else {
                        root.style.setProperty('--bg', '#0d1117');
                        root.style.setProperty('--bg-soft', '#161b22');
                        root.style.setProperty('--card', '#1c2129');
                        root.style.setProperty('--border', '#2d333b');
                        root.style.setProperty('--text', '#e6edf3');
                        root.style.setProperty('--text-muted', '#8b949e');
                      }
                    }}
                    title="Переключить тему"
                    style={{
                      background: 'var(--bg-soft)', border: '1px solid var(--border)',
                      borderRadius: 8, width: 38, height: 38, cursor: 'pointer',
                      fontSize: '1.05rem', lineHeight: '38px', textAlign: 'center',
                      padding: 0,
                    }}
                  >
                    🌓
                  </button>
                </li>
                <li className="nav-user">
                  <Link href="/account" className="btn btn-outline" style={{ position: 'relative' }}>
                    💬
                    {unreadForSeller > 0 && (
                      <span
                        style={{
                          position: 'absolute', top: -6, right: -6,
                          background: 'var(--red)', color: '#fff',
                          borderRadius: 20, padding: '1px 6px',
                          fontSize: '0.7rem', fontWeight: 800,
                          minWidth: 18, textAlign: 'center',
                        }}
                      >
                        {unreadForSeller}
                      </span>
                    )}
                  </Link>
                </li>
                <li className="nav-user">
                  {(avatarUrl || nickname) && (
                    <Link href="/account/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {avatarUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt="Аватар"
                          width={28}
                          height={28}
                          style={{ borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                        />
                      )}
                      <span className="user-chip">
                        {prefix ? `${prefix} ` : ''}
                        {nickname || 'Профиль'}
                      </span>
                    </Link>
                  )}
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