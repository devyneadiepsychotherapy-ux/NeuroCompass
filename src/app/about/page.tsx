'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Compass } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: 'var(--bg, #E8EDE6)' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 backdrop-blur-sm border-b border-black/5 px-4 py-3 flex items-center gap-3"
        style={{ background: 'color-mix(in srgb, var(--bg, #E8EDE6) 90%, transparent)' }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: 'var(--card, #F0F4EF)' }}
          aria-label="Go back"
        >
          <ArrowLeft size={18} style={{ color: 'var(--text, #2D3B2E)' }} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: 'var(--text, #2D3B2E)' }}>
          About NeuroCompass
        </h1>
      </div>

      <div className="px-5 pt-8 max-w-lg mx-auto space-y-8">

        {/* Hero */}
        <div
          className="rounded-3xl p-6 flex flex-col items-center text-center gap-4"
          style={{ background: 'var(--card, #F0F4EF)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ background: 'var(--primary, #6B8F71)' }}
          >
            <Compass size={30} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text, #2D3B2E)' }}>
              NeuroCompass
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted, #6B7A6C)' }}>
              Made with lived experience and professional care
            </p>
          </div>
        </div>

        {/* Origin story */}
        <section className="space-y-3">
          <h3
            className="text-base font-bold"
            style={{ color: 'var(--text, #2D3B2E)' }}
          >
            Where this came from
          </h3>
          <div
            className="rounded-2xl p-5 space-y-4 text-sm leading-relaxed"
            style={{ background: 'var(--card, #F0F4EF)', color: 'var(--text, #2D3B2E)' }}
          >
            <p>
              NeuroCompass was created by a neurodivergent psychotherapist and owner of{' '}
              <span className="font-semibold">Willow Creek Counselling &amp; Psychotherapy</span>.
              She built this app out of lived experience and professional insight — as someone
              who is neurodivergent herself, she wanted a tool that truly understood the ADHD
              and autistic experience from the inside out.
            </p>
            <p>
              Working with clients every day, she kept noticing a gap: the clinical tools
              that existed didn&apos;t speak to what neurodivergent people actually needed
              in their day-to-day lives. They were designed around neurotypical frameworks,
              filled with shame-heavy language, and built without the voices of the
              communities they were meant to serve.
            </p>
            <p>
              NeuroCompass was her answer to that gap.
            </p>
          </div>
        </section>

        {/* Goals */}
        <section className="space-y-3">
          <h3
            className="text-base font-bold"
            style={{ color: 'var(--text, #2D3B2E)' }}
          >
            What this app is for
          </h3>
          <div
            className="rounded-2xl p-5 space-y-4 text-sm leading-relaxed"
            style={{ background: 'var(--card, #F0F4EF)', color: 'var(--text, #2D3B2E)' }}
          >
            <p>
              NeuroCompass is grounded in neurodivergent-affirming therapy — which means it
              starts from the belief that ADHD, autism, and other neurodivergent experiences
              are not deficits to be fixed. They&apos;re ways of being in the world that deserve
              understanding, support, and tools built specifically for them.
            </p>
            <div className="space-y-3">
              {[
                {
                  title: 'Reduce shame',
                  body: 'Too many ND people carry shame about how their brains work. This app is designed to be a shame-free space — no streaks used as punishment, no language that frames you as broken.',
                },
                {
                  title: 'Support daily functioning',
                  body: 'From planning to sensory support to mood check-ins, the tools here are practical and adapted to how neurodivergent minds actually work — not how they "should" work.',
                },
                {
                  title: 'Build self-knowledge',
                  body: 'Understanding your own patterns, needs, and strengths is one of the most powerful things you can do. NeuroCompass gives you space to explore that without judgment.',
                },
                {
                  title: 'Provide affirming tools',
                  body: "Every feature is shaped by neurodivergent-affirming therapeutic practice — the same values that guide Willow Creek's clinical work.",
                },
              ].map(({ title, body }) => (
                <div key={title} className="flex gap-3">
                  <div
                    className="w-1.5 rounded-full shrink-0 mt-1"
                    style={{ background: 'var(--primary, #6B8F71)', minHeight: '1.25rem' }}
                  />
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p style={{ color: 'var(--text-muted, #6B7A6C)' }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing note */}
        <div
          className="rounded-2xl p-5 flex gap-4 items-start text-sm leading-relaxed"
          style={{ background: 'var(--card, #F0F4EF)', color: 'var(--text, #2D3B2E)' }}
        >
          <Heart
            size={20}
            className="shrink-0 mt-0.5"
            style={{ color: 'var(--primary, #6B8F71)' }}
          />
          <p>
            This app was built for you — not in spite of how your brain works, but because of it.
            You belong here exactly as you are.
          </p>
        </div>

        {/* Willow Creek credit */}
        <p
          className="text-center text-xs pb-4"
          style={{ color: 'var(--text-muted, #6B7A6C)' }}
        >
          Made with care by Willow Creek Counselling &amp; Psychotherapy
        </p>

      </div>
    </div>
  );
}
