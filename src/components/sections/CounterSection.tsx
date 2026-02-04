import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

type CounterItem = {
  label: string;
  target: number;
  suffix?: string;
  description?: string;
  icon: ReactNode;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function CounterSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const countersData: CounterItem[] = useMemo(
    () => [
      {
        label: "Projects Delivered",
        target: 28,
        suffix: "+",
        description: "",
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        ),
      },
      {
        label: "Active Products",
        target: 13,
        suffix: "+",
        description: "",
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 3l9 6-9 6-9-6 9-6z" />
            <path d="M3 9v6l9 6 9-6V9" />
          </svg>
        ),
      },
      {
        label: "Happy Clients",
        target: 25,
        suffix: "+",
        description: "",
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
      },
      {
        label: "Years Experience",
        target: 11,
        suffix: "+",
        description: "",
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        ),
      },
    ],
    [],
  );

  const [counters, setCounters] = useState(() => countersData.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      {
        threshold: 0.25,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    // Respect reduced-motion users
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReducedMotion) {
      setCounters(countersData.map((c) => c.target));
      return;
    }

    const duration = 1500; // base duration per item
    const stagger = 110; // delay between cards
    const total = duration + stagger * (countersData.length - 1);

    const start = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    let raf = 0;

    const animate = (now: number) => {
      const elapsed = now - start;

      setCounters(
        countersData.map((c, idx) => {
          const localElapsed = elapsed - idx * stagger;
          const t = clamp(localElapsed / duration, 0, 1);
          const eased = easeOutCubic(t);
          return Math.round(c.target * eased);
        }),
      );

      if (elapsed < total) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [hasAnimated, countersData]);

  return (
    <section ref={sectionRef} className="relative">
      <div className="grid grid-cols-1 gap-3 sm:gap-5 md:grid-cols-4">
        {countersData.map((item, idx) => (
          <div
            key={item.label}
            className="group relative rounded-2xl bg-gradient-to-br from-indigo-500/20 via-emerald-500/15 to-fuchsia-500/20 p-[1px] shadow-[0_18px_50px_-25px_rgba(2,6,23,0.25)]"
          >
            <div className="relative h-full rounded-2xl bg-white/70 backdrop-blur-xl p-4 sm:p-5 ring-1 ring-slate-200/70 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-white/80 group-hover:ring-slate-300/70 group-hover:shadow-[0_22px_60px_-28px_rgba(2,6,23,0.35)]">
              <div className="pointer-events-none absolute -inset-16 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.65),transparent_60%)] blur-xl" />
              </div>

              <div className="mt-4 text-center">
                <div className="flex items-baseline gap-1 justify-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight tabular-nums text-slate-900">
                    {counters[idx]}
                  </div>
                  {item.suffix && (
                    <div className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-600">
                      {item.suffix}
                    </div>
                  )}
                </div>

                <p className="mt-1 text-sm sm:text-base font-semibold text-slate-800">
                  {item.label}
                </p>

                {item.description && (
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-snug">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
