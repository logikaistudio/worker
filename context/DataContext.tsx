'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee, LeaveRequest, KPI, PayrollRecord, DailyAttendance } from '@/types';
import { mockEmployees, mockLeaveRequests, mockKPIs, mockPayrollRecords, mockDailyAttendance } from '@/utils/mockData';

interface DataContextType {
    employees: Employee[];
    leaveRequests: LeaveRequest[];
    kpis: KPI[];
    payrollRecords: PayrollRecord[];
    dailyAttendance: DailyAttendance[];
    addEmployee: (employee: Employee) => void;
    updateEmployee: (id: string, employee: Partial<Employee>) => void;
    deleteEmployee: (id: string) => void;
    addLeaveRequest: (request: LeaveRequest) => void;
    updateLeaveRequest: (id: string, request: Partial<LeaveRequest>) => void;
    approveLeaveRequest: (id: string) => void; // Auto-decrement quota when approved
    addKPI: (kpi: KPI) => void;
    updateKPI: (id: string, kpi: Partial<KPI>) => void;
    deleteKPI: (id: string) => void;
    addPayrollRecord: (record: PayrollRecord) => void;
    updatePayrollRecord: (id: string, record: Partial<PayrollRecord>) => void;
    addDailyAttendance: (attendance: DailyAttendance) => void;
    updateDailyAttendance: (id: string, attendance: Partial<DailyAttendance>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
};

interface DataProviderProps {
    children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [kpis, setKPIs] = useState<KPI[]>([]);
    const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
    const [dailyAttendance, setDailyAttendance] = useState<DailyAttendance[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const savedEmployees = localStorage.getItem('worker_employees');
        const savedLeaves = localStorage.getItem('worker_leaves');
        const savedKPIs = localStorage.getItem('worker_kpis');
        const savedPayroll = localStorage.getItem('worker_payroll');
        const savedAttendance = localStorage.getItem('worker_attendance');

        setEmployees(savedEmployees ? JSON.parse(savedEmployees) : mockEmployees);
        setLeaveRequests(savedLeaves ? JSON.parse(savedLeaves) : mockLeaveRequests);
        setKPIs(savedKPIs ? JSON.parse(savedKPIs) : mockKPIs);
        setPayrollRecords(savedPayroll ? JSON.parse(savedPayroll) : mockPayrollRecords);
        setDailyAttendance(savedAttendance ? JSON.parse(savedAttendance) : mockDailyAttendance);

        // Mark as initialized after loading
        setIsInitialized(true);
    }, []);

    // Save to localStorage when data changes (only after initialization)
    useEffect(() => {
        if (isInitialized && employees.length > 0) {
            localStorage.setItem('worker_employees', JSON.stringify(employees));
        }
    }, [employees, isInitialized]);

    useEffect(() => {
        if (isInitialized && leaveRequests.length > 0) {
            localStorage.setItem('worker_leaves', JSON.stringify(leaveRequests));
        }
    }, [leaveRequests, isInitialized]);

    useEffect(() => {
        if (isInitialized && kpis.length > 0) {
            localStorage.setItem('worker_kpis', JSON.stringify(kpis));
        }
    }, [kpis, isInitialized]);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('worker_payroll', JSON.stringify(payrollRecords));
        }
    }, [payrollRecords, isInitialized]);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('worker_attendance', JSON.stringify(dailyAttendance));
        }
    }, [dailyAttendance, isInitialized]);

    const addEmployee = (employee: Employee) => {
        setEmployees(prev => [...prev, employee]);
    };

    const updateEmployee = (id: string, updates: Partial<Employee>) => {
        setEmployees(prev => prev.map(emp => {
            if (emp.id === id) {
                const updated = { ...emp, ...updates };
                // Recalculate remaining quota if annual or used quota changed
                if ('annualLeaveQuota' in updates || 'usedLeaveQuota' in updates) {
                    updated.remainingLeaveQuota = updated.annualLeaveQuota - updated.usedLeaveQuota;
                }
                return updated;
            }
            return emp;
        }));
    };

    const deleteEmployee = (id: string) => {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
    };

    const addLeaveRequest = (request: LeaveRequest) => {
        setLeaveRequests(prev => [...prev, request]);
    };

    const updateLeaveRequest = (id: string, updates: Partial<LeaveRequest>) => {
        setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, ...updates } : req));
    };

    const approveLeaveRequest = (id: string) => {
        const request = leaveRequests.find(r => r.id === id);
        if (!request) return;

        // Update leave request to approved
        setLeaveRequests(prev => prev.map(req =>
            req.id === id
                ? {
                    ...req,
                    status: 'approved',
                    approver2Status: 'approved',
                    approver2Date: new Date().toISOString()
                }
                : req
        ));

        // Deduct from employee's leave quota
        if (request.leaveType === 'annual') {
            setEmployees(prev => prev.map(emp => {
                if (emp.id === request.employeeId) {
                    const newUsedQuota = emp.usedLeaveQuota + request.totalDays;
                    return {
                        ...emp,
                        usedLeaveQuota: newUsedQuota,
                        remainingLeaveQuota: emp.annualLeaveQuota - newUsedQuota
                    };
                }
                return emp;
            }));
        }
    };

    const addKPI = (kpi: KPI) => {
        setKPIs(prev => [...prev, kpi]);
    };

    const updateKPI = (id: string, updates: Partial<KPI>) => {
        setKPIs(prev => prev.map(k => k.id === id ? { ...k, ...updates } : k));
    };

    const deleteKPI = (id: string) => {
        setKPIs(prev => prev.filter(k => k.id !== id));
    };

    const addPayrollRecord = (record: PayrollRecord) => {
        setPayrollRecords(prev => [...prev, record]);
    };

    const updatePayrollRecord = (id: string, updates: Partial<PayrollRecord>) => {
        setPayrollRecords(prev => prev.map(rec => rec.id === id ? { ...rec, ...updates } : rec));
    };

    const addDailyAttendance = (attendance: DailyAttendance) => {
        setDailyAttendance(prev => [...prev, attendance]);
    };

    const updateDailyAttendance = (id: string, updates: Partial<DailyAttendance>) => {
        setDailyAttendance(prev => prev.map(att => att.id === id ? { ...att, ...updates } : att));
    };

    const value = {
        employees,
        leaveRequests,
        kpis,
        payrollRecords,
        dailyAttendance,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addLeaveRequest,
        updateLeaveRequest,
        approveLeaveRequest,
        addKPI,
        updateKPI,
        deleteKPI,
        addPayrollRecord,
        updatePayrollRecord,
        addDailyAttendance,
        updateDailyAttendance,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
