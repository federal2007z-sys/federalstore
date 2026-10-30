import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Каталог — цифровые товары для геймеров | FederalStore',
  description:
    'Гайды, настройки прицелов и чувствительности, аватарки, FPS-буст и дизайн для CS2, Valorant, Dota 2, War Thunder, Minecraft, GTA 5. Мгновенная автовыдача после оплаты.',
  openGraph: {
    title: 'Каталог — цифровые товары для геймеров | FederalStore',
    description: 'Гайды, настройки, аватарки для популярных игр. Мгновенная автовыдача после оплаты.',
    type: 'website',
    locale: 'ru_RU',
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}