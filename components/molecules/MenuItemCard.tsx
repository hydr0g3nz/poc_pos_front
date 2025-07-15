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
  imageUrl?: string;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  quantity = 0,
  onAdd,
  onRemove,
  onQuantityChange,
  disabled = false,
  showQuantityControls = true,
  imageUrl = "https://s359.kapook.com/pagebuilder/16b6c2f7-63b9-4cfe-8601-41c47ca32eea.jpg",
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
      'group relative overflow-hidden transition-all duration-300 hover-lift card-shadow',
      disabled && 'opacity-50 cursor-not-allowed',
      quantity > 0 && 'ring-2 ring-primary'
    )}>
      {/* Food Image */}
      <div className="relative h-48 bg-gradient-to-br from-muted/50 to-accent/30 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Text variant="h3" className="text-primary">
                {item.name.charAt(0)}
              </Text>
            </div>
          </div>
        )}
        
        {/* Quantity Badge */}
        {quantity > 0 && (
          <div className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Text variant="caption" className="font-bold text-primary-foreground">
              {quantity}
            </Text>
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
            ฿{item.price.toFixed(2)}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold line-clamp-1">
          {item.name}
        </CardTitle>
        {item.description && (
          <Text variant="caption" className="text-muted-foreground line-clamp-2">
            {item.description}
          </Text>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {showQuantityControls && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecrease}
                disabled={disabled || quantity === 0}
                className="h-9 w-9 rounded-full"
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <div className="min-w-[2.5rem] text-center">
                <Text className="font-bold text-lg">
                  {quantity}
                </Text>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncrease}
                disabled={disabled}
                className="h-9 w-9 rounded-full"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {quantity > 0 && (
              <div className="text-right">
                <Text variant="caption" className="text-muted-foreground">
                  รวม
                </Text>
                <Text className="font-bold text-primary">
                  ฿{(item.price * quantity).toFixed(2)}
                </Text>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};