import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useWardrobeContext } from '../context/WardrobeContext'
import { ItemSwatch } from '../components/ItemVisual'
import { Modal } from '../components/Modal'

export function MemoryPage() {
  const { items, outfits, wearLog, logWear, resetToSample } = useWardrobeContext()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [outfitId, setOutfitId] = useState<string>('')

  const grouped = useMemo(() => {
    const map = new Map<string, typeof wearLog>()
    for (const entry of wearLog) {
      const list = map.get(entry.date) ?? []
      list.push(entry)
      map.set(entry.date, list)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [wearLog])

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function applyOutfit(id: string) {
    setOutfitId(id)
    const outfit = outfits.find((o) => o.id === id)
    if (outfit) setSelected(outfit.itemIds)
  }

  function save() {
    if (selected.length === 0) return
    logWear({
      date,
      itemIds: selected,
      outfitId: outfitId || undefined,
      note: note.trim() || undefined,
    })
    setOpen(false)
    setNote('')
    setSelected([])
    setOutfitId('')
    setDate(new Date().toISOString().slice(0, 10))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-4xl">Memory</h2>
          <p className="text-sm text-[var(--muted)]">
            A journal of what you actually wore
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--leaf-deep)] px-4 py-2.5 text-sm font-semibold text-[#f3eee6] transition hover:bg-[var(--ink)]"
        >
          <Plus size={16} />
          Log a day
        </button>
      </div>

      {grouped.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-[var(--line)] px-5 py-10 text-center text-[var(--muted)]">
          Your wear journal is empty. Log today&apos;s look to start a memory.
        </p>
      ) : (
        <div className="space-y-8">
          {grouped.map(([day, entries], gi) => (
            <section key={day}>
              <h3 className="font-display mb-3 text-2xl text-[var(--ink)]">
                {new Date(`${day}T12:00:00`).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <ul className="space-y-3">
                {entries.map((entry, i) => {
                  const outfit = outfits.find((o) => o.id === entry.outfitId)
                  return (
                    <motion.li
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: gi * 0.02 + i * 0.03 }}
                      className="rounded-3xl border border-[var(--line)] bg-white/40 p-4 backdrop-blur-sm"
                    >
                      <p className="font-semibold">
                        {outfit?.name ?? 'Custom look'}
                      </p>
                      {entry.note && (
                        <p className="mt-1 text-sm text-[var(--muted)]">{entry.note}</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {entry.itemIds.map((id) => {
                          const item = items.find((x) => x.id === id)
                          if (!item) return null
                          return (
                            <div
                              key={id}
                              className="flex items-center gap-2 rounded-2xl bg-[var(--paper-deep)]/60 px-2 py-1.5"
                            >
                              <ItemSwatch
                                item={item}
                                size="sm"
                                className="!h-7 !w-7 !rounded-lg"
                              />
                              <span className="pr-1 text-xs font-medium">{item.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </motion.li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <div className="pt-4 text-center">
        <button
          type="button"
          onClick={resetToSample}
          className="text-xs font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
        >
          Reset to sample wardrobe
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Log what you wore">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--ink-soft)]">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2.5 outline-none ring-[var(--leaf)] focus:ring-2"
            />
          </label>

          {outfits.length > 0 && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[var(--ink-soft)]">
                Start from outfit
              </span>
              <select
                value={outfitId}
                onChange={(e) => applyOutfit(e.target.value)}
                className="w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2.5 outline-none ring-[var(--leaf)] focus:ring-2"
              >
                <option value="">Custom selection</option>
                {outfits.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-[var(--ink-soft)]">Pieces worn</p>
            <ul className="max-h-52 space-y-2 overflow-y-auto">
              {items.map((item) => {
                const on = selected.includes(item.id)
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left ${
                        on
                          ? 'bg-[rgba(74,107,82,0.14)]'
                          : 'bg-white/40 hover:bg-white/70'
                      }`}
                    >
                      <ItemSwatch item={item} size="sm" className="!rounded-xl" />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--ink-soft)]">Note</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Coffee run, dinner, travel day…"
              className="w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2.5 outline-none ring-[var(--leaf)] focus:ring-2"
            />
          </label>

          <button
            type="button"
            disabled={selected.length === 0}
            onClick={save}
            className="w-full rounded-2xl bg-[var(--leaf-deep)] px-4 py-3 font-semibold text-[#f3eee6] disabled:opacity-40"
          >
            Save memory
          </button>
        </div>
      </Modal>
    </div>
  )
}
