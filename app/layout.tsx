import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FederalAI from '@/components/FederalAI';

const SITE = 'https://federal-store.ru';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'FederalStore — цифровые товары и гайды для геймеров',
    template: '%s | FederalStore',
  },
  description:
    'Покупай и скачивай мгновенно: аватарки, настройки прицелов, гайды по тактикам и прокачке для CS2, Valorant, Dota 2, War Thunder и других игр. Автовыдача после оплаты.',
  applicationName: 'FederalStore',
  authors: [{ name: 'Federal' }],
  verification: {
    yandex: '8207245aff2f7f7c',
  },
  keywords: ['гайды игры', 'аватарки', 'настройки прицелов', 'фпс буст', 'цифровые товары', 'cs2', 'valorant', 'war thunder', 'dota 2'],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: SITE,
    siteName: 'FederalStore',
    title: 'FederalStore — цифровые товары и гайды для геймеров',
    description:
      'Мгновенная автовыдача: аватарки, гайды, настройки прицелов и прокачка скилла для популярных игр.',
    images: [{ url: SITE + '/vkbanner/banner-1280x720.png', width: 1280, height: 720, alt: 'FederalStore' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FederalStore — цифровые товары и гайды для геймеров',
    description: 'Покупай и скачивай мгновенно: аватарки, гайды и настройки для твоих любимых игр.',
    images: [SITE + '/vkbanner/banner-1280x720.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.setAttribute('data-theme','light');document.documentElement.style.setProperty('--bg','#eef1f5');document.documentElement.style.setProperty('--bg-soft','#ffffff');document.documentElement.style.setProperty('--card','#ffffff');document.documentElement.style.setProperty('--border','#d7dce5');document.documentElement.style.setProperty('--text','#111418');document.documentElement.style.setProperty('--text-muted','#4b5563');}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <FederalAI />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function(){
              function initReveal(){
                var els = document.querySelectorAll('.reveal:not(.visible)');
                if(!els.length) return;
                var io = new IntersectionObserver(function(entries){
                  entries.forEach(function(e){
                    if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
                  });
                }, { threshold: 0.1 });
                els.forEach(function(el){ io.observe(el); });
              }
              if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', initReveal); }
              else { initReveal(); }
            })();
          `,
          }}
        />
      </body>
    </html>
  );
}