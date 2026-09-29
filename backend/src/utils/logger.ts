import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';
import env from '../config/appConfig';

const LOG_DIR = path.join(__dirname, '../../logs');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), logFormat),
  }),
];

function purgeOldEntries(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const cutoff = new Date(Date.now() - env.LOG_RETENTION_DAYS * 86400000);
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const kept = lines.filter(line => {
    const ts = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
    return !ts || new Date(ts[1]) >= cutoff;
  });
  fs.writeFileSync(filePath, kept.join('\n'));
}

if (env.LOG_TYPE === 'daily') {
  transports.push(
    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: `${env.LOG_RETENTION_DAYS}d`,
      format: logFormat,
    }),
    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: `${env.LOG_RETENTION_DAYS}d`,
      level: 'error',
      format: logFormat,
    })
  );
} else {
  const appLog = path.join(LOG_DIR, 'app.log');
  const errorLog = path.join(LOG_DIR, 'error.log');
  purgeOldEntries(appLog);
  purgeOldEntries(errorLog);
  transports.push(
    new winston.transports.File({ dirname: LOG_DIR, filename: 'app.log', format: logFormat }),
    new winston.transports.File({ dirname: LOG_DIR, filename: 'error.log', level: 'error', format: logFormat })
  );
}

const logger = winston.createLogger({
  level: env.IS_LOCAL ? 'debug' : 'info',
  transports,
});

export default logger;
