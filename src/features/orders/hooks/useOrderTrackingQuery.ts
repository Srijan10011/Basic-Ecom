import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabaseClient";

export const useOrderTrackingQuery = (orderId: string) => {
    return useQuery({
        queryKey: ["order", orderId],
        queryFn: async () => {
            if (!orderId) return null;
            const { data, error } = await supabase
                .from("orders")
                .select("*, customer_detail!customer_detail_id(*), guest_order(*)")
                .eq("id", orderId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!orderId,
    });
};