import React from 'react';
import { Dialog, DialogContent } from './dialog';
import { CheckCircle } from 'lucide-react';

interface PaymentSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  onViewProfile: () => void;
  onTrackOrder: () => void;
}

export default function PaymentSuccessDialog({
  open,
  onClose,
  onViewProfile,
  onTrackOrder
}: PaymentSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 p-8">
        <div className="text-center space-y-6">
          {/* Animated Checkmark */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-green-500 rounded-full p-4">
                <CheckCircle className="w-16 h-16 text-white animate-scale-in" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order Submitted!
            </h2>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Your order is being verified
            </p>
          </div>

          {/* Instructions */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Check your order status in:
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onViewProfile}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              View in Profile
            </button>
            <button
              onClick={onTrackOrder}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Track Order
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
