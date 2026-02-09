"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
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
} from "lucide-react";
import { BorderBeam } from "../../lightswind/border-beam";
import { InteractiveCard } from "../../lightswind/interactive-card";

const capabilities = [
  {
    text: "Custom Web & Mobile Apps (React/Next.js, Flutter)",
    icon: Code2,
    iconClass: "text-blue-700",
    chipClass: "bg-blue-50 ring-blue-100",
  },
  {
    text: "Backend & APIs (Node/NestJS, PostgreSQL, Redis, BullMQ)",
    icon: Database,
    iconClass: "text-violet-700",
    chipClass: "bg-violet-50 ring-violet-100",
  },
  {
    text: "Cloud & DevOps (AWS, Docker, CI/CD, IaC)",
    icon: Cloud,
    iconClass: "text-cyan-700",
    chipClass: "bg-cyan-50 ring-cyan-100",
  },
  {
    text: "Data & Analytics (Pandas, SQL, dashboards)",
    icon: Workflow,
    iconClass: "text-emerald-700",
    chipClass: "bg-emerald-50 ring-emerald-100",
  },
  {
    text: "E-commerce (WooCommerce, Shopify, payments)",
    icon: ShoppingCart,
    iconClass: "text-amber-700",
    chipClass: "bg-amber-50 ring-amber-100",
  },
  {
    text: "Integrations (Slack, Telegram bots, webhooks)",
    icon: PlugZap,
    iconClass: "text-fuchsia-700",
    chipClass: "bg-fuchsia-50 ring-fuchsia-100",
  },
  {
    text: "E-commerce (WooCommerce, Shopify, payments)",
    icon: ShoppingCart,
    iconClass: "text-rose-700",
    chipClass: "bg-rose-50 ring-rose-100",
  },
];

const values = [
  {
    title: "Ownership",
    text: "We act like product owners, not vendors—prioritizing outcomes over outputs.",
    icon: Rocket,
    iconClass: "text-blue-700",
    chipClass: "bg-blue-50 ring-blue-100",
  },
  {
    title: "Security by Design",
    text: "OWASP-first development, threat modeling, and infra hardening from day one.",
    icon: ShieldCheck,
    iconClass: "text-emerald-700",
    chipClass: "bg-emerald-50 ring-emerald-100",
  },
  {
    title: "Velocity with Quality",
    text: "Automated testing, CI/CD, and observability to ship fast without surprises.",
    icon: Workflow,
    iconClass: "text-violet-700",
    chipClass: "bg-violet-50 ring-violet-100",
  },
  {
    title: "Transparent Partnering",
    text: "Clear estimates, proactive updates, and zero hidden costs.",
    icon: Sparkles,
    iconClass: "text-cyan-700",
    chipClass: "bg-cyan-50 ring-cyan-100",
  },
];

const capabilityIcons = [Code2, Database, Cloud, Workflow, Rocket, Sparkles];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const cardIn = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      delay: i * 0.07,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

type PremiumCardProps = {
  children: React.ReactNode;
  className?: string;
  interactiveColor?: string;
};

function PremiumCard({
  children,
  className = "",
  interactiveColor = "#3B82F6",
}: PremiumCardProps) {
  return (
    <div
      className={`group relative h-full overflow-hidden rounded-2xl ${className}`}
    >
      {/* Animated beam border layer */}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <BorderBeam
          colorFrom="rgba(37,99,235,0.42)"
          colorTo="rgba(56,189,248,0.42)"
          size={64}
          duration={7}
          borderThickness={1.5}
          glowIntensity={1.8}
        />
      </div>

      {/* Interactive surface */}
      <InteractiveCard
        InteractiveColor={interactiveColor}
        tailwindBgClass=""
        className="relative z-[2] h-full transition-all duration-300"
      >
        <div className="relative z-10 h-full">{children}</div>
      </InteractiveCard>
    </div>
  );
}

function About() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative mx-auto w-full max-w-7xl overflow-hidden px-4 py-14 sm:px-8 md:px-12 lg:px-6">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
        className="space-y-12"
      >
        {/* Top */}
        <div className="grid items-start gap-8 md:grid-cols-2 lg:gap-10">
          <motion.div variants={fadeUp} className="space-y-5">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Who we are
            </h2>

            <p className="leading-relaxed text-slate-700">
              Founded with a builder’s mindset, Protize blends product thinking
              with deep engineering. We’ve shipped payment gateways, data
              platforms, and high-traffic web apps with zero-downtime releases
              and strong SLAs.
            </p>

            <p className="leading-relaxed text-slate-700">
              Our teams are small, senior, and autonomous—focused on clarity,
              measurable progress, and long-term maintainability.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Product-minded engineers",
                  text: "We ask “why” before “how,” aligning tech with business outcomes.",
                },
                {
                  title: "Security & reliability",
                  text: "From auth to observability, we bake reliability into every layer.",
                },
                {
                  title: "Product-minded engineers",
                  text: "We ask “why” before “how,” aligning tech with business outcomes.",
                },
                {
                  title: "Security & reliability",
                  text: "From auth to observability, we bake reliability into every layer.",
                },
              ].map((item, idx) => (
                <motion.div
                  key={`${item.title}-${idx}`}
                  variants={cardIn}
                  custom={idx}
                  className="relative overflow-hidden border border-slate-200 bg-white/70 px-5 py-4 rounded-xl shadow-lg"
                >
                  <div className="pointer-events-none absolute inset-0 z-[1]">
                    <BorderBeam
                      colorFrom="rgba(37,99,235,0.42)"
                      colorTo="rgba(56,189,248,0.42)"
                      size={64}
                      duration={7}
                      borderThickness={10}
                      glowIntensity={8}
                    />
                  </div>

                  <div className="relative z-[2] p-5">
                    <h3 className="font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {item.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="p-6 pt-0">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  What we do
                </h3>
              </div>

              <ul className="grid gap-2.5">
                {capabilities.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.li
                      key={`${item.text}-${i}`}
                      custom={i}
                      variants={cardIn}
                      className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5"
                    >
                      <span
                        className={`mt-0.5 rounded-md p-1 ring-1 ${item.chipClass} ${item.iconClass}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm leading-relaxed text-slate-700">
                        {item.text}
                      </span>
                    </motion.li>
                  );
                })}
              </ul>

              <a
                href="/services"
                className="mt-6 group inline-flex items-center gap-2 px-6 py-3 rounded-full outline-none relative overflow-hidden border border-slate-300 text-slate-900 duration-300 ease-linear hover:text-white"
              >
                <span className="relative z-10">Explore services</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                <span
                  className="pointer-events-none absolute inset-x-0 left-0 top-0 aspect-square scale-0 rounded-full bg-[#172554] opacity-70 origin-center transition duration-300 ease-linear group-hover:scale-[2.5] group-hover:opacity-100"
                  aria-hidden="true"
                />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Our values
          </h2>
          <p className="mt-2 text-slate-600">
            Principles that keep our work calm, focused, and consistently
            excellent.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 ">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                custom={i}
                variants={cardIn}
                initial={reduceMotion ? false : "hidden"}
                whileInView={reduceMotion ? undefined : "show"}
                viewport={{ once: true, amount: 0.2 }}
              >
                <PremiumCard
                  className="h-full p-[1px]"
                  interactiveColor="#9ac1ff"
                >
                  <div className="h-full p-5 text-center flex flex-col justify-center items-center">
                    <div
                      className={`inline-flex rounded-xl p-2 ring-1 ${v.chipClass} ${v.iconClass}`}
                    >
                      <Icon className="h-14 w-14" />
                    </div>
                    <h3 className="mt-3 font-semibold text-slate-900">
                      {v.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {v.text}
                    </p>
                  </div>
                </PremiumCard>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

export default About;
