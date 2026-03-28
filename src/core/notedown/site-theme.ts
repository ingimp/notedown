export const DOCUMENT_SITE_CSS = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #24292f; background: #f6f8fa; }
a { color: #0969da; text-decoration: none; }
a:hover { text-decoration: underline; }
.nd-shell { max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem 2.5rem; display: grid; gap: 1.25rem; grid-template-columns: 280px minmax(0, 1fr); }
.nd-sidebar { position: sticky; top: 1rem; align-self: start; background: #fff; border: 1px solid #d0d7de; border-radius: 10px; padding: 1rem; max-height: calc(100vh - 2rem); overflow: auto; }
.nd-sidebar-title { margin: 0 0 0.85rem; font-size: 1.1rem; line-height: 1.35; }
.nd-sidebar-list { margin: 0; padding-left: 1.1rem; display: grid; gap: 0.5rem; }
.nd-sidebar-list a { color: #57606a; }
.nd-sidebar-list a.is-active { color: #0a3069; font-weight: 600; }
.nd-main { min-width: 0; background: #fff; border: 1px solid #d0d7de; border-radius: 10px; padding: 1.25rem; }
.markdown-body { line-height: 1.65; }
.markdown-body h1, .markdown-body h2, .markdown-body h3 { border-bottom: 1px solid #d0d7de; padding-bottom: .3em; }
.markdown-body pre { background: #f6f8fa; border-radius: 6px; padding: 1rem; overflow-x: auto; }
.markdown-body code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
.markdown-body table { border-collapse: collapse; width: 100%; }
.markdown-body th, .markdown-body td { border: 1px solid #d0d7de; padding: 0.4rem 0.6rem; }
.nd-nav-grid { display: flex; justify-content: space-between; margin-top: 2.5rem; gap: 1rem; border-top: 1px solid #d0d7de; padding-top: 1rem; }
@media (max-width: 980px) {
  .nd-shell { grid-template-columns: 1fr; }
  .nd-sidebar { position: static; max-height: none; }
}
`;
