// components/molecules/TableCard/TableCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Text } from '@/components/atoms';
import { Table } from '@/lib/api';
import { Users, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableCardProps {
  table: Table;
  hasOpenOrder?: boolean;
  orderStartTime?: string;
  orderTotal?: number;
  onClick?: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({
  table,
  hasOpenOrder = false,
  orderStartTime,
  orderTotal,
  onClick,
}) => {
  const getElapsedTime = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}ชม ${minutes % 60}นาที`;
    }
    return `${minutes}นาที`;
  };

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-300 hover-lift card-shadow',
        hasOpenOrder ? 'ring-2 ring-primary bg-gradient-to-br from-primary/10 to-primary/5' : 'hover:ring-2 hover:ring-accent'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-colors',
              hasOpenOrder ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
            )}>
              {table.table_number}
            </div>
            <div>
              <CardTitle className="text-xl">โต๊ะ {table.table_number}</CardTitle>
              <div className="flex items-center space-x-1 mt-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <Text variant="caption" className="text-muted-foreground">
                  {table.seating} ที่นั่ง
                </Text>
              </div>
            </div>
          </div>
          
          <Badge variant={hasOpenOrder ? 'destructive' : 'secondary'} className="ml-2">
            {hasOpenOrder ? 'ใช้งาน' : 'ว่าง'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {hasOpenOrder && orderStartTime ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Text variant="caption" className="text-muted-foreground">
                  เวลาที่ใช้
                </Text>
              </div>
              <Text variant="caption" className="font-medium">
                {getElapsedTime(orderStartTime)}
              </Text>
            </div>
            
            {orderTotal && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <Text variant="caption" className="text-muted-foreground">
                    ยอดรวม
                  </Text>
                </div>
                <Text variant="caption" className="font-bold text-primary">
                  ฿{orderTotal.toFixed(2)}
                </Text>
              </div>
            )}
            
            <div className="pt-2 border-t border-border">
              <Text variant="caption" className="text-center text-muted-foreground">
                คลิกเพื่อจัดการออร์เดอร์
              </Text>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Text variant="caption" className="text-muted-foreground">
              คลิกเพื่อเริ่มออร์เดอร์
            </Text>
          </div>
        )}
      </CardContent>
    </Card>
  );
};