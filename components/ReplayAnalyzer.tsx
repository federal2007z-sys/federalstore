'use client';

import { useState } from 'react';

export default function ReplayAnalyzer({ productId, isLoggedIn }: { productId: string; isLoggedIn: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [details, setDetails] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function analyze() {
    setAnalyzing(true);
    setResult(null);
    try {
      // Читаем файл как текст (для .txt/.log/.json) или просто запоминаем имя
      let fileContent = '';
      if (file) {
        if (file.size < 512 * 1024) {
          fileContent = await file.text().catch(() => '');
        }
      }
      const payload = {
        productId,
        fileName: file?.name || '',
        fileSize: file?.size || 0,
        details: details.slice(0, 3000),
        filePreview: fileContent.slice(0, 2000),
      };

      const res = await fetch('/api/replay-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка анализа');
      setResult(data.analysis || 'Не удалось получить разбор.');
    } catch (err) {
      setResult('Не удалось проанализировать. Проверь, что ты загрузил файл реплея или описал бой, и попробуй снова. Если не получается — напиши в Telegram @vYwmyfBcyY');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="card" style={{ padding: 20, marginTop: 24 }}>
      <h3 style={{ marginBottom: 14 }}>🧠 Анализ реплеев War Thunder (3 боя)</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 14 }}>
        Загрузи реплей (файл .wrpl) или скриншот результатов боя и кратко опиши ситуацию — получишь разбор с ошибками и советами.
      </p>

      <div style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'block', padding: '16px', border: '2px dashed var(--border)', borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: 'var(--bg-soft)' }}>
          📁 {file ? file.name + ' (' + Math.round(file.size / 1024) + ' КБ)' : 'Кликни, чтобы выбрать файл реплея или скриншот'}
          <input type="file" accept=".wrpl,.txt,.log,image/*" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>

        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Опиши бой: какая техника, на какой карте, где погиб, что делал, что не получилось (до 3000 символов)"
          rows={4}
          style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-soft)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical' }}
        />

        <button onClick={analyze} disabled={analyzing || !isLoggedIn} className="btn btn-primary" style={{ width: '100%' }}>
          {analyzing ? 'Анализирую...' : '🔍 Получить разбор'}
        </button>
        {!isLoggedIn && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: 4 }}>
            Войди в аккаунт, чтобы отправить реплей на разбор.
          </p>
        )}

        {result && (
          <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 12, padding: 16, whiteSpace: 'pre-wrap', fontSize: '0.92rem', lineHeight: 1.7 }}>{result}</div>
        )}
      </div>
    </div>
  );
}