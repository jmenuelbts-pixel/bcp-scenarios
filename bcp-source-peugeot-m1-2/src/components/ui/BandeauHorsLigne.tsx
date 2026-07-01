// BandeauHorsLigne.tsx
// Detecte automatiquement la perte de connexion et affiche un bandeau en haut
// de la page. Se masque des le retour en ligne.

import { useEffect, useState } from 'react'

export function BandeauHorsLigne() {
  const [horsLigne, setHorsLigne] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  )

  useEffect(() => {
    const enLigne = () => setHorsLigne(false)
    const horsLigneHandler = () => setHorsLigne(true)
    window.addEventListener('online', enLigne)
    window.addEventListener('offline', horsLigneHandler)
    return () => {
      window.removeEventListener('online', enLigne)
      window.removeEventListener('offline', horsLigneHandler)
    }
  }, [])

  if (!horsLigne) return null

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: '#7A1F1F',
        color: '#FFFFFF',
        fontSize: 13,
        textAlign: 'center',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 C7 3 3 6 1 9 l2 2 C5 8 8 6 12 6 s7 2 9 5 l2 -2 C21 6 17 3 12 3 z" fill="#FFFFFF" opacity="0.5" />
        <circle cx="12" cy="17" r="2" fill="#FFFFFF" />
        <line x1="3" y1="3" x2="21" y2="21" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
      Connexion perdue. Certaines fonctions ne sont pas disponibles hors ligne.
    </div>
  )
}
