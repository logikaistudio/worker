'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Announcement, AnnouncementPriority } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Megaphone, Plus, Edit, Trash2, Pin, Calendar, User } from 'lucide-react';

export default function AnnouncementsPage() {
    const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, employees } = useData();
    const [showForm, setShowForm] = useState(false);
    const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);

    const [form, setForm] = useState({
        title: '',
        content: '',
        priority: 'normal' as AnnouncementPriority,
        targetDepartment: '',
        isPinned: false,
        expiryDate: '',
    });

    const departments = useMemo(() => {
        const depts = new Set<string>();
        employees.forEach(e => { if (e.status === 'active') depts.add(e.department); });
        return Array.from(depts).sort();
    }, [employees]);

    // Sort announcements: Pinned first, then by date descending
    const sortedAnnouncements = useMemo(() => {
        return [...announcements].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [announcements]);

    const handleSubmit = () => {
        const data: Announcement = {
            id: editingAnn?.id || `ann-${Date.now()}`,
            title: form.title,
            content: form.content,
            priority: form.priority,
            targetDepartment: form.targetDepartment || undefined,
            isPinned: form.isPinned,
            expiryDate: form.expiryDate || undefined,
            authorName: editingAnn?.authorName || 'HR Admin', // Hardcoded for prototype
            createdAt: editingAnn?.createdAt || new Date().toISOString(),
        };

        if (editingAnn) updateAnnouncement(editingAnn.id, data);
        else addAnnouncement(data);
        
        setShowForm(false);
        setEditingAnn(null);
    };

    const openForm = (ann?: Announcement) => {
        if (ann) {
            setEditingAnn(ann);
            setForm({
                title: ann.title,
                content: ann.content,
                priority: ann.priority,
                targetDepartment: ann.targetDepartment || '',
                isPinned: ann.isPinned,
                expiryDate: ann.expiryDate || '',
            });
        } else {
            setEditingAnn(null);
            setForm({ title: '', content: '', priority: 'normal', targetDepartment: '', isPinned: false, expiryDate: '' });
        }
        setShowForm(true);
    };

    const togglePin = (id: string, currentPin: boolean) => {
        updateAnnouncement(id, { isPinned: !currentPin });
    };

    const priorityColors: Record<AnnouncementPriority, string> = {
        normal: 'bg-gray-100 text-gray-800 border-gray-200',
        important: 'bg-warning-yellow-100 text-warning-yellow-800 border-warning-yellow-200',
        urgent: 'bg-danger-100 text-danger-800 border-danger-200',
    };

    const priorityLabels: Record<AnnouncementPriority, string> = {
        normal: 'Normal', important: 'Penting', urgent: 'Mendesak'
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pengumuman</h1>
                    <p className="text-gray-600 mt-1">Papan informasi dan pengumuman perusahaan</p>
                </div>
                <Button onClick={() => openForm()} variant="primary" className="flex items-center gap-2">
                    <Plus size={18} /> Buat Pengumuman
                </Button>
            </div>

            {sortedAnnouncements.length === 0 ? (
                <Card className="p-12 text-center">
                    <Megaphone className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 text-lg">Belum ada pengumuman</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedAnnouncements.map(ann => {
                        const isExpired = ann.expiryDate && new Date(ann.expiryDate) < new Date();
                        return (
                            <Card key={ann.id} variant="elevated" 
                                className={`p-5 flex flex-col h-full hover:shadow-lg smooth-transition ${isExpired ? 'opacity-60' : ''} ${ann.isPinned ? 'border-primary-400 shadow-md ring-1 ring-primary-100' : ''}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex gap-2">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded border ${priorityColors[ann.priority]}`}>
                                            {priorityLabels[ann.priority]}
                                        </span>
                                        {ann.targetDepartment && (
                                            <span className="text-xs font-medium px-2 py-1 rounded border bg-blue-50 text-blue-700 border-blue-200">
                                                {ann.targetDepartment}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => togglePin(ann.id, ann.isPinned)} className={`p-1.5 rounded hover:bg-gray-100 smooth-transition ${ann.isPinned ? 'text-primary-600' : 'text-gray-400'}`} title="Pin">
                                            <Pin size={16} className={ann.isPinned ? 'fill-current' : ''} />
                                        </button>
                                    </div>
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{ann.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 flex-1 whitespace-pre-wrap line-clamp-4">
                                    {ann.content}
                                </p>
                                
                                <div className="mt-auto pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1.5">
                                    <div className="flex items-center gap-1.5"><User size={14} /> Oleh: {ann.authorName}</div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(ann.createdAt).toLocaleDateString('id-ID')}</span>
                                        {isExpired && <span className="text-danger-600 font-medium">Expired</span>}
                                    </div>
                                </div>

                                <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity bg-white/90 rounded shadow p-1 flex gap-1">
                                    <button onClick={() => openForm(ann)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"><Edit size={14} /></button>
                                    <button onClick={() => { if(confirm('Hapus pengumuman ini?')) deleteAnnouncement(ann.id); }} className="p-1.5 text-danger-600 hover:bg-danger-50 rounded"><Trash2 size={14} /></button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Form Modal */}
            <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingAnn(null); }} title={editingAnn ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'} size="lg">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Judul Pengumuman *</label>
                        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Misal: Libur Bersama Idul Fitri" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Prioritas</label>
                            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as AnnouncementPriority })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                                <option value="normal">Normal</option>
                                <option value="important">Penting</option>
                                <option value="urgent">Mendesak</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Target Departemen (Opsional)</label>
                            <select value={form.targetDepartment} onChange={e => setForm({ ...form, targetDepartment: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                                <option value="">-- Semua Departemen --</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Konten / Isi *</label>
                        <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={5}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Tulis isi pengumuman secara detail di sini..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center mt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.isPinned} onChange={e => setForm({ ...form, isPinned: e.target.checked })}
                                    className="w-5 h-5 text-primary-600 rounded" />
                                <span className="text-sm font-medium text-gray-700">Sematkan di atas (Pin)</span>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Berakhir Pada (Opsional)</label>
                            <input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <Button onClick={handleSubmit} variant="primary" className="flex-1" disabled={!form.title || !form.content}>
                            {editingAnn ? 'Update Pengumuman' : 'Publikasi Pengumuman'}
                        </Button>
                        <Button onClick={() => { setShowForm(false); setEditingAnn(null); }} variant="outline" className="flex-1">Batal</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
