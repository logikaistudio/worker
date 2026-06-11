'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Target, AlertTriangle, BookOpen, UserCheck, Search, Edit2, Plus, X, Save } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function SkillMatrixPage() {
    const { employees, skillRequirements, updateEmployee } = useData();
    const [activeTab, setActiveTab] = useState<'matrix' | 'gap'>('matrix');
    const [selectedDept, setSelectedDept] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
    const [tempSkills, setTempSkills] = useState<Array<{ name: string; level: 'beginner' | 'intermediate' | 'advanced' | 'expert' }>>([]);

    const activeEmployees = employees.filter(e => e.status === 'active');
    
    const departments = useMemo(() => Array.from(new Set(activeEmployees.map(e => e.department))), [activeEmployees]);

    // Build comprehensive skill list from both employees and requirements
    const allSkills = useMemo(() => {
        const skills = new Set<string>();
        activeEmployees.forEach(e => e.skills?.forEach(s => skills.add(s.name)));
        skillRequirements.forEach(sr => skills.add(sr.skillName));
        return Array.from(skills).sort();
    }, [activeEmployees, skillRequirements]);

    const filteredEmployees = useMemo(() => {
        return activeEmployees.filter(e => {
            const matchDept = selectedDept === 'all' || e.department === selectedDept;
            const matchSearch = !searchTerm || e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                e.position.toLowerCase().includes(searchTerm.toLowerCase());
            return matchDept && matchSearch;
        });
    }, [activeEmployees, selectedDept, searchTerm]);

    const levelWeights: Record<string, number> = {
        'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4
    };
    const levelLabels: Record<string, string> = {
        'beginner': 'B', 'intermediate': 'I', 'advanced': 'A', 'expert': 'E'
    };
    const levelColors: Record<string, string> = {
        'beginner': 'bg-gray-100 text-gray-800',
        'intermediate': 'bg-primary-100 text-primary-800',
        'advanced': 'bg-success-100 text-success-800',
        'expert': 'bg-warning-yellow-100 text-warning-yellow-800'
    };

    // Calculate gap analysis
    const gapAnalysis = useMemo(() => {
        const gaps: { employeeName: string; position: string; department: string; skill: string; required: string; actual: string | null; severity: 'high' | 'medium' | 'low' }[] = [];
        
        filteredEmployees.forEach(emp => {
            const reqs = skillRequirements.filter(sr => sr.position === emp.position && sr.department === emp.department);
            reqs.forEach(req => {
                const empSkill = emp.skills?.find(s => s.name === req.skillName);
                const reqWeight = levelWeights[req.requiredLevel];
                const actWeight = empSkill ? levelWeights[empSkill.level || 'beginner'] : 0;
                
                if (actWeight < reqWeight) {
                    gaps.push({
                        employeeName: emp.name,
                        position: emp.position,
                        department: emp.department,
                        skill: req.skillName,
                        required: req.requiredLevel,
                        actual: empSkill?.level || null,
                        severity: reqWeight - actWeight >= 2 ? 'high' : 'medium'
                    });
                }
            });
        });
        
        return gaps.sort((a, b) => {
            if (a.severity === 'high' && b.severity !== 'high') return -1;
            if (a.severity !== 'high' && b.severity === 'high') return 1;
            return a.employeeName.localeCompare(b.employeeName);
        });
    }, [filteredEmployees, skillRequirements]);

    const getEmployeeSkillLevel = (empId: string, skillName: string) => {
        const emp = activeEmployees.find(e => e.id === empId);
        return emp?.skills?.find(s => s.name === skillName)?.level;
    };

    const handleEditClick = (empId: string) => {
        const emp = activeEmployees.find(e => e.id === empId);
        if (emp) {
            setTempSkills(emp.skills?.map(s => ({ name: s.name, level: s.level || 'beginner' })) || []);
            setEditingEmployeeId(empId);
        }
    };

    const handleSaveSkills = () => {
        if (editingEmployeeId) {
            updateEmployee(editingEmployeeId, { skills: tempSkills });
            setEditingEmployeeId(null);
        }
    };

    const addTempSkill = () => {
        setTempSkills([...tempSkills, { name: '', level: 'beginner' }]);
    };

    const updateTempSkill = (index: number, field: 'name' | 'level', value: string) => {
        const newSkills = [...tempSkills];
        if (field === 'name') newSkills[index].name = value;
        if (field === 'level') newSkills[index].level = value as any;
        setTempSkills(newSkills);
    };

    const removeTempSkill = (index: number) => {
        setTempSkills(tempSkills.filter((_, i) => i !== index));
    };

    const editingEmployeeName = activeEmployees.find(e => e.id === editingEmployeeId)?.name;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Skill Matrix & Gap Analysis</h1>
                <p className="text-gray-600 mt-1">Pemetaan kompetensi dan analisis kesenjangan skill karyawan</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card variant="elevated" className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Skills</p>
                        <p className="text-2xl font-bold text-gray-900">{allSkills.length}</p>
                    </div>
                </Card>
                <Card variant="elevated" className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-success-50 rounded-full flex items-center justify-center text-success-600">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Karyawan Dipetakan</p>
                        <p className="text-2xl font-bold text-gray-900">{activeEmployees.filter(e => e.skills && e.skills.length > 0).length}</p>
                    </div>
                </Card>
                <Card variant="elevated" className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-warning-yellow-50 rounded-full flex items-center justify-center text-warning-yellow-600">
                        <Target size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Skill Requirements</p>
                        <p className="text-2xl font-bold text-gray-900">{skillRequirements.length}</p>
                    </div>
                </Card>
                <Card variant="elevated" className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-danger-50 rounded-full flex items-center justify-center text-danger-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Skill Gaps (Pilih Dept)</p>
                        <p className="text-2xl font-bold text-gray-900">{gapAnalysis.length}</p>
                    </div>
                </Card>
            </div>

            {/* Tabs & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                    <button onClick={() => setActiveTab('matrix')} className={`px-4 py-2 rounded-md font-medium text-sm smooth-transition ${activeTab === 'matrix' ? 'bg-white shadow text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}>
                        Skill Matrix
                    </button>
                    <button onClick={() => setActiveTab('gap')} className={`px-4 py-2 rounded-md font-medium text-sm smooth-transition ${activeTab === 'gap' ? 'bg-white shadow text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}>
                        Gap Analysis
                    </button>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Cari karyawan/posisi..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" />
                    </div>
                    <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm">
                        <option value="all">Semua Dept</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            {/* Matrix Tab */}
            {activeTab === 'matrix' && (
                <Card className="overflow-hidden flex flex-col w-full">
                    <div className="overflow-x-auto w-full pb-4">
                        <table className="w-full border-collapse min-w-max">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[200px] sticky left-0 bg-gray-50 z-20 border-r shadow-[1px_0_0_0_#e5e7eb]">Karyawan</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-r z-10 bg-gray-50">Aksi</th>
                                    {allSkills.map(skill => (
                                        <th key={skill} className="px-2 py-3 text-center text-xs font-semibold text-gray-700 min-w-[80px] border-r align-bottom">
                                            <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto h-32 text-left pb-2">
                                                {skill}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map(emp => (
                                    <tr key={emp.id} className="border-b hover:bg-gray-50 group">
                                        <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-gray-50 border-r z-10 shadow-[1px_0_0_0_#e5e7eb] transition-colors duration-150">
                                            <p className="font-medium text-sm text-gray-900">{emp.name}</p>
                                            <p className="text-xs text-gray-500">{emp.position}</p>
                                        </td>
                                        <td className="px-4 py-3 text-center border-r bg-white group-hover:bg-gray-50 transition-colors duration-150">
                                            <button 
                                                onClick={() => handleEditClick(emp.id)}
                                                className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-md smooth-transition"
                                                title="Edit Skills"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                        {allSkills.map(skill => {
                                            const level = getEmployeeSkillLevel(emp.id, skill);
                                            return (
                                                <td key={`${emp.id}-${skill}`} className="px-2 py-2 text-center border-r">
                                                    {level ? (
                                                        <span title={level} className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${levelColors[level]}`}>
                                                            {levelLabels[level]}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                {filteredEmployees.length === 0 && (
                                    <tr>
                                        <td colSpan={allSkills.length + 1} className="px-4 py-8 text-center text-gray-500">
                                            Tidak ada data karyawan yang sesuai kriteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex flex-wrap gap-4 text-xs text-gray-600">
                        <strong>Legenda Level:</strong>
                        <span className="flex items-center gap-1"><span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${levelColors['beginner']}`}>B</span> Beginner</span>
                        <span className="flex items-center gap-1"><span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${levelColors['intermediate']}`}>I</span> Intermediate</span>
                        <span className="flex items-center gap-1"><span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${levelColors['advanced']}`}>A</span> Advanced</span>
                        <span className="flex items-center gap-1"><span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${levelColors['expert']}`}>E</span> Expert</span>
                    </div>
                </Card>
            )}

            {/* Gap Analysis Tab */}
            {activeTab === 'gap' && (
                <Card>
                    <div className="p-4 border-b bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900">Analisis Kesenjangan Skill (Gap Analysis)</h2>
                        <p className="text-sm text-gray-600">Berdasarkan requirement posisi vs skill aktual karyawan.</p>
                    </div>
                    {gapAnalysis.length === 0 ? (
                        <div className="p-12 text-center">
                            <Target className="mx-auto text-success-400 mb-4" size={48} />
                            <p className="text-gray-900 font-medium text-lg">Luar Biasa!</p>
                            <p className="text-gray-500">Tidak ada kesenjangan skill yang ditemukan pada filter saat ini.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3">Karyawan / Posisi</th>
                                        <th className="px-6 py-3">Skill Target</th>
                                        <th className="px-6 py-3">Requirement</th>
                                        <th className="px-6 py-3">Level Aktual</th>
                                        <th className="px-6 py-3 text-center">Severity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gapAnalysis.map((gap, idx) => (
                                        <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">{gap.employeeName}</p>
                                                <p className="text-xs text-gray-500">{gap.position}</p>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{gap.skill}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${levelColors[gap.required]}`}>
                                                    {gap.required}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {gap.actual ? (
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${levelColors[gap.actual]}`}>
                                                        {gap.actual}
                                                    </span>
                                                ) : (
                                                    <span className="text-danger-600 font-medium italic">Belum Memiliki</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant={gap.severity === 'high' ? 'danger' : 'warning'}>
                                                    {gap.severity === 'high' ? 'High' : 'Medium'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}

            {/* Edit Skills Modal */}
            {editingEmployeeId && (
                <Modal 
                    isOpen={!!editingEmployeeId} 
                    onClose={() => setEditingEmployeeId(null)}
                    title={`Edit Skills - ${editingEmployeeName}`}
                    size="xl"
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 mb-4">Tambahkan atau perbarui level kompetensi karyawan.</p>
                        
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {tempSkills.map((ts, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Nama Skill / Kompetensi</label>
                                        <input 
                                            type="text" 
                                            value={ts.name}
                                            onChange={(e) => updateTempSkill(idx, 'name', e.target.value)}
                                            placeholder="Contoh: React.js, Negosiasi, ISO 9001"
                                            className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-primary-500 text-sm"
                                        />
                                    </div>
                                    <div className="w-40">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Level Kompetensi</label>
                                        <select 
                                            value={ts.level}
                                            onChange={(e) => updateTempSkill(idx, 'level', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-primary-500 text-sm"
                                        >
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                            <option value="expert">Expert</option>
                                        </select>
                                    </div>
                                    <button 
                                        onClick={() => removeTempSkill(idx)}
                                        className="mt-5 p-2 text-danger-500 hover:bg-danger-50 rounded-md smooth-transition"
                                        title="Hapus Skill"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                            
                            {tempSkills.length === 0 && (
                                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                                    <p className="text-gray-500 text-sm">Belum ada skill yang didaftarkan.</p>
                                </div>
                            )}
                        </div>

                        <Button 
                            variant="outline" 
                            onClick={addTempSkill}
                            className="w-full flex items-center justify-center gap-2 mt-4 border-dashed border-2 hover:bg-gray-50"
                        >
                            <Plus size={16} /> Tambah Skill Baru
                        </Button>

                        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                            <Button variant="outline" onClick={() => setEditingEmployeeId(null)}>Batal</Button>
                            <Button variant="primary" onClick={handleSaveSkills} className="flex items-center gap-2">
                                <Save size={16} /> Simpan Perubahan
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
