import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, SellerOrder } from 'src/schemas/order.schema';
import { OrderStatus } from './enums';
import { ICart } from 'src/interfaces/cart';
import { TaxRate } from 'src/schemas/tax-rate.schema';
import { OrderItem } from 'src/interfaces';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(TaxRate.name) private taxRateModel: Model<TaxRate>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(SellerOrder.name) private sellerOrderModel: Model<SellerOrder>,
    private productService: ProductService,
  ) {}

  /* CUSTOMER */
  async create(dto: CreateOrderDto, session: any) {
    if (!session.cart || !session.cart.items)
      throw new BadRequestException('There is nothing in the cart.');
    const cartItems: ICart = session.cart.items;
    const orderItems: OrderItem[] = [];

    for (const itemId in cartItems) {
      const cartItem = cartItems[itemId];

      // Retrieve the current product from the database to get the latest stock
      const product = await this.productService.findActiveProductById(
        cartItem.product._id,
      );

      if (!product) {
        throw new NotFoundException(
          `Product '${cartItem.product.productTitle}' not found.`,
        );
      }

      // Check if the requested quantity exceeds available stock
      if (cartItem.qty > product.productStock) {
        throw new BadRequestException(
          `Not enough stock available for item ${product.productTitle}`,
        );
      }

      const orderItem: OrderItem = {
        qty: cartItem.qty,
        price: cartItem.product.salePrice, // Assuming salePrice is the price of the product
        shippingPrice: cartItem.shippingPrice,
        subTotal: cartItem.qty * cartItem.product.salePrice,
        product: {
          _id: cartItem.product._id, // Assuming this is a string representing the ObjectId
          productTitle: cartItem.product.productTitle,
          productSlug: cartItem.product.productSlug,
          productBrand: cartItem.product.productBrand,
          partNumber: cartItem.product.partNumber,
          sku: cartItem.product.sku,
        },
      };
      orderItems.push(orderItem);
    }

    //create the order
    const order = await this.orderModel.create({
      billingAddress: dto.billingAddress,
      shippingAddress: dto.shippingAddress,
      paymentMethod: dto.paymentMethod,
      orderItems: orderItems,
      taxPrice: cartItems.tax,
      shippingPrice: cartItems.shippingPrice,
      totalQty: cartItems.totalQty,
      totalPrice: cartItems.totalAmount,
    });

    if (order) {
      //Update the product stock
      for (const itemId in order.orderItems) {
        const cartItem = order.orderItems[itemId];
        const productId = cartItem.product._id;
        const newStock = cartItem.qty - cartItem.qty;

        // Update the stock of the product
        await this.productService.updateProductStock(productId, newStock);
      }

      // clear the cart
      // session.cart = null;
    }
    return order;
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  /* SHARED */

  // Function to calculate tax for an order
  private async calcTax(
    orderTotal: number,
    stateCode: string,
  ): Promise<number> {
    // Perform a case-insensitive search for the tax rate by state code
    const taxData = await this.taxRateModel.findOne({
      stateCode: new RegExp(stateCode, 'i'),
    });

    if (!taxData) return 0;
    // Calculate taxable amount (order total before tax)
    const taxableAmount = orderTotal;

    // Calculate tax amount
    const taxAmount = (taxableAmount * taxData.taxRate) / 100;

    // Round tax amount to 2 decimal places (optional)
    const roundedTaxAmount = Math.round(taxAmount * 100) / 100;

    return roundedTaxAmount;
  }

  /* SELLER*/

  async splitOrder(orderId: string) {
    const order = await this.orderModel.findOne({
      _id: orderId,
      orderStatus: {
        $nin: [
          OrderStatus.ORDER_COMPLETED,
          OrderStatus.ORDER_FAILED,
          OrderStatus.ORDER_PENDING,
        ],
      },
    });

    if (!order) {
      console.log(
        '\nOrder is already separated into sellers or order is completed.',
      );
      return;
    }
    // Group products by seller
    const productsBySeller = this.groupProductsBySeller(order.orderItems);

    // Create separate orders for each seller
    for (const sellerId in productsBySeller) {
      const products = productsBySeller[sellerId];
      const totalPrice = this.calcTotalPrice(products);
      const sellerOrderData = {
        orderId: order._id,
        merchantId: sellerId,
        orderItems: products,
        totalPrice,
      };
      //Saving all the seller orders
      await this.sellerOrderModel.create(sellerOrderData);
    }
    return true;
  }
  /* This method takes an array of products and groups them by seller ID, returning an object where each key represents a seller ID and its corresponding value is an array of products associated with that seller. */
  private groupProductsBySeller(products: any[]): {
    [sellerId: string]: any[];
  } {
    const productsBySeller: { [sellerId: string]: any[] } = {};
    products.forEach((product) => {
      const sellerId = product.merchantId;
      if (!productsBySeller[sellerId]) {
        productsBySeller[sellerId] = [];
      }
      productsBySeller[sellerId].push(product);
    });
    return productsBySeller;
  }

  private calcTotalPrice(products: any[]): number {
    return products.reduce((total, product) => total + product.totalPrice, 0);
  }
}
