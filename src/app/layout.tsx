import type { Metadata } from "next";
import { Anton, Space_Grotesk, Space_Mono } from "next/font/google";
import Script from "next/script";
import CustomCursor from "@/components/CustomCursor";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const display = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const body = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = Space_Mono({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GDMA Showcase",
  description: "Coventry GDMA student work showcase",
};

// Runs before paint so the correct theme applies immediately — reading
// document.documentElement here (not React state) is intentional and
// avoids a flash of the wrong theme.
const themeInitScript = `(function(){try{var s=localStorage.getItem('theme');var t=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <div className="grain" aria-hidden="true" />
        <CustomCursor />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
