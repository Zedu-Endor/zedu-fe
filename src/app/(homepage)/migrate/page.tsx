import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  CheckCircle2,
  Clock,
  GraduationCap,
  HelpCircle,
  Laptop,
  Layers,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Video,
  XCircle,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Migrate from WhatsApp, Telegram & Google Classroom to Zedu",
  description:
    "Upgrade your bootcamp, school, or learning team from chaotic chat groups and fragmented tools to Zedu. Centralize channels, live Buzz video sessions, assignments, and AI teaching assistance.",
  keywords: [
    "migrate to zedu",
    "whatsapp education alternative",
    "telegram learning cohort alternative",
    "google classroom alternative",
    "bootcamp communication platform",
    "cohort management software",
    "structured learning workspace",
    "student engagement platform",
  ],
  openGraph: {
    title: "Migrate Your Learning Community to Zedu",
    description:
      "Tired of lost announcements and scattered links? Move your cohort to Zedu for structured channels, built-in Buzz video, and 24/7 AI learning assistance.",
    url: siteUrl("/migrate"),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "Migrate from WhatsApp and Google Classroom to Zedu",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Migrate to Zedu | The Structured Workspace for Learning Teams",
    description:
      "Replace the chat chaos of WhatsApp and Telegram with organized channels, cohort analytics, and embedded video calls.",
    images: [ogImageUrl("og-image-5.png")],
  },
  alternates: {
    canonical: siteUrl("/migrate"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

const migrationPains = [
  {
    platform: "WhatsApp Groups",
    tagline: "Chat chaos & disappearing context",
    pains: [
      "Important announcements drown under 500+ student messages in minutes",
      "No sub-channels or topic separation—everything is one infinite scroll",
      "Media, PDFs, and assignment files expire or get lost on student devices",
      "Instructors receive direct message pings at all hours without boundaries",
    ],
    solution:
      "Dedicated topic channels, permanent file storage, and quiet hours.",
    icon: MessageSquare,
  },
  {
    platform: "Telegram Communities",
    tagline: "Unstructured silos & spam distractions",
    pains: [
      "Topic groups feel disjointed and are hard for non-technical students to navigate",
      "Zero assignment tracking, submission workflows, or grading visibility",
      "Students get distracted by crypto, bot spam, and unrelated public groups",
      "No built-in attendance or structured cohort participation analytics",
    ],
    solution:
      "Focused academic community with verified roles and cohort rosters.",
    icon: Users,
  },
  {
    platform: "Google Classroom",
    tagline: "Cold LMS feeling & zero real-time interaction",
    pains: [
      "Lacks real-time messaging—feels like a sterile document repository",
      "Requires switching between external Google Meet, Zoom, and Gmail links",
      "Low peer-to-peer student discussion and collaboration outside assignments",
      "No intelligent AI assistant to answer recurring homework blockers",
    ],
    solution:
      "Unified real-time collaboration with embedded 1-click Buzz video.",
    icon: GraduationCap,
  },
];

const comparisonMatrix = [
  {
    feature: "Topic & Subject Channels",
    whatsapp: "❌ Single group feed",
    classroom: "⚠️ Static assignment stream",
    zedu: "✅ Organized nested channels & threads",
  },
  {
    feature: "Live Video & Office Hours",
    whatsapp: "❌ Requires third-party link",
    classroom: "⚠️ External Google Meet required",
    zedu: "✅ 1-click native Buzz video rooms",
  },
  {
    feature: "24/7 AI Teaching Assistant",
    whatsapp: "❌ None",
    classroom: "❌ None",
    zedu: "✅ Embedded AI answers student FAQs instantly",
  },
  {
    feature: "Code Snippets & Rich Markdown",
    whatsapp: "❌ Raw broken text",
    classroom: "⚠️ Basic plain text",
    zedu: "✅ Full syntax highlighting & rich formatting",
  },
  {
    feature: "Role-Based Access Control",
    whatsapp: "⚠️ Admin or Member only",
    classroom: "⚠️ Teacher or Student only",
    zedu: "✅ Instructors, TAs, Mentors, and Cohort Members",
  },
  {
    feature: "Permanent Asset & Search Library",
    whatsapp: "❌ Media disappears / expired",
    classroom: "⚠️ Disorganized Drive folders",
    zedu: "✅ Cloud-backed searchable file management",
  },
];

const migrationSteps = [
  {
    step: "01",
    title: "Import Your Student Roster",
    description:
      "Invite your cohort in bulk via email addresses, CSV upload, or share a branded private workspace invite link with customizable expiry.",
    icon: Users,
  },
  {
    step: "02",
    title: "Structure Your Learning Spaces",
    description:
      "Set up ready-made channels for Announcements, Curriculum Modules, Q&A Helpdesks, Project Showcases, and Social Lounges in minutes.",
    icon: Layers,
  },
  {
    step: "03",
    title: "Upload Curriculums & Resources",
    description:
      "Pin syllabus documents, starter repositories, guidelines, and lecture slides directly to relevant channel banners for instant access.",
    icon: BookOpen,
  },
  {
    step: "04",
    title: "Activate Zedu AI & Buzz Video",
    description:
      "Host your kick-off lecture inside Buzz with zero download friction. Enable the AI Assistant to deflect routine questions around deadlines and setup.",
    icon: Sparkles,
  },
];

const migrationFaqs = [
  {
    q: "How difficult is it for non-technical students to adapt to Zedu?",
    a: "Zedu is designed with the familiar, intuitive feel of modern messaging apps. Students join in seconds with one click, require zero training, and can participate seamlessly on web browsers, desktop apps, or mobile devices.",
  },
  {
    q: "Can we migrate multiple cohorts running concurrently?",
    a: "Yes! Zedu organizations support multiple cohorts with separate private channels, distinct mentor groups, and role-based permissions, keeping learning tracks cleanly separated while maintaining a shared school culture.",
  },
  {
    q: "Do students need to install software for live Buzz video classes?",
    a: "No installation is required. Buzz runs natively in modern web browsers as well as desktop and mobile clients. Students simply click the channel Buzz banner to join live audio/video rooms with screen sharing.",
  },
  {
    q: "How does the AI Assistant help instructors manage cohort workload?",
    a: "The Zedu AI Assistant is trained on your course documents and channel knowledge. It responds to common questions—such as submission deadlines, environment setups, and homework specifications—allowing mentors to focus on deep instruction.",
  },
  {
    q: "Is there a free trial or tier available to test our migration?",
    a: "Yes! You can get started on Zedu for free today, set up your organization channels, test Buzz video with your instructional team, and upgrade only when you are ready to scale.",
  },
  {
    q: "Will our historical files and documents stay safe?",
    a: "All files uploaded to Zedu are stored securely in cloud-backed redundant storage with granular channel access controls, ensuring materials remain permanently accessible to authorized members.",
  },
];

export default function MigrationPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-100 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-transparent dark:from-blue-950/20 dark:via-slate-950 dark:to-transparent pointer-events-none" />

        <div className="container relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:border-blue-800/80 dark:bg-blue-950/60 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Migration Playbook</span>
            </div>

            <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-slate-900 dark:text-white">
              Tired of Chat Chaos?{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300">
                Move Your Cohort to Zedu.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              WhatsApp groups drown important assignments. Telegram lacks
              structure. Google Classroom feels disconnected. Zedu brings cohort
              communication, structured modules, 1-click Buzz video, and an AI
              teaching assistant into one purpose-built workspace.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/login"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/35 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span>Start Free Migration</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/contact-sales"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span>Book a Guided Walkthrough</span>
              </Link>
            </div>

            {/* Quick Proof Badges */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200/60 dark:border-slate-800/80 text-left">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  10-Min Onboarding
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  Zero Data Loss
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  Built-in Buzz Video
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  10 to 10k+ Students
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Pain Points Section */}
      <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Why Teams Switch
            </h2>
            <p className="mt-3 text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              The High Cost of Fragmented Communication
            </p>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Educational teams waste hours repeating instructions across
              disjointed chat groups and clunky portals. Here is what breaks:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {migrationPains.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {item.platform}
                      </h3>
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                        {item.tagline}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {item.pains.map((pain, pIdx) => (
                      <li
                        key={pIdx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300"
                      >
                        <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{pain}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{item.solution}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Before vs After Comparison Matrix */}
      <section className="py-16 md:py-24 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Clear Comparison
            </h2>
            <p className="mt-3 text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Legacy Tools vs. The Zedu Standard
            </p>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
              See how Zedu streamlines daily cohort operations compared to
              generic messengers and traditional LMS platforms.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                <tr>
                  <th className="py-4 px-6">Feature Capability</th>
                  <th className="py-4 px-6 text-slate-500">
                    WhatsApp / Telegram
                  </th>
                  <th className="py-4 px-6 text-slate-500">Google Classroom</th>
                  <th className="py-4 px-6 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/60 dark:bg-blue-950/30">
                    Zedu Learning Workspace
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {comparisonMatrix.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                      {row.whatsapp}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                      {row.classroom}
                    </td>
                    <td className="py-4 px-6 font-medium text-blue-700 dark:text-blue-300 bg-blue-50/40 dark:bg-blue-950/20">
                      {row.zedu}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Migration Playbook (How It Works) */}
      <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              The 4-Step Playbook
            </h2>
            <p className="mt-3 text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Migrate Over a Single Weekend Without Friction
            </p>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
              We have helped coding bootcamps, schools, and mentorship programs
              migrate thousands of learners smoothly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {migrationSteps.map((step, sIdx) => {
              const Icon = step.icon;
              return (
                <div
                  key={sIdx}
                  className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-blue-600/30 dark:text-blue-400/30">
                        {step.step}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Need assistance migrating a large cohort? Our team provides
              complimentary white-glove onboarding.
            </p>
            <Link
              href="/contact-sales"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <span>Contact our migration engineers</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial Strip */}
      <section className="py-16 bg-blue-600 text-white dark:bg-blue-950 dark:border-y dark:border-blue-900">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <p className="text-lg sm:text-2xl font-medium italic leading-relaxed">
            &ldquo;Switching our 400-student software engineering cohort from
            messy WhatsApp chats to Zedu immediately eliminated communication
            bottlenecks. Our mentors saved over 15 hours a week, and students
            never miss assignment deadlines.&rdquo;
          </p>
          <div className="mt-6">
            <p className="font-bold text-base">Tobi Adeleke</p>
            <p className="text-xs text-blue-200 dark:text-blue-300">
              Program Director & Curriculum Lead, TechCohort Africa
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Migration FAQ
            </h2>
            <p className="mt-3 text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </p>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              Everything you need to know about making the switch to Zedu.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {migrationFaqs.map((faq, fIdx) => (
              <AccordionItem
                key={fIdx}
                value={`faq-${fIdx}`}
                className="rounded-xl border border-slate-200 bg-white px-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <AccordionTrigger className="text-left font-semibold text-slate-900 hover:no-underline dark:text-white text-base py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl bg-slate-900 p-8 sm:p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden dark:border dark:border-slate-800">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Ready to Upgrade Your Cohort Experience?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
                Join forward-thinking educators and modern bootcamps building
                higher-retention learning communities with Zedu.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-500"
                >
                  <span>Start Free on Zedu</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/contact-sales"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 px-8 py-4 text-base font-semibold text-slate-200 transition-all hover:bg-slate-800 hover:text-white"
                >
                  <span>Talk to Sales</span>
                </Link>
              </div>

              <p className="mt-6 text-xs text-slate-400">
                No credit card required • Free forever plan available • Instant
                setup
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
