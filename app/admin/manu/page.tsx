'use client';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/templates/AdminLayout';
import { MenuItemCard } from '@/components/molecules/MenuItemCard';
import { CategoryFilter } from '@/components/molecules/CategoryFilter';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Modal } from '@/components/atoms/Modal';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { useMenu } from '@/hooks/useMenu';
import { apiClient } from '@/lib/api';
import { MenuItem, Category } from '@/types';

export default function AdminMenuPage() {
  const { menuItems, categories, loading, fetchMenuItems } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category_id: 0,
  });

  const filteredItems = menuItems.filter(item => 
    !selectedCategory || item.category_id === selectedCategory
  );

  const handleAddItem = async () => {
    try {
      await apiClient.createMenuItem(formData);
      setShowAddModal(false);
      setFormData({ name: '', description: '', price: 0, category_id: 0 });
      fetchMenuItems();
    } catch (error) {
      console.error('Failed to create menu item:', error);
    }
  };

  const handleEditItem = async () => {
    if (!editingItem) return;
    
    try {
      await apiClient.updateMenuItem(editingItem.id, formData);
      setShowEditModal(false);
      setEditingItem(null);
      setFormData({ name: '', description: '', price: 0, category_id: 0 });
      fetchMenuItems();
    } catch (error) {
      console.error('Failed to update menu item:', error);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('ต้องการลบเมนูนี้หรือไม่?')) return;
    
    try {
      await apiClient.deleteMenuItem(itemId);
      fetchMenuItems();
    } catch (error) {
      console.error('Failed to delete menu item:', error);
    }
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category_id: item.category_id,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: 0, category_id: 0 });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">จัดการเมนู</h1>
          <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
            เพิ่มเมนูใหม่
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{menuItems.length}</div>
              <div className="text-sm text-gray-600">เมนูทั้งหมด</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
              <div className="text-sm text-gray-600">หมวดหมู่</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ฿{Math.min(...menuItems.map(item => item.price)).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">ราคาต่ำสุด</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ฿{Math.max(...menuItems.map(item => item.price)).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">ราคาสูงสุด</div>
            </div>
          </Card>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Menu Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <Badge variant="default">฿{item.price}</Badge>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600">{item.description}</p>
                  )}
                  
                  {item.category && (
                    <Badge variant="success" size="sm">{item.category.name}</Badge>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openEditModal(item)}
                    >
                      แก้ไข
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      ลบ
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add Menu Item Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="เพิ่มเมนูใหม่"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="ชื่อเมนู"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="กรอกชื่อเมนู"
            />
            
            <Input
              label="รายละเอียด"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="กรอกรายละเอียด (ไม่บังคับ)"
            />
            
            <Input
              label="ราคา (บาท)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              placeholder="กรอกราคา"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมวดหมู่
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>เลือกหมวดหมู่</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleAddItem}
                disabled={!formData.name || !formData.category_id}
                className="flex-1"
              >
                เพิ่มเมนู
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Menu Item Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="แก้ไขเมนู"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="ชื่อเมนู"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="กรอกชื่อเมนู"
            />
            
            <Input
              label="รายละเอียด"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="กรอกรายละเอียด (ไม่บังคับ)"
            />
            
            <Input
              label="ราคา (บาท)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              placeholder="กรอกราคา"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมวดหมู่
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>เลือกหมวดหมู่</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleEditItem}
                disabled={!formData.name || !formData.category_id}
                className="flex-1"
              >
                บันทึกการแก้ไข
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}