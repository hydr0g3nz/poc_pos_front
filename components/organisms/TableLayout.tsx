import { Table, Order } from '@/types';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { useEffect, useState } from 'react';
import { useTable } from '@/hooks/useTable';

interface TableLayoutProps {
  onTableSelect?: (tableId: number) => void;
  selectedTable?: number | null;
  showStatus?: boolean;
}

export function TableLayout({ onTableSelect, selectedTable, showStatus = true }: TableLayoutProps) {
  const { tables, loading, getOpenOrderByTable } = useTable();
  const [tableOrders, setTableOrders] = useState<Record<number, Order | null>>({});

  useEffect(() => {
    if (showStatus && tables.length > 0) {
      Promise.all(
        tables.map(async (table) => {
          const order = await getOpenOrderByTable(table.id);
          return { tableId: table.id, order };
        })
      ).then((results) => {
        const orderMap = results.reduce((acc, { tableId, order }) => {
          acc[tableId] = order;
          return acc;
        }, {} as Record<number, Order | null>);
        setTableOrders(orderMap);
      });
    }
  }, [tables, showStatus, getOpenOrderByTable]);

  const getTableStatus = (table: Table) => {
    if (!showStatus) return 'available';
    const order = tableOrders[table.id];
    return order ? 'occupied' : 'available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'danger';
      case 'available':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'มีลูกค้า';
      case 'available':
        return 'ว่าง';
      default:
        return 'ไม่ทราบสถานะ';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {tables.map((table) => {
        const status = getTableStatus(table);
        const isSelected = selectedTable === table.id;
        
        return (
          <Card
            key={table.id}
            className={`p-4 cursor-pointer border-2 transition-colors ${
              isSelected
                ? 'border-blue-500 bg-blue-50'
                : status === 'occupied'
                ? 'border-red-200 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTableSelect?.(table.id)}
          >
            <div className="text-center space-y-2">
              <div className="font-semibold text-lg">โต๊ะ {table.table_number}</div>
              <div className="text-sm text-gray-600">{table.seating} ที่นั่ง</div>
              {showStatus && (
                <Badge variant={getStatusColor(status)} size="sm">
                  {getStatusText(status)}
                </Badge>
              )}
              {tableOrders[table.id] && (
                <div className="text-xs text-gray-500">
                  Order #{tableOrders[table.id]?.id}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}