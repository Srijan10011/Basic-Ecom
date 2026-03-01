import { supabase } from './supabaseClient';

export interface UiCartItem {
  id: number; // product id
  name: string;
  price: number;
  image: string;
  quantity: number;
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
		console.log('[Cart][Guest] loadGuestCart: reading from localStorage');
    const raw = localStorage.getItem(GUEST_CART_KEY);
		if (!raw) {
			console.log('[Cart][Guest] loadGuestCart: no data found');
			return [];
		}
    const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) {
			console.warn('[Cart][Guest] loadGuestCart: parsed value is not an array; returning empty');
			return [];
		}
		console.log('[Cart][Guest] loadGuestCart: loaded items', parsed);
    return parsed as UiCartItem[];
  } catch {
		console.warn('[Cart][Guest] loadGuestCart: failed to parse; returning empty');
    return [];
  }
}

export function saveGuestCart(items: UiCartItem[]): void {
  try {
		console.log('[Cart][Guest] saveGuestCart: writing items', items);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // no-op
  }
}

export function clearGuestCart(): void {
  try {
		console.log('[Cart][Guest] clearGuestCart: removing key');
    localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    // no-op
  }
}

// ============ User cart (Supabase) ============

export async function fetchUserCart(userId: string): Promise<UiCartItem[]> {
	console.log('[Cart][User] fetchUserCart: start', { userId });
	// Fetch cart rows first
  const cartRes: any = await withAuthRetry(() =>
    supabase
      .from('cart_items')
      .select('product_id, quantity')
      .eq('user_id', userId)
  , 'fetchUserCart/select');
  const { data: rows, error: cartError } = cartRes;

  if (cartError || !rows || rows.length === 0) {
		if (cartError) console.error('[Cart][User] fetchUserCart: failed', cartError);
		else console.log('[Cart][User] fetchUserCart: empty');
    return [];
  }

  const productIds = Array.from(new Set(rows.map((r: any) => r.product_id)));
	console.log('[Cart][User] fetchUserCart: cart rows', rows, 'productIds', productIds);
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, price, image')
    .in('id', productIds);

  if (prodError) {
		console.error('[Cart][User] fetchUserCart: products fetch failed', prodError);
    // Fallback to minimal items if products not accessible
    return rows.map((r: any) => ({ id: r.product_id, name: '', price: 0, image: '', quantity: r.quantity })) as UiCartItem[];
  }

  const idToProduct = new Map<number, any>((products || []).map((p: any) => [p.id, p]));
  const items: UiCartItem[] = rows.map((r: any) => {
    const p = idToProduct.get(r.product_id) || {};
    return {
      id: r.product_id,
      name: p.name || '',
      price: Number(p.price) || 0,
      image: p.image || '',
      quantity: r.quantity || 1,
    } as UiCartItem;
  });
	console.log('[Cart][User] fetchUserCart: merged items', items);
  return items;
}

export async function addItemToUserCart(_userId: string, productId: number, quantityDelta: number = 1): Promise<void> {
	console.groupCollapsed('[Cart][User] addItemToUserCart');
	console.log('Input', { productId, quantityDelta, note: 'userId is enforced via RLS inside RPC' });
	// Atomic increment-upsert via RPC to avoid race conditions
	const payload = { p_product_id: productId, p_qty: Math.max(1, quantityDelta) };
	console.log('RPC call add_to_cart with', payload);
  const rpcRes: any = await withAuthRetry(() => supabase.rpc('add_to_cart', payload), 'rpc add_to_cart');
  const { data, error } = rpcRes;
  if (error) {
    // Surface error early with explicit message so UI logs do not stop silently
    console.error('[Cart][User] addItemToUserCart: RPC returned error after retry', error);
    console.groupEnd();
    throw error;
  }
	if (error) {
		console.error('[Cart][User] addItemToUserCart: RPC failed', error);
		console.groupEnd();
		throw error;
	}
	console.log('[Cart][User] addItemToUserCart: RPC success', data);

	// Verification: read back the row for this user/product
	try {
		console.log('[Cart][User] addItemToUserCart: verifying row exists for user/product', { userId: _userId, productId });
    const verifyRes: any = await withAuthRetry(() =>
      supabase
        .from('cart_items')
        .select('user_id, product_id, quantity, updated_at')
        .eq('user_id', _userId)
        .eq('product_id', productId)
        .order('updated_at', { ascending: false })
        .limit(1)
    , 'verification select');
    const { data: verifyRows, error: verifyError } = verifyRes;
		if (verifyError) {
			console.error('[Cart][User] addItemToUserCart: verification select failed', verifyError);
		} else {
			console.log('[Cart][User] addItemToUserCart: verification rows', verifyRows);
		}
	} catch (verErr) {
		console.error('[Cart][User] addItemToUserCart: verification threw', verErr);
	}
	console.groupEnd();
}

export async function setItemQuantityInUserCart(userId: string, productId: number, quantity: number): Promise<void> {
  if (quantity <= 0) {
		console.log('[Cart][User] setItemQuantityInUserCart: quantity <= 0, delegating to remove', { userId, productId, quantity });
    await removeItemFromUserCart(userId, productId);
    return;
  }
	console.log('[Cart][User] setItemQuantityInUserCart: upsert start', { userId, productId, quantity });
  const upsertRes: any = await withAuthRetry(() =>
    supabase
      .from('cart_items')
      .upsert({ user_id: userId, product_id: productId, quantity }, { onConflict: 'user_id,product_id' })
  , 'upsert cart_items');
  const { data, error } = upsertRes;
	if (error) {
		console.error('[Cart][User] setItemQuantityInUserCart: upsert failed', error);
		throw error;
	}
	console.log('[Cart][User] setItemQuantityInUserCart: upsert success', data);
}

export async function removeItemFromUserCart(userId: string, productId: number): Promise<void> {
	console.log('[Cart][User] removeItemFromUserCart: start', { userId, productId });
  const delRes: any = await withAuthRetry(() =>
    supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
  , 'delete cart_items one');
  const { data, error } = delRes;
	if (error) {
		console.error('[Cart][User] removeItemFromUserCart: delete failed', error);
		throw error;
	}
	console.log('[Cart][User] removeItemFromUserCart: delete success', data);
}

export async function clearUserCart(userId: string): Promise<void> {
	console.log('[Cart][User] clearUserCart: start', { userId });
  const clearRes: any = await withAuthRetry(() =>
    supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
  , 'clear cart_items');
  const { data, error } = clearRes;
	if (error) {
		console.error('[Cart][User] clearUserCart: delete failed', error);
		throw error;
	}
	console.log('[Cart][User] clearUserCart: delete success', data);
}


