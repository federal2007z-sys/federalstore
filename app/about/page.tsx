import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'О нас',
  description:
    'Кто стоит за FederalStore: Federal — создатель конфигов и Lua-скриптов для CS 1.6/CS2.',
};

export default function AboutPage() {
  const authors = [
    {
      emoji: '👑',
      name: 'Federal',
      role: 'Автор конфигов',
      desc: 'Создаю конфиги для CS 1.6 и CS2 с 2018 года. Фокус на стабильном FPS и точном райтклайке. Автор канала Federal (YouTube) и продавец на FunPay.',
      youtube: 'https://www.youtube.com/@Federal-k9i',
      funpay: 'https://funpay.com/users/18704750/',
    },
  ];

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>О нас</h1>
          <p>Один автор, одна цель — дать тебе максимальное преимущество в игре.</p>
        </div>
      </div>
      <section>
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ display: 'grid', gap: 20 }}>
            {authors.map((a) => (
              <div key={a.name} className="card" style={{ padding: 26 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '2.8rem' }}>{a.emoji}</div>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{a.name}</h2>
                    <p style={{ color: 'var(--accent)', fontWeight: 600, marginTop: 2 }}>{a.role}</p>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 14 }}>{a.desc}</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <a href={a.youtube} target="_blank" rel="noopener" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    ▶ YouTube
                  </a>
                  <a href={a.funpay} target="_blank" rel="noopener" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    💰 FunPay
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}