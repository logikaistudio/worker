import React from 'react';
import { LeaveRequest, leaveTypeLabels } from '@/types';

interface LeavePrintFormProps {
    request: LeaveRequest;
}

const LeavePrintForm: React.FC<LeavePrintFormProps> = ({ request }) => {
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
                <h2 className="text-xl font-semibold text-gray-700 mt-2">FORMULIR PENGAJUAN CUTI</h2>
            </div>

            {/* Request Details */}
            <div className="space-y-6 mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Nama Karyawan:</p>
                        <p className="font-semibold text-gray-900">{request.employeeName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">ID Karyawan:</p>
                        <p className="font-semibold text-gray-900">{request.employeeId}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Jenis Cuti:</p>
                        <p className="font-semibold text-gray-900">{leaveTypeLabels[request.leaveType]}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Tanggal Pengajuan:</p>
                        <p className="font-semibold text-gray-900">{formatDate(request.createdAt)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Tanggal Mulai:</p>
                        <p className="font-semibold text-gray-900">{formatDate(request.startDate)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Tanggal Selesai:</p>
                        <p className="font-semibold text-gray-900">{formatDate(request.endDate)}</p>
                    </div>
                </div>

                <div>
                    <p className="text-sm text-gray-600 mb-2">Alasan:</p>
                    <p className="text-gray-900 border border-gray-300 p-3 rounded">
                        {request.reason}
                    </p>
                </div>
            </div>

            {/* Approval Signatures */}
            <div className="mt-12 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                    {/* Approver 1 */}
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Persetujuan 1:</p>
                        <p className="font-semibold text-gray-900 mb-8">{request.approver1Name}</p>
                        <div className="border-t-2 border-gray-900 pt-2 mt-16">
                            <p className="text-sm text-gray-600">Tanda Tangan & Tanggal</p>
                        </div>
                    </div>

                    {/* Approver 2 */}
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Persetujuan 2:</p>
                        <p className="font-semibold text-gray-900 mb-8">{request.approver2Name}</p>
                        <div className="border-t-2 border-gray-900 pt-2 mt-16">
                            <p className="text-sm text-gray-600">Tanda Tangan & Tanggal</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-xs text-gray-500">
                <p>Dokumen ini dihasilkan oleh sistem WORKer HRMS</p>
                <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
            </div>
        </div>
    );
};

export default LeavePrintForm;
