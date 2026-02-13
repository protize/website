import type { LucideIcon } from "lucide-react";
import {
  Globe,
  Smartphone,
  Cloud,
  Palette,
  Cog,
  Lightbulb,
  Brain,
  Workflow,
  BarChart3,
} from "lucide-react";

export type Service = {
  id: string;
  title: string;
  icon: LucideIcon;
  image: string;
  shortDescription: string;
  description: string;
  features: string[];
  technologies: string[];
};

export const services: Service[] = [
  {
    id: "web-development",
    title: "Web Development",
    icon: Globe,
    image: "/images/5569517_2885174.jpg",
    shortDescription:
      "Custom, responsive websites built with modern technologies for optimal performance and user experience.",
    description:
      "We create stunning, high-performance websites tailored to your business needs. Our team leverages cutting-edge technologies to build scalable, responsive web applications that engage users and drive results. From simple landing pages to complex web platforms, we deliver solutions that exceed expectations.",
    features: [
      "Responsive Design for All Devices",
      "SEO-Optimized Architecture",
      "Fast Loading Speeds",
      "Modern UI/UX Design",
      "CMS Integration",
      "E-commerce Solutions",
      "Progressive Web Apps (PWA)",
      "API Development & Integration",
    ],
    technologies: [
      "React",
      "Vue.js",
      "Next.js",
      "Astro",
      "Node.js",
      "Tailwind CSS",
    ],
  },
  {
    id: "mobile-app-development",
    title: "Mobile App Development",
    icon: Smartphone,
    image: "/images/86868887979779.jpg",
    shortDescription:
      "Native and cross-platform mobile applications for iOS and Android that users love.",
    description:
      "Transform your ideas into powerful mobile applications. We specialize in creating intuitive, feature-rich mobile apps for iOS and Android platforms. Whether you need a native app or cross-platform solution, our experienced developers ensure seamless performance and exceptional user experience.",
    features: [
      "Native iOS & Android Development",
      "Cross-Platform Solutions",
      "Intuitive User Interface",
      "Offline Functionality",
      "Push Notifications",
      "Payment Gateway Integration",
      "Real-time Synchronization",
      "App Store Deployment",
    ],
    technologies: [
      "React Native",
      "Flutter",
      "Swift",
      "Kotlin",
      "Firebase",
      "Redux",
    ],
  },
  {
    id: "cloud-solutions",
    title: "Cloud Solutions",
    icon: Cloud,
    image: "/images/cloud-solution.png",
    shortDescription:
      "Scalable cloud infrastructure and migration services for modern businesses.",
    description:
      "Leverage the power of cloud computing with our comprehensive cloud solutions. We help businesses migrate, optimize, and manage their infrastructure on leading cloud platforms. Our experts ensure your applications are secure, scalable, and cost-effective.",
    features: [
      "Cloud Migration Strategy",
      "Infrastructure as Code",
      "Auto-scaling Solutions",
      "Cost Optimization",
      "Security & Compliance",
      "Disaster Recovery",
      "Multi-cloud Management",
      "Serverless Architecture",
    ],
    technologies: [
      "AWS",
      "Azure",
      "Google Cloud",
      "Docker",
      "Kubernetes",
      "Terraform",
    ],
  },
  {
    id: "ui-ux-design",
    title: "UI/UX Design",
    icon: Palette,
    image: "/images/ui-ux.png",
    shortDescription:
      "User-centered design that creates engaging and intuitive digital experiences.",
    description:
      "Great design is at the heart of every successful digital product. Our UI/UX designers create beautiful, intuitive interfaces that delight users and achieve business goals. Through research, prototyping, and testing, we ensure every interaction is meaningful and enjoyable.",
    features: [
      "User Research & Analysis",
      "Wireframing & Prototyping",
      "Visual Design",
      "Interaction Design",
      "Usability Testing",
      "Design Systems",
      "Brand Identity",
      "Accessibility Standards",
    ],
    technologies: [
      "Figma",
      "Adobe XD",
      "Sketch",
      "InVision",
      "Framer",
      "Principle",
    ],
  },
  {
    id: "devops-automation",
    title: "DevOps & Automation",
    icon: Cog,
    image: "/images/dev-ops.png",
    shortDescription:
      "Streamline your development workflow with CI/CD pipelines and automation.",
    description:
      "Accelerate your software delivery with our DevOps expertise. We implement robust CI/CD pipelines, automate infrastructure management, and optimize your development workflow. Our solutions reduce deployment time, minimize errors, and improve team collaboration.",
    features: [
      "CI/CD Pipeline Setup",
      "Infrastructure Automation",
      "Container Orchestration",
      "Monitoring & Logging",
      "Security Automation",
      "Performance Optimization",
      "Version Control Strategy",
      "Automated Testing",
    ],
    technologies: [
      "Jenkins",
      "GitLab CI",
      "GitHub Actions",
      "Ansible",
      "Prometheus",
      "Grafana",
    ],
  },
  {
    id: "it-consulting",
    title: "IT Consulting",
    icon: Lightbulb,
    image: "/images/consulting.png",
    shortDescription:
      "Strategic technology guidance to drive digital transformation and business growth.",
    description:
      "Navigate the complex technology landscape with confidence. Our IT consultants provide strategic guidance to help you make informed technology decisions, optimize your IT infrastructure, and drive digital transformation. We align technology with your business objectives to maximize ROI.",
    features: [
      "Technology Strategy",
      "Digital Transformation",
      "IT Infrastructure Assessment",
      "Vendor Selection",
      "Security Audits",
      "Process Optimization",
      "Technology Roadmapping",
      "Training & Support",
    ],
    technologies: [
      "Enterprise Architecture",
      "ITIL",
      "Agile",
      "Scrum",
      "SAFe",
      "TOGAF",
    ],
  },
  {
    id: "ai-ml",
    title: "AI / ML Solutions",
    icon: Brain,
    image: "/images/ai-ml.png",
    shortDescription:
      "AI-powered products and automation using LLMs, RAG, and machine learning to boost efficiency and unlock insights.",
    description:
      "Build intelligent systems that automate workflows, enhance customer experiences, and generate actionable insights. We design and deploy AI/ML solutions—from LLM-based assistants and RAG search to custom ML models—integrated securely into your web, mobile, and enterprise platforms.",
    features: [
      "LLM Apps & Assistants (Chatbots, Copilots)",
      "RAG (Retrieval-Augmented Generation)",
      "Vector Search & Knowledge Bases",
      "Text Classification & NLP Pipelines",
      "Recommendations & Personalization",
      "Document AI (OCR, Extraction, Summarization)",
      "Speech (STT/TTS) & Voice Bots",
      "Model Evaluation, Monitoring & Guardrails",
    ],
    technologies: [
      "OpenAI",
      "LangChain",
      "LlamaIndex",
      "Python",
      "PyTorch",
      "TensorFlow",
      "Vector DBs (Pinecone/Qdrant/Weaviate)",
      "MLflow",
    ],
  },

  {
    id: "automation-scripting",
    title: "Automation & Scripting",
    icon: Workflow,
    image: "/images/automation.png",
    shortDescription:
      "Custom automation to reduce manual work—scripts, bots, integrations, and reliable job pipelines.",
    description:
      "We automate repetitive tasks across systems and teams—data sync, reporting, notifications, compliance workflows, and ops routines. From quick scripts to scalable automation pipelines, we build maintainable solutions that save time, minimize errors, and improve operational reliability.",
    features: [
      "Custom Scripts & CLI Tools",
      "API Integrations & Webhooks",
      "Background Jobs & Scheduling",
      "ETL Automation & Data Sync",
      "Alerts, Notifications & ChatOps Bots",
      "Batch Processing & File Pipelines (CSV/Excel/PDF)",
      "RPA-style Workflow Automations",
      "DevOps Automation (Build/Deploy/Infra Tasks)",
    ],
    technologies: [
      "Node.js",
      "Python",
      "Bash",
      "PowerShell",
      "Cron",
      "BullMQ",
      "Zapier/Make",
      "GitHub Actions",
    ],
  },

  {
    id: "data-analytics",
    title: "Data Analytics",
    icon: BarChart3,
    image: "/images/data-analytics.png",
    shortDescription:
      "Dashboards, reporting, and analytics pipelines to track KPIs, find trends, and drive smarter decisions.",
    description:
      "Turn raw data into clear insights. We build analytics pipelines, dashboards, and automated reporting for product, finance, operations, and growth teams. Whether you need real-time metrics, monthly reports, or advanced analysis, we design solutions that are accurate, secure, and scalable.",
    features: [
      "KPI Dashboards & Executive Reporting",
      "Data Modeling & Warehousing",
      "ETL / ELT Pipelines",
      "Real-time & Time-series Analytics",
      "Cohort, Funnel & Retention Analysis",
      "Data Quality Checks & Monitoring",
      "Automated Scheduled Reports",
      "Forecasting & Trend Analysis",
    ],
    technologies: [
      "PostgreSQL",
      "Redis",
      "Python",
      "Pandas",
      "Power BI",
      "Metabase",
      "Superset",
      "Elasticsearch/OpenSearch",
    ],
  },
];

export default services;
