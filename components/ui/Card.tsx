import React from 'react';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'outlined';
    className?: string;
}

const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    className = ''
}) => {
    const baseStyles = 'rounded-lg bg-white smooth-transition';

    const variantStyles = {
        default: 'border border-gray-200',
        elevated: 'card-shadow-lg',
        outlined: 'border-2 border-primary-200',
    };

    return (
        <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
