import  { useState, useEffect } from 'react';
import { Package ,Calendar, MapPin } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../shared/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/components/ui/table';
import { supabase } from '../../../lib/supabaseClient';
import { getStatusColor } from '../../../shared/utils/orderHelpers';
interface GuestOrderAccessProps {
  setCurrentPage: (page: string) => void;
}

interface GuestSession {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  orderData: {
    id: string;
    order_number: string;
    total_amount: string;
    status: string; // Added status to GuestSession
    order_date: string;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    // Add other properties from orderData if needed
    shipping_address?: {
      address: string;
      city: string;
      state: string;
      zipCode: string;
      latitude: number | null;
      longitude: number | null;
      phone: string;
    };
  };
}

export default function GuestOrderAccess({ setCurrentPage }: GuestOrderAccessProps) {
  const [guestSessions, setGuestSessions] = useState<GuestSession[]>([]);
  const [currentSession, setCurrentSession] = useState<GuestSession | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const loadAndFetchGuestOrders = async () => {
      setLoading(true);
      const sessions = JSON.parse(localStorage.getItem('guestSessions') || '[]');
      // No filtering based on expiration as per previous user request to remove expiration
      // If expiration is still desired, the filter should be re-added here.

      // Fetch latest status for each session from Supabase
      const updatedSessions = await Promise.all(sessions.map(async (session: GuestSession) => {
        const { data, error } = await supabase
          .from('orders')
          .select('status')
          .eq('id', session.orderId)
          .single();

        if (error) {
          console.error(`Error fetching status for order ${session.orderId}:`, error);
          return session; // Return original session if fetch fails
        }

        if (data && data.status) {
          return {
            ...session,
            orderData: {
              ...session.orderData,
              status: data.status,
            },
          };
        }
        return session;
      }));

      // Update localStorage with potentially new statuses
      // Update localStorage with potentially new statuses
      // Update localStorage with potentially new statuses
      localStorage.setItem('guestSessions', JSON.stringify(updatedSessions));

      // Sort by order date descending (newest first)
      const sortedSessions = updatedSessions.sort((a, b) =>
        new Date(b.orderData.order_date).getTime() - new Date(a.orderData.order_date).getTime()
      );

      setGuestSessions(sortedSessions);
      setLoading(false);
    };

    loadAndFetchGuestOrders();
  }, []); // Empty dependency array to run only once on mount

  


  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  };

  const pendingGuestOrders = guestSessions.filter(session => session.orderData.status !== 'delivered' && session.orderData.status !== 'removed');
  const deliveredGuestOrders = guestSessions.filter(session => session.orderData.status === 'delivered');

  const renderGuestOrdersTable = (filteredOrders: GuestSession[], emptyMessage: string) => {
    if (filteredOrders.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
         <TableRow className="bg-gray-50 dark:bg-gray-700">
            <TableHead className="text-gray-700 dark:text-gray-200">Order #</TableHead>
<TableHead className="text-gray-700 dark:text-gray-200">Customer</TableHead>
<TableHead className="text-gray-700 dark:text-gray-200">Items</TableHead>
<TableHead className="text-gray-700 dark:text-gray-200">Total</TableHead>
<TableHead className="text-gray-700 dark:text-gray-200">Order Date</TableHead>
<TableHead className="text-gray-700 dark:text-gray-200">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((session) => (
            <TableRow key={session.orderId} className="dark:border-gray-700">
            <TableCell className="font-medium dark:text-gray-200">
                #{session.orderNumber}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-blue-600 dark:text-blue-400">
                    {session.customerName} (Guest)
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {session.customerEmail}
                  </p>
                  {session.orderData.shipping_address && (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.orderData.shipping_address.phone}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.orderData.shipping_address.address}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.orderData.shipping_address.city}, {session.orderData.shipping_address.state} {session.orderData.shipping_address.zipCode}
                      </p>
                      {session.orderData.shipping_address.latitude && session.orderData.shipping_address.longitude && (
                        <div className="mt-2">
                          <a
                            href={`https://maps.google.com/?q=${session.orderData.shipping_address.latitude},${session.orderData.shipping_address.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                           className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            View on Google Maps
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {(typeof session.orderData.items === 'string'
                    ? JSON.parse(session.orderData.items)
                    : session.orderData.items
                  ).map((item: any, idx: number) => (
                    <div key={idx} className="text-sm dark:text-gray-300">
                      <p>{item.name} (x{item.quantity})</p>
                      {item.price && <p className="text-xs text-gray-500 dark:text-gray-400">Rs {item.price}</p>}
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell className="font-semibold dark:text-gray-200">
                Rs {parseFloat(session.orderData.total_amount).toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <div className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-200">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    {formatOrderDate(session.orderData.order_date)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {getRelativeTime(session.orderData.order_date)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(session.orderData.status)}>
                  {session.orderData.status.charAt(0).toUpperCase() + session.orderData.status.slice(1)}
                </Badge>
              </TableCell>
              </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
       <p className="ml-4 text-gray-600 dark:text-gray-300">Loading guest orders...</p>
      </div>
    );
  }

  if (guestSessions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">No Guest Orders</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You haven't placed any orders as a guest user yet.
            </p>
            <button
              onClick={() => setCurrentPage('shop')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Place New Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Removed the !currentSession (session expired) block as per user's request to not expire sessions.
  // If the user wants to re-introduce session expiration, this block should be re-added.

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="dark:text-white">Guest Order Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white"></h1>
            </div>

            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-2 dark:bg-gray-700">
                <TabsTrigger value="pending" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white">
                  Pending Orders ({pendingGuestOrders.length})
                </TabsTrigger>
                <TabsTrigger value="delivered" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white">
                  Delivered Orders ({deliveredGuestOrders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-6">
                {renderGuestOrdersTable(pendingGuestOrders, "No pending orders found.")}
              </TabsContent>

              <TabsContent value="delivered" className="mt-6">
                {renderGuestOrdersTable(deliveredGuestOrders, "No delivered orders found.")}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end items-center mt-8">
              <button
                onClick={() => setCurrentPage('shop')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Place Another Order
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )};
