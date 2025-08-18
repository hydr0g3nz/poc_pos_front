'use client';
import { useEffect } from 'react';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';

export default function HomePage() {
  useEffect(() => {
    // Check if accessed via QR code
    const urlParams = new URLSearchParams(window.location.search);
    const table = urlParams.get('table');
    
    if (table) {
      window.location.href = `/customer/qr?table=${table}`;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          ระบบ POS ร้านอาหารดีเลิศ
        </h1>
        
        <div className="space-y-4">
          <Button
            onClick={() => window.location.href = '/customer/order'}
            className="w-full"
            size="lg"
          >
            🍽️ สั่งอาหาร (ลูกค้า)
          </Button>
          
          <Button
            onClick={() => window.location.href = '/admin/orders'}
            variant="secondary"
            className="w-full"
            size="lg"
          >
            ⚙️ ระบบจัดการ (แอดมิน)
          </Button>
          
          <Button
            onClick={() => window.location.href = '/kitchen/orders'}
            variant="secondary"
            className="w-full"
            size="lg"
          >
            👨‍🍳 ระบบครัว
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>สแกน QR Code บนโต๊ะเพื่อสั่งอาหาร</p>
        </div>
      </Card>
    </div>
  );
}