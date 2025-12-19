'use client';

import React from 'react';
import { KPI } from '@/types';
import { calculateAchievementPercentage, getKPIStatus, getKPIWarningMessage } from '@/utils/kpiHelpers';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AlertTriangle, TrendingUp, Edit } from 'lucide-react';

interface KPICardProps {
    kpi: KPI;
    onEdit?: (kpi: KPI) => void;
}

const KPICard: React.FC<KPICardProps> = ({ kpi, onEdit }) => {
    const percentage = calculateAchievementPercentage(kpi.actual, kpi.target);
    const status = getKPIStatus(percentage);
    const warning = getKPIWarningMessage(percentage, kpi.kpiName);

    return (
        <Card variant="elevated" className={`p-5 border-l-4 ${status.borderColor}`}>
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">{kpi.kpiName}</h3>
                        <p className="text-sm text-gray-600 truncate">{kpi.employeeName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Periode: {kpi.period}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {percentage < 100 && (
                            <AlertTriangle className={status.textColor} size={20} />
                        )}
                        {percentage >= 100 && (
                            <TrendingUp className="text-success-600" size={20} />
                        )}
                        {onEdit && (
                            <Button size="sm" variant="outline" onClick={() => onEdit(kpi)} className="p-1 h-auto">
                                <Edit size={16} />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-gray-700">Progress</span>
                        <span className={`text-sm font-bold ${status.textColor}`}>
                            {percentage.toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                            className={`h-full smooth-transition ${status.bgColor.replace('100', '500')}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Target vs Actual */}
                <div className="grid grid-cols-2 gap-3">
                    <div className={`${status.bgColor} rounded-lg p-2.5`}>
                        <p className="text-xs text-gray-600 mb-0.5">Target</p>
                        <p className="text-base font-bold text-gray-900 truncate">
                            {kpi.target.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-600 truncate">{kpi.unit}</p>
                    </div>
                    <div className={`${status.bgColor} rounded-lg p-2.5`}>
                        <p className="text-xs text-gray-600 mb-0.5">Aktual</p>
                        <p className="text-base font-bold text-gray-900 truncate">
                            {kpi.actual.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-600 truncate">{kpi.unit}</p>
                    </div>
                </div>

                {/* Warning Message */}
                {warning && (
                    <div className={`${status.bgColor} ${status.textColor} rounded-lg p-2.5 text-xs font-medium flex items-start gap-2`}>
                        <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                        <span className="leading-tight">{warning}</span>
                    </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-gray-500">Status</span>
                    <span className={`text-xs font-semibold ${status.textColor}`}>
                        {status.label}
                    </span>
                </div>
            </div>
        </Card>
    );
};

export default KPICard;
