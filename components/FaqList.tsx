'use client';

import { useState } from 'react';

const items = [
  {
    q: 'Это безопасно? Не получу ли я бан?',
    a: 'Да, всё безопасно. Мы продаём только легальные цифровые товары: гайды, настройки прицелов, аватарки, советы по прокачке. Никаких читов и программ, нарушающих правила игры, здесь нет.',
  },
  {
    q: 'Как быстро я получу свой товар?',
    a: 'Мгновенно! После подтверждения оплаты (обычно 1-5 минут) файл сразу появляется в личном кабинете — кнопка «Скачать» рядом с заказом. Для услуг (дизайн, превью) срок 24-72 часа.',
  },
  {
    q: 'Подойдёт ли товар для моей игры?',
    a: 'Каждый товар создан под конкретную игру: для CS2, Valorant, Dota 2, War Thunder, Minecraft, GTA 5, Apex Legends, Fortnite и других. Просто выбери свою категорию в каталоге!',
  },
  {
    q: 'Будут ли обновления?',
    a: 'Да, все цифровые гайды и настройки обновляются бесплатно для покупателей — следи за нашим Telegram, мы публикуем новые версии.',
  },
  {
    q: 'Что если у меня возникнут вопросы?',
    a: 'Напиши нам в Telegram @vYwmyfBcyY — поможем с любым вопросом: по товару, оплате, установке файла. Отвечаем быстро!',
  },
];

export default function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {items.map((item, i) => (
        <div
          key={i}
          className={`faq-item ${openIndex === i ? 'open' : ''}`}
        >
          <button
            className="faq-q"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            {item.q}
          </button>
          <div className="faq-a">{item.a}</div>
        </div>
      ))}
    </div>
  );
}