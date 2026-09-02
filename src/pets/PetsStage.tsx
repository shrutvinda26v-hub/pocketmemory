import { useEffect, useRef, useState } from 'react'
import { InteractivePet } from './InteractivePet'
import { catPet, doxiePet, retrieverPet, type PetId } from './config'
import './pets.css'

const PETS = [doxiePet, retrieverPet, catPet] as const
const HIT_ORDER: PetId[] = ['retriever', 'cat', 'doxie']
const SELECTOR: Record<PetId, string> = {
  retriever: '.pet-retriever',
  cat: '.pet-cat',
  doxie: '.pet-doxie',
}
const HIT_INSET: Record<PetId, { top: number; bottom: number; side: number }> = {
  retriever: { top: 0.16, bottom: 0.24, side: 0.12 },
  cat: { top: 0.02, bottom: 0.16, side: 0.04 },
  doxie: { top: 0.02, bottom: 0.16, side: 0.04 },
}

export function PetsStage() {
  const pointer = useRef({ x: Number.NaN, y: Number.NaN })
  const hoveredRef = useRef<PetId | null>(null)
  const [hovered, setHovered] = useState<PetId | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const hitKind = (x: number, y: number): PetId | null => {
      for (const id of HIT_ORDER) {
        const el = document.querySelector(SELECTOR[id])
        if (!(el instanceof HTMLElement)) continue
        const box = el.getBoundingClientRect()
        const inset = HIT_INSET[id]
        if (
          x >= box.left + box.width * inset.side &&
          x <= box.right - box.width * inset.side &&
          y >= box.top + box.height * inset.top &&
          y <= box.bottom - box.height * inset.bottom
        ) {
          return id
        }
      }
      return null
    }

    const onMove = (event: MouseEvent) => {
      pointer.current.x = event.clientX
      pointer.current.y = event.clientY
      const next = hitKind(event.clientX, event.clientY)
      if (next !== hoveredRef.current) {
        hoveredRef.current = next
        setHovered(next)
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return (
    <>
      {PETS.map((pet) => (
        <InteractivePet
          key={pet.id}
          config={pet}
          pointer={pointer}
          reducedMotion={reducedMotion}
          isHovering={hovered === pet.id}
          lookOnly={hovered !== null && hovered !== pet.id}
        />
      ))}
    </>
  )
}
