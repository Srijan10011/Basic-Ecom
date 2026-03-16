import { supabase } from '../../../lib/supabaseClient';
import { verifyAdminRole } from '../../admin/services/adminService';
export const createProduct = async (productData: any, userId: string) => {
    if (!await verifyAdminRole(userId)) {
        throw new Error('Unauthorized: Admin access required');
    }
    const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

    if (error) throw error;
    return data;
};

export const updateProduct = async (id: string, productData: any, userId: string) => {
    if (!await verifyAdminRole(userId)) {
        throw new Error('Unauthorized: Admin access required');
    }
    const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);

    if (error) throw error;
    return data;
};

export const deleteProduct = async (id: string, userId: string) => {
    if (!await verifyAdminRole(userId)) {
        throw new Error('Unauthorized: Admin access required');
    }
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw error;
};