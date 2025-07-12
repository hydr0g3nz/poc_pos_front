// components/atoms/Icon/Icon.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const Icon: React.FC<IconProps> = ({ icon: IconComponent, size = 'md', className }) => {
  return <IconComponent className={cn(sizeClasses[size], className)} />;
};