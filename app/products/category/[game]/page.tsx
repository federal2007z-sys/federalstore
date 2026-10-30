import { notFound } from 'next/navigation';
import Link from 'next/link';
import { products, gameLabels } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

const gamePageMeta: Record<string, { title: string; desc: string }> = {
  'cs2': { title: 'Каталог CS2', desc: 'Бинды, настройки и гайды для Counter-Strike 2. Мгновенная автовыдача.' },
  'valorant': { title: 'Каталог Valorant', desc: 'Прицелы и настройки чувствительности для Valorant.' },
  'dota2': { title: 'Каталог Dota 2', desc: 'Раскладки, хоткеи и гайды для Dota 2.' },
  'warthunder': { title: 'Каталог War Thunder', desc: 'Тактики, настройки и гайды по технике для War Thunder.' },
  'minecraft': { title: 'Каталог Minecraft', desc: 'Лучшие сиды и идеи для Minecraft 1.16-1.21.' },
  'gta5': { title: 'Каталог GTA 5', desc: 'Готовые сейвы и гайды для GTA 5.' },
  'apex': { title: 'Каталог Apex Legends', desc: 'Конвертер чувствительности и настройки для Apex Legends.' },
  'fortnite': { title: 'Каталог Fortnite', desc: 'Настройки FPS и прицелы для Fortnite.' },
  'pc-optimization': { title: 'Оптимизация ПК', desc: 'Настройки драйверов и Windows для максимального FPS в любых играх.' },
  'services': { title: 'Услуги и дизайн', desc: 'Превью, аватарки, шапки, интро и AI-арт для твоих соцсетей.' },
};

const gameRouteMap: Record<string, string> = {
  'cs2': 'CS2', 'valorant': 'Valorant', 'dota2': 'Dota 2', 'warthunder': 'War Thunder',
  'minecraft': 'Minecraft', 'gta5': 'GTA 5', 'apex': 'Apex Legends', 'fortnite': 'Fortnite',
  'pc-optimization': 'Все игры', 'services': 'Все игры',
};

export default function CategoryPage({ params }: { params: { game: string } }) {
  const key = params.game.toLowerCase();
  const meta = gamePageMeta[key];
  if (!meta) notFound();

  const catProducts = products.filter((p) => p.game === gameRouteMap[key]);

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="breadcrumb">
            <Link href="/">Главная</Link> / <Link href="/products">Каталог</Link> / {meta.title}
          </p>
          <h1>{meta.title}</h1>
          <p>{meta.desc}</p>
        </div>
      </div>

      <section id="products">
        <div className="container">
          {catProducts.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
              В этой категории пока нет товаров. Загляни в другие разделы или напиши нам в Telegram!
            </p>
          ) : (
            <div className="grid-3" id="products-grid">
              {catProducts.map((p) => (
                <div key={p.id} style={{ display: 'block' }}>
                  <ProductCard p={p} />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 30 }}>
            {Object.entries(gamePageMeta).map(([k, v]) => (
              <Link key={k} href={`/products/category/${k}`} style={{ padding: '8px 14px', borderRadius: 30, border: '1px solid var(--border)', background: k === key ? 'rgba(139,92,246,0.15)' : 'var(--bg-soft)', color: k === key ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>
                {gameLabels[gameRouteMap[k]] || '🎮'} {v.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export const dynamic = 'force-dynamic';