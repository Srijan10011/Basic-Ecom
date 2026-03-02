import { supabase } from '../../../lib/supabaseClient';

export const updateOrderStatus = async (orderId: string, status: string) => {
    const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

    if (error) throw error;
    return data;
};