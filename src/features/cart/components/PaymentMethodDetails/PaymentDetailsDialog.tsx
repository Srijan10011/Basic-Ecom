import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../shared/components/ui/dialog';
import { paymentConfigs } from '../../../../constants/paymentConfig';
import { supabase } from '../../../../lib/supabaseClient';

interface PaymentDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  paymentMethod: string;
  orderId: string;
  amount: number;
  paymentReferenceId: string;
  clearCart: () => void | Promise<void>;
  setCurrentPage: (page: string) => void;
}

export default function PaymentDetailsDialog({
  open,
  onClose,
  paymentMethod,
  orderId,
  amount,
  paymentReferenceId,
  clearCart,
  setCurrentPage
}: PaymentDetailsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const config = paymentConfigs[paymentMethod];
  if (!config) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleSubmitPayment = async () => {
  setIsSubmitting(true);
  try {
    let screenshotUrl = null;

    if (screenshot) {
      console.log('📸 Screenshot file:', screenshot.name, screenshot.size, 'bytes');
      const fileExt = screenshot.name.split('.').pop();
      const fileName = `payment-${Date.now()}.${fileExt}`;
      
      console.log('⬆️ Uploading to:', fileName);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, screenshot);

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        alert(`Upload failed: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }

      console.log('✅ Upload successful:', uploadData);
      const { data: urlData } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(fileName);
      screenshotUrl = urlData.publicUrl;
      console.log('🔗 Public URL:', screenshotUrl);
    } else {
      console.log('⚠️ No screenshot selected');
    }

    console.log('💾 Updating order with screenshot URL:', screenshotUrl);
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'payment_submitted',
        payment_method: paymentMethod,
        payment_submitted_at: new Date().toISOString(),
        payment_screenshot_url: screenshotUrl
      })
      .eq('id', orderId);

    if (error) throw error;

    // Invalidate orders query cache
    if (typeof window !== 'undefined' && (window as any).queryClient) {
      (window as any).queryClient.invalidateQueries(['userOrders']);
    }

    alert('Payment submitted! Your order is being verified.');
    await clearCart();
    setCurrentPage('home');
    onClose();
  } catch (error: any) {
    console.error('Error:', error);
    alert(`Error: ${error.message}`);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm bg-white dark:bg-gray-800 p-4">
        <DialogHeader className="mb-3">
          <DialogTitle className="text-lg font-bold">
            {paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'} Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">Amount</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">Rs {amount.toFixed(2)}</p>
          </div>

          <div className="flex justify-center bg-gray-100 dark:bg-gray-700 p-2 rounded">
            <img src={config.qrCodeUrl} alt="QR Code" className="w-32 h-32" />
          </div>

          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {paymentMethod === 'esewa' ? 'eSewa ID' : 'Khalti'}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">{config.accountId}</p>
            </div>
            <button
              onClick={() => handleCopy(config.accountId)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
            >
              📋
            </button>
          </div>

          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-500 rounded">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Reference ID</p>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{paymentReferenceId}</p>
              <button
                onClick={() => handleCopy(paymentReferenceId)}
                className="p-1 hover:bg-orange-100 dark:hover:bg-orange-800 rounded text-sm"
              >
                📋
              </button>
            </div>
          </div>

          <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-500 rounded text-xs text-red-700 dark:text-red-300">
            <p className="font-semibold mb-1">⚠️ IMPORTANT:</p>
            <p>Add Reference ID in payment remarks to verify your order</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Upload Screenshot (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmitPayment}
              disabled={isSubmitting}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 rounded text-sm font-semibold transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'I have paid'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white py-2 rounded text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
