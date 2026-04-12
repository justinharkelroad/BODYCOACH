'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Heart, MessageCircle, Check, Scale,
  Dumbbell, Flame, Droplets, Clock, Sparkles, Star, Rocket,
  ArrowRight, ArrowLeft, Trophy,
} from 'lucide-react';

// ============================================================
// Static data
// ============================================================

const proteinSources = [
  'Chicken Breast', 'Ground Turkey (93/7 or 99/1)', 'Ground Sirloin (90/10 or 96/4)',
  'Ground Bison', 'Venison', 'Salmon', 'Halibut', 'Shrimp',
  'Eggs', 'Egg Whites', 'Plain Greek Yogurt', 'Cottage Cheese', 'Protein Powder',
];

const veganProteinSources = [
  'Black Beans', 'Beyond Burger', 'Walnuts', 'Pistachios', 'Almonds',
  'Edamame', 'Chickpeas', 'Quinoa', 'Lentils', 'Tofu',
  'Tempeh', 'Buckwheat', 'Flaxseed', 'Chia Seeds',
];

const carbSources = [
  'Sweet Potato', 'Red Potato', 'Oatmeal', 'Brown Rice', 'Jasmine Rice',
  'Beans', 'Lentils', 'Quinoa', 'Couscous', 'Pumpkin',
  'Squash', 'Beets', 'Berries', 'Bananas', 'Asparagus',
  'Kale', 'Zucchini', 'Mushrooms', 'Green Beans', 'Peas',
  'Peppers', 'Cauliflower', 'Carrots', 'Cucumbers', 'Apples',
];

const fatSources = [
  'Avocados', 'Flaxseed', 'Almonds', 'Olive Oil', 'Coconut Oil',
  'Avocado Oil', 'Walnuts', 'Salmon', 'Pecans', 'Cashews',
  'Ghee', 'Nut Butter',
];

const needItems = [
  { name: 'Food Scale', detail: 'Weigh all foods and oils before logging. Meats can be measured before or after cooking if consistent. Grains in grams, oils in mL.' },
  { name: 'Body Tape Measure', detail: 'Measure to nearest 0.01 cm in flexed position — hips, left/right bicep, left/right thigh, and waist at belly button.' },
  { name: 'Progress Photos', detail: 'Front, side, and back views. Wear the same clothes each time for accurate comparison.' },
  { name: 'MyFitnessPal Account', detail: 'Log all food to track your daily intake.' },
  { name: 'Body Weight Scale', detail: 'Use the same scale every time. Weigh yourself fasted, first thing in the morning.' },
];

const timingPhases = [
  { label: 'Pre-Workout', time: '90 min before', detail: 'Eat 20g+ protein with a quality carb — oats and blueberries work great.' },
  { label: 'Post-Workout', time: 'Immediately after', detail: 'Protein shake with 20–30g protein plus a carb. No added fat — a banana is perfect.' },
  { label: 'Post-Post-Workout', time: '60–90 min later', detail: 'Full meal with protein, carbs, and fat.' },
  { label: 'Fasted Training', time: 'Before eating', detail: '12–24 oz water plus optional pre-workout or caffeine. Electrolytes recommended.' },
];

const supplements = [
  { name: 'Multivitamin', detail: 'Take a multivitamin of your choice for comprehensive micronutrient coverage.' },
  { name: 'Fish Oil', detail: 'Supports heart health, reduces inflammation, and aids joint recovery.' },
  { name: 'Magnesium', detail: 'Take before bed. Aids sleep, recovery, and reduces inflammation.' },
  { name: 'EAAs (Essential Amino Acids)', detail: 'Ideal for intra-workout hydration, especially if training fasted.' },
];

const successTips = [
  'Communication is key — keep me in the loop at all times.',
  'Your plan is personalized to your goals and lifestyle.',
  'Keep me updated on vacations and events so I can make adjustments.',
  'Perfection is not expected — consistency is what matters.',
  'Communicate during both good and bad times so I can make accurate adjustments.',
];

// ============================================================
// Helpers
// ============================================================

function FoodGrid({ items }: { items: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
      {items.map((item) => (
        <div key={item} className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] flex-shrink-0" />
          <span className="text-[14px] text-[var(--theme-text)]">{item}</span>
        </div>
      ))}
    </div>
  );
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[8px] px-4 py-3 text-[14px] text-[var(--theme-text-secondary)] leading-relaxed bg-[var(--theme-bg)] border-l-3 border-[var(--theme-primary)]" style={{ borderLeftWidth: 3, borderLeftColor: '#0071e3' }}>
      {children}
    </div>
  );
}

// ============================================================
// Component
// ============================================================

export default function WelcomePage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const touchStartRef = useRef<number | null>(null);

  const TOTAL_SLIDES = 11;
  const progress = ((currentSlide + 1) / TOTAL_SLIDES) * 100;

  const handleNext = () => { if (currentSlide < TOTAL_SLIDES - 1) setCurrentSlide((s) => s + 1); };
  const handleBack = () => { if (currentSlide > 0) setCurrentSlide((s) => s - 1); };
  const handleSkip = () => setCurrentSlide(TOTAL_SLIDES - 1);

  const handleComplete = async () => {
    setIsCompleting(true);

    // Set cookie first so middleware won't redirect back here
    document.cookie = 'welcome_completed=1; path=/; max-age=31536000; samesite=lax';

    // Try to update the DB, but don't block on it
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ welcome_completed: true }).eq('id', user.id);
      }
    } catch {
      // Ignore — cookie is set, user can proceed
    }

    // Full page reload to dashboard — picks up auth cookies properly
    window.location.href = '/dashboard';
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartRef.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const delta = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) { delta > 0 ? handleNext() : handleBack(); }
    touchStartRef.current = null;
  };

  const CARD = 'rounded-[12px] p-5 sm:p-6 bg-[var(--theme-surface)] border border-[var(--theme-border)]';

  const slides: { Icon: typeof Heart; title: string; content: React.ReactNode }[] = [
    // 0 — Welcome
    {
      Icon: Heart,
      title: 'Welcome to Standard Nutrition',
      content: (
        <div className={`${CARD} space-y-4`}>
          <p className="text-[17px] text-[var(--theme-text)] leading-relaxed">
            I am a mother of 3, a wife, fitness competitor, and have found my purpose
            in life by helping people reach their health and fitness goals.
          </p>
          <p className="text-[17px] text-[var(--theme-text)] leading-relaxed">
            I am a graduate from Indiana University-Bloomington where I studied
            Telecommunications and Business. I found Personal Training later in life
            after getting my own health back after kids.
          </p>
          <p className="text-[17px] text-[var(--theme-text)] leading-relaxed">
            I was pre-diabetic and heading down a path of sickness. I was tired all the
            time and had little energy to even take care of my three kids. Exercise saved
            my life and eating the right foods gave me the energy I needed to fuel my body.
          </p>
          <div className="pt-4 border-t border-[var(--theme-border)] text-right">
            <p className="italic text-[17px] font-medium text-[var(--theme-primary)]">Your Coach — Corina</p>
          </div>
        </div>
      ),
    },

    // 1 — How Coaching Works
    {
      Icon: MessageCircle,
      title: 'How Coaching Works',
      content: (
        <div className={`${CARD} space-y-4`}>
          <p className="text-[17px] text-[var(--theme-text)] leading-relaxed">
            I provide direction, accountability, and support. I hold you
            accountable and keep you on track to achieve your goals in a healthy and
            sustainable way.
          </p>
          <p className="text-[17px] text-[var(--theme-text)] leading-relaxed">
            Communication is available anytime through text messaging. I will respond within 24 hours.
          </p>
          <div className="pt-3 border-t border-[var(--theme-border)]">
            <p className="text-[14px] font-semibold text-[var(--theme-text)] mb-3">
              I make macro &amp; calorie adjustments based on:
            </p>
            <div className="space-y-2">
              {['Daily & weekly weight trends', 'Monthly girth measurements', 'Consistency with targets', 'Intake tracked in MyFitnessPal'].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] flex-shrink-0" />
                  <span className="text-[14px] text-[var(--theme-text-secondary)]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },

    // 2 — Check-Ins
    {
      Icon: Check,
      title: 'Check-Ins',
      content: (
        <div className={`${CARD} space-y-3`}>
          <h3 className="font-semibold text-[17px] text-[var(--theme-text)]">Virtual Check-Ins</h3>
          <p className="text-[14px] text-[var(--theme-text-secondary)] leading-relaxed">
            Virtual check-ins are sent within 24 hours of receiving your check-in form. Each check-in requires:
          </p>
          <div className="space-y-2 pl-1">
            {['Completed food journal', 'Most current weigh-in', 'Measurements (if due)', 'Any other relevant progress info'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[var(--theme-success)] flex-shrink-0" />
                <span className="text-[14px] text-[var(--theme-text)]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // 3 — What You'll Need
    {
      Icon: Scale,
      title: "What You'll Need",
      content: (
        <div className={CARD}>
          <div className="space-y-4">
            {needItems.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0 text-[12px] font-bold mt-0.5 bg-[rgba(0,113,227,0.08)] text-[var(--theme-primary)]">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-[14px] text-[var(--theme-text)]">{item.name}</h4>
                  <p className="text-[12px] text-[var(--theme-text-secondary)] mt-0.5 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // 4 — Protein Options
    {
      Icon: Dumbbell,
      title: 'Protein Options',
      content: (
        <div className="space-y-4">
          <div className={CARD}><FoodGrid items={proteinSources} /></div>
          <InfoNote>
            <p>Wild caught fish, lean meats, grass-fed beef, and free range chicken are preferred but not required.</p>
          </InfoNote>
          <div className={`${CARD} space-y-3`}>
            <h3 className="font-semibold text-[14px] text-[var(--theme-success)]">Vegan Protein</h3>
            <FoodGrid items={veganProteinSources} />
          </div>
        </div>
      ),
    },

    // 5 — Carb Options
    {
      Icon: Flame,
      title: 'Carb Options',
      content: (
        <div className="space-y-4">
          <div className={CARD}><FoodGrid items={carbSources} /></div>
          <InfoNote>
            <p>Focus on minimally processed or unprocessed carbs. Avoid breads, pastas, and pastries — they have a high glycemic index.</p>
          </InfoNote>
        </div>
      ),
    },

    // 6 — Healthy Fats
    {
      Icon: Droplets,
      title: 'Healthy Fats',
      content: (
        <div className="space-y-4">
          <div className={CARD}><FoodGrid items={fatSources} /></div>
          <InfoNote>
            <p>Fat is the most calorie-dense macro but is essential for hormone production, nerve insulation, and brain function. Essential fatty acids (EFAs) must come from your diet.</p>
          </InfoNote>
        </div>
      ),
    },

    // 7 — Nutrient Timing
    {
      Icon: Clock,
      title: 'Nutrient Timing',
      content: (
        <div className="space-y-3">
          {timingPhases.map((phase) => (
            <div key={phase.label} className="rounded-[12px] p-4 bg-[var(--theme-surface)] border border-[var(--theme-border)]">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-[14px] text-[var(--theme-text)]">{phase.label}</h4>
                <span className="text-[12px] text-[var(--theme-text-secondary)]">{phase.time}</span>
              </div>
              <p className="text-[14px] text-[var(--theme-text-secondary)] leading-relaxed">{phase.detail}</p>
            </div>
          ))}
        </div>
      ),
    },

    // 8 — Supplement Suggestions
    {
      Icon: Sparkles,
      title: 'Supplement Suggestions',
      content: (
        <div className="space-y-3">
          <InfoNote><p className="italic">These are suggested, not required.</p></InfoNote>
          {supplements.map((supp) => (
            <div key={supp.name} className="rounded-[12px] p-4 bg-[var(--theme-surface)] border border-[var(--theme-border)]">
              <h4 className="font-semibold text-[14px] text-[var(--theme-primary)] mb-1">{supp.name}</h4>
              <p className="text-[14px] text-[var(--theme-text-secondary)] leading-relaxed">{supp.detail}</p>
            </div>
          ))}
        </div>
      ),
    },

    // 9 — Tips for Success
    {
      Icon: Star,
      title: 'Tips for Success',
      content: (
        <div className={CARD}>
          <div className="space-y-3">
            {successTips.map((tip) => (
              <div key={tip} className="flex gap-3 items-start">
                <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-[var(--theme-primary)]" />
                <p className="text-[14px] text-[var(--theme-text)] leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // 10 — Let's Go!
    {
      Icon: Rocket,
      title: "Let's Go!",
      content: (
        <div className="text-center space-y-6 pt-4">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-[var(--theme-success)]">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-3">
            <h2 className="text-[28px] font-semibold text-[var(--theme-text)] tracking-tight">You&apos;re All Set!</h2>
            <p className="text-[17px] text-[var(--theme-text-secondary)] max-w-xs mx-auto leading-relaxed">
              I&apos;m ready to guide you every step of the way. Let&apos;s make it happen.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const slide = slides[currentSlide];

  return (
    <div
      className="-m-4 sm:-m-6 lg:-m-10 min-h-screen flex flex-col select-none bg-[var(--theme-bg)]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress Bar */}
      <div className="flex-shrink-0 px-5 pt-5 sm:px-8 sm:pt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-medium text-[var(--theme-text-secondary)]">
            {currentSlide + 1} of {TOTAL_SLIDES}
          </span>
          {currentSlide < TOTAL_SLIDES - 1 && (
            <button
              onClick={handleSkip}
              className="text-[12px] font-medium text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] transition-colors"
            >
              Skip
            </button>
          )}
        </div>
        <div className="h-1 bg-[var(--theme-hover-subtle)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out bg-[var(--theme-primary)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 overflow-y-auto min-h-0 px-5 py-6 sm:px-8">
        <div
          key={currentSlide}
          className="max-w-lg mx-auto animate-fade-in-up"
        >
          {/* Icon */}
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 bg-[rgba(0,113,227,0.08)]">
            <slide.Icon className="h-7 w-7 text-[var(--theme-primary)]" />
          </div>

          {/* Title */}
          <h1 className="text-[28px] font-semibold text-[var(--theme-text)] text-center mb-6 tracking-tight leading-[1.14]">
            {slide.title}
          </h1>

          {/* Body */}
          {slide.content}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 px-5 pb-5 sm:px-8 sm:pb-6">
        <div className="max-w-lg mx-auto">
          {currentSlide === TOTAL_SLIDES - 1 ? (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className="w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-[980px] text-[17px] font-normal text-white bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] transition-colors disabled:opacity-50"
            >
              {isCompleting ? 'Starting...' : <>Get Started <ArrowRight className="h-5 w-5" /></>}
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentSlide === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-[980px] text-[14px] text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-hover-subtle)] transition-all disabled:opacity-0 disabled:pointer-events-none"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 rounded-[980px] text-[14px] font-normal text-white bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] transition-colors"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
