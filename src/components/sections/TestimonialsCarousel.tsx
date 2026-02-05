import { useEffect, useRef, useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

type Testimonial = {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
};

const testimonials: Testimonial[] = [
  {
    name: "Aarav Mehta",
    role: "Founder",
    company: "Velocity Commerce",
    content:
      "Protize helped us ship faster without compromising quality. Their architecture-first approach gave us a stable foundation for growth.",
    rating: 5,
  },
  {
    name: "Nisha Verma",
    role: "Head of Product",
    company: "MedixCare",
    content:
      "From planning to launch, communication was clear and execution was reliable. We saw measurable performance gains within weeks.",
    rating: 5,
  },
  {
    name: "Rohit Kapoor",
    role: "CTO",
    company: "PayGrid Labs",
    content:
      "Excellent engineering depth. They streamlined our backend flows and improved reliability during peak traffic windows.",
    rating: 5,
  },
  {
    name: "Elena D’Souza",
    role: "Operations Lead",
    company: "LogiBridge",
    content:
      "Their team built dashboards and workflow automation that reduced manual effort across teams. Great long-term partner mindset.",
    rating: 5,
  },
];

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [animateSlide, setAnimateSlide] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  const total = testimonials.length;
  const current = testimonials[index];

  const goTo = (i: number) => {
    setAnimateSlide(true);
    setIndex(i);
  };

  const goNext = () => {
    setAnimateSlide(true);
    setIndex((prev) => (prev + 1) % total);
  };

  const goPrev = () => {
    setAnimateSlide(true);
    setIndex((prev) => (prev - 1 + total) % total);
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReducedMotion) return;

    const id = window.setInterval(goNext, 4500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!animateSlide) return;
    const id = window.setTimeout(() => setAnimateSlide(false), 280);
    return () => window.clearTimeout(id);
  }, [animateSlide]);

  return (
    <section
      ref={sectionRef}
      className={`py-16 md:py-20 bg-slate-50 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      aria-label="Client testimonials"
    >
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="text-blue-600 font-semibold">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-slate-900">
            What Clients Say About Protize
          </h2>
          <p className="text-slate-600">
            Trusted by growing teams for scalable delivery, clear communication,
            and dependable outcomes.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Pure Tailwind card */}
          <div
            className={`rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-8 transition-all duration-300 ${
              animateSlide ? "opacity-95 scale-[0.99]" : "opacity-100 scale-100"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <Quote className="text-blue-600/20 w-10 h-10 md:w-12 md:h-12 shrink-0" />
              <div className="flex gap-1 mt-1">
                {Array.from({ length: current.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
            </div>

            <p className="text-slate-800 mt-4 mb-6 md:text-lg leading-relaxed">
              “{current.content}”
            </p>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold">
                {current.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{current.name}</p>
                <p className="text-sm text-slate-500">
                  {current.role}, {current.company}
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-100 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>

            <div className="flex items-center gap-2 px-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all ${
                    i === index
                      ? "w-6 bg-blue-600"
                      : "w-2.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-100 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
