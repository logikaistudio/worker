'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { JobPosting, Candidate, CandidateStage } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Briefcase, Plus, Users, UserPlus, Search, GripVertical, Eye, Edit, Trash2, ArrowRight } from 'lucide-react';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/currencyHelpers';

export default function RecruitmentPage() {
    const {
        jobPostings, addJobPosting, updateJobPosting, deleteJobPosting,
        candidates, addCandidate, updateCandidate, deleteCandidate
    } = useData();
    const [activeTab, setActiveTab] = useState<'jobs' | 'candidates' | 'pipeline'>('jobs');
    const [showJobForm, setShowJobForm] = useState(false);
    const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
    const [showCandidateForm, setShowCandidateForm] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterJobId, setFilterJobId] = useState('');
    const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);

    // Job form
    const [jobForm, setJobForm] = useState({
        title: '', department: '', position: '', description: '', requirements: '',
        employmentType: 'full_time' as const, salaryMin: '', salaryMax: '', status: 'open' as const,
    });

    // Candidate form
    const [candidateForm, setCandidateForm] = useState({
        jobPostingId: '', name: '', email: '', phone: '',
        currentCompany: '', currentPosition: '', expectedSalary: '',
    });

    const openJobs = jobPostings.filter(j => j.status === 'open');
    const totalCandidates = candidates.length;

    const stages: { key: CandidateStage; label: string; color: string }[] = [
        { key: 'applied', label: 'Applied', color: 'bg-gray-100 border-gray-300' },
        { key: 'screening', label: 'Screening', color: 'bg-primary-50 border-primary-300' },
        { key: 'interview', label: 'Interview', color: 'bg-warning-yellow-50 border-warning-yellow-300' },
        { key: 'offer', label: 'Offer', color: 'bg-success-50 border-success-300' },
        { key: 'hired', label: 'Hired', color: 'bg-success-100 border-success-500' },
        { key: 'rejected', label: 'Rejected', color: 'bg-danger-50 border-danger-300' },
    ];

    const filteredCandidates = useMemo(() => {
        return candidates.filter(c => {
            const matchSearch = !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchJob = !filterJobId || c.jobPostingId === filterJobId;
            return matchSearch && matchJob;
        });
    }, [candidates, searchTerm, filterJobId]);

    const handleSaveJob = () => {
        const data: JobPosting = {
            id: editingJob?.id || `job-${Date.now()}`,
            title: jobForm.title, department: jobForm.department, position: jobForm.position,
            description: jobForm.description,
            requirements: jobForm.requirements.split('\n').filter(r => r.trim()),
            employmentType: jobForm.employmentType,
            salaryMin: jobForm.salaryMin ? parseCurrencyInput(jobForm.salaryMin) : undefined,
            salaryMax: jobForm.salaryMax ? parseCurrencyInput(jobForm.salaryMax) : undefined,
            status: jobForm.status,
            openDate: editingJob?.openDate || new Date().toISOString().slice(0, 10),
            createdAt: editingJob?.createdAt || new Date().toISOString(),
        };
        if (editingJob) updateJobPosting(editingJob.id, data);
        else addJobPosting(data);
        setShowJobForm(false);
        setEditingJob(null);
    };

    const handleSaveCandidate = () => {
        const job = jobPostings.find(j => j.id === candidateForm.jobPostingId);
        const data: Candidate = {
            id: editingCandidate?.id || `cand-${Date.now()}`,
            jobPostingId: candidateForm.jobPostingId,
            jobTitle: job?.title || '',
            name: candidateForm.name, email: candidateForm.email, phone: candidateForm.phone,
            currentCompany: candidateForm.currentCompany || undefined,
            currentPosition: candidateForm.currentPosition || undefined,
            expectedSalary: candidateForm.expectedSalary ? parseCurrencyInput(candidateForm.expectedSalary) : undefined,
            stage: editingCandidate?.stage || 'applied',
            appliedDate: editingCandidate?.appliedDate || new Date().toISOString().slice(0, 10),
            createdAt: editingCandidate?.createdAt || new Date().toISOString(),
        };
        if (editingCandidate) updateCandidate(editingCandidate.id, data);
        else addCandidate(data);
        setShowCandidateForm(false);
        setEditingCandidate(null);
    };

    const moveCandidate = (candidateId: string, newStage: CandidateStage) => {
        updateCandidate(candidateId, { stage: newStage });
    };

    const openJobForm = (job?: JobPosting) => {
        if (job) {
            setEditingJob(job);
            setJobForm({
                title: job.title, department: job.department, position: job.position,
                description: job.description, requirements: job.requirements.join('\n'),
                employmentType: job.employmentType as any, status: job.status as any,
                salaryMin: job.salaryMin ? formatCurrencyInput(job.salaryMin.toString()) : '',
                salaryMax: job.salaryMax ? formatCurrencyInput(job.salaryMax.toString()) : '',
            });
        } else {
            setEditingJob(null);
            setJobForm({ title: '', department: '', position: '', description: '', requirements: '', employmentType: 'full_time', salaryMin: '', salaryMax: '', status: 'open' });
        }
        setShowJobForm(true);
    };

    const openCandidateForm = (candidate?: Candidate) => {
        if (candidate) {
            setEditingCandidate(candidate);
            setCandidateForm({
                jobPostingId: candidate.jobPostingId, name: candidate.name, email: candidate.email, phone: candidate.phone,
                currentCompany: candidate.currentCompany || '', currentPosition: candidate.currentPosition || '',
                expectedSalary: candidate.expectedSalary ? formatCurrencyInput(candidate.expectedSalary.toString()) : '',
            });
        } else {
            setEditingCandidate(null);
            setCandidateForm({ jobPostingId: '', name: '', email: '', phone: '', currentCompany: '', currentPosition: '', expectedSalary: '' });
        }
        setShowCandidateForm(true);
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const tabs = [
        { key: 'jobs', label: 'Lowongan', icon: Briefcase },
        { key: 'candidates', label: 'Kandidat', icon: Users },
        { key: 'pipeline', label: 'Pipeline', icon: GripVertical },
    ] as const;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Rekrutmen</h1>
                    <p className="text-gray-600 mt-1">Kelola lowongan kerja dan kandidat</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => openJobForm()} variant="primary" className="flex items-center gap-2">
                        <Plus size={18} /> Buat Lowongan
                    </Button>
                    <Button onClick={() => openCandidateForm()} variant="outline" className="flex items-center gap-2">
                        <UserPlus size={18} /> Tambah Kandidat
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card variant="elevated" className="p-5">
                    <p className="text-sm text-gray-600">Lowongan Aktif</p>
                    <p className="text-2xl font-bold text-primary-600">{openJobs.length}</p>
                </Card>
                <Card variant="elevated" className="p-5">
                    <p className="text-sm text-gray-600">Total Kandidat</p>
                    <p className="text-2xl font-bold text-gray-900">{totalCandidates}</p>
                </Card>
                <Card variant="elevated" className="p-5">
                    <p className="text-sm text-gray-600">Interview</p>
                    <p className="text-2xl font-bold text-warning-yellow-600">{candidates.filter(c => c.stage === 'interview').length}</p>
                </Card>
                <Card variant="elevated" className="p-5">
                    <p className="text-sm text-gray-600">Hired</p>
                    <p className="text-2xl font-bold text-success-600">{candidates.filter(c => c.stage === 'hired').length}</p>
                </Card>
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

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
                <div className="space-y-4">
                    {jobPostings.length === 0 ? (
                        <Card className="p-12 text-center">
                            <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-500">Belum ada lowongan kerja</p>
                        </Card>
                    ) : (
                        jobPostings.map(job => (
                            <Card key={job.id} variant="elevated" className="p-5 hover:shadow-lg smooth-transition">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                                            <Badge variant={job.status === 'open' ? 'success' : job.status === 'filled' ? 'info' : 'default'}>
                                                {job.status === 'open' ? 'Aktif' : job.status === 'filled' ? 'Terisi' : job.status === 'closed' ? 'Ditutup' : 'Draft'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{job.department} • {job.position}</p>
                                        <p className="text-sm text-gray-500">{job.description.slice(0, 150)}{job.description.length > 150 ? '...' : ''}</p>
                                        <div className="flex items-center gap-4 mt-3 text-sm">
                                            {job.salaryMin && job.salaryMax && (
                                                <span className="text-primary-600 font-medium">{formatCurrency(job.salaryMin)} - {formatCurrency(job.salaryMax)}</span>
                                            )}
                                            <span className="text-gray-500">📅 {new Date(job.openDate).toLocaleDateString('id-ID')}</span>
                                            <span className="text-gray-500">👥 {candidates.filter(c => c.jobPostingId === job.id).length} kandidat</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button size="sm" variant="outline" onClick={() => openJobForm(job)}><Edit size={16} /></Button>
                                        <Button size="sm" variant="danger" onClick={() => { if (confirm('Hapus lowongan?')) deleteJobPosting(job.id); }}><Trash2 size={16} /></Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Candidates Tab */}
            {activeTab === 'candidates' && (
                <div className="space-y-4">
                    <Card className="p-4">
                        <div className="flex gap-3 flex-wrap">
                            <div className="flex items-center gap-2 flex-1">
                                <Search className="text-gray-400" size={20} />
                                <input type="text" placeholder="Cari kandidat..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                            </div>
                            <select value={filterJobId} onChange={e => setFilterJobId(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                <option value="">Semua Lowongan</option>
                                {jobPostings.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                            </select>
                        </div>
                    </Card>
                    {filteredCandidates.length === 0 ? (
                        <Card className="p-12 text-center">
                            <Users className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-500">Belum ada kandidat</p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {filteredCandidates.map(c => (
                                <Card key={c.id} variant="elevated" className="p-4 hover:shadow-lg smooth-transition">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-semibold text-gray-900">{c.name}</h3>
                                                <Badge variant={c.stage === 'hired' ? 'success' : c.stage === 'rejected' ? 'danger' : c.stage === 'interview' ? 'warning' : 'default'}>
                                                    {stages.find(s => s.key === c.stage)?.label}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">{c.jobTitle} • {c.email}</p>
                                            {c.currentCompany && <p className="text-sm text-gray-500">{c.currentPosition} di {c.currentCompany}</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => setViewCandidate(c)}><Eye size={16} /></Button>
                                            <Button size="sm" variant="outline" onClick={() => openCandidateForm(c)}><Edit size={16} /></Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Pipeline Tab */}
            {activeTab === 'pipeline' && (
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-max">
                        {stages.filter(s => s.key !== 'rejected').map(stage => {
                            const stageCandidates = candidates.filter(c => c.stage === stage.key);
                            const nextStage = stages[stages.findIndex(s => s.key === stage.key) + 1];
                            return (
                                <div key={stage.key} className={`w-64 rounded-lg border-2 ${stage.color} flex-shrink-0`}>
                                    <div className="p-3 border-b font-semibold text-sm flex items-center justify-between">
                                        <span>{stage.label}</span>
                                        <span className="bg-white px-2 py-0.5 rounded-full text-xs">{stageCandidates.length}</span>
                                    </div>
                                    <div className="p-2 space-y-2 min-h-[200px]">
                                        {stageCandidates.map(c => (
                                            <div key={c.id} className="bg-white rounded-lg p-3 shadow-sm border hover:shadow-md smooth-transition">
                                                <p className="font-medium text-sm text-gray-900">{c.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">{c.jobTitle}</p>
                                                {c.interviewScore && (
                                                    <div className="mt-2 flex items-center gap-1">
                                                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                                            <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${c.interviewScore}%` }} />
                                                        </div>
                                                        <span className="text-xs text-gray-500">{c.interviewScore}</span>
                                                    </div>
                                                )}
                                                <div className="flex gap-1 mt-2">
                                                    {nextStage && nextStage.key !== 'rejected' && (
                                                        <button onClick={() => moveCandidate(c.id, nextStage.key)}
                                                            className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-0.5">
                                                            <ArrowRight size={12} /> {nextStage.label}
                                                        </button>
                                                    )}
                                                    <button onClick={() => moveCandidate(c.id, 'rejected')}
                                                        className="text-xs text-danger-600 hover:text-danger-800 ml-auto">Tolak</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Job Form Modal */}
            <Modal isOpen={showJobForm} onClose={() => { setShowJobForm(false); setEditingJob(null); }} title={editingJob ? 'Edit Lowongan' : 'Buat Lowongan Baru'} size="xl">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Judul Posisi *</label>
                            <input type="text" value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Departemen *</label>
                            <input type="text" value={jobForm.department} onChange={e => setJobForm({ ...jobForm, department: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Posisi *</label>
                            <input type="text" value={jobForm.position} onChange={e => setJobForm({ ...jobForm, position: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Tipe Kerja</label>
                            <select value={jobForm.employmentType} onChange={e => setJobForm({ ...jobForm, employmentType: e.target.value as any })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                <option value="full_time">Full Time</option>
                                <option value="part_time">Part Time</option>
                                <option value="contract">Kontrak</option>
                                <option value="internship">Magang</option>
                            </select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Gaji Min</label>
                            <input type="text" value={jobForm.salaryMin} onChange={e => setJobForm({ ...jobForm, salaryMin: formatCurrencyInput(e.target.value) })}
                                placeholder="8.000.000" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Gaji Max</label>
                            <input type="text" value={jobForm.salaryMax} onChange={e => setJobForm({ ...jobForm, salaryMax: formatCurrencyInput(e.target.value) })}
                                placeholder="15.000.000" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                        <textarea value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} rows={3}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Requirements (satu per baris)</label>
                        <textarea value={jobForm.requirements} onChange={e => setJobForm({ ...jobForm, requirements: e.target.value })} rows={4}
                            placeholder="Minimal 3 tahun pengalaman&#10;Menguasai React & TypeScript&#10;Kemampuan komunikasi yang baik"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div>
                    <div className="flex gap-3 pt-4 border-t">
                        <Button onClick={handleSaveJob} variant="primary" className="flex-1">{editingJob ? 'Update' : 'Simpan'}</Button>
                        <Button onClick={() => { setShowJobForm(false); setEditingJob(null); }} variant="outline" className="flex-1">Batal</Button>
                    </div>
                </div>
            </Modal>

            {/* Candidate Form Modal */}
            <Modal isOpen={showCandidateForm} onClose={() => { setShowCandidateForm(false); setEditingCandidate(null); }} title={editingCandidate ? 'Edit Kandidat' : 'Tambah Kandidat'} size="lg">
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Lowongan *</label>
                        <select value={candidateForm.jobPostingId} onChange={e => setCandidateForm({ ...candidateForm, jobPostingId: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                            <option value="">Pilih lowongan...</option>
                            {openJobs.map(j => <option key={j.id} value={j.id}>{j.title} - {j.department}</option>)}
                        </select></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Nama *</label>
                            <input type="text" value={candidateForm.name} onChange={e => setCandidateForm({ ...candidateForm, name: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <input type="email" value={candidateForm.email} onChange={e => setCandidateForm({ ...candidateForm, email: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Telepon *</label>
                            <input type="tel" value={candidateForm.phone} onChange={e => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary</label>
                            <input type="text" value={candidateForm.expectedSalary} onChange={e => setCandidateForm({ ...candidateForm, expectedSalary: formatCurrencyInput(e.target.value) })}
                                placeholder="10.000.000" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Perusahaan Saat Ini</label>
                            <input type="text" value={candidateForm.currentCompany} onChange={e => setCandidateForm({ ...candidateForm, currentCompany: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Posisi Saat Ini</label>
                            <input type="text" value={candidateForm.currentPosition} onChange={e => setCandidateForm({ ...candidateForm, currentPosition: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t">
                        <Button onClick={handleSaveCandidate} variant="primary" className="flex-1">{editingCandidate ? 'Update' : 'Simpan'}</Button>
                        <Button onClick={() => { setShowCandidateForm(false); setEditingCandidate(null); }} variant="outline" className="flex-1">Batal</Button>
                    </div>
                </div>
            </Modal>

            {/* View Candidate Modal */}
            {viewCandidate && (
                <Modal isOpen={!!viewCandidate} onClose={() => setViewCandidate(null)} title="Detail Kandidat" size="lg">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-sm text-gray-500">Nama</p><p className="font-medium">{viewCandidate.name}</p></div>
                            <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{viewCandidate.email}</p></div>
                            <div><p className="text-sm text-gray-500">Telepon</p><p className="font-medium">{viewCandidate.phone}</p></div>
                            <div><p className="text-sm text-gray-500">Lowongan</p><p className="font-medium">{viewCandidate.jobTitle}</p></div>
                            {viewCandidate.currentCompany && <div><p className="text-sm text-gray-500">Perusahaan</p><p className="font-medium">{viewCandidate.currentCompany}</p></div>}
                            {viewCandidate.expectedSalary && <div><p className="text-sm text-gray-500">Expected Salary</p><p className="font-medium">{formatCurrency(viewCandidate.expectedSalary)}</p></div>}
                        </div>
                        <div className="border-t pt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Ubah Stage</p>
                            <div className="flex flex-wrap gap-2">
                                {stages.map(s => (
                                    <button key={s.key} onClick={() => { moveCandidate(viewCandidate.id, s.key); setViewCandidate({ ...viewCandidate, stage: s.key }); }}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border smooth-transition ${
                                            viewCandidate.stage === s.key ? 'bg-primary-600 text-white border-primary-600' : `${s.color} hover:opacity-80`
                                        }`}>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {viewCandidate.stage === 'interview' && (
                            <div className="border-t pt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Interview Score (0-100)</label>
                                <input type="number" min="0" max="100" value={viewCandidate.interviewScore || ''}
                                    onChange={e => { const score = parseInt(e.target.value); updateCandidate(viewCandidate.id, { interviewScore: score }); setViewCandidate({ ...viewCandidate, interviewScore: score }); }}
                                    className="w-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                                <div className="mt-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Interview</label>
                                    <textarea value={viewCandidate.interviewNotes || ''}
                                        onChange={e => { updateCandidate(viewCandidate.id, { interviewNotes: e.target.value }); setViewCandidate({ ...viewCandidate, interviewNotes: e.target.value }); }}
                                        rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
