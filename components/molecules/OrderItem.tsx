import { CartItem } from '@/types';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useState } from 'react';

interface OrderItemProps {
  item: CartItem;
  onUpdateQuantity: (tempId: string, quantity: number) => void;
  onUpdateNotes: (tempId: string, notes: string) => void;
  onRemove: (tempId: string) => void;
  readonly?: boolean;
}

export function OrderItem({ 
  item, 
  onUpdateQuantity, 
  onUpdateNotes, 
  onRemove, 
  readonly = false 
}: OrderItemProps) {
  const [notes, setNotes] = useState(item.notes || '');
  const [showNotes, setShowNotes] = useState(false);

  const handleNotesSubmit = () => {
    onUpdateNotes(item.tempId, notes);
    setShowNotes(false);
  };

  return (
    <div className="border-b border-gray-200 py-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{item.name}</h4>
          <p className="text-sm text-gray-600">฿{item.unit_price} × {item.quantity}</p>
          {item.notes && (
            <p className="text-xs text-blue-600 mt-1">หมายเหตุ: {item.notes}</p>
          )}
        </div>
        
        <div className="text-right">
          <p className="font-medium text-gray-900">฿{item.subtotal}</p>
        </div>
      </div>
      
      {!readonly && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onUpdateQuantity(item.tempId, Math.max(1, item.quantity - 1))}
            >
              -
            </Button>
            <span className="w-8 text-center">{item.quantity}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onUpdateQuantity(item.tempId, item.quantity + 1)}
            >
              +
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowNotes(!showNotes)}
            >
              หมายเหตุ
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onRemove(item.tempId)}
            >
              ลบ
            </Button>
          </div>
        </div>
      )}
      
      {showNotes && !readonly && (
        <div className="mt-3 space-y-2">
          <Input
            placeholder="เพิ่มหมายเหตุ..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleNotesSubmit}>
              บันทึก
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setShowNotes(false)}>
              ยกเลิก
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}