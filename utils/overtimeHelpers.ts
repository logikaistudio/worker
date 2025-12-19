// Overtime calculation utilities

const MONTHLY_WORKING_HOURS = 173; // Standard Indonesian monthly working hours
const STANDARD_DAILY_HOURS = 8;
const OVERTIME_MULTIPLIER = 1.5;

/**
 * Calculate hourly rate from monthly basic salary
 */
export const calculateHourlyRate = (basicSalary: number): number => {
    return basicSalary / MONTHLY_WORKING_HOURS;
};

/**
 * Calculate overtime pay based on hours and basic salary
 * Formula: (Basic Salary / 173) * 1.5 * Overtime Hours
 */
export const calculateOvertimePay = (
    basicSalary: number,
    overtimeHours: number
): number => {
    const hourlyRate = calculateHourlyRate(basicSalary);
    const overtimeRate = hourlyRate * OVERTIME_MULTIPLIER;
    return overtimeHours * overtimeRate;
};

/**
 * Calculate work hours from check-in and check-out times
 * Returns: { workHours, regularHours, overtimeHours }
 */
export const calculateWorkHours = (
    checkIn: string, // HH:mm format
    checkOut: string // HH:mm format
): { workHours: number; regularHours: number; overtimeHours: number } => {
    const [inHour, inMinute] = checkIn.split(':').map(Number);
    const [outHour, outMinute] = checkOut.split(':').map(Number);

    const inMinutes = inHour * 60 + inMinute;
    const outMinutes = outHour * 60 + outMinute;

    let totalMinutes = outMinutes - inMinutes;

    // Handle overnight shift
    if (totalMinutes < 0) {
        totalMinutes += 24 * 60;
    }

    // Subtract 1 hour break if worked more than 6 hours
    const totalHours = totalMinutes / 60;
    const workHours = totalHours > 6 ? totalHours - 1 : totalHours;

    const regularHours = Math.min(workHours, STANDARD_DAILY_HOURS);
    const overtimeHours = Math.max(0, workHours - STANDARD_DAILY_HOURS);

    return {
        workHours: Math.round(workHours * 100) / 100, // 2 decimal places
        regularHours: Math.round(regularHours * 100) / 100,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
    };
};

/**
 * Get total overtime hours for an employee in a given period
 */
export const getTotalOvertimeHours = (
    attendanceRecords: Array<{ employeeId: string; date: string; overtimeHours: number }>,
    employeeId: string,
    period: string // YYYY-MM format
): number => {
    return attendanceRecords
        .filter(record =>
            record.employeeId === employeeId &&
            record.date.startsWith(period)
        )
        .reduce((sum, record) => sum + record.overtimeHours, 0);
};
