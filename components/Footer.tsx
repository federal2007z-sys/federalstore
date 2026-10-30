import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Главная' },
  { href: '/products', label: 'Каталог' },
];

export default function Footer() {
  const productsLinks = [
    { href: '/products/service-youtube-preview', label: 'Превью для YouTube' },
    { href: '/products/digital-cs2-binds-pack', label: 'Пак биндов CS2' },
    { href: '/products/digital-valorant-settings-pack', label: 'Настройки Valorant' },
    { href: '/products/digital-warthunder-tactics-guide', label: 'Тактики War Thunder' },
    { href: '/products/digital-warthunder-vehicle-guide', label: 'Прокачка War Thunder' },
    { href: '/products/digital-pc-optimization', label: 'Оптимизация ПК' },
  ];

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>FederalStore</h4>
            <p>Скины, аксессуары и гайды для CS2. Мгновенная доставка и честные цены.</p>
          </div>
          <div>
            <h4>Навигация</h4>
            <ul>
              {navLinks.map((l) => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
              <li><Link href="/about">О нас</Link></li>
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
            <h4>Мы в Telegram</h4>
            <ul>
              <li>
                <a
                  href="https://t.me/federal1store1ru"
                  target="_blank"
                  rel="noopener"
                  style={{ fontWeight: 700, color: 'var(--accent)' }}
                >
                  📣 Канал: @federal1store1ru
                </a>
              </li>
              <li style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Скидки, новинки и гайды — подпишись!
              </li>
            </ul>
          </div>
          <div>
            <h4>Оплата и поддержка</h4>
            <ul>
              <li>СБП: 2204 2304 6044 7194 8</li>
              <li>Криптовалюта (USDT)</li>
              <li>PayPal</li>
              <li>
                <a href="https://t.me/vYwmyfBcyY" target="_blank" rel="noopener">Поддержка: @vYwmyfBcyY</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FederalStore. Все права защищены.</span>
          <span style={{ display: 'flex', gap: 16 }}>
            <Link href="/privacy" style={{ color: 'var(--text-muted)' }}>Конфиденциальность</Link>
            <Link href="/offer" style={{ color: 'var(--text-muted)' }}>Оферта</Link>
            <Link href="/vkposts" style={{ color: 'var(--text-muted)' }}>Посты для VK</Link>
            <Link href="/admin" style={{ color: 'var(--text-muted)' }}>Админ</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}