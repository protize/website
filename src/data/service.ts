import type { LucideIcon } from "lucide-react";
import {
  GraduationCap,
  LayoutDashboard,
  Landmark,
  Workflow,
  Globe,
  Smartphone,
  Blocks,
  LineChart,
  CloudCog,
  Gauge,
  ShieldCheck,
  LifeBuoy,
} from "lucide-react";

export type ServiceItem = {
  title: string;
  features: string[];
  icon: LucideIcon;
  iconClass: string; // different color per icon
};

export const services: ServiceItem[] = [
  {
    title: "Industry-Specific Solutions",
    features: [
      "Education, healthcare, ecommerce, logistics, SaaS",
      "Role-based systems for teams and operations",
      "Workflows tailored to your business process",
    ],
    icon: GraduationCap,
    iconClass: "bg-rose-50 text-rose-600 ring-rose-200",
  },
  {
    title: "Admin Panels & Dashboards",
    features: [
      "Business dashboards for daily monitoring",
      "Reports, exports, filters, and approvals",
      "Secure access for staff and teams",
    ],
    icon: LayoutDashboard,
    iconClass: "bg-amber-50 text-amber-600 ring-amber-200",
  },
  {
    title: "Fintech & Payment Systems",
    features: [
      "Payment integrations and transaction workflows",
      "Payouts, settlements, chargebacks & reporting",
      "Built with security and auditability in mind",
    ],
    icon: Landmark,
    iconClass: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  },
  {
    title: "Automation & Business Workflows",
    features: [
      "Reduce manual work with automation",
      "Approval systems, notifications, reporting",
      "Slack/Telegram/Email workflow alerts",
    ],
    icon: Workflow,
    iconClass: "bg-violet-50 text-violet-600 ring-violet-200",
  },
  {
    title: "Website & Product Development",
    features: [
      "High-converting websites and landing pages",
      "Business portals, admin panels, dashboards",
      "Mobile-ready experience for every device",
    ],
    icon: Globe,
    iconClass: "bg-cyan-50 text-cyan-600 ring-cyan-200",
  },
  {
    title: "Mobile App Development",
    features: [
      "Android & iOS app development (business-ready)",
      "User onboarding, notifications, payments, maps",
      "App performance optimized for real users",
    ],
    icon: Smartphone,
    iconClass: "bg-fuchsia-50 text-fuchsia-600 ring-fuchsia-200",
  },
  {
    title: "Backend APIs & Integrations",
    features: [
      "Secure APIs for web & mobile applications",
      "Third-party integrations (payments, SMS, email, CRM)",
      "Scalable architecture for high traffic",
    ],
    icon: Blocks,
    iconClass: "bg-indigo-50 text-indigo-600 ring-indigo-200",
  },
  {
    title: "Data, Reports & Analytics",
    features: [
      "Reports that help business decisions",
      "Exportable data (CSV/Excel/PDF)",
      "KPIs and dashboards for leadership teams",
    ],
    icon: LineChart,
    iconClass: "bg-lime-50 text-lime-600 ring-lime-200",
  },
  {
    title: "Cloud Setup & Deployment",
    features: [
      "Domain, SSL, hosting & production setup",
      "Reliable deployment with rollback options",
      "Cost-optimized infrastructure planning",
    ],
    icon: CloudCog,
    iconClass: "bg-sky-50 text-sky-600 ring-sky-200",
  },
  {
    title: "Performance & Reliability",
    features: [
      "Speed optimization for better conversions",
      "Stable systems during peak traffic",
      "Monitoring and error tracking setup",
    ],
    icon: Gauge,
    iconClass: "bg-orange-50 text-orange-600 ring-orange-200",
  },
  {
    title: "Security & Compliance",
    features: [
      "Secure authentication and access control",
      "Audit logs and safe data handling practices",
      "Backup and recovery planning",
    ],
    icon: ShieldCheck,
    iconClass: "bg-teal-50 text-teal-600 ring-teal-200",
  },
  {
    title: "Support & Maintenance",
    features: [
      "Ongoing updates, fixes, and improvements",
      "Monitoring + faster issue resolution",
      "Long-term partner for scaling and growth",
    ],
    icon: LifeBuoy,
    iconClass: "bg-pink-50 text-pink-600 ring-pink-200",
  },
];
