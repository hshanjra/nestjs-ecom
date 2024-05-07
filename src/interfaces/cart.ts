import * as mongoose from 'mongoose';
/* Cart Blueprint */
export interface cartItem {
  product: {
    _id?: mongoose.Types.ObjectId;
    productTitle: string;
    productSlug: string;
    productBrand: string;
    partNumber: string;
    sku: string;
    salePrice: number;
  };
  qty: number;
  shippingPrice: number;
}

export interface ICart {
  items: Record<any, cartItem>;
  totalQty: number;
  subTotal: number;
  tax: number;
  shippingPrice: number;
  totalAmount: number;
  stateCode: string;
}
