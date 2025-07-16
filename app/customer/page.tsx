'use client';

import React, { useState, useEffect } from 'react';
import { Button, Text, Input } from '@/components/atoms';
import { MenuItemCard, SearchBar, CategoryFilter, OrderStatusCard } from '@/components/molecules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { MenuItem, Category, Order, OrderItem, apiClient } from '@/lib/api';
import { ShoppingCart, Clock, CheckCircle, XCircle, AlertCircle, Plus, Minus, RefreshCw, ChefHat, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CustomerOrderPage() {
  const [qrCode, setQrCode] = useState('');
  const [tableId, setTableId] = useState<number | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<Record<number, number>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu');

  // Check for URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tableParam = urlParams.get('table');
    const orderParam = urlParams.get('order');
    
    if (tableParam) {
      setTableId(parseInt(tableParam));
      if (orderParam) {
        // Load existing order
        loadExistingOrder(parseInt(orderParam));
      }
    }
  }, []);

  const loadExistingOrder = async (orderId: number) => {
    try {
      const orderResponse = await apiClient.getOrder(orderId);
      setCurrentOrder(orderResponse.data);
      await loadMenuData();
      await loadOrderData();
    } catch (err) {
      console.error('Failed to load existing order:', err);
    }
  };

  // Initialize table from QR code
  const handleQRScan = async () => {
    if (!qrCode.trim()) {
      setError('กรุณาใส่ QR Code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const scanResponse = await apiClient.scanQRCode(qrCode);
      const { table_id, has_open_order, open_order } = scanResponse.data;
      
      setTableId(table_id);
      
      if (has_open_order && open_order) {
        setCurrentOrder(open_order);
      } else {
        // Create new order
        const newOrderResponse = await apiClient.createOrder(table_id);
        setCurrentOrder(newOrderResponse.data);
      }
      
      await loadMenuData();
      await loadOrderData();
    } catch (err) {
      console.error('QR scan failed:', err);
      setError('QR Code ไม่ถูกต้องหรือไม่พบข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  // Load menu data
  const loadMenuData = async () => {
    try {
      const [categoriesResponse, menuResponse] = await Promise.all([
        apiClient.getCategories(),
        selectedCategory 
          ? apiClient.getMenuItemsByCategory(selectedCategory, 100, 0)
          : searchQuery
          ? apiClient.searchMenuItems(searchQuery, 100, 0)
          : apiClient.getMenuItems(100, 0)
      ]);
      
      setCategories(categoriesResponse.data);
      setMenuItems(menuResponse.data.items);
    } catch (err) {
      console.error('Failed to load menu data:', err);
      setError('ไม่สามารถโหลดข้อมูลเมนูได้');
    }
  };

  // Load order data with auto-refresh
  const loadOrderData = async () => {
    if (!tableId) return;
    
    try {
      const ordersResponse = await apiClient.getOrdersByTable(tableId, 10, 0);
      setOrders(ordersResponse.data.orders);
      
      if (currentOrder) {
        const itemsResponse = await apiClient.getOrderItems(currentOrder.id);
        setOrderItems(itemsResponse.data);
        
        // Update cart items
        const items: Record<number, number> = {};
        itemsResponse.data.forEach(item => {
          items[item.item_id] = item.quantity;
        });
        setCartItems(items);
      }
    } catch (err) {
      console.error('Failed to load order data:', err);
    }
  };

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    if (!tableId) return;
    
    const interval = setInterval(() => {
      loadOrderData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [tableId, currentOrder]);

  // Load menu items when category or search changes
  useEffect(() => {
    if (tableId) {
      loadMenuData();
    }
  }, [selectedCategory, searchQuery]);

  // Filter menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = !selectedCategory || item.category_id === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Add item to cart
  const handleAddItem = async (item: MenuItem, quantity: number) => {
    if (!currentOrder) return;

    try {
      const currentQuantity = cartItems[item.id] || 0;
      const difference = quantity - currentQuantity;

      if (difference > 0) {
        await apiClient.addOrderItem({
          order_id: currentOrder.id,
          item_id: item.id,
          quantity: difference,
        });
      } else if (difference < 0) {
        const existingItem = orderItems.find(oi => oi.item_id === item.id);
        if (existingItem) {
          if (quantity === 0) {
            await apiClient.removeOrderItem(existingItem.id);
          } else {
            await apiClient.updateOrderItem(existingItem.id, { quantity });
          }
        }
      }

      if (quantity === 0) {
        const newCart = { ...cartItems };
        delete newCart[item.id];
        setCartItems(newCart);
      } else {
        setCartItems(prev => ({ ...prev, [item.id]: quantity }));
      }

      await loadOrderData();
    } catch (err) {
      console.error('Failed to update cart:', err);
      setError('ไม่สามารถอัปเดตตะกร้าสินค้าได้');
    }
  };

  // Get order status info
  const getOrderStatusInfo = (status: string) => {
    switch (status) {
      case 'open':
        return { icon: Clock, color: 'text-blue-500 bg-blue-50', text: 'กำลังสั่ง' };
      case 'confirmed':
        return { icon: CheckCircle, color: 'text-green-500 bg-green-50', text: 'ยืนยันแล้ว' };
      case 'preparing':
        return { icon: ChefHat, color: 'text-orange-500 bg-orange-50', text: 'กำลังทำ' };
      case 'ready':
        return { icon: Bell, color: 'text-purple-500 bg-purple-50', text: 'พร้อมเสิร์ฟ' };
      case 'served':
        return { icon: CheckCircle, color: 'text-green-600 bg-green-100', text: 'เสิร์ฟแล้ว' };
      case 'closed':
        return { icon: XCircle, color: 'text-gray-500 bg-gray-50', text: 'ปิดแล้ว' };
      default:
        return { icon: Clock, color: 'text-gray-500 bg-gray-50', text: status };
    }
  };

  // Confirm order
  const handleConfirmOrder = async () => {
    if (!currentOrder || orderItems.length === 0) return;
    
    try {
      // Update order status to confirmed
      await apiClient.updateOrder(currentOrder.id, 'confirmed');
      
      // Redirect to confirmation page
      window.location.href = `/customer/confirmation?orderId=${currentOrder.id}&tableId=${tableId}`;
    } catch (err) {
      console.error('Failed to confirm order:', err);
      setError('ไม่สามารถยืนยันออเดอร์ได้');
    }
  };

  const totalItems = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  if (!tableId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-background p-4">
        <div className="max-w-md mx-auto pt-20">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                ยินดีต้อนรับ
              </CardTitle>
              <Text className="text-muted-foreground">
                สแกน QR Code เพื่อเริ่มสั่งอาหาร
              </Text>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Input
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="ใส่ QR Code หรือสแกนด้วยกล้อง"
                  className="h-14 text-center text-lg"
                />
                
                <Button
                  onClick={handleQRScan}
                  disabled={!qrCode.trim() || isLoading}
                  isLoading={isLoading}
                  className="w-full h-14 text-lg font-semibold"
                  glow
                >
                  เริ่มสั่งอาหาร
                </Button>
              </div>
              
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <Text color="destructive" className="text-center">{error}</Text>
                </div>
              )}
              
              <div className="text-center">
                <Text variant="caption" className="text-muted-foreground">
                  หรือ{' '}
                  <a href="/customer/orders" className="text-primary hover:underline">
                    ติดตามออเดอร์
                  </a>
                </Text>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Text variant="h6" className="font-bold">
                โต๊ะ {tableId}
              </Text>
              <Text variant="caption" className="text-muted-foreground">
                {currentOrder ? `ออเดอร์ #${currentOrder.id}` : 'ยังไม่มีออเดอร์'}
              </Text>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={loadOrderData}
                className="h-10 w-10"
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    ตะกร้า
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">
                        {totalItems}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>ตะกร้าสินค้า</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {orderItems.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <Text color="muted">ไม่มีรายการในตะกร้า</Text>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {orderItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                              <div className="flex-1">
                                <Text className="font-medium">{item.menu_item?.name}</Text>
                                <Text variant="caption" className="text-muted-foreground">
                                  ฿{item.unit_price.toFixed(2)} × {item.quantity}
                                </Text>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleAddItem(item.menu_item!, item.quantity - 1)}
                                  className="h-8 w-8"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <Text className="font-bold min-w-[2rem] text-center">
                                  {item.quantity}
                                </Text>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleAddItem(item.menu_item!, item.quantity + 1)}
                                  className="h-8 w-8"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              <Text className="font-bold text-primary ml-4">
                                ฿{item.subtotal.toFixed(2)}
                              </Text>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-4">
                            <Text className="font-bold text-lg">รวมทั้งสิ้น</Text>
                            <Text className="font-bold text-xl text-primary">
                              ฿{totalPrice.toFixed(2)}
                            </Text>
                          </div>
                          
                          <Button 
                            className="w-full h-12 font-semibold" 
                            glow
                            onClick={handleConfirmOrder}
                            disabled={orderItems.length === 0}
                          >
                            ยืนยันออเดอร์
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-t border-border">
          <button
            onClick={() => setActiveTab('menu')}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'menu' 
                ? 'bg-primary text-primary-foreground border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            เมนูอาหาร
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'orders' 
                ? 'bg-primary text-primary-foreground border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            ออเดอร์ของฉัน
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <Text color="destructive" variant="caption">{error}</Text>
          </div>
        )}
        
        {activeTab === 'menu' ? (
          <div className="space-y-6">
            {/* Search */}
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="ค้นหาเมนูอาหาร..."
              className="w-full"
            />
            
            {/* Categories */}
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
            
            {/* Menu Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMenuItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  quantity={cartItems[item.id] || 0}
                  onQuantityChange={(quantity) => handleAddItem(item, quantity)}
                />
              ))}
            </div>
            
            {filteredMenuItems.length === 0 && (
              <div className="text-center py-8">
                <Text color="muted">ไม่พบเมนูที่ตรงกับการค้นหา</Text>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <Text color="muted" className="text-lg">ยังไม่มีออเดอร์</Text>
                <Text color="muted" variant="caption">
                  เริ่มสั่งอาหารจากเมนูด้านบน
                </Text>
              </div>
            ) : (
              orders.map((order) => (
                <OrderStatusCard
                  key={order.id}
                  order={order}
                  items={order.id === currentOrder?.id ? orderItems : []}
                  showDetails={order.id === currentOrder?.id}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}