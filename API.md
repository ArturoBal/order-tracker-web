# Order Tracker API — Frontend Contract

Base URL: `http://localhost:3000` (configurable via the `PORT` environment variable)

All requests and responses are JSON (`Content-Type: application/json`).

## Validation

The backend uses a global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`:

- Any field not defined in the corresponding DTO causes a **400 Bad Request**.
- Defined fields are validated according to the rules below.

## Types

```typescript
type OrderStatus = 'Pending' | 'Paid' | 'Shipped';

interface Order {
  id: string;          // UUID
  customerName: string;
  item: string;
  quantity: number;     // integer between 1 and 1000
  price: number;        // > 0 and <= 100000, up to 2 decimals
  status: OrderStatus;  // default: 'Pending'
}

// Body to create an order
interface CreateOrderDto {
  customerName: string;  // required, 3 to 40 characters
  item: string;          // required, 3 to 20 characters
  quantity: number;       // required, between 1 and 1000
  price: number;          // required, > 0 and <= 100000
  status?: OrderStatus;   // optional, default 'Pending'
}

// Body to update an order (all fields optional)
type UpdateOrderDto = Partial<CreateOrderDto>;
```

## Errors

Standard error format (NestJS default filter):

```json
{
  "statusCode": 400,
  "message": "Order #<id> not found",
  "error": "Not Found"
}
```

For **body** validation errors, `message` is an array of strings, one per issue:

```json
{
  "statusCode": 400,
  "message": [
    "status must be one of the following values: Pending, Paid, Shipped"
  ],
  "error": "Bad Request"
}
```

If `:id` is not a valid UUID, `message` is a string:

```json
{
  "statusCode": 400,
  "message": "Validation failed (uuid is expected)",
  "error": "Bad Request"
}
```

| statusCode | When it occurs |
| --- | --- |
| 400 | Invalid body, extra field not allowed, or `:id` is not a valid UUID |
| 404 | No order exists with the given `id` |

---

## Endpoints

### `POST /orders` — Create an order

**Body** (`CreateOrderDto`):

```json
{
  "customerName": "Juan Perez",
  "item": "Laptop",
  "quantity": 1,
  "price": 1200.50,
  "status": "Pending"
}
```

> `status` is optional; if omitted, it is saved as `"Pending"`.

**Response** — `201 Created`:

```json
{
  "id": "3f1b1e2a-1234-4a5b-9c6d-7e8f9a0b1c2d",
  "customerName": "Juan Perez",
  "item": "Laptop",
  "quantity": 1,
  "price": 1200.5,
  "status": "Pending"
}
```

---

### `GET /orders` — List all orders

**Response** — `200 OK`:

```json
[
  {
    "id": "3f1b1e2a-1234-4a5b-9c6d-7e8f9a0b1c2d",
    "customerName": "Juan Perez",
    "item": "Laptop",
    "quantity": 1,
    "price": 1200.5,
    "status": "Pending"
  }
]
```

---

### `GET /orders/:id` — Get an order by id

- `:id` must be a valid UUID (otherwise, `400 Bad Request`).

**Response** — `200 OK`:

```json
{
  "id": "3f1b1e2a-1234-4a5b-9c6d-7e8f9a0b1c2d",
  "customerName": "Juan Perez",
  "item": "Laptop",
  "quantity": 1,
  "price": 1200.5,
  "status": "Pending"
}
```

- `404 Not Found` if no order exists with that `id`.

---

### `PATCH /orders/:id` — Update an order

**Body** (`UpdateOrderDto`, all fields optional — send only the ones that change):

```json
{
  "status": "Shipped"
}
```

**Response** — `200 OK`: the full updated order.

```json
{
  "id": "3f1b1e2a-1234-4a5b-9c6d-7e8f9a0b1c2d",
  "customerName": "Juan Perez",
  "item": "Laptop",
  "quantity": 1,
  "price": 1200.5,
  "status": "Shipped"
}
```

- `404 Not Found` if no order exists with that `id`.

---

### `DELETE /orders/:id` — Delete an order

**Response** — `200 OK`, no body.

- `404 Not Found` if no order exists with that `id`.

---

## Usage example (fetch)

```typescript
const API_URL = 'http://localhost:3000';

// Create order
async function createOrder(data: CreateOrderDto): Promise<Order> {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// List orders
async function getOrders(): Promise<Order[]> {
  const res = await fetch(`${API_URL}/orders`);
  return res.json();
}

// Get an order
async function getOrder(id: string): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}`);
  if (!res.ok) throw await res.json();
  return res.json();
}

// Update an order's status
async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// Delete an order
async function deleteOrder(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
  if (!res.ok) throw await res.json();
}
```
