// OngletTravaux.tsx
// Onglet Travaux a rendre : fiche eleve complete (contexte, objectifs,
// competence, activites avec questions et annexes a completer). Les saisies
// sont serialisees en JSON dans le champ travail unique de la mission, puis
// verrouillees apres envoi.

import { useEffect, useState } from 'react'
import { VisionneuseDocument } from '../ui/VisionneuseDocument'
import type {
  ContenuTravaux,
  Annexe,
  AnnexeTableau,
  AnnexeHoraires,
  AnnexeOrganigramme,
  AnnexeGrille,
  AnnexeTexte,
  AnnexeFormulaire,
  AnnexeSaisieGeo,
  AnnexeCasesServices,
  AnnexeCritereSeg,
  AnnexeCourrier,
  AnnexeCroc,
  AnnexeFicheContact,
  AnnexeTableauAppels,
  AnnexeAgenda,
  AnnexeFichierClients,
  AnnexePowerPoint,
  AnnexeRedactionOral,
  AnnexeModeOperatoire,
  AnnexeFicheSignaletique,
  AnnexeGrilleTarifaire,
  AnnexeOrganigrammeAremplir,
  NoeudOrgaVide,
  AnnexeCochage,
  AnnexeReformulation,
  AnnexeFicheTechnique,
  AnnexeArgumentaire,
  AnnexeFicheAppel,
  AnnexeMail,
  AnnexeSms,
  AnnexeFicheProduit,
  AnnexeCap,
  AnnexeConfigurateur,
  AnnexeDialogue,
  AnnexeSonCase,
  AnnexeObjections,
  AnnexeTraitObjections,
  AnnexeSimulateur,
  AnnexeCatalogue,
  ProduitCatalogue,
  VehiculeCatalogue,
  BlocDocumentTexte,
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
  // Marque affichee dans l'habillage pageWeb, derivee du prefixe de missionId.
  const MARQUES: Record<string, { nom: string; url: string }> = {
    renault: { nom: 'Renault', url: 'www.renault.fr' },
    citroen: { nom: 'Citroën', url: 'www.citroen.fr' },
    amparis: { nom: 'AMParis', url: 'www.amparis.fr' },
    orpi: { nom: 'Orpi', url: 'www.orpi.com' },
    free: { nom: 'free', url: 'www.free.fr' },
    peugeot: { nom: 'Peugeot', url: 'www.peugeot.fr' },
  }
  const prefixe = (missionId ?? '').split('-')[0]
  const marque = MARQUES[prefixe] ?? { nom: 'Documentation', url: 'www.exemple.fr' }
  const [saisies, setSaisies] = useState<Saisies>({})
  const [verrouille, setVerrouille] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [retour, setRetour] = useState<RetourTravail | null>(null)
  const [docActif, setDocActif] = useState<number | null>(null)
  // Document ouvert en plein ecran dans la visionneuse (zoom).
  const [docZoom, setDocZoom] = useState<{ src: string; alt: string } | null>(null)
  // Fiche technique de vehicule ouverte en plein ecran (catalogue Document 5).
  const [ficheVehicule, setFicheVehicule] = useState<VehiculeCatalogue | null>(null)

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
  const aDesAnnexes = (contenu.annexes?.length ?? 0) > 0
  const toutRempli =
    champs.length === 0
      ? (aDesAnnexes ? true : (saisies._texte ?? '').trim().length > 0)
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
          {contenu.contexte.split('\n').map((par, i) => (
            <p key={i} style={{ margin: i === 0 ? 0 : '8px 0 0', fontSize: 14, lineHeight: 1.6, color: '#374151' }}>{par}</p>
          ))}
          {contenu.videoContexte && (
            <a href={contenu.videoContexte} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '8px 14px', borderRadius: 8, border: `1px solid ${couleur}`, background: '#FFFFFF', color: couleur, fontSize: 13, fontWeight: 700, textDecoration: 'none', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={couleur} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              Écouter le contexte (vidéo)
            </a>
          )}
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
              {(() => {
                const docCourant = contenu.documents.find((d) => d.numero === (docActif ?? contenu.documents![0].numero)) ?? contenu.documents[0]
                return (
                  <>
                    {docCourant.catalogueVehicules ? (
                      <CatalogueVehiculesVue
                        catalogue={docCourant.catalogueVehicules}
                        couleur={couleur}
                        onOuvrir={(v) => setFicheVehicule(v)}
                      />
                    ) : docCourant.texte ? (
                      <DocumentTexteVue blocs={docCourant.texte} couleur={couleur} marque={marque} />
                    ) : (
                      <>
                        <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ display: 'inline-flex', width: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 4, background: '#EEF3F8', color: '#16456E', fontWeight: 700 }}>+</span>
                          Cliquez sur le document pour l'agrandir.
                        </div>
                        {docCourant.images.map((src, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setDocZoom({ src, alt: `Document ${docCourant.numero} — ${docCourant.titre}` })}
                            title="Cliquer pour agrandir"
                            style={{ padding: 0, border: '1px solid #E6ECF2', borderRadius: 6, background: '#FFFFFF', cursor: 'zoom-in', display: 'block', width: '100%' }}
                          >
                            <img src={src} alt={`Document ${docCourant.numero}`} style={{ width: '100%', height: 'auto', borderRadius: 6, display: 'block' }} />
                          </button>
                        ))}
                      </>
                    )}
                  </>
                )
              })()}
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
                {q.boutonLien && (
                  <div style={{ marginLeft: 18, marginBottom: 10 }}>
                    <a href={q.boutonLien} target="_blank" rel="noopener noreferrer" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                      background: couleur, color: '#FFFFFF', borderRadius: 8, padding: '8px 14px',
                      fontSize: 13, fontWeight: 700,
                    }}>
                      <span style={{ display: 'inline-flex', width: 18, height: 18, borderRadius: 4, background: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>↗</span>
                      {q.boutonLibelle ?? 'Ouvrir la ressource'}
                    </a>
                  </div>
                )}
                {annexe && annexe.type !== 'powerpoint' && (
                  <div style={{ marginLeft: 18 }}>
                    {rendreAnnexe(annexe, saisies, set, champStyle, verrouille, couleur)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}

      {/* Annexes partagees affichees une seule fois (ex : PowerPoint) */}
      {contenu.annexes?.filter((a) => a.type === 'powerpoint').map((a) => (
        <div key={a.id} style={{ marginBottom: 18 }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: 15, color: '#FFFFFF', background: couleur, borderRadius: 8, padding: '8px 14px' }}>{a.titre}</h3>
          {rendreAnnexe(a, saisies, set, champStyle, verrouille, couleur)}
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
      {docZoom && (
        <VisionneuseDocument src={docZoom.src} alt={docZoom.alt} onClose={() => setDocZoom(null)} />
      )}

      {/* Fiche technique d'un vehicule en plein ecran (catalogue Document 5) */}
      {ficheVehicule && (
        <FicheVehiculePleinEcran v={ficheVehicule} couleur={couleur} onClose={() => setFicheVehicule(null)} />
      )}
    </div>
  )
}

// Vue d'un document entierement redactionnel (sans image) : intertitres,
// paragraphes, listes a puces et dialogues, dans un cadre de lecture sobre.
// CRM consultable facon logiciel professionnel : liste de fiches organisations
// avec recherche, clic pour voir le detail, et bouton retour a la liste.
function CrmConsultable({ crm, couleur }: {
  crm: NonNullable<BlocDocumentTexte['crm']>
  couleur: string
}) {
  const [recherche, setRecherche] = useState('')
  const [selection, setSelection] = useState<number | null>(null)
  const champ: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 14,
    padding: '8px 10px', borderRadius: 6, border: '1px solid #C9D6E3', outline: 'none',
  }
  const filtrees = crm.fiches
    .map((f, i) => ({ f, i }))
    .filter(({ f }) => {
      const q = recherche.trim().toLowerCase()
      if (!q) return true
      return f.nom.toLowerCase().includes(q) || f.activite.toLowerCase().includes(q) || f.ville.toLowerCase().includes(q)
    })
  const detail = selection !== null ? crm.fiches[selection] : null
  const ligne = (label: string, valeur?: string) => valeur ? (
    <div style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid #EEF2F5' }}>
      <div style={{ minWidth: 130, fontSize: 12, fontWeight: 700, color: '#6B7280' }}>{label}</div>
      <div style={{ fontSize: 14, color: '#1F2933' }}>{valeur}</div>
    </div>
  ) : null
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFFFFF' }} />
        {crm.entete ?? 'Annuaire'}
        <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 500, opacity: 0.85 }}>{crm.fiches.length} fiches</span>
      </div>
      {detail ? (
        <div style={{ padding: 14 }}>
          <button type="button" onClick={() => setSelection(null)} style={{ border: `1px solid ${couleur}`, color: couleur, background: '#FFFFFF', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>← Retour à la liste</button>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#1F2933', marginBottom: 2 }}>{detail.nom}</div>
          <div style={{ fontSize: 13, color: couleur, fontWeight: 600, marginBottom: 10 }}>{detail.activite}</div>
          {ligne('Adresse', detail.adresse)}
          {ligne('Ville', detail.ville)}
          {ligne('Téléphone', detail.telephone)}
          {ligne('E-mail', detail.email)}
          {ligne('Fax', detail.fax)}
        </div>
      ) : (
        <div style={{ padding: 14 }}>
          <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher une organisation, une activité, une ville..." style={{ ...champ, marginBottom: 12 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
            {filtrees.map(({ f, i }) => (
              <button key={i} type="button" onClick={() => setSelection(i)} style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid #E2E8F0', borderRadius: 8, background: '#FFFFFF', padding: '10px 12px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2933' }}>{f.nom}</div>
                <div style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 6px' }}>{f.activite}</div>
                <div style={{ fontSize: 12, color: couleur, fontWeight: 600 }}>{f.ville} · voir la fiche →</div>
              </button>
            ))}
            {filtrees.length === 0 && <div style={{ fontSize: 13, color: '#9AA5B1' }}>Aucune organisation ne correspond à la recherche.</div>}
          </div>
        </div>
      )}
    </div>
  )
}

function DocumentTexteVue({ blocs, couleur, marque }: { blocs: BlocDocumentTexte[]; couleur: string; marque: { nom: string; url: string } }) {
  const estPageWeb = blocs.some((b) => b.pageWeb)
  const contenu = blocs.filter((b) => !(b.pageWeb && !b.intertitre && !b.paragraphes && !b.puces && !b.dialogue && !b.tableau && !b.crm && !b.organigramme && !b.procedure && !b.transcription && !b.journalAppels && !b.mailLecture && !b.offrePrix && !b.cartesTechniques && !b.offreFlash))
  // Premier intertitre = titre de la page (sert au bandeau hero).
  const titrePage = contenu.find((b) => b.intertitre)?.intertitre
  return (
    <div style={{ border: '1px solid #E6ECF2', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {estPageWeb && (
        <>
          {/* Barre de navigateur facon onglet */}
          <div style={{ background: '#E9EDF1', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F57' }} />
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#FEBC2E' }} />
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28C840' }} />
            <div style={{ marginLeft: 10, flex: 1, background: '#FFFFFF', borderRadius: 14, padding: '4px 12px', fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: couleur }}>🔒</span> https://{marque.url}
            </div>
          </div>
          {/* En-tete site : logo + navigation */}
          <div style={{ background: '#1F2933', color: '#FFFFFF', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#000000', borderRadius: 6, padding: '6px 12px' }}>
              <span style={{ display: 'inline-flex', width: 22, height: 22, alignItems: 'center', justifyContent: 'center', background: couleur, borderRadius: 4, fontWeight: 800, fontSize: 13, color: '#FFFFFF' }}>{marque.nom.charAt(0).toUpperCase()}</span>
              <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: 0.5 }}>{marque.nom}</span>
              <span style={{ display: 'flex', gap: 3, marginLeft: 2 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#E2241A' }} />
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#E2241A' }} />
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#E2241A' }} />
              </span>
            </div>
            <nav style={{ display: 'flex', gap: 16, fontSize: 13, fontWeight: 600, opacity: 0.92, flexWrap: 'wrap' }}>
              <span>Accueil</span><span>Produits</span><span>Services</span><span>Secteur</span><span>Contact</span>
            </nav>
            <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.7 }}>{marque.url}</span>
          </div>
          {/* Bandeau hero */}
          <div style={{ background: `linear-gradient(110deg, ${couleur} 0%, #14532b 100%)`, color: '#FFFFFF', padding: '18px 22px' }}>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>Accueil › Documentation</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{titrePage ?? `${marque.nom} — Documentation`}</div>
          </div>
        </>
      )}
      <div style={{ padding: '16px 20px', lineHeight: 1.65, fontSize: 14, color: '#1F2933' }}>
      {contenu.map((b, bi) => (
        <div key={bi} style={{ marginBottom: bi === contenu.length - 1 ? 0 : 12 }}>
          {b.intertitre && (
            <div style={{ fontSize: 14, fontWeight: 800, color: couleur, margin: '6px 0 6px', borderLeft: `3px solid ${couleur}`, paddingLeft: 8 }}>{b.intertitre}</div>
          )}
          {b.paragraphes?.map((para, pi) => (
            <p key={pi} style={{ margin: '0 0 8px' }}>{para}</p>
          ))}
          {b.puces && (
            <ul style={{ margin: '0 0 8px', paddingLeft: 18 }}>
              {b.puces.map((li, i) => <li key={i} style={{ marginBottom: 4 }}>{li}</li>)}
            </ul>
          )}
          {b.dialogue?.map((d, di) => (
            <p key={di} style={{ margin: '0 0 6px', fontStyle: d.italique ? 'italic' : 'normal', color: d.italique ? '#4B5563' : '#1F2933' }}>
              {d.locuteur && <span style={{ fontWeight: 700 }}>{d.locuteur} : </span>}
              {d.texte}
            </p>
          ))}
          {b.audioLien && (
            <a href={b.audioLien} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: '#FFFFFF', color: couleur, border: `1px solid ${couleur}`, borderRadius: 16, padding: '5px 12px', fontSize: 12, fontWeight: 700, marginTop: 4 }}>🔊 Écouter cette partie</a>
          )}
          {b.tableau && (
            <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: 4 }}>
              <thead>
                <tr>
                  {b.tableau.colonnes.map((col, ci) => (
                    <th key={ci} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 13, fontWeight: 700, color: '#FFFFFF', background: couleur, border: '1px solid #DCE8F4' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.tableau.lignes.map((ligne, li) => (
                  <tr key={li}>
                    {ligne.map((c, cj) => (
                      <td key={cj} style={{ padding: '8px 10px', fontSize: 14, color: '#1F2933', border: '1px solid #DCE8F4', fontWeight: cj === 0 ? 700 : 400, verticalAlign: 'top', width: cj === 0 ? '22%' : undefined }}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {b.crm && <CrmConsultable crm={b.crm} couleur={couleur} />}
          {b.organigramme && <OrganigrammeVue org={b.organigramme} />}
          {b.journalAppels && <JournalAppelsVue journal={b.journalAppels} couleur={couleur} />}
          {b.transcription && <TranscriptionVue transcription={b.transcription} couleur={couleur} />}
          {b.procedure && <ProcedureVue procedure={b.procedure} couleur={couleur} />}
          {b.mailLecture && <MailLectureVue mail={b.mailLecture} couleur={couleur} />}
          {b.offrePrix && <OffrePrixVue offre={b.offrePrix} couleur={couleur} />}
          {b.cartesTechniques && <CartesTechniquesVue data={b.cartesTechniques} couleur={couleur} />}
          {b.offreFlash && <OffreFlashVue offre={b.offreFlash} couleur={couleur} />}
        </div>
      ))}
      </div>
    </div>
  )
}

// Bloc prix facon page Free : grand prix mis en avant, cercles rouges decoratifs.
function OffrePrixVue({ offre, couleur }: { offre: NonNullable<BlocDocumentTexte['offrePrix']>; couleur: string }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', border: '1px solid #EEF1F4', borderRadius: 12, background: '#FFFFFF', padding: '34px 20px', textAlign: 'center' }}>
      <div style={{ position: 'absolute', left: -70, top: '38%', width: 150, height: 150, borderRadius: '50%', background: couleur, opacity: 0.92 }} />
      <div style={{ position: 'absolute', right: -50, bottom: -50, width: 110, height: 110, borderRadius: '50%', background: '#FF6B5E', opacity: 0.85 }} />
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#1F2933', marginBottom: 18 }}>Une offre à <span style={{ color: '#000' }}>prix Free</span><span style={{ color: couleur }}>.</span></div>
        <div style={{ display: 'inline-flex', alignItems: 'flex-start', justifyContent: 'center', color: couleur, lineHeight: 1 }}>
          <span style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2 }}>{offre.prix}</span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 6 }}>
            <span style={{ fontSize: 30, fontWeight: 800 }}>{offre.cents}</span>
            <span style={{ fontSize: 26, fontWeight: 600 }}>{offre.periode}</span>
          </span>
        </div>
        {offre.soustexte && <div style={{ marginTop: 18 }}>{offre.soustexte.map((s, i) => <div key={i} style={{ fontSize: 15, fontWeight: i === offre.soustexte!.length - 1 ? 800 : 500, color: '#1F2933' }}>{s}</div>)}</div>}
      </div>
    </div>
  )
}

// Deux cartes techniques opposees (addition / soustraction) avec gros symbole.
function CartesTechniquesVue({ data, couleur }: { data: NonNullable<BlocDocumentTexte['cartesTechniques']>; couleur: string }) {
  return (
    <div>
      {data.rappel && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#FBE3E4', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
          <span style={{ fontWeight: 800, fontSize: 13, color: couleur, textTransform: 'uppercase', letterSpacing: 0.5 }}>Rappel</span>
          <span style={{ fontSize: 13.5, color: '#8A1C24' }}>{data.rappel}</span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {data.cartes.map((c, i) => (
          <div key={i} style={{ border: `2px solid ${couleur}`, borderRadius: 12, overflow: 'hidden', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 70, background: couleur }}>
              <span style={{ width: 46, height: 46, borderRadius: '50%', background: '#FFFFFF', color: couleur, fontSize: 32, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{c.icone === 'plus' ? '+' : '\u2212'}</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: couleur, marginBottom: 6 }}>{c.titre}</div>
              <div style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.55 }}>{c.texte}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Offre flash facon encart promo : badge + lignes barrees mises en avant.
function OffreFlashVue({ offre, couleur }: { offre: NonNullable<BlocDocumentTexte['offreFlash']>; couleur: string }) {
  return (
    <div style={{ border: `2px dashed ${couleur}`, borderRadius: 12, background: 'linear-gradient(135deg, #FFF 60%, #FBE3E4)', padding: 18, textAlign: 'center' }}>
      <div style={{ display: 'inline-block', background: couleur, color: '#FFFFFF', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, padding: '5px 14px', borderRadius: 20, marginBottom: 14 }}>⚡ {offre.badge}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
        {offre.lignes.map((l, i) => (
          <div key={i} style={{ fontSize: 17, fontWeight: 700, color: '#1F2933' }}>✔ {l}</div>
        ))}
      </div>
      {offre.mention && <div style={{ marginTop: 12, fontSize: 18, fontWeight: 800, color: couleur }}>{offre.mention}</div>}
    </div>
  )
}

// Mail en lecture seule facon client de messagerie : entete De/A/Objet + corps.
function MailLectureVue({ mail, couleur }: { mail: NonNullable<BlocDocumentTexte['mailLecture']>; couleur: string }) {
  return (
    <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div style={{ background: '#F4F5F7', padding: '8px 12px', fontSize: 13, fontWeight: 700, color: '#1F2933', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #E2E8F0' }}>
        <span style={{ display: 'inline-flex', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} /><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} /><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} /></span>
        Nouveau message
      </div>
      <div style={{ padding: '10px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #EEF1F4' }}>
        <div style={{ marginBottom: 3 }}><strong style={{ color: '#6B7280' }}>De : </strong>{mail.de}</div>
        <div style={{ marginBottom: 3 }}><strong style={{ color: '#6B7280' }}>À : </strong>{mail.a}</div>
        <div><strong style={{ color: '#6B7280' }}>Objet : </strong><span style={{ fontWeight: 700, color: couleur }}>{mail.objet}</span></div>
      </div>
      <div style={{ padding: 14, fontSize: 14, color: '#1F2933', lineHeight: 1.6 }}>
        {mail.corps.map((l, i) => <p key={i} style={{ margin: '0 0 8px' }}>{l}</p>)}
      </div>
    </div>
  )
}

// Procedure illustree facon page web Free : etapes avec icones SVG, encadre
// d'alerte, et section secondaire. Lecture seule.
function ProcedureVue({ procedure, couleur }: { procedure: NonNullable<BlocDocumentTexte['procedure']>; couleur: string }) {
  const Icone = ({ type }: { type: 'tel' | 'mail' | 'box' }) => {
    const common = { width: 46, height: 46, fill: 'none', stroke: couleur, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
    if (type === 'tel') return <svg viewBox="0 0 24 24" {...common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
    if (type === 'mail') return <svg viewBox="0 0 24 24" {...common}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></svg>
    return <svg viewBox="0 0 24 24" {...common}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5M12 22V12" /></svg>
  }
  return (
    <div style={{ border: '1px solid #E6ECF2', borderRadius: 8, overflow: 'hidden' }}>
      {/* Titre 1 avec barre rouge facon Free */}
      <div style={{ borderLeft: `5px solid ${couleur}`, padding: '8px 14px', fontSize: 18, fontWeight: 800, color: couleur, background: '#FFFFFF', borderBottom: '1px solid #EEF1F4' }}>1 - {procedure.titre1}</div>
      <div style={{ padding: 18 }}>
        {procedure.intro && <p style={{ margin: '0 0 18px', fontSize: 14, color: '#1F2933' }}>{procedure.intro}</p>}
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
          {procedure.etapes.map((e, i) => (
            <div key={i} style={{ flex: '1 1 240px', textAlign: 'center', padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><Icone type={e.icone} /></div>
              <div style={{ fontSize: 14, fontWeight: 800, color: couleur, marginBottom: 4 }}>{e.titre}</div>
              <div style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.5 }}>{e.texte}</div>
            </div>
          ))}
        </div>
        {procedure.alerte && (
          <div style={{ display: 'flex', gap: 10, background: '#FBE3E4', borderRadius: 6, padding: '12px 14px', marginTop: 18 }}>
            <span style={{ color: couleur, fontWeight: 800, fontSize: 20 }}>!</span>
            <div style={{ fontSize: 13, color: '#8A1C24', lineHeight: 1.5 }}>{procedure.alerte.map((a, i) => <p key={i} style={{ margin: i === 0 ? '0 0 6px' : 0 }}>{a}</p>)}</div>
          </div>
        )}
        {procedure.titre2 && <div style={{ borderLeft: `5px solid ${couleur}`, padding: '8px 14px', fontSize: 17, fontWeight: 800, color: couleur, marginTop: 20, borderBottom: '1px solid #EEF1F4' }}>2 - {procedure.titre2}</div>}
        {procedure.section2 && <div style={{ marginTop: 10 }}>{procedure.section2.map((s, i) => <p key={i} style={{ margin: '0 0 8px', fontSize: 13.5, color: '#1F2933', lineHeight: 1.55 }}>{s}</p>)}</div>}
      </div>
    </div>
  )
}

// Transcription en temps reel facon logiciel de centre d'appel : echanges
// numerotes en bulles entrant (gauche) / sortant (droite, conseiller).
function TranscriptionVue({ transcription, couleur }: { transcription: NonNullable<BlocDocumentTexte['transcription']>; couleur: string }) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 10, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ background: '#1F2933', color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block' }} /> {transcription.entete ?? 'Transcription en temps réel'}
        <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.7 }}>{transcription.echanges.length} échanges</span>
      </div>
      <div style={{ padding: 14, background: '#F2F5F8', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {transcription.echanges.map((e, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: e.entrant ? 'flex-start' : 'flex-end' }}>
            <div style={{ maxWidth: '78%', background: e.entrant ? '#FFFFFF' : couleur, color: e.entrant ? '#1F2933' : '#FFFFFF', border: e.entrant ? '1px solid #E2E8F0' : 'none', borderRadius: 12, padding: '8px 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, marginBottom: 2 }}>{e.numero}. {e.locuteur}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{e.texte}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Journal d'appels facon logiciel de compte rendu : liste de fiches d'appel
// cliquables, avec detail (numero, reponse, interlocuteur).
function JournalAppelsVue({ journal, couleur }: { journal: NonNullable<BlocDocumentTexte['journalAppels']>; couleur: string }) {
  const [sel, setSel] = useState<number | null>(null)
  const detail = sel !== null ? journal.appels[sel] : null
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>☎</span>{journal.entete ?? "Journal des appels"}
        <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 500, opacity: 0.85 }}>{journal.appels.length} appels</span>
      </div>
      {detail ? (
        <div style={{ padding: 14 }}>
          <button type="button" onClick={() => setSel(null)} style={{ border: `1px solid ${couleur}`, color: couleur, background: '#FFFFFF', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>← Retour aux appels</button>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Vous avez contacté le</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: couleur, marginBottom: 12 }}>{detail.numero}</div>
          <div style={{ background: '#F7F9FB', border: '1px solid #E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, lineHeight: 1.6, fontStyle: 'italic', color: '#1F2933' }}>{detail.reponse}</div>
          {detail.interlocuteur && <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: '#374151', textAlign: 'right' }}>— {detail.interlocuteur}</div>}
        </div>
      ) : (
        <div style={{ padding: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
          {journal.appels.map((a, i) => (
            <button key={i} type="button" onClick={() => setSel(i)} style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid #E2E8F0', borderRadius: 8, background: '#FFFFFF', padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#1F2933' }}><span style={{ color: couleur }}>☎</span>{a.numero}</div>
              <div style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.interlocuteur || 'Voir la réponse'}</div>
              <div style={{ fontSize: 12, color: couleur, fontWeight: 600, marginTop: 4 }}>ouvrir →</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Organigramme hierarchique de consultation : arbre recursif, couleur par
// branche, plus une bande transversale optionnelle (corps professoral).
const TEINTES_ORGA: Record<string, { bg: string; bord: string; texte: string }> = {
  tete: { bg: '#E8C4A0', bord: '#C99A6A', texte: '#5A3A1A' },
  bleu: { bg: '#AEC6E0', bord: '#7FA3C9', texte: '#1F3A5A' },
  jaune: { bg: '#F5E08C', bord: '#D9BE55', texte: '#5A4A12' },
  vert: { bg: '#B9D9A4', bord: '#8FBE72', texte: '#2E4A1E' },
  rose: { bg: '#F3C4E8', bord: '#D98FC9', texte: '#5A2A50' },
  gris: { bg: '#E2E8F0', bord: '#C9D6E3', texte: '#1F2933' },
}
function NoeudOrgaVue({ noeud }: { noeud: import('../../data/contenus').NoeudOrga }) {
  const c = TEINTES_ORGA[noeud.teinte ?? 'gris']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ border: `1.5px solid ${c.bord}`, background: c.bg, color: c.texte, borderRadius: 6, padding: '8px 14px', minWidth: 110, textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{noeud.libelle}</div>
        {noeud.sousTitre && <div style={{ fontSize: 11, marginTop: 2, opacity: 0.85 }}>{noeud.sousTitre}</div>}
      </div>
      {noeud.enfants && noeud.enfants.length > 0 && (
        <>
          <div style={{ width: 2, height: 14, background: '#B0BAC5' }} />
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', borderTop: noeud.enfants.length > 1 ? '2px solid #B0BAC5' : 'none', paddingTop: noeud.enfants.length > 1 ? 14 : 0 }}>
            {noeud.enfants.map((e, i) => <NoeudOrgaVue key={i} noeud={e} />)}
          </div>
        </>
      )}
    </div>
  )
}
function OrganigrammeVue({ org }: { org: NonNullable<BlocDocumentTexte['organigramme']> }) {
  return (
    <div style={{ overflowX: 'auto', padding: '10px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 'fit-content' }}>
        <NoeudOrgaVue noeud={org.tete} />
        {org.transversal && (
          <div style={{ marginTop: 16, width: '100%' }}>
            <div style={{ border: `1.5px solid ${TEINTES_ORGA.rose.bord}`, background: TEINTES_ORGA.rose.bg, color: TEINTES_ORGA.rose.texte, borderRadius: 6, padding: '10px 14px', textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{org.transversal}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// Vue catalogue (Document 5) : grille de vignettes vehicule cliquables, facon
// logiciel concessionnaire. Chaque vignette ouvre la fiche technique complete.
function CatalogueVehiculesVue({ catalogue, couleur, onOuvrir }: {
  catalogue: import('../../data/contenus').CatalogueVehicules
  couleur: string
  onOuvrir: (v: VehiculeCatalogue) => void
}) {
  // Silhouette vectorielle sobre d'une voiture (pas de photo : reseau bloque).
  const silhouette = (
    <svg width="100%" height="96" viewBox="0 0 200 96" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }} aria-hidden="true">
      <rect width="200" height="96" fill="#F4F1F7" />
      <path d="M28 64 L46 44 Q52 37 62 37 L128 37 Q140 37 150 46 L172 60 Q180 62 180 70 L180 74 L20 74 L20 70 Q20 65 28 64 Z" fill={couleur} opacity="0.92" />
      <path d="M58 46 L66 40 L104 40 L104 46 Z" fill="#FFFFFF" opacity="0.85" />
      <path d="M110 40 L128 40 Q136 40 142 46 L142 46 L110 46 Z" fill="#FFFFFF" opacity="0.85" />
      <circle cx="62" cy="74" r="12" fill="#1F2933" /><circle cx="62" cy="74" r="5" fill="#9AA5B1" />
      <circle cx="148" cy="74" r="12" fill="#1F2933" /><circle cx="148" cy="74" r="5" fill="#9AA5B1" />
    </svg>
  )
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#16456E', color: '#FFFFFF', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFCC00' }} />
        {catalogue.titreLogiciel}
      </div>
      {catalogue.intro && (
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #EEF2F5', fontSize: 13, color: '#4B5563' }}>{catalogue.intro}</div>
      )}
      <div style={{ padding: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
          {catalogue.vehicules.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onOuvrir(v)}
              title={`Voir la fiche technique : ${v.nom}`}
              style={{
                textAlign: 'left', cursor: 'pointer', padding: 0, overflow: 'hidden',
                border: '1px solid #E2E8F0', borderRadius: 10, background: '#FFFFFF',
              }}
            >
              {silhouette}
              <div style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#1F2933' }}>{v.nom}</span>
                  {v.badge && <span style={{ fontSize: 10, fontWeight: 700, color: '#FFFFFF', background: couleur, borderRadius: 4, padding: '2px 6px' }}>{v.badge}</span>}
                </div>
                <div style={{ fontSize: 12, color: '#9AA5B1', margin: '3px 0 8px' }}>{v.type}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: couleur }}>{v.prix}</div>
                <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: '#16456E' }}>Voir la fiche technique</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Fiche technique d'un vehicule affichee en plein ecran (lecture seule).
function FicheVehiculePleinEcran({ v, couleur, onClose }: {
  v: VehiculeCatalogue
  couleur: string
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const ancien = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ancien }
  }, [onClose])

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,32,0.88)', display: 'flex', flexDirection: 'column', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ margin: '0 auto', width: '100%', maxWidth: 760, background: '#FFFFFF', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
        <div style={{ background: couleur, color: '#FFFFFF', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>{v.nom}</span>
              {v.badge && <span style={{ fontSize: 11, fontWeight: 700, color: couleur, background: '#FFFFFF', borderRadius: 4, padding: '2px 7px' }}>{v.badge}</span>}
            </div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>{v.type} — {v.prix}</div>
          </div>
          <button type="button" aria-label="Fermer" title="Fermer" onClick={onClose} style={{ width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer', background: '#FFFFFF', color: couleur, fontSize: 18, fontWeight: 700, flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ padding: 18, overflowY: 'auto' }}>
          {v.sections.map((s, si) => (
            <div key={si} style={{ marginBottom: si === v.sections.length - 1 ? 0 : 18 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: couleur, textTransform: 'uppercase', letterSpacing: 0.3, borderBottom: `2px solid ${couleur}`, paddingBottom: 4, marginBottom: 8 }}>{s.titre}</div>
              {s.lignes[0]?.libelle !== undefined ? (
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <tbody>
                    {s.lignes.map((l, li) => (
                      <tr key={li}>
                        <td style={{ padding: '5px 10px 5px 0', fontSize: 13, color: '#6B7280', verticalAlign: 'top', whiteSpace: 'nowrap', width: '40%' }}>{l.libelle}</td>
                        <td style={{ padding: '5px 0', fontSize: 14, fontWeight: 600, color: '#1F2933' }}>{l.valeur}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7, color: '#374151' }}>
                  {s.lignes.map((l, li) => <li key={li}>{l.valeur}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 18px', borderTop: '1px solid #EEF2F5', fontSize: 12, color: '#9AA5B1', flexShrink: 0 }}>Échap ou ✕ pour fermer.</div>
      </div>
    </div>
  )
}

function Bloc({ titre, couleur, children }: { titre: string; couleur: string; children: React.ReactNode }) {
  return (    <div style={{ background: '#F4F8FC', border: '1px solid #DCE8F4', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
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
  if (annexe.type === 'formulaire') return rendreFormulaire(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'saisiegeo') return rendreSaisieGeo(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'casesservices') return rendreCasesServices(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'critereseg') return rendreCritereSeg(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'courrier') return rendreCourrier(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'croc') return rendreCroc(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'fichecontact') return rendreFicheContact(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'tableauappels') return rendreTableauAppels(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'agenda') return rendreAgenda(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'fichierclients') return rendreFichierClients(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'powerpoint') return <EditeurPowerPoint a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'redactionoral') return rendreRedactionOral(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'modeoperatoire') return rendreModeOperatoire(annexe, couleur)
  if (annexe.type === 'fichesignaletique') return rendreFicheSignaletique(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'grilletarifaire') return rendreGrilleTarifaire(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'organigrammearemplir') return rendreOrganigrammeAremplir(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'cochage') return rendreCochage(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'reformulation') return rendreReformulation(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'fichetechnique') return rendreFicheTechnique(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'argumentaire') return rendreArgumentaire(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'ficheappel') return rendreFicheAppel(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'mail') return rendreMail(annexe, saisies, set, verrouille)
  if (annexe.type === 'sms') return rendreSms(annexe, saisies, set, verrouille)
  if (annexe.type === 'ficheproduit') return rendreFicheProduit(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'cap') return rendreCap(annexe, saisies, set, champStyle, couleur)
  if (annexe.type === 'configurateur') return rendreConfigurateur(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'dialogue') return rendreDialogue(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'soncase') return rendreSonCase(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'objections') return rendreObjections(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'traitobjections') return rendreTraitObjections(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'simulateur') return rendreSimulateur(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'catalogue') return rendreCatalogue(annexe, saisies, set, verrouille, couleur)
  return rendreOrganigramme(annexe, saisies, set, champStyle, verrouille, couleur)
}

// Bloc fiche produit a onglets (technique / equipements / commercial),
// reutilise par l'annexe ficheproduit et par le configurateur.
function BlocFicheProduit({
  baseId, technique, nbEquipements, commercial, saisies, set, verrouille, couleur, ongletInitial,
}: {
  baseId: string
  technique: string[]
  nbEquipements: number
  commercial: string[]
  saisies: Saisies
  set: (id: string, v: string) => void
  verrouille: boolean
  couleur: string
  ongletInitial?: 'tech' | 'equip' | 'com'
}) {
  const [onglet, setOnglet] = useState<'tech' | 'equip' | 'com'>(ongletInitial ?? 'tech')
  const champ: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '6px 8px', borderRadius: 6,
    border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF',
    color: verrouille ? '#6B7280' : '#1F2933', width: '100%', boxSizing: 'border-box',
  }
  const tab = (id: 'tech' | 'equip' | 'com', label: string) => (
    <button type="button" onClick={() => setOnglet(id)} style={{
      flex: 1, border: 'none', cursor: 'pointer', padding: '9px 8px', fontFamily: 'Arial, sans-serif',
      fontSize: 13, fontWeight: onglet === id ? 700 : 500,
      color: onglet === id ? '#FFFFFF' : '#4B5563',
      background: onglet === id ? couleur : '#EEF3F8',
      borderBottom: onglet === id ? `2px solid ${couleur}` : '2px solid transparent',
    }}>{label}</button>
  )
  return (
    <div style={{ border: '1px solid #C9D6E3', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
      <div style={{ background: '#16456E', color: '#FFFFFF', padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B9E5A', display: 'inline-block' }} />
        Logiciel concession — Fiche produit
      </div>
      <div style={{ display: 'flex' }}>
        {tab('tech', 'Caractéristiques techniques')}
        {tab('equip', 'Équipements')}
        {tab('com', 'Caractéristiques commerciales')}
      </div>
      <div style={{ padding: 12 }}>
        {onglet === 'tech' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
            {technique.map((t, i) => (
              <tr key={i} style={{ borderTop: '1px solid #EEF2F5' }}>
                <td style={{ padding: '6px 8px', fontSize: 13, color: '#374151', width: '42%' }}>{t}</td>
                <td style={{ padding: '6px 8px' }}>
                  <input type="text" disabled={verrouille} value={saisies[`${baseId}.t${i}`] ?? ''} onChange={(e) => set(`${baseId}.t${i}`, e.target.value)} style={champ} />
                </td>
              </tr>
            ))}
          </tbody></table>
        )}
        {onglet === 'equip' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#6B7280' }}>Saisissez les équipements du véhicule, un par ligne.</p>
            {Array.from({ length: nbEquipements }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1B73B0', flexShrink: 0 }} />
                <input type="text" disabled={verrouille} value={saisies[`${baseId}.e${i}`] ?? ''} onChange={(e) => set(`${baseId}.e${i}`, e.target.value)} style={champ} />
              </div>
            ))}
          </div>
        )}
        {onglet === 'com' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
            {commercial.map((c, i) => (
              <tr key={i} style={{ borderTop: '1px solid #EEF2F5' }}>
                <td style={{ padding: '6px 8px', fontSize: 13, color: '#374151', width: '42%' }}>{c}</td>
                <td style={{ padding: '6px 8px' }}>
                  <input type="text" disabled={verrouille} value={saisies[`${baseId}.c${i}`] ?? ''} onChange={(e) => set(`${baseId}.c${i}`, e.target.value)} style={champ} />
                </td>
              </tr>
            ))}
          </tbody></table>
        )}
      </div>
    </div>
  )
}

function rendreFicheProduit(a: AnnexeFicheProduit, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        <BlocFicheProduit baseId={a.id} technique={a.technique} nbEquipements={a.nbEquipements} commercial={a.commercial} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
      </div>
    </div>
  )
}

function rendreCap(a: AnnexeCap, saisies: Saisies, set: (id: string, v: string) => void, champStyle: React.CSSProperties, couleur: string) {
  const cols = [
    { id: 'mobile', label: "Mobile d'achat" },
    { id: 'carac', label: 'Caractéristique' },
    { id: 'avantage', label: 'Avantage' },
    { id: 'preuve', label: 'Preuve' },
  ]
  const lignes = Array.from({ length: a.nbLignes })
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 680 }}>
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c.id} style={{ padding: '8px 8px', fontSize: 12, fontWeight: 700, color: '#FFFFFF', background: couleur, textAlign: 'left', whiteSpace: 'nowrap' }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((_, r) => (
              <tr key={r} style={{ borderTop: '1px solid #F1F3F5' }}>
                {cols.map((c) => (
                  <td key={c.id} style={{ padding: '4px 6px' }}>
                    <input type="text" value={saisies[`${a.id}.r${r}.${c.id}`] ?? ''} onChange={(e) => set(`${a.id}.r${r}.${c.id}`, e.target.value)} style={{ ...champStyle, minWidth: 130 }} />
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

// Configurateur a branchements : etapes successives, impasse ou resultat.
// Non bloquant ; le chemin complet est enregistre. Apres le resultat, la fiche
// produit du premier vehicule est a completer.
function rendreConfigurateur(a: AnnexeConfigurateur, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  // Etat de navigation : id de l'etape courante (ou resultat / impasse).
  const [etapeId, setEtapeId] = useState<string>(a.etapes[0].id)
  const [chemin, setChemin] = useState<{ bandeau: string; choix: string }[]>([])

  const etapeCourante = a.etapes.find((e) => e.id === etapeId)
  const indexEtape = a.etapes.findIndex((e) => e.id === etapeId)
  const total = a.etapes.length

  function choisir(opt: { libelle: string; vers: string }) {
    if (verrouille) return
    const nouveau = [...chemin, { bandeau: etapeCourante?.bandeau ?? '', choix: opt.libelle }]
    setChemin(nouveau)
    setEtapeId(opt.vers)
    // Enregistre le chemin complet (lisible cote prof) + l'issue atteinte.
    const texteChemin = nouveau.map((c) => `${c.bandeau} = ${c.choix}`).join(' ; ')
    set(`${a.id}.chemin`, texteChemin)
    if (opt.vers === 'resultat') set(`${a.id}.issue`, 'Véhicules trouvés')
    else if (opt.vers === 'impasse') set(`${a.id}.issue`, 'Impasse (aucun véhicule)')
    else set(`${a.id}.issue`, 'En cours')
  }

  function recommencer() {
    if (verrouille) return
    setChemin([])
    setEtapeId(a.etapes[0].id)
    set(`${a.id}.issue`, 'En cours')
    set(`${a.id}.chemin`, '')
  }

  const recap = chemin.length > 0 && (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
      {chemin.map((c, i) => (
        <span key={i} style={{ fontSize: 11, background: '#EEF3F8', color: '#16456E', borderRadius: 14, padding: '3px 10px', fontWeight: 600 }}>
          {c.bandeau} : {c.choix}
        </span>
      ))}
    </div>
  )

  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        {/* Fenetre logiciel */}
        <div style={{ border: '1px solid #C9D6E3', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ background: '#16456E', color: '#FFFFFF', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFCC00' }} />
            Nos offres véhicules — Renault Championnet
          </div>

          {/* Barre de progression (etapes 1..N) */}
          {etapeCourante && (
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #EEF2F5', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 6 }}>
                <span>Critère {indexEtape + 1} sur {total}</span>
                <span>{etapeCourante.bandeau}</span>
              </div>
              <div style={{ height: 6, background: '#E3ECF4', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${((indexEtape + 1) / total) * 100}%`, height: '100%', background: couleur }} />
              </div>
            </div>
          )}

          <div style={{ padding: 14 }}>
            {recap}

            {/* Etape de selection */}
            {etapeCourante && (
              <>
                <div style={{ background: '#FFCC00', color: '#1F2933', fontWeight: 700, fontSize: 12, padding: '5px 10px', borderRadius: 6, display: 'inline-block', marginBottom: 10 }}>
                  {etapeCourante.bandeau}
                </div>
                <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#1F2933' }}>{etapeCourante.question}</p>
                <p style={{ margin: '0 0 10px', fontSize: 12, color: '#6B7280', fontStyle: 'italic' }}>Une seule réponse possible.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {etapeCourante.options.map((opt, i) => (
                    <button key={i} type="button" disabled={verrouille} onClick={() => choisir(opt)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', cursor: verrouille ? 'not-allowed' : 'pointer',
                      border: '1px solid #D5DBE1', borderRadius: 8, padding: '10px 12px', background: '#FFFFFF',
                      fontFamily: 'Arial, sans-serif', fontSize: 14, color: '#1F2933',
                    }}>
                      <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #B7C2CD', flexShrink: 0 }} />
                      {opt.libelle}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Impasse */}
            {etapeId === 'impasse' && (
              <div style={{ textAlign: 'center', padding: '10px 6px' }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#FBEAEA', color: '#9B2C2C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 26, fontWeight: 700 }}>!</div>
                <p style={{ margin: '0 0 14px', fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{a.impasseTexte}</p>
                <button type="button" disabled={verrouille} onClick={recommencer} style={{
                  border: 'none', borderRadius: 8, padding: '9px 18px', cursor: verrouille ? 'not-allowed' : 'pointer',
                  background: couleur, color: '#FFFFFF', fontFamily: 'Arial, sans-serif', fontSize: 13, fontWeight: 700,
                }}>Revenir aux critères</button>
              </div>
            )}

            {/* Resultat */}
            {etapeId === 'resultat' && (
              <div>
                <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#16456E' }}>{a.resultatTitre}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {a.vehicules.map((v, i) => (
                    <div key={i} style={{ flex: '1 1 220px', border: '1px solid #D9E2EC', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ background: '#EEF3F8', padding: '8px 12px', fontWeight: 700, fontSize: 14, color: '#16456E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {v.nom}
                        <span style={{ background: '#1B9E5A', color: '#FFFFFF', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>ZE</span>
                      </div>
                      <div style={{ padding: '10px 12px' }}>
                        <div style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>{v.version}</div>
                        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>{v.details}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: couleur }}>{v.prix}</div>
                        <div style={{ fontSize: 11, color: '#9AA5B1', marginTop: 4 }}>Occasion — Paris Championnet</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" disabled={verrouille} onClick={recommencer} style={{
                  marginTop: 12, border: '1px solid #C9D6E3', borderRadius: 8, padding: '7px 14px', cursor: verrouille ? 'not-allowed' : 'pointer',
                  background: '#FFFFFF', color: '#16456E', fontFamily: 'Arial, sans-serif', fontSize: 12, fontWeight: 600,
                }}>Relancer une recherche</button>
              </div>
            )}
          </div>
        </div>

        {/* Fiche produit du premier vehicule, a completer apres recherche */}
        <p style={{ margin: '16px 0 8px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>Fiche produit du premier véhicule</p>
        <BlocFicheProduit
          baseId={a.id}
          technique={['Énergie', 'Puissance fiscale', 'Transmission', 'Portes', 'Places', 'Catégorie', 'Version', 'Teinte', 'Poids à vide', 'Longueur', 'Motricité', 'Cylindrée']}
          nbEquipements={14}
          commercial={['Prix', 'Année', 'Kilométrage', 'Garantie', 'Nombre de points de contrôle', 'Assistance', 'Satisfaction', 'Contrôle']}
          saisies={saisies} set={set} verrouille={verrouille} couleur={couleur}
        />
      </div>
    </div>
  )
}

// Dialogue de vente : bulles client fixes alternees avec questions vendeur a
// saisir, chacune avec ses cases a cocher (O/F/A/CM).
function rendreDialogue(a: AnnexeDialogue, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  let qn = -1
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12, background: '#F7FAFC' }}>
        {a.tours.map((t, i) => {
          if (t.role === 'client') {
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ maxWidth: '82%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '4px 14px 14px 14px', padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9AA5B1', marginBottom: 3 }}>Client</div>
                  <div style={{ fontSize: 14, color: '#1F2933', lineHeight: 1.5 }}>{t.texte}</div>
                </div>
              </div>
            )
          }
          qn++
          const qid = `${a.id}.q${qn}`
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ maxWidth: '82%', width: '82%', background: '#EAF2FB', border: `1px solid ${couleur}`, borderRadius: '14px 4px 14px 14px', padding: '10px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: couleur, marginBottom: 4, textAlign: 'right' }}>Vendeur — votre question</div>
                <textarea disabled={verrouille} value={saisies[qid] ?? ''} onChange={(e) => set(qid, e.target.value)} rows={2} placeholder="Rédigez votre question…" style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #C9D6E3', borderRadius: 8, padding: 8, resize: 'vertical', fontFamily: 'Arial, sans-serif', fontSize: 14, color: verrouille ? '#6B7280' : '#1F2933', background: verrouille ? '#F1F3F5' : '#FFFFFF', outline: 'none' }} />
                <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end', marginTop: 6 }}>
                  {a.colonnes.map((c) => {
                    const cid = `${qid}.${c}`
                    const actif = (saisies[cid] ?? '') === '1'
                    return (
                      <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#374151', cursor: verrouille ? 'not-allowed' : 'pointer' }}>
                        <input type="checkbox" disabled={verrouille} checked={actif} onChange={(e) => set(cid, e.target.checked ? '1' : '')} />
                        {c}
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
        <div style={{ fontSize: 11, color: '#9AA5B1', textAlign: 'right' }}>O : ouverte &middot; F : fermée &middot; A : alternative &middot; CM : choix multiple</div>
      </div>
    </div>
  )
}

// Tableau SONCAS : libelle fixe + case a cocher + justification a saisir.
function rendreSonCase(a: AnnexeSonCase, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 560 }}>
          <thead>
            <tr>
              <th style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#FFFFFF', background: couleur, textAlign: 'left' }}>Typologie</th>
              <th style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#FFFFFF', background: couleur, textAlign: 'center', width: 110 }}>{a.colonneCoche}</th>
              <th style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#FFFFFF', background: couleur, textAlign: 'left' }}>{a.colonneJustif}</th>
            </tr>
          </thead>
          <tbody>
            {a.lignes.map((l) => {
              const cid = `${a.id}.${l.id}.coche`
              const actif = (saisies[cid] ?? '') === '1'
              return (
                <tr key={l.id} style={{ borderTop: '1px solid #EEF2F5' }}>
                  <td style={{ padding: '8px 10px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{l.libelle}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                    <input type="checkbox" disabled={verrouille} checked={actif} onChange={(e) => set(cid, e.target.checked ? '1' : '')} />
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <input type="text" disabled={verrouille} value={saisies[`${a.id}.${l.id}.justif`] ?? ''} onChange={(e) => set(`${a.id}.${l.id}.justif`, e.target.value)} placeholder="Phrase de M. Dupont…" style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '6px 8px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', width: '100%', boxSizing: 'border-box' }} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Identification d'objections : phrase fixe du client + menu deroulant (type).
function rendreObjections(a: AnnexeObjections, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {a.lignes.map((l, idx) => (
          <div key={l.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid #E2E8F0', borderRadius: 10, padding: 12, background: '#FFFFFF' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: couleur, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{idx + 1}</span>
              <div style={{ fontSize: 14, color: '#1F2933', fontStyle: 'italic', lineHeight: 1.5 }}>« {l.phrase} »</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 34 }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>Type :</span>
              <select disabled={verrouille} value={saisies[`${a.id}.${l.id}`] ?? ''} onChange={(e) => set(`${a.id}.${l.id}`, e.target.value)} style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '6px 10px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933' }}>
                <option value="">— Choisir —</option>
                {a.options.map((o) => (<option key={o} value={o}>{o}</option>))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Traitement d'objections : objection fixe + technique imposee + reponse a saisir.
function rendreTraitObjections(a: AnnexeTraitObjections, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {a.lignes.map((l, idx) => (
          <div key={l.id} style={{ border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#F7FAFC', borderBottom: '1px solid #EEF2F5' }}>
              <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: couleur, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{idx + 1}</span>
              <div style={{ flex: 1, fontSize: 14, color: '#1F2933', fontStyle: 'italic' }}>« {l.objection} »</div>
              <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#16456E', background: '#FFCC00', borderRadius: 14, padding: '4px 10px' }}>{l.technique}</span>
            </div>
            <div style={{ padding: 12 }}>
              <textarea disabled={verrouille} value={saisies[`${a.id}.${l.id}`] ?? ''} onChange={(e) => set(`${a.id}.${l.id}`, e.target.value)} rows={3} placeholder={`Traitez l'objection avec la technique « ${l.technique} »…`} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #C9D6E3', borderRadius: 8, padding: 10, resize: 'vertical', fontFamily: 'Arial, sans-serif', fontSize: 14, color: verrouille ? '#6B7280' : '#1F2933', background: verrouille ? '#F1F3F5' : '#FFFFFF', outline: 'none' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Coeur du simulateur : accueil -> questions a branchements -> resultat.
// Etat de navigation interne ; le chemin et l'issue sont remontes via set().
function BlocSimulateur({ a, set, verrouille, couleur, plein }: {
  a: AnnexeSimulateur
  set: (id: string, v: string) => void
  verrouille: boolean
  couleur: string
  plein?: boolean
}) {
  const [ecran, setEcran] = useState<string>('intro')
  const [chemin, setChemin] = useState<{ bandeau: string; choix: string }[]>([])

  const etape = a.etapes.find((e) => e.id === ecran)
  const resultat = a.resultats.find((r) => r.id === ecran)
  const indexEtape = a.etapes.findIndex((e) => e.id === ecran)

  function choisir(opt: { libelle: string; vers: string }) {
    if (verrouille) return
    const nouveau = [...chemin, { bandeau: etape?.bandeau ?? '', choix: opt.libelle }]
    setChemin(nouveau)
    setEcran(opt.vers)
    set(`${a.id}.chemin`, nouveau.map((c) => `${c.bandeau} = ${c.choix}`).join(' ; '))
    const res = a.resultats.find((r) => r.id === opt.vers)
    if (res) set(`${a.id}.issue`, res.type === 'ok' ? 'Éligible' : 'Non éligible')
  }
  function recommencer() {
    if (verrouille) return
    setChemin([]); setEcran('intro'); set(`${a.id}.chemin`, ''); set(`${a.id}.issue`, '')
  }

  const numEtape = indexEtape >= 0 ? indexEtape + 1 : 1
  const showProg = !!etape || !!resultat

  return (
    <div style={{ border: '1px solid #C9D6E3', borderRadius: 12, overflow: 'hidden', background: '#FFFFFF', maxWidth: plein ? 480 : '100%', margin: plein ? '0 auto' : undefined }}>
      <div style={{ background: '#16456E', color: '#FFFFFF', padding: '11px 14px', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFCC00' }} />
        Prime à la conversion — Test d'éligibilité
      </div>

      {showProg && (
        <div style={{ padding: '11px 14px', borderBottom: '1px solid #EEF2F5', background: '#F8FAFC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 6 }}>
            <span>{resultat ? 'Résultat' : `Étape ${numEtape} sur ${a.nbEtapesAffiche}`}</span>
            <span>{resultat ? 'ÉLIGIBILITÉ' : etape?.bandeau}</span>
          </div>
          <div style={{ height: 6, background: '#E3ECF4', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: resultat ? '100%' : `${Math.min(100, (numEtape / a.nbEtapesAffiche) * 100)}%`, height: '100%', background: couleur }} />
          </div>
        </div>
      )}

      <div style={{ padding: 18 }}>
        {/* Accueil */}
        {ecran === 'intro' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg,#3FA9E0,#2E8BC0)', borderRadius: 10, padding: 22, textAlign: 'center', color: '#FFFFFF', marginBottom: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Testez votre éligibilité</div>
              <div style={{ fontSize: 15, fontStyle: 'italic' }}>… en {a.nbEtapesAffiche} étapes maximum</div>
            </div>
            <h3 style={{ fontSize: 19, color: '#16456E', margin: '0 0 10px' }}>{a.introTitre}</h3>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 14 }}>{a.introTexte}</p>
            <button type="button" disabled={verrouille} onClick={() => setEcran(a.etapes[0].id)} style={{ background: couleur, color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: verrouille ? 'not-allowed' : 'pointer', fontFamily: 'Arial, sans-serif' }}>
              {a.introBouton} &nbsp;→
            </button>
          </div>
        )}

        {/* Question */}
        {etape && (
          <div>
            <div style={{ background: '#FFCC00', color: '#1F2933', fontWeight: 700, fontSize: 12, padding: '6px 12px', borderRadius: 6, display: 'inline-block', marginBottom: 12 }}>{etape.bandeau}</div>
            <p style={{ fontSize: 16, fontWeight: 700, margin: '2px 0 4px' }}>{etape.question}</p>
            <p style={{ fontSize: 12, color: '#6B7280', fontStyle: 'italic', marginBottom: 14 }}>Une seule réponse possible.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {etape.options.map((opt, i) => (
                <button key={i} type="button" disabled={verrouille} onClick={() => choisir(opt)} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', cursor: verrouille ? 'not-allowed' : 'pointer', border: '1px solid #D5DBE1', borderRadius: 8, padding: '12px 13px', background: '#FFFFFF', fontFamily: 'Arial, sans-serif', fontSize: 14, color: '#1F2933' }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #B7C2CD', flexShrink: 0 }} />
                  {opt.libelle}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resultat */}
        {resultat && (
          <div style={{ textAlign: 'center', padding: '10px 4px' }}>
            <div style={{ width: 58, height: 58, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, margin: '0 auto 14px', background: resultat.type === 'ok' ? '#E4F6EC' : '#FBEAEA', color: resultat.type === 'ok' ? '#1B7F4B' : '#9B2C2C' }}>
              {resultat.type === 'ok' ? '✓' : '!'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: resultat.type === 'ok' ? '#1B7F4B' : '#9B2C2C', marginBottom: 6 }}>
              {resultat.type === 'ok' ? 'Bonne nouvelle !' : 'Non éligible'}
            </div>
            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{resultat.texte}</div>
            <button type="button" disabled={verrouille} onClick={recommencer} style={{ marginTop: 14, background: '#FFFFFF', color: '#16456E', border: '1px solid #C9D6E3', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: verrouille ? 'not-allowed' : 'pointer', fontFamily: 'Arial, sans-serif' }}>↻ Recommencer le test</button>
            {chemin.length > 0 && (
              <div style={{ marginTop: 14, padding: '10px 12px', background: '#F5F9FC', borderRadius: 8, fontSize: 12, color: '#4B5563', lineHeight: 1.6, textAlign: 'left' }}>
                <b style={{ color: '#16456E' }}>Chemin suivi :</b><br />
                {chemin.map((c, i) => <span key={i}>{c.bandeau} : {c.choix}<br /></span>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function rendreSimulateur(a: AnnexeSimulateur, _saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  return <SimulateurAvecAgrandir a={a} set={set} verrouille={verrouille} couleur={couleur} />
}

// Enveloppe : affiche le simulateur inline + un bouton pour l'ouvrir en plein ecran.
function SimulateurAvecAgrandir({ a, set, verrouille, couleur }: {
  a: AnnexeSimulateur
  set: (id: string, v: string) => void
  verrouille: boolean
  couleur: string
}) {
  const [plein, setPlein] = useState(false)
  useEffect(() => {
    if (!plein) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPlein(false) }
    window.addEventListener('keydown', onKey)
    const ancien = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ancien }
  }, [plein])

  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span>{a.titre}</span>
        <button type="button" onClick={() => setPlein(true)} title="Agrandir le test" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #C9D6E3', background: '#FFFFFF', color: '#16456E', borderRadius: 7, padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16456E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          Agrandir
        </button>
      </div>
      <div style={{ padding: 12 }}>
        <BlocSimulateur a={a} set={set} verrouille={verrouille} couleur={couleur} />
      </div>

      {plein && (
        <div onClick={() => setPlein(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,32,0.88)', display: 'flex', flexDirection: 'column', padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button type="button" onClick={() => setPlein(false)} title="Fermer" style={{ width: 44, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer', background: '#FFFFFF', color: '#9B2C2C', fontSize: 18, fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>✕</button>
          </div>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, margin: '0 auto' }}>
            <BlocSimulateur a={a} set={set} verrouille={verrouille} couleur={couleur} plein />
          </div>
          <div onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 12, padding: '12px 0' }}>Échap ou clic sur le fond pour fermer.</div>
        </div>
      )}
    </div>
  )
}

const ILLUSTRATIONS_ACCESSOIRES: Record<string, string> = {
  sacbagoto: `<defs><linearGradient id="sb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD43B"/><stop offset="1" stop-color="#E5A800"/></linearGradient></defs> <path d="M50 44 h60 l-6 36 a6 6 0 0 1 -6 5 h-36 a6 6 0 0 1 -6 -5 z" fill="url(#sb)" stroke="#C28E00" stroke-width="2"/> <path d="M66 44 v-6 a14 14 0 0 1 28 0 v6" fill="none" stroke="#5A4A1A" stroke-width="4"/> <rect x="70" y="56" width="20" height="14" rx="2" fill="#fff" opacity=".7"/><path d="M74 63 l4 4 8-9" stroke="#E5A800" stroke-width="3" fill="none"/>`,
  stylorenaultb: `<defs><linearGradient id="sp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#16456E"/><stop offset="1" stop-color="#0E2E4A"/></linearGradient></defs> <g transform="rotate(35 80 48)"><rect x="74" y="12" width="12" height="64" rx="6" fill="url(#sp)"/><polygon points="74,12 86,12 80,2" fill="#C2CCD6"/><circle cx="80" cy="6" r="2" fill="#7A8694"/><rect x="74" y="56" width="12" height="7" fill="#FFD43B"/><rect x="76" y="30" width="8" height="3" rx="1" fill="#9AA5B1"/></g>`,
  extincteur2kg: `<defs><linearGradient id="ex2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E63329"/><stop offset="1" stop-color="#B81E16"/></linearGradient></defs> <rect x="62" y="26" width="36" height="56" rx="11" fill="url(#ex2)"/><rect x="68" y="16" width="24" height="12" rx="3" fill="#3A3A3A"/><rect x="54" y="22" width="14" height="6" rx="2" fill="#222"/><circle cx="100" cy="26" r="5" fill="#DDE3E8" stroke="#888" stroke-width="2"/><line x1="100" y1="26" x2="103" y2="23" stroke="#E63329" stroke-width="2"/><rect x="68" y="40" width="24" height="26" rx="3" fill="#fff" opacity=".88"/><text x="80" y="57" font-size="12" fill="#B81E16" text-anchor="middle" font-family="Arial" font-weight="bold">2kg</text>`,
  fixationmaster: `<rect x="56" y="40" width="48" height="12" rx="3" fill="#5A6470"/><rect x="56" y="58" width="48" height="12" rx="3" fill="#5A6470"/><circle cx="64" cy="46" r="3" fill="#C2CCD6"/><circle cx="96" cy="46" r="3" fill="#C2CCD6"/><circle cx="64" cy="64" r="3" fill="#C2CCD6"/><circle cx="96" cy="64" r="3" fill="#C2CCD6"/><rect x="74" y="34" width="12" height="42" rx="3" fill="#E63329"/>`,
  etuiip6: `<defs><linearGradient id="et" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A2F3A"/><stop offset="1" stop-color="#11151C"/></linearGradient></defs> <rect x="60" y="20" width="40" height="60" rx="8" fill="url(#et)" stroke="#3A4250" stroke-width="2"/><pattern id="dia" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="#3D4654" stroke-width="2"/></pattern><rect x="60" y="20" width="40" height="60" rx="8" fill="url(#dia)"/><circle cx="80" cy="30" r="3" fill="#1A1E26"/>`,
  stickerslignes: `<rect x="44" y="40" width="72" height="34" rx="6" fill="#2A2F3A"/><path d="M44 64 q36 -18 72 0" fill="none" stroke="#fff" stroke-width="4"/><path d="M44 54 q36 -16 72 0" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/><circle cx="58" cy="70" r="5" fill="#11151C"/><circle cx="102" cy="70" r="5" fill="#11151C"/>`,
  stickersvintage: `<rect x="44" y="40" width="72" height="34" rx="6" fill="#F2C200"/><path d="M44 50 h72 M44 58 h72 M44 66 h72" stroke="#B88A00" stroke-width="3"/><circle cx="58" cy="74" r="5" fill="#3A3A3A"/><circle cx="102" cy="74" r="5" fill="#3A3A3A"/>`,
  oursonalpine: `<defs><radialGradient id="ou" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stop-color="#3FA9E0"/><stop offset="1" stop-color="#1E6FA8"/></radialGradient></defs> <circle cx="62" cy="30" r="9" fill="url(#ou)"/><circle cx="98" cy="30" r="9" fill="url(#ou)"/><circle cx="80" cy="48" r="24" fill="url(#ou)"/><circle cx="72" cy="44" r="3.5" fill="#fff"/><circle cx="88" cy="44" r="3.5" fill="#fff"/><circle cx="72" cy="45" r="1.6" fill="#11151C"/><circle cx="88" cy="45" r="1.6" fill="#11151C"/><circle cx="80" cy="52" r="4" fill="#11151C"/><path d="M72 58 q8 6 16 0" stroke="#11151C" stroke-width="2.5" fill="none"/>`,
  portecleslosange: `<circle cx="66" cy="42" r="16" fill="none" stroke="#C9A24B" stroke-width="6"/><circle cx="66" cy="42" r="6" fill="#E8C77A"/><g transform="rotate(40 92 52)"><rect x="84" y="48" width="34" height="10" rx="5" fill="#9AA5B1"/><polygon points="118,46 118,60 130,56 130,50" fill="#FFD43B" stroke="#C28E00" stroke-width="1.5"/></g>`,
  kitalpine: `<rect x="52" y="34" width="56" height="40" rx="5" fill="#11151C" stroke="#3A4250" stroke-width="2"/><circle cx="68" cy="46" r="4" fill="#E63329"/><circle cx="82" cy="46" r="4" fill="#FFD43B"/><rect x="62" y="58" width="36" height="6" rx="2" fill="#2E8BC0"/><text x="80" y="74" font-size="8" fill="#9AA5B1" text-anchor="middle" font-family="Arial">ALPINE</text>`,
  kitsecurite: `<polygon points="104,22 126,66 82,66" fill="none" stroke="#E63329" stroke-width="7" stroke-linejoin="round"/><path d="M40 44 h34 v30 a4 4 0 0 1 -4 4 h-26 a4 4 0 0 1 -4 -4 z" fill="#F2C200" stroke="#C28E00" stroke-width="2"/><path d="M46 44 v-6 a11 11 0 0 1 22 0 v6" fill="none" stroke="#F2C200" stroke-width="5"/><rect x="46" y="52" width="22" height="4" rx="2" fill="#fff"/><rect x="46" y="60" width="22" height="4" rx="2" fill="#fff"/>`,
  pinslosange: `<defs><linearGradient id="pin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8E8E8"/><stop offset="1" stop-color="#9AA5B1"/></linearGradient></defs> <polygon points="80,28 98,48 80,68 62,48" fill="url(#pin)" stroke="#7A8694" stroke-width="2"/><polygon points="80,36 90,48 80,60 70,48" fill="#C2CCD6"/>`,
  tasserenaultb: `<path d="M54 34 h40 v26 a16 16 0 0 1 -16 16 h-8 a16 16 0 0 1 -16 -16 z" fill="#fff" stroke="#C2CCD6" stroke-width="3"/><path d="M94 40 h9 a8 8 0 0 1 0 16 h-9" fill="none" stroke="#C2CCD6" stroke-width="3"/><rect x="54" y="60" width="40" height="16" rx="2" fill="#2A2F3A"/><rect x="58" y="28" width="32" height="6" rx="3" fill="#16456E"/>`,
  batterierenaultb: `<defs><linearGradient id="bat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A2F3A"/><stop offset="1" stop-color="#14181F"/></linearGradient></defs> <rect x="54" y="44" width="52" height="22" rx="6" fill="url(#bat)"/><rect x="60" y="50" width="30" height="10" rx="2" fill="#2E8BC0"/><path d="M70 52 l-3 4 h4 l-3 4" stroke="#fff" stroke-width="1.6" fill="none"/><path d="M106 50 q12 -10 14 4 q2 12 -10 12" fill="none" stroke="#C2CCD6" stroke-width="3"/>`,
  rechargeparfum: `<rect x="64" y="30" width="32" height="46" rx="6" fill="#8BC34A" opacity=".85"/><rect x="70" y="22" width="20" height="10" rx="2" fill="#5A8A2A"/><rect x="74" y="14" width="12" height="8" rx="2" fill="#3F6B1A"/><path d="M80 40 q-8 8 0 16 q8 -8 0 -16" fill="#fff" opacity=".6"/>`,
  portecles: `<circle cx="62" cy="46" r="14" fill="none" stroke="#9AA5B1" stroke-width="5"/><rect x="74" y="40" width="44" height="14" rx="7" fill="#16456E"/><polygon points="92,40 108,40 100,54" fill="#FFD43B"/><text x="98" y="51" font-size="7" fill="#fff" text-anchor="middle" font-family="Arial" font-weight="bold">RS</text>`,
  stylo: `<defs><linearGradient id="st2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2A2F3A"/><stop offset="1" stop-color="#11151C"/></linearGradient></defs> <g transform="rotate(40 80 48)"><rect x="72" y="10" width="16" height="68" rx="8" fill="url(#st2)"/><polygon points="72,10 88,10 80,0" fill="#C2CCD6"/><rect x="72" y="52" width="16" height="8" fill="#FFD43B"/><text x="80" y="44" font-size="6" fill="#fff" text-anchor="middle" font-family="Arial" transform="rotate(90 80 44)">RENAULT SPORT</text></g>`,
  extincteur1kg: `<defs><linearGradient id="ex1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E63329"/><stop offset="1" stop-color="#B81E16"/></linearGradient></defs> <rect x="66" y="32" width="28" height="48" rx="9" fill="url(#ex1)"/><rect x="71" y="22" width="18" height="10" rx="3" fill="#3A3A3A"/><circle cx="96" cy="32" r="4" fill="#DDE3E8" stroke="#888" stroke-width="1.6"/><rect x="71" y="44" width="18" height="22" rx="3" fill="#fff" opacity=".88"/><text x="80" y="59" font-size="10" fill="#B81E16" text-anchor="middle" font-family="Arial" font-weight="bold">1kg</text>`,
  stickerssecu: `<rect x="44" y="42" width="72" height="20" rx="3" fill="#fff" stroke="#C2CCD6" stroke-width="2"/><g fill="#E63329"><polygon points="48,42 58,42 48,62"/><polygon points="64,42 74,42 64,62"/><polygon points="80,42 90,42 80,62"/><polygon points="96,42 106,42 96,62"/></g><rect x="44" y="62" width="72" height="6" fill="#F2C200"/>`,
  styloblancf1: `<g transform="rotate(40 80 48)"><rect x="74" y="12" width="12" height="64" rx="6" fill="#fff" stroke="#C2CCD6" stroke-width="2"/><polygon points="74,12 86,12 80,3" fill="#9AA5B1"/><rect x="74" y="40" width="12" height="14" fill="#16456E"/><rect x="74" y="56" width="12" height="5" fill="#E63329"/></g>`,
  stickercartecle: `<rect x="56" y="28" width="48" height="60" rx="8" fill="#2A2F3A" stroke="#3A4250" stroke-width="2"/><circle cx="72" cy="46" r="4" fill="#444"/><circle cx="88" cy="46" r="4" fill="#444"/><polygon points="80,58 92,70 80,82 68,70" fill="#11151C" stroke="#4A5160" stroke-width="1.5"/><polygon points="80,64 86,70 80,76 74,70" fill="#2A2F3A"/>`,
  coquetwingo: `<rect x="58" y="22" width="44" height="62" rx="9" fill="#3FA9E0"/><rect x="64" y="30" width="32" height="40" rx="3" fill="#FFD43B"/><circle cx="80" cy="50" r="10" fill="#E63329"/><path d="M80 44 a6 6 0 0 1 0 12" fill="#fff"/><rect x="72" y="76" width="16" height="3" rx="1.5" fill="#1E6FA8"/>`,
}

// Catalogue d'accessoires facon site marchand : compteur, recherche, filtres
// par categorie, grille de produits cliquables. L'eleve selectionne un produit
// et saisit une justification.
function rendreCatalogue(a: AnnexeCatalogue, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  return <BlocCatalogue a={a} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
}

function BlocCatalogue({ a, saisies, set, verrouille, couleur }: {
  a: AnnexeCatalogue
  saisies: Saisies
  set: (id: string, v: string) => void
  verrouille: boolean
  couleur: string
}) {
  const [cat, setCat] = useState<string>(a.categories[0] ?? 'Tous')
  const [recherche, setRecherche] = useState('')
  const choix = saisies[`${a.id}.choix`] ?? ''

  const filtres = a.produits.filter((p) => {
    const okCat = cat === 'Tous' || cat === a.categories[0] ? true : p.categorie === cat
    const okRech = recherche.trim().length === 0 || p.nom.toLowerCase().includes(recherche.toLowerCase())
    return okCat && okRech
  })
  const prodChoisi = a.produits.find((p) => p.id === choix)

  // Illustration vectorielle propre a chaque produit (pas de photo : reseau bloque).
  const vignette = (p: ProduitCatalogue) => (
    <svg width="100%" height="92" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      <rect width="160" height="100" fill="#F4F7FA" />
      <g dangerouslySetInnerHTML={{ __html: ILLUSTRATIONS_ACCESSOIRES[p.id] ?? '' }} />
    </svg>
  )

  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        {/* Fenetre logiciel */}
        <div style={{ border: '1px solid #C9D6E3', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ background: '#16456E', color: '#FFFFFF', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFCC00' }} />
            RRG — Trouver mes accessoires
          </div>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #EEF2F5', display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#1F2933' }}>{a.compteurAffiche}</span>
            <span style={{ fontSize: 13, color: '#6B7280' }}>accessoires disponibles</span>
          </div>

          <div style={{ display: 'flex', gap: 0, minHeight: 320 }}>
            {/* Filtres */}
            <div style={{ width: 190, flexShrink: 0, borderRight: '1px solid #EEF2F5', background: '#F8FAFC', padding: 10 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                <input type="text" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher…" disabled={verrouille} style={{ flex: 1, minWidth: 0, fontFamily: 'Arial, sans-serif', fontSize: 12, padding: '6px 8px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF' }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9AA5B1', textTransform: 'uppercase', marginBottom: 6 }}>Filtres</div>
              {a.categories.map((c) => (
                <button key={c} type="button" onClick={() => setCat(c)} style={{
                  display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                  background: cat === c ? '#FFFFFF' : 'transparent', borderLeft: cat === c ? `3px solid ${couleur}` : '3px solid transparent',
                  padding: '8px 10px', fontFamily: 'Arial, sans-serif', fontSize: 12, fontWeight: cat === c ? 700 : 400, color: cat === c ? '#16456E' : '#4B5563',
                }}>{c}</button>
              ))}
            </div>

            {/* Grille produits */}
            <div style={{ flex: 1, padding: 12, minWidth: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                {filtres.map((p) => {
                  const sel = choix === p.id
                  return (
                    <button key={p.id} type="button" disabled={verrouille} onClick={() => set(`${a.id}.choix`, p.id)} style={{
                      textAlign: 'left', cursor: verrouille ? 'not-allowed' : 'pointer', padding: 0, overflow: 'hidden',
                      border: sel ? `2px solid ${couleur}` : '1px solid #E2E8F0', borderRadius: 10, background: '#FFFFFF',
                      boxShadow: sel ? '0 2px 10px rgba(22,69,110,0.18)' : 'none',
                    }}>
                      {vignette(p)}
                      <div style={{ padding: '8px 10px' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1F2933', lineHeight: 1.3, minHeight: 32 }}>{p.nom}</div>
                        <div style={{ fontSize: 11, color: '#9AA5B1', margin: '2px 0 6px' }}>{p.categorie}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: couleur }}>{p.prix}</div>
                        {sel && <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: '#1B7F4B' }}>✓ Sélectionné</div>}
                      </div>
                    </button>
                  )
                })}
              </div>
              {filtres.length === 0 && <div style={{ fontSize: 13, color: '#6B7280', padding: 12 }}>Aucun accessoire ne correspond à votre recherche.</div>}
            </div>
          </div>
        </div>

        {/* Selection + justification */}
        <div style={{ marginTop: 12, border: '1px solid #DCE8F4', borderRadius: 10, padding: 12, background: '#F8FAFC' }}>
          <div style={{ fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: '#6B7280' }}>Accessoire proposé : </span>
            <span style={{ fontWeight: 700, color: '#16456E' }}>{prodChoisi ? `${prodChoisi.nom} — ${prodChoisi.prix}` : 'aucun (sélectionnez un accessoire ci-dessus)'}</span>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>{a.demandeJustif}</div>
          <textarea disabled={verrouille} value={saisies[`${a.id}.justif`] ?? ''} onChange={(e) => set(`${a.id}.justif`, e.target.value)} rows={3} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #C9D6E3', borderRadius: 8, padding: 10, resize: 'vertical', fontFamily: 'Arial, sans-serif', fontSize: 14, color: verrouille ? '#6B7280' : '#1F2933', background: verrouille ? '#F1F3F5' : '#FFFFFF', outline: 'none' }} />
        </div>
      </div>
    </div>
  )
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
                {a.colonnes.map((_, ci) => {
                  const fixe = a.prerempli?.[r]?.[ci]
                  if (fixe) {
                    return <td key={ci} style={{ padding: '8px 8px', fontSize: 13, fontWeight: 700, color: '#1F2933', background: '#F7F9FB' }}>{fixe}</td>
                  }
                  return (
                    <td key={ci} style={{ padding: '4px 6px' }}>
                      <input type="text" value={saisies[`${a.id}.r${r}.c${ci}`] ?? ''} onChange={(e) => set(`${a.id}.r${r}.c${ci}`, e.target.value)} style={{ ...champStyle, minWidth: 100 }} />
                    </td>
                  )
                })}
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
        {a.boutonLien && (
          <a href={a.boutonLien} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
            background: '#16456E', color: '#FFFFFF', borderRadius: 8, padding: '9px 16px',
            fontSize: 13, fontWeight: 700, marginBottom: 12,
          }}>
            <span style={{ display: 'inline-flex', width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>▶</span>
            {a.boutonLibelle ?? 'Ouvrir le lien'}
          </a>
        )}
        <textarea value={saisies[`${a.id}.texte`] ?? ''} onChange={(e) => set(`${a.id}.texte`, e.target.value)} rows={a.lignes ?? 3} style={{ ...champStyle, resize: 'vertical', fontSize: 14, padding: 10 }} />
      </div>
    </div>
  )
}

// Formulaire facon logiciel de gestion : fiche avec champs labellises.
function rendreFormulaire(a: AnnexeFormulaire, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 14,
    padding: '8px 10px', borderRadius: 6, border: '1px solid #C9D6E3',
    background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none',
  }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: 2, background: 'rgba(255,255,255,0.5)' }} />
        {a.entete ?? a.titre}
      </div>
      <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {a.champs.map((c) => (
          <div key={c.cle} style={{ gridColumn: c.aire ? '1 / -1' : undefined }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>{c.libelle}</label>
            {c.aire ? (
              <textarea value={saisies[`${a.id}.${c.cle}`] ?? ''} onChange={(e) => set(`${a.id}.${c.cle}`, e.target.value)} rows={2} disabled={verrouille} style={{ ...champ, resize: 'vertical' }} />
            ) : (
              <input value={saisies[`${a.id}.${c.cle}`] ?? ''} onChange={(e) => set(`${a.id}.${c.cle}`, e.target.value)} disabled={verrouille} style={champ} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Module de saisie geographique : lignes ville + departement (menu deroulant),
// ajout/suppression de lignes, facon logiciel de gestion de secteur commercial.
function rendreSaisieGeo(a: AnnexeSaisieGeo, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const nbStocke = parseInt(saisies[`${a.id}.nb`] ?? '', 10)
  const nb = Number.isFinite(nbStocke) && nbStocke > 0 ? nbStocke : (a.nbLignesInitiales ?? 8)
  const champ: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif', fontSize: 14, padding: '7px 9px', borderRadius: 6,
    border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF',
    color: verrouille ? '#6B7280' : '#1F2933', outline: 'none', boxSizing: 'border-box',
  }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700 }}>{a.entete ?? a.titre}</div>
      <div style={{ padding: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 8, marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4B5563' }}>
          <div>Ville</div><div>Département</div>
        </div>
        {Array.from({ length: nb }).map((_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 8, marginBottom: 6 }}>
            <input value={saisies[`${a.id}.ville${i}`] ?? ''} onChange={(e) => set(`${a.id}.ville${i}`, e.target.value)} disabled={verrouille} placeholder={`Ville ${i + 1}`} style={champ} />
            <select value={saisies[`${a.id}.dep${i}`] ?? ''} onChange={(e) => set(`${a.id}.dep${i}`, e.target.value)} disabled={verrouille} style={champ}>
              <option value="">--</option>
              {a.departements.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        ))}
        {!verrouille && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => set(`${a.id}.nb`, String(nb + 1))} style={{ border: `1px solid ${couleur}`, color: couleur, background: '#FFFFFF', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Ajouter une ville</button>
            {nb > 1 && <button type="button" onClick={() => set(`${a.id}.nb`, String(nb - 1))} style={{ border: '1px solid #C9D6E3', color: '#6B7280', background: '#FFFFFF', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>- Retirer</button>}
          </div>
        )}
      </div>
    </div>
  )
}

// Gabarit de courrier postal (publipostage) facon traitement de texte.
function rendreCourrier(a: AnnexeCourrier, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '6px 8px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', boxSizing: 'border-box', outline: 'none' }
  const z = (cle: string, ph: string, rows = 1, w = '100%') => rows > 1
    ? <textarea value={saisies[`${a.id}.${cle}`] ?? ''} onChange={(e) => set(`${a.id}.${cle}`, e.target.value)} disabled={verrouille} placeholder={ph} rows={rows} style={{ ...champ, width: w, resize: 'vertical' }} />
    : <input value={saisies[`${a.id}.${cle}`] ?? ''} onChange={(e) => set(`${a.id}.${cle}`, e.target.value)} disabled={verrouille} placeholder={ph} style={{ ...champ, width: w }} />
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700 }}>Courrier — publipostage</div>
      <div style={{ padding: 16, background: '#FFFFFF' }}>
        <div style={{ marginBottom: 10 }}>{z('dest', 'Destinataire (nom, adresse, ville)', 3, '60%')}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>{z('lieudate', 'Lieu, le [date]', 1, '40%')}</div>
        <div style={{ marginBottom: 10 }}>{z('objet', 'Objet : ...', 1, '70%')}</div>
        <div style={{ marginBottom: 10 }}>{z('corps', 'Corps du courrier...', 8)}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{z('signature', 'Signature', 1, '40%')}</div>
      </div>
    </div>
  )
}

// Fiche d'appel CROC : 4 zones a rediger.
function rendreCroc(a: AnnexeCroc, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '8px 10px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none', resize: 'vertical' }
  const etapes: [string, string][] = [['contact', 'Contact'], ['raison', "Raison d'appel"], ['objectif', 'Objectif'], ['conclusion', 'Conclusion']]
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700 }}>FICHE D'APPEL — Méthode CROC</div>
      <div style={{ padding: 14 }}>
        {etapes.map(([cle, label]) => (
          <div key={cle} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: couleur, marginBottom: 4 }}>{label}</div>
            <textarea value={saisies[`${a.id}.${cle}`] ?? ''} onChange={(e) => set(`${a.id}.${cle}`, e.target.value)} disabled={verrouille} rows={2} style={champ} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Fiche contact / prospect facon CRM : sections a completer.
// Tableau de gestion des appels facon logiciel : en-tetes groupes sur 2 niveaux.
function rendreTableauAppels(a: AnnexeTableauAppels, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 12, padding: '5px 6px', borderRadius: 4, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none' }
  const th: React.CSSProperties = { background: couleur, color: '#FFFFFF', fontSize: 11, fontWeight: 700, padding: '6px 6px', border: '1px solid #FFFFFF', textAlign: 'center' }
  const cols = ['Interlocuteur / fonction', 'Téléphone', '1er appel', '2ème appel', 'Rdv (date)', 'Envoi Oui', 'Envoi Non', 'Rappeler + tard', 'Raisons', 'Refus (causes)']
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700 }}>{a.entete ?? a.titre}</div>
      <div style={{ padding: 8, overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: 1000 }}>
          <thead>
            <tr>
              <th style={{ ...th, minWidth: 150 }}>Organisation et adresse</th>
              {cols.map((c) => <th key={c} style={{ ...th, minWidth: 90 }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {a.organisations.map((org, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #DCE8F4', padding: '4px 8px', fontSize: 12, fontWeight: 700, color: '#1F2933', background: '#F7F9FB' }}>{org}</td>
                {cols.map((_, cj) => (
                  <td key={cj} style={{ border: '1px solid #DCE8F4', padding: 3 }}>
                    <input value={saisies[`${a.id}.l${i}c${cj}`] ?? ''} onChange={(e) => set(`${a.id}.l${i}c${cj}`, e.target.value)} disabled={verrouille} style={champ} />
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

// Agenda hebdomadaire facon logiciel de prise de rendez-vous.
function rendreAgenda(a: AnnexeAgenda, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 12, padding: '4px 5px', borderRadius: 4, border: '1px solid #E2E8F0', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none' }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>📅 {a.entete ?? a.titre}</div>
      <div style={{ padding: 8, overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: 600, width: '100%' }}>
          <thead>
            <tr>
              <th style={{ background: '#F0F3F6', border: '1px solid #DCE8F4', padding: '6px', fontSize: 11, width: 50 }}></th>
              {a.jours.map((j) => <th key={j} style={{ background: couleur, color: '#FFFFFF', border: '1px solid #FFFFFF', padding: '6px 8px', fontSize: 12, fontWeight: 700 }}>{j}</th>)}
            </tr>
          </thead>
          <tbody>
            {a.creneaux.map((cr, ri) => (
              <tr key={cr}>
                <td style={{ background: '#F7F9FB', border: '1px solid #DCE8F4', padding: '4px 6px', fontSize: 11, fontWeight: 700, color: '#6B7280', textAlign: 'center' }}>{cr}</td>
                {a.jours.map((_, cj) => (
                  <td key={cj} style={{ border: '1px solid #E2E8F0', padding: 2 }}>
                    <input value={saisies[`${a.id}.j${cj}h${ri}`] ?? ''} onChange={(e) => set(`${a.id}.j${cj}h${ri}`, e.target.value)} disabled={verrouille} style={champ} />
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

// Editeur de redaction d'oral facon traitement de texte : sections guidees.
function rendreRedactionOral(a: AnnexeRedactionOral, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 14, padding: '8px 10px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none', resize: 'vertical', lineHeight: 1.5 }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>📝 {a.titre}</div>
      <div style={{ padding: 14 }}>
        {a.boutonLien && (
          <a href={a.boutonLien} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: '#FFFFFF', color: couleur, border: `1px solid ${couleur}`, borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 700, marginBottom: 14 }}>↗ {a.boutonLibelle ?? 'Ouvrir la ressource'}</a>
        )}
        {a.sections.map((s) => (
          <div key={s.cle} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#1F2933', marginBottom: 2 }}>{s.libelle}</div>
            {s.aide && <div style={{ fontSize: 12, color: '#9AA5B1', fontStyle: 'italic', marginBottom: 5 }}>{s.aide}</div>}
            <textarea value={saisies[`${a.id}.${s.cle}`] ?? ''} onChange={(e) => set(`${a.id}.${s.cle}`, e.target.value)} disabled={verrouille} rows={s.lignes ?? 3} style={champ} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Fiche technique produit facon logiciel a onglets : onglets = sections,
// lignes a completer. L'eleve choisit l'onglet puis remplit les lignes.
function rendreFicheTechnique(a: AnnexeFicheTechnique, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const actif = saisies[`${a.id}.__onglet`] || a.sections[0]?.nom
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 14, padding: '8px 10px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none' }
  const section = a.sections.find((s) => s.nom === actif) ?? a.sections[0]
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>🛠️ {a.titre}</div>
      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', padding: '8px 8px 0', background: '#F7F9FB', borderBottom: '1px solid #E2E8F0' }}>
        {a.sections.map((s) => {
          const on = s.nom === actif
          return <button key={s.nom} onClick={() => set(`${a.id}.__onglet`, s.nom)} style={{ border: 'none', borderRadius: '6px 6px 0 0', padding: '8px 14px', fontSize: 13, fontWeight: on ? 800 : 600, cursor: 'pointer', background: on ? '#FFFFFF' : 'transparent', color: on ? couleur : '#6B7280', borderBottom: on ? `2px solid ${couleur}` : '2px solid transparent' }}>{s.nom}</button>
        })}
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {section?.lignes.map((l) => (
          <div key={l.cle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ minWidth: 26, height: 26, borderRadius: 6, background: '#EEF3F8', color: couleur, fontWeight: 700, fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>•</span>
            <input value={saisies[`${a.id}.${section.nom}.${l.cle}`] ?? ''} onChange={(e) => set(`${a.id}.${section.nom}.${l.cle}`, e.target.value)} disabled={verrouille} placeholder={l.libelle ?? 'À compléter…'} style={champ} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Tableau argumentaire (mobile + caracteristiques + avantages) facon logiciel.
function rendreArgumentaire(a: AnnexeArgumentaire, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 13.5, padding: '7px 9px', borderRadius: 4, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none', resize: 'vertical', lineHeight: 1.5 }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>💬 {a.titre}</div>
      <div style={{ padding: 8, overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 600 }}>
          <thead>
            <tr>{a.colonnes.map((h) => <th key={h} style={{ textAlign: 'left', padding: '7px 8px', fontSize: 12, fontWeight: 700, color: '#FFFFFF', background: couleur, border: '1px solid #FFFFFF' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {Array.from({ length: a.nbLignes }).map((_, r) => (
              <tr key={r}>
                {a.colonnes.map((_, ci) => (
                  <td key={ci} style={{ border: '1px solid #E2E8F0', padding: 4, verticalAlign: 'top', width: ci === 0 ? 150 : 'auto' }}>
                    <textarea value={saisies[`${a.id}.r${r}.c${ci}`] ?? ''} onChange={(e) => set(`${a.id}.r${r}.c${ci}`, e.target.value)} disabled={verrouille} rows={ci === 0 ? 2 : 3} style={champ} />
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

// Tableau de reformulation : numero etroit + proposition large multi-lignes.
function rendreReformulation(a: AnnexeReformulation, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champNum: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 14, padding: '6px', borderRadius: 4, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none', textAlign: 'center' }
  const champTxt: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 14, padding: '8px 10px', borderRadius: 4, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none', resize: 'vertical', lineHeight: 1.5 }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>✎ {a.titre}</div>
      <div style={{ padding: 8, overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: 70, textAlign: 'center', padding: '7px 8px', fontSize: 12, fontWeight: 700, color: '#FFFFFF', background: couleur, border: '1px solid #FFFFFF' }}>N°</th>
              <th style={{ textAlign: 'left', padding: '7px 8px', fontSize: 12, fontWeight: 700, color: '#FFFFFF', background: couleur, border: '1px solid #FFFFFF' }}>Proposition de reformulation</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: a.nbLignes }).map((_, r) => (
              <tr key={r}>
                <td style={{ border: '1px solid #E2E8F0', padding: 4, width: 70, verticalAlign: 'top' }}>
                  <input value={saisies[`${a.id}.r${r}.num`] ?? ''} onChange={(e) => set(`${a.id}.r${r}.num`, e.target.value)} disabled={verrouille} style={champNum} />
                </td>
                <td style={{ border: '1px solid #E2E8F0', padding: 4 }}>
                  <textarea value={saisies[`${a.id}.r${r}.txt`] ?? ''} onChange={(e) => set(`${a.id}.r${r}.txt`, e.target.value)} disabled={verrouille} rows={3} style={champTxt} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Tableau de cochage facon logiciel : lignes de dialogue + case a cocher.
function rendreCochage(a: AnnexeCochage, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>☑ {a.titre}</div>
      <div style={{ padding: 8 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              {['N°', 'Protagoniste', 'Dialogue', a.entete].map((h) => <th key={h} style={{ textAlign: 'left', padding: '7px 8px', fontSize: 11, fontWeight: 700, color: '#FFFFFF', background: couleur, border: '1px solid #FFFFFF' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {a.lignes.map((l) => {
              const coche = saisies[`${a.id}.${l.numero}`] === 'X'
              return (
                <tr key={l.numero}>
                  <td style={{ border: '1px solid #E2E8F0', padding: '6px 8px', fontSize: 12, fontWeight: 700, color: couleur }}>{l.numero}</td>
                  <td style={{ border: '1px solid #E2E8F0', padding: '6px 8px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{l.protagoniste}</td>
                  <td style={{ border: '1px solid #E2E8F0', padding: '6px 8px', fontSize: 12.5, color: '#374151' }}>{l.texte}</td>
                  <td style={{ border: '1px solid #E2E8F0', padding: '6px 8px', textAlign: 'center' }}>
                    <input type="checkbox" checked={coche} disabled={verrouille} onChange={(e) => set(`${a.id}.${l.numero}`, e.target.checked ? 'X' : '')} style={{ width: 18, height: 18, accentColor: couleur, cursor: verrouille ? 'default' : 'pointer' }} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Fiche d'appel CERC facon logiciel : sections a rediger.
function rendreFicheAppel(a: AnnexeFicheAppel, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 14, padding: '8px 10px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none', resize: 'vertical', lineHeight: 1.5 }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>📞 {a.titre}</div>
      <div style={{ padding: 14 }}>
        {a.sections.map((s) => (
          <div key={s.cle} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: couleur, marginBottom: 2 }}>{s.libelle}</div>
            {s.aide && <div style={{ fontSize: 12, color: '#9AA5B1', fontStyle: 'italic', marginBottom: 5 }}>{s.aide}</div>}
            <textarea value={saisies[`${a.id}.${s.cle}`] ?? ''} onChange={(e) => set(`${a.id}.${s.cle}`, e.target.value)} disabled={verrouille} rows={s.lignes ?? 3} style={champ} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Fiche signaletique facon logiciel (registre entreprise) : champs etiquetes.
function rendreFicheSignaletique(a: AnnexeFicheSignaletique, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 14, padding: '8px 10px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none', resize: 'vertical' }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>🪪 {a.titre}</div>
      <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {a.champs.map((ch) => (
          <div key={ch.cle}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>{ch.libelle}</label>
            {(ch.lignes ?? 1) > 1
              ? <textarea value={saisies[`${a.id}.${ch.cle}`] ?? ''} onChange={(e) => set(`${a.id}.${ch.cle}`, e.target.value)} disabled={verrouille} rows={ch.lignes} style={champ} />
              : <input value={saisies[`${a.id}.${ch.cle}`] ?? ''} onChange={(e) => set(`${a.id}.${ch.cle}`, e.target.value)} disabled={verrouille} style={champ} />}
          </div>
        ))}
      </div>
    </div>
  )
}

// Grille tarifaire facon comparateur de forfaits : colonnes = offres (prix).
function rendreGrilleTarifaire(a: AnnexeGrilleTarifaire, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 12, padding: '6px 7px', borderRadius: 4, border: '1px solid #E2E8F0', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none', resize: 'vertical' }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>📶 {a.titre}</div>
      <div style={{ padding: 8, overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 640 }}>
          <thead>
            <tr>
              {a.offres.map((o) => (
                <th key={o} style={{ background: couleur, color: '#FFFFFF', border: '2px solid #FFFFFF', borderRadius: 4, padding: '8px 6px', fontSize: 15, fontWeight: 800 }}>{o}<span style={{ fontSize: 11, fontWeight: 600 }}>/mois</span></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: a.nbLignes }).map((_, ri) => (
              <tr key={ri}>
                {a.offres.map((_, cj) => (
                  <td key={cj} style={{ border: '1px solid #E2E8F0', padding: 3, verticalAlign: 'top' }}>
                    <textarea value={saisies[`${a.id}.l${ri}c${cj}`] ?? ''} onChange={(e) => set(`${a.id}.l${ri}c${cj}`, e.target.value)} disabled={verrouille} rows={2} style={champ} />
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

// Organigramme a completer facon logiciel : cases avec menus deroulants
// (nom + fonction). Affichage en arbre : tete puis enfants alignes.
function rendreOrganigrammeAremplir(a: AnnexeOrganigrammeAremplir, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const selStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 12, padding: '5px 6px', borderRadius: 4, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none', marginBottom: 4 }
  const Case = ({ n }: { n: NoeudOrgaVide }) => (
    <div style={{ border: `1.5px solid ${couleur}`, borderRadius: 6, background: '#FFFFFF', padding: 8, minWidth: 150, maxWidth: 170 }}>
      <select value={saisies[`${a.id}.${n.cle}.nom`] ?? ''} onChange={(e) => set(`${a.id}.${n.cle}.nom`, e.target.value)} disabled={verrouille} style={selStyle}>
        <option value="">— Nom —</option>
        {a.noms.map((nom) => <option key={nom} value={nom}>{nom}</option>)}
      </select>
      <select value={saisies[`${a.id}.${n.cle}.fonction`] ?? ''} onChange={(e) => set(`${a.id}.${n.cle}.fonction`, e.target.value)} disabled={verrouille} style={{ ...selStyle, marginBottom: 0 }}>
        <option value="">— Fonction —</option>
        {a.fonctions.map((f) => <option key={f} value={f}>{f}</option>)}
      </select>
    </div>
  )
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>🏢 {a.titre}</div>
      <div style={{ padding: 16, overflowX: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 'fit-content' }}>
          <Case n={a.tete} />
          {a.tete.enfants && a.tete.enfants.length > 0 && (
            <>
              <div style={{ width: 2, height: 14, background: '#B0BAC5' }} />
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', borderTop: '2px solid #B0BAC5', paddingTop: 14 }}>
                {a.tete.enfants.map((e) => <Case key={e.cle} n={e} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Mode operatoire illustre facon page web : etapes numerotees (lecture seule).
function rendreModeOperatoire(a: AnnexeModeOperatoire, couleur: string) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>⚙ {a.entete ?? a.titre}</div>
      <div style={{ padding: 14 }}>
        {a.boutonLien && (
          <a href={a.boutonLien} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: '#FFFFFF', color: couleur, border: `1px solid ${couleur}`, borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 700, marginBottom: 14 }}>↗ {a.boutonLibelle ?? 'Ouvrir le mode opératoire'}</a>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {a.etapes.map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: couleur, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>{i + 1}</div>
              <div style={{ flex: 1, background: '#F7F9FB', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2933', marginBottom: 2 }}>{e.titre}</div>
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{e.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Editeur de presentation facon PowerPoint : bandeau de miniatures cliquables
// + zone d'edition de la diapo selectionnee. Page de garde avec session/date
// et candidat modifiables.
function EditeurPowerPoint({ a, saisies, set, verrouille, couleur }: {
  a: AnnexePowerPoint; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string
}) {
  const [sel, setSel] = useState(0)
  const d = a.diapos[sel]
  const champStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 14,
    padding: '8px 10px', borderRadius: 6, border: '1px solid #C9D6E3',
    background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none', resize: 'vertical',
  }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
      {/* Barre d'application */}
      <div style={{ background: '#2B2B2B', color: '#FFFFFF', padding: '8px 14px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-flex', width: 18, height: 18, background: '#D24726', borderRadius: 3, alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>P</span>
        Présentation — {a.titre}
        <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.6 }}>Diapositive {sel + 1} / {a.diapos.length}</span>
      </div>
      <div style={{ display: 'flex', minHeight: 360 }}>
        {/* Bandeau miniatures */}
        <div style={{ width: 130, flexShrink: 0, background: '#F0F2F5', borderRight: '1px solid #DCE8F4', padding: 8, overflowY: 'auto', maxHeight: 460 }}>
          {a.diapos.map((dp, i) => {
            const actif = i === sel
            return (
              <button key={i} type="button" onClick={() => setSel(i)} style={{ display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer', marginBottom: 8, border: actif ? `2px solid ${couleur}` : '1px solid #D2D9E0', borderRadius: 5, background: '#FFFFFF', padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  <div style={{ background: actif ? couleur : '#B6BFC9', color: '#FFFFFF', fontSize: 11, fontWeight: 800, padding: '4px 6px', display: 'flex', alignItems: 'center' }}>{i + 1}</div>
                  <div style={{ padding: '6px 6px', fontSize: 10, color: '#374151', lineHeight: 1.3 }}>{dp.garde ? 'Page de garde' : (dp.intitule ?? dp.titre)}</div>
                </div>
              </button>
            )
          })}
        </div>
        {/* Zone d'edition de la diapo */}
        <div style={{ flex: 1, padding: 18, background: '#E9ECF0', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div style={{ width: '100%', maxWidth: 560, background: '#FFFFFF', borderRadius: 6, boxShadow: '0 2px 10px rgba(0,0,0,0.12)', padding: 22, minHeight: 320, boxSizing: 'border-box' }}>
            {d.garde ? (
              <div style={{ textAlign: 'center' }}>
                {d.mentions?.slice(0, 2).map((m, i) => <div key={i} style={{ fontSize: i === 0 ? 15 : 14, fontWeight: 800, color: couleur, marginBottom: 6 }}>{m}</div>)}
                <div style={{ height: 1, background: '#E2E8F0', margin: '12px 0' }} />
                {d.mentions?.slice(2).map((m, i) => <div key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>{m}</div>)}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16, textAlign: 'left' }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>Candidat (Nom Prénom)</label>
                    <input value={saisies[`${a.id}.candidat`] ?? ''} onChange={(e) => set(`${a.id}.candidat`, e.target.value)} disabled={verrouille} style={champStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>Session</label>
                    <input value={saisies[`${a.id}.session`] ?? ''} onChange={(e) => set(`${a.id}.session`, e.target.value)} disabled={verrouille} placeholder="2025" style={champStyle} />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 16, fontWeight: 800, color: couleur, borderBottom: `2px solid ${couleur}`, paddingBottom: 6, marginBottom: 14 }}>{d.intitule ?? d.titre}</div>
                {d.champs?.map((ch) => (
                  <div key={ch.cle} style={{ marginBottom: 12 }}>
                    {ch.libelle && <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>{ch.libelle}</label>}
                    {(ch.lignes ?? 1) > 1
                      ? <textarea value={saisies[`${a.id}.${ch.cle}`] ?? ''} onChange={(e) => set(`${a.id}.${ch.cle}`, e.target.value)} disabled={verrouille} rows={ch.lignes} style={champStyle} />
                      : <input value={saisies[`${a.id}.${ch.cle}`] ?? ''} onChange={(e) => set(`${a.id}.${ch.cle}`, e.target.value)} disabled={verrouille} style={champStyle} />}
                  </div>
                ))}
                {d.competence && <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #E2E8F0', fontSize: 11, color: '#9AA5B1', fontStyle: 'italic' }}>Compétence travaillée : {d.competence}</div>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Fichier clients facon tableur : colonnes + lignes a completer.
function rendreFichierClients(a: AnnexeFichierClients, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 12, padding: '5px 6px', borderRadius: 4, border: '1px solid #E2E8F0', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none' }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>▦ {a.entete ?? a.titre}</div>
      <div style={{ padding: 8, overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: 900, width: '100%' }}>
          <thead>
            <tr>
              <th style={{ background: '#F0F3F6', border: '1px solid #DCE8F4', padding: '4px', fontSize: 11, width: 30, color: '#9AA5B1' }}>#</th>
              {a.colonnes.map((c) => <th key={c} style={{ background: couleur, color: '#FFFFFF', border: '1px solid #FFFFFF', padding: '6px 8px', fontSize: 11, fontWeight: 700, minWidth: 110 }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: a.nbLignes }).map((_, ri) => (
              <tr key={ri}>
                <td style={{ background: '#F7F9FB', border: '1px solid #DCE8F4', padding: '4px', fontSize: 11, color: '#9AA5B1', textAlign: 'center' }}>{ri + 1}</td>
                {a.colonnes.map((_, cj) => (
                  <td key={cj} style={{ border: '1px solid #E2E8F0', padding: 2 }}>
                    <input value={saisies[`${a.id}.l${ri}c${cj}`] ?? ''} onChange={(e) => set(`${a.id}.l${ri}c${cj}`, e.target.value)} disabled={verrouille} style={champ} />
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

function rendreFicheContact(a: AnnexeFicheContact, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '7px 9px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none' }
  const lab: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 3 }
  const ch = (cle: string, label: string) => (
    <div><label style={lab}>{label}</label><input value={saisies[`${a.id}.${cle}`] ?? ''} onChange={(e) => set(`${a.id}.${cle}`, e.target.value)} disabled={verrouille} style={champ} /></div>
  )
  const section = (titre: string, contenu: React.ReactNode) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#FFFFFF', background: couleur, padding: '5px 10px', borderRadius: '6px 6px 0 0' }}>{titre}</div>
      <div style={{ border: '1px solid #DCE8F4', borderTop: 'none', borderRadius: '0 0 6px 6px', padding: 12 }}>{contenu}</div>
    </div>
  )
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#1F2933', color: '#FFFFFF', padding: '10px 14px', fontSize: 14, fontWeight: 800, textAlign: 'center' }}>FICHE CONTACT</div>
      <div style={{ padding: 14 }}>
        {section("COORDONNEES DE L'ORGANISATION (Entreprise, école, association…)", (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {ch('denom', 'Dénomination')}{ch('tel', 'Téléphone')}
            <div style={{ gridColumn: '1 / -1' }}>{ch('adresse', 'Adresse')}</div>
            <div style={{ gridColumn: '1 / -1' }}>{ch('site', 'Site internet')}</div>
          </div>
        ))}
        {section('COORDONNEES DU DECISIONNAIRE', (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {ch('nom', 'Nom')}{ch('prenom', 'Prénom')}
            {ch('fonction', 'Fonction')}{ch('email', 'E-mail')}
          </div>
        ))}
        {section('LES BESOINS DU CLIENT', (
          <textarea value={saisies[`${a.id}.besoins`] ?? ''} onChange={(e) => set(`${a.id}.besoins`, e.target.value)} disabled={verrouille} rows={3} style={{ ...champ, resize: 'vertical' }} />
        ))}
        {section('LE RESULTAT DE LA PROSPECTION', (
          <textarea value={saisies[`${a.id}.resultat`] ?? ''} onChange={(e) => set(`${a.id}.resultat`, e.target.value)} disabled={verrouille} rows={3} style={{ ...champ, resize: 'vertical' }} />
        ))}
      </div>
    </div>
  )
}

// Grille de criteres de segmentation : case a cocher + justification par ligne.
function rendreCritereSeg(a: AnnexeCritereSeg, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 14,
    padding: '7px 9px', borderRadius: 6, border: '1px solid #C9D6E3',
    background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none',
  }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700 }}>{a.entete ?? a.titre}</div>
      <div style={{ padding: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 2fr', gap: 8, marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4B5563' }}>
          <div>Critères de segmentation</div><div style={{ textAlign: 'center' }}>Cochez</div><div>Justification</div>
        </div>
        {a.criteres.map((crit, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 2fr', gap: 8, marginBottom: 6, alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2933' }}>{crit}</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <input type="checkbox" checked={(saisies[`${a.id}.c${i}`] ?? '') === '1'} disabled={verrouille} onChange={(e) => set(`${a.id}.c${i}`, e.target.checked ? '1' : '')} style={{ width: 18, height: 18, cursor: verrouille ? 'default' : 'pointer', accentColor: couleur }} />
            </div>
            <input value={saisies[`${a.id}.j${i}`] ?? ''} onChange={(e) => set(`${a.id}.j${i}`, e.target.value)} disabled={verrouille} placeholder="Justification..." style={champ} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Tableau de services avec cases a cocher Marchand / Non marchand.
function rendreCasesServices(a: AnnexeCasesServices, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {  const champ: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 14,
    padding: '7px 9px', borderRadius: 6, border: '1px solid #C9D6E3',
    background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none',
  }
  const coche = (cle: string) => (saisies[cle] ?? '') === '1'
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700 }}>{a.entete ?? a.titre}</div>
      <div style={{ padding: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `1fr ${a.colonnes.map(() => '110px').join(' ')}`, gap: 8, marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4B5563' }}>
          <div>Les services</div>
          {a.colonnes.map((c) => <div key={c} style={{ textAlign: 'center' }}>{c}</div>)}
        </div>
        {Array.from({ length: a.nbLignes }).map((_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: `1fr ${a.colonnes.map(() => '110px').join(' ')}`, gap: 8, marginBottom: 6, alignItems: 'center' }}>
            <input value={saisies[`${a.id}.service${i}`] ?? ''} onChange={(e) => set(`${a.id}.service${i}`, e.target.value)} disabled={verrouille} placeholder={`Service ${i + 1}`} style={champ} />
            {a.colonnes.map((_, cj) => {
              const cle = `${a.id}.l${i}c${cj}`
              return (
                <div key={cj} style={{ display: 'flex', justifyContent: 'center' }}>
                  <input type="checkbox" checked={coche(cle)} disabled={verrouille} onChange={(e) => set(cle, e.target.checked ? '1' : '')} style={{ width: 18, height: 18, cursor: verrouille ? 'default' : 'pointer', accentColor: couleur }} />
                </div>
              )
            })}
          </div>
        ))}
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
