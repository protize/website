"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
  Rocket,
  Code2,
  Cloud,
  Database,
  Workflow,
  ArrowRight,
  Sparkles,
  ShoppingCart,
  PlugZap,
  ServerCog,
} from "lucide-react";
import { BorderBeam } from "../../lightswind/border-beam";
import { InteractiveCard } from "../../lightswind/interactive-card";

type Capability = {
  text: string;
  icon: LucideIcon;
  iconClass: string;
  chipClass: string;
};

type ValueItem = {
  title: string;
  text: string;
  icon: LucideIcon;
  iconClass: string;
  chipClass: string;
};

const capabilities: Capability[] = [
  {
    text: "Frontend platforms (Next.js/React) with strong SEO and performance baselines",
    icon: Code2,
    iconClass: "text-blue-700",
    chipClass: "bg-blue-50 ring-blue-100",
  },
  {
    text: "Backend architecture (Node/NestJS), PostgreSQL design, caching, and queue workflows",
    icon: Database,
    iconClass: "text-violet-700",
    chipClass: "bg-violet-50 ring-violet-100",
  },
  {
    text: "Cloud-native delivery on AWS with containerized deployments and CI/CD pipelines",
    icon: Cloud,
    iconClass: "text-cyan-700",
    chipClass: "bg-cyan-50 ring-cyan-100",
  },
  {
    text: "Observability, logging, and reliability engineering for stable production operations",
    icon: Workflow,
    iconClass: "text-emerald-700",
    chipClass: "bg-emerald-50 ring-emerald-100",
  },
  {
    text: "E-commerce architecture, payment orchestration, and transaction-safe workflows",
    icon: ShoppingCart,
    iconClass: "text-amber-700",
    chipClass: "bg-amber-50 ring-amber-100",
  },
  {
    text: "Systems integrations (webhooks, bots, internal tools, third-party APIs)",
    icon: PlugZap,
    iconClass: "text-fuchsia-700",
    chipClass: "bg-fuchsia-50 ring-fuchsia-100",
  },
  {
    text: "Modernization of legacy systems with phased migration and minimal downtime",
    icon: ServerCog,
    iconClass: "text-rose-700",
    chipClass: "bg-rose-50 ring-rose-100",
  },
];

const values: ValueItem[] = [
  {
    title: "Architecture Discipline",
    text: "We prioritize maintainable system design, clear boundaries, and practical scalability.",
    icon: Rocket,
    iconClass: "text-blue-700",
    chipClass: "bg-blue-50 ring-blue-100",
  },
  {
    title: "Security-First Engineering",
    text: "Threat-aware development with least-privilege controls, secure defaults, and auditability.",
    icon: ShieldCheck,
    iconClass: "text-emerald-700",
    chipClass: "bg-emerald-50 ring-emerald-100",
  },
  {
    title: "Operational Reliability",
    text: "Testing, monitoring, and incident-ready observability are part of the delivery baseline.",
    icon: Workflow,
    iconClass: "text-violet-700",
    chipClass: "bg-violet-50 ring-violet-100",
  },
  {
    title: "Execution Transparency",
    text: "Scope clarity, milestone accountability, and proactive communication from kickoff to release.",
    icon: Sparkles,
    iconClass: "text-cyan-700",
    chipClass: "bg-cyan-50 ring-cyan-100",
  },
];

const highlightCards = [
  {
    title: "System design that lasts",
    text: "We design with long-term maintainability in mind so growth doesn’t create technical drag.",
  },
  {
    title: "Production-grade delivery",
    text: "Clean release pipelines, rollback strategy, and visibility into system health by default.",
  },
  {
    title: "Performance at every layer",
    text: "From query strategy to frontend rendering, we optimize for speed and stability.",
  },
  {
    title: "Measured collaboration",
    text: "Clear milestones, documentation, and engineering decisions aligned with product priorities.",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const cardIn = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.42,
      delay: i * 0.06,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

type PremiumCardProps = {
  children: React.ReactNode;
  className?: string;
  interactiveColor?: string;
  disableEffects?: boolean;
};

function PremiumCard({
  children,
  className = "",
  interactiveColor = "#3B82F6",
  disableEffects = false,
}: PremiumCardProps) {
  return (
    <div
      className={`group relative h-full overflow-hidden rounded-2xl ${className}`}
    >
      {!disableEffects && (
        <div className="pointer-events-none absolute inset-0 z-[1]">
          <BorderBeam
            colorFrom="rgba(37,99,235,0.35)"
            colorTo="rgba(56,189,248,0.35)"
            size={56}
            duration={8}
            borderThickness={1.25}
            glowIntensity={1.2}
          />
        </div>
      )}

      <InteractiveCard
        InteractiveColor={interactiveColor}
        tailwindBgClass="bg-white/10 backdrop-blur-sm"
        className="relative z-[2] h-full transition-transform duration-300 group-hover:-translate-y-0.5"
      >
        <div className="relative z-10 h-full">{children}</div>
      </InteractiveCard>
    </div>
  );
}

function About() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative mx-auto w-full max-w-7xl overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "show"}
        viewport={{ once: true, amount: 0.15 }}
        className="space-y-14 sm:space-y-16"
      >
        {/* Who we are + highlights */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <motion.div variants={fadeUp} className="space-y-5 lg:col-span-7">
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-left">
              Who we are &amp; what we do
            </h2>

            <p className="text-base leading-7 max-w-xl text-slate-700 sm:text-[1.02rem]">
              Protize is an engineering-led digital partner that designs,
              builds, and scales web and mobile products for modern businesses.
              We combine product thinking with strong architecture across
              Next.js/React, Node/NestJS, cloud infrastructure, and
              observability to deliver secure, maintainable platforms. From
              greenfield builds to legacy modernization, we execute with clear
              milestones and transparent communication to reduce risk and
              accelerate outcomes.
            </p>

            <div className="pt-1 text-center md:text-left">
              <a
                href="/contact-us"
                aria-label="Explore services"
                className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-slate-300 px-6 py-3 bg-blue-600 text-white outline-none transition-colors duration-300 hover:text-white sm:w-auto"
              >
                <span className="relative z-10">Get in touch</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-0 aspect-square w-full origin-center scale-0 rounded-full bg-[#172554] opacity-70 transition duration-300 ease-linear group-hover:scale-[2.5] group-hover:opacity-100"
                />
              </a>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 xl:grid-cols-2"
          >
            {highlightCards.map((item, idx) => (
              <motion.div
                key={`${item.title}-${idx}`}
                custom={idx}
                variants={cardIn}
                className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-3 h-1 w-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
                <h3 className="text-base font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Core expertise */}
        <motion.div variants={fadeUp} className="space-y-5">
          <div className="space-y-2 text-center">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Core Expertise
            </h3>
            <p className="mx-auto max-w-2xl text-slate-600">
              Focused capabilities across product engineering, cloud operations,
              and systems integration.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {capabilities.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.li
                  key={`${item.text}-${i}`}
                  custom={i}
                  variants={cardIn}
                  className="flex h-full items-start gap-3 rounded-xl border border-slate-200/80 bg-white/85 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span
                    className={`mt-0.5 inline-flex rounded-lg p-1.5 ring-1 ${item.chipClass} ${item.iconClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm leading-6 text-slate-700">
                    {item.text}
                  </span>
                </motion.li>
              );
            })}
          </ul>

          <div className="pt-1 text-center">
            <a
              href="/services"
              aria-label="Explore services"
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-slate-300 px-6 py-3 bg-blue-600 text-white outline-none transition-colors duration-300 hover:text-white sm:w-auto"
            >
              <span className="relative z-10">Explore services</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 aspect-square w-full origin-center scale-0 rounded-full bg-[#172554] opacity-70 transition duration-300 ease-linear group-hover:scale-[2.5] group-hover:opacity-100"
              />
            </a>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div variants={fadeUp} className="space-y-7">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Our values
            </h2>
            <p className="mt-2 text-slate-600">
              Engineering principles that keep products secure, stable, and
              scalable.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {values.map((v, i) => {
              const Icon = v.icon;

              return (
                <motion.div
                  key={v.title}
                  custom={i}
                  variants={cardIn}
                  className="h-full"
                >
                  <PremiumCard
                    className="h-full p-[1px]"
                    interactiveColor="#9AC1FF"
                    disableEffects={Boolean(reduceMotion)}
                  >
                    <div className="flex h-full flex-col items-center justify-center p-5 text-center">
                      <div
                        className={`inline-flex rounded-xl p-2 ring-1 ${v.chipClass} ${v.iconClass}`}
                      >
                        <Icon className="h-10 w-10 sm:h-11 sm:w-11" />
                      </div>

                      <h3 className="mt-3 text-base font-semibold text-slate-900">
                        {v.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-6 text-slate-600">
                        {v.text}
                      </p>
                    </div>
                  </PremiumCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default About;
