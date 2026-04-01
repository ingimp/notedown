import "katex/dist/katex.min.css";
import "./globals.css";
import type { Metadata } from "next";
import { SearchModal } from "@/components/search-modal";

export const metadata: Metadata = {
  title: "Notedown",
  description: "From Markdown to Notedown"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>
        {children}
        <SearchModal />
      </body>
    </html>
  );
}
