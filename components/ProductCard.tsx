import Link from 'next/link';
import { formatPrice, gameLabels } from '@/lib/products';
import type { Product } from '@/lib/products';

const bgByGame: Record<string, string> = {
  'CS2': '/game-bg/cs2.png',
  'Valorant': '/game-bg/valorant.png',
  'Dota 2': '/game-bg/dota2.png',
  'War Thunder': '/game-bg/warthunder.png',
  'Minecraft': '/game-bg/minecraft.png',
  'GTA 5': '/game-bg/gta5.png',
  'Apex Legends': '/game-bg/apex.png',
  'Fortnite': '/game-bg/fortnite.png',
  'РПГ-гайды': '/game-bg/rpg.png',
  'Все игры': '/game-bg/services.png',
};

export default function ProductCard({ p }: { p: Product }) {
  const bg = bgByGame[p.game] || '/game-bg/services.png';
  return (
    <div className="card" key={p.id}>
      <div className="card-bg" style={{ backgroundImage: `url(${bg})` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span className="card-badge">{p.badge}</span>
        <span style={{ fontSize: '1.1rem' }}>{gameLabels[p.game] || '🎮'}</span>
      </div>
      <h3>{p.title}</h3>
      <p>{p.shortDescription || p.description}</p>
      <div className="card-price">
        {formatPrice(p.price)} <small>разовая покупка</small>
      </div>
      <ul className="card-features">
        {p.features.slice(0, 3).map((f) => <li key={f}>{f}</li>)}
      </ul>
      <Link href={`/products/${p.slug}`} className="btn btn-primary">Подробнее</Link>
    </div>
  );
}