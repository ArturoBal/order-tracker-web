# Order Tracker API — Frontend Contract

Base URL: `http://localhost:3000` (configurable via the `PORT` environment variable)

All requests and responses are JSON (`Content-Type: application/json`).

---

## Authentication

The API uses **JWT Bearer tokens**. Protected endpoints require an `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Flow

```
1. POST /auth  →  receive { access_token }
2. Store the token (localStorage, memory, etc.)
3. Send the token in every request to a protected endpoint
```

### Protected endpoints

| Endpoint | Token required | Role required |
| --- | --- | --- |
| `POST /auth` | No | — |
| `POST /users` | **Yes** | **admin** |
| `GET /users` | No | — |
| `GET /users/:id` | No | — |
| `PATCH /users/:id` | **Yes** | **admin** |
| `DELETE /users/:id` | **Yes** | **admin** |
| `POST /orders` | **Yes** | any |
| `GET /orders` | **Yes** | any |
| `GET /orders/:id` | **Yes** | any |
| `PATCH /orders/:id` | **Yes** | any |
| `DELETE /orders/:id` | **Yes** | any |

### Token expiry

Tokens expire after **7 days**. When a request returns `401`, the front end should redirect the user to the login screen and clear the stored token.

---

## Validation

The backend uses a global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`:

- Any field not defined in the corresponding DTO causes a **400 Bad Request**.
- Defined fields are validated according to the rules below.

---

## Types

```typescript
type OrderStatus = 'Pending' | 'Paid' | 'Shipped';
type UserRole   = 'user' | 'admin';

interface AuthResponse {
  access_token: string;
}

interface User {
  id: string;         // UUID
  name: string;
  email: string;
  role: UserRole;     // default: 'user'
}

interface Order {
  id: string;          // UUID
  customerName: string;
  item: string;
  quantity: number;    // integer between 1 and 1000
  price: number;       // > 0 and <= 100000, up to 2 decimals
  status: OrderStatus; // default: 'Pending'
}

// Body to create a user
interface CreateUserDto {
  name: string;       // required, min 2 characters
  email: string;      // required, valid email
  password: string;   // required, min 6 characters
  role?: UserRole;    // optional, default 'user'
}

// Body to create an order
interface CreateOrderDto {
  customerName: string; // required, 3 to 40 characters
  item: string;         // required, 3 to 20 characters
  quantity: number;     // required, between 1 and 1000
  price: number;        // required, > 0 and <= 100000
  status?: OrderStatus; // optional, default 'Pending'
}

// Body to update an order (all fields optional)
type UpdateOrderDto = Partial<CreateOrderDto>;
```

---

## Errors

Standard error format (NestJS default filter):

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
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
| 401 | Missing token, invalid token, expired token, or wrong credentials |
| 403 | Valid token but the user's role is not `admin` |
| 404 | No resource exists with the given `id` |
| 409 | Email already registered |

---

## Auth Endpoints

### `POST /auth` — Login

No authentication required.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

| Field | Type | Rules |
| --- | --- | --- |
| `email` | string | required, valid email |
| `password` | string | required, min 6 characters |

**Response** — `200 OK`:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**

- `401 Unauthorized` — email not found or password incorrect (same message for both to avoid user enumeration)

---

## User Endpoints

### `POST /users` — Create a user

**Requires token + `admin` role.**

**Body:**

```json
{
  "name": "Juan Perez",
  "email": "juan@example.com",
  "password": "secret123",
  "role": "user"
}
```

| Field | Type | Rules |
| --- | --- | --- |
| `name` | string | required, min 2 characters |
| `email` | string | required, valid email |
| `password` | string | required, min 6 characters |
| `role` | string | optional, `'user'` or `'admin'`, default `'user'` |

**Response** — `201 Created` (password is never returned):

```json
{
  "id": "a1b2c3d4-1234-5678-abcd-ef1234567890",
  "name": "Juan Perez",
  "email": "juan@example.com",
  "role": "user"
}
```

**Errors:**

- `401 Unauthorized` — missing or invalid token
- `403 Forbidden` — token is valid but the user is not `admin`
- `409 Conflict` — email already registered

---

### `GET /users` — List all users

No authentication required.

**Response** — `200 OK`:

```json
[
  {
    "id": "a1b2c3d4-1234-5678-abcd-ef1234567890",
    "name": "Juan Perez",
    "email": "juan@example.com",
    "role": "user"
  }
]
```

---

### `GET /users/:id` — Get a user by id

No authentication required.

**Response** — `200 OK`: single user object (same shape as above).

- `404 Not Found` if no user exists with that `id`.

---

### `PATCH /users/:id` — Update a user

**Requires token + `admin` role.**

**Body** (all fields optional — send only the ones that change):

```json
{
  "name": "Juan Updated"
}
```

**Response** — `200 OK`: the full updated user object.

---

### `DELETE /users/:id` — Delete a user

**Requires token + `admin` role.**

**Response** — `200 OK`, no body.

---

## Order Endpoints

All order endpoints **require a valid token** in the `Authorization` header.

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

**Response** — `200 OK`: single order object (same shape as above).

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

- `404 Not Found` if no order exists with that `id`.

---

### `DELETE /orders/:id` — Delete an order

**Response** — `200 OK`, no body.

- `404 Not Found` if no order exists with that `id`.

---

## Usage example (fetch)

```typescript
const API_URL = 'http://localhost:3000';

// --- Auth ---

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await res.json();
  const { access_token } = await res.json();
  localStorage.setItem('access_token', access_token);
  return access_token;
}

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

function logout(): void {
  localStorage.removeItem('access_token');
}

// Helper: add auth header when a token is available
function authHeaders(): HeadersInit {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

// Handle auth errors globally
async function apiFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    logout();
    window.location.href = '/login';
  }
  if (res.status === 403) {
    // Token is valid but the user lacks the required role (e.g. not admin)
    throw { statusCode: 403, message: 'Insufficient permissions', error: 'Forbidden' };
  }
  return res;
}

// --- Orders ---

async function createOrder(data: CreateOrderDto): Promise<Order> {
  const res = await apiFetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

async function getOrders(): Promise<Order[]> {
  const res = await apiFetch(`${API_URL}/orders`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

async function getOrder(id: string): Promise<Order> {
  const res = await apiFetch(`${API_URL}/orders/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const res = await apiFetch(`${API_URL}/orders/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

async function deleteOrder(id: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/orders/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
}

// --- Users ---

async function createUser(data: CreateUserDto): Promise<User> {
  const res = await apiFetch(`${API_URL}/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
```
