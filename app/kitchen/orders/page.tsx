'use client';
import { useState, useEffect } from 'react';
import { KitchenLayout } from '@/components/templates/KitchenLayout';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { apiClient } from '@/lib/api';
import { Order, OrderItem } from '@/types';

export default function KitchenOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<number, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchOpenOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getOrdersByStatus('open', 100, 0);
      const openOrders = response.data.orders;
      setOrders(openOrders);

      // Fetch items for each order
      const itemsMap: Record<number, OrderItem[]> = {};
      for (const order of openOrders) {
        try {
          const orderWithItems = await apiClient.getOrderWithItems(order.id);
          itemsMap[order.id] = orderWithItems.data.items || [];
        } catch (error) {
          console.error(`Failed to fetch items for order ${order.id}:`, error);
          itemsMap[order.id] = [];
        }
      }
      setOrderItems(itemsMap);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOpenOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'เพิ่งสั่ง';
    if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours} ชั่วโมงที่แล้ว`;
  };

  const getUrgencyColor = (dateString: string) => {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffMinutes > 30) return 'danger';
    if (diffMinutes > 15) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <KitchenLayout>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </KitchenLayout>
    );
  }

  return (
    <KitchenLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">ออเดอร์ครัว</h1>
          <div className="flex items-center space-x-4">
            <Badge variant="warning">ออเดอร์รอ: {orders.length}</Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchOpenOrders}
            >
              รีเฟรช
            </Button>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-gray-500">
              <p className="text-lg">ไม่มีออเดอร์รอทำ</p>
              <p className="text-sm mt-1">ออเดอร์ใหม่จะแสดงที่นี่</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="space-y-4">
                  {/* Order Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                        <Badge variant={getUrgencyColor(order.created_at)}>
                          {getTimeAgo(order.created_at)}
                        </Badge>
                      </div>
                      <p className="text-gray-600">
                        โต๊ะ {order.table?.table_number} • {new Date(order.created_at).toLocaleTimeString('th-TH')}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">รายการอาหาร</h4>
                    <div className="grid gap-2">
                      {(orderItems[order.id] || []).map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.notes && (
                              <p className="text-sm text-red-600 font-medium">
                                ⚠️ {item.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-blue-600">
                              × {item.quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t">
                    <Button
                      variant="success"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        // Mark as prepared - this would typically update order status
                        console.log(`Order ${order.id} marked as prepared`);
                      }}
                    >
                      ✅ ทำเสร็จแล้ว
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </KitchenLayout>
  );
}