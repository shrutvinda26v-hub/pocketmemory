export type Category =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'shoes'
  | 'accessories'

export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all'

export interface WardrobeItem {
  id: string
  name: string
  category: Category
  color: string
  colorHex: string
  season: Season
  notes?: string
  timesWorn: number
  lastWorn?: string
  createdAt: string
}

export interface Outfit {
  id: string
  name: string
  itemIds: string[]
  occasion?: string
  createdAt: string
  lastWorn?: string
}

export interface WearEntry {
  id: string
  date: string
  outfitId?: string
  itemIds: string[]
  note?: string
}

export interface WardrobeState {
  items: WardrobeItem[]
  outfits: Outfit[]
  wearLog: WearEntry[]
}

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'tops', label: 'Tops' },
  { id: 'bottoms', label: 'Bottoms' },
  { id: 'dresses', label: 'Dresses' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'accessories', label: 'Accessories' },
]

export const SEASONS: { id: Season; label: string }[] = [
  { id: 'all', label: 'All season' },
  { id: 'spring', label: 'Spring' },
  { id: 'summer', label: 'Summer' },
  { id: 'fall', label: 'Fall' },
  { id: 'winter', label: 'Winter' },
]

export const COLOR_PRESETS: { name: string; hex: string }[] = [
  { name: 'Ivory', hex: '#F5F0E8' },
  { name: 'Sand', hex: '#D4C4A8' },
  { name: 'Clay', hex: '#B07A5A' },
  { name: 'Olive', hex: '#6B7F5A' },
  { name: 'Forest', hex: '#2F4A3A' },
  { name: 'Navy', hex: '#2C3A4F' },
  { name: 'Charcoal', hex: '#2A2A2A' },
  { name: 'Black', hex: '#121212' },
  { name: 'Blush', hex: '#E8C4C0' },
  { name: 'Sky', hex: '#A8C4D4' },
  { name: 'Burgundy', hex: '#6B2E3A' },
  { name: 'Camel', hex: '#C4A574' },
]
