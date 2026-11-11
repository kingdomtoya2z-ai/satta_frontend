"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!password) { setError("Enter password"); return; }
    setLoading(true);
    const err = await login(password);
    setLoading(false);
    if (err) setError(err);
    else router.push("/admin");
  }

  return (
    <div className="min-h-screen font-sans bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-accent text-sm hover:underline block mb-6">&larr; Back to Home</Link>
        <div className="bg-card border border-border p-6 rounded-sm">
          <h1 className="text-xl font-bold mb-6 text-center">Admin Login</h1>
          {error && <div className="bg-destructive text-destructive-foreground text-sm p-3 rounded-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="border border-border px-3 py-2 text-sm rounded-sm bg-background text-foreground w-full"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground px-6 py-2 text-sm font-bold rounded-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
