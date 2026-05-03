'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChatMessage } from '@/components/chat/chat-message';
import { ChatInput } from '@/components/chat/chat-input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Apple, Dumbbell, Trash2, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const coachConfig = {
  nutrition: {
    title: 'Nutrition Coach',
    icon: Apple,
    color: 'var(--success)',
    bgColor: 'var(--accent-mint-light)',
    placeholder: 'Ask about diet, meals, macros, or nutrition...',
    greeting: "Hi! I'm your nutrition coach. I'm here to help you with meal planning, dietary advice, and nutrition questions tailored to your goals. What would you like to know?",
  },
  workout: {
    title: 'Workout Coach',
    icon: Dumbbell,
    color: 'var(--primary-deep)',
    bgColor: 'var(--primary-light)',
    placeholder: 'Ask about workouts, exercises, or training...',
    greeting: "Hey! I'm your workout coach. I can help you with exercise routines, workout plans, and training advice customized for your goals. What can I help you with today?",
  },
};

export default function CoachChatPage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as 'nutrition' | 'workout';

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Validate coach type. Nutrition coach is intentionally hidden from the
  // v2 product — coach selector only surfaces the workout coach now, and
  // any direct link to /coach/nutrition redirects to the picker.
  const config = coachConfig[type];
  if (!config || type === 'nutrition') {
    router.push('/coach');
    return null;
  }

  const Icon = config.icon;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add greeting on first load
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: config.greeting,
        },
      ]);
    }
  }, [config.greeting, messages.length]);

  async function handleSendMessage(content: string) {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/coach/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get response');
      }

      const data = await response.json();

      // Save conversation ID for future messages
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleClearChat() {
    setMessages([
      {
        id: 'greeting',
        role: 'assistant',
        content: config.greeting,
      },
    ]);
    setConversationId(null);
    setError(null);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.20))]">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[rgba(184,169,232,0.1)]">
        <div className="flex items-center gap-4">
          <Link href="/coach">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-[12px]"
              style={{ backgroundColor: config.bgColor }}
            >
              <Icon className="h-5 w-5" style={{ color: config.color }} />
            </div>
            <div>
              <h1 className="font-semibold text-[var(--neutral-dark)]">{config.title}</h1>
              <div className="flex items-center gap-1 text-xs text-[var(--neutral-gray)]">
                <Sparkles className="h-3 w-3" />
                Powered by AI
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearChat}
          className="text-[var(--neutral-gray)] hover:text-[var(--error)]"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
          />
        ))}

        {isLoading && (
          <ChatMessage
            role="assistant"
            content=""
            isStreaming
          />
        )}

        {error && (
          <div className="text-center py-4">
            <p className="text-sm text-[var(--error)] bg-[var(--accent-coral-light)] rounded-lg px-4 py-2 inline-block">
              {error}
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-[rgba(184,169,232,0.1)]">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder={config.placeholder}
        />
      </div>
    </div>
  );
}
