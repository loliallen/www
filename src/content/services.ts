import type { Locale } from "@/i18n/config";

/**
 * Services offered for contract/advisory work. Each maps to an SEO-optimized
 * page at /[lang]/services/[slug]. Copy is marketing-grade but grounded in the
 * real case studies, so every claim is defensible.
 */
export const serviceSlugs = [
  "backend-distributed-systems",
  "ai-platforms-orchestration",
  "blockchain-web3",
] as const;
export type ServiceSlug = (typeof serviceSlugs)[number];

export type Service = {
  slug: ServiceSlug;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  serviceType: string;
  intro: string;
  offerings: { title: string; body: string }[];
  proof: string;
  proofLink: { slug: string; label: string };
  stack: string[];
};

export type ServiceLabels = {
  eyebrow: string;
  offeringsTitle: string;
  proofTitle: string;
  stackTitle: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  backToServices: string;
  indexEyebrow: string;
  indexTitle: string;
  indexLead: string;
  learnMore: string;
  contactTitle: string;
  contactSubtitle: string;
  contactClose: string;
  emailLabel: string;
  fastestLabel: string;
};

const SERVICES: Record<Locale, Service[]> = {
  en: [
    {
      slug: "backend-distributed-systems",
      metaTitle: "Backend & Distributed Systems Engineering — Maxim Kasakin",
      metaDescription:
        "Senior backend engineering for scalable, high-load systems in Go and Node.js — microservices, message queues, caching and observability. Available for contract and advisory work.",
      h1: "Backend & Distributed Systems",
      tagline:
        "Scalable, high-load services in Go and Node.js — built to hold under pressure.",
      serviceType: "Backend & distributed systems engineering",
      intro:
        "I design and build backend systems that stay fast and correct as they grow: microservices, event-driven architectures, caching layers and the observability to run them in production. Nearly 7 years across AI platforms, fintech and Web3 — most recently leading a platform from zero to production.",
      offerings: [
        {
          title: "Microservice architecture",
          body: "Service decomposition, message queues (RabbitMQ, BullMQ) and event-driven flows with guaranteed delivery, dead-letter queues and graceful degradation.",
        },
        {
          title: "Performance & scalability",
          body: "Caching layers, query and latency optimization, and load-aware design. I've cut node load ~60% and brought p95 reads from ~600ms to ~150ms.",
        },
        {
          title: "APIs & integration",
          body: "REST and gRPC services, third-party integrations (OAuth, social platforms, payments) and clean data layers over SQL and NoSQL.",
        },
        {
          title: "Reliability",
          body: "Idempotency, retries with backoff, durable and resumable workflows, and end-to-end observability — so the system doesn't page you at 3am.",
        },
      ],
      proof:
        "At an AI content platform I built a durable workflow engine that resumes from the last completed step and ships ~1,200 idempotent publications a day across 8 channels. At a crypto wallet, a custom cache layer cut direct node load ~60% and made balance reads 4× faster.",
      proofLink: {
        slug: "content-automation-platform",
        label: "See the platform case study",
      },
      stack: [
        "Go",
        "Node.js",
        "NestJS",
        "RabbitMQ",
        "Redis",
        "PostgreSQL",
        "MongoDB",
        "gRPC",
        "Kubernetes",
        "Docker",
      ],
    },
    {
      slug: "ai-platforms-orchestration",
      metaTitle: "AI Platform & Workflow Orchestration Engineering — Maxim Kasakin",
      metaDescription:
        "Build durable AI workflow engines and multi-model orchestration pipelines — LLM, image, video and audio — with failover, resume-from-checkpoint and idempotent delivery.",
      h1: "AI Platforms & Orchestration",
      tagline:
        "Durable, multi-model AI pipelines that don't fall over when a provider does.",
      serviceType: "AI platform & workflow orchestration engineering",
      intro:
        "I build the backend behind AI products: orchestration engines that route work across many models, survive provider failures, and never lose or duplicate a job. I designed and led an AI content-automation platform from scratch — including its workflow engine.",
      offerings: [
        {
          title: "Workflow & orchestration engines",
          body: "DAG-based execution with parallel steps, persistent state and resume-from-checkpoint — jobs continue from the last completed step after a crash instead of restarting from zero.",
        },
        {
          title: "Multi-model routing & failover",
          body: "Route each step to the right model across text, image, video and audio; automatic failover and fallbacks when a provider degrades or rate-limits.",
        },
        {
          title: "Idempotent, reliable delivery",
          body: "Job-claim locks and idempotent processing so retries and message redeliveries never double-run or duplicate output.",
        },
        {
          title: "Cost & quality observability",
          body: "Per-stage latency, inference-quality metrics and alerting to keep an AI pipeline fast, affordable and debuggable.",
        },
      ],
      proof:
        "I built a workflow engine (first Deno, then NestJS) orchestrating 20 models across text, image, video and audio, shipping ~1,200 publications a day to 8 social channels — with automatic failover and durable resume.",
      proofLink: {
        slug: "content-automation-platform",
        label: "See the platform case study",
      },
      stack: [
        "Go",
        "NestJS",
        "BullMQ",
        "RabbitMQ",
        "Redis",
        "PostgreSQL",
        "LLM APIs",
        "Kubernetes",
      ],
    },
    {
      slug: "blockchain-web3",
      metaTitle: "Blockchain & Web3 Backend Engineering — Maxim Kasakin",
      metaDescription:
        "Wallet backends, custom Cosmos SDK modules, smart-contract integration and on-chain exchanges. Go and Web3 engineering for production crypto products.",
      h1: "Blockchain & Web3",
      tagline: "Production-grade crypto backends — wallets, chains and on-chain exchange.",
      serviceType: "Blockchain & Web3 backend engineering",
      intro:
        "I build the backend and integration layers behind crypto products: wallet services, custom chain modules and the bridges between apps and smart contracts — with the caching and reliability real users need.",
      offerings: [
        {
          title: "Wallet & chain backends",
          body: "Microservice backends for wallets, with caching in front of node reads to cut load and latency. Custom Cosmos SDK (Go) modules for logic the standard SDK doesn't cover.",
        },
        {
          title: "Smart-contract integration",
          body: "Integration layers between apps and Ethereum or Cosmos contracts — bids, transfers, NFT minting (including batch) and on-chain exchanges (e.g. Wyvern).",
        },
        {
          title: "Performance for on-chain data",
          body: "Read-through caches over node calls. I cut direct node requests ~60% and brought balance reads from ~600ms to ~150ms.",
        },
        {
          title: "Exchanges & tokenomics",
          body: "On-chain exchange modules and token mechanics — for example, converting a native token into usage credits.",
        },
      ],
      proof:
        "I designed a wallet backend whose cache cut node load ~60% and made balance reads 4× faster, extended a Cosmos SDK chain with 2 custom modules, and earlier built NFT minting and a Wyvern-based marketplace exchange.",
      proofLink: {
        slug: "blockchain-wallet-backend",
        label: "See the wallet case study",
      },
      stack: [
        "Go",
        "Cosmos SDK",
        "Solidity",
        "Ethereum",
        "NestJS",
        "gRPC",
        "React",
        "Docker",
      ],
    },
  ],
  ru: [
    {
      slug: "backend-distributed-systems",
      metaTitle: "Бэкенд и распределённые системы — Максим Касакин",
      metaDescription:
        "Senior-разработка бэкенда для масштабируемых высоконагруженных систем на Go и Node.js — микросервисы, очереди, кэширование, наблюдаемость. Открыт к проектной и консультационной работе.",
      h1: "Бэкенд и распределённые системы",
      tagline:
        "Масштабируемые высоконагруженные сервисы на Go и Node.js — держат нагрузку.",
      serviceType: "Разработка бэкенда и распределённых систем",
      intro:
        "Проектирую и строю backend-системы, которые остаются быстрыми и корректными по мере роста: микросервисы, событийные архитектуры, слои кэширования и наблюдаемость для эксплуатации в продакшене. Почти 7 лет — в AI-платформах, финтехе и Web3, последнее — платформа от нуля до продакшена.",
      offerings: [
        {
          title: "Микросервисная архитектура",
          body: "Декомпозиция сервисов, очереди сообщений (RabbitMQ, BullMQ) и событийные потоки с гарантированной доставкой, dead-letter queues и graceful degradation.",
        },
        {
          title: "Производительность и масштабирование",
          body: "Слои кэширования, оптимизация запросов и задержек, дизайн под нагрузку. Снижал нагрузку на узлы на ~60% и p95 чтений с ~600 мс до ~150 мс.",
        },
        {
          title: "API и интеграции",
          body: "REST- и gRPC-сервисы, интеграции со сторонними системами (OAuth, соцплатформы, платежи) и чистые слои данных поверх SQL и NoSQL.",
        },
        {
          title: "Надёжность",
          body: "Идемпотентность, ретраи с backoff, надёжные и возобновляемые воркфлоу и сквозная наблюдаемость — чтобы система не будила вас в три ночи.",
        },
      ],
      proof:
        "Для AI-платформы контента я построил надёжный движок воркфлоу, продолжающий с последнего успешного шага и публикующий ~1 200 идемпотентных материалов в день в 8 каналов. Для криптокошелька свой слой кэша снизил нагрузку на узлы на ~60% и ускорил чтение баланса в 4 раза.",
      proofLink: {
        slug: "content-automation-platform",
        label: "Смотреть кейс платформы",
      },
      stack: [
        "Go",
        "Node.js",
        "NestJS",
        "RabbitMQ",
        "Redis",
        "PostgreSQL",
        "MongoDB",
        "gRPC",
        "Kubernetes",
        "Docker",
      ],
    },
    {
      slug: "ai-platforms-orchestration",
      metaTitle: "AI-платформы и оркестрация воркфлоу — Максим Касакин",
      metaDescription:
        "Надёжные движки AI-воркфлоу и мультимодельные пайплайны — LLM, изображения, видео и аудио — с фейловером, резюмом по чекпойнтам и идемпотентной доставкой.",
      h1: "AI-платформы и оркестрация",
      tagline:
        "Надёжные мультимодельные AI-пайплайны, которые не падают вслед за провайдером.",
      serviceType: "Разработка AI-платформ и оркестрации воркфлоу",
      intro:
        "Строю бэкенд за AI-продуктами: движки оркестрации, распределяющие работу между множеством моделей, переживающие сбои провайдеров и никогда не теряющие и не дублирующие задачу. Спроектировал и возглавил AI-платформу автоматизации контента с нуля — вместе с её движком воркфлоу.",
      offerings: [
        {
          title: "Движки воркфлоу и оркестрации",
          body: "Выполнение на основе DAG с параллельными шагами, персистентным состоянием и резюмом по чекпойнтам — задачи продолжаются с последнего успешного шага, а не с нуля.",
        },
        {
          title: "Роутинг моделей и фейловер",
          body: "Маршрутизация каждого шага к нужной модели по тексту, изображениям, видео и аудио; автоматический фейловер и фолбэки при деградации или rate-limit провайдера.",
        },
        {
          title: "Идемпотентная надёжная доставка",
          body: "Локи задач и идемпотентная обработка — ретраи и повторные доставки никогда не запускают задачу дважды и не дублируют результат.",
        },
        {
          title: "Наблюдаемость стоимости и качества",
          body: "Задержки по этапам, метрики качества инференса и алертинг — чтобы AI-пайплайн был быстрым, дешёвым и отлаживаемым.",
        },
      ],
      proof:
        "Я построил движок воркфлоу (сначала Deno, затем NestJS), оркестрирующий 20 моделей для текста, изображений, видео и аудио и публикующий ~1 200 материалов в день в 8 соцканалов — с автофейловером и надёжным резюмом.",
      proofLink: {
        slug: "content-automation-platform",
        label: "Смотреть кейс платформы",
      },
      stack: [
        "Go",
        "NestJS",
        "BullMQ",
        "RabbitMQ",
        "Redis",
        "PostgreSQL",
        "LLM API",
        "Kubernetes",
      ],
    },
    {
      slug: "blockchain-web3",
      metaTitle: "Блокчейн и Web3 бэкенд — Максим Касакин",
      metaDescription:
        "Бэкенды кошельков, кастомные модули Cosmos SDK, интеграция смарт-контрактов и ончейн-биржи. Go и Web3 для продакшен крипто-продуктов.",
      h1: "Блокчейн и Web3",
      tagline: "Продакшен крипто-бэкенды — кошельки, сети и ончейн-обмен.",
      serviceType: "Разработка блокчейн- и Web3-бэкенда",
      intro:
        "Строю бэкенд и слои интеграции за крипто-продуктами: сервисы кошельков, кастомные модули сети и мосты между приложениями и смарт-контрактами — с кэшированием и надёжностью, которые нужны реальным пользователям.",
      offerings: [
        {
          title: "Бэкенды кошельков и сетей",
          body: "Микросервисные бэкенды для кошельков с кэшем перед чтениями с узлов для снижения нагрузки и задержек. Кастомные модули Cosmos SDK (Go) под логику, которой нет в стандартном SDK.",
        },
        {
          title: "Интеграция смарт-контрактов",
          body: "Слои интеграции между приложениями и контрактами Ethereum или Cosmos — ставки, переводы, минтинг NFT (в т.ч. пакетный) и ончейн-биржи (например, Wyvern).",
        },
        {
          title: "Производительность ончейн-данных",
          body: "Read-through кэши поверх вызовов к узлам. Снизил прямые запросы к узлам на ~60% и чтение баланса с ~600 мс до ~150 мс.",
        },
        {
          title: "Биржи и токеномика",
          body: "Ончейн-модули обмена и механика токенов — например, конвертация нативного токена в кредиты на использование.",
        },
      ],
      proof:
        "Я спроектировал бэкенд кошелька, чей кэш снизил нагрузку на узлы на ~60% и ускорил чтение баланса в 4 раза, расширил сеть на Cosmos SDK 2 кастомными модулями, а раньше построил минтинг NFT и биржу маркетплейса на Wyvern.",
      proofLink: {
        slug: "blockchain-wallet-backend",
        label: "Смотреть кейс кошелька",
      },
      stack: [
        "Go",
        "Cosmos SDK",
        "Solidity",
        "Ethereum",
        "NestJS",
        "gRPC",
        "React",
        "Docker",
      ],
    },
  ],
};

const LABELS: Record<Locale, ServiceLabels> = {
  en: {
    eyebrow: "Service",
    offeringsTitle: "What I can build",
    proofTitle: "Proven in production",
    stackTitle: "Stack",
    ctaTitle: "Start a project",
    ctaBody:
      "Open to contract and advisory work — and full-time roles. Tell me what you're building.",
    ctaButton: "Get in touch",
    backToServices: "All services",
    indexEyebrow: "Work with me",
    indexTitle: "Services",
    indexLead:
      "Areas I take on for contract and advisory work — each grounded in real production experience.",
    learnMore: "Learn more",
    contactTitle: "Let's talk",
    contactSubtitle: "Reach me on any of these — I usually reply within a day.",
    contactClose: "Close",
    emailLabel: "Email",
    fastestLabel: "Fastest",
  },
  ru: {
    eyebrow: "Услуга",
    offeringsTitle: "Что я могу построить",
    proofTitle: "Проверено в продакшене",
    stackTitle: "Стек",
    ctaTitle: "Начать проект",
    ctaBody:
      "Открыт к проектной и консультационной работе — и к фулл-тайму. Расскажите, что вы строите.",
    ctaButton: "Связаться",
    backToServices: "Все услуги",
    indexEyebrow: "Работа со мной",
    indexTitle: "Услуги",
    indexLead:
      "Направления, которые беру в проектной и консультационной работе — каждое основано на реальном продакшен-опыте.",
    learnMore: "Подробнее",
    contactTitle: "Давайте поговорим",
    contactSubtitle: "Пишите в любой из каналов — обычно отвечаю в течение дня.",
    contactClose: "Закрыть",
    emailLabel: "Почта",
    fastestLabel: "Быстрее всего",
  },
};

export const getServices = (locale: Locale): Service[] => SERVICES[locale];
export const getService = (locale: Locale, slug: string): Service | undefined =>
  SERVICES[locale].find((s) => s.slug === slug);
export const getServiceLabels = (locale: Locale): ServiceLabels => LABELS[locale];
