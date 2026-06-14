import { useEffect, useMemo, useState } from 'react';
import OrderForm from './components/OrderForm';
import OrderTable from './components/OrderTable';
import { ApiError, createOrder, fetchOrders, updateOrderStatus } from './api/ordersApi';
import type { NewOrderInput, Order, OrderStatus } from './types';
import { formatCurrency } from './utils/format';
import './App.css';

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchOrders()
      .then((data) => {
        if (!cancelled) {
          setOrders(data);
          setLoadError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof ApiError ? err.message : 'Could not load orders.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const total = useMemo(() => orders.reduce((sum, order) => sum + order.price * order.quantity, 0), [orders]);

  async function handleAddOrder(input: NewOrderInput) {
    const created = await createOrder(input);
    setOrders((prev) => [...prev, created]);
  }

  async function handleStatusChange(id: string, status: OrderStatus) {
    const previousOrders = orders;
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)));
    setUpdatingOrderId(id);
    setActionError(null);

    try {
      const updated = await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((order) => (order.id === id ? updated : order)));
    } catch (err) {
      setOrders(previousOrders);
      setActionError(err instanceof ApiError ? err.message : 'Could not update the order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Order Tracker</h1>
        <div className="app__total">
          <span className="app__total-label">Total</span>
          <strong className="app__total-value">{formatCurrency(total)}</strong>
        </div>
      </header>

      <OrderForm onAddOrder={handleAddOrder} />

      {actionError && (
        <p className="form-error" role="alert">
          {actionError}
        </p>
      )}

      <section className="orders-section">
        <h2>Orders</h2>
        {loading && <p className="status-message">Loading orders...</p>}
        {loadError && (
          <div className="form-error" role="alert">
            <p>{loadError}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setLoadError(null);
                setReloadToken((token) => token + 1);
              }}
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !loadError && (
          <OrderTable orders={orders} onStatusChange={handleStatusChange} updatingOrderId={updatingOrderId} />
        )}
      </section>
    </div>
  );
}

export default App;
