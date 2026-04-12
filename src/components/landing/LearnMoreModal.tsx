'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface LearnMoreModalProps {
  open: boolean;
  onClose: () => void;
}

export function LearnMoreModal({ open, onClose }: LearnMoreModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, message }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    onClose();
    // Reset after close animation
    setTimeout(() => {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setSubmitted(false);
      setError('');
    }, 300);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--theme-overlay-scrim)] backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-[var(--theme-surface)] rounded-[16px] max-w-[480px] w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-[24px] font-semibold text-[var(--theme-text)] tracking-tight leading-[1.14]">
                {submitted ? 'Thanks!' : "Let's connect"}
              </h2>
              <p className="text-[14px] text-[var(--theme-text-secondary)] mt-1">
                {submitted
                  ? 'Corina will reach out to you soon.'
                  : 'Tell me a bit about you and I\'ll be in touch.'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-[var(--theme-bg)] transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-[var(--theme-text-secondary)]" />
            </button>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-full bg-[rgba(52,199,89,0.1)] flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-[var(--theme-success)]" />
              </div>
              <p className="text-center text-[17px] text-[var(--theme-text)] max-w-[320px]">
                Your message has been sent. Corina will respond to you within 24 hours.
              </p>
              <button
                onClick={handleClose}
                className="mt-6 px-6 py-2.5 text-[14px] font-normal text-[var(--theme-primary-dark)] hover:underline"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5">
                    First name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="block w-full rounded-[8px] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-2.5 text-[15px] text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="block w-full rounded-[8px] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-2.5 text-[15px] text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-[8px] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-2.5 text-[15px] text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5">
                  Phone number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full rounded-[8px] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-2.5 text-[15px] text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5">
                  Tell me more about why you&apos;re interested
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="block w-full rounded-[8px] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-2.5 text-[15px] text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)] resize-none"
                />
              </div>

              {error && (
                <p className="text-[14px] text-[var(--theme-error)]">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-[8px] text-[17px] font-normal text-white bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
