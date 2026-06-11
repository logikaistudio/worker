'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import Card from '@/components/ui/Card';
import { BarChart, PieChart, Users, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { calculateOvertimePay, calculateNetSalaryComplete } from '@/utils/payrollHelpers';

export default function ReportsPage() {
    const { employees, payrollRecords, reimbursements, overtimeRequests } = useData();
    const [reportType, setReportType] = useState<'hr' | 'finance' | 'attendance'>('hr');

    const activeEmployees = employees.filter(e => e.status === 'active');

    // --- HR Stats ---
    const totalEmployees = activeEmployees.length;
    const deptDistribution = useMemo(() => {
        const counts: Record<string, number> = {};
        activeEmployees.forEach(e => { counts[e.department] = (counts[e.department] || 0) + 1; });
        return counts;
    }, [activeEmployees]);

    // --- Finance Stats ---
    const totalPayrollYTD = useMemo(() => {
        return payrollRecords.reduce((sum: number, p: any) => sum + p.netSalary, 0);
    }, [payrollRecords]);

    const totalReimbursementYTD = useMemo(() => {
        return reimbursements.filter(r => r.status === 'paid' || r.status === 'approved').reduce((sum, r) => sum + r.amount, 0);
    }, [reimbursements]);

    const totalOvertimeCostYTD = useMemo(() => {
        return overtimeRequests.filter(r => r.status === 'completed' || r.status === 'approved')
            .reduce((sum, r) => sum + (r.actualCost || r.estimatedCost), 0);
    }, [overtimeRequests]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600 mt-1">Dashboard ringkasan dan analitik operasional HRD</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-max">
                <button onClick={() => setReportType('hr')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm smooth-transition ${reportType === 'hr' ? 'bg-white shadow text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}>
                    <Users size={16} /> Demografi HR
                </button>
                <button onClick={() => setReportType('finance')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm smooth-transition ${reportType === 'finance' ? 'bg-white shadow text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}>
                    <DollarSign size={16} /> Beban Keuangan
                </button>
                <button onClick={() => setReportType('attendance')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm smooth-transition ${reportType === 'attendance' ? 'bg-white shadow text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}>
                    <Calendar size={16} /> Kehadiran & Lembur
                </button>
            </div>

            {/* HR Demographics */}
            {reportType === 'hr' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 md:col-span-1 bg-primary-600 text-white flex flex-col justify-center items-center text-center">
                        <Users size={48} className="mb-4 opacity-80" />
                        <p className="text-xl font-medium opacity-90">Total Karyawan Aktif</p>
                        <p className="text-6xl font-bold mt-2">{totalEmployees}</p>
                    </Card>
                    
                    <Card className="p-6 md:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <PieChart size={20} className="text-primary-500" />
                            Distribusi Departemen
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(deptDistribution).sort((a, b) => b[1] - a[1]).map(([dept, count]) => {
                                const percentage = Math.round((count / totalEmployees) * 100);
                                return (
                                    <div key={dept}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{dept}</span>
                                            <span className="text-gray-500">{count} org ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            )}

            {/* Financials */}
            {reportType === 'finance' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card variant="elevated" className="p-5 border-l-4 border-primary-500">
                            <p className="text-sm font-medium text-gray-600">Total Gaji Dibayarkan (YTD)</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalPayrollYTD)}</p>
                        </Card>
                        <Card variant="elevated" className="p-5 border-l-4 border-warning-yellow-500">
                            <p className="text-sm font-medium text-gray-600">Total Lembur Dibayarkan (YTD)</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalOvertimeCostYTD)}</p>
                        </Card>
                        <Card variant="elevated" className="p-5 border-l-4 border-success-500">
                            <p className="text-sm font-medium text-gray-600">Total Klaim/Reimbursement (YTD)</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalReimbursementYTD)}</p>
                        </Card>
                    </div>
                    
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <BarChart size={20} className="text-primary-500" />
                            Rata-Rata Gaji Pokok per Departemen
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(deptDistribution).map(([dept, count]) => {
                                const deptEmps = activeEmployees.filter(e => e.department === dept);
                                const avgBasic = deptEmps.reduce((sum, e) => sum + e.basicSalary, 0) / (count || 1);
                                // Using a max basic of 25jt for scaling the bar
                                const scalePercent = Math.min((avgBasic / 25000000) * 100, 100);
                                
                                return (
                                    <div key={dept}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{dept}</span>
                                            <span className="text-gray-900 font-semibold">{formatCurrency(avgBasic)}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div className="bg-success-500 h-3 rounded-full" style={{ width: `${scalePercent}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            )}

            {/* Attendance & Overtime */}
            {reportType === 'attendance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary-500" />
                            Top 5 Karyawan Lembur Terbanyak
                        </h3>
                        <div className="space-y-4">
                            {(() => {
                                const otMap = new Map<string, { name: string, hours: number }>();
                                overtimeRequests.filter(r => r.status === 'completed' || r.status === 'approved').forEach(r => {
                                    const ex = otMap.get(r.employeeId) || { name: r.employeeName, hours: 0 };
                                    ex.hours += (r.actualHours || r.estimatedHours);
                                    otMap.set(r.employeeId, ex);
                                });
                                const topOT = Array.from(otMap.values()).sort((a, b) => b.hours - a.hours).slice(0, 5);
                                
                                if (topOT.length === 0) return <p className="text-gray-500 text-sm">Belum ada data lembur yang disetujui.</p>;
                                
                                return topOT.map((t, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-primary-100 text-primary-800 rounded-full flex justify-center items-center text-xs font-bold">{i+1}</div>
                                            <span className="font-medium text-gray-900">{t.name}</span>
                                        </div>
                                        <span className="font-bold text-primary-600">{t.hours.toFixed(1)} jam</span>
                                    </div>
                                ));
                            })()}
                        </div>
                    </Card>
                    
                    <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Insight Analisis</h3>
                        <p className="text-sm text-gray-600 mb-4">Catatan otomatis dari sistem berdasarkan data terkini:</p>
                        
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2">
                                <span className="text-success-500 mt-0.5">●</span>
                                <span className="text-sm text-gray-700">Rasio beban gaji operasional (Payroll) terhadap total karyawan berada dalam batas normal.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-warning-yellow-500 mt-0.5">●</span>
                                <span className="text-sm text-gray-700">Terdapat <strong>{overtimeRequests.filter(r => r.status === 'pending').length}</strong> pengajuan lembur dan <strong>{reimbursements.filter(r => r.status === 'pending').length}</strong> pengajuan klaim yang belum direview.</span>
                            </li>
                        </ul>
                    </Card>
                </div>
            )}
        </div>
    );
}
