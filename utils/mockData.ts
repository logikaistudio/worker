import { Employee, LeaveRequest, KPI, PayrollRecord, DailyAttendance } from '@/types';

export const mockEmployees: Employee[] = [
    {
        id: '1',
        name: 'Budi Santoso',
        employeeId: 'EMP001',
        email: 'budi.santoso@worker.com',
        phone: '081234567890',
        position: 'Senior Developer',
        department: 'IT',
        joinDate: '2020-01-15',
        address: 'Jl. Sudirman No. 123, Jakarta',
        basicSalary: 15000000,
        allowances: {
            transport: 1000000,
            meal: 500000,
            other: 500000,
        },
        annualLeaveQuota: 12,
        usedLeaveQuota: 3,
        remainingLeaveQuota: 9,
        hierarchyLevel: 2, // Supervisor
        isApprover: true, // Can approve leave requests
        latestPayrollId: undefined,
        status: 'active',
    },
    {
        id: '2',
        name: 'Siti Nurhaliza',
        employeeId: 'EMP002',
        email: 'siti.nurhaliza@worker.com',
        phone: '081234567891',
        position: 'HR Manager',
        department: 'Human Resources',
        joinDate: '2019-03-20',
        address: 'Jl. Gatot Subroto No. 45, Jakarta',
        basicSalary: 12000000,
        allowances: {
            transport: 1000000,
            meal: 500000,
            other: 300000,
        },
        annualLeaveQuota: 12,
        usedLeaveQuota: 0,
        remainingLeaveQuota: 12,
        hierarchyLevel: 3, // Manager
        isApprover: true, // Can approve leave requests
        latestPayrollId: undefined,
        status: 'active',
    },
    {
        id: '3',
        name: 'Ahmad Yani',
        employeeId: 'EMP003',
        email: 'ahmad.yani@worker.com',
        phone: '081234567892',
        position: 'Marketing Executive',
        department: 'Marketing',
        joinDate: '2021-06-10',
        address: 'Jl. Thamrin No. 78, Jakarta',
        basicSalary: 8000000,
        allowances: {
            transport: 800000,
            meal: 500000,
            other: 200000,
        },
        annualLeaveQuota: 12,
        usedLeaveQuota: 0,
        remainingLeaveQuota: 12,
        hierarchyLevel: 1, // Staff
        isApprover: false, // Cannot approve leave requests
        latestPayrollId: undefined,
        status: 'active',
    },
];

export const mockLeaveRequests: LeaveRequest[] = [
    {
        id: '1',
        employeeId: '1',
        employeeName: 'Budi Santoso',
        leaveType: 'annual',
        startDate: '2024-02-01',
        endDate: '2024-02-03',
        totalDays: 3,
        reason: 'Liburan keluarga',
        status: 'approved',
        approver1Name: 'Manager',
        approver1Status: 'approved',
        approver1Date: '2024-01-25',
        approver2Name: 'HR Director',
        approver2Status: 'approved',
        approver2Date: '2024-01-26',
        createdAt: '2024-01-20',
    },
];

export const mockKPIs: KPI[] = [
    {
        id: '1',
        employeeId: '1',
        employeeName: 'Budi Santoso',
        kpiName: 'Project Completion',
        target: 10,
        actual: 12,
        unit: 'projects',
        period: '2024-01',
        createdAt: '2024-01-31',
    },
];

export const mockPayrollRecords: PayrollRecord[] = [];

export const mockDailyAttendance: DailyAttendance[] = [
    {
        id: '1',
        employeeId: '1',
        employeeName: 'Budi Santoso',
        date: new Date().toISOString().slice(0, 10),
        checkIn: null,
        checkOut: null,
        status: 'not_checked_in',
        workHours: 0,
        regularHours: 0,
        overtimeHours: 0,
        notes: '',
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        employeeId: '2',
        employeeName: 'Siti Nurhaliza',
        date: new Date().toISOString().slice(0, 10),
        checkIn: null,
        checkOut: null,
        status: 'not_checked_in',
        workHours: 0,
        regularHours: 0,
        overtimeHours: 0,
        notes: '',
        createdAt: new Date().toISOString(),
    },
    {
        id: '3',
        employeeId: '3',
        employeeName: 'Ahmad Yani',
        date: new Date().toISOString().slice(0, 10),
        checkIn: null,
        checkOut: null,
        status: 'not_checked_in',
        workHours: 0,
        regularHours: 0,
        overtimeHours: 0,
        notes: '',
        createdAt: new Date().toISOString(),
    },
];
