import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Apple, Dumbbell, ArrowRight, Sparkles } from 'lucide-react';
import { isNewUI } from '@/lib/feature-flags';
import { CoachV2 } from './coach-v2';

export default function CoachPage() {
  if (isNewUI()) return <CoachV2 />;

  const coaches = [
    {
      type: 'nutrition',
      title: 'Nutrition Coach',
      description: 'Get personalized advice on diet, meal planning, macros, and eating habits to support your fitness goals.',
      icon: Apple,
      color: 'var(--success)',
      bgColor: 'var(--accent-mint-light)',
      examples: [
        'What should I eat before a workout?',
        'Help me plan meals for muscle gain',
        'How many calories should I eat?',
      ],
    },
    {
      type: 'workout',
      title: 'Workout Coach',
      description: 'Get customized workout plans, exercise recommendations, and training advice tailored to your goals.',
      icon: Dumbbell,
      color: 'var(--primary-deep)',
      bgColor: 'var(--primary-light)',
      examples: [
        'Create a 3-day workout split for me',
        'What exercises target my chest?',
        'How do I improve my squat form?',
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-[var(--primary-lavender)]" />
          <h1 className="text-2xl font-semibold text-[var(--neutral-dark)]">AI Coaches</h1>
        </div>
        <p className="text-[var(--neutral-gray)]">
          Chat with your personal AI coaches for nutrition and workout guidance
        </p>
      </div>

      {/* Coach Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {coaches.map((coach) => (
          <Card key={coach.type} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <div
                className="p-6 pb-4"
                style={{ background: `linear-gradient(135deg, ${coach.bgColor} 0%, white 100%)` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="p-3 rounded-[12px]"
                    style={{ backgroundColor: coach.bgColor }}
                  >
                    <coach.icon className="h-8 w-8" style={{ color: coach.color }} />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-[var(--neutral-dark)] mb-2">
                  {coach.title}
                </h2>
                <p className="text-[var(--neutral-gray)] text-sm leading-relaxed">
                  {coach.description}
                </p>
              </div>

              {/* Examples */}
              <div className="px-6 py-4 border-t border-[rgba(184,169,232,0.1)]">
                <p className="text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wide mb-3">
                  Try asking
                </p>
                <ul className="space-y-2">
                  {coach.examples.map((example, i) => (
                    <li
                      key={i}
                      className="text-sm text-[var(--neutral-dark)] bg-[var(--neutral-gray-light)] rounded-lg px-3 py-2"
                    >
                      "{example}"
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <div className="px-6 pb-6">
                <Link href={`/coach/${coach.type}`}>
                  <Button className="w-full group">
                    Start Chatting
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info */}
      <div className="bg-[var(--primary-light)] rounded-[16px] p-6">
        <div className="flex gap-4">
          <div className="p-2 bg-[var(--theme-surface)] rounded-[12px] h-fit">
            <Sparkles className="h-5 w-5 text-[var(--primary-lavender)]" />
          </div>
          <div>
            <h3 className="font-medium text-[var(--neutral-dark)] mb-1">
              Personalized to You
            </h3>
            <p className="text-sm text-[var(--neutral-gray)] leading-relaxed">
              Your AI coaches know your goals, current stats, and workout history.
              They&apos;ll give you advice tailored to your specific situation and progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
