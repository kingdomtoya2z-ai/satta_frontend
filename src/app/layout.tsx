import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "../styles/index.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://satta-samrat.com"),
  title: {
    default: "Satta-Samrat | Satta-Samrat Results, Record Chart & Daily Updates",
    template: "%s | Satta-Samrat",
  },
  description:
    "Satta-Samrat provides real-time Satta-Samrat results, daily updates, and complete record charts for Gali, Desawar, Ghaziabad, Faridabad and more. Check today's Satta-Samrat result.",
  keywords: [
    "satta samrat",
    "satta-samrat",
    "satta result",
    "gali desawar",
    "satta chart",
    "satta-samrat chart",
    "satta-samrat result today",
    "record chart",
  ],
  authors: [{ name: "Satta-Samrat" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  other: {
    revisitAfter: "1 day",
    language: "English",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Satta-Samrat",
    locale: "en_US",
    url: "https://satta-samrat.com/",
    title: "Satta-Samrat | Satta-Samrat Results, Record Chart & Daily Updates",
    description:
      "Real-time Satta-Samrat results, daily updates, and complete record charts for Gali, Desawar, Ghaziabad, Faridabad.",
    images: ["https://satta-samrat.com/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Satta-Samrat | Satta-Samrat Results, Record Chart & Daily Updates",
    description:
      "Real-time Satta-Samrat results, daily updates, and complete record charts for Gali, Desawar, Ghaziabad, Faridabad.",
    images: ["https://satta-samrat.com/logo.png"],
  },
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Satta-Samrat",
  url: "https://satta-samrat.com/",
  description:
    "Real-time Satta-Samrat results, daily updates, and complete record charts for Gali, Desawar, Ghaziabad, Faridabad.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://satta-samrat.com/?record={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
