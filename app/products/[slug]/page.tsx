import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductById, getRelatedProducts, formatPrice, gameLabels } from '@/lib/products';
import { createClient } from '@/lib/supabase/server';
import BuyButton from '@/components/BuyButton';
import ReviewsBlock from '@/components/ReviewsBlock';
import ShareButtons from '@/components/ShareButtons';
import ReplayAnalyzer from '@/components/ReplayAnalyzer';
import ProductCard from '@/components/ProductCard';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = getProductById(params.slug);
  if (!product) return {};
  const title = `${product.title} — купить за ${formatPrice(product.price)}`;
  const description = product.shortDescription || product.description;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ru_RU',
      siteName: 'FederalStore',
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductById(params.slug);
  if (!product) notFound();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const related = getRelatedProducts(product.id, 3);

  const bgByGame: Record<string, string> = {
    'CS2': '/game-bg/cs2.png',
    'Valorant': '/game-bg/valorant.png',
    'Dota 2': '/game-bg/dota2.png',
    'War Thunder': '/game-bg/warthunder.png',
    'Minecraft': '/game-bg/minecraft.png',
    'GTA 5': '/game-bg/gta5.png',
    'Apex Legends': '/game-bg/apex.png',
    'Fortnite': '/game-bg/fortnite.png',
    'PC-оптимизация': '/game-bg/services.png',
    'Все игры': '/game-bg/services.png',
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.shortDescription || product.description,
    image: `https://federal-store.ru${bgByGame[product.game] || '/game-bg/services.png'}`,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'RUB',
      availability: 'https://schema.org/InStock',
      url: `https://federal-store.ru/products/${product.slug}`,
    },
    category: gameLabels[product.game] || product.game,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
              <p style={{ color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>{product.description}</p>
              <div className="price">
                {formatPrice(product.price)} <small>разовая покупка</small>
              </div>
              <BuyButton
                productId={product.id}
                isLoggedIn={!!user}
                price={product.price}
                downloadUrl={product.postPurchase?.downloadUrl || null}
              />
              <p className="secure-note">🔒 Доставка в личном кабинете после оплаты</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <ShareButtons url={`/products/${product.slug}`} title={product.title} />
          </div>

          {product.slug.includes('replays') && <ReplayAnalyzer productId={product.id} isLoggedIn={!!user} />}

          <ReviewsBlock productId={product.id} isLoggedIn={!!user} />

          {related.length > 0 && (
            <div style={{ marginTop: 56 }}>
              <h2 className="sec-title" style={{ marginBottom: 20 }}>Похожие товары</h2>
              <div className="grid-3">
                {related.map((rp) => (
                  <ProductCard key={rp.id} p={rp} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}