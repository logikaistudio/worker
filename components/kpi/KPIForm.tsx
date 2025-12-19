'use client';

import React, { useState } from 'react';
import { KPI } from '@/types';
import Button from '@/components/ui/Button';

interface KPIFormProps {
    kpi?: KPI;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const KPIForm: React.FC<KPIFormProps> = ({ kpi, onSuccess, onCancel }) => {
    const { addKPI, updateKPI, employees } = useData();
    const isEditMode = !!kpi;

    const [formData, setFormData] = useState({
        employeeId: kpi?.employeeId || '',
        kpiName: kpi?.kpiName || '',
        target: kpi?.target?.toString() || '',
        actual: kpi?.actual?.toString() || '',
        unit: kpi?.unit || '',
        period: kpi?.period || new Date().toISOString().slice(0, 7),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const selectedEmployee = employees.find(emp => emp.id === formData.employeeId);
        if (!selectedEmployee) return;

        const kpiData: KPI = {
            id: kpi?.id || Date.now().toString(),
            employeeId: formData.employeeId,
            employeeName: selectedEmployee.name,
            kpiName: formData.kpiName,
            target: parseFloat(formData.target),
            actual: parseFloat(formData.actual),
            unit: formData.unit,
            period: formData.period,
            createdAt: kpi?.createdAt || new Date().toISOString(),
        };

        if (isEditMode && kpi) {
            updateKPI(kpi.id, kpiData);
            alert('KPI berhasil diupdate!');
        } else {
            addKPI(kpiData);
            alert('KPI berhasil ditambahkan!');
        }

        if (onSuccess) onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Karyawan *
                </label>
                <select
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isEditMode}
                >
                    <option value="">Pilih Karyawan</option>
                    {employees.filter(e => e.status === 'active').map(emp => (
                        <option key={emp.id} value={emp.id}>
                            {emp.name} - {emp.position}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama KPI *
                </label>
                <input
                    type="text"
                    required
                    value={formData.kpiName}
                    onChange={(e) => setFormData({ ...formData, kpiName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Contoh: Sales Target, Project Completion"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target *
                    </label>
                    <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.target}
                        onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actual *
                    </label>
                    <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.actual}
                        onChange={(e) => setFormData({ ...formData, actual: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Contoh: projects, sales, units"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Periode *
                    </label>
                    <input
                        type="month"
                        required
                        value={formData.period}
                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                {onCancel && (
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        Batal
                    </Button>
                )}
                <Button type="submit" variant="primary" size="lg">
                    {isEditMode ? 'Update KPI' : 'Tambah KPI'}
                </Button>
            </div>
        </form>
    );
};

// Add missing import
import { useData } from '@/context/DataContext';

export default KPIForm;
