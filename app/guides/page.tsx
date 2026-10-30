import Link from 'next/link';
import { GUIDES } from '@/lib/guides';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Гайды для геймеров — бесплатные инструкции | FederalStore',
  description:
    'Бесплатные гайды по CS2, Valorant, Elden Ring, Minecraft, GTA 5, War Thunder и другим играм. Как поднять FPS, тренировать аим, прокачивать ранг и зарабатывать.',
};

export default function GuidesPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="breadcrumb">Главная / Гайды</p>
          <h1>Бесплатные гайды для геймеров</h1>
          <p>Полезные инструкции по популярным играм. Читай бесплатно — покупай готовые материалы, когда нужно глубже.</p>
        </div>
      </div>

      <section>
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ display: 'grid', gap: 16 }}>
            {GUIDES.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="card"
                style={{ padding: 24, textDecoration: 'none', display: 'block' }}
              >
                <h3 style={{ marginBottom: 8, color: 'var(--text)' }}>{g.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{g.description}</p>
                <p style={{ marginTop: 10, fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700 }}>
                  Читать гайд →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}