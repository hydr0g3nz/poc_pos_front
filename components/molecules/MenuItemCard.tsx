import { MenuItem } from '@/types';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';

interface MenuItemCardProps {
  menuItem: MenuItem;
  onAddToCart: (menuItem: MenuItem, quantity: number) => void;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
}

export function MenuItemCard({ 
  menuItem, 
  onAddToCart, 
  quantity = 1, 
  onQuantityChange 
}: MenuItemCardProps) {
  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    onQuantityChange?.(newQuantity);
  };

  return (
    <Card className="p-4" hoverable>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900">{menuItem.name}</h3>
          <Badge variant="default">฿{menuItem.price}</Badge>
        </div>
        
        {menuItem.description && (
          <p className="text-sm text-gray-600">{menuItem.description}</p>
        )}
        
        {menuItem.category && (
          <Badge variant="success" size="sm">{menuItem.category.name}</Badge>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleQuantityChange(-1)}
            >
              -
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleQuantityChange(1)}
            >
              +
            </Button>
          </div>
          
          <Button
            size="sm"
            onClick={() => onAddToCart(menuItem, quantity)}
          >
            เพิ่มในตะกร้า
          </Button>
        </div>
      </div>
    </Card>
  );
}