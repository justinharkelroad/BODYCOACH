'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, suffix, id, ...props }, ref) => {
    const errorId = error && id ? `${id}-error` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={`
              block w-full rounded-[8px]
              border border-[var(--theme-border)]
              bg-[var(--theme-surface)]
              px-4 py-3
              text-[17px] text-[var(--theme-text)]
              placeholder-[var(--theme-text-muted)]
              transition-all
              focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)]
              disabled:bg-[var(--theme-bg)] disabled:text-[var(--theme-text-muted)]
              ${error ? 'border-[var(--theme-error)]' : ''}
              ${suffix ? 'pr-14' : ''}
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-secondary)] text-[14px] pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-[14px] text-[var(--theme-error)]" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
