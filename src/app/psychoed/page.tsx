"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ICON_MAP } from "@/lib/icon-map";

interface Article {
  id: string;
  title: string;
  icon: string;
  category: string;
  tags?: string[];
  summary: string;
  content: string[];
  takeaways: string[];
}

const ARTICLES: Article[] = [
  {
    id: "exec-function",
    title: "What is Executive Function?",
    icon: "Brain",
    category: "Foundations",
    summary: "Executive function is the brain's 'management system',and it works differently in ND brains.",
    content: [
      "Executive function is a set of mental skills that help you plan, focus attention, remember instructions, and manage multiple tasks. Think of it like the brain's CEO.",
      "These skills include: working memory, cognitive flexibility, inhibitory control, planning, task initiation, time management, emotional regulation, and organization.",
      "In ADHD and autism, executive function differences are neurological, not a character flaw, not laziness, not lack of effort. The brain's prefrontal cortex (where executive functions live) develops and works differently.",
      "This means common strategies designed for neurotypical executive function often don't work, and that's the system's failure, not yours.",
    ],
    takeaways: [
      "EF challenges are neurological, not moral failures",
      "External supports and systems compensate for EF gaps, this is adaptive, not cheating",
      "Many ND people have uneven EF profiles: very strong in some areas, very challenged in others",
    ]
  },
  {
    id: "adhd-brain",
    title: "ADHD: How the Brain Actually Works",
    icon: "Zap",
    category: "Foundations",
    summary: "ADHD is a dopamine regulation difference, not a deficit of attention.",
    content: [
      "ADHD is a neurodevelopmental condition characterized by differences in dopamine and norepinephrine regulation in the brain, particularly in the prefrontal cortex and reward pathways.",
      "The ADHD brain does not have an attention deficit, it has a regulation deficit. It struggles to direct attention by will, but can focus intensely on things that are interesting, urgent, novel, or personally meaningful.",
      "This explains why someone with ADHD can hyperfocus on a game for 8 hours but can't start a 10-minute task. It's not willpower, it's neurochemistry.",
      "Dr. Russell Barkley describes ADHD as primarily a time-blindness and self-regulation disorder. The ADHD brain lives in two time zones: now and not now.",
      "Key differences: working memory, emotional regulation, task initiation, time perception, impulse control, and sustained effort on non-preferred tasks.",
    ],
    takeaways: [
      "ADHD is not caused by poor parenting, diet, or lack of effort",
      "The 'interest-based nervous system' is real: urgency, challenge, novelty, passion, and relationships activate the ADHD brain",
      "Structure, external accountability, and interest-aligned tasks help compensate",
    ]
  },
  {
    id: "autism-basics",
    title: "Autism: Beyond the Stereotypes",
    icon: "Sparkles",
    category: "Foundations",
    tags: ["autism"],
    summary: "Autism is a different neurological profile, not a disorder to be fixed.",
    content: [
      "Autism is a neurodevelopmental condition involving differences in social communication, sensory processing, and patterns of behaviour and interests.",
      "The neurodiversity paradigm understands autism as a natural variation in human neurology, not a disease or deficit. Autistic people are not 'broken neurotypicals.'",
      "Autistic experiences are incredibly varied, there is no 'one type' of autism. The autism 'spectrum' is better understood as a multidimensional profile of strengths and differences.",
      "Common autistic experiences include: sensory sensitivities, social energy depletion (especially after masking), deep interests, need for predictability, difficulties with sudden change, and different communication styles.",
      "Many autistic people are diagnosed late, particularly women, non-binary people, and BIPOC individuals, whose presentations may be less recognized.",
    ],
    takeaways: [
      "Autism is not caused by vaccines, 'bad parenting', or trauma",
      "Masking is exhausting and a significant contributor to burnout",
      "Many autistic people prefer identity-first language: 'autistic person' rather than 'person with autism', always follow individual preference",
    ]
  },
  {
    id: "rsd",
    title: "Rejection Sensitive Dysphoria (RSD)",
    icon: "Heart",
    category: "ADHD",
    summary: "The intense emotional pain of perceived rejection, and why it's not 'too sensitive.'",
    content: [
      "Rejection Sensitive Dysphoria (RSD) is an intense emotional response to perceived or actual rejection, criticism, failure, or teasing, common in ADHD.",
      "The word 'dysphoria' means an unbearable emotional pain. People with RSD describe it as instantaneous, overwhelming, and often disproportionate to the trigger, but completely real in its intensity.",
      "RSD can look like: sudden rage or meltdown after perceived criticism, people pleasing to avoid rejection, perfectionism as a shield, social avoidance, and difficulty hearing any negative feedback.",
      "RSD is not a trauma response (though trauma can worsen it),it appears to be neurological, related to emotional dysregulation in the ADHD brain.",
    ],
    takeaways: [
      "RSD is real and neurological, not 'too sensitive' or dramatic",
      "Awareness of RSD helps you recognize the pattern and not act on it impulsively",
      "Therapy (particularly EMDR and CBT) and sometimes medication can help",
    ]
  },
  {
    id: "interoception-psychoed",
    title: "Interoception: Your Internal Sense",
    icon: "Activity",
    category: "Body & Senses",
    tags: ["autism"],
    summary: "The hidden sense that helps you notice hunger, emotions, pain, and more.",
    content: [
      "Interoception is often called 'the eighth sense',it's the ability to sense what's happening inside your body: hunger, thirst, temperature, heartbeat, pain, and emotional states.",
      "Many ND people have interoception differences, they may not notice hunger until ravenous, not feel thirst until very dehydrated, miss pain signals, or struggle to identify emotions in their body (alexithymia).",
      "This is why 'just listen to your body' advice often doesn't work for ND people, the signal may be faint, absent, or interpreted differently.",
      "The good news: interoceptive awareness can be developed through practice, body scans, mindful eating, regular check-ins, and working with an OT can all help.",
    ],
    takeaways: [
      "Interoception differences are neurological, not laziness or inattention",
      "External cues and schedules are valid compensatory strategies",
      "Alexithymia (difficulty identifying emotions) is closely linked to interoception differences",
    ]
  },
  {
    id: "masking",
    title: "Masking and Camouflaging",
    icon: "Eye",
    category: "Wellbeing",
    tags: ["autism"],
    summary: "The cost of hiding your ND traits, and why unmasking matters.",
    content: [
      "Masking (also called camouflaging) refers to the conscious or unconscious suppression or modification of ND traits in order to appear neurotypical.",
      "Examples include: scripting conversations, forcing eye contact, suppressing stimming, mimicking others' expressions, performing 'normality' in social situations.",
      "Masking is often a survival strategy learned in response to bullying, rejection, or pressure to conform, it makes sense why it happens.",
      "The cost is significant: masking is mentally and physically exhausting. Research shows strong links between masking and anxiety, depression, and ND burnout.",
      "Unmasking is the gradual process of being more authentically yourself. It's not about having no social skills, it's about not hiding who you are in spaces where it's safe not to.",
    ],
    takeaways: [
      "Masking is a survival strategy, not dishonesty",
      "Prolonged masking is a primary driver of ND burnout",
      "Finding safe spaces and people to unmask with is protective",
    ]
  },
  {
    id: "burnout-psychoed",
    title: "ND Burnout: What It Is and Isn't",
    icon: "Battery",
    category: "Wellbeing",
    tags: ["autism"],
    summary: "ND burnout is different from regular tiredness, and it requires real recovery.",
    content: [
      "ND burnout is a state of chronic exhaustion, reduced functioning, and often increased autistic/ADHD traits that results from prolonged stress, masking, and exceeding one's capacity.",
      "It's different from regular tiredness or even workplace burnout. ND burnout can last weeks to months and often involves a regression in skills (losing abilities you normally have).",
      "Common triggers: prolonged masking, life transitions, sensory overwhelm accumulation, chronic under-support, major life stress.",
      "Signs include: extreme fatigue unresolved by sleep, brain fog, loss of skills (speech, executive function, self-care), emotional numbness, social withdrawal, sensory sensitivity increase.",
      "Recovery requires genuine rest, reduction of demands, unmasking, and addressing root causes, it cannot be pushed through.",
    ],
    takeaways: [
      "ND burnout is a real, recognized phenomenon, not dramatic or made up",
      "Prevention requires proactive management of energy and masking",
      "Seeking professional support is appropriate and valid",
    ]
  },
  {
    id: "polyvagal",
    title: "Polyvagal Theory & the ND Nervous System",
    icon: "Waves",
    category: "Nervous System",
    tags: ["autism"],
    summary: "How your nervous system state affects everything, and how to work with it.",
    content: [
      "Polyvagal Theory (Dr. Stephen Porges) describes how the autonomic nervous system has three states: Safe/Social (ventral vagal), Fight-or-Flight (sympathetic), and Freeze/Shutdown (dorsal vagal).",
      "ND people often have more reactive nervous systems, moving into fight-or-flight or shutdown more quickly and more intensely than neurotypical people.",
      "When in fight-or-flight: heart racing, anxiety, urgency, anger, difficulty thinking clearly. When in freeze/shutdown: numbness, dissociation, can't speak, can't move, extreme fatigue.",
      "Regulation strategies (breathing, movement, sensory input, safe relationships) help shift the nervous system back to the safe/social state where learning, connection, and executive function are most accessible.",
      "Meltdowns and shutdowns are nervous system responses, not choices, not manipulations, not bad behavior.",
    ],
    takeaways: [
      "You cannot reason with a dysregulated nervous system, regulate first, think second",
      "Co-regulation (calming through another calm person's presence) is a real and powerful mechanism",
      "Building a personal 'regulation toolkit' is a key life skill for ND people",
    ]
  },
  {
    id: "dopamine",
    title: "Dopamine & the ADHD Reward System",
    icon: "Flame",
    category: "ADHD",
    summary: "Why motivation feels broken, and what actually helps.",
    content: [
      "Dopamine is a neurotransmitter involved in motivation, reward, and pleasure. In ADHD, the brain's dopamine system works differently, producing less dopamine, having fewer receptors, or recycling it too quickly.",
      "This is why ADHD brains struggle with tasks that have delayed, uncertain, or abstract rewards, the reward system simply doesn't fire in the same way.",
      "The ADHD brain seeks dopamine through novelty, urgency, challenge, passion, and social connection, this is the 'interest-based nervous system' described by Dr. William Dodson.",
      "Strategies that work leverage this system: making tasks novel (change location, use different tools), adding urgency (deadlines, timers), pairing with interest (background content, body doubling), and creating immediate rewards.",
      "Medication for ADHD works primarily by increasing dopamine availability, this is why it can dramatically improve motivation and task initiation for many people.",
    ],
    takeaways: [
      "Motivation issues in ADHD are neurological, telling yourself to 'just do it' doesn't change brain chemistry",
      "Working WITH your dopamine system (not against it) is the key",
      "External motivation structures compensate for internal motivation differences",
    ]
  },
];

const CATEGORIES = Array.from(new Set(ARTICLES.map(a => a.category)));
const AUTISM_FILTER = "Autism";

function ArticleCard({ article }: { article: Article }) {
  const [open, setOpen] = useState(false);
  const IC = ICON_MAP[article.icon];
  return (
    <div className={cn("bg-cream-50 rounded-2xl border transition-all", open ? "border-sage-200 shadow-md" : "border-slate-100 shadow-sm")}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-sage-50 flex items-center justify-center shrink-0">
          {IC && <IC size={18} className="text-sage-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800">{article.title}</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{article.summary}</p>
          <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-sage-100 text-sage-700 rounded-full">{article.category}</span>
        </div>
        {open ? <ChevronUp size={18} className="text-slate-400 shrink-0 mt-1" /> : <ChevronDown size={18} className="text-slate-400 shrink-0 mt-1" />}
      </button>

      {open && (
        <div className="px-4 pb-5 space-y-4 border-t border-slate-100 pt-4">
          <div className="space-y-3">
            {article.content.map((para, i) => (
              <p key={i} className="text-sm text-slate-600 leading-relaxed">{para}</p>
            ))}
          </div>
          <div className="bg-sage-50 rounded-xl p-4 border border-sage-100 space-y-2">
            <p className="text-xs font-semibold text-sage-700 uppercase tracking-wide">Key takeaways</p>
            {article.takeaways.map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-sage-400 shrink-0 mt-0.5">✓</span>
                <p className="text-sm text-slate-700">{t}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PsychoedPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory === AUTISM_FILTER
    ? ARTICLES.filter(a => a.tags?.includes("autism"))
    : activeCategory
    ? ARTICLES.filter(a => a.category === activeCategory)
    : ARTICLES;

  return (
    <div className="px-4 pt-12 pb-8 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Learn</h1>
        <p className="text-sm text-slate-500">Psychoeducation, understanding your ND brain</p>
      </div>

      <div className="bg-gradient-to-br from-stone-100 to-sage-50 rounded-2xl p-4 border border-stone-200">
        <p className="text-sm text-slate-700 leading-relaxed">
          <strong>Why psychoeducation matters:</strong> Understanding how your brain works is one of the most powerful tools available. Knowledge reduces shame, increases self-compassion, and helps you find strategies that actually work.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
            !activeCategory ? "bg-sage-600 text-white border-sage-600" : "bg-cream-50 text-slate-600 border-slate-200")}>
          All
        </button>
        <button
          onClick={() => setActiveCategory(activeCategory === AUTISM_FILTER ? null : AUTISM_FILTER)}
          className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
            activeCategory === AUTISM_FILTER ? "bg-sage-600 text-white border-sage-600" : "bg-cream-50 text-slate-600 border-slate-200 hover:border-sage-300")}>
          Autism
        </button>
        {CATEGORIES.map(cat => (
          <button key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
              activeCategory === cat ? "bg-sage-600 text-white border-sage-600" : "bg-cream-50 text-slate-600 border-slate-200 hover:border-sage-300")}>
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(article => <ArticleCard key={article.id} article={article} />)}
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <p className="text-xs text-slate-500 text-center leading-relaxed">
          Content informed by Dr. Russell Barkley, Dr. Stephen Porges, Dr. William Dodson, and ND-affirming frameworks including Neurodivergent Insights and ADHD with Jenna Free.
        </p>
      </div>
    </div>
  );
}
