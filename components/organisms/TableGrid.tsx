// components/organisms/TableGrid/TableGrid.tsx
import React, { useState, useEffect } from 'react';
import { TableCard } from '@/components/molecules';
import { Spinner, Text } from '@/components/atoms';
import { Table, Order, apiClient } from '@/lib/api';
import { se } from 'date-fns/locale';

interface TableGridProps {
  onTableSelect: (table: Table, hasOpenOrder: boolean, openOrder?: Order) => void;
  onlyActive?: boolean; // Optional prop to filter active tables only
}

export const TableGrid: React.FC<TableGridProps> = ({ onTableSelect , onlyActive}) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [openOrders, setOpenOrders] = useState<Record<number, Order>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTablesAndOrders = async () => {
      try {
        setIsLoading(true);
        
        // Fetch tables
        const tablesResponse = await apiClient.getTables();
        const tablesList = tablesResponse.data.tables;

        setTables(tablesList);

        // Fetch open orders for each table
        const openOrdersData: Record<number, Order> = {};
        
        await Promise.all(
          tablesList.map(async (table) => {
            try {
              const orderResponse = await apiClient.getOpenOrderByTable(table.id);
              if (orderResponse.data) {
                openOrdersData[table.id] = orderResponse.data;
              }
            } catch (err: any) {
              // Check if it's a 404 error (no open order for this table)
              if (err.response?.status === 404 || err.status === 404) {
                // 404 means no open order exists for this table - this is normal
                // Don't add anything to openOrdersData for this table
                return;
              }
              
              // For other errors, log them but don't break the entire process
              console.warn(`Error fetching order for table ${table.id}:`, err);
            }
          })
        );
        
        setOpenOrders(openOrdersData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch tables and orders:', err);
        setError('ไม่สามารถโหลดข้อมูลโต๊ะได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTablesAndOrders();
  }, []);

  const handleTableClick = (table: Table) => {
    const openOrder = openOrders[table.id];
    const hasOpenOrder = !!openOrder;
    onTableSelect(table, hasOpenOrder, openOrder);
  };

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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {tables.map((table) => {
        const openOrder = openOrders[table.id]
        const hasOpenOrder = !!openOrder;
        if (onlyActive && !hasOpenOrder) {
          return null; // Skip inactive tables if onlyActive is true
        }
        return (
           <TableCard
            key={table.id}
            table={table}
            hasOpenOrder={hasOpenOrder}
            orderStartTime={openOrder?.created_at}
            onClick={() => handleTableClick(table)}
          />
        );
      })}
    </div>
  );
};