'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { OrderCart } from '@/components/organisms';
import { OrderItemRow } from '@/components/molecules';
import { Text, Button } from '@/components/atoms';
import { OrderWithItems, apiClient } from '@/lib/api';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string);
  const tableId = searchParams.get('table');
  
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await apiClient.getOrderWithItems(orderId);
        setOrder(response.data);
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    try {
      await apiClient.updateOrderItem(itemId, { quantity });
      // Refresh order data
      const response = await apiClient.getOrderWithItems(orderId);
      setOrder(response.data);
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await apiClient.removeOrderItem(itemId);
      // Refresh order data
      const response = await apiClient.getOrderWithItems(orderId);
      setOrder(response.data);
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleCloseOrder = async () => {
    try {
      await apiClient.closeOrder(orderId);
      router.push('/');
    } catch (err) {
      console.error('Failed to close order:', err);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <Text>กำลังโหลด...</Text>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <Text color="destructive">ไม่พบออร์เดอร์</Text>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <Text variant="h2">ออร์เดอร์ #{order.id}</Text>
              <Text variant="caption" color="muted">
                โต๊ะ {order.table?.table_number} • {order.status}
              </Text>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {order.status === 'open' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/tables/${tableId}/order`)}
                >
                  เพิ่มรายการ
                </Button>
                <OrderCart
                  orderId={order.id}
                  onPaymentComplete={() => router.push('/')}
                />
              </>
            )}
            
            {order.status === 'closed' && (
              <Button variant="outline" icon={Receipt}>
                พิมพ์ใบเสร็จ
              </Button>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>รายการอาหาร</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.items.length === 0 ? (
                  <Text color="muted" className="text-center py-8">
                    ไม่มีรายการอาหาร
                  </Text>
                ) : (
                  order.items.map((item) => (
                    <OrderItemRow
                      key={item.id}
                      item={item}
                      onUpdateQuantity={
                        order.status === 'open'
                          ? (quantity) => handleUpdateQuantity(item.id, quantity)
                          : undefined
                      }
                      onRemove={
                        order.status === 'open'
                          ? () => handleRemoveItem(item.id)
                          : undefined
                      }
                      disabled={order.status !== 'open'}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>สรุปออร์เดอร์</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Text>จำนวนรายการ:</Text>
                    <Text>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</Text>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <Text>รวมทั้งสิ้น:</Text>
                    <Text>฿{order.total.toFixed(2)}</Text>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>สร้างเมื่อ: {new Date(order.created_at).toLocaleString('th-TH')}</div>
                  {order.closed_at && (
                    <div>ปิดเมื่อ: {new Date(order.closed_at).toLocaleString('th-TH')}</div>
                  )}
                </div>

                {order.status === 'open' && order.items.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={handleCloseOrder}
                    className="w-full"
                  >
                    ปิดออร์เดอร์
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
