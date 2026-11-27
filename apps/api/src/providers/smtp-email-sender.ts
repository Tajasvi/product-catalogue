import nodemailer from "nodemailer";
import type { EmailMessage, EmailSender } from "../ports/email-sender.js";
import type { ApiConfig } from "../config.js";

export class SmtpEmailSender implements EmailSender {
  private readonly transporter: ReturnType<typeof nodemailer.createTransport>;

  constructor(config: ApiConfig["email"]) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
    });
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail(message);
  }
}

