'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Menu, X } from 'lucide-react';
import { LearnMoreModal } from '@/components/landing/LearnMoreModal';

/* ── Type stacks ───────────────────────────────────────── */
const display = '"Anton", "Archivo Black", Impact, sans-serif';
const editorial = '"Archivo Black", "Anton", Impact, sans-serif';
const body = 'Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

/* ── Brand colors (Corina — darker pink) ───────────────── */
const ink = '#0A0A0B';      // near-black
const paper = '#F4F2EE';    // warm off-white (newsprint)
const pink = '#C2185B';     // deep raspberry (replaces SP blue)
const pinkDark = '#880E4F'; // hover/dark variant

/* ══════════════════════════════════════════════════════
   NAV — paper bar with ink rule
   ══════════════════════════════════════════════════════ */
function BoldNav({ onLearnMore }: { onLearnMore: () => void }) {
  const [open, setOpen] = useState(false);
  const links = [
    { label: 'How It Works', href: '#how' },
    { label: 'Coach', href: '#coach' },
    { label: 'Features', href: '#features' },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: paper,
        borderBottom: `1px solid ${ink}`,
        height: 56,
        fontFamily: body,
      }}
    >
      <div className="h-full px-6 md:px-10 flex items-center justify-between max-w-[1440px] mx-auto">
        <Link href="/" className="flex items-center" aria-label="Standard Nutrition">
          <img
            src="/logos/standard-nutrition.png"
            alt="Standard Nutrition"
            style={{ height: 26, width: 'auto' }}
          />
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', color: ink, textTransform: 'uppercase' }}
              className="hover:opacity-60 transition-opacity"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            style={{
              fontFamily: body, fontSize: 12, fontWeight: 600, letterSpacing: '0.12em',
              color: ink, textTransform: 'uppercase', textDecoration: 'none',
              padding: '9px 18px', border: `1.5px solid ${ink}`, transition: 'all .2s',
            }}
            className="hover:bg-black hover:text-white"
          >
            Sign In
          </Link>
          <button
            onClick={onLearnMore}
            style={{
              fontFamily: body, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
              color: '#fff', background: ink, textTransform: 'uppercase',
              padding: '10px 18px', border: `1.5px solid ${ink}`, cursor: 'pointer', transition: 'all .2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = pink; e.currentTarget.style.borderColor = pink; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ink; e.currentTarget.style.borderColor = ink; }}
          >
            Apply
          </button>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" style={{ color: ink }}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden" style={{ background: paper, borderTop: `1px solid ${ink}`, padding: '16px 24px' }}>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ display: 'block', padding: '12px 0', fontSize: 16, fontWeight: 500, letterSpacing: '0.06em', color: ink, textTransform: 'uppercase', borderBottom: `1px solid ${ink}1a` }}
            >
              {l.label}
            </a>
          ))}
          <div className="flex gap-3 pt-4">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              style={{
                flex: 1,
                fontFamily: body, fontSize: 13, fontWeight: 600, letterSpacing: '0.12em',
                color: ink, textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center',
                padding: '12px', border: `1.5px solid ${ink}`,
              }}
            >
              Sign In
            </Link>
            <button
              onClick={() => { onLearnMore(); setOpen(false); }}
              style={{
                flex: 1,
                fontFamily: body, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em',
                color: '#fff', background: ink, textTransform: 'uppercase',
                padding: '12px', border: `1.5px solid ${ink}`, cursor: 'pointer',
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ══════════════════════════════════════════════════════
   HERO
   ══════════════════════════════════════════════════════ */
function HeroSection({ onLearnMore }: { onLearnMore: () => void }) {
  return (
    <section
      style={{
        background: paper,
        paddingTop: 56 + 24,
        paddingBottom: 60,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="px-6 md:px-10 max-w-[1440px] mx-auto relative">
        <div className="grid grid-cols-12 gap-6 items-start relative">
          {/* Massive editorial headline */}
          <div className="col-span-12 md:col-span-9 relative z-20">
            <p style={{
              fontFamily: body, fontSize: 12, fontWeight: 600, letterSpacing: '0.18em',
              color: ink, textTransform: 'uppercase', marginBottom: 24,
            }}>
              / Standard Nutrition · Coach Corina
            </p>
            <h1
              style={{
                fontFamily: display,
                fontSize: 'clamp(56px, 12vw, 200px)',
                lineHeight: 0.86,
                letterSpacing: '-0.02em',
                color: ink,
                margin: 0,
                textTransform: 'uppercase',
                fontWeight: 400,
              }}
            >
              FUEL
              <br />
              <span style={{ paddingLeft: '10vw', display: 'inline-block', color: pink }}>YOUR</span>
              <br />
              <span style={{ paddingLeft: '4vw', display: 'inline-block' }}>LIFE</span>
            </h1>
          </div>

          {/* Tilted Corina photo */}
          <div className="col-span-12 md:col-span-3 relative z-10">
            <div
              className="corina-hero-card"
              style={{
                position: 'relative',
                aspectRatio: '3 / 4',
                background: ink,
                overflow: 'hidden',
                boxShadow: '0 30px 60px -20px rgba(0,0,0,0.45)',
              }}
            >
              <img
                src="/CORINA.png"
                alt="Corina Harkelroad"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
            <style>{`
              .corina-hero-card {
                margin-top: -2vw;
                transform: rotate(-6deg);
                transform-origin: center top;
              }
              @media (min-width: 768px) {
                .corina-hero-card {
                  margin-top: 3vw;
                  transform: rotate(-6deg) scale(1.25);
                  transform-origin: center top;
                }
              }
            `}</style>
          </div>
        </div>

        {/* Sub-row: tagline + CTA */}
        <div className="grid grid-cols-12 gap-6 mt-12">
          <div className="col-span-12 md:col-span-6">
            <p
              style={{
                fontFamily: body,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.18em',
                color: ink,
                textTransform: 'uppercase',
                lineHeight: 1.6,
                maxWidth: 380,
              }}
            >
              Personalized macros, daily check-ins, and a real coach in your corner.
            </p>
          </div>

          <div className="col-span-12 md:col-span-6 flex md:justify-end items-center gap-3 flex-wrap">
            <a
              href="#how"
              style={{
                fontFamily: body, fontSize: 13, fontWeight: 600, letterSpacing: '0.12em',
                color: ink, textTransform: 'uppercase', textDecoration: 'none',
                padding: '14px 26px', border: `1.5px solid ${ink}`, background: 'transparent',
                transition: 'all .25s',
              }}
              className="hover:bg-black hover:text-white"
            >
              How It Works
            </a>
            <button
              onClick={onLearnMore}
              style={{
                fontFamily: body, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em',
                color: '#fff', background: ink, textTransform: 'uppercase',
                padding: '15px 28px', border: `1.5px solid ${ink}`, cursor: 'pointer',
                transition: 'all .25s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = pink; e.currentTarget.style.borderColor = pink; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ink; e.currentTarget.style.borderColor = ink; }}
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   MARQUEE BANDS
   ══════════════════════════════════════════════════════ */
function Marquee({ rotate = -3, bg = ink, color = paper, dot = pink, phrase = 'STANDARD NUTRITION' }: { rotate?: number; bg?: string; color?: string; dot?: string; phrase?: string }) {
  const items = Array.from({ length: 20 });
  return (
    <div
      style={{
        background: bg,
        color,
        transform: `rotate(${rotate}deg)`,
        padding: '14px 0',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        width: '120%',
        marginLeft: '-10%',
        borderTop: `1px solid ${color}33`,
        borderBottom: `1px solid ${color}33`,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 28,
          animation: 'sn-marquee 28s linear infinite',
        }}
      >
        {items.map((_, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 28 }}>
            <span style={{
              fontFamily: editorial,
              fontSize: 'clamp(22px, 3.4vw, 44px)',
              letterSpacing: '0.04em',
              fontWeight: 400,
            }}>{phrase}</span>
            <span aria-hidden style={{
              display: 'inline-block', width: 18, height: 18, borderRadius: 999,
              background: dot, flexShrink: 0,
            }} />
          </span>
        ))}
      </div>
    </div>
  );
}

function MarqueeBands() {
  return (
    <div style={{ background: paper, padding: '40px 0', position: 'relative', overflow: 'hidden' }}>
      <Marquee rotate={-3} bg={ink} color={paper} dot={pink} phrase="STANDARD NUTRITION" />
      <div style={{ marginTop: -24 }}>
        <Marquee rotate={2.5} bg={paper} color={ink} dot={ink} phrase="COACH CORINA" />
      </div>
      <style>{`
        @keyframes sn-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MISSION
   ══════════════════════════════════════════════════════ */
function MissionSection() {
  return (
    <section style={{ background: paper, padding: '120px 24px 100px' }}>
      <div className="max-w-[1280px] mx-auto">
        <p style={{
          fontFamily: body, fontSize: 12, fontWeight: 600, letterSpacing: '0.18em',
          color: ink, textTransform: 'uppercase', marginBottom: 28,
        }}>
          / The Mission
        </p>
        <h2
          style={{
            fontFamily: display,
            fontSize: 'clamp(36px, 7.5vw, 110px)',
            lineHeight: 0.95,
            letterSpacing: '-0.01em',
            color: ink,
            textTransform: 'uppercase',
            margin: 0,
            fontWeight: 400,
          }}
        >
          STRONGER BODIES,
          <br />
          <span style={{ paddingLeft: '8vw', display: 'inline-block' }}>CLEARER MINDS,</span>
          <br />
          <span style={{ paddingLeft: '14vw', display: 'inline-block' }}>HABITS THAT HOLD —</span>
          <br />
          <span style={{ display: 'inline-block', color: pink }}>BUILT FOR REAL LIFE.</span>
        </h2>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   FEATURES — Bold list rows
   ══════════════════════════════════════════════════════ */
type FeatureRow = { num: string; title: string; tag: string; description: string };

const features: FeatureRow[] = [
  {
    num: '01',
    title: 'Custom Macro Plans',
    tag: 'Built For Your Body',
    description: 'Calories, protein, carbs, and fat targets dialed in for your goals — and adjusted as you progress. No guesswork, no generic templates.',
  },
  {
    num: '02',
    title: 'Daily Check-Ins',
    tag: 'Accountability',
    description: 'Log weight, water, sleep, and stress in seconds. Corina sees everything and adjusts your plan in real time.',
  },
  {
    num: '03',
    title: 'Progress Photos',
    tag: 'See The Change',
    description: 'Document your transformation with organized photo tracking. The before-and-after that actually keeps you going.',
  },
  {
    num: '04',
    title: 'Workout Tracking',
    tag: 'Earn The Body',
    description: 'Log workouts with exercises, sets, reps, and weight. Build consistency with streaks, milestones, and visible progress.',
  },
];

function FeatureRowItem({ f }: { f: FeatureRow }) {
  return (
    <li
      style={{
        borderBottom: `1px solid ${ink}`,
      }}
      className="group hover:bg-black/[0.03] transition-colors"
    >
      <div
        style={{
          padding: '32px 8px',
          display: 'grid',
          gridTemplateColumns: '60px 1fr',
          gap: 20,
          alignItems: 'start',
        }}
      >
        <span style={{
          fontFamily: editorial, fontSize: 22, color: ink, opacity: 0.4, letterSpacing: '-0.01em',
        }}>
          {f.num}
        </span>
        <div>
          <p style={{
            fontFamily: body, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em',
            color: ink, opacity: 0.5, textTransform: 'uppercase', marginBottom: 6,
          }}>
            {f.tag}
          </p>
          <h4 style={{
            fontFamily: display,
            fontSize: 'clamp(28px, 4vw, 52px)',
            lineHeight: 1, letterSpacing: '-0.01em',
            color: ink, textTransform: 'uppercase', margin: 0, fontWeight: 400,
            marginBottom: 12,
          }}>
            {f.title}
          </h4>
          <p style={{
            fontFamily: body, fontSize: 15, fontWeight: 400, lineHeight: 1.6,
            color: ink, opacity: 0.7, maxWidth: 640, margin: 0,
          }}>
            {f.description}
          </p>
        </div>
      </div>
    </li>
  );
}

function FeaturesSection() {
  return (
    <section id="features" style={{ background: paper, padding: '40px 24px 120px', borderTop: `1px solid ${ink}` }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-12 gap-6 items-end mb-12">
          <div className="col-span-12 md:col-span-8">
            <p style={{
              fontFamily: body, fontSize: 12, fontWeight: 600, letterSpacing: '0.18em',
              color: ink, textTransform: 'uppercase', marginBottom: 12,
            }}>
              / What's Inside
            </p>
            <h2 style={{
              fontFamily: display,
              fontSize: 'clamp(44px, 7vw, 100px)',
              lineHeight: 0.95,
              letterSpacing: '-0.01em',
              color: ink,
              textTransform: 'uppercase',
              margin: 0,
              fontWeight: 400,
            }}>
              EVERYTHING<br />YOU NEED.
            </h2>
          </div>
          <div className="col-span-12 md:col-span-4">
            <p style={{
              fontFamily: body, fontSize: 14, fontWeight: 400, lineHeight: 1.65,
              color: ink, opacity: 0.7, marginBottom: 8,
            }}>
              Built for real people with real goals. No fad diets, no apps that ghost you. Just a plan, a coach, and the tools to follow through.
            </p>
          </div>
        </div>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderTop: `1px solid ${ink}` }}>
          {features.map((f) => (
            <FeatureRowItem key={f.num} f={f} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   HOW IT WORKS — black band
   ══════════════════════════════════════════════════════ */
const steps = [
  { n: '01', title: 'Reach Out', copy: 'Tell Corina about you and your goals.' },
  { n: '02', title: 'Get Your Plan', copy: 'A custom macro plan built for your body.' },
  { n: '03', title: 'Check In Daily', copy: 'Log weight, water, sleep, and workouts.' },
  { n: '04', title: 'See Results', copy: 'Track progress with charts, photos, and feedback.' },
];

function HowItWorks() {
  return (
    <section id="how" style={{ background: ink, padding: '120px 24px', overflow: 'hidden' }}>
      <div className="max-w-[1280px] mx-auto">
        <p style={{
          fontFamily: body, fontSize: 12, fontWeight: 600, letterSpacing: '0.18em',
          color: paper, opacity: 0.6, textTransform: 'uppercase', marginBottom: 28,
        }}>
          / The Process
        </p>
        <h2 style={{
          fontFamily: display,
          fontSize: 'clamp(40px, 7vw, 100px)',
          lineHeight: 0.95,
          letterSpacing: '-0.01em',
          color: paper,
          textTransform: 'uppercase',
          margin: 0, marginBottom: 64,
          fontWeight: 400,
        }}>
          HOW IT WORKS.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          {steps.map((s, i) => (
            <div
              key={s.n}
              style={{
                padding: '32px 24px 32px 0',
                borderTop: `1px solid ${paper}33`,
                borderRight: i < steps.length - 1 ? `1px solid ${paper}1a` : 'none',
                paddingLeft: i === 0 ? 0 : 24,
              }}
            >
              <div style={{
                fontFamily: editorial,
                fontSize: 'clamp(56px, 7vw, 96px)',
                lineHeight: 1,
                color: pink,
                marginBottom: 24,
                fontWeight: 400,
                letterSpacing: '-0.02em',
              }}>
                {s.n}
              </div>
              <h3 style={{
                fontFamily: display, fontSize: 24, fontWeight: 400,
                color: paper, textTransform: 'uppercase', letterSpacing: '-0.005em',
                margin: 0, marginBottom: 10,
              }}>
                {s.title}
              </h3>
              <p style={{
                fontFamily: body, fontSize: 14, fontWeight: 400, lineHeight: 1.55,
                color: paper, opacity: 0.7, margin: 0,
              }}>
                {s.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   COACH BIO
   ══════════════════════════════════════════════════════ */
function CoachSection() {
  return (
    <section id="coach" style={{ background: paper, padding: '120px 24px' }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Photo */}
          <div className="col-span-12 md:col-span-6 order-1">
            <div
              style={{
                aspectRatio: '4 / 5',
                background: ink,
                overflow: 'hidden',
                border: `1px solid ${ink}`,
              }}
            >
              <img
                src="/CORINA.png"
                alt="Corina Harkelroad"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="col-span-12 md:col-span-6 order-2">
            <p style={{
              fontFamily: body, fontSize: 12, fontWeight: 600, letterSpacing: '0.18em',
              color: pink, textTransform: 'uppercase', marginBottom: 16,
            }}>
              / Meet Your Coach
            </p>
            <h2
              style={{
                fontFamily: display,
                fontSize: 'clamp(48px, 6vw, 96px)',
                lineHeight: 0.92,
                letterSpacing: '-0.01em',
                color: ink,
                textTransform: 'uppercase',
                margin: 0,
                fontWeight: 400,
                marginBottom: 24,
              }}
            >
              CORINA<br />HARKELROAD
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{
                fontFamily: body, fontSize: 17, fontWeight: 400, lineHeight: 1.6, color: ink,
              }}>
                Mother of three. Wife. Fitness competitor. I&apos;ve found my purpose helping people reach their health and fitness goals.
              </p>
              <p style={{
                fontFamily: body, fontSize: 17, fontWeight: 400, lineHeight: 1.6, color: ink,
              }}>
                Indiana University–Bloomington grad in Telecommunications and Business. I came to personal training later in life — after rebuilding my own health post-kids.
              </p>
              <p style={{
                fontFamily: body, fontSize: 17, fontWeight: 400, lineHeight: 1.6, color: ink,
              }}>
                I was pre-diabetic, exhausted, and had little energy left for my three kids. Exercise saved my life. Eating the right foods gave me the fuel I needed.
              </p>
              <p style={{
                fontFamily: body, fontSize: 17, fontWeight: 600, lineHeight: 1.5, color: pink, fontStyle: 'italic',
                marginTop: 8,
              }}>
                Now I&apos;m here to help you do the same.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   GIANT CTA — "FUEL."
   ══════════════════════════════════════════════════════ */
function GiantCTA({ onLearnMore }: { onLearnMore: () => void }) {
  return (
    <section
      onClick={onLearnMore}
      style={{
        background: ink,
        padding: '100px 24px 70px',
        cursor: 'pointer',
        borderTop: `1px solid ${ink}`,
      }}
      role="button"
      aria-label="Apply now"
    >
      <div className="max-w-[1440px] mx-auto text-center">
        <p style={{
          fontFamily: body, fontSize: 12, fontWeight: 600, letterSpacing: '0.18em',
          color: paper, opacity: 0.5, textTransform: 'uppercase', marginBottom: 24,
        }}>
          / Your Move
        </p>
        <h2 style={{
          fontFamily: display,
          fontSize: 'clamp(80px, 22vw, 360px)',
          lineHeight: 0.82,
          letterSpacing: '-0.03em',
          color: paper,
          textTransform: 'uppercase',
          margin: 0,
          fontWeight: 400,
        }}>
          FUEL.
        </h2>
        <p style={{
          fontFamily: body, fontSize: 14, fontWeight: 500, letterSpacing: '0.06em',
          color: paper, opacity: 0.7, marginTop: 32, textTransform: 'uppercase',
        }}>
          Click anywhere &nbsp;→&nbsp; Apply for coaching
        </p>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════════════ */
function BoldFooter() {
  return (
    <footer style={{ background: ink, color: paper, padding: '60px 24px 30px' }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12" style={{ borderBottom: `1px solid ${paper}1a` }}>
          <div className="col-span-2">
            <img
              src="/logos/standard-nutrition-white.png"
              alt="Standard Nutrition"
              style={{ height: 28, marginBottom: 18 }}
            />
            <p style={{
              fontFamily: body, fontSize: 16, lineHeight: 1.5, marginBottom: 22,
              maxWidth: 380, opacity: 0.85,
            }}>
              Personalized nutrition coaching with macro plans, daily accountability, and a real coach in your corner.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.facebook.com/"
                target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                style={{ color: paper, opacity: 0.6, transition: 'opacity 0.2s' }}
                className="hover:opacity-100"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                style={{ color: paper, opacity: 0.6, transition: 'opacity 0.2s' }}
                className="hover:opacity-100"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <p style={{
              fontFamily: body, fontSize: 12, fontWeight: 600, letterSpacing: '0.16em',
              opacity: 0.5, textTransform: 'uppercase', marginBottom: 14,
            }}>
              Program
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {[
                { label: 'How It Works', href: '#how' },
                { label: 'Features', href: '#features' },
                { label: 'Coach', href: '#coach' },
              ].map((it) => (
                <li key={it.label} style={{ marginBottom: 8 }}>
                  <a href={it.href} style={{ fontFamily: body, fontSize: 14, color: paper, opacity: 0.85, textDecoration: 'none' }} className="hover:opacity-100">
                    {it.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p style={{
              fontFamily: body, fontSize: 12, fontWeight: 600, letterSpacing: '0.16em',
              opacity: 0.5, textTransform: 'uppercase', marginBottom: 14,
            }}>
              Company
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {[
                { label: 'Sign In', href: '/login' },
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
                { label: 'Help', href: '/help' },
              ].map((it) => (
                <li key={it.label} style={{ marginBottom: 8 }}>
                  <Link href={it.href} style={{ fontFamily: body, fontSize: 14, color: paper, opacity: 0.85, textDecoration: 'none' }} className="hover:opacity-100">
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 text-center">
          <p style={{
            fontFamily: body, fontSize: 11, opacity: 0.5, letterSpacing: '0.08em',
          }}>
            © {new Date().getFullYear()} STANDARD NUTRITION. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════ */
export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{ background: paper, fontFamily: body, color: ink }}>
      <LearnMoreModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <BoldNav onLearnMore={() => setModalOpen(true)} />
      <HeroSection onLearnMore={() => setModalOpen(true)} />
      <MarqueeBands />
      <MissionSection />
      <FeaturesSection />
      <HowItWorks />
      <CoachSection />
      <GiantCTA onLearnMore={() => setModalOpen(true)} />
      <BoldFooter />
    </div>
  );
}
