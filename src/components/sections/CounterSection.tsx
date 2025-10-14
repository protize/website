import React, { useEffect, useState } from "react";

const countersData = [
  { label: "Created Projects", target: 12 },
  { label: "Projects", target: 200 },
  { label: "Happy Clients", target: 120 },
  { label: "Years", target: 5 },
];

export default function CounterSection() {
  const [counters, setCounters] = useState(countersData.map(() => 0));

  useEffect(() => {
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setCounters(
        countersData.map((counter) => Math.ceil(counter.target * progress))
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  return (
    <section className="relative">
      <div className="mx-auto lg:mx-0 p-5 sm:p-6 py-6 sm:py-8 rounded-3xl bg-box-bg hover:bg-slate-200 border border-box-border shadow-lg shadow-box-shadow md:divide-x divide-box-border grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 md:gap-6 lg:gap-12">
        {counters.map((count, index) => (
          <div key={countersData[index].label} className="text-center">
            <h2 className="font-semibold text-xl sm:text-2xl md:text-4xl text-heading-1">
              {count}
            </h2>
            <p className="mt-2 text-heading-3">{countersData[index].label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
