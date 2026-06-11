'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Settings, Building2, Calendar, Shield, Heart, Save, Plus, Trash2 } from 'lucide-react';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/currencyHelpers';

export default function SettingsPage() {
    const { companySettings, updateCompanySettings } = useData();
    const [activeTab, setActiveTab] = useState<'company' | 'calendar' | 'bpjs' | 'tax'>('company');
    const [form, setForm] = useState({ ...companySettings });
    const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });

    const tabs = [
        { key: 'company', label: 'Perusahaan', icon: Building2 },
        { key: 'calendar', label: 'Kalender Kerja', icon: Calendar },
        { key: 'bpjs', label: 'BPJS Rates', icon: Heart },
        { key: 'tax', label: 'Pajak (PTKP)', icon: Shield },
    ] as const;

    const handleSave = () => {
        updateCompanySettings(form);
        alert('✅ Pengaturan berhasil disimpan!');
    };

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const toggleWorkDay = (day: number) => {
        const current = form.workDays;
        if (current.includes(day)) {
            setForm({ ...form, workDays: current.filter(d => d !== day) });
        } else {
            setForm({ ...form, workDays: [...current, day].sort() });
        }
    };

    const addHoliday = () => {
        if (!newHoliday.date || !newHoliday.name) return;
        setForm({
            ...form,
            nationalHolidays: [...form.nationalHolidays, newHoliday].sort((a, b) => a.date.localeCompare(b.date)),
        });
        setNewHoliday({ date: '', name: '' });
    };

    const removeHoliday = (idx: number) => {
        setForm({ ...form, nationalHolidays: form.nationalHolidays.filter((_, i) => i !== idx) });
    };

    const formatPercent = (val: number) => (val * 100).toFixed(2);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
                    <p className="text-gray-600 mt-1">Konfigurasi sistem HRMS</p>
                </div>
                <Button onClick={handleSave} variant="primary" size="lg" className="flex items-center gap-2">
                    <Save size={20} />
                    Simpan Pengaturan
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium smooth-transition ${
                                activeTab === tab.key
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                            }`}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Company Tab */}
            {activeTab === 'company' && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Building2 size={24} className="text-primary-600" />
                        Profil Perusahaan
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Perusahaan</label>
                            <input type="text" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">NPWP Perusahaan</label>
                            <input type="text" value={form.companyNpwp} onChange={e => setForm({ ...form, companyNpwp: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                            <textarea value={form.companyAddress} onChange={e => setForm({ ...form, companyAddress: e.target.value })} rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
                            <input type="tel" value={form.companyPhone} onChange={e => setForm({ ...form, companyPhone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" value={form.companyEmail} onChange={e => setForm({ ...form, companyEmail: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        </div>
                    </div>
                </Card>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
                <div className="space-y-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar size={24} className="text-primary-600" />
                            Hari & Jam Kerja
                        </h2>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Hari Kerja</label>
                            <div className="flex flex-wrap gap-2">
                                {dayNames.map((name, idx) => (
                                    <button key={idx} onClick={() => toggleWorkDay(idx)}
                                        className={`px-4 py-2 rounded-lg font-medium smooth-transition ${
                                            form.workDays.includes(idx)
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}>
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Jam Mulai Default</label>
                                <input type="time" value={form.defaultWorkStart} onChange={e => setForm({ ...form, defaultWorkStart: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Jam Selesai Default</label>
                                <input type="time" value={form.defaultWorkEnd} onChange={e => setForm({ ...form, defaultWorkEnd: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jatah Cuti Tahunan Default</label>
                            <input type="number" value={form.defaultAnnualLeave} onChange={e => setForm({ ...form, defaultAnnualLeave: parseInt(e.target.value) || 12 })}
                                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Hari Libur Nasional</h2>
                        <div className="flex gap-2 mb-4">
                            <input type="date" value={newHoliday.date} onChange={e => setNewHoliday({ ...newHoliday, date: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                            <input type="text" placeholder="Nama hari libur" value={newHoliday.name}
                                onChange={e => setNewHoliday({ ...newHoliday, name: e.target.value })}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                            <Button onClick={addHoliday} variant="primary" size="sm" className="flex items-center gap-1">
                                <Plus size={16} /> Tambah
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {form.nationalHolidays.map((h, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <span className="text-sm font-medium text-gray-900">{h.name}</span>
                                        <span className="text-sm text-gray-500 ml-3">
                                            {new Date(h.date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <button onClick={() => removeHoliday(i)} className="text-danger-500 hover:text-danger-700">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* BPJS Rates Tab */}
            {activeTab === 'bpjs' && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Heart size={24} className="text-danger-600" />
                        Tarif BPJS
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Program</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Karyawan (%)</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Perusahaan (%)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-4 py-3 font-medium">BPJS Kesehatan</td>
                                    <td className="px-4 py-3 text-center">
                                        <input type="number" step="0.01" value={formatPercent(form.bpjsKesEmployeeRate)}
                                            onChange={e => setForm({ ...form, bpjsKesEmployeeRate: parseFloat(e.target.value) / 100 })}
                                            className="w-24 px-2 py-1 border rounded text-center" />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <input type="number" step="0.01" value={formatPercent(form.bpjsKesEmployerRate)}
                                            onChange={e => setForm({ ...form, bpjsKesEmployerRate: parseFloat(e.target.value) / 100 })}
                                            className="w-24 px-2 py-1 border rounded text-center" />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">JHT (Jaminan Hari Tua)</td>
                                    <td className="px-4 py-3 text-center">
                                        <input type="number" step="0.01" value={formatPercent(form.bpjsJhtEmployeeRate)}
                                            onChange={e => setForm({ ...form, bpjsJhtEmployeeRate: parseFloat(e.target.value) / 100 })}
                                            className="w-24 px-2 py-1 border rounded text-center" />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <input type="number" step="0.01" value={formatPercent(form.bpjsJhtEmployerRate)}
                                            onChange={e => setForm({ ...form, bpjsJhtEmployerRate: parseFloat(e.target.value) / 100 })}
                                            className="w-24 px-2 py-1 border rounded text-center" />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">JKK (Jaminan Kecelakaan Kerja)</td>
                                    <td className="px-4 py-3 text-center"><span className="text-gray-400">-</span></td>
                                    <td className="px-4 py-3 text-center">
                                        <input type="number" step="0.01" value={formatPercent(form.bpjsJkkRate)}
                                            onChange={e => setForm({ ...form, bpjsJkkRate: parseFloat(e.target.value) / 100 })}
                                            className="w-24 px-2 py-1 border rounded text-center" />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">JKM (Jaminan Kematian)</td>
                                    <td className="px-4 py-3 text-center"><span className="text-gray-400">-</span></td>
                                    <td className="px-4 py-3 text-center">
                                        <input type="number" step="0.01" value={formatPercent(form.bpjsJkmRate)}
                                            onChange={e => setForm({ ...form, bpjsJkmRate: parseFloat(e.target.value) / 100 })}
                                            className="w-24 px-2 py-1 border rounded text-center" />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">JP (Jaminan Pensiun)</td>
                                    <td className="px-4 py-3 text-center">
                                        <input type="number" step="0.01" value={formatPercent(form.bpjsJpEmployeeRate)}
                                            onChange={e => setForm({ ...form, bpjsJpEmployeeRate: parseFloat(e.target.value) / 100 })}
                                            className="w-24 px-2 py-1 border rounded text-center" />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <input type="number" step="0.01" value={formatPercent(form.bpjsJpEmployerRate)}
                                            onChange={e => setForm({ ...form, bpjsJpEmployerRate: parseFloat(e.target.value) / 100 })}
                                            className="w-24 px-2 py-1 border rounded text-center" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">* Tarif JKK bervariasi berdasarkan tingkat risiko usaha (0.24% - 1.74%)</p>
                </Card>
            )}

            {/* Tax Tab */}
            {activeTab === 'tax' && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Shield size={24} className="text-primary-600" />
                        PTKP (Penghasilan Tidak Kena Pajak)
                    </h2>
                    <div className="space-y-4">
                        {(Object.keys(form.ptkpRates) as Array<keyof typeof form.ptkpRates>).map(key => {
                            const labels: Record<string, string> = {
                                TK: 'TK (Tidak Kawin)',
                                K0: 'K/0 (Kawin, 0 tanggungan)',
                                K1: 'K/1 (Kawin, 1 tanggungan)',
                                K2: 'K/2 (Kawin, 2 tanggungan)',
                                K3: 'K/3 (Kawin, 3 tanggungan)',
                            };
                            return (
                                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-900">{labels[key]}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Rp</span>
                                        <input
                                            type="text"
                                            value={formatCurrencyInput(form.ptkpRates[key].toString())}
                                            onChange={e => {
                                                const val = parseCurrencyInput(e.target.value);
                                                setForm({ ...form, ptkpRates: { ...form.ptkpRates, [key]: val } });
                                            }}
                                            className="w-40 px-3 py-2 border rounded-lg text-right font-mono"
                                        />
                                        <span className="text-sm text-gray-500">/tahun</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
                        <h3 className="text-sm font-semibold text-primary-900 mb-2">Tarif PPh 21 Progresif (Pasal 17)</h3>
                        <div className="text-sm text-primary-800 space-y-1">
                            <p>• 0 – Rp 60.000.000 → <strong>5%</strong></p>
                            <p>• Rp 60.000.000 – Rp 250.000.000 → <strong>15%</strong></p>
                            <p>• Rp 250.000.000 – Rp 500.000.000 → <strong>25%</strong></p>
                            <p>• Rp 500.000.000 – Rp 5.000.000.000 → <strong>30%</strong></p>
                            <p>• {'>'} Rp 5.000.000.000 → <strong>35%</strong></p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
