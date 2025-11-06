import abhishek from "../assets/team/abhishek.avif";
import karan from "../assets/team/karan.avif";
import ishan from "../assets/team/ishan-baisoya.avif";
import thomas from "../assets/team/thomas-colvin.avif";
import jay from "../assets/team/jay.png";
import jatin from "../assets/team/jatin.png";
import alok from "../assets/team/alok.png";
import alankrit from "../assets/team/alankrit.png";

const services = [
  {
    title: "Web & App Engineering",
    features: [
      "Next.js/Astro frontends, PWA ready",
      "NestJS APIs with PostgreSQL",
      "TypeScript-first, modular code",
    ],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" class="w-6 h-6"><path d="M64 48C28.7 48 0 76.7 0 112v288c0 35.3 28.7 64 64 64H224V48H64zM544 48H256V464H544c17.7 0 32-14.3 32-32V80c0-17.7-14.3-32-32-32z"/></svg>`,
  },
  {
    title: "Fintech & Payments",
    features: [
      "Payins, payouts, settlements",
      "Chargebacks & reconciliation",
      "Merchant dashboards & KYC flows",
    ],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" class="w-6 h-6"><path d="M0 128C0 92.7 28.7 64 64 64H576c35.3 0 64 28.7 64 64v32H0V128zM0 208H640V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V208zM96 320a32 32 0 1 0 0 64 32 32 0 1 0 0-64z"/></svg>`,
  },
  {
    title: "Cloud & DevOps",
    features: [
      "AWS (EC2, RDS, S3, CloudFront)",
      "Docker & CI/CD (GitHub Actions)",
      "Scalability, caching & cost control",
    ],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" class="w-6 h-6"><path d="M400 96a112 112 0 0 0-214.4 32A96 96 0 1 0 128 416H512a96 96 0 0 0 16-191.1A112 112 0 0 0 400 96z"/></svg>`,
  },
  {
    title: "Data & Analytics",
    features: [
      "Time-series dashboards & KPIs",
      "ETL with BullMQ & Python",
      "CSV/Excel exports & reports",
    ],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" class="w-6 h-6"><path d="M32 32H96V480H32V32zM160 224h64V480H160V224zM288 128h64V480H288V128zM416 288h64V480H416V288z"/></svg>`,
  },
  {
    title: "AI & Automation",
    features: [
      "Ops copilots & chatbots",
      "Image/text pipelines & RPA",
      "Slack/Telegram workflow bots",
    ],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" class="w-6 h-6"><path d="M256 32a64 64 0 1 1 0 128 64 64 0 1 1 0-128zM96 224h320a64 64 0 0 1 64 64v96a64 64 0 0 1-64 64H384v32a32 32 0 1 1-64 0V448H192v32a32 32 0 1 1-64 0V448H96a64 64 0 0 1-64-64V288a64 64 0 0 1 64-64z"/></svg>`,
  },
  {
    title: "Security & Compliance",
    features: [
      "AuthN/Z, sessions, rate limits",
      "PII handling & audit logs",
      "Backups & disaster recovery",
    ],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" class="w-6 h-6"><path d="M224 0L32 96V240c0 123.7 86.1 243.2 192 272 105.9-28.8 192-148.3 192-272V96L224 0z"/></svg>`,
  },
  {
    title: "UI/UX & Branding",
    features: [
      "Design systems with Tailwind",
      "Accessible, fast interfaces",
      "Landing pages & blogs",
    ],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" class="w-6 h-6"><path d="M32 32H240V240H32V32zM272 32H480V240H272V32zM32 272H240V480H32V272zM272 272H480V480H272V272z"/></svg>`,
  },
  {
    title: "Support & Maintenance",
    features: [
      "24×7 monitoring & alerts",
      "Performance tuning & upgrades",
      "SLA-backed issue resolution",
    ],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" class="w-6 h-6"><path d="M288 32a144 144 0 0 0-144 144v16H96a96 96 0 0 0-96 96v32a96 96 0 0 0 96 96h64V320H96v-32a32 32 0 0 1 32-32h16v64a144 144 0 0 0 288 0V256h16a32 32 0 0 1 32 32v32H416v64h64a96 96 0 0 0 96-96V272a96 96 0 0 0-96-96H432v-16A144 144 0 0 0 288 32z"/></svg>`,
  },
];

const faqs = [
  {
    question: "What does “architecture-first” mean at Protize?",
    answer:
      "We begin with concise design docs and ADRs that define APIs, data models, SLIs/SLOs, and performance budgets. This aligns stakeholders early and keeps delivery predictable as scope evolves.",
  },
  {
    question: "Which tech stack do you specialize in?",
    answer:
      "We ship modern web and platform builds with NestJS, Next.js, Astro, PostgreSQL, BullMQ, Redis, AWS, Docker, and pnpm/Nx. For dashboards we use Tremor. We select components based on your SLAs, scale targets, and compliance needs.",
  },
  {
    question: "How do you measure success?",
    answer:
      "Every project is tied to measurable KPIs: latency (p95/p99), throughput, success rate, error budgets, conversion, and cost ceilings. We wire metrics into CI/CD and observability so regressions are caught early.",
  },
  {
    question: "Can you handle payments and fintech workflows?",
    answer:
      "Yes. We implement payins, payouts, settlements, chargebacks, routing, reconciliations, reserve balances, and merchant dashboards with auditability and compliance guardrails.",
  },
  {
    question: "How do you approach security?",
    answer:
      "Security by default: least-privilege IAM, secret hygiene, rate limits, input validation, audit logs, backups, and DR runbooks. We review dependencies and automate checks in CI.",
  },
  {
    question: "What’s your typical engagement model and timeline?",
    answer:
      "For greenfield MVPs: 4–8 weeks to first launch depending on scope. For platforms: phased milestones. We work on fixed-scope builds or retainer models for continuous delivery.",
  },
  {
    question: "Do you provide SLAs and post-launch support?",
    answer:
      "Yes. We offer SLA-backed support with on-call windows, incident response, and regular maintenance (upgrades, security patches, performance tuning).",
  },
  {
    question: "How do you handle CI/CD and releases?",
    answer:
      "We set up GitHub Actions with test gates, linting, type checks, and preview environments. Releases use tagged artifacts, staged rollouts, and rollback switches for safe cutovers.",
  },
  {
    question: "Who owns the code and data?",
    answer:
      "You do. We commit to your repositories (or hand over a private repo) and provide documentation, runbooks, and knowledge transfer at project close.",
  },
  {
    question: "Can you work under NDA and specific compliance requirements?",
    answer:
      "Absolutely. We routinely execute NDAs and can align to your security reviews, VAPT routines, and data handling policies.",
  },
  {
    question: "What does onboarding look like?",
    answer:
      "We run a short discovery: goals, constraints, KPIs, integrations, and stakeholders. Then we deliver a brief solution outline, milestone plan, and risk log for sign-off before build.",
  },
  {
    question: "How will we track progress and communicate?",
    answer:
      "You’ll get weekly summaries with metrics and risks, access to a shared project board, and demo checkpoints at each milestone.",
  },
];

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
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    socials: [
      { label: "linkedin", href: "https://linkedin.com/in/alice" },
      { label: "github", href: "https://github.com/alice" },
    ],
  },
];

const caseStudies = [
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
    href: "/case-studies/payment-success-uplift",
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
    href: "/case-studies/catalog-ops-automation",
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
    href: "/case-studies/gaming-scale",
  },
];

export { services, faqs, members, caseStudies };
