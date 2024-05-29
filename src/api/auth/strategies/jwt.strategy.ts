import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/api/users/users.service';
import { User } from 'src/schemas/user.schema';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          return req.cookies['accessToken'];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: fs.readFileSync(join(process.cwd(), '.keys/public.pem')),
    });
  }
  async validate(payload: any): Promise<User> {
    const dbUser = (await this.usersService.findOne(payload._id)).populate(
      'merchant',
    );
    if (!dbUser) throw new UnauthorizedException('Unable to find user.');
    return dbUser;
  }
}
