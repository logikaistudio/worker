'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import PrintWrapper from '@/components/PrintWrapper';
import PayrollSlipPrint from '@/components/payroll/PayrollSlipPrint';
import { Wallet, Printer, FileText } from 'lucide-react';

interface EmployeePayrollViewProps {
    employeeId: string;
    employeeName: string;
}

const EmployeePayrollView: React.FC<EmployeePayrollViewProps> = ({ employeeId, employeeName }) => {
    const { payrollRecords } = useData();
    const [showPrintModal, setShowPrintModal] = useState<string | null>(null);

    const employeePayroll = payrollRecords.filter(r => r.employeeId === employeeId);
    const printRecord = payrollRecords.find(rec => rec.id === showPrintModal);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <Wallet className="text-primary-600" size={24} />
                <div>
                    <h3 className="font-semibold text-gray-900">Riwayat Slip Gaji</h3>
                    <p className="text-sm text-gray-600">{employeeName}</p>
                </div>
            </div>

            {employeePayroll.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">Belum ada data payroll untuk karyawan ini</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {employeePayroll.map(record => (
                        <Card key={record.id} className="p-4 hover:shadow-md smooth-transition">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        Periode: {record.period}
                                    </h4>
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
                                    Cetak
                                </Button>
                            </div>

                            <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg text-sm">
                                <div>
                                    <p className="text-xs text-gray-500">Gaji Kotor</p>
                                    <p className="font-semibold text-primary-600">
                                        {formatCurrency(record.grossSalary)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Potongan</p>
                                    <p className="font-semibold text-danger-600">
                                        -{formatCurrency(record.totalDeductions)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Gaji Bersih</p>
                                    <p className="font-bold text-success-600">
                                        {formatCurrency(record.netSalary)}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
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
};

export default EmployeePayrollView;
