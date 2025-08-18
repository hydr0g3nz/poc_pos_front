import { ReactNode, useState } from 'react';
import { Button } from '@/components/atoms/Button';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState('orders');

  const tabs = [
    { id: 'orders', name: 'ออเดอร์', href: '/admin/orders' },
    { id: 'menu', name: 'จัดการเมนู', href: '/admin/menu' },
    { id: 'tables', name: 'จัดการโต๊ะ', href: '/admin/tables' },
    { id: 'revenue', name: 'รายงานยอดขาย', href: '/admin/revenue' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">ระบบจัดการร้านอาหาร</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="secondary" size="sm">
                ออกจากระบบ
              </Button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <a
                key={tab.id}
                href={tab.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab.id);
                }}
              >
                {tab.name}
              </a>
            ))}
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}