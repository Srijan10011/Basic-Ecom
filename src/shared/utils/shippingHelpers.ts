const BASE_FEE = 2.99;

export async function calculateShipping(customerLat: number, customerLng: number): Promise<number> {
  try {
    const res = await fetch(`/api/shipping/calculate?lat=${customerLat}&lng=${customerLng}`);
    const data = await res.json();
    return data.shippingFee ?? BASE_FEE;
  } catch {
    return BASE_FEE;
  }
}
