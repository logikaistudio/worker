'use client';

import React from 'react';
import { LeaveRequest, statusLabels } from '@/types';
import Badge from '@/components/ui/Badge';
import { CheckCircle2, Clock, XCircle, ChevronRight } from 'lucide-react';

interface LeaveApprovalFlowProps {
    request: LeaveRequest;
}

const LeaveApprovalFlow: React.FC<LeaveApprovalFlowProps> = ({ request }) => {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle2 className="text-success-600" size={24} />;
            case 'rejected':
                return <XCircle className="text-danger-600" size={24} />;
            default:
                return <Clock className="text-warning-yellow-600" size={24} />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge variant="success">{statusLabels[status]}</Badge>;
            case 'rejected':
                return <Badge variant="danger">{statusLabels[status]}</Badge>;
            default:
                return <Badge variant="warning">{statusLabels[status]}</Badge>;
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">Alur Persetujuan</h4>

            <div className="flex items-center justify-between">
                {/* Approver 1 */}
                <div className="flex-1">
                    <div className="flex flex-col items-center space-y-2">
                        {getStatusIcon(request.approver1Status)}
                        <div className="text-center">
                            <p className="font-medium text-gray-900">{request.approver1Name}</p>
                            <p className="text-xs text-gray-500">Approver 1</p>
                            {getStatusBadge(request.approver1Status)}
                            {request.approver1Date && (
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(request.approver1Date).toLocaleDateString('id-ID')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 mx-4">
                    <ChevronRight className="text-gray-400" size={32} />
                </div>

                {/* Approver 2 */}
                <div className="flex-1">
                    <div className="flex flex-col items-center space-y-2">
                        {getStatusIcon(request.approver2Status)}
                        <div className="text-center">
                            <p className="font-medium text-gray-900">{request.approver2Name}</p>
                            <p className="text-xs text-gray-500">Approver 2</p>
                            {getStatusBadge(request.approver2Status)}
                            {request.approver2Date && (
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(request.approver2Date).toLocaleDateString('id-ID')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Overall Status */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Status Keseluruhan:</span>
                    <div className="text-lg font-bold">
                        {getStatusBadge(request.status)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveApprovalFlow;
