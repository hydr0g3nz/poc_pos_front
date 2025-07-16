// app/customer/orders/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button, Text, Input } from '@/components/atoms';
import { OrderStatusCard, OrderProgressBar } from '@/components/molecules';
import { MobileOrderTracker } from '@/components/organisms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order, OrderItem, apiClient } from '@/lib/api';
import { Search, ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CustomerOrdersPage() {
  const [qrCode, setQrCode] = useState('');
  const [tableId, setTableId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQRScan = async () => {
    if (!qrCode.trim()) {
      setError('กรุณาใส่ QR Code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const scanResponse = await apiClient.scanQRCode(qrCode);
      const { table_id } = scanResponse.data;
      setTableId(table_id);
    } catch (err) {
      console.error('QR scan failed:', err);
      setError('QR Code ไม่ถูกต้องหรือไม่พบข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setTableId(null);
    setQrCode('');
    setError(null);
  };

  if (!tableId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-background p-4">
        <div className="max-w-md mx-auto pt-20">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-blue-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                ติดตามออเดอร์
              </CardTitle>
              <Text className="text-muted-foreground">
                สแกน QR Code บนโต๊ะของคุณเพื่อดูสถานะออเดอร์
              </Text>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Input
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="ใส่ QR Code หรือสแกนด้วยกล้อง"
                  className="h-14 text-center text-lg"
                />
                
                <Button
                  onClick={handleQRScan}
                  disabled={!qrCode.trim() || isLoading}
                  isLoading={isLoading}
                  className="w-full h-14 text-lg font-semibold bg-blue-500 hover:bg-blue-600"
                  glow
                >
                  ดูสถานะออเดอร์
                </Button>
              </div>
              
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <Text color="destructive" className="text-center">{error}</Text>
                </div>
              )}
              
              <div className="text-center">
                <Text variant="caption" className="text-muted-foreground">
                  หรือ{' '}
                  <a href="/customer" className="text-primary hover:underline">
                    สั่งอาหารใหม่
                  </a>
                </Text>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileOrderTracker 
        tableId={tableId} 
        onBack={handleBack}
        className="h-screen"
      />
    </div>
  );
}