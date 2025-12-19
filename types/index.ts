export interface Employee {
    id: string;
    name: string;
    employeeId: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    joinDate: string;
    address: string;
    basicSalary: number;
    allowances: {
        transport: number;
        meal: number;
        other: number;
    };
    customAllowances?: { name: string; amount: number }[]; // Custom allowance items
    customDeductions?: { name: string; amount: number }[]; // Custom deduction items
    annualLeaveQuota: number; // Total annual leave days per year (e.g., 12)
    usedLeaveQuota: number; // Number of days used
    remainingLeaveQuota: number; // Calculated: annualLeaveQuota - usedLeaveQuota
    hierarchyLevel: number; // 1=Staff, 2=Supervisor, 3=Manager, 4=Director, 5=C-Level
    isApprover: boolean; // Can this employee approve leave requests?
    latestPayrollId?: string; // Link to latest payroll record
    status: 'active' | 'inactive';
}

export interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    leaveType: 'annual' | 'sick' | 'personal' | 'unpaid';
    startDate: string;
    endDate: string;
    totalDays: number; // Number of days requested
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    approver1Status: 'pending' | 'approved' | 'rejected';
    approver1Name: string;
    approver1Date?: string;
    approver2Status: 'pending' | 'approved' | 'rejected';
    approver2Name: string;
    approver2Date?: string;
    createdAt: string;
}

export interface KPI {
    id: string;
    employeeId: string;
    employeeName: string;
    kpiName: string;
    target: number;
    actual: number;
    unit: string;
    period: string;
    createdAt: string;
}

export interface PayrollRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    period: string; // YYYY-MM
    basicSalary: number;
    allowances: {
        transport: number;
        meal: number;
        other: number;
    };
    overtimeHours: number;
    overtimeRate: number; // Per hour
    overtimePay: number; // Total overtime payment
    bpjsKesehatan: number; // 1% of basic salary
    bpjsKetenagakerjaan: number; // 2% of basic salary
    tax: number;
    otherDeductions: number;
    grossSalary: number;
    totalDeductions: number;
    netSalary: number;
    paymentDate: string;
    createdAt: string;
}

// New: Daily Attendance interface
export interface DailyAttendance {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string; // YYYY-MM-DD
    checkIn: string | null; // HH:mm
    checkOut: string | null; // HH:mm
    status: AttendanceStatus;
    workHours: number; // Total hours worked
    regularHours: number; // Standard hours (max 8)
    overtimeHours: number; // Overtime hours (> 8)
    notes?: string;
    createdAt: string;
}

export const leaveTypeLabels = {
    annual: 'Cuti Tahunan',
    sick: 'Cuti Sakit',
    personal: 'Cuti Pribadi',
    unpaid: 'Cuti Tanpa Gaji',
};

export const statusLabels = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
}

export type AttendanceStatus = 'not_checked_in' | 'checked_in' | 'checked_out';

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
    not_checked_in: 'Belum Check-in',
    checked_in: 'Sudah Check-in',
    checked_out: 'Sudah Check-out',
};
