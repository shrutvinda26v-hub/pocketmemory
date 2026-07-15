import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWardrobeContext } from '../context/WardrobeContext'
import { ItemMeta, ItemSwatch } from '../components/ItemVisual'
import { CATEGORIES } from '../types'

function formatDate(iso?: string) {
  if (!iso) return 'Never'
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function TodayPage() {
  const { items, outfits, wearLog, logWear } = useWardrobeContext()
  const today = new Date().toISOString().slice(0, 10)
  const wornToday = wearLog.find((w) => w.date === today)
  const recent = wearLog.slice(0, 3)
  const favorites = [...items].sort((a, b) => b.timesWorn - a.timesWorn).slice(0, 4)
  const suggested = outfits[0]

  return (
    <div className="space-y-10">
      <section className="animate-rise relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(135deg,#2f4a3a_0%,#1a221c_55%,#3d4a40_100%)] px-6 py-10 text-[#f3eee6] sm:px-10 sm:py-14">
        <div
          className="pointer-events-none absolute -right-8 -top-10 h-56 w-56 rounded-full opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(200,213,195,0.7), transparent 70%)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-sm font-medium tracking-[0.18em] text-[#c8d5c3] uppercase">
            Pocket Memory
          </p>
          <h2 className="font-display mt-3 max-w-md text-5xl leading-[0.95] sm:text-6xl">
            Your closet, remembered.
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-[#d5ddd4]">
            Log what you wear, build outfits you love, and never forget a favorite combo again.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/closet"
              className="rounded-2xl bg-[#f3eee6] px-5 py-3 text-sm font-semibold text-[var(--leaf-deep)] transition hover:bg-white"
            >
              Open closet
            </Link>
            <Link
              to="/outfits"
              className="rounded-2xl border border-[#c8d5c3]/50 px-5 py-3 text-sm font-semibold text-[#f3eee6] transition hover:bg-white/10"
            >
              Build an outfit
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="animate-rise" style={{ animationDelay: '80ms' }}>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="font-display text-3xl">Today</h3>
            <p className="text-sm text-[var(--muted)]">
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {wornToday ? (
          <div className="rounded-3xl border border-[var(--line)] bg-white/45 p-5 backdrop-blur-sm">
            <p className="text-sm font-semibold text-[var(--leaf)]">Logged for today</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {wornToday.itemIds.map((id) => {
                const item = items.find((i) => i.id === id)
                if (!item) return null
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 rounded-2xl bg-[var(--paper-deep)]/70 px-2 py-1.5"
                  >
                    <ItemSwatch item={item} size="sm" className="!h-8 !w-8 !rounded-xl" />
                    <span className="pr-1 text-sm font-medium">{item.name}</span>
                  </div>
                )
              })}
            </div>
            {wornToday.note && (
              <p className="mt-3 text-sm text-[var(--muted)]">{wornToday.note}</p>
            )}
          </div>
        ) : suggested ? (
          <div className="rounded-3xl border border-[var(--line)] bg-white/45 p-5 backdrop-blur-sm">
            <p className="text-sm font-semibold text-[var(--leaf)]">Try wearing</p>
            <h4 className="font-display mt-1 text-2xl">{suggested.name}</h4>
            <div className="mt-3 flex -space-x-2">
              {suggested.itemIds.map((id) => {
                const item = items.find((i) => i.id === id)
                if (!item) return null
                return (
                  <ItemSwatch
                    key={id}
                    item={item}
                    size="sm"
                    className="!rounded-full border-2 border-[#f3eee6]"
                  />
                )
              })}
            </div>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[var(--leaf-deep)] px-4 py-2.5 text-sm font-semibold text-[#f3eee6] transition hover:bg-[var(--ink)]"
              onClick={() =>
                logWear({
                  date: today,
                  outfitId: suggested.id,
                  itemIds: suggested.itemIds,
                  note: `Wore ${suggested.name}`,
                })
              }
            >
              <Plus size={16} />
              Log this outfit
            </button>
          </div>
        ) : (
          <p className="text-[var(--muted)]">Add pieces to start logging what you wear.</p>
        )}
      </section>

      <section className="animate-rise" style={{ animationDelay: '140ms' }}>
        <div className="mb-4 flex items-end justify-between">
          <h3 className="font-display text-3xl">Most worn</h3>
          <Link to="/closet" className="text-sm font-semibold text-[var(--leaf)]">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {favorites.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-3xl border border-[var(--line)] bg-white/40 p-3 backdrop-blur-sm"
            >
              <ItemSwatch item={item} size="lg" className="mb-3 h-24" />
              <ItemMeta item={item} />
              <p className="mt-2 text-xs text-[var(--muted)]">{item.timesWorn} wears</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="animate-rise" style={{ animationDelay: '200ms' }}>
        <div className="mb-4 flex items-end justify-between">
          <h3 className="font-display text-3xl">Recent memory</h3>
          <Link to="/memory" className="text-sm font-semibold text-[var(--leaf)]">
            Journal
          </Link>
        </div>
        <ul className="space-y-3">
          {recent.map((entry) => {
            const outfit = outfits.find((o) => o.id === entry.outfitId)
            return (
              <li
                key={entry.id}
                className="flex items-center gap-4 rounded-2xl border border-[var(--line)] bg-white/35 px-4 py-3"
              >
                <div className="flex -space-x-2">
                  {entry.itemIds.slice(0, 3).map((id) => {
                    const item = items.find((i) => i.id === id)
                    if (!item) return null
                    return (
                      <ItemSwatch
                        key={id}
                        item={item}
                        size="sm"
                        className="!rounded-full border-2 border-[#f3eee6]"
                      />
                    )
                  })}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {outfit?.name ??
                      (entry.itemIds
                        .map((id) => items.find((i) => i.id === id)?.name)
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(' + ') ||
                        'Look')}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {formatDate(entry.date)}
                    {entry.note ? ` · ${entry.note}` : ''}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="pb-2 text-center text-xs text-[var(--muted)]">
        {items.length} pieces · {outfits.length} outfits ·{' '}
        {CATEGORIES.length} categories
      </section>
    </div>
  )
}
