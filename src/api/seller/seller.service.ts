import { Injectable } from '@nestjs/common';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Merchant } from 'src/schemas/merchant.schema';
import { Model } from 'mongoose';

@Injectable()
export class SellerService {
  constructor(
    @InjectModel(Merchant.name) private merchantModel: Model<Merchant>,
  ) {}

  async create(dto: CreateMerchantDto) {
    return await this.merchantModel.create(dto);
  }

  findAll() {
    return `This action returns all merchant`;
  }

  async findOne(id: any) {
    return await this.merchantModel.findOne(id);
  }

  update(id: number, updateMerchantDto: UpdateMerchantDto) {
    return `This action updates a #${id} merchant`;
  }

  remove(id: number) {
    return `This action removes a #${id} merchant`;
  }
}
