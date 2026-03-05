import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../shared/components/ui/dialog';
import { paymentConfigs } from '../../../../constants/paymentConfig';
import PaymentSuccessDialog from '../../../../shared/components/ui/PaymentSuccessDialog';
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
  setTrackOrderId: (id: string) => void;
  orderNumber: string;
}

export default function PaymentDetailsDialog({
  open,
  onClose,
  paymentMethod,
  orderId,
  amount,
  paymentReferenceId,
  clearCart,
  setCurrentPage,
  setTrackOrderId,
  orderNumber,
}: PaymentDetailsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
const [showSuccessDialog, setShowSuccessDialog] = useState(false);
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
await clearCart();
    setShowSuccessDialog(true);
    
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
           {config.id.charAt(0).toUpperCase() + config.id.slice(1)} Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Top bar with amount and badge */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">Rs {amount.toFixed(2)}</p>
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                {config.id.charAt(0).toUpperCase() + config.id.slice(1)}
            </span>
          </div>

          {/* Content flex: QR + Details */}
          <div className="flex gap-3">
            {/* QR Box */}
            <div className="flex-shrink-0">
              <div className="w-28 h-28 bg-gray-100 dark:bg-gray-700 rounded-lg p-2 border-2 border-gray-200 dark:border-gray-600">
                <img src={config.qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Details Box */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                   {config.id.charAt(0).toUpperCase() + config.id.slice(1)} ID
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{config.accountId}</p>
                </div>
                <button
                  onClick={() => handleCopy(config.accountId)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
                >
                  📋
                </button>
              </div>

              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Reference ID<br/>(Must include in remarks):
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-900 dark:text-white break-all">{paymentReferenceId}</p>
                  <button
                    onClick={() => handleCopy(paymentReferenceId)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm ml-1"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Upload section */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">📎 Upload Screenshot</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-700 dark:file:text-gray-300"
            />
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSubmitPayment}
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 rounded text-sm font-semibold transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'I have paid'}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white py-2 rounded text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
      <PaymentSuccessDialog
        open={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          onClose(); // Close payment dialog
          setCurrentPage('home');
        }}
        onViewProfile={() => {
          setShowSuccessDialog(false);
          onClose(); // Close payment dialog
          setCurrentPage('profile');
        }}
        onTrackOrder={() => {
  setShowSuccessDialog(false);
  onClose();
  setTrackOrderId(orderNumber);
  setCurrentPage('track-order');
}}
      />
    </Dialog>
  );
}
