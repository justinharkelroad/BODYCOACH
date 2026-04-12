'use client';

import Link from 'next/link';

interface FatSecretAttributionProps {
  className?: string;
  variant?: 'light' | 'dark';
}

/**
 * FatSecret Attribution Component
 * Required for FatSecret free tier - must be visible on screens showing FatSecret data
 * https://platform.fatsecret.com/api/Default.aspx?screen=rapisd
 */
export function FatSecretAttribution({
  className = '',
  variant = 'light',
}: FatSecretAttributionProps) {
  const textColor = variant === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const linkColor = variant === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900';

  return (
    <div className={`text-xs ${textColor} ${className}`}>
      Powered by{' '}
      <Link
        href="https://www.fatsecret.com"
        target="_blank"
        rel="noopener noreferrer"
        className={`underline ${linkColor} transition-colors`}
      >
        FatSecret
      </Link>
    </div>
  );
}
