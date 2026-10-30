// Добавляет секреты в GitHub Actions secrets — правильное шифрование libsodium sealed box
const sodium = require('libsodium-wrappers');

const REPO = 'federal2007z-sys/federalstore';
const TOKEN = process.env.GH_TOKEN;
const BOT_TOKEN = '8941389169:AAGDbu-e4XSUnaJwVRJ5H0h4xA_zoIXcICg';
const CHAT_ID = '8876410360';

const b64e = (buf) => Buffer.from(buf).toString('base64');
const b64d = (str) => Buffer.from(str, 'base64');

async function addSecret(name, value) {
  const keyRes = await fetch(`https://api.github.com/repos/${REPO}/actions/secrets/public-key`, {
    headers: { 'User-Agent': 'MultiTool', Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json' },
  });
  if (!keyRes.ok) throw new Error(`get key: HTTP ${keyRes.status}`);
  const key = await keyRes.json();

  // libsodium.crypto_box_seal: принимает сырой публичный ключ (32 байта)
  const publicKey = b64d(key.key);
  const valueBytes = Buffer.from(value, 'utf8');

  await sodium.ready;
  const encrypted = sodium.crypto_box_seal(valueBytes, publicKey);

  const body = { encrypted_value: b64e(encrypted), key_id: key.key_id };
  const putRes = await fetch(`https://api.github.com/repos/${REPO}/actions/secrets/${name}`, {
    method: 'PUT',
    headers: {
      'User-Agent': 'MultiTool',
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!putRes.ok) {
    const txt = await putRes.text();
    throw new Error(`set ${name}: HTTP ${putRes.status} ${txt.slice(0, 150)}`);
  }
  console.log(`✅ Секрет ${name} установлен (HTTP ${putRes.status})`);
}

(async () => {
  if (!TOKEN) { console.error('Нет GH_TOKEN'); process.exit(1); }
  try {
    await addSecret('TELEGRAM_BOT_TOKEN', BOT_TOKEN);
    await addSecret('TELEGRAM_CHAT_ID', CHAT_ID);
    console.log('Готово.');
  } catch (e) {
    console.error('Ошибка:', e.message);
    process.exit(1);
  }
})();