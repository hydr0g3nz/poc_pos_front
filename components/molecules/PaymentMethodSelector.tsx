// components/molecules/PaymentMethodSelector/PaymentMethodSelector.tsx
import React from 'react';
import { Button } from '@/components/atoms';
import { CreditCard, Wallet, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
  disabled?: boolean;
}

const paymentMethods = [
  { id: 'cash', label: 'เงินสด', icon: DollarSign, color: 'text-green-500' },
  { id: 'credit_card', label: 'บัตรเครดิต', icon: CreditCard, color: 'text-blue-500' },
  { id: 'wallet', label: 'กระเป๋าเงิน', icon: Wallet, color: 'text-purple-500' },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodSelect,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {paymentMethods.map((method) => (
        <Button
          key={method.id}
          variant={selectedMethod === method.id ? 'default' : 'outline'}
          onClick={() => onMethodSelect(method.id)}
          disabled={disabled}
          className={cn(
            'flex flex-col items-center justify-center p-6 h-24 text-center transition-all duration-200',
            selectedMethod === method.id && 'active-glow'
          )}
        >
          <method.icon className={cn(
            'w-8 h-8 mb-2',
            selectedMethod === method.id ? 'text-primary-foreground' : method.color
          )} />
          <span className="text-sm font-medium">{method.label}</span>
        </Button>
      ))}
    </div>
  );
};