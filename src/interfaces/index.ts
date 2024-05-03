export interface OrderItem {
  qty: number;
  price: number;
  shippingPrice: number;
  subTotal: number;
  product: {
    _id: string;
    productTitle: string;
    productSlug: string;
    productBrand: string;
    partNumber: string;
    sku: string;
  };
}

export interface IAddress {
  firstName: string;
  lastName: string;
  companyName?: string;
  phone: number;
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
