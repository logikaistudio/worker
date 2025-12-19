'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import Button from './ui/Button';

interface PrintWrapperProps {
    children: React.ReactNode;
    title?: string;
    onBeforePrint?: () => void;
}

const PrintWrapper: React.FC<PrintWrapperProps> = ({
    children,
    title = 'Print Document',
    onBeforePrint
}) => {
    const handlePrint = () => {
        if (onBeforePrint) {
            onBeforePrint();
        }
        window.print();
    };

    return (
        <div>
            {/* Print Button */}
            <div className="mb-4 flex justify-end no-print">
                <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <Printer size={18} />
                    Cetak {title}
                </Button>
            </div>

            {/* Print Content */}
            <div className="print-avoid-break">
                {children}
            </div>
        </div>
    );
};

export default PrintWrapper;
