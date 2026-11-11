import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Satta-Samrat. Read our terms, conditions, disclaimers, and privacy policy for using our Satta-Samrat result services.",
  alternates: {
    canonical: "/terms",
  },
};

export default function Terms() {
  return (
    <div className="min-h-screen font-sans bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-accent text-sm sm:text-base hover:underline mb-4"
        >
          &larr; Back to Home
        </Link>

        <div className="bg-card text-card-foreground text-xs sm:text-sm md:text-base p-4 sm:p-6 rounded-sm leading-relaxed space-y-4 sm:space-y-6 border border-border">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold">Terms of Service</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Effective Date: November 24, 2024</p>
          </div>

          <div>
            <h2 className="font-bold text-sm sm:text-base">1. AGREEMENT TO TERMS</h2>
            <p>These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement made between you (&ldquo;the User&rdquo;) and the owners and operators of Satta-Samrat (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), concerning your access to and use of the Services. By accessing the Services, you agree that you have read, understood, and agree to be bound by these Terms. If you do not agree, you are prohibited from using the Services and must discontinue use immediately.</p>
          </div>

          <div>
            <h2 className="font-bold text-sm sm:text-base">2. DESCRIPTION OF THE SERVICES</h2>
            <p>The services provided (collectively, &ldquo;the Services&rdquo;) consist of an independent media platform and informational archive. Our function is to:</p>
            <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
              <li>Aggregate, organize, and present publicly available data originating from offline, regional, or state-sanctioned public draws and announcements.</li>
              <li>Present this aggregated data for the purposes of journalistic analysis, public information, and statistical archiving.</li>
            </ul>
            <p className="mt-2">You acknowledge and agree to the following:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>The Services are provided for informational and historical reference only. The information provided is not intended as advice of any kind. The User agrees not to rely on the information on this Website for any personal or financial decision-making.</li>
              <li>The data provided is informational in nature. We do not guarantee the absolute accuracy, timeliness, or completeness of the data and disclaim any liability for errors or omissions.</li>
              <li>The Services are provided entirely free of charge. This is a non-transactional service, and we do not facilitate or accept any form of financial exchanges between users or third parties.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-sm sm:text-base">3. PRIVACY POLICY</h2>
            <p>Our Privacy Policy, which is incorporated into these Terms, describes how we handle the information you may provide to us. By using the Services, you consent to the collection and use of this information as set forth in the Privacy Policy.</p>
          </div>

          <div>
            <h2 className="font-bold text-sm sm:text-base">4. USER ELIGIBILITY AND RESPONSIBILITY</h2>
            <p>The Services are intended for users who are of the legal age of majority in their jurisdiction. It is your sole and absolute responsibility to ensure that your access to and use of the Services is not in violation of any applicable local, state, or national law or regulation in your jurisdiction.</p>
          </div>

          <div>
            <h2 className="font-bold text-sm sm:text-base">5. GOVERNING LAW AND JURISDICTION</h2>
            <p>These Terms and any dispute that arises between you and us will be governed by the laws of the State of Wyoming, USA, without regard to its conflict of law principles. You agree that all disputes related to these Terms or the Services will be brought exclusively in the state and federal courts located in Cheyenne, Wyoming, USA. You hereby consent to the personal jurisdiction and venue in such forums.</p>
          </div>

          <div>
            <h2 className="font-bold text-sm sm:text-base">6. INTELLECTUAL PROPERTY RIGHTS</h2>
            <p>The Services and their original content, features, and functionality are and will remain the exclusive property of us and our licensors, protected by copyright, trademark, and other laws of the United States and foreign countries.</p>
          </div>

          <div>
            <h2 className="font-bold text-sm sm:text-base">7. PROHIBITED CONDUCT</h2>
            <p>You agree not to misuse the Services, including but not limited to, scraping, interfering with the network, or using the data for any commercial purpose without our prior written consent.</p>
          </div>

          <div>
            <h2 className="font-bold text-sm sm:text-base">8. DISCLAIMERS; LIMITATION OF LIABILITY</h2>
            <p>THE SERVICES ARE PROVIDED &ldquo;AS-IS&rdquo; AND &ldquo;AS-AVAILABLE&rdquo; AT YOUR SOLE RISK. TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>
            <p className="mt-2">LIMITATION OF LIABILITY: IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES. OUR AGGREGATE LIABILITY SHALL NOT EXCEED ONE HUNDRED U.S. DOLLARS (U.S. $100.00).</p>
          </div>

          <div>
            <h2 className="font-bold text-sm sm:text-base">9. GENERAL TERMS</h2>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li><span className="font-semibold">Entire Agreement:</span> These Terms constitute the entire agreement between you and us regarding the Services.</li>
              <li><span className="font-semibold">Severability:</span> If any provision is held to be invalid, the remaining provisions will remain in full force.</li>
              <li><span className="font-semibold">Revisions:</span> We may revise these Terms from time to time. By continuing to access or use the Services after revisions become effective, you agree to be bound by the revised Terms.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
