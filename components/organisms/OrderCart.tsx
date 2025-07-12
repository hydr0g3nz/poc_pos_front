// components/organisms/OrderCart/OrderCart.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderItemRow, OrderSummary, PaymentMethodSelector } from '@/components/molecules';
import { Button, Text } from '@/components/atoms';
import { OrderItem, apiClient } from '@/lib/api';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingCart, Trash2 } from 'lucide-react';

interface OrderCartProps {
  orderId: number;
  onPaymentComplete?: () => void;
  disabled?: boolean;
}

export const OrderCart: React.FC<OrderCartProps> = ({
  orderId,
  onPaymentComplete,
  disabled = false,
}) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch order items and total
  const fetchOrderData = async () => {
    if (!orderId) return;
    
    setIsLoading(true);
    try {
      const [itemsResponse, totalResponse] = await Promise.all([
        apiClient.getOrderItems(orderId),
        apiClient.calculateOrderTotal(orderId),
      ]);
      
      setOrderItems(itemsResponse.data);
      setTotal(totalResponse.data.total);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch order data:', err);
      setError('ไม่สามารถโหลดรายการสั่งซื้อได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    try {
      await apiClient.updateOrderItem(itemId, { quantity });
      await fetchOrderData();
    } catch (err) {
      console.error('Failed to update item quantity:', err);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await apiClient.removeOrderItem(itemId);
      await fetchOrderData();
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handlePayment = async () => {
    setIsPaymentLoading(true);
    try {
      await apiClient.processPayment({
        order_id: orderId,
        amount: total,
        method: paymentMethod,
      });
      
      if (onPaymentComplete) {
        onPaymentComplete();
      }
    } catch (err) {
      console.error('Payment failed:', err);
      setError('การชำระเงินล้มเหลว');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <ShoppingCart className="w-5 h-5 mr-2" />
          ตะกร้า
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 text-xs flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>รายการสั่งซื้อ</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <Text color="destructive" variant="caption">{error}</Text>
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-8">
              <Text>กำลังโหลด...</Text>
            </div>
          ) : orderItems.length === 0 ? (
            <div className="text-center py-8">
              <Text color="muted">ไม่มีรายการในตะกร้า</Text>
            </div>
          ) : (
            <>
              {/* Order Items */}
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <OrderItemRow
                    key={item.id}
                    item={item}
                    onUpdateQuantity={(quantity) => handleUpdateQuantity(item.id, quantity)}
                    onRemove={() => handleRemoveItem(item.id)}
                    disabled={disabled}
                  />
                ))}
              </div>

              {/* Payment Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">วิธีการชำระเงิน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PaymentMethodSelector
                    selectedMethod={paymentMethod}
                    onMethodSelect={setPaymentMethod}
                    disabled={disabled || isPaymentLoading}
                  />
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <Text className="font-bold text-lg">รวมทั้งสิ้น:</Text>
                      <Text className="font-bold text-lg">฿{total.toFixed(2)}</Text>
                    </div>
                    
                    <Button
                      onClick={handlePayment}
                      disabled={disabled || orderItems.length === 0 || isPaymentLoading}
                      isLoading={isPaymentLoading}
                      className="w-full"
                    >
                      ชำระเงิน ฿{total.toFixed(2)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};