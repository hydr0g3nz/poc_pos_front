// components/molecules/SearchBar/SearchBar.tsx
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/atoms';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/atoms';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'ค้นหาเมนู...',
  onSearch,
  debounceMs = 300,
  className,
}) => {
  const [query, setQuery] = useState('');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(() => {
        onSearch(searchQuery);
      }, debounceMs);

      setTimeoutId(newTimeoutId);
    },
    [onSearch, debounceMs, timeoutId]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <Search className="w-4 h-4 text-muted-foreground" />
      </div>
      <Input
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};