import { CheckoutFormData } from '../types/checkout';

export const validateCheckoutForm = (form: CheckoutFormData): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return !!(form.firstName && form.lastName && emailRegex.test(form.email) && form.phone && form.address && form.city && form.state);
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
export const validateField = (fieldName: string, value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  switch (fieldName) {
    case 'email':
      return emailRegex.test(value);
    case 'phone':
      return value.length >= 7;
    case 'firstName':
    case 'lastName':
    case 'address':
    case 'city':
    case 'state':
      return value.trim().length > 0;
    default:
      return !!value;
  }
};