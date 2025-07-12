
// components/molecules/PaymentMethodSelector/PaymentMethodSelector.tsx
import React from 'react';
import { Button } from '@/components/atoms';
import { CreditCard, Wallet, DollarSign } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
  disabled?: boolean;
}

const paymentMethods = [
  { id: 'cash', label: 'เงินสด', icon: DollarSign },
  { id: 'credit_card', label: 'บัตรเครดิต', icon: CreditCard },
  { id: 'wallet', label: 'กระเป๋าเงิน', icon: Wallet },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodSelect,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {paymentMethods.map((method) => (
        <Button
          key={method.id}
          variant={selectedMethod === method.id ? 'default' : 'outline'}
          onClick={() => onMethodSelect(method.id)}
          disabled={disabled}
          className="flex flex-col items-center p-4 h-auto"
        >
          <method.icon className="w-6 h-6 mb-2" />
          <span className="text-sm">{method.label}</span>
        </Button>
      ))}
    </div>
  );
};