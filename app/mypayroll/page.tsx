'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import PrintWrapper from '@/components/PrintWrapper';
import PayrollSlipPrint from '@/components/payroll/PayrollSlipPrint';
import { Wallet, Search, Printer, FileText } from 'lucide-react';

export default function MyPayrollPage() {
    const { employees, payrollRecords } = useData();
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [showPrintModal, setShowPrintModal] = useState<string | null>(null);

    const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
    const employeePayroll = selectedEmployeeId
        ? payrollRecords.filter(r => r.employeeId === selectedEmployeeId)
        : [];

    const printRecord = payrollRecords.find(rec => rec.id === showPrintModal);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Slip Gaji Karyawan</h1>
                <p className="text-gray-600 mt-1">Lihat dan cetak slip gaji per karyawan</p>
            </div>

            {/* Employee Selector */}
            <Card className="p-6">
                <div className="flex items-center gap-4">
                    <Search className="text-primary-600" size={24} />
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pilih Karyawan
                        </label>
                        <select
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">-- Pilih Karyawan --</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name} - {emp.employeeId} ({emp.position})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Employee Info */}
            {selectedEmployee && (
                <Card className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {selectedEmployee.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900">{selectedEmployee.name}</h3>
                            <p className="text-gray-600">{selectedEmployee.position} - {selectedEmployee.department}</p>
                            <p className="text-sm text-gray-500">ID: {selectedEmployee.employeeId}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Gaji Pokok</p>
                            <p className="text-xl font-bold text-primary-700">{formatCurrency(selectedEmployee.basicSalary)}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Payroll Records */}
            {selectedEmployeeId && (
                <Card>
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Riwayat Slip Gaji {selectedEmployee?.name}
                        </h2>

                        {employeePayroll.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                                <p className="text-gray-500">Belum ada data payroll untuk karyawan ini</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {employeePayroll.map(record => (
                                    <div key={record.id} className="border rounded-lg p-4 hover:shadow-md smooth-transition">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    Periode: {record.period}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Tanggal Pembayaran: {new Date(record.paymentDate).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() => setShowPrintModal(record.id)}
                                                className="flex items-center gap-2"
                                            >
                                                <Printer size={16} />
                                                Cetak Slip
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                                            <div>
                                                <p className="text-xs text-gray-500">Gaji Kotor</p>
                                                <p className="font-semibold text-primary-600">
                                                    {formatCurrency(record.grossSalary)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Total Potongan</p>
                                                <p className="font-semibold text-danger-600">
                                                    -{formatCurrency(record.totalDeductions)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Gaji Bersih</p>
                                                <p className="font-bold text-success-600 text-lg">
                                                    {formatCurrency(record.netSalary)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">BPJS Total</p>
                                                <p className="font-semibold text-gray-700">
                                                    {formatCurrency(record.bpjsKesehatan + record.bpjsKetenagakerjaan)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">BPJS Kesehatan:</span>
                                                <span className="ml-2 text-gray-900">{formatCurrency(record.bpjsKesehatan)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">BPJS Ketenagakerjaan:</span>
                                                <span className="ml-2 text-gray-900">{formatCurrency(record.bpjsKetenagakerjaan)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Pajak:</span>
                                                <span className="ml-2 text-gray-900">{formatCurrency(record.tax)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Potongan Lain:</span>
                                                <span className="ml-2 text-gray-900">{formatCurrency(record.otherDeductions)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
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
