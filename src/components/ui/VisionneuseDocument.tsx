// VisionneuseDocument.tsx
// Visionneuse plein ecran pour agrandir un document (image).
// Ergonomie : boutons +/- / reinitialiser / fermer, molette, pincement deux
// doigts, glisser pour deplacer, defilement vertical et horizontal.
// Reutilisable partout ou un document est affiche.

import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  src: string
  alt?: string
  onClose: () => void
}

const ZOOM_MIN = 1
const ZOOM_MAX = 6
const ZOOM_PAS = 0.5

export function VisionneuseDocument({ src, alt = 'Document', onClose }: Props) {
  const [zoom, setZoom] = useState(1.4) // demarre deja agrandi (lisible d'emblee)
  const zoneRef = useRef<HTMLDivElement | null>(null)

  // Glisser pour deplacer (souris) : on agit sur le defilement de la zone.
  const glisse = useRef<{ actif: boolean; x: number; y: number; gauche: number; haut: number }>({
    actif: false, x: 0, y: 0, gauche: 0, haut: 0,
  })
  // Pincement deux doigts (tactile).
  const pincement = useRef<{ distance: number; zoom: number } | null>(null)

  const borne = useCallback((v: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v)), [])

  // Fermeture par la touche Echap.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === '+' || e.key === '=') setZoom((z) => borne(z + ZOOM_PAS))
      else if (e.key === '-') setZoom((z) => borne(z - ZOOM_PAS))
    }
    window.addEventListener('keydown', onKey)
    // Empeche le defilement de la page derriere l'overlay.
    const ancien = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ancien
    }
  }, [onClose, borne])

  // Molette : zoom (empeche le defilement page).
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setZoom((z) => borne(z + (e.deltaY < 0 ? ZOOM_PAS : -ZOOM_PAS)))
  }

  // Glisser souris.
  const onMouseDown = (e: React.MouseEvent) => {
    const zone = zoneRef.current
    if (!zone) return
    glisse.current = { actif: true, x: e.clientX, y: e.clientY, gauche: zone.scrollLeft, haut: zone.scrollTop }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    const zone = zoneRef.current
    if (!zone || !glisse.current.actif) return
    zone.scrollLeft = glisse.current.gauche - (e.clientX - glisse.current.x)
    zone.scrollTop = glisse.current.haut - (e.clientY - glisse.current.y)
  }
  const finGlisse = () => { glisse.current.actif = false }

  // Pincement tactile.
  const distanceDoigts = (t: React.TouchList) => {
    const dx = t[0].clientX - t[1].clientX
    const dy = t[0].clientY - t[1].clientY
    return Math.hypot(dx, dy)
  }
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pincement.current = { distance: distanceDoigts(e.touches), zoom }
    }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pincement.current) {
      const ratio = distanceDoigts(e.touches) / pincement.current.distance
      setZoom(borne(pincement.current.zoom * ratio))
    }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) pincement.current = null
  }

  const btn: React.CSSProperties = {
    width: 44, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer',
    background: 'rgba(255,255,255,0.92)', color: '#16456E', fontSize: 22, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,32,0.88)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Barre d'outils */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px' }}
      >
        <div style={{ color: '#FFFFFF', fontFamily: 'Arial, sans-serif', fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alt}</div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button type="button" title="Réduire" aria-label="Réduire" style={btn} onClick={() => setZoom((z) => borne(z - ZOOM_PAS))}>&minus;</button>
          <div style={{ minWidth: 58, textAlign: 'center', color: '#FFFFFF', fontFamily: 'Arial, sans-serif', fontSize: 14, fontWeight: 700, alignSelf: 'center' }}>{Math.round(zoom * 100)}%</div>
          <button type="button" title="Agrandir" aria-label="Agrandir" style={btn} onClick={() => setZoom((z) => borne(z + ZOOM_PAS))}>+</button>
          <button type="button" title="Réinitialiser" aria-label="Réinitialiser" style={{ ...btn, fontSize: 18 }} onClick={() => setZoom(1.4)}>⟳</button>
          <button type="button" title="Fermer" aria-label="Fermer" style={{ ...btn, background: '#FFFFFF', color: '#9B2C2C' }} onClick={onClose}>✕</button>
        </div>
      </div>

      {/* Zone de lecture defilable */}
      <div
        ref={zoneRef}
        onClick={(e) => e.stopPropagation()}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={finGlisse}
        onMouseLeave={finGlisse}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          flex: 1, overflow: 'auto', padding: 16,
          cursor: zoom > 1 ? 'grab' : 'default',
          WebkitOverflowScrolling: 'touch',
          display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start',
        }}
      >
        <div style={{ margin: '0 auto' }}>
          <img
            src={src}
            alt={alt}
            draggable={false}
            style={{
              width: `${zoom * 100}%`, maxWidth: 'none', height: 'auto', display: 'block',
              borderRadius: 6, background: '#FFFFFF', boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              userSelect: 'none',
            }}
          />
        </div>
      </div>

      {/* Aide breve */}
      <div onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontFamily: 'Arial, sans-serif', fontSize: 12, padding: '6px 0 12px' }}>
        Molette ou pincement pour zoomer, glisser pour déplacer, Échap pour fermer.
      </div>
    </div>
  )
}
