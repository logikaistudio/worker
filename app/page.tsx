'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
    Calendar,
    Target,
    Users,
    Wallet,
    ArrowRight,
    TrendingUp,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { calculateAchievementPercentage } from '@/utils/kpiHelpers';

export default function HomePage() {
    const { employees, leaveRequests, kpis, payrollRecords } = useData();

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'active').length;
    const pendingLeaves = leaveRequests.filter(r => r.status === 'pending').length;
    const lowKPIs = kpis.filter(k => calculateAchievementPercentage(k.actual, k.target) < 90).length;
    const thisMonthPayroll = payrollRecords.filter(
        r => r.period === new Date().toISOString().slice(0, 7)
    ).length;

    const recentLeaves = leaveRequests.slice(-5).reverse();
    const criticalKPIs = kpis
        .filter(k => calculateAchievementPercentage(k.actual, k.target) < 80)
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-8 text-white">
                <h1 className="text-4xl font-bold mb-2">Selamat Datang di WORKer HRMS</h1>
                <p className="text-primary-100 text-lg">
                    Sistem Manajemen SDM Modern untuk Perusahaan Anda
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/employees">
                    <Card variant="elevated" className="p-6 hover:shadow-xl smooth-transition cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Karyawan</p>
                                <p className="text-3xl font-bold text-gray-900">{totalEmployees}</p>
                                <p className="text-xs text-success-600 mt-1">
                                    {activeEmployees} aktif
                                </p>
                            </div>
                            <Users className="text-primary-600" size={40} />
                        </div>
                    </Card>
                </Link>

                <Link href="/attendance">
                    <Card variant="elevated" className="p-6 hover:shadow-xl smooth-transition cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pengajuan Cuti</p>
                                <p className="text-3xl font-bold text-gray-900">{leaveRequests.length}</p>
                                {pendingLeaves > 0 && (
                                    <p className="text-xs text-warning-yellow-600 mt-1 flex items-center gap-1">
                                        <AlertTriangle size={12} />
                                        {pendingLeaves} menunggu
                                    </p>
                                )}
                            </div>
                            <Calendar className="text-primary-600" size={40} />
                        </div>
                    </Card>
                </Link>

                <Link href="/kpi">
                    <Card variant="elevated" className="p-6 hover:shadow-xl smooth-transition cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">KPI Records</p>
                                <p className="text-3xl font-bold text-gray-900">{kpis.length}</p>
                                {lowKPIs > 0 && (
                                    <p className="text-xs text-danger-600 mt-1 flex items-center gap-1">
                                        <AlertTriangle size={12} />
                                        {lowKPIs} perlu perhatian
                                    </p>
                                )}
                            </div>
                            <Target className="text-primary-600" size={40} />
                        </div>
                    </Card>
                </Link>

                <Link href="/payroll">
                    <Card variant="elevated" className="p-6 hover:shadow-xl smooth-transition cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Payroll Records</p>
                                <p className="text-3xl font-bold text-gray-900">{payrollRecords.length}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    {thisMonthPayroll} bulan ini
                                </p>
                            </div>
                            <Wallet className="text-primary-600" size={40} />
                        </div>
                    </Card>
                </Link>
            </div>

            {/* Alerts */}
            {(pendingLeaves > 0 || criticalKPIs.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pending Leaves */}
                    {pendingLeaves > 0 && (
                        <Card variant="outlined" className="border-warning-yellow-500 bg-warning-yellow-50">
                            <div className="p-6">
                                <div className="flex items-start gap-3 mb-4">
                                    <AlertTriangle className="text-warning-yellow-600 flex-shrink-0" size={24} />
                                    <div>
                                        <h3 className="text-lg font-semibold text-warning-yellow-900">
                                            {pendingLeaves} Pengajuan Cuti Menunggu Approval
                                        </h3>
                                        <p className="text-sm text-warning-yellow-700 mt-1">
                                            Segera review pengajuan cuti yang pending
                                        </p>
                                    </div>
                                </div>
                                <Link href="/attendance">
                                    <button className="text-sm font-medium text-warning-yellow-800 hover:text-warning-yellow-900 flex items-center gap-1">
                                        Lihat Detail <ArrowRight size={16} />
                                    </button>
                                </Link>
                            </div>
                        </Card>
                    )}

                    {/* Critical KPIs */}
                    {criticalKPIs.length > 0 && (
                        <Card variant="outlined" className="border-danger-500 bg-danger-50">
                            <div className="p-6">
                                <div className="flex items-start gap-3 mb-4">
                                    <AlertTriangle className="text-danger-600 flex-shrink-0" size={24} />
                                    <div>
                                        <h3 className="text-lg font-semibold text-danger-900">
                                            {criticalKPIs.length} KPI di Bawah 80%
                                        </h3>
                                        <p className="text-sm text-danger-700 mt-1">
                                            Perlu tindakan untuk meningkatkan performa
                                        </p>
                                    </div>
                                </div>
                                <Link href="/kpi">
                                    <button className="text-sm font-medium text-danger-800 hover:text-danger-900 flex items-center gap-1">
                                        Lihat Detail <ArrowRight size={16} />
                                    </button>
                                </Link>
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Leave Requests */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Pengajuan Cuti Terbaru</h2>
                            <Calendar className="text-gray-400" size={24} />
                        </div>

                        {recentLeaves.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">Belum ada pengajuan cuti</p>
                        ) : (
                            <div className="space-y-3">
                                {recentLeaves.map(leave => (
                                    <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{leave.employeeName}</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(leave.startDate).toLocaleDateString('id-ID')} -
                                                {new Date(leave.endDate).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                leave.status === 'approved' ? 'success' :
                                                    leave.status === 'rejected' ? 'danger' : 'warning'
                                            }
                                        >
                                            {leave.status === 'pending' ? 'Menunggu' :
                                                leave.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Link href="/attendance">
                            <button className="mt-4 w-full text-center text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1">
                                Lihat Semua <ArrowRight size={16} />
                            </button>
                        </Link>
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Aksi Cepat</h2>
                            <TrendingUp className="text-gray-400" size={24} />
                        </div>

                        <div className="space-y-3">
                            <Link href="/attendance">
                                <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-lg hover:bg-primary-100 smooth-transition cursor-pointer">
                                    <Calendar className="text-primary-600" size={24} />
                                    <div>
                                        <p className="font-medium text-gray-900">Ajukan Cuti</p>
                                        <p className="text-sm text-gray-600">Buat pengajuan cuti baru</p>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/kpi">
                                <div className="flex items-center gap-3 p-4 bg-success-50 rounded-lg hover:bg-success-100 smooth-transition cursor-pointer">
                                    <Target className="text-success-600" size={24} />
                                    <div>
                                        <p className="font-medium text-gray-900">Tambah KPI</p>
                                        <p className="text-sm text-gray-600">Input data KPI karyawan</p>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/payroll">
                                <div className="flex items-center gap-3 p-4 bg-warning-yellow-50 rounded-lg hover:bg-warning-yellow-100 smooth-transition cursor-pointer">
                                    <Wallet className="text-warning-yellow-600" size={24} />
                                    <div>
                                        <p className="font-medium text-gray-900">Generate Payroll</p>
                                        <p className="text-sm text-gray-600">Proses gaji bulanan</p>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/employees">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 smooth-transition cursor-pointer">
                                    <Users className="text-gray-600" size={24} />
                                    <div>
                                        <p className="font-medium text-gray-900">Lihat Karyawan</p>
                                        <p className="text-sm text-gray-600">Kelola data karyawan</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
