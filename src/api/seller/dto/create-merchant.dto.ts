export class CreateMerchantDto {
  user: any;
  bussinessName?: string;
  bussinessLicense?: string;
  bussinessLicenseExpiry?: Date;
  bussinessAddress?: Record<string, any>;
  displayName?: string;
  dispatchFreq?: number;
  merchantRating?: number;
}
