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
import { Request } from 'express';
import { Role } from './enums';
import { SellerService } from '../seller/seller.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private sellerService: SellerService,
  ) {}

  async validateUser(authPayload: AuthPayloadDto) {
    const findUser = await this.usersService.findUserWithEmail(
      authPayload.email,
    );
    if (!findUser)
      throw new HttpException(`User with ${authPayload.email} not found`, 404);

    const isPwMatched = await bcrypt.compare(
      authPayload.password,
      findUser.password,
    );
    if (!isPwMatched) throw new UnauthorizedException('Invalid credentials.');

    delete findUser.password;

    const payload = {
      _id: findUser._id,
      roles: findUser.roles,
      fullName: findUser.firstName + ' ' + findUser.lastName,
    };
    return { access_Token: await this.jwtService.signAsync(payload) };
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
      token: await this.jwtService.signAsync(payload),
    };
  }

  async me(req: Request) {
    let permissions;
    if (req.user.merchant) {
      const merchant = req.user.merchant;
      permissions = {
        registeredSeller: req.user.roles.includes(Role.SELLER),
        verifiedSeller: merchant.isVerified,
        emailVerified: req.user.isEmailVerified,
        accountStatus: req.user.status,
      };
      return permissions;
    }
    return (permissions = {
      emailVerified: req.user.isEmailVerified,
      accountStatus: req.user.status,
    });
  }
}
