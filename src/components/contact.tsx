"use client";

import { useState } from "react";
import Link from "next/link";
import { CONTACT_API } from "@/lib/api";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ type: "error", text: "All fields are required." });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(CONTACT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to send message");
      }

      setStatus({ type: "success", text: "Your message has been sent successfully. We will get back to you soon." });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus({ type: "error", text: err instanceof Error ? err.message : "Failed to send message. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen font-sans bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-accent text-sm sm:text-base hover:underline mb-4"
        >
          &larr; Back to Home
        </Link>

        <div className="bg-card border border-border rounded-sm">
          <div className="bg-primary text-primary-foreground px-4 py-3 font-bold text-sm sm:text-base">
            Contact Us
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-muted-foreground text-sm mb-6">
              Have a question, advertising inquiry, or feedback? Send us a message and we&apos;ll get back to you.
            </p>

            {status && (
              <div
                className={`text-sm p-3 rounded-sm mb-4 ${
                  status.type === "success"
                    ? "bg-primary/10 text-primary font-medium"
                    : "bg-destructive/10 text-destructive font-medium"
                }`}
              >
                {status.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full border border-border px-3 py-2 text-sm rounded-sm bg-background text-foreground"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full border border-border px-3 py-2 text-sm rounded-sm bg-background text-foreground"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  rows={5}
                  className="w-full border border-border px-3 py-2 text-sm rounded-sm bg-background text-foreground resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold rounded-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
