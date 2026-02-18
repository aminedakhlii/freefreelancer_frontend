/**
 * Generates environment.prod.ts from environment variables (e.g. on Vercel).
 * Run before ng build so the prod env file exists without committing secrets.
 *
 * Required env vars (set in Vercel → Settings → Environment Variables):
 *   NG_SUPABASE_URL, NG_SUPABASE_ANON_KEY, NG_API_URL, NG_SITE_URL
 *   NG_GA_MEASUREMENT_ID, NG_GOOGLE_SITE_VERIFICATION, NG_BING_SITE_VERIFICATION
 *   NG_FIREBASE_API_KEY, NG_FIREBASE_AUTH_DOMAIN, NG_FIREBASE_PROJECT_ID,
 *   NG_FIREBASE_STORAGE_BUCKET, NG_FIREBASE_MESSAGING_SENDER_ID, NG_FIREBASE_APP_ID
 */

const fs = require('fs');
const path = require('path');

const env = (key, def = '') => process.env[key] ?? def;

const content = `export const environment = {
  production: true,
  supabaseUrl: '${env('NG_SUPABASE_URL')}',
  supabaseAnonKey: '${env('NG_SUPABASE_ANON_KEY')}',
  apiUrl: '${env('NG_API_URL', '/api')}',
  siteUrl: '${env('NG_SITE_URL')}',
  gaMeasurementId: '${env('NG_GA_MEASUREMENT_ID')}',
  googleSiteVerification: '${env('NG_GOOGLE_SITE_VERIFICATION')}',
  bingSiteVerification: '${env('NG_BING_SITE_VERIFICATION')}',
  firebase: {
    apiKey: "${env('NG_FIREBASE_API_KEY')}",
    authDomain: "${env('NG_FIREBASE_AUTH_DOMAIN')}",
    projectId: "${env('NG_FIREBASE_PROJECT_ID')}",
    storageBucket: "${env('NG_FIREBASE_STORAGE_BUCKET')}",
    messagingSenderId: "${env('NG_FIREBASE_MESSAGING_SENDER_ID')}",
    appId: "${env('NG_FIREBASE_APP_ID')}"
  },
};
`;

const dir = path.join(__dirname, '..', 'src', 'environments');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'environment.prod.ts'), content, 'utf8');
fs.writeFileSync(path.join(dir, 'environment.ts'), content, 'utf8');
console.log('Generated environment.ts and environment.prod.ts');
