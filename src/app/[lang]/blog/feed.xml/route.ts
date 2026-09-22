import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "../../dictionaries";
import { renderFeed } from "@/site/rss";
import { localesFor } from "@/site/routes";

export const dynamicParams = false;

/** One feed per language the blog is published in, and no others. */
export function generateStaticParams() {
  return localesFor("blog").map((lang) => ({ lang }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang } = await params;
  if (!isLocale(lang)) return new Response("Not found", { status: 404 });
  const locale = lang as Locale;
  if (!localesFor("blog").includes(locale)) {
    return new Response("Not found", { status: 404 });
  }

  const dict = await getDictionary(locale);
  const body = renderFeed(locale, {
    title: dict.blogPage.heading,
    description: dict.blogPage.lead,
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
