import { Suspense } from "react";
import type { Metadata } from "next";
import Home from "@/components/home";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getRecordParam(sp: Record<string, string | string[] | undefined>): string | undefined {
  const record = sp["record"];
  if (typeof record === "string" && record) return record;
  if (Array.isArray(record) && record[0]) return record[0];
  return undefined;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const record = getRecordParam(sp);

  if (record) {
    // Note: the root layout's title template only applies to child segments,
    // and this page lives in the same segment as the root layout, so the
    // full title (including the site suffix) is returned here.
    const title = `${record} - Record Chart | Satta-Samrat`;
    const description = `View ${record} daily record chart with results on Satta-Samrat. Check ${record} yesterday and today results.`;
    const canonical = `/?record=${encodeURIComponent(record)}`;
    return {
      title: { absolute: title },
      description,
      alternates: { canonical },
      openGraph: {
        type: "website",
        siteName: "Satta-Samrat",
        title,
        description,
        url: canonical,
        images: ["https://satta-samrat.com/logo.png"],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ["https://satta-samrat.com/logo.png"],
      },
    };
  }

  return {
    description:
      "Daily Superfast Satta-Samrat Result with Leak Numbers for Gali, Desawar, Ghaziabad and Faridabad. Complete Old Satta-Samrat Chart from Satta-Samrat.",
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: "Satta-Samrat",
      title: "Satta-Samrat | Satta-Samrat Results, Record Chart & Daily Updates",
      description:
        "Daily Superfast Satta-Samrat Result with Leak Numbers for Gali, Desawar, Ghaziabad and Faridabad. Complete Old Satta-Samrat Chart from Satta-Samrat.",
      url: "/",
      images: ["https://satta-samrat.com/logo.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Satta-Samrat | Satta-Samrat Results, Record Chart & Daily Updates",
      description:
        "Daily Superfast Satta-Samrat Result with Leak Numbers for Gali, Desawar, Ghaziabad and Faridabad. Complete Old Satta-Samrat Chart from Satta-Samrat.",
      images: ["https://satta-samrat.com/logo.png"],
    },
  };
}

const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Satta-Samrat - Daily Satta-Samrat Results",
  description:
    "Daily Superfast Satta-Samrat Results and Leak Numbers for Gali, Desawar, Ghaziabad and Faridabad With Complete Old Satta-Samrat Chart.",
  url: "https://satta-samrat.com/",
  inLanguage: "en-US",
  isPartOf: {
    "@type": "WebSite",
    name: "Satta-Samrat",
    url: "https://satta-samrat.com/",
  },
};

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const record = getRecordParam(sp);

  const jsonLd = record
    ? {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: `${record} - Record Chart | Satta-Samrat`,
        description: `View ${record} daily record chart with complete results history on Satta-Samrat.`,
        url: `https://satta-samrat.com/?record=${encodeURIComponent(record)}`,
      }
    : homeJsonLd;

  // Defaults for the current month/year are computed on the server so the
  // server-rendered markup and hydrated markup always match.
  const now = new Date();
  const initialMonth = String(now.getMonth() + 1).padStart(2, "0");
  const initialYear = String(now.getFullYear());

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={null}>
        <Home initialMonth={initialMonth} initialYear={initialYear} />
      </Suspense>
    </>
  );
}
