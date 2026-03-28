export const DOCUMENT_SITE_CSS = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  color: #0f172a;
  background: #f4f6fb;
}
a { color: #1d4ed8; text-decoration: none; }
a:hover { text-decoration: underline; }
.nd-shell {
  max-width: 1260px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 250px minmax(0, 1fr);
}
.nd-sidebar {
  position: sticky;
  top: 1rem;
  align-self: start;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #dbe1ea;
  border-radius: 14px;
  padding: 1rem;
  max-height: calc(100vh - 2rem);
  overflow: auto;
  backdrop-filter: blur(2px);
}
.nd-sidebar-title {
  margin: 0 0 0.95rem;
  font-size: 1rem;
  line-height: 1.4;
  letter-spacing: 0.01em;
}
.nd-sidebar-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.35rem;
}
.nd-sidebar-list a {
  display: block;
  border-radius: 8px;
  padding: 0.45rem 0.55rem;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.35;
}
.nd-sidebar-list a:hover {
  text-decoration: none;
  background: #eff6ff;
  color: #1e3a8a;
}
.nd-sidebar-list a.is-active {
  background: #dbeafe;
  color: #1e3a8a;
  font-weight: 600;
}
.nd-main {
  min-width: 0;
  background: #fff;
  border: 1px solid #dbe1ea;
  border-radius: 14px;
  padding: clamp(1.25rem, 2vw, 2rem);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}
.markdown-body {
  max-width: 74ch;
  margin: 0 auto;
  font-size: 1.03rem;
  line-height: 1.78;
  color: #1e293b;
}
.markdown-body > :first-child { margin-top: 0; }
.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  margin-top: 2.2rem;
  margin-bottom: 0.9rem;
  line-height: 1.28;
  color: #0f172a;
  letter-spacing: -0.01em;
}
.markdown-body h1 {
  font-size: clamp(2rem, 2.4vw, 2.45rem);
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
}
.markdown-body h2 {
  font-size: clamp(1.5rem, 1.9vw, 1.8rem);
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.35rem;
}
.markdown-body h3 { font-size: 1.24rem; }
.markdown-body p,
.markdown-body ul,
.markdown-body ol,
.markdown-body blockquote,
.markdown-body pre,
.markdown-body table { margin: 1rem 0; }
.markdown-body blockquote {
  margin-left: 0;
  border-left: 3px solid #cbd5e1;
  padding: 0.25rem 0 0.25rem 1rem;
  color: #334155;
}
.markdown-body pre {
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 1rem;
  overflow-x: auto;
}
.markdown-body code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 0.92em;
}
.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.95rem;
}
.markdown-body th,
.markdown-body td {
  border: 1px solid #dbe1ea;
  padding: 0.5rem 0.65rem;
}
.nd-nav-grid {
  max-width: 74ch;
  margin: 2.5rem auto 0;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
  color: #475569;
}
.nd-nav-grid a {
  border-radius: 8px;
  padding: 0.4rem 0.55rem;
}
.nd-nav-grid a:hover {
  background: #eff6ff;
  text-decoration: none;
}
@media (max-width: 980px) {
  .nd-shell { grid-template-columns: 1fr; }
  .nd-sidebar { position: static; max-height: none; }
}
`;
