import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node'
import cron from 'node-cron';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)
await db.read()

db.data = db.data

cron.schedule('*/1 * * * *', async function () {


    const rawdata = fs.readFileSync('lighton.json')

    if (rawdata.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 40000));
        console.log('waiting...');
    }

    let lightData = JSON.parse(rawdata);

    function dhm(ms) {
        const days = Math.floor(ms / (24 * 60 * 60 * 1000));
        const daysms = ms % (24 * 60 * 60 * 1000);
        const hours = Math.floor(daysms / (60 * 60 * 1000));
        const hoursms = ms % (60 * 60 * 1000);
        const minutes = Math.floor(hoursms / (60 * 1000));
        const minutesms = ms % (60 * 1000);
        const sec = Math.floor(minutesms / 1000);
        return hours + " год. та " + minutes + " хв.";
    }

    if (db.data.statusBar !== lightData.lighton) {
        db.data.diff = true;
    } else {
        db.data.diff = false;
    }

    if (lightData.lighton) {
        let d1 = db.data.trueTS
        let d2 = lightData.timestamp
        db.data.falseTS = lightData.timestamp
        db.data.statusBar = true
        db.data.lighton = dhm(d2 - d1)
    } else {
        let d1 = db.data.falseTS
        let d2 = lightData.timestamp
        db.data.trueTS = lightData.timestamp
        db.data.statusBar = false
        db.data.lightoff = dhm(d2 - d1)

    }

    console.log(`count hourse is working! ${new Date().toLocaleTimeString()}`);
    await db.write()
});
