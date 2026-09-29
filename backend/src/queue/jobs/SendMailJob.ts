import { sendMail } from '../../utils/sendMail';
import { JobPayload } from '../../types';

interface MailJobPayload extends JobPayload {
  to: string;
  subject: string;
  template?: string;
  variables?: Record<string, string>;
  html?: string;
}

export default {
  name: 'SendMailJob',
  async handle(payload: JobPayload): Promise<void> {
    const { to, subject, template, variables, html } = payload as MailJobPayload;
    await sendMail({ to, subject, template, variables, html });
    console.log(`[SendMailJob] Mail sent to ${to}`);
  },
};
