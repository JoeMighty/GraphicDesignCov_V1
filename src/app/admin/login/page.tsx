"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Incorrect password");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6">
      <h1 className="font-display text-4xl uppercase">Staff login</h1>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="input"
          autoFocus
        />
        {error && <p className="font-mono text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="border border-foreground py-3 font-mono text-xs uppercase tracking-[0.15em] transition hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {loading ? "Checking…" : "Log in"}
        </button>
      </form>
    </main>
  );
}
