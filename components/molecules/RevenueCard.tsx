// components/molecules/RevenueCard/RevenueCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/atoms';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RevenueCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  className?: string;
}

export const RevenueCard: React.FC<RevenueCardProps> = ({
  title,
  amount,
  subtitle,
  trend = 'neutral',
  trendValue,
  className,
}) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <Text variant="h3" className="font-bold">
              ฿{amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </Text>
            {subtitle && (
              <Text variant="caption" className="mt-1">
                {subtitle}
              </Text>
            )}
          </div>
          {trend !== 'neutral' && trendValue !== undefined && (
            <div className={`flex items-center space-x-1 ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <Text variant="caption" className="font-medium">
                {Math.abs(trendValue)}%
              </Text>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};