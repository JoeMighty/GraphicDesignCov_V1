"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  student_name: string;
  title: string | null;
  thumb_url: string;
  image_url: string;
  instagram_url: string | null;
  behance_url: string | null;
  website_url: string | null;
  status: string;
  created_at: string;
};

const TABS = ["pending", "approved", "rejected"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pending");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (status: Tab) => {
    setLoading(true);
    const res = await fetch(`/api/admin/submissions?status=${status}`, { cache: "no-store" });
    const body = await res.json();
    setItems(body.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Data fetch triggered by tab change — a standard effect use case.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(tab);
  }, [tab, load]);

  async function review(id: string, status: "approved" | "rejected") {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/admin/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl uppercase sm:text-5xl">Review queue</h1>
        <button
          onClick={logout}
          className="font-mono text-xs uppercase tracking-[0.15em] text-muted transition hover:text-accent"
        >
          Log out
        </button>
      </div>

      <div className="mt-8 flex gap-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 font-mono text-xs uppercase tracking-[0.15em] transition ${
              tab === t ? "border-b-2 border-accent text-accent" : "text-muted hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <p className="font-mono text-xs text-muted">Loading…</p>}
        {!loading && items.length === 0 && (
          <p className="font-mono text-xs text-muted">Nothing here</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="border border-border p-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/20">
              <Image
                src={item.thumb_url}
                alt={item.title ?? item.student_name}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="mt-4">
              <p className="text-sm">{item.student_name}</p>
              {item.title && <p className="font-mono text-xs text-muted">{item.title}</p>}
              <div className="mt-2 flex gap-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                {item.instagram_url && (
                  <a href={item.instagram_url} target="_blank" rel="noreferrer" className="hover:text-accent">
                    IG
                  </a>
                )}
                {item.behance_url && (
                  <a href={item.behance_url} target="_blank" rel="noreferrer" className="hover:text-accent">
                    Behance
                  </a>
                )}
                {item.website_url && (
                  <a href={item.website_url} target="_blank" rel="noreferrer" className="hover:text-accent">
                    Site
                  </a>
                )}
              </div>
            </div>
            {tab === "pending" && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => review(item.id, "approved")}
                  className="flex-1 border border-foreground py-2 font-mono text-xs uppercase tracking-[0.15em] transition hover:border-accent hover:text-accent"
                >
                  Approve
                </button>
                <button
                  onClick={() => review(item.id, "rejected")}
                  className="flex-1 border border-border py-2 font-mono text-xs uppercase tracking-[0.15em] text-muted transition hover:border-red-400 hover:text-red-400"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
