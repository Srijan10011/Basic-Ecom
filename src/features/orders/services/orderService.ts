import { supabase } from '../../../lib/supabaseClient';

export const updateOrderStatus = async (orderId: string, status: string, userId: string) => {
    // Verify admin role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    if (profileError || profile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
    }

    const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

    if (error) throw error;
    return data;
};