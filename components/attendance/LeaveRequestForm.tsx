'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { LeaveRequest, leaveTypeLabels } from '@/types';
import Button from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface LeaveRequestFormProps {
    onSuccess?: () => void;
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ onSuccess }) => {
    const { addLeaveRequest, employees } = useData();
    const [formData, setFormData] = useState({
        employeeId: '',
        leaveType: 'annual' as 'annual' | 'sick' | 'personal' | 'unpaid',
        startDate: '',
        endDate: '',
        reason: '',
    });

    const selectedEmployee = employees.find(emp => emp.id === formData.employeeId);

    // Calculate number of days
    const totalDays = useMemo(() => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diff = end.getTime() - start.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1; // +1 to include end date
    }, [formData.startDate, formData.endDate]);

    // Check if quota is sufficient
    const hasEnoughQuota = useMemo(() => {
        if (!selectedEmployee || formData.leaveType !== 'annual') return true;
        return selectedEmployee.remainingLeaveQuota >= totalDays;
    }, [selectedEmployee, formData.leaveType, totalDays]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedEmployee) return;

        // Check quota for annual leave
        if (formData.leaveType === 'annual' && !hasEnoughQuota) {
            alert(`Jatah cuti tidak cukup! Sisa: ${selectedEmployee.remainingLeaveQuota} hari, Diminta: ${totalDays} hari`);
            return;
        }

        const newRequest: LeaveRequest = {
            id: Date.now().toString(),
            employeeId: formData.employeeId,
            employeeName: selectedEmployee.name,
            leaveType: formData.leaveType,
            startDate: formData.startDate,
            endDate: formData.endDate,
            totalDays: totalDays,
            reason: formData.reason,
            status: 'pending',
            approver1Status: 'pending',
            approver1Name: 'Manager',
            approver2Status: 'pending',
            approver2Name: 'HR Director',
            createdAt: new Date().toISOString(),
        };

        addLeaveRequest(newRequest);

        // Reset form
        setFormData({
            employeeId: '',
            leaveType: 'annual',
            startDate: '',
            endDate: '',
            reason: '',
        });

        if (onSuccess) onSuccess();
        alert('Pengajuan cuti berhasil disubmit!');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Karyawan
                </label>
                <select
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                    <option value="">Pilih Karyawan</option>
                    {employees.filter(e => e.status === 'active').map(emp => (
                        <option key={emp.id} value={emp.id}>
                            {emp.name} - {emp.employeeId} (Sisa cuti: {emp.remainingLeaveQuota} hari)
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Cuti
                </label>
                <select
                    required
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                    {Object.entries(leaveTypeLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Mulai
                    </label>
                    <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Selesai
                    </label>
                    <input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        min={formData.startDate}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Show days calculation and quota warning */}
            {totalDays > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                        Total Hari Cuti: <span className="text-primary-600 font-bold">{totalDays} hari</span>
                    </p>
                    {selectedEmployee && formData.leaveType === 'annual' && (
                        <div className="text-sm text-gray-600">
                            <p>Jatah Tahunan: {selectedEmployee.annualLeaveQuota} hari</p>
                            <p>Sudah Digunakan: {selectedEmployee.usedLeaveQuota} hari</p>
                            <p className={`font-semibold ${hasEnoughQuota ? 'text-success-600' : 'text-danger-600'}`}>
                                Sisa: {selectedEmployee.remainingLeaveQuota} hari
                            </p>
                        </div>
                    )}
                    {!hasEnoughQuota && formData.leaveType === 'annual' && (
                        <div className="mt-2 flex items-start gap-2 text-danger-600 text-sm font-medium">
                            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                            <span>Jatah cuti tidak cukup!</span>
                        </div>
                    )}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alasan
                </label>
                <textarea
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Jelaskan alasan pengajuan cuti..."
                />
            </div>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={!hasEnoughQuota && formData.leaveType === 'annual'}
                >
                    Submit Pengajuan
                </Button>
            </div>
        </form>
    );
};

export default LeaveRequestForm;
