

// components/atoms/Badge/Badge.tsx
import React from 'react';
import { Badge as ShadcnBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
}) => {
  return (
    <ShadcnBadge variant={variant} className={cn('text-xs', className)}>
      {children}
    </ShadcnBadge>
  );
};