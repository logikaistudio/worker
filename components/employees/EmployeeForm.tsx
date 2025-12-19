'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Employee } from '@/types';
import Button from '@/components/ui/Button';
import EditableDropdown from '@/components/ui/EditableDropdown';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/currencyHelpers';
import {
    getDepartments, addDepartment, removeDepartment,
    getPositions, addPosition, removePosition
} from '@/utils/masterData';

interface EmployeeFormProps {
    employee?: Employee;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSuccess, onCancel }) => {
    const { addEmployee, updateEmployee } = useData();
    const isEditMode = !!employee;

    const [formData, setFormData] = useState({
        name: employee?.name || '',
        employeeId: employee?.employeeId || '',
        email: employee?.email || '',
        phone: employee?.phone || '',
        position: employee?.position || '',
        department: employee?.department || '',
        joinDate: employee?.joinDate || '',
        address: employee?.address || '',
        basicSalary: employee?.basicSalary ? formatCurrencyInput(employee.basicSalary.toString()) : '',
        transportAllowance: employee?.allowances?.transport ? formatCurrencyInput(employee.allowances.transport.toString()) : '',
        mealAllowance: employee?.allowances?.meal ? formatCurrencyInput(employee.allowances.meal.toString()) : '',
        otherAllowance: employee?.allowances?.other ? formatCurrencyInput(employee.allowances.other.toString()) : '',
        annualLeaveQuota: employee?.annualLeaveQuota?.toString() || '12',
        hierarchyLevel: employee?.hierarchyLevel?.toString() || '1',
        status: employee?.status || 'active' as 'active' | 'inactive',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const employeeData: Employee = {
            id: employee?.id || Date.now().toString(),
            name: formData.name,
            employeeId: formData.employeeId,
            email: formData.email,
            phone: formData.phone,
            position: formData.position,
            department: formData.department,
            joinDate: formData.joinDate,
            address: formData.address,
            basicSalary: parseCurrencyInput(formData.basicSalary),
            allowances: {
                transport: parseCurrencyInput(formData.transportAllowance),
                meal: parseCurrencyInput(formData.mealAllowance),
                other: parseCurrencyInput(formData.otherAllowance),
            },
            annualLeaveQuota: parseInt(formData.annualLeaveQuota),
            usedLeaveQuota: employee?.usedLeaveQuota || 0,
            remainingLeaveQuota: parseInt(formData.annualLeaveQuota) - (employee?.usedLeaveQuota || 0),
            hierarchyLevel: parseInt(formData.hierarchyLevel),
            status: formData.status,
        };

        if (isEditMode && employee) {
            updateEmployee(employee.id, employeeData);
            alert('Data karyawan berhasil diupdate!');
        } else {
            addEmployee(employeeData);
            alert('Karyawan baru berhasil ditambahkan!');
        }

        if (onSuccess) onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pribadi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Lengkap *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Nama lengkap karyawan"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ID Karyawan *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.employeeId}
                            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="EMP001"
                            disabled={isEditMode}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="email@worker.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telepon *
                        </label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="081234567890"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alamat *
                        </label>
                        <textarea
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Alamat lengkap"
                        />
                    </div>
                </div>
            </div>

            {/* Employment Information */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kepegawaian</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditableDropdown
                        value={formData.position}
                        onChange={(value) => setFormData({ ...formData, position: value })}
                        options={getPositions()}
                        onAddOption={addPosition}
                        onRemoveOption={removePosition}
                        label="Posisi"
                        placeholder="Pilih atau tambah baru"
                        required
                    />

                    <EditableDropdown
                        value={formData.department}
                        onChange={(value) => setFormData({ ...formData, department: value })}
                        options={getDepartments()}
                        onAddOption={addDepartment}
                        onRemoveOption={removeDepartment}
                        label="Departemen"
                        placeholder="Pilih atau tambah baru"
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tanggal Bergabung *
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.joinDate}
                            onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Jatah Cuti Tahunan *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.annualLeaveQuota}
                            onChange={(e) => setFormData({ ...formData, annualLeaveQuota: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="12"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Level Jabatan *
                        </label>
                        <select
                            required
                            value={formData.hierarchyLevel}
                            onChange={(e) => setFormData({ ...formData, hierarchyLevel: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="1">1 - Staff</option>
                            <option value="2">2 - Supervisor</option>
                            <option value="3">3 - Manager</option>
                            <option value="4">4 - Director</option>
                            <option value="5">5 - C-Level</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status *
                        </label>
                        <select
                            required
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="active">Aktif</option>
                            <option value="inactive">Tidak Aktif</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Salary Information */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Gaji</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gaji Pokok *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.basicSalary}
                            onChange={(e) => setFormData({ ...formData, basicSalary: formatCurrencyInput(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="15.000.000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tunjangan Transport *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.transportAllowance}
                            onChange={(e) => setFormData({ ...formData, transportAllowance: formatCurrencyInput(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="1.000.000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tunjangan Makan *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.mealAllowance}
                            onChange={(e) => setFormData({ ...formData, mealAllowance: formatCurrencyInput(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="500.000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tunjangan Lainnya *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.otherAllowance}
                            onChange={(e) => setFormData({ ...formData, otherAllowance: formatCurrencyInput(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="500.000"
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                {onCancel && (
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        Batal
                    </Button>
                )}
                <Button type="submit" variant="primary" size="lg">
                    {isEditMode ? 'Update Data' : 'Tambah Karyawan'}
                </Button>
            </div>
        </form>
    );
};

export default EmployeeForm;
