'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Employee } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import PrintWrapper from '@/components/PrintWrapper';
import EmployeeDetailPrint from '@/components/employees/EmployeeDetailPrint';
import EmployeeSummaryPrint from '@/components/employees/EmployeeSummaryPrint';
import EmployeeForm from '@/components/employees/EmployeeForm';
import EmployeePayrollView from '@/components/employees/EmployeePayrollView';
import PayrollSlipPrint from '@/components/payroll/PayrollSlipPrint';
import { Users, Plus, Edit, Printer, FileText, Search, Wallet, Receipt } from 'lucide-react';

export default function EmployeesPage() {
    const { employees, payrollRecords } = useData();
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const [showSummary, setShowSummary] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [viewPayrollEmployee, setViewPayrollEmployee] = useState<Employee | null>(null);
    const [viewLatestPayroll, setViewLatestPayroll] = useState<string | null>(null);

    const selectedEmp = employees.find(emp => emp.id === selectedEmployee);

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const totalActive = employees.filter(e => e.status === 'active').length;
    const departments = Array.from(new Set(employees.map(e => e.department))).length;

    const handleEditEmployee = (employee: Employee) => {
        setEditingEmployee(employee);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Data Karyawan</h1>
                    <p className="text-gray-600 mt-1">Kelola informasi karyawan</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setShowAddForm(true)}
                        variant="primary"
                        size="lg"
                        className="flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Tambah Karyawan
                    </Button>
                    <Button
                        onClick={() => setShowSummary(true)}
                        variant="outline"
                        size="lg"
                        className="flex items-center gap-2"
                    >
                        <FileText size={20} />
                        Cetak Summary
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Karyawan</p>
                            <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
                        </div>
                        <Users className="text-primary-600" size={32} />
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Kary awan Aktif</p>
                            <p className="text-2xl font-bold text-success-600">{totalActive}</p>
                        </div>
                        <Users className="text-success-600" size={32} />
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Departemen</p>
                            <p className="text-2xl font-bold text-gray-900">{departments}</p>
                        </div>
                        <Users className="text-gray-600" size={32} />
                    </div>
                </Card>
            </div>

            {/* Search */}
            <Card className="p-4">
                <div className="flex items-center gap-3">
                    <Search className="text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Cari karyawan (nama, ID, departemen, posisi)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </Card>

            {/* Employee Cards */}
            {filteredEmployees.length === 0 ? (
                <Card>
                    <div className="p-12 text-center">
                        <Users className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500">
                            {employees.length === 0
                                ? 'Belum ada data karyawan'
                                : 'Tidak ada karyawan yang sesuai dengan pencarian'
                            }
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredEmployees.map(employee => (
                        <Card key={employee.id} variant="elevated" className="hover:shadow-lg smooth-transition">
                            <div className="p-4">
                                <div className="flex items-center gap-4">
                                    {/* Employee Info - Left */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                                                    <Badge variant={employee.status === 'active' ? 'success' : 'default'}>
                                                        {employee.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                                    </Badge>
                                                    {employee.isApprover && (
                                                        <Badge variant="info">
                                                            Approver
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{employee.employeeId}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-500">Posisi</p>
                                                <p className="text-sm font-medium text-gray-900">{employee.position}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Departemen</p>
                                                <p className="text-sm font-medium text-gray-900">{employee.department}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Sisa Cuti</p>
                                                <p className="text-sm font-medium text-primary-600">
                                                    {employee.remainingLeaveQuota} / {employee.annualLeaveQuota} hari
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Gaji Pokok</p>
                                                <p className="text-sm font-semibold text-primary-600">
                                                    {formatCurrency(employee.basicSalary)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons - Right */}
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEditEmployee(employee)}
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setViewPayrollEmployee(employee)}
                                                title="Slip Gaji"
                                            >
                                                <Wallet size={16} />
                                            </Button>
                                            {employee.latestPayrollId && (
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() => setViewLatestPayroll(employee.latestPayrollId!)}
                                                    title="Slip Terakhir"
                                                >
                                                    <Receipt size={16} />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setSelectedEmployee(employee.id)}
                                                title="Cetak"
                                            >
                                                <FileText size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Employee Modal */}
            <Modal
                isOpen={showAddForm}
                onClose={() => setShowAddForm(false)}
                title="Tambah Karyawan Baru"
                size="xl"
            >
                <EmployeeForm onSuccess={() => setShowAddForm(false)} onCancel={() => setShowAddForm(false)} />
            </Modal>

            {/* Edit Employee Modal */}
            {editingEmployee && (
                <Modal
                    isOpen={!!editingEmployee}
                    onClose={() => setEditingEmployee(null)}
                    title="Edit Data Karyawan"
                    size="xl"
                >
                    <EmployeeForm
                        employee={editingEmployee}
                        onSuccess={() => setEditingEmployee(null)}
                        onCancel={() => setEditingEmployee(null)}
                    />
                </Modal>
            )}

            {/* Payroll View Modal */}
            {viewPayrollEmployee && (
                <Modal
                    isOpen={!!viewPayrollEmployee}
                    onClose={() => setViewPayrollEmployee(null)}
                    title="Riwayat Slip Gaji"
                    size="xl"
                >
                    <EmployeePayrollView
                        employeeId={viewPayrollEmployee.id}
                        employeeName={viewPayrollEmployee.name}
                    />
                </Modal>
            )}

            {/* Detail Print Modal */}
            {selectedEmp && (
                <Modal
                    isOpen={!!selectedEmployee}
                    onClose={() => setSelectedEmployee(null)}
                    title="Cetak Data Karyawan"
                    size="xl"
                >
                    <PrintWrapper title="Data Karyawan">
                        <EmployeeDetailPrint employee={selectedEmp} />
                    </PrintWrapper>
                </Modal>
            )}

            {/* Summary Print Modal */}
            <Modal
                isOpen={showSummary}
                onClose={() => setShowSummary(false)}
                title="Cetak Summary Karyawan"
                size="xl"
            >
                <PrintWrapper title="Summary Karyawan">
                    <EmployeeSummaryPrint employees={employees} />
                </PrintWrapper>
            </Modal>

            {/* Latest Payroll Modal */}
            {viewLatestPayroll && (
                <Modal
                    isOpen={!!viewLatestPayroll}
                    onClose={() => setViewLatestPayroll(null)}
                    title="Slip Gaji Terakhir"
                    size="xl"
                >
                    <PrintWrapper title="Slip Gaji">
                        <PayrollSlipPrint
                            record={payrollRecords.find(r => r.id === viewLatestPayroll)!}
                        />
                    </PrintWrapper>
                </Modal>
            )}
        </div>
    );
}
