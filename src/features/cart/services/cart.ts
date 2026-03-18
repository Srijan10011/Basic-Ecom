import { supabase } from '../../../lib/supabaseClient';

export interface UiCartItem {
  id: number; // product id
  name: string;
  price: number;
  image: string;
  quantity: number;
  stockquantity: number;
}

// Lightweight auth-aware retry to handle cases where the user navigates away
// and comes back with an expired/rehydrating access token. We refresh once
// on specific auth errors, then retry the operation.
function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  let timeoutId: any;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`[Cart] ${label} timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise as any, timeout]).then((result) => {
    clearTimeout(timeoutId);
    return result as T;
  });
}

async function withAuthRetry<T>(operation: () => PromiseLike<T>, label: string = 'db call'): Promise<T> {
  const execOnce = async (): Promise<T> => await withTimeout(operation(), 15000, label);
  try {
    const result: any = await execOnce();
    // Handle Supabase-style responses that return { data, error }
    const maybeError = result?.error;
    if (maybeError) {
      const message = String(maybeError?.message || '');
      const code = String(maybeError?.code || '');
      const isAuthError =
        message.includes('JWT') ||
        message.includes('Not authenticated') ||
        message.includes('invalid signature') ||
        code === 'PGRST301' ||
        code === 'PGRST302' ||
        code === '401' ||
        code === '403';
      if (isAuthError) {
        console.warn(`[Cart] Auth likely stale (response error) during ${label}. Refreshing session and retrying once`);
        try {
          await supabase.auth.refreshSession();
        } catch {
          // ignore
        }
        return (await execOnce()) as any;
      }
    }
    return result;
  } catch (error: any) {
    const message = String(error?.message || '');
    const code = String((error as any)?.code || '');
    const isAuthError =
      message.includes('JWT') ||
      message.includes('Not authenticated') ||
      message.includes('invalid signature') ||
      code === 'PGRST301' || // JWT expired
      code === 'PGRST302';   // JWT invalid

    if (isAuthError) {
      console.warn(`[Cart] Auth likely stale (exception) during ${label}. Refreshing session and retrying once`);
      try {
        await supabase.auth.refreshSession();
      } catch {
        // ignore
      }
      return await execOnce();
    }
    throw error;
  }
}

// ============ Guest cart (localStorage) ============
const GUEST_CART_KEY = 'guest-cart-items';

export function loadGuestCart(): UiCartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as UiCartItem[];
  } catch {
    return [];
  }
}

export function saveGuestCart(items: UiCartItem[]): void {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // no-op
  }
}

export function clearGuestCart(): void {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    // no-op
  }
}

// ============ User cart (Supabase) ============

export async function fetchUserCart(userId: string): Promise<UiCartItem[]> {
  const cartRes: any = await withAuthRetry(() =>
    supabase
      .from('cart_items')
      .select(`
        product_id,
        quantity,
        products:product_id (
          id,
          name,
          price,
          image,
          stockquantity
        )
      `)
      .eq('user_id', userId)
    , 'fetchUserCart/select');
  const { data: rows, error: cartError } = cartRes;

  if (cartError || !rows || rows.length === 0) {
    return [];
  }

  const items: UiCartItem[] = rows.map((r: any) => {
    const p = r.products || {};
    return {
      id: r.product_id,
      name: p.name || '',
      price: Number(p.price) || 0,
      image: p.image || '',
      quantity: r.quantity || 1,
      stockquantity: p.stockquantity || 0,

    } as UiCartItem;
  });
  return items;
}

export async function addItemToUserCart(_userId: string, productId: number, quantityDelta: number = 1): Promise<void> {
  const payload = { p_product_id: productId, p_qty: Math.max(1, quantityDelta) };
  const rpcRes: any = await withAuthRetry(() => supabase.rpc('add_to_cart', payload), 'rpc add_to_cart');
  const { data, error } = rpcRes;
  if (error) {
    throw error;
  }
}

export async function setItemQuantityInUserCart(userId: string, productId: number, quantity: number): Promise<void> {
  if (quantity <= 0) {
    await removeItemFromUserCart(userId, productId);
    return;
  }
  const upsertRes: any = await withAuthRetry(() =>
    supabase
      .from('cart_items')
      .upsert({ user_id: userId, product_id: productId, quantity }, { onConflict: 'user_id,product_id' })
    , 'upsert cart_items');
  const { data, error } = upsertRes;
  if (error) {
    throw error;
  }
}

export async function removeItemFromUserCart(userId: string, productId: number): Promise<void> {
  const delRes: any = await withAuthRetry(() =>
    supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
    , 'delete cart_items one');
  const { data, error } = delRes;
  if (error) {
    throw error;
  }
}

export async function clearUserCart(userId: string): Promise<void> {
  const clearRes: any = await withAuthRetry(() =>
    supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
    , 'clear cart_items');
  const { data, error } = clearRes;
  if (error) {
    throw error;
  }
}


