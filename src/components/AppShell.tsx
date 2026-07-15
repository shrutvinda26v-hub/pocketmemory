import { NavLink } from 'react-router-dom'
import { BookOpen, Home, Shirt, Sparkles } from 'lucide-react'

const links = [
  { to: '/', label: 'Today', icon: Home, end: true },
  { to: '/closet', label: 'Closet', icon: Shirt },
  { to: '/outfits', label: 'Outfits', icon: Sparkles },
  { to: '/memory', label: 'Memory', icon: BookOpen },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[var(--leaf)] uppercase">
            Wardrobe journal
          </p>
          <h1 className="font-display mt-1 text-4xl leading-none text-[var(--ink)] sm:text-5xl">
            Pocket Memory
          </h1>
        </div>
        <div className="hidden text-right text-sm text-[var(--muted)] sm:block">
          Remember what you wore —
          <br />
          wear what you love.
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[rgba(243,238,230,0.88)] px-3 py-2 backdrop-blur-md"
        aria-label="Primary"
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-between gap-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    'flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold tracking-wide transition-colors',
                    isActive
                      ? 'bg-[var(--leaf-deep)] text-[#f3eee6]'
                      : 'text-[var(--muted)] hover:bg-[rgba(74,107,82,0.1)] hover:text-[var(--ink)]',
                  ].join(' ')
                }
              >
                <Icon size={18} strokeWidth={2} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
