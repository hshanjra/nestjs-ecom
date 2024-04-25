import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/auth/enums';
import { SellerService } from 'src/seller/seller.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private sellerService: SellerService,
  ) {}
  async findOneWithEmailOrUsername(username?: string) {
    return await this.userModel.findOne({
      $or: [{ email: username }, { username: username }],
    });
  }

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

  async create(createUserDto: CreateUserDto) {
    // const { firstName, lastName, email, phone, role, password } = createUserDto;

    const newuser = new this.userModel({
      ...createUserDto,
    });
    await newuser.save();
    if (createUserDto.role === 'SELLER') {
      //merhchant profile
      const mp = await this.sellerService.create({ userId: newuser._id });
      await this.userModel.findByIdAndUpdate(newuser._id, {
        $push: { roles: Role.SELLER },
        merchantId: mp._id,
      });
    }
    return newuser;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} users`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} users`;
  }

  remove(id: number) {
    return `This action removes a #${id} users`;
  }
}
