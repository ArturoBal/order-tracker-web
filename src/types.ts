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

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export type UpdateUserDto = Partial<Pick<CreateUserDto, 'name' | 'email' | 'role'>>;
