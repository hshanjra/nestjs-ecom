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
    try {
      await this.resend.emails.send({
        from: this.configService.get<string>('FROM_EMAIL'),
        to: email,
        subject: 'Verify Your Email',
        html: `<a href="${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}">Verify Email</a>`,
      });
      console.log('verification email sent', email);
    } catch (error) {
      console.log(
        'Something went wrong while sending verification email',
        error,
      );
      return;
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    try {
      await this.resend.emails.send({
        from: this.configService.get<string>('FROM_EMAIL'),
        to: email,
        subject: 'Reset Your Password',
        html: `<a href="${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}">Reset Password</a>`,
      });
      console.log('password reset email sent', email);
    } catch (error) {
      console.log('Failed to send email for reset password', error);
      return;
    }
  }
}
