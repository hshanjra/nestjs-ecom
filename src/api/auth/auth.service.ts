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
  ) {}

  async validateUser(authPayload: AuthPayloadDto) {
    // Find user with the provided email
    const user = await this.usersService.findUserWithEmail(authPayload.email);
    if (!user) {
      throw new HttpException(
        `User with email ${authPayload.email} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if the provided password matches the user's password
    const isPasswordMatched = await bcrypt.compare(
      authPayload.password,
      user.password,
    );
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Remove sensitive information from user object
    const { _id, roles, firstName, lastName } = user;

    // Generate JWT payload
    const payload = this.generateJwtPayload(_id, roles, firstName, lastName);

    // Generate and return access token
    return await this.jwtService.signAsync(payload);
  }

  async signUp(signUpDto: SignUpDto) {
    const existingUser = await this.usersService.findUserWithEmail(
      signUpDto.email,
    );
    if (existingUser)
      throw new HttpException('Email already in use.', HttpStatus.CONFLICT);
    // existingUser = await this.usersService.findUserWithPhone(singUpDto.phone);
    // if (existingUser)
    //   throw new HttpException('User already exists with this phone.', 409);

    // Create the user
    const newUser = await this.usersService.create(signUpDto);

    // Generate JWT token payload
    const payload = this.generateJwtPayload(
      newUser._id,
      newUser.roles,
      newUser.firstName,
      newUser.lastName,
    );

    // Sign and return JWT token
    return await this.jwtService.signAsync(payload);
  }

  async me(req: Request) {
    const permissions: any = {
      emailVerified: req.user.isEmailVerified,
      accountStatus: req.user.status,
    };

    if (req.user.merchant) {
      const merchant = req.user.merchant;
      permissions.registeredSeller = req.user.roles.includes(Role.SELLER);
      permissions.verifiedSeller = merchant.isVerified;
    }

    return permissions;
  }

  /* PRIVATE METHODS */
  private generateJwtPayload(
    _id: any,
    roles: string[],
    firstName: string,
    lastName: string,
  ) {
    return {
      _id,
      roles,
      fullName: `${firstName} ${lastName}`,
    };
  }
}
