// components/templates/MainLayout/MainLayout.tsx
import React from 'react';
import { Button, Text } from '@/components/atoms';
import { Home, Users, ShoppingBag, TrendingUp, Settings, Search, Bell, User } from 'lucide-react';
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
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <Text variant="h4" className="font-bold text-gradient">
                  Restaurant POS
                </Text>
                <Text variant="caption" className="text-muted-foreground">
                  Modern Point of Sale
                </Text>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="ค้นหา..."
                className="w-64 pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></span>
            </Button>
            
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
            
            <div className="text-right">
              <Text variant="caption" className="text-muted-foreground">
                {new Date().toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Text variant="caption" className="text-muted-foreground block">
                {new Date().toLocaleTimeString('th-TH', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-72 bg-card border-r border-border min-h-[calc(100vh-88px)] relative">
          <nav className="p-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start h-12 text-left font-medium transition-all duration-200',
                      isActive ? 'bg-primary text-primary-foreground active-glow' : 'hover:bg-accent',
                      !isActive && 'hover:translate-x-1'
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
          
          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <Text variant="caption" className="font-medium">Admin User</Text>
                <Text variant="small" className="text-muted-foreground">ผู้ดูแลระบบ</Text>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-background">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};