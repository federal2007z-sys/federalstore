import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GUIDES, type Guide } from '@/lib/guides';
import { getProductById, formatPrice } from '@/lib/products';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const guide = GUIDES.find((g) => g.slug === params.slug);
  if (!guide) return {};
  return {
    title: guide.metaTitle,
    description: guide.description,
    keywords: guide.keywords,
    openGraph: {
      title: guide.metaTitle,
      description: guide.description,
      type: 'article',
      locale: 'ru_RU',
    },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = GUIDES.find((g) => g.slug === params.slug);
  if (!guide) notFound();

  const related = guide.productIds.map((id) => getProductById(id)).filter(Boolean) as NonNullable<ReturnType<typeof getProductById>>[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    author: { '@type': 'Organization', name: 'FederalStore', url: 'https://federal-store.ru' },
    publisher: { '@type': 'Organization', name: 'FederalStore' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="page-hero">
        <div className="container">
          <p className="breadcrumb">
            <Link href="/">Главная</Link> / <Link href="/guides">Гайды</Link> / {guide.title}
          </p>
          <h1>{guide.title}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{guide.description}</p>
        </div>
      </div>

      <section>
        <div className="container" style={{ maxWidth: 760 }}>
          {guide.sections.map((s) => (
            <div key={s.h} style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 10 }}>{s.h}</h2>
              <p style={{ color: 'var(--text)', lineHeight: 1.7 }}>{s.text}</p>
            </div>
          ))}

          {related.length > 0 && (
            <div className="card" style={{ marginTop: 32, padding: 24, background: 'linear-gradient(180deg, rgba(139,92,246,0.12), var(--bg-soft))' }}>
              <h3 style={{ marginBottom: 12 }}>📦 Готовые материалы по теме</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
                Не хочешь разбираться сам? Возьми готовые файлы — с автовыдачей сразу после оплаты:
              </p>
              <div style={{ display: 'grid', gap: 10 }}>
                {related.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)',
                      background: 'var(--bg)', textDecoration: 'none',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{p.title}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 800, whiteSpace: 'nowrap', marginLeft: 12 }}>
                      {formatPrice(p.price)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <p style={{ textAlign: 'center', marginTop: 28, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Больше материалов: <Link href="/products" style={{ color: 'var(--accent)' }}>каталог FederalStore</Link> ·{' '}
            <Link href="/guides" style={{ color: 'var(--accent)' }}>все гайды</Link>
          </p>
        </div>
      </section>
    </>
  );
}