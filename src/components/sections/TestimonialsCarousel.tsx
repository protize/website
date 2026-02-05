import { useEffect, useMemo, useRef, useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

type Testimonial = {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Priya Nair",
    role: "Product Head",
    company: "NovaCare Health",
    content:
      "Protize transformed our idea into a production-ready platform with a clean architecture and fast delivery. Their team handled backend APIs, admin workflows, and reporting with excellent reliability.",
    rating: 5,
    avatar: "/images/avatars/sean.jpeg",
  },
  {
    name: "Daniel Brooks",
    role: "Co-Founder",
    company: "RouteWave Logistics",
    content:
      "Working with Protize felt like having an extended engineering team. They improved our dashboard performance, automated operations, and delivered every sprint with clear communication and ownership.",
    rating: 5,
    avatar: "/images/avatars/amit.jpeg",
  },
  {
    name: "Fatima Al-Mansoori",
    role: "Operations Director",
    company: "StayScape Travel",
    content:
      "Protize built our travel booking system end-to-end and made complex flows simple for our staff and customers. The final product is fast, secure, and easy to scale as our business grows.",
    rating: 5,
    avatar: "/images/avatars/alex.jpeg",
  },
];

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [animateSlide, setAnimateSlide] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  const total = testimonials.length;

  const visibleCards = useMemo(() => {
    if (total === 0) return [];
    if (total === 1) return [testimonials[0]];
    return [testimonials[index], testimonials[(index + 1) % total]];
  }, [index, total]);

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
    if (prefersReducedMotion || total <= 1) return;

    const id = window.setInterval(goNext, 4500);
    return () => window.clearInterval(id);
  }, [total]);

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
            What Clients Say
          </h2>
          <p className="text-slate-600">
            Real feedback from leaders we’ve collaborated with across product
            and engineering teams.
          </p>
        </div>

        {/* Two cards */}
        <div
          className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-300 ${
            animateSlide ? "opacity-95 scale-[0.99]" : "opacity-100 scale-100"
          }`}
        >
          {visibleCards.map((item, cardIdx) => (
            <article
              key={`${item.name}-${index}-${cardIdx}`}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <Quote className="text-blue-600/20 w-10 h-10 md:w-12 md:h-12 shrink-0" />
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>

              <p className="text-slate-800 mt-4 mb-6 leading-relaxed">
                “{item.content}”
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  loading="lazy"
                />
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">
                    {item.role} @ {item.company}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-100 transition-colors"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>

          <div className="flex items-center gap-2 px-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
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
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </div>
    </section>
  );
}
