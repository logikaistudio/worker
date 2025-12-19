'use client';

import React, { useState } from 'react';
import { PayrollRecord } from '@/types';
import Button from '@/components/ui/Button';

interface PayrollEditFormProps {
    record: PayrollRecord;
    onUpdate: (id: string, updates: Partial<PayrollRecord>) => void;
    onCancel: () => void;
}

const PayrollEditForm: React.FC<PayrollEditFormProps> = ({ record, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState({
        basicSalary: record.basicSalary.toString(),
        transportAllowance: record.allowances.transport.toString(),
        mealAllowance: record.allowances.meal.toString(),
        otherAllowance: record.allowances.other.toString(),
        otherDeductions: record.otherDeductions.toString(),
    });

    const calculatePayroll = () => {
        const basicSalary = parseFloat(formData.basicSalary);
        const transport = parseFloat(formData.transportAllowance);
        const meal = parseFloat(formData.mealAllowance);
        const other = parseFloat(formData.otherAllowance);
        const otherDeductions = parseFloat(formData.otherDeductions);

        // Recalculate BPJS
        const bpjsKesehatan = basicSalary * 0.01;
        const bpjsKetenagakerjaan = basicSalary * 0.02;

        // Calculate gross salary
        const grossSalary = basicSalary + transport + meal + other;

        // Calculate tax based on monthly gross
        const monthlyGross = grossSalary;
        const ptkp = 54000000 / 12; // PTKP per month
        const taxableIncome = Math.max(0, monthlyGross - ptkp);

        let tax = 0;
        if (taxableIncome <= 5000000) {
            tax = taxableIncome * 0.05;
        } else if (taxableIncome <= 25000000) {
            tax = 5000000 * 0.05 + (taxableIncome - 5000000) * 0.15;
        } else if (taxableIncome <= 50000000) {
            tax = 5000000 * 0.05 + 20000000 * 0.15 + (taxableIncome - 25000000) * 0.25;
        } else {
            tax = 5000000 * 0.05 + 20000000 * 0.15 + 25000000 * 0.25 + (taxableIncome - 50000000) * 0.30;
        }

        const totalDeductions = bpjsKesehatan + bpjsKetenagakerjaan + tax + otherDeductions;
        const netSalary = grossSalary - totalDeductions;

        return {
            basicSalary,
            allowances: {
                transport,
                meal,
                other,
            },
            bpjsKesehatan,
            bpjsKetenagakerjaan,
            tax,
            otherDeductions,
            grossSalary,
            totalDeductions,
            netSalary,
        };
    };

    const preview = calculatePayroll();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const updates = calculatePayroll();
        onUpdate(record.id, updates);
        alert('Payroll berhasil diupdate!');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Salary & Allowances */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Penghasilan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gaji Pokok *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.basicSalary}
                            onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tunjangan Transport
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.transportAllowance}
                            onChange={(e) => setFormData({ ...formData, transportAllowance: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tunjangan Makan
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.mealAllowance}
                            onChange={(e) => setFormData({ ...formData, mealAllowance: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tunjangan Lainnya
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.otherAllowance}
                            onChange={(e) => setFormData({ ...formData, otherAllowance: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Other Deductions */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Potongan Tambahan</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Potongan Lainnya (Pinjaman, dll)
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={formData.otherDeductions}
                        onChange={(e) => setFormData({ ...formData, otherDeductions: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0"
                    />
                </div>
            </div>

            {/* Preview Calculation */}
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview Perhitungan</h3>
                <table className="w-full text-sm">
                    <tbody className="space-y-2">
                        <tr>
                            <td className="py-2 text-gray-600">Gaji Kotor</td>
                            <td className="py-2 text-right font-semibold text-primary-600">
                                {formatCurrency(preview.grossSalary)}
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-600">BPJS Kesehatan (1%)</td>
                            <td className="py-2 text-right text-gray-900">
                                -{formatCurrency(preview.bpjsKesehatan)}
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-600">BPJS Ketenagakerjaan (2%)</td>
                            <td className="py-2 text-right text-gray-900">
                                -{formatCurrency(preview.bpjsKetenagakerjaan)}
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-600">Pajak PPh 21</td>
                            <td className="py-2 text-right text-gray-900">
                                -{formatCurrency(preview.tax)}
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-600">Potongan Lainnya</td>
                            <td className="py-2 text-right text-gray-900">
                                -{formatCurrency(preview.otherDeductions)}
                            </td>
                        </tr>
                        <tr className="border-t-2 border-gray-300">
                            <td className="py-2 font-bold text-gray-900">GAJI BERSIH</td>
                            <td className="py-2 text-right font-bold text-success-600 text-lg">
                                {formatCurrency(preview.netSalary)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Batal
                </Button>
                <Button type="submit" variant="primary" size="lg">
                    Update Payroll
                </Button>
            </div>
        </form>
    );
};

export default PayrollEditForm;
