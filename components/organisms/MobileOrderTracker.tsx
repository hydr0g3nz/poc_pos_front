// components/organisms/MobileOrderTracker.tsx
import React, { useState, useEffect } from 'react';
import { OrderStatusCard, OrderProgressBar } from '@/components/molecules';
import { Button, Text } from '@/components/atoms';
import { Order, OrderItem, apiClient } from '@/lib/api';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileOrderTrackerProps {
  tableId: number;
  onBack?: () => void;
  className?: string;
}

export const MobileOrderTracker: React.FC<MobileOrderTrackerProps> = ({
  tableId,
  onBack,
  className,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<number, OrderItem[]>>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const ordersResponse = await apiClient.getOrdersByTable(tableId, 20, 0);
      const ordersList = ordersResponse.data.orders;
      setOrders(ordersList);
      
      // Load items for each order
      const itemsData: Record<number, OrderItem[]> = {};
      await Promise.all(
        ordersList.map(async (order) => {
          try {
            const itemsResponse = await apiClient.getOrderItems(order.id);
            itemsData[order.id] = itemsResponse.data;
          } catch (err) {
            console.error(`Failed to load items for order ${order.id}:`, err);
            itemsData[order.id] = [];
          }
        })
      );
      
      setOrderItems(itemsData);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('ไม่สามารถโหลดข้อมูลออเดอร์ได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [tableId]);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(selectedOrder?.id === order.id ? null : order);
  };

  if (selectedOrder) {
    return (
      <div className={cn('h-full bg-background', className)}>
        <div className="sticky top-0 bg-card border-b border-border p-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedOrder(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <Text variant="h6" className="font-bold">
                  ออเดอร์ #{selectedOrder.id}
                </Text>
                <Text variant="caption" className="text-muted-foreground">
                  ติดตามสถานะ
                </Text>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={loadOrders}
              disabled={isLoading}
            >
              <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-6">
          <OrderProgressBar currentStatus={selectedOrder.status} />
          
          <OrderStatusCard
            order={selectedOrder}
            items={orderItems[selectedOrder.id] || []}
            showDetails={true}
          />
          
          <div className="space-y-4">
            <Text variant="h6" className="font-semibold">ประวัติการอัปเดต</Text>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-accent/30 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div>
                  <Text className="font-medium">สั่งอาหารเรียบร้อย</Text>
                  <Text variant="caption" className="text-muted-foreground">
                    {new Date(selectedOrder.created_at).toLocaleString('th-TH')}
                  </Text>
                </div>
              </div>
              
              {selectedOrder.status !== 'open' && (
                <div className="flex items-center space-x-3 p-3 bg-accent/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div>
                    <Text className="font-medium">ยืนยันออเดอร์แล้ว</Text>
                    <Text variant="caption" className="text-muted-foreground">
                      {new Date(selectedOrder.updated_at).toLocaleString('th-TH')}
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('h-full bg-background', className)}>
      <div className="sticky top-0 bg-card border-b border-border p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <Text variant="h6" className="font-bold">
                ออเดอร์ของฉัน
              </Text>
              <Text variant="caption" className="text-muted-foreground">
                โต๊ะ {tableId}
              </Text>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadOrders}
            disabled={isLoading}
          >
            <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <Text color="destructive" className="text-center">{error}</Text>
          </div>
        )}
        
        {isLoading && orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <Text className="text-muted-foreground">กำลังโหลด...</Text>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Text color="muted" className="text-lg">ยังไม่มีออเดอร์</Text>
            <Text color="muted" variant="caption">
              เริ่มสั่งอาหารจากเมนูเพื่อดูออเดอร์
            </Text>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderStatusCard
                key={order.id}
                order={order}
                items={orderItems[order.id] || []}
                onOrderClick={handleOrderClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};