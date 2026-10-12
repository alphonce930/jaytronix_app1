# Jaytronix Store

A responsive React, TypeScript, and Tailwind CSS storefront. Supabase provides authentication, Postgres product data, and product media storage.

## Local development

1. Create a Supabase project and copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` using the project URL and publishable key from Supabase Project Settings → API.
3. Run `supabase/schema.sql` in the Supabase SQL Editor.
4. Install and start the app:

```bash
pnpm install
pnpm dev
```

The app uses the configured Supabase project for products and authentication. It does not fall back to demo or browser-local product data.

## Create an administrator

1. In Supabase Dashboard, open Authentication → Users and add a user with the admin email and password. Enable email/password sign-in in Authentication → Sign-in methods if needed.
2. Copy the user's UUID from the Users table.
3. In the Supabase SQL Editor, grant that user the admin role:

```sql
insert into public.admins (user_id, role)
values ('SUPABASE_AUTH_USER_UUID', 'admin')
on conflict (user_id) do update set role = excluded.role;
```

Only a trusted project owner should add or remove rows in `public.admins`. The dashboard does not include public signup.

## Data and storage

Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor. It creates or updates the products and admin tables, RLS policies, and public `product-media` bucket. Products can be read publicly; only admin users can modify products or upload media.

If you previously ran the earlier schema, rerun the updated script. Old administrator entries do not grant access; add each administrator's Supabase Auth UUID as described above. Import existing product data into Supabase's `products` table before using the live catalog.

## Deploying to Vercel

1. Import the GitHub repository into Vercel and select the branch to deploy. Use the repository root; Vercel should detect Vite. Set the build command to `pnpm build` and output directory to `dist`.
2. In Vercel Project Settings → Environment Variables, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for Production, and Preview if needed. Use the values from the same Supabase project where you ran the schema. Never put a Supabase secret/service-role key in frontend environment variables.
3. Deploy or redeploy after saving the variables. The [`vercel.json`](./vercel.json) rewrite supports direct visits and refreshes on app routes.

Run `pnpm typecheck` and `pnpm build` before deploying. Keep `.env.local` private; `.env.example` is safe to commit.
