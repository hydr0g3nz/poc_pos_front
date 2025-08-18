import { useState } from 'react';
import { MenuItem, Category } from '@/types';
import { MenuItemCard } from '@/components/molecules/MenuItemCard';
import { CategoryFilter } from '@/components/molecules/CategoryFilter';
import { Input } from '@/components/atoms/Input';
import { useOrder } from '@/context/OrderContext';

interface MenuGridProps {
  menuItems: MenuItem[];
  categories: Category[];
  loading?: boolean;
  onSearch?: (query: string) => Promise<void>;
}

export function MenuGrid({ menuItems, categories, loading = false, onSearch }: MenuGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const { addToCart } = useOrder();

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = !selectedCategory || item.category_id === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setQuantities(prev => ({ ...prev, [itemId]: quantity }));
  };

  const handleAddToCart = (menuItem: MenuItem, quantity: number) => {
    addToCart(menuItem, quantity);
    // Reset quantity to 1 after adding
    setQuantities(prev => ({ ...prev, [menuItem.id]: 1 }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Input
        placeholder="ค้นหาเมนู..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <MenuItemCard
            key={item.id}
            menuItem={item}
            quantity={quantities[item.id] || 1}
            onQuantityChange={(quantity) => handleQuantityChange(item.id, quantity)}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">ไม่พบเมนูที่ค้นหา</p>
        </div>
      )}
    </div>
  );
}