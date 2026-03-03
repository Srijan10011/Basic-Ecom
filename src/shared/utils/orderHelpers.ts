/**
 * Order utility functions
 * Centralized helpers for order-related operations
 */

import { OrderStatus } from '../../types';

/**
 * Get Tailwind CSS classes for order status badge
 * @param status - Order status
 * @returns CSS classes for background and text color
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'awaiting_payment': 'bg-orange-100 text-orange-800',
    'processing': 'bg-blue-100 text-blue-800',
    'shipped': 'bg-purple-100 text-purple-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get status display name
 * @param status - Order status
 * @returns Human-readable status name
 */
export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    'pending': 'Pending',
    'awaiting_payment': 'Awaiting Payment',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
  };
  
  return statusLabels[status] || status;
};

/**
 * Check if order status can be updated
 * @param currentStatus - Current order status
 * @param newStatus - New status to set
 * @returns Whether the status transition is valid
 */
export const canUpdateStatus = (currentStatus: OrderStatus, newStatus: OrderStatus): boolean => {
  // Cancelled orders cannot be updated
  if (currentStatus === 'cancelled') return false;
  
  // Delivered orders can only be cancelled
  if (currentStatus === 'delivered' && newStatus !== 'cancelled') return false;
  
  return true;
};
