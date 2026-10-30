'use client';

import { useEffect, useRef, useState } from 'react';

type Msg = { role: 'user' | 'ai'; text: string };

const FAQ_DATA: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['привет', 'здравствуй', 'хай', 'hello', 'добрый день', 'салам'],
    answer: 'Привет! 👋 Я FederalAI — твой помощник. Спрашивай про товары, оплату, доставку или аккаунт — подскажу!',
  },
  {
    keywords: ['оплат', 'заплат', 'перевод', 'платёж', 'пополнить', 'перевести', 'счёт'],
    answer:
      '💳 Оплатить можно тремя способами: \n1️⃣ СБП / карта / QR — перевод на карту 2204 2304 6044 7194 8 (мгновенно).\n2️⃣ Криптовалюта USDT (ERC-20) — на кошелёк, указанный на странице товара.\n3️⃣ PayPal — перевод на аккаунт (для всех стран).\n\nПосле оплаты мы подтверждаем заказ в течение пары минут — и файл доступен для скачивания!',
  },
  {
    keywords: ['скачать', 'файл', 'получить', 'выдача', 'забрать', 'ссылка', 'download'],
    answer:
      '📥 Чтобы получить файл: открой «Личный кабинет» → найди свой заказ → нажми кнопку «Скачать». Файл откроется сразу или появится ссылка. Если товар с услугами (дизайн, превью) — напиши в Telegram @vYwmyfBcyY, и мы пришлём готовый результат!',
  },
  {
    keywords: ['заказ', 'оформить', 'купить', 'приобрести', 'покупка', 'товар'],
    answer:
      '🛒 Как купить: выбери товар в каталоге → нажми «Оформить заказ» → выбери удобный способ оплаты → переведи деньги → дождись подтверждения. Всё просто и безопасно!',
  },
  {
    keywords: ['аккаунт', 'регистрац', 'профиль', 'войти', 'вход', 'регистрация', 'пароль', 'логин'],
    answer:
      '👤 Аккаунт: регистрация занимает минуту — введи почту и пароль. В личном кабинете хранятся твои заказы, файлы и профиль. Забыл пароль? Используй форму «Забыли пароль» на странице входа.',
  },
  {
    keywords: ['возврат', 'возврат ср', 'верн', 'деньги назад', 'refund', 'отмена'],
    answer:
      '↩️ Возврат: цифровые товары (файлы, гайды) возврату не подлежат по закону, но если у товара брак или техническая ошибка — напиши нам в Telegram, решим в течение 3 дней. Услуги (дизайн) по договорённости.',
  },
  {
    keywords: ['поддержка', 'помощь', 'помоги', 'связь', 'контакт', 'техподдержка', 'вопрос'],
    answer:
      '💬 Напиши нам в Telegram: @vYwmyfBcyY — отвечаем быстро, обычно в течение часа. Также можно написать в личные сообщения на сайте (вкладка «Личные сообщения» в разделе «Сообщество»).',
  },
  {
    keywords: ['скидка', 'промокод', 'акция', 'дешёвый', 'цена', 'стоимость', 'сколько стоит', 'ценник'],
    answer:
      '🏷️ Цены указаны на странице каждого товара. Скидки и акции появляются в наших постах ВК и истории — подписывайся на сообщество, чтобы не пропустить! Постоянным покупателям делаем персональные скидки — пиши в ТГ.',
  },
  {
    keywords: ['вирус', 'безопасно', 'безопасность', 'проверен', 'доверие', 'защита', 'украдут', 'обман'],
    answer:
      '🛡️ Мы заботимся о безопасности: выдаём только проверенные файлы, храним данные на защищённых серверах, не передаём информацию третьим лицам. Если сомневаешься — начни с недорогого товара, убедись в качестве, потом покупай больше!',
  },
  {
    keywords: ['не работает', 'не отправляется', 'ошибка', 'ошибка при заказе', 'сломалось', 'не грузит', 'не открывается'],
    answer:
      '⚠️ Что-то не работает? Опиши проблему подробно (что делал, что показывает) и напиши в Telegram @vYwmyfBcyY — посмотрим и поможем! Чаще всего решается за 5 минут.',
  },
  {
    keywords: ['какие товары', 'что есть', 'ассортимент', 'всё, что есть', 'список', 'каталог', 'наличие'],
    answer:
      '📦 В каталоге всё для геймеров: бинды и настройки для CS2, Valorant, Dota 2, War Thunder, Minecraft, GTA 5, Apex, Fortnite, а также оптимизация ПК и дизайн-услуги. Выбери игру в фильтре — увидишь всё под неё!',
  },
  {
    keywords: ['бесплатно', 'бесплатный', 'бесплатная', 'даром', 'без оплаты'],
    answer: '🎁 Бесплатно отдаём советы в нашем Telegram и тг-канале. Товары — платные, но недорогие: от 69 ₽. Окупаются одной победой в игре 😉',
  },
  {
    keywords: ['когда доставят', 'сколько ждать', 'доставка', 'сроки', 'быстро', 'скорость', 'время ожидания'],
    answer: '⏱️ Цифровые товары выдаются мгновенно после подтверждения оплаты (обычно 1-5 минут). Для услуг (дизайн, превью) — срок 24-72 часа. Точный срок скажет менеджер в Telegram.',
  },
];

function findAnswer(q: string): string | null {
  const lower = q.toLowerCase().replace(/[?,.!]/g, ' ').trim();
  let best: string | null = null;
  let bestScore = 0;
  for (const item of FAQ_DATA) {
    let score = 0;
    for (const kw of item.keywords) {
      if (lower.includes(kw)) score += kw.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = item.answer;
    }
  }
  return best;
}

export default function FederalAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'ai', text: 'Привет! Я FederalAI 🤖 Готов помочь с выбором товара, оплатой, доставкой и всем остальным. Что тебя интересует?' },
  ]);
  const [input, setInput] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);

  function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q) return;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    const answer = findAnswer(q);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          text:
            answer ||
            'Хм, не нашёл ответа на этот вопрос 🤔 Напиши, пожалуйста, подробнее — или обратись к человеку: Telegram @vYwmyfBcyY. А пока можешь выбрать быстрый вопрос ниже!',
        },
      ]);
    }, 400);
  }

  const quickQuestions = ['Как оплатить заказ?', 'Где скачать файл?', 'Какие товары есть?', 'Как связаться с поддержкой?'];

  return (
    <>
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 360,
            maxWidth: 'calc(100vw - 40px)',
            height: 480,
            maxHeight: '70vh',
            background: 'linear-gradient(180deg, var(--card), var(--bg-soft))',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
          }}
        >
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(139, 92, 246, 0.15)' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>
              🤖 FederalAI
            </span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>✕</button>
          </div>
          <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }} className="chat-body">
            {messages.map((m, i) => (
              <div key={i} style={{ maxWidth: '85%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                  {m.role === 'user' ? 'Вы' : 'FederalAI'}
                </div>
                <div
                  style={{
                    padding: '9px 12px',
                    borderRadius: 12,
                    background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-soft)',
                    color: m.role === 'user' ? '#fff' : 'var(--text)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    borderTopRightRadius: m.role === 'user' ? 4 : 12,
                    borderTopLeftRadius: m.role === 'user' ? 12 : 4,
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 6, background: 'var(--bg-soft)' }}>
            {quickQuestions.map((q) => (
              <button key={q} onClick={() => send(q)} style={{ padding: '6px 10px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                {q}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--border)', background: 'var(--bg-soft)' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Напиши вопрос FederalAI..."
              style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.9rem' }}
            />
            <button onClick={() => send()} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>➤</button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9998,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          color: '#fff',
          fontSize: '1.6rem',
          cursor: 'pointer',
          boxShadow: '0 8px 30px rgba(139, 92, 246, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Открыть ФедералAI"
      >
        🤖
      </button>
    </>
  );
}