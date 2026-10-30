'use client';

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const full = 'https://federal-store.ru' + url;
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
      <a
        href={`https://t.me/share/url?url=${encodeURIComponent(full)}&text=${encodeURIComponent(title)}`}
        target="_blank" rel="noopener" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}
      >
        📨 Telegram
      </a>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(title + ' — ' + full)}`}
        target="_blank" rel="noopener" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}
      >
        💬 WhatsApp
      </a>
      <button
        onClick={() => {
          navigator.clipboard.writeText(full).then(() => {
            alert('Ссылка скопирована!');
          });
        }}
        className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}
      >
        🔗 Скопировать
      </button>
    </div>
  );
}