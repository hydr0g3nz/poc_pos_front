// components/molecules/TableCard/TableCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Text } from '@/components/atoms';
import { Table } from '@/lib/api';
import { Users, Clock } from 'lucide-react';

interface TableCardProps {
  table: Table;
  hasOpenOrder?: boolean;
  orderStartTime?: string;
  onClick?: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({
  table,
  hasOpenOrder = false,
  orderStartTime,
  onClick,
}) => {
  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">โต๊ะ {table.table_number}</CardTitle>
          <Badge variant={hasOpenOrder ? 'destructive' : 'secondary'}>
            {hasOpenOrder ? 'ใช้งาน' : 'ว่าง'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <Text variant="caption">{table.seating} ที่นั่ง</Text>
          </div>
          {hasOpenOrder && orderStartTime && (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Text variant="caption">
                {new Date(orderStartTime).toLocaleTimeString('th-TH', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};