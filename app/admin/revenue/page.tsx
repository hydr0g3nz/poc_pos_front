'use client';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/templates/AdminLayout';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { apiClient } from '@/lib/api';

interface RevenueData {
  daily: Array<{ date: string; total_revenue: number; order_count: number }>;
  monthly: Array<{ month: string; total_revenue: number; order_count: number }>;
  total: { total_revenue: number; order_count: number };
}

export default function AdminRevenuePage() {
  const [revenueData, setRevenueData] = useState<RevenueData>({
    daily: [],
    monthly: [],
    total: { total_revenue: 0, order_count: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      
      const [dailyResponse, totalResponse] = await Promise.all([
        apiClient.getDailyRevenueRange(dateRange.start, dateRange.end),
        apiClient.getTotalRevenue(dateRange.start, dateRange.end),
      ]);

      setRevenueData({
        daily: dailyResponse.data,
        monthly: [], // Would implement monthly grouping
        total: totalResponse.data,
      });
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">รายงานยอดขาย</h1>
        </div>

        {/* Date Range Filter */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-end">
            <Input
              label="วันที่เริ่มต้น"
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateChange('start', e.target.value)}
            />
            <Input
              label="วันที่สิ้นสุด"
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateChange('end', e.target.value)}
            />
            <Button onClick={fetchRevenueData}>
              ค้นหา
            </Button>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                ฿{revenueData.total.total_revenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mt-1">ยอดขายรวม</div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {revenueData.total.order_count}
              </div>
              <div className="text-sm text-gray-600 mt-1">จำนวนออเดอร์</div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                ฿{revenueData.total.order_count > 0 
                  ? (revenueData.total.total_revenue / revenueData.total.order_count).toFixed(0)
                  : '0'
                }
              </div>
              <div className="text-sm text-gray-600 mt-1">ยอดขายเฉลี่ยต่อออเดอร์</div>
            </div>
          </Card>
        </div>

        {/* Daily Revenue Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">รายงานรายวัน</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ยอดขาย
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จำนวนออเดอร์
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ยอดเฉลี่ยต่อออเดอร์
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueData.daily.map((day, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(day.date).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ฿{day.total_revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {day.order_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ฿{day.order_count > 0 ? (day.total_revenue / day.order_count).toFixed(0) : '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {revenueData.daily.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              ไม่มีข้อมูลในช่วงวันที่ที่เลือก
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}