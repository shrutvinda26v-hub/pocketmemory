import { useState } from 'react'
import {
  CATEGORIES,
  COLOR_PRESETS,
  SEASONS,
  type Category,
  type Season,
  type WardrobeItem,
} from '../types'

type Draft = {
  name: string
  category: Category
  color: string
  colorHex: string
  season: Season
  notes: string
}

const empty: Draft = {
  name: '',
  category: 'tops',
  color: COLOR_PRESETS[0].name,
  colorHex: COLOR_PRESETS[0].hex,
  season: 'all',
  notes: '',
}

export function ItemForm({
  initial,
  onSubmit,
  submitLabel = 'Save piece',
}: {
  initial?: Partial<WardrobeItem>
  onSubmit: (data: Omit<WardrobeItem, 'id' | 'timesWorn' | 'createdAt' | 'lastWorn'>) => void
  submitLabel?: string
}) {
  const [draft, setDraft] = useState<Draft>({
    ...empty,
    name: initial?.name ?? '',
    category: initial?.category ?? 'tops',
    color: initial?.color ?? COLOR_PRESETS[0].name,
    colorHex: initial?.colorHex ?? COLOR_PRESETS[0].hex,
    season: initial?.season ?? 'all',
    notes: initial?.notes ?? '',
  })

  function setColor(preset: (typeof COLOR_PRESETS)[number]) {
    setDraft((d) => ({ ...d, color: preset.name, colorHex: preset.hex }))
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!draft.name.trim()) return
        onSubmit({
          name: draft.name.trim(),
          category: draft.category,
          color: draft.color,
          colorHex: draft.colorHex,
          season: draft.season,
          notes: draft.notes.trim() || undefined,
        })
      }}
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-[var(--ink-soft)]">Name</span>
        <input
          required
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          placeholder="e.g. Linen button-down"
          className="w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2.5 outline-none ring-[var(--leaf)] focus:ring-2"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-[var(--ink-soft)]">Category</span>
          <select
            value={draft.category}
            onChange={(e) =>
              setDraft((d) => ({ ...d, category: e.target.value as Category }))
            }
            className="w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2.5 outline-none ring-[var(--leaf)] focus:ring-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-[var(--ink-soft)]">Season</span>
          <select
            value={draft.season}
            onChange={(e) =>
              setDraft((d) => ({ ...d, season: e.target.value as Season }))
            }
            className="w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2.5 outline-none ring-[var(--leaf)] focus:ring-2"
          >
            {SEASONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-[var(--ink-soft)]">Color</legend>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((preset) => {
            const selected = draft.colorHex === preset.hex
            return (
              <button
                key={preset.hex}
                type="button"
                title={preset.name}
                onClick={() => setColor(preset)}
                className={`h-8 w-8 rounded-full border-2 transition ${
                  selected
                    ? 'scale-110 border-[var(--ink)]'
                    : 'border-white/70 hover:scale-105'
                }`}
                style={{ background: preset.hex }}
                aria-label={preset.name}
                aria-pressed={selected}
              />
            )
          })}
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">{draft.color}</p>
      </fieldset>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-[var(--ink-soft)]">Notes</span>
        <textarea
          value={draft.notes}
          onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
          rows={2}
          placeholder="Optional — fit, fabric, when you reach for it"
          className="w-full resize-none rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2.5 outline-none ring-[var(--leaf)] focus:ring-2"
        />
      </label>

      <button
        type="submit"
        className="w-full rounded-2xl bg-[var(--leaf-deep)] px-4 py-3 font-semibold text-[#f3eee6] transition hover:bg-[var(--ink)]"
      >
        {submitLabel}
      </button>
    </form>
  )
}
