import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { Order, OrderItem, CartItem } from '@/types';

export function useOrderAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (tableId: number): Promise<Order | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createOrder(tableId);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addOrderItems = async (orderId: number, cartItems: CartItem[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      for (const item of cartItems) {
        await apiClient.addOrderItem({
          order_id: orderId,
          item_id: item.item_id,
          quantity: item.quantity,
          notes: item.notes,
        });
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add order items');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getOrderWithItems = async (orderId: number) => {
    try {
      setLoading(true);
      const response = await apiClient.getOrderWithItems(orderId);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const closeOrder = async (orderId: number) => {
    try {
      setLoading(true);
      const response = await apiClient.closeOrder(orderId);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (orderData: {
    order_id: number;
    amount: number;
    method: string;
  }) => {
    try {
      setLoading(true);
      const response = await apiClient.processPayment(orderData);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = async (orderId: number) => {
    try {
      await apiClient.printOrderReceipt(orderId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to print receipt');
      return false;
    }
  };

  const printQRCode = async (orderId: number) => {
    try {
      await apiClient.printOrderQR(orderId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to print QR code');
      return false;
    }
  };

  return {
    loading,
    error,
    createOrder,
    addOrderItems,
    getOrderWithItems,
    closeOrder,
    processPayment,
    printReceipt,
    printQRCode,
  };
}