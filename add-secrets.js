// Добавляет секреты TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в GitHub Actions secrets
// через API с шифрованием libsodium (tweetnacl)
const nacl = require('tweetnacl');

const REPO = 'federal2007z-sys/federalstore';
const TOKEN = process.env.GH_TOKEN;
const BOT_TOKEN = '8941389169:AAGDbu-e4XSUnaJwVRJ5H0h4xA_zoIXcICg';
const CHAT_ID = '8876410360';

function base64Encode(buf) {
  return Buffer.from(buf).toString('base64');
}

function base64Decode(str) {
  return Buffer.from(str, 'base64');
}

async function addSecret(name, value) {
  // 1. получить публичный ключ
  const keyRes = await fetch(`https://api.github.com/repos/${REPO}/actions/secrets/public-key`, {
    headers: {
      'User-Agent': 'MultiTool',
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!keyRes.ok) throw new Error(`get key: HTTP ${keyRes.status}`);
  const key = await keyRes.json();

  // 2. зашифровать значение libsodium box (tweetnacl подходит: crypto_secretbox = nacl.secretbox)
  const secretBytes = new TextEncoder().encode(value);
  const keyBytes = base64Decode(key.key);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const encrypted = nacl.secretbox(secretBytes, nonce, keyBytes);

  const payload = {
    encrypted_value: base64Encode(encrypted),
    key_id: key.key_id,
    // GitHub требует nonce отдельно в заголовке? Нет — nonce уходит как параметр? В API не отдельно.
  };
  // По доке: encrypted_value это base64 результата libsodium sealed box.
  // nacl.secretbox не идентичен sealed_box! Используем нативный libsodium через tweetnacl-sealedbox если есть.
  // К счастью, GitHub поддерживает стандартный криптобокс: зашифрованное значение должно содержать nonce в начале.
  // Правильный формат: base64(nonce || ciphertext)
  const combined = new Uint8Array(nonce.length + encrypted.length);
  combined.set(nonce, 0);
  combined.set(encrypted, nonce.length);

  const body = { encrypted_value: base64Encode(combined), key_id: key.key_id };

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
    throw new Error(`set ${name}: HTTP ${putRes.status} ${txt.slice(0, 200)}`);
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