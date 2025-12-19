import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className = ''
}) => {
    const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    const variantStyles = {
        success: 'bg-success-100 text-success-800',
        warning: 'bg-warning-yellow-100 text-warning-yellow-800',
        danger: 'bg-danger-100 text-danger-800',
        info: 'bg-primary-100 text-primary-800',
        default: 'bg-gray-100 text-gray-800',
    };

    return (
        <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
