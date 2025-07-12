// components/atoms/Text/Text.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'small';
  className?: string;
  color?: 'primary' | 'secondary' | 'muted' | 'destructive';
}

const variantClasses = {
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-3xl font-semibold tracking-tight',
  h3: 'text-2xl font-semibold tracking-tight',
  h4: 'text-xl font-semibold tracking-tight',
  h5: 'text-lg font-semibold',
  h6: 'text-base font-semibold',
  body: 'text-base',
  caption: 'text-sm text-muted-foreground',
  small: 'text-xs text-muted-foreground',
};

const colorClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary-foreground',
  muted: 'text-muted-foreground',
  destructive: 'text-destructive',
};

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color,
  className,
}) => {
  const Component = variant.startsWith('h') ? variant : 'p';
  
  return React.createElement(
    Component,
    {
      className: cn(
        variantClasses[variant],
        color && colorClasses[color],
        className
      ),
    },
    children
  );
};