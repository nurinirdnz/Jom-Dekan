import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/config/env';
import { logger } from '../utils/logger';

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
}

// Built lazily (not at module load) so tests and EMAIL_PROVIDER=console
// setups never need real SMTP credentials to exist.
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.email.smtp.host,
      port: env.email.smtp.port,
      secure: env.email.smtp.port === 465,
      auth: { user: env.email.smtp.user, pass: env.email.smtp.password },
    });
  }
  return transporter;
}

/**
 * EMAIL_PROVIDER=console logs the message instead of sending it, so
 * password-reset/verification links are readable in the backend
 * terminal during local development. EMAIL_PROVIDER=smtp sends for
 * real via any SMTP server (Gmail included) using the SMTP_* env vars.
 */
export const emailService = {
  async sendEmail(params: SendEmailParams): Promise<void> {
    if (env.email.provider === 'console') {
      logger.info({ to: params.to, subject: params.subject, text: params.text }, 'Email (console provider)');
      return;
    }

    if (env.email.provider === 'smtp') {
      await getTransporter().sendMail({
        from: env.email.from,
        to: params.to,
        subject: params.subject,
        text: params.text,
      });
      logger.info({ to: params.to, subject: params.subject }, 'Email sent (smtp provider)');
      return;
    }

    throw new Error(`Email provider "${env.email.provider as string}" is not implemented yet.`);
  },
};
