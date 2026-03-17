import { Router, Request, Response } from 'express';

const router = Router();

const STORE = { lat: 28.2122217, lng: 83.9745762 };
const BASE_FEE = 2.99;
const RATE_PER_KM = 1;
const MAX_FEE = 15.00;

router.get('/calculate', async (req: Request, res: Response) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  const key = process.env.GOOGLE_MAPS_KEY;
  const origin = `${STORE.lat},${STORE.lng}`;
  const destination = `${lat},${lng}`;

  try {
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
  } catch {
    res.json({ distanceKm: 0, shippingFee: BASE_FEE });
  }
});

export default router;
