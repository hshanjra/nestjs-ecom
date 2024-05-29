import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class ResendMail {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  async sendVerificationEmail(email: string, token: string) {
    await this.resend.emails.send({
      from: this.configService.get<string>('FROM_EMAIL'),
      to: email,
      subject: 'Verify Your Email',
      html: `<a href="${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}">Verify Email</a>`,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    await this.resend.emails.send({
      from: this.configService.get<string>('FROM_EMAIL'),
      to: email,
      subject: 'Reset Your Password',
      html: `<a href="${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}">Reset Password</a>`,
    });
  }
}
