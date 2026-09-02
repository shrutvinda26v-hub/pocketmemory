import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { products, type Product } from './data/products'

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  image: string
}

type CartContextValue = {
  items: CartItem[]
  count: number
  total: number
  add: (product: Product) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  saved: Product[]
  savedCount: number
  isSaved: (id: string) => boolean
  toggleSaved: (product: Product) => void
}

const CartContext = createContext<CartContextValue | null>(null)

const starter = products.find((product) => product.id === 'fox')!

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: starter.id,
      name: starter.name,
      price: starter.price,
      qty: 1,
      image: starter.image,
    },
  ])
  const [saved, setSaved] = useState<Product[]>(products)

  const add = useCallback((product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        )
      }
      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          image: product.image,
        },
      ]
    })
  }, [])

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const setQty = useCallback((id: string, qty: number) => {
    if (qty < 1) {
      setItems((current) => current.filter((item) => item.id !== id))
      return
    }
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, qty } : item)),
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const toggleSaved = useCallback((product: Product) => {
    setSaved((current) => {
      if (current.some((item) => item.id === product.id)) {
        return current.filter((item) => item.id !== product.id)
      }
      return [...current, product]
    })
  }, [])

  const isSaved = useCallback(
    (id: string) => saved.some((item) => item.id === id),
    [saved],
  )

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.qty, 0)
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)
    return {
      items,
      count,
      total,
      add,
      remove,
      setQty,
      clear,
      saved,
      savedCount: saved.length,
      isSaved,
      toggleSaved,
    }
  }, [items, add, remove, setQty, clear, saved, isSaved, toggleSaved])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
