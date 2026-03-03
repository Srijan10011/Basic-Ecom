import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

export const useAuth = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Error getting initial session:', sessionError);
                } else if (mounted) {
                    setSession(initialSession);
                }

                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
                    if (mounted) {
                        setSession(session);
                    }
                });

                if (mounted) {
                    setIsLoading(false);
                }

                return () => subscription.unsubscribe();
            } catch (error) {
                console.error('Error initializing auth:', error);
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        initializeAuth();

        return () => {
            mounted = false;
        };
    }, []);

    return { session, isLoading };
};
