import abhishek from "../assets/team/abhishek.avif";
import karan from "../assets/team/karan.avif";
import ishan from "../assets/team/ishan-baisoya.avif";
import thomas from "../assets/team/thomas-colvin.avif";
import jay from "../assets/team/jay.png";
import jatin from "../assets/team/jatin.png";
import alok from "../assets/team/alok.png";
import alankrit from "../assets/team/alankrit.png";
import sid from "../assets/team/sid.png";

const members = [
  {
    name: "Abhishek Gupta",
    role: "Founder & Principal Software Engineer",
    bio: "",
    image: abhishek,
    socials: [
      { label: "linkedin", href: "https://linkedin.com/in/alice" },
      { label: "github", href: "https://github.com/alice" },
    ],
  },
  {
    name: "Karan Bohra",
    role: "Lead Software Engineer",
    bio: "",
    image: karan,
    socials: [
      { label: "linkedin", href: "https://linkedin.com/in/alice" },
      { label: "github", href: "https://github.com/alice" },
    ],
  },
  {
    name: "Ishan Baisoya",
    role: "Financial Analyst",
    bio: "",
    image: ishan,
    socials: [
      { label: "linkedin", href: "https://linkedin.com/in/alice" },
      { label: "github", href: "https://github.com/alice" },
    ],
  },
  {
    name: "Thomas Colvin",
    role: "Senior Software Engineer",
    bio: "",
    image: thomas,
    socials: [
      { label: "linkedin", href: "https://linkedin.com/in/alice" },
      { label: "github", href: "https://github.com/alice" },
    ],
  },
  {
    name: "Jayshrilal Pandit",
    role: "Software Developer",
    bio: "",
    image: jay,
    socials: [
      { label: "linkedin", href: "https://linkedin.com/in/alice" },
      { label: "github", href: "https://github.com/alice" },
    ],
  },
  {
    name: "Jatin Jayal",
    role: "Software Engineer",
    bio: "",
    image: jatin,
    socials: [
      { label: "linkedin", href: "https://linkedin.com/in/alice" },
      { label: "github", href: "https://github.com/alice" },
    ],
  },
  {
    name: "Alok Sharma",
    role: "Frontend & Backend Developer",
    bio: "",
    image: alok,
    socials: [
      { label: "linkedin", href: "https://www.linkedin.com/in/aloksharma-ak/" },
      { label: "github", href: "https://github.com/aloksharma-ak" },
    ],
  },
  {
    name: "Alankrit Agrawal",
    role: "Data Analyst",
    bio: "",
    image: alankrit,
    socials: [
      { label: "linkedin", href: "https://linkedin.com/in/alice" },
      { label: "github", href: "https://github.com/alice" },
    ],
  },
  {
    name: "Sidharth Mehra",
    role: "UI/UX Designer",
    bio: "",
    image: sid,
    socials: [
      { label: "linkedin", href: "https://linkedin.com/in/alice" },
      { label: "github", href: "https://github.com/alice" },
    ],
  },
];

const Portfolio = [
  {
    title: "Payment Success Uplift for Multi-Acquirer Gateway",
    industry: "Fintech",
    problem:
      "Low success rate during peak traffic windows caused revenue leakage and support escalations.",
    solution: [
      "Introduced acquirer-wise routing with real-time fallback",
      "Optimized retries & timeouts; added idempotency guards",
      "Built merchant dashboard for live SR, UTR, and chargeback visibility",
    ],
    outcome: [
      { label: "Success Rate", value: "+8.7%" },
      { label: "Checkout Time", value: "−22%" },
      { label: "Support Tickets", value: "−41%" },
    ],
    href: "/portfolio/payment-success-uplift",
  },
  {
    title: "Catalog Ops Automation for D2C Apparel",
    industry: "E-commerce",
    problem:
      "Manual image prep & product onboarding delayed launches and introduced data inconsistency.",
    solution: [
      "Automated image pipelines (normalize, alt-text, variants)",
      "Bulk CSV/XLSX importers with validation & rollbacks",
      "Lightweight PIM with roles, drafts, and audit logs",
    ],
    outcome: [
      { label: "Time-to-List", value: "−65%" },
      { label: "Ops Errors", value: "−72%" },
      { label: "New SKUs/Week", value: "3×" },
    ],
    href: "/portfolio/catalog-ops-automation",
  },
  {
    title: "Scaling Real-Money Gaming During Tournaments",
    industry: "Gaming",
    problem:
      "Spikes during tournaments caused latency, queue backlogs, and wallet reconciliation delays.",
    solution: [
      "Horizontally scaled APIs with read/write splitting",
      "Wallet ledger refactor; async settlements with retries",
      "Realtime observability (APM, traces, threshold alerts)",
    ],
    outcome: [
      { label: "P99 Latency", value: "−38%" },
      { label: "Throughput", value: "2.4×" },
      { label: "Incidents", value: "−50%" },
    ],
    href: "/portfolio/gaming-scale",
  },
];

export { members, Portfolio };
