# Google Maps Integration & Dynamic Shipping — Implementation Guide

## Overview

This document covers the full implementation of replacing Leaflet with Google Maps
and switching from a hardcoded `Rs 5.99` shipping fee to a dynamic distance-based
fee using the Google Distance Matrix API.

---

## Table of Contents

1. [Google Cloud Setup](#1-google-cloud-setup)
2. [Install & Remove Packages](#2-install--remove-packages)
3. [Environment Variables](#3-environment-variables)
4. [File Changes](#4-file-changes)
   - [MapPickerModal.tsx](#41-mappickermodaltsx)
   - [shippingHelpers.ts (new)](#42-shippinghelpersts-new)
   - [Checkout.tsx](#43-checkouttsx)
   - [orderService.ts](#44-orderservicets)
5. [How Shipping is Calculated](#5-how-shipping-is-calculated)
6. [Data Flow](#6-data-flow)
7. [Cost & Free Tier](#7-cost--free-tier)
8. [Future: Move to Backend](#8-future-move-to-backend)

---

## 1. Google Cloud Setup

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Go to **APIs & Services → Library**
4. Enable these two APIs:
   - **Maps JavaScript API** — for the map picker UI
   - **Distance Matrix API** — for road distance calculation
5. Go to **APIs & Services → Credentials**
6. Click **Create Credentials → API Key**
7. (Recommended) Restrict the key:
   - Under **Application restrictions** → HTTP referrers → add your domain
   - Under **API restrictions** → restrict to Maps JavaScript API + Distance Matrix API

---

## 2. Install & Remove Packages

```bash
# Install Google Maps React wrapper
npm install @react-google-maps/api

# Remove Leaflet (no longer needed)
npm uninstall react-leaflet leaflet
```

---

## 3. Environment Variables

Add to your `.env` file:

```
VITE_GOOGLE_MAPS_KEY=your_api_key_here
```

> Never commit your `.env` file. It's already in `.gitignore`.

---

## 4. File Changes

### 4.1 `MapPickerModal.tsx`

**Location:** `src/shared/components/MapPickerModal.tsx`

**What changes:** Full replacement of Leaflet with Google Maps.
The component props stay identical — `onClose` and `onLocationSelect(lat, lng)` —
so nothing else in the codebase needs to change for the map picker.

**Replace entire file with:**

```tsx
import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

interface MapPickerModalProps {
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER = { lat: 28.212908, lng: 83.975433 };

const MapPickerModal: React.FC<MapPickerModalProps> = ({ onClose, onLocationSelect }) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  // Try to get user's current location on open
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setPosition(DEFAULT_CENTER),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setPosition(DEFAULT_CENTER);
    }
  }, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Select Delivery Location</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl leading-none">&times;</button>
        </div>

        <div className="flex-grow relative" style={{ height: '400px' }}>
          {!isLoaded || !position ? (
            <div className="flex items-center justify-center h-full text-gray-500">Loading map...</div>
          ) : (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={position}
              zoom={13}
              onClick={handleMapClick}
            >
              <Marker position={position} />
            </GoogleMap>
          )}
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => position && onLocationSelect(position.lat, position.lng)}
            disabled={!position}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold disabled:opacity-50"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPickerModal;
```

---

### 4.2 `shippingHelpers.ts` (new)

**Location:** `src/shared/utils/shippingHelpers.ts`

**What it does:** Calls Google Distance Matrix API with the store's coordinates
and the customer's coordinates, returns the road distance in km, and calculates
the shipping fee.

```ts
const STORE = { lat: 28.212908, lng: 83.975433 }; // ← update to your store's location
const BASE_FEE = 2.99;      // flat fee in Rs
const RATE_PER_KM = 0.50;   // Rs per km
const MAX_FEE = 15.00;      // cap

export async function calculateShipping(customerLat: number, customerLng: number): Promise<number> {
  const origin = `${STORE.lat},${STORE.lng}`;
  const destination = `${customerLat},${customerLng}`;
  const key = import.meta.env.VITE_GOOGLE_MAPS_KEY;

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${key}`
  );

  const data = await res.json();
  const element = data.rows?.[0]?.elements?.[0];

  if (!element || element.status !== 'OK') {
    return BASE_FEE; // fallback if API fails
  }

  const km = element.distance.value / 1000;
  return parseFloat(Math.min(BASE_FEE + km * RATE_PER_KM, MAX_FEE).toFixed(2));
}
```

**Config values to update:**

| Constant | Description |
|---|---|
| `STORE.lat` / `STORE.lng` | Your store's GPS coordinates |
| `BASE_FEE` | Minimum shipping charge |
| `RATE_PER_KM` | How much to charge per km |
| `MAX_FEE` | Maximum shipping cap |

---

### 4.3 `Checkout.tsx`

**Location:** `src/features/cart/components/Checkout.tsx`

**What changes:** Add `shippingFee` state, call `calculateShipping` when user
confirms location, replace hardcoded `5.99` with dynamic value.

**Add state near the top of the component:**
```ts
const [shippingFee, setShippingFee] = useState<number>(2.99);
const [calculatingShipping, setCalculatingShipping] = useState(false);
```

**Update the location confirm handler** (wherever `onLocationSelect` is called):
```ts
const handleLocationSelect = async (lat: number, lng: number) => {
  const location = formatLocation(lat, lng);
  updateField('location', location);
  setShowMapModal(false);

  setCalculatingShipping(true);
  const fee = await calculateShipping(lat, lng);
  setShippingFee(fee);
  setCalculatingShipping(false);
};
```

**Replace the shipping display** (lines ~289-295):
```tsx
// Before
<p className="font-semibold">Rs 5.99</p>
<p className="text-2xl font-bold">Rs {(totalPrice + 5.99).toFixed(2)}</p>

// After
<p className="font-semibold">
  {calculatingShipping ? 'Calculating...' : `Rs ${shippingFee.toFixed(2)}`}
</p>
<p className="text-2xl font-bold">
  Rs {(totalPrice + shippingFee).toFixed(2)}
</p>
```

**Pass `shippingFee` to `createOrder`:**
```ts
// update the createOrder call to pass shippingFee
await createOrder(form, displayCart, user, form.location, shippingFee);
```

---

### 4.4 `orderService.ts`

**Location:** `src/features/cart/services/orderService.ts`

**What changes:** Accept `shippingFee` as a parameter instead of hardcoding `5.99`.

**Update function signature** (line ~64):
```ts
// Before
export const createOrder = async (
  form: CheckoutFormData,
  cart: CartItem[],
  currentUser: any,
  location: string
): Promise<OrderData>

// After
export const createOrder = async (
  form: CheckoutFormData,
  cart: CartItem[],
  currentUser: any,
  location: string,
  shippingFee: number = 2.99   // default fallback
): Promise<OrderData>
```

**Update line 71:**
```ts
// Before
const totalWithShipping = totalPrice + 5.99;

// After
const totalWithShipping = totalPrice + shippingFee;
```

Also store the fee in the order record for admin visibility:
```ts
const orderData: any = {
  // ...existing fields
  shipping_fee: shippingFee.toFixed(2),  // add this line
};
```

---

## 5. How Shipping is Calculated

```
Road distance (km) from Distance Matrix API
        ↓
fee = BASE_FEE + (km × RATE_PER_KM)
        ↓
fee = min(fee, MAX_FEE)   ← capped so it never gets unreasonable
```

**Example with defaults (BASE=2.99, RATE=0.50/km, MAX=15.00):**

| Distance | Fee |
|---|---|
| 2 km | Rs 3.99 |
| 5 km | Rs 5.49 |
| 10 km | Rs 7.99 |
| 20 km | Rs 12.99 |
| 30 km+ | Rs 15.00 (capped) |

---

## 6. Data Flow

```
User opens map picker (Google Maps loads)
        ↓
User clicks to drop pin → position state updates
        ↓
User clicks "Confirm Location"
        ↓
handleLocationSelect(lat, lng) fires
        ↓
calculateShipping(lat, lng) → Distance Matrix API
        ↓
Returns road distance in km → calculates fee
        ↓
shippingFee state updates → UI re-renders with real fee
        ↓
User places order → createOrder(..., shippingFee) called
        ↓
Order saved to DB with correct total_amount + shipping_fee
```

---

## 7. Cost & Free Tier

Google Maps Platform gives **$200 free credit every month** (resets monthly, recurring).

| API | Price | Free tier covers |
|---|---|---|
| Maps JavaScript API | $7 / 1000 loads | ~28,500 map loads/month |
| Distance Matrix API | $5 / 1000 requests | ~40,000 requests/month |

For a small/medium store, both stay well within the free tier.

**Billing alert (recommended):** Set a budget alert at $1 in Google Cloud Console
so you get notified before any charges occur.

---

## 8. Future: Move to Backend

Currently `calculateShipping` runs in the browser, which exposes the API key.
For production with high traffic or stricter security, move the Distance Matrix
call to the Express backend:

```
Frontend → POST /api/shipping/calculate { lat, lng }
Backend  → calls Distance Matrix API (key stays server-side)
Backend  → returns { distanceKm, shippingFee }
Frontend → displays fee
```

This is optional for now since the key is restricted to your domain via
Google Cloud Console API key restrictions.
