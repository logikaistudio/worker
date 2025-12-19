'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { PayrollRecord } from '@/types';
import { calculateNetSalary } from '@/utils/payrollHelpers';
import { getTotalOvertimeHours } from '@/utils/overtimeHelpers';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import PrintWrapper from '@/components/PrintWrapper';
import PayrollSlipPrint from '@/components/payroll/PayrollSlipPrint';
import PayrollEditForm from '@/components/payroll/PayrollEditForm';
import { Wallet, Plus, Printer, DollarSign, Edit } from 'lucide-react';

export default function PayrollPage() {
    const { employees, payrollRecords, dailyAttendance, addPayrollRecord, updatePayrollRecord, updateEmployee } = useData();
    const [showPrintModal, setShowPrintModal] = useState<string | null>(null);
    const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
    const [generating, setGenerating] = useState(false);

    const printRecord = payrollRecords.find(rec => rec.id === showPrintModal);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleGeneratePayroll = () => {
        setGenerating(true);
        const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
        const paymentDate = new Date().toISOString();

        const newRecords: PayrollRecord[] = [];
        let count = 0;

        employees.forEach(employee => {
            if (employee.status === 'active') {
                // Calculate total overtime hours for this employee in current period
                const overtimeHours = getTotalOvertimeHours(
                    dailyAttendance,
                    employee.id,
                    currentPeriod
                );

                const calculation = calculateNetSalary(
                    employee.basicSalary,
                    employee.allowances,
                    0,
                    overtimeHours
                );

                const record: PayrollRecord = {
                    id: `${employee.id}-${Date.now()}-${count}`,
                    employeeId: employee.id,
                    employeeName: employee.name,
                    period: currentPeriod,
                    basicSalary: employee.basicSalary,
                    allowances: employee.allowances,
                    overtimeHours,
                    overtimeRate: calculation.overtimeRate,
                    overtimePay: calculation.overtimePay,
                    bpjsKesehatan: calculation.bpjsKesehatan,
                    bpjsKetenagakerjaan: calculation.bpjsKetenagakerjaan,
                    tax: calculation.tax,
                    otherDeductions: 0,
                    grossSalary: calculation.grossSalary,
                    totalDeductions: calculation.totalDeductions,
                    netSalary: calculation.netSalary,
                    paymentDate,
                    createdAt: new Date().toISOString(),
                };

                newRecords.push(record);

                // Update employee's latestPayrollId
                updateEmployee(employee.id, { latestPayrollId: record.id });

                count++;
            }
        });

        // Add all records at once
        newRecords.forEach(record => {
            addPayrollRecord(record);
        });

        setGenerating(false);
        alert(`✅ Payroll berhasil di-generate untuk ${count} karyawan!${newRecords.some(r => r.overtimeHours > 0) ? '\n(Termasuk perhitungan lembur)' : ''}`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
                    <p className="text-gray-600 mt-1">Kelola penggajian karyawan</p>
                </div>
                <Button
                    onClick={handleGeneratePayroll}
                    variant="primary"
                    size="lg"
                    disabled={generating}
                    className="flex items-center gap-2"
                >
                    <Plus size={20} />
                    {generating ? 'Generating...' : 'Generate Payroll Bulan Ini'}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Records</p>
                            <p className="text-2xl font-bold text-gray-900">{payrollRecords.length}</p>
                        </div>
                        <Wallet className="text-primary-600" size={32} />
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Payroll Bulan Ini</p>
                            <p className="text-2xl font-bold text-primary-600">
                                {formatCurrency(
                                    payrollRecords
                                        .filter(r => r.period === new Date().toISOString().slice(0, 7))
                                        .reduce((sum, r) => sum + r.grossSalary, 0)
                                )}
                            </p>
                        </div>
                        <DollarSign className="text-primary-600" size={32} />
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Karyawan Aktif</p>
                            <p className="text-2xl font-bold text-success-600">
                                {employees.filter(e => e.status === 'active').length}
                            </p>
                        </div>
                        <Wallet className="text-success-600" size={32} />
                    </div>
                </Card>
            </div>

            {/* Payroll Records Table */}
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Riwayat Payroll</h2>

                    {payrollRecords.length === 0 ? (
                        <div className="text-center py-12">
                            <Wallet className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-500">Belum ada data payroll</p>
                            <p className="text-sm text-gray-400 mt-2">
                                Klik tombol "Generate Payroll" untuk memulai
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Karyawan</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Periode</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Gaji Kotor</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Potongan</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Gaji Bersih</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {payrollRecords.map(record => (
                                        <tr key={record.id} className="hover:bg-gray-50 smooth-transition">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{record.employeeName}</p>
                                                <p className="text-sm text-gray-500">{record.employeeId}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-gray-900">{record.period}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-sm">
                                                {formatCurrency(record.grossSalary)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-sm text-danger-600">
                                                -{formatCurrency(record.totalDeductions)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-semibold text-success-600">
                                                {formatCurrency(record.netSalary)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setEditingRecord(record)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Edit size={16} />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setShowPrintModal(record.id)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Printer size={16} />
                                                        Cetak
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>

            {/* Edit Modal */}
            {editingRecord && (
                <Modal
                    isOpen={!!editingRecord}
                    onClose={() => setEditingRecord(null)}
                    title="Edit Payroll"
                    size="xl"
                >
                    <PayrollEditForm
                        record={editingRecord}
                        onUpdate={(id, updates) => {
                            updatePayrollRecord(id, updates);
                            setEditingRecord(null);
                        }}
                        onCancel={() => setEditingRecord(null)}
                    />
                </Modal>
            )}

            {/* Print Modal */}
            {printRecord && (
                <Modal
                    isOpen={!!showPrintModal}
                    onClose={() => setShowPrintModal(null)}
                    title="Cetak Slip Gaji"
                    size="xl"
                >
                    <PrintWrapper title="Slip Gaji">
                        <PayrollSlipPrint record={printRecord} />
                    </PrintWrapper>
                </Modal>
            )}
        </div>
    );
}
