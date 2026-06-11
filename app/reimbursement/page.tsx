'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Reimbursement, ReimbursementCategory, reimbursementCategoryLabels } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Receipt, Plus, Check, X, CreditCard, Filter, Clock } from 'lucide-react';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/currencyHelpers';

export default function ReimbursementPage() {
    const { reimbursements, addReimbursement, updateReimbursement, employees } = useData();
    const [showForm, setShowForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    const [form, setForm] = useState({
        employeeId: '',
        category: 'transport' as ReimbursementCategory,
        amount: '',
        description: '',
        transactionDate: new Date().toISOString().slice(0, 10),
    });

    const activeEmployees = employees.filter(e => e.status === 'active');

    const filtered = useMemo(() => {
        return reimbursements.filter(r => {
            const matchStatus = filterStatus === 'all' || r.status === filterStatus;
            const matchCategory = filterCategory === 'all' || r.category === filterCategory;
            return matchStatus && matchCategory;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [reimbursements, filterStatus, filterCategory]);

    const stats = useMemo(() => {
        const total = reimbursements.length;
        const pending = reimbursements.filter(r => r.status === 'pending').length;
        const approvedAmount = reimbursements
            .filter(r => r.status === 'approved' || r.status === 'paid')
            .reduce((sum, r) => sum + r.amount, 0);
        return { total, pending, approvedAmount };
    }, [reimbursements]);

    const handleSubmit = () => {
        const emp = employees.find(e => e.id === form.employeeId);
        if (!emp) return;

        addReimbursement({
            id: `reimb-${Date.now()}`,
            employeeId: emp.id,
            employeeName: emp.name,
            category: form.category,
            amount: parseCurrencyInput(form.amount),
            description: form.description,
            transactionDate: form.transactionDate,
            status: 'pending',
            createdAt: new Date().toISOString(),
        });
        
        setShowForm(false);
        setForm({
            employeeId: '', category: 'transport', amount: '', description: '', 
            transactionDate: new Date().toISOString().slice(0, 10)
        });
    };

    const handleApprove = (id: string) => {
        updateReimbursement(id, { 
            status: 'approved', 
            approverName: 'Finance Admin', 
            approverDate: new Date().toISOString() 
        });
    };

    const handleReject = (id: string) => {
        const reason = prompt('Alasan penolakan:');
        if (reason === null) return;
        updateReimbursement(id, { 
            status: 'rejected', 
            approverName: 'Finance Admin', 
            approverDate: new Date().toISOString(),
            rejectionReason: reason || 'Ditolak tanpa alasan'
        });
    };

    const handlePay = (id: string) => {
        updateReimbursement(id, { status: 'paid' });
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const statusLabels: Record<string, string> = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak', paid: 'Dibayar' };
    const statusVariant = (s: string) => s === 'approved' ? 'success' : s === 'rejected' ? 'danger' : s === 'paid' ? 'info' : 'warning';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Klaim & Reimbursement</h1>
                    <p className="text-gray-600 mt-1">Kelola pengajuan klaim biaya karyawan</p>
                </div>
                <Button onClick={() => setShowForm(true)} variant="primary" className="flex items-center gap-2">
                    <Plus size={18} /> Ajukan Klaim
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="elevated" className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <Receipt size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Pengajuan</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                </Card>
                <Card variant="elevated" className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-warning-yellow-50 rounded-full flex items-center justify-center text-warning-yellow-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Menunggu Review</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                    </div>
                </Card>
                <Card variant="elevated" className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-success-50 rounded-full flex items-center justify-center text-success-600">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Disetujui (All Time)</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.approvedAmount)}</p>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="text-gray-400" size={18} />
                        <span className="text-sm font-medium text-gray-700">Filter:</span>
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                        <option value="all">Semua Status</option>
                        <option value="pending">Menunggu</option>
                        <option value="approved">Disetujui</option>
                        <option value="paid">Dibayar</option>
                        <option value="rejected">Ditolak</option>
                    </select>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                        <option value="all">Semua Kategori</option>
                        {Object.entries(reimbursementCategoryLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </Card>

            {/* List */}
            {filtered.length === 0 ? (
                <Card className="p-12 text-center">
                    <Receipt className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">Belum ada pengajuan reimbursement</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filtered.map(req => (
                        <Card key={req.id} variant="elevated" className="p-5 hover:shadow-lg smooth-transition">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-gray-900 text-lg">{formatCurrency(req.amount)}</h3>
                                        <Badge variant={statusVariant(req.status) as any}>{statusLabels[req.status]}</Badge>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                            {reimbursementCategoryLabels[req.category]}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-800">{req.employeeName}</p>
                                    <p className="text-sm text-gray-600 mt-1">{req.description}</p>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                        <span>Transaksi: {new Date(req.transactionDate).toLocaleDateString('id-ID')}</span>
                                        <span>Diajukan: {new Date(req.createdAt).toLocaleDateString('id-ID')}</span>
                                        {req.approverName && <span>Oleh: {req.approverName}</span>}
                                    </div>
                                    {req.rejectionReason && (
                                        <div className="mt-2 text-sm text-danger-600 bg-danger-50 p-2 rounded border border-danger-100">
                                            Alasan penolakan: {req.rejectionReason}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
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
                                        <Button size="sm" variant="outline" onClick={() => handlePay(req.id)} className="flex items-center gap-1">
                                            <CreditCard size={14} /> Tandai Dibayar
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Ajukan Reimbursement" size="md">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Karyawan *</label>
                        <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                            <option value="">Pilih karyawan...</option>
                            {activeEmployees.map(e => <option key={e.id} value={e.id}>{e.name} - {e.department}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kategori *</label>
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as ReimbursementCategory })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                            {Object.entries(reimbursementCategoryLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nominal Klaim (Rp) *</label>
                        <input type="text" value={form.amount} onChange={e => setForm({ ...form, amount: formatCurrencyInput(e.target.value) })}
                            placeholder="Contoh: 150.000" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 font-medium" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Transaksi *</label>
                        <input type="date" value={form.transactionDate} onChange={e => setForm({ ...form, transactionDate: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi / Keperluan *</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                            placeholder="Contoh: Taksi ke kantor klien Budi" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <Button onClick={handleSubmit} variant="primary" className="flex-1" disabled={!form.employeeId || !form.amount || !form.description}>
                            Kirim Pengajuan
                        </Button>
                        <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">Batal</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
