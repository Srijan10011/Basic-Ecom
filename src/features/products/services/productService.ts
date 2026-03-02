import { supabase } from '../../../lib/supabaseClient';

export const createProduct = async (productData: any) => {
    const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

    if (error) throw error;
    return data;
};

export const updateProduct = async (id: string, productData: any) => {
    const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);

    if (error) throw error;
    return data;
};

export const deleteProduct = async (id: string) => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw error;
};