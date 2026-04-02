# Domain Manager

Internal IT infrastructure management dashboard for tracking domains, server hostings, clients, and system users.

## Tech Stack

- **Frontend:** [TanStack Start](https://tanstack.com/start) (React SSR) + [TanStack Router](https://tanstack.com/router)
- **Backend:** [Convex](https://convex.dev) (real-time backend-as-a-service)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) v4
- **Icons:** [Lucide React](https://lucide.dev)
- **Auth:** Custom token-based sessions (no third-party providers)

## Prerequisites

- Node.js 22+
- A Convex account and project ([convex.dev](https://convex.dev))

## Getting Started

Install dependencies:

```bash
npm install
```

Start the Convex dev server (syncs backend functions):

```bash
npx convex dev
```

In a separate terminal, start the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Production build (client + SSR + Nitro server) |
| `npm run start` | Run the production server from `.output/` |
| `npx convex dev` | Start Convex in development mode |

## Project Structure

```
├── convex/                 # Convex backend
│   ├── schema.ts           # Database schema (clients, domains, hostings, users, sessions)
│   ├── authActions.ts      # Login/register actions (Node.js runtime)
│   ├── authHelpers.ts      # Session validation, user lookup
│   ├── domains.ts          # Domain CRUD + updateExpireByName
│   ├── hostings.ts         # Hosting CRUD
│   ├── clients.ts          # Client CRUD
│   ├── users.ts            # System user CRUD
│   └── http.ts             # HTTP API endpoints for n8n integration
├── src/
│   ├── router.tsx          # TanStack Router + Convex + React Query wiring
│   ├── auth.tsx            # AuthProvider context + useAuth hook
│   ├── lib/utils.ts        # cn() utility (clsx + tailwind-merge)
│   ├── styles/globals.css  # Tailwind theme and CSS variables
│   └── routes/
│       ├── __root.tsx      # Root layout (HTML shell, providers)
│       ├── index.tsx       # Redirects / → /domains
│       ├── _auth.tsx       # Auth layout (centered, pathless)
│       ├── _auth/login.tsx # Login page
│       ├── _dashboard.tsx  # Dashboard layout (top-nav, auth guard, pathless)
│       └── _dashboard/
│           ├── domains.tsx # Domain management
│           ├── hosting.tsx # Hosting management
│           ├── clients.tsx # Client management
│           └── users.tsx   # System user management (Admin only)
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Environment Variables

Create a `.env.local` file:

```env
CONVEX_DEPLOYMENT=dev:your-deployment-slug
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site
```

These are generated automatically when you run `npx convex dev` for the first time.

## Modules

### Domains (`/domains`)
Track domain registrations and expiration dates with color-coded status indicators (expired / expiring soon / active).

### Hosting (`/hosting`)
Manage server infrastructure with specs, pricing, and payment status tracking (Paid / Unpaid / Overdue).

### Clients (`/clients`)
Maintain customer contact information (multiple emails and phone numbers per client).

### System Users (`/users`)
Admin-only module for provisioning dashboard access with role assignment (Admin / Editor).

## API Endpoints

Convex HTTP Actions secured with an API key (`x-api-key` header) for n8n automation:

- **GET** `/api/domains` -- Fetch all domains with expiration dates
- **POST** `/api/update-domain-expiry` -- Update a domain's expiration date by name
