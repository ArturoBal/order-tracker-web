# Order Tracker

Web application for managing and tracking orders. It allows registering new orders, viewing them in a table, and updating their status.

## Notes

### Stack choice

- **React 19 + TypeScript + Vite 7**: a fast, modern setup with HMR and a quick build pipeline, well suited for a small CRUD-style frontend.
- **React Compiler** (`babel-plugin-react-compiler`) enabled to reduce manual memoization while keeping component code simple.
- **Plain CSS** (no UI library) to keep the bundle small and have full control over the responsive table/card layout.
- **ESLint + typescript-eslint** for linting and type-aware checks.

### Key decisions

- **Validation mirrors the backend contract** (see [API.md](./API.md)): the same rules (customer name 3-40 chars, item 3-20 chars, quantity between 1 and 1000, price > 0 and <= 100000) are enforced client-side for instant feedback, while the backend remains the source of truth.
- **Centralized API client** (`src/api/ordersApi.ts`) wraps `fetch`, normalizes error responses into a single `ApiError`, and is the only place that knows about the backend's URL and response shape.
- **Optimistic status updates**: changing an order's status updates the UI immediately and rolls back if the request fails, keeping the table feeling responsive.
- **Responsive table to cards**: on screens <=640px the table reflows into stacked cards via `data-label` attributes instead of duplicating markup.
- **Environment-based configuration**: the backend URL is read from `VITE_API_BASE_URL`, so the frontend can target different environments without code changes.

### AI tools used

- **Claude Code** was used throughout the project: scaffolding the Vite + React + TypeScript setup, building the `OrderForm`, `OrderTable`, and `App` components, writing the API client and shared types, and writing the [API.md](./API.md).

### What I'd improve with more time

- Add automated tests: unit tests for validation and formatting, component tests for the form and table.
- Add edit and delete actions for orders in the UI (the API supports `PATCH` and `DELETE` beyond the status dropdown).
- Add pagination, filtering, and search to the orders list.
- Improve loading/error states (skeleton loaders, retry with backoff, toast notifications).
- Add a confirmation step before destructive actions (e.g. deleting an order or marking it `Shipped`).

## Features

- **Order list**: customer, item, quantity, price, subtotal (price × quantity), and status.
- **Order creation** via a form with field validation.
- **Status updates** (`Pending` → `Paid` → `Shipped`) directly from the table.
- **Grand total**, calculated as the sum of `price × quantity` across all orders.
- **Responsive design**: on narrow screens (≤640px) the table reflows into stacked cards.

#

# Project setup and instructions

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 7](https://vite.dev/) as bundler and dev server
- [React Compiler](https://react.dev/learn/react-compiler) enabled via `babel-plugin-react-compiler`
- ESLint with `typescript-eslint`

## Prerequisites

- Node.js 20+ and npm
- The **Order Tracker API** backend running (see [API.md](./API.md))

## Getting started

```bash
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if needed
npm run dev
```

The app will be available at `http://localhost:5173` (Vite's default port).

## Environment variables

| Variable | Description | Default value |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL of the backend (no trailing slash, no `/api` prefix) | `http://localhost:3000` |

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the dev server with HMR |
| `npm run build` | Compiles TypeScript and builds the production bundle into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint on the project |

## Project structure

```
src/
├── api/ordersApi.ts        # HTTP client for the backend (fetch/create/update)
├── components/
│   ├── OrderForm.tsx        # Form to create orders (with validation)
│   └── OrderTable.tsx       # Orders table and status updates
├── utils/format.ts          # Currency formatting
├── types.ts                  # Shared types: Order, OrderStatus, NewOrderInput
└── App.tsx                   # Root component: global state, data loading, and total
```

## Form validation

- **Customer**: 3 to 40 characters.
- **Item**: 3 to 20 characters.
- **Quantity**: integer ≥ 1 and ≤ 1000.
- **Price**: positive number ≤ 100000.

## API

This application consumes the API documented in [API.md](./API.md). The backend must be reachable at the URL configured in `VITE_API_BASE_URL`.
