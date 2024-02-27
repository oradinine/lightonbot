import fs from 'fs';
import { Telegraf } from 'telegraf';
// import fetch from 'node-fetch'
import * as dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { status, nextStatus, maybeStatus } from './test.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);
if (db.data === undefined || db.data === null || db.data === '' || db.data === ' ' || db.data.length === 0) {
  console.log('db is undefined');
  await new Promise((resolve) => setTimeout(resolve, 10000));
}
await db.read();
// db.data = db.data

const statsFile = join(__dirname, 'countHours.json');
const statsAdapter = new JSONFile(statsFile);
const countHoursDb = new Low(statsAdapter);
if (countHoursDb.data === undefined || countHoursDb.data === null || countHoursDb.data === '' || countHoursDb.data === ' ' || countHoursDb.data.length === 0) {
  console.log('countHoursDb is undefined');
  await new Promise((resolve) => setTimeout(resolve, 10000));
}
await countHoursDb.read();


dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const data = JSON.parse(fs.readFileSync('db.json'));

const response = db.data.statusBar;

const light = response ? "Світло з'явилось 💡" : 'Світло зникло 🔦';

await new Promise((resolve) => setTimeout(resolve, 12000));

console.log(`send status is working! ${new Date().toLocaleTimeString()}`);

if (db.data.diff) {
  bot.telegram.sendMessage('@lightparadiseavenue', light + '\n' + '\n' + status + '\n' + maybeStatus + '\n' + nextStatus);
}
