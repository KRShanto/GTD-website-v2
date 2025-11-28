import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

const isProduction =
  process.env.NODE_ENV === "production" &&
  !process.env.NEXT_PUBLIC_APP_URL?.includes("localhost");

export const metadata: Metadata = {
  title: "GTD Media Production - Premium Video Production Services",
  description:
    "Professional video production in Bangladesh. Corporate videos, commercials, documentaries & post-production services that drive results.",
  keywords:
    "video production, corporate videos, commercial production, documentary filmmaking, post-production, video editing, Rajshahi, Bangladesh, GTD Media Production, visual content, business videos",
  authors: [{ name: "GTD Media Production" }],
  creator: "GTD Media Production",
  publisher: "GTD Media Production",
  robots: "index, follow",
  category: "Business Services",
  metadataBase: new URL("https://gtdnet.online"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gtdnet.online",
    siteName: "GTD Media Production",
    title: "GTD Media Production - Premium Video Production Services",
    description:
      "Professional video production company in Bangladesh specializing in corporate videos, commercials, and documentaries. Contact us for high-quality visual content.",
    images: [
      {
        url: "https://gtdnet.online/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "GTD Media Production Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GTD Media Production - Premium Video Production Services",
    description:
      "Professional video production company in Bangladesh. Corporate videos, commercials, documentaries & post-production services.",
    images: ["https://gtdnet.online/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {isProduction && <SpeedInsights />}
      {isProduction && <Analytics />}
      <body className={inter.className}>{children}</body>
    </html>
  );
}
