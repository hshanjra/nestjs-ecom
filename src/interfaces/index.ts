import { Product } from 'src/schemas/product.schema';

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  tax: number;
  productId: Product;
}

export interface IAddress {
  firstName: string;
  lastName: string;
  phone: number;
  companyName?: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ITrackingInfo {
  trackingNumber: number;
  shippingCarrier: string;
  shippedDate: Date;
}

export interface IPaymentResponse {
  txnId: string;
  status: string;
}

export interface IProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface ICompatibility {
  vehicleMake: string;
  vehicleModel: string[];
  vehicleSubmodel: string[];
  vehicleEngine: string[];
  vehicleYear: number[];
}

export interface ProductImage {
  url: string;
  alt: string;
}
