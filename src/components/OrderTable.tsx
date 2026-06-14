import { ORDER_STATUSES } from '../types';
import type { Order, OrderStatus } from '../types';
import { formatCurrency } from '../utils/format';

interface OrderTableProps {
  orders: Order[];
  onStatusChange: (id: string, status: OrderStatus) => void;
  updatingOrderId: string | null;
}

export default function OrderTable({ orders, onStatusChange, updatingOrderId }: OrderTableProps) {
  if (orders.length === 0) {
    return <p className="empty-state">No orders yet. Add your first order above.</p>;
  }

  return (
    <div className="order-table-wrapper">
      <table className="order-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Subtotal</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td data-label="Customer">{order.customerName}</td>
              <td data-label="Item">{order.item}</td>
              <td data-label="Quantity">{order.quantity}</td>
              <td data-label="Price">{formatCurrency(order.price)}</td>
              <td data-label="Subtotal">{formatCurrency(order.price * order.quantity)}</td>
              <td data-label="Status">
                <select
                  value={order.status}
                  disabled={updatingOrderId === order.id}
                  onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                  aria-label={`Status for ${order.customerName}'s order`}
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
