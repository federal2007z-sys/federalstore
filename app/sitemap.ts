import { MetadataRoute } from 'next'
import { products } from '@/lib/products'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://federal-store.ru'
  const routes = [
    '',
    '/products',
    '/about',
    '/privacy',
    '/offer',
  ]

  const productRoutes: { url: string; lastModified: Date }[] = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(),
  }))

  return [
    ...routes.map((r) => ({
      url: `${base}${r}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: r === '' ? 1 : 0.8,
    })),
    ...productRoutes.map((r) => ({ ...r, changeFrequency: 'weekly' as const, priority: 0.9 })),
  ]
}