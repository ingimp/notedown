import "katex/dist/katex.min.css";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notedown",
  description: "From Markdown to Notedown"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
