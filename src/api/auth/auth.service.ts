import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
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
    if (!user)
      throw new NotFoundException(
        `User with email ${authPayload.email} not found`,
      );

    // Check if the provided password matches the user's password
    const isPasswordMatched = await bcrypt.compare(
      authPayload.password,
      user.password,
    );
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Remove sensitive information from user object
    const { _id, firstName, lastName } = user;

    // Generate JWT payload
    const payload = this.generateJwtPayload(_id, firstName, lastName);

    // Generate and return access token
    return await this.jwtService.signAsync(payload);
  }

  async signUp(signUpDto: SignUpDto) {
    const existingUser = await this.userModel.findOne({
      email: signUpDto.email,
    });
    if (existingUser) throw new ConflictException('Email already in use.');

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

    const user = await this.userModel.findOne({
      email: email,
      verifyToken: token,
    });

    if (user && user.isEmailVerified)
      throw new BadRequestException('Email is already verified.');

    if (!user) throw new BadRequestException('Token is invalid or expired.');

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

  async resendVerificationEmail(email: string) {
    // find the user with email
    const user = await this.userModel.findOne({
      email: email,
    });

    if (!user) throw new NotFoundException();

    // check the user if already verified
    if (user.isEmailVerified)
      throw new BadRequestException('Email is already verified.');

    // Generate verification token
    const token = this.tokenUtil.generateEmailVerificationToken(email);

    // Send verification email
    await this.resend.sendVerificationEmail(email, token);

    return { message: 'Verification email sent.' };
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email: email });

    if (!user) throw new NotFoundException();

    const token = this.tokenUtil.generatePasswordResetToken(email);

    user.forgotPasswordToken = token;

    // Send password reset email
    await this.resend.sendPasswordResetEmail(email, token);

    // Save the token in the database
    await user.save();
    return;
  }

  async resetPassword(token: string, newPassword: string) {
    const email = this.tokenUtil.verifyPasswordResetToken(token);

    const user = await this.userModel.findOne({
      email: email,
      forgotPasswordToken: token,
    });

    if (!user) throw new BadRequestException('Token is invalid or expired.');
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash(newPassword, salt);

    // update the password
    await this.userModel.findByIdAndUpdate(user._id, {
      password: passHash,
      forgotPasswordToken: null,
    });

    return { message: 'Password changed successfully.' };
  }

  /* PRIVATE METHODS */
  private generateJwtPayload(_id: any, firstName: string, lastName: string) {
    return {
      _id,
      fullName: `${firstName} ${lastName}`,
    };
  }
}
