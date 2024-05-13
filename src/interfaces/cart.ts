/* Cart Blueprint */
export interface cartItem {
  product: {
    productId?: string;
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
  totalShippingPrice: number;
  totalAmount: number;
  stateCode: string;
}
