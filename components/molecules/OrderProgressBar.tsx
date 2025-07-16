// components/molecules/OrderProgressBar.tsx
import React from 'react';
import { Text } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface OrderProgressBarProps {
  currentStatus: string;
  className?: string;
}

export const OrderProgressBar: React.FC<OrderProgressBarProps> = ({
  currentStatus,
  className,
}) => {
  const steps = [
    { key: 'open', label: 'สั่งอาหาร' },
    { key: 'confirmed', label: 'ยืนยัน' },
    { key: 'preparing', label: 'กำลังทำ' },
    { key: 'ready', label: 'พร้อมเสิร์ฟ' },
    { key: 'served', label: 'เสิร์ฟแล้ว' },
  ];

  const currentIndex = steps.findIndex(step => step.key === currentStatus);
  const isCompleted = currentStatus === 'served' || currentStatus === 'closed';

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-4">
        {steps.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
              index <= currentIndex || isCompleted
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}>
              {index + 1}
            </div>
            <Text variant="caption" className={cn(
              'mt-2 text-center',
              index <= currentIndex || isCompleted
                ? 'text-primary font-medium'
                : 'text-muted-foreground'
            )}>
              {step.label}
            </Text>
          </div>
        ))}
      </div>
      
      <div className="relative">
        <div className="absolute top-4 left-0 w-full h-0.5 bg-muted" />
        <div 
          className={cn(
            'absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500',
            isCompleted && 'bg-green-500'
          )}
          style={{ 
            width: `${((currentIndex + 1) / steps.length) * 100}%` 
          }}
        />
      </div>
    </div>
  );
};