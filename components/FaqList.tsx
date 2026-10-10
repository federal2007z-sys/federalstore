'use client';

import { useState } from 'react';

const items = [
  {
    q: 'Это безопасно? Не получу ли я бан?',
    a: 'Наши конфиги и Lua-скрипты используют только легальные игровые настройки и не нарушают правила Valve. Мы не продаём читы и гарантируем безопасность.',
  },
  {
    q: 'Как быстро я получу свой конфиг?',
    a: 'После подтверждения оплаты файлы сразу появляются в личном кабинете. Обычно в течение часа.',
  },
  {
    q: 'Подойдёт ли конфиг для моего компьютера?',
    a: 'Да, конфиги адаптируются под твоё железо. Поможем настроить при необходимости.',
  },
  {
    q: 'Будут ли обновления?',
    a: 'Да, все обновления бесплатны для покупателей.',
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