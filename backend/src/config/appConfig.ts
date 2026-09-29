import Joi from 'joi';
import { parseExpireToMs, parseSize } from '../helpers/parse';

const envSchema = Joi.object({
  PORT: Joi.number().port().required(),
  FRONTEND_URL: Joi.string().uri().required(),
  ALLOWED_ORIGINS: Joi.string().required(),
  NODE_ENV: Joi.string().valid('local', 'dev', 'uat', 'qa', 'staging', 'prod').default('local'),

  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().port().default(3306),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').default(''),

  JWT_SECRET: Joi.string().min(16).required(),
  JWT_ALGORITHM: Joi.string().default('HS256'),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  SALT_ROUNDS: Joi.number().integer().min(10).max(15).optional(),
  ACCESS_TOKEN_EXPIRE:  Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
  REFRESH_TOKEN_EXPIRE: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
  RESET_TOKEN_EXPIRE:   Joi.alternatives().try(Joi.string(), Joi.number()).optional(),

  AUTH_BASE: Joi.string().valid('cookie', 'token').default('cookie'),

  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
  AWS_REGION: Joi.string().optional(),
  AWS_BUCKET: Joi.string().optional(),
  STORAGE_TYPE: Joi.string().optional(),
  FILE_SIZE_LIMIT: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),

  MAIL_MAILER: Joi.string().optional(),
  MAIL_HOST: Joi.string().optional(),
  MAIL_PORT: Joi.number().port().optional(),
  MAIL_USERNAME: Joi.string().optional(),
  MAIL_PASSWORD: Joi.string().optional(),
  MAIL_FROM_ADDRESS: Joi.string().email().optional(),
  MAIL_FROM_NAME: Joi.string().default('App'),
  MAIL_ENCRYPTION: Joi.string().valid('tls', 'ssl', 'none').default('tls'),

  TWILIO_ACCOUNT_SID: Joi.string().optional(),
  TWILIO_AUTH_TOKEN: Joi.string().optional(),
  TWILIO_PHONE_NUMBER: Joi.string().optional(),
  OTP_SECRET: Joi.string().min(16).optional(),
  OTP_LENGTH: Joi.number().integer().min(4).max(8).optional(),
  OTP_EXPIRY: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
  OTP_MAX_ATTEMPTS: Joi.number().integer().optional(),

  OAUTH_PROVIDERS: Joi.string().optional(),
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().optional(),
  MICROSOFT_CLIENT_ID: Joi.string().optional(),
  MICROSOFT_CLIENT_SECRET: Joi.string().optional(),
  MICROSOFT_CALLBACK_URL: Joi.string().uri().optional(),
}).unknown();

const { error, value } = envSchema.validate(process.env);

if (error) {
  console.error(`[Config] Validation error: ${error.message}`);
  process.exit(1);
}

export interface AppConfig {
  PORT: number;
  NODE_ENV: string;
  FRONTEND_URL: string;
  ALLOWED_ORIGINS: string[];
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  JWT_SECRET: string;
  JWT_ALGORITHM: string;
  JWT_REFRESH_SECRET: string;
  SALT_ROUNDS: number;
  ACCESS_TOKEN_EXPIRE:  number;
  REFRESH_TOKEN_EXPIRE: number;
  RESET_TOKEN_EXPIRE:   number;
  AUTH_BASE: 'cookie' | 'token';
  IS_LOCAL: boolean;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  AWS_BUCKET?: string;
  STORAGE_TYPE: string[];
  MAIL_MAILER?: string;
  MAIL_HOST?: string;
  MAIL_PORT?: number;
  MAIL_USERNAME?: string;
  MAIL_PASSWORD?: string;
  MAIL_FROM_ADDRESS?: string;
  MAIL_FROM_NAME: string;
  MAIL_ENCRYPTION: 'tls' | 'ssl' | 'none';
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;
  OTP_SECRET: string;
  OTP_LENGTH: number;
  OTP_EXPIRY: number;
  OTP_MAX_ATTEMPTS: number;
  OAUTH_PROVIDERS: string[];
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_CALLBACK_URL?: string;
  MICROSOFT_CLIENT_ID?: string;
  MICROSOFT_CLIENT_SECRET?: string;
  MICROSOFT_CALLBACK_URL?: string;
  LOG_TYPE: 'daily' | 'single';
  LOG_RETENTION_DAYS: number;
  FILE_SIZE_LIMIT:    number;
  FILE_UPLOAD_FOLDER: string;
}

const env: AppConfig = {
  PORT: value.PORT,
  NODE_ENV: value.NODE_ENV,
  FRONTEND_URL: (value.FRONTEND_URL as string).replace(/\/$/, ''),
  ALLOWED_ORIGINS: (value.ALLOWED_ORIGINS as string).split(',').map((o: string) => o.trim()),

  DB_HOST: value.DB_HOST,
  DB_PORT: value.DB_PORT,
  DB_NAME: value.DB_NAME,
  DB_USER: value.DB_USER,
  DB_PASSWORD: value.DB_PASSWORD,

  JWT_SECRET: value.JWT_SECRET,
  JWT_ALGORITHM: value.JWT_ALGORITHM ?? 'HS256',
  JWT_REFRESH_SECRET: value.JWT_REFRESH_SECRET,
  SALT_ROUNDS: value.SALT_ROUNDS ?? 10,
  ACCESS_TOKEN_EXPIRE:  parseExpireToMs(value.ACCESS_TOKEN_EXPIRE  ?? '20m'),
  REFRESH_TOKEN_EXPIRE: parseExpireToMs(value.REFRESH_TOKEN_EXPIRE ?? '7d'),
  RESET_TOKEN_EXPIRE:   parseExpireToMs(value.RESET_TOKEN_EXPIRE   ?? '15m'),

  AUTH_BASE: value.AUTH_BASE,
  IS_LOCAL: value.NODE_ENV === 'local',

  AWS_ACCESS_KEY_ID: value.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: value.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: value.AWS_REGION,
  AWS_BUCKET: value.AWS_BUCKET,
  STORAGE_TYPE: value.STORAGE_TYPE ? (value.STORAGE_TYPE as string).split(',').map((t: string) => t.trim()) : [],

  MAIL_MAILER: value.MAIL_MAILER,
  MAIL_HOST: value.MAIL_HOST,
  MAIL_PORT: value.MAIL_PORT,
  MAIL_USERNAME: value.MAIL_USERNAME,
  MAIL_PASSWORD: value.MAIL_PASSWORD,
  MAIL_FROM_ADDRESS: value.MAIL_FROM_ADDRESS,
  MAIL_FROM_NAME: value.MAIL_FROM_NAME,
  MAIL_ENCRYPTION: value.MAIL_ENCRYPTION,

  TWILIO_ACCOUNT_SID: value.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: value.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: value.TWILIO_PHONE_NUMBER,
  OTP_SECRET: value.OTP_SECRET ?? value.JWT_SECRET,
  OTP_LENGTH: value.OTP_LENGTH ?? 6,
  OTP_EXPIRY:      parseExpireToMs(value.OTP_EXPIRY ?? '5m'),
  OTP_MAX_ATTEMPTS: value.OTP_MAX_ATTEMPTS ?? 5,

  OAUTH_PROVIDERS: value.OAUTH_PROVIDERS ? (value.OAUTH_PROVIDERS as string).split(',').map((p: string) => p.trim()) : [],
  GOOGLE_CLIENT_ID: value.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: value.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: value.GOOGLE_CALLBACK_URL,
  MICROSOFT_CLIENT_ID: value.MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET: value.MICROSOFT_CLIENT_SECRET,
  MICROSOFT_CALLBACK_URL: value.MICROSOFT_CALLBACK_URL,

  LOG_TYPE: 'daily',
  LOG_RETENTION_DAYS: 15,
  FILE_SIZE_LIMIT:    parseSize(value.FILE_SIZE_LIMIT ?? '10mb'),
  FILE_UPLOAD_FOLDER: 'uploads',
};

export default env;
