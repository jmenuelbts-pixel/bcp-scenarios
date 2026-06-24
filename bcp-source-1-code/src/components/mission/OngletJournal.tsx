// OngletJournal.tsx
// Onglet Journal de bord : toujours accessible, jamais verrouille.
// Deux zones de saisie enregistrees dans Supabase (un journal par mission,
// le dernier remplace le precedent) et rechargees a l'ouverture.

import { useEffect, useState } from 'react'
import { enregistrerJournal, chargerJournal } from '../../lib/eleve'

interface Props {
  couleur: string
  etudiantId?: string
  missionId: string
}

export function OngletJournal({ couleur, etudiantId, missionId }: Props) {
  const [nonReussi, setNonReussi] = useState('')
  const [moinsBien, setMoinsBien] = useState('')
  const [enregistre, setEnregistre] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    if (!etudiantId) return
    chargerJournal(etudiantId, missionId).then((j) => {
      setNonReussi(j.nonReussi)
      setMoinsBien(j.moinsBienReussi)
    })
  }, [etudiantId, missionId])

  async function enregistrer() {
    if (!etudiantId) {
      setErreur('Vous devez etre connecte pour enregistrer votre journal.')
      return
    }
    setEnCours(true)
    setErreur(null)
    const { erreur } = await enregistrerJournal(etudiantId, missionId, nonReussi, moinsBien)
    if (erreur) {
      setErreur('L enregistrement a echoue. Veuillez reessayer.')
    } else {
      setEnregistre(true)
    }
    setEnCours(false)
  }

  const champ: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #C9D6E3',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    resize: 'vertical',
    color: '#1F2933',
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px 0' }}>
        Le journal de bord reste accessible à tout moment, même si la mission est verrouillée.
      </p>

      <label style={{ display: 'block', fontSize: 14, color: '#374151', marginBottom: 6 }}>
        Ce que je n'ai pas réussi dans les exercices, et pourquoi
      </label>
      <textarea
        value={nonReussi}
        rows={5}
        onChange={(e) => {
          setNonReussi(e.target.value)
          setEnregistre(false)
        }}
        style={champ}
      />

      <label style={{ display: 'block', fontSize: 14, color: '#374151', margin: '16px 0 6px 0' }}>
        Ce que j'ai le moins bien réussi, et pourquoi
      </label>
      <textarea
        value={moinsBien}
        rows={5}
        onChange={(e) => {
          setMoinsBien(e.target.value)
          setEnregistre(false)
        }}
        style={champ}
      />

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          type="button"
          disabled={enCours}
          onClick={enregistrer}
          style={{
            fontFamily: 'Arial, sans-serif',
            background: enCours ? '#C9CDD2' : couleur,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: enCours ? 'not-allowed' : 'pointer',
          }}
        >
          {enCours ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        {enregistre && (
          <span style={{ fontSize: 13, color: '#1B6B3A', fontWeight: 600 }}>Journal enregistré.</span>
        )}
        {erreur && <span style={{ fontSize: 13, color: '#9B2C2C', fontWeight: 600 }}>{erreur}</span>}
      </div>
    </div>
  )
}
