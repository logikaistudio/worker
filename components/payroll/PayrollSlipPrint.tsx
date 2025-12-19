import React from 'react';
import { PayrollRecord } from '@/types';

interface PayrollSlipPrintProps {
    record: PayrollRecord;
}

const PayrollSlipPrint: React.FC<PayrollSlipPrintProps> = ({ record }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="bg-white p-8 print-avoid-break">
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-gray-900 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">WORKer HRMS</h1>
                <h2 className="text-xl font-semibold text-gray-700 mt-2">SLIP GAJI</h2>
                <p className="text-gray-600 mt-2">Periode: {record.period}</p>
            </div>

            {/* Employee Info */}
            <div className="mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Nama Karyawan:</p>
                        <p className="font-semibold text-gray-900">{record.employeeName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">ID Karyawan:</p>
                        <p className="font-semibold text-gray-900">{record.employeeId}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Tanggal Pembayaran:</p>
                        <p className="font-semibold text-gray-900">
                            {new Date(record.paymentDate).toLocaleDateString('id-ID')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Earnings */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 bg-gray-100 p-2">PENDAPATAN</h3>
                <table className="w-full print-table">
                    <tbody>
                        <tr>
                            <td className="py-2">Gaji Pokok</td>
                            <td className="text-right font-mono">{formatCurrency(record.basicSalary)}</td>
                        </tr>
                        <tr>
                            <td className="py-2">Tunjangan Transport</td>
                            <td className="text-right font-mono">{formatCurrency(record.allowances.transport)}</td>
                        </tr>
                        <tr>
                            <td className="py-2">Tunjangan Makan</td>
                            <td className="text-right font-mono">{formatCurrency(record.allowances.meal)}</td>
                        </tr>
                        <tr>
                            <td className="py-2">Tunjangan Lainnya</td>
                            <td className="text-right font-mono">{formatCurrency(record.allowances.other)}</td>
                        </tr>
                        <tr className="border-t-2 border-gray-900 font-bold">
                            <td className="py-2">TOTAL PENDAPATAN</td>
                            <td className="text-right font-mono">{formatCurrency(record.grossSalary)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Deductions */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 bg-gray-100 p-2">POTONGAN</h3>
                <table className="w-full print-table">
                    <tbody>
                        <tr>
                            <td className="py-2">BPJS Kesehatan (1%)</td>
                            <td className="text-right font-mono">{formatCurrency(record.bpjsKesehatan)}</td>
                        </tr>
                        <tr>
                            <td className="py-2">BPJS Ketenagakerjaan (2%)</td>
                            <td className="text-right font-mono">{formatCurrency(record.bpjsKetenagakerjaan)}</td>
                        </tr>
                        <tr>
                            <td className="py-2">Pajak Penghasilan (PPh 21)</td>
                            <td className="text-right font-mono">{formatCurrency(record.tax)}</td>
                        </tr>
                        {record.otherDeductions > 0 && (
                            <tr>
                                <td className="py-2">Potongan Lainnya</td>
                                <td className="text-right font-mono">{formatCurrency(record.otherDeductions)}</td>
                            </tr>
                        )}
                        <tr className="border-t-2 border-gray-900 font-bold">
                            <td className="py-2">TOTAL POTONGAN</td>
                            <td className="text-right font-mono">{formatCurrency(record.totalDeductions)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Net Salary */}
            <div className="border-t-4 border-gray-900 pt-4 mb-8">
                <table className="w-full">
                    <tbody>
                        <tr className="text-lg font-bold">
                            <td className="py-2">GAJI BERSIH (TAKE HOME PAY)</td>
                            <td className="text-right font-mono text-primary-600">
                                {formatCurrency(record.netSalary)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-xs text-gray-500">
                <p>Slip gaji ini dihasilkan oleh sistem WORKer HRMS</p>
                <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
            </div>
        </div>
    );
};

export default PayrollSlipPrint;
