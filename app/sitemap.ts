import { MetadataRoute } from 'next'
import { products } from '@/lib/products'
import { GUIDES } from '@/lib/guides'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://federal-store.ru'
  const routes = [
    '',
    '/products',
    '/about',
    '/privacy',
    '/offer',
    '/guides',
  ]

  const productRoutes: { url: string; lastModified: Date }[] = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(),
  }))

  const guideRoutes: { url: string; lastModified: Date }[] = GUIDES.map((g) => ({
    url: `${base}/guides/${g.slug}`,
    lastModified: new Date(),
  }))

  return [
    ...routes.map((r) => ({
      url: `${base}${r}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: r === '' ? 1 : r === '/guides' ? 0.7 : 0.8,
    })),
    ...productRoutes.map((r) => ({ ...r, changeFrequency: 'weekly' as const, priority: 0.9 })),
    ...guideRoutes.map((r) => ({ ...r, changeFrequency: 'weekly' as const, priority: 0.8 })),
  ]
}