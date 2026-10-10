import Link from 'next/link';
import { products, formatPrice, paymentFor } from '@/lib/products';
import FaqList from '@/components/FaqList';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="hero-tag">Конфиги · Lua-скрипты · CS2</span>
          <h1>
            Максимизируй свою <span>игру</span> в CS2
          </h1>
          <p className="sub">
            Профессиональные конфиги и Lua-скрипты от FederalSeller и ShulmirovSeller. Оптимизированный FPS,
            идеальный райтклайк и плавный прицел под твою руку.
          </p>
          <div className="hero-actions">
            <Link href="/products" className="btn btn-primary">Смотреть каталог</Link>
            <Link href="/register" className="btn btn-outline">Создать аккаунт</Link>
          </div>
        </div>
      </section>

      <section id="products">
        <div className="container">
          <h2 className="sec-title">Наши продукты</h2>
          <p className="sec-sub">Каждый конфиг тщательно откалиброван и протестирован. Выбирай под свой стиль игры.</p>
          <div className="grid-3">
            {products.map((p) => (
              <div className="card" key={p.id}>
                <span className="card-badge">{p.badge}</span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <div className="card-price">
                  {formatPrice(p.price)} <small>/ навсегда</small>
                </div>
                <ul className="card-features">
                  {p.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <Link href={`/products/${p.slug}`} className="btn btn-primary">Подробнее</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              <p>Через FunPay или Discord, как удобно.</p>
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
          <p className="sec-sub">Два удобных способа — выбирай, как тебе комфортнее.</p>
          <div className="grid-3">
            <div className="card">
              <span className="card-badge">Cfg by Federal · Lua by Federal</span>
              <h3>FunPay</h3>
              <p>Быстрая и безопасная оплата через площадку FunPay.</p>
              <a href={paymentFor(products[0]).url} target="_blank" rel="noopener" className="btn btn-primary">Перейти на FunPay</a>
            </div>
            <div className="card">
              <span className="card-badge">Cfg by Шульмиров</span>
              <h3>Discord-сервер</h3>
              <p>Оплата прямо на нашем Discord-сервере.</p>
              <a href={paymentFor(products[1]).url} target="_blank" rel="noopener" className="btn btn-primary">Открыть Discord</a>
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
          <h2>Готов улучшить свою игру?</h2>
          <p>Создай аккаунт и получи доступ к своим покупкам сразу.</p>
          <Link href="/register" className="btn btn-dark">Создать аккаунт</Link>
        </div>
      </div>
    </>
  );
}