import fs from 'fs';
import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { status, nextStatus, maybeStatus } from './test.js';
import { log } from 'util';
// import { outputOn, outputOff } from "./countHours.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);
await db.read();

const statsFile = join(__dirname, 'botstats.json');
const statsAdapter = new JSONFile(statsFile);
const statsDb = new Low(statsAdapter);
await statsDb.read();
statsDb.data = statsDb.data;

const countHoursDB = join(__dirname, 'countHours.json');
const countHoursAdapter = new JSONFile(countHoursDB);
const countHoursDb = new Low(countHoursAdapter);
await countHoursDb.read();
countHoursDb.data = countHoursDb.data;

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const data = JSON.parse(fs.readFileSync('db.json'));

const response = data.statusBar;

const light = response ? "Світло з'явилось 💡" : 'Світло зникло 🔦';

db.data = db.data;

bot.start((ctx) =>
  ctx.reply(
    'Вітаю, для перевірки чи є світло: напишіть "світло" чи "свет", також можна перевірити за допомогою команди /checklight (просто нажміть на неї у цьому повідомленні 😉)',
  ),
);

bot.command('stats', (ctx) => {

  statsDb.data.comandUsage += 1;
  statsDb.data.lastUsage = new Date().toLocaleTimeString();
  statsDb.data.users = [
    ...statsDb.data.users,
    {
      name: ctx.message.from.first_name,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      message: 'command stats',
    },
  ];

  const stats = countHoursDb.data.totalToday[Object.keys(countHoursDb.data.totalToday)[Object.keys(countHoursDb.data.totalToday).length - 1]];
  const date = stats.date;
  const lighton = stats.lighton;
  const lightoff = stats.lightoff;
  // ctx.replyWithHTML(
  //   `<b>${date}</b>\n\nСвітло було протягом ${lighton.hours} год. ${lighton.minutes} хв. \nСвітла не було протягом ${lightoff.hours} год. ${lightoff.minutes} хв.\n\n❗️ Данні відображаються на момент останнього змінення статусу світла, а не на момент відправки команди.`,
  // );
  ctx.reply('Поки що ця команда не працює, вибачте за незручності 😔');
  statsDb.write();
  console.log('Stats on comand is updated');
});

bot.command('checklight', async (ctx) => {
  statsDb.data.comandUsage += 1;
  statsDb.data.lastUsage = new Date().toLocaleTimeString();
  statsDb.data.users = [
    ...statsDb.data.users,
    {
      name: ctx.message.from.first_name,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      message: 'command checklight',
    },
  ];

  const name = ctx.message.from.first_name;
  ctx.reply(`Вітаю, ${name}! ${response ? `Світло є 💡\n ${db.data.lighton}` : `Світла немає 🔦\n\n${db.data.lightoff}`}
    \n ${status} \n ${maybeStatus} \n ${nextStatus}
    `);
  await statsDb.write();
  console.log('Stats on comand is updated');
});

bot.command('help', (ctx) => {
  statsDb.data.comandUsage += 1;
  statsDb.data.lastUsage = new Date().toLocaleTimeString();
  statsDb.data.users = [
    ...statsDb.data.users,
    {
      name: ctx.message.from.first_name,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      message: 'command help',
    },
  ];
  const name = ctx.message.from.first_name;
  ctx.reply(
    `Вітаю, ${name}! \nЦей бот був створений для перевірки світла. Фактично перевіряється доступ окремої ip-адреси до інтернету, якщо доступ є то і світло є. На 100% довіряти боту не потрібно, тому що світло може бути, але якщо не буде інтернету то бот буде казати що світла немає.`,
  );
  statsDb.write();
  console.log('Stats on comand is updated');
});

bot.on('message', async (ctx) => {
  if (ctx.message.text.includes('світло') || ctx.message.text.includes('свет') || ctx.message.text.includes('Свет') || ctx.message.text.includes('Світло')) {
    statsDb.data.comandUsage += 1;
    statsDb.data.lastUsage = new Date().toLocaleTimeString();
    statsDb.data.users = [
      ...statsDb.data.users,
      {
        name: ctx.message.from.first_name,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        message: 'message',
      },
    ];

    ctx.reply(`${response ? 'Світло є 💡' : 'Світла немає 🔦'}`);

    await statsDb.write();
    console.log('Stats on message is updated');
  } else {
    statsDb.data.comandUsage += 1;
    statsDb.data.lastUsage = new Date().toLocaleTimeString();
    statsDb.data.users = [
      ...statsDb.data.users,
      {
        name: ctx.message.from.first_name,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        message: 'dont understand',
      },
    ];

    ctx.reply('Не розумію 😔');

    await statsDb.write();
    console.log("Stats on i dont' undestand is updated");
  }
});
console.log(`Bot is working ${new Date().toLocaleTimeString()}`);
bot.launch();
