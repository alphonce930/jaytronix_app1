# Jaytronix Store

A responsive React, TypeScript, and Tailwind CSS storefront. Firebase Authentication handles administrator sign-in; Supabase Postgres and Storage hold the catalog and product media.

## Local development

The app runs without cloud configuration in demo mode. Products persist in browser `localStorage`, and demo admin credentials are pre-filled at `/admin/login`.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Firebase Authentication and Supabase setup

1. Create a Firebase project, register a Web app, and enable **Email/Password** under Authentication → Sign-in method.
2. Create a Supabase project and configure Firebase as a third-party authentication provider in Supabase Authentication. Use the Firebase project ID and the provider credentials requested by Supabase.
3. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor. It creates the product and admin tables, the public media bucket, and row-level security policies. Product reads are public; product writes and media uploads require an admin Firebase ID token.
4. Copy `.env.example` to `.env.local` and fill in the Firebase Web app values and Supabase project URL and anon key. Firebase web configuration and the Supabase anon key are public values protected by the configured policies. Never add Firebase Admin SDK credentials, Supabase service-role keys, or private keys to this frontend.
5. Create the administrator in Firebase Authentication, then add their Firebase UID to Supabase using the SQL Editor:

```sql
insert into public.admins (firebase_uid, role)
values ('YOUR_FIREBASE_AUTH_USER_UID', 'admin');
```

Only a trusted project owner should add or remove administrator rows. Do not grant browser clients write access to the `admins` table.
6. Add products through the dashboard. Existing Firebase/Firestore product records are not migrated automatically; import them into the Supabase `products` table before switching an existing store.

## Production and hosting

```bash
pnpm build
firebase deploy --only hosting --project YOUR_FIREBASE_PROJECT_ID
```

Firebase Hosting is configured to rebuild the app before deployment and rewrite client-side routes to `index.html`. Images are lazy-loaded in product grids; Supabase Storage uploads are limited to 20 MB by bucket configuration, and the storefront loads products in one catalog request with incremental display.

Run `pnpm typecheck` and `pnpm build` before deploying. Keep `.env.local` private; `.env.example` is a blank configuration template and is safe to commit.

### Deploying to Vercel

1. Push the existing GitHub repository to the branch you want to deploy, then import that repository in the Vercel dashboard.
2. Set the project root to the repository root. Vercel should detect Vite; use `pnpm build` as the build command and `dist` as the output directory.
3. In **Project Settings → Environment Variables**, add the `VITE_FIREBASE_*` values and `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from your local `.env.local` for the Production environment (and Preview/Development if needed). Do not add Admin SDK credentials or the Supabase service-role key.
4. Deploy. `vercel.json` rewrites client-side routes to `index.html`, so direct visits and refreshes on routes such as `/products/example` and `/admin/login` load the SPA.
5. Add the deployed Vercel domain to Firebase Authentication's authorized domains. Ensure the Supabase Firebase third-party auth provider is configured and the SQL schema and RLS policies have been applied before enabling production writes.

Subsequent pushes to the connected production branch trigger production deployments; other branches create preview deployments. Do not commit `.env.local` or enter service-account/private credentials in Vercel's frontend environment variables.
