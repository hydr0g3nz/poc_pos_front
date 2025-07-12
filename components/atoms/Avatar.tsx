// components/atoms/Avatar/Avatar.tsx
import React from 'react';
import { Avatar as ShadcnAvatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
}) => {
  return (
    <ShadcnAvatar className={sizeClasses[size]}>
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback className="text-xs font-medium">
        {fallback}
      </AvatarFallback>
    </ShadcnAvatar>
  );
};
