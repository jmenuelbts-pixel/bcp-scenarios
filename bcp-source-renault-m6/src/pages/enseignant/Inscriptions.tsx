// Inscriptions.tsx
// Gestion des demandes d'inscription : liste des eleves en attente, avec
// boutons accepter et refuser. Style inline, Arial, aucun emoji.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COULEUR_PROF } from '../../data/schema'
import { listerDemandes, definirStatut, supprimerEleveComplet } from '../../lib/enseignant'
import type { Profil } from '../../lib/auth'

export function Inscriptions() {
  const navigate = useNavigate()
  const [demandes, setDemandes] = useState<Profil[]>([])
  const [chargement, setChargement] = useState(true)
  const [traitement, setTraitement] = useState<string | null>(null)

  async function charger() {
    setChargement(true)
    const liste = await listerDemandes()
    setDemandes(liste)
    setChargement(false)
  }

  useEffect(() => {
    charger()
  }, [])

  async function traiter(eleveId: string, statut: 'accepte' | 'refuse') {
    setTraitement(eleveId)
    const { erreur } = await definirStatut(eleveId, statut)
    if (!erreur) {
      setDemandes((d) => d.filter((e) => e.id !== eleveId))
    }
    setTraitement(null)
  }

  async function supprimer(eleveId: string) {
    setTraitement(eleveId)
    const { erreur } = await supprimerEleveComplet(eleveId)
    if (!erreur) {
      setDemandes((d) => d.filter((e) => e.id !== eleveId))
    }
    setTraitement(null)
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F4F7FA' }}>
      <header style={{ background: COULEUR_PROF, color: '#FFFFFF', padding: '16px 24px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => navigate('/enseignant')}
            style={{
              fontFamily: 'Arial, sans-serif',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#FFFFFF',
              borderRadius: 99,
              padding: '6px 14px',
              fontSize: 13,
              cursor: 'pointer',
              marginBottom: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="15,5 8,12 15,19" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Tableau de bord
          </button>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>Demandes d'inscription</h1>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: '0 auto', padding: 24 }}>
        {chargement ? (
          <p style={{ fontSize: 14, color: '#6B7280' }}>Chargement en cours...</p>
        ) : demandes.length === 0 ? (
          <p style={{ fontSize: 14, color: '#6B7280' }}>Aucune demande en attente.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {demandes.map((e) => (
              <div
                key={e.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1F2933' }}>
                    {e.prenom} {e.nom}
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>{e.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    disabled={traitement === e.id}
                    onClick={() => traiter(e.id, 'accepte')}
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      background: '#2E8B57',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: traitement === e.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Accepter
                  </button>
                  <button
                    type="button"
                    disabled={traitement === e.id}
                    onClick={() => traiter(e.id, 'refuse')}
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      background: '#FFFFFF',
                      color: '#9B2C2C',
                      border: '1px solid #E0A8A8',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: traitement === e.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Refuser
                  </button>
                  <button
                    type="button"
                    disabled={traitement === e.id}
                    onClick={() => supprimer(e.id)}
                    aria-label="Supprimer définitivement"
                    title="Supprimer définitivement"
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      background: '#B0413E',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: traitement === e.id ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
                      <polyline points="4,7 20,7" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                      <path d="M9 7 V5 a1 1 0 0 1 1 -1 h4 a1 1 0 0 1 1 1 v2" fill="none" stroke="#FFFFFF" strokeWidth="2" />
                      <path d="M6 7 l1 13 a1 1 0 0 0 1 1 h8 a1 1 0 0 0 1 -1 l1 -13" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
