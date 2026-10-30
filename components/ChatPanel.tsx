'use client';

import { useEffect, useState, useCallback } from 'react';

type ChatUser = { id: string; nickname: string | null; avatar_url: string | null };

type Message = {
  id: number;
  sender_id: string;
  content: string;
  created_at: string;
};

type GlobalMsg = {
  id: number;
  user_id: string;
  displayName: string;
  content: string;
  created_at: string;
};

type Props = {
  me: { id: string };
  users: { id: string; nickname: string | null; avatar_url: string | null }[];
};

const STYLE = {
  panel: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    height: 480,
  },
  tabs: {
    display: 'flex' as const,
    borderBottom: '1px solid var(--border)' as const,
    background: 'var(--bg-soft)',
  },
  tab: {
    flex: 1,
    padding: '12px 0',
    textAlign: 'center' as const,
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    border: 'none' as const,
    background: 'transparent' as const,
    fontFamily: 'inherit' as const,
  },
  listHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid var(--border)',
    fontWeight: 800,
    fontSize: '0.95rem',
    letterSpacing: '0.5px',
    background: 'var(--bg-soft)',
  },
  userItem: {
    display: 'flex' as const,
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid var(--border)',
    transition: 'background .15s',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    objectFit: 'cover' as const,
    flexShrink: 0,
    border: '1px solid var(--border)',
    background: 'var(--bg-soft)',
  },
  bubble: {
    maxWidth: '78%',
    padding: '8px 12px',
    borderRadius: 14,
    fontSize: '0.92rem',
    wordBreak: 'break-word' as const,
    lineHeight: 1.45,
  },
  input: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--bg-soft)',
    color: 'var(--text)',
    fontFamily: 'inherit',
    fontSize: '0.95rem',
  },
  sendBtn: {
    padding: '10px 18px',
    borderRadius: 10,
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontWeight: 800,
    cursor: 'pointer' as const,
  },
};

export default function ChatPanel({ me, users }: Props) {
  const [tab, setTab] = useState<'global' | 'private'>('global');
  const [recipient, setRecipient] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [globalMessages, setGlobalMessages] = useState<GlobalMsg[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGlobal, setLoadingGlobal] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!recipient) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/messages?other=${recipient.id}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [recipient]);

  const loadGlobal = useCallback(async () => {
    setLoadingGlobal(true);
    try {
      const res = await fetch('/api/chat', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setGlobalMessages(data.messages || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingGlobal(false);
    }
  }, []);

  useEffect(() => {
    loadGlobal();
    const t = setInterval(loadGlobal, 3000);
    return () => clearInterval(t);
  }, [loadGlobal]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (recipient) {
      const t = setInterval(loadMessages, 3000);
      return () => clearInterval(t);
    }
  }, [recipient, loadMessages]);

async function send() {
    const content = text.trim();
    if (!content) return;
    setText('');
    if (tab === 'global') {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
        if (res.ok) {
          await loadGlobal();
          // Прокрутка после отправки (внутри контейнера чата, а не всей страницы)
          setTimeout(() => {
            const container = document.getElementById('global-chat-scroll');
            if (container) container.scrollTop = container.scrollHeight;
          }, 100);
        }
      } catch {
        // ignore
      }
    } else {
      if (!recipient) return;
      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientId: recipient.id, content }),
        });
        if (res.ok) {
          await loadMessages();
          setTimeout(() => {
            const container = document.getElementById('private-chat-scroll');
            if (container) container.scrollTop = container.scrollHeight;
          }, 100);
        }
      } catch {
        // ignore
      }
    }
  }

  const fmtTime = (ts: string) => new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={STYLE.panel}>
      <div style={STYLE.tabs}>
        <button
          style={{ ...STYLE.tab, color: tab === 'global' ? 'var(--accent)' : 'var(--text-muted)', borderBottom: tab === 'global' ? '2px solid var(--accent)' : 'none' }}
          onClick={() => setTab('global')}
        >
          Общий чат 💬
        </button>
        <button
          style={{ ...STYLE.tab, color: tab === 'private' ? 'var(--accent)' : 'var(--text-muted)', borderBottom: tab === 'private' ? '2px solid var(--accent)' : 'none' }}
          onClick={() => setTab('private')}
        >
          Личные сообщения
        </button>
      </div>

      {tab === 'global' ? (
        <>
          <div style={STYLE.listHeader}>👥 Общий чат — пишите, все участники видят</div>
          <div id="global-chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'grid', gap: 10, alignContent: 'start', background: 'var(--bg)' }}>
            {loadingGlobal && globalMessages.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Загрузка...</p>
            )}
            {globalMessages.length === 0 && !loadingGlobal && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: 20 }}>
                Пока пусто. Напиши первым!
              </p>
            )}
            {globalMessages.map((m) => {
              const mine = m.user_id === me.id;
              const name = m.displayName || 'Пользователь';
              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2, fontWeight: mine ? 700 : 400 }}>{mine ? 'Вы' : name}</div>
                  <div
                    style={{
                      ...STYLE.bubble,
                      background: mine ? 'var(--accent)' : 'var(--bg-soft)',
                      color: mine ? '#fff' : 'var(--text)',
                      borderBottomRightRadius: mine ? 4 : 14,
                      borderBottomLeftRadius: mine ? 14 : 4,
                    }}
                  >
                    {m.content}
                    <div style={{ fontSize: '0.66rem', opacity: 0.6, marginTop: 3 }}>{fmtTime(m.created_at)}</div>
                  </div>
                </div>
              );
            })}
            <div />
          </div>
          <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--border)', background: 'var(--bg-soft)' }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Написать сообщение в общий чат..."
              style={STYLE.input}
            />
            <button onClick={send} style={STYLE.sendBtn}>➤</button>
          </div>
        </>
      ) : (
        <>
          <div style={STYLE.listHeader}>
            {recipient ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setRecipient(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>←</button>
                {recipient.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={recipient.avatar_url} alt="" style={STYLE.avatar} />
                ) : (
                  <div style={STYLE.avatar} />
                )}
                {recipient.nickname || 'Пользователь'}
              </span>
            ) : (
              <span>Личные сообщения</span>
            )}
          </div>

          {!recipient ? (
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {users.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: 20 }}>
                  Пока никого нет. Поделись ссылкой на сайт!
                </p>
              )}
              {users.map((u) => (
                <div key={u.id} style={STYLE.userItem} onClick={() => setRecipient(u)} onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-soft)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  {u.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatar_url} alt="" style={STYLE.avatar} />
                  ) : (
                    <div style={STYLE.avatar} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{u.nickname || 'Без имени'}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Начать переписку</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div id="private-chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'grid', gap: 8, alignContent: 'start', background: 'var(--bg)' }}>
                {loading && messages.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Загрузка...</p>
                )}
                {messages.length === 0 && !loading && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: 20 }}>
                    Сообщений пока нет. Напиши первым!
                  </p>
                )}
                {messages.map((m) => {
                  const mine = m.sender_id === me.id;
                  return (
                    <div
                      key={m.id}
                      style={{
                        ...STYLE.bubble,
                        alignSelf: mine ? 'flex-end' : 'flex-start',
                        background: mine ? 'var(--accent)' : 'var(--bg-soft)',
                        color: mine ? '#fff' : 'var(--text)',
                        borderBottomRightRadius: mine ? 4 : 14,
                        borderBottomLeftRadius: mine ? 14 : 4,
                      }}
                    >
                      {m.content}
                      <div style={{ fontSize: '0.66rem', opacity: 0.6, marginTop: 3 }}>{fmtTime(m.created_at)}</div>
                    </div>
                  );
                })}
                <div />
              </div>
              <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--border)', background: 'var(--bg-soft)' }}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder={`Написать ${recipient.nickname || 'пользователю'}...`}
                  style={STYLE.input}
                />
                <button onClick={send} style={STYLE.sendBtn}>➤</button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}