'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { MenuItemCard, CategoryFilter, SearchBar } from '@/components/molecules';
import { Button, Text, Input } from '@/components/atoms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { MenuItem, Category, apiClient } from '@/lib/api';

interface MenuItemForm {
  name: string;
  description: string;
  price: number;
  category_id: number;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemForm>({
    name: '',
    description: '',
    price: 0,
    category_id: 0,
  });
  const [formErrors, setFormErrors] = useState<Partial<MenuItemForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validateForm = (): boolean => {
    const errors: Partial<MenuItemForm> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'กรุณาใส่ชื่อเมนู';
    }
    
    if (formData.price <= 0) {
      errors.price = 'กรุณาใส่ราคาที่ถูกต้อง';
    }
    
    if (!formData.category_id) {
      errors.category_id = 'กรุณาเลือกหมวดหมู่';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category_id: 0,
    });
    setFormErrors({});
    setEditingItem(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category_id: item.category_id,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingItem) {
        // Update existing item
        await apiClient.updateMenuItem(editingItem.id, formData);
      } else {
        // Create new item
        await apiClient.createMenuItem(formData);
      }
      
      // Refresh menu items
      const response = searchQuery
        ? await apiClient.searchMenuItems(searchQuery, 100, 0)
        : selectedCategory
        ? await apiClient.getMenuItemsByCategory(selectedCategory, 100, 0)
        : await apiClient.getMenuItems(100, 0);
      
      setMenuItems(response.data.items);
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save menu item:', err);
      setError(editingItem ? 'ไม่สามารถแก้ไขเมนูได้' : 'ไม่สามารถเพิ่มเมนูได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: MenuItem) => {
    try {
      await apiClient.deleteMenuItem(item.id);
      
      // Refresh menu items
      const response = searchQuery
        ? await apiClient.searchMenuItems(searchQuery, 100, 0)
        : selectedCategory
        ? await apiClient.getMenuItemsByCategory(selectedCategory, 100, 0)
        : await apiClient.getMenuItems(100, 0);
      
      setMenuItems(response.data.items);
    } catch (err) {
      console.error('Failed to delete menu item:', err);
      setError('ไม่สามารถลบเมนูได้');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Text variant="h2">จัดการเมนู</Text>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} icon={Plus}>
                เพิ่มเมนูใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Input
                    label="ชื่อเมนู"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ใส่ชื่อเมนู"
                    error={formErrors.name}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    หมวดหมู่
                  </label>
                  <Select
                    value={formData.category_id.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: parseInt(value) }))}
                  >
                    <SelectTrigger className={formErrors.category_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.category_id && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.category_id}</p>
                  )}
                </div>
                
                <div>
                  <Input
                    label="คำอธิบาย"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="คำอธิบายเมนู (ไม่บังคับ)"
                  />
                </div>
                
                <div>
                  <Input
                    label="ราคา (บาท)"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    error={formErrors.price}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  icon={X}
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  icon={Save}
                >
                  {editingItem ? 'บันทึก' : 'เพิ่ม'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <Text color="destructive" variant="caption">{error}</Text>
          </div>
        )}

        {/* Search and Filter */}
        <div className="space-y-4">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="ค้นหาเมนู..."
          />
          
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            isLoading={isLoading}
          />
        </div>

        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {menuItems.map((item) => (
              <Card key={item.id} className="transition-all duration-200 hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{item.name}</CardTitle>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(item)}
                        className="h-8 w-8"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                            <AlertDialogDescription>
                              คุณแน่ใจหรือไม่ที่จะลบเมนู "{item.name}" 
                              การกระทำนี้ไม่สามารถยกเลิกได้
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              ลบ
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  {item.description && (
                    <Text variant="caption" className="line-clamp-2">
                      {item.description}
                    </Text>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <Text className="font-semibold text-lg">
                      ฿{item.price.toFixed(2)}
                    </Text>
                    <Text variant="caption" className="bg-secondary px-2 py-1 rounded">
                      {categories.find(c => c.id === item.category_id)?.name || 'ไม่ระบุ'}
                    </Text>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && menuItems.length === 0 && (
          <div className="text-center py-12">
            <Text color="muted" className="text-lg mb-2">ไม่พบรายการเมนู</Text>
            <Text color="muted" variant="caption">
              คลิกปุ่ม "เพิ่มเมนูใหม่" เพื่อเริ่มต้น
            </Text>
          </div>
        )}
      </div>
    </MainLayout>
  );
}