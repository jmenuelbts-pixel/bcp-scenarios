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
  AnnexeGrille,
  AnnexeTexte,
  AnnexeMail,
  AnnexeSms,
  AnnexeDialogue,
  AnnexeSoncase,
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
  const [docActif, setDocActif] = useState<number | null>(null)

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

      {/* Explorateur de documents (liste a gauche, lecture a droite) */}
      {contenu.documents && contenu.documents.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #DCE8F4', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ background: '#16456E', color: '#FFFFFF', padding: '10px 14px', fontSize: 14, fontWeight: 700 }}>
            Documents de la mission
          </div>
          <div className="bcp-doc-explorer" style={{ display: 'flex', minHeight: 280 }}>
            <div className="bcp-doc-liste" style={{ width: 230, flexShrink: 0, borderRight: '1px solid #E6ECF2', background: '#F8FAFC' }}>
              {contenu.documents.map((d) => {
                const actif = (docActif ?? contenu.documents![0].numero) === d.numero
                return (
                  <button
                    key={d.numero}
                    type="button"
                    onClick={() => setDocActif(d.numero)}
                    style={{
                      width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none',
                      borderBottom: '1px solid #E6ECF2', borderLeft: actif ? `3px solid ${couleur}` : '3px solid transparent',
                      background: actif ? '#FFFFFF' : 'transparent', padding: '10px 12px',
                      fontFamily: 'Arial, sans-serif', fontSize: 13, fontWeight: actif ? 700 : 400,
                      color: actif ? '#16456E' : '#4B5563', lineHeight: 1.4,
                    }}
                  >
                    <span style={{ display: 'block', fontSize: 11, color: '#9AA5B1', marginBottom: 2 }}>Document {d.numero}</span>
                    {d.titre}
                  </button>
                )
              })}
            </div>
            <div style={{ flex: 1, padding: 14, background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
              {(contenu.documents.find((d) => d.numero === (docActif ?? contenu.documents![0].numero)) ?? contenu.documents[0]).images.map((src, i) => (
                <img key={i} src={src} alt="Document" style={{ width: '100%', height: 'auto', border: '1px solid #E6ECF2', borderRadius: 6 }} />
              ))}
            </div>
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

      {/* Vue agrandie d'un document */}
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
  if (annexe.type === 'grille') return rendreGrille(annexe, saisies, set, champStyle)
  if (annexe.type === 'texte') return rendreTexte(annexe, saisies, set, champStyle)
  if (annexe.type === 'mail') return rendreMail(annexe, saisies, set, verrouille)
  if (annexe.type === 'sms') return rendreSms(annexe, saisies, set, verrouille)
  if (annexe.type === 'dialogue') return rendreDialogue(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'soncase') return rendreSoncase(annexe, saisies, set, verrouille, couleur)
  return rendreOrganigramme(annexe, saisies, set, champStyle, verrouille, couleur)
}

function rendreGrille(a: AnnexeGrille, saisies: Saisies, set: (id: string, v: string) => void, champStyle: React.CSSProperties) {
  const lignes = []
  for (let r = 0; r < a.nbLignes; r++) lignes.push(r)
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: a.colonnes.length > 2 ? 640 : undefined }}>
          <thead>
            <tr>
              {a.colonnes.map((c, ci) => (
                <th key={ci} style={{ padding: '6px 8px', fontSize: 12, fontWeight: 700, color: '#374151', borderBottom: '1px solid #ECEFF2', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((r) => (
              <tr key={r} style={{ borderTop: '1px solid #F1F3F5' }}>
                {a.colonnes.map((_, ci) => (
                  <td key={ci} style={{ padding: '4px 6px' }}>
                    <input type="text" value={saisies[`${a.id}.r${r}.c${ci}`] ?? ''} onChange={(e) => set(`${a.id}.r${r}.c${ci}`, e.target.value)} style={{ ...champStyle, minWidth: 100 }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function rendreTexte(a: AnnexeTexte, saisies: Saisies, set: (id: string, v: string) => void, champStyle: React.CSSProperties) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: '10px 12px' }}>
        {a.support && (
          <img src={a.support} alt={a.titre} style={{ maxWidth: '100%', height: 'auto', border: '1px solid #E6ECF2', borderRadius: 6, marginBottom: 10, display: 'block' }} />
        )}
        <textarea value={saisies[`${a.id}.texte`] ?? ''} onChange={(e) => set(`${a.id}.texte`, e.target.value)} rows={a.lignes ?? 3} style={{ ...champStyle, resize: 'vertical', fontSize: 14, padding: 10 }} />
      </div>
    </div>
  )
}

// Gabarit mail realiste : champs De/A/Objet/corps saisissables, le reste decoratif
function rendreMail(a: AnnexeMail, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean) {
  const champ: React.CSSProperties = { flex: 1, border: 'none', height: 30, background: 'transparent', fontFamily: 'Arial, sans-serif', fontSize: 14, color: verrouille ? '#6B7280' : '#1F2933', outline: 'none' }
  const ligne: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderBottom: '1px solid #ECEFF2' }
  const lab: React.CSSProperties = { fontSize: 13, fontWeight: 700, minWidth: 52, color: '#2C2C2A' }
  const ico = '#9AA5B1'
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        <div style={{ border: '1px solid #C9D1D9', borderRadius: 8, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ background: '#F1F1F1', borderBottom: '1px solid #E1E4E8', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#2C2C2A' }}>Nouveau message</span>
            <span style={{ color: ico, fontSize: 14 }}>—  ?  ✕</span>
          </div>
          <div style={ligne}><span style={lab}>De :</span><input type="text" disabled={verrouille} value={saisies[`${a.id}.de`] ?? ''} onChange={(e) => set(`${a.id}.de`, e.target.value)} style={champ} /></div>
          <div style={ligne}><span style={lab}>À :</span><input type="text" disabled={verrouille} value={saisies[`${a.id}.a`] ?? ''} onChange={(e) => set(`${a.id}.a`, e.target.value)} style={champ} /></div>
          <div style={{ ...ligne, color: ico }}><span style={{ ...lab, color: ico, fontWeight: 400 }}>Cc :</span><span style={{ fontSize: 13, color: ico }}>—</span><span style={{ ...lab, color: ico, fontWeight: 400, minWidth: 0, marginLeft: 16 }}>Cci :</span><span style={{ fontSize: 13, color: ico }}>—</span></div>
          <div style={ligne}><span style={lab}>Objet :</span><input type="text" disabled={verrouille} value={saisies[`${a.id}.objet`] ?? ''} onChange={(e) => set(`${a.id}.objet`, e.target.value)} style={champ} /></div>
          <div style={{ display: 'flex', gap: 14, padding: '6px 12px', borderBottom: '1px solid #ECEFF2', color: ico, fontSize: 15 }}>
            <span style={{ fontWeight: 700 }}>B</span><span style={{ fontStyle: 'italic' }}>I</span><span style={{ textDecoration: 'underline' }}>U</span><span>A</span><span>≣</span><span>•</span><span>🔗</span>
          </div>
          <textarea disabled={verrouille} value={saisies[`${a.id}.corps`] ?? ''} onChange={(e) => set(`${a.id}.corps`, e.target.value)} placeholder="Rédigez votre message ici…" style={{ width: '100%', boxSizing: 'border-box', border: 'none', minHeight: 150, padding: 12, resize: 'vertical', fontFamily: 'Arial, sans-serif', fontSize: 14, color: verrouille ? '#6B7280' : '#1F2933', outline: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 12px', borderTop: '1px solid #ECEFF2', background: '#FAFBFC' }}>
            <span style={{ background: '#1B73E8', color: '#FFFFFF', borderRadius: 6, padding: '6px 18px', fontSize: 13, fontWeight: 700 }}>Envoyer</span>
            <span style={{ color: ico, fontSize: 16 }}>📎</span>
            <span style={{ color: ico, fontSize: 16 }}>🖼</span>
            <span style={{ color: ico, fontSize: 16 }}>🙂</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Gabarit SMS realiste : ecran de telephone, saisie dans la bulle
function rendreSms(a: AnnexeSms, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 300, background: '#FFFFFF', border: '8px solid #1F2933', borderRadius: 36, padding: '10px 10px 16px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 10px' }}><div style={{ width: 90, height: 18, background: '#1F2933', borderRadius: 12 }} /></div>
          <div style={{ background: '#F4F4F5', borderRadius: 8, padding: 6, textAlign: 'center', fontWeight: 700, fontSize: 15, color: '#2C2C2A', marginBottom: 6 }}>{a.entete ?? 'SMS'}</div>
          {a.date && <div style={{ textAlign: 'center', fontSize: 12, color: '#9AA5B1', marginBottom: 12 }}>{a.date}</div>}
          <textarea disabled={verrouille} value={saisies[`${a.id}.corps`] ?? ''} onChange={(e) => set(`${a.id}.corps`, e.target.value)} placeholder="Rédigez le SMS ici…" style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E6ECF2', borderRadius: 18, minHeight: 150, padding: 12, resize: 'vertical', fontFamily: 'Arial, sans-serif', fontSize: 14, color: verrouille ? '#6B7280' : '#1F2933', background: '#FAFAFA', outline: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <div style={{ flex: 1, border: '1px solid #D5DBE1', borderRadius: 18, padding: '7px 14px', fontSize: 13, color: '#9AA5B1' }}>iMessage</div>
            <div style={{ width: 34, height: 34, borderRadius: 17, background: '#378ADD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: 16 }}>↑</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Dialogue de vente : reponses fixes (bulles), questions a saisir + cases a cocher
function rendreDialogue(a: AnnexeDialogue, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const coche = (champId: string) => {
    const on = (saisies[champId] ?? '') === '1'
    return (
      <span
        onClick={() => { if (!verrouille) set(champId, on ? '' : '1') }}
        style={{ display: 'inline-block', width: 22, height: 22, borderRadius: 5, border: `2px solid ${on ? couleur : '#C9D1D9'}`, background: on ? couleur : '#FFFFFF', color: '#FFFFFF', textAlign: 'center', lineHeight: '19px', fontSize: 14, fontWeight: 700, cursor: verrouille ? 'default' : 'pointer' }}
      >{on ? '✓' : ''}</span>
    )
  }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {a.lignes.map((l) => {
          if (l.role === 'reponse') {
            return (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ maxWidth: '85%', background: '#EEF1F4', borderRadius: '4px 16px 16px 16px', padding: '10px 14px', fontSize: 14, color: '#1F2933', lineHeight: 1.5 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7A8794', marginBottom: 3 }}>Client</div>
                  {l.texte}
                </div>
              </div>
            )
          }
          return (
            <div key={l.id} style={{ background: '#F8FAFC', border: '1px solid #E6ECF2', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: couleur, marginBottom: 6 }}>Votre question (vendeur)</div>
              <input type="text" disabled={verrouille} value={saisies[`${a.id}.${l.id}.q`] ?? ''} onChange={(e) => set(`${a.id}.${l.id}.q`, e.target.value)} placeholder="Rédigez la question…" style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #D5DBE1', borderRadius: 8, padding: '8px 10px', fontFamily: 'Arial, sans-serif', fontSize: 14, color: verrouille ? '#6B7280' : '#1F2933', marginBottom: 8, outline: 'none' }} />
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#7A8794' }}>Type :</span>
                {a.colonnes.map((c) => (
                  <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                    {coche(`${a.id}.${l.id}.${c}`)} {c}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Tableau SONCASE : case a cocher + justification par ligne
function rendreSoncase(a: AnnexeSoncase, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const coche = (champId: string) => {
    const on = (saisies[champId] ?? '') === '1'
    return (
      <span
        onClick={() => { if (!verrouille) set(champId, on ? '' : '1') }}
        style={{ display: 'inline-block', width: 22, height: 22, borderRadius: 5, border: `2px solid ${on ? couleur : '#C9D1D9'}`, background: on ? couleur : '#FFFFFF', color: '#FFFFFF', textAlign: 'center', lineHeight: '19px', fontSize: 14, fontWeight: 700, cursor: verrouille ? 'default' : 'pointer' }}
      >{on ? '✓' : ''}</span>
    )
  }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 520 }}>
          <thead>
            <tr>
              <th style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#374151', borderBottom: '1px solid #ECEFF2', textAlign: 'left', width: 150 }}>Typologie</th>
              <th style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#374151', borderBottom: '1px solid #ECEFF2', textAlign: 'center', width: 110 }}>{a.colonneCoche}</th>
              <th style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#374151', borderBottom: '1px solid #ECEFF2', textAlign: 'left' }}>{a.colonneJustif}</th>
            </tr>
          </thead>
          <tbody>
            {a.lignes.map((l) => (
              <tr key={l.id} style={{ borderTop: '1px solid #F1F3F5' }}>
                <td style={{ padding: '8px 10px', fontSize: 14, fontWeight: 600, color: '#1F2933' }}>{l.libelle}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center' }}>{coche(`${a.id}.${l.id}.coche`)}</td>
                <td style={{ padding: '6px 10px' }}>
                  <input type="text" disabled={verrouille} value={saisies[`${a.id}.${l.id}.j`] ?? ''} onChange={(e) => set(`${a.id}.${l.id}.j`, e.target.value)} placeholder="Justification…" style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #D5DBE1', borderRadius: 6, padding: '6px 8px', fontFamily: 'Arial, sans-serif', fontSize: 13, color: verrouille ? '#6B7280' : '#1F2933', outline: 'none' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
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
