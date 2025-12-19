'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { LeaveRequest, leaveTypeLabels } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import LeaveApprovalFlow from '@/components/attendance/LeaveApprovalFlow';
import { CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';

export default function ApprovalPage() {
    const { leaveRequests, updateLeaveRequest, approveLeaveRequest, employees } = useData();
    const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [approvalLevel, setApprovalLevel] = useState<1 | 2>(1);

    const selectedReq = leaveRequests.find(req => req.id === selectedRequest);

    const pendingRequests = leaveRequests.filter(req => req.status === 'pending');
    const approvedRequests = leaveRequests.filter(req => req.status === 'approved');
    const rejectedRequests = leaveRequests.filter(req => req.status === 'rejected');

    const handleApproval = (requestId: string, level: 1 | 2, action: 'approve' | 'reject') => {
        const request = leaveRequests.find(r => r.id === requestId);
        if (!request) return;

        if (action === 'approve') {
            if (level === 1) {
                // Approve level 1
                updateLeaveRequest(requestId, {
                    approver1Status: 'approved',
                    approver1Date: new Date().toISOString(),
                });
                alert('Approval Level 1 berhasil!');
            } else {
                // Approve level 2 - this also triggers quota deduction
                approveLeaveRequest(requestId);
                alert('Cuti disetujui! Jatah cuti karyawan telah dikurangi.');
            }
        } else {
            // Reject
            updateLeaveRequest(requestId, {
                status: 'rejected',
                ...(level === 1
                    ? { approver1Status: 'rejected', approver1Date: new Date().toISOString() }
                    : { approver2Status: 'rejected', approver2Date: new Date().toISOString() }
                ),
            });
            alert('Pengajuan cuti ditolak.');
        }

        setSelectedRequest(null);
        setActionType(null);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getEmployee = (employeeId: string) => {
        return employees.find(e => e.id === employeeId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Approval Cuti</h1>
                <p className="text-gray-600 mt-1">Kelola persetujuan pengajuan cuti karyawan</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Menunggu Approval</p>
                            <p className="text-2xl font-bold text-warning-yellow-600">{pendingRequests.length}</p>
                        </div>
                        <Clock className="text-warning-yellow-600" size={32} />
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Disetujui</p>
                            <p className="text-2xl font-bold text-success-600">{approvedRequests.length}</p>
                        </div>
                        <CheckCircle2 className="text-success-600" size={32} />
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Ditolak</p>
                            <p className="text-2xl font-bold text-danger-600">{rejectedRequests.length}</p>
                        </div>
                        <XCircle className="text-danger-600" size={32} />
                    </div>
                </Card>
            </div>

            {/* Pending Approvals */}
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Approval</h2>

                    {pendingRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-500">Tidak ada pengajuan cuti yang menunggu approval</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Karyawan</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Jenis</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Durasi</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Level 1</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Level 2</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {pendingRequests.map(request => {
                                        const employee = getEmployee(request.employeeId);
                                        return (
                                            <tr key={request.id} className="hover:bg-gray-50 smooth-transition">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900">{request.employeeName}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Sisa cuti: {employee?.remainingLeaveQuota || 0} hari
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-900">
                                                        {leaveTypeLabels[request.leaveType]}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm text-gray-900">
                                                        {formatDate(request.startDate)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        s/d {formatDate(request.endDate)}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-semibold text-primary-600">
                                                        {request.totalDays} hari
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={
                                                        request.approver1Status === 'approved' ? 'success' :
                                                            request.approver1Status === 'rejected' ? 'danger' : 'warning'
                                                    }>
                                                        {request.approver1Status === 'approved' ? 'Approved' :
                                                            request.approver1Status === 'rejected' ? 'Rejected' : 'Pending'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={
                                                        request.approver2Status === 'approved' ? 'success' :
                                                            request.approver2Status === 'rejected' ? 'danger' : 'warning'
                                                    }>
                                                        {request.approver2Status === 'approved' ? 'Approved' :
                                                            request.approver2Status === 'rejected' ? 'Rejected' : 'Pending'}
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
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>

            {/* Detail & Approval Modal */}
            {selectedReq && (
                <Modal
                    isOpen={!!selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    title="Detail Pengajuan Cuti"
                    size="lg"
                >
                    <div className="space-y-6">
                        {/* Employee Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-3">Informasi Karyawan</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-600">Nama:</p>
                                    <p className="font-medium text-gray-900">{selectedReq.employeeName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Sisa Cuti:</p>
                                    <p className="font-medium text-primary-600">
                                        {getEmployee(selectedReq.employeeId)?.remainingLeaveQuota || 0} hari
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Leave Details */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Detail Cuti</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Jenis Cuti:</span>
                                    <span className="font-medium">{leaveTypeLabels[selectedReq.leaveType]}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tanggal Mulai:</span>
                                    <span className="font-medium">{formatDate(selectedReq.startDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tanggal Selesai:</span>
                                    <span className="font-medium">{formatDate(selectedReq.endDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Durasi:</span>
                                    <span className="font-semibold text-primary-600">{selectedReq.totalDays} hari</span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-gray-600 mb-1">Alasan:</p>
                                    <p className="text-gray-900 bg-white p-3 rounded border">{selectedReq.reason}</p>
                                </div>
                            </div>
                        </div>

                        {/* Approval Flow */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Status Approval</h3>
                            <LeaveApprovalFlow request={selectedReq} />
                        </div>

                        {/* Action Buttons */}
                        {selectedReq.status === 'pending' && (
                            <div className="border-t pt-4">
                                <p className="text-sm text-gray-600 mb-3">Pilih level approval:</p>
                                <div className="flex gap-3 mb-4">
                                    <button
                                        onClick={() => setApprovalLevel(1)}
                                        className={`flex-1 px-4 py-2 rounded-lg border-2 smooth-transition ${approvalLevel === 1
                                                ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold'
                                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                            }`}
                                    >
                                        Level 1 (Manager)
                                    </button>
                                    <button
                                        onClick={() => setApprovalLevel(2)}
                                        className={`flex-1 px-4 py-2 rounded-lg border-2 smooth-transition ${approvalLevel === 2
                                                ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold'
                                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                            }`}
                                        disabled={selectedReq.approver1Status !== 'approved'}
                                    >
                                        Level 2 (HR Director)
                                    </button>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                        onClick={() => handleApproval(selectedReq.id, approvalLevel, 'approve')}
                                        disabled={approvalLevel === 2 && selectedReq.approver1Status !== 'approved'}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={20} />
                                        Setujui
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="lg"
                                        fullWidth
                                        onClick={() => handleApproval(selectedReq.id, approvalLevel, 'reject')}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={20} />
                                        Tolak
                                    </Button>
                                </div>

                                {approvalLevel === 2 && selectedReq.approver1Status !== 'approved' && (
                                    <p className="text-sm text-warning-yellow-600 mt-2 text-center">
                                        ⚠️ Level 2 approval hanya bisa dilakukan setelah Level 1 disetujui
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
