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
const BOTTOM_CUT: Record<PetId, number> = {
  retriever: 0.22,
  cat: 0.16,
  doxie: 0.16,
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
        const cut = box.height * BOTTOM_CUT[id]
        if (
          x >= box.left - 10 &&
          x <= box.right + 10 &&
          y >= box.top - 8 &&
          y <= box.bottom - cut
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
