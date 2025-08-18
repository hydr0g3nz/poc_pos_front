import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Modal } from '@/components/atoms/Modal';
import { Input } from '@/components/atoms/Input';
import { useOrderAPI } from '@/hooks/useOrder';
import { Order, OrderItem } from '@/types';

interface AdminPanelProps {
  orders: Order[];
  onOrderUpdate?: () => void;
}

export function AdminPanel({ orders, onOrderUpdate }: AdminPanelProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const { getOrderWithItems, closeOrder, printReceipt, printQRCode, loading } = useOrderAPI();

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    const orderWithItems = await getOrderWithItems(order.id);
    if (orderWithItems) {
      setOrderItems(orderWithItems.items || []);
    }
    setShowOrderDetails(true);
  };

  const handleCloseOrder = async (orderId: number) => {
    const result = await closeOrder(orderId);
    if (result) {
      setShowOrderDetails(false);
      onOrderUpdate?.();
    }
  };

  const handlePrintReceipt = async (orderId: number) => {
    await printReceipt(orderId);
  };

  const handlePrintQRCode = async (orderId: number) => {
    await printQRCode(orderId);
  };

  const getStatusColor = (status: string) => {
    return status === 'open' ? 'warning' : 'success';
  };

  const getStatusText = (status: string) => {
    return status === 'open' ? 'เปิด' : 'ปิด';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">จัดการออเดอร์</h2>
        <Badge variant="default">ออเดอร์ทั้งหมด: {orders.length}</Badge>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">Order #{order.id}</h3>
                  <Badge variant={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  โต๊ะ {order.table?.table_number} • {new Date(order.created_at).toLocaleString('th-TH')}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleViewOrder(order)}
                >
                  ดูรายละเอียด
                </Button>
                
                {order.status === 'open' && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleCloseOrder(order.id)}
                    loading={loading}
                  >
                    ปิดออเดอร์
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handlePrintReceipt(order.id)}
                >
                  พิมพ์ใบเสร็จ
                </Button>
                
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handlePrintQRCode(order.id)}
                >
                  พิมพ์ QR
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={showOrderDetails}
        onClose={() => setShowOrderDetails(false)}
        title={`รายละเอียด Order #${selectedOrder?.id}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">โต๊ะ</p>
                <p className="font-medium">{selectedOrder.table?.table_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">สถานะ</p>
                <Badge variant={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">เวลาสั่ง</p>
                <p className="font-medium">
                  {new Date(selectedOrder.created_at).toLocaleString('th-TH')}
                </p>
              </div>
              {selectedOrder.closed_at && (
                <div>
                  <p className="text-sm text-gray-600">เวลาปิด</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.closed_at).toLocaleString('th-TH')}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">รายการอาหาร</h4>
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.notes && (
                        <p className="text-sm text-gray-600">หมายเหตุ: {item.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p>จำนวน: {item.quantity}</p>
                      <p className="font-medium">฿{item.subtotal}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">รวมทั้งสิ้น</span>
                  <span className="text-xl font-bold text-green-600">
                    ฿{orderItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              {selectedOrder.status === 'open' && (
                <Button
                  variant="success"
                  onClick={() => handleCloseOrder(selectedOrder.id)}
                  loading={loading}
                >
                  ปิดออเดอร์
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => handlePrintReceipt(selectedOrder.id)}
              >
                พิมพ์ใบเสร็จ
              </Button>
              <Button
                variant="secondary"
                onClick={() => handlePrintQRCode(selectedOrder.id)}
              >
                พิมพ์ QR Code
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}