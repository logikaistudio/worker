'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { KPI } from '@/types';
import { calculateAchievementPercentage, getKPIStatus } from '@/utils/kpiHelpers';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import KPICard from '@/components/kpi/KPICard';
import KPIForm from '@/components/kpi/KPIForm';
import { Target, Plus, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';

export default function KPIPage() {
    const { kpis } = useData();
    const [showForm, setShowForm] = useState(false);
    const [editingKPI, setEditingKPI] = useState<KPI | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'warning' | 'good'>('all');

    const filteredKPIs = kpis.filter(kpi => {
        const percentage = calculateAchievementPercentage(kpi.actual, kpi.target);

        if (filterStatus === 'warning') {
            return percentage < 100;
        } else if (filterStatus === 'good') {
            return percentage >= 100;
        }
        return true;
    });

    const totalKPIs = kpis.length;
    const warningKPIs = kpis.filter(k => calculateAchievementPercentage(k.actual, k.target) < 90).length;
    const achievedKPIs = kpis.filter(k => calculateAchievementPercentage(k.actual, k.target) >= 100).length;

    const criticalKPIs = kpis.filter(k => calculateAchievementPercentage(k.actual, k.target) < 80);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Key Performance Indicators</h1>
                    <p className="text-gray-600 mt-1">Monitor dan kelola KPI karyawan</p>
                </div>
                <Button
                    onClick={() => setShowForm(true)}
                    variant="primary"
                    size="lg"
                    className="flex items-center gap-2"
                >
                    <Plus size={20} />
                    Tambah KPI
                </Button>
            </div>

            {/* Critical Alerts */}
            {criticalKPIs.length > 0 && (
                <Card variant="outlined" className="border-danger-500 bg-danger-50">
                    <div className="p-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-danger-600 flex-shrink-0" size={24} />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-danger-900 mb-2">
                                    Peringatan: {criticalKPIs.length} KPI di Bawah 80%
                                </h3>
                                <ul className="space-y-1">
                                    {criticalKPIs.map(kpi => {
                                        const percentage = calculateAchievementPercentage(kpi.actual, kpi.target);
                                        return (
                                            <li key={kpi.id} className="text-sm text-danger-700">
                                                • {kpi.employeeName} - {kpi.kpiName}: {percentage.toFixed(1)}%
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total KPI</p>
                            <p className="text-2xl font-bold text-gray-900">{totalKPIs}</p>
                        </div>
                        <Target className="text-primary-600" size={32} />
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Perlu Perhatian</p>
                            <p className="text-2xl font-bold text-warning-orange-600">{warningKPIs}</p>
                        </div>
                        <AlertTriangle className="text-warning-orange-600" size={32} />
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Target Tercapai</p>
                            <p className="text-2xl font-bold text-success-600">{achievedKPIs}</p>
                        </div>
                        <CheckCircle2 className="text-success-600" size={32} />
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <Filter size={20} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Filter:</span>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={filterStatus === 'all' ? 'primary' : 'outline'}
                            onClick={() => setFilterStatus('all')}
                        >
                            Semua ({totalKPIs})
                        </Button>
                        <Button
                            size="sm"
                            variant={filterStatus === 'warning' ? 'primary' : 'outline'}
                            onClick={() => setFilterStatus('warning')}
                        >
                            Perlu Perhatian ({totalKPIs - achievedKPIs})
                        </Button>
                        <Button
                            size="sm"
                            variant={filterStatus === 'good' ? 'primary' : 'outline'}
                            onClick={() => setFilterStatus('good')}
                        >
                            Tercapai ({achievedKPIs})
                        </Button>
                    </div>
                </div>
            </Card>

            {/* KPI Cards Grid */}
            {filteredKPIs.length === 0 ? (
                <Card>
                    <div className="p-12 text-center">
                        <Target className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500">
                            {kpis.length === 0
                                ? 'Belum ada data KPI'
                                : 'Tidak ada KPI yang sesuai dengan filter'
                            }
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredKPIs.map(kpi => (
                        <KPICard key={kpi.id} kpi={kpi} onEdit={setEditingKPI} />
                    ))}
                </div>
            )}

            {/* Add Form Modal */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title="Tambah KPI Baru"
                size="lg"
            >
                <KPIForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
            </Modal>

            {/* Edit Form Modal */}
            {editingKPI && (
                <Modal
                    isOpen={!!editingKPI}
                    onClose={() => setEditingKPI(null)}
                    title="Edit KPI"
                    size="lg"
                >
                    <KPIForm kpi={editingKPI} onSuccess={() => setEditingKPI(null)} onCancel={() => setEditingKPI(null)} />
                </Modal>
            )}
        </div>
    );
}
