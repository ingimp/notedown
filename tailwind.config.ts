import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gh: {
          canvas:       "#ffffff",
          "canvas-subtle": "#f6f8fa",
          "canvas-inset": "#f0f2f4",
          border:       "#d0d7de",
          "border-muted": "#d8dee4",
          header:       "#24292f",
          "header-text":"#f0f6fc",
          "header-muted":"#848d97",
          fg:           "#1f2328",
          "fg-muted":   "#656d76",
          "fg-subtle":  "#818b98",
          accent:       "#0969da",
          "accent-subtle": "#ddf4ff",
          "accent-fg":  "#0550ae",
          success:      "#1a7f37",
          "success-subtle": "#dafbe1",
          danger:       "#d1242f",
          "danger-subtle": "#fff0ee",
          done:         "#8250df",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "Consolas", "Liberation Mono", "monospace"],
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Noto Sans", "Helvetica", "Arial", "sans-serif"],
      },
      fontSize: {
        "gh-xs":  ["11px", { lineHeight: "1.5" }],
        "gh-sm":  ["12px", { lineHeight: "1.5" }],
        "gh-md":  ["14px", { lineHeight: "1.5" }],
        "gh-lg":  ["16px", { lineHeight: "1.5" }],
      },
      borderRadius: {
        gh: "6px",
      },
      boxShadow: {
        "gh-sm": "0 1px 0 rgba(31,35,40,0.04)",
        "gh-md": "0 3px 6px rgba(140,149,159,0.15)",
        "gh-lg": "0 8px 24px rgba(140,149,159,0.2)",
      },
    },
  },
  plugins: [],
} satisfies Config;
