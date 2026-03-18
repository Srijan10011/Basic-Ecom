import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabaseClient";
export { useVisibilityRefetch } from "../shared/hooks/useVisibilityRefetch";
export { useDataFetching } from "../shared/hooks/useDataFetching";
export { useProductsQuery, useFeaturedProductsQuery } from "../features/products/hooks/useProductsQuery";
import { useOrderTrackingQuery } from "../features/orders/hooks/useOrderTrackingQuery";
// Type definitions for admin orders
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

// Interface for guest orders
export interface GuestOrder {
  id: number;
  order_id: string; // Foreign key to orders table
  customer_name: string;
  shipping_address: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
  };
  customer_email: string;
  created_at: string;
}

export interface AdminOrder {
  id: string; // UUID from orders.id
  order_number: string;
  total_amount: string;
  status: string;
  order_date: string;
  user_id?: string | null; // Can be null for guest orders
  payment_reference_id?: string;
  payment_status?: string;
  payment_screenshot_url?: string | null;

  // Customer details for authenticated users
  customer_detail?: { // Database field name (singular)
    customer_name: string;
    shipping_address: {
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      latitude?: number;
      longitude?: number;
    };
  };


  // Guest order details
  guest_order?: GuestOrder;

  order_items?: OrderItem[];
  items?: OrderItem[] | string; // Alternative field name for order items
  _note?: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Custom hook for handling data refetching when tab becomes visible


// React Query hook for products with automatic refetching


// React Query hook for featured products


// React Query hook for a single product
export const useProductQuery = (productId: number | null) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) throw new Error("No product ID provided");
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(id, name), product_owner_id")
        .eq("id", productId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    retry: 1,
  });
};

// React Query hook for user profile
export const useProfileQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID provided");
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, email, role")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    retry: 1,
  });
};

// React Query hook for user orders
export const useUserOrdersQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["userOrders", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID provided");

      console.log("Fetching orders for user ID:", userId);

      // Join orders with customer_detail table for authenticated users
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customer_detail!customer_detail_id(
            customer_name,
            shipping_address
          )
        `)
        .eq("user_id", userId)
        .order("order_date", { ascending: false });

      console.log("User orders query result:", {
        data,
        error,
        userId,
        dataLength: data?.length || 0,
      });

      if (error) {
        console.error("Supabase error details:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    retry: 1,
  });
};

// React Query hook for user addresses
export const useUserAddressesQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["userAddresses", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID provided");
      const { data, error } = await supabase
        .from("user_addresses")
        .select("phone, address, city, state, zip_code, latitude, longitude")
        .eq("user_id", userId)
        .single();
      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    retry: 1,
  });
};

export const useAdminOrdersQuery = (enabled: boolean = true, userId: string | null = null) => {
  return useQuery<AdminOrder[]>({
    queryKey: ["adminOrders", userId],
    queryFn: async (): Promise<AdminOrder[]> => {
      if (!userId) {
        throw new Error('User ID required for admin orders');
      }
      try {
        // First, check if we can connect to the database
        const { data: connectionTest, error: connectionError } = await supabase
          .from("orders")
          .select("count")
          .limit(1);

        if (connectionError) {
          throw new Error(
            `Database connection failed: ${connectionError.message}`,
          );
        }

        // Get all orders with customer details and guest orders
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select(`
            *,
            customer_detail!customer_detail_id(
              customer_name,
              shipping_address
            )
          `)
          .in('payment_status', ['payment_submitted', 'completed'])
          .order("order_date", { ascending: false });

        if (ordersError) {
          throw ordersError;
        }

        // Get all guest order IDs in one query
        const guestOrderIds = (orders || [])
          .filter(order => !order.user_id)
          .map(order => order.id);

        let guestOrdersMap = new Map();

        if (guestOrderIds.length > 0) {
          const { data: guestOrders, error: guestOrderError } = await supabase
            .from("guest_order")
            .select(`
              id,
              order_id,
              customer_name,
              shipping_address,
              customer_email,
              created_at
            `)
            .in("order_id", guestOrderIds);

          if (!guestOrderError && guestOrders) {
            guestOrders.forEach(guestOrder => {
              guestOrdersMap.set(guestOrder.order_id, guestOrder);
            });
          }
        }

        // Attach guest order data to orders
        const ordersWithGuestDetails: AdminOrder[] = (orders || []).map(order => {
          if (!order.user_id && guestOrdersMap.has(order.id)) {
            return {
              ...order,
              guest_order: guestOrdersMap.get(order.id),
            };
          }
          return order;
        });

        // Since order_items table doesn't exist, we'll work with the orders table directly
        // Check if orders have an 'items' field or similar that might contain order details
        const finalOrders: AdminOrder[] = (ordersWithGuestDetails || []).map((order) => {
          // Check if the order has an 'items' field (common in some database designs)
          const hasItemsField = order.hasOwnProperty("items");
          const hasOrderItemsField = order.hasOwnProperty("order_items");

          let orderItems: OrderItem[] = [];
          let note = "";

          if (hasItemsField && order.items) {
            // If there's an 'items' field, try to parse it
            try {
              if (typeof order.items === "string") {
                orderItems = JSON.parse(order.items);
              } else if (Array.isArray(order.items)) {
                orderItems = order.items;
              }
              note = "Items loaded from orders.items field";
            } catch (parseError) {
              note = "Could not parse items from orders.items field";
            }
          } else if (hasOrderItemsField && order.order_items) {
            // If there's an 'order_items' field, try to parse it
            try {
              if (typeof order.order_items === "string") {
                orderItems = JSON.parse(order.order_items);
              } else if (Array.isArray(order.order_items)) {
                orderItems = order.order_items;
              }
              note = "Items loaded from orders.order_items field";
            } catch (parseError) {
              note = "Could not parse items from orders.order_items field";
            }
          } else {
            // No items field found
            note =
              "No items field found in orders table. Consider adding an items JSONB field or creating an order_items table.";
          }

          return {
            id: order.id,
            order_number: order.order_number || `ORDER-${order.id}`,
            total_amount: order.total_amount || "0.00",
            status: order.status || "pending",
            order_date: order.order_date || new Date().toISOString(),
            user_id: order.user_id,
            payment_reference_id: order.payment_reference_id,
            payment_status: order.payment_status,
            payment_screenshot_url: order.payment_screenshot_url,

            // Customer details for authenticated users
            customer_detail: order.customer_detail ? {
              customer_name: order.customer_detail.customer_name || "Unknown Customer",
              shipping_address: order.customer_detail.shipping_address || {}
            } : undefined,

            // Guest order details
            guest_order: order.guest_order ? {
              id: order.guest_order.id,
              order_id: order.id,
              customer_name: order.guest_order.customer_name || "Guest Customer",
              shipping_address: order.guest_order.shipping_address || {},
              customer_email: order.guest_order.customer_email || "No email",
              created_at: order.guest_order.created_at || new Date().toISOString()
            } : undefined,

            order_items: orderItems,
            _note: note,
          };
        });

        console.log("Final orders with items:", finalOrders);
        return finalOrders;
      } catch (err: any) {
        console.error("Exception in admin orders query:", err);
        throw err;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    retry: 1,
  });
};

// React Query hook for admin products
export const useAdminProductsQuery = (enabled: boolean = true, userId: string | null = null) => {
  return useQuery({
    queryKey: ["adminProducts", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID required for admin products');
      }
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    retry: 1,
  });
};

// React Query hook for categories


export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

