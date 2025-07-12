// components/molecules/CategoryFilter/CategoryFilter.tsx
import React from 'react';
import { Button } from '@/components/atoms';
import { Category } from '@/lib/api';
// import { cn } from '@/lib/utils';

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
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        variant={selectedCategory === null ? 'default' : 'outline'}
        onClick={() => onCategorySelect(null)}
        disabled={isLoading}
        className="whitespace-nowrap"
      >
        ทั้งหมด
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          onClick={() => onCategorySelect(category.id)}
          disabled={isLoading}
          className="whitespace-nowrap"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};