import { CheckoutFormData } from '../types/checkout';

export const validateCheckoutForm = (form: CheckoutFormData): boolean => {
  return !!(form.firstName && form.lastName && form.email && form.phone && form.address && form.city && form.state);
};

export const validateLocation = (location: string | null): boolean => {
  return !!location;
};

export const validateFormAndLocation = (form: CheckoutFormData, location: string | null): { valid: boolean; error?: string } => {
  if (!validateLocation(location)) {
    return { valid: false, error: 'Please click "Use my location" to proceed with the order.' };
  }
  
  if (!validateCheckoutForm(form)) {
    return { valid: false, error: 'Please fill in all required fields.' };
  }
  
  return { valid: true };
};
