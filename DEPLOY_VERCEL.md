# Deploy frontend to Vercel (with env in .gitignore)

Because `src/environments/environment.ts` and `environment.prod.ts` are gitignored, the repo has no env file at build time. Use **Vercel Environment Variables** and a **pre-build script** that generates the prod env file.

## 1. Build command on Vercel

- **Build Command:** `npm run build:vercel`  
  This runs `scripts/generate-env.js` (which creates `environment.prod.ts` from env vars) then `ng build --configuration=production`.

- **Output Directory:** `dist/frontend` (match `outputPath` in `angular.json` under your project’s `build` options).

- **Install Command:** `npm install`

- **Root Directory:** If your Git repo root is the **monorepo** (parent of `frontend/`), set **Root Directory** to `frontend`. If the repo root is already the Angular app, leave Root Directory blank.

## 2. Environment variables in Vercel

In **Project → Settings → Environment Variables**, add (for **Production**, and optionally Preview):

| Name | Description |
|------|--------------|
| `NG_SUPABASE_URL` | Supabase project URL |
| `NG_SUPABASE_ANON_KEY` | Supabase anon key |
| `NG_API_URL` | Backend API base URL (e.g. `https://your-api.com` or `/api` if same origin) |
| `NG_SITE_URL` | Frontend site URL (e.g. `https://freefreelancer.com`) |
| `NG_GA_MEASUREMENT_ID` | Google Analytics (optional) |
| `NG_GOOGLE_SITE_VERIFICATION` | Google search console (optional) |
| `NG_BING_SITE_VERIFICATION` | Bing verification (optional) |
| `NG_FIREBASE_API_KEY` | Firebase config |
| `NG_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NG_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NG_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NG_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NG_FIREBASE_APP_ID` | Firebase app ID |

Values are written into `environment.prod.ts` at build time only; they are not committed to Git.

## 3. Connect Git and deploy

1. **Vercel** → **Add New** → **Project** → import your Git repo.
2. Set **Root Directory** to `frontend` if the repo root is not the Angular app.
3. Set **Build Command** to `npm run build:vercel`.
4. Set **Output Directory** to `dist/frontend` (confirm in `angular.json`).
5. Add the environment variables above.
6. Deploy.

## 4. Local / CI

- **Local:** Keep using your real `environment.prod.ts` (gitignored); you don’t need these env vars for local dev.
- **CI:** To run the same build elsewhere, set the same `NG_*` variables and run `npm run build:vercel`.
