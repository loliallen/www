import type { Locale } from "@/i18n/config";

type Localized = Record<Locale, string>;

export type Metric = {
  value: string;
  label: Localized;
};

export type Project = {
  /** URL slug + key for the MDX body folder (content/work/<slug>/<locale>.mdx). */
  slug: string;
  /** Sort/display year or range. */
  year: string;
  company: Localized;
  location: Localized;
  title: Localized;
  role: Localized;
  /** One- or two-sentence teaser for the work index. */
  summary: Localized;
  /** Technologies, shown as tags. Locale-independent. */
  stack: string[];
  /** Headline numbers for this project. */
  metrics: Metric[];
  /** Optional external link (live product, repo). */
  link?: string;
};

/** Ordered most-recent-first. This array drives the work index and routes. */
export const projects: Project[] = [
  {
    slug: "content-automation-platform",
    year: "2025",
    company: {
      en: "Tekhnologii LLC",
      ru: "ООО «Технологии»",
    },
    location: { en: "Kazan, RU", ru: "Казань" },
    title: {
      en: "AI content-automation platform",
      ru: "Платформа автоматизации контента на AI",
    },
    role: {
      en: "Software Architect / Tech Lead",
      ru: "Архитектор ПО / Тех-лид",
    },
    summary: {
      en: "A B2B SaaS platform that orchestrates 20 models across text, image, video and audio, shipping ~1,200 publications a day to 8 channels — designed and led from scratch.",
      ru: "B2B SaaS-платформа, которая оркестрирует 20 моделей для текста, изображений, видео и аудио и публикует ~1 200 материалов в день в 8 каналах — спроектирована и возглавлена с нуля.",
    },
    stack: [
      "Go",
      "NestJS",
      "RabbitMQ",
      "BullMQ",
      "Redis",
      "MongoDB",
      "SQL",
      "Kubernetes",
      "Docker",
    ],
    metrics: [
      {
        value: "20",
        label: {
          en: "models: text, image, video, audio",
          ru: "моделей: текст, фото, видео, аудио",
        },
      },
      {
        value: "1,200/day",
        label: {
          en: "publications, idempotent — no dupes",
          ru: "публикаций, идемпотентно — без дублей",
        },
      },
      {
        value: "8",
        label: { en: "social channels unified", ru: "соцканалов в одном слое" },
      },
    ],
  },
  {
    slug: "blockchain-wallet-backend",
    year: "2023–2025",
    company: { en: "NGINE-LTD", ru: "NGINE-LTD" },
    location: { en: "Geneva, CH", ru: "Женева" },
    title: {
      en: "Blockchain wallet backend",
      ru: "Бэкенд блокчейн-кошелька",
    },
    role: {
      en: "Lead Software Engineer / Team Lead",
      ru: "Ведущий инженер / Тимлид",
    },
    summary: {
      en: "A new microservice backend for a crypto wallet ecosystem. A custom cache layer cut node load by 60% and brought p95 balance reads from ~600ms to ~150ms.",
      ru: "Новый микросервисный бэкенд для экосистемы криптокошелька. Свой слой кэширования снизил нагрузку на узлы на 60% и p95 чтения баланса с ~600 мс до ~150 мс.",
    },
    stack: [
      "Go",
      "Cosmos SDK",
      "NestJS",
      "gRPC",
      "MongoDB",
      "React",
      "Electron",
      "Kubernetes",
    ],
    metrics: [
      {
        value: "−60%",
        label: { en: "direct node load", ru: "нагрузки на узлы" },
      },
      {
        value: "600→150ms",
        label: { en: "p95 balance reads, 4× faster", ru: "p95 чтения баланса, ×4" },
      },
      {
        value: "−30%",
        label: {
          en: "support load, via an in-wallet AI assistant",
          ru: "нагрузки на поддержку — AI-ассистент в кошельке",
        },
      },
    ],
  },
  {
    slug: "nft-marketplace-dapp",
    year: "2021–2022",
    company: { en: "Club1111", ru: "Club1111" },
    location: { en: "Los Angeles, US", ru: "Лос-Анджелес" },
    title: {
      en: "NFT marketplace DApp",
      ru: "NFT-маркетплейс (DApp)",
    },
    role: {
      en: "Full-stack Developer",
      ru: "Full-stack разработчик",
    },
    summary: {
      en: "Frontend architecture and NFT minting for a Web3 marketplace, plus the integration layer wiring the UI to a Wyvern-based on-chain exchange — minting, bids and transfers.",
      ru: "Frontend-архитектура и минтинг NFT для Web3-маркетплейса, плюс слой интеграции UI с ончейн-биржей на Wyvern — минтинг, ставки и передача активов.",
    },
    stack: [
      "React",
      "Next.js",
      "TypeScript",
      "Solidity",
      "Node.js",
      "NestJS",
      "Docker",
    ],
    metrics: [
      {
        value: "0→1",
        label: { en: "DApp frontend, from scratch", ru: "frontend DApp с нуля" },
      },
      {
        value: "Ethereum",
        label: { en: "smart-contract integration", ru: "интеграция смарт-контрактов" },
      },
      {
        value: "Wyvern",
        label: { en: "exchange protocol — OpenSea's", ru: "протокол обмена — как у OpenSea" },
      },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
