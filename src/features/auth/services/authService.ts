import { supabase } from '../../../lib/supabaseClient';

export const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
};

export const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName
            }
        }
    });

    if (error) throw error;
    return data;
};

export const createProfile = async (userId: string, firstName: string, lastName: string, email: string) => {
    await supabase.from('profiles').insert([{
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: 'user'
    }]);
};