import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { LOCALES, DEFAULT_LOCALE } from "@/i18n/config";
import { vanityRedirect } from "@/site/vanity";

function getLocale(request: NextRequest): string {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const languages = new Negotiator({ headers }).languages();
  try {
    return match(languages, LOCALES as unknown as string[], DEFAULT_LOCALE);
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vanity hosts first: they must not pick up a locale prefix on the way.
  const vanity = vanityRedirect(request.headers.get("host"), pathname);
  if (vanity) return NextResponse.redirect(vanity, 308);

  // Already locale-prefixed? Let it through.
  const hasLocale = LOCALES.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );
  if (hasLocale) return;

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next internals and anything with a file extension (static assets).
  matcher: ["/((?!_next|.*\\..*).*)"],
};
