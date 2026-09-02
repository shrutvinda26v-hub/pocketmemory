import { useEffect, useRef, useState } from 'react'
import { InteractivePet } from './InteractivePet'
import { catPet, doxiePet, retrieverPet, type PetId } from './config'
import { dropPawPrint, rainPaws, tossToy } from './motion'
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
  const greetedRef = useRef(new Set<PetId>())
  const partiedRef = useRef(false)
  const lastPrint = useRef(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const noteRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<PetId | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [boopNonce, setBoopNonce] = useState(0)
  const [partyNonce, setPartyNonce] = useState(0)

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
      if (next && stageRef.current && event.timeStamp - lastPrint.current > 90) {
        lastPrint.current = event.timeStamp
        const box = stageRef.current.getBoundingClientRect()
        dropPawPrint(stageRef.current, event.clientX - box.left - 7, event.clientY - box.top - 7)
      }
    }

    const onDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return
      if (event.target.closest('a, button, input, textarea')) return
      if (!hoveredRef.current) return
      setBoopNonce((value) => value + 1)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [])

  useEffect(() => {
    if (!hovered || reducedMotion) return
    greetedRef.current.add(hovered)
    const stage = stageRef.current
    if (stage) tossToy(stage, hovered)
    if (!partiedRef.current && greetedRef.current.size === 3 && stage) {
      partiedRef.current = true
      setPartyNonce((value) => value + 1)
      rainPaws(stage)
      const note = noteRef.current
      if (note) {
        note.textContent = 'good pets.'
        note.classList.add('is-on')
        window.setTimeout(() => note.classList.remove('is-on'), 1800)
      }
    }
  }, [hovered, reducedMotion])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return (
    <div className="pets-stage" ref={stageRef} aria-hidden="true">
      {PETS.map((pet) => (
        <InteractivePet
          key={pet.id}
          config={pet}
          pointer={pointer}
          reducedMotion={reducedMotion}
          isHovering={hovered === pet.id}
          lookOnly={hovered !== null && hovered !== pet.id}
          boopNonce={hovered === pet.id ? boopNonce : 0}
          partyNonce={partyNonce}
        />
      ))}
      <div className="pet-party-note" ref={noteRef} />
    </div>
  )
}
