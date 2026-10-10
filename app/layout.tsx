import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'FederalSeller / ShulmirovSeller — конфиги и Lua-скрипты для CS2',
  description:
    'Профессиональные конфиги и Lua-скрипты для CS:GO/CS2 от FederalSeller и ShulmirovSeller. Оптимизированный FPS, идеальный райтклайк и плавный прицел.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}