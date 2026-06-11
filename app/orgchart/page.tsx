'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import Card from '@/components/ui/Card';
import { Users, ChevronDown, ChevronRight } from 'lucide-react';

export default function OrgChartPage() {
    const { employees } = useData();
    const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

    const activeEmployees = employees.filter(e => e.status === 'active');

    const departments = useMemo(() => {
        const deptMap = new Map<string, typeof activeEmployees>();
        activeEmployees.forEach(emp => {
            const dept = emp.department;
            if (!deptMap.has(dept)) deptMap.set(dept, []);
            deptMap.get(dept)!.push(emp);
        });
        // Sort employees within each dept by hierarchy level descending
        deptMap.forEach((emps) => emps.sort((a, b) => b.hierarchyLevel - a.hierarchyLevel));
        return deptMap;
    }, [activeEmployees]);

    const hierarchyLabels: Record<number, string> = {
        1: 'Staff', 2: 'Supervisor', 3: 'Manager', 4: 'Director', 5: 'C-Level',
    };

    const hierarchyColors: Record<number, string> = {
        1: 'bg-gray-100 text-gray-800 border-gray-300',
        2: 'bg-primary-50 text-primary-800 border-primary-300',
        3: 'bg-success-50 text-success-800 border-success-300',
        4: 'bg-warning-yellow-50 text-warning-yellow-800 border-warning-yellow-300',
        5: 'bg-danger-50 text-danger-800 border-danger-300',
    };

    const toggleDept = (dept: string) => {
        const next = new Set(expandedDepts);
        if (next.has(dept)) next.delete(dept); else next.add(dept);
        setExpandedDepts(next);
    };

    const expandAll = () => setExpandedDepts(new Set(departments.keys()));
    const collapseAll = () => setExpandedDepts(new Set());

    // Stats by level
    const levelCounts = useMemo(() => {
        const counts: Record<number, number> = {};
        activeEmployees.forEach(e => { counts[e.hierarchyLevel] = (counts[e.hierarchyLevel] || 0) + 1; });
        return counts;
    }, [activeEmployees]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Struktur Organisasi</h1>
                    <p className="text-gray-600 mt-1">Visualisasi hierarki dan departemen</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={expandAll} className="px-3 py-1.5 text-sm bg-white border rounded-lg hover:bg-gray-50 text-gray-700">Expand All</button>
                    <button onClick={collapseAll} className="px-3 py-1.5 text-sm bg-white border rounded-lg hover:bg-gray-50 text-gray-700">Collapse All</button>
                </div>
            </div>

            {/* Level Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[5, 4, 3, 2, 1].map(level => (
                    <Card key={level} className={`p-4 border-2 ${hierarchyColors[level]}`}>
                        <p className="text-xs font-medium opacity-70">{hierarchyLabels[level]}</p>
                        <p className="text-2xl font-bold">{levelCounts[level] || 0}</p>
                    </Card>
                ))}
            </div>

            {/* Org Tree */}
            <div className="space-y-3">
                {Array.from(departments.entries()).map(([dept, emps]) => {
                    const isExpanded = expandedDepts.has(dept);
                    const highestLevel = Math.max(...emps.map(e => e.hierarchyLevel));
                    const head = emps.find(e => e.hierarchyLevel === highestLevel);

                    return (
                        <Card key={dept} variant="elevated" className="overflow-hidden">
                            <button onClick={() => toggleDept(dept)}
                                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 smooth-transition">
                                <div className="flex items-center gap-3">
                                    {isExpanded ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
                                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                        <Users size={20} className="text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-lg font-semibold text-gray-900">{dept}</h3>
                                        <p className="text-sm text-gray-500">{emps.length} karyawan • Head: {head?.name || '-'}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{emps.length}</span>
                            </button>

                            {isExpanded && (
                                <div className="px-4 pb-4 border-t">
                                    <div className="mt-4 space-y-2">
                                        {emps.map(emp => (
                                            <div key={emp.id} className={`flex items-center justify-between p-3 rounded-lg border ${hierarchyColors[emp.hierarchyLevel]}`}
                                                style={{ marginLeft: `${(5 - emp.hierarchyLevel) * 20}px` }}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm border">
                                                        {emp.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{emp.name}</p>
                                                        <p className="text-xs opacity-70">{emp.position}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white bg-opacity-50">
                                                    L{emp.hierarchyLevel} — {hierarchyLabels[emp.hierarchyLevel]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Summary */}
            <Card className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-primary-700">Total Karyawan Aktif</p>
                        <p className="text-3xl font-bold text-primary-900">{activeEmployees.length}</p>
                    </div>
                    <div>
                        <p className="text-sm text-primary-700">Jumlah Departemen</p>
                        <p className="text-3xl font-bold text-primary-900">{departments.size}</p>
                    </div>
                    <div>
                        <p className="text-sm text-primary-700">Span of Control</p>
                        <p className="text-3xl font-bold text-primary-900">
                            {departments.size > 0 ? Math.round(activeEmployees.length / departments.size) : 0}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
