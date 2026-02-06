import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { FolderKanban, Boxes, Users, Clock3 } from "lucide-react";

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
          <FolderKanban className="h-10 w-10 text-blue-600" strokeWidth={2} />
        ),
      },
      {
        label: "Active Products",
        target: 13,
        suffix: "+",
        description: "",
        icon: <Boxes className="h-10 w-10 text-green-600" strokeWidth={2} />,
      },
      {
        label: "Happy Clients",
        target: 25,
        suffix: "+",
        description: "",
        icon: <Users className="h-10 w-10 text-yellow-600" strokeWidth={2} />,
      },
      {
        label: "Years Experience",
        target: 11,
        suffix: "+",
        description: "",
        icon: <Clock3 className="h-10 w-10 text-cyan-600" strokeWidth={2} />,
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
            className="group relative rounded-2xl bg-gray-100 p-[1px] shadow-[0_18px_50px_-25px_rgba(2,6,23,0.25)]"
          >
            <div className="relative h-full rounded-2xl bg-white/70 backdrop-blur-xl p-4 sm:p-5 ring-1 ring-slate-200/70 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-white/80 group-hover:ring-slate-300/70 group-hover:shadow-[0_22px_60px_-28px_rgba(2,6,23,0.35)]">
              <div className="pointer-events-none absolute -inset-16 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.65),transparent_60%)] blur-xl" />
              </div>

              {/* Icon */}
              <div className="flex justify-center">
                <div className="inline-flex items-center justify-center rounded-xl bg-white/80 p-2.5 ring-1 ring-slate-200 text-slate-700">
                  {item.icon}
                </div>
              </div>

              <div className="mt-4 text-center">
                <div className="flex items-baseline gap-1 justify-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight tabular-nums text-slate-900">
                    {counters[idx]}
                  </div>
                  {item.suffix && (
                    <div className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900">
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
