import { Button } from "@/components/ui/button"

const NAV_LINKS: { label: string; href: string; active?: boolean }[] = [
  { label: "Home", href: "#", active: true },
  { label: "Studio", href: "#studio" },
  { label: "About", href: "#about" },
  { label: "Journal", href: "#journal" },
  { label: "Reach Us", href: "#reach-us" },
]

const displayFont = { fontFamily: "'Instrument Serif', serif" } as const

export function SiteNav() {
  return (
    <nav className="relative z-10 mx-auto flex max-w-7xl flex-row items-center justify-between px-8 py-6">
      <a
        href="#"
        className="text-3xl tracking-tight text-foreground"
        style={displayFont}
      >
        Velorah<sup className="text-xs">®</sup>
      </a>

      <div className="hidden items-center gap-8 md:flex">
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={`text-sm transition-colors hover:text-foreground ${
              link.active ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {link.label}
          </a>
        ))}
      </div>

      <Button
        variant="liquid"
        size="auto"
        className="rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03]"
      >
        Begin Journey
      </Button>
    </nav>
  )
}
