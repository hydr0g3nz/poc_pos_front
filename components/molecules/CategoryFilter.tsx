// components/molecules/CategoryFilter/CategoryFilter.tsx
import React from 'react';
import { Button } from '@/components/atoms';
import { Category } from '@/lib/api';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: number | null;
  onCategorySelect: (categoryId: number | null) => void;
  isLoading?: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  isLoading = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => onCategorySelect(null)}
          disabled={isLoading}
          className={cn(
            'h-12 px-6 font-medium transition-all duration-200',
            selectedCategory === null && 'active-glow'
          )}
        >
          ทั้งหมด
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            onClick={() => onCategorySelect(category.id)}
            disabled={isLoading}
            className={cn(
              'h-12 px-6 font-medium transition-all duration-200',
              selectedCategory === category.id && 'active-glow'
            )}
          >
            {category.name}
          </Button>
        ))}
      </div>
      
      {/* Category indicators */}
      <div className="flex items-center space-x-2">
        <div className="h-1 bg-gradient-to-r from-primary/50 to-transparent flex-1 rounded-full"></div>
        <div className="text-xs text-muted-foreground">
          {categories.length} หมวดหมู่
        </div>
      </div>
    </div>
  );
};