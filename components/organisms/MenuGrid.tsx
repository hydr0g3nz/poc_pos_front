
// components/organisms/MenuGrid/MenuGrid.tsx
import React, { useState, useEffect } from 'react';
import { MenuItemCard, CategoryFilter, SearchBar } from '@/components/molecules';
import { Spinner, Text } from '@/components/atoms';
import { MenuItem, Category, apiClient } from '@/lib/api';

interface MenuGridProps {
  onAddItem: (item: MenuItem, quantity: number) => void;
  cartItems: Record<number, number>;
  disabled?: boolean;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  onAddItem,
  cartItems,
  disabled = false,
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.getCategories();
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('ไม่สามารถโหลดหมวดหมู่ได้');
      }
    };

    fetchCategories();
  }, []);

  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let response;
        
        if (searchQuery) {
          response = await apiClient.searchMenuItems(searchQuery, 100, 0);
        } else if (selectedCategory) {
          response = await apiClient.getMenuItemsByCategory(selectedCategory, 100, 0);
        } else {
          response = await apiClient.getMenuItems(100, 0);
        }
        
        setMenuItems(response.data.items);
      } catch (err) {
        console.error('Failed to fetch menu items:', err);
        setError('ไม่สามารถโหลดรายการเมนูได้');
        setMenuItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [selectedCategory, searchQuery]);

  const handleQuantityChange = (item: MenuItem, quantity: number) => {
    if (quantity > 0) {
      onAddItem(item, quantity);
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <Text color="destructive">{error}</Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <SearchBar
        onSearch={setSearchQuery}
        placeholder="ค้นหาเมนู..."
      />

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        isLoading={isLoading}
      />

      {/* Menu Items Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              quantity={cartItems[item.id] || 0}
              onQuantityChange={(quantity) => handleQuantityChange(item, quantity)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {!isLoading && menuItems.length === 0 && (
        <div className="text-center py-8">
          <Text color="muted">ไม่พบรายการเมนู</Text>
        </div>
      )}
    </div>
  );
};