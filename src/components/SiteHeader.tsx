import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src="/purplle-logo.jpg" alt="Purplle" className="h-7 w-auto" />
          <span className="hidden border-l border-border pl-3 text-sm font-medium text-muted-foreground sm:block">
            Packer Training
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
            activeProps={{ className: "bg-secondary text-secondary-foreground" }}
          >
            Training
          </Link>
        </nav>
      </div>
    </header>
  );
}
