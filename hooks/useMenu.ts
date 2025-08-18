// hooks/useMenu.ts
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { MenuItem, Category } from "@/types";

export function useMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = async (categoryId?: number, searchQuery?: string) => {
    try {
      setLoading(true);
      let response;

      if (searchQuery) {
        response = await apiClient.searchMenuItems(searchQuery, 100, 0);
      } else if (categoryId) {
        response = await apiClient.getMenuItemsByCategory(categoryId, 100, 0);
      } else {
        response = await apiClient.getMenuItems(100, 0);
      }

      setMenuItems(response.data.items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch menu items"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      setCategories(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch categories"
      );
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  return {
    menuItems,
    categories,
    loading,
    error,
    fetchMenuItems,
    refetch: () => fetchMenuItems(),
  };
}
