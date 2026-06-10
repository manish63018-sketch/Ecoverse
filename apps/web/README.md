This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 3-Level Location Isolation System (PostgreSQL Setup)

EcoVerse uses a strict 3-tier location hierarchy (State → City → Area) to isolate rescue alerts and cases. A rescue reported in a specific area (e.g. Banjara Hills, Hyderabad) will **only** notify and appear to volunteers assigned to that area.

### 1. Database Configuration
Create or update `apps/web/.env.local` with your PostgreSQL database URL:

```bash
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<database_name>"
```

### 2. Run Database Migrations & Seeds
Use the built-in package scripts from the `apps/web/` directory to manage your schema:

- **Run migrations only** (creates schema tables: states, cities, areas, ngos, rescue_cases, notifications, logs):
  ```bash
  npm run db:migrate
  ```
- **Seed initial location tree** (populates 33 states/UTs, 17 major cities, and 39 Hyderabad areas):
  ```bash
  npm run db:seed
  ```
- **Reset database** (WARNING: wipes all data, re-creates tables, and seeds location list):
  ```bash
  npm run db:reset
  ```

### 3. Verification & Isolation Flow
1. **Configure Alert Zone**: Go to `/profile` on the running web app, open **My Alert Zone**, select your state, city, and area, and click save.
2. **Report SOS**: Go to `/sos`, select your animal type, severity, and area (e.g. Banjara Hills), and submit.
3. **Check Isolation**: 
   - A volunteer logged in with a Banjara Hills zone will see this case immediately on their `/dashboard` and `/rescue` feeds.
   - A volunteer in another zone (e.g., Secunderabad or Bangalore) will see **0 active cases**, ensuring strict, leak-proof location isolation.

