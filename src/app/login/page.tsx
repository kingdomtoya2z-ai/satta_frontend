import type { Metadata } from "next";
import LoginForm from "@/components/login";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Admin login page for Satta-Samrat.",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <LoginForm />;
}
