# Distance Matrix Backend Fix — Documentation

## The Problem

### What's happening
The shipping fee shows "Calculating..." forever and never resolves.

### Root cause
`shippingHelpers.ts` calls the Google Distance Matrix API directly from the
browser using `fetch`. Google **blocks this with CORS** — browser-to-Google
Distance Matrix requests are not allowed. The fetch either hangs or fails
silently, so `calculatingShipping` state in `Checkout.tsx` never gets set
back to `false`.

```
Browser → fetch("maps.googleapis.com/distancematrix") → ❌ CORS blocked
```

### Why Distance Matrix can't be called from the browser
Google intentionally restricts the Distance Matrix JSON API to server-side
calls only. The Maps JavaScript API (for the map UI) works in the browser,
but the Distance Matrix REST API does not. This also keeps your API key
secure — it never gets exposed in network requests visible to users.

---

## The Solution

Move the Distance Matrix API call to a small Express backend. The frontend
sends the customer's coordinates, the backend calls Google, and returns the
fee.

```
Browser → POST /api/shipping/calculate { lat, lng }
              ↓
        Express server → Google Distance Matrix API (server-side, no CORS)
              ↓
        Returns { distanceKm, shippingFee }
              ↓
Browser ← displays fee ✅
```

---

## Files That Need to Change

### New files to create

| File | Purpose |
|---|---|
| `server/index.ts` | Express app entry point |
| `server/routes/shipping.ts` | `/api/shipping/calculate` route |
| `server/.env` | Server-side env vars (Google API key) |
| `server/package.json` | Server dependencies |
| `server/tsconfig.json` | TypeScript config for server |

### Existing files to update

| File | What changes |
|---|---|
| `src/shared/utils/shippingHelpers.ts` | Replace `fetch` to Google with `fetch` to your own backend |
| `vite.config.ts` | Add proxy so `/api` calls go to Express in dev |

---

## Step-by-Step Implementation

### Step 1 — Create server folder structure

```
server/
├── index.ts
├── routes/
│   └── shipping.ts
├── .env
├── package.json
└── tsconfig.json
```

---

### Step 2 — `server/package.json`

```json
{
  "name": "web-bolt-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch index.ts",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.5.3"
  }
}
```

Install with:
```bash
cd server && npm install
```

---

### Step 3 — `server/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "outDir": "dist"
  }
}
```

---

### Step 4 — `server/.env`

```
GOOGLE_MAPS_KEY=your_api_key_here
PORT=3001
```

> This is separate from the frontend `.env`. The key here is never exposed
> to the browser.

---

### Step 5 — `server/routes/shipping.ts`

This is the route that calls Google Distance Matrix API server-side.

```ts
import { Router, Request, Response } from 'express';

const router = Router();

const STORE = { lat: 28.2122217, lng: 83.9745762 }; // your store coords
const BASE_FEE = 2.99;
const RATE_PER_KM = 0.50;
const MAX_FEE = 15.00;

router.get('/calculate', async (req: Request, res: Response) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  const key = process.env.GOOGLE_MAPS_KEY;
  const origin = `${STORE.lat},${STORE.lng}`;
  const destination = `${lat},${lng}`;

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${key}`
  );

  const data = await response.json();
  const element = data.rows?.[0]?.elements?.[0];

  if (!element || element.status !== 'OK') {
    return res.json({ distanceKm: 0, shippingFee: BASE_FEE });
  }

  const km = element.distance.value / 1000;
  const shippingFee = parseFloat(Math.min(BASE_FEE + km * RATE_PER_KM, MAX_FEE).toFixed(2));

  res.json({ distanceKm: parseFloat(km.toFixed(2)), shippingFee });
});

export default router;
```

---

### Step 6 — `server/index.ts`

```ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import shippingRouter from './routes/shipping.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' })); // vite dev server
app.use(express.json());

app.use('/api/shipping', shippingRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

### Step 7 — `vite.config.ts` (proxy setup)

So frontend `/api` calls go to Express during development:

```ts
// find your existing vite.config.ts and add the server.proxy block
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
```

---

### Step 8 — Update `src/shared/utils/shippingHelpers.ts`

Replace the Google fetch with a call to your own backend:

```ts
export async function calculateShipping(customerLat: number, customerLng: number): Promise<number> {
  const BASE_FEE = 2.99;
  try {
    const res = await fetch(`/api/shipping/calculate?lat=${customerLat}&lng=${customerLng}`);
    const data = await res.json();
    return data.shippingFee ?? BASE_FEE;
  } catch {
    return BASE_FEE; // fallback if server is down
  }
}
```

---

## Running Both Together

In development you need two terminals:

```bash
# Terminal 1 — frontend
npm run dev

# Terminal 2 — backend
cd server && npm run dev
```

The Vite proxy handles routing `/api` calls to Express automatically,
so the frontend code doesn't need to know the server port.

---

## Summary of Changes

| What | Why |
|---|---|
| New Express server | Calls Distance Matrix API server-side (no CORS) |
| `server/.env` | Keeps Google API key off the browser |
| `shippingHelpers.ts` | Now calls `/api/shipping/calculate` instead of Google directly |
| `vite.config.ts` | Proxies `/api` to Express in dev so no hardcoded ports |
