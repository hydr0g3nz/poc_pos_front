import { useOrder } from '@/context/OrderContext';
import { OrderItem } from '@/components/molecules/OrderItem';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';

interface OrderSummaryProps {
  onCheckout?: () => void;
  readonly?: boolean;
  showActions?: boolean;
}

export function OrderSummary({ onCheckout, readonly = false, showActions = true }: OrderSummaryProps) {
  const { state, updateCartItem, removeFromCart, clearCart } = useOrder();
  const { cartItems, total, selectedTable } = state;

  const handleUpdateNotes = (tempId: string, notes: string) => {
    const item = cartItems.find(item => item.tempId === tempId);
    if (item) {
      updateCartItem(tempId, item.quantity, notes);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <p>ตะกร้าว่าง</p>
          <p className="text-sm mt-1">เพิ่มเมนูเพื่อเริ่มสั่งอาหาร</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">รายการสั่งอาหาร</h3>
          {selectedTable && (
            <Badge variant="success">โต๊ะ {selectedTable}</Badge>
          )}
        </div>

        {/* Order Items */}
        <div className="space-y-0 max-h-96 overflow-y-auto">
          {cartItems.map((item) => (
            <OrderItem
              key={item.tempId}
              item={item}
              onUpdateQuantity={updateCartItem}
              onUpdateNotes={handleUpdateNotes}
              onRemove={removeFromCart}
              readonly={readonly}
            />
          ))}
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">รวมทั้งสิ้น</span>
            <span className="text-xl font-bold text-green-600">฿{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && !readonly && (
          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={onCheckout}
              disabled={cartItems.length === 0 || !selectedTable}
            >
              ยืนยันการสั่งอาหาร
            </Button>
            <Button
              className="w-full"
              variant="secondary"
              onClick={clearCart}
            >
              ล้างตะกร้า
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}