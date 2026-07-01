import type { Locale } from "@/i18n/config";

const INK = "#0e0e0e";
const CHART = "#d6f84c";
const PLUM = "#2b0b3a";

const L: Record<
  Locale,
  {
    aria: string;
    ingress1: string;
    ingress2: string;
    claim1: string;
    claim2: string;
    engine: string;
    engineSub: string;
    modelsA: string;
    modelsB: string;
    step: string;
    levelNote: string;
    events1: string;
    events2: string;
    cache1: string;
    cache2: string;
    persist: string;
    resume: string;
  }
> = {
  en: {
    aria: "Architecture of the content workflow engine: RabbitMQ ingress, an idempotent job-claim lock, a DAG engine that runs steps in parallel levels with a Postgres step cache for resume, and lifecycle events out.",
    ingress1: "RabbitMQ",
    ingress2: "tasks in",
    claim1: "Job-claim lock",
    claim2: "idempotent · TTL",
    engine: "WORKFLOW ENGINE",
    engineSub: "DAG · topological sort",
    modelsA: "each step → model routing",
    modelsB: "text · image · video · audio",
    step: "step",
    levelNote: "parallel within a level · dependents wait",
    events1: "Lifecycle",
    events2: "events out",
    cache1: "Step cache",
    cache2: "Postgres",
    persist: "persist each step",
    resume: "resume - skip completed",
  },
  ru: {
    aria: "Архитектура движка контент-воркфлоу: приём из RabbitMQ, идемпотентный лок задачи, DAG-движок с параллельными уровнями шагов и кэшем шагов в Postgres для резюма, события жизненного цикла на выход.",
    ingress1: "RabbitMQ",
    ingress2: "задачи на вход",
    claim1: "Лок задачи",
    claim2: "идемпотентно · TTL",
    engine: "ДВИЖОК ВОРКФЛОУ",
    engineSub: "DAG · топосортировка",
    modelsA: "каждый шаг → роутинг моделей",
    modelsB: "текст · фото · видео · аудио",
    step: "шаг",
    levelNote: "параллельно в уровне · зависимые ждут",
    events1: "События",
    events2: "жизн. цикла",
    cache1: "Кэш шагов",
    cache2: "Postgres",
    persist: "сохраняю шаг",
    resume: "резюм - пропуск готовых",
  },
};

function Step({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={100}
        height={44}
        fill="#ffffff"
        stroke={INK}
        strokeWidth={2}
      />
      <text
        x={x + 50}
        y={y + 28}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={13}
        fill={INK}
      >
        {label}
      </text>
    </g>
  );
}

export function WorkflowDiagram({ lang }: { lang: Locale }) {
  const t = L[lang];
  const mono = "var(--font-mono)";

  return (
    <figure className="my-10 not-prose">
      <svg
        viewBox="0 0 880 590"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={t.aria}
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <defs>
          <marker
            id="wd-ah"
            markerWidth="9"
            markerHeight="9"
            refX="7"
            refY="4.5"
            orient="auto"
          >
            <path d="M0,0 L9,4.5 L0,9 z" fill={INK} />
          </marker>
          <marker
            id="wd-ah-plum"
            markerWidth="9"
            markerHeight="9"
            refX="7"
            refY="4.5"
            orient="auto"
          >
            <path d="M0,0 L9,4.5 L0,9 z" fill={PLUM} />
          </marker>
        </defs>

        {/* ── Spine: ingress → claim lock → engine → events ─────────── */}
        {/* RabbitMQ */}
        <rect x={20} y={190} width={150} height={90} fill="#ffffff" stroke={INK} strokeWidth={2} />
        <text x={95} y={230} textAnchor="middle" fontFamily={mono} fontSize={14} fontWeight={700} fill={INK}>{t.ingress1}</text>
        <text x={95} y={252} textAnchor="middle" fontFamily={mono} fontSize={11} fill={INK} opacity={0.7}>{t.ingress2}</text>

        {/* Claim lock */}
        <rect x={200} y={190} width={170} height={90} fill="#ffffff" stroke={INK} strokeWidth={2} />
        <text x={285} y={230} textAnchor="middle" fontFamily={mono} fontSize={14} fontWeight={700} fill={INK}>{t.claim1}</text>
        <text x={285} y={252} textAnchor="middle" fontFamily={mono} fontSize={11} fill={INK} opacity={0.7}>{t.claim2}</text>

        {/* Events out */}
        <rect x={680} y={190} width={180} height={90} fill={PLUM} stroke={INK} strokeWidth={2} />
        <text x={770} y={230} textAnchor="middle" fontFamily={mono} fontSize={14} fontWeight={700} fill="#ffffff">{t.events1}</text>
        <text x={770} y={252} textAnchor="middle" fontFamily={mono} fontSize={12} fill={CHART}>{t.events2}</text>

        {/* spine arrows */}
        <line x1={170} y1={235} x2={196} y2={235} stroke={INK} strokeWidth={2} markerEnd="url(#wd-ah)" />
        <line x1={370} y1={235} x2={401} y2={235} stroke={INK} strokeWidth={2} markerEnd="url(#wd-ah)" />
        <line x1={650} y1={235} x2={676} y2={235} stroke={INK} strokeWidth={2} markerEnd="url(#wd-ah)" />

        {/* ── Engine container ──────────────────────────────────────── */}
        <rect x={405} y={50} width={245} height={420} fill="none" stroke={INK} strokeWidth={2.5} />
        <text x={528} y={86} textAnchor="middle" fontFamily={mono} fontSize={15} fontWeight={700} fill={INK} letterSpacing="0.5">{t.engine}</text>
        <rect x={474} y={92} width={108} height={5} fill={CHART} />
        <text x={528} y={114} textAnchor="middle" fontFamily={mono} fontSize={10} fill={INK} opacity={0.75}>{t.engineSub}</text>
        <text x={528} y={130} textAnchor="middle" fontFamily={mono} fontSize={8.5} fill={INK} opacity={0.6}>{t.modelsA}</text>
        <text x={528} y={142} textAnchor="middle" fontFamily={mono} fontSize={8.5} fill={INK} opacity={0.6}>{t.modelsB}</text>

        {/* DAG edges (drawn under nodes) */}
        <line x1={468} y1={204} x2={500} y2={246} stroke={INK} strokeWidth={2} markerEnd="url(#wd-ah)" />
        <line x1={586} y1={204} x2={556} y2={246} stroke={INK} strokeWidth={2} markerEnd="url(#wd-ah)" />
        <line x1={512} y1={296} x2={476} y2={338} stroke={INK} strokeWidth={2} markerEnd="url(#wd-ah)" />
        <line x1={544} y1={296} x2={580} y2={338} stroke={INK} strokeWidth={2} markerEnd="url(#wd-ah)" />

        {/* DAG nodes: L1 (A,B) → L2 (C) → L3 (D,E) */}
        <Step x={418} y={160} label={t.step} />
        <Step x={536} y={160} label={t.step} />
        <Step x={478} y={252} label={t.step} />
        <Step x={418} y={344} label={t.step} />
        <Step x={536} y={344} label={t.step} />

        <text x={528} y={420} textAnchor="middle" fontFamily={mono} fontSize={8.5} fill={INK} opacity={0.6}>{t.levelNote}</text>

        {/* ── Step cache + resume loop ──────────────────────────────── */}
        <rect x={405} y={500} width={245} height={70} fill="#ffffff" stroke={INK} strokeWidth={2} />
        <text x={528} y={532} textAnchor="middle" fontFamily={mono} fontSize={14} fontWeight={700} fill={INK}>{t.cache1}</text>
        <text x={528} y={552} textAnchor="middle" fontFamily={mono} fontSize={11} fill={INK} opacity={0.7}>{t.cache2}</text>

        {/* persist (engine → cache) */}
        <line x1={460} y1={470} x2={460} y2={497} stroke={INK} strokeWidth={2} markerEnd="url(#wd-ah)" />
        <text x={452} y={488} textAnchor="end" fontFamily={mono} fontSize={8.5} fill={INK} opacity={0.7}>{t.persist}</text>

        {/* resume (cache → engine) - the hero, highlighted */}
        <line x1={596} y1={500} x2={596} y2={473} stroke={PLUM} strokeWidth={2.5} markerEnd="url(#wd-ah-plum)" />
        <rect x={606} y={479} width={150} height={17} fill={CHART} />
        <text x={612} y={491} textAnchor="start" fontFamily={mono} fontSize={9} fontWeight={700} fill={INK}>{t.resume}</text>
      </svg>
    </figure>
  );
}
