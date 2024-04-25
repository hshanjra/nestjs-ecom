import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { AuthPayloadDto, SignUpDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

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
    let existingUser = null;
    existingUser = await this.usersService.findOneWithEmailOrUsername(
      singUpDto.email,
    );
    if (existingUser) throw new HttpException('User already exists.', 409);
    existingUser = await this.usersService.findUserWithPhone(singUpDto.phone);
    if (existingUser)
      throw new HttpException('User already exists with this phone.', 409);

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
