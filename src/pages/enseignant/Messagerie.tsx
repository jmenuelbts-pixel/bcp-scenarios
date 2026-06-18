// Messagerie.tsx (professeur)
// Liste des eleves a gauche avec badge de messages non lus, conversation a
// droite. Possibilite d'envoyer un message individuel ou collectif (classe).

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COULEUR_PROF } from '../../data/schema'
import { useAuth } from '../../lib/auth'
import { listerElevesAcceptes } from '../../lib/enseignant'
import {
  conversation,
  envoyerMessage,
  envoyerMessageCollectif,
  messagesRecus,
  marquerLus,
  supprimerConversation,
  type Message,
} from '../../lib/messagerie'
import type { Profil } from '../../lib/auth'

export function Messagerie() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const profId = session?.user?.id

  const [eleves, setEleves] = useState<Profil[]>([])
  const [nonLus, setNonLus] = useState<Record<string, number>>({})
  const [selection, setSelection] = useState<string | null>(null)
  const [collectif, setCollectif] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [texte, setTexte] = useState('')
  const [chargement, setChargement] = useState(true)
  const finRef = useRef<HTMLDivElement>(null)

  // Charge les eleves et le compte de messages non lus par eleve (messages
  // que l'eleve a envoyes au professeur et que le professeur n'a pas lus).
  async function chargerListe() {
    if (!profId) return
    const liste = await listerElevesAcceptes()
    setEleves(liste)
    const recus = await messagesRecus(profId)
    const compte: Record<string, number> = {}
    for (const m of recus) {
      if (!m.lu && m.expediteur_id) {
        compte[m.expediteur_id] = (compte[m.expediteur_id] ?? 0) + 1
      }
    }
    setNonLus(compte)
    setChargement(false)
  }

  useEffect(() => {
    chargerListe()
  }, [profId])

  // Charge la conversation avec l'eleve selectionne et marque ses messages lus.
  async function ouvrirConversation(eleveId: string) {
    if (!profId) return
    setSelection(eleveId)
    setCollectif(false)
    const conv = await conversation(profId, eleveId)
    setMessages(conv)
    await marquerLus(profId, eleveId)
    setNonLus((n) => ({ ...n, [eleveId]: 0 }))
    setTimeout(() => finRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  async function envoyer() {
    if (!profId || texte.trim().length === 0) return
    const contenu = texte.trim()
    setTexte('')
    if (collectif) {
      await envoyerMessageCollectif(profId, contenu)
    } else if (selection) {
      await envoyerMessage(profId, selection, contenu)
      const conv = await conversation(profId, selection)
      setMessages(conv)
      setTimeout(() => finRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  // Efface tous les messages echanges avec l'eleve selectionne, apres
  // confirmation.
  async function effacerConversation() {
    if (!profId || !selection) return
    const ok = window.confirm('Effacer toute la conversation avec cet élève ? Cette action est définitive.')
    if (!ok) return
    await supprimerConversation(profId, selection)
    setMessages([])
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F4F7FA' }}>
      <header style={{ background: COULEUR_PROF, color: '#FFFFFF', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <button type="button" onClick={() => navigate('/enseignant')} style={btnRetour}>
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="15,5 8,12 15,19" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Tableau de bord
          </button>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>Messagerie</h1>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        {/* Colonne gauche : liste des eleves */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 12, height: 'fit-content' }}>
          <button
            type="button"
            onClick={() => {
              setCollectif(true)
              setSelection(null)
              setMessages([])
            }}
            style={{
              fontFamily: 'Arial, sans-serif',
              width: '100%',
              textAlign: 'left',
              background: collectif ? COULEUR_PROF : '#EEF3F8',
              color: collectif ? '#FFFFFF' : '#1F2933',
              border: 'none',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="7" cy="9" r="2.4" fill="none" stroke={collectif ? '#FFFFFF' : '#1F2933'} strokeWidth="1.8" />
              <circle cx="15" cy="9" r="2.4" fill="none" stroke={collectif ? '#FFFFFF' : '#1F2933'} strokeWidth="1.8" />
              <path d="M3 18 a4 4 0 0 1 8 0 M11 18 a4 4 0 0 1 8 0" fill="none" stroke={collectif ? '#FFFFFF' : '#1F2933'} strokeWidth="1.8" />
            </svg>
            Message à toute la classe
          </button>

          {chargement ? (
            <p style={{ fontSize: 13, color: '#6B7280', padding: 8 }}>Chargement...</p>
          ) : eleves.length === 0 ? (
            <p style={{ fontSize: 13, color: '#6B7280', padding: 8 }}>Aucun élève.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {eleves.map((e) => {
                const actif = selection === e.id
                const compte = nonLus[e.id] ?? 0
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => ouvrirConversation(e.id)}
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      textAlign: 'left',
                      background: actif ? '#EEF3F8' : 'transparent',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, color: '#1F2933', fontWeight: actif ? 700 : 500 }}>
                      {e.nom} {e.prenom}
                    </span>
                    {compte > 0 && (
                      <span style={{ background: '#E24B4A', color: '#FFFFFF', fontSize: 11, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 99, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                        {compte}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Colonne droite : conversation ou composition collective */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, display: 'flex', flexDirection: 'column', minHeight: 420 }}>
          {!selection && !collectif ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9AA5B1', fontSize: 14 }}>
              Sélectionnez un élève ou écrivez à toute la classe.
            </div>
          ) : collectif ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24 }}>
              <p style={{ fontSize: 14, color: '#374151', marginTop: 0 }}>
                Ce message sera envoyé à tous les élèves de la classe.
              </p>
            </div>
          ) : (
            <>
              <div style={{ borderBottom: '1px solid #EEF2F6', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1F2933' }}>
                  {(() => {
                    const e = eleves.find((x) => x.id === selection)
                    return e ? `${e.nom} ${e.prenom}` : 'Conversation'
                  })()}
                </span>
                <button
                  type="button"
                  onClick={effacerConversation}
                  style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', color: '#B0413E', border: '1px solid #E2B3B1', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <polyline points="4,7 20,7" fill="none" stroke="#B0413E" strokeWidth="2" strokeLinecap="round" />
                    <path d="M9 7 V5 a1 1 0 0 1 1 -1 h4 a1 1 0 0 1 1 1 v2" fill="none" stroke="#B0413E" strokeWidth="2" />
                    <path d="M6 7 l1 13 a1 1 0 0 0 1 1 h8 a1 1 0 0 0 1 -1 l1 -13" fill="none" stroke="#B0413E" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                  Supprimer la conversation
                </button>
              </div>
              <div style={{ flex: 1, padding: 16, overflowY: 'auto', maxHeight: 460 }}>
                {messages.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9AA5B1' }}>Aucun message pour le moment.</p>
                ) : (
                  messages.map((m) => {
                    const deMoi = m.expediteur_id === profId
                    return (
                      <div key={m.id} style={{ display: 'flex', justifyContent: deMoi ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                        <span style={{
                          maxWidth: '75%',
                          fontSize: 13,
                          padding: '8px 12px',
                          borderRadius: 12,
                          background: deMoi ? COULEUR_PROF : '#EEF3F8',
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
            </>
          )}

          {/* Zone de saisie */}
          {(selection || collectif) && (
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
                style={{ fontFamily: 'Arial, sans-serif', background: texte.trim().length === 0 ? '#C9CDD2' : COULEUR_PROF, color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: texte.trim().length === 0 ? 'not-allowed' : 'pointer' }}
              >
                Envoyer
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

const btnRetour: React.CSSProperties = {
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
}
