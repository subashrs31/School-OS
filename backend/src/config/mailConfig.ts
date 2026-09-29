import nodemailer, { Transporter } from 'nodemailer';
import env from './appConfig';

let transporter: Transporter | null = null;

if (env.MAIL_HOST && env.MAIL_PORT) {
  const secure = env.MAIL_ENCRYPTION === 'ssl';
  transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure,
    auth: { user: env.MAIL_USERNAME, pass: env.MAIL_PASSWORD },
    ...(env.MAIL_ENCRYPTION === 'tls' && { tls: { rejectUnauthorized: false } }),
  });
}

export default transporter;
