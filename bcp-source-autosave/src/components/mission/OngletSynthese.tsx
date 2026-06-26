// OngletSynthese.tsx
// Onglet Synthèse : carte arborescente a completer puis envoyer au professeur.
// Une fois envoyee, la saisie est verrouillee (plus aucune modification).

import { useState, useEffect } from 'react'
import type { ContenuSynthese, NoeudSynthese } from '../../data/contenus'
import { enregistrerQuiz, chargerQuiz } from '../../lib/eleve'
import { sauverBrouillon, lireBrouillon, effacerBrouillon } from '../../lib/brouillon'
import { eclaircir } from '../../data/schema'

interface Props {
  contenu: ContenuSynthese
  couleur: string
  etudiantId?: string
  missionId: string
}

export function OngletSynthese({ contenu, couleur, etudiantId, missionId }: Props) {
  const [reponses, setReponses] = useState<Record<string, string>>({})
  const [verrouille, setVerrouille] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    let actif = true
    if (!etudiantId) return
    chargerQuiz(etudiantId, missionId, 'synthese').then((s) => {
      if (!actif) return
      if (s) {
        if (s.reponses && typeof s.reponses === 'object') {
          setReponses(s.reponses as Record<string, string>)
        }
        setVerrouille(true)
        return
      }
      lireBrouillon<Record<string, string>>(etudiantId, missionId, 'synthese').then((b) => {
        if (!actif || !b || typeof b !== 'object') return
        setReponses(b)
      })
    })
    return () => {
      actif = false
    }
  }, [etudiantId, missionId])

  // Liste les cases a completer (noeuds sans texte) pour verifier la completude.
  const cases: string[] = []
  const collecter = (n: NoeudSynthese) => {
    if (n.texte === null) cases.push(n.id)
    n.enfants?.forEach(collecter)
  }
  collecter(contenu.racine)
  const toutRempli = cases.every((id) => (reponses[id] ?? '').trim().length > 0)

  async function envoyer() {
    if (verrouille || !toutRempli) return
    if (!etudiantId) {
      setErreur('Vous devez etre connecte pour envoyer.')
      return
    }
    setEnCours(true)
    setErreur(null)
    const { erreur } = await enregistrerQuiz(etudiantId, missionId, 'synthese', reponses, 0)
    if (erreur) setErreur('L envoi a echoue. Veuillez reessayer.')
    else {
      setVerrouille(true)
      void effacerBrouillon(etudiantId, missionId, 'synthese')
    }
    setEnCours(false)
  }

  // Case a completer (feuille) : menu deroulant.
  function rendreCase(noeud: NoeudSynthese): React.ReactNode {
    return (
      <select
        value={reponses[noeud.id] ?? ''}
        disabled={verrouille}
        onChange={(e) => {
          if (verrouille) return
          setReponses((r) => {
            const maj = { ...r, [noeud.id]: e.target.value }
            sauverBrouillon(etudiantId, missionId, 'synthese', maj)
            return maj
          })
        }}
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: 13,
          padding: '6px 10px',
          borderRadius: 8,
          border: `1px dashed ${couleur}`,
          background: verrouille ? '#F1F3F5' : '#FFFFFF',
          color: verrouille ? '#6B7280' : '#1F2933',
          minWidth: 150,
        }}
      >
        <option value="">À compléter</option>
        {contenu.proposition.map((mot) => (
          <option key={mot} value={mot}>
            {mot}
          </option>
        ))}
      </select>
    )
  }

  // Etiquette d'un noeud de branche (intitule fixe, ex : Identite).
  function rendreEtiquette(noeud: NoeudSynthese): React.ReactNode {
    return (
      <span
        style={{
          display: 'inline-block',
          background: '#EEF3F8',
          color: '#1F2933',
          fontWeight: 600,
          fontSize: 14,
          borderRadius: 8,
          padding: '6px 14px',
          border: '1px solid #DCE8F4',
        }}
      >
        {noeud.texte}
      </span>
    )
  }

  // Une branche : etiquette en haut, trait vertical, feuilles dessous reliees.
  function rendreBranche(noeud: NoeudSynthese): React.ReactNode {
    const enfants = noeud.enfants ?? []
    return (
      <div
        key={noeud.id}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {rendreEtiquette(noeud)}
        {enfants.length > 0 && (
          <>
            {/* trait vertical sous l'etiquette */}
            <div style={{ width: 2, height: 14, background: '#C9D6E3' }} />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                paddingLeft: 16,
                borderLeft: `2px solid ${eclaircir(couleur, 0.5)}`,
              }}
            >
              {enfants.map((enf) => (
                <div key={enf.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* petit trait horizontal vers la feuille */}
                  <div style={{ width: 14, height: 2, background: eclaircir(couleur, 0.5) }} />
                  {enf.texte === null ? rendreCase(enf) : rendreEtiquette(enf)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <h3 style={{ margin: '0 0 6px 0', fontSize: 15, color: '#16456E' }}>{contenu.titre}</h3>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px 0' }}>
        Completez les cases a partir des mots proposes, puis envoyez au professeur.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 18,
          padding: 12,
          background: '#F4F8FC',
          borderRadius: 10,
          border: '1px solid #DCE8F4',
        }}
      >
        {contenu.proposition.map((mot) => (
          <span
            key={mot}
            style={{
              fontSize: 12,
              background: '#FFFFFF',
              border: '1px solid #C9D6E3',
              borderRadius: 99,
              padding: '4px 10px',
              color: '#374151',
            }}
          >
            {mot}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* racine */}
        <span
          style={{
            display: 'inline-block',
            background: couleur,
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 8,
            padding: '8px 16px',
            textAlign: 'center',
          }}
        >
          {contenu.racine.texte}
        </span>
        {/* trait vertical sous la racine */}
        <div style={{ width: 2, height: 18, background: '#C9D6E3' }} />
        {/* branches alignees horizontalement, repli vertical si etroit */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: 28,
          }}
        >
          {(contenu.racine.enfants ?? []).map((branche) => rendreBranche(branche))}
        </div>
      </div>

      {verrouille ? (
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 8, background: '#EAF2EC', border: '1px solid #BFE0CC', borderRadius: 8, padding: '10px 14px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="#1B6B3A" strokeWidth="2" />
            <path d="M8 11 V8 a4 4 0 0 1 8 0 v3" fill="none" stroke="#1B6B3A" strokeWidth="2" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1B6B3A' }}>
            Synthèse envoyée. Elle n'est plus modifiable.
          </span>
        </div>
      ) : (
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            disabled={!toutRempli || enCours}
            onClick={envoyer}
            style={{
              fontFamily: 'Arial, sans-serif',
              background: !toutRempli || enCours ? '#C9CDD2' : couleur,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: !toutRempli || enCours ? 'not-allowed' : 'pointer',
            }}
          >
            {enCours ? 'Envoi...' : 'Envoyer au professeur'}
          </button>
          {!toutRempli && (
            <span style={{ fontSize: 12, color: '#6B7280' }}>Complétez toutes les cases avant d'envoyer.</span>
          )}
          {erreur && <span style={{ fontSize: 13, color: '#9B2C2C', fontWeight: 600 }}>{erreur}</span>}
        </div>
      )}
    </div>
  )
}
