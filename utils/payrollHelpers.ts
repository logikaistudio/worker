// ========================
// Payroll Calculation Utilities — Indonesian Tax & BPJS Compliance
// Ref: UU PPh, PP 58/2023 (TER), PMK 168/2023
// ========================

import { PTKPStatus, CompanySettings } from '@/types';

// ========================
// PTKP (Penghasilan Tidak Kena Pajak) — 2024
// ========================

const DEFAULT_PTKP: Record<PTKPStatus, number> = {
    TK: 54000000,   // Tidak Kawin
    K0: 58500000,   // Kawin, 0 tanggungan
    K1: 63000000,   // Kawin, 1 tanggungan
    K2: 67500000,   // Kawin, 2 tanggungan
    K3: 72000000,   // Kawin, 3 tanggungan
};

export const getPTKP = (status: PTKPStatus, settings?: CompanySettings): number => {
    if (settings?.ptkpRates) return settings.ptkpRates[status];
    return DEFAULT_PTKP[status];
};

// ========================
// BIAYA JABATAN
// 5% dari penghasilan bruto, max Rp 500.000/bulan (Rp 6.000.000/tahun)
// ========================

export const calculateBiayaJabatan = (grossMonthly: number): number => {
    return Math.min(grossMonthly * 0.05, 500000);
};

// ========================
// PPh 21 — Progressive Tax Rates (Pasal 17)
// Applied to PKP (Penghasilan Kena Pajak) = Annual Net Income - PTKP
// ========================

export const calculatePPh21Progressive = (annualPKP: number): number => {
    if (annualPKP <= 0) return 0;

    let tax = 0;

    // Layer 1: 0 - 60 juta → 5%
    if (annualPKP <= 60000000) {
        tax = annualPKP * 0.05;
    }
    // Layer 2: 60 juta - 250 juta → 15%
    else if (annualPKP <= 250000000) {
        tax = 60000000 * 0.05 + (annualPKP - 60000000) * 0.15;
    }
    // Layer 3: 250 juta - 500 juta → 25%
    else if (annualPKP <= 500000000) {
        tax = 60000000 * 0.05 + 190000000 * 0.15 + (annualPKP - 250000000) * 0.25;
    }
    // Layer 4: 500 juta - 5 miliar → 30%
    else if (annualPKP <= 5000000000) {
        tax = 60000000 * 0.05 + 190000000 * 0.15 + 250000000 * 0.25 + (annualPKP - 500000000) * 0.30;
    }
    // Layer 5: > 5 miliar → 35%
    else {
        tax = 60000000 * 0.05 + 190000000 * 0.15 + 250000000 * 0.25 + 4500000000 * 0.30 + (annualPKP - 5000000000) * 0.35;
    }

    return tax;
};

// ========================
// PPh 21 MONTHLY CALCULATION (Complete)
// ========================

export const calculatePPh21Monthly = (
    grossMonthly: number,
    ptkpStatus: PTKPStatus = 'TK',
    settings?: CompanySettings
): { monthlyTax: number; biayaJabatan: number; annualPKP: number } => {
    const biayaJabatan = calculateBiayaJabatan(grossMonthly);

    // Annual net income = (gross - biaya jabatan) * 12
    const annualNetIncome = (grossMonthly - biayaJabatan) * 12;

    // PTKP
    const ptkp = getPTKP(ptkpStatus, settings);

    // PKP (Penghasilan Kena Pajak)
    const annualPKP = Math.max(0, annualNetIncome - ptkp);

    // Annual tax
    const annualTax = calculatePPh21Progressive(annualPKP);

    // Monthly tax
    const monthlyTax = Math.round(annualTax / 12);

    return { monthlyTax, biayaJabatan, annualPKP };
};

// ========================
// BPJS COMPLETE CALCULATION
// ========================

export interface BPJSCalculation {
    // Employee portions
    bpjsKesEmployee: number;    // 1%
    bpjsJhtEmployee: number;    // 2%
    bpjsJpEmployee: number;     // 1%
    totalEmployee: number;
    // Employer portions
    bpjsKesEmployer: number;    // 4%
    bpjsJhtEmployer: number;    // 3.7%
    bpjsJkkEmployer: number;    // 0.24%
    bpjsJkmEmployer: number;    // 0.3%
    bpjsJpEmployer: number;     // 2%
    totalEmployer: number;
}

export const calculateBPJSComplete = (
    basicSalary: number,
    settings?: CompanySettings
): BPJSCalculation => {
    const rates = {
        kesEmployee: settings?.bpjsKesEmployeeRate ?? 0.01,
        kesEmployer: settings?.bpjsKesEmployerRate ?? 0.04,
        jhtEmployee: settings?.bpjsJhtEmployeeRate ?? 0.02,
        jhtEmployer: settings?.bpjsJhtEmployerRate ?? 0.037,
        jkk: settings?.bpjsJkkRate ?? 0.0024,
        jkm: settings?.bpjsJkmRate ?? 0.003,
        jpEmployee: settings?.bpjsJpEmployeeRate ?? 0.01,
        jpEmployer: settings?.bpjsJpEmployerRate ?? 0.02,
    };

    // BPJS Kesehatan cap: max basis Rp 12.000.000
    const kesBasis = Math.min(basicSalary, 12000000);
    // BPJS JP cap: max basis Rp 10.042.300 (2024)
    const jpBasis = Math.min(basicSalary, 10042300);

    const bpjsKesEmployee = Math.round(kesBasis * rates.kesEmployee);
    const bpjsKesEmployer = Math.round(kesBasis * rates.kesEmployer);
    const bpjsJhtEmployee = Math.round(basicSalary * rates.jhtEmployee);
    const bpjsJhtEmployer = Math.round(basicSalary * rates.jhtEmployer);
    const bpjsJkkEmployer = Math.round(basicSalary * rates.jkk);
    const bpjsJkmEmployer = Math.round(basicSalary * rates.jkm);
    const bpjsJpEmployee = Math.round(jpBasis * rates.jpEmployee);
    const bpjsJpEmployer = Math.round(jpBasis * rates.jpEmployer);

    return {
        bpjsKesEmployee,
        bpjsJhtEmployee,
        bpjsJpEmployee,
        totalEmployee: bpjsKesEmployee + bpjsJhtEmployee + bpjsJpEmployee,
        bpjsKesEmployer,
        bpjsJhtEmployer,
        bpjsJkkEmployer,
        bpjsJkmEmployer,
        bpjsJpEmployer,
        totalEmployer: bpjsKesEmployer + bpjsJhtEmployer + bpjsJkkEmployer + bpjsJkmEmployer + bpjsJpEmployer,
    };
};

// ========================
// THR (Tunjangan Hari Raya)
// ========================

export const calculateTHR = (
    basicSalary: number,
    allowances: { transport: number; meal: number; other: number },
    monthsWorked: number
): number => {
    const monthlyCompensation = basicSalary + allowances.transport + allowances.meal + allowances.other;

    if (monthsWorked >= 12) {
        return monthlyCompensation; // Full THR = 1 month salary
    } else if (monthsWorked >= 1) {
        return Math.round((monthsWorked / 12) * monthlyCompensation); // Proportional
    }
    return 0;
};

// ========================
// OVERTIME PAY
// ========================

export const calculateOvertimePay = (
    basicSalary: number,
    overtimeHours: number
): number => {
    const hourlyRate = basicSalary / 173; // Monthly working hours standard
    const overtimeRate = hourlyRate * 1.5; // 1.5x for overtime on weekday
    return Math.round(overtimeHours * overtimeRate);
};

// ========================
// COMPLETE NET SALARY CALCULATION
// ========================

export interface PayrollCalculation {
    // Income
    grossSalary: number;
    overtimePay: number;
    overtimeRate: number;
    totalCustomAllowances: number;
    thrAmount: number;
    // BPJS
    bpjs: BPJSCalculation;
    // Tax
    biayaJabatan: number;
    tax: number; // PPh 21 monthly
    // Deductions
    totalCustomDeductions: number;
    loanDeduction: number;
    otherDeductions: number;
    totalDeductions: number;
    // Net
    netSalary: number;
}

export const calculateNetSalaryComplete = (
    basicSalary: number,
    allowances: { transport: number; meal: number; other: number },
    ptkpStatus: PTKPStatus = 'TK',
    overtimeHours: number = 0,
    customAllowances: { name: string; amount: number }[] = [],
    customDeductions: { name: string; amount: number }[] = [],
    loanDeduction: number = 0,
    otherDeductions: number = 0,
    includeTHR: boolean = false,
    monthsWorked: number = 12,
    settings?: CompanySettings
): PayrollCalculation => {
    const totalAllowances = allowances.transport + allowances.meal + allowances.other;
    const overtimePay = calculateOvertimePay(basicSalary, overtimeHours);
    const totalCustomAllowances = customAllowances.reduce((sum, a) => sum + a.amount, 0);
    const totalCustomDeductions = customDeductions.reduce((sum, d) => sum + d.amount, 0);
    const thrAmount = includeTHR ? calculateTHR(basicSalary, allowances, monthsWorked) : 0;

    const grossSalary = basicSalary + totalAllowances + overtimePay + totalCustomAllowances + thrAmount;

    // BPJS
    const bpjs = calculateBPJSComplete(basicSalary, settings);

    // Tax
    const { monthlyTax, biayaJabatan } = calculatePPh21Monthly(grossSalary, ptkpStatus, settings);

    // Total deductions
    const totalDeductions = bpjs.totalEmployee + monthlyTax + totalCustomDeductions + loanDeduction + otherDeductions;

    // Net
    const netSalary = grossSalary - totalDeductions;

    return {
        grossSalary,
        overtimePay,
        overtimeRate: overtimeHours > 0 ? overtimePay / overtimeHours : 0,
        totalCustomAllowances,
        thrAmount,
        bpjs,
        biayaJabatan,
        tax: monthlyTax,
        totalCustomDeductions,
        loanDeduction,
        otherDeductions,
        totalDeductions,
        netSalary,
    };
};

// ========================
// BACKWARD COMPATIBLE — Legacy function
// ========================

export const calculatePPh21 = (annualIncome: number): number => {
    return calculatePPh21Progressive(Math.max(0, annualIncome - DEFAULT_PTKP.TK));
};

export const calculateNetSalary = (
    basicSalary: number,
    allowances: { transport: number; meal: number; other: number },
    otherDeductions: number,
    overtimeHours: number = 0
) => {
    const result = calculateNetSalaryComplete(
        basicSalary, allowances, 'TK', overtimeHours,
        [], [], 0, otherDeductions
    );
    return {
        grossSalary: result.grossSalary,
        bpjsKesehatan: result.bpjs.bpjsKesEmployee,
        bpjsKetenagakerjaan: result.bpjs.bpjsJhtEmployee + result.bpjs.bpjsJpEmployee,
        tax: result.tax,
        totalDeductions: result.totalDeductions,
        netSalary: result.netSalary,
        overtimePay: result.overtimePay,
        overtimeRate: result.overtimeRate,
    };
};
