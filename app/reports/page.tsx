'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { RevenueOverview } from '@/components/organisms';
import { RevenueCard } from '@/components/molecules';
import { Text, Button } from '@/components/atoms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Text variant="h2">รายงานยอดขาย</Text>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" icon={CalendarIcon}>
                  {format(selectedDate, 'dd/MM/yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={th}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" icon={Download}>
              ส่งออกรายงาน
            </Button>
          </div>
        </div>

        {/* Revenue Overview */}
        <RevenueOverview selectedDate={selectedDate} />

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>รายงานรายวัน</CardTitle>
            </CardHeader>
            <CardContent>
              <Text color="muted">รายงานรายละเอียดสำหรับวันที่เลือก</Text>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>รายงานรายเดือน</CardTitle>
            </CardHeader>
            <CardContent>
              <Text color="muted">สรุปรายได้ประจำเดือน</Text>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}