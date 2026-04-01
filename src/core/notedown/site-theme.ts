export const DOCUMENT_SITE_CSS = `
/* ── GitHub-style design tokens ── */
:root {
  --gh-canvas:         #ffffff;
  --gh-canvas-subtle:  #f6f8fa;
  --gh-canvas-inset:   #f0f2f4;
  --gh-border:         #d0d7de;
  --gh-header:         #24292f;
  --gh-header-text:    #f0f6fc;
  --gh-header-muted:   #848d97;
  --gh-fg:             #1f2328;
  --gh-fg-muted:       #656d76;
  --gh-fg-subtle:      #818b98;
  --gh-accent:         #0969da;
  --gh-accent-subtle:  #ddf4ff;
  --gh-accent-fg:      #0550ae;
  --gh-success:        #1a7f37;
  color-scheme: light;
}

*, *::before, *::after { box-sizing: border-box; }
html { font-size: 16px; }

body {
  margin: 0;
  background: var(--gh-canvas-subtle);
  color: var(--gh-fg);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

a { color: var(--gh-accent); text-decoration: none; }
a:hover { text-decoration: underline; }

/* ── Layout shell ── */
.nd-shell { display: flex; flex-direction: column; min-height: 100vh; }

/* ── Header ── */
.nd-header {
  background: var(--gh-header);
  border-bottom: 1px solid rgba(0,0,0,0.2);
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
}
.nd-header-breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 12px;
  color: var(--gh-header-muted);
  min-width: 0;
}
.nd-header-breadcrumb a { color: var(--gh-header-muted); text-decoration: none; }
.nd-header-breadcrumb a:hover { color: var(--gh-header-text); text-decoration: none; }
.nd-header-breadcrumb .current { color: var(--gh-header-text); font-weight: 600; }
.nd-header-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--gh-header-text);
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  text-decoration: none;
  flex-shrink: 0;
}
.nd-header-action:hover { background: rgba(255,255,255,0.2); text-decoration: none; }

/* ── Body ── */
.nd-body {
  display: flex;
  flex: 1;
  height: calc(100vh - 48px);
  overflow: hidden;
}

/* ── Sidebar ── */
.nd-sidebar {
  width: 224px;
  flex-shrink: 0;
  background: var(--gh-canvas);
  border-right: 1px solid var(--gh-border);
  overflow-y: auto;
}
.nd-sidebar-header {
  padding: 16px 12px 8px;
}
.nd-sidebar-kicker {
  font-size: 11px;
  font-weight: 600;
  color: var(--gh-fg-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 4px;
}
.nd-sidebar-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--gh-fg);
  margin: 0;
  line-height: 1.3;
  text-decoration: none;
  display: block;
}
.nd-sidebar-title:hover { color: var(--gh-accent); text-decoration: none; }
.nd-sidebar-title.accent { color: var(--gh-accent); }
.nd-sidebar-nav { margin-top: 8px; }
.nd-nav-link {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--gh-fg-muted);
  text-decoration: none;
  line-height: 1.4;
  border-right: 2px solid transparent;
  transition: background 0.1s;
}
.nd-nav-link:hover { background: var(--gh-canvas-subtle); color: var(--gh-fg); text-decoration: none; }
.nd-nav-link.active {
  background: var(--gh-accent-subtle);
  color: var(--gh-accent-fg);
  border-right-color: var(--gh-accent);
  font-weight: 600;
}
.nd-nav-num {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 11px;
  color: var(--gh-fg-subtle);
  margin-top: 1px;
  flex-shrink: 0;
  width: 18px;
}

/* ── Main ── */
.nd-main {
  flex: 1;
  overflow-y: auto;
  background: var(--gh-canvas);
}

/* ── File header (doc page) ── */
.nd-file-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 24px;
  background: var(--gh-canvas-subtle);
  border-bottom: 1px solid var(--gh-border);
}
.nd-file-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--gh-fg);
}
.nd-file-header-right {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 11px;
  color: var(--gh-fg-muted);
}

/* ── Index page content ── */
.nd-index-body {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 40px;
}
.nd-repo-header {
  padding-bottom: 24px;
  border-bottom: 1px solid var(--gh-border);
  margin-bottom: 32px;
}
.nd-repo-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--gh-fg);
  margin: 0 0 6px;
}
.nd-repo-desc {
  font-size: 14px;
  color: var(--gh-fg-muted);
  margin: 0 0 12px;
}
.nd-repo-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--gh-fg-muted);
}

/* File list table */
.nd-file-list {
  background: var(--gh-canvas);
  border: 1px solid var(--gh-border);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 0 rgba(31,35,40,0.04);
}
.nd-file-list-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: var(--gh-canvas-subtle);
  border-bottom: 1px solid var(--gh-border);
  font-size: 13px;
  font-weight: 600;
  color: var(--gh-fg);
}
.nd-file-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--gh-border);
  transition: background 0.1s;
  text-decoration: none;
  color: var(--gh-fg);
}
.nd-file-row:last-child { border-bottom: none; }
.nd-file-row:hover { background: var(--gh-canvas-subtle); text-decoration: none; }
.nd-file-icon { color: var(--gh-fg-muted); flex-shrink: 0; }
.nd-file-num {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 11px;
  color: var(--gh-fg-subtle);
  width: 18px;
  flex-shrink: 0;
}
.nd-file-name { font-size: 13px; font-weight: 500; color: var(--gh-accent); flex: 1; }
.nd-file-row:hover .nd-file-name { text-decoration: underline; }
.nd-file-slug {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 11px;
  color: var(--gh-fg-muted);
}

/* ── Prose content ── */
.nd-content { padding: 40px 56px; }

.prose { font-size: 16px; line-height: 1.7; color: var(--gh-fg); max-width: none; }
.prose h1 { font-size: 2rem; font-weight: 600; line-height: 1.25; margin: 0 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--gh-border); color: var(--gh-fg); letter-spacing: -0.02em; }
.prose h2 { font-size: 1.5rem; font-weight: 600; margin: 2rem 0 0.75rem; padding-bottom: 0.3rem; border-bottom: 1px solid var(--gh-border); color: var(--gh-fg); }
.prose h3 { font-size: 1rem; font-weight: 600; margin: 1.5rem 0 0.5rem; color: var(--gh-fg); }
.prose h4, .prose h5, .prose h6 { font-size: 0.875rem; font-weight: 600; margin: 1.25rem 0 0.4rem; color: var(--gh-fg); }
.prose p { margin: 0 0 1rem; }
.prose a { color: var(--gh-accent); text-decoration: none; }
.prose a:hover { text-decoration: underline; }
.prose strong { font-weight: 600; }
.prose em { font-style: italic; }
.prose code { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace; font-size: 85%; background: rgba(175,184,193,0.2); border-radius: 6px; padding: 0.2em 0.4em; }
.prose pre { background: var(--gh-canvas-subtle); border: 1px solid var(--gh-border); border-radius: 6px; padding: 1rem; overflow-x: auto; margin: 1rem 0; }
.prose pre code { background: none; border: none; padding: 0; font-size: 85%; color: var(--gh-fg); }
.prose blockquote { border-left: 4px solid var(--gh-border); margin: 1rem 0; padding: 0 1rem; color: var(--gh-fg-muted); }
.prose ul { list-style: disc; }
.prose ol { list-style: decimal; }
.prose ul, .prose ol { margin: 0 0 1rem; padding-left: 2em; }
.prose li { margin-bottom: 0.25rem; }
.prose li > ul, .prose li > ol { margin-bottom: 0; margin-top: 0.25rem; }
.prose hr { border: none; border-top: 1px solid var(--gh-border); margin: 1.5rem 0; }
.prose table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 14px; display: block; overflow: auto; }
.prose th, .prose td { border: 1px solid var(--gh-border); padding: 6px 13px; }
.prose th { background: var(--gh-canvas-subtle); font-weight: 600; }
.prose tr:nth-child(even) { background: var(--gh-canvas-subtle); }
.katex { font-size: 1em; }
.katex-display { margin: 1.5rem 0; overflow-x: auto; }

/* ── Prev/Next navigation ── */
.nd-docnav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--gh-border);
}
.nd-docnav a {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--gh-accent);
  text-decoration: none;
}
.nd-docnav a:hover { text-decoration: underline; }
.nd-docnav-label { display: block; font-size: 11px; color: var(--gh-fg-muted); font-weight: 400; margin-bottom: 2px; }
.nd-docnav-next { flex-direction: row-reverse; text-align: right; }

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--gh-border); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #afb8c1; }
`;
