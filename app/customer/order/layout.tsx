import { CustomerLayout } from '@/components/templates/CustomerLayout';
import { ReactNode } from 'react';

interface CustomerOrderLayoutProps {
  children: ReactNode;
}

export default function CustomerOrderLayout({ children }: CustomerOrderLayoutProps) {
    return (
        <CustomerLayout>{children}</CustomerLayout>
    )
}