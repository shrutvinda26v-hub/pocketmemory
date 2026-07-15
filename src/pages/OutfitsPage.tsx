import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Plus, Trash2 } from 'lucide-react'
import { useWardrobeContext } from '../context/WardrobeContext'
import { ItemSwatch } from '../components/ItemVisual'
import { Modal } from '../components/Modal'
import { CATEGORIES, type Category } from '../types'

export function OutfitsPage() {
  const { items, outfits, addOutfit, removeOutfit, logWear } = useWardrobeContext()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [occasion, setOccasion] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [filter, setFilter] = useState<Category | 'all'>('all')

  const selectable = useMemo(
    () =>
      items.filter((item) => filter === 'all' || item.category === filter),
    [items, filter],
  )

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function resetForm() {
    setName('')
    setOccasion('')
    setSelected([])
    setFilter('all')
  }

  function saveOutfit() {
    if (!name.trim() || selected.length === 0) return
    addOutfit({
      name: name.trim(),
      itemIds: selected,
      occasion: occasion.trim() || undefined,
    })
    resetForm()
    setOpen(false)
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-4xl">Outfits</h2>
          <p className="text-sm text-[var(--muted)]">
            Compose looks from your closet
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--leaf-deep)] px-4 py-2.5 text-sm font-semibold text-[#f3eee6] transition hover:bg-[var(--ink)]"
        >
          <Plus size={16} />
          New outfit
        </button>
      </div>

      {outfits.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-[var(--line)] px-5 py-10 text-center text-[var(--muted)]">
          No outfits yet. Build your first look from pieces in the closet.
        </p>
      ) : (
        <ul className="space-y-4">
          {outfits.map((outfit, i) => {
            const pieces = outfit.itemIds
              .map((id) => items.find((item) => item.id === id))
              .filter(Boolean)
            return (
              <motion.li
                key={outfit.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-[1.75rem] border border-[var(--line)] bg-white/40 p-4 backdrop-blur-sm sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-2xl">{outfit.name}</h3>
                    <p className="text-sm text-[var(--muted)]">
                      {outfit.occasion ?? 'Everyday'}
                      {outfit.lastWorn
                        ? ` · last worn ${new Date(outfit.lastWorn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                        : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOutfit(outfit.id)}
                    className="rounded-xl p-2 text-[var(--muted)] hover:bg-[rgba(166,107,74,0.12)] hover:text-[var(--clay)]"
                    aria-label={`Delete ${outfit.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {pieces.map((item) =>
                    item ? (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-2xl bg-[var(--paper-deep)]/60 px-2 py-1.5"
                      >
                        <ItemSwatch
                          item={item}
                          size="sm"
                          className="!h-8 !w-8 !rounded-xl"
                        />
                        <span className="pr-1 text-sm font-medium">{item.name}</span>
                      </div>
                    ) : null,
                  )}
                </div>

                <button
                  type="button"
                  className="mt-4 text-sm font-semibold text-[var(--leaf)] hover:text-[var(--leaf-deep)]"
                  onClick={() =>
                    logWear({
                      date: today,
                      outfitId: outfit.id,
                      itemIds: outfit.itemIds,
                      note: `Wore ${outfit.name}`,
                    })
                  }
                >
                  Log as worn today
                </button>
              </motion.li>
            )
          })}
        </ul>
      )}

      <Modal open={open} onClose={() => { setOpen(false); resetForm() }} title="Build outfit">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--ink-soft)]">
              Outfit name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Soft Monday"
              className="w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2.5 outline-none ring-[var(--leaf)] focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--ink-soft)]">
              Occasion
            </span>
            <input
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="Work, weekend, evening…"
              className="w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2.5 outline-none ring-[var(--leaf)] focus:ring-2"
            />
          </label>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
                filter === 'all'
                  ? 'bg-[var(--leaf-deep)] text-[#f3eee6]'
                  : 'bg-white/50 text-[var(--ink-soft)]'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(c.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
                  filter === c.id
                    ? 'bg-[var(--leaf-deep)] text-[#f3eee6]'
                    : 'bg-white/50 text-[var(--ink-soft)]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {selectable.map((item) => {
              const on = selected.includes(item.id)
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition ${
                      on
                        ? 'border-[var(--leaf)] bg-[rgba(74,107,82,0.12)]'
                        : 'border-transparent bg-white/40 hover:bg-white/70'
                    }`}
                  >
                    <ItemSwatch item={item} size="sm" className="!rounded-xl" />
                    <span className="flex-1 font-medium">{item.name}</span>
                    {on && <Check size={16} className="text-[var(--leaf)]" />}
                  </button>
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            disabled={!name.trim() || selected.length === 0}
            onClick={saveOutfit}
            className="w-full rounded-2xl bg-[var(--leaf-deep)] px-4 py-3 font-semibold text-[#f3eee6] transition hover:bg-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save outfit ({selected.length})
          </button>
        </div>
      </Modal>
    </div>
  )
}
