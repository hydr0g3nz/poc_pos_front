// components/organisms/RevenueOverview/RevenueOverview.tsx
import React, { useState, useEffect } from 'react';
import { RevenueCard } from '@/components/molecules';
import { Spinner, Text } from '@/components/atoms';
import { DailyRevenue, MonthlyRevenue, apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface RevenueOverviewProps {
  selectedDate?: Date;
}

export const RevenueOverview: React.FC<RevenueOverviewProps> = ({
  selectedDate = new Date(),
}) => {
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setIsLoading(true);
        
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1;

        const [dailyResponse, monthlyResponse] = await Promise.all([
          apiClient.getDailyRevenue(dateStr),
          apiClient.getMonthlyRevenue(year, month),
        ]);

        setDailyRevenue(dailyResponse.data);
        setMonthlyRevenue(monthlyResponse.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch revenue:', err);
        setError('ไม่สามารถโหลดข้อมูลรายได้ได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenue();
  }, [selectedDate]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Text color="destructive">{error}</Text>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <RevenueCard
        title="รายได้วันนี้"
        amount={dailyRevenue?.total_revenue || 0}
        subtitle={`${dailyRevenue?.total_orders || 0} ออร์เดอร์`}
      />
      
      <RevenueCard
        title="เงินสด"
        amount={dailyRevenue?.order_details.cash || 0}
        subtitle="วันนี้"
      />
      
      <RevenueCard
        title="บัตรเครดิต"
        amount={dailyRevenue?.order_details.credit_card || 0}
        subtitle="วันนี้"
      />
      
      <RevenueCard
        title="รายได้เดือนนี้"
        amount={monthlyRevenue?.total_revenue || 0}
        subtitle={format(selectedDate, 'MMMM yyyy', { locale: th })}
      />
    </div>
  );
};