'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { MenuGrid, OrderCart } from '@/components/organisms';
import { Text, Button } from '@/components/atoms';
import { MenuItem, Table, Order, apiClient } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TableOrderPage() {
  const params = useParams();
  const router = useRouter();
  const tableId = parseInt(params.id as string);
  
  const [table, setTable] = useState<Table | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [cartItems, setCartItems] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeOrder = async () => {
      try {
        setIsLoading(true);
        
        // Get table info
        const tableResponse = await apiClient.getTable(tableId);
        setTable(tableResponse.data);
        
        // Check for existing open order
        try {
          const orderResponse = await apiClient.getOpenOrderByTable(tableId);
          setOrder(orderResponse.data);
          
          // Load existing order items into cart
          const itemsResponse = await apiClient.getOrderItems(orderResponse.data.id);
          const items: Record<number, number> = {};
          itemsResponse.data.forEach(item => {
            items[item.item_id] = item.quantity;
          });
          setCartItems(items);
        } catch (err) {
          // No existing order, create new one
          const newOrderResponse = await apiClient.createOrder(tableId);
          setOrder(newOrderResponse.data);
        }
      } catch (err) {
        console.error('Failed to initialize order:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (tableId) {
      initializeOrder();
    }
  }, [tableId]);

  const handleAddItem = async (item: MenuItem, quantity: number) => {
    if (!order) return;

    try {
      const currentQuantity = cartItems[item.id] || 0;
      const difference = quantity - currentQuantity;

      if (difference > 0) {
        // Add items
        await apiClient.addOrderItem({
          order_id: order.id,
          item_id: item.id,
          quantity: difference,
        });
      } else if (difference < 0) {
        // Find existing order item and update quantity
        const itemsResponse = await apiClient.getOrderItems(order.id);
        const existingItem = itemsResponse.data.find(oi => oi.item_id === item.id);
        
        if (existingItem) {
          if (quantity === 0) {
            await apiClient.removeOrderItem(existingItem.id);
          } else {
            await apiClient.updateOrderItem(existingItem.id, { quantity });
          }
        }
      }

      // Update cart state
      if (quantity === 0) {
        const newCart = { ...cartItems };
        delete newCart[item.id];
        setCartItems(newCart);
      } else {
        setCartItems(prev => ({ ...prev, [item.id]: quantity }));
      }
    } catch (err) {
      console.error('Failed to update order item:', err);
    }
  };

  const handlePaymentComplete = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <Text>กำลังโหลด...</Text>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <Text variant="h2">โต๊ะ {table?.table_number}</Text>
              <Text variant="caption" color="muted">
                ออร์เดอร์ #{order?.id}
              </Text>
            </div>
          </div>
          
          {order && (
            <OrderCart
              orderId={order.id}
              onPaymentComplete={handlePaymentComplete}
            />
          )}
        </div>

        {/* Menu Grid */}
        <MenuGrid
          onAddItem={handleAddItem}
          cartItems={cartItems}
        />
      </div>
    </MainLayout>
  );
}