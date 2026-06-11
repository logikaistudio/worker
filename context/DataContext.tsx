'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    Employee, LeaveRequest, KPI, PayrollRecord, DailyAttendance,
    ShiftTemplate, RosterAssignment, ShiftSwapRequest, OvertimeRequest,
    Reimbursement, JobPosting, Candidate, Announcement, CompanySettings,
    SkillRequirement
} from '@/types';
import { isExpiringSoon } from '@/utils/employeeHelpers';
import {
    mockEmployees, mockLeaveRequests, mockKPIs, mockPayrollRecords,
    mockDailyAttendance, defaultShiftTemplates, defaultCompanySettings,
    mockAnnouncements, defaultSkillRequirements
} from '@/utils/mockData';

// ========================
// CONTEXT TYPE
// ========================

interface DataContextType {
    // Existing data
    employees: Employee[];
    leaveRequests: LeaveRequest[];
    kpis: KPI[];
    payrollRecords: PayrollRecord[];
    dailyAttendance: DailyAttendance[];
    // New data
    shiftTemplates: ShiftTemplate[];
    rosterAssignments: RosterAssignment[];
    shiftSwapRequests: ShiftSwapRequest[];
    overtimeRequests: OvertimeRequest[];
    reimbursements: Reimbursement[];
    jobPostings: JobPosting[];
    candidates: Candidate[];
    announcements: Announcement[];
    companySettings: CompanySettings;
    skillRequirements: SkillRequirement[];
    // Employee CRUD
    addEmployee: (employee: Employee) => void;
    updateEmployee: (id: string, employee: Partial<Employee>) => void;
    deleteEmployee: (id: string) => void;
    // Leave CRUD
    addLeaveRequest: (request: LeaveRequest) => void;
    updateLeaveRequest: (id: string, request: Partial<LeaveRequest>) => void;
    approveLeaveRequest: (id: string) => void;
    // KPI CRUD
    addKPI: (kpi: KPI) => void;
    updateKPI: (id: string, kpi: Partial<KPI>) => void;
    deleteKPI: (id: string) => void;
    // Payroll CRUD
    addPayrollRecord: (record: PayrollRecord) => void;
    updatePayrollRecord: (id: string, record: Partial<PayrollRecord>) => void;
    // Attendance CRUD
    addDailyAttendance: (attendance: DailyAttendance) => void;
    updateDailyAttendance: (id: string, attendance: Partial<DailyAttendance>) => void;
    // Shift CRUD
    addShiftTemplate: (shift: ShiftTemplate) => void;
    updateShiftTemplate: (id: string, shift: Partial<ShiftTemplate>) => void;
    deleteShiftTemplate: (id: string) => void;
    // Roster CRUD
    addRosterAssignment: (roster: RosterAssignment) => void;
    updateRosterAssignment: (id: string, roster: Partial<RosterAssignment>) => void;
    deleteRosterAssignment: (id: string) => void;
    bulkAddRosterAssignments: (rosters: RosterAssignment[]) => void;
    // Swap Request CRUD
    addShiftSwapRequest: (swap: ShiftSwapRequest) => void;
    updateShiftSwapRequest: (id: string, swap: Partial<ShiftSwapRequest>) => void;
    // Overtime Request CRUD
    addOvertimeRequest: (request: OvertimeRequest) => void;
    updateOvertimeRequest: (id: string, request: Partial<OvertimeRequest>) => void;
    // Reimbursement CRUD
    addReimbursement: (reimburse: Reimbursement) => void;
    updateReimbursement: (id: string, reimburse: Partial<Reimbursement>) => void;
    // Recruitment CRUD
    addJobPosting: (job: JobPosting) => void;
    updateJobPosting: (id: string, job: Partial<JobPosting>) => void;
    deleteJobPosting: (id: string) => void;
    addCandidate: (candidate: Candidate) => void;
    updateCandidate: (id: string, candidate: Partial<Candidate>) => void;
    deleteCandidate: (id: string) => void;
    // Announcement CRUD
    addAnnouncement: (announcement: Announcement) => void;
    updateAnnouncement: (id: string, announcement: Partial<Announcement>) => void;
    deleteAnnouncement: (id: string) => void;
    // Settings
    updateCompanySettings: (settings: Partial<CompanySettings>) => void;
    // Skill Requirements CRUD
    addSkillRequirement: (req: SkillRequirement) => void;
    updateSkillRequirement: (id: string, req: Partial<SkillRequirement>) => void;
    deleteSkillRequirement: (id: string) => void;
    // Alerts
    certificateAlerts: CertificateAlert[];
    dismissAlert: (id: string) => void;
}

export interface CertificateAlert {
    id: string;
    employeeId: string;
    employeeName: string;
    certificateId?: string;
    certificateName: string;
    expiryDate?: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
};

// ========================
// STORAGE KEYS
// ========================

const STORAGE_KEYS = {
    EMPLOYEES: 'worker_employees',
    LEAVES: 'worker_leaves',
    KPIS: 'worker_kpis',
    PAYROLL: 'worker_payroll',
    ATTENDANCE: 'worker_attendance',
    SHIFTS: 'worker_shifts',
    ROSTER: 'worker_roster',
    SWAP_REQUESTS: 'worker_swap_requests',
    OVERTIME_REQUESTS: 'worker_overtime_requests',
    REIMBURSEMENTS: 'worker_reimbursements',
    JOB_POSTINGS: 'worker_job_postings',
    CANDIDATES: 'worker_candidates',
    ANNOUNCEMENTS: 'worker_announcements',
    COMPANY_SETTINGS: 'worker_company_settings',
    SKILL_REQUIREMENTS: 'worker_skill_requirements',
};

// ========================
// PROVIDER
// ========================

interface DataProviderProps {
    children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [kpis, setKPIs] = useState<KPI[]>([]);
    const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
    const [dailyAttendance, setDailyAttendance] = useState<DailyAttendance[]>([]);
    const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([]);
    const [rosterAssignments, setRosterAssignments] = useState<RosterAssignment[]>([]);
    const [shiftSwapRequests, setShiftSwapRequests] = useState<ShiftSwapRequest[]>([]);
    const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([]);
    const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
    const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultCompanySettings);
    const [skillRequirements, setSkillRequirements] = useState<SkillRequirement[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [certificateAlerts, setCertificateAlerts] = useState<CertificateAlert[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const load = <T,>(key: string, fallback: T): T => {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : fallback;
        };

        setEmployees(load(STORAGE_KEYS.EMPLOYEES, mockEmployees));
        setLeaveRequests(load(STORAGE_KEYS.LEAVES, mockLeaveRequests));
        setKPIs(load(STORAGE_KEYS.KPIS, mockKPIs));
        setPayrollRecords(load(STORAGE_KEYS.PAYROLL, mockPayrollRecords));
        setDailyAttendance(load(STORAGE_KEYS.ATTENDANCE, mockDailyAttendance));
        setShiftTemplates(load(STORAGE_KEYS.SHIFTS, defaultShiftTemplates));
        setRosterAssignments(load(STORAGE_KEYS.ROSTER, []));
        setShiftSwapRequests(load(STORAGE_KEYS.SWAP_REQUESTS, []));
        setOvertimeRequests(load(STORAGE_KEYS.OVERTIME_REQUESTS, []));
        setReimbursements(load(STORAGE_KEYS.REIMBURSEMENTS, []));
        setJobPostings(load(STORAGE_KEYS.JOB_POSTINGS, []));
        setCandidates(load(STORAGE_KEYS.CANDIDATES, []));
        setAnnouncements(load(STORAGE_KEYS.ANNOUNCEMENTS, mockAnnouncements));
        setCompanySettings(load(STORAGE_KEYS.COMPANY_SETTINGS, defaultCompanySettings));
        setSkillRequirements(load(STORAGE_KEYS.SKILL_REQUIREMENTS, defaultSkillRequirements));

        setIsInitialized(true);
    }, []);

    // Auto-save helpers
    const usePersist = (key: string, data: unknown, minLength = 0) => {
        useEffect(() => {
            if (isInitialized && (Array.isArray(data) ? data.length >= minLength : true)) {
                localStorage.setItem(key, JSON.stringify(data));
            }
        }, [data]); // eslint-disable-line react-hooks/exhaustive-deps
    };

    usePersist(STORAGE_KEYS.EMPLOYEES, employees, 1);
    usePersist(STORAGE_KEYS.LEAVES, leaveRequests, 1);
    usePersist(STORAGE_KEYS.KPIS, kpis, 1);
    usePersist(STORAGE_KEYS.PAYROLL, payrollRecords);
    usePersist(STORAGE_KEYS.ATTENDANCE, dailyAttendance);
    usePersist(STORAGE_KEYS.SHIFTS, shiftTemplates);
    usePersist(STORAGE_KEYS.ROSTER, rosterAssignments);
    usePersist(STORAGE_KEYS.SWAP_REQUESTS, shiftSwapRequests);
    usePersist(STORAGE_KEYS.OVERTIME_REQUESTS, overtimeRequests);
    usePersist(STORAGE_KEYS.REIMBURSEMENTS, reimbursements);
    usePersist(STORAGE_KEYS.JOB_POSTINGS, jobPostings);
    usePersist(STORAGE_KEYS.CANDIDATES, candidates);
    usePersist(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
    usePersist(STORAGE_KEYS.COMPANY_SETTINGS, companySettings);
    usePersist(STORAGE_KEYS.SKILL_REQUIREMENTS, skillRequirements);

    // Certificate alerts
    useEffect(() => {
        if (!isInitialized) return;
        const alerts: CertificateAlert[] = [];
        employees.forEach(emp => {
            emp.certificates?.forEach(cert => {
                if (isExpiringSoon(cert.expiryDate)) {
                    alerts.push({
                        id: `${emp.id}::${cert.id || cert.name}`,
                        employeeId: emp.id,
                        employeeName: emp.name,
                        certificateId: cert.id,
                        certificateName: cert.name,
                        expiryDate: cert.expiryDate || null,
                    });
                }
            });
        });
        setCertificateAlerts(alerts);
    }, [employees, isInitialized]);

    // ========================
    // CRUD FUNCTIONS
    // ========================

    // -- Employees --
    const addEmployee = (employee: Employee) => setEmployees(prev => [...prev, employee]);
    const updateEmployee = (id: string, updates: Partial<Employee>) => {
        setEmployees(prev => prev.map(emp => {
            if (emp.id === id) {
                const updated = { ...emp, ...updates };
                if ('annualLeaveQuota' in updates || 'usedLeaveQuota' in updates) {
                    updated.remainingLeaveQuota = updated.annualLeaveQuota - updated.usedLeaveQuota;
                }
                return updated;
            }
            return emp;
        }));
    };
    const deleteEmployee = (id: string) => setEmployees(prev => prev.filter(emp => emp.id !== id));

    // -- Leave --
    const addLeaveRequest = (request: LeaveRequest) => setLeaveRequests(prev => [...prev, request]);
    const updateLeaveRequest = (id: string, updates: Partial<LeaveRequest>) => {
        setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, ...updates } : req));
    };
    const approveLeaveRequest = (id: string) => {
        const request = leaveRequests.find(r => r.id === id);
        if (!request) return;
        setLeaveRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: 'approved', approver2Status: 'approved', approver2Date: new Date().toISOString() } : req
        ));
        if (request.leaveType === 'annual') {
            setEmployees(prev => prev.map(emp => {
                if (emp.id === request.employeeId) {
                    const newUsed = emp.usedLeaveQuota + request.totalDays;
                    return { ...emp, usedLeaveQuota: newUsed, remainingLeaveQuota: emp.annualLeaveQuota - newUsed };
                }
                return emp;
            }));
        }
    };

    // -- KPI --
    const addKPI = (kpi: KPI) => setKPIs(prev => [...prev, kpi]);
    const updateKPI = (id: string, updates: Partial<KPI>) => setKPIs(prev => prev.map(k => k.id === id ? { ...k, ...updates } : k));
    const deleteKPI = (id: string) => setKPIs(prev => prev.filter(k => k.id !== id));

    // -- Payroll --
    const addPayrollRecord = (record: PayrollRecord) => setPayrollRecords(prev => [...prev, record]);
    const updatePayrollRecord = (id: string, updates: Partial<PayrollRecord>) => {
        setPayrollRecords(prev => prev.map(rec => rec.id === id ? { ...rec, ...updates } : rec));
    };

    // -- Attendance --
    const addDailyAttendance = (att: DailyAttendance) => setDailyAttendance(prev => [...prev, att]);
    const updateDailyAttendance = (id: string, updates: Partial<DailyAttendance>) => {
        setDailyAttendance(prev => prev.map(att => att.id === id ? { ...att, ...updates } : att));
    };

    // -- Shift Templates --
    const addShiftTemplate = (shift: ShiftTemplate) => setShiftTemplates(prev => [...prev, shift]);
    const updateShiftTemplate = (id: string, updates: Partial<ShiftTemplate>) => {
        setShiftTemplates(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };
    const deleteShiftTemplate = (id: string) => setShiftTemplates(prev => prev.filter(s => s.id !== id));

    // -- Roster --
    const addRosterAssignment = (roster: RosterAssignment) => setRosterAssignments(prev => [...prev, roster]);
    const updateRosterAssignment = (id: string, updates: Partial<RosterAssignment>) => {
        setRosterAssignments(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    };
    const deleteRosterAssignment = (id: string) => setRosterAssignments(prev => prev.filter(r => r.id !== id));
    const bulkAddRosterAssignments = (rosters: RosterAssignment[]) => {
        setRosterAssignments(prev => [...prev, ...rosters]);
    };

    // -- Swap Requests --
    const addShiftSwapRequest = (swap: ShiftSwapRequest) => setShiftSwapRequests(prev => [...prev, swap]);
    const updateShiftSwapRequest = (id: string, updates: Partial<ShiftSwapRequest>) => {
        setShiftSwapRequests(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    // -- Overtime Requests --
    const addOvertimeRequest = (req: OvertimeRequest) => setOvertimeRequests(prev => [...prev, req]);
    const updateOvertimeRequest = (id: string, updates: Partial<OvertimeRequest>) => {
        setOvertimeRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    // -- Reimbursements --
    const addReimbursement = (reimburse: Reimbursement) => setReimbursements(prev => [...prev, reimburse]);
    const updateReimbursement = (id: string, updates: Partial<Reimbursement>) => {
        setReimbursements(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    // -- Job Postings --
    const addJobPosting = (job: JobPosting) => setJobPostings(prev => [...prev, job]);
    const updateJobPosting = (id: string, updates: Partial<JobPosting>) => {
        setJobPostings(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));
    };
    const deleteJobPosting = (id: string) => setJobPostings(prev => prev.filter(j => j.id !== id));

    // -- Candidates --
    const addCandidate = (candidate: Candidate) => setCandidates(prev => [...prev, candidate]);
    const updateCandidate = (id: string, updates: Partial<Candidate>) => {
        setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };
    const deleteCandidate = (id: string) => setCandidates(prev => prev.filter(c => c.id !== id));

    // -- Announcements --
    const addAnnouncement = (ann: Announcement) => setAnnouncements(prev => [...prev, ann]);
    const updateAnnouncement = (id: string, updates: Partial<Announcement>) => {
        setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    };
    const deleteAnnouncement = (id: string) => setAnnouncements(prev => prev.filter(a => a.id !== id));

    // -- Company Settings --
    const updateCompanySettings = (updates: Partial<CompanySettings>) => {
        setCompanySettings(prev => ({ ...prev, ...updates }));
    };

    // -- Skill Requirements --
    const addSkillRequirement = (req: SkillRequirement) => setSkillRequirements(prev => [...prev, req]);
    const updateSkillRequirement = (id: string, updates: Partial<SkillRequirement>) => {
        setSkillRequirements(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    };
    const deleteSkillRequirement = (id: string) => setSkillRequirements(prev => prev.filter(r => r.id !== id));

    // -- Alerts --
    const dismissAlert = (id: string) => setCertificateAlerts(prev => prev.filter(a => a.id !== id));

    // ========================
    // CONTEXT VALUE
    // ========================

    const value: DataContextType = {
        employees, leaveRequests, kpis, payrollRecords, dailyAttendance,
        shiftTemplates, rosterAssignments, shiftSwapRequests, overtimeRequests,
        reimbursements, jobPostings, candidates, announcements, companySettings,
        skillRequirements,
        addEmployee, updateEmployee, deleteEmployee,
        addLeaveRequest, updateLeaveRequest, approveLeaveRequest,
        addKPI, updateKPI, deleteKPI,
        addPayrollRecord, updatePayrollRecord,
        addDailyAttendance, updateDailyAttendance,
        addShiftTemplate, updateShiftTemplate, deleteShiftTemplate,
        addRosterAssignment, updateRosterAssignment, deleteRosterAssignment, bulkAddRosterAssignments,
        addShiftSwapRequest, updateShiftSwapRequest,
        addOvertimeRequest, updateOvertimeRequest,
        addReimbursement, updateReimbursement,
        addJobPosting, updateJobPosting, deleteJobPosting,
        addCandidate, updateCandidate, deleteCandidate,
        addAnnouncement, updateAnnouncement, deleteAnnouncement,
        updateCompanySettings,
        addSkillRequirement, updateSkillRequirement, deleteSkillRequirement,
        certificateAlerts, dismissAlert,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
