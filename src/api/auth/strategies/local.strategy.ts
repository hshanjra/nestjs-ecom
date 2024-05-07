import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }
  validate(username: string, password: string): Promise<any> {
    console.log('inside local strategy');
    const user = this.authService.validateUser({
      email: username,
      password: password,
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
