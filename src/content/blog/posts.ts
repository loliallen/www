import type { Locale } from "@/i18n/config";

/**
 * Blog posts, written for one audience in one language. Unlike case studies
 * (which exist in every locale), a post targets a specific market: translating
 * it would produce a page nobody searches for. The locale here is what the
 * route registry reads to keep the untranslated copy out of hreflang and the
 * sitemap.
 */
export type Post = {
  /** URL slug + folder name for the body (content/blog/<slug>/<locale>.mdx). */
  slug: string;
  /** The single locale this post is written for. */
  locale: Locale;
  /** ISO date, used for JSON-LD and the dateline. */
  published: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  lead: string;
  /** Headline numbers, rendered as the same metric strip case studies use. */
  facts: { value: string; label: string }[];
  cta: { title: string; body: string; button: string };
  /** Live reference the article is built on. */
  reference: { label: string; href: string };
  backLabel: string;
};

export const posts: Post[] = [
  {
    slug: "hotlinetrade-dayz-portal",
    locale: "ru",
    published: "2026-09-22",
    metaTitle:
      "Кастомизация сайта на HotlineTrade: вики, карта и прайс торговцев для сервера DayZ",
    metaDescription:
      "У сайта на HotlineTrade доступны только js_custom.js и style_custom.css. Разбираю на живом примере dayzhhz.ru, как из этих двух файлов вырастают вики на 20 страниц, интерактивная карта и прайс 8 торговцев с человеческими названиями предметов.",
    eyebrow: "Кейс · HotlineTrade · DayZ",
    h1: "Два файла, из которых вырос портал сервера",
    lead: "Магазин на HotlineTrade у всех одинаковый, и менять в нём можно ровно два файла. Этого хватило, чтобы на dayzhhz.ru появились вики, карта и прайс торговцев, которых нет ни у кого из соседей.",
    facts: [
      { value: "2 файла", label: "весь доступ к чужой CMS" },
      { value: "12 КБ", label: "глобальный бандл на всех страницах" },
      { value: "1261", label: "позиция в прайсе, с именами вместо классов" },
    ],
    cta: {
      title: "Сделаю то же самое вашему серверу",
      body: "Беру сайт на HotlineTrade и довожу его до портала: вики, карта, прайс, ТТХ в карточках магазина. Под ключ, от первого созвона до залитых в CMS файлов. Напишите, какой у вас сервер и что болит.",
      button: "Обсудить проект",
    },
    reference: { label: "dayzhhz.ru", href: "https://dayzhhz.ru" },
    backLabel: "Все статьи",
  },
];

export const postSlugs = posts.map((p) => p.slug);

export const getPost = (slug: string): Post | undefined =>
  posts.find((p) => p.slug === slug);
