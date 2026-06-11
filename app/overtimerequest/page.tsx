'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { OvertimeRequest } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Clock, Plus, Check, X, FileText } from 'lucide-react';
import { calculateOvertimePay } from '@/utils/payrollHelpers';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/currencyHelpers';

export default function OvertimeRequestPage() {
    const { overtimeRequests, addOvertimeRequest, updateOvertimeRequest, employees } = useData();
    const [showForm, setShowForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

    const [form, setForm] = useState({
        employeeId: '', date: new Date().toISOString().slice(0, 10),
        estimatedHours: '', reason: '', projectName: '',
    });

    const activeEmployees = employees.filter(e => e.status === 'active');

    const filtered = useMemo(() => {
        return overtimeRequests.filter(r => {
            const matchStatus = filterStatus === 'all' || r.status === filterStatus;
            const matchMonth = !filterMonth || r.date.startsWith(filterMonth);
            return matchStatus && matchMonth;
        }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }, [overtimeRequests, filterStatus, filterMonth]);

    const totalApprovedHours = filtered.filter(r => r.status === 'approved' || r.status === 'completed')
        .reduce((sum, r) => sum + (r.actualHours || r.estimatedHours), 0);

    const handleSubmit = () => {
        const emp = employees.find(e => e.id === form.employeeId);
        if (!emp) return;
        const hours = parseFloat(form.estimatedHours);
        const cost = calculateOvertimePay(emp.basicSalary, hours);

        addOvertimeRequest({
            id: `ot-${Date.now()}`,
            employeeId: emp.id,
            employeeName: emp.name,
            date: form.date,
            estimatedHours: hours,
            reason: form.reason,
            projectName: form.projectName || undefined,
            status: 'pending',
            estimatedCost: cost,
            createdAt: new Date().toISOString(),
        });
        setShowForm(false);
        setForm({ employeeId: '', date: new Date().toISOString().slice(0, 10), estimatedHours: '', reason: '', projectName: '' });
    };

    const handleApprove = (id: string) => {
        updateOvertimeRequest(id, { status: 'approved', approverName: 'Admin', approverDate: new Date().toISOString() });
    };

    const handleReject = (id: string) => {
        updateOvertimeRequest(id, { status: 'rejected', approverName: 'Admin', approverDate: new Date().toISOString() });
    };

    const handleComplete = (id: string, actualHours: number) => {
        const req = overtimeRequests.find(r => r.id === id);
        if (!req) return;
        const emp = employees.find(e => e.id === req.employeeId);
        if (!emp) return;
        updateOvertimeRequest(id, { status: 'completed', actualHours, actualCost: calculateOvertimePay(emp.basicSalary, actualHours) });
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const statusLabels: Record<string, string> = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak', completed: 'Selesai' };
    const statusVariant = (s: string) => s === 'approved' ? 'success' : s === 'rejected' ? 'danger' : s === 'completed' ? 'info' : 'warning';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pengajuan Lembur (SPL)</h1>
                    <p className="text-gray-600 mt-1">Kelola surat perintah lembur karyawan</p>
                </div>
                <Button onClick={() => setShowForm(true)} variant="primary" className="flex items-center gap-2">
                    <Plus size={18} /> Ajukan Lembur
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card variant="elevated" className="p-5">
                    <p className="text-sm text-gray-600">Total Pengajuan</p>
                    <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
                </Card>
                <Card variant="elevated" className="p-5">
                    <p className="text-sm text-gray-600">Menunggu Approval</p>
                    <p className="text-2xl font-bold text-warning-yellow-600">{filtered.filter(r => r.status === 'pending').length}</p>
                </Card>
                <Card variant="elevated" className="p-5">
                    <p className="text-sm text-gray-600">Total Jam Lembur</p>
                    <p className="text-2xl font-bold text-primary-600">{totalApprovedHours.toFixed(1)} jam</p>
                </Card>
                <Card variant="elevated" className="p-5">
                    <p className="text-sm text-gray-600">Estimasi Biaya</p>
                    <p className="text-2xl font-bold text-success-600">
                        {formatCurrency(filtered.filter(r => r.status !== 'rejected').reduce((s, r) => s + (r.actualCost || r.estimatedCost), 0))}
                    </p>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex gap-3 flex-wrap">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="all">Semua Status</option>
                        <option value="pending">Menunggu</option>
                        <option value="approved">Disetujui</option>
                        <option value="completed">Selesai</option>
                        <option value="rejected">Ditolak</option>
                    </select>
                    <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
            </Card>

            {/* List */}
            {filtered.length === 0 ? (
                <Card className="p-12 text-center">
                    <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">Belum ada pengajuan lembur</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filtered.map(req => (
                        <Card key={req.id} variant="elevated" className="p-5 hover:shadow-lg smooth-transition">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-gray-900">{req.employeeName}</h3>
                                        <Badge variant={statusVariant(req.status) as any}>{statusLabels[req.status]}</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                        <div><span className="text-gray-500">Tanggal:</span> <strong>{new Date(req.date).toLocaleDateString('id-ID')}</strong></div>
                                        <div><span className="text-gray-500">Estimasi:</span> <strong>{req.estimatedHours} jam</strong></div>
                                        {req.actualHours && <div><span className="text-gray-500">Aktual:</span> <strong>{req.actualHours} jam</strong></div>}
                                        <div><span className="text-gray-500">Biaya:</span> <strong>{formatCurrency(req.actualCost || req.estimatedCost)}</strong></div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">{req.reason}</p>
                                    {req.projectName && <p className="text-sm text-primary-600 mt-1">Project: {req.projectName}</p>}
                                </div>
                                <div className="flex gap-2 ml-4">
                                    {req.status === 'pending' && (
                                        <>
                                            <Button size="sm" variant="primary" onClick={() => handleApprove(req.id)} className="flex items-center gap-1">
                                                <Check size={14} /> Setujui
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => handleReject(req.id)} className="flex items-center gap-1">
                                                <X size={14} /> Tolak
                                            </Button>
                                        </>
                                    )}
                                    {req.status === 'approved' && (
                                        <Button size="sm" variant="outline" onClick={() => {
                                            const hours = prompt('Jam lembur aktual:', req.estimatedHours.toString());
                                            if (hours) handleComplete(req.id, parseFloat(hours));
                                        }} className="flex items-center gap-1">
                                            <FileText size={14} /> Selesaikan
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Pengajuan Lembur Baru" size="lg">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Karyawan *</label>
                        <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                            <option value="">Pilih karyawan...</option>
                            {activeEmployees.map(e => <option key={e.id} value={e.id}>{e.name} - {e.department}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Tanggal *</label>
                            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Estimasi Jam *</label>
                            <input type="number" step="0.5" min="0.5" value={form.estimatedHours}
                                onChange={e => setForm({ ...form, estimatedHours: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Nama Project</label>
                        <input type="text" value={form.projectName} onChange={e => setForm({ ...form, projectName: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Alasan Lembur *</label>
                        <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div>

                    {form.employeeId && form.estimatedHours && (
                        <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                            <p className="text-sm text-primary-800">
                                Estimasi Biaya Lembur: <strong>{formatCurrency(calculateOvertimePay(
                                    employees.find(e => e.id === form.employeeId)?.basicSalary || 0,
                                    parseFloat(form.estimatedHours) || 0
                                ))}</strong>
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t">
                        <Button onClick={handleSubmit} variant="primary" className="flex-1">Ajukan</Button>
                        <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">Batal</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
