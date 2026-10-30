'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateAccent } from '@/lib/auth/profile-actions';

const ACCENTS = [
  { name: 'Золотой', value: '#f0b90b' },
  { name: 'Зелёный', value: '#3fb950' },
  { name: 'Голубой', value: '#58a6ff' },
  { name: 'Фиолетовый', value: '#a371f7' },
  { name: 'Розовый', value: '#f778ba' },
  { name: 'Красный', value: '#ff6b6b' },
  { name: 'Белый', value: '#e6edf3' },
  { name: 'Оранжевый', value: '#ff9500' },
];

const BG_COLORS = [
  { name: 'Чёрный', value: '#0d1117' },
  { name: 'Тёмно-синий', value: '#0f172a' },
  { name: 'Тёмно-серый', value: '#111418' },
  { name: 'Бордовый', value: '#1a0e0e' },
  { name: 'Тёмно-зелёный', value: '#0a1410' },
  { name: 'Фиолетовый', value: '#140f1f' },
  { name: 'Светлый', value: '#eef1f5' },
  { name: 'Бежевый', value: '#f5efe2' },
];

export default function ThemePicker({
  accent,
  bg,
  isLoggedIn,
}: {
  accent: string | null;
  bg: string | null;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [selAccent, setSelAccent] = useState(accent || '#f0b90b');
  const [selBg, setSelBg] = useState(bg || '#0d1117');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', selAccent);
    root.style.setProperty('--bg', selBg);
    // Подстраиваем вторичные цвета под фон
    const isLight = isLightBg(selBg);
    root.style.setProperty('--text', isLight ? '#111418' : '#e6edf3');
    root.style.setProperty('--text-muted', isLight ? '#4b5563' : '#8b949e');
  }, [selAccent, selBg]);

  function isLightBg(hex: string) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return 0.299 * r + 0.587 * g + 0.114 * b > 150;
  }

  async function save() {
    if (!isLoggedIn) return;
    setSaved(false);
    const formData = new FormData();
    formData.set('accent', selAccent);
    formData.set('bg', selBg);
    await updateAccent(formData);
    setSaved(true);
    router.refresh();
  }

  const swatchBtn = (color: string, active: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: color,
        border: active === color ? '3px solid var(--text)' : '2px solid var(--border)',
        cursor: 'pointer',
        boxShadow: active === color ? '0 0 12px ' + color : 'none',
      }}
    />
  );

  return (
    <div className="form-group">
      <label>Тема сайта (для тебя)</label>
      <div style={{ marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Цвет акцента</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        {ACCENTS.map((c) => swatchBtn(c.value, selAccent, () => setSelAccent(c.value)))}
      </div>
      <div style={{ marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Цвет фона (весь сайт)</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        {BG_COLORS.map((c) => swatchBtn(c.value, selBg, () => setSelBg(c.value)))}
      </div>
      <button type="button" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }} onClick={save}>
        {saved ? 'Сохранено ✓' : 'Применить тему'}
      </button>
    </div>
  );
}