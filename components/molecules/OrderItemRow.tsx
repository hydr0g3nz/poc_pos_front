// components/molecules/OrderItemRow/OrderItemRow.tsx
import React from 'react';
import { Button, Text } from '@/components/atoms';
import { Trash2, Plus, Minus } from 'lucide-react';
import { OrderItem } from '@/lib/api';
import { cn } from '@/lib/utils';

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
    <div className={cn(
      'flex items-center justify-between p-4 border border-border rounded-lg bg-card transition-all duration-200',
      'hover:bg-accent/50'
    )}>
      <div className="flex-1 min-w-0 mr-4">
        <Text className="font-medium truncate text-foreground">
          {item.menu_item?.name || 'Unknown Item'}
        </Text>
        <div className="flex items-center space-x-2 mt-1">
          <Text variant="caption" className="text-muted-foreground">
            ฿{item.unit_price.toFixed(2)} × {item.quantity}
          </Text>
          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
          <Text variant="caption" className="text-primary font-medium">
            ฿{item.subtotal.toFixed(2)}
          </Text>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {onUpdateQuantity && (
          <div className="flex items-center space-x-2 bg-accent/30 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              disabled={disabled || item.quantity <= 1}
              className="h-8 w-8 rounded-md"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <div className="min-w-[2rem] text-center">
              <Text className="font-bold text-sm">
                {item.quantity}
              </Text>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              disabled={disabled}
              className="h-8 w-8 rounded-md"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}
        
        <div className="text-right min-w-[4rem]">
          <Text className="font-bold text-primary">
            ฿{item.subtotal.toFixed(2)}
          </Text>
        </div>
        
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={disabled}
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};