'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center font-medium rounded-[8px]
      transition-all duration-200 ease-out
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:ring-offset-2
    `;

    const variants = {
      primary: `
        v2-cta-btn
        bg-[var(--theme-primary)] text-white
        hover:bg-[var(--theme-primary-dark)]
      `,
      secondary: `
        bg-transparent text-[var(--theme-primary)]
        border border-[var(--theme-primary)]
        hover:bg-[rgba(0,113,227,0.06)]
      `,
      ghost: `
        bg-transparent text-[var(--theme-primary)]
        hover:bg-[rgba(0,113,227,0.06)]
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-[14px]',
      md: 'px-5 py-2.5 text-[17px]',
      lg: 'px-8 py-3.5 text-[17px]',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
