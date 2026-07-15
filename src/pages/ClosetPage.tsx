import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useWardrobeContext } from '../context/WardrobeContext'
import { ItemForm } from '../components/ItemForm'
import { ItemMeta, ItemSwatch } from '../components/ItemVisual'
import { Modal } from '../components/Modal'
import { CATEGORIES, type Category } from '../types'

export function ClosetPage() {
  const { items, addItem, removeItem } = useWardrobeContext()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = category === 'all' || item.category === category
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.color.toLowerCase().includes(q) ||
        item.notes?.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [items, category, query])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-4xl">Closet</h2>
          <p className="text-sm text-[var(--muted)]">
            {items.length} pieces in your wardrobe
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--leaf-deep)] px-4 py-2.5 text-sm font-semibold text-[#f3eee6] transition hover:bg-[var(--ink)]"
        >
          <Plus size={16} />
          Add piece
        </button>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--muted)]"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, color, note…"
          className="w-full rounded-2xl border border-[var(--line)] bg-white/50 py-3 pr-4 pl-10 outline-none ring-[var(--leaf)] focus:ring-2"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip
          active={category === 'all'}
          onClick={() => setCategory('all')}
          label="All"
        />
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c.id}
            active={category === c.id}
            onClick={() => setCategory(c.id)}
            label={c.label}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-[var(--line)] px-5 py-10 text-center text-[var(--muted)]">
          No pieces match. Try another filter or add something new.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="group flex gap-3 rounded-3xl border border-[var(--line)] bg-white/40 p-3 backdrop-blur-sm"
            >
              <ItemSwatch item={item} className="shrink-0 !h-20 !w-20" />
              <div className="flex min-w-0 flex-1 flex-col">
                <ItemMeta item={item} />
                <p className="mt-auto pt-2 text-xs text-[var(--muted)]">
                  Worn {item.timesWorn}×
                  {item.season !== 'all' ? ` · ${item.season}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="self-start rounded-xl p-2 text-[var(--muted)] opacity-70 transition hover:bg-[rgba(166,107,74,0.12)] hover:text-[var(--clay)] sm:opacity-0 sm:group-hover:opacity-100"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 size={16} />
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add a piece">
        <ItemForm
          onSubmit={(data) => {
            addItem(data)
            setOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
        active
          ? 'bg-[var(--leaf-deep)] text-[#f3eee6]'
          : 'bg-white/45 text-[var(--ink-soft)] hover:bg-white/70'
      }`}
    >
      {label}
    </button>
  )
}
