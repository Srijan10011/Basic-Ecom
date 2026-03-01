import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <section id="admin-dashboard" className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h2>
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-lg text-gray-700">
            Welcome to the Admin Dashboard. Here you can manage products, orders,
            users, and more.
          </p>
          {/* Add admin functionalities here */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-100 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Manage Products</h3>
              <p className="text-gray-700">Add, edit, or remove products from your store.</p>
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Go to Products</button>
            </div>
            <div className="bg-green-100 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Manage Orders</h3>
              <p className="text-gray-700">View and process customer orders.</p>
              <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Go to Orders</button>
            </div>
            <div className="bg-yellow-100 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Manage Users</h3>
              <p className="text-gray-700">View and manage user accounts.</p>
              <button className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">Go to Users</button>
            </div>
            <div className="bg-purple-100 p-6 rounded-lg shadow-md col-span-full">
              <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-200 p-4 rounded-lg shadow-sm">
                  <h4 className="text-lg font-semibold mb-2">Pending Orders</h4>
                  <p className="text-gray-700">View orders awaiting processing.</p>
                  <button className="mt-2 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">View Pending</button>
                </div>
                <div className="bg-purple-200 p-4 rounded-lg shadow-sm">
                  <h4 className="text-lg font-semibold mb-2">Processing Orders</h4>
                  <p className="text-gray-700">Track orders currently being processed.</p>
                  <button className="mt-2 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">View Processing</button>
                </div>
                <div className="bg-purple-200 p-4 rounded-lg shadow-sm">
                  <h4 className="text-lg font-semibold mb-2">Delivered Orders</h4>
                  <p className="text-gray-700">Review completed and delivered orders.</p>
                  <button className="mt-2 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">View Delivered</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;