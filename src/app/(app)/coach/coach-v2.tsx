import Link from 'next/link';
import { Apple, ArrowRight, Dumbbell, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/v2';

const coaches = [
  {
    type: 'nutrition',
    title: 'Nutrition Coach',
    description:
      'Personalized advice on diet, meal planning, macros, and eating habits to support your fitness goals.',
    icon: Apple,
    chipBg: 'bg-[#DDF6E2]',
    chipFg: 'text-[#2EBA62]',
    examples: [
      'What should I eat before a workout?',
      'Help me plan meals for muscle gain',
      'How many calories should I eat?',
    ],
  },
  {
    type: 'workout',
    title: 'Workout Coach',
    description:
      'Customized workout plans, exercise recommendations, and training advice tailored to your goals.',
    icon: Dumbbell,
    chipBg: 'bg-[#FCE5F2]',
    chipFg: 'text-[#E94BA8]',
    examples: [
      'Create a 3-day workout split for me',
      'What exercises target my chest?',
      'How do I improve my squat form?',
    ],
  },
];

export function CoachV2() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Coaches"
        subtitle="Chat with your personal AI coaches for nutrition and workout guidance"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {coaches.map((coach) => (
          <div
            key={coach.type}
            className="rounded-3xl bg-white/95 p-6 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${coach.chipBg}`}>
              <coach.icon className={`h-6 w-6 ${coach.chipFg}`} />
            </div>
            <h2 className="mt-4 text-[18px] font-bold text-[#1d1d1f]">
              {coach.title}
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-[#6e6e73]">
              {coach.description}
            </p>

            <div className="mt-4 border-t border-[#F0F4F9] pt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#6e6e73]">
                Try asking
              </p>
              <ul className="space-y-1.5">
                {coach.examples.map((example, i) => (
                  <li
                    key={i}
                    className="rounded-xl bg-[#F7F9FC] px-3 py-2 text-[13px] text-[#1d1d1f]"
                  >
                    &ldquo;{example}&rdquo;
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={`/coach/${coach.type}`}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF6FA8] via-[#FF9966] to-[#FFD36F] px-5 py-2.5 text-[13px] font-semibold text-white shadow-md transition hover:shadow-lg"
            >
              Start chatting
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#E5F2FF]">
          <Sparkles className="h-5 w-5 text-[#3B9DFF]" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-[#1d1d1f]">
            Personalized to you
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-[#6e6e73]">
            Your AI coaches know your goals, current stats, and workout history.
            They&apos;ll give you advice tailored to your specific situation and
            progress.
          </p>
        </div>
      </div>
    </div>
  );
}
