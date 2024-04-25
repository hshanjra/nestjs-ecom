import {
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsString,
  MaxLength,
} from 'class-validator';

export class AddBankAccountDto {
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @IsString()
  @IsNotEmpty()
  accountHolderName: string;

  @IsNumberString()
  @MaxLength(12)
  @IsNotEmpty()
  accountNumber: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['PERSONAL', 'BUSINESS'])
  accountType: string;

  @IsNumberString()
  routingNumber: number;

  @IsString()
  @IsNotEmpty()
  bankBic: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(31)
  bankIban: string;

  @IsString()
  bankSwiftCode: string;

  @IsString()
  bankAddress: string;
}
