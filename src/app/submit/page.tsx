"use client";

import { useCallback, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import Link from "next/link";

type Status = "idle" | "compressing" | "submitting" | "done" | "error";

export default function SubmitPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    setError(null);
    setFile(f);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setError("Please add an image of your work");
      return;
    }
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      setStatus("compressing");
      const compressed = await imageCompression(file, {
        maxSizeMB: 6,
        maxWidthOrHeight: 2600,
        useWebWorker: true,
        fileType: file.type === "image/png" ? "image/png" : "image/jpeg",
      });
      formData.set("image", compressed, file.name);

      setStatus("submitting");
      const res = await fetch("/api/submissions", { method: "POST", body: formData });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong");
      }

      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "done") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Submitted</p>
        <h1 className="mt-4 font-display text-4xl uppercase sm:text-6xl">
          Thanks — it&apos;s in review
        </h1>
        <p className="mt-6 max-w-md text-muted">
          A staff member will take a look. If it&apos;s approved, your work will appear
          on the showcase.
        </p>
        <Link
          href="/"
          className="mt-10 border border-border px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] transition hover:border-accent hover:text-accent"
        >
          Back to showcase
        </Link>
      </main>
    );
  }

  const busy = status === "compressing" || status === "submitting";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-16 sm:py-24">
      <Link href="/" className="font-mono text-xs uppercase tracking-[0.2em] text-muted hover:text-accent">
        &larr; Showcase
      </Link>

      <h1 className="mt-8 font-display text-4xl uppercase leading-none sm:text-6xl">
        Submit your work
      </h1>
      <p className="mt-4 max-w-lg text-muted">
        One image, your name, and links if you&apos;ve got them. A staff member reviews
        every submission before it goes live.
      </p>

      <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-8">
        {/* Honeypot */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFile(e.dataTransfer.files?.[0] ?? null);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center border text-center transition ${
            dragActive ? "border-accent bg-accent/5" : "border-border"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="h-full w-full object-contain p-4" />
          ) : (
            <div className="px-6">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
                Drag an image here, or click to browse
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted/60">
                JPEG, PNG, or WebP
              </p>
            </div>
          )}
        </div>

        <Field label="Name" required>
          <input
            name="student_name"
            required
            maxLength={120}
            placeholder="Your name"
            className="input"
          />
        </Field>

        <Field label="Title" hint="optional">
          <input
            name="title"
            maxLength={150}
            placeholder="Title of the piece"
            className="input"
          />
        </Field>

        <Field label="Instagram" hint="optional">
          <input
            name="instagram_url"
            type="url"
            placeholder="https://instagram.com/you"
            className="input"
          />
        </Field>

        <Field label="Behance" hint="optional">
          <input
            name="behance_url"
            type="url"
            placeholder="https://behance.net/you"
            className="input"
          />
        </Field>

        <Field label="Website" hint="optional">
          <input
            name="website_url"
            type="url"
            placeholder="https://yoursite.com"
            className="input"
          />
        </Field>

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-4 self-start border border-foreground px-8 py-4 font-mono text-xs uppercase tracking-[0.15em] transition hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {status === "compressing" && "Optimising image…"}
          {status === "submitting" && "Submitting…"}
          {(status === "idle" || status === "error") && "Submit work"}
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
        {label}
        {required ? " *" : ""}
        {hint ? <span className="text-muted/60"> — {hint}</span> : null}
      </span>
      {children}
    </label>
  );
}
