// components/molecules/OrderStatusCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Text } from '@/components/atoms';
import { Clock, CheckCircle, XCircle, AlertCircle, ChefHat, Bell } from 'lucide-react';
import { Order, OrderItem } from '@/lib/api';
import { cn } from '@/lib/utils';

interface OrderStatusCardProps {
  order: Order;
  items?: OrderItem[];
  onOrderClick?: (order: Order) => void;
  showDetails?: boolean;
  className?: string;
}

export const OrderStatusCard: React.FC<OrderStatusCardProps> = ({
  order,
  items = [],
  onOrderClick,
  showDetails = false,
  className,
}) => {
  const getOrderStatusInfo = (status: string) => {
    switch (status) {
      case 'open':
        return { 
          icon: Clock, 
          color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', 
          text: 'กำลังสั่ง',
          bgColor: 'bg-blue-50'
        };
      case 'confirmed':
        return { 
          icon: CheckCircle, 
          color: 'bg-green-500/10 text-green-500 border-green-500/20', 
          text: 'ยืนยันแล้ว',
          bgColor: 'bg-green-50'
        };
      case 'preparing':
        return { 
          icon: ChefHat, 
          color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', 
          text: 'กำลังทำอาหาร',
          bgColor: 'bg-orange-50'
        };
      case 'ready':
        return { 
          icon: Bell, 
          color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', 
          text: 'พร้อมเสิร์ฟ',
          bgColor: 'bg-purple-50'
        };
      case 'served':
        return { 
          icon: CheckCircle, 
          color: 'bg-green-600/10 text-green-600 border-green-600/20', 
          text: 'เสิร์ฟแล้ว',
          bgColor: 'bg-green-100'
        };
      case 'closed':
        return { 
          icon: XCircle, 
          color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', 
          text: 'ปิดแล้ว',
          bgColor: 'bg-gray-50'
        };
      default:
        return { 
          icon: Clock, 
          color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', 
          text: status,
          bgColor: 'bg-gray-50'
        };
    }
  };

  const statusInfo = getOrderStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const getTimeDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'เพิ่งสั่ง';
    if (hours < 1) return `${minutes} นาทีที่แล้ว`;
    return `${hours} ชั่วโมงที่แล้ว`;
  };

  return (
    <Card 
      className={cn(
        'border-border transition-all duration-200 hover:shadow-md',
        onOrderClick && 'cursor-pointer hover:border-primary/50',
        className
      )}
      onClick={() => onOrderClick?.(order)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              statusInfo.bgColor
            )}>
              <StatusIcon className={cn('w-5 h-5', statusInfo.color.split(' ')[1])} />
            </div>
            <div>
              <CardTitle className="text-lg">
                ออเดอร์ #{order.id}
              </CardTitle>
              <Text variant="caption" className="text-muted-foreground">
                {getTimeDisplay(order.created_at)}
              </Text>
            </div>
          </div>
          
          <Badge className={cn('border', statusInfo.color)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.text}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {showDetails && items.length > 0 && (
          <div className="space-y-3 mb-4">
            <Text variant="h6" className="font-semibold">รายการอาหาร</Text>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex-1">
                    <Text className="font-medium">{item.menu_item?.name}</Text>
                    <Text variant="caption" className="text-muted-foreground">
                      ฿{item.unit_price.toFixed(2)} × {item.quantity}
                    </Text>
                  </div>
                  <Text className="font-medium">
                    ฿{item.subtotal.toFixed(2)}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {totalItems > 0 ? `${totalItems} รายการ` : 'ยังไม่มีรายการ'}
          </div>
          <div className="text-right">
            <Text className="font-bold text-lg text-primary">
              ฿{totalAmount.toFixed(2)}
            </Text>
          </div>
        </div>
        
        {order.notes && (
          <div className="mt-3 p-3 bg-accent/30 rounded-lg">
            <Text variant="caption" className="text-muted-foreground">
              หมายเหตุ: {order.notes}
            </Text>
          </div>
        )}
      </CardContent>
    </Card>
  );
};