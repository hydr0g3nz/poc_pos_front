// components/molecules/OrderItemRow/OrderItemRow.tsx
import React from 'react';
import { Button, Text } from '@/components/atoms';
import { Trash2, Plus, Minus } from 'lucide-react';
import { OrderItem } from '@/lib/api';

interface OrderItemRowProps {
  item: OrderItem;
  onUpdateQuantity?: (quantity: number) => void;
  onRemove?: () => void;
  disabled?: boolean;
}

export const OrderItemRow: React.FC<OrderItemRowProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1 min-w-0">
        <Text className="font-medium truncate">
          {item.menu_item?.name || 'Unknown Item'}
        </Text>
        <Text variant="caption">
          ฿{item.unit_price.toFixed(2)} × {item.quantity}
        </Text>
      </div>
      
      <div className="flex items-center space-x-2 ml-4">
        {onUpdateQuantity && (
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              disabled={disabled || item.quantity <= 1}
              className="h-6 w-6"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <Text className="min-w-[1.5rem] text-center text-sm">
              {item.quantity}
            </Text>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              disabled={disabled}
              className="h-6 w-6"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}
        
        <Text className="font-semibold min-w-[4rem] text-right">
          ฿{item.subtotal.toFixed(2)}
        </Text>
        
        {onRemove && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRemove}
            disabled={disabled}
            className="h-6 w-6 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
