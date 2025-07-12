// components/molecules/MenuItemCard/MenuItemCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, Badge, Text } from '@/components/atoms';
import { Plus, Minus } from 'lucide-react';
import { MenuItem } from '@/lib/api';
import { cn } from '@/lib/utils';

interface MenuItemCardProps {
  item: MenuItem;
  quantity?: number;
  onAdd?: () => void;
  onRemove?: () => void;
  onQuantityChange?: (quantity: number) => void;
  disabled?: boolean;
  showQuantityControls?: boolean;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  quantity = 0,
  onAdd,
  onRemove,
  onQuantityChange,
  disabled = false,
  showQuantityControls = true,
}) => {
  const handleIncrease = () => {
    if (onQuantityChange) {
      onQuantityChange(quantity + 1);
    } else if (onAdd) {
      onAdd();
    }
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      if (onQuantityChange) {
        onQuantityChange(quantity - 1);
      } else if (onRemove) {
        onRemove();
      }
    }
  };

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      disabled && 'opacity-50 cursor-not-allowed'
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{item.name}</CardTitle>
          <Badge variant="secondary">฿{item.price.toFixed(2)}</Badge>
        </div>
        {item.description && (
          <Text variant="caption" className="line-clamp-2">
            {item.description}
          </Text>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {showQuantityControls && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecrease}
                disabled={disabled || quantity === 0}
                className="h-8 w-8"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Text className="min-w-[2rem] text-center font-medium">
                {quantity}
              </Text>
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncrease}
                disabled={disabled}
                className="h-8 w-8"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {quantity > 0 && (
              <Text variant="caption" className="font-medium">
                ฿{(item.price * quantity).toFixed(2)}
              </Text>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
