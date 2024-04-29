import { Product } from 'src/schemas/product.schema';

/* Cart Blueprint */
interface cartItems {
  product: Product;
  qty: number;
}

export interface ICart {
  items: Record<string, cartItems>;
  totalQty: number;
  subTotal: number;
  tax: number;
  totalAmount: number;
}
