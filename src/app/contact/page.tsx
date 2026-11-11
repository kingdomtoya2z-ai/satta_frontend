import type { Metadata } from "next";
import ContactForm from "@/components/contact";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Satta-Samrat. Get in touch with us for inquiries, advertising, or support related to Satta-Samrat results and charts.",
  alternates: {
    canonical: "/contact",
  },
};

export default function Page() {
  return <ContactForm />;
}
