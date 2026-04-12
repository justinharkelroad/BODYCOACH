'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LearnMoreModal } from '@/components/landing/LearnMoreModal';

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <LearnMoreModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Navigation — Apple glass nav */}
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="flex justify-between items-center h-12">
            <Link href="/">
              <img src="/logos/standard-nutrition.png" alt="Standard Nutrition" className="h-6 w-auto" />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-[14px] font-normal text-[#1d1d1f] hover:text-[#0066cc] transition-colors"
              >
                Sign in
              </Link>
              <button
                onClick={() => setModalOpen(true)}
                className="text-[14px] font-normal bg-[#0071e3] text-white px-4 py-1.5 rounded-[980px] hover:bg-[#0077ED] transition-colors"
              >
                Learn more
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero — Dark, cinematic */}
      <section className="pt-28 pb-24 px-6 bg-black text-center">
        <div className="max-w-[680px] mx-auto">
          <img src="/logos/standard-nutrition.png" alt="Standard Nutrition" className="h-12 sm:h-14 w-auto mx-auto mb-10 invert brightness-200" />
          <h1 className="text-[40px] sm:text-[56px] font-semibold text-white leading-[1.07] tracking-[-0.005em] mb-4">
            Your nutrition.{' '}
            <span className="text-[#86868b]">Your coach.</span>
          </h1>
          <p className="text-[21px] font-normal text-[#86868b] leading-[1.19] tracking-[0.011em] mb-10 max-w-[520px] mx-auto">
            Personalized macro plans, daily accountability, and a real coach guiding your progress every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center text-[17px] font-normal bg-[#0071e3] text-white px-8 py-3 rounded-[980px] hover:bg-[#0077ED] transition-colors"
            >
              Learn more
            </button>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center text-[17px] font-normal text-[#2997ff] px-8 py-3 rounded-[980px] border border-[#2997ff] hover:bg-[rgba(41,151,255,0.1)] transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Features — Light section */}
      <section className="py-24 px-6 bg-[#f5f5f7]">
        <div className="max-w-[980px] mx-auto">
          <h2 className="text-[40px] font-semibold text-[#1d1d1f] text-center leading-[1.10] tracking-[-0.005em] mb-4">
            Everything you need.
          </h2>
          <p className="text-[21px] text-[#86868b] text-center leading-[1.19] mb-16 max-w-[600px] mx-auto">
            Built for real people with real goals.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-[12px] p-8">
              <div className="w-12 h-12 rounded-full bg-[rgba(0,113,227,0.08)] flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-[21px] font-semibold text-[#1d1d1f] mb-2 leading-[1.19]">Custom macro plans</h3>
              <p className="text-[17px] text-[#6e6e73] leading-[1.47] tracking-[-0.022em]">
                Your coach sets your calories, protein, carbs, and fat targets based on your body and goals. Adjusted as you progress.
              </p>
            </div>

            <div className="bg-white rounded-[12px] p-8">
              <div className="w-12 h-12 rounded-full bg-[rgba(52,199,89,0.08)] flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-[#34C759]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-[21px] font-semibold text-[#1d1d1f] mb-2 leading-[1.19]">Daily check-ins</h3>
              <p className="text-[17px] text-[#6e6e73] leading-[1.47] tracking-[-0.022em]">
                Track weight, water, sleep, and stress in seconds. Your coach sees everything and provides feedback.
              </p>
            </div>

            <div className="bg-white rounded-[12px] p-8">
              <div className="w-12 h-12 rounded-full bg-[rgba(255,149,0,0.08)] flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-[#FF9500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-[21px] font-semibold text-[#1d1d1f] mb-2 leading-[1.19]">Progress photos</h3>
              <p className="text-[17px] text-[#6e6e73] leading-[1.47] tracking-[-0.022em]">
                Document your transformation with organized photo tracking. See where you started and how far you&apos;ve come.
              </p>
            </div>

            <div className="bg-white rounded-[12px] p-8">
              <div className="w-12 h-12 rounded-full bg-[rgba(90,200,250,0.08)] flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-[#5AC8FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-[21px] font-semibold text-[#1d1d1f] mb-2 leading-[1.19]">Workout tracking</h3>
              <p className="text-[17px] text-[#6e6e73] leading-[1.47] tracking-[-0.022em]">
                Log your workouts with exercises, sets, reps, and weight. Build consistency with streaks and milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — Dark section */}
      <section id="how-it-works" className="py-24 px-6 bg-black">
        <div className="max-w-[980px] mx-auto">
          <h2 className="text-[40px] font-semibold text-white text-center leading-[1.10] tracking-[-0.005em] mb-16">
            How it works.
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#0071e3] text-white flex items-center justify-center mx-auto mb-5 text-[21px] font-semibold">
                1
              </div>
              <h3 className="text-[17px] font-semibold text-white mb-2">Reach out</h3>
              <p className="text-[14px] text-[#86868b] leading-[1.43]">Tell Corina a bit about you and your goals.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#0071e3] text-white flex items-center justify-center mx-auto mb-5 text-[21px] font-semibold">
                2
              </div>
              <h3 className="text-[17px] font-semibold text-white mb-2">Get your plan</h3>
              <p className="text-[14px] text-[#86868b] leading-[1.43]">Corina builds a custom macro plan for your body.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#0071e3] text-white flex items-center justify-center mx-auto mb-5 text-[21px] font-semibold">
                3
              </div>
              <h3 className="text-[17px] font-semibold text-white mb-2">Check in daily</h3>
              <p className="text-[14px] text-[#86868b] leading-[1.43]">Log weight, water, sleep, and workouts in seconds.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#0071e3] text-white flex items-center justify-center mx-auto mb-5 text-[21px] font-semibold">
                4
              </div>
              <h3 className="text-[17px] font-semibold text-white mb-2">See results</h3>
              <p className="text-[14px] text-[#86868b] leading-[1.43]">Track progress with charts, photos, and coach feedback.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials — Light section */}
      <section className="py-24 px-6 bg-[#f5f5f7]">
        <div className="max-w-[980px] mx-auto">
          <h2 className="text-[40px] font-semibold text-[#1d1d1f] text-center leading-[1.10] tracking-[-0.005em] mb-16">
            Real results.
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-white rounded-[12px] p-8">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map((i) => (
                  <svg key={i} className="w-4 h-4 text-[#FF9500]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[17px] text-[#1d1d1f] mb-6 leading-[1.47] tracking-[-0.022em]">
                &quot;Having a real coach check in on my progress makes all the difference. I&apos;ve never been this consistent.&quot;
              </p>
              <p className="text-[14px] text-[#86868b]">Sarah M.</p>
            </div>

            <div className="bg-white rounded-[12px] p-8">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map((i) => (
                  <svg key={i} className="w-4 h-4 text-[#FF9500]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[17px] text-[#1d1d1f] mb-6 leading-[1.47] tracking-[-0.022em]">
                &quot;The daily check-ins keep me accountable without feeling overwhelming. Simple and effective.&quot;
              </p>
              <p className="text-[14px] text-[#86868b]">Rachel T.</p>
            </div>

            <div className="bg-white rounded-[12px] p-8">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map((i) => (
                  <svg key={i} className="w-4 h-4 text-[#FF9500]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[17px] text-[#1d1d1f] mb-6 leading-[1.47] tracking-[-0.022em]">
                &quot;Clean interface, no BS. I log my weight, track my workouts, and my coach handles the rest.&quot;
              </p>
              <p className="text-[14px] text-[#86868b]">Mike D.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA — Dark */}
      <section className="py-24 px-6 bg-black text-center">
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-[40px] sm:text-[48px] font-semibold text-white leading-[1.07] tracking-[-0.005em] mb-4">
            Ready to start?
          </h2>
          <p className="text-[21px] text-[#86868b] leading-[1.19] mb-10">
            Reach out to Corina and get matched with a plan built for you.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center text-[17px] font-normal bg-[#0071e3] text-white px-8 py-3 rounded-[980px] hover:bg-[#0077ED] transition-colors"
          >
            Learn more
          </button>
          <p className="mt-8 text-[14px] text-[#86868b]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#2997ff] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-[#f5f5f7] border-t border-[rgba(0,0,0,0.06)]">
        <div className="max-w-[980px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <img src="/logos/standard-nutrition.png" alt="Standard Nutrition" className="h-4 w-auto" />
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-[12px] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-[12px] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
                Terms
              </Link>
              <Link href="/help" className="text-[12px] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
                Help
              </Link>
            </div>
            <p className="text-[12px] text-[#86868b]">
              Copyright &copy; 2026 Standard Nutrition. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
