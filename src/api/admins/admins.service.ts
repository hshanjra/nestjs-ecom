import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { TaxRateDto } from './dto/tax-rate.dto';
import { InjectModel } from '@nestjs/mongoose';
import { TaxRate } from 'src/schemas/tax-rate.schema';
import { Model } from 'mongoose';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(TaxRate.name) private taxRateModel: Model<TaxRate>,
  ) {}

  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  findAll() {
    return `This action returns all admins`;
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }

  /* TAX */
  //TODO: create a method that accepts an .csv file and upload all the tax rates at once
  async createTaxRate(dto: TaxRateDto) {
    const existingTaxRate = await this.taxRateModel.findOne({
      stateCode: dto.stateCode,
    });

    if (existingTaxRate)
      throw new ConflictException(
        `State code '${dto.stateCode}' already exists.`,
      );
    return await this.taxRateModel.create(dto);
  }

  async getAllTaxRates() {
    return await this.taxRateModel.find({});
  }
}
