/* Cart Blueprint */
export interface cartItem {
  product: {
    _id?: string;
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
  items: Record<string, cartItem>;
  totalQty: number;
  subTotal: number;
  tax: number;
  shippingPrice: number;
  totalAmount: number;
  stateCode: string;
}
