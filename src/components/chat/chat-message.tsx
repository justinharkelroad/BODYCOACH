'use client';

import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-[var(--navy-cta)]'
            : 'bg-gradient-to-br from-[var(--primary-lavender)] to-[var(--accent-magenta)]'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[80%] rounded-[16px] px-5 py-3 ${
          isUser
            ? 'bg-[var(--navy-cta)] text-white'
            : 'bg-[var(--theme-surface)] border border-[rgba(184,169,232,0.2)] text-[var(--neutral-dark)]'
        }`}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {content}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-[var(--primary-lavender)] animate-pulse rounded-sm" />
          )}
        </div>
      </div>
    </div>
  );
}
