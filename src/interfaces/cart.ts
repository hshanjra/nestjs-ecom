/* Cart Blueprint */
interface cartItems {
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
  items: Record<string, cartItems>;
  totalQty: number;
  subTotal: number;
  tax: number;
  shippingPrice: number;
  totalAmount: number;
  stateCode: string;
}
