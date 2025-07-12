// components/templates/MainLayout/MainLayout.tsx
import React from 'react';
import { Button, Text } from '@/components/atoms';
import { Home, Users, ShoppingBag, TrendingUp, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'หน้าหลัก', href: '/', icon: Home },
  { name: 'โต๊ะ', href: '/tables', icon: Users },
  { name: 'เมนู', href: '/menu', icon: ShoppingBag },
  { name: 'รายงาน', href: '/reports', icon: TrendingUp },
  { name: 'ตั้งค่า', href: '/settings', icon: Settings },
];

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Text variant="h4" className="font-bold text-primary">
              POS Restaurant
            </Text>
          </div>
          
          <div className="flex items-center space-x-2">
            <Text variant="caption" className="text-muted-foreground">
              {new Date().toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)]">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      isActive && 'bg-primary text-primary-foreground'
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};