import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export const useAdminAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        async function checkUserAndRole() {
            try {
                // Clear any cached user data
                localStorage.removeItem('guestSessions');
                localStorage.removeItem('guestContactInfo');
                sessionStorage.clear();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setIsAuthenticated(true);
                    setUserId(user.id);

                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single();

                    if (profileError) {
                        console.error('Error fetching user role:', profileError);
                        setUserRole(null);
                    } else if (profileData) {
                        setUserRole(profileData.role);
                    }
                } else {
                    setIsAuthenticated(false);
                    setUserRole(null);
                }
            } catch (error) {
                console.error('Error checking user authentication:', error);
                setIsAuthenticated(false);
                setUserRole(null);
            } finally {
                setIsLoading(false);
            }
        }

        checkUserAndRole();
    }, []);

    return {
        isAuthenticated,
        isLoading,
        userRole,
        userId,
        isAdmin: userRole === 'admin'
    };
};
