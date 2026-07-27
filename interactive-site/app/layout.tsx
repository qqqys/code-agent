import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const incomingHeaders = await headers();
  const host =
    incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host");
  const protocol =
    incomingHeaders.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(
    host ? `${protocol}://${host}` : "http://localhost:3000",
  );

  return {
    metadataBase,
    title: "Codex × Claude Code × Qwen Code｜功能对比",
    description:
      "Exact-version、evidence-first 的三方功能对比与 Qwen 路线图。",
    openGraph: {
      title: "Codex × Claude Code × Qwen Code",
      description: "功能对比 · 证据边界 · Qwen 路线图",
      type: "website",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "Codex、Claude Code 与 Qwen Code 功能对比",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Codex × Claude Code × Qwen Code",
      description: "功能对比 · 证据边界 · Qwen 路线图",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
