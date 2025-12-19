import React from 'react';
import { Employee } from '@/types';

interface EmployeeDetailPrintProps {
    employee: Employee;
}

const EmployeeDetailPrint: React.FC<EmployeeDetailPrintProps> = ({ employee }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div className="bg-white p-8 print-avoid-break">
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-gray-900 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">WORKer HRMS</h1>
                <h2 className="text-xl font-semibold text-gray-700 mt-2">DATA KARYAWAN DETAIL</h2>
            </div>

            {/* Personal Info */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 bg-gray-100 p-2">INFORMASI PRIBADI</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">ID Karyawan:</p>
                        <p className="font-semibold text-gray-900">{employee.employeeId}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Nama Lengkap:</p>
                        <p className="font-semibold text-gray-900">{employee.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Email:</p>
                        <p className="font-semibold text-gray-900">{employee.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Telepon:</p>
                        <p className="font-semibold text-gray-900">{employee.phone}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm text-gray-600">Alamat:</p>
                        <p className="font-semibold text-gray-900">{employee.address}</p>
                    </div>
                </div>
            </div>

            {/* Employment Info */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 bg-gray-100 p-2">INFORMASI KEPEGAWAIAN</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Posisi:</p>
                        <p className="font-semibold text-gray-900">{employee.position}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Departemen:</p>
                        <p className="font-semibold text-gray-900">{employee.department}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Tanggal Bergabung:</p>
                        <p className="font-semibold text-gray-900">{formatDate(employee.joinDate)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Status:</p>
                        <p className={`font-semibold ${employee.status === 'active' ? 'text-success-600' : 'text-danger-600'}`}>
                            {employee.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Salary Info */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 bg-gray-100 p-2">INFORMASI GAJI</h3>
                <table className="w-full print-table">
                    <tbody>
                        <tr>
                            <td className="py-2">Gaji Pokok</td>
                            <td className="text-right font-mono">{formatCurrency(employee.basicSalary)}</td>
                        </tr>
                        <tr>
                            <td className="py-2">Tunjangan Transport</td>
                            <td className="text-right font-mono">{formatCurrency(employee.allowances.transport)}</td>
                        </tr>
                        <tr>
                            <td className="py-2">Tunjangan Makan</td>
                            <td className="text-right font-mono">{formatCurrency(employee.allowances.meal)}</td>
                        </tr>
                        <tr>
                            <td className="py-2">Tunjangan Lainnya</td>
                            <td className="text-right font-mono">{formatCurrency(employee.allowances.other)}</td>
                        </tr>
                        <tr className="border-t-2 border-gray-900 font-bold">
                            <td className="py-2">TOTAL GAJI KOTOR</td>
                            <td className="text-right font-mono">
                                {formatCurrency(
                                    employee.basicSalary +
                                    employee.allowances.transport +
                                    employee.allowances.meal +
                                    employee.allowances.other
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-xs text-gray-500">
                <p>Dokumen ini dihasilkan oleh sistem WORKer HRMS</p>
                <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
            </div>
        </div>
    );
};

export default EmployeeDetailPrint;
