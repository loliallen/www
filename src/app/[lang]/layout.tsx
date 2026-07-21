import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Unbounded, Inter, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import {
  LOCALES,
  LOCALE_META,
  SITE_URL,
  isLocale,
  type Locale,
} from "@/i18n/config";
import { nameFor } from "@/content/profile";
import { getDictionary } from "./dictionaries";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const display = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-mono",
  display: "swap",
});

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const name = nameFor(lang);

  return {
    metadataBase: new URL(SITE_URL),
    // Deliberately no `alternates` here. Metadata merges down the route tree, so
    // a canonical set on the layout leaks into every page that omits one - which
    // is how /cv and the case studies came to canonicalize to the homepage.
    // Canonicals come from metadataFor() on each page instead.
    title: {
      template: `%s | ${name}`,
      default: dict.meta.title,
    },
    description: dict.meta.description,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    verification: process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : undefined,
    openGraph: {
      siteName: name,
      locale: LOCALE_META[lang].bcp47,
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  return (
    <html
      lang={LOCALE_META[locale].bcp47}
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-paper"
        >
          {dict.nav.skipToContent}
        </a>
        <SiteHeader locale={locale} dict={dict} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter locale={locale} dict={dict} />
      </body>
    </html>
  );
}
