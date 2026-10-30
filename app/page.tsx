import Link from 'next/link';
import { products, formatPrice } from '@/lib/products';
import FaqList from '@/components/FaqList';
import SocialSection from '@/components/SocialSection';
import ProductCard from '@/components/ProductCard';
import DealOfDay from '@/components/DealOfDay';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = createClient();
  const { count: paidCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'paid');

  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const deal = products[dayOfYear % products.length];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'FederalStore',
    url: 'https://federal-store.ru',
    description: 'Цифровые товары для геймеров: аватарки, гайды, настройки прицелов, прокачка скилла и дизайн-услуги. Мгновенная автовыдача после оплаты.',
    priceRange: '₽69-₽500',
    sameAs: ['https://www.youtube.com/@Federal-k9i'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="hero">
        <div className="container">
          <div className="hero-icons" aria-hidden="true">
            <span style={{ animationDelay: '0s', left: '4%' }}>🎮</span>
            <span style={{ animationDelay: '1.2s', left: '12%' }}>🔫</span>
            <span style={{ animationDelay: '2.4s', left: '78%' }}>🛩️</span>
            <span style={{ animationDelay: '0.8s', left: '86%' }}>⚔️</span>
            <span style={{ animationDelay: '1.8s', left: '64%' }}>🥷</span>
            <span style={{ animationDelay: '0.5s', left: '30%' }}>⛏️</span>
            <span style={{ animationDelay: '2.9s', left: '44%' }}>🚗</span>
            <span style={{ animationDelay: '1.5s', left: '22%' }}>🤖</span>
            <span style={{ animationDelay: '3.4s', left: '54%' }}>💥</span>
            <span style={{ animationDelay: '0.2s', left: '92%' }}>⚡</span>
          </div>
          <span className="hero-tag">Гайды · Аватарки · Настройки · Игры</span>
          <h1>
            Прокачай свой <span>гейминг</span> до нового уровня
          </h1>
<p className="sub">
            Дизайн-услуги и цифровые товары для твоих видео и стримов. Превью, аватарки, шапки, интро и AI-арт — всё в одном месте.
          </p>
          <div className="hero-actions">
            <Link href="/products" className="btn btn-primary">Смотреть каталог</Link>
            <Link href="https://t.me/vYwmyfBcyY" target="_blank" rel="noopener" className="btn btn-outline">Заказать в ТГ</Link>
          </div>
          <p style={{ marginTop: 24, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            🏆 Уже <b style={{ color: 'var(--accent)' }} data-countup={paidCount ?? 0}>0</b> довольных покупателей
          </p>
          <script
            dangerouslySetInnerHTML={{
              __html: `
              (function(){
                var el = document.querySelector('[data-countup]');
                if(!el) return;
                var target = parseInt(el.getAttribute('data-countup'), 10) || 0;
                var duration = 1500, start = null;
                function step(ts){
                  if(!start) start = ts;
                  var p = Math.min((ts - start) / duration, 1);
                  el.textContent = Math.floor(p * target).toLocaleString('ru-RU');
                  if(p < 1) requestAnimationFrame(step);
                }
                var io = new IntersectionObserver(function(entries){
                  entries.forEach(function(entry){
                    if(entry.isIntersecting){ requestAnimationFrame(step); io.disconnect(); }
                  });
                }, { threshold: 0.5 });
                io.observe(el);
              })();
            `,
            }}
          />
        </div>
      </section>

      <DealOfDay product={deal} />

      <section id="features" className="reveal" style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <div className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: 10 }}>🎨</div>
              <h4 style={{ marginBottom: 6 }}>Уникальный дизайн</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Свежие идеи под твою нишу, а не шаблоны.</p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: 10 }}>⚡</div>
              <h4 style={{ marginBottom: 6 }}>Быстрые сроки</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Превью за 24 часа, интро за 72 часа.</p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: 10 }}>🛠️</div>
              <h4 style={{ marginBottom: 6 }}>Правки до результата</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Доводим макет, пока не скажешь «готово».</p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: 10 }}>💬</div>
              <h4 style={{ marginBottom: 6 }}>Общение в Telegram</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Заказ и обсуждение — в одном месте.</p>
            </div>
          </div>
        </div>
      </section>

<section id="products" className="reveal">
        <div className="container">
          <h2 className="sec-title">Что можно заказать</h2>
          <p className="sec-sub">Дизайн и цифровые товары для тех, кто создаёт контент и стримит. Выбери и напиши в Telegram — сделаем.</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <input
              id="product-search"
              placeholder="🔍 Поиск по каталогу (например, CS2)..."
              style={{
                width: '100%', maxWidth: 460, padding: '12px 18px', fontSize: '1rem',
                borderRadius: 12, border: '1px solid var(--border)',
                background: 'var(--bg-soft)', color: 'var(--text)', fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>
          <div className="grid-3" id="products-grid">
            {products.map((p) => (
              <div key={p.id} data-search={`${p.title} ${p.badge} ${p.features.join(' ')}`.toLowerCase()} style={{ display: 'block' }}>
                <ProductCard p={p} />
              </div>
            ))}
          </div>
          <p id="products-empty" style={{ display: 'none', textAlign: 'center', color: 'var(--text-muted)' }}>Ничего не найдено. Попробуйте другой запрос.</p>
        </div>
      </section>

      <SocialSection />

      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function(){
            var input = document.getElementById('product-search');
            if (!input) return;
            var grid = document.getElementById('products-grid');
            var empty = document.getElementById('products-empty');
            input.addEventListener('input', function() {
              var q = input.value.toLowerCase().trim();
              var cards = grid.querySelectorAll('.card');
              var found = 0;
              cards.forEach(function(c){
                var ok = !q || (c.getAttribute('data-search') || '').indexOf(q) !== -1;
                c.style.display = ok ? '' : 'none';
                if (ok) found++;
              });
              empty.style.display = found ? 'none' : 'block';
            });
          })();
        `,
        }}
      />

      <section id="how" style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h2 className="sec-title">Как это работает</h2>
          <p className="sec-sub">Покупка занимает пару минут, а установка — меньше пяти.</p>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <h4>Регистрируешься</h4>
              <p>Создаёшь аккаунт в пару кликов.</p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h4>Выбираешь продукт</h4>
              <p>Оформляешь заказ в каталоге.</p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h4>Оплачиваешь</h4>
              <p>СБП, картой, криптовалютой или через поддержку, как удобно.</p>
            </div>
            <div className="step">
              <div className="step-num">4</div>
              <h4>Скачиваешь</h4>
              <p>После подтверждения оплаты файлы доступны в кабинете.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="payment">
        <div className="container">
          <h2 className="sec-title">Способы оплаты</h2>
          <p className="sec-sub">Три удобных способа — выбирай, как тебе комфортнее.</p>
          <div className="grid-3">
            <div className="card">
              <span className="card-badge">Для любых заказов</span>
              <h3>СБП / Карта / QR</h3>
              <p>Быстрый перевод по номеру карты — деньги приходят мгновенно.</p>
              <p style={{ marginTop: '10px', fontWeight: 700 }}>2204 2304 6044 7194 8</p>
              <a href="/products" className="btn btn-primary">Выбрать услугу</a>
            </div>
            <div className="card">
              <span className="card-badge">Для любых заказов</span>
              <h3>Криптовалюта / PayPal</h3>
              <p>Оплата из любой точки мира — USDT, PayPal или международная карта.</p>
              <a href="/products" className="btn btn-primary">Выбрать услугу</a>
            </div>
          </div>
        </div>
      </section>

      <section id="faq">
        <div className="container">
          <h2 className="sec-title">Частые вопросы</h2>
          <p className="sec-sub">Отвечаем на то, о чём спрашивают чаще всего.</p>
          <FaqList />
        </div>
      </section>

      <div className="container">
        <div className="cta-banner">
          <h2>Есть идея для контента?</h2>
          <p>Напиши в Telegram и мы обсудим детали заказа — дизайн, сроки, стоимость.</p>
          <a href="https://t.me/vYwmyfBcyY" target="_blank" rel="noopener" className="btn btn-dark">Написать в ТГ</a>
        </div>
      </div>
    </>
  );
}