// MessagerieEleve.tsx
// Messagerie cote eleve : conversation avec le professeur. L'eleve lit les
// messages recus et peut repondre. Les messages du prof sont marques lus a
// l'ouverture.

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, ID_ENSEIGNANT } from '../../lib/auth'
import { conversation, envoyerMessage, marquerLus, type Message } from '../../lib/messagerie'

export function MessagerieEleve() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const eleveId = session?.user?.id

  const profId = ID_ENSEIGNANT
  const [messages, setMessages] = useState<Message[]>([])
  const [texte, setTexte] = useState('')
  const [chargement, setChargement] = useState(true)
  const finRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!eleveId) return
    const id = eleveId
    async function charger() {
      const conv = await conversation(id, profId)
      setMessages(conv)
      await marquerLus(id, profId)
      setTimeout(() => finRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      setChargement(false)
    }
    charger()
  }, [eleveId])

  async function envoyer() {
    if (!eleveId || texte.trim().length === 0) return
    const contenu = texte.trim()
    setTexte('')
    await envoyerMessage(eleveId, profId, contenu)
    const conv = await conversation(eleveId, profId)
    setMessages(conv)
    setTimeout(() => finRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #EAF3FB 0%, #D6E8F7 45%, #C2DCF2 100%)',
        padding: '0 0 48px 0',
      }}
    >
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              fontFamily: 'Arial, sans-serif',
              background: 'none',
              border: 'none',
              color: '#16456E',
              fontSize: 14,
              cursor: 'pointer',
              padding: 0,
              marginBottom: 8,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" stroke="#16456E" strokeWidth="2" strokeLinecap="round" />
              <polyline points="11,6 5,12 11,18" fill="none" stroke="#16456E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour
          </button>
          <h1 style={{ margin: 0, fontSize: 20, color: '#16456E' }}>Messagerie</h1>
          <p style={{ margin: '2px 0 0 0', fontSize: 13, color: '#33648C' }}>Conversation avec votre professeur</p>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: '20px auto 0', padding: '0 24px' }}>
        <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #DCE8F4', display: 'flex', flexDirection: 'column', minHeight: 420, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ flex: 1, padding: 16, overflowY: 'auto', maxHeight: 480 }}>
            {chargement ? (
              <p style={{ fontSize: 13, color: '#9AA5B1' }}>Chargement...</p>
            ) : messages.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9AA5B1' }}>Aucun message pour le moment.</p>
            ) : (
              messages.map((m) => {
                const deMoi = m.expediteur_id === eleveId
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: deMoi ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                    <span style={{
                      maxWidth: '75%',
                      fontSize: 13,
                      padding: '8px 12px',
                      borderRadius: 12,
                      background: deMoi ? '#2E7DB8' : '#EEF3F8',
                      color: deMoi ? '#FFFFFF' : '#1F2933',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {m.contenu}
                    </span>
                  </div>
                )
              })
            )}
            <div ref={finRef} />
          </div>

          <div style={{ borderTop: '1px solid #EEF2F6', padding: 12, display: 'flex', gap: 8 }}>
            <input
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') envoyer() }}
              placeholder="Écrivez votre message..."
              style={{ fontFamily: 'Arial, sans-serif', flex: 1, border: '1px solid #C9D6E3', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#1F2933' }}
            />
            <button
              type="button"
              onClick={envoyer}
              disabled={texte.trim().length === 0}
              style={{ fontFamily: 'Arial, sans-serif', background: texte.trim().length === 0 ? '#C9CDD2' : '#2E7DB8', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: texte.trim().length === 0 ? 'not-allowed' : 'pointer' }}
            >
              Envoyer
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
