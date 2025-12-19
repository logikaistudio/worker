// Currency formatting utilities for Indonesian Rupiah

export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export const formatCurrencyInput = (value: string): string => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');

    // Format with thousand separators (dot)
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseCurrencyInput = (value: string): number => {
    // Remove dots and parse to number
    const cleaned = value.replace(/\./g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
};

// Format number to currency display (without Rp symbol)
export const formatNumberWithSeparator = (value: number): string => {
    return value.toLocaleString('id-ID');
};

// Input handler for currency fields
export const handleCurrencyInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
) => {
    const formatted = formatCurrencyInput(e.target.value);
    setter(formatted);
};
