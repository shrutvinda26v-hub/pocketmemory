import type { WardrobeItem } from '../types'
import { CATEGORIES } from '../types'

export function ItemSwatch({
  item,
  size = 'md',
  className = '',
}: {
  item: WardrobeItem
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const dims =
    size === 'sm' ? 'h-10 w-10' : size === 'lg' ? 'h-28 w-full' : 'h-16 w-16'

  return (
    <div
      className={`swatch relative overflow-hidden rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ${dims} ${className}`}
      style={{ ['--swatch' as string]: item.colorHex }}
      aria-hidden
    >
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 opacity-40"
        style={{
          background: `linear-gradient(to top, ${item.colorHex}cc, transparent)`,
        }}
      />
    </div>
  )
}

export function ItemMeta({ item }: { item: WardrobeItem }) {
  const category = CATEGORIES.find((c) => c.id === item.category)?.label
  return (
    <div className="min-w-0">
      <p className="truncate font-semibold text-[var(--ink)]">{item.name}</p>
      <p className="mt-0.5 truncate text-sm text-[var(--muted)]">
        {category} · {item.color}
      </p>
    </div>
  )
}
