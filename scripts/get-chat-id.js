// Получение chat_id владельца для Telegram-уведомлений.
//
// Как использовать:
// 1. Создайте бота у @BotFather (в Telegram) и получите токен.
// 2. В Telegram напишите своему боту ЛЮБОЕ сообщение (например "привет").
// 3. Запустите: node scripts/get-chat-id.js <ТОКЕН_БОТА>
// 4. Скрипт выведет ваш chat_id — вставьте его в TELEGRAM_CHAT_ID.

const token = process.argv[2];

if (!token) {
  console.error('Укажите токен бота: node scripts/get-chat-id.js <ТОКЕН>');
  process.exit(1);
}

async function main() {
  const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
  const data = await res.json();

  if (!data.ok) {
    console.error('Ошибка API Telegram:', data.description || 'неизвестная');
    process.exit(1);
  }

  const updates = data.result || [];
  if (updates.length === 0) {
    console.error(
      'Нет сообщений. Напишите боту любое сообщение в Telegram (например "привет") и запустите скрипт снова.'
    );
    process.exit(1);
  }

  const chatIds = new Map();
  for (const u of updates) {
    const chat = u.message?.chat || u.my_chat_member?.chat || u.channel_post?.chat;
    if (chat && chat.id) {
      chatIds.set(chat.id, chat);
    }
  }

  if (chatIds.size === 0) {
    console.error('Не удалось найти chat_id. Напишите боту сообщение и попробуйте снова.');
    process.exit(1);
  }

  for (const [id, chat] of chatIds) {
    console.log('chat_id:', id, '| тип:', chat.type, '| название:', chat.title || chat.username || '—');
  }

  console.log('\nВозьмите нужный chat_id (обычно это число, например -1001234567890 для канала)');
  console.log('и вставьте его в переменную окружения TELEGRAM_CHAT_ID.');
}

main();