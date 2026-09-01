import { useEffect, useRef, useState } from 'react'
import { InteractivePet } from './InteractivePet'
import { catPet, doxiePet, retrieverPet } from './config'
import './pets.css'

export function PetsStage() {
  const pointer = useRef({ x: 0, y: 0 })
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      pointer.current.x = event.clientX
      pointer.current.y = event.clientY
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
      <InteractivePet config={doxiePet} pointer={pointer} reducedMotion={reducedMotion} />
      <InteractivePet config={retrieverPet} pointer={pointer} reducedMotion={reducedMotion} />
      <InteractivePet config={catPet} pointer={pointer} reducedMotion={reducedMotion} />
    </>
  )
}
