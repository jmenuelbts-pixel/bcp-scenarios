// OngletTravaux.tsx
// Onglet Travaux a rendre : fiche eleve complete (contexte, objectifs,
// competence, activites avec questions et annexes a completer). Les saisies
// sont serialisees en JSON dans le champ travail unique de la mission, puis
// verrouillees apres envoi.

import { useEffect, useState } from 'react'
import type {
  ContenuTravaux,
  Annexe,
  AnnexeTableau,
  AnnexeHoraires,
  AnnexeOrganigramme,
} from '../../data/contenus'
import { enregistrerTravail, chargerTravail, chargerRetourTravail, type RetourTravail } from '../../lib/eleve'

interface Props {
  contenu: ContenuTravaux
  couleur: string
  etudiantId?: string
  missionId: string
}

type Saisies = Record<string, string>

export function OngletTravaux({ contenu, couleur, etudiantId, missionId }: Props) {
  const [saisies, setSaisies] = useState<Saisies>({})
  const [verrouille, setVerrouille] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [retour, setRetour] = useState<RetourTravail | null>(null)
  const [docsOuverts, setDocsOuverts] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (!etudiantId) return
    chargerTravail(etudiantId, missionId).then((c) => {
      if (c && c.trim().length > 0) {
        try {
          const obj = JSON.parse(c)
          if (obj && typeof obj === 'object') setSaisies(obj as Saisies)
        } catch {
          // ancien format texte libre : on le place dans une cle de compatibilite
          setSaisies({ _texte: c })
        }
        setVerrouille(true)
      }
    })
    chargerRetourTravail(etudiantId, missionId).then(setRetour)
  }, [etudiantId, missionId])

  function set(id: string, val: string) {
    if (verrouille) return
    setSaisies((s) => ({ ...s, [id]: val }))
  }

  // Liste des champs requis (annexes) pour valider la completude.
  const champs: string[] = []
  contenu.annexes?.forEach((a) => {
    if (a.type === 'tableau') a.lignes.forEach((l) => champs.push(`${a.id}.${l.id}`))
    if (a.type === 'horaires') a.jours.forEach((j) => champs.push(`${a.id}.${j}`))
    if (a.type === 'organigramme') a.cases.forEach((c) => { champs.push(`${a.id}.${c.id}.nom`); champs.push(`${a.id}.${c.id}.fonction`) })
  })
  const toutRempli =
    champs.length === 0
      ? (saisies._texte ?? '').trim().length > 0
      : champs.every((c) => (saisies[c] ?? '').trim().length > 0)

  async function envoyer() {
    if (verrouille || !toutRempli) return
    if (!etudiantId) {
      setErreur('Vous devez etre connecte pour envoyer votre travail.')
      return
    }
    setEnCours(true)
    setErreur(null)
    const { erreur } = await enregistrerTravail(etudiantId, missionId, JSON.stringify(saisies))
    if (erreur) setErreur('L envoi a echoue. Veuillez reessayer.')
    else setVerrouille(true)
    setEnCours(false)
  }

  const champStyle: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    fontSize: 13,
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid #C9D6E3',
    background: verrouille ? '#F1F3F5' : '#FFFFFF',
    color: verrouille ? '#6B7280' : '#1F2933',
    width: '100%',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#1F2933' }}>
      {/* Contexte professionnel */}
      {contenu.contexte && (
        <Bloc titre="Contexte professionnel" couleur={couleur}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#374151' }}>{contenu.contexte}</p>
        </Bloc>
      )}

      {/* Bibliotheque de documents a lire (depliables) */}
      {contenu.documents && contenu.documents.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #DCE8F4', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: 14, fontWeight: 700, color: couleur }}>Documents de la mission</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {contenu.documents.map((d) => {
              const ouvert = docsOuverts[d.numero] ?? false
              return (
                <div key={d.numero} style={{ border: '1px solid #E6ECF2', borderRadius: 8, overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setDocsOuverts((o) => ({ ...o, [d.numero]: !ouvert }))}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left',
                      fontFamily: 'Arial, sans-serif', fontSize: 14, fontWeight: 600, color: '#16456E',
                      background: ouvert ? '#EEF3F8' : '#F8FAFC', border: 'none', cursor: 'pointer', padding: '10px 12px',
                    }}
                  >
                    <span style={{ display: 'inline-block', transform: ouvert ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', color: couleur }}>▶</span>
                    Document {d.numero} — {d.titre}
                  </button>
                  {ouvert && (
                    <div style={{ padding: '10px 12px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {d.images.map((src, i) => (
                        <img key={i} src={src} alt={`Document ${d.numero}`} style={{ width: '100%', height: 'auto', border: '1px solid #E6ECF2', borderRadius: 6 }} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Objectifs */}
      {contenu.objectifs && contenu.objectifs.length > 0 && (
        <Bloc titre="Objectifs de la mission" couleur={couleur}>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7, color: '#374151' }}>
            {contenu.objectifs.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </Bloc>
      )}

      {/* Competence travaillee */}
      {contenu.competence && (
        <Bloc titre="Compétence travaillée" couleur={couleur}>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: '#374151' }}>
            <div style={{ fontWeight: 700 }}>{contenu.competence.groupe}</div>
            <div style={{ fontWeight: 600, margin: '2px 0' }}>{contenu.competence.intitule}</div>
            <div>{contenu.competence.detail}</div>
          </div>
        </Bloc>
      )}

      {/* Activites et questions */}
      {contenu.activites?.map((act, ai) => (
        <div key={ai} style={{ marginBottom: 18 }}>
          <h3
            style={{
              margin: '0 0 10px 0',
              fontSize: 15,
              color: '#FFFFFF',
              background: couleur,
              borderRadius: 8,
              padding: '8px 14px',
            }}
          >
            {act.titre}
          </h3>
          {act.questions.map((q) => {
            const annexe = contenu.annexes?.find((a) => a.id === q.annexeId)
            return (
              <div key={q.numero} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: couleur }}>{q.numero}.</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{q.consigne}</span>
                </div>
                {q.ressources && (
                  <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8, marginLeft: 18 }}>
                    {q.ressources}
                  </div>
                )}
                {annexe && (
                  <div style={{ marginLeft: 18 }}>
                    {rendreAnnexe(annexe, saisies, set, champStyle, verrouille, couleur)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}

      {/* Repli si aucune activite structuree : zone de texte simple */}
      {(!contenu.activites || contenu.activites.length === 0) && (
        <>
          <Bloc titre="Consigne" couleur={couleur}>
            <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{contenu.consigne}</p>
          </Bloc>
          <label style={{ display: 'block', fontSize: 14, color: '#374151', marginBottom: 6 }}>Votre travail</label>
          <textarea
            value={saisies._texte ?? ''}
            disabled={verrouille}
            onChange={(e) => set('_texte', e.target.value)}
            rows={10}
            placeholder="Rédigez votre réponse ici."
            style={{ ...champStyle, resize: 'vertical', fontSize: 14, padding: 12 }}
          />
        </>
      )}

      {verrouille ? (
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, background: '#EAF2EC', border: '1px solid #BFE0CC', borderRadius: 8, padding: '10px 14px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="#1B6B3A" strokeWidth="2" />
            <path d="M8 11 V8 a4 4 0 0 1 8 0 v3" fill="none" stroke="#1B6B3A" strokeWidth="2" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1B6B3A' }}>
            Travail envoyé au professeur. Il n'est plus modifiable.
          </span>
        </div>
      ) : (
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
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

      {retour && (retour.commentaire || (retour.competences && retour.competences.length > 0)) && (
        <div style={{ marginTop: 20, background: '#EEF6F0', border: '1px solid #BFE0CB', borderRadius: 10, padding: '16px 18px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 15, color: '#1B6B3A' }}>Retour du professeur</h3>
          {retour.commentaire && (
            <p style={{ margin: '0 0 10px 0', fontSize: 14, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {retour.commentaire}
            </p>
          )}
          {retour.competences && retour.competences.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {retour.competences.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, background: '#FFFFFF', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
                  <span style={{ color: '#1F2933' }}>{c.intitule}</span>
                  <span style={{ fontWeight: 700, color: '#1B6B3A' }}>{libelleNiveau(c.niveau)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Bloc({ titre, couleur, children }: { titre: string; couleur: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#F4F8FC', border: '1px solid #DCE8F4', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 700, color: couleur }}>{titre}</h3>
      {children}
    </div>
  )
}

function rendreAnnexe(
  annexe: Annexe,
  saisies: Saisies,
  set: (id: string, v: string) => void,
  champStyle: React.CSSProperties,
  verrouille: boolean,
  couleur: string,
): React.ReactNode {
  if (annexe.type === 'tableau') return rendreTableau(annexe, saisies, set, champStyle)
  if (annexe.type === 'horaires') return rendreHoraires(annexe, saisies, set, champStyle)
  return rendreOrganigramme(annexe, saisies, set, champStyle, verrouille, couleur)
}

function rendreTableau(a: AnnexeTableau, saisies: Saisies, set: (id: string, v: string) => void, champStyle: React.CSSProperties) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {a.lignes.map((l) => (
            <tr key={l.id} style={{ borderTop: '1px solid #ECEFF2' }}>
              <td style={{ padding: '6px 10px', fontSize: 13, fontWeight: 600, color: '#374151', width: '40%', verticalAlign: 'middle' }}>
                {l.prefixe ?? l.libelle}
              </td>
              <td style={{ padding: '6px 10px' }}>
                <input
                  type="text"
                  value={saisies[`${a.id}.${l.id}`] ?? ''}
                  onChange={(e) => set(`${a.id}.${l.id}`, e.target.value)}
                  style={champStyle}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function rendreHoraires(a: AnnexeHoraires, saisies: Saisies, set: (id: string, v: string) => void, champStyle: React.CSSProperties) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: '100%' }}>
          <thead>
            <tr>
              {a.jours.map((j) => (
                <th key={j} style={{ padding: '6px 8px', fontSize: 12, fontWeight: 700, color: '#374151', borderBottom: '1px solid #ECEFF2', whiteSpace: 'nowrap' }}>{j}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {a.jours.map((j) => (
                <td key={j} style={{ padding: '6px 6px' }}>
                  <input type="text" value={saisies[`${a.id}.${j}`] ?? ''} onChange={(e) => set(`${a.id}.${j}`, e.target.value)} style={{ ...champStyle, minWidth: 70 }} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function rendreOrganigramme(a: AnnexeOrganigramme, saisies: Saisies, set: (id: string, v: string) => void, champStyle: React.CSSProperties, verrouille: boolean, couleur: string) {
  // Regroupe les cases par niveau hierarchique, triees par colonne
  const niveaux: Record<number, typeof a.cases> = {}
  a.cases.forEach((c) => { (niveaux[c.niveau] = niveaux[c.niveau] ?? []).push(c) })
  Object.values(niveaux).forEach((arr) => arr.sort((x, y) => x.colonne - y.colonne))
  const ordre = Object.keys(niveaux).map(Number).sort((x, y) => x - y)

  const menu = (champId: string, options: string[], label: string) => (
    <select value={saisies[champId] ?? ''} disabled={verrouille} onChange={(e) => set(champId, e.target.value)} style={{ ...champStyle, marginBottom: 4 }}>
      <option value="">{label}</option>
      {options.map((o) => (<option key={o} value={o}>{o}</option>))}
    </select>
  )

  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: '12px' }}>
        <p style={{ margin: '0 0 12px 0', fontSize: 13, color: '#374151' }}>{a.consigne}</p>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 'fit-content' }}>
            {ordre.map((niv) => (
              <div key={niv} style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                {niveaux[niv].map((c) => (
                  <div key={c.id} style={{ border: `1px solid ${couleur}`, borderRadius: 8, padding: 8, width: 190, flexShrink: 0, background: '#FFFFFF' }}>
                    {menu(`${a.id}.${c.id}.fonction`, a.fonctions, 'Choisir une fonction')}
                    {menu(`${a.id}.${c.id}.nom`, a.noms, 'Choisir un nom')}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function libelleNiveau(niveau: string | null): string {
  switch (niveau) {
    case 'novice':
      return 'Novice'
    case 'debrouille':
      return 'Débrouillé'
    case 'averti':
      return 'Averti'
    case 'expert':
      return 'Expert'
    default:
      return 'Non évalué'
  }
}
