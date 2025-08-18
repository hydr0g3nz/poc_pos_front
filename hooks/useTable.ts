import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Table, Order } from '@/types';

export function useTable() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTables();
      setTables(response.data.tables);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const scanQRCode = async (qrCode: string) => {
    try {
      const response = await apiClient.scanQRCode(qrCode);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan QR code');
      return null;
    }
  };

  const getOpenOrderByTable = async (tableId: number): Promise<Order | null> => {
    try {
      const response = await apiClient.getOpenOrderByTable(tableId);
      return response.data;
    } catch (err) {
      // Table might not have open order, which is not an error
      return null;
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return {
    tables,
    loading,
    error,
    fetchTables,
    scanQRCode,
    getOpenOrderByTable,
  };
}