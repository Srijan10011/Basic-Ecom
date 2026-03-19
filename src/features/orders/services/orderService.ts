import { supabase } from '../../../lib/supabaseClient';
import { sendOrderStatusEmail } from '../../auth/services/emailservice';

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

    // Get current order data before update
    const { data: currentOrder } = await supabase
        .from('orders')
        .select('status, customer_email, customer_detail_id')
        .eq('id', orderId)
        .single();

    const oldStatus = currentOrder?.status;

    const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select(`
            *,
            customer_detail:customer_detail_id(*)
        `)
        .single();

    if (error) throw error;

    // Send email if status changed from pending to processing
    if (oldStatus === 'pending' && status === 'processing') {
        await sendOrderStatusEmail(data, 'processing');
    }

    return data;
};