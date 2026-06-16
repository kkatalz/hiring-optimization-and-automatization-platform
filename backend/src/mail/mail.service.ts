import { Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

export interface MailPayload {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private initialized = false;

  async send(payload: MailPayload): Promise<void> {
    if (!this.initialized) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
      this.initialized = true;
    }

    try {
      await sgMail.send({
        to: payload.to,
        from: process.env.SENDGRID_FROM_EMAIL!,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email "${payload.subject}"`,
        error instanceof Error ? (error.stack ?? error.message) : String(error),
      );
    }
  }
}
