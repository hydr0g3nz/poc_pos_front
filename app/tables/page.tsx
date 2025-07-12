// app/tables/page.tsx
'use client';

import React from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { TableGrid } from '@/components/organisms';
import { Text } from '@/components/atoms';
import { Table, Order } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function TablesPage() {
  const router = useRouter();

  const handleTableSelect = (table: Table, hasOpenOrder: boolean, openOrder?: Order) => {
    if (hasOpenOrder && openOrder) {
      router.push(`/orders/${openOrder.id}?table=${table.id}`);
    } else {
      router.push(`/tables/${table.id}/order`);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Text variant="h2">จัดการโต๊ะ</Text>
        </div>

        <TableGrid onTableSelect={handleTableSelect} />
      </div>
    </MainLayout>
  );
}