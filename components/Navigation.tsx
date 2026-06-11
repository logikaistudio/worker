'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home, Calendar, Target, Users, Wallet, Menu, X,
    Settings, Briefcase, Network, Clock, Receipt, Megaphone, BarChart, BookOpen
} from 'lucide-react';

const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navGroups = [
        {
            title: 'DASHBOARD & REPORTS',
            items: [
                { href: '/', label: 'Dashboard', icon: Home },
                { href: '/reports', label: 'Reports & Analytics', icon: BarChart },
                { href: '/announcements', label: 'Pengumuman', icon: Megaphone },
            ]
        },
        {
            title: 'CORE HR',
            items: [
                { href: '/employees', label: 'Karyawan', icon: Users },
                { href: '/orgchart', label: 'Struktur Organisasi', icon: Network },
                { href: '/shifts', label: 'Shift & Roster', icon: Clock },
            ]
        },
        {
            title: 'TIME & ATTENDANCE',
            items: [
                { href: '/attendance/daily', label: 'Absen Harian', icon: Calendar },
                { href: '/attendance', label: 'Pengajuan Cuti', icon: Calendar },
                { href: '/approval', label: 'Approval Cuti', icon: Target },
                { href: '/overtimerequest', label: 'Pengajuan Lembur', icon: Clock },
            ]
        },
        {
            title: 'PAYROLL & EXPENSE',
            items: [
                { href: '/payroll', label: 'Payroll', icon: Wallet },
                { href: '/reimbursement', label: 'Reimbursement', icon: Receipt },
            ]
        },
        {
            title: 'TALENT MANAGEMENT',
            items: [
                { href: '/recruitment', label: 'Rekrutmen (ATS)', icon: Briefcase },
                { href: '/kpi', label: 'KPI & Performance', icon: Target },
                { href: '/skillmatrix', label: 'Skill Matrix', icon: BookOpen },
            ]
        },
        {
            title: 'SYSTEM',
            items: [
                { href: '/settings', label: 'Pengaturan', icon: Settings },
            ]
        }
    ];

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href) && href !== '/';
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary-600 text-white no-print"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 no-print"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 
          transform transition-transform duration-300 ease-in-out no-print overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="p-6 pb-20">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-primary-600">WORKer</h1>
                        <p className="text-sm text-gray-500">HRMS System</p>
                    </div>

                    <div className="space-y-6">
                        {navGroups.map((group, idx) => (
                            <div key={idx}>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                                    {group.title}
                                </h3>
                                <nav className="space-y-1">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        const active = isActive(item.href);

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={`
                                                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                                                    smooth-transition
                                                    ${active
                                                        ? 'bg-primary-600 text-white shadow-md font-semibold'
                                                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600 font-medium'
                                                    }
                                                `}
                                            >
                                                <Icon size={18} />
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 w-64 p-4 border-t bg-white z-50">
                    <p className="text-xs text-gray-500 text-center">
                        WORKer HRMS v2.0
                    </p>
                </div>
            </aside>
        </>
    );
};

export default Navigation;
