// await new Promise(resolve => setTimeout(resolve, 20000));
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import dayjs from 'dayjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const file = join(__dirname, 'lighton.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

if (db.data === undefined || db.data === null || db.data === '' || db.data === ' ' || db.data.length === 0) {
  console.log('db is undefined');
  await new Promise((resolve) => setTimeout(resolve, 10000));
}

await db.read();

db.data = db.data;

const fileDB = join(__dirname, 'db.json');
const adapterDB = new JSONFile(fileDB);
const dbDB = new Low(adapterDB);
await dbDB.read();
dbDB.data = dbDB.data;

const fileCount = join(__dirname, 'countHours.json');
const adapterCount = new JSONFile(fileCount);
const dbCount = new Low(adapterCount);
await dbCount.read();
dbCount.data = dbCount.data;

const diff = dbDB.data.diff;
const light = dbDB.data.statusBar;

if (diff) {
  dbCount.data.begin = new Date().getTime();

  if (!light) {
    // dbCount.data.lightoff.lightoffTime = [...dbCount.data.lighton.lightonTime, 1674215940000];
    dbCount.data.lightoff.lightoffTime = [...dbCount.data.lightoff.lightoffTime, new Date().getTime()];

    dbCount.data.lightoff.time = [
      ...dbCount.data.lightoff.time,
      new Date().toLocaleString('uk-UA', {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }),
    ];

    const diffHour = dayjs(dbCount.data.lightoff.lightoffTime[dbCount.data.lightoff.lightoffTime.length - 1]).diff(
      dayjs(dbCount.data.lighton.lightonTime[dbCount.data.lighton.lightonTime.length - 1]),
      'hour',
    );
    const diffMinute =
      dayjs(dbCount.data.lightoff.lightoffTime[dbCount.data.lightoff.lightoffTime.length - 1]).diff(
        dayjs(dbCount.data.lighton.lightonTime[dbCount.data.lighton.lightonTime.length - 1]),
        'minute',
      ) % 60;
    const diffSecond =
      dayjs(dbCount.data.lightoff.lightoffTime[dbCount.data.lightoff.lightoffTime.length - 1]).diff(
        dayjs(dbCount.data.lighton.lightonTime[dbCount.data.lighton.lightonTime.length - 1]),
        'second',
      ) % 60;

    dbCount.data.lightoff.output = [
      ...dbCount.data.lightoff.output,
      {
        light: {
          hours: diffHour,
          minutes: diffMinute,
          seconds: diffSecond,
        },
      },
    ];
  } else {
    // dbCount.data.lighton.lightonTime = [...dbCount.data.lighton.lightonTime, 1674224700000];
    dbCount.data.lighton.lightonTime = [...dbCount.data.lighton.lightonTime, new Date().getTime()];

    dbCount.data.lighton.time = [
      ...dbCount.data.lighton.time,
      new Date().toLocaleString('uk-UA', {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }),
    ];

    const diffHour = dayjs(dbCount.data.lighton.lightonTime[dbCount.data.lighton.lightonTime.length - 1]).diff(
      dayjs(dbCount.data.lightoff.lightoffTime[dbCount.data.lightoff.lightoffTime.length - 1]),
      'hour',
    );
    const diffMinute =
      dayjs(dbCount.data.lighton.lightonTime[dbCount.data.lighton.lightonTime.length - 1]).diff(
        dayjs(dbCount.data.lightoff.lightoffTime[dbCount.data.lightoff.lightoffTime.length - 1]),
        'minute',
      ) % 60;
    const diffSecond =
      dayjs(dbCount.data.lighton.lightonTime[dbCount.data.lighton.lightonTime.length - 1]).diff(
        dayjs(dbCount.data.lightoff.lightoffTime[dbCount.data.lightoff.lightoffTime.length - 1]),
        'second',
      ) % 60;

    dbCount.data.lighton.output = [
      ...dbCount.data.lighton.output,
      {
        lightoff: {
          hours: diffHour,
          minutes: diffMinute,
          seconds: diffSecond,
        },
      },
    ];
  }

  await dbCount.write();
}

const countHoursOff = () => {
  const minutes = dbCount.data.lighton.output.reduce((a, b) => a + b.lightoff.minutes, 0);
  let hours = 0;

  if (minutes >= 60 && minutes <= 120) {
    hours = dbCount.data.lighton.output.reduce((a, b) => a + b.lightoff.hours, 0) + 1;
  } else if (minutes < 60) {
    hours = dbCount.data.lighton.output.reduce((a, b) => a + b.lightoff.hours, 0);
  } else if (minutes >= 120 && minutes <= 180) {
    hours = dbCount.data.lighton.output.reduce((a, b) => a + b.lightoff.hours, 0) + 2;
  } else if (minutes >= 180 && minutes <= 240) {
    hours = dbCount.data.lighton.output.reduce((a, b) => a + b.lightoff.hours, 0) + 3;
  } else if (minutes >= 240 && minutes <= 300) {
    hours = dbCount.data.lighton.output.reduce((a, b) => a + b.lightoff.hours, 0) + 4;
  } else {
    hours = dbCount.data.lighton.output.reduce((a, b) => a + b.lightoff.hours, 0);
  }

  return hours;
};

const countHoursOn = () => {
  const minutes = dbCount.data.lightoff.output.reduce((a, b) => a + b.light.minutes, 0);

  if (minutes >= 60 && minutes <= 120) {
    return dbCount.data.lightoff.output.reduce((a, b) => a + b.light.hours, 0) + 1;
  } else if (minutes < 60) {
    return dbCount.data.lightoff.output.reduce((a, b) => a + b.light.hours, 0);
  } else if (minutes >= 120 && minutes <= 180) {
    return dbCount.data.lightoff.output.reduce((a, b) => a + b.light.hours, 0) + 2;
  } else if (minutes >= 180 && minutes <= 240) {
    return dbCount.data.lightoff.output.reduce((a, b) => a + b.light.hours, 0) + 3;
  } else if (minutes >= 240 && minutes <= 300) {
    return dbCount.data.lightoff.output.reduce((a, b) => a + b.light.hours, 0) + 4;
  } else {
    return dbCount.data.lightoff.output.reduce((a, b) => a + b.light.hours, 0);
  }
};

if (diff) {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  dbCount.data.totalToday = [
    ...dbCount.data.totalToday,
    {
      date: new Date().toLocaleString('uk-UA', {
        month: 'long',
        day: 'numeric',
      }),
      lightoff: {
        hours: countHoursOff(),
        minutes: dbCount.data.lighton.output.reduce((a, b) => a + b.lightoff.minutes, 0) % 60,
      },
      lighton: {
        hours: countHoursOn(),
        minutes: dbCount.data.lightoff.output.reduce((a, b) => a + b.light.minutes, 0) % 60,
      },
    },
  ];

  await dbCount.write();
}

if (new Date().getHours() === 23 && new Date().getMinutes() === 59) {
  dbCount.data.total = [
    ...dbCount.data.total,
    {
      date: new Date().toLocaleString('uk-UA', {
        month: 'long',
        day: 'numeric',
      }),
      lightoff: {
        hours: countHoursOff(),
        minutes: dbCount.data.lighton.output.reduce((a, b) => a + b.lightoff.minutes, 0) % 60,
      },
      lighton: {
        hours: countHoursOn(),
        minutes: dbCount.data.lightoff.output.reduce((a, b) => a + b.light.minutes, 0) % 60,
      },
    },
  ];
  await dbCount.write();

  console.log('Resetting data...');
  dbCount.data.lightoff.lightoffTime = [new Date().getTime()];
  dbCount.data.lighton.lightonTime = [new Date().getTime()];
  dbCount.data.lightoff.output = [];
  dbCount.data.lighton.output = [];
}

console.log(
  `Counting hours... ${new Date().toLocaleString('uk-UA', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })}`,
);

await dbCount.write();
