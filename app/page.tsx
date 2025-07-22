'use client';
import React from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { TableGrid, RevenueOverview } from '@/components/organisms';
import { Text, Button } from '@/components/atoms';
import { Table, Order } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { QrCode, TrendingUp, Users, ShoppingBag } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const handleTableSelect = (table: Table, hasOpenOrder: boolean, openOrder?: Order) => {
    if (hasOpenOrder && openOrder) {
      router.push(`/orders/${openOrder.id}?table=${table.id}`);
    } else {
      router.push(`/tables/${table.id}/order`);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Text variant="h2" className="font-bold mb-2">
              ยินดีต้อนรับสู่ระบบ POS
            </Text>
            <Text variant="caption" className="text-muted-foreground">
              จัดการร้านอาหารของคุณได้อย่างง่ายดาย
            </Text>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/menu')}
              icon={ShoppingBag}
              className="h-12"
            >
              จัดการเมนู
            </Button>
            <Button 
              onClick={() => router.push('/qr-scanner')}
              icon={QrCode}
              className="h-12"
              glow
            >
              สแกน QR Code
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="caption" className="text-primary font-medium">
                  โต๊ะที่ใช้งาน
                </Text>
                <Text variant="h3" className="font-bold text-foreground mt-1">
                  8 / 20
                </Text>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="caption" className="text-green-500 font-medium">
                  ออร์เดอร์วันนี้
                </Text>
                <Text variant="h3" className="font-bold text-foreground mt-1">
                  142
                </Text>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="caption" className="text-blue-500 font-medium">
                  รายได้วันนี้
                </Text>
                <Text variant="h3" className="font-bold text-foreground mt-1">
                  ฿28,430
                </Text>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <Text variant="h4" className="font-bold">ภาพรวมรายได้</Text>
            <Button 
              variant="outline" 
              onClick={() => router.push('/reports')}
              className="h-10"
            >
              ดูรายงานทั้งหมด
            </Button>
          </div>
          <RevenueOverview selectedDate={selectedDate} />
        </section>

        {/* Tables Overview */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Text variant="h4" className="font-bold">สถานะโต๊ะ</Text>
              <Text variant="caption" className="text-muted-foreground">
                คลิกที่โต๊ะเพื่อจัดการออร์เดอร์
              </Text>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/tables')}
              className="h-10"
            >
              จัดการโต๊ะ
            </Button>
          </div>
          <TableGrid onTableSelect={handleTableSelect}  onlyActive />
        </section>
      </div>
    </MainLayout>
  );
}