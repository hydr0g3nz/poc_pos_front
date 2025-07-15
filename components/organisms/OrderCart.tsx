// components/organisms/OrderCart/OrderCart.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderItemRow, OrderSummary, PaymentMethodSelector } from '@/components/molecules';
import { Button, Text } from '@/components/atoms';
import { OrderItem, apiClient } from '@/lib/api';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingCart, Trash2, ShoppingBag, CreditCard } from 'lucide-react';

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

  const itemCount = orderItems.length > 0 ? orderItems.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const hasItems = orderItems.length > 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative bg-card hover:bg-accent border-border">
          <ShoppingCart className="w-5 h-5 mr-2" />
          ตะกร้า
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[450px] sm:w-[540px] overflow-y-auto bg-background border-border">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="text-xl font-bold flex items-center">
            <ShoppingBag className="w-6 h-6 mr-3 text-primary" />
            รายการสั่งซื้อ
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <Text color="destructive" variant="caption">{error}</Text>
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <Text className="text-muted-foreground">กำลังโหลด...</Text>
            </div>
          ) : !hasItems ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <Text color="muted" className="text-xl mb-2 font-medium">ไม่มีรายการในตะกร้า</Text>
              <Text color="muted" variant="caption">
                เพิ่มรายการอาหารเพื่อเริ่มสั่งซื้อ
              </Text>
            </div>
          ) : (
            <>
              {/* Order Items */}
              <div className="space-y-4">
                <Text variant="h6" className="font-semibold">รายการอาหาร ({itemCount} รายการ)</Text>
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
              </div>

              {/* Order Summary */}
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Text className="text-muted-foreground">จำนวนรายการ:</Text>
                      <Text className="font-medium">{itemCount}</Text>
                    </div>
                    <div className="flex justify-between items-center">
                      <Text className="text-muted-foreground">ยอดรวม:</Text>
                      <Text className="font-medium">฿{total.toFixed(2)}</Text>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between items-center">
                        <Text className="font-bold text-lg">รวมทั้งสิ้น:</Text>
                        <Text className="font-bold text-xl text-primary">฿{total.toFixed(2)}</Text>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Section */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-primary" />
                    วิธีการชำระเงิน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <PaymentMethodSelector
                    selectedMethod={paymentMethod}
                    onMethodSelect={setPaymentMethod}
                    disabled={disabled || isPaymentLoading}
                  />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-t border-border">
                      <Text className="font-bold text-lg">ยอดที่ต้องชำระ:</Text>
                      <Text className="font-bold text-2xl text-primary">฿{total.toFixed(2)}</Text>
                    </div>
                    
                    <Button
                      onClick={handlePayment}
                      disabled={disabled || !hasItems || isPaymentLoading}
                      isLoading={isPaymentLoading}
                      className="w-full h-14 text-lg font-bold"
                      glow
                    >
                      {isPaymentLoading ? 'กำลังชำระเงิน...' : `ชำระเงิน ฿${total.toFixed(2)}`}
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