'use client';

export default function CopyButton({ text, label }: { text: string; label: string }) {
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => alert('Текст скопирован!'));
      }}
      className="btn btn-outline"
      style={{ width: '100%', marginTop: 10 }}
    >
      {label}
    </button>
  );
}