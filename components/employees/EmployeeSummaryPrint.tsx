import React from 'react';
import { Employee } from '@/types';

interface EmployeeSummaryPrintProps {
    employees: Employee[];
}

const EmployeeSummaryPrint: React.FC<EmployeeSummaryPrintProps> = ({ employees }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const departments = Array.from(new Set(employees.map(e => e.department)));
    const departmentCounts = departments.map(dept => ({
        name: dept,
        count: employees.filter(e => e.department === dept).length,
    }));

    const totalActive = employees.filter(e => e.status === 'active').length;

    return (
        <div className="bg-white p-8 print-avoid-break">
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-gray-900 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">WORKer HRMS</h1>
                <h2 className="text-xl font-semibold text-gray-700 mt-2">LAPORAN SUMMARY KARYAWAN</h2>
                <p className="text-gray-600 mt-2">
                    Tanggal: {new Date().toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </p>
            </div>

            {/* Summary Stats */}
            <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-3 bg-gray-100 p-2">RINGKASAN</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border border-gray-300 rounded">
                        <p className="text-sm text-gray-600">Total Karyawan</p>
                        <p className="text-3xl font-bold text-primary-600">{employees.length}</p>
                    </div>
                    <div className="text-center p-4 border border-gray-300 rounded">
                        <p className="text-sm text-gray-600">Karyawan Aktif</p>
                        <p className="text-3xl font-bold text-success-600">{totalActive}</p>
                    </div>
                    <div className="text-center p-4 border border-gray-300 rounded">
                        <p className="text-sm text-gray-600">Departemen</p>
                        <p className="text-3xl font-bold text-gray-900">{departments.length}</p>
                    </div>
                </div>
            </div>

            {/* Department Breakdown */}
            <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-3 bg-gray-100 p-2">DISTRIBUSI PER DEPARTEMEN</h3>
                <table className="w-full print-table">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="text-left p-2">Departemen</th>
                            <th className="text-center p-2">Jumlah Karyawan</th>
                            <th className="text-center p-2">Persentase</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departmentCounts.map((dept, idx) => (
                            <tr key={idx}>
                                <td className="p-2">{dept.name}</td>
                                <td className="text-center p-2">{dept.count}</td>
                                <td className="text-center p-2">
                                    {((dept.count / employees.length) * 100).toFixed(1)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Employee List */}
            <div className="print-break-before">
                <h3 className="font-semibold text-gray-900 mb-3 bg-gray-100 p-2">DAFTAR KARYAWAN</h3>
                <table className="w-full print-table text-sm">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="text-left p-2">ID</th>
                            <th className="text-left p-2">Nama</th>
                            <th className="text-left p-2">Posisi</th>
                            <th className="text-left p-2">Departemen</th>
                            <th className="text-right p-2">Gaji Pokok</th>
                            <th className="text-center p-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                                <td className="p-2">{emp.employeeId}</td>
                                <td className="p-2">{emp.name}</td>
                                <td className="p-2">{emp.position}</td>
                                <td className="p-2">{emp.department}</td>
                                <td className="text-right p-2 font-mono text-xs">
                                    {formatCurrency(emp.basicSalary)}
                                </td>
                                <td className="text-center p-2">
                                    <span className={emp.status === 'active' ? 'font-semibold' : 'text-gray-500'}>
                                        {emp.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-xs text-gray-500">
                <p>Laporan ini dihasilkan oleh sistem WORKer HRMS</p>
                <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
            </div>
        </div>
    );
};

export default EmployeeSummaryPrint;
