import { supabase } from '../../../lib/supabaseClient';
import { AdminOrder, OrderItem } from '../../../lib/utils';

export const adminService = {
    async fetchAdminOrders(): Promise<AdminOrder[]> {
        const { data: orders, error } = await supabase
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

        if (error) throw error;

        const guestOrderIds = (orders || []).filter(order => !order.user_id).map(order => order.id);
        let guestOrdersMap = new Map();

        if (guestOrderIds.length > 0) {
            const { data: guestOrders } = await supabase
                .from("guest_order")
                .select("id, order_id, customer_name, shipping_address, customer_email, created_at")
                .in("order_id", guestOrderIds);

            if (guestOrders) {
                guestOrders.forEach(guestOrder => guestOrdersMap.set(guestOrder.order_id, guestOrder));
            }
        }

        return (orders || []).map(order => {
            const guestOrder = guestOrderIds.includes(order.id) ? guestOrdersMap.get(order.id) : undefined;
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
                customer_detail: order.customer_detail ? {
                    customer_name: order.customer_detail.customer_name || "Unknown",
                    shipping_address: order.customer_detail.shipping_address || {}
                } : undefined,
                guest_order: guestOrder ? {
                    id: guestOrder.id,
                    order_id: order.id,
                    customer_name: guestOrder.customer_name || "Guest",
                    shipping_address: guestOrder.shipping_address || {},
                    customer_email: guestOrder.customer_email || "No email",
                    created_at: guestOrder.created_at || new Date().toISOString()
                } : undefined,
                order_items: [],
                _note: "Items not loaded"
            };
        });
    },

    async fetchAdminProducts() {
        const { data, error } = await supabase.from("products").select("*");
        if (error) throw error;
        return data;
    },

    async fetchCategories() {
        const { data, error } = await supabase.from("categories").select("*");
        if (error) throw error;
        return data;
    },

    async updateOrderStatus(orderId: string, status: string) {
        const { data, error } = await supabase
            .from("orders")
            .update({ status })
            .eq("id", orderId);
        if (error) throw error;
        return data;
    }
};