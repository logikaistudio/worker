// Payroll calculation utilities for Indonesian tax and BPJS

/**
 * Calculate PPh 21 (Indonesian Income Tax) - Simplified
 * Progressive tax rates applied to annual income
 */
export const calculatePPh21 = (annualIncome: number): number => {
    let tax = 0;

    // Tax brackets (annual)
    if (annualIncome <= 60000000) {
        tax = annualIncome * 0.05;
    } else if (annualIncome <= 250000000) {
        tax = 60000000 * 0.05 + (annualIncome - 60000000) * 0.15;
    } else if (annualIncome <= 500000000) {
        tax = 60000000 * 0.05 + 190000000 * 0.15 + (annualIncome - 250000000) * 0.25;
    } else {
        tax = 60000000 * 0.05 + 190000000 * 0.15 + 250000000 * 0.25 + (annualIncome - 500000000) * 0.30;
    }

    return tax;
};

/**
 * Calculate overtime pay
 */
export const calculateOvertimePay = (
    basicSalary: number,
    overtimeHours: number
): number => {
    const hourlyRate = basicSalary / 173; // Monthly working hours
    const overtimeRate = hourlyRate * 1.5; // 1.5x for overtime
    return overtimeHours * overtimeRate;
};

/**
 * Calculate net salary with all components including overtime
 */
export const calculateNetSalary = (
    basicSalary: number,
    allowances: { transport: number; meal: number; other: number },
    otherDeductions: number,
    overtimeHours: number = 0
) => {
    const totalAllowances = allowances.transport + allowances.meal + allowances.other;
    const overtimePay = calculateOvertimePay(basicSalary, overtimeHours);
    const grossSalary = basicSalary + totalAllowances + overtimePay;

    // BPJS
    const bpjsKesehatan = basicSalary * 0.01; // 1%
    const bpjsKetenagakerjaan = basicSalary * 0.02; // 2%

    // Tax (PPh 21 - simplified progressive)
    const annualGross = grossSalary * 12;
    const annualTax = calculatePPh21(annualGross);
    const tax = annualTax / 12; // Monthly tax

    const totalDeductions = bpjsKesehatan + bpjsKetenagakerjaan + tax + otherDeductions;
    const netSalary = grossSalary - totalDeductions;

    return {
        grossSalary,
        bpjsKesehatan,
        bpjsKetenagakerjaan,
        tax,
        totalDeductions,
        netSalary,
        overtimePay,
        overtimeRate: overtimeHours > 0 ? overtimePay / overtimeHours : 0,
    };
};
