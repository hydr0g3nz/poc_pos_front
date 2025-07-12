// components/molecules/OrderSummary/OrderSummary.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text, Button } from '@/components/atoms';
import { OrderItem } from '@/lib/api';

interface OrderSummaryProps {
  items: OrderItem[];
  total: number;
  onCheckout?: () => void;
  isLoading?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  total,
  onCheckout,
  isLoading = false,
}) => {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">สรุปรายการ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="truncate">
                {item.menu_item?.name} × {item.quantity}
              </span>
              <span>฿{item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-2">
          <div className="flex justify-between items-center">
            <Text className="font-medium">จำนวนรายการ:</Text>
            <Text className="font-medium">{itemCount}</Text>
          </div>
          <div className="flex justify-between items-center">
            <Text className="font-bold text-lg">รวมทั้งสิ้น:</Text>
            <Text className="font-bold text-lg">฿{total.toFixed(2)}</Text>
          </div>
        </div>

        {onCheckout && (
          <Button
            onClick={onCheckout}
            disabled={items.length === 0 || isLoading}
            isLoading={isLoading}
            className="w-full"
          >
            ชำระเงิน
          </Button>
        )}
      </CardContent>
    </Card>
  );
};