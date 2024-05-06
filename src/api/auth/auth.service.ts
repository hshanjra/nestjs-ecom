import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthPayloadDto, SignUpDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(authPayload: AuthPayloadDto) {
    const findUser = await this.usersService.findUserWithEmail(
      authPayload.email,
    );
    if (!findUser)
      throw new HttpException(`User with ${authPayload.email} not found`, 404);

    const isPwMatched = bcrypt.compare(authPayload.password, findUser.password);
    if (!isPwMatched) throw new UnauthorizedException('Invalid credentials.');

    delete findUser.password;

    return findUser;
  }

  async signUp(singUpDto: SignUpDto) {
    const existingUser = await this.usersService.findUserWithEmail(
      singUpDto.email,
    );
    if (existingUser)
      throw new HttpException(
        'Email already in use.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    // existingUser = await this.usersService.findUserWithPhone(singUpDto.phone);
    // if (existingUser)
    //   throw new HttpException('User already exists with this phone.', 409);

    const user = await this.usersService.create(singUpDto);
    const payload = {
      _id: user._id,
      roles: user.roles,
      fullName: user.firstName + ' ' + user.lastName,
    };

    return {
      fullName: user.firstName + ' ' + user.lastName,
      token: await this.jwtService.signAsync(payload),
    };
  }
}
