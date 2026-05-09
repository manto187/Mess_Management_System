'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/auth.context';
import {
  LayoutDashboard, Users, UtensilsCrossed, Receipt, CreditCard, LogOut, Menu, X, UserCheck, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'ڈیش بورڈ' },
  { href: '/students', icon: Users, label: 'ممبران' },
  { href: '/attendance', icon: UserCheck, label: 'حاضری' },
  { href: '/meals', icon: UtensilsCrossed, label: 'کھانا' },
  { href: '/expenses', icon: Receipt, label: 'اخراجات' },
  { href: '/payments', icon: CreditCard, label: 'ڈپازٹ ہسٹری' },
  { href: '/reports', icon: FileText, label: 'رپورٹس' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-emerald-700/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">میس مینجمنٹ</h1>
            <p className="text-emerald-200 text-xs">{user?.name}</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200',
                active
                  ? 'bg-white text-emerald-700 shadow-md'
                  : 'text-emerald-100 hover:bg-white/15 hover:text-white',
              )}
            >
              <item.icon className={cn('w-5 h-5', active ? 'text-emerald-600' : '')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 pb-6">
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full text-emerald-100 hover:bg-red-500/20 hover:text-red-200 justify-start gap-3 h-12"
        >
          <LogOut className="w-5 h-5" />
          لاگ آؤٹ
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-emerald-700 to-teal-800 fixed inset-y-0 right-0 z-40 shadow-xl">
        <NavContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-72 bg-gradient-to-b from-emerald-700 to-teal-800 shadow-xl">
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:mr-64 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            id="mobile-menu-btn"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-slate-800">میس مینجمنٹ</span>
          </div>
          <div className="w-10" />
        </header>

        <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
