import type { Locale } from "@/i18n/config";

/**
 * CV / résumé content — kept aligned with the website (the source of truth).
 * Rendered as a print-optimized page at /[lang]/cv; users Print → Save as PDF.
 * Leveling: positioned as Staff Engineer / Tech Lead; per-role titles are the
 * real ones from each job.
 */
export type ResumeRole = {
  company: string;
  title: string;
  location: string;
  period: string;
  context: string;
  bullets: string[];
  stack: string;
};

export type Resume = {
  title: string;
  availability: string;
  summary: string;
  experience: ResumeRole[];
  skills: { label: string; items: string }[];
  labels: {
    summary: string;
    experience: string;
    skills: string;
    stack: string;
    print: string;
    back: string;
  };
};

const RESUME: Record<Locale, Resume> = {
  en: {
    title: "Staff Engineer / Tech Lead — Backend & Distributed Systems",
    availability: "Open to relocation & remote · English C1",
    summary:
      "Backend & distributed-systems engineer with nearly 7 years building scalable, high-load systems in Go and Node.js — across AI platforms, fintech and Web3. I design durable, observable services and own the technical vision end to end, and I've grown and led engineering teams (2→10). Comfortable across the stack; my center of gravity is the backend.",
    experience: [
      {
        company: "Tekhnologii LLC",
        title: "Software Architect / Tech Lead",
        location: "Kazan, RU",
        period: "Feb 2025 — Present",
        context:
          "B2B SaaS platform for AI content automation and cross-platform publishing.",
        bullets: [
          "Designed and led the platform from scratch; grew the engineering team from 2 to 10, owned technical direction, and worked directly with sales and client success.",
          "Built a custom workflow engine (first on Deno, then rebuilt on NestJS): content jobs run as DAGs — topological sort, parallel levels — with a Postgres step cache that resumes from the last completed step and a cross-process job-claim lock for idempotency.",
          "Orchestrated 20 models across text, image, video and audio with automatic failover; shipped ~1,200 idempotent publications/day to 8 social channels.",
          "Event-driven architecture on RabbitMQ (guaranteed delivery, dead-letter queues, exponential backoff, graceful degradation); unified MongoDB + SQL data layer with end-to-end observability.",
        ],
        stack:
          "Go · NestJS · RabbitMQ · Redis · MongoDB · SQL · PostgreSQL · Kubernetes · Docker",
      },
      {
        company: "NGINE-LTD",
        title: "Lead Software Engineer / Team Lead",
        location: "Geneva, CH",
        period: "Feb 2023 — Feb 2025",
        context: "Blockchain wallet ecosystem (international).",
        bullets: [
          "Designed a new microservice backend with a read-through cache in front of all node reads: cut direct node requests ~60% and p95 balance reads from ~600ms to ~150ms (4× faster).",
          "Extended a Cosmos SDK (Go) chain with 2 custom modules: an on-chain exchange and conversion of the native token into AI-usage tokens.",
          "Led a team of 3; introduced code review and CI/CD, cutting the release cycle from ~2 weeks to ~3 days.",
          "Integrated an in-wallet AI assistant for common operations, removing ~30% of routine support requests.",
        ],
        stack:
          "Go · Cosmos SDK · NestJS · gRPC · MongoDB · React · Electron · Kubernetes",
      },
      {
        company: "Club1111",
        title: "Full-stack Developer",
        location: "Los Angeles, US",
        period: "Sep 2021 — Oct 2022",
        context: "NFT marketplace and Web3 platform.",
        bullets: [
          "Designed the initial frontend architecture (Next.js, TypeScript) and implemented NFT minting, including batched multi-mint.",
          "Built the integration layer to a Wyvern-Protocol on-chain exchange (the protocol OpenSea ran on) — placing bids and transferring assets.",
          "Optimized Web3 transaction handling and mentored junior developers on Web3 best practices.",
        ],
        stack: "React · Next.js · TypeScript · Solidity · Node.js · NestJS · Docker",
      },
    ],
    skills: [
      { label: "Languages", items: "Go · TypeScript / JavaScript (Node.js) · SQL" },
      {
        label: "Systems",
        items:
          "Microservices · distributed & high-load systems · message queues (RabbitMQ, BullMQ) · caching (Redis) · gRPC · CI/CD · observability",
      },
      {
        label: "Frameworks & tools",
        items:
          "NestJS · Next.js · React · Docker · Kubernetes · MongoDB · PostgreSQL · Drizzle · Git",
      },
    ],
    labels: {
      summary: "Summary",
      experience: "Experience",
      skills: "Skills",
      stack: "Stack",
      print: "Print / Save as PDF",
      back: "Back to site",
    },
  },
  ru: {
    title: "Staff-инженер / тех-лид — бэкенд и распределённые системы",
    availability: "Готов к релокации и удалённой работе · английский C1",
    summary:
      "Инженер бэкенда и распределённых систем, почти 7 лет строю масштабируемые высоконагруженные системы на Go и Node.js — для AI-платформ, финтеха и Web3. Проектирую надёжные, наблюдаемые сервисы и веду техническое видение от начала до конца; растил и вёл команды разработки (2→10). Спокойно работаю по всему стеку, но центр тяжести — бэкенд.",
    experience: [
      {
        company: "ООО «Технологии»",
        title: "Архитектор ПО / Тех-лид",
        location: "Казань",
        period: "Февр. 2025 — наст. время",
        context:
          "B2B SaaS-платформа для AI-автоматизации контента и кросс-платформенной публикации.",
        bullets: [
          "Спроектировал и возглавил платформу с нуля; вырастил команду с 2 до 10 человек, отвечал за техническое направление и работал напрямую с продажами и сопровождением клиентов.",
          "Построил собственный движок воркфлоу (сначала на Deno, затем переписал на NestJS): задачи выполняются как DAG — топосортировка, параллельные уровни — с кэшем шагов в Postgres, продолжающим с последнего успешного шага, и межпроцессным локом задачи для идемпотентности.",
          "Оркестрировал 20 моделей для текста, изображений, видео и аудио с автофейловером; ~1 200 идемпотентных публикаций в день в 8 соцканалов.",
          "Событийная архитектура на RabbitMQ (гарантированная доставка, dead-letter queues, экспоненциальные ретраи, graceful degradation); единый слой данных MongoDB + SQL со сквозной наблюдаемостью.",
        ],
        stack:
          "Go · NestJS · RabbitMQ · Redis · MongoDB · SQL · PostgreSQL · Kubernetes · Docker",
      },
      {
        company: "NGINE-LTD",
        title: "Ведущий инженер / Тимлид",
        location: "Женева",
        period: "Февр. 2023 — Февр. 2025",
        context: "Международная блокчейн-компания, экосистема кошелька.",
        bullets: [
          "Спроектировал новый микросервисный бэкенд с read-through кэшем перед всеми чтениями с узлов: снизил прямые запросы к узлам на ~60%, а p95 чтения баланса — с ~600 мс до ~150 мс (в 4 раза).",
          "Расширил блокчейн на Cosmos SDK (Go) 2 кастомными модулями: ончейн-обмен и конвертацию нативного токена в AI-токены.",
          "Руководил командой из 3 человек; внедрил код-ревью и CI/CD, сократив цикл релиза с ~2 недель до ~3 дней.",
          "Интегрировал AI-ассистента в кошелёк для типовых операций — снял ~30% рутинных обращений в поддержку.",
        ],
        stack:
          "Go · Cosmos SDK · NestJS · gRPC · MongoDB · React · Electron · Kubernetes",
      },
      {
        company: "Club1111",
        title: "Full-stack разработчик",
        location: "Лос-Анджелес",
        period: "Сент. 2021 — Окт. 2022",
        context: "NFT-маркетплейс и Web3-платформа.",
        bullets: [
          "Спроектировал начальную frontend-архитектуру (Next.js, TypeScript) и реализовал минтинг NFT, включая пакетный мульти-минт.",
          "Построил слой интеграции с ончейн-биржей на Wyvern Protocol (протокол, на котором работал OpenSea) — ставки и передача активов.",
          "Оптимизировал обработку Web3-транзакций и наставлял младших разработчиков по практикам Web3.",
        ],
        stack: "React · Next.js · TypeScript · Solidity · Node.js · NestJS · Docker",
      },
    ],
    skills: [
      { label: "Языки", items: "Go · TypeScript / JavaScript (Node.js) · SQL" },
      {
        label: "Системы",
        items:
          "Микросервисы · распределённые и высоконагруженные системы · очереди (RabbitMQ, BullMQ) · кэширование (Redis) · gRPC · CI/CD · наблюдаемость",
      },
      {
        label: "Фреймворки и инструменты",
        items:
          "NestJS · Next.js · React · Docker · Kubernetes · MongoDB · PostgreSQL · Drizzle · Git",
      },
    ],
    labels: {
      summary: "Кратко",
      experience: "Опыт работы",
      skills: "Навыки",
      stack: "Стек",
      print: "Печать / Сохранить в PDF",
      back: "На сайт",
    },
  },
};

export const getResume = (locale: Locale): Resume => RESUME[locale];
