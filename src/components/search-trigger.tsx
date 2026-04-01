"use client";

// Lightweight button that opens the SearchModal via keyboard event
export function SearchTrigger({ compact }: { compact?: boolean }) {
  function handleClick() {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    );
  }

  if (compact) {
    return (
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 px-2.5 py-1 text-gh-xs font-semibold text-gh-header-text bg-white/10 border border-white/20 rounded-gh hover:bg-white/20 transition-colors"
        title="Cerca (Cmd+K)"
      >
        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
          <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"/>
        </svg>
        <span className="hidden sm:inline">Cerca</span>
        <kbd className="hidden lg:inline-flex items-center font-mono text-gh-header-muted text-[10px]">⌘K</kbd>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-1.5 text-gh-sm text-gh-fg-muted bg-gh-canvas border border-gh-border rounded-gh hover:border-gh-accent hover:text-gh-fg transition-colors w-48 shadow-gh-sm"
      title="Cerca (Cmd+K)"
    >
      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
        <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"/>
      </svg>
      <span className="flex-1 text-left">Cerca…</span>
      <kbd className="flex items-center gap-0.5 font-mono text-gh-fg-subtle text-[10px]">⌘K</kbd>
    </button>
  );
}
