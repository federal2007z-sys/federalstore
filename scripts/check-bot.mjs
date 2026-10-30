#!/usr/bin/env node
// Проверка: какой из ботов является админом канала @federal1store1ru
const TOKENS = [
  '8941389169:AAGDbu-e4XSUnaJwVRJ5H0h4xA_zoIXcICg',
  '8951341346:AAEiDDSz2cn9twzmtBc-v_1SEM-zFb-sTxg',
];

async function main() {
  for (const t of TOKENS) {
    try {
      const me = await fetch(`https://api.telegram.org/bot${t}/getMe`).then((r) => r.json());
      if (!me.ok) { console.log(`${t.slice(0, 12)}... => getMe error: ${me.description}`); continue; }
      const bot = me.result;
      // Проверяем членство в канале через getChatMember (бот должен быть админом)
      const ch = await fetch(`https://api.telegram.org/bot${t}/getChatMember?chat_id=@federal1store1ru&user_id=${bot.id}`).then((r) => r.json());
      if (ch.ok) {
        console.log(`@${bot.username} (id ${bot.id}) => В КАНАЛЕ: статус "${ch.result.status}"`);
      } else {
        console.log(`@${bot.username} (id ${bot.id}) => НЕ в канале: ${ch.description || ch.error_code}`);
      }
    } catch (e) {
      console.log(`${t.slice(0, 12)}... => сеть: ${e.message}`);
    }
  }
}
main();