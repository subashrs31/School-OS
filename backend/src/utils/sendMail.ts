import fs from 'fs';
import path from 'path';
import transporter from '../config/mailConfig';
import env from '../config/appConfig';
import { MailOptions } from '../types';

const toTitleCase = (str: string): string =>
  str.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());

const loadTemplate = (templateName: string, variables: Record<string, string> = {}): string => {
  const read = (name: string): string =>
    fs.readFileSync(path.join(__dirname, 'mailTemplates', `${name}.html`), 'utf-8');
  const content = read(templateName);
  const appName = env.MAIL_FROM_NAME ?? 'App';
  const builtIn: Record<string, string> = {
    year: String(new Date().getFullYear()),
    app_name_title: toTitleCase(appName),
    app_name_upper: appName.toUpperCase(),
  };
  let html = read('layout').replace('{{content}}', content);
  Object.entries({ ...builtIn, ...variables }).forEach(([key, val]) => {
    html = html.replaceAll(`{{${key}}}`, val);
  });
  return html;
};

export const sendMail = async ({ to, subject, template, variables = {}, html, attachments }: MailOptions): Promise<unknown> => {
  if (!transporter) {
    console.warn('[Mail] Mail not configured — skipping email to:', to);
    return null;
  }
  const content = template ? loadTemplate(template, variables) : html;
  const from = `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_ADDRESS}>`;
  const mailOptions: Record<string, unknown> = { from, to, subject, html: content };
  if (attachments?.length) mailOptions.attachments = attachments;
  return transporter.sendMail(mailOptions as Parameters<typeof transporter.sendMail>[0]);
};
