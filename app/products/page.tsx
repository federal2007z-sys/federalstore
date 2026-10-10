import Link from 'next/link';
import { products, formatPrice } from '@/lib/products';

export default function ProductsPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="breadcrumb">Главная / Каталог</p>
          <h1>Каталог</h1>
          <p>Три проверенных продукта под разные стили игры. Все конфиги обновляются бесплатно.</p>
        </div>
      </div>

      <section id="products">
        <div className="container">
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

      <div className="container">
        <div className="cta-banner">
          <h2>Не знаешь, что выбрать?</h2>
          <p>Создай аккаунт или напиши нам — поможем подобрать конфиг под твой стиль игры.</p>
          <Link href="/register" className="btn btn-dark">Создать аккаунт</Link>
        </div>
      </div>
    </>
  );
}