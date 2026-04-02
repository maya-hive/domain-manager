# Task: Authentication & Session Management

## Requirements
1. Build a custom login view (`/login`).
2. Implement backend login logic to generate a session token and store it in the Convex `sessions` table (`userId`, `token`, `expiresAt`).
3. Create middleware/loaders in TanStack Start to verify the token before rendering protected routes.
4. Build a secure backend mutation (or separate script) to bootstrap the initial `Admin` user, as the UI for adding users is locked behind Admin access.