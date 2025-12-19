'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { leaveTypeLabels, statusLabels } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import PrintWrapper from '@/components/PrintWrapper';
import LeaveRequestForm from '@/components/attendance/LeaveRequestForm';
import LeaveApprovalFlow from '@/components/attendance/LeaveApprovalFlow';
import LeavePrintForm from '@/components/attendance/LeavePrintForm';
import { Calendar, Plus, Eye, Printer } from 'lucide-react';

export default function AttendancePage() {
    const { leaveRequests } = useData();
    const [showForm, setShowForm] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
    const [showPrintModal, setShowPrintModal] = useState(false);

    const selectedLeave = leaveRequests.find(req => req.id === selectedRequest);
    const printLeave = leaveRequests.find(req => req.id === showPrintModal.toString());

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            default: return 'warning';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manajemen Absensi</h1>
                    <p className="text-gray-600 mt-1">Kelola pengajuan cuti karyawan</p>
                </div>
                <Button
                    onClick={() => setShowForm(true)}
                    variant="primary"
                    size="lg"
                    className="flex items-center gap-2"
                >
                    <Plus size={20} />
                    Ajukan Cuti
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Pengajuan</p>
                            <p className="text-2xl font-bold text-gray-900">{leaveRequests.length}</p>
                        </div>
                        <Calendar className="text-primary-600" size={32} />
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Menunggu Persetujuan</p>
                            <p className="text-2xl font-bold text-warning-yellow-600">
                                {leaveRequests.filter(r => r.status === 'pending').length}
                            </p>
                        </div>
                        <Calendar className="text-warning-yellow-600" size={32} />
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Disetujui</p>
                            <p className="text-2xl font-bold text-success-600">
                                {leaveRequests.filter(r => r.status === 'approved').length}
                            </p>
                        </div>
                        <Calendar className="text-success-600" size={32} />
                    </div>
                </Card>
            </div>

            {/* Leave Requests Table */}
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Riwayat Pengajuan Cuti</h2>

                    {leaveRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-500">Belum ada pengajuan cuti</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Karyawan</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Jenis</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Periode</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {leaveRequests.map(request => (
                                        <tr key={request.id} className="hover:bg-gray-50 smooth-transition">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{request.employeeName}</p>
                                                <p className="text-sm text-gray-500">{request.employeeId}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-gray-900">{leaveTypeLabels[request.leaveType]}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-gray-900">
                                                    {new Date(request.startDate).toLocaleDateString('id-ID')}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    s/d {new Date(request.endDate).toLocaleDateString('id-ID')}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={getStatusVariant(request.status)}>
                                                    {statusLabels[request.status]}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSelectedRequest(request.id)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Eye size={16} />
                                                        Detail
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => setShowPrintModal(request.id as any)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Printer size={16} />
                                                        Cetak
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>

            {/* Form Modal */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title="Pengajuan Cuti Baru"
                size="lg"
            >
                <LeaveRequestForm onSuccess={() => setShowForm(false)} />
            </Modal>

            {/* Detail Modal */}
            {selectedLeave && (
                <Modal
                    isOpen={!!selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    title="Detail Pengajuan Cuti"
                    size="lg"
                >
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Informasi Cuti</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Karyawan</p>
                                    <p className="font-medium text-gray-900">{selectedLeave.employeeName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Jenis Cuti</p>
                                    <p className="font-medium text-gray-900">{leaveTypeLabels[selectedLeave.leaveType]}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Tanggal Mulai</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(selectedLeave.startDate).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Tanggal Selesai</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(selectedLeave.endDate).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-600 mb-1">Alasan</p>
                                    <p className="text-gray-900">{selectedLeave.reason}</p>
                                </div>
                            </div>
                        </div>

                        <LeaveApprovalFlow request={selectedLeave} />
                    </div>
                </Modal>
            )}

            {/* Print Modal */}
            {printLeave && (
                <Modal
                    isOpen={!!showPrintModal}
                    onClose={() => setShowPrintModal(false)}
                    title="Cetak Formulir Cuti"
                    size="xl"
                >
                    <PrintWrapper title="Formulir Cuti">
                        <LeavePrintForm request={printLeave} />
                    </PrintWrapper>
                </Modal>
            )}
        </div>
    );
}
