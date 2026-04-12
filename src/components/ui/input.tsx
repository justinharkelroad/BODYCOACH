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
          <label htmlFor={id} className="block text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
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
              border border-[rgba(0,0,0,0.12)]
              bg-white
              px-4 py-3
              text-[17px] text-[#1d1d1f]
              placeholder-[#aeaeb2]
              transition-all
              focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)]
              disabled:bg-[#f5f5f7] disabled:text-[#aeaeb2]
              ${error ? 'border-[#FF3B30]' : ''}
              ${suffix ? 'pr-14' : ''}
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] text-[14px] pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-[14px] text-[#FF3B30]" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
