// components/molecules/RevenueCard/RevenueCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/atoms';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RevenueCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  className?: string;
  icon?: React.ReactNode;
}

export const RevenueCard: React.FC<RevenueCardProps> = ({
  title,
  amount,
  subtitle,
  trend = 'neutral',
  trendValue,
  className,
  icon,
}) => {
  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover-lift card-shadow',
      className
    )}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
      
      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            {icon || <DollarSign className="w-5 h-5 text-primary" />}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <Text variant="h2" className="font-bold text-foreground">
              ฿{amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </Text>
            {subtitle && (
              <Text variant="caption" className="text-muted-foreground">
                {subtitle}
              </Text>
            )}
          </div>
          
          {trend !== 'neutral' && trendValue !== undefined && (
            <div className={cn(
              'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
              trend === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            )}>
              {trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};