import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { CheckoutFormData } from '../types/checkout';

export const useCheckoutForm = (session: any, user: any, resumeOrderId?: string | null) => {
  const [form, setFormState] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    location: null,
  });

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFormState(prev => ({
            ...prev,
            firstName: profile.first_name || prev.firstName,
            lastName: profile.last_name || prev.lastName,
            email: profile.email || prev.email,
          }));
        }
      } else if (session?.user && !form.email) {
        setFormState(prev => ({
          ...prev,
          firstName: session.user.user_metadata?.first_name || prev.firstName,
          lastName: session.user.user_metadata?.last_name || prev.lastName,
          email: session.user.email || prev.email,
        }));
      }
    };

    loadProfileData();
  }, [user?.id, session?.user?.id]);

  // Load guest contact info
  useEffect(() => {
    if (!session) {
      const savedContactInfo = localStorage.getItem('guestContactInfo');
      if (savedContactInfo) {
        try {
          const parsedInfo = JSON.parse(savedContactInfo);
          setFormState(prev => ({
            ...prev,
            firstName: parsedInfo.firstName || '',
            lastName: parsedInfo.lastName || '',
            email: parsedInfo.email || '',
            phone: parsedInfo.phone || '',
          }));
        } catch (e) {
          console.error('Error parsing guest contact info', e);
          localStorage.removeItem('guestContactInfo');
        }
      }
    }
  }, [session]);

  // Load address data - SKIP if resuming order
  useEffect(() => {
    const loadAddressData = async () => {
      if (user?.id && !resumeOrderId) {
        const { data: addressData } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (addressData) {
          setFormState(prev => ({
            ...prev,
            phone: addressData.phone || prev.phone,
            address: addressData.address || prev.address,
            city: addressData.city || prev.city,
            state: addressData.state || prev.state,
            location: addressData.latitude && addressData.longitude 
              ? `${addressData.latitude}, ${addressData.longitude}`
              : prev.location,
          }));
        }
      }
    };

    loadAddressData();
  }, [user?.id, resumeOrderId]);

  const updateField = (field: keyof CheckoutFormData, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const setFormData = (data: Partial<CheckoutFormData>) => {
    setFormState(prev => ({ ...prev, ...data }));
  };

  return { form, updateField, setFormData };
};
