import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthPayloadDto, SignUpDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { Role } from './enums';
import { ResendMail } from 'src/utility/resend.util';
import { TokensUtil } from 'src/utility/tokens.util';
import { User } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Merchant } from 'src/schemas/merchant.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Merchant.name) private merchantModel: Model<Merchant>,
    private jwtService: JwtService,
    private readonly resend: ResendMail,
    private tokenUtil: TokensUtil,
  ) {}

  async validateUser(authPayload: AuthPayloadDto) {
    // Find user with the provided email
    const user = await this.userModel.findOne({ email: authPayload.email });
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
    const existingUser = await this.userModel.findOne({
      email: signUpDto.email,
    });
    if (existingUser)
      throw new HttpException('Email already in use.', HttpStatus.CONFLICT);

    // Generate verification token
    const token = this.tokenUtil.generateEmailVerificationToken(
      signUpDto.email,
    );

    const newuser = await this.userModel.create({
      ...signUpDto,
      verifyToken: token,
    });

    if (signUpDto.role === 'SELLER') {
      //merhchant profile
      const mp = await this.merchantModel.create({ user: newuser._id });
      await this.userModel.findByIdAndUpdate(newuser._id, {
        $push: { roles: Role.SELLER },
        merchant: mp._id,
      });
    }

    // Send verification email
    await this.resend.sendVerificationEmail(signUpDto.email, token);

    // Generate JWT token payload
    const payload = this.generateJwtPayload(
      newuser._id,
      newuser.roles,
      newuser.firstName,
      newuser.lastName,
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

  async verifyEmail(token: string) {
    const email = this.tokenUtil.verifyEmailVerificationToken(token);
    if (!email) throw new BadRequestException('Token is invalid or expired.');

    const user = await this.userModel.findOne({
      email: email,
    });

    if (!user) throw new BadRequestException('User does not exists.');

    if (user.isEmailVerified)
      throw new BadRequestException('Email is already verified.');

    // Verify the email
    await this.userModel.findOneAndUpdate(
      { email: email },
      {
        isEmailVerified: true,
        verifyToken: null,
      },
    );
    return { message: 'Email verified successfully.' };
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
