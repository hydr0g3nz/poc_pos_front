'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CustomerLayout } from '@/components/templates/CustomerLayout';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { useTable } from '@/hooks/useTable';
import { useOrder } from '@/context/OrderContext';

export default function QROrderPage() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get('table');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableInfo, setTableInfo] = useState<any>(null);
  
  const { scanQRCode, getOpenOrderByTable } = useTable();
  const { setTable } = useOrder();

  useEffect(() => {
    const initializeFromQR = async () => {
      try {
        setLoading(true);
        
        if (tableParam) {
          // Direct table access
          const tableId = parseInt(tableParam);
          const openOrder = await getOpenOrderByTable(tableId);
          
          setTableInfo({
            table_id: tableId,
            table: { table_number: tableId },
            has_open_order: !!openOrder,
            open_order: openOrder,
          });
          
          setTable(tableId);
        } else {
          // QR code scan
          const qrCode = window.location.pathname + window.location.search;
          const result = await scanQRCode(qrCode);
          
          if (result) {
            setTableInfo(result);
            setTable(result.table_id);
          } else {
            setError('QR Code ไม่ถูกต้อง');
          }
        }
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };

    initializeFromQR();
  }, [tableParam, scanQRCode, getOpenOrderByTable, setTable]);

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="max-w-md mx-auto">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.href = '/customer/order'}>
              กลับหน้าหลัก
            </Button>
          </Card>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-md mx-auto">
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ยินดีต้อนรับ!
          </h2>
          
          <p className="text-gray-600 mb-1">
            โต๊ะ {tableInfo?.table?.table_number}
          </p>
          
          {tableInfo?.has_open_order && (
            <p className="text-sm text-blue-600 mb-4">
              มีออเดอร์เปิดอยู่: #{tableInfo.open_order?.id}
            </p>
          )}
          
          <div className="space-y-3 mt-6">
            <Button
              onClick={() => window.location.href = '/customer/order'}
              className="w-full"
            >
              {tableInfo?.has_open_order ? 'เพิ่มรายการอาหาร' : 'เริ่มสั่งอาหาร'}
            </Button>
            
            {tableInfo?.has_open_order && (
              <Button
                variant="secondary"
                onClick={() => window.location.href = `/customer/order/${tableInfo.open_order.id}`}
                className="w-full"
              >
                ดูออเดอร์ปัจจุบัน
              </Button>
            )}
          </div>
        </Card>
      </div>
    </CustomerLayout>
  );
}