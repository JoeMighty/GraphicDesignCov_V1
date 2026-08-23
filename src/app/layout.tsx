import type { Metadata } from "next";
import { Anton, Space_Grotesk, Space_Mono } from "next/font/google";
import CustomCursor from "@/components/CustomCursor";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <div className="grain" aria-hidden="true" />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
