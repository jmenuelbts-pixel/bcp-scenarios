// piecesJointes.tsx
// Composants partages pour l'affichage des messages et de leurs pieces jointes
// (cote eleve et cote prof). Les PJ ont un fond ambre distinct pour se reperer
// d'un coup d'oeil dans une conversation.

import { useState } from 'react'
import { urlPieceJointe, type Message, type PieceJointe } from './messagerie'

function iconePj(type: string): string {
  if (type.startsWith('image/')) return 'Image'
  if (type === 'application/pdf') return 'PDF'
  return 'Word'
}

// Lien vers une piece jointe dans une bulle (fond ambre fixe).
function LienPj({ piece }: { piece: PieceJointe }) {
  const [enCours, setEnCours] = useState(false)
  async function ouvrir() {
    setEnCours(true)
    const url = await urlPieceJointe(piece.chemin)
    setEnCours(false)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }
  return (
    <button
      type="button"
      onClick={ouvrir}
      disabled={enCours}
      style={{
        fontFamily: 'Arial, sans-serif',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: '#FEF3C7',
        border: '1px solid #F0C24B',
        borderRadius: 8,
        padding: '5px 9px',
        marginTop: 5,
        fontSize: 12,
        color: '#8A5A00',
        fontWeight: 600,
        cursor: enCours ? 'wait' : 'pointer',
        maxWidth: '100%',
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 10, opacity: 0.9 }}>{iconePj(piece.type)}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{piece.nom}</span>
    </button>
  )
}

// Lien autonome (hors bulle), pour l'historique des annonces.
export function LienPieceJointe({ piece }: { piece: PieceJointe }) {
  const [enCours, setEnCours] = useState(false)
  async function ouvrir() {
    setEnCours(true)
    const url = await urlPieceJointe(piece.chemin)
    setEnCours(false)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }
  return (
    <button
      type="button"
      onClick={ouvrir}
      disabled={enCours}
      style={{
        fontFamily: 'Arial, sans-serif',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: '#FEF3C7',
        border: '1px solid #F0C24B',
        borderRadius: 8,
        padding: '5px 9px',
        marginTop: 6,
        marginRight: 6,
        fontSize: 12,
        color: '#8A5A00',
        fontWeight: 600,
        cursor: enCours ? 'wait' : 'pointer',
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 10, opacity: 0.9 }}>{iconePj(piece.type)}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{piece.nom}</span>
    </button>
  )
}

// Une bulle de message : texte + pieces jointes + actions prof + accuse "Lu".
export function BulleMessage({
  message,
  deMoi,
  couleurMoi,
  onModifier,
  onSupprimer,
  montrerLu,
}: {
  message: Message
  deMoi: boolean
  couleurMoi: string
  onModifier?: (m: Message) => void
  onSupprimer?: (m: Message) => void
  montrerLu?: boolean
}) {
  const pieces = message.pieces_jointes ?? []
  const couleurTexte = deMoi ? '#FFFFFF' : '#1F2933'
  const actions = deMoi && (onModifier || onSupprimer)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: deMoi ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
      <span
        style={{
          maxWidth: '75%',
          fontSize: 13,
          padding: '8px 12px',
          borderRadius: 12,
          background: deMoi ? couleurMoi : '#EEF3F8',
          color: couleurTexte,
          whiteSpace: 'pre-wrap',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {message.contenu ? <span>{message.contenu}</span> : null}
        {pieces.map((p, i) => (
          <LienPj key={i} piece={p} />
        ))}
        {message.modifie && (
          <span style={{ fontSize: 10, opacity: 0.75, marginTop: 3, fontStyle: 'italic', color: couleurTexte }}>modifié</span>
        )}
      </span>
      {actions && (
        <span style={{ display: 'flex', gap: 10, marginTop: 3 }}>
          {onModifier && (
            <button type="button" onClick={() => onModifier(message)} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 11, cursor: 'pointer', padding: 0, fontFamily: 'Arial, sans-serif' }}>Modifier</button>
          )}
          {onSupprimer && (
            <button type="button" onClick={() => onSupprimer(message)} style={{ background: 'none', border: 'none', color: '#B0413E', fontSize: 11, cursor: 'pointer', padding: 0, fontFamily: 'Arial, sans-serif' }}>Supprimer</button>
          )}
        </span>
      )}
      {deMoi && montrerLu && (
        <span style={{ fontSize: 10, color: '#6B7280', marginTop: 2, fontFamily: 'Arial, sans-serif' }}>
          {message.lu ? 'Lu' : 'Envoyé'}
        </span>
      )}
    </div>
  )
}
