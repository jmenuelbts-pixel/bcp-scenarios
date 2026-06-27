// session.ts
// Surveillance de l'inactivite : deconnexion automatique apres 30 minutes
// sans interaction. Les evenements souris, clavier, clic, tactile et
// defilement reinitialisent le minuteur.

import { useEffect, useRef } from 'react'

// Duree d'inactivite avant deconnexion (30 minutes).
export const DUREE_INACTIVITE_MS = 30 * 60 * 1000

const EVENEMENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'click',
  'touchstart',
  'scroll',
]

// Hook : declenche onTimeout apres DUREE_INACTIVITE_MS d'inactivite.
// actif permet de suspendre la surveillance (par exemple si non connecte).
export function useInactivite(onTimeout: () => void, actif: boolean = true) {
  const callbackRef = useRef(onTimeout)
  callbackRef.current = onTimeout

  useEffect(() => {
    if (!actif) return

    let minuteur: number | undefined

    const reinitialiser = () => {
      if (minuteur !== undefined) window.clearTimeout(minuteur)
      minuteur = window.setTimeout(() => {
        callbackRef.current()
      }, DUREE_INACTIVITE_MS)
    }

    EVENEMENTS.forEach((e) => window.addEventListener(e, reinitialiser, { passive: true }))
    reinitialiser()

    return () => {
      if (minuteur !== undefined) window.clearTimeout(minuteur)
      EVENEMENTS.forEach((e) => window.removeEventListener(e, reinitialiser))
    }
  }, [actif])
}
