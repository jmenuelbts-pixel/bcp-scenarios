// Infobulle.tsx
// Infobulle au survol : fond miel, texte brun, position fixed calculee
// dynamiquement pour eviter le debordement hors de l'ecran.

import { useRef, useState, type ReactNode } from 'react'

interface Props {
  texte: string
  children: ReactNode
}

export function Infobulle({ texte, children }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  function afficher() {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    // Largeur estimee de l'infobulle pour eviter le debordement a droite.
    const largeur = 240
    let left = r.left + r.width / 2 - largeur / 2
    left = Math.max(8, Math.min(left, window.innerWidth - largeur - 8))
    const top = r.bottom + 8
    setPos({ top, left })
  }

  return (
    <span
      ref={ref}
      onMouseEnter={afficher}
      onMouseLeave={() => setPos(null)}
      style={{ display: 'inline-flex', position: 'relative' }}
    >
      {children}
      {pos && (
        <span
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: 240,
            background: '#FEF3C7',
            color: '#7A5410',
            fontFamily: 'Arial, sans-serif',
            fontSize: 12,
            lineHeight: 1.5,
            borderRadius: 8,
            padding: '8px 10px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
            zIndex: 200,
            pointerEvents: 'none',
          }}
        >
          {texte}
        </span>
      )}
    </span>
  )
}
