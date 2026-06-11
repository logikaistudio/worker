'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { ShiftTemplate, RosterAssignment } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Clock, Calendar, RefreshCw, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Copy } from 'lucide-react';

export default function ShiftsPage() {
    const {
        shiftTemplates, addShiftTemplate, updateShiftTemplate, deleteShiftTemplate,
        rosterAssignments, addRosterAssignment, deleteRosterAssignment, bulkAddRosterAssignments,
        employees, shiftSwapRequests, updateShiftSwapRequest
    } = useData();
    const [activeTab, setActiveTab] = useState<'templates' | 'roster' | 'swaps'>('templates');
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);

    // Roster state
    const [rosterWeekStart, setRosterWeekStart] = useState(() => {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(today.setDate(diff)).toISOString().slice(0, 10);
    });
    const [assignModal, setAssignModal] = useState<{ employeeId: string; date: string } | null>(null);
    const [selectedShiftForAssign, setSelectedShiftForAssign] = useState('');

    // Template form state
    const [templateForm, setTemplateForm] = useState({
        name: '', startTime: '08:00', endTime: '17:00',
        breakMinutes: '60', toleranceMinutes: '15',
        color: '#3b82f6', isNightShift: false,
    });

    const activeEmployees = employees.filter(e => e.status === 'active');

    // Week days
    const weekDates = useMemo(() => {
        const start = new Date(rosterWeekStart + 'T00:00:00');
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            return d.toISOString().slice(0, 10);
        });
    }, [rosterWeekStart]);

    const navigateWeek = (direction: number) => {
        const d = new Date(rosterWeekStart + 'T00:00:00');
        d.setDate(d.getDate() + direction * 7);
        setRosterWeekStart(d.toISOString().slice(0, 10));
    };

    const getAssignment = (empId: string, date: string) => {
        return rosterAssignments.find(r => r.employeeId === empId && r.date === date);
    };

    const getShiftById = (id: string) => shiftTemplates.find(s => s.id === id);

    const handleOpenTemplateForm = (template?: ShiftTemplate) => {
        if (template) {
            setEditingTemplate(template);
            setTemplateForm({
                name: template.name, startTime: template.startTime, endTime: template.endTime,
                breakMinutes: template.breakMinutes.toString(), toleranceMinutes: template.toleranceMinutes.toString(),
                color: template.color, isNightShift: template.isNightShift,
            });
        } else {
            setEditingTemplate(null);
            setTemplateForm({ name: '', startTime: '08:00', endTime: '17:00', breakMinutes: '60', toleranceMinutes: '15', color: '#3b82f6', isNightShift: false });
        }
        setShowTemplateForm(true);
    };

    const calculateWorkingHours = (start: string, end: string, breakMin: number) => {
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        let mins = (eh * 60 + em) - (sh * 60 + sm);
        if (mins < 0) mins += 24 * 60;
        return Math.round((mins - breakMin) / 60 * 10) / 10;
    };

    const handleSaveTemplate = () => {
        const workingHours = calculateWorkingHours(templateForm.startTime, templateForm.endTime, parseInt(templateForm.breakMinutes));
        const data: ShiftTemplate = {
            id: editingTemplate?.id || `shift-${Date.now()}`,
            name: templateForm.name, startTime: templateForm.startTime, endTime: templateForm.endTime,
            breakMinutes: parseInt(templateForm.breakMinutes), toleranceMinutes: parseInt(templateForm.toleranceMinutes),
            color: templateForm.color, isNightShift: templateForm.isNightShift,
            workingHours, isActive: true,
        };
        if (editingTemplate) updateShiftTemplate(editingTemplate.id, data);
        else addShiftTemplate(data);
        setShowTemplateForm(false);
    };

    const handleAssignShift = () => {
        if (!assignModal || !selectedShiftForAssign) return;
        const shift = getShiftById(selectedShiftForAssign);
        if (!shift) return;
        const emp = employees.find(e => e.id === assignModal.employeeId);
        if (!emp) return;

        // Remove existing assignment for this cell
        const existing = getAssignment(assignModal.employeeId, assignModal.date);
        if (existing) deleteRosterAssignment(existing.id);

        if (selectedShiftForAssign !== 'OFF') {
            addRosterAssignment({
                id: `roster-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                employeeId: emp.id, employeeName: emp.name,
                shiftId: shift.id, shiftName: shift.name,
                date: assignModal.date, status: 'scheduled',
                createdAt: new Date().toISOString(),
            });
        }
        setAssignModal(null);
        setSelectedShiftForAssign('');
    };

    const handleCopyWeek = () => {
        const nextWeekDates = weekDates.map(d => {
            const nd = new Date(d + 'T00:00:00');
            nd.setDate(nd.getDate() + 7);
            return nd.toISOString().slice(0, 10);
        });

        const currentWeekAssignments = rosterAssignments.filter(r => weekDates.includes(r.date));
        const newAssignments: RosterAssignment[] = currentWeekAssignments.map((a, i) => {
            const dayIndex = weekDates.indexOf(a.date);
            return {
                ...a,
                id: `roster-copy-${Date.now()}-${i}`,
                date: nextWeekDates[dayIndex],
                status: 'scheduled' as const,
                createdAt: new Date().toISOString(),
            };
        });

        bulkAddRosterAssignments(newAssignments);
        navigateWeek(1);
        alert(`✅ ${newAssignments.length} jadwal berhasil dicopy ke minggu berikutnya`);
    };

    const pendingSwaps = shiftSwapRequests.filter(s => s.status === 'pending');

    const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    const tabs = [
        { key: 'templates', label: 'Shift Templates', icon: Clock },
        { key: 'roster', label: 'Roster Calendar', icon: Calendar },
        { key: 'swaps', label: `Swap Requests${pendingSwaps.length > 0 ? ` (${pendingSwaps.length})` : ''}`, icon: RefreshCw },
    ] as const;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Shift & Roster</h1>
                <p className="text-gray-600 mt-1">Kelola jadwal shift dan roster karyawan</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium smooth-transition ${
                                activeTab === tab.key ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border'
                            }`}>
                            <Icon size={18} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ======= TEMPLATES TAB ======= */}
            {activeTab === 'templates' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => handleOpenTemplateForm()} variant="primary" className="flex items-center gap-2">
                            <Plus size={18} /> Tambah Shift
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {shiftTemplates.filter(s => s.isActive).map(shift => (
                            <Card key={shift.id} variant="elevated" className="p-5 hover:shadow-lg smooth-transition">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: shift.color }} />
                                    <h3 className="text-lg font-semibold text-gray-900">{shift.name}</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Jam:</span><span className="font-medium">{shift.startTime} - {shift.endTime}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Jam Kerja:</span><span className="font-medium">{shift.workingHours} jam</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Break:</span><span className="font-medium">{shift.breakMinutes} menit</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Toleransi:</span><span className="font-medium">{shift.toleranceMinutes} menit</span></div>
                                    {shift.isNightShift && <Badge variant="info">Night Shift</Badge>}
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t">
                                    <Button size="sm" variant="outline" onClick={() => handleOpenTemplateForm(shift)} className="flex-1 flex items-center justify-center gap-1">
                                        <Edit size={14} /> Edit
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => { if (confirm('Hapus shift ini?')) deleteShiftTemplate(shift.id); }} className="flex items-center gap-1">
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* ======= ROSTER CALENDAR TAB ======= */}
            {activeTab === 'roster' && (
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Button size="sm" variant="outline" onClick={() => navigateWeek(-1)}>
                                <ChevronLeft size={18} />
                            </Button>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {new Date(weekDates[0] + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} -
                                {' '}{new Date(weekDates[6] + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </h2>
                            <Button size="sm" variant="outline" onClick={() => navigateWeek(1)}>
                                <ChevronRight size={18} />
                            </Button>
                        </div>
                        <Button size="sm" variant="outline" onClick={handleCopyWeek} className="flex items-center gap-2">
                            <Copy size={16} /> Copy ke Minggu Depan
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 border min-w-[160px] sticky left-0 bg-gray-50 z-10">Karyawan</th>
                                    {weekDates.map((date, i) => {
                                        const d = new Date(date + 'T00:00:00');
                                        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                        return (
                                            <th key={date} className={`px-2 py-2 text-center text-sm font-semibold border min-w-[100px] ${isWeekend ? 'bg-danger-50 text-danger-700' : 'text-gray-900'}`}>
                                                <div>{dayLabels[i]}</div>
                                                <div className="text-xs font-normal">{d.getDate()}/{d.getMonth() + 1}</div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {activeEmployees.map(emp => (
                                    <tr key={emp.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 border text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                                            <div>{emp.name}</div>
                                            <div className="text-xs text-gray-500">{emp.department}</div>
                                        </td>
                                        {weekDates.map(date => {
                                            const assignment = getAssignment(emp.id, date);
                                            const shift = assignment ? getShiftById(assignment.shiftId) : null;
                                            const d = new Date(date + 'T00:00:00');
                                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                            return (
                                                <td key={date}
                                                    className={`px-1 py-1 border text-center cursor-pointer hover:bg-primary-50 smooth-transition ${isWeekend && !assignment ? 'bg-gray-50' : ''}`}
                                                    onClick={() => { setAssignModal({ employeeId: emp.id, date }); setSelectedShiftForAssign(assignment?.shiftId || ''); }}>
                                                    {shift ? (
                                                        <div className="px-2 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: shift.color }}>
                                                            {shift.name}
                                                            <div className="text-[10px] opacity-80">{shift.startTime}-{shift.endTime}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-300">—</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Shift Legend */}
                    <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
                        <span className="text-sm text-gray-500">Legenda:</span>
                        {shiftTemplates.filter(s => s.isActive).map(s => (
                            <div key={s.id} className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                                <span className="text-sm text-gray-700">{s.name}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* ======= SWAP REQUESTS TAB ======= */}
            {activeTab === 'swaps' && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Permintaan Tukar Shift</h2>
                    {shiftSwapRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <RefreshCw className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-500">Belum ada permintaan tukar shift</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {shiftSwapRequests.map(swap => (
                                <div key={swap.id} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{swap.requesterName} ↔ {swap.targetEmployeeName}</p>
                                            <p className="text-sm text-gray-600">
                                                {swap.originalShiftName} ({swap.originalDate}) ↔ {swap.targetShiftName} ({swap.targetDate})
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">Alasan: {swap.reason}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={swap.status === 'approved' ? 'success' : swap.status === 'rejected' ? 'danger' : 'warning'}>
                                                {swap.status === 'pending' ? 'Menunggu' : swap.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                            </Badge>
                                            {swap.status === 'pending' && (
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="primary"
                                                        onClick={() => updateShiftSwapRequest(swap.id, { status: 'approved', approvedDate: new Date().toISOString() })}>
                                                        Setujui
                                                    </Button>
                                                    <Button size="sm" variant="danger"
                                                        onClick={() => updateShiftSwapRequest(swap.id, { status: 'rejected', approvedDate: new Date().toISOString() })}>
                                                        Tolak
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* ======= TEMPLATE FORM MODAL ======= */}
            <Modal isOpen={showTemplateForm} onClose={() => setShowTemplateForm(false)} title={editingTemplate ? 'Edit Shift' : 'Tambah Shift Baru'} size="lg">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Shift *</label>
                        <input type="text" value={templateForm.name} onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., Shift Pagi" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jam Mulai</label>
                            <input type="time" value={templateForm.startTime} onChange={e => setTemplateForm({ ...templateForm, startTime: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jam Selesai</label>
                            <input type="time" value={templateForm.endTime} onChange={e => setTemplateForm({ ...templateForm, endTime: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Break (menit)</label>
                            <input type="number" value={templateForm.breakMinutes} onChange={e => setTemplateForm({ ...templateForm, breakMinutes: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Toleransi (menit)</label>
                            <input type="number" value={templateForm.toleranceMinutes} onChange={e => setTemplateForm({ ...templateForm, toleranceMinutes: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Warna</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={templateForm.color} onChange={e => setTemplateForm({ ...templateForm, color: e.target.value })}
                                    className="w-10 h-10 rounded border cursor-pointer" />
                                <span className="text-sm text-gray-500">{templateForm.color}</span>
                            </div>
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={templateForm.isNightShift} onChange={e => setTemplateForm({ ...templateForm, isNightShift: e.target.checked })}
                                    className="w-5 h-5 text-primary-600 rounded" />
                                <span className="text-sm font-medium text-gray-700">Night Shift</span>
                            </label>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                            Jam Kerja Efektif: <strong>{calculateWorkingHours(templateForm.startTime, templateForm.endTime, parseInt(templateForm.breakMinutes) || 0)} jam</strong>
                        </p>
                    </div>
                    <div className="flex gap-3 pt-4 border-t">
                        <Button onClick={handleSaveTemplate} variant="primary" className="flex-1">{editingTemplate ? 'Update' : 'Simpan'}</Button>
                        <Button onClick={() => setShowTemplateForm(false)} variant="outline" className="flex-1">Batal</Button>
                    </div>
                </div>
            </Modal>

            {/* ======= ASSIGN SHIFT MODAL ======= */}
            <Modal isOpen={!!assignModal} onClose={() => setAssignModal(null)} title="Assign Shift" size="md">
                {assignModal && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Karyawan: <strong>{employees.find(e => e.id === assignModal.employeeId)?.name}</strong></p>
                            <p className="text-sm text-gray-600">Tanggal: <strong>{new Date(assignModal.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Shift</label>
                            <div className="space-y-2">
                                {shiftTemplates.filter(s => s.isActive).map(shift => (
                                    <button key={shift.id} onClick={() => setSelectedShiftForAssign(shift.id)}
                                        className={`w-full p-3 rounded-lg border-2 text-left smooth-transition ${
                                            selectedShiftForAssign === shift.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: shift.color }} />
                                            <div>
                                                <p className="font-medium text-gray-900">{shift.name}</p>
                                                <p className="text-sm text-gray-500">{shift.startTime} - {shift.endTime} ({shift.workingHours} jam)</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                                <button onClick={() => {
                                    const existing = getAssignment(assignModal.employeeId, assignModal.date);
                                    if (existing) deleteRosterAssignment(existing.id);
                                    setAssignModal(null);
                                }}
                                    className="w-full p-3 rounded-lg border-2 border-gray-200 hover:border-danger-300 text-left text-danger-600 font-medium">
                                    ✕ Hapus Assignment
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t">
                            <Button onClick={handleAssignShift} variant="primary" className="flex-1" disabled={!selectedShiftForAssign}>Assign</Button>
                            <Button onClick={() => setAssignModal(null)} variant="outline" className="flex-1">Batal</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
