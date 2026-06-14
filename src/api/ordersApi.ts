import type { NewOrderInput, Order, OrderStatus } from '../types';

// Base URL of the Order Tracker backend, e.g. http://localhost:3000
// Configure via VITE_API_BASE_URL in .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Verifica tu conexion e intenta de nuevo.', 0);
  }

  if (!response.ok) {
    let message = response.statusText || `Error ${response.status}`;
    try {
      const data: unknown = await response.json();
      if (data && typeof data === 'object' && 'message' in data) {
        const apiMessage = (data as { message?: unknown }).message;
        if (typeof apiMessage === 'string') {
          message = apiMessage;
        } else if (Array.isArray(apiMessage)) {
          message = apiMessage.filter((item): item is string => typeof item === 'string').join(' ');
        }
      }
    } catch {
      // Response body wasn't JSON, keep the default message.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/** GET /orders - fetch all orders */
export function fetchOrders(): Promise<Order[]> {
  return request<Order[]>('/orders');
}

/** POST /orders - create a new order (status defaults to "Pending" server-side) */
export function createOrder(input: NewOrderInput): Promise<Order> {
  return request<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** PATCH /orders/:id - update an order's status */
export function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return request<Order>(`/orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
