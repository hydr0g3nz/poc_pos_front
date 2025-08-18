'use client';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/templates/AdminLayout';
import { AdminPanel } from '@/components/organisms/AdminPanel';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { apiClient } from '@/lib/api';
import { Order } from '@/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [searchDate, setSearchDate] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let response;
      
      if (filter === 'all') {
        response = await apiClient.getOrders(100, 0);
      } else {
        response = await apiClient.getOrdersByStatus(filter, 100, 0);
      }
      
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersByDate = async () => {
    if (!searchDate) {
      fetchOrders();
      return;
    }
    
    try {
      setLoading(true);
      const response = await apiClient.getOrdersByDateRange(searchDate, searchDate);
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders by date:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  useEffect(() => {
    fetchOrdersByDate();
  }, [searchDate]);

  const getStatusCount = (status: string) => {
    return orders.filter(order => order.status === status).length;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">จัดการออเดอร์</h1>
          <div className="flex space-x-2">
            <Badge variant="default">ทั้งหมด: {orders.length}</Badge>
            <Badge variant="warning">เปิด: {getStatusCount('open')}</Badge>
            <Badge variant="success">ปิด: {getStatusCount('closed')}</Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              ทั้งหมด
            </Button>
            <Button
              variant={filter === 'open' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('open')}
            >
              ออเดอร์เปิด
            </Button>
            <Button
              variant={filter === 'closed' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('closed')}
            >
              ออเดอร์ปิด
            </Button>
          </div>
          
          <Input
            type="date"
            placeholder="ค้นหาตามวันที่"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {/* Orders */}
        <AdminPanel orders={orders} onOrderUpdate={fetchOrders} />
      </div>
    </AdminLayout>
  );
}
