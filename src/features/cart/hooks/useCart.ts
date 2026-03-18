import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Session } from '@supabase/supabase-js';
import { Product, CartItem } from '../../../types';

import {
    fetchUserCart,
    addItemToUserCart,
    setItemQuantityInUserCart,
    removeItemFromUserCart,
    clearUserCart,
    loadGuestCart,
    saveGuestCart,
    clearGuestCart
} from '../services/cart';

export const useCart = (session: Session | null) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [addingToCartId, setAddingToCartId] = useState<number | null>(null);

    const refetchCart = useCallback(async (userSession?: Session | null) => {
        const activeSession = userSession || session;
        if (activeSession?.user) {
            const items = await fetchUserCart(activeSession.user.id);
            setCart(items);
        } else {
            setCart(loadGuestCart());
        }
    }, [session]);

    const addToCart = useCallback(async (product: Product) => {
        if (addingToCartId === product.id) return;

        // Check stock before adding
        const foundInCart = cart.find(i => i.id === product.id);
        const currentQtyInCart = foundInCart ? foundInCart.quantity : 0;

        if (currentQtyInCart + 1 > (product.stockquantity ?? 0)) {
            toast.error(`Cannot add more ${product.name}. You already have ${currentQtyInCart} in cart and ${product.stockquantity ?? 0} available.`, {
                duration: 3000,
                position: 'top-center',
            });
            return;
        }

        setAddingToCartId(product.id);
        try {
            if (session?.user) {
                await addItemToUserCart(session.user.id, product.id, 1);
                await refetchCart();
            } else {
                const items = [...cart];
                const found = items.find(i => i.id === product.id);
                if (found) {
                    found.quantity += 1;
                } else {
                    items.push({ ...product, quantity: 1, stockquantity: product.stockquantity ?? 0 });
                }
                saveGuestCart(items);
                setCart(items);
            }
            toast.success(`${product.name} added to cart!`, {
                duration: 2000,
                position: 'top-center',
            });
        } catch (error) {
            console.error('Failed to add to cart:', error);
            toast.error('Failed to add item to cart. Please try again.', {
                duration: 3000,
                position: 'top-center',
            });
        } finally {
            setAddingToCartId(null);
        }
    }, [session?.user, cart, addingToCartId, refetchCart]);

    const updateCartQuantity = useCallback(async (productId: number, quantity: number) => {
        try {
            if (session?.user) {
                await setItemQuantityInUserCart(session.user.id, productId, quantity);
                await refetchCart();
            } else {
                let items;
                if (quantity <= 0) {
                    items = cart.filter(i => i.id !== productId);
                } else {
                    items = cart.map(i => i.id === productId ? { ...i, quantity } : i);
                }
                saveGuestCart(items);
                setCart(items);
            }
        } catch (error) {
            console.error('Failed to update cart:', error);
            alert('Failed to update quantity. Please try again.');
        }
    }, [session?.user, cart, refetchCart]);

    const removeFromCart = useCallback(async (productId: number) => {
        try {
            if (session?.user) {
                await removeItemFromUserCart(session.user.id, productId);
                await refetchCart();
            } else {
                const items = cart.filter(item => item.id !== productId);
                saveGuestCart(items);
                setCart(items);
            }
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            alert('Failed to remove item. Please try again.');
        }
    }, [session?.user, cart, refetchCart]);

    const clearCart = useCallback(async () => {
        try {
            if (session?.user) {
                await clearUserCart(session.user.id);
                await refetchCart();
            } else {
                clearGuestCart();
                setCart([]);
            }
        } catch (error) {
            console.error('Failed to clear cart:', error);
            alert('Failed to clear cart. Please try again.');
        }
    }, [session?.user, refetchCart]);

    // Initial cart load
    useEffect(() => {
        refetchCart();
    }, [session?.user]);

    // Refetch when tab becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && session?.user) {
                refetchCart();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [session?.user, refetchCart]);

    return {
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        refetchCart,
        addingToCartId
    };
};