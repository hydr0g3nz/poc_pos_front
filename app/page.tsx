'use client';
import React from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { TableGrid, RevenueOverview } from '@/components/organisms';
import { Text, Button } from '@/components/atoms';
import { Table, Order } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
export default function HomePage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const handleTableSelect = (table: Table, hasOpenOrder: boolean, openOrder?: Order) => {
    if (hasOpenOrder && openOrder) {
      // Navigate to existing order
      router.push(`/orders/${openOrder.id}?table=${table.id}`);
    } else {
      // Navigate to create new order
      router.push(`/tables/${table.id}/order`);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Text variant="h2">แดชบอร์ด</Text>
          <Button onClick={() => router.push('/qr-scanner')}>
            สแกน QR Code
          </Button>
        </div>

        {/* Revenue Overview */}
        <section>
          <Text variant="h4" className="mb-4">ภาพรวมรายได้</Text>
          <RevenueOverview selectedDate={selectedDate} />
        </section>

        {/* Tables Overview */}
        <section>
          <Text variant="h4" className="mb-4">สถานะโต๊ะ</Text>
          <TableGrid onTableSelect={handleTableSelect} />
        </section>
      </div>
    </MainLayout>
  );
}