import { useEffect, useState } from 'react'
import { SAMPLE_ITEMS, SAMPLE_OUTFITS, SAMPLE_WEAR_LOG } from '../data/sampleData'
import type {
  Outfit,
  WardrobeItem,
  WardrobeState,
  WearEntry,
} from '../types'

const STORAGE_KEY = 'pocket-memory-wardrobe-v1'

function loadState(): WardrobeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as WardrobeState
  } catch {
    // ignore corrupt storage
  }
  return {
    items: SAMPLE_ITEMS,
    outfits: SAMPLE_OUTFITS,
    wearLog: SAMPLE_WEAR_LOG,
  }
}

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

export function useWardrobe() {
  const [state, setState] = useState<WardrobeState>(loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  function addItem(
    input: Omit<WardrobeItem, 'id' | 'timesWorn' | 'createdAt' | 'lastWorn'>,
  ) {
    const item: WardrobeItem = {
      ...input,
      id: uid('item'),
      timesWorn: 0,
      createdAt: new Date().toISOString(),
    }
    setState((s) => ({ ...s, items: [item, ...s.items] }))
    return item
  }

  function updateItem(id: string, patch: Partial<WardrobeItem>) {
    setState((s) => ({
      ...s,
      items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }))
  }

  function removeItem(id: string) {
    setState((s) => ({
      ...s,
      items: s.items.filter((i) => i.id !== id),
      outfits: s.outfits.map((o) => ({
        ...o,
        itemIds: o.itemIds.filter((iid) => iid !== id),
      })),
      wearLog: s.wearLog.map((w) => ({
        ...w,
        itemIds: w.itemIds.filter((iid) => iid !== id),
      })),
    }))
  }

  function addOutfit(input: Omit<Outfit, 'id' | 'createdAt' | 'lastWorn'>) {
    const outfit: Outfit = {
      ...input,
      id: uid('outfit'),
      createdAt: new Date().toISOString(),
    }
    setState((s) => ({ ...s, outfits: [outfit, ...s.outfits] }))
    return outfit
  }

  function removeOutfit(id: string) {
    setState((s) => ({
      ...s,
      outfits: s.outfits.filter((o) => o.id !== id),
    }))
  }

  function logWear(input: Omit<WearEntry, 'id'>) {
    const entry: WearEntry = { ...input, id: uid('wear') }
    const today = input.date
    setState((s) => {
      const items = s.items.map((item) =>
        input.itemIds.includes(item.id)
          ? {
              ...item,
              timesWorn: item.timesWorn + 1,
              lastWorn: today,
            }
          : item,
      )
      const outfits = s.outfits.map((o) =>
        o.id === input.outfitId ? { ...o, lastWorn: today } : o,
      )
      return {
        ...s,
        items,
        outfits,
        wearLog: [entry, ...s.wearLog],
      }
    })
    return entry
  }

  function resetToSample() {
    const next = {
      items: SAMPLE_ITEMS,
      outfits: SAMPLE_OUTFITS,
      wearLog: SAMPLE_WEAR_LOG,
    }
    setState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  return {
    ...state,
    addItem,
    updateItem,
    removeItem,
    addOutfit,
    removeOutfit,
    logWear,
    resetToSample,
  }
}

export type WardrobeApi = ReturnType<typeof useWardrobe>
