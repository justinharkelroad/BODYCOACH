'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import type { GoalType, ActivityLevel, Sex } from '@/types/database';

import {
  calculateNutritionTargets,
  lbsToKg,
  feetInchesToCm,
  type UserProfile,
  type CalculationResult,
  type Goal,
} from '@/features/calculator/utils/calculations';
import {
  Target, Flame, TrendingUp, TrendingDown, Check, ArrowRight, ArrowLeft,
  Sparkles, Dumbbell, User, Scale, Trophy, Baby, Minus,
  Activity, Sofa, PersonStanding, Zap, Medal, AlertCircle
} from 'lucide-react';

// Map internal goal type to database goal type
const goalToDbGoal: Record<Goal, GoalType> = {
  lose_fat: 'lose_fat',
  maintain: 'maintain',
  gain_muscle: 'gain_muscle',
};

const activityLevels: {
  value: ActivityLevel;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    description: 'Desk job, minimal movement',
    icon: <Sofa className="h-6 w-6" />,
  },
  {
    value: 'light',
    label: 'Lightly Active',
    description: 'Walking, light activity 1-2x/week',
    icon: <PersonStanding className="h-6 w-6" />,
  },
  {
    value: 'moderate',
    label: 'Moderately Active',
    description: 'Exercise 3-5x/week',
    icon: <Activity className="h-6 w-6" />,
  },
  {
    value: 'active',
    label: 'Very Active',
    description: 'Intense exercise 6-7x/week',
    icon: <Zap className="h-6 w-6" />,
  },
  {
    value: 'athlete',
    label: 'Athlete',
    description: 'Training 2x per day',
    icon: <Medal className="h-6 w-6" />,
  },
];

const goals: {
  value: Goal;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: 'lose_fat',
    label: 'Lose Fat',
    description: 'Reduce body fat while keeping muscle',
    icon: <TrendingDown className="h-6 w-6" />,
    color: 'var(--accent-coral)',
  },
  {
    value: 'maintain',
    label: 'Maintain',
    description: 'Stay where I am, build healthy habits',
    icon: <Minus className="h-6 w-6" />,
    color: 'var(--primary-deep)',
  },
  {
    value: 'gain_muscle',
    label: 'Build Muscle',
    description: 'Gain strength and lean mass',
    icon: <TrendingUp className="h-6 w-6" />,
    color: 'var(--success)',
  },
];

const steps = [
  { id: 1, title: 'Basics', icon: User },
  { id: 2, title: 'Activity', icon: Flame },
  { id: 3, title: 'Goal', icon: Target },
  { id: 4, title: 'Special', icon: Baby },
  { id: 5, title: 'Results', icon: Scale },
  { id: 6, title: 'Confirm', icon: Check },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();


  const [step, setStep] = useState(0); // 0 = intro
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [sex, setSex] = useState<Sex>('female');
  const [age, setAge] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('lose_fat');
  const [isBreastfeeding, setIsBreastfeeding] = useState(false);
  const [breastfeedingSessions, setBreastfeedingSessions] = useState(6);
  const [postpartumWeeks, setPostpartumWeeks] = useState('');

  // Adjustable targets (user can modify on confirmation screen)
  const [adjustedCalories, setAdjustedCalories] = useState<number | null>(null);
  const [adjustedProtein, setAdjustedProtein] = useState<number | null>(null);
  const [adjustedCarbs, setAdjustedCarbs] = useState<number | null>(null);
  const [adjustedFat, setAdjustedFat] = useState<number | null>(null);

  // Calculate results
  const calculationResult = useMemo<CalculationResult | null>(() => {
    const weightNum = parseFloat(currentWeight);
    const ageNum = parseInt(age);
    const feet = parseInt(heightFeet) || 0;
    const inches = parseInt(heightInches) || 0;

    if (!weightNum || !ageNum || (!feet && !inches)) {
      return null;
    }

    const profile: UserProfile = {
      weightKg: lbsToKg(weightNum),
      heightCm: feetInchesToCm(feet, inches),
      age: ageNum,
      sex,
      activityLevel,
      goal,
      isBreastfeeding: sex === 'female' ? isBreastfeeding : false,
      breastfeedingSessions: isBreastfeeding ? breastfeedingSessions : 0,
      postpartumWeeks: postpartumWeeks ? parseInt(postpartumWeeks) : undefined,
    };

    return calculateNutritionTargets(profile);
  }, [currentWeight, age, heightFeet, heightInches, sex, activityLevel, goal, isBreastfeeding, breastfeedingSessions, postpartumWeeks]);

  // Set initial adjusted values when calculation changes (rounded for user input)
  useEffect(() => {
    if (calculationResult) {
      setAdjustedCalories(Math.round(calculationResult.targetCalories));
      setAdjustedProtein(Math.round(calculationResult.macros.protein));
      setAdjustedCarbs(Math.round(calculationResult.macros.carbs));
      setAdjustedFat(Math.round(calculationResult.macros.fat));
    }
  }, [calculationResult]);

  // Recalculate macros when user adjusts calories (35/30/35 split)
  const recalculateMacrosFromCalories = (calories: number) => {
    const protein = Math.round((calories * 0.35) / 4);  // 35% protein, 4 cal/g
    const carbs = Math.round((calories * 0.35) / 4);    // 35% carbs, 4 cal/g
    const fat = Math.round((calories * 0.30) / 9);      // 30% fat, 9 cal/g
    setAdjustedProtein(protein);
    setAdjustedCarbs(carbs);
    setAdjustedFat(fat);
  };

  // Auto-advance from intro after animation
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => setStep(1), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Determine which steps to show (skip pace for maintain, skip special for males)
  const getVisibleSteps = () => {
    const visible = [...steps];
    return visible;
  };

  // Step 4 (Special) only shows for females
  const shouldShowSpecialStep = sex === 'female';

  const getNextStep = (currentStep: number): number => {
    // After Goal (step 3), skip Special (step 4) for males
    if (currentStep === 3 && !shouldShowSpecialStep) {
      return 5; // Go directly to Results
    }
    return currentStep + 1;
  };

  const getPreviousStep = (currentStep: number): number => {
    // Before Results (step 5), skip Special (step 4) for males
    if (currentStep === 5 && !shouldShowSpecialStep) {
      return 3; // Go back to Goal
    }
    return currentStep - 1;
  };

  // Get effective step count (excluding skipped steps)
  const getEffectiveSteps = () => {
    return shouldShowSpecialStep ? 6 : 5;
  };

  async function handleComplete() {
    setIsLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }

    if (!calculationResult) {
      setError('Calculation error');
      setIsLoading(false);
      return;
    }

    // Convert to metric for storage
    const weightKg = lbsToKg(parseFloat(currentWeight));
    const heightCm = feetInchesToCm(parseInt(heightFeet) || 0, parseInt(heightInches) || 0);
    const totalHeightIn = (parseInt(heightFeet) || 0) * 12 + (parseInt(heightInches) || 0);

    // Update profile with all TDEE data (round to integers for db)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        sex,
        age: parseInt(age),
        height_in: totalHeightIn || null,
        goal: goalToDbGoal[goal],
        activity_level: activityLevel,
        is_breastfeeding: sex === 'female' ? isBreastfeeding : false,
        breastfeeding_sessions: isBreastfeeding ? breastfeedingSessions : null,
        postpartum_weeks: postpartumWeeks ? parseInt(postpartumWeeks) : null,
        bmr: Math.round(calculationResult.bmr),
        tdee: Math.round(calculationResult.tdee),
        adjusted_tdee: Math.round(calculationResult.adjustedTdee),
        target_calories: adjustedCalories || Math.round(calculationResult.targetCalories),
        target_protein: adjustedProtein || Math.round(calculationResult.macros.protein),
        target_carbs: adjustedCarbs || Math.round(calculationResult.macros.carbs),
        target_fat: adjustedFat || Math.round(calculationResult.macros.fat),
        deficit_surplus: Math.round(calculationResult.deficit),
        expected_weekly_change: Math.round(calculationResult.weeklyChange * 10) / 10,
        input_weight_kg: weightKg,
        input_height_cm: heightCm,
        calculation_date: new Date().toISOString(),
        onboarding_completed: true,
      })
      .eq('id', user.id);

    if (profileError) {
      setError(profileError.message);
      setIsLoading(false);
      return;
    }

    // Log initial weight
    if (currentWeight) {
      await supabase.from('body_stats').insert({
        user_id: user.id,
        weight_lbs: parseFloat(currentWeight),
      });
    }

    // Set cookie so middleware skips DB check on future navigations
    document.cookie = 'onboarding_completed=1; path=/; max-age=31536000; samesite=lax';

    // Show completion screen
    setIsComplete(true);

    // Redirect to welcome walkthrough
    setTimeout(() => {
      router.push('/onboarding/welcome');
      router.refresh();
    }, 2500);
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return fullName.trim().length >= 2 && age && currentWeight && (heightFeet || heightInches);
      case 2:
        return !!activityLevel;
      case 3:
        return !!goal;
      case 4:
        return true; // Special circumstances step (females only) is optional
      case 5:
        return !!calculationResult; // Results
      case 6:
        return !!calculationResult; // Confirmation
      default:
        return true;
    }
  };

  // Intro Animation Screen
  if (step === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--theme-bg)]">
        <div className="text-center animate-fade-in">
          <Logo className="h-12 w-auto mx-auto mb-3" />
          <p className="text-[17px] text-[var(--theme-text-secondary)]">Let&apos;s set up your personalized targets</p>
        </div>
      </div>
    );
  }

  // Completion Screen
  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--theme-bg)]">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--theme-success)] mb-6">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-[var(--theme-text)] mb-2">
            You&apos;re all set, {fullName.split(' ')[0]}!
          </h1>
          <p className="text-[var(--theme-text-secondary)] text-lg mb-4">Your personalized plan is ready</p>
          <div className="flex items-center justify-center gap-2 text-[var(--theme-primary-dark)]">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="font-medium">Welcome to Standard Nutrition</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col py-8 px-4 bg-[var(--theme-bg)]">
      <div className="max-w-lg w-full mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <Logo className="h-7 w-auto mx-auto" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-1 mb-8 flex-wrap">
          {getVisibleSteps().map((s, index) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            // Skip Special step (4) for males
            const isSkipped = s.id === 4 && !shouldShowSpecialStep;

            if (isSkipped) return null;

            return (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => step > s.id && setStep(s.id)}
                  disabled={step <= s.id}
                  className={`
                    flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300
                    ${isActive
                      ? 'bg-[var(--theme-primary-dark)] text-white scale-110 shadow-lg'
                      : isCompleted
                        ? 'bg-[var(--theme-success)] text-white cursor-pointer hover:scale-105'
                        : 'bg-[var(--theme-bg-alt)] text-[var(--theme-text-muted)]'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </button>
                {index < getVisibleSteps().filter(s => !(s.id === 4 && !shouldShowSpecialStep)).length - 1 && (
                  <div className={`w-4 h-1 mx-0.5 rounded-full transition-colors duration-300 ${step > s.id ? 'bg-[var(--theme-success)]' : 'bg-[var(--theme-bg-alt)]'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="flex-1 flex flex-col">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <Card className="flex-1 flex flex-col animate-slide-in">
              <CardHeader className="text-center pb-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--theme-primary-light)] mx-auto mb-4">
                  <User className="h-8 w-8 text-[var(--theme-primary-dark)]" />
                </div>
                <CardTitle className="text-2xl text-[var(--theme-text)]">Tell us about yourself</CardTitle>
                <p className="text-[var(--theme-text-secondary)]">We&apos;ll use this to calculate your targets</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-5 py-4">
                  <Input
                    id="fullName"
                    label="What should we call you?"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoFocus
                  />

                  {/* Sex Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
                      Biological Sex
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['female', 'male'] as Sex[]).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setSex(s);
                          }}
                          className={`
                            flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all
                            ${sex === s
                              ? 'border-[var(--theme-primary)] bg-[var(--theme-primary-light)]'
                              : 'border-[var(--theme-border)] hover:border-[var(--theme-primary-light)]'
                            }
                          `}
                        >
                          <span className="font-medium text-[var(--theme-text)] capitalize">{s}</span>
                          {sex === s && <Check className="h-4 w-4 text-[var(--theme-primary-dark)]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input
                    id="age"
                    type="number"
                    label="Age"
                    placeholder="30"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />

                  {/* Height */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
                      Height
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Input
                          id="heightFeet"
                          type="number"
                          placeholder="5"
                          value={heightFeet}
                          onChange={(e) => setHeightFeet(e.target.value)}
                        />
                        <span className="text-xs text-[var(--theme-text-muted)] mt-1 block text-center">feet</span>
                      </div>
                      <div className="flex-1">
                        <Input
                          id="heightInches"
                          type="number"
                          placeholder="6"
                          value={heightInches}
                          onChange={(e) => setHeightInches(e.target.value)}
                        />
                        <span className="text-xs text-[var(--theme-text-muted)] mt-1 block text-center">inches</span>
                      </div>
                    </div>
                  </div>

                  <Input
                    id="weight"
                    type="number"
                    label="Current Weight"
                    placeholder="150"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    suffix="lbs"
                  />
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full"
                  disabled={!canProceed()}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Activity Level */}
          {step === 2 && (
            <Card className="flex-1 flex flex-col animate-slide-in">
              <CardHeader className="text-center pb-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--theme-warning)]/20 mx-auto mb-4">
                  <Flame className="h-8 w-8 text-[var(--theme-warning)]" />
                </div>
                <CardTitle className="text-2xl text-[var(--theme-text)]">Activity Level</CardTitle>
                <p className="text-[var(--theme-text-secondary)]">How active are you typically?</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-2 py-4">
                  {activityLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setActivityLevel(level.value)}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200
                        ${activityLevel === level.value
                          ? 'border-[var(--theme-primary)] bg-[var(--theme-primary-light)]'
                          : 'border-[var(--theme-border)] hover:border-[var(--theme-primary-light)]'
                        }
                      `}
                    >
                      <div className={`p-2 rounded-lg ${activityLevel === level.value ? 'bg-[var(--theme-primary-dark)] text-white' : 'bg-[var(--theme-bg-alt)] text-[var(--theme-text-muted)]'}`}>
                        {level.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-[var(--theme-text)]">{level.label}</div>
                        <div className="text-sm text-[var(--theme-text-secondary)]">{level.description}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${activityLevel === level.value ? 'border-[var(--theme-primary-dark)] bg-[var(--theme-primary-dark)]' : 'border-[var(--theme-border)]'}`}>
                        {activityLevel === level.value && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1" disabled={!canProceed()}>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Goal */}
          {step === 3 && (
            <Card className="flex-1 flex flex-col animate-slide-in">
              <CardHeader className="text-center pb-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--theme-primary-light)] mx-auto mb-4">
                  <Target className="h-8 w-8 text-[var(--theme-primary-dark)]" />
                </div>
                <CardTitle className="text-2xl text-[var(--theme-text)]">Your Goal</CardTitle>
                <p className="text-[var(--theme-text-secondary)]">What do you want to achieve?</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-3 py-4">
                  {goals.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGoal(g.value)}
                      className={`
                        w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200
                        ${goal === g.value
                          ? 'border-[var(--theme-primary)] bg-[var(--theme-primary-light)] shadow-md'
                          : 'border-[var(--theme-border)] hover:border-[var(--theme-primary-light)] hover:bg-[var(--theme-bg-alt)]'
                        }
                      `}
                    >
                      <div
                        className={`p-3 rounded-xl transition-colors ${goal === g.value ? 'text-white' : 'text-[var(--theme-text-muted)]'}`}
                        style={{ backgroundColor: goal === g.value ? g.color : 'var(--theme-bg-alt)' }}
                      >
                        {g.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[var(--theme-text)]">{g.label}</div>
                        <div className="text-sm text-[var(--theme-text-secondary)]">{g.description}</div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${goal === g.value ? 'border-[var(--theme-primary-dark)] bg-[var(--theme-primary-dark)]' : 'border-[var(--theme-border)]'}`}>
                        {goal === g.value && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => setStep(getNextStep(3))} className="flex-1" disabled={!canProceed()}>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Special Circumstances (for women) */}
          {step === 4 && shouldShowSpecialStep && (
            <Card className="flex-1 flex flex-col animate-slide-in">
              <CardHeader className="text-center pb-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--theme-secondary-light)] mx-auto mb-4">
                  <Baby className="h-8 w-8 text-[var(--theme-secondary)]" />
                </div>
                <CardTitle className="text-2xl text-[var(--theme-text)]">Special Circumstances</CardTitle>
                <p className="text-[var(--theme-text-secondary)]">Help us personalize your plan</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-6 py-4">
                  {/* Breastfeeding Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--theme-text)] mb-3">
                      Are you currently breastfeeding?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ value: true, label: 'Yes' }, { value: false, label: 'No' }].map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => setIsBreastfeeding(opt.value)}
                          className={`
                            flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all
                            ${isBreastfeeding === opt.value
                              ? 'border-[var(--theme-primary)] bg-[var(--theme-primary-light)]'
                              : 'border-[var(--theme-border)] hover:border-[var(--theme-primary-light)]'
                            }
                          `}
                        >
                          <span className="font-medium text-[var(--theme-text)]">{opt.label}</span>
                          {isBreastfeeding === opt.value && <Check className="h-4 w-4 text-[var(--theme-primary-dark)]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Breastfeeding Sessions */}
                  {isBreastfeeding && (
                    <div className="animate-fade-in">
                      <label className="block text-sm font-medium text-[var(--theme-text)] mb-3">
                        Nursing/pumping sessions per day: <span className="text-[var(--theme-primary-dark)]">{breastfeedingSessions}</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="12"
                        value={breastfeedingSessions}
                        onChange={(e) => setBreastfeedingSessions(parseInt(e.target.value))}
                        className="w-full h-2 bg-[var(--theme-bg-alt)] rounded-lg appearance-none cursor-pointer"
                        style={{ accentColor: 'var(--theme-primary-dark)' }}
                      />
                      <div className="flex justify-between text-xs text-[var(--theme-text-muted)] mt-1">
                        <span>1</span>
                        <span>12</span>
                      </div>
                      <p className="text-sm text-[var(--theme-text-secondary)] mt-2">
                        This adds ~{breastfeedingSessions * 40} extra calories to your daily target.
                      </p>
                    </div>
                  )}

                  {/* Postpartum Weeks */}
                  <Input
                    id="postpartumWeeks"
                    type="number"
                    label="Weeks postpartum (optional)"
                    placeholder="e.g., 12"
                    value={postpartumWeeks}
                    onChange={(e) => setPostpartumWeeks(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(3)} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => setStep(5)} className="flex-1">
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Results */}
          {step === 5 && calculationResult && (
            <Card className="flex-1 flex flex-col animate-slide-in">
              <CardHeader className="text-center pb-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--theme-success)]/10 mx-auto mb-4">
                  <Scale className="h-8 w-8 text-[var(--theme-success)]" />
                </div>
                <CardTitle className="text-2xl text-[var(--theme-text)]">Your Personalized Targets</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-5 py-4">
                  {/* Big Calorie Number - show exact value */}
                  <div className="text-center p-6 rounded-2xl" style={{ background: 'var(--theme-gradient-card)' }}>
                    <div className="text-5xl font-bold text-[var(--theme-primary-dark)]">
                      {Math.round(calculationResult.targetCalories).toLocaleString()}
                    </div>
                    <div className="text-[var(--theme-text-secondary)] font-medium">calories/day</div>
                    <div className="text-xs text-[var(--theme-text-muted)] mt-1">
                      (exact: {calculationResult.targetCalories.toFixed(1)})
                    </div>
                  </div>

                  {/* Macro Breakdown - show exact values */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-[var(--theme-text)]">Daily Macros</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[var(--theme-info)]/10 p-3 rounded-xl text-center">
                        <div className="text-2xl font-bold text-[var(--theme-info)]">{Math.round(calculationResult.macros.protein)}g</div>
                        <div className="text-xs text-[var(--theme-info)]">Protein</div>
                        <div className="text-xs text-[var(--theme-info)]/70">
                          ({calculationResult.macros.protein.toFixed(1)}g)
                        </div>
                      </div>
                      <div className="bg-[var(--theme-warning)]/10 p-3 rounded-xl text-center">
                        <div className="text-2xl font-bold text-[var(--theme-warning)]">{Math.round(calculationResult.macros.carbs)}g</div>
                        <div className="text-xs text-[var(--theme-warning)]">Carbs</div>
                        <div className="text-xs text-[var(--theme-warning)]/70">
                          ({calculationResult.macros.carbs.toFixed(1)}g)
                        </div>
                      </div>
                      <div className="bg-[var(--theme-secondary)]/10 p-3 rounded-xl text-center">
                        <div className="text-2xl font-bold text-[var(--theme-secondary)]">{Math.round(calculationResult.macros.fat)}g</div>
                        <div className="text-xs text-[var(--theme-secondary)]">Fat</div>
                        <div className="text-xs text-[var(--theme-secondary)]/70">
                          ({calculationResult.macros.fat.toFixed(1)}g)
                        </div>
                      </div>
                    </div>
                    {/* Macro split explanation */}
                    <p className="text-xs text-[var(--theme-text-muted)] text-center">
                      Split: 35% protein / 30% fat / 35% carbs
                    </p>
                  </div>


                  {/* Warnings */}
                  {calculationResult.warnings.length > 0 && (
                    <div className="bg-[var(--theme-warning)]/10 border border-[var(--theme-warning)]/30 p-4 rounded-xl">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-[var(--theme-warning)] flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          {calculationResult.warnings.map((warning, i) => (
                            <p key={i} className="text-sm text-[var(--theme-text-secondary)]">{warning}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TDEE Breakdown (smaller) - show exact values */}
                  <div className="text-xs text-[var(--theme-text-muted)] text-center space-y-1">
                    <p>BMR: {calculationResult.bmr.toFixed(1)} cal | TDEE: {calculationResult.tdee.toFixed(1)} cal</p>
                    {calculationResult.adjustedTdee !== calculationResult.tdee && (
                      <p>Adjusted for breastfeeding: {calculationResult.adjustedTdee.toFixed(1)} cal</p>
                    )}
                  </div>

                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(getPreviousStep(5))} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => setStep(6)} className="flex-1" disabled={!canProceed()}>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Confirmation */}
          {step === 6 && calculationResult && (
            <Card className="flex-1 flex flex-col animate-slide-in">
              <CardHeader className="text-center pb-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--theme-primary-light)] mx-auto mb-4">
                  <Check className="h-8 w-8 text-[var(--theme-primary-dark)]" />
                </div>
                <CardTitle className="text-2xl text-[var(--theme-text)]">Does this feel right?</CardTitle>
                <p className="text-[var(--theme-text-secondary)]">Adjust if needed, or proceed</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-4 py-4">
                  {/* Adjustable Calories */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
                      Daily Calories
                    </label>
                    <Input
                      id="adjustedCalories"
                      type="number"
                      value={adjustedCalories || ''}
                      onChange={(e) => {
                        const newCalories = parseInt(e.target.value) || null;
                        setAdjustedCalories(newCalories);
                        if (newCalories) {
                          recalculateMacrosFromCalories(newCalories);
                        }
                      }}
                      suffix="cal"
                    />
                    {adjustedCalories !== Math.round(calculationResult.targetCalories) && (
                      <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                        Original: {Math.round(calculationResult.targetCalories)} cal
                      </p>
                    )}
                  </div>

                  {/* Adjustable Macros */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--theme-text)] mb-1">
                        Protein (g)
                      </label>
                      <Input
                        id="adjustedProtein"
                        type="number"
                        value={adjustedProtein || ''}
                        onChange={(e) => setAdjustedProtein(parseInt(e.target.value) || null)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--theme-text)] mb-1">
                        Carbs (g)
                      </label>
                      <Input
                        id="adjustedCarbs"
                        type="number"
                        value={adjustedCarbs || ''}
                        onChange={(e) => setAdjustedCarbs(parseInt(e.target.value) || null)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--theme-text)] mb-1">
                        Fat (g)
                      </label>
                      <Input
                        id="adjustedFat"
                        type="number"
                        value={adjustedFat || ''}
                        onChange={(e) => setAdjustedFat(parseInt(e.target.value) || null)}
                      />
                    </div>
                  </div>

                  {/* Reset Button */}
                  {(adjustedCalories !== Math.round(calculationResult.targetCalories) ||
                    adjustedProtein !== Math.round(calculationResult.macros.protein) ||
                    adjustedCarbs !== Math.round(calculationResult.macros.carbs) ||
                    adjustedFat !== Math.round(calculationResult.macros.fat)) && (
                    <button
                      onClick={() => {
                        setAdjustedCalories(Math.round(calculationResult.targetCalories));
                        setAdjustedProtein(Math.round(calculationResult.macros.protein));
                        setAdjustedCarbs(Math.round(calculationResult.macros.carbs));
                        setAdjustedFat(Math.round(calculationResult.macros.fat));
                      }}
                      className="text-sm text-[var(--theme-primary-dark)] underline"
                    >
                      Reset to recommended
                    </button>
                  )}

                  {/* Note */}
                  <div className="bg-[var(--theme-bg-alt)] p-4 rounded-xl">
                    <p className="text-sm text-[var(--theme-text-secondary)]">
                      You can always change these later in Settings. Track your progress and adjust as needed!
                    </p>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-[var(--theme-error)] text-center mb-4">{error}</p>
                )}

                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(5)} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleComplete} isLoading={isLoading} className="flex-1">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Let&apos;s Go!
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
