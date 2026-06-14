# Order Tracker

Web application for managing and tracking orders. It allows registering new orders, viewing them in a table, and updating their status.

## Features

- **Order list**: customer, item, quantity, price, subtotal (price × quantity), and status.
- **Order creation** via a form with field validation.
- **Status updates** (`Pending` → `Paid` → `Shipped`) directly from the table.
- **Grand total**, calculated as the sum of `price × quantity` across all orders.
- **Responsive design**: on narrow screens (≤640px) the table reflows into stacked cards.

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
