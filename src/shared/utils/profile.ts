
import { supabase } from '../../lib/supabaseClient';

export const createUserProfile = async (user: any) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile does not exist, create it
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          first_name: user.user_metadata.first_name || '',
          last_name: user.user_metadata.last_name || '',
          role: 'user',
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        throw insertError;
      }
    } else if (error) {
      console.error('Error checking profile:', error);
      throw error;
    }
  } catch (profileError) {
    console.error('Error handling profile creation:', profileError);
    throw profileError;
  }
};
