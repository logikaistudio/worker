'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
    Calendar, Target, Users, Wallet, ArrowRight, TrendingUp, AlertTriangle, 
    Clock, Receipt, Briefcase, Megaphone, Network, Settings
} from 'lucide-react';
import { calculateAchievementPercentage } from '@/utils/kpiHelpers';

export default function HomePage() {
    const { employees, leaveRequests, kpis, payrollRecords, overtimeRequests, reimbursements, jobPostings, announcements } = useData();

    const activeEmployees = employees.filter(e => e.status === 'active').length;
    const pendingLeaves = leaveRequests.filter(r => r.status === 'pending').length;
    const lowKPIs = kpis.filter(k => calculateAchievementPercentage(k.actual, k.target) < 90).length;
    const pendingOvertimes = overtimeRequests.filter(r => r.status === 'pending').length;
    const pendingReimbursements = reimbursements.filter(r => r.status === 'pending').length;
    const openJobs = jobPostings.filter(j => j.status === 'open').length;

    const pinnedAnnouncements = announcements.filter(a => a.isPinned);
    
    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2">Selamat Datang di WORKer HRMS</h1>
                    <p className="text-primary-100 text-lg">
                        Sistem Manajemen SDM Terpadu (HRIS, Payroll, ATS, & Performance)
                    </p>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5"></div>
                <div className="absolute bottom-0 right-32 -mb-20 w-48 h-48 rounded-full bg-white opacity-10"></div>
            </div>

            {/* Pinned Announcements */}
            {pinnedAnnouncements.length > 0 && (
                <div className="space-y-3">
                    {pinnedAnnouncements.map(ann => (
                        <Card key={ann.id} className="border-l-4 border-l-primary-500 bg-primary-50 shadow-sm p-4 flex items-start gap-4">
                            <Megaphone className="text-primary-600 flex-shrink-0 mt-1" size={20} />
                            <div className="flex-1">
                                <h3 className="font-semibold text-primary-900">{ann.title}</h3>
                                <p className="text-sm text-primary-800 mt-1">{ann.content}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Action Required Alerts */}
            {(pendingLeaves > 0 || pendingOvertimes > 0 || pendingReimbursements > 0 || lowKPIs > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pendingLeaves > 0 && (
                        <Link href="/attendance">
                            <Card className="p-4 border border-warning-yellow-200 bg-warning-yellow-50 hover:bg-warning-yellow-100 smooth-transition cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-warning-yellow-100 flex items-center justify-center text-warning-yellow-600">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-warning-yellow-700">{pendingLeaves}</p>
                                        <p className="text-xs font-medium text-warning-yellow-800 uppercase tracking-wider">Cuti Pending</p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    )}
                    {pendingOvertimes > 0 && (
                        <Link href="/overtimerequest">
                            <Card className="p-4 border border-blue-200 bg-blue-50 hover:bg-blue-100 smooth-transition cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-700">{pendingOvertimes}</p>
                                        <p className="text-xs font-medium text-blue-800 uppercase tracking-wider">Lembur Pending</p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    )}
                    {pendingReimbursements > 0 && (
                        <Link href="/reimbursement">
                            <Card className="p-4 border border-purple-200 bg-purple-50 hover:bg-purple-100 smooth-transition cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                        <Receipt size={20} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-purple-700">{pendingReimbursements}</p>
                                        <p className="text-xs font-medium text-purple-800 uppercase tracking-wider">Klaim Pending</p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    )}
                    {lowKPIs > 0 && (
                        <Link href="/kpi">
                            <Card className="p-4 border border-danger-200 bg-danger-50 hover:bg-danger-100 smooth-transition cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-danger-100 flex items-center justify-center text-danger-600">
                                        <Target size={20} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-danger-700">{lowKPIs}</p>
                                        <p className="text-xs font-medium text-danger-800 uppercase tracking-wider">KPI Rendah</p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    )}
                </div>
            )}

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/employees">
                    <Card variant="elevated" className="p-6 hover:shadow-xl smooth-transition cursor-pointer group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Karyawan Aktif</p>
                                <p className="text-3xl font-bold text-gray-900">{activeEmployees}</p>
                            </div>
                            <div className="p-3 bg-primary-50 rounded-lg group-hover:bg-primary-600 group-hover:text-white smooth-transition text-primary-600">
                                <Users size={24} />
                            </div>
                        </div>
                    </Card>
                </Link>

                <Link href="/recruitment">
                    <Card variant="elevated" className="p-6 hover:shadow-xl smooth-transition cursor-pointer group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Lowongan Aktif</p>
                                <p className="text-3xl font-bold text-gray-900">{openJobs}</p>
                            </div>
                            <div className="p-3 bg-success-50 rounded-lg group-hover:bg-success-600 group-hover:text-white smooth-transition text-success-600">
                                <Briefcase size={24} />
                            </div>
                        </div>
                    </Card>
                </Link>

                <Link href="/reports">
                    <Card variant="elevated" className="p-6 hover:shadow-xl smooth-transition cursor-pointer group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Analytics</p>
                                <p className="text-lg font-bold text-gray-900 mt-2 flex items-center gap-1">
                                    Lihat Laporan <ArrowRight size={16} />
                                </p>
                            </div>
                            <div className="p-3 bg-warning-yellow-50 rounded-lg group-hover:bg-warning-yellow-600 group-hover:text-white smooth-transition text-warning-yellow-600">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                    </Card>
                </Link>

                <Link href="/payroll">
                    <Card variant="elevated" className="p-6 hover:shadow-xl smooth-transition cursor-pointer group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Bulan Ini</p>
                                <p className="text-lg font-bold text-gray-900 mt-2 flex items-center gap-1">
                                    Proses Payroll <ArrowRight size={16} />
                                </p>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-600 group-hover:text-white smooth-transition text-indigo-600">
                                <Wallet size={24} />
                            </div>
                        </div>
                    </Card>
                </Link>
            </div>

            {/* Quick Actions Links Grid */}
            <h2 className="text-xl font-bold text-gray-900 pt-4 border-t">Menu Akses Cepat</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { title: 'Shift Roster', icon: Clock, href: '/shifts', color: 'bg-blue-50 text-blue-600' },
                    { title: 'Org Chart', icon: Network, href: '/orgchart', color: 'bg-indigo-50 text-indigo-600' },
                    { title: 'Skill Matrix', icon: Target, href: '/skillmatrix', color: 'bg-pink-50 text-pink-600' },
                    { title: 'Pengumuman', icon: Megaphone, href: '/announcements', color: 'bg-orange-50 text-orange-600' },
                    { title: 'Pengaturan', icon: Settings, href: '/settings', color: 'bg-gray-100 text-gray-700' },
                    { title: 'Lembur', icon: Clock, href: '/overtimerequest', color: 'bg-teal-50 text-teal-600' },
                ].map((action, idx) => {
                    const FinalIcon = action.icon;
                    return (
                        <Link key={idx} href={action.href}>
                            <Card className="p-4 text-center hover:shadow-md hover:-translate-y-1 smooth-transition cursor-pointer border border-gray-100">
                                <div className={`w-12 h-12 mx-auto rounded-full ${action.color} flex items-center justify-center mb-3`}>
                                    <FinalIcon size={20} />
                                </div>
                                <p className="text-sm font-semibold text-gray-800">{action.title}</p>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
