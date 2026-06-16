import type { NewOrderInput, Order, OrderStatus } from '../types';
import { apiFetch, ApiError } from './client';

export { ApiError };

export function fetchOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/orders', undefined, true);
}

export function createOrder(input: NewOrderInput): Promise<Order> {
  return apiFetch<Order>(
    '/orders',
    { method: 'POST', body: JSON.stringify(input) },
    true,
  );
}

export function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return apiFetch<Order>(
    `/orders/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: JSON.stringify({ status }) },
    true,
  );
}
