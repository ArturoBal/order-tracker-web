export const ORDER_STATUSES = ['Pending', 'Paid', 'Shipped'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  id: string;
  customerName: string;
  item: string;
  quantity: number;
  price: number;
  status: OrderStatus;
}

export interface NewOrderInput {
  customerName: string;
  item: string;
  quantity: number;
  price: number;
}
