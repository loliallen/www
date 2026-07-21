import { ImageResponse } from "next/og";
import { LOCALES, isLocale } from "@/i18n/config";
import { nameFor } from "@/content/profile";
import { getResume } from "@/content/resume";

export const alt = "Maxim Kasakin - Staff Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const r = getResume(locale);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0e0e0e",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", color: "#d6f84c", fontSize: 28 }}>
          {r.title}
        </div>
        <div
          style={{
            display: "flex",
            color: "#f4f2ea",
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1.05,
          }}
        >
          {nameFor(locale)}
        </div>
        <div style={{ display: "flex", color: "#f4f2ea", opacity: 0.7, fontSize: 30 }}>
          maxim.kasakin.tech
        </div>
      </div>
    ),
    { ...size },
  );
}
