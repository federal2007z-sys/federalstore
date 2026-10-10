import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Главная' },
  { href: '/products', label: 'Каталог' },
];

export default function Footer() {
  const productsLinks = [
    { href: '/products/cfg-federal', label: 'Cfg by Federal' },
    { href: '/products/cfg-shulmirov', label: 'Cfg by Шульмиров' },
    { href: '/products/lua-federal', label: 'Lua by Federal' },
  ];

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>FederalSeller / ShulmirovSeller</h4>
            <p>Конфиги и Lua-скрипты для CS:GO / CS2. Профессиональная калибровка под каждого игрока.</p>
          </div>
          <div>
            <h4>Навигация</h4>
            <ul>
              {navLinks.map((l) => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
              <li><Link href="/account">Личный кабинет</Link></li>
            </ul>
          </div>
          <div>
            <h4>Продукты</h4>
            <ul>
              {productsLinks.map((l) => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Оплата</h4>
            <ul>
              <li>СБП: 2204 2304 6044 7194 8</li>
              <li>
                <a href={process.env.NEXT_PUBLIC_FUNPAY_URL || 'https://funpay.com/users/18704750/'} target="_blank" rel="noopener">FunPay</a>
              </li>
              <li>
                <a href={process.env.NEXT_PUBLIC_DISCORD_URL || 'https://discord.gg/q2YsdfZyD'} target="_blank" rel="noopener">Discord</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FederalSeller / ShulmirovSeller. Все права защищены.</span>
          <span><Link href="/admin" style={{ color: 'var(--text-muted)' }}>Админ</Link></span>
        </div>
      </div>
    </footer>
  );
}