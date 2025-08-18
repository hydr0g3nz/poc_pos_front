import { PaymentMethod } from '@/types';
import { Card } from '@/components/atoms/Card';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onMethodChange: (method: PaymentMethod) => void;
}

const paymentMethods = [
  { id: 'cash' as PaymentMethod, name: 'เงินสด', icon: '💰' },
  { id: 'credit_card' as PaymentMethod, name: 'บัตรเครดิต', icon: '💳' },
  { id: 'wallet' as PaymentMethod, name: 'กระเป๋าเงินดิจิทัล', icon: '📱' },
];

export function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {paymentMethods.map((method) => (
        <Card
          key={method.id}
          className={`p-4 cursor-pointer border-2 transition-colors ${
            selectedMethod === method.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onMethodChange(method.id)}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">{method.icon}</div>
            <div className="font-medium">{method.name}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}