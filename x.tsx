



// app/tables/[id]/order/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/templates/MainLayout/MainLayout';
import { MenuGrid, OrderCart } from '@/components/organisms';
import { Text, Button } from '@/components/atoms';
import { MenuItem, Table, Order, apiClient } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TableOrderPage() {
  const params = useParams();
  const router = useRouter();
  const tableId = parseInt(params.id as string);
  
  const [table, setTable] = useState<Table | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [cartItems, setCartItems] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeOrder = async () => {
      try {
        setIsLoading(true);
        
        // Get table info
        const tableResponse = await apiClient.getTable(tableId);
        setTable(tableResponse.data);
        
        // Check for existing open order
        try {
          const orderResponse = await apiClient.getOpenOrderByTable(tableId);
          setOrder(orderResponse.data);
          
          // Load existing order items into cart
          const itemsResponse = await apiClient.getOrderItems(orderResponse.data.id);
          const items: Record<number, number> = {};
          itemsResponse.data.forEach(item => {
            items[item.item_id] = item.quantity;
          });
          setCartItems(items);
        } catch (err) {
          // No existing order, create new one
          const newOrderResponse = await apiClient.createOrder(tableId);
          setOrder(newOrderResponse.data);
        }
      } catch (err) {
        console.error('Failed to initialize order:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (tableId) {
      initializeOrder();
    }
  }, [tableId]);

  const handleAddItem = async (item: MenuItem, quantity: number) => {
    if (!order) return;

    try {
      const currentQuantity = cartItems[item.id] || 0;
      const difference = quantity - currentQuantity;

      if (difference > 0) {
        // Add items
        await apiClient.addOrderItem({
          order_id: order.id,
          item_id: item.id,
          quantity: difference,
        });
      } else if (difference < 0) {
        // Find existing order item and update quantity
        const itemsResponse = await apiClient.getOrderItems(order.id);
        const existingItem = itemsResponse.data.find(oi => oi.item_id === item.id);
        
        if (existingItem) {
          if (quantity === 0) {
            await apiClient.removeOrderItem(existingItem.id);
          } else {
            await apiClient.updateOrderItem(existingItem.id, { quantity });
          }
        }
      }

      // Update cart state
      if (quantity === 0) {
        const newCart = { ...cartItems };
        delete newCart[item.id];
        setCartItems(newCart);
      } else {
        setCartItems(prev => ({ ...prev, [item.id]: quantity }));
      }
    } catch (err) {
      console.error('Failed to update order item:', err);
    }
  };

  const handlePaymentComplete = () => {
    router.push('/');
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
              <Text variant="h2">โต๊ะ {table?.table_number}</Text>
              <Text variant="caption" color="muted">
                ออร์เดอร์ #{order?.id}
              </Text>
            </div>
          </div>
          
          {order && (
            <OrderCart
              orderId={order.id}
              onPaymentComplete={handlePaymentComplete}
            />
          )}
        </div>

        {/* Menu Grid */}
        <MenuGrid
          onAddItem={handleAddItem}
          cartItems={cartItems}
        />
      </div>
    </MainLayout>
  );
}

// app/orders/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/templates/MainLayout/MainLayout';
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

// app/reports/page.tsx
'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/templates/MainLayout/MainLayout';
import { RevenueOverview } from '@/components/organisms';
import { RevenueCard } from '@/components/molecules';
import { Text, Button } from '@/components/atoms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Text variant="h2">รายงานยอดขาย</Text>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" icon={CalendarIcon}>
                  {format(selectedDate, 'dd/MM/yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={th}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" icon={Download}>
              ส่งออกรายงาน
            </Button>
          </div>
        </div>

        {/* Revenue Overview */}
        <RevenueOverview selectedDate={selectedDate} />

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>รายงานรายวัน</CardTitle>
            </CardHeader>
            <CardContent>
              <Text color="muted">รายงานรายละเอียดสำหรับวันที่เลือก</Text>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>รายงานรายเดือน</CardTitle>
            </CardHeader>
            <CardContent>
              <Text color="muted">สรุปรายได้ประจำเดือน</Text>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

// app/qr-scanner/page.tsx
'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/templates/MainLayout/MainLayout';
import { Text, Button, Input } from '@/components/atoms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function QRScannerPage() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!qrCode.trim()) {
      setError('กรุณาใส่ QR Code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Scan QR Code
      const scanResponse = await apiClient.scanQRCode(qrCode);
      const { table_id, has_open_order, open_order } = scanResponse.data;

      if (has_open_order && open_order) {
        router.push(`/orders/${open_order.id}?table=${table_id}`);
      } else {
        router.push(`/tables/${table_id}/order`);
      }
    } catch (err) {
      console.error('QR scan failed:', err);
      setError('QR Code ไม่ถูกต้องหรือไม่พบข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Text variant="h2">สแกน QR Code</Text>
        </div>

        {/* QR Scanner Card */}
        <Card>
          <CardHeader className="text-center">
            <QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle>สแกน QR Code ของโต๊ะ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="ใส่ QR Code หรือสแกนด้วยกล้อง"
              error={error || undefined}
            />
            
            <Button
              onClick={handleScan}
              disabled={!qrCode.trim() || isLoading}
              isLoading={isLoading}
              className="w-full"
            >
              สแกน
            </Button>
            
            <Text variant="caption" color="muted" className="text-center">
              หรือเลือกโต๊ะจากหน้าแดชบอร์ด
            </Text>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}