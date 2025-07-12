'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { Text, Button, Input } from '@/components/atoms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function QRScannerPage() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!qrCode.trim()) {
      setError('กรุณาใส่ QR Code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Scan QR Code
      const scanResponse = await apiClient.scanQRCode(qrCode);
      const { table_id, has_open_order, open_order } = scanResponse.data;

      if (has_open_order && open_order) {
        router.push(`/orders/${open_order.id}?table=${table_id}`);
      } else {
        router.push(`/tables/${table_id}/order`);
      }
    } catch (err) {
      console.error('QR scan failed:', err);
      setError('QR Code ไม่ถูกต้องหรือไม่พบข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Text variant="h2">สแกน QR Code</Text>
        </div>

        {/* QR Scanner Card */}
        <Card>
          <CardHeader className="text-center">
            <QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle>สแกน QR Code ของโต๊ะ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="ใส่ QR Code หรือสแกนด้วยกล้อง"
              error={error || undefined}
            />
            
            <Button
              onClick={handleScan}
              disabled={!qrCode.trim() || isLoading}
              isLoading={isLoading}
              className="w-full"
            >
              สแกน
            </Button>
            
            <Text variant="caption" color="muted" className="text-center">
              หรือเลือกโต๊ะจากหน้าแดชบอร์ด
            </Text>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}