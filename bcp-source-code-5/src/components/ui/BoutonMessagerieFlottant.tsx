// Bouton de messagerie flottant, present sur toutes les pages (prof et eleve),
// avec pastille des messages non lus.
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { nombreNonLus } from '../../lib/messagerie'

export function BoutonMessagerieFlottant() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, profil } = useAuth()
  const [nonLus, setNonLus] = useState(0)
  const estEnseignant = profil?.role === 'enseignant'
  const route = estEnseignant ? '/enseignant/messagerie' : '/messagerie'
  const surMessagerie = location.pathname.startsWith(route)

  useEffect(() => {
    if (!session?.user?.id) return
    const id = session.user.id
    let actif = true
    const raf = () => { nombreNonLus(id).then((n) => { if (actif) setNonLus(n) }) }
    raf()
    const t = setInterval(raf, 15000)
    return () => { actif = false; clearInterval(t) }
  }, [session, location.pathname])

  if (!session || !profil) return null
  if (profil.role === 'etudiant' && profil.statut !== 'accepte') return null
  if (surMessagerie) return null

  return (
    <button
      type="button"
      aria-label="Ouvrir la messagerie"
      onClick={() => navigate(route)}
      style={{ position: 'fixed', bottom: 20, right: 20, width: 56, height: 56, borderRadius: '50%', background: '#2563EB', border: 'none', boxShadow: '0 6px 18px rgba(37,99,235,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998 }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <polyline points="4,7 12,13 20,7" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {nonLus > 0 && (
        <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 22, height: 22, padding: '0 6px', boxSizing: 'border-box', borderRadius: 999, background: '#D93636', color: '#FFFFFF', fontSize: 12, fontWeight: 700, fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFFFFF' }}>
          {nonLus > 99 ? '99+' : nonLus}
        </span>
      )}
    </button>
  )
}
