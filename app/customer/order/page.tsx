'use client';
import { useState, useEffect } from 'react';
import { CustomerLayout } from '@/components/templates/CustomerLayout';
import { MenuGrid } from '@/components/organisms/MenuGrid';
import { OrderSummary } from '@/components/organisms/OrderSummary';
import { TableLayout } from '@/components/organisms/TableLayout';
import { PaymentMethodSelector } from '@/components/molecules/PaymentMethodSelector';
import { Modal } from '@/components/atoms/Modal';
import { Button } from '@/components/atoms/Button';
import { useMenu } from '@/hooks/useMenu';
import { useOrder } from '@/context/OrderContext';
import { useOrderAPI } from '@/hooks/useOrder';
import { PaymentMethod } from '@/types';

export default function CustomerOrderPage() {
  const [step, setStep] = useState<'table' | 'menu' | 'review' | 'payment' | 'complete'>('table');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [completedOrderId, setCompletedOrderId] = useState<number | null>(null);
  
  const { menuItems, categories, loading: menuLoading, fetchMenuItems } = useMenu();
  const { state, setTable } = useOrder();
  const { createOrder, addOrderItems, closeOrder, processPayment, loading: orderLoading } = useOrderAPI();

  const handleTableSelect = (tableId: number) => {
    setTable(tableId);
    setStep('menu');
  };

  const handleCheckout = () => {
    setStep('review');
  };

  const handleConfirmOrder = () => {
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod || !state.selectedTable || state.cartItems.length === 0) {
      return;
    }

    try {
      // Create order
      const order = await createOrder(state.selectedTable);
      if (!order) return;

      // Add items to order
      const success = await addOrderItems(order.id, state.cartItems);
      if (!success) return;

      // Close order
      const closedOrder = await closeOrder(order.id);
      if (!closedOrder) return;

      // Process payment
      const payment = await processPayment({
        order_id: order.id,
        amount: state.total,
        method: selectedPaymentMethod,
      });

      if (payment) {
        setCompletedOrderId(order.id);
        setStep('complete');
        setShowPaymentModal(false);
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const handleStartNewOrder = () => {
    setStep('table');
    setCompletedOrderId(null);
    setSelectedPaymentMethod(null);
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4">
          {['table', 'menu', 'review', 'payment', 'complete'].map((stepName, index) => {
            const currentIndex = ['table', 'menu', 'review', 'payment', 'complete'].indexOf(step);
            const isActive = index <= currentIndex;
            const isCurrent = step === stepName;
            
            return (
              <div key={stepName} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                >
                  {index + 1}
                </div>
                {index < 4 && (
                  <div
                    className={`w-12 h-1 ${
                      index < currentIndex ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        {step === 'table' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">เลือกโต๊ะ</h2>
              <p className="text-gray-600">กรุณาเลือกโต๊ะที่ต้องการสั่งอาหาร</p>
            </div>
            <TableLayout onTableSelect={handleTableSelect} showStatus={false} />
          </div>
        )}

        {step === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">เมนูอาหาร</h2>
              <MenuGrid
                menuItems={menuItems}
                categories={categories}
                loading={menuLoading}
                // onSearch={fetchMenuItems}
              />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <OrderSummary onCheckout={handleCheckout} />
              </div>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">ตรวจสอบรายการสั่งอาหาร</h2>
              <p className="text-gray-600">กรุณาตรวจสอบรายการก่อนยืนยันการสั่ง</p>
            </div>
            <OrderSummary readonly showActions={false} />
            <div className="flex space-x-4">
              <Button
                variant="secondary"
                onClick={() => setStep('menu')}
                className="flex-1"
              >
                กลับไปแก้ไข
              </Button>
              <Button
                onClick={handleConfirmOrder}
                className="flex-1"
              >
                ยืนยันการสั่ง
              </Button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">สั่งอาหารสำเร็จ!</h2>
              <p className="text-gray-600 mt-2">
                หมายเลขออเดอร์: #{completedOrderId}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                อาหารจะเสิร์ฟในอีกประมาณ 15-20 นาที
              </p>
            </div>
            <Button
              onClick={handleStartNewOrder}
              className="w-full"
            >
              สั่งอาหารใหม่
            </Button>
          </div>
        )}

        {/* Payment Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="เลือกวิธีการชำระเงิน"
          size="md"
        >
          <div className="space-y-6">
            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onMethodChange={setSelectedPaymentMethod}
            />
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">ยอดที่ต้องชำระ</span>
                <span className="text-xl font-bold text-green-600">
                  ฿{state.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handlePayment}
                disabled={!selectedPaymentMethod}
                loading={orderLoading}
                className="flex-1"
              >
                ชำระเงิน
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </CustomerLayout>
  );
}