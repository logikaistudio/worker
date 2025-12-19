export const calculateAchievementPercentage = (actual: number, target: number): number => {
    if (target === 0) return 0;
    return (actual / target) * 100;
};

export const getKPIStatus = (percentage: number): {
    color: string;
    label: string;
    variant: 'success' | 'warning' | 'danger';
    textColor: string;
    bgColor: string;
    borderColor: string;
} => {
    if (percentage >= 100) {
        return {
            color: 'green',
            label: 'Target Tercapai',
            variant: 'success',
            textColor: 'text-success-700',
            bgColor: 'bg-success-100',
            borderColor: 'border-success-500',
        };
    } else if (percentage >= 90) {
        return {
            color: 'yellow',
            label: 'Hampir Tercapai',
            variant: 'warning',
            textColor: 'text-warning-yellow-700',
            bgColor: 'bg-warning-yellow-100',
            borderColor: 'border-warning-yellow-500',
        };
    } else if (percentage >= 80) {
        return {
            color: 'orange',
            label: 'Perlu Perhatian',
            variant: 'warning',
            textColor: 'text-warning-orange-700',
            bgColor: 'bg-warning-orange-100',
            borderColor: 'border-warning-orange-500',
        };
    } else {
        return {
            color: 'red',
            label: 'Di Bawah Target',
            variant: 'danger',
            textColor: 'text-danger-700',
            bgColor: 'bg-danger-100',
            borderColor: 'border-danger-500',
        };
    }
};

export const getKPIWarningMessage = (percentage: number, kpiName: string): string | null => {
    if (percentage >= 100) {
        return null;
    } else if (percentage >= 90) {
        return `${kpiName}: Anda hampir mencapai target (${percentage.toFixed(1)}%)`;
    } else if (percentage >= 80) {
        return `${kpiName}: Perlu usaha ekstra untuk mencapai target (${percentage.toFixed(1)}%)`;
    } else {
        return `${kpiName}: PERINGATAN! Capaian jauh dari target (${percentage.toFixed(1)}%)`;
    }
};
