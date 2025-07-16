// app/customer/confirmation/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button, Text } from '@/components/atoms';
import { OrderStatusCard, OrderProgressBar } from '@/components/molecules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order, OrderItem, apiClient } from '@/lib/api';
import { CheckCircle, Clock, ArrowLeft, Home } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const tableId = searchParams.get('tableId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrderData();
    }
  }, [orderId]);

  const loadOrderData = async () => {
    if (!orderId) return;
    
    setIsLoading(true);
    try {
      const [orderResponse, itemsResponse] = await Promise.all([
        apiClient.getOrder(parseInt(orderId)),
        apiClient.getOrderItems(parseInt(orderId))
      ]);
      
      setOrder(orderResponse.data);
      setOrderItems(itemsResponse.data);
    } catch (err) {
      console.error('Failed to load order:', err);
      setError('ไม่สามารถโหลดข้อมูลออเดอร์ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleContinueOrdering = () => {
    router.push(`/customer?table=${tableId}&order=${orderId}`);
  };

  const handleTrackOrder = () => {
    router.push(`/customer/orders?table=${tableId}&order=${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <Text className="text-muted-foreground">กำลังโหลด...</Text>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Text color="destructive" className="mb-4">
              {error || 'ไม่พบข้อมูลออเดอร์'}
            </Text>
            <Button onClick={() => router.push('/customer')} className="w-full">
              กลับหน้าหลัก
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Success Header */}
        <div className="text-center pt-12 pb-6">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <Text variant="h4" className="font-bold text-green-600 mb-2">
            สั่งอาหารเรียบร้อย!
          </Text>
          <Text className="text-muted-foreground">
            ออเดอร์ของคุณได้รับการบันทึกแล้ว
          </Text>
        </div>

        {/* Order Progress */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-center">
              ออเดอร์ #{order.id}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <OrderProgressBar currentStatus={order.status} />
            
            <div className="text-center">
              <Text className="text-muted-foreground mb-2">
                โต๊ะ {tableId}
              </Text>
              <Text variant="caption" className="text-muted-foreground">
                {new Date(order.created_at).toLocaleString('th-TH')}
              </Text>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>สรุปรายการ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
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
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <Text className="text-muted-foreground">
                  รวม {totalItems} รายการ
                </Text>
                <Text className="font-bold text-xl text-primary">
                  ฿{totalAmount.toFixed(2)}
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estimated Time */}
        <Card className="border-0 shadow-lg bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-3">
              <Clock className="w-6 h-6 text-blue-500" />
              <div className="text-center">
                <Text className="font-medium text-blue-700">
                  เวลารอประมาณ
                </Text>
                <Text className="text-2xl font-bold text-blue-600">
                  15-20 นาที
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleTrackOrder}
            className="w-full h-14 text-lg font-semibold bg-blue-500 hover:bg-blue-600"
            glow
          >
            <Clock className="w-5 h-5 mr-2" />
            ติดตามออเดอร์
          </Button>
          
          <Button
            onClick={handleContinueOrdering}
            variant="outline"
            className="w-full h-14 text-lg font-semibold"
          >
            <Home className="w-5 h-5 mr-2" />
            สั่งอาหารเพิ่ม
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 pb-4">
          <Text variant="caption" className="text-muted-foreground">
            ขอบคุณที่ใช้บริการ
          </Text>
        </div>
      </div>
    </div>
  );
}