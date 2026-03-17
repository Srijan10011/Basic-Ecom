interface Env {
  GOOGLE_MAPS_KEY: string;
}

const STORE = { lat: 28.2122217, lng: 83.9745762 };
const BASE_FEE = 2.99;
const RATE_PER_KM = 0.50;
const MAX_FEE = 15.00;

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const lat = url.searchParams.get('lat');
  const lng = url.searchParams.get('lng');

  if (!lat || !lng) {
    return Response.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  const origin = `${STORE.lat},${STORE.lng}`;
  const destination = `${lat},${lng}`;
  const key = context.env.GOOGLE_MAPS_KEY;

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${key}`
    );
    const data = await res.json() as any;
    const element = data.rows?.[0]?.elements?.[0];

    if (!element || element.status !== 'OK') {
      return Response.json({ distanceKm: 0, shippingFee: BASE_FEE });
    }

    const km = element.distance.value / 1000;
    const shippingFee = parseFloat(Math.min(BASE_FEE + km * RATE_PER_KM, MAX_FEE).toFixed(2));

    return Response.json({ distanceKm: parseFloat(km.toFixed(2)), shippingFee });
  } catch {
    return Response.json({ distanceKm: 0, shippingFee: BASE_FEE });
  }
};
