# NAVYCommerce Frontend

Frontend for NAVYCommerce, a multi-vendor e-commerce platform built with Next.js, TypeScript, and Tailwind CSS. Connects to a separate ASP.NET Core API for authentication, store management, and product operations.

## Features

- Registration, OTP verification, login, and logout.
- Role-based access for customer and seller pages.
- Public product catalog with search, category and price filters, sorting, and pagination.
- Product details with image galleries and variant selection.
- Seller store management and product creation.
- Product image management, variant pricing and stock updates, and publication controls.
- Responsive layouts for desktop and mobile.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- JWT session verification with `jose`
- ASP.NET Core API, PostgreSQL, and Azure Blob Storage / Azurite through the backend

## Getting Started

### Prerequisites

- Node.js compatible with the project's Next.js version, and npm.
- The NAVYCommerce backend running with its database migrations applied and image storage configured.

Backend setup is maintained in the [backend repository](https://github.com/fahsaaulanh/NAVYCommerce-Backend).

### Installation

From the frontend repository root:

```bash
npm install
```

Create `.env.local`:

```dotenv
BACKEND_API_URL=http://localhost:5175/api
NEXT_PUBLIC_AUTH_API_URL=http://localhost:5175/api/Auth

AUTH_JWT_SECRET=replace_with_backend_jwt_secret
AUTH_JWT_ISSUER=replace_with_backend_jwt_issuer
AUTH_JWT_AUDIENCE=replace_with_backend_jwt_audience
```

Use the same JWT values configured in the backend's `JwtSettings`. Keep `AUTH_JWT_SECRET` server-side and do not commit `.env.local`. The public auth URL must be reachable from the browser and allowed by the backend's CORS policy.

Start the development server:

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm run start
```

Configure the deployed API URLs and JWT values before building. `NEXT_PUBLIC_*` values are included in the browser build. Use HTTPS in production for the secure session cookie.

## Project Structure

| Directory | Responsibility |
| --- | --- |
| `app/` | Routes, layouts, loading states, and route handlers |
| `components/` | Shared UI, branding, and layout components |
| `features/` | Feature-specific components, API clients, actions, types, and utilities |
| `lib/` | Shared API helpers, session handling, access guards, and formatting |
| `public/` | Static assets |

## Updating Your Local Copy

```bash
git pull
npm install
npm run dev
```

Check release or commit notes for new environment variables and backend requirements. Keep the backend running while testing API-dependent features. If an environment example is provided, copy it to your local environment file rather than renaming it.

## Project Status

Active development. Authentication, stores, product management, and catalog browsing are implemented. Checkout and payment processing are not included yet.
