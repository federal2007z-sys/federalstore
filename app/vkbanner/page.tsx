import type { Metadata } from 'next';
import CopyButton from '@/components/CopyButton';

export const metadata: Metadata = {
  title: 'Оформление для VK-сообщества',
  description: 'Готовое оформление для сообщества FederalStore: баннер, аватарка, посты и тексты.',
};

export default function VkBannerPage() {
  const base = 'https://federal-store.ru';

  const downloadLink = (file: string) =>
    `${base}/vkbanner/${file}`;

  const postText = `🚀 FederalStore — твой шоп игровых ништяков!

🔥 В наличии:
✅ 100+ аватарок для любых соцсетей
✅ Прицелы и настройки для CS2, Valorant, Apex
✅ Гайды по аиму и стратегиям
✅ Сиды Minecraft, сейвы GTA 5 и многое другое

⚡ Мгновенная автовыдача — оплатил и получил файл сразу!
💳 Оплата: СБП, карта, криптовалюта, PayPal.

🎨 Нужен дизайн? Превью для YouTube, шапка канала, AI-арт — сделаем быстро и красиво!

👉 Сайт: https://federal-store.ru
💬 По вопросам: @vYwmyfBcyY

#CS2 #Valorant #Dota2 #Minecraft #gaming #игры`;

  const groupText = `FederalStore — магазин игровых ништяков для геймеров и блогеров.

Здесь ты найдёшь:
• 100+ аватарок для любых соцсетей
• Настройки и прицелы для CS2, Valorant, Apex
• Гайды по прокачке аима и стратегиям
• Сиды Minecraft и сейвы GTA 5
• Дизайн-услуги: превью, шапки, интро, AI-арт

⚡ Автовыдача после оплаты
💳 Оплата: СБП, карта, криптовалюта, PayPal

Сайт: https://federal-store.ru
По вопросам: @vYwmyfBcyY`;

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>Оформление для VK-сообщества</h1>
          <p>Скачай готовые файлы и загрузи их в настройки группы. Ниже — тексты поста и описания для копирования.</p>
        </div>
      </div>

      <section>
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ display: 'grid', gap: 24 }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={downloadLink('anime-cover-1590x400.png')} alt="Аниме-обложка" style={{ width: '100%', display: 'block' }} />
              <div style={{ padding: '16px 20px' }}>
                <a href={downloadLink('anime-cover-1590x400.png')} download className="btn btn-primary" style={{ width: '100%' }}>
                  Скачать аниме-обложку (1590×400)
                </a>
              </div>
            </div>

            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={downloadLink('anime-avatar-500x500.png')} alt="Аниме-аватарка" width={180} height={180} style={{ borderRadius: '50%' }} />
              </div>
              <a href={downloadLink('anime-avatar-500x500.png')} download className="btn btn-primary" style={{ width: '100%' }}>
                Скачать аниме-аватарку (500×500)
              </a>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={downloadLink('cover-1590x400.png')} alt="Обложка сообщества" style={{ width: '100%', display: 'block' }} />
              <div style={{ padding: '16px 20px' }}>
                <a href={downloadLink('cover-1590x400.png')} download className="btn btn-primary" style={{ width: '100%' }}>
                  Скачать обычную обложку (1590×400)
                </a>
              </div>
            </div>

            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={downloadLink('avatar-500x500.png')} alt="Аватарка" width={180} height={180} style={{ borderRadius: '50%' }} />
              </div>
              <a href={downloadLink('avatar-500x500.png')} download className="btn btn-primary" style={{ width: '100%' }}>
                Скачать обычную аватарку (500×500)
              </a>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ marginBottom: 10 }}>📝 Текст поста (скопируй и вставь)</h3>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', background: 'var(--bg)', padding: 16, borderRadius: 10, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{postText}</pre>
              <CopyButton text={postText} label="Скопировать текст поста" />
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ marginBottom: 10 }}>📋 Описание группы (скопируй и вставь в раздел «О сообществе»)</h3>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', background: 'var(--bg)', padding: 16, borderRadius: 10, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{groupText}</pre>
              <CopyButton text={groupText} label="Скопировать описание" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}