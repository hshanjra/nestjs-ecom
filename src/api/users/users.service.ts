import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { SellerService } from '../seller/seller.service';
import { Role } from '../auth/enums';
import { SignUpDto } from '../auth/dto/auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private sellerService: SellerService,
  ) {}
  // async findOneWithEmailOrUsername(username?: string) {
  //   return await this.userModel.findOne({
  //     $or: [{ email: username }, { username: username }],
  //   });
  // }

  async findUserWithEmail(email: string) {
    return await this.userModel.findOne({
      email: email,
    });
  }

  async findUserWithPhone(phone: string) {
    return await this.userModel.findOne({
      phone: phone,
    });
  }

  // async create(dto: SignUpDto, token?: string) {
  //   // const { firstName, lastName, email, phone, role, password } = createUserDto;

  //   const newuser = await this.userModel.create({ ...dto, verifyToken: token });

  //   if (dto.role === 'SELLER') {
  //     //merhchant profile
  //     const mp = await this.sellerService.create({ user: newuser._id });
  //     await this.userModel.findByIdAndUpdate(newuser._id, {
  //       $push: { roles: Role.SELLER },
  //       merchant: mp._id,
  //     });
  //   }

  //   return newuser;
  // }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: number) {
    return await this.userModel.findById(id).select('-password');
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} users`;
  }

  remove(id: number) {
    return `This action removes a #${id} users`;
  }
}
