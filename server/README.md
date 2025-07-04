# FinT Backend (server)

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Set up your environment variables in `.env`.
3. Run Prisma migrations and generate client:
   ```sh
   npx prisma migrate dev
   npx prisma generate
   ```
4. Seed the database (if needed):
   ```sh
   npx ts-node src/scripts/seed-database.ts
   ```
5. Start the server:
   ```sh
   npm run start:dev
   ```

## Directory Structure

- `src/`
  - `accounting/` — Accounting modules (controllers, services, entities, dto, processors)
  - `users/` — User and business modules
  - `scripts/` — Seed/setup scripts
  - `types/` — Custom type definitions
- `prisma/` — Prisma schema and migrations
- `assets/` — Fonts and static assets
- `dist/` — Build output (auto-generated)

## Scripts
- `npx prisma migrate dev` — Run migrations
- `npx prisma generate` — Generate Prisma Client
- `npx ts-node src/scripts/seed-database.ts` — Seed the database
- `npm run start:dev` — Start the server in development mode
- `npm run build` — Build the server
- `npm run clean` — Clean build artifacts (add this script if not present)

## Notes
- All backend code is in TypeScript.
- All scripts and seeds are in `src/scripts/`.
- Legacy JS models and routes have been removed.
- Only one `.env` file is needed in the server directory. 