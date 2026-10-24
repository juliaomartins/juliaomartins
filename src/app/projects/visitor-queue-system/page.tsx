import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import CaseExit from "@/components/case-study/CaseExit";
import CaseIntro from "@/components/case-study/CaseIntro";
import CaseNav from "@/components/case-study/CaseNav";
import CaseSteps from "@/components/case-study/CaseSteps";
import CaseWall from "@/components/case-study/CaseWall";
import Footer from "@/components/layout/Footer";
import SkipLink from "@/components/layout/SkipLink";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { queueCase } from "@/data/queue-case";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("queueCase");
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    alternates: { canonical: queueCase.href },
    // The card itself is ./opengraph-image.tsx, wired up by Next.
    openGraph: {
      title,
      description,
      url: queueCase.href,
      siteName: "Julião Martins",
      type: "article",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * Case study: the Visitor and Queue System at DRCCMD 2026, hung like a small
 * exhibition — entrance and wall label, four plates, then the photographs.
 */
export default function VisitorQueueSystemPage() {
  return (
    <>
      <SkipLink />
      <CaseNav />
      <main id="main-content" className="overflow-x-clip">
        <CaseIntro />
        <CaseSteps />
        <CaseWall />
        <CaseExit />
      </main>
      <ScrollToTop />
      <Footer />
    </>
  );
}
