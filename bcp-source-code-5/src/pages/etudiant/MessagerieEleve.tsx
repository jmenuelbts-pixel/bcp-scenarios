// MessagerieEleve.tsx
// Messagerie cote eleve : liste de contacts a gauche (le professeur, marque
// "enseignant" en italique, et les camarades de classe si la classe n'est pas
// verrouillee), conversation a droite avec le contact selectionne. Le blocage
// des echanges entre eleves est assure par les politiques RLS ; ici on ne fait
// que masquer les camarades quand la classe est verrouillee.

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import type { Profil } from '../../lib/auth'
import {
  conversation,
  envoyerMessage,
  marquerLus,
  sonderConversation,
  contactsEleve,
  verifierFichierPj,
  PJ_NOMBRE_MAX,
  type Message,
} from '../../lib/messagerie'
import { BulleMessage } from '../../lib/piecesJointes'

interface Contact {
  contact: Profil
  estEnseignant: boolean
}

export function MessagerieEleve() {
  const navigate = useNavigate()
  const { session, profil } = useAuth()
  const eleveId = session?.user?.id

  const [contacts, setContacts] = useState<Contact[]>([])
  const [selection, setSelection] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [texte, setTexte] = useState('')
  const [fichiers, setFichiers] = useState<File[]>([])
  const [chargement, setChargement] = useState(true)
  const finRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!profil) return
    let actif = true
    async function charger() {
      const liste = await contactsEleve(profil as Profil)
      if (!actif) return
      setContacts(liste)
      setSelection((prec) => {
        if (prec) {
          const existe = liste.find((c) => c.contact.id === prec.contact.id)
          return existe ?? liste.find((c) => c.estEnseignant) ?? liste[0] ?? null
        }
        return liste.find((c) => c.estEnseignant) ?? liste[0] ?? null
      })
      setChargement(false)
    }
    charger()
    const timer = setInterval(charger, 5000)
    return () => {
      actif = false
      clearInterval(timer)
    }
  }, [profil])

  useEffect(() => {
    if (!eleveId || !selection) {
      setMessages([])
      return
    }
    const id = eleveId
    const autreId = selection.contact.id
    const arret = sonderConversation(id, autreId, (conv) => {
      setMessages((prec) => {
        if (prec.length !== conv.length) {
          marquerLus(id, autreId)
          setTimeout(() => finRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        }
        return conv
      })
    })
    return arret
  }, [eleveId, selection])

  async function envoyer() {
    if (!eleveId || !selection) return
    const contenu = texte.trim()
    if (contenu.length === 0 && fichiers.length === 0) return
    const autreId = selection.contact.id
    // Pieces jointes autorisees uniquement vers l'enseignant.
    const pj = selection.estEnseignant ? fichiers : []
    setTexte('')
    setFichiers([])
    await envoyerMessage(eleveId, autreId, contenu, pj)
    const conv = await conversation(eleveId, autreId)
    setMessages(conv)
    setTimeout(() => finRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  function choisirFichiers(liste: FileList | null) {
    if (!liste) return
    const arr = Array.from(liste).slice(0, PJ_NOMBRE_MAX)
    for (const f of arr) {
      const err = verifierFichierPj(f)
      if (err) { alert(err); return }
    }
    setFichiers(arr)
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
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
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
          <p style={{ margin: '2px 0 0 0', fontSize: 13, color: '#33648C' }}>
            Écrivez à votre professeur ou à un camarade de votre classe.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '20px auto 0', padding: '0 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ width: 240, flexShrink: 0, background: '#FFFFFF', borderRadius: 14, border: '1px solid #DCE8F4', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          {chargement ? (
            <p style={{ fontSize: 13, color: '#9AA5B1', padding: 14 }}>Chargement...</p>
          ) : (
            contacts.map(({ contact, estEnseignant }) => {
              const actif = selection?.contact.id === contact.id
              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setSelection({ contact, estEnseignant })}
                  style={{
                    fontFamily: 'Arial, sans-serif',
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    borderBottom: '1px solid #F0F4F8',
                    background: actif ? '#EAF3FB' : '#FFFFFF',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <span style={{ fontSize: 14, color: '#1F2933', fontWeight: actif ? 700 : 500 }}>
                    {contact.nom} {contact.prenom}
                  </span>
                  {estEnseignant && (
                    <span style={{ fontSize: 12, color: '#2E7DB8', fontStyle: 'italic' }}>enseignant</span>
                  )}
                </button>
              )
            })
          )}
        </div>

        <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 14, border: '1px solid #DCE8F4', display: 'flex', flexDirection: 'column', minHeight: 420, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          {selection ? (
            <>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #EEF2F6', fontSize: 14, fontWeight: 600, color: '#1F2933' }}>
                {selection.contact.nom} {selection.contact.prenom}
                {selection.estEnseignant && (
                  <span style={{ fontSize: 12, color: '#2E7DB8', fontStyle: 'italic', fontWeight: 400, marginLeft: 6 }}>enseignant</span>
                )}
              </div>
              <div style={{ flex: 1, padding: 16, overflowY: 'auto', maxHeight: 440 }}>
                {messages.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9AA5B1' }}>Aucun message pour le moment.</p>
                ) : (
                  messages.map((m) => (
                    <BulleMessage key={m.id} message={m} deMoi={m.expediteur_id === eleveId} couleurMoi="#2E7DB8" />
                  ))
                )}
                <div ref={finRef} />
              </div>

              <div style={{ borderTop: '1px solid #EEF2F6', padding: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {selection.estEnseignant && (
                  <label style={{ fontFamily: 'Arial, sans-serif', background: '#FEF3C7', border: '1px solid #F0C24B', color: '#8A5A00', borderRadius: 8, padding: '8px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    + Fichier
                    <input type="file" multiple accept="image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => choisirFichiers(e.target.files)} style={{ display: 'none' }} />
                  </label>
                )}
                {fichiers.length > 0 && <span style={{ fontSize: 12, color: '#8A5A00' }}>{fichiers.length} fichier(s)</span>}
                <input
                  value={texte}
                  onChange={(e) => setTexte(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') envoyer() }}
                  placeholder="Écrivez votre message..."
                  style={{ fontFamily: 'Arial, sans-serif', flex: 1, minWidth: 140, border: '1px solid #C9D6E3', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#1F2933' }}
                />
                <button
                  type="button"
                  onClick={envoyer}
                  disabled={texte.trim().length === 0 && fichiers.length === 0}
                  style={{ fontFamily: 'Arial, sans-serif', background: texte.trim().length === 0 && fichiers.length === 0 ? '#C9CDD2' : '#2E7DB8', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Envoyer
                </button>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: '#9AA5B1', padding: 16 }}>Sélectionnez un contact.</p>
          )}
        </div>
      </main>
    </div>
  )
}
