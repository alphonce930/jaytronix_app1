# Jaytronix Store

A responsive React, TypeScript, Tailwind CSS, and Firebase storefront for phones and phone accessories.

## Local development

The app runs without Firebase in demo mode. Products persist in browser `localStorage`, and the demo admin credentials are pre-filled at `/admin/login`.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Firebase setup

1. Create a Firebase project and register a Web app.
2. Enable **Email/Password** under Authentication → Sign-in method.
3. Create Cloud Firestore and initialize Cloud Storage from the Firebase console. Confirm that a bucket is created before uploading media.
4. Copy `.env.example` to `.env.local` and add the Firebase Web app values. Set `VITE_FIREBASE_STORAGE_BUCKET` to the exact bucket name shown in Firebase Console → Storage. Firebase Web config is public by design; never add Admin SDK credentials or private keys to this frontend.
5. Create the administrator in Firebase Authentication.
6. In Firestore, create `admins/{AUTH_USER_UID}` with:

```json
{ "role": "admin" }
```

Only a trusted project owner should create or remove this role document. Client code cannot grant admin access.

7. Deploy the included Firestore and Storage rules:

```bash
firebase deploy --only firestore:rules,storage --project YOUR_FIREBASE_PROJECT_ID
```

8. Add products through the dashboard, or create documents in the `products` collection matching `src/types/product.ts`.

## Production and hosting

```bash
pnpm build
firebase deploy --only hosting --project YOUR_FIREBASE_PROJECT_ID
```

Firebase Hosting is configured to rebuild the app before deployment and rewrite client-side routes to `index.html`. Images are lazy-loaded in product grids, Cloud Storage uploads are limited to 20 MB by security rules, and the storefront loads products in one catalog request with incremental display. For very large inventories, replace the current collection query with Firestore cursor pagination.

Run `pnpm typecheck` and `pnpm build` before deploying. Keep `.env.local` private; `.env.example` is a blank configuration template and is safe to commit.
