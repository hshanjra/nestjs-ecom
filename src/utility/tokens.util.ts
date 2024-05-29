import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokensUtil {
  constructor(private readonly config: ConfigService) {}

  generateToken(payload: any, expiresIn: string, envKeyValue: string): string {
    return jwt.sign(payload, this.config.get<string>(envKeyValue), {
      expiresIn,
    });
  }

  generateEmailVerificationToken(email: string): string {
    return jwt.sign(
      { email },
      this.config.get<string>('JWT_EMAIL_VERIFICATION_SECRET'),
      {
        algorithm: 'RS256',
        expiresIn: '24h',
      },
    );
  }

  verifyEmailVerificationToken(token: string): string | null {
    try {
      const decoded: any = jwt.verify(
        token,
        this.config.get<string>('JWT_EMAIL_VERIFICATION_SECRET'),
      );
      return decoded.email;
    } catch (error) {
      return null;
    }
  }

  generatePasswordResetToken(email: string): string {
    return jwt.sign(
      { email },
      this.config.get<string>('JWT_PASSWORD_RESET_SECRET'),
      { expiresIn: '1h' },
    );
  }

  verifyPasswordResetToken(token: string): string | null {
    try {
      const decoded: any = jwt.verify(
        token,
        this.config.get<string>('JWT_PASSWORD_RESET_SECRET'),
      );
      return decoded.email;
    } catch (error) {
      return null;
    }
  }
}
