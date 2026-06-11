// ========================
// EMPLOYEE & COMPETENCY TYPES
// ========================

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
    // New identity fields
    ktpNumber?: string;
    npwp?: string;
    birthPlace?: string;
    birthDate?: string;
    gender?: 'male' | 'female';
    religion?: string;
    // BPJS & Bank
    bpjsKesId?: string;
    bpjsTkId?: string;
    bankName?: string;
    bankAccountNo?: string;
    bankAccountName?: string;
    // Tax status
    maritalStatus?: 'TK' | 'K0' | 'K1' | 'K2' | 'K3'; // PTKP
    dependents?: number;
    // Contract
    contractType?: 'PKWT' | 'PKWTT';
    contractEndDate?: string;
    // Emergency contact
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
    };
    // Competency
    skills?: Skill[];
    trainings?: Training[];
    certificates?: Certificate[];
    // Payroll
    customAllowances?: { name: string; amount: number }[];
    customDeductions?: { name: string; amount: number }[];
    // Leave
    annualLeaveQuota: number;
    usedLeaveQuota: number;
    remainingLeaveQuota: number;
    // Hierarchy
    hierarchyLevel: number; // 1=Staff, 2=Supervisor, 3=Manager, 4=Director, 5=C-Level
    isApprover: boolean;
    latestPayrollId?: string;
    status: 'active' | 'inactive';
}

export interface Skill {
    name: string;
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category?: 'technical' | 'softskill' | 'language' | 'certification';
    lastUsed?: string;
    endorsements?: number;
    notes?: string;
}

export interface Training {
    id?: string;
    name: string;
    provider?: string;
    startDate?: string;
    endDate?: string;
    status?: 'planned' | 'ongoing' | 'completed' | 'cancelled';
    certificateId?: string;
    notes?: string;
}

export interface Certificate {
    id?: string;
    name: string;
    issuedBy?: string;
    issueDate?: string;
    expiryDate?: string | null;
    fileUrl?: string;
    valid?: boolean;
}

// ========================
// LEAVE MANAGEMENT
// ========================

export interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    leaveType: 'annual' | 'sick' | 'personal' | 'unpaid';
    startDate: string;
    endDate: string;
    totalDays: number;
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
};

// ========================
// KPI
// ========================

export interface KPI {
    id: string;
    employeeId: string;
    employeeName: string;
    kpiName: string;
    target: number;
    actual: number;
    unit: string;
    weight?: number; // 0-100 percentage weight
    period: string;
    createdAt: string;
}

// ========================
// ATTENDANCE
// ========================

export interface DailyAttendance {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    status: AttendanceStatus;
    workHours: number;
    regularHours: number;
    overtimeHours: number;
    shiftId?: string; // Link to assigned shift
    notes?: string;
    createdAt: string;
}

export type AttendanceStatus = 'not_checked_in' | 'checked_in' | 'checked_out';

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
    not_checked_in: 'Belum Check-in',
    checked_in: 'Sudah Check-in',
    checked_out: 'Sudah Check-out',
};

// ========================
// SHIFT & ROSTER MANAGEMENT
// ========================

export interface ShiftTemplate {
    id: string;
    name: string;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
    breakMinutes: number;
    toleranceMinutes: number;
    color: string; // Hex color for calendar display
    isNightShift: boolean;
    workingHours: number; // Auto-calculated
    isActive: boolean;
}

export interface RosterAssignment {
    id: string;
    employeeId: string;
    employeeName: string;
    shiftId: string;
    shiftName: string;
    date: string; // YYYY-MM-DD
    status: 'scheduled' | 'completed' | 'absent' | 'swapped' | 'day_off';
    swapRequestId?: string;
    createdAt: string;
}

export interface ShiftSwapRequest {
    id: string;
    requesterId: string;
    requesterName: string;
    targetEmployeeId: string;
    targetEmployeeName: string;
    originalDate: string;
    originalShiftId: string;
    originalShiftName: string;
    targetDate: string;
    targetShiftId: string;
    targetShiftName: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedDate?: string;
    createdAt: string;
}

// ========================
// OVERTIME REQUEST (SPL)
// ========================

export interface OvertimeRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string;
    estimatedHours: number;
    actualHours?: number;
    reason: string;
    projectName?: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    approverName?: string;
    approverDate?: string;
    estimatedCost: number;
    actualCost?: number;
    createdAt: string;
}

// ========================
// PAYROLL (ENHANCED)
// ========================

export type PTKPStatus = 'TK' | 'K0' | 'K1' | 'K2' | 'K3';

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
    customAllowances?: { name: string; amount: number }[];
    customDeductions?: { name: string; amount: number }[];
    // Overtime
    overtimeHours: number;
    overtimeRate: number;
    overtimePay: number;
    // BPJS Employee portions
    bpjsKesehatan: number;     // 1% employee
    bpjsKetenagakerjaan: number; // Legacy — sum of JHT+JP employee
    bpjsJhtEmployee?: number;   // 2% employee
    bpjsJpEmployee?: number;    // 1% employee
    // BPJS Employer portions (for reporting)
    bpjsKesEmployer?: number;   // 4% employer
    bpjsJhtEmployer?: number;   // 3.7% employer
    bpjsJkkEmployer?: number;   // 0.24-1.74% employer
    bpjsJkmEmployer?: number;   // 0.3% employer
    bpjsJpEmployer?: number;    // 2% employer
    // Tax
    ptkpStatus?: PTKPStatus;
    biayaJabatan?: number;      // 5% of gross, max 500k
    tax: number;                // PPh 21 monthly
    // Other
    thrAmount?: number;         // THR if applicable
    loanDeduction?: number;     // Kasbon deduction
    otherDeductions: number;
    // Totals
    grossSalary: number;
    totalDeductions: number;
    netSalary: number;
    // Status
    payrollStatus?: 'draft' | 'reviewed' | 'approved' | 'paid';
    paymentDate: string;
    createdAt: string;
}

// ========================
// REIMBURSEMENT
// ========================

export type ReimbursementCategory = 'transport' | 'meal' | 'accommodation' | 'medical' | 'office_supply' | 'other';

export const reimbursementCategoryLabels: Record<ReimbursementCategory, string> = {
    transport: 'Transportasi',
    meal: 'Makan',
    accommodation: 'Akomodasi',
    medical: 'Kesehatan',
    office_supply: 'Perlengkapan Kantor',
    other: 'Lainnya',
};

export interface Reimbursement {
    id: string;
    employeeId: string;
    employeeName: string;
    category: ReimbursementCategory;
    amount: number;
    description: string;
    transactionDate: string;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    approverName?: string;
    approverDate?: string;
    rejectionReason?: string;
    createdAt: string;
}

// ========================
// RECRUITMENT
// ========================

export type JobStatus = 'draft' | 'open' | 'closed' | 'filled';
export type CandidateStage = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

export interface JobPosting {
    id: string;
    title: string;
    department: string;
    position: string;
    description: string;
    requirements: string[];
    employmentType: 'full_time' | 'part_time' | 'contract' | 'internship';
    salaryMin?: number;
    salaryMax?: number;
    status: JobStatus;
    openDate: string;
    closeDate?: string;
    createdAt: string;
}

export interface Candidate {
    id: string;
    jobPostingId: string;
    jobTitle: string;
    name: string;
    email: string;
    phone: string;
    currentCompany?: string;
    currentPosition?: string;
    expectedSalary?: number;
    stage: CandidateStage;
    interviewScore?: number; // 1-100
    interviewNotes?: string;
    rejectionReason?: string;
    appliedDate: string;
    createdAt: string;
}

// ========================
// ANNOUNCEMENT
// ========================

export type AnnouncementPriority = 'normal' | 'important' | 'urgent';

export interface Announcement {
    id: string;
    title: string;
    content: string;
    priority: AnnouncementPriority;
    targetDepartment?: string; // null = all departments
    isPinned: boolean;
    expiryDate?: string;
    authorName: string;
    createdAt: string;
}

// ========================
// COMPANY SETTINGS
// ========================

export interface CompanySettings {
    companyName: string;
    companyAddress: string;
    companyPhone: string;
    companyEmail: string;
    companyNpwp: string;
    companyLogo?: string; // base64 or URL
    // Work calendar
    workDays: number[]; // 0=Sun, 1=Mon ... 6=Sat (e.g., [1,2,3,4,5])
    defaultWorkStart: string; // HH:mm
    defaultWorkEnd: string;   // HH:mm
    // BPJS Rates (editable)
    bpjsKesEmployeeRate: number;  // default 0.01
    bpjsKesEmployerRate: number;  // default 0.04
    bpjsJhtEmployeeRate: number;  // default 0.02
    bpjsJhtEmployerRate: number;  // default 0.037
    bpjsJkkRate: number;          // default 0.0024 (low risk)
    bpjsJkmRate: number;          // default 0.003
    bpjsJpEmployeeRate: number;   // default 0.01
    bpjsJpEmployerRate: number;   // default 0.02
    // PTKP Rates (2024)
    ptkpRates: Record<PTKPStatus, number>;
    // Leave
    defaultAnnualLeave: number; // default 12
    // National holidays
    nationalHolidays: { date: string; name: string }[];
}

// ========================
// SKILL REQUIREMENTS
// ========================

export interface SkillRequirement {
    id: string;
    position: string;
    department: string;
    skillName: string;
    requiredLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    mandatory: boolean;
}
