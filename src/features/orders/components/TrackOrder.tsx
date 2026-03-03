import React, { useState } from 'react';
import { PackageSearch, RefreshCw, CalendarDays } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useOrderTrackingQuery } from '../hooks/useOrderTrackingQuery';
import { getStatusColor } from '../../../shared/utils/orderHelpers';
export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

 

  // Use React Query for data fetching with automatic refetching
  const { 
    data: order, 
    isLoading: orderLoading, 
    error: orderError,
    refetch: refetchOrder 
  } = useOrderTrackingQuery(orderId);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderStatus(null);
    setErrorMessage(null);
    setIsTracking(true);

    if (!orderId) {
      setErrorMessage('Please enter an Order ID.');
      setIsTracking(false);
      return;
    }

    try {
      await refetchOrder();
    } catch (error) {
      console.error('Error tracking order:', error);
      setErrorMessage('An error occurred while tracking your order. Please try again later.');
    } finally {
      setIsTracking(false);
    }
  };

  

  // Handle errors
  React.useEffect(() => {
    if (orderError) {
      if (orderError.message?.includes('PGRST116') || orderError.message?.includes('No rows found')) {
        setErrorMessage('Order ID not found. Please check your ID and try again.');
      } else {
        setErrorMessage('An error occurred while tracking your order. Please try again later.');
      }
      setOrderStatus(null);
    }
  }, [orderError]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg">
          <div>
            <PackageSearch className="mx-auto h-12 w-auto text-green-600 dark:text-green-400" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Track Your Order
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
              Enter your order ID below to get the latest status.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleTrackOrder}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="order-id" className="sr-only">
                  Order ID
                </label>
                <input
                  id="order-id"
                  name="order-id"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                  placeholder="Enter your Order ID"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
            </div>

            {errorMessage && (
              <p className="mt-2 text-center text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Track Order
              </button>
            </div>
          </form>
        </div>
      </div>

      {order && (
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner overflow-x-auto">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Order Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b border-gray-200 dark:border-gray-700 hidden md:table-header-group">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground dark:text-gray-300 [&:has([role=checkbox])]:pr-0">Order #</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground dark:text-gray-300 [&:has([role=checkbox])]:pr-0">Customer</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground dark:text-gray-300 [&:has([role=checkbox])]:pr-0">Items</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground dark:text-gray-300 [&:has([role=checkbox])]:pr-0">Total</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground dark:text-gray-300 [&:has([role=checkbox])]:pr-0">Order Date</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground dark:text-gray-300 [&:has([role=checkbox])]:pr-0">Status</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted border-gray-200 dark:border-gray-700 flex flex-col md:table-row">
                  <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-gray-900 dark:text-white md:table-cell"><span className="font-bold md:hidden">Order #: </span>{order.order_number || order.id}</td>
                  <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-gray-900 dark:text-white md:table-cell"><span className="font-bold md:hidden">Customer: </span>{order.customer_detail?.customer_name || order.guest_order?.customer_name || 'Guest'}</td>
                  <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 md:table-cell">
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-gray-900 dark:text-white">
                        <span className="font-bold md:hidden">Items: </span>
                        {order.items && order.items.length > 0 ? 
                          order.items.map((item: any) => item.name).join(', ') : 
                          'N/A'
                        }
                      </td>
                  </td>
                  <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-gray-900 dark:text-white md:table-cell"><span className="font-bold md:hidden">Total: </span>{order.total_amount ? `Rs {parseFloat(order.total_amount).toFixed(2)}` : 'Rs 0.00'}</td>
                  <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 md:table-cell">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div className="text-gray-900 dark:text-white">
                        <div><span className="font-bold md:hidden">Order Date: </span>{order.order_date ? new Date(order.order_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</div>
                        {/* You can add a relative time here if needed, e.g., "9 minutes ago" */}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 md:table-cell">
                        <span className="font-bold md:hidden">Status: </span>
                        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                      </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}