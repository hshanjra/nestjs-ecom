export enum OrderStatus {
  ORDER_PLACED = 'ORDER_PLACED',
  ORDER_FAILED = 'ORDER_FAILED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_PENDING = 'ORDER_PENDING',
}
export enum ShippingCarrier {
  USPS = 'USPS',
  UPS = 'UPS',
  FEDEX = 'FEDEX',
  DHL = 'DHL',
}

export enum paymentResponse {
  PAYMENT_OPEN = 'PAYMENT_OPEN', //this response will be used when payment is initiated but not confirmed.
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
}
