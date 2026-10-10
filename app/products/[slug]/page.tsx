import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductById, paymentFor, formatPrice } from '@/lib/products';
import { createClient } from '@/lib/supabase/server';
import BuyButton from '@/components/BuyButton';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductById(params.slug);
  if (!product) notFound();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const payment = paymentFor(product);

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="breadcrumb">
            <Link href="/">Главная</Link> / <Link href="/products">Каталог</Link> / {product.title}
          </p>
          <h1>{product.title}</h1>
        </div>
      </div>

      <section>
        <div className="container">
          <div className="product-detail">
            <div>
              <div className="specs">
                <h3>Характеристики</h3>
                <dl>
                  {product.specs.map((s) => (
                    <div className="spec-row" key={s.label}>
                      <dt>{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="buy-box">
              <h2>{product.title}</h2>
              <p style={{ color: 'var(--text-muted)' }}>{product.description}</p>
              <div className="price">
                {formatPrice(product.price)} <small>разовая покупка</small>
              </div>
              <BuyButton
                productId={product.id}
                isLoggedIn={!!user}
                defaultPayment={payment.method}
                paymentUrl={payment.url}
                price={product.price}
              />
              <p className="secure-note">🔒 Доставка в личном кабинете после оплаты</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}