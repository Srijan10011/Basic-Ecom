import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { MapPin, Calendar } from 'lucide-react';
import { AdminOrder } from '../lib/utils';
import { formatOrderDate, getRelativeTime } from '../lib/dateUtils';

interface OrderStatusTabsProps {
  orders: AdminOrder[];
  onStatusChange: (orderId: string, status: string, userId: string | null) => void;
  getStatusColor: (status: string) => string;
}

const OrderStatusTabs: React.FC<OrderStatusTabsProps> = ({ 
  orders, 
  onStatusChange, 
  getStatusColor 
}) => {
  // Filter orders by status
  const allOrders = orders || [];
  const pendingOrders = allOrders.filter(order => order.status === 'pending');
  const processingOrders = allOrders.filter(order => order.status === 'processing');
  const deliveredOrders = allOrders.filter(order => order.status === 'delivered');

  const renderOrdersTable = (filteredOrders: AdminOrder[], emptyMessage: string) => {
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
            <TableHead className="text-gray-700 dark:text-gray-200">Order Created Date</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-200">Status</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-200">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow key={order.id} className="border-b border-gray-200 dark:border-gray-700">
              <TableCell className="font-medium text-gray-900 dark:text-white">
                #{order.order_number}
              </TableCell>
              <TableCell>
                <div>
                  {/* Display customer info based on order type */}
                  {order.user_id ? (
                    // Authenticated user order
                    <>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.customer_details?.customer_name || 'Unknown Customer'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {order.customer_details?.shipping_address?.phone}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {order.customer_details?.shipping_address?.address}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {order.customer_details?.shipping_address?.city}, {order.customer_details?.shipping_address?.state} {order.customer_details?.shipping_address?.zipCode}
                      </p>
                      {order.customer_details?.shipping_address?.latitude && order.customer_details?.shipping_address?.longitude && (
                        <div className="mt-2">
                          <a 
                            href={`https://maps.google.com/?q=${order.customer_details.shipping_address.latitude},${order.customer_details.shipping_address.longitude}`}
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
                  ) : (
                    // Guest order
                    <>
                      <p className="font-medium text-blue-600 dark:text-blue-400">
                        {order.guest_order?.customer_name || 'Guest Customer'} (Guest)
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {order.guest_order?.customer_email}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {order.guest_order?.shipping_address?.phone}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {order.guest_order?.shipping_address?.address}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {order.guest_order?.shipping_address?.city}, {order.guest_order?.shipping_address?.state} {order.guest_order?.shipping_address?.zipCode}
                      </p>
                      {order.guest_order?.shipping_address?.latitude && order.guest_order?.shipping_address?.longitude && (
                        <div className="mt-2">
                          <a 
                            href={`https://maps.google.com/?q=${order.guest_order.shipping_address.latitude},${order.guest_order.shipping_address.longitude}`}
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
                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((item: any, idx: number) => (
                      <div key={idx} className="text-sm text-gray-900 dark:text-white">
                        {item.product_id ? (
                          <p>Product ID: {item.product_id} (x{item.quantity})</p>
                        ) : (
                          <p>{item.name || 'Product'} (x{item.quantity})</p>
                        )}
                        {item.price && <p className="text-xs text-gray-500 dark:text-gray-400">Rs {item.price}</p>}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>No items details available</p>
                      {order._note && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{order._note}</p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        To display order items, add an 'items' JSONB field to your orders table or create an order_items table.
                      </p>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-semibold text-gray-900 dark:text-white">
                Rs {parseFloat(order.total_amount).toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    {formatOrderDate(order.order_date)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {getRelativeTime(order.order_date)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <Select
                  value={order.status}
                  onValueChange={(value) => onStatusChange(order.id, value, order.user_id || null)}
                >
                  <SelectTrigger className="w-32 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-300">
              All Orders ({allOrders.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-300">
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="processing" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-300">
              Processing ({processingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="delivered" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-300">
              Delivered ({deliveredOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {renderOrdersTable(allOrders, "No orders found.")}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {renderOrdersTable(pendingOrders, "No pending orders found.")}
          </TabsContent>

          <TabsContent value="processing" className="mt-6">
            {renderOrdersTable(processingOrders, "No processing orders found.")}
          </TabsContent>

          <TabsContent value="delivered" className="mt-6">
            {renderOrdersTable(deliveredOrders, "No delivered orders found.")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OrderStatusTabs;