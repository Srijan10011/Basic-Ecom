import React from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface CartProps {
  cart: any[];
  setCurrentPage: (page: string) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void | Promise<void>;
}

export default function Cart({ cart, setCurrentPage, updateCartQuantity, removeFromCart, clearCart }: CartProps) {
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <button
            onClick={() => setCurrentPage('shop')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Shopping Cart ({cart.length} items)</h1>
          <button onClick={clearCart} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Clear Cart</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden p-8">
            {cart.map(item => (
              <div key={item.id} className="flex flex-col md:flex-row items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300">Npr.{item.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-gray-900 dark:text-white">{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">Npr.{(item.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="text-gray-600 dark:text-gray-300">Subtotal ({cart.length} items)</p>
                <p className="font-semibold text-gray-900 dark:text-white">Npr.{totalPrice.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600 dark:text-gray-300">Shipping</p>
                <p className="font-semibold text-gray-900 dark:text-white">Free</p>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-xl font-bold text-gray-900 dark:text-white">Total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">Npr.{totalPrice.toFixed(2)}</p>
              </div>
            </div>
            <button onClick={() => setCurrentPage('checkout')} className="w-full mt-8 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold text-lg">
              Proceed to Checkout &rarr;
            </button>
            <button onClick={() => setCurrentPage('shop')} className="w-full mt-4 text-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}