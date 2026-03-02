import React, { useState, useEffect } from 'react';

interface Order {
  id: string;
  customerName: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: { name: string; quantity: number; price: number }[];
  orderDate: string;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Mock data for demonstration
    const mockOrders: Order[] = [
      {
        id: 'ORD001',
        customerName: 'Alice Smith',
        total: 120.50,
        status: 'Pending',
        items: [{ name: 'Product A', quantity: 1, price: 50.00 }, { name: 'Product B', quantity: 2, price: 35.25 }],
        orderDate: '2025-07-01',
      },
      {
        id: 'ORD002',
        customerName: 'Bob Johnson',
        total: 75.00,
        status: 'Processing',
        items: [{ name: 'Product C', quantity: 3, price: 25.00 }],
        orderDate: '2025-07-02',
      },
      {
        id: 'ORD003',
        customerName: 'Charlie Brown',
        total: 200.00,
        status: 'Delivered',
        items: [{ name: 'Product D', quantity: 1, price: 200.00 }],
        orderDate: '2025-06-28',
      },
    ];
    setOrders(mockOrders);
  }, []);

  const handleEditClick = (order: Order) => {
    setEditingOrder(order);
  };

  const handleSaveEdit = (updatedOrder: Order) => {
    setOrders(orders.map(order => (order.id === updatedOrder.id ? updatedOrder : order)));
    setEditingOrder(null);
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    if (editingOrder) {
      setEditingOrder({
        ...editingOrder,
        [e.target.name]: e.target.value,
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

      {editingOrder && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Order {editingOrder.id}</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customerName">
              Customer Name:
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={editingOrder.customerName}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
              Status:
            </label>
            <select
              id="status"
              name="status"
              value={editingOrder.status}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => handleSaveEdit(editingOrder)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Order ID</th>
              <th className="py-3 px-4 text-left">Customer Name</th>
              <th className="py-3 px-4 text-left">Total</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Order Date</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {orders.map(order => (
              <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{order.id}</td>
                <td className="py-3 px-4">{order.customerName}</td>
                <td className="py-3 px-4">Npr.{order.total.toFixed(2)}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
                      order.status === 'Processing' ? 'bg-blue-200 text-blue-800' :
                      order.status === 'Shipped' ? 'bg-purple-200 text-purple-800' :
                      order.status === 'Delivered' ? 'bg-green-200 text-green-800' :
                      'bg-red-200 text-red-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-4">{order.orderDate}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleEditClick(order)}
                    className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
