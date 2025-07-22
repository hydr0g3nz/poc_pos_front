// app/tables/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { TableGrid } from '@/components/organisms';
import { Button, Input, Text } from '@/components/atoms';
import { Table, Order } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TablesPage() {
  const router = useRouter();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tableHasOpenOrder, setTableHasOpenOrder] = useState(false);
  const [openOrder, setOpenOrder] = useState<Order | undefined>(undefined);

  const handleTableSelect = (table: Table, hasOpenOrder: boolean, openOrder?: Order) => {
    if (hasOpenOrder && openOrder) {
      // ถ้าโต๊ะเปิดแล้วให้เข้าไปได้เลย
      router.push(`/orders/${openOrder.id}?table=${table.id}`);
    } else {
      // ถ้าโต๊ะยังไม่เปิดให้แสดง dialog ยืนยัน
      setSelectedTable(table);
      setTableHasOpenOrder(false);
      setOpenOrder(undefined);
      setIsConfirmDialogOpen(true);
    }
  };

  const handleConfirmOpenTable = () => {
    if (!selectedTable) return;

    // เนื่องจาก dialog จะแสดงเฉพาะโต๊ะที่ยังไม่เปิด จึงนำทางไปยังหน้าสร้างออเดอร์ใหม่เสมอ
    router.push(`/tables/${selectedTable.id}/order`);
    
    setIsConfirmDialogOpen(false);
    setSelectedTable(null);
  };

  const handleCancelOpenTable = () => {
    setIsConfirmDialogOpen(false);
    setSelectedTable(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Text variant="h2">จัดการโต๊ะ</Text>
        </div>

        <TableGrid onTableSelect={handleTableSelect} />
        
        {/* Confirmation Dialog */}
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                เปิดโต๊ะใหม่
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Text className="text-gray-600">
                คุณต้องการเปิดโต๊ะ {selectedTable?.table_number || ''} สำหรับรับออเดอร์ใหม่หรือไม่?
              </Text>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleCancelOpenTable}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleConfirmOpenTable}
              >
                เปิดโต๊ะ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}