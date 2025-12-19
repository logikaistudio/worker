'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Calendar,
    Target,
    Users,
    Wallet,
    Menu,
    X
} from 'lucide-react';

const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Dashboard', icon: Home },
        { href: '/attendance', label: 'Cuti', icon: Calendar },
        { href: '/attendance/daily', label: 'Absen Harian', icon: Calendar },
        { href: '/approval', label: 'Approval Cuti', icon: Target },
        { href: '/kpi', label: 'KPI', icon: Target },
        { href: '/employees', label: 'Karyawan', icon: Users },
        { href: '/payroll', label: 'Payroll', icon: Wallet },
    ];

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary-600 text-white no-print"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 no-print"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 
          transform transition-transform duration-300 ease-in-out no-print
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="p-6">
                    {/* Logo */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-primary-600">WORKer</h1>
                        <p className="text-sm text-gray-500">HRMS System</p>
                    </div>

                    {/* Navigation Items */}
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg 
                    smooth-transition
                    ${active
                                            ? 'bg-primary-600 text-white shadow-md'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }
                  `}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
                    <p className="text-xs text-gray-500 text-center">
                        WORKer HRMS v1.0
                    </p>
                </div>
            </aside>
        </>
    );
};

export default Navigation;
