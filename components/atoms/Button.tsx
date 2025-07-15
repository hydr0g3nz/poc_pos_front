// components/atoms/Button/Button.tsx
import React from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  glow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  size = 'default',
  isLoading = false,
  icon: Icon,
  iconPosition = 'left',
  glow = false,
  className,
  disabled,
  ...props
}) => {
  return (
    <ShadcnButton
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      className={cn(
        'transition-all duration-300 font-medium',
        isLoading && 'opacity-70 cursor-not-allowed',
        glow && 'active-glow',
        variant === 'default' && 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl',
        variant === 'outline' && 'border-border bg-card hover:bg-accent hover:text-accent-foreground',
        variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        variant === 'secondary' && 'bg-secondary hover:bg-secondary/90 text-secondary-foreground',
        size === 'default' && 'h-11 px-6 py-2',
        size === 'sm' && 'h-9 px-4 py-2 text-sm',
        size === 'lg' && 'h-12 px-8 py-3 text-lg',
        size === 'icon' && 'h-10 w-10',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children && <span>Loading...</span>}
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          {children && <span>{children}</span>}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </div>
      )}
    </ShadcnButton>
  );
};