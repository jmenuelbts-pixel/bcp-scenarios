// OngletTravaux.tsx
// Onglet Travaux a rendre : fiche eleve complete (contexte, objectifs,
// competence, activites avec questions et annexes a completer). Les saisies
// sont serialisees en JSON dans le champ travail unique de la mission, puis
// verrouillees apres envoi.

import { Fragment, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
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
  AnnexePratiques,
  AnnexeQuestionnaire,
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
  AnnexeHistogramme,
  AnnexeIdentiteEntreprise,
  AnnexeChoixPhotos,
  ProduitFicheCatalogue,
  AnnexeParcours,
  AnnexeCrmClients,
  AnnexeEtatFrais,
  ClientCrm,
  AnnexeBonCommandeCalcule,
  EtapeParcours,
  AnnexeCarteVisite,
  AnnexeECarte,
  NoeudOrgaVide,
  AnnexeCochage,
  AnnexeReformulation,
  AnnexeFicheTechnique,
  AnnexeReponseReseau,
  AnnexeArgumentaire,
  AnnexeFicheAppel,
  AnnexeMail,
  AnnexeSms,
  AnnexeFicheProduit,
  AnnexeFicheProduitPro,
  AnnexeFaqPro,
  AnnexeObjectionsCrm,
  AnnexeQuestionnaireBuilder,
  AnnexeCompteRendu,
  AnnexeLienQr,
  AnnexePourcentageStepper,
  AnnexeFaqOnglets,
  AnnexeSavPriseEnCharge,
  AnnexeTableauPct,
  AnnexeVraiFaux,
  AnnexeSoncasPro,
  AnnexeMobilesPro,
  AnnexeCap,
  AnnexeConfigurateur,
  AnnexeDialogue,
  AnnexeSonCase,
  AnnexeObjections,
  AnnexeTraitObjections,
  AnnexeSimulateur,
  AnnexeCatalogue,
  AnnexeClientele,
  AnnexeConcurrents,
  AnnexeQuestionsReponses,
  AnnexeFreins,
  AnnexeFicheClient,
  AnnexePlanning,
  CreneauPlanning,
  AnnexeBonCommande,
  AnnexeEtapesLivraison,
  AnnexeBulle,
  AnnexeMailLecture,
  ProduitCatalogue,
  VehiculeCatalogue,
  BlocDocumentTexte,
} from '../../data/contenus'
import { enregistrerTravail, chargerTravail, chargerRetourTravail, type RetourTravail } from '../../lib/eleve'
import { chargerBrouillon, creerEnregistreurBrouillon, effacerBrouillon, useFlushBrouillon } from '../../lib/brouillon'

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
    leroy: { nom: 'Leroy Merlin', url: 'www.leroymerlin.fr' },
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

  // Enregistreur de brouillon (autosave). Recree si l'eleve ou la mission change.
  const brouillon = useRef(creerEnregistreurBrouillon<Saisies>(etudiantId ?? 'anon', missionId, 'travaux'))
  useEffect(() => {
    brouillon.current = creerEnregistreurBrouillon<Saisies>(etudiantId ?? 'anon', missionId, 'travaux')
  }, [etudiantId, missionId])
  useFlushBrouillon(brouillon as unknown as { current: { flush(): void } })

  useEffect(() => {
    if (!etudiantId) return
    let actif = true
    chargerTravail(etudiantId, missionId).then(async (c) => {
      if (!actif) return
      if (c && c.trim().length > 0) {
        // Travail deja envoye : il prime, on l'affiche verrouille et on nettoie tout brouillon.
        try {
          const obj = JSON.parse(c)
          if (obj && typeof obj === 'object') setSaisies(obj as Saisies)
        } catch {
          // ancien format texte libre : on le place dans une cle de compatibilite
          setSaisies({ _texte: c })
        }
        setVerrouille(true)
        void effacerBrouillon(etudiantId, missionId, 'travaux')
        return
      }
      // Pas de travail envoye : on restaure le brouillon en cours s'il existe.
      const b = await chargerBrouillon<Saisies>(etudiantId, missionId, 'travaux')
      if (actif && b && typeof b === 'object') setSaisies(b)
    })
    chargerRetourTravail(etudiantId, missionId).then((r) => { if (actif) setRetour(r) })
    // Au demontage (changement d'onglet/page) : on force l'ecriture distante du brouillon.
    return () => {
      actif = false
      brouillon.current.flush()
    }
  }, [etudiantId, missionId])

  function set(id: string, val: string) {
    if (verrouille) return
    setSaisies((s) => {
      const maj = { ...s, [id]: val }
      brouillon.current.sauver(maj)
      return maj
    })
  }

  // Liste des champs requis (annexes) pour valider la completude.
  const champs: string[] = []
  contenu.annexes?.forEach((a) => {
    if (a.type === 'tableau') a.lignes.forEach((l) => champs.push(`${a.id}.${l.id}`))
    if (a.type === 'horaires') a.jours.forEach((j) => champs.push(`${a.id}.${j}`))
    if (a.type === 'organigramme') a.cases.forEach((c) => { champs.push(`${a.id}.${c.id}.nom`); champs.push(`${a.id}.${c.id}.fonction`) })
    if (a.type === 'histogramme') a.barres.forEach((b) => champs.push(`${a.id}.${b.cle}`))
    if (a.type === 'identiteentreprise') { a.champs.forEach((c) => champs.push(`${a.id}.${c.cle}`)); a.qualifications.forEach((q) => champs.push(`${a.id}.${q.cle}`)) }
    if (a.type === 'cartevisite' || a.type === 'ecarte') { ['nom','fonction','tel','mail'].forEach((c) => champs.push(`${a.id}.${c}`)) }
    if (a.type === 'choixphotos') a.categories.forEach((c) => champs.push(`${a.id}.${c.cle}`))
    if (a.type === 'boncommandecalcule') {
      a.lignes.forEach((_, n) => champs.push(`${a.id}.l${n}.total`))
      champs.push(`${a.id}.soustotal`)
      if (a.reduction) champs.push(`${a.id}.reduction`)
      champs.push(`${a.id}.tva`, `${a.id}.ttc`)
      if (a.livraison) champs.push(`${a.id}.livraison`)
      champs.push(`${a.id}.total`)
      if (a.paiement2fois) champs.push(`${a.id}.commande`, `${a.id}.trentejours`)
    }
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
    else {
      brouillon.current.annuler()
      void effacerBrouillon(etudiantId, missionId, 'travaux')
      setVerrouille(true)
    }
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

  // Suit les annexes deja rendues : une annexe partagee par plusieurs
  // questions ne s'affiche qu'une seule fois (a la premiere question qui la
  // reference). Reinitialise au debut du rendu des activites.
  const annexesRendues = new Set<string>()

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
          {contenu.videoIntro && <VideoIntroRevelable v={contenu.videoIntro} couleur={couleur} />}
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
                        {(docCourant.images ?? []).map((src, i) => (
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
      {(() => { annexesRendues.clear(); return null })()}
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
          {act.contexte && (
            <div style={{ border: `2px solid ${couleur}`, borderRadius: 12, padding: '12px 16px', margin: '0 0 14px', background: `${couleur}14` }}>
              <span style={{ fontSize: 14, fontStyle: 'italic', color: '#374151', lineHeight: 1.5 }}>{act.contexte}</span>
            </div>
          )}
          {act.questions.map((q) => {
            const annexe = contenu.annexes?.find((a) => a.id === q.annexeId)
            const annexe2 = q.annexeId2 ? contenu.annexes?.find((a) => a.id === q.annexeId2) : undefined
            const montrerAnnexe = annexe && annexe.type !== 'powerpoint' && !annexesRendues.has(annexe.id)
            if (montrerAnnexe) annexesRendues.add(annexe!.id)
            const montrerAnnexe2 = annexe2 && annexe2.type !== 'powerpoint' && !annexesRendues.has(annexe2.id)
            if (montrerAnnexe2) annexesRendues.add(annexe2!.id)
            return (
              <div key={q.numero} style={{ marginBottom: 16 }}>
                {q.contexteAvant && (
                  <div style={{ border: `2px solid ${couleur}`, borderRadius: 12, padding: '12px 16px', marginBottom: 12, background: `${couleur}14` }}>
                    <span style={{ fontSize: 14, fontStyle: 'italic', color: '#374151', lineHeight: 1.5 }}>{q.contexteAvant}</span>
                  </div>
                )}
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
                {montrerAnnexe && (
                  <div style={{ marginLeft: 18 }}>
                    {rendreAnnexe(annexe, saisies, set, champStyle, verrouille, couleur)}
                  </div>
                )}
                {montrerAnnexe2 && (
                  <div style={{ marginLeft: 18, marginTop: 12 }}>
                    {rendreAnnexe(annexe2, saisies, set, champStyle, verrouille, couleur)}
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
  const contenu = blocs.filter((b) => !(b.pageWeb && !b.intertitre && !b.paragraphes && !b.puces && !b.dialogue && !b.tableau && !b.crm && !b.organigramme && !b.procedure && !b.transcription && !b.journalAppels && !b.mailLecture && !b.offrePrix && !b.cartesTechniques && !b.offreFlash && !b.bareme && !b.articleEtapes && !b.parcours && !b.roue && !b.tourDeTable && !b.catalogueProduits && !b.noteDirection && !b.bulleConseil && !b.crmClients && !b.docRiche && !b.etatFrais && !b.reseauSocial && !b.jaugeSatisfaction && !b.questionnaire && !b.instagramTelephone && !b.image && !b.galerieProduits && !b.carrousel && !b.bonCommandePeugeot && !b.typesQuestions && !b.themesQuestions && !b.etapesVisuelles && !b.logoEntete && !b.offresPrestation && !b.cheques && !b.postits && !b.ribs && !b.configurateurVehicule && !b.fichesVehicule && !b.formulaireInteractif))
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
                      <td key={cj} style={{ padding: '8px 10px', fontSize: 14, color: '#1F2933', border: '1px solid #DCE8F4', fontWeight: cj === 0 ? 700 : 400, verticalAlign: 'top', width: cj === 0 ? '22%' : undefined, whiteSpace: 'pre-line' }}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {b.logoEntete && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
              <img src={b.logoEntete} alt="Logo" style={{ height: 44 }} />
            </div>
          )}
          {b.etapesVisuelles && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'stretch', margin: '12px 0' }}>
              {b.etapesVisuelles.map((e, ei) => (
                <Fragment key={ei}>
                  <div style={{ flex: '1 1 150px', minWidth: 140, background: '#FFFFFF', border: `2px solid ${couleur}`, borderRadius: 10, padding: '12px 12px 14px', display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <span style={{ width: 30, height: 30, borderRadius: '50%', background: couleur, color: '#FFFFFF', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ei + 1}</span>
                    <span style={{ fontSize: 13, color: '#1F2933', fontWeight: 600, lineHeight: 1.3 }}>{e}</span>
                  </div>
                  {ei < b.etapesVisuelles!.length - 1 && <div style={{ alignSelf: 'center', color: couleur, fontSize: 24, fontWeight: 800 }}>→</div>}
                </Fragment>
              ))}
            </div>
          )}
          {b.offresPrestation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '12px 0' }}>
              {b.offresPrestation.map((o, oi) => (
                <div key={oi} style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 1px 5px rgba(0,0,0,0.07)' }}>
                  {o.filAriane && <div style={{ fontSize: 11, color: '#6B7280', padding: '8px 14px', borderBottom: '1px solid #F1F3F5', background: '#FAFBFC' }}>{o.filAriane}</div>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, padding: 14 }}>
                    {o.image && <img src={o.image} alt={o.titre} style={{ width: 240, maxWidth: '100%', height: 170, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
                    <div style={{ flex: '1 1 260px', minWidth: 240 }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#1F2933', marginBottom: 4 }}>{o.titre}</div>
                      {o.note && <div style={{ fontSize: 12.5, color: '#E8A100', marginBottom: 8 }}>{'★'.repeat(5)} <span style={{ color: '#6B7280' }}>{o.avis}</span></div>}
                      <div style={{ display: 'inline-block', borderTop: `3px solid ${couleur}`, paddingTop: 8 }}>
                        <span style={{ fontSize: 13, color: '#4B5563' }}>{o.prixLibelle ?? 'À partir de'}</span>
                        <div style={{ fontSize: 22, fontWeight: 800, color: couleur }}>{o.prix}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '0 14px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2933', margin: '6px 0' }}>✓ Détails de la prestation — L'offre comprend</div>
                    <ul style={{ margin: '0 0 10px', paddingLeft: 20, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                      {o.details.map((d, di) => <li key={di}>{d}</li>)}
                    </ul>
                    {o.conditions && o.conditions.length > 0 && (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2933', margin: '6px 0' }}>Conditions d'application</div>
                        <ul style={{ margin: '0 0 10px', paddingLeft: 20, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                          {o.conditions.map((c, ci) => <li key={ci}>{c}</li>)}
                        </ul>
                      </>
                    )}
                    {o.engagements && o.engagements.length > 0 && (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2933', margin: '6px 0' }}>Nos engagements</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                          {o.engagements.map((e, ei) => (
                            <div key={ei} style={{ flex: '1 1 200px', background: '#F4F8EE', borderRadius: 8, padding: '8px 12px' }}>
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#3A5A1A' }}>{e.titre}</div>
                              <div style={{ fontSize: 12, color: '#4B5563' }}>{e.texte}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {b.galerieProduits && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, margin: '10px 0' }}>
              {b.galerieProduits.map((p, gi) => (
                <div key={gi} style={{ border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', background: '#F4F6F8' }}>
                    <img src={p.image} alt={p.titre} style={{ width: '100%', height: 170, objectFit: 'cover', display: 'block' }} />
                    <span style={{ position: 'absolute', top: 10, right: 10, background: couleur, color: '#FFFFFF', fontSize: 14, fontWeight: 800, padding: '4px 10px', borderRadius: 20 }}>{p.prix}</span>
                  </div>
                  <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2933', lineHeight: 1.3 }}>{p.titre}</div>
                    <div style={{ fontSize: 12, color: '#4B5563' }}>{p.dimensions}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>Réf. {p.reference}</div>
                    <div style={{ fontSize: 11.5, color: '#6B7280', marginTop: 2 }}><span style={{ fontWeight: 700 }}>Coloris :</span> {p.coloris}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {b.image && (
            <figure style={{ margin: '8px 0', textAlign: 'center' }}>
              <img src={b.image.src} alt={b.image.alt} style={{ width: b.image.largeur ? b.image.largeur : '100%', maxWidth: '100%', height: 'auto', borderRadius: 8, border: '1px solid #E6ECF2', display: 'inline-block', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }} />
              {b.image.legende && <figcaption style={{ fontSize: 12, color: '#6B7280', marginTop: 6, fontStyle: 'italic' }}>{b.image.legende}</figcaption>}
            </figure>
          )}
          {b.crm && <CrmConsultable crm={b.crm} couleur={couleur} />}
          {b.carrousel && <CarrouselVue data={b.carrousel} couleur={couleur} />}
          {b.bonCommandePeugeot && <BonCommandePeugeotVue data={b.bonCommandePeugeot} />}
          {b.typesQuestions && <TypesQuestionsVue />}
          {b.themesQuestions && <ThemesQuestionsVue data={b.themesQuestions} />}
          {b.organigramme && <OrganigrammeVue org={b.organigramme} />}
          {b.journalAppels && <JournalAppelsVue journal={b.journalAppels} couleur={couleur} />}
          {b.transcription && <TranscriptionVue transcription={b.transcription} couleur={couleur} />}
          {b.procedure && <ProcedureVue procedure={b.procedure} couleur={couleur} />}
          {b.mailLecture && <MailLectureVue mail={b.mailLecture} couleur={couleur} />}
          {b.offrePrix && <OffrePrixVue offre={b.offrePrix} couleur={couleur} />}
          {b.cartesTechniques && <CartesTechniquesVue data={b.cartesTechniques} couleur={couleur} />}
          {b.offreFlash && <OffreFlashVue offre={b.offreFlash} couleur={couleur} />}
          {b.jaugeSatisfaction && <JaugeSatisfactionVue data={b.jaugeSatisfaction} couleur={couleur} />}
          {b.bareme && <BaremeVue bareme={b.bareme} couleur={couleur} />}
          {b.articleEtapes && <ArticleEtapesVue data={b.articleEtapes} couleur={couleur} />}
          {b.parcours && <ParcoursVue a={{ type: 'parcours', id: 'doc-parcours', titre: '', etapes: b.parcours.etapes }} couleur={couleur} />}
          {b.roue && <RoueMethodesVue secteurs={b.roue.secteurs} />}
          {b.tourDeTable && <TourDeTableVue data={b.tourDeTable} couleur={couleur} />}
          {b.catalogueProduits && <CatalogueProduitsVue data={b.catalogueProduits} couleur={couleur} />}
          {b.docRiche && <DocRicheVue data={b.docRiche} couleur={couleur} />}
          {b.noteDirection && <NoteDirectionVue data={b.noteDirection} />}
          {b.bulleConseil && <BulleConseilVue texte={b.bulleConseil.texte} />}
          {b.reseauSocial && <ReseauSocialVue post={b.reseauSocial} />}
          {b.questionnaire && !b.instagramTelephone && <QuestionnaireVue q={b.questionnaire} couleur={couleur} />}
          {b.instagramTelephone && <InstagramTelephoneVue data={b.instagramTelephone} questionnaire={b.questionnaire} couleur={couleur} />}
          {b.cheques && <ChequesVue cheques={b.cheques} />}
          {b.ribs && <RibsVue ribs={b.ribs} />}
          {b.postits && <PostitsVue postits={b.postits} />}
          {b.configurateurVehicule && <ConfigurateurVehiculeVue config={b.configurateurVehicule} couleur={couleur} />}
          {b.fichesVehicule && <FichesVehiculeVue data={b.fichesVehicule} couleur={couleur} />}
          {b.formulaireInteractif && <FormulaireInteractifVue form={b.formulaireInteractif} />}
        </div>
      ))}
      </div>
    </div>
  )
}

// Chèques bancaires réalistes : en-tête banque (couleur + logo), agence, montant
// chiffres + lettres, bénéficiaire, titulaire, lieu/date, ligne MICR. Le post-it
// (année + accessoire) est placé AU-DESSUS du chèque, sans recouvrir aucune info.
function ChequesVue({ cheques }: { cheques: NonNullable<BlocDocumentTexte['cheques']> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, margin: '10px 0' }}>
      {cheques.map((c, i) => {
        const initiales = c.banque.split(' ').map((m) => m.charAt(0)).join('').slice(0, 3).toUpperCase()
        const aPostit = !!(c.postitAnnee || c.postitAccessoire)
        return (
          <div key={i}>
            {aPostit && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -6, paddingRight: 18 }}>
                <div style={{ background: '#FFF7B0', padding: '8px 12px', boxShadow: '0 3px 7px rgba(0,0,0,0.22)', transform: 'rotate(-2deg)', fontFamily: '"Bradley Hand","Segoe Print","Comic Sans MS",cursive', fontSize: 13, color: '#3A3A1E', lineHeight: 1.4, borderRadius: 2 }}>
                  {c.postitAnnee && <div style={{ fontWeight: 700 }}>Véhicule acheté en {c.postitAnnee}</div>}
                  {c.postitAccessoire && <div>{c.postitAccessoire}</div>}
                </div>
              </div>
            )}
            <div style={{ position: 'relative', background: '#FBFCFB', border: `1px solid ${c.couleur}33`, borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 5px rgba(0,0,0,0.13)' }}>
              <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(115deg, ${c.couleur}0C 0 10px, transparent 10px 20px)`, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', right: 14, top: 10, fontSize: 44, fontWeight: 800, color: `${c.couleur}12`, transform: 'rotate(-8deg)', letterSpacing: 1, pointerEvents: 'none' }}>{initiales}</div>
              <div style={{ position: 'relative', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                    <span style={{ width: 32, height: 30, borderRadius: 4, background: c.couleur, color: '#FFFFFF', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initiales}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: c.couleur }}>{c.banque}</div>
                      {c.agence && <div style={{ fontSize: 10, color: '#6B7280' }}>{c.agence}</div>}
                      {c.telephone && <div style={{ fontSize: 10, color: '#6B7280' }}>Tél : {c.telephone}</div>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 8.5, color: '#7A7A7A', letterSpacing: 0.5 }}>B.P.F.</div>
                    {c.montant && <div style={{ border: `1.5px solid ${c.couleur}`, borderRadius: 3, padding: '4px 12px', fontWeight: 700, fontSize: 14, marginTop: 2, color: '#1F2933', background: '#FFFFFF' }}>{c.montant}</div>}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#222', lineHeight: 1.7 }}>
                  <div style={{ borderBottom: '1px dotted #BBBBBB', paddingBottom: 2 }}>Payez contre ce chèque non endossable : <span style={{ fontStyle: 'italic', color: '#555' }}>{c.montantLettres ?? '\u2026'}</span></div>
                  <div style={{ borderBottom: '1px dotted #BBBBBB', paddingTop: 4, paddingBottom: 2 }}>à : <span style={{ fontWeight: 700 }}>{c.beneficiaire ?? 'RENAULT RETAIL GROUP — Championnet'}</span></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 }}>
                  <div style={{ fontSize: 11, lineHeight: 1.45 }}>
                    <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{c.titulaire}</div>
                    {c.adresse && <div style={{ color: '#444' }}>{c.adresse}</div>}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 10, color: '#555', flexShrink: 0 }}>
                    {c.lieu && <div>à {c.lieu}</div>}
                    {c.date && <div>le {c.date}</div>}
                  </div>
                </div>
                <div style={{ fontFamily: '"Courier New", monospace', fontSize: 11, letterSpacing: 1, color: '#222', borderTop: '1px solid #DDD', paddingTop: 6, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span>{c.micr ?? '\u2448 0000000 \u2448   00000 \u2446 00000 \u2446 00000000000 \u2448'}</span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// RIB facon document bancaire : entete coloree + titulaire + IBAN/BIC. Post-it
// (annee + accessoire) place au-dessus, sans recouvrir aucune information.
function RibsVue({ ribs }: { ribs: NonNullable<BlocDocumentTexte['ribs']> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '10px 0' }}>
      {ribs.map((r, i) => {
        const initiales = r.banque.split(' ').map((m) => m.charAt(0)).join('').slice(0, 3).toUpperCase()
        const aPostit = !!(r.postitAnnee || r.postitAccessoire)
        return (
          <div key={i}>
            {aPostit && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -6, paddingRight: 16 }}>
                <div style={{ background: '#FFF7B0', padding: '8px 12px', boxShadow: '0 3px 7px rgba(0,0,0,0.22)', transform: 'rotate(-2deg)', fontFamily: '"Bradley Hand","Segoe Print","Comic Sans MS",cursive', fontSize: 13, color: '#3A3A1E', lineHeight: 1.4, borderRadius: 2 }}>
                  {r.postitAnnee && <div style={{ fontWeight: 700 }}>Véhicule acheté en {r.postitAnnee}</div>}
                  {r.postitAccessoire && <div>{r.postitAccessoire}</div>}
                </div>
              </div>
            )}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 5px rgba(0,0,0,0.07)' }}>
              <div style={{ background: r.couleur, color: '#FFFFFF', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 6, background: 'rgba(255,255,255,0.22)', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initiales}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{r.banque}</div>
                  <div style={{ fontSize: 11, opacity: 0.9 }}>Relevé d\u2019Identité Bancaire (RIB)</div>
                </div>
              </div>
              <div style={{ padding: '12px 14px', fontSize: 13, color: '#1F2933', lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700 }}>{r.titulaire}</div>
                {r.adresse && <div style={{ color: '#4B5563' }}>{r.adresse}</div>}
                {r.iban && <div style={{ marginTop: 6, fontFamily: 'monospace', fontSize: 13, letterSpacing: 0.5 }}><span style={{ color: '#6B7280', fontFamily: 'Arial' }}>IBAN </span>{r.iban}</div>}
                {r.bic && <div style={{ fontFamily: 'monospace', fontSize: 13 }}><span style={{ color: '#6B7280', fontFamily: 'Arial' }}>BIC </span>{r.bic}</div>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Post-it de suggestions : papier jaune, coin corné, écriture façon note.
function PostitsVue({ postits }: { postits: NonNullable<BlocDocumentTexte['postits']> }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, margin: '10px 0' }}>
      {postits.map((p, i) => {
        const fond = p.couleur ?? '#FFF7B0'
        return (
          <div key={i} style={{ position: 'relative', flex: '1 1 240px', minWidth: 220, maxWidth: 320, background: fond, padding: '14px 16px 18px', boxShadow: '0 3px 8px rgba(0,0,0,0.18)', transform: i % 2 === 0 ? 'rotate(-1.4deg)' : 'rotate(1.2deg)', borderRadius: 2 }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 22px 22px 0', borderColor: `transparent rgba(0,0,0,0.10) transparent transparent` }} />
            <div style={{ fontFamily: '"Bradley Hand","Segoe Print","Comic Sans MS",cursive', fontSize: 14, color: '#3A3A1E', lineHeight: 1.55 }}>
              {p.prenom != null && <div><strong>Prénom :</strong> {p.prenom}</div>}
              {p.nom != null && <div><strong>Nom :</strong> {p.nom}</div>}
              {p.adresse && <div><strong>Adresse :</strong> {p.adresse}</div>}
              {p.telephone && <div><strong>Téléphone :</strong> {p.telephone}</div>}
              {p.suggestion && <div style={{ marginTop: 8 }}><strong>Suggestions :</strong> {p.suggestion}</div>}
              {p.date && <div style={{ marginTop: 8, textAlign: 'right', fontSize: 12, fontStyle: 'italic' }}>{p.date}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Simulateur/formulaire professionnel : etapes a choix (avec branchement) ou saisie.
function FormulaireInteractifVue({ form }: { form: NonNullable<BlocDocumentTexte['formulaireInteractif']> }) {
  const accent = form.accent ?? '#3FA69A'
  const [choix, setChoix] = useState<Record<number, string>>({})
  const [saisies, setSaisies] = useState<Record<string, string>>({})
  return (
    <div style={{ border: '1px solid #E6E9ED', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', margin: '10px 0', background: '#FFFFFF' }}>
      <div style={{ background: accent, color: '#FFFFFF', padding: '14px 16px', fontWeight: 800, fontSize: 16 }}>{form.titre ?? 'Simulateur'}</div>
      {form.logo && <div style={{ textAlign: 'center', padding: '12px 0', borderBottom: '1px solid #EEF1F4' }}><img src={form.logo} alt="" style={{ maxHeight: 60 }} /></div>}
      {form.intro && form.intro.length > 0 && (
        <div style={{ padding: '12px 16px', background: '#F7FBFA', fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
          {form.intro.map((p, i) => <p key={i} style={{ margin: '4px 0' }}>{p}</p>)}
        </div>
      )}
      <div style={{ padding: '4px 16px 16px' }}>
        {form.etapes.map((e, i) => (
          <div key={i}>
            {e.section && <div style={{ background: accent, color: '#FFFFFF', textAlign: 'center', fontWeight: 700, fontSize: 13, padding: '6px 10px', margin: '14px -16px 10px', letterSpacing: 0.4 }}>{e.section}</div>}
            <div style={{ padding: '12px 0', borderBottom: i < form.etapes.length - 1 ? '1px solid #EEF1F4' : 'none' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1F2933', marginBottom: 2 }}>{i + 1}. {e.titre} {e.obligatoire && <span style={{ color: '#E2241A' }}>*</span>}</div>
              {e.aide && <div style={{ fontSize: 12, color: '#8A94A0', fontStyle: 'italic', marginBottom: 8 }}>{e.aide}</div>}
              {e.options && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {e.options.map((o, j) => {
                    const actif = choix[i] === o.label
                    return (
                      <button key={j} onClick={() => setChoix((c) => ({ ...c, [i]: o.label }))} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', border: `1.5px solid ${actif ? accent : '#D6DBE1'}`, borderRadius: 8, background: actif ? `${accent}18` : '#FFFFFF', cursor: 'pointer', fontSize: 13, color: '#1F2933', textAlign: 'left' }}>
                        <span style={{ width: 15, height: 15, borderRadius: '50%', border: `2px solid ${actif ? accent : '#B9C0C8'}`, background: actif ? accent : '#FFFFFF', flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{o.label}</span>
                        {o.suite && <span style={{ fontSize: 11, color: '#9AA3AC', fontStyle: 'italic', flexShrink: 0 }}>{o.suite}</span>}
                      </button>
                    )
                  })}
                </div>
              )}
              {e.champs && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {e.champs.map((ch, j) => {
                    const key = `${i}-${j}`
                    return (
                      <label key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                        <span style={{ flex: 1 }}>{ch.label}</span>
                        <input value={saisies[key] ?? ''} onChange={(ev) => setSaisies((s) => ({ ...s, [key]: ev.target.value }))} style={{ width: 120, padding: '6px 8px', border: '1px solid #D6DBE1', borderRadius: 6, fontSize: 13 }} />
                        {ch.suffixe && <span style={{ color: '#8A94A0', fontSize: 12 }}>{ch.suffixe}</span>}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Configurateur de recherche vehicule facon formulaire concession : etapes a choix.
function ConfigurateurVehiculeVue({ config, couleur }: { config: NonNullable<BlocDocumentTexte['configurateurVehicule']>; couleur: string }) {
  const [choix, setChoix] = useState<Record<number, string>>({})
  return (
    <div style={{ border: '1px solid #E6E9ED', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', margin: '10px 0', background: '#FFFFFF' }}>
      <div style={{ background: couleur, color: '#1F2933', padding: '12px 16px', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>Nos offres véhicules — {config.marque ?? 'Renault'} Championnet</span>
      </div>
      <div style={{ padding: '8px 16px 16px' }}>
        {config.etapes.map((e, i) => (
          <div key={i} style={{ padding: '14px 0', borderBottom: i < config.etapes.length - 1 ? '1px solid #EEF1F4' : 'none' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1F2933', marginBottom: 2 }}>{i + 1}. {e.titre} {e.obligatoire && <span style={{ color: '#E2241A' }}>*</span>}</div>
            <div style={{ fontSize: 12, color: '#8A94A0', fontStyle: 'italic', marginBottom: 8 }}>{e.aide ?? 'Une seule réponse possible.'}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {e.options.map((o, j) => {
                const actif = choix[i] === o
                return (
                  <button key={j} onClick={() => setChoix((c) => ({ ...c, [i]: o }))} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: `1.5px solid ${actif ? couleur : '#D6DBE1'}`, borderRadius: 8, background: actif ? `${couleur}22` : '#FFFFFF', cursor: 'pointer', fontSize: 13, color: '#1F2933', textAlign: 'left' }}>
                    <span style={{ width: 15, height: 15, borderRadius: '50%', border: `2px solid ${actif ? couleur : '#B9C0C8'}`, background: actif ? couleur : '#FFFFFF', flexShrink: 0 }} />
                    {o}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Fiches produit vehicule facon logiciel de concession : carte + onglets cliquables.
function FichesVehiculeVue({ data, couleur }: { data: NonNullable<BlocDocumentTexte['fichesVehicule']>; couleur: string }) {
  const [page, setPage] = useState(0)
  if (data.carrousel) {
    const total = data.vehicules.length
    const dark = couleur === '#FFCC00' ? '#1F2933' : couleur
    return (
      <div style={{ margin: '10px 0' }}>
        {data.titre && <div style={{ fontWeight: 700, fontSize: 14, color: '#1F2933', marginBottom: 10 }}>{data.titre}</div>}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <FicheVehiculeCarte v={data.vehicules[page]} couleur={couleur} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
          <button onClick={() => setPage((v) => Math.max(0, v - 1))} disabled={page === 0}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: page === 0 ? '#E5E7EB' : dark, color: page === 0 ? '#9CA3AF' : '#FFFFFF', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: page === 0 ? 'default' : 'pointer' }}>← Retour</button>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {data.vehicules.map((_, i) => (
              <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: i === page ? dark : '#D1D5DB', display: 'inline-block' }} />
            ))}
            <span style={{ fontSize: 12, color: '#6B7280', marginLeft: 6 }}>{page + 1} / {total}</span>
          </div>
          <button onClick={() => setPage((v) => Math.min(total - 1, v + 1))} disabled={page === total - 1}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: page === total - 1 ? '#E5E7EB' : dark, color: page === total - 1 ? '#9CA3AF' : '#FFFFFF', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: page === total - 1 ? 'default' : 'pointer' }}>Suivant →</button>
        </div>
      </div>
    )
  }
  return (
    <div style={{ margin: '10px 0' }}>
      {data.titre && <div style={{ fontWeight: 700, fontSize: 14, color: '#1F2933', marginBottom: 10 }}>{data.titre}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {data.vehicules.map((v, i) => <FicheVehiculeCarte key={i} v={v} couleur={couleur} />)}
      </div>
    </div>
  )
}

function FicheVehiculeCarte({ v, couleur }: { v: NonNullable<BlocDocumentTexte['fichesVehicule']>['vehicules'][number]; couleur: string }) {
  const onglets: string[] = ['Fiche technique', 'Équipements'].filter((o) => (o === 'Équipements' ? (v.equipements && v.equipements.length) : true)) as string[]
  const [onglet, setOnglet] = useState(onglets[0])
  return (
    <div style={{ flex: '1 1 320px', minWidth: 300, maxWidth: 460, border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', background: '#FFFFFF' }}>
      <div style={{ position: 'relative', background: '#EDEFF2' }}>
        {v.image
          ? <img src={v.image} alt={v.modele} style={{ width: '100%', display: 'block' }} />
          : <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9AA3AC', fontSize: 13 }}>Photo du véhicule</div>}
        {v.bandeau && <div style={{ position: 'absolute', left: 0, bottom: 12, background: '#F08000', color: '#FFFFFF', fontWeight: 700, fontSize: 12, padding: '5px 12px' }}>{v.bandeau}</div>}
      </div>
      <div style={{ padding: '12px 14px 4px' }}>
        <div style={{ fontSize: 16, color: '#1F2933', fontWeight: 700 }}>{v.modele}</div>
        {v.version && <div style={{ fontWeight: 700, color: '#374151' }}>{v.version}</div>}
        {v.resume && <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 2 }}>{v.resume}</div>}
        {v.prix && <div style={{ fontSize: 22, color: couleur === '#FFCC00' ? '#1F2933' : couleur, fontWeight: 800, marginTop: 8 }}>{v.prix}</div>}
        <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#6B7280', marginTop: 6 }}>
          {v.etat && <span style={{ background: '#F1F3F5', padding: '2px 10px', borderRadius: 4 }}>{v.etat}</span>}
          {v.lieu && <span>{v.lieu}</span>}
        </div>
        {v.garantie && <div style={{ fontSize: 11.5, color: '#8A94A0', marginTop: 6 }}>{v.garantie}</div>}
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid #EEF1F4', marginTop: 8 }}>
        {onglets.map((o) => (
          <button key={o} onClick={() => setOnglet(o)} style={{ flex: 1, padding: '9px 6px', border: 'none', background: onglet === o ? '#F7F8FA' : '#FFFFFF', borderBottom: onglet === o ? `2px solid ${couleur === '#FFCC00' ? '#1F2933' : couleur}` : '2px solid transparent', cursor: 'pointer', fontSize: 12.5, fontWeight: onglet === o ? 700 : 500, color: '#1F2933' }}>{o}</button>
        ))}
      </div>
      <div style={{ padding: '12px 14px 16px' }}>
        {onglet === 'Fiche technique' && (
          <div>
            {v.essentiel && v.essentiel.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1F2933', marginBottom: 6 }}>L'essentiel</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 14px' }}>
                  {v.essentiel.map((c, k) => <div key={k} style={{ fontSize: 12.5, color: '#374151' }}><span style={{ color: '#8A94A0' }}>{c.label} : </span><strong>{c.valeur}</strong></div>)}
                </div>
              </div>
            )}
            {v.caracteristiques && v.caracteristiques.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: couleur === '#FFCC00' ? '#1F2933' : couleur, marginBottom: 6 }}>Caractéristiques</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 14px' }}>
                  {v.caracteristiques.map((c, k) => <div key={k} style={{ fontSize: 12.5, color: '#374151' }}><span style={{ color: '#8A94A0' }}>{c.label} : </span><strong>{c.valeur}</strong></div>)}
                </div>
              </div>
            )}
          </div>
        )}
        {onglet === 'Équipements' && v.equipements && (
          <ul style={{ margin: 0, paddingLeft: 18, columns: 1 }}>
            {v.equipements.map((e, k) => <li key={k} style={{ fontSize: 12.5, color: '#374151', marginBottom: 3 }}>{e}</li>)}
          </ul>
        )}
      </div>
    </div>
  )
}

// Jauge de satisfaction facon widget : demi-cercle de smileys rouge -> vert.
function TypesQuestionsVue() {
  const cell: React.CSSProperties = { border: '1px solid #D1D5DB', padding: '10px 12px', fontSize: 13, verticalAlign: 'top' }
  const rond = (rempli: boolean) => (
    <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', border: '2px solid #9AA5B1', background: rempli ? '#1B73E8' : '#FFFFFF', boxShadow: rempli ? 'inset 0 0 0 2px #FFFFFF' : 'none' }} />
  )
  const etoile = (pleine: boolean) => (
    <span style={{ color: pleine ? '#E7B92E' : '#C9CDD3', fontSize: 22 }}>{pleine ? '\u2605' : '\u2606'}</span>
  )
  return (
    <div style={{ border: '2px solid #C00000', borderRadius: 8, overflow: 'hidden', margin: '10px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#FFFFFF' }}>
        <thead>
          <tr style={{ background: '#F3F4F6' }}>
            <th style={{ ...cell, fontWeight: 800, textAlign: 'left' }}>Types de questions</th>
            <th style={{ ...cell, fontWeight: 800, textAlign: 'left' }}>Definition</th>
            <th style={{ ...cell, fontWeight: 800, textAlign: 'left' }}>Exemple</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...cell, fontWeight: 700 }}>Ouverte " O "</td>
            <td style={cell}>Elle laisse le client s'exprimer.</td>
            <td style={cell}>Pourquoi preferez-vous ce type d'enjoliveur ?</td>
          </tr>
          <tr>
            <td style={{ ...cell, fontWeight: 700 }}>A reponse unique</td>
            <td style={cell}>La question comporte plusieurs propositions de reponses mais elle ne permet qu'une seule reponse.</td>
            <td style={cell}>
              <div>- Tres satisfait</div><div>- Satisfait</div><div>- Peu satisfait</div><div>- Pas du tout satisfait</div>
            </td>
          </tr>
          <tr>
            <td style={{ ...cell, fontWeight: 700 }}>Question a matrice</td>
            <td style={cell}>Elle permet au client d'evaluer avec des chiffres.</td>
            <td style={cell}>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: 10, background: '#FCFCFD' }}>
                <div style={{ fontSize: 12, marginBottom: 8 }}>3. Qu'appreciez-vous dans ce produit ?</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(6, 1fr)', gap: 6, alignItems: 'center', fontSize: 12 }}>
                  <span></span>{[0, 1, 2, 3, 4, 5].map((n) => <span key={n} style={{ textAlign: 'center' }}>{n}</span>)}
                  <span>Design</span>{[0, 1, 2, 3, 4, 5].map((n) => <span key={n} style={{ textAlign: 'center' }}>{rond(n === 0)}</span>)}
                  <span>Prix</span>{[0, 1, 2, 3, 4, 5].map((n) => <span key={n} style={{ textAlign: 'center' }}>{rond(n === 0)}</span>)}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ ...cell, fontWeight: 700 }}>Question evaluation</td>
            <td style={cell}>Elle permet au client d'evaluer avec des etoiles.</td>
            <td style={cell}>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: 10, background: '#FCFCFD' }}>
                <div style={{ fontSize: 12, marginBottom: 4 }}>Dans l'ensemble, etes-vous satisfait par le service apres-vente ?</div>
                <div style={{ fontSize: 10, fontStyle: 'italic', color: '#6B7280', marginBottom: 6 }}>Veuillez noter votre satisfaction de 1 a 5 etoiles, 1 etant 'pas du tout satisfait' et 5 etant 'tres satisfait'</div>
                <div>{etoile(true)}{etoile(true)}{etoile(true)}{etoile(false)}{etoile(false)}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function ThemesQuestionsVue({ data }: { data: NonNullable<BlocDocumentTexte['themesQuestions']> }) {
  return (
    <div style={{ border: '2px solid #C00000', borderRadius: 8, padding: 16, margin: '10px 0', background: '#FFFFFF' }}>
      <p style={{ margin: '0 0 10px', fontSize: 14, color: '#1F2933' }}>Pour creer votre questionnaire, vous devez poser des questions sur la concession a partir de differents themes :</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.map((r, i) => (
          <div key={i} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 6, fontSize: 13.5 }}>
            <span style={{ minWidth: 220, flex: '1 1 220px' }}>- {r.theme}</span>
            <span style={{ fontWeight: 700, color: '#1F2933' }}>type de question a creer : <span style={{ color: '#E4002B', fontWeight: 700 }}>{r.type}</span></span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BonCommandePeugeotVue({ data }: { data: NonNullable<BlocDocumentTexte['bonCommandePeugeot']> }) {
  const OR = '#B8912F'
  const line: React.CSSProperties = { borderTop: `2px solid ${OR}`, margin: '10px 0' }
  const lib: React.CSSProperties = { color: '#4B5563', fontSize: 12.5 }
  const val: React.CSSProperties = { color: '#111827', fontWeight: 700, fontSize: 12.5 }
  const row = (l: string, v: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '2px 0' }}>
      <span style={lib}>{l}</span><span style={val}>{v}</span>
    </div>
  )
  const secTitle: React.CSSProperties = { fontWeight: 800, fontSize: 13, color: '#111827', margin: '4px 0 6px' }
  return (
    <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, background: '#FFFFFF', padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', fontFamily: 'Arial, sans-serif' }}>
      {/* En-tete logo */}
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        {data.logo ? <img src={data.logo} alt="PEUGEOT ConcessionCollet" style={{ maxWidth: 360, width: '80%' }} /> : <div style={{ fontSize: 20, fontWeight: 800 }}>PEUGEOT ConcessionCollet</div>}
      </div>
      <div style={line} />
      {/* Bloc 1 : concession + fiche vehicule */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
        <div style={{ flex: '1 1 240px', minWidth: 220 }}>
          {/* Le bloc concession (nom, SARL, adresse, RCS) + vehicule est integre dans l'image */}
          {data.image && <img src={data.image} alt="ConcessionCollet - Peugeot e-208" style={{ width: '100%', maxWidth: 340 }} />}
        </div>
        <div style={{ flex: '1 1 300px', minWidth: 260 }}>
          {row('Marque :', 'PEUGEOT')}
          {/* ANOMALIE : Modele manquant (chapitre 5) -> ligne Modele volontairement absente */}
          {row('Finition :', '/')}
          {row('Motorisation :', '156 ch - 115 kW - Electrique')}
          {row('Type de vehicule :', 'Vehicule 0 km Origine Union Europeenne')}
          {row('Garantie :', 'Garantie PEUGEOT - 2 ans')}
          {row('Entretien :', 'Reseau PEUGEOT ou centre habilite')}
          {row('Coloris exterieur :', 'Noir Perla Nera - Peinture metallisee')}
          {row('Coloris interieur :', 'Sellerie tissu Noir')}
          {row('Nombre de portes :', '5 portes - 5 places')}
          {row('Boite de vitesse :', 'Automatique 8 rapports (EAT8)')}
          {row('Taux CO2 :', '0 g/km')}
          <div style={{ ...line, marginTop: 14 }} />
          {row('Prix catalogue du modele presente', '31 050 EUR')}
          {row('Total avantage(s) Client (31,0%)', '- 9 625 EUR')}
          {row('Personnalisation(s) :', '')}
          {row('Adresse : /', '220 EUR')}
          <div style={line} />
          {/* ANOMALIE : seul le Prix Hors Taxe est indique, pas de prix TTC (chapitre 6) */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 800, fontSize: 14 }}>Prix Hors Taxe</span>
            <span style={{ fontWeight: 800, fontSize: 14 }}>18 027,5 EUR</span>
          </div>
        </div>
      </div>
      {/* Bloc delai et lieu de livraison */}
      <div style={{ border: '1px solid #EADFBF', borderRadius: 8, background: '#FCFAF3', padding: 12, margin: '14px 0' }}>
        <div style={secTitle}>Delai de et lieu de livraison</div>
        <div style={{ fontSize: 12.5, color: '#374151' }}>Aucun.</div>
        <div style={{ fontSize: 12.5, color: '#374151' }}>Pourquoi aucun delai n'est donne au client ? Parce que nous n'avons aucun controle sur la production de vehicules en usine. Le client est automatiquement prevenu lorsque le vehicule est disponible dans la concession.</div>
      </div>
      {/* Bloc offre detaillee */}
      <div style={line} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontStyle: 'italic', fontSize: 12.5, color: '#374151' }}>
        <span>Offre N 0002518947</span><span>n 2027156</span>
      </div>
      <div style={{ marginTop: 8, fontSize: 12.5 }}>
        {row('Prix catalogue PEUGEOT France TTC', '28 500 EUR')}
        {row("Surveillance d'angles morts + Park Assist + camera de recul", '800 EUR')}
        {row('M09V - Noir Perla Nera (peinture metalisee)', '630 EUR')}
        {row('Toit en verre panoramique avec occulteur electrique sequentiel', '610 EUR')}
        {row('Sieges AV chauffants', '250 EUR')}
        {row('Lunette AR surteintee', '150 EUR')}
        {row('Roue de secours Galette', '110 EUR')}
        {row('Sellerie tissu Noir', 'Gratuit')}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, padding: '4px 0' }}><span>Prix du modele presente</span><span>31 050 EUR</span></div>
        <div style={line} />
        {row('Remise sur prix catalogue', '- 9 625 EUR')}
        <div style={{ fontSize: 12, color: '#4B5563' }}>Contrat satisfait ou rembourse, des engagements rassurants, aucune formalite administrative, pack mise a la route inclus... (Offert)</div>
        <div style={{ fontSize: 12, color: '#4B5563', marginTop: 4 }}>A la livraison, votre vehicule sera livre si possible en immatriculation definitive, a defaut en immatriculation provisoire. A la livraison, ce vehicule aura une premiere immatriculation administrative.</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, padding: '4px 0' }}><span>Total avantage(s) client (31%)</span><span>- 9 625 EUR</span></div>
        <div style={line} />
        {row('Livraison / Adresse : /', '220 EUR')}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}><span>Prix Hors Taxe</span><span>18 027,5 EUR</span></div>
      </div>
      {/* Bloc La commande */}
      <div style={{ ...line, marginTop: 16 }} />
      <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 800, margin: '4px 0 10px' }}>La commande</div>
      <div style={{ fontSize: 12.5 }}>
        <div style={{ fontWeight: 800, color: OR, marginBottom: 4 }}>Votre commande</div>
        <div>Le(s) Client(s) : Je soussigne : <b>Jean TALBIOT</b></div>
        {/* ANOMALIE : adresse client manquante (chapitre 2) -> Adresse : / */}
        <div>Adresse : /</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 4 }}>
          <span>Code postal : <b>75018</b></span><span>Ville : <b>Paris</b></span><span>Pays : <b>France</b></span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <span>Tel. Portable : <b>06.01.02.03.04</b></span><span>Tel Domicile : /</span><span>Tel Bureau : /</span>
        </div>
        <div>Email1 : <b>j.talbiot@gmail.com</b></div>
        <div style={{ textAlign: 'center', margin: '10px 0', fontSize: 12.5 }}>
          <div>Confirmation de l'acquisition a ConcessionCollet du modele presente dans cette offre</div>
          <div style={{ fontWeight: 800 }}>PEUGEOT e208 - Projecteur LED Technology - Noir Perla Nera - Toit Panoramique</div>
          <div style={{ fontWeight: 800 }}>Sieges avant chauffants avec options</div>
          <div>Au prix de : 18 037,5 EUR HT</div>
        </div>
        <div style={{ fontSize: 12, color: '#4B5563' }}>Date de livraison prevue : voir information detaillee dans le pave " delai et lieu de livraison en page 1 ".</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '8px 0' }}>
          <span>[ ] Achat au comptant</span><span>[ ] Achat en LOA</span><span>[ ] Achat a credit</span>
        </div>
        <div style={{ fontWeight: 800, color: OR, marginTop: 6 }}>Montant de l'acompte</div>
        <div style={{ textAlign: 'center', fontSize: 15, fontWeight: 800 }}>18 037,5 EUR HT <span style={{ fontSize: 11, fontWeight: 400 }}>(10% au prix du vehicule)</span></div>
        {/* ANOMALIE : mode de reglement manquant (chapitre 8) -> section volontairement absente */}
        <div style={{ marginTop: 10 }}>Fait a : .................................... le : ......../........./20......</div>
        <div>Contrat signe dans les locaux de la societe ConcessionCollet</div>
        <div style={{ marginTop: 6, fontSize: 12, color: '#4B5563' }}>Je reconnais avoir lu et accepte le present contrat et ses annexes mentionnees le 27.04.202N et les Conditions generales de vente.</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
          {/* ANOMALIE : mention " bon pour pouvoir " manquante (chapitre 10) */}
          <div style={{ flex: '1 1 220px', border: '1px solid #EADFBF', background: '#FCFAF3', borderRadius: 6, padding: 12, minHeight: 60 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Titulaire du vehicule</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>Signature(s) et mention(s) manuscrite(s)</div>
          </div>
          <div style={{ flex: '1 1 220px', border: '1px solid #EADFBF', background: '#FCFAF3', borderRadius: 6, padding: 12, minHeight: 60 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Titulaire du vehicule</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>Signature(s) et mention(s) manuscrite(s)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CarrouselVue({ data, couleur }: { data: NonNullable<BlocDocumentTexte['carrousel']>; couleur: string }) {
  const [page, setPage] = useState(0)
  const total = data.pages.length
  const p = data.pages[page]
  return (
    <div style={{ margin: '10px 0', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F4F6F8', borderBottom: '1px solid #E6ECF2' }}>
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F57', display: 'inline-block' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#FEBC2E', display: 'inline-block' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28C840', display: 'inline-block' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 12, color: '#6B7280' }}>page internet</span>
      </div>
      {data.titre && <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 800, color: couleur, padding: '12px 12px 0' }}>{data.titre}</div>}
      <div style={{ padding: 16 }}>
        <figure style={{ margin: 0, textAlign: 'center' }}>
          <img src={p.image} alt={p.alt ?? ''} style={{ width: '100%', maxWidth: '100%', height: 'auto', borderRadius: 8, border: '1px solid #E6ECF2', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }} />
          {p.legende && <figcaption style={{ fontSize: 12, color: '#6B7280', marginTop: 6, fontStyle: 'italic' }}>{p.legende}</figcaption>}
        </figure>
        {p.texte && p.texte.map((t, ti) => (
          <p key={ti} style={{ margin: '8px 0 0', fontSize: 14, color: '#1F2933', lineHeight: 1.6 }}>{t}</p>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #EEF1F4', background: '#FAFBFC' }}>
        <button onClick={() => setPage((v) => Math.max(0, v - 1))} disabled={page === 0}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: page === 0 ? '#E5E7EB' : couleur, color: page === 0 ? '#9CA3AF' : '#FFFFFF', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: page === 0 ? 'default' : 'pointer' }}>
          ← Retour
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          {data.pages.map((_, i) => (
            <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: i === page ? couleur : '#D1D5DB', display: 'inline-block' }} />
          ))}
        </div>
        <button onClick={() => setPage((v) => Math.min(total - 1, v + 1))} disabled={page === total - 1}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: page === total - 1 ? '#E5E7EB' : couleur, color: page === total - 1 ? '#9CA3AF' : '#FFFFFF', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: page === total - 1 ? 'default' : 'pointer' }}>
          Suivant →
        </button>
      </div>
    </div>
  )
}

function JaugeSatisfactionVue({ data, couleur }: { data: NonNullable<BlocDocumentTexte['jaugeSatisfaction']>; couleur: string }) {
  const segs = [
    { c: '#E53935', e: '\u2639\uFE0F' }, { c: '#FB8C00', e: '\u{1F641}' }, { c: '#FDD835', e: '\u{1F610}' }, { c: '#7CB342', e: '\u{1F642}' }, { c: '#2E7D32', e: '\u{1F600}' },
  ]
  return (
    <div style={{ textAlign: 'center', padding: '14px 10px', background: '#FFFFFF', border: '1px solid #EEF1F4', borderRadius: 10 }}>
      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'flex-end' }}>
        {segs.map((s, i) => (
          <div key={i} style={{ width: 46, height: 46 + (i === 2 ? 14 : Math.abs(2 - i) === 1 ? 7 : 0), background: s.c, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.e}</div>
        ))}
      </div>
      {data.libelle && <div style={{ marginTop: 10, fontSize: 15, fontWeight: 800, color: couleur, textTransform: 'uppercase', letterSpacing: 0.5 }}>{data.libelle}</div>}
    </div>
  )
}

// Bareme de prime facon logiciel RH : intro + tableau seuils -> pourcentage.
function BaremeVue({ bareme, couleur }: { bareme: NonNullable<BlocDocumentTexte['bareme']>; couleur: string }) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>💶 Système de rémunération — Prime sur objectif</div>
      <div style={{ padding: 14 }}>
        {bareme.intro?.map((p, i) => <p key={i} style={{ margin: '0 0 8px', fontSize: 13.5, color: '#374151', lineHeight: 1.55, fontStyle: 'italic' }}>{p}</p>)}
        <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: 6 }}>
          <thead>
            <tr>{bareme.colonnes.map((h) => <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#FFFFFF', background: couleur, border: '1px solid #FFFFFF' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {bareme.lignes.map((l, i) => {
              const top = l[1].startsWith('100')
              return (
                <tr key={i} style={{ background: top ? '#FBE3E4' : i % 2 ? '#F7F9FB' : '#FFFFFF' }}>
                  <td style={{ padding: '7px 10px', fontSize: 13, color: '#1F2933', border: '1px solid #E2E8F0' }}>{l[0]}</td>
                  <td style={{ padding: '7px 10px', fontSize: 13, fontWeight: 700, color: top ? couleur : '#1F2933', border: '1px solid #E2E8F0' }}>{l[1]}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Article a etapes facon blog pro : grosses pastilles #1 #2 #3.
function ArticleEtapesVue({ data, couleur }: { data: NonNullable<BlocDocumentTexte['articleEtapes']>; couleur: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {data.etapes.map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: '#FFFFFF', border: '1px solid #EEF1F4', borderRadius: 10, padding: 14 }}>
          <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: '50%', background: couleur, color: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
            <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.85 }}>ÉTAPE</span>
            <span style={{ fontSize: 20, fontWeight: 800 }}>{e.numero}</span>
          </div>
          <div style={{ flex: 1 }}>
            {e.texte.map((p, j) => <p key={j} style={{ margin: j === 0 ? '0 0 8px' : 0, fontSize: 13.5, color: '#374151', lineHeight: 1.6 }}>{p}</p>)}
          </div>
        </div>
      ))}
    </div>
  )
}

// Post de reseau social tres realiste : X et Facebook avec barres d'actions,
// icones SVG, badges, compteurs. Lecture seule (le message du client).
function ReseauSocialVue({ post }: { post: NonNullable<BlocDocumentTexte['reseauSocial']> }) {
  if (post.plateforme === 'facebook') return <FacebookVue post={post} />
  if (post.plateforme === 'instagram') return <FacebookVue post={post} />
  return <XVue post={post} />
}

function XVue({ post }: { post: NonNullable<BlocDocumentTexte['reseauSocial']> }) {
  const gris = '#536471', bleu = '#1D9BF0'
  const ico = { width: 18, height: 18, fill: 'none', stroke: gris, strokeWidth: 2 }
  return (
    <div style={{ border: '1px solid #E1E8ED', borderRadius: 16, maxWidth: 560, background: '#FFFFFF', overflow: 'hidden', fontFamily: '-apple-system, Segoe UI, Roboto, Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid #EFF3F4' }}>
        <span style={{ fontSize: 20, fontWeight: 900, color: '#0F1419' }}>𝕏</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0F1419' }}>Post</span>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#8E54E9,#4776E6)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>{post.avatarInitiale ?? post.compte.charAt(0)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: '#0F1419' }}>{post.compte}</span>
              <svg viewBox="0 0 24 24" width="17" height="17" style={{ fill: bleu }}><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" /></svg>
              <span style={{ fontSize: 14, color: gris }}>{post.pseudo}</span>
            </div>
            <div style={{ fontSize: 15, color: '#0F1419', lineHeight: 1.5, marginTop: 4 }}>
              {post.message.map((m, i) => <p key={i} style={{ margin: i ? '6px 0 0' : 0 }}>{m.split(/(@\w+)/).map((part, j) => part.startsWith('@') ? <span key={j} style={{ color: bleu }}>{part}</span> : part)}</p>)}
            </div>
          </div>
        </div>
        {post.date && <div style={{ fontSize: 14, color: gris, marginTop: 12, paddingBottom: 12, borderBottom: '1px solid #EFF3F4' }}>{post.date} · <span style={{ fontWeight: 700, color: '#0F1419' }}>{post.stats?.vues ?? ''}</span> <span>vues</span></div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 6px 2px', maxWidth: 440 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: gris, fontSize: 13 }}><svg viewBox="0 0 24 24" {...ico}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>{post.stats?.repondre}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: gris, fontSize: 13 }}><svg viewBox="0 0 24 24" {...ico}><path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>{post.stats?.reposter}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: gris, fontSize: 13 }}><svg viewBox="0 0 24 24" {...ico}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>{post.stats?.jaime}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: gris, fontSize: 13 }}><svg viewBox="0 0 24 24" {...ico}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg></span>
        </div>
      </div>
    </div>
  )
}

function FacebookVue({ post }: { post: NonNullable<BlocDocumentTexte['reseauSocial']> }) {
  const gris = '#65676B', bleu = '#1877F2'
  return (
    <div style={{ border: '1px solid #DADDE1', borderRadius: 10, maxWidth: 560, background: '#FFFFFF', overflow: 'hidden', fontFamily: '-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: '1px solid #F0F2F5' }}>
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ fill: bleu }}><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" /></svg>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#050505' }}>facebook</span>
      </div>
      <div style={{ padding: '12px 14px 6px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flexShrink: 0, width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#42a5f5,#1565c0)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800 }}>{post.avatarInitiale ?? post.compte.charAt(0)}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#050505' }}>{post.compte}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: gris }}>{post.date} · <svg viewBox="0 0 24 24" width="12" height="12" style={{ fill: gris }}><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a2 2 0 110 4 2 2 0 010-4zm0 14a8 8 0 01-6-2.7c0-2 4-3.1 6-3.1s6 1.1 6 3.1A8 8 0 0112 19z" /></svg></div>
          </div>
        </div>
        <div style={{ fontSize: 14.5, color: '#050505', lineHeight: 1.5, marginTop: 10 }}>
          {post.message.map((m, i) => <p key={i} style={{ margin: i ? '6px 0 0' : 0 }}>{m.split(/(@\w+)/).map((part, j) => part.startsWith('@') ? <span key={j} style={{ color: bleu, fontWeight: 600 }}>{part}</span> : part)}</p>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0 6px', borderBottom: '1px solid #CED0D4' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: gris }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: bleu, color: '#FFFFFF', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>👍</span>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#F33E58', color: '#FFFFFF', fontSize: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: -6 }}>❤</span>
            <span style={{ marginLeft: 4 }}>{post.stats?.jaime}</span>
          </span>
          <span style={{ fontSize: 13, color: gris }}>{post.stats?.repondre} commentaires · {post.stats?.reposter} partages</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '4px 0' }}>
          {[['👍', 'J\u2019aime'], ['💬', 'Commenter'], ['↪', 'Partager']].map(([i, l]) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: gris, padding: '6px 10px' }}>{i} {l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Questionnaire dynamique facon logiciel : navigation conditionnelle, une
// question a la fois, barre de progression, ecran final de validation.
function QuestionnaireVue({ q, couleur, compact }: { q: NonNullable<BlocDocumentTexte['questionnaire']>; couleur: string; compact?: boolean }) {
  const [demarre, setDemarre] = useState(false)
  const [courant, setCourant] = useState(q.questions[0]?.id ?? 'fin')
  const [reps, setReps] = useState<Record<string, string>>({})
  const [fini, setFini] = useState(false)
  const [parcours, setParcours] = useState<string[]>([])

  const question = q.questions.find((x) => x.id === courant)
  const index = q.questions.findIndex((x) => x.id === courant)
  const progression = fini ? 100 : Math.round((parcours.length / (q.questions.length + 1)) * 100)

  const set = (v: string) => setReps((r) => ({ ...r, [courant]: v }))
  const avancer = () => {
    if (!question) return
    let dest = question.saut ?? 'fin'
    if (question.type === 'unique' && question.options) {
      const opt = question.options.find((o) => o.libelle === reps[courant])
      if (opt?.saut) dest = opt.saut
    }
    setParcours((p) => [...p, courant])
    if (dest === 'fin' || !q.questions.find((x) => x.id === dest)) setFini(true)
    else setCourant(dest)
  }
  const reset = () => { setDemarre(false); setCourant(q.questions[0]?.id ?? 'fin'); setReps({}); setFini(false); setParcours([]) }
  const repondu = question ? (question.obligatoire ? !!reps[courant] : true) : false

  const cadre: React.CSSProperties = { border: compact ? 'none' : '1px solid #DADCE0', borderRadius: 12, overflow: 'hidden', maxWidth: compact ? '100%' : 600, background: '#FFFFFF', fontFamily: 'Roboto, Arial, sans-serif' }
  const barreHaut = <div style={{ height: 8, background: couleur }} />

  if (!demarre) {
    return (
      <div style={cadre}>
        {barreHaut}
        <div style={{ padding: 22 }}>
          <div style={{ fontSize: 22, fontWeight: 500, color: '#202124', marginBottom: 12 }}>{q.titre}</div>
          {q.intro?.map((p, i) => <p key={i} style={{ fontSize: 14, color: '#5F6368', lineHeight: 1.6, margin: '0 0 8px' }}>{p}</p>)}
          <button onClick={() => { setDemarre(true); setParcours([]) }} style={{ marginTop: 14, background: couleur, color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '10px 22px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Commencer</button>
        </div>
      </div>
    )
  }

  if (fini) {
    return (
      <div style={cadre}>
        {barreHaut}
        <div style={{ padding: 28, textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#E6F4EA', color: '#1E8E3E', fontSize: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>✓</div>
          {q.final?.map((p, i) => <p key={i} style={{ fontSize: i === 0 ? 18 : 14, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? '#202124' : '#5F6368', margin: '0 0 8px' }}>{p}</p>)}
          <button onClick={reset} style={{ marginTop: 14, background: 'transparent', color: couleur, border: `1px solid ${couleur}`, borderRadius: 6, padding: '8px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Recommencer</button>
        </div>
      </div>
    )
  }

  return (
    <div style={cadre}>
      {barreHaut}
      <div style={{ height: 4, background: '#F1F3F4' }}><div style={{ height: '100%', width: `${progression}%`, background: couleur, transition: 'width .3s' }} /></div>
      <div style={{ padding: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: couleur, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Question {question?.numero} {question?.obligatoire && <span style={{ color: '#D93025' }}>*</span>}</div>
        <div style={{ fontSize: 16, color: '#202124', lineHeight: 1.5, marginBottom: 18 }}>{question?.libelle}</div>

        {question?.type === 'unique' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {question.options?.map((o) => {
              const on = reps[courant] === o.libelle
              return (
                <button key={o.libelle} onClick={() => set(o.libelle)} style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', border: `1px solid ${on ? couleur : '#DADCE0'}`, background: on ? '#FDECEC' : '#FFFFFF', borderRadius: 8, padding: '11px 14px', fontSize: 14.5, color: '#202124', cursor: 'pointer' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${on ? couleur : '#9AA0A6'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{on && <span style={{ width: 8, height: 8, borderRadius: '50%', background: couleur }} />}</span>
                  {o.libelle}
                </button>
              )
            })}
          </div>
        )}

        {question?.type === 'likert' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Pas du tout d\u2019accord', 'Plutôt pas d\u2019accord', 'Plutôt d\u2019accord', 'Tout à fait d\u2019accord'].map((o) => {
              const on = reps[courant] === o
              return (
                <button key={o} onClick={() => set(o)} style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', border: `1px solid ${on ? couleur : '#DADCE0'}`, background: on ? '#FDECEC' : '#FFFFFF', borderRadius: 8, padding: '11px 14px', fontSize: 14.5, color: '#202124', cursor: 'pointer' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${on ? couleur : '#9AA0A6'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{on && <span style={{ width: 8, height: 8, borderRadius: '50%', background: couleur }} />}</span>
                  {o}
                </button>
              )
            })}
          </div>
        )}

        {question?.type === 'echelle' && (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {Array.from({ length: (question.max ?? 10) - (question.min ?? 1) + 1 }).map((_, i) => {
                const n = (question.min ?? 1) + i
                const on = reps[courant] === String(n)
                return (
                  <button key={n} onClick={() => set(String(n))} style={{ width: 42, height: 42, borderRadius: '50%', border: `2px solid ${on ? couleur : '#DADCE0'}`, background: on ? couleur : '#FFFFFF', color: on ? '#FFFFFF' : '#5F6368', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>{n}</button>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#9AA0A6' }}><span>{question.min ?? 1} (faible)</span><span>{question.max ?? 10} (excellent)</span></div>
          </div>
        )}

        {question?.type === 'texte' && (
          <textarea value={reps[courant] ?? ''} onChange={(e) => set(e.target.value)} rows={3} placeholder="Votre réponse…" style={{ width: '100%', boxSizing: 'border-box', border: 'none', borderBottom: `2px solid ${couleur}`, fontSize: 14.5, padding: '6px 2px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 }}>
          <span style={{ fontSize: 12, color: '#9AA0A6' }}>Question {index + 1} sur {q.questions.length}</span>
          <button onClick={avancer} disabled={!repondu} style={{ background: repondu ? couleur : '#E0E0E0', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '9px 24px', fontSize: 14.5, fontWeight: 600, cursor: repondu ? 'pointer' : 'not-allowed' }}>{(question?.saut === 'fin' || (question?.type === 'unique' && question.options?.some((o) => o.saut === 'fin' && o.libelle === reps[courant]))) ? 'Valider' : 'Suivant'}</button>
        </div>
      </div>
    </div>
  )
}

// Mockup smartphone affichant une page Instagram cliquable qui ouvre le
// questionnaire integre (sans quitter l'app).
function InstagramTelephoneVue({ data, questionnaire, couleur }: { data: NonNullable<BlocDocumentTexte['instagramTelephone']>; questionnaire?: BlocDocumentTexte['questionnaire']; couleur: string }) {
  const [ouvert, setOuvert] = useState(false)
  const cadreTel: React.CSSProperties = { width: 340, maxWidth: '100%', margin: '0 auto', border: '11px solid #1A1A1A', borderRadius: 40, overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 12px 34px rgba(0,0,0,0.28)' }
  return (
    <div style={cadreTel}>
      <div style={{ height: 26, background: '#1A1A1A', position: 'relative' }}><div style={{ width: 130, height: 20, background: '#1A1A1A', borderRadius: '0 0 14px 14px', position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 0 }} /></div>
      {!ouvert ? (
        <div style={{ fontFamily: '-apple-system, Segoe UI, Roboto, Arial, sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: '1px solid #DBDBDB' }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{data.compte}</span>
            <span style={{ fontSize: 12, color: '#3897F0', fontWeight: 600 }}>✔</span>
            <span style={{ marginLeft: 'auto', fontSize: 18 }}>⋯</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 12px' }}>
            <div style={{ width: 66, height: 66, borderRadius: '50%', padding: 3, background: 'linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf)' }}><div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: couleur, fontSize: 18, fontWeight: 800, fontStyle: 'italic' }}>free</span></div></div>
            <div style={{ display: 'flex', gap: 10, flex: 1, justifyContent: 'space-around', textAlign: 'center' }}>
              {[['publications', data.statistiques?.publications], ['abonnés', data.statistiques?.abonnes], ['suivi(e)s', data.statistiques?.abonnements]].map(([l, v]) => (
                <div key={l}><div style={{ fontSize: 15, fontWeight: 700 }}>{v}</div><div style={{ fontSize: 11, color: '#262626' }}>{l}</div></div>
              ))}
            </div>
          </div>
          <div style={{ padding: '0 12px 10px' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{data.sousTitre}</div>
            {data.bio?.map((b, i) => <div key={i} style={{ fontSize: 12.5, color: '#262626', lineHeight: 1.45 }}>{b}</div>)}
            <button onClick={() => setOuvert(true)} style={{ marginTop: 4, background: 'transparent', border: 'none', color: '#00376B', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>🔗 {data.libelleLien}</button>
          </div>
          <div style={{ display: 'flex', gap: 6, padding: '0 12px 10px' }}>
            <button onClick={() => setOuvert(true)} style={{ flex: 1, background: couleur, color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '7px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Répondre à l\u2019enquête</button>
            <span style={{ background: '#EFEFEF', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600 }}>Message</span>
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid #DBDBDB', borderBottom: '1px solid #DBDBDB' }}>
            <div style={{ flex: 1, textAlign: 'center', padding: 8, borderBottom: '2px solid #262626', fontSize: 16 }}>▦</div>
            <div style={{ flex: 1, textAlign: 'center', padding: 8, fontSize: 16, color: '#9AA0A6' }}>👤</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ aspectRatio: '1', background: i % 4 === 1 ? couleur : '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i % 4 === 1 ? '#FFFFFF' : '#B0B0B0', fontSize: 12, fontWeight: 700, fontStyle: 'italic' }}>{i % 4 === 1 ? 'Pop.' : 'free'}</div>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: '#9AA0A6', padding: 8 }}>Touchez le lien pour ouvrir le questionnaire</div>
        </div>
      ) : (
        <div style={{ maxHeight: 580, overflowY: 'auto', background: '#FAFAFA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#FFFFFF', borderBottom: '1px solid #DBDBDB', position: 'sticky', top: 0, zIndex: 2 }}>
            <button onClick={() => setOuvert(false)} style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>‹</button>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#262626' }}>🔒 forms.gle</span>
          </div>
          <div style={{ padding: 10 }}>
            {questionnaire ? <QuestionnaireVue q={questionnaire} couleur={couleur} compact /> : <div style={{ fontSize: 13, color: '#5F6368', textAlign: 'center' }}>Questionnaire indisponible.</div>}
          </div>
        </div>
      )}
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
  if (annexe.type === 'clientele') return rendreClientele(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'concurrents') return rendreConcurrents(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'questionsreponses') return rendreQuestionsReponses(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'freins') return rendreFreins(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'ficheclient') return rendreFicheClient(annexe, saisies, set, verrouille)
  if (annexe.type === 'planning') return rendrePlanning(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'boncommande') return rendreBonCommande(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'boncommandecalcule') return <BonCommandeCalculeVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'crmclients') return <CrmClientsVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'etatFrais') return <EtatFraisVue id={annexe.id} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'etapeslivraison') return rendreEtapesLivraison(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'bulle') return rendreBulle(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'maillecture') return rendreMailLecture(annexe)
  if (annexe.type === 'critereseg') return rendreCritereSeg(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'pratiques') return rendrePratiques(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'questionnaire') return <QuestionnaireAnnexeVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
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
  if (annexe.type === 'histogramme') return <HistogrammeAnnexeVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'identiteentreprise') return rendreIdentiteEntreprise(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'choixphotos') return <ChoixPhotosVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'parcours') return <ParcoursVue a={annexe} couleur={couleur} />
  if (annexe.type === 'cartevisite') return <CarteVisiteVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'ecarte') return <ECarteVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'cochage') return rendreCochage(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'reformulation') return rendreReformulation(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'fichetechnique') return rendreFicheTechnique(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'reponsereseau') return rendreReponseReseau(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'argumentaire') return rendreArgumentaire(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'ficheappel') return rendreFicheAppel(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'mail') return rendreMail(annexe, saisies, set, verrouille)
  if (annexe.type === 'sms') return rendreSms(annexe, saisies, set, verrouille)
  if (annexe.type === 'faqonglets') return <FaqOngletsVue a={annexe} couleur={couleur} />
  if (annexe.type === 'savprisencharge') return <SavPriseEnChargeVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'pourcentagestepper') return <PourcentageStepperVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'tableaupct') return <TableauPctVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} jauneEntete={annexe.id === 'annexe4' || annexe.id === 'annexe5'} />
  if (annexe.type === 'lienqr') return <LienQrVue a={annexe} couleur={couleur} />
  if (annexe.type === 'questionnairebuilder') return <QuestionnaireBuilderVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'compterendu') return <CompteRenduVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'objectionscrm') return <ObjectionsCrmVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'faqpro') return <FaqProVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'vraifaux') return <VraiFauxVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'ficheproduitpro') return <FicheProduitProVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'soncaspro') return <SoncasProVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'mobilespro') return <MobilesProVue a={annexe} saisies={saisies} set={set} verrouille={verrouille} couleur={couleur} />
  if (annexe.type === 'ficheproduit') return rendreFicheProduit(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'cap') return rendreCap(annexe, saisies, set, champStyle, couleur)
  if (annexe.type === 'configurateur') return rendreConfigurateur(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'dialogue') return rendreDialogue(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'soncase') return rendreSonCase(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'objections') return rendreObjections(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'traitobjections') return rendreTraitObjections(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'simulateur') return rendreSimulateur(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'catalogue') return rendreCatalogue(annexe, saisies, set, verrouille, couleur)
  if (annexe.type === 'note') return rendreMailLecture({ type: 'maillecture', id: annexe.id, titre: annexe.titre, de: annexe.de ?? '', a: annexe.a ?? '', objet: annexe.objet ?? '', corps: annexe.corps ?? [] })
  if (annexe.type === 'organigramme') return rendreOrganigramme(annexe, saisies, set, champStyle, verrouille, couleur)
  return rendreOrganigramme(annexe as AnnexeOrganigramme, saisies, set, champStyle, verrouille, couleur)
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

// Logiciel PIM "fiche produit" generique a onglets (Hydrao M3 : annexes 1 et 2).
function FicheProduitProVue({ a, saisies, set, verrouille, couleur }: { a: AnnexeFicheProduitPro; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string }) {
  const [onglet, setOnglet] = useState<string>(a.onglets[0].id)
  const courant = a.onglets.find((o) => o.id === onglet) ?? a.onglets[0]
  const champ: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '7px 9px', borderRadius: 6,
    border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF',
    color: verrouille ? '#6B7280' : '#1F2933', width: '100%', boxSizing: 'border-box',
  }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        <div style={{ border: '1px solid #C9D6E3', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ background: '#16456E', color: '#FFFFFF', padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B9E5A', display: 'inline-block' }} />
            {a.entete}
          </div>
          {(a.produit || a.image) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderBottom: '1px solid #EEF2F5', background: '#F8FAFC' }}>
              {a.image && <img src={a.image} alt={a.produit ?? ''} style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 6, border: '1px solid #E3ECF4' }} />}
              <div>
                {a.produit && <div style={{ fontSize: 14, fontWeight: 700, color: '#16456E' }}>{a.produit}</div>}
                {a.reference && <div style={{ fontSize: 11, color: '#6B7280' }}>{a.reference}</div>}
              </div>
            </div>
          )}
          {a.onglets.length > 1 && (
            <div style={{ display: 'flex' }}>
              {a.onglets.map((o) => (
                <button key={o.id} type="button" onClick={() => setOnglet(o.id)} style={{
                  flex: 1, border: 'none', cursor: 'pointer', padding: '9px 8px', fontFamily: 'Arial, sans-serif',
                  fontSize: 13, fontWeight: onglet === o.id ? 700 : 500,
                  color: onglet === o.id ? '#FFFFFF' : '#4B5563',
                  background: onglet === o.id ? couleur : '#EEF3F8',
                }}>{o.label}</button>
              ))}
            </div>
          )}
          <div style={{ padding: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: couleur, marginBottom: 8 }}>{courant.label}</div>
            {courant.mode === 'soncas' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {courant.lignes.map((l, idx) => (
                  <div key={l.id} style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 12, background: '#FFFFFF' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                      <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: couleur, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{idx + 1}</span>
                      <div style={{ fontSize: 14, color: '#1F2933', fontStyle: 'italic', lineHeight: 1.5 }}>« {l.libelle} »</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 34 }}>
                      <span style={{ fontSize: 13, color: '#6B7280' }}>{courant.colonneMenu ?? 'SONCAS'} :</span>
                      <select disabled={verrouille} value={saisies[`${a.id}.${l.id}`] ?? ''} onChange={(e) => set(`${a.id}.${l.id}`, e.target.value)} style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '6px 10px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933' }}>
                        <option value="">— Choisir —</option>
                        {(courant.options ?? []).map((o) => (<option key={o} value={o}>{o}</option>))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
                {courant.lignes.map((l) => (
                  <tr key={l.id} style={{ borderTop: '1px solid #EEF2F5' }}>
                    <td style={{ padding: '6px 8px', fontSize: 13, color: '#374151', width: '42%' }}>{l.libelle}</td>
                    <td style={{ padding: '6px 8px' }}>
                      <input type="text" disabled={verrouille} value={saisies[`${a.id}.${l.id}`] ?? ''} onChange={(e) => set(`${a.id}.${l.id}`, e.target.value)} style={champ} />
                    </td>
                  </tr>
                ))}
              </tbody></table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Analyseur SONCAS : affirmation fixe + menu deroulant typologie + note (Hydrao M3 annexe 3).
function SoncasProVue({ a, saisies, set, verrouille, couleur }: { a: AnnexeSoncasPro; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string }) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        <div style={{ border: '1px solid #C9D6E3', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ background: '#16456E', color: '#FFFFFF', padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B9E5A', display: 'inline-block' }} />
            {a.entete}
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {a.lignes.map((l, idx) => (
              <div key={l.id} style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 12, background: '#FFFFFF' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: couleur, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{idx + 1}</span>
                  <div style={{ fontSize: 14, color: '#1F2933', fontStyle: 'italic', lineHeight: 1.5 }}>« {l.affirmation} »</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingLeft: 34, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>Typologie SONCAS :</span>
                    <select disabled={verrouille} value={saisies[`${a.id}.${l.id}.type`] ?? ''} onChange={(e) => set(`${a.id}.${l.id}.type`, e.target.value)} style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '6px 10px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933' }}>
                      <option value="">— Choisir —</option>
                      {a.options.map((o) => (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                  {a.colonneNote && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
                      <span style={{ fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{a.colonneNote} :</span>
                      <input type="text" disabled={verrouille} value={saisies[`${a.id}.${l.id}.note`] ?? ''} onChange={(e) => set(`${a.id}.${l.id}.note`, e.target.value)} style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '6px 8px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', flex: 1, boxSizing: 'border-box' }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Panneau image de marque + mobiles d'achat (Hydrao M3 annexe 4).
function MobilesProVue({ a, saisies, set, verrouille, couleur }: { a: AnnexeMobilesPro; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string }) {
  const champ: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '7px 9px', borderRadius: 6,
    border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF',
    color: verrouille ? '#6B7280' : '#1F2933', width: '100%', boxSizing: 'border-box',
  }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        <div style={{ border: '1px solid #C9D6E3', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ background: '#16456E', color: '#FFFFFF', padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B9E5A', display: 'inline-block' }} />
            {a.entete}
          </div>
          <div style={{ padding: 12 }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #E3ECF4', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: couleur, marginBottom: 6 }}>{a.imageLabel}</div>
              {a.imageOptions ? (
                <select disabled={verrouille} value={saisies[`${a.id}.image`] ?? ''} onChange={(e) => set(`${a.id}.image`, e.target.value)} style={{ ...champ }}>
                  <option value="">— Choisir —</option>
                  {a.imageOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
                </select>
              ) : (
                <input type="text" disabled={verrouille} value={saisies[`${a.id}.image`] ?? ''} onChange={(e) => set(`${a.id}.image`, e.target.value)} style={champ} />
              )}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: couleur, marginBottom: 8 }}>Mobiles d'achat mis en avant</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: a.nbMobiles }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', background: '#FFFFFF' }}>
                  <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: couleur, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                  <select disabled={verrouille} value={saisies[`${a.id}.m${i}.type`] ?? ''} onChange={(e) => set(`${a.id}.m${i}.type`, e.target.value)} style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '6px 10px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', width: 150, flexShrink: 0 }}>
                    <option value="">— SONCAS —</option>
                    {a.optionsMobile.map((o) => (<option key={o} value={o}>{o}</option>))}
                  </select>
                  <input type="text" disabled={verrouille} placeholder="Élément d'Hydrao qui le met en avant" value={saisies[`${a.id}.m${i}.justif`] ?? ''} onChange={(e) => set(`${a.id}.m${i}.justif`, e.target.value)} style={{ ...champ, flex: 1 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Version inline (dans un document riche) de la FAQ a onglets.
function FaqOngletsInline({ rubriques, couleur }: { rubriques: { id: string; nom: string; qr: { q: string; r: string }[] }[]; couleur: string }) {
  const [rub, setRub] = useState(rubriques[0].id)
  const [ouvert, setOuvert] = useState<string | null>(null)
  const courant = rubriques.find((r) => r.id === rub) ?? rubriques[0]
  return (
    <div style={{ border: '1px solid #C9D6E3', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #E5EAF0' }}>
        {rubriques.map((r) => (
          <button key={r.id} type="button" onClick={() => { setRub(r.id); setOuvert(null) }} style={{
            border: 'none', cursor: 'pointer', padding: '10px 14px', fontFamily: 'Arial, sans-serif', fontSize: 12.5,
            fontWeight: rub === r.id ? 700 : 500, color: rub === r.id ? couleur : '#5B6B7B',
            background: rub === r.id ? '#FFFFFF' : '#F4F7FB', borderBottom: rub === r.id ? `3px solid ${couleur}` : '3px solid transparent',
          }}>{r.nom}</button>
        ))}
      </div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {courant.qr.map((item, i) => {
          const cle = `${courant.id}-${i}`
          const open = ouvert === cle
          return (
            <div key={i} style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
              <button type="button" onClick={() => setOuvert(open ? null : cle)} style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', background: open ? '#F7FAFC' : '#FFFFFF', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Arial, sans-serif' }}>
                <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: couleur, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{open ? '−' : '+'}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1F2933' }}>{item.q}</span>
              </button>
              {open && <div style={{ padding: '10px 12px 12px 42px', fontSize: 13, color: '#374151', lineHeight: 1.6, background: '#FBFDFF', borderTop: '1px solid #EEF2F5', whiteSpace: 'pre-line' }}>{item.r}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// FAQ a onglets (consultation) facon logiciel SAV (Hydrao M6 document 2).
function FaqOngletsVue({ a, couleur }: { a: AnnexeFaqOnglets; couleur: string }) {
  const [rub, setRub] = useState(a.rubriques[0].id)
  const [ouvert, setOuvert] = useState<string | null>(null)
  const courant = a.rubriques.find((r) => r.id === rub) ?? a.rubriques[0]
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        <div style={{ border: '1px solid #C9D6E3', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ background: '#16456E', color: '#FFFFFF', padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B9E5A', display: 'inline-block' }} />
            {a.entete}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, borderBottom: '1px solid #E5EAF0' }}>
            {a.rubriques.map((r) => (
              <button key={r.id} type="button" onClick={() => { setRub(r.id); setOuvert(null) }} style={{
                border: 'none', cursor: 'pointer', padding: '10px 14px', fontFamily: 'Arial, sans-serif', fontSize: 12.5,
                fontWeight: rub === r.id ? 700 : 500, color: rub === r.id ? couleur : '#5B6B7B',
                background: rub === r.id ? '#FFFFFF' : '#F4F7FB', borderBottom: rub === r.id ? `3px solid ${couleur}` : '3px solid transparent',
              }}>{r.nom}</button>
            ))}
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, color: '#8A94A0', marginBottom: 2 }}>Rubrique : <b style={{ color: couleur }}>{courant.nom}</b></div>
            {courant.qr.map((item, i) => {
              const cle = `${courant.id}-${i}`
              const open = ouvert === cle
              return (
                <div key={i} style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                  <button type="button" onClick={() => setOuvert(open ? null : cle)} style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', background: open ? '#F7FAFC' : '#FFFFFF', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Arial, sans-serif' }}>
                    <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: couleur, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{open ? '−' : '+'}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1F2933' }}>{item.q}</span>
                  </button>
                  {open && <div style={{ padding: '10px 12px 12px 42px', fontSize: 13, color: '#374151', lineHeight: 1.6, background: '#FBFDFF', borderTop: '1px solid #EEF2F5', whiteSpace: 'pre-line' }}>{item.r}</div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Logiciel SAV "prise en charge" a completer (Hydrao M6 annexe 2).
function SavPriseEnChargeVue({ a, saisies, set, verrouille, couleur }: { a: AnnexeSavPriseEnCharge; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string }) {
  const champ: React.CSSProperties = { fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '6px 8px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', width: '100%', boxSizing: 'border-box' }
  const Case = ({ id, label }: { id: string; label: string }) => {
    const on = (saisies[`${a.id}.${id}`] ?? '') === 'x'
    return (
      <button type="button" disabled={verrouille} onClick={() => set(`${a.id}.${id}`, on ? '' : 'x')} style={{ cursor: verrouille ? 'default' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', fontFamily: 'Arial, sans-serif', fontSize: 12.5, color: '#374151', padding: '2px 4px' }}>
        <span style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${on ? couleur : '#B7C2CF'}`, background: on ? couleur : '#FFFFFF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{on ? '✓' : ''}</span>
        {label}
      </button>
    )
  }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        <div style={{ border: '1px solid #C9D6E3', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ background: '#16456E', color: '#FFFFFF', padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B9E5A', display: 'inline-block' }} />
            {a.entete}
          </div>
          <div style={{ padding: 12 }}>
            <div style={{ background: '#F7FAFC', border: '1px solid #E3ECF4', borderRadius: 8, padding: '10px 12px', marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#16456E' }}>Renseignement client</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 12.5, color: '#374151' }}>NOM :</span><input type="text" disabled={verrouille} value={saisies[`${a.id}.nom`] ?? ''} onChange={(e) => set(`${a.id}.nom`, e.target.value)} style={{ ...champ, width: 140 }} /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 12.5, color: '#374151' }}>PRÉNOM :</span><input type="text" disabled={verrouille} value={saisies[`${a.id}.prenom`] ?? ''} onChange={(e) => set(`${a.id}.prenom`, e.target.value)} style={{ ...champ, width: 140 }} /></div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #C9D6E3' }}>
                <thead><tr>
                  {['Garantie', 'Type produits', 'Type de problème', 'Réparable / Non réparable', 'Solution proposée'].map((h) => (
                    <th key={h} style={{ background: couleur, color: '#FFFFFF', fontSize: 12, fontWeight: 700, padding: '8px 8px', textAlign: 'left', border: '1px solid #C9D6E3' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {a.lignes.map((l) => (
                    <tr key={l.id}>
                      <td style={{ border: '1px solid #C9D6E3', padding: '6px 8px', verticalAlign: 'top' }}><div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><Case id={`${l.id}.gOui`} label="Oui" /><Case id={`${l.id}.gNon`} label="Non" /></div></td>
                      <td style={{ border: '1px solid #C9D6E3', padding: '6px 8px', verticalAlign: 'top' }}><Case id={`${l.id}.produit`} label={l.produit} /></td>
                      <td style={{ border: '1px solid #C9D6E3', padding: '6px 8px', verticalAlign: 'top' }}><Case id={`${l.id}.probleme`} label={l.probleme} /></td>
                      <td style={{ border: '1px solid #C9D6E3', padding: '6px 8px', verticalAlign: 'top' }}><div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><Case id={`${l.id}.rep`} label="Réparable" /><Case id={`${l.id}.nonRep`} label="Non réparable" /></div></td>
                      <td style={{ border: '1px solid #C9D6E3', padding: 4, verticalAlign: 'top', minWidth: 180 }}><textarea disabled={verrouille} rows={3} value={saisies[`${a.id}.${l.id}.sol`] ?? ''} onChange={(e) => set(`${a.id}.${l.id}.sol`, e.target.value)} style={{ ...champ, resize: 'vertical' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tableau de % par etapes (Precedent/Suivant), un theme par etape (M7 annexe 3).
function PourcentageStepperVue({ a, saisies, set, verrouille, couleur }: { a: AnnexePourcentageStepper; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string }) {
  const [etape, setEtape] = useState(0)
  const total = a.etapes.length
  const e = a.etapes[Math.min(etape, total - 1)]
  const vert = '#7AA85C', vertClair = '#DCE9CE', jaune = '#FBF3D0'
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        <div style={{ border: '1px solid #C9D6E3', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ background: '#16456E', color: '#FFFFFF', padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B9E5A', display: 'inline-block' }} />
            {a.entete}
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600 }}>Étape {etape + 1} / {total}</span>
          </div>
          <div style={{ height: 4, background: '#E5EAF0' }}><div style={{ height: '100%', width: `${((etape + 1) / total) * 100}%`, background: couleur, transition: 'width .2s' }} /></div>
          <div style={{ padding: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#4B6B33', marginBottom: 10 }}>{e.theme}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #C9D6E3' }}>
              <thead><tr>
                <th style={{ background: vert, color: '#FFFFFF', fontSize: 12.5, fontWeight: 700, padding: '8px 10px', textAlign: 'center', border: '1px solid #C9D6E3', width: '55%' }}>{a.colonnes[1]}</th>
                <th style={{ background: vert, color: '#FFFFFF', fontSize: 12.5, fontWeight: 700, padding: '8px 10px', textAlign: 'center', border: '1px solid #C9D6E3', width: '45%' }}>{a.colonnes[2]}</th>
              </tr></thead>
              <tbody>
                {e.lignes.map((l, i) => (
                  <tr key={i}>
                    <td style={{ background: vertClair, fontSize: 13, color: '#2F3A22', padding: '7px 10px', border: '1px solid #C9D6E3' }}>{l}</td>
                    <td style={{ background: jaune, padding: 4, border: '1px solid #C9D6E3' }}>
                      <input type="text" disabled={verrouille} value={saisies[`${a.id}.${etape}.${i}`] ?? ''} onChange={(ev) => set(`${a.id}.${etape}.${i}`, ev.target.value)} style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '5px 8px', borderRadius: 4, border: '1px solid #D8CE9A', background: verrouille ? '#F1F3F5' : '#FFFDF3', color: '#1F2933', width: '100%', boxSizing: 'border-box', textAlign: 'center' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
              <button type="button" onClick={() => setEtape((x) => Math.max(0, x - 1))} disabled={etape === 0} style={{ cursor: etape === 0 ? 'default' : 'pointer', opacity: etape === 0 ? 0.4 : 1, border: '1px solid #C9D6E3', background: '#FFFFFF', color: '#374151', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700 }}>‹ Précédent</button>
              <div style={{ display: 'flex', gap: 5 }}>{a.etapes.map((_, i) => <span key={i} onClick={() => setEtape(i)} style={{ cursor: 'pointer', width: 8, height: 8, borderRadius: '50%', background: i === etape ? couleur : '#D5DCE4' }} />)}</div>
              <button type="button" onClick={() => setEtape((x) => Math.min(total - 1, x + 1))} disabled={etape === total - 1} style={{ cursor: etape === total - 1 ? 'default' : 'pointer', opacity: etape === total - 1 ? 0.4 : 1, border: 'none', background: couleur, color: '#FFFFFF', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700 }}>Suivant ›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tableau a libelles fixes, colonne theme fusionnee, une colonne a saisir (M7 annexes 4/5).
function TableauPctVue({ a, saisies, set, verrouille, jauneEntete }: { a: AnnexeTableauPct; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; jauneEntete: boolean }) {
  const entete = jauneEntete ? '#E9C96B' : '#7AA85C'
  const themeBg = jauneEntete ? '#F2DE9E' : '#A9C48C'
  const cellBg = jauneEntete ? '#FBF3D0' : '#DCE9CE'
  const champBg = jauneEntete ? '#FCF6DE' : '#EFF6E7'
  const txt = '#2F3A22'
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        <div style={{ border: '1px solid #C9D6E3', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ background: '#16456E', color: '#FFFFFF', padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B9E5A', display: 'inline-block' }} />
            {a.entete}
          </div>
          <div style={{ padding: 12, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #BFCBA6' }}>
              <thead><tr>
                {a.colonnes.map((c, i) => (
                  <th key={i} style={{ background: entete, color: '#33401F', fontSize: 12.5, fontWeight: 800, padding: '8px 10px', textAlign: 'center', border: '1px solid #C9D6E3', width: i === 0 ? '30%' : i === 1 ? '46%' : '24%' }}>{c}</th>
                ))}
              </tr></thead>
              <tbody>
                {a.groupes.map((g, gi) => g.lignes.map((l, li) => (
                  <tr key={`${gi}-${li}`}>
                    {li === 0 && <td rowSpan={g.lignes.length} style={{ background: themeBg, fontSize: 13, fontWeight: 600, color: txt, padding: '7px 10px', border: '1px solid #C9D6E3', verticalAlign: 'middle' }}>{g.theme}</td>}
                    <td style={{ background: cellBg, fontSize: 13, color: txt, padding: '6px 10px', border: '1px solid #C9D6E3' }}>{l}</td>
                    <td style={{ background: champBg, padding: 3, border: '1px solid #C9D6E3' }}>
                      <input type="text" disabled={verrouille} value={saisies[`${a.id}.${gi}.${li}`] ?? ''} onChange={(e) => set(`${a.id}.${gi}.${li}`, e.target.value)} style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '5px 8px', borderRadius: 4, border: '1px solid #D8CE9A', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: '#1F2933', width: '100%', boxSizing: 'border-box', textAlign: 'center' }} />
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// Annexe lien / QR Code (Hydrao M7 annexe 2b) : carte avec bouton lien + QR.
function LienQrVue({ a, couleur }: { a: AnnexeLienQr; couleur: string }) {
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(a.lien)}`
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        <div style={{ border: '1px solid #C9D6E3', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ background: '#16456E', color: '#FFFFFF', padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B9E5A', display: 'inline-block' }} />
            {a.entete}
          </div>
          <div style={{ padding: 16, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <img src={qr} alt="QR Code" style={{ width: 150, height: 150, border: '1px solid #E5EAF0', borderRadius: 8, padding: 6, background: '#FFFFFF' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 220, flex: 1 }}>
              {a.consigne && <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{a.consigne}</div>}
              <a href={a.lien} target="_blank" rel="noreferrer" style={{ alignSelf: 'flex-start', background: couleur, color: '#FFFFFF', fontSize: 13, fontWeight: 700, padding: '10px 18px', borderRadius: 8, textDecoration: 'none' }}>{a.boutonLibelle ?? 'Ouvrir le questionnaire'}</a>
              <div style={{ fontSize: 11, color: '#8A94A0', wordBreak: 'break-all' }}>{a.lien}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Constructeur de questionnaire facon logiciel d'enquete (Hydrao M7 annexe 1).
function QuestionnaireBuilderVue({ a, saisies, set, verrouille, couleur }: { a: AnnexeQuestionnaireBuilder; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string }) {
  const champ: React.CSSProperties = { fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '7px 9px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', width: '100%', boxSizing: 'border-box' }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        <div style={{ border: '1px solid #C9D6E3', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ background: '#16456E', color: '#FFFFFF', padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B9E5A', display: 'inline-block' }} />
            {a.entete}
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {a.parties.map((p, pi) => (
              <div key={p.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#FFFFFF', background: couleur, borderRadius: 4, padding: '3px 10px' }}>PARTIE {pi + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#16456E' }}>{p.titre}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: couleur, border: `1px solid ${couleur}`, borderRadius: 20, padding: '2px 10px' }}>{p.typeQuestion}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {p.items.map((it, ii) => (
                    <div key={it.id} style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 12, background: '#FBFDFF' }}>
                      <div style={{ fontSize: 11, color: '#8A94A0', marginBottom: 4 }}>Aspect : {it.libelle}</div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: couleur, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{ii + 1}</span>
                        <input type="text" disabled={verrouille} placeholder="Rédigez l'intitulé de votre question…" value={saisies[`${a.id}.${p.id}.${it.id}.q`] ?? ''} onChange={(e) => set(`${a.id}.${p.id}.${it.id}.q`, e.target.value)} style={champ} />
                      </div>
                      <div style={{ fontSize: 11, color: '#8A94A0', marginBottom: 4, paddingLeft: 32 }}>Modalités de réponse ({p.typeQuestion})</div>
                      <div style={{ paddingLeft: 32 }}>
                        <textarea disabled={verrouille} rows={2} placeholder="Saisissez les réponses possibles…" value={saisies[`${a.id}.${p.id}.${it.id}.r`] ?? ''} onChange={(e) => set(`${a.id}.${p.id}.${it.id}.r`, e.target.value)} style={{ ...champ, resize: 'vertical' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Editeur de compte-rendu facon traitement de texte pro (Hydrao M7 annexe 7).
function CompteRenduVue({ a, saisies, set, verrouille, couleur }: { a: AnnexeCompteRendu; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string }) {
  const champ: React.CSSProperties = { fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '7px 9px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', width: '100%', boxSizing: 'border-box' }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        <div style={{ border: '1px solid #C9D6E3', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ background: '#16456E', color: '#FFFFFF', padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B9E5A', display: 'inline-block' }} />
            {a.entete}
          </div>
          <div style={{ display: 'flex', gap: 4, padding: '6px 12px', borderBottom: '1px solid #EEF2F5', background: '#F7FAFC', fontSize: 13, color: '#8A94A0' }}>
            <span style={{ fontWeight: 700 }}>B</span><span style={{ fontStyle: 'italic' }}>I</span><span style={{ textDecoration: 'underline' }}>U</span><span style={{ marginLeft: 8 }}>≡</span>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ textAlign: 'center', fontSize: 15, fontWeight: 800, color: '#16456E', marginBottom: 12, letterSpacing: 1 }}>COMPTE-RENDU D'ANALYSE</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {a.champsEntete.map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', minWidth: 84 }}>{c.label} :</span>
                  <input type="text" disabled={verrouille} value={saisies[`${a.id}.${c.id}`] ?? ''} onChange={(e) => set(`${a.id}.${c.id}`, e.target.value)} style={champ} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {a.sections.map((s) => (
                <div key={s.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ width: 4, height: 15, background: couleur, borderRadius: 2 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#16456E' }}>{s.titre}</span>
                  </div>
                  {s.indice && <div style={{ fontSize: 11, color: '#8A94A0', marginBottom: 4, paddingLeft: 12 }}>{s.indice}</div>}
                  <textarea disabled={verrouille} rows={3} placeholder="Rédigez cette partie…" value={saisies[`${a.id}.${s.id}`] ?? ''} onChange={(e) => set(`${a.id}.${s.id}`, e.target.value)} style={{ ...champ, resize: 'vertical' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Logiciel CRM traitement d'objections (Hydrao M5 annexe).
function ObjectionsCrmVue({ a, saisies, set, verrouille, couleur }: { a: AnnexeObjectionsCrm; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string }) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        <div style={{ border: '1px solid #C9D6E3', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ background: '#16456E', color: '#FFFFFF', padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B9E5A', display: 'inline-block' }} />
            {a.entete}
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {a.clients.map((cl) => (
              <div key={cl.id} style={{ border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#F7FAFC', borderBottom: '1px solid #EEF2F5' }}>
                  <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: couleur, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{cl.numero}</span>
                  <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>Prospect {cl.numero}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#FFFFFF', background: couleur, borderRadius: 20, padding: '3px 12px' }}>Technique : {cl.technique}</span>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ fontSize: 22, lineHeight: 1, color: couleur }}>“</span>
                    <div style={{ fontSize: 14, color: '#1F2933', fontStyle: 'italic', lineHeight: 1.5 }}>{cl.objection}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: couleur, marginBottom: 4 }}>Votre réponse à l'objection</div>
                  <textarea disabled={verrouille} rows={2} placeholder="Rédigez votre réponse en appliquant la technique imposée…" value={saisies[`${a.id}.${cl.id}`] ?? ''} onChange={(e) => set(`${a.id}.${cl.id}`, e.target.value)} style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '8px 9px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Base de connaissances "questions du tuteur" (Hydrao M4 annexe 1).
function FaqProVue({ a, saisies, set, verrouille, couleur }: { a: AnnexeFaqPro; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string }) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        <div style={{ border: '1px solid #C9D6E3', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ background: '#16456E', color: '#FFFFFF', padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B9E5A', display: 'inline-block' }} />
            {a.entete}
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {a.sections.map((sec) => (
              <div key={sec.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 4, height: 16, background: couleur, borderRadius: 2 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#16456E' }}>{sec.titre}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {sec.questions.map((q, idx) => (
                    <div key={q.id} style={{ border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', background: '#F7FAFC', borderBottom: '1px solid #EEF2F5' }}>
                        <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: couleur, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{idx + 1}</span>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2933', lineHeight: 1.45 }}>{q.question}</div>
                      </div>
                      <div style={{ padding: 10 }}>
                        <textarea disabled={verrouille} rows={2} placeholder="Votre réponse…" value={saisies[`${a.id}.${sec.id}.${q.id}`] ?? ''} onChange={(e) => set(`${a.id}.${sec.id}.${q.id}`, e.target.value)} style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '8px 9px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Outil "Vrai / Faux" a boutons + justification (Hydrao M4 annexe 2).
function VraiFauxVue({ a, saisies, set, verrouille, couleur }: { a: AnnexeVraiFaux; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string }) {
  const bouton = (lid: string, valeur: 'V' | 'F') => {
    const actif = (saisies[`${a.id}.${lid}.rep`] ?? '') === valeur
    const vert = valeur === 'V'
    const coulActif = vert ? '#1B9E5A' : '#D14343'
    return (
      <button type="button" disabled={verrouille} onClick={() => set(`${a.id}.${lid}.rep`, valeur)} style={{
        cursor: verrouille ? 'default' : 'pointer', border: `1.5px solid ${actif ? coulActif : '#C9D6E3'}`,
        background: actif ? coulActif : '#FFFFFF', color: actif ? '#FFFFFF' : '#4B5563',
        borderRadius: 8, padding: '6px 16px', fontSize: 13, fontWeight: 700, fontFamily: 'Arial, sans-serif',
      }}>{valeur === 'V' ? 'Vrai' : 'Faux'}</button>
    )
  }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        <div style={{ border: '1px solid #C9D6E3', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ background: '#16456E', color: '#FFFFFF', padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B9E5A', display: 'inline-block' }} />
            {a.entete}
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {a.lignes.map((l, idx) => (
              <div key={l.id} style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 12, background: '#FFFFFF' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: couleur, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{idx + 1}</span>
                  <div style={{ fontSize: 14, color: '#1F2933', fontStyle: 'italic', lineHeight: 1.5 }}>« {l.affirmation} »</div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10, paddingLeft: 32 }}>
                  {bouton(l.id, 'V')}
                  {bouton(l.id, 'F')}
                </div>
                <div style={{ paddingLeft: 32 }}>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Justification</div>
                  <textarea disabled={verrouille} rows={2} placeholder="Justifiez votre réponse…" value={saisies[`${a.id}.${l.id}.justif`] ?? ''} onChange={(e) => set(`${a.id}.${l.id}.justif`, e.target.value)} style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '8px 9px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
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
        {a.enteteTitre ?? "Prime à la conversion — Test d'éligibilité"}
      </div>

      {showProg && (
        <div style={{ padding: '11px 14px', borderBottom: '1px solid #EEF2F5', background: '#F8FAFC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 6 }}>
            <span>{resultat ? (a.libelleResultatProgression ?? 'Résultat') : `${a.libelleEtape ?? 'Étape'} ${numEtape} sur ${a.nbEtapesAffiche}`}</span>
            <span>{resultat ? (a.libelleResultatProgression ?? 'ÉLIGIBILITÉ') : etape?.bandeau}</span>
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
              <div style={{ fontSize: 18, fontWeight: 800 }}>{a.accrocheTitre ?? 'Testez votre éligibilité'}</div>
              <div style={{ fontSize: 15, fontStyle: 'italic' }}>{a.accrocheSousTitre ?? `… en ${a.nbEtapesAffiche} étapes maximum`}</div>
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
              {resultat.type === 'ok' ? (a.resultatTitreOk ?? 'Bonne nouvelle !') : 'Non éligible'}
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
        <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: a.largeurs ? 'fixed' : undefined, minWidth: a.colonnes.length > 2 ? 640 : undefined }}>
          <thead>
            <tr>
              {a.colonnes.map((c, ci) => (
                <th key={ci} style={{ padding: '6px 8px', fontSize: 12, fontWeight: 700, color: '#374151', borderBottom: '1px solid #ECEFF2', textAlign: 'left', width: a.largeurs?.[ci], whiteSpace: a.largeurs ? 'normal' : 'nowrap' }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((r) => (
              <tr key={r} style={{ borderTop: '1px solid #F1F3F5' }}>
                {a.colonnes.map((_, ci) => {
                  const fixe = a.prerempli?.[r]?.[ci]
                  if (fixe) {
                    return <td key={ci} style={{ padding: '8px 8px', fontSize: 13, fontWeight: 600, color: '#1F2933', background: '#F7F9FB', verticalAlign: 'top', width: a.largeurs?.[ci] }}>{fixe}</td>
                  }
                  return (
                    <td key={ci} style={{ padding: '4px 6px', verticalAlign: 'top', width: a.largeurs?.[ci] }}>
                      {a.reponseMultiligne
                        ? <textarea value={saisies[`${a.id}.r${r}.c${ci}`] ?? ''} onChange={(e) => set(`${a.id}.r${r}.c${ci}`, e.target.value)} rows={a.lignesReponse ?? 3} style={{ ...champStyle, width: '100%', minWidth: 120, resize: 'vertical' }} />
                        : <input type="text" value={saisies[`${a.id}.r${r}.c${ci}`] ?? ''} onChange={(e) => set(`${a.id}.r${r}.c${ci}`, e.target.value)} style={{ ...champStyle, minWidth: 100 }} />}
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

// Zone de reponse reseau social facon application : entete plateforme + fil de
// reponse (avatar Assistance Freebox), champ de redaction, bouton lien.
function rendreReponseReseau(a: AnnexeReponseReseau, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const fb = a.plateforme === 'facebook'
  const accent = fb ? '#1877F2' : '#1D9BF0'
  return (
    <div style={{ border: '1px solid #E1E8ED', borderRadius: 16, overflow: 'hidden', maxWidth: 560, background: '#FFFFFF', fontFamily: '-apple-system, Segoe UI, Roboto, Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid #EFF3F4' }}>
        {fb
          ? <svg viewBox="0 0 24 24" width="22" height="22" style={{ fill: accent }}><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" /></svg>
          : <span style={{ fontSize: 20, fontWeight: 900, color: '#0F1419' }}>𝕏</span>}
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0F1419' }}>{fb ? 'Répondre au commentaire' : 'Répondre'}</span>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 13, color: '#536471', marginBottom: 10 }}>En réponse à <span style={{ color: accent, fontWeight: 600 }}>{a.enReponseA}</span></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: '50%', background: couleur, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, fontStyle: 'italic' }}>free</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 14.5, color: '#0F1419' }}>Assistance Freebox</span>
              <svg viewBox="0 0 24 24" width="16" height="16" style={{ fill: accent }}><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" /></svg>
              {!fb && <span style={{ fontSize: 13, color: '#536471' }}>@free</span>}
            </div>
            <textarea value={saisies[`${a.id}.reponse`] ?? ''} onChange={(e) => set(`${a.id}.reponse`, e.target.value)} disabled={verrouille} rows={5} placeholder="Rédigez votre réponse…" style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 14.5, padding: '6px 0', border: 'none', outline: 'none', resize: 'vertical', lineHeight: 1.5, color: verrouille ? '#6B7280' : '#0F1419', borderBottom: `2px solid ${accent}` }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          {a.boutonLien
            ? <a href={a.boutonLien} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, fontWeight: 700, color: couleur, textDecoration: 'none', border: `1px solid ${couleur}`, borderRadius: 16, padding: '6px 12px' }}>🔗 {a.boutonLibelle ?? 'Répondre via le lien'}</a>
            : <span />}
          <span style={{ background: accent, color: '#FFFFFF', borderRadius: 18, padding: '7px 20px', fontSize: 14, fontWeight: 700 }}>{fb ? 'Publier' : 'Répondre'}</span>
        </div>
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
// Carte d'identite entreprise facon logiciel de fiche societe : champs libres +
// groupes de qualification a choix unique (boutons radio pro).
function rendreIdentiteEntreprise(a: AnnexeIdentiteEntreprise, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 14, padding: '8px 10px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none', resize: 'vertical' }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>🪪 {a.titre}</div>
      <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {a.champs.map((ch) => (
          <div key={ch.cle}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>{ch.libelle}</label>
            {(ch.lignes ?? 1) > 1
              ? <textarea value={saisies[`${a.id}.${ch.cle}`] ?? ''} onChange={(e) => set(`${a.id}.${ch.cle}`, e.target.value)} disabled={verrouille} rows={ch.lignes} placeholder={ch.placeholder} style={champ} />
              : <input value={saisies[`${a.id}.${ch.cle}`] ?? ''} onChange={(e) => set(`${a.id}.${ch.cle}`, e.target.value)} disabled={verrouille} placeholder={ch.placeholder} style={champ} />}
          </div>
        ))}
      </div>
      <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {a.qualifications.map((q) => {
          const val = saisies[`${a.id}.${q.cle}`] ?? ''
          return (
            <div key={q.cle} style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: '#F7F9FB', padding: '7px 10px', fontSize: 12.5, fontWeight: 700, color: '#374151', borderBottom: '1px solid #E2E8F0' }}>{q.libelle}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 10 }}>
                {q.options.map((opt) => {
                  const actif = val === opt
                  return (
                    <button key={opt} type="button" disabled={verrouille}
                      onClick={() => set(`${a.id}.${q.cle}`, actif ? '' : opt)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: `1.5px solid ${actif ? couleur : '#C9D6E3'}`, background: actif ? couleur : '#FFFFFF', color: actif ? '#FFFFFF' : '#374151', borderRadius: 20, padding: '6px 12px', fontSize: 12.5, fontWeight: actif ? 700 : 500, cursor: verrouille ? 'default' : 'pointer' }}>
                      <span style={{ width: 13, height: 13, borderRadius: '50%', border: `2px solid ${actif ? '#FFFFFF' : '#B0BAC5'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        {actif && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FFFFFF' }} />}
                      </span>
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

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
// Video d'introduction masquee d'emblee : l'eleve clique pour la reveler.
// Une fois revelee : lecteur integre (voir) + transcription depliable (lire),
// pour permettre lecture ET ecoute (eleves a besoins particuliers).
function VideoIntroRevelable({ v, couleur }: { v: NonNullable<ContenuTravaux['videoIntro']>; couleur: string }) {
  const [ouvert, setOuvert] = useState(false)
  const [lire, setLire] = useState(false)
  if (!ouvert) {
    return (
      <button type="button" onClick={() => setOuvert(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 12, padding: '10px 16px', borderRadius: 10, border: `1.5px solid ${couleur}`, background: couleur, color: '#FFFFFF', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
        {v.titre ?? "Cliquez pour voir la vidéo de présentation"}
      </button>
    )
  }
  return (
    <div style={{ marginTop: 12, border: `1px solid ${couleur}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{v.titre ?? 'Vidéo de présentation'}</span>
        <button type="button" onClick={() => setOuvert(false)} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: 18, cursor: 'pointer', lineHeight: 1 }} aria-label="Masquer la vidéo">×</button>
      </div>
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
        <iframe src={v.embedUrl} title={v.titre ?? 'Vidéo'} allow="autoplay" allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
      </div>
      {v.transcription && v.transcription.length > 0 && (
        <div style={{ padding: 12, background: '#F7F9FB' }}>
          <button type="button" onClick={() => setLire((x) => !x)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8, border: `1px solid ${couleur}`, background: '#FFFFFF', color: couleur, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {lire ? '▾' : '▸'} {lire ? 'Masquer la transcription' : 'Lire la vidéo (transcription écrite)'}
          </button>
          {lire && (
            <div style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.7, color: '#374151' }}>
              {v.transcription.map((p, i) => <p key={i} style={{ margin: i === 0 ? 0 : '8px 0 0' }}>{p}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Etat des frais professionnels facon logiciel Quiziniere : reproduit le
// document 9 d'Hydrao (6 sections numerotees). Tout saisissable.
function EtatFraisVue({ id, saisies, set, verrouille, couleur }: {
  id: string; saisies: Saisies; set: (k: string, v: string) => void; verrouille: boolean; couleur: string
}) {
  const [etape, setEtape] = useState(1)
  const BLEU = '#3FA9D6'
  const F = (cle: string, ph?: string) => (
    <input value={saisies[`${id}.${cle}`] ?? ''} onChange={(e) => set(`${id}.${cle}`, e.target.value)} disabled={verrouille} placeholder={ph}
      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '8px 10px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFDF5', outline: 'none' }} />
  )
  const chk = (cle: string, label: string) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: verrouille ? 'default' : 'pointer', padding: '8px 10px', border: '1px solid #E5EAF0', borderRadius: 6, marginBottom: 6 }}>
      <input type="checkbox" checked={saisies[`${id}.${cle}`] === '1'} disabled={verrouille} onChange={(e) => set(`${id}.${cle}`, e.target.checked ? '1' : '')} style={{ width: 17, height: 17, accentColor: BLEU }} />
      {label}
    </label>
  )
  const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#3A4653', marginBottom: 5 }
  const two: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }
  const TOTAL = 6
  const titres = ['Dates', "Nuites a l'hotel", 'Repas', 'Transport', 'Detail du transport', 'Total']
  const contenu = () => {
    if (etape === 1) return (<div style={two}>
      <div><div style={lbl}>DATE DE DEPART (jj/mm/aa) :</div>{F('depart')}</div>
      <div><div style={lbl}>DATE DE RETOUR (jj/mm/aa) :</div>{F('retour')}</div>
    </div>)
    if (etape === 2) return (<div>
      <div style={{ fontWeight: 700, fontSize: 14, textAlign: 'center', marginBottom: 12 }}>NUITES A L'HOTEL</div>
      <div style={two}><div><div style={lbl}>PRIX D'UNE NUIT D'HOTEL :</div>{F('prixNuit')}</div><div><div style={lbl}>NOMBRE DE NUITS :</div>{F('nbNuits')}</div></div>
      <div style={{ marginTop: 14 }}><div style={lbl}>MONTANT TOTAL DES NUITS :</div>{F('totalNuits')}</div>
    </div>)
    if (etape === 3) return (<div>
      <div style={{ fontWeight: 700, fontSize: 14, textAlign: 'center', marginBottom: 12 }}>REPAS</div>
      <div style={two}><div><div style={lbl}>COUT D'UN DEJEUNER :</div>{F('coutDej')}</div><div><div style={lbl}>NOMBRE DE DEJEUNERS :</div>{F('nbDej')}</div></div>
      <div style={{ margin: '10px 0 16px' }}><div style={lbl}>MONTANT TOTAL DES DEJEUNERS :</div>{F('totalDej')}</div>
      <div style={two}><div><div style={lbl}>COUT D'UN DINER :</div>{F('coutDiner')}</div><div><div style={lbl}>NOMBRE DE DINERS :</div>{F('nbDiner')}</div></div>
      <div style={{ marginTop: 10 }}><div style={lbl}>MONTANT TOTAL DES DINERS :</div>{F('totalDiner')}</div>
    </div>)
    if (etape === 4) return (<div>
      <div style={{ fontWeight: 700, fontSize: 14, textAlign: 'center', marginBottom: 6 }}>TRANSPORT</div>
      <div style={{ fontSize: 12.5, color: '#5B6B7B', marginBottom: 12 }}>Cochez le ou les moyen(s) de transports que vous avez utilises.</div>
      {chk('avion', 'AVION')}{chk('voiture', 'VOITURE')}{chk('train', 'TRAIN')}{chk('autre', 'AUTRE')}
      <div style={{ fontSize: 11.5, color: '#8A94A0', marginTop: 6 }}>Selectionnez au moins une bonne reponse.</div>
    </div>)
    if (etape === 5) return (<div>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>EN AVION</div>
      <div style={two}><div><div style={lbl}>PRIX DE L'ALLER :</div>{F('avionAller')}</div><div><div style={lbl}>PRIX DU RETOUR :</div>{F('avionRetour')}</div></div>
      <div style={{ marginTop: 10 }}><div style={lbl}>PRIX DE L'ALLER-RETOUR :</div>{F('avionAR')}</div>
      <div style={{ fontWeight: 700, fontSize: 13, margin: '16px 0 8px' }}>EN VOITURE</div>
      <div style={lbl}>INDIQUEZ LES NOMS ET PRENOMS DES PERSONNES AVEC QUI VOUS AVEZ FAIT LE TRAJET :</div>
      <div style={{ ...two, marginBottom: 10 }}><div><div style={lbl}>PERSONNE 1 :</div>{F('p1')}</div><div><div style={lbl}>PERSONNE 2 :</div>{F('p2')}</div></div>
      <div style={two}><div><div style={lbl}>PERSONNE 3 :</div>{F('p3')}</div><div><div style={lbl}>PERSONNE 4 :</div>{F('p4')}</div></div>
      <div style={{ ...two, marginTop: 10 }}><div><div style={lbl}>NOMBRE DE KM ALLER :</div>{F('kmAller')}</div><div><div style={lbl}>NOMBRE DE KM RETOUR :</div>{F('kmRetour')}</div></div>
      <div style={{ fontWeight: 700, fontSize: 13, margin: '16px 0 8px' }}>EN TRAIN</div>
      <div style={two}><div><div style={lbl}>PRIX DE L'ALLER :</div>{F('trainAller')}</div><div><div style={lbl}>PRIX DU RETOUR :</div>{F('trainRetour')}</div></div>
      <div style={{ marginTop: 10 }}><div style={lbl}>PRIX DE L'ALLER-RETOUR :</div>{F('trainAR')}</div>
    </div>)
    return (<div>
      <div style={{ fontWeight: 700, fontSize: 14, textAlign: 'center', marginBottom: 12 }}>TOTAL</div>
      <div style={lbl}>MONTANT TOTAL DES FRAIS :</div>{F('totalFrais')}
    </div>)
  }
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #CFE5F0', borderRadius: 12, overflow: 'hidden', maxWidth: 640, boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}>
      <div style={{ background: '#EAF6FB', padding: '16px 20px' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: BLEU }}>HYDRAO - Etat des frais professionnels</div>
        <div style={{ fontSize: 12, color: '#5B6B7B', marginTop: 4 }}>Cree le : 19 oct. 2020 · Date limite : Pas encore diffuse</div>
      </div>
      <div style={{ textAlign: 'center', padding: '14px 20px 6px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2933' }}>ETAT DES FRAIS PROFESSIONNELS</div>
        <div style={{ fontSize: 12, fontStyle: 'italic', color: '#5B6B7B', marginTop: 6 }}>Ne selectionnez que les items qui vous concernent.<br />Si un items ne vous concerne pas, laissez la case vide.</div>
      </div>
      {/* progression */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 20px' }}>
        {Array.from({ length: TOTAL }).map((_, j) => <div key={j} style={{ flex: 1, height: 6, borderRadius: 3, background: j < etape ? BLEU : '#E1E8EF' }} />)}
      </div>
      <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ background: BLEU, color: '#FFF', fontWeight: 700, fontSize: 14, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{etape}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1F2933' }}>{titres[etape - 1]}</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#8A94A0' }}>Etape {etape} / {TOTAL} · Coef. 1</span>
      </div>
      <div style={{ padding: '10px 20px 20px', minHeight: 140 }}>{contenu()}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #EEF2F6', background: '#F9FBFD' }}>
        <button type="button" onClick={() => setEtape((e) => Math.max(1, e - 1))} disabled={etape === 1}
          style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #C9D6E3', background: etape === 1 ? '#F1F3F5' : '#FFF', color: etape === 1 ? '#B0BAC5' : '#374151', fontWeight: 700, fontSize: 13, cursor: etape === 1 ? 'default' : 'pointer' }}>‹ Retour</button>
        <button type="button" onClick={() => setEtape((e) => Math.min(TOTAL, e + 1))} disabled={etape === TOTAL}
          style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: etape === TOTAL ? '#B0BAC5' : BLEU, color: '#FFF', fontWeight: 700, fontSize: 13, cursor: etape === TOTAL ? 'default' : 'pointer' }}>{etape === TOTAL ? 'Terminé' : 'Suivant ›'}</button>
      </div>
    </div>
  )
}

// CRM fichier clients facon logiciel : recherche, tableau pro, lignes
// selectionnables (mode selection) ou cochables (mode cochage) + compteur.
function CrmClientsVue({ a, saisies, set, verrouille, couleur }: {
  a: AnnexeCrmClients; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string
}) {
  const [q, setQ] = useState('')
  const coches = a.clients.map((_, i) => saisies[`${a.id}.sel.${i}`] === '1')
  const nbCoches = coches.filter(Boolean).length
  const th: React.CSSProperties = { background: couleur, color: '#FFF', fontSize: 11, fontWeight: 700, padding: '8px 10px', textAlign: 'left', whiteSpace: 'nowrap' }
  const td: React.CSSProperties = { padding: '7px 10px', fontSize: 12, borderBottom: '1px solid #EAEFF4', whiteSpace: 'nowrap' }
  const toggle = (i: number) => { if (verrouille) return; set(`${a.id}.sel.${i}`, coches[i] ? '' : '1') }
  const filtre = (c: ClientCrm) => {
    if (!q.trim()) return true
    const t = `${c.nom} ${c.prenom} ${c.mail} ${c.facture ?? ''}`.toLowerCase()
    return t.includes(q.toLowerCase())
  }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>🗂️ {a.entete ?? a.titre}</span>
        {a.mode === 'cochage' && <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.22)', borderRadius: 20, padding: '3px 12px' }}>{nbCoches} client{nbCoches > 1 ? 's' : ''} sélectionné{nbCoches > 1 ? 's' : ''}</span>}
      </div>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #EAEFF4', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#94A3B8', fontSize: 13 }}>🔍</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un client (nom, mail, facture)..." style={{ flex: 1, border: '1px solid #D8E0E8', borderRadius: 6, padding: '6px 10px', fontSize: 12.5, outline: 'none' }} />
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: a.colonnesEtendues ? 820 : 560 }}>
          <thead><tr>
            <th style={{ ...th, textAlign: 'center', width: 44 }}>{a.mode === 'cochage' ? '✓' : 'Sél.'}</th>
            <th style={th}>Nom</th><th style={th}>Prénom</th><th style={th}>Adresse</th>
            <th style={th}>Téléphone</th><th style={th}>Mail</th>
            {a.colonnesEtendues && <><th style={th}>N° facture</th><th style={th}>Émission</th><th style={th}>Échéance</th><th style={{ ...th, textAlign: 'right' }}>Montant impayé</th></>}
            {a.mode === 'cochage' && a.libelleColonneCoche && <th style={{ ...th, textAlign: 'center' }}>{a.libelleColonneCoche}</th>}
          </tr></thead>
          <tbody>
            {a.clients.map((c, i) => {
              if (!filtre(c)) return null
              const actif = coches[i]
              return (
                <tr key={i} onClick={() => a.mode === 'selection' && toggle(i)}
                  style={{ background: actif ? '#FBEAF0' : i % 2 ? '#F8FAFC' : '#FFFFFF', cursor: a.mode === 'selection' && !verrouille ? 'pointer' : 'default', outline: actif ? `2px solid ${couleur}` : 'none', outlineOffset: -2 }}>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <input type="checkbox" checked={actif} disabled={verrouille} onChange={() => toggle(i)} onClick={(e) => e.stopPropagation()} style={{ width: 16, height: 16, accentColor: couleur, cursor: verrouille ? 'default' : 'pointer' }} />
                  </td>
                  <td style={{ ...td, fontWeight: 600 }}>{c.nom}</td><td style={td}>{c.prenom}</td>
                  <td style={td}>{c.adresse}</td><td style={td}>{c.telephone}</td><td style={td}>{c.mail}</td>
                  {a.colonnesEtendues && <><td style={td}>{c.facture}</td><td style={td}>{c.dateFacture}</td><td style={td}>{c.dateEcheance}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: c.montantImpaye && c.montantImpaye !== '-' ? '#B91C1C' : '#94A3B8' }}>{c.montantImpaye ?? '-'}</td></>}
                  {a.mode === 'cochage' && a.libelleColonneCoche && (
                    <td style={{ ...td, textAlign: 'center' }}>
                      <input type="checkbox" checked={actif} disabled={verrouille} onChange={() => toggle(i)} onClick={(e) => e.stopPropagation()} style={{ width: 16, height: 16, accentColor: couleur, cursor: verrouille ? 'default' : 'pointer' }} />
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {a.mode === 'selection' && (
        <div style={{ padding: '9px 12px', borderTop: '1px solid #EAEFF4', fontSize: 12, color: nbCoches ? '#B91C1C' : '#6B7280', background: nbCoches ? '#FEF2F2' : '#F8FAFC' }}>
          {nbCoches ? `⚠ ${a.libelleSelection ?? 'Client sélectionné'} : ${a.clients.filter((_, i) => coches[i]).map((c) => `${c.prenom} ${c.nom}`).join(', ')}` : (a.libelleSelection ? `Cliquez la ligne concernée : ${a.libelleSelection}.` : 'Cliquez la ligne concernée.')}
        </div>
      )}
    </div>
  )
}

// Bon de commande calcule facon logiciel de caisse.
function BonCommandeCalculeVue({ a, saisies, set, verrouille, couleur }: {
  a: AnnexeBonCommandeCalcule; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string
}) {
  const inp = (cle: string, ph?: string, align: 'left' | 'right' = 'right') => (
    <input value={saisies[`${a.id}.${cle}`] ?? ''} onChange={(e) => set(`${a.id}.${cle}`, e.target.value)} disabled={verrouille} placeholder={ph}
      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 12.5, padding: '5px 7px', borderRadius: 5, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFDF5', textAlign: align, outline: 'none' }} />
  )
  const th: React.CSSProperties = { background: couleur, color: '#FFF', fontSize: 11, fontWeight: 700, padding: '7px 8px', textAlign: 'left' }
  const td: React.CSSProperties = { borderBottom: '1px solid #E9EEF3', padding: '5px 8px', fontSize: 12, verticalAlign: 'middle' }
  const lignesVides = Array.from({ length: a.nbLignesVides ?? 0 })
  const totLine = (label: string, cle: string, fort?: boolean) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '5px 0' }}>
      <span style={{ fontSize: 12.5, fontWeight: fort ? 800 : 600, color: fort ? '#1F2933' : '#4B5563' }}>{label}</span>
      <div style={{ width: 120 }}>{inp(cle)}</div>
    </div>
  )
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>🧾 {a.titre}</span>
        {a.client && <span style={{ fontSize: 11.5 }}>Client : {a.client}</span>}
      </div>
      <div style={{ padding: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
          <thead><tr>
            <th style={th}>Référence</th><th style={th}>Désignation</th>
            <th style={{ ...th, textAlign: 'right' }}>PU HT</th><th style={{ ...th, textAlign: 'center' }}>Qté</th>
            <th style={{ ...th, textAlign: 'right' }}>Total HT</th>
          </tr></thead>
          <tbody>
            {a.lignes.map((l, n) => (
              <tr key={n}>
                <td style={td}>{l.ref}</td>
                <td style={td}>{l.designation}</td>
                <td style={{ ...td, textAlign: 'right' }}>{l.prixHT}</td>
                <td style={{ ...td, textAlign: 'center' }}>{l.quantite}</td>
                <td style={{ ...td, width: 100 }}>{inp(`l${n}.total`)}</td>
              </tr>
            ))}
            {lignesVides.map((_, n) => {
              const idx = a.lignes.length + n
              return (
                <tr key={`v${n}`}>
                  <td style={td}>{inp(`l${idx}.ref`, '', 'left')}</td>
                  <td style={td}>{inp(`l${idx}.designation`, '', 'left')}</td>
                  <td style={{ ...td, width: 80 }}>{inp(`l${idx}.pu`)}</td>
                  <td style={{ ...td, width: 60 }}>{inp(`l${idx}.qte`)}</td>
                  <td style={{ ...td, width: 100 }}>{inp(`l${idx}.total`)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div style={{ maxWidth: 340, marginLeft: 'auto', background: '#F7F9FB', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px' }}>
          {totLine('SOUS-TOTAL HT', 'soustotal')}
          {a.reduction && totLine('Montant de la réduction', 'reduction')}
          {totLine('Montant de la TVA (20 %)', 'tva')}
          {totLine('Montant TTC', 'ttc')}
          {a.livraison && totLine('Montant livraison', 'livraison')}
          <div style={{ borderTop: `2px solid ${couleur}`, marginTop: 4, paddingTop: 4 }}>{totLine('TOTAL À PAYER', 'total', true)}</div>
        </div>
        {a.paiement2fois && (
          <div style={{ maxWidth: 340, marginLeft: 'auto', marginTop: 10, background: '#FBEAF0', border: `1px solid ${couleur}33`, borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: couleur, marginBottom: 4 }}>Paiement en 2 fois</div>
            {totLine('Montant dû à la commande', 'commande')}
            {totLine('Montant prélevé à 30 jours', 'trentejours')}
          </div>
        )}
      </div>
    </div>
  )
}

// Note/charte de la direction facon post-it vert avec titre calligraphie.
function NoteDirectionVue({ data }: { data: { titre: string; signature?: string; intro?: string; paragraphe?: string; puces: string[]; conclusion?: string } }) {
  return (
    <div style={{ background: '#DDE9CC', border: '1px solid #C4D6AC', borderRadius: 6, padding: '20px 24px', boxShadow: '2px 3px 8px rgba(0,0,0,0.12)' }}>
      <div style={{ textAlign: 'center', fontFamily: 'Georgia, "Brush Script MT", cursive', fontSize: 26, fontStyle: 'italic', color: '#2B2B2B', marginBottom: 16 }}>{data.titre}</div>
      {data.intro && <div style={{ fontSize: 13.5, fontWeight: 700, color: '#2B2B2B', textDecoration: 'underline', marginBottom: 10 }}>{data.intro}</div>}
      {data.paragraphe && <p style={{ fontSize: 13, color: '#2B2B2B', lineHeight: 1.6, marginBottom: 10 }}>{data.paragraphe}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {data.puces.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#2B2B2B', lineHeight: 1.5 }}>
            <span>-</span><span>{p}</span>
          </div>
        ))}
      </div>
      {data.signature && <div style={{ marginTop: 20, display: 'inline-block', background: '#D2E0BE', padding: '6px 18px', fontFamily: 'Georgia, cursive', fontSize: 20, fontStyle: 'italic', color: '#2B2B2B', boxShadow: '1px 2px 4px rgba(0,0,0,0.1)' }}>{data.signature}</div>}
      {data.conclusion && <p style={{ marginTop: 12, marginBottom: 0, fontSize: 13, color: '#2B2B2B', lineHeight: 1.6 }}>{data.conclusion}</p>}
    </div>
  )
}

// Bulle de conseil du tuteur facon bulle de BD bleue avec ergot a gauche.
function BulleConseilVue({ texte }: { texte: string[] }) {
  return (
    <div style={{ position: 'relative', background: '#C4D4EA', border: '1.5px solid #5B7DA8', borderRadius: 8, padding: '16px 20px', marginLeft: 18 }}>
      <div style={{ position: 'absolute', left: -14, top: 26, width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderRight: '15px solid #C4D4EA' }} />
      <div style={{ position: 'absolute', left: -16, top: 25, width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', borderRight: '16px solid #5B7DA8', zIndex: -1 }} />
      {texte.map((t, i) => (
        <p key={i} style={{ margin: i === 0 ? 0 : '8px 0 0', fontSize: 13, fontStyle: 'italic', color: '#1F3049', lineHeight: 1.6 }}>{t}</p>
      ))}
    </div>
  )
}

// Icones SVG pour les services (livraison, garantie, service client, paiement).
function IconeService({ nom, couleur }: { nom: string; couleur: string }) {
  const p = { width: 40, height: 40, viewBox: '0 0 24 24', fill: 'none', stroke: couleur, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (nom === 'livraison') return <svg {...p}><path d="M1 3h13v10H1zM14 7h4l3 3v3h-7z" /><circle cx="5.5" cy="16.5" r="1.8" /><circle cx="17.5" cy="16.5" r="1.8" /></svg>
  if (nom === 'garantie') return <svg {...p}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M12 8l-3 3M9 11l3 3 3-4" /></svg>
  if (nom === 'serviceclient') return <svg {...p}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><circle cx="17" cy="6" r="2" /><path d="M15 5h.01" /></svg>
  if (nom === 'paiement') return <svg {...p}><path d="M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5z" /><path d="M9 12l2 2 4-4" /></svg>
  return <svg {...p}><circle cx="12" cy="12" r="9" /></svg>
}

// Document facon vraie page web riche : barre navigateur, en-tete de marque
// avec logo et menu, puis sections typees (fiche, images, grilles, icones...).
function DocRicheVue({ data, couleur }: { data: NonNullable<BlocDocumentTexte['docRiche']>; couleur: string }) {
  const head = data.couleurHeader ?? '#1E2A38'
  return (
    <div style={{ border: '1px solid #D5DEE7', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', background: '#FFFFFF' }}>
      {/* barre navigateur */}
      <div style={{ background: '#E9EDF1', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #D5DEE7' }}>
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F57' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#FEBC2E' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28C840' }} />
        <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #D5DEE7', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: '#5B6B7B', textAlign: 'center' }}>🔒 {data.site ?? 'www.hydrao.fr'}</div>
      </div>
      {/* en-tete marque */}
      {(data.logo || data.marque || data.menu) && (
        <div style={{ background: head, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          {data.logo ? <img src={data.logo} alt={data.marque ?? 'logo'} style={{ height: 30 }} /> : <span style={{ color: '#FFF', fontWeight: 800, fontSize: 18 }}>{data.marque}</span>}
          {data.menu && <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>{data.menu.map((m, i) => <span key={i} style={{ color: '#DCE6F0', fontSize: 12.5 }}>{m}</span>)}</div>}
        </div>
      )}
      {/* contenu */}
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {data.sections.map((s, i) => {
          if (s.type === 'faqOnglets') return <FaqOngletsInline key={i} rubriques={s.rubriques} couleur={couleur} />
          if (s.type === 'citation') return (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', background: couleur, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>❝</div>
              <div style={{ position: 'relative', background: '#EEF2FB', border: '1px solid #C7D3EC', borderRadius: 14, padding: '14px 18px', flex: 1 }}>
                <div style={{ fontSize: 14.5, color: '#1F2933', fontStyle: 'italic', lineHeight: 1.6 }}>{s.texte}</div>
                {s.auteur && <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: couleur, textAlign: 'right' }}>{s.auteur}</div>}
              </div>
            </div>
          )
          if (s.type === 'procedureEtapes') return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {s.etapes.map((et, j) => (
                <div key={j} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', border: '1px solid #E5EAF0', borderRadius: 10, padding: 12, background: '#FBFDFF' }}>
                  <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: couleur, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>{j + 1}</div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#16456E', marginBottom: 2 }}>{et.titre}</div>
                    <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>{et.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )
          if (s.type === 'titre') return <h3 key={i} style={{ margin: 0, fontSize: 20, fontWeight: 800, color: couleur, textAlign: 'center' }}>{s.texte}</h3>
          if (s.type === 'sousTitre') return <div key={i} style={{ fontSize: 15, fontWeight: 700, color: '#1F2933', borderLeft: `4px solid ${couleur}`, paddingLeft: 10 }}>{s.texte}</div>
          if (s.type === 'paragraphe') return <p key={i} style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.65 }}>{s.texte}</p>
          if (s.type === 'paragraphes') return <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{s.textes.map((t, j) => <p key={j} style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.65 }}>{t}</p>)}</div>
          if (s.type === 'puces') return <ul key={i} style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 5 }}>{s.items.map((t, j) => <li key={j} style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>{t}</li>)}</ul>
          if (s.type === 'image') return <figure key={i} style={{ margin: 0, textAlign: 'center' }}><img src={s.src} alt={s.alt ?? ''} style={{ maxWidth: '100%', width: s.largeur, borderRadius: 8, border: '1px solid #E5EAF0' }} />{s.legende && <figcaption style={{ fontSize: 11, color: '#8A94A0', marginTop: 4 }}>{s.legende}</figcaption>}</figure>
          if (s.type === 'fiche') return (
            <div key={i} style={{ border: '1px solid #E5EAF0', borderRadius: 8, overflow: 'hidden' }}>
              {s.lignes.map((l, j) => (
                <div key={j} style={{ display: 'grid', gridTemplateColumns: '210px 1fr', borderBottom: j < s.lignes.length - 1 ? '1px solid #EEF2F6' : 'none' }}>
                  <div style={{ background: '#F5F8FB', padding: '8px 12px', fontSize: 12.5, fontWeight: 700, color: '#3A4653' }}>{l.label}</div>
                  <div style={{ padding: '8px 12px', fontSize: 12.5, color: '#1F2933' }}>{l.valeur}</div>
                </div>
              ))}
            </div>
          )
          if (s.type === 'servicesIcones') return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              {s.services.map((sv, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, border: '1px solid #E5EAF0', borderRadius: 8, background: '#FBFDFF' }}>
                  <IconeService nom={sv.icone} couleur={couleur} />
                  <div><div style={{ fontSize: 12.5, fontWeight: 800, color: couleur, textTransform: 'uppercase' }}>{sv.titre}</div>{sv.detail && <div style={{ fontSize: 12, color: '#5B6B7B', marginTop: 2 }}>{sv.detail}</div>}</div>
                </div>
              ))}
            </div>
          )
          if (s.type === 'partenaires') return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              {s.logos.map((lg, j) => (
                <div key={j} style={{ background: '#FFFFFF', border: '1px solid #E5EAF0', borderRadius: 8, height: 78, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                  {lg.image ? <img src={lg.image} alt={lg.nom} style={{ maxWidth: '100%', maxHeight: 58, objectFit: 'contain' }} /> : <span style={{ fontSize: 13, fontWeight: 700, color: '#3A4653', textAlign: 'center' }}>{lg.nom}</span>}
                </div>
              ))}
            </div>
          )
          if (s.type === 'grilleProduits') return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
              {s.produits.map((pr, j) => (
                <div key={j} style={{ border: '1px solid #E5EAF0', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', height: 130, background: '#F7FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {pr.badge && <span style={{ position: 'absolute', top: 6, left: 6, background: '#EE6A34', color: '#FFF', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 10 }}>{pr.badge}</span>}
                    {pr.image ? <img src={pr.image} alt={pr.nom} style={{ maxHeight: 118, maxWidth: '90%', objectFit: 'contain' }} /> : <span style={{ fontSize: 28 }}>🚿</span>}
                  </div>
                  <div style={{ padding: '9px 10px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#1F2933', lineHeight: 1.3, flex: 1 }}>{pr.nom}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 5 }}>
                      {pr.ancienPrix && <span style={{ fontSize: 11, color: '#9AA5B1', textDecoration: 'line-through' }}>{pr.ancienPrix}</span>}
                      <span style={{ fontSize: 14, fontWeight: 800, color: couleur }}>{pr.prix}</span>
                    </div>
                    <span style={{ background: '#1BA3E0', color: '#FFF', fontSize: 11, borderRadius: 5, padding: '4px 0' }}>Acheter</span>
                  </div>
                </div>
              ))}
            </div>
          )
          if (s.type === 'grillePersonnes') return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
              {s.personnes.map((pe, j) => (
                <div key={j} style={{ textAlign: 'center' }}>
                  <div style={{ width: 84, height: 84, borderRadius: '50%', margin: '0 auto 8px', overflow: 'hidden', background: '#E9EDF1', border: `2px solid ${couleur}22` }}>
                    {pe.photo ? <img src={pe.photo} alt={pe.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#9AA5B1' }}>{pe.nom.charAt(0)}</div>}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1F2933' }}>{pe.nom}</div>
                  <div style={{ fontSize: 11.5, color: couleur, lineHeight: 1.35 }}>{pe.fonction}</div>
                </div>
              ))}
            </div>
          )
          if (s.type === 'article') return (
            <div key={i} style={{ borderTop: '1px solid #EEF2F6', paddingTop: 12 }}>
              {s.titre && <div style={{ fontSize: 14, fontWeight: 800, color: '#1F2933', marginBottom: 6 }}>{s.titre}</div>}
              {s.paragraphes.map((t, j) => <p key={j} style={{ margin: j ? '6px 0 0' : 0, fontSize: 13, color: '#374151', lineHeight: 1.65 }}>{t}</p>)}
              {s.image && <img src={s.image} alt={s.titre ?? ''} style={{ maxWidth: '100%', borderRadius: 8, marginTop: 10, border: '1px solid #E5EAF0' }} />}
            </div>
          )
          if (s.type === 'billetTrain') return (
            <div key={i} style={{ border: '1px solid #E0E4EA', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ background: '#12233A', color: '#FFF', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                <div><div style={{ fontSize: 13 }}>Aller</div><div style={{ fontSize: 26, fontWeight: 800 }}>{s.prix}</div><div style={{ fontSize: 12 }}>{s.passagers}</div></div>
                <div style={{ flex: 1, minWidth: 200, background: '#3AC6A2', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div><div style={{ fontSize: 17, fontWeight: 800 }}>Continuer</div><div style={{ fontSize: 12 }}>vers les <strong>informations des passagers</strong></div></div>
                  <span style={{ fontSize: 20 }}>›</span>
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#1F2933' }}>Trajet</span>
                  {s.co2 && <span style={{ fontSize: 12.5, color: '#5B6B7B' }}>◱ CO₂ {s.co2}</span>}
                </div>
                <div style={{ border: '1px solid #E5EAF0', borderRadius: 8, padding: 12 }}>
                  {s.segments.map((sg, j) => (
                    <div key={j}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#1F2933', minWidth: 52 }}>{sg.depart}<br />{sg.arrivee}</div>
                          <div style={{ fontSize: 13, color: '#374151' }}>{sg.villeDepart}<br />{sg.villeArrivee}</div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 11.5, color: '#5B6B7B' }}>{sg.operateur}<br /><strong>{sg.numero}</strong> · {sg.classe}</div>
                      </div>
                      {j < s.segments.length - 1 && s.correspondance && <div style={{ fontSize: 12, fontStyle: 'italic', color: '#8A94A0', padding: '8px 0', borderTop: '1px dashed #E5EAF0', borderBottom: '1px dashed #E5EAF0', margin: '8px 0' }}>—o— {s.correspondance}</div>}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1F2933', margin: '14px 0 8px' }}>Passagers</div>
                <div style={{ border: '1px solid #E5EAF0', borderRadius: 8, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 13, marginBottom: 8 }}><span>{s.passagerLignes.titre}</span><span>{s.passagerLignes.prix}</span></div>
                  {s.passagerLignes.conditions.map((c, j) => <p key={j} style={{ margin: '6px 0 0', fontSize: 12, color: '#374151', lineHeight: 1.5 }}><strong>{c.label} :</strong> {c.texte}</p>)}
                </div>
              </div>
            </div>
          )
          if (s.type === 'resaHotel') return (
            <div key={i} style={{ border: '1px solid #E0E4EA', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ background: '#F5F6F8', padding: '12px 16px', textAlign: 'right', fontSize: 13, color: '#374151' }}>Afficher uniquement les tarifs : <span style={{ color: '#0A9E8E' }}>☑</span> Petit-déjeuner inclus</div>
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 0 }}>
                <div style={{ position: 'relative', background: '#DDE3EA', minHeight: 190 }}>
                  {s.photo ? <img src={s.photo} alt={s.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 34 }}>🛏️</div>}
                  <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.7)', color: '#FFF', fontSize: 11, padding: '4px 8px', borderRadius: 4 }}>⤢ Voir les photos</div>
                </div>
                <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1F2933' }}>{s.nom}</div>
                  <div style={{ fontSize: 13, color: '#5B6B7B' }}>👤 {s.capacite}   ↳ {s.surface}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#3B3F8C', marginTop: 6 }}>{s.tarifMembreLabel ?? 'Tarif membre à partir de*'}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1F2933' }}>{s.tarifMembre}</div>
                  <div style={{ fontSize: 13, color: '#5B6B7B' }}>ou</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div><div style={{ fontSize: 12.5, color: '#5B6B7B' }}>{s.tarifPublicLabel ?? 'Tarif public à partir de*'}</div><div style={{ fontSize: 18, color: '#374151' }}>{s.tarifPublic}</div></div>
                    <span style={{ background: '#2A2A6C', color: '#FFF', fontSize: 13, fontWeight: 700, padding: '10px 26px', borderRadius: 24 }}>Sélectionner</span>
                  </div>
                </div>
              </div>
            </div>
          )
          if (s.type === 'itineraire') return (
            <div key={i} style={{ border: '1px solid #E0E4EA', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ padding: 16, borderRight: '1px solid #EEF2F6' }}>
                <div style={{ border: '1px solid #E5EAF0', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#1F2933', marginBottom: 6 }}>◯ {s.depart}</div>
                <div style={{ border: '1px solid #E5EAF0', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#1F2933', marginBottom: 10 }}>📍 {s.arrivee}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                  {s.modes.map((m, j) => <span key={j} style={{ fontSize: 12.5, padding: '4px 8px', borderRadius: 14, background: j === 0 ? '#E3F0FD' : '#F1F3F5', color: j === 0 ? '#1A73E8' : '#5B6B7B' }}>{m.icone} {m.duree}</span>)}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1A8A3A' }}>{s.dureeKm}</div>
                {s.note && <div style={{ fontSize: 12.5, color: '#5B6B7B', marginTop: 2 }}>{s.note}</div>}
                <div style={{ background: '#1A73E8', color: '#FFF', textAlign: 'center', borderRadius: 24, padding: '9px 0', fontWeight: 700, fontSize: 14, marginTop: 12 }}>Aperçu »</div>
              </div>
              <div style={{ background: '#E8EDE4', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.carte ? <img src={s.carte} alt="Carte" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 34 }}>🗺️</span>}
              </div>
            </div>
          )
          if (s.type === 'ficheProduitWeb') return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1.2fr', gap: 20, alignItems: 'start' }}>
              <div style={{ background: '#F7FAFC', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
                {s.image ? <img src={s.image} alt={s.nom} style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }} /> : <span style={{ fontSize: 40 }}>🚿</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {s.badge && <span style={{ alignSelf: 'flex-start', background: '#2BB673', color: '#FFF', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 4 }}>{s.badge}</span>}
                <div style={{ fontSize: 22, fontWeight: 800, color: couleur }}>{s.nom}</div>
                {s.accroche && <div style={{ fontSize: 13, color: '#5B6B7B' }}>{s.accroche}</div>}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: couleur }}>{s.prix}</span>
                  {s.prixDetail && <span style={{ fontSize: 11, color: '#8A94A0' }}>{s.prixDetail}</span>}
                </div>
                {s.couleurs && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ fontSize: 12.5, color: '#5B6B7B' }}>Couleur</span>{s.couleurs.map((c, j) => <span key={j} style={{ fontSize: 11, fontWeight: 700, border: '1px solid #C9D6E3', borderRadius: 4, padding: '4px 10px', color: '#3A4653' }}>{c}</span>)}</div>}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '4px 0' }}>
                  <span style={{ border: '1px solid #C9D6E3', borderRadius: 4, padding: '6px 12px', fontSize: 13 }}>1</span>
                  <span style={{ background: '#1BA3E0', color: '#FFF', fontSize: 13, fontWeight: 700, padding: '8px 22px', borderRadius: 5 }}>ACHETER</span>
                  <span style={{ fontSize: 11, color: '#1BA3E0' }}>(frais de port offerts dès 85€ d'achat)</span>
                </div>
                <ul style={{ margin: '4px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {s.arguments.map((a, j) => <li key={j} style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.5 }}>{a}</li>)}
                </ul>
                {(s.note || s.avis) && <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}><span style={{ color: '#F5A623', fontSize: 15 }}>★★★★★</span>{s.note && <span style={{ fontSize: 12.5, fontWeight: 700 }}>{s.note}</span>}{s.avis && <span style={{ fontSize: 12, color: '#1BA3E0' }}>{s.avis}</span>}</div>}
              </div>
            </div>
          )
          if (s.type === 'bulles') return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {s.bulles.map((b, j) => {
                const gauche = j % 2 === 0
                return (
                  <div key={j} style={{ display: 'flex', flexDirection: gauche ? 'row' : 'row-reverse', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: '50%', background: couleur, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>{b.numero}</div>
                    <div style={{ position: 'relative', maxWidth: '78%', background: gauche ? '#EEF5FB' : '#F3FBF5', border: `1px solid ${gauche ? '#CFE4F3' : '#CDEBD6'}`, borderRadius: 14, padding: '12px 16px', fontSize: 13.5, color: '#1F2933', lineHeight: 1.55, fontStyle: 'italic' }}>
                      <span style={{ position: 'absolute', top: 14, [gauche ? 'left' : 'right']: -7, width: 12, height: 12, background: gauche ? '#EEF5FB' : '#F3FBF5', borderLeft: `1px solid ${gauche ? '#CFE4F3' : '#CDEBD6'}`, borderBottom: `1px solid ${gauche ? '#CFE4F3' : '#CDEBD6'}`, transform: gauche ? 'rotate(45deg)' : 'rotate(-135deg)' } as React.CSSProperties} />
                      {b.texte}
                    </div>
                  </div>
                )
              })}
            </div>
          )
          if (s.type === 'packProduit') return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1.1fr', gap: 20, alignItems: 'start' }}>
              <div style={{ position: 'relative', background: '#FFFFFF', border: '1px solid #EEF2F6', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
                {s.badges && <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>{s.badges.map((bd, j) => <span key={j} style={{ width: 52, height: 52, borderRadius: '50%', background: j === 0 ? '#3E8FCF' : '#C55A32', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>{bd}</span>)}</div>}
                {s.image ? <img src={s.image} alt={s.nom} style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }} /> : <span style={{ fontSize: 40 }}>🚿</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: 1, color: '#6B7B8B', textTransform: 'uppercase' }}>{s.nom}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {s.ancienPrix && <span style={{ fontSize: 14, color: '#9AA6B2', textDecoration: 'line-through' }}>{s.ancienPrix}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: '#3A4653' }}>{s.prix}</span>
                  {s.economie && <span style={{ border: '1px solid #E07B39', color: '#E07B39', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 4 }}>{s.economie}</span>}
                </div>
                {s.auLieuDe && <div style={{ fontSize: 13, fontWeight: 700, color: '#16456E' }}>{s.auLieuDe}</div>}
                {s.mentionTtc && <div style={{ fontSize: 11, color: '#8A94A0' }}>{s.mentionTtc}</div>}
                <div style={{ fontSize: 13, fontWeight: 800, color: '#3A4653', marginTop: 6, letterSpacing: 0.5 }}>CE PACK CONTIENT</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {s.contient.map((it, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #EEF2F6', paddingBottom: 8 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 6, background: '#F7FAFC', border: '1px solid #EEF2F6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{it.image ? <img src={it.image} alt={it.nom} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : '🚿'}</div>
                      <div style={{ flex: 1, fontSize: 13, color: '#374151' }}>{it.nom}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#3A4653' }}>{it.prix}</div>
                      <div style={{ fontSize: 12, color: '#8A94A0' }}>{it.quantite}</div>
                    </div>
                  ))}
                </div>
                {s.stock && <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}><span style={{ width: 16, height: 16, borderRadius: '50%', background: '#2BB673', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✓</span><span style={{ fontSize: 13, color: '#374151' }}>{s.stock}</span></div>}
              </div>
            </div>
          )
          if (s.type === 'tableau') return (
            <div key={i} style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
                <thead><tr>{s.entetes.map((e, j) => <th key={j} style={{ background: couleur, color: '#FFF', fontSize: 11.5, fontWeight: 700, padding: '7px 9px', textAlign: 'left', border: '1px solid #E5EAF0' }}>{e}</th>)}</tr></thead>
                <tbody>{s.lignes.map((ln, r) => <tr key={r}>{ln.map((c, cc) => <td key={cc} style={{ padding: '6px 9px', fontSize: 12, color: '#374151', border: '1px solid #EEF2F6', background: r % 2 ? '#F8FAFC' : '#FFF' }}>{c}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )
          return null
        })}
      </div>
    </div>
  )
}

// Catalogue produits facon tablette e-commerce : grille de vignettes, clic ->
// fiche produit detaillee, bouton retour.
function CatalogueProduitsVue({ data, couleur }: { data: { intro?: string; produits: ProduitFicheCatalogue[] }; couleur: string }) {
  const [ouvert, setOuvert] = useState<number | null>(null)
  const p = ouvert != null ? data.produits[ouvert] : null
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 12, overflow: 'hidden', background: '#F4F6F8' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '10px 14px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 15 }}>🛒</span> Catalogue Mamie &amp; Co
      </div>
      {!p ? (
        <div style={{ padding: 14 }}>
          {data.intro && <div style={{ fontSize: 12.5, color: '#4B5563', marginBottom: 12, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: '9px 11px' }}>{data.intro}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {data.produits.map((prod, i) => (
              <button key={i} type="button" onClick={() => setOuvert(i)} style={{ textAlign: 'left', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: 120, background: '#F7F9FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {prod.badge && <span style={{ position: 'absolute', top: 6, left: 6, background: couleur, color: '#FFF', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>{prod.badge}</span>}
                  {prod.image ? <img src={prod.image} alt={prod.nom} style={{ maxWidth: '92%', maxHeight: '92%', objectFit: 'contain' }} /> : <span style={{ fontSize: 30 }}>🧴</span>}
                </div>
                <div style={{ padding: '9px 10px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1F2933', lineHeight: 1.3, flex: 1 }}>{prod.nom}</div>
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: couleur }}>{prod.prix}</span>
                    {prod.ancienPrix && <span style={{ fontSize: 11, color: '#9AA5B1', textDecoration: 'line-through' }}>{prod.ancienPrix}</span>}
                  </div>
                  <span style={{ marginTop: 7, fontSize: 11, fontWeight: 700, color: couleur, border: `1px solid ${couleur}`, borderRadius: 6, padding: '4px 0', textAlign: 'center' }}>Voir la fiche</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: 14 }}>
          <button type="button" onClick={() => setOuvert(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFFFFF', border: '1px solid #C9D6E3', borderRadius: 8, padding: '6px 12px', fontSize: 12.5, fontWeight: 700, color: '#374151', cursor: 'pointer', marginBottom: 12 }}>← Retour au catalogue</button>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 14, padding: 14 }}>
              <div style={{ background: '#F7F9FB', borderRadius: 8, minHeight: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {p.badge && <span style={{ position: 'absolute', top: 6, left: 6, background: couleur, color: '#FFF', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>{p.badge}</span>}
                {p.image ? <img src={p.image} alt={p.nom} style={{ maxWidth: '92%', maxHeight: 180, objectFit: 'contain' }} /> : <span style={{ fontSize: 40 }}>🧴</span>}
              </div>
              <div>
                {p.ref && <div style={{ fontSize: 11, color: '#9AA5B1' }}>Réf. {p.ref}</div>}
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1F2933' }}>{p.nom}</div>
                {p.accroche && <div style={{ fontSize: 12.5, color: couleur, fontStyle: 'italic', margin: '2px 0 8px' }}>{p.accroche}</div>}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: couleur }}>{p.prix}</span>
                  {p.ancienPrix && <span style={{ fontSize: 13, color: '#9AA5B1', textDecoration: 'line-through' }}>{p.ancienPrix}</span>}
                  <span style={{ fontSize: 11, color: '#6B7280' }}>TTC</span>
                </div>
                {p.infos && p.infos.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {p.infos.map((inf, k) => <span key={k} style={{ fontSize: 11, background: '#F1F5F9', borderRadius: 6, padding: '3px 8px', color: '#475569' }}>{inf}</span>)}
                  </div>
                )}
              </div>
            </div>
            <div style={{ borderTop: '1px solid #E2E8F0', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {p.description && p.description.length > 0 && (
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: couleur, marginBottom: 4 }}>Description</div>
                  {p.description.map((d, k) => <p key={k} style={{ margin: k === 0 ? 0 : '5px 0 0', fontSize: 12.5, color: '#374151', lineHeight: 1.6 }}>{d}</p>)}
                </div>
              )}
              {p.composition && p.composition.length > 0 && (
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: couleur, marginBottom: 4 }}>Composition</div>
                  {p.composition.map((c, k) => <p key={k} style={{ margin: k === 0 ? 0 : '5px 0 0', fontSize: 12.5, color: '#374151', lineHeight: 1.6 }}><strong>{c.titre} :</strong> {c.texte}</p>)}
                </div>
              )}
              {p.modeEmploi && p.modeEmploi.length > 0 && (
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: couleur, marginBottom: 4 }}>Mode d'emploi</div>
                  {p.modeEmploi.map((m, k) => (
                    <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                      <span style={{ color: couleur, fontWeight: 800, fontSize: 12.5 }}>{k + 1}.</span>
                      <span style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.55 }}>{m}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Roue des methodes de vente : anneau de secteurs (familles) au centre, chaque
// secteur decoupe en techniques ; un clic sur une technique affiche sa
// definition sous la roue. Rendu SVG, facon schema circulaire pro.
function RoueMethodesVue({ secteurs }: { secteurs: { nom: string; couleur: string; techniques: { nom: string; definition: string }[] }[] }) {
  const [sel, setSel] = useState<{ s: number; t: number } | null>(null)
  const cx = 200, cy = 200, rCentre = 66, rTech = 130, rBord = 195
  const total = secteurs.reduce((n, s) => n + s.techniques.length, 0)
  const pol = (r: number, a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  const arc = (r1: number, r2: number, a1: number, a2: number) => {
    const [x1, y1] = pol(r1, a1), [x2, y2] = pol(r2, a1), [x3, y3] = pol(r2, a2), [x4, y4] = pol(r1, a2)
    const large = a2 - a1 > Math.PI ? 1 : 0
    return `M${x1} ${y1} L${x2} ${y2} A${r2} ${r2} 0 ${large} 1 ${x3} ${y3} L${x4} ${y4} A${r1} ${r1} 0 ${large} 0 ${x1} ${y1} Z`
  }
  let idx = 0
  const secteurAngles: [number, number][] = []
  const parts: React.ReactNode[] = []
  const labels: React.ReactNode[] = []
  secteurs.forEach((s, si) => {
    const a0 = (idx / total) * 2 * Math.PI - Math.PI / 2
    s.techniques.forEach((t, ti) => {
      const aa = (idx / total) * 2 * Math.PI - Math.PI / 2
      const ab = ((idx + 1) / total) * 2 * Math.PI - Math.PI / 2
      const actif = sel && sel.s === si && sel.t === ti
      parts.push(<path key={`t${si}-${ti}`} d={arc(rTech, rBord, aa, ab)} fill={actif ? s.couleur : '#B5622F'} opacity={actif ? 1 : 0.82} stroke="#FFF" strokeWidth={2} style={{ cursor: 'pointer' }} onClick={() => setSel(actif ? null : { s: si, t: ti })} />)
      const [lx, ly] = pol((rTech + rBord) / 2, (aa + ab) / 2)
      labels.push(<text key={`lt${si}-${ti}`} x={lx} y={ly} fontSize={8.5} fill="#FFF" textAnchor="middle" dominantBaseline="middle" style={{ pointerEvents: 'none' }}>{t.nom.length > 14 ? t.nom.slice(0, 13) + '…' : t.nom}</text>)
      idx++
    })
    const a1 = (idx / total) * 2 * Math.PI - Math.PI / 2
    parts.push(<path key={`s${si}`} d={arc(rCentre, rTech, a0, a1)} fill={s.couleur} opacity={0.28} stroke="#FFF" strokeWidth={2} />)
    const [sx, sy] = pol((rCentre + rTech) / 2, (a0 + a1) / 2)
    labels.push(<text key={`ls${si}`} x={sx} y={sy} fontSize={11} fontWeight={700} fill="#3A2A1E" textAnchor="middle" dominantBaseline="middle" style={{ pointerEvents: 'none' }}>{s.nom}</text>)
    secteurAngles.push([a0, a1])
  })
  const detail = sel ? secteurs[sel.s].techniques[sel.t] : null
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 10, padding: 14, background: '#FFFFFF' }}>
      <svg viewBox="0 0 400 400" style={{ width: '100%', maxWidth: 420, display: 'block', margin: '0 auto' }}>
        {parts}
        <circle cx={cx} cy={cy} r={rCentre} fill="#F6EDE6" stroke="#FFF" strokeWidth={2} />
        <text x={cx} y={cy} fontSize={11} fontWeight={700} fill="#3A2A1E" textAnchor="middle" dominantBaseline="middle">Methodes</text>
        {parts}
        {labels}
      </svg>
      <div style={{ marginTop: 10, minHeight: 44, background: detail ? '#FBEAF0' : '#F7F9FB', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: '#374151' }}>
        {detail ? <><strong>{detail.nom}</strong> : {detail.definition}</> : "Cliquez sur une technique de la roue pour afficher sa definition."}
      </div>
    </div>
  )
}

// Tour de table : zone centrale (image ou table stylisee) entouree de bulles.
function TourDeTableVue({ data, couleur }: { data: { image?: string; bulles: { locuteur: string; texte: string }[] }; couleur: string }) {
  const bulle = (b: { locuteur: string; texte: string }, i: number) => (
    <div key={i} style={{ background: '#DCE9F5', border: '1px solid #9DBBDD', borderRadius: 12, padding: '10px 12px', fontSize: 12.5, color: '#25384A', lineHeight: 1.5 }}>
      <div style={{ fontWeight: 700, marginBottom: 3 }}>{b.locuteur}</div>
      {b.texte}
    </div>
  )
  const gauche = data.bulles.filter((_, i) => i % 2 === 0)
  const droite = data.bulles.filter((_, i) => i % 2 === 1)
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 10, padding: 14, background: '#FFFFFF' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{gauche.map(bulle)}</div>
        <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#CFE3D8', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${couleur}` }}>
          {data.image ? <img src={data.image} alt="Tour de table" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <span style={{ fontSize: 30 }}>👥</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{droite.map(bulle)}</div>
      </div>
    </div>
  )
}

// Symboles (icones SVG inline) pour le parcours.
function SymboleParcours({ nom, couleur }: { nom: EtapeParcours['symbole']; couleur: string }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: couleur, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (nom) {
    case 'etincelle': return <svg {...p}><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.4L12 15l-1.9-4.6L5.5 9l4.6-1.4z" /><path d="M19 15l.8 2 .2.8" /></svg>
    case 'trophee': return <svg {...p}><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z" /><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" /></svg>
    case 'personnes': return <svg {...p}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6" /></svg>
    case 'interdit': return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg>
    case 'volant': return <svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.5" /><path d="M3.5 12h6M14.5 12h6M12 3.5v6M9.5 14.5l-4 4M14.5 14.5l4 4" /></svg>
    case 'cible': return <svg {...p}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></svg>
    case 'ampoule': return <svg {...p}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z" /></svg>
    case 'coche': return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></svg>
  }
}

// Parcours : chemin vertical, cartes alternees gauche/droite, reliees par une
// ligne verticale centrale avec pastilles numerotees et symboles.
function ParcoursVue({ a, couleur }: { a: AnnexeParcours; couleur: string }) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 10, overflow: 'hidden' }}>
      {a.titre && <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>🧭 {a.titre}</div>}
      <div style={{ position: 'relative', padding: '18px 8px' }}>
        <div style={{ position: 'absolute', left: '50%', top: 18, bottom: 18, width: 3, background: '#E7DCE3', transform: 'translateX(-50%)', borderRadius: 2 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {a.etapes.map((e, i) => {
            const gauche = i % 2 === 0
            return (
              <div key={e.numero} style={{ position: 'relative', display: 'flex', justifyContent: gauche ? 'flex-start' : 'flex-end' }}>
                <div style={{ position: 'absolute', left: '50%', top: 4, transform: 'translateX(-50%)', width: 40, height: 40, borderRadius: '50%', background: '#FFFFFF', border: `3px solid ${couleur}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <SymboleParcours nom={e.symbole} couleur={couleur} />
                </div>
                <div style={{ width: 'calc(50% - 34px)', background: '#FBEAF0', border: `1px solid ${couleur}22`, borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                    <span style={{ background: couleur, color: '#FFF', borderRadius: 6, fontSize: 11, fontWeight: 700, padding: '2px 7px' }}>Regle n°{e.numero}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#4B1528' }}>{e.titre}</span>
                  </div>
                  {e.contenu.map((c, j) => (
                    <p key={j} style={{ margin: j === 0 ? 0 : '5px 0 0', fontSize: 12.5, color: '#5A3543', lineHeight: 1.55 }}>{c}</p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Choix de photos : pour chaque categorie, l'eleve clique la bonne photo. La
// photo choisie passe en surbrillance (couleur scenario) avec une coche. Une
// seule photo active par categorie. Stocke le numero (1-based) choisi.
function ChoixPhotosVue({ a, saisies, set, verrouille, couleur }: {
  a: AnnexeChoixPhotos; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string
}) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>🧥 {a.titre}</div>
      {a.consigne && (
        <div style={{ background: '#F7F9FB', borderBottom: '1px solid #E2E8F0', padding: '9px 12px', fontSize: 12.5, color: '#374151' }}>{a.consigne}</div>
      )}
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {a.categories.map((cat) => {
          const choisi = saisies[`${a.id}.${cat.cle}`] ?? ''
          return (
            <div key={cat.cle}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 7 }}>{cat.libelle}</div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(4, cat.photos.length)}, 1fr)`, gap: 9 }}>
                {cat.photos.map((ph, i) => {
                  const num = String(i + 1)
                  const actif = choisi === num
                  return (
                    <button key={i} type="button" disabled={verrouille}
                      onClick={() => set(`${a.id}.${cat.cle}`, actif ? '' : num)}
                      style={{ position: 'relative', border: actif ? `3px solid ${couleur}` : '1px solid #E3DCD0', borderRadius: 10, background: actif ? '#FBEAF0' : '#FFFFFF', padding: 8, cursor: verrouille ? 'default' : 'pointer', textAlign: 'center' }}>
                      <span style={{ position: 'absolute', top: 5, left: 7, fontSize: 11, color: '#8A8578', fontWeight: 700 }}>{num}</span>
                      {actif && <span style={{ position: 'absolute', top: 5, right: 6, background: couleur, color: '#FFF', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✓</span>}
                      <img src={ph.src} alt={ph.alt ?? `${cat.libelle} ${num}`} style={{ width: '100%', height: 96, objectFit: 'contain', borderRadius: 4 }} />
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Carte de visite classique moderne : saisie a gauche, rendu final live a
// droite (vraie carte pro aux couleurs Mamie & Co).
function champCarte(cle: string, libelle: string, saisies: Saisies, set: (id: string, v: string) => void, id: string, verrouille: boolean, placeholder?: string) {
  const st: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '7px 9px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none' }
  return (
    <div key={cle}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4B5563', marginBottom: 3 }}>{libelle}</label>
      <input value={saisies[`${id}.${cle}`] ?? ''} onChange={(e) => set(`${id}.${cle}`, e.target.value)} disabled={verrouille} placeholder={placeholder} style={st} />
    </div>
  )
}

function ApercuCarte({ a, saisies, couleur, qr }: { a: AnnexeCarteVisite | AnnexeECarte; saisies: Saisies; couleur: string; qr?: string }) {
  const g = (c: string) => saisies[`${a.id}.${c}`] ?? ''
  const nom = g('nom') || 'Prénom Nom'
  const fonction = g('fonction') || 'Fonction'
  const entreprise = a.entreprise ?? 'Mamie & Co'
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '0.5px solid #E2E8F0', background: '#FFFFFF', maxWidth: 340 }}>
      <div style={{ background: couleur, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {a.logo
          ? <img src={a.logo} alt={entreprise} style={{ height: 30 }} />
          : <span style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: '#FFFFFF', fontWeight: 700 }}>{entreprise}</span>}
        {a.slogan && <span style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.85)', textAlign: 'right', maxWidth: 130 }}>{a.slogan}</span>}
      </div>
      <div style={{ padding: 14, display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#1F2933' }}>{nom}</div>
          <div style={{ fontSize: 12, color: couleur, marginBottom: 8, fontWeight: 600 }}>{fonction}</div>
          <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.8, wordBreak: 'break-word' }}>
            {g('tel') && <div>☎ {g('tel')}</div>}
            {g('mail') && <div>✉ {g('mail')}</div>}
            {g('adresse') && <div>⌂ {g('adresse')}</div>}
            {g('site') && <div>🌐 {g('site')}</div>}
          </div>
        </div>
        {qr && (
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <img src={qr} alt="QR code vCard" style={{ width: 74, height: 74, borderRadius: 6, border: '0.5px solid #E2E8F0' }} />
            <div style={{ fontSize: 8, color: '#6B7280', marginTop: 2 }}>Scannez-moi</div>
          </div>
        )}
      </div>
    </div>
  )
}

function CarteVisiteVue({ a, saisies, set, verrouille, couleur }: {
  a: AnnexeCarteVisite; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string
}) {
  const c = a.couleur ?? couleur
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ background: c, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>🪪 {a.titre}</div>
      <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 18, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {champCarte('nom', 'Prénom et nom', saisies, set, a.id, verrouille, 'Camille Dubreuil')}
          {champCarte('fonction', 'Fonction', saisies, set, a.id, verrouille, 'Conseillère de vente')}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>{champCarte('tel', 'Téléphone', saisies, set, a.id, verrouille, '06 12 34 56 78')}</div>
            <div style={{ flex: 1 }}>{champCarte('mail', 'E-mail', saisies, set, a.id, verrouille, 'camille.dubreuil@mamieandco.com')}</div>
          </div>
          {champCarte('adresse', 'Adresse', saisies, set, a.id, verrouille, '21 rue Alphonse de Saintonge, La Rochelle')}
          {champCarte('site', 'Site internet', saisies, set, a.id, verrouille, 'www.mamieandco.com')}
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Aperçu final</div>
          <ApercuCarte a={a} saisies={saisies} couleur={c} />
        </div>
      </div>
    </div>
  )
}

function ECarteVue({ a, saisies, set, verrouille, couleur }: {
  a: AnnexeECarte; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string
}) {
  const c = a.couleur ?? couleur
  const [qr, setQr] = useState<string>('')
  const g = (k: string) => saisies[`${a.id}.${k}`] ?? ''
  useEffect(() => {
    const nom = g('nom').trim()
    const parts = nom.split(' ')
    const prenom = parts.slice(0, -1).join(' ') || nom
    const famille = parts.length > 1 ? parts[parts.length - 1] : ''
    const vcard = [
      'BEGIN:VCARD', 'VERSION:3.0',
      `N:${famille};${prenom};;;`,
      `FN:${nom}`,
      a.entreprise ? `ORG:${a.entreprise}` : 'ORG:Mamie & Co',
      g('fonction') ? `TITLE:${g('fonction')}` : '',
      g('tel') ? `TEL;TYPE=CELL:${g('tel')}` : '',
      g('mail') ? `EMAIL:${g('mail')}` : '',
      g('adresse') ? `ADR:;;${g('adresse')};;;;` : '',
      g('site') ? `URL:${g('site')}` : '',
      'END:VCARD',
    ].filter(Boolean).join('\n')
    QRCode.toDataURL(vcard, { margin: 1, width: 220, color: { dark: '#1F2933', light: '#FFFFFF' } })
      .then(setQr).catch(() => setQr(''))
  }, [saisies, a.id]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ background: c, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>📱 {a.titre}</div>
      <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 18, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {champCarte('nom', 'Prénom et nom', saisies, set, a.id, verrouille, 'Camille Dubreuil')}
          {champCarte('fonction', 'Fonction', saisies, set, a.id, verrouille, 'Conseillère de vente')}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>{champCarte('tel', 'Téléphone', saisies, set, a.id, verrouille, '06 12 34 56 78')}</div>
            <div style={{ flex: 1 }}>{champCarte('mail', 'E-mail', saisies, set, a.id, verrouille, 'camille.dubreuil@mamieandco.com')}</div>
          </div>
          {champCarte('adresse', 'Adresse', saisies, set, a.id, verrouille, '21 rue Alphonse de Saintonge, La Rochelle')}
          {champCarte('site', 'Site internet', saisies, set, a.id, verrouille, 'www.mamieandco.com')}
          <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.5, background: '#F7F9FB', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 10px' }}>
            Le QR code se met a jour automatiquement. En le scannant avec un telephone, le contact s'enregistre directement dans le repertoire (format vCard).
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Aperçu final (e-carte)</div>
          <ApercuCarte a={a} saisies={saisies} couleur={c} qr={qr} />
        </div>
      </div>
    </div>
  )
}

// Histogramme construit par l'eleve : chaque barre part de 0 %. L'eleve fixe la
// hauteur a la souris (glisser la poignee), au clavier (barre selectionnee +
// fleches, +/-1 %, Maj +/-5 %) ou en saisissant directement la valeur.
function HistogrammeAnnexeVue({ a, saisies, set, verrouille, couleur }: {
  a: AnnexeHistogramme; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string
}) {
  const max = a.uniteMax ?? 100
  const pas = a.pas ?? 10
  const suffixe = a.suffixe ?? '%'
  const [sel, setSel] = useState<string | null>(null)
  const [drag, setDrag] = useState<string | null>(null)
  const zoneRef = useRef<HTMLDivElement | null>(null)

  const HAUT = 300 // hauteur trace en px
  const val = (cle: string): number => {
    const v = parseFloat((saisies[`${a.id}.${cle}`] ?? '').replace(',', '.'))
    return isNaN(v) ? 0 : Math.min(max, Math.max(0, v))
  }
  const aUneValeur = (cle: string) => (saisies[`${a.id}.${cle}`] ?? '').trim().length > 0
  const fixer = (cle: string, v: number) => {
    if (verrouille) return
    const arrondi = Math.round(Math.min(max, Math.max(0, v)) * 10) / 10
    set(`${a.id}.${cle}`, String(arrondi))
  }

  const hauteurDepuisSouris = (clientY: number): number => {
    const zone = zoneRef.current
    if (!zone) return 0
    const r = zone.getBoundingClientRect()
    const y = clientY - r.top
    const ratio = 1 - y / r.height
    return ratio * max
  }
  useEffect(() => {
    if (!drag) return
    const move = (e: MouseEvent | TouchEvent) => {
      const cy = 'touches' in e ? e.touches[0]?.clientY : (e as MouseEvent).clientY
      if (cy != null) fixer(drag, hauteurDepuisSouris(cy))
    }
    const up = () => setDrag(null)
    window.addEventListener('mousemove', move)
    window.addEventListener('touchmove', move, { passive: false })
    window.addEventListener('mouseup', up)
    window.addEventListener('touchend', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('touchmove', move)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchend', up)
    }
  }, [drag]) // eslint-disable-line react-hooks/exhaustive-deps

  const graduations: number[] = []
  for (let g = 0; g <= max; g += pas) graduations.push(g)

  const barreSel = a.barres.find((b) => b.cle === sel)

  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 10, overflow: 'hidden', background: '#FFFFFF' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '10px 14px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>📊 {a.titre}</span>
      </div>

      {a.consigne && a.consigne.length > 0 && (
        <div style={{ background: '#F7F9FB', borderBottom: '1px solid #E2E8F0', padding: '10px 14px', fontSize: 12.5, color: '#374151', lineHeight: 1.6 }}>
          {a.consigne.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < a.consigne!.length - 1 ? 4 : 0 }}>
              <span style={{ color: couleur, fontWeight: 800 }}>{i + 1}.</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '18px 16px 8px' }}>
        <div style={{ display: 'flex' }}>
          {/* Axe Y */}
          <div style={{ position: 'relative', width: 44, height: HAUT, flexShrink: 0 }}>
            {graduations.map((g) => (
              <div key={g} style={{ position: 'absolute', right: 6, bottom: `${(g / max) * 100}%`, transform: 'translateY(50%)', fontSize: 11, color: '#6B7280' }}>{g}{suffixe}</div>
            ))}
          </div>

          {/* Zone de trace */}
          <div ref={zoneRef} style={{ position: 'relative', flex: 1, height: HAUT, borderLeft: '2px solid #9AA5B1', borderBottom: '2px solid #9AA5B1' }}>
            {/* Quadrillage */}
            {graduations.map((g) => (
              <div key={g} style={{ position: 'absolute', left: 0, right: 0, bottom: `${(g / max) * 100}%`, height: 1, background: g === 0 ? 'transparent' : '#EDF1F5' }} />
            ))}
            {/* Barres */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '0 2%' }}>
              {a.barres.map((b) => {
                const v = val(b.cle)
                const actif = sel === b.cle
                const rempli = aUneValeur(b.cle)
                return (
                  <div key={b.cle} style={{ position: 'relative', width: `${70 / a.barres.length}%`, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {/* Valeur au-dessus */}
                    <div style={{ position: 'absolute', bottom: `calc(${(v / max) * 100}% + 10px)`, fontSize: 11.5, fontWeight: 700, color: rempli ? couleur : '#B0BAC5', whiteSpace: 'nowrap' }}>
                      {rempli ? `${b.sousLibelle ? b.sousLibelle + ' · ' : ''}${(Math.round(v * 10) / 10)}${suffixe}` : `0${suffixe}`}
                    </div>
                    {/* Barre cliquable / selectionnable */}
                    <div
                      role="slider"
                      tabIndex={verrouille ? -1 : 0}
                      aria-label={b.categorie}
                      aria-valuenow={Math.round(v)}
                      aria-valuemin={0}
                      aria-valuemax={max}
                      onFocus={() => setSel(b.cle)}
                      onClick={() => setSel(b.cle)}
                      onKeyDown={(e) => {
                        if (verrouille) return
                        const step = e.shiftKey ? 5 : 1
                        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); fixer(b.cle, v + step) }
                        else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); fixer(b.cle, v - step) }
                        else if (e.key === 'Home') { e.preventDefault(); fixer(b.cle, 0) }
                        else if (e.key === 'End') { e.preventDefault(); fixer(b.cle, max) }
                      }}
                      style={{
                        width: '100%',
                        height: `${(v / max) * 100}%`,
                        minHeight: 2,
                        background: rempli ? couleur : '#E3E8ED',
                        opacity: rempli ? (actif ? 1 : 0.88) : 1,
                        borderRadius: '4px 4px 0 0',
                        cursor: verrouille ? 'default' : 'pointer',
                        outline: actif ? `2px solid ${couleur}` : 'none',
                        outlineOffset: 2,
                        transition: drag === b.cle ? 'none' : 'height 0.08s',
                        position: 'relative',
                      }}
                    >
                      {/* Poignee a tirer */}
                      {!verrouille && (
                        <div
                          onMouseDown={(e) => { e.preventDefault(); setSel(b.cle); setDrag(b.cle) }}
                          onTouchStart={(e) => { e.preventDefault(); setSel(b.cle); setDrag(b.cle) }}
                          title="Glissez pour régler la hauteur"
                          style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', width: 18, height: 18, borderRadius: '50%', background: '#FFFFFF', border: `2.5px solid ${couleur}`, cursor: 'ns-resize', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Categories sous l'axe X */}
        <div style={{ display: 'flex', paddingLeft: 44 }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', padding: '8px 2% 0' }}>
            {a.barres.map((b) => (
              <div key={b.cle} onClick={() => setSel(b.cle)} style={{ width: `${70 / a.barres.length}%`, textAlign: 'center', fontSize: 11.5, color: sel === b.cle ? couleur : '#374151', fontWeight: sel === b.cle ? 700 : 400, cursor: 'pointer' }}>{b.categorie}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Barre d'outils : saisie directe de la barre selectionnee */}
      <div style={{ borderTop: '1px solid #E2E8F0', background: '#F7F9FB', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {barreSel ? (
          <>
            <span style={{ fontSize: 12.5, color: '#374151' }}>Barre : <strong>{barreSel.categorie}</strong></span>
            <input
              type="number" min={0} max={max} step={0.5}
              value={saisies[`${a.id}.${barreSel.cle}`] ?? ''}
              disabled={verrouille}
              onChange={(e) => fixer(barreSel.cle, parseFloat(e.target.value.replace(',', '.')) || 0)}
              style={{ width: 84, padding: '6px 8px', borderRadius: 6, border: '1px solid #C9D6E3', fontSize: 13, textAlign: 'right' }}
            />
            <span style={{ fontSize: 13, color: '#6B7280' }}>{suffixe}</span>
            <button type="button" disabled={verrouille} onClick={() => fixer(barreSel.cle, val(barreSel.cle) - 1)} style={{ border: '1px solid #C9D6E3', background: '#FFFFFF', borderRadius: 6, width: 30, height: 30, cursor: verrouille ? 'default' : 'pointer', fontSize: 16 }}>−</button>
            <button type="button" disabled={verrouille} onClick={() => fixer(barreSel.cle, val(barreSel.cle) + 1)} style={{ border: '1px solid #C9D6E3', background: '#FFFFFF', borderRadius: 6, width: 30, height: 30, cursor: verrouille ? 'default' : 'pointer', fontSize: 16 }}>+</button>
          </>
        ) : (
          <span style={{ fontSize: 12.5, color: '#6B7280' }}>Cliquez sur une barre pour la régler, ou tirez sa poignée ronde vers le haut.</span>
        )}
      </div>
    </div>
  )
}

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
function QuestionnaireAnnexeVue({ a, saisies, set, verrouille, couleur }: { a: AnnexeQuestionnaire; saisies: Saisies; set: (id: string, v: string) => void; verrouille: boolean; couleur: string }) {
  const [page, setPage] = useState(0)
  const total = a.nbPages
  const types = a.typesQuestion ?? ['Question ouverte', 'Question a reponse unique', 'Question a matrice', 'Question a evaluation', 'Question alternative']
  const theme = a.themes?.[page]
  const violet = '#673AB7'
  return (
    <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden', background: '#F4F1FA' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700 }}>{a.titre}</div>
      <div style={{ padding: 16 }}>
        {/* barre facon Google Form */}
        <div style={{ background: '#FFFFFF', borderTop: `8px solid ${violet}`, borderRadius: 8, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#202124' }}>Questionnaire de satisfaction</span>
            <span style={{ fontSize: 12.5, color: '#5F6368', fontWeight: 700 }}>Question {page + 1} sur {total}</span>
          </div>
          {theme && <div style={{ display: 'inline-block', background: '#EDE7F6', color: violet, fontSize: 12, fontWeight: 700, borderRadius: 14, padding: '3px 12px', marginBottom: 12 }}>Theme : {theme}</div>}
          <div style={{ border: '1px solid #DADCE0', borderRadius: 8, padding: 14 }}>
            <label style={{ display: 'block', fontSize: 12.5, color: '#5F6368', marginBottom: 4 }}>Intitule de la question</label>
            <input value={saisies[`${a.id}.q${page}.texte`] ?? ''} onChange={(e) => set(`${a.id}.q${page}.texte`, e.target.value)} disabled={verrouille}
              placeholder="Saisissez votre question..."
              style={{ width: '100%', boxSizing: 'border-box', border: 'none', borderBottom: `2px solid ${violet}`, fontSize: 15, padding: '6px 2px', outline: 'none', background: 'transparent', marginBottom: 14 }} />
            <label style={{ display: 'block', fontSize: 12.5, color: '#5F6368', marginBottom: 4 }}>Type de question</label>
            <select value={saisies[`${a.id}.q${page}.type`] ?? ''} onChange={(e) => set(`${a.id}.q${page}.type`, e.target.value)} disabled={verrouille}
              style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #DADCE0', borderRadius: 6, fontSize: 14, padding: '8px 10px', outline: 'none', background: verrouille ? '#F3F4F6' : '#FFFFFF' }}>
              <option value="">-- Choisir un type --</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        {/* navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <button onClick={() => setPage((v) => Math.max(0, v - 1))} disabled={page === 0}
            style={{ background: page === 0 ? '#E5E7EB' : couleur, color: page === 0 ? '#9CA3AF' : '#FFFFFF', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: page === 0 ? 'default' : 'pointer' }}>← Retour</button>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} onClick={() => setPage(i)} style={{ width: 10, height: 10, borderRadius: '50%', background: i === page ? couleur : '#D1D5DB', display: 'inline-block', cursor: 'pointer' }} />
            ))}
          </div>
          <button onClick={() => setPage((v) => Math.min(total - 1, v + 1))} disabled={page === total - 1}
            style={{ background: page === total - 1 ? '#E5E7EB' : couleur, color: page === total - 1 ? '#9CA3AF' : '#FFFFFF', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: page === total - 1 ? 'default' : 'pointer' }}>Suivant →</button>
        </div>
      </div>
    </div>
  )
}

function rendrePratiques(a: AnnexePratiques, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const [c1, c2] = a.colonnes ?? ['Trompeuse', 'Agressive']
  const th: React.CSSProperties = { background: couleur, color: '#FFFFFF', fontSize: 12.5, fontWeight: 700, padding: '9px 10px', textAlign: 'center' }
  const td: React.CSSProperties = { border: '1px solid #E2E8F0', padding: '8px 10px', fontSize: 13, verticalAlign: 'middle' }
  return (
    <div style={{ border: '1px solid #C9D6E3', borderRadius: 8, overflow: 'hidden', background: '#FFFFFF' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700 }}>{a.titre}</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: 'left' }}>N</th>
              <th style={{ ...th, textAlign: 'left' }}>Nom du client</th>
              <th style={th}>{c1}</th>
              <th style={th}>{c2}</th>
              <th style={{ ...th, textAlign: 'left' }}>Justification</th>
            </tr>
          </thead>
          <tbody>
            {a.clients.map((cl) => {
              const choix = saisies[`${a.id}.${cl.numero}.type`] ?? ''
              return (
                <tr key={cl.numero}>
                  <td style={{ ...td, textAlign: 'center', fontWeight: 700, color: couleur, background: '#F8FBFF' }}>{cl.numero}</td>
                  <td style={td}>
                    {a.nomsAremplir ? (
                      <input value={saisies[`${a.id}.${cl.numero}.nom`] ?? ''} onChange={(e) => set(`${a.id}.${cl.numero}.nom`, e.target.value)} disabled={verrouille} placeholder="Nom..." style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #D1D5DB', borderRadius: 5, padding: '6px 8px', fontSize: 13, outline: 'none', background: verrouille ? '#F3F4F6' : '#FFFFFF' }} />
                    ) : (cl.nom ?? '')}
                  </td>
                  {(['t', 'a'] as const).map((v) => (
                    <td key={v} style={{ ...td, textAlign: 'center' }}>
                      <button onClick={() => !verrouille && set(`${a.id}.${cl.numero}.type`, v)} disabled={verrouille}
                        style={{ width: 24, height: 24, borderRadius: 5, border: `2px solid ${choix === v ? couleur : '#C9D6E3'}`, background: choix === v ? couleur : '#FFFFFF', color: '#FFFFFF', fontSize: 15, fontWeight: 800, cursor: verrouille ? 'default' : 'pointer', lineHeight: 1 }}>
                        {choix === v ? '\u2713' : ''}
                      </button>
                    </td>
                  ))}
                  <td style={td}>
                    <textarea value={saisies[`${a.id}.${cl.numero}.just`] ?? ''} onChange={(e) => set(`${a.id}.${cl.numero}.just`, e.target.value)} disabled={verrouille} rows={2} placeholder="Justifiez..." style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #D1D5DB', borderRadius: 5, padding: '6px 8px', fontSize: 13, outline: 'none', resize: 'vertical', background: verrouille ? '#F3F4F6' : '#FFFFFF' }} />
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

// Module d'analyse de clientele facon CRM : repartition (cases a cocher + %) +
// profil-type (un critere par ligne, reponse + %).
function rendreClientele(a: AnnexeClientele, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 14, padding: '8px 10px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none' }
  const champPct: React.CSSProperties = { ...champ, textAlign: 'center' }
  const coche = (cle: string) => (saisies[cle] ?? '') === '1'
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>👥 {a.titre}</div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>Répartition de la clientèle</div>
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', marginBottom: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 130px', background: '#F3F6F9', padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#4B5563' }}>
            <div>Type de clientèle</div><div style={{ textAlign: 'center' }}>Cochez</div><div style={{ textAlign: 'center' }}>Pourcentage</div>
          </div>
          {a.typesClientele.map((t, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 130px', alignItems: 'center', padding: '8px 12px', borderTop: '1px solid #EEF2F6' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2933' }}>{t}</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input type="checkbox" checked={coche(`${a.id}.t${i}.coche`)} disabled={verrouille} onChange={(e) => set(`${a.id}.t${i}.coche`, e.target.checked ? '1' : '')} style={{ width: 18, height: 18, cursor: verrouille ? 'default' : 'pointer', accentColor: couleur }} />
              </div>
              <input value={saisies[`${a.id}.t${i}.pct`] ?? ''} onChange={(e) => set(`${a.id}.t${i}.pct`, e.target.value)} disabled={verrouille} placeholder="%" style={champPct} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>Profil-type du client</div>
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 130px', background: '#F3F6F9', padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#4B5563' }}>
            <div>Critères</div><div>Réponse</div><div style={{ textAlign: 'center' }}>Pourcentage</div>
          </div>
          {a.criteres.map((c, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 130px', alignItems: 'center', gap: 8, padding: '8px 12px', borderTop: '1px solid #EEF2F6' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2933' }}>{c}</div>
              <input value={saisies[`${a.id}.c${i}.rep`] ?? ''} onChange={(e) => set(`${a.id}.c${i}.rep`, e.target.value)} disabled={verrouille} style={champ} />
              <input value={saisies[`${a.id}.c${i}.pct`] ?? ''} onChange={(e) => set(`${a.id}.c${i}.pct`, e.target.value)} disabled={verrouille} placeholder="%" style={champPct} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Tableau de veille concurrentielle : nom + cases Direct/Indirect exclusives +
// justification.
function rendreConcurrents(a: AnnexeConcurrents, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 14, padding: '8px 10px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none' }
  const setExcl = (i: number, col: 'd' | 'i') => {
    set(`${a.id}.l${i}.d`, col === 'd' ? '1' : '')
    set(`${a.id}.l${i}.i`, col === 'i' ? '1' : '')
  }
  const coche = (cle: string) => (saisies[cle] ?? '') === '1'
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>🔍 {a.entete ?? a.titre}</div>
      <div style={{ padding: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 1.4fr', gap: 8, padding: '0 4px 8px', fontSize: 12, fontWeight: 700, color: '#4B5563' }}>
          <div>Nom du concurrent</div><div style={{ textAlign: 'center' }}>Direct</div><div style={{ textAlign: 'center' }}>Indirect</div><div>Justification</div>
        </div>
        {Array.from({ length: a.nbLignes }).map((_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 1.4fr', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <input value={saisies[`${a.id}.l${i}.nom`] ?? ''} onChange={(e) => set(`${a.id}.l${i}.nom`, e.target.value)} disabled={verrouille} placeholder={`Concurrent ${i + 1}`} style={champ} />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <input type="checkbox" checked={coche(`${a.id}.l${i}.d`)} disabled={verrouille} onChange={() => setExcl(i, 'd')} style={{ width: 18, height: 18, cursor: verrouille ? 'default' : 'pointer', accentColor: couleur }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <input type="checkbox" checked={coche(`${a.id}.l${i}.i`)} disabled={verrouille} onChange={() => setExcl(i, 'i')} style={{ width: 18, height: 18, cursor: verrouille ? 'default' : 'pointer', accentColor: couleur }} />
            </div>
            <input value={saisies[`${a.id}.l${i}.just`] ?? ''} onChange={(e) => set(`${a.id}.l${i}.just`, e.target.value)} disabled={verrouille} placeholder="Justification" style={champ} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Formulaire d'etude : questions numerotees + zone de reponse.
function rendreQuestionsReponses(a: AnnexeQuestionsReponses, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 14, padding: '8px 10px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none', resize: 'vertical' }
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>📊 {a.entete ?? a.titre}</div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {a.questions.map((q, i) => (
          <div key={i} style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: '#F7F9FB' }}>
              <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: couleur, color: '#FFFFFF', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2933', lineHeight: 1.4 }}>{q.libelle}</span>
            </div>
            <div style={{ padding: 12 }}>
              <textarea value={saisies[`${a.id}.q${i}`] ?? ''} onChange={(e) => set(`${a.id}.q${i}`, e.target.value)} disabled={verrouille} rows={q.lignes ?? 2} placeholder="Votre réponse…" style={champ} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Tableau de freins : citation du frein + cases a cocher exclusives.
function rendreFreins(a: AnnexeFreins, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 14, padding: '8px 10px', borderRadius: 6, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none' }
  const setExcl = (i: number, cj: number) => a.colonnes.forEach((_, k) => set(`${a.id}.l${i}.c${k}`, k === cj ? '1' : ''))
  const coche = (cle: string) => (saisies[cle] ?? '') === '1'
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>🚧 {a.entete ?? a.titre}</div>
      <div style={{ padding: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `1fr ${a.colonnes.map(() => '110px').join(' ')}`, gap: 8, marginBottom: 8, fontSize: 12, fontWeight: 700, color: '#4B5563' }}>
          <div>Les freins liés à l'achat</div>
          {a.colonnes.map((c) => <div key={c} style={{ textAlign: 'center' }}>{c}</div>)}
        </div>
        {Array.from({ length: a.nbLignes }).map((_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: `1fr ${a.colonnes.map(() => '110px').join(' ')}`, gap: 8, marginBottom: 6, alignItems: 'center' }}>
            <input value={saisies[`${a.id}.l${i}.frein`] ?? ''} onChange={(e) => set(`${a.id}.l${i}.frein`, e.target.value)} disabled={verrouille} placeholder="Citez le frein relevé dans le texte" style={champ} />
            {a.colonnes.map((_, cj) => (
              <div key={cj} style={{ display: 'flex', justifyContent: 'center' }}>
                <input type="checkbox" checked={coche(`${a.id}.l${i}.c${cj}`)} disabled={verrouille} onChange={() => setExcl(i, cj)} style={{ width: 18, height: 18, cursor: verrouille ? 'default' : 'pointer', accentColor: couleur }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Fiche client facon logiciel de gestion commerciale (fenetre, sections, boutons).
function rendreFicheClient(a: AnnexeFicheClient, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '5px 8px', borderRadius: 3, border: '1px solid #9FB0C4', background: verrouille ? '#EFF2F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933', outline: 'none' }
  const v = (k: string) => saisies[`${a.id}.${k}`] ?? ''
  const set2 = (k: string, val: string) => set(`${a.id}.${k}`, val)
  const label: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: '#2A3A53', marginBottom: 3, display: 'block' }
  const fieldset: React.CSSProperties = { border: '1px solid #B7C4D6', borderRadius: 4, padding: '14px 14px 16px', position: 'relative', marginTop: 10 }
  const legend: React.CSSProperties = { position: 'absolute', top: -10, left: 12, background: '#DCE4EF', padding: '0 8px', fontSize: 12.5, fontWeight: 700, color: '#2A3A53' }
  const select = (k: string, opts: string[]) => (
    <select value={v(k)} disabled={verrouille} onChange={(e) => set2(k, e.target.value)} style={{ ...champ, appearance: 'auto' }}>
      <option value="">—</option>
      {opts.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
  return (
    <div style={{ border: '2px solid #1F3A6E', borderRadius: 6, overflow: 'hidden', background: '#DCE4EF', fontFamily: 'Arial, sans-serif', maxWidth: 720 }}>
      <div style={{ background: 'linear-gradient(#2E4A86,#1F3A6E)', color: '#FFFFFF', padding: '9px 14px', fontSize: 15, fontWeight: 800, letterSpacing: 1, textAlign: 'center' }}>FICHE CLIENT</div>
      <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 16 }}>
        <div>
          <div style={fieldset}>
            <span style={legend}>Identité</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><span style={label}>Statut : *</span>{select('statut', ['Particulier', 'Professionnel'])}</div>
              <div><span style={label}>Civilité : *</span>{select('civilite', ['Madame', 'Monsieur'])}</div>
            </div>
            <div style={{ marginTop: 8 }}><span style={label}>Nom : *</span><input value={v('nom')} disabled={verrouille} onChange={(e) => set2('nom', e.target.value)} style={champ} /></div>
            <div style={{ marginTop: 8 }}><span style={label}>Prénom :</span><input value={v('prenom')} disabled={verrouille} onChange={(e) => set2('prenom', e.target.value)} style={champ} /></div>
          </div>
          <div style={fieldset}>
            <span style={legend}>Coordonnées</span>
            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 10 }}>
              <div><span style={label}>N° rue :</span><input value={v('numrue')} disabled={verrouille} onChange={(e) => set2('numrue', e.target.value)} style={champ} /></div>
              <div><span style={label}>Nom de rue :</span><input value={v('rue')} disabled={verrouille} onChange={(e) => set2('rue', e.target.value)} style={champ} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 10, marginTop: 8 }}>
              <div><span style={label}>Code Postal :</span><input value={v('cp')} disabled={verrouille} onChange={(e) => set2('cp', e.target.value)} style={champ} /></div>
              <div><span style={label}>Ville :</span><input value={v('ville')} disabled={verrouille} onChange={(e) => set2('ville', e.target.value)} style={champ} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
              <div><span style={label}>Téléphone :</span><input value={v('tel')} disabled={verrouille} onChange={(e) => set2('tel', e.target.value)} style={champ} /></div>
              <div><span style={label}>Portable :</span><input value={v('portable')} disabled={verrouille} onChange={(e) => set2('portable', e.target.value)} style={champ} /></div>
            </div>
            <div style={{ marginTop: 8 }}><span style={label}>Email :</span><input value={v('email')} disabled={verrouille} onChange={(e) => set2('email', e.target.value)} style={champ} /></div>
          </div>
        </div>
        <div style={fieldset}>
          <span style={legend}>Divers</span>
          <div><span style={label}>Montant avoir :</span><input value={v('avoir')} disabled={verrouille} onChange={(e) => set2('avoir', e.target.value)} style={champ} /></div>
          <div style={{ marginTop: 8 }}><span style={label}>Produit acheté :</span><input value={v('produit')} disabled={verrouille} onChange={(e) => set2('produit', e.target.value)} style={champ} /></div>
          <div style={{ marginTop: 8 }}><span style={label}>Commentaire :</span><textarea value={v('commentaire')} disabled={verrouille} onChange={(e) => set2('commentaire', e.target.value)} rows={7} style={{ ...champ, resize: 'vertical' }} /></div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderTop: '1px solid #B7C4D6', background: '#D2DBE9' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #9FB0C4', background: '#EEF2F7', borderRadius: 5, padding: '6px 12px', fontSize: 12.5, color: '#3A4A63', fontWeight: 700 }}>🧹 Nettoyer</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #9FB0C4', background: '#EEF2F7', borderRadius: 5, padding: '6px 12px', fontSize: 12.5, color: '#9AA7B8', fontWeight: 700 }}>🗄 Historique</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #2E7D46', background: '#E4F6EC', borderRadius: 5, padding: '6px 14px', fontSize: 12.5, color: '#1B7F4B', fontWeight: 800 }}>✓ Valider</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #B23B3B', background: '#FBEAEA', borderRadius: 5, padding: '6px 14px', fontSize: 12.5, color: '#9B2C2C', fontWeight: 800 }}>✕ Quitter</span>
        </div>
      </div>
    </div>
  )
}

// Planning d'interventions facon logiciel de prise de rendez-vous.
function rendrePlanning(a: AnnexePlanning, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 11, padding: '4px 5px', borderRadius: 3, border: '1px dashed #C9A227', background: verrouille ? '#FBF6E5' : '#FFFBEA', color: '#1F2933', outline: 'none', resize: 'vertical' }
  return (
    <div style={{ border: '1px solid #C9D6E3', borderRadius: 8, overflow: 'hidden', background: '#FFFFFF' }}>
      <div style={{ background: '#F2F6F9', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #E2E8F0' }}>
        {a.logo && <img src={a.logo} alt="Leroy Merlin" style={{ height: 26 }} />}
        <span style={{ fontSize: 13, fontWeight: 800, color: '#3A4A63' }}>PLANNING DES INTERVENTIONS</span>
      </div>
      <div style={{ padding: 10, overflowX: 'auto' }}>
        {a.mois.map((m, mi) => {
          const cellules: (CreneauPlanning | null)[] = []
          for (let i = 0; i < m.decalage; i++) cellules.push(null)
          // construit la liste jour par jour
          return (
            <div key={mi} style={{ marginBottom: 18 }}>
              <div style={{ background: couleur, color: '#FFFFFF', fontWeight: 800, fontSize: 13, padding: '6px 10px', borderRadius: 4, textAlign: 'center', marginBottom: 6 }}>{m.titre}</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 760 }}>
                <thead>
                  <tr>{jours.map((j) => <th key={j} style={{ background: '#2E6DB4', color: '#FFFFFF', fontSize: 11, fontWeight: 700, padding: '4px 2px', border: '1px solid #B7C4D6' }}>{j}</th>)}</tr>
                </thead>
                <tbody>
                  {(() => {
                    const lignes: React.ReactNode[] = []
                    const total = m.decalage + m.nbJours
                    const semaines = Math.ceil(total / 7)
                    for (let s = 0; s < semaines; s++) {
                      const jourCells = []
                      const matinCells = []
                      const apremCells = []
                      for (let d = 0; d < 7; d++) {
                        const idx = s * 7 + d
                        const jourNum = idx - m.decalage + 1
                        const valide = jourNum >= 1 && jourNum <= m.nbJours
                        const matin = valide ? m.creneaux.find((c) => c.jour === jourNum && c.creneau === 'matin') : undefined
                        const aprem = valide ? m.creneaux.find((c) => c.jour === jourNum && c.creneau === 'aprem') : undefined
                        jourCells.push(<td key={d} style={{ border: '1px solid #B7C4D6', background: '#EAF1F8', fontSize: 11, fontWeight: 800, color: '#2E6DB4', textAlign: 'right', padding: '2px 5px' }}>{valide ? jourNum : ''}</td>)
                        const cellStyle: React.CSSProperties = { border: '1px solid #B7C4D6', verticalAlign: 'top', padding: 3, fontSize: 10.5, height: 46, background: valide ? '#FFFFFF' : '#F4F6F8' }
                        const renderCreneau = (c: CreneauPlanning | undefined, cle: string) => {
                          if (!valide) return null
                          if (c?.ferie) return <span style={{ color: '#9B2C2C', fontWeight: 700 }}>JOUR FERIE</span>
                          if (c?.texte) return <span style={{ color: '#374151', lineHeight: 1.25 }}>{c.texte}</span>
                          return <textarea value={saisies[`${a.id}.${cle}`] ?? ''} onChange={(e) => set(`${a.id}.${cle}`, e.target.value)} disabled={verrouille} rows={2} placeholder="…" style={champ} />
                        }
                        matinCells.push(<td key={d} style={cellStyle}>{renderCreneau(matin, `m${mi}j${jourNum}matin`)}</td>)
                        apremCells.push(<td key={d} style={cellStyle}>{renderCreneau(aprem, `m${mi}j${jourNum}aprem`)}</td>)
                      }
                      lignes.push(<tr key={`j${s}`}>{jourCells}</tr>)
                      lignes.push(<tr key={`m${s}`}>{matinCells}</tr>)
                      lignes.push(<tr key={`a${s}`}>{apremCells}</tr>)
                    }
                    return lignes
                  })()}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
      <div style={{ padding: '6px 12px', fontSize: 11, color: '#6B7280', borderTop: '1px solid #EEF2F5' }}>Matin à partir de 8h · Après-midi à partir de 14h. Complétez la case jaune du créneau choisi (nom du client + intervention).</div>
    </div>
  )
}

// Bon de commande facon logiciel professionnel.
function rendreBonCommande(a: AnnexeBonCommande, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 12.5, padding: '5px 7px', borderRadius: 3, border: '1px solid #C9D6E3', background: verrouille ? '#F1F3F5' : '#FFFFFF', color: '#1F2933', outline: 'none' }
  const v = (k: string) => saisies[`${a.id}.${k}`] ?? ''
  const set2 = (k: string, val: string) => set(`${a.id}.${k}`, val)
  const colW = ['18%', '34%', '10%', '19%', '19%']
  return (
    <div style={{ border: '1px solid #C9D6E3', borderRadius: 8, overflow: 'hidden', background: '#FFFFFF', maxWidth: 740 }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 15, fontWeight: 800 }}>BON DE COMMANDE</span>
        <span style={{ fontSize: 13, fontWeight: 700 }}>N° {a.numero}</span>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ textAlign: 'center', fontSize: 11, letterSpacing: 1, color: '#6B7280', fontWeight: 700, marginBottom: 12 }}>BRICOLAGE – CONSTRUCTION – DECORATION – ENTRETIEN</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 12 }}>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 6, padding: 10, fontSize: 12, color: '#374151', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700, color: '#1F2933', marginBottom: 4 }}>Vendeur</div>
            {a.vendeur.map((l, i) => <div key={i}>{l}</div>)}
          </div>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 6, padding: 10 }}>
            <div style={{ fontWeight: 700, color: '#1F2933', marginBottom: 6, fontSize: 12 }}>Coordonnées client</div>
            <textarea value={v('client')} onChange={(e) => set2('client', e.target.value)} disabled={verrouille} rows={4} placeholder="Nom, adresse, téléphone du client…" style={{ ...champ, resize: 'vertical' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 12 }}>
          <div><span style={{ fontSize: 12, fontWeight: 700, color: '#4B5563' }}>Date :</span><input value={v('date')} onChange={(e) => set2('date', e.target.value)} disabled={verrouille} style={champ} /></div>
          <div><span style={{ fontSize: 12, fontWeight: 700, color: '#4B5563' }}>Délais de livraison (jours) :</span><input value={v('delai')} onChange={(e) => set2('delai', e.target.value)} disabled={verrouille} style={champ} /></div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
          <thead><tr>{['Référence', 'Libellé article', 'Quantité', 'Prix HT', 'Prix TTC'].map((h, i) => <th key={h} style={{ background: couleur, color: '#FFFFFF', fontSize: 11.5, padding: '6px 5px', border: '1px solid #B7C4D6', width: colW[i] }}>{h}</th>)}</tr></thead>
          <tbody>
            {Array.from({ length: a.nbLignesArticles }).map((_, i) => {
              const pre = a.preLignes?.[i]
              return (
                <tr key={i}>
                  {(['reference', 'libelle', 'quantite', 'prixHT', 'prixTTC'] as const).map((f) => (
                    <td key={f} style={{ border: '1px solid #DCE8F4', padding: 3 }}>
                      <input value={v(`l${i}_${f}`)} onChange={(e) => set2(`l${i}_${f}`, e.target.value)} disabled={verrouille} placeholder={pre?.[f] ? '' : ''} style={{ ...champ, border: 'none', fontSize: 12 }} />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
        <div style={{ fontSize: 11.5, color: '#6B7280', fontStyle: 'italic', marginBottom: 12 }}>Livraison : offerte pour les articles de plus de 1000€</div>
        <table style={{ width: '60%', borderCollapse: 'collapse', marginLeft: 'auto', marginBottom: 14 }}>
          <thead><tr>{['Taux TVA', 'Base HT', 'Montant Total'].map((h) => <th key={h} style={{ background: '#F3F6F9', color: '#4B5563', fontSize: 11.5, padding: '5px', border: '1px solid #DCE8F4' }}>{h}</th>)}</tr></thead>
          <tbody><tr>
            <td style={{ border: '1px solid #DCE8F4', padding: '5px', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>20.00 %</td>
            <td style={{ border: '1px solid #DCE8F4', padding: 3 }}><input value={v('baseHT')} onChange={(e) => set2('baseHT', e.target.value)} disabled={verrouille} style={{ ...champ, border: 'none', textAlign: 'center' }} /></td>
            <td style={{ border: '1px solid #DCE8F4', padding: 3 }}><input value={v('total')} onChange={(e) => set2('total', e.target.value)} disabled={verrouille} style={{ ...champ, border: 'none', textAlign: 'center' }} /></td>
          </tr></tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#4B5563' }}>Montant de l'avoir (30%) :</span>
          <input value={v('avoir')} onChange={(e) => set2('avoir', e.target.value)} disabled={verrouille} style={{ ...champ, width: 140 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'end' }}>
          <div><span style={{ fontSize: 12, fontWeight: 700, color: '#4B5563' }}>Délais de livraison :</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input value={v('delaiBas')} onChange={(e) => set2('delaiBas', e.target.value)} disabled={verrouille} style={{ ...champ, width: 90 }} />
              <span style={{ fontSize: 13, color: '#374151' }}>jours</span>
            </div>
          </div>
          <div style={{ border: '1px dashed #B7C4D6', borderRadius: 6, padding: '12px 10px', textAlign: 'center', color: '#6B7280', fontSize: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Bon pour accord — Signature client</div>
            <input value={v('signature')} onChange={(e) => set2('signature', e.target.value)} disabled={verrouille} placeholder="Mention + signature" style={champ} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Personnage + bulle de dialogue : l'eleve ecrit dans la bulle.
function rendreBulle(a: AnnexeBulle, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  if (a.cas && a.cas.length > 0) {
    return (
      <div style={{ border: `2px solid ${couleur}`, borderRadius: 10, background: '#FFFFFF', padding: 16, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {a.cas.map((c) => (
          <div key={c.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
            {/* zone de saisie eleve (gauche) */}
            <div style={{ flex: '1 1 240px', minWidth: 220 }}>
              <textarea
                value={saisies[`${a.id}.${c.id}`] ?? ''}
                onChange={(e) => set(`${a.id}.${c.id}`, e.target.value)}
                disabled={verrouille}
                rows={a.nbLignes ?? 5}
                placeholder={a.placeholder ?? 'Rédigez ici votre conseil au client…'}
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #C9D6E3', borderRadius: 8, background: '#EAF1F8', padding: 12, fontFamily: 'Arial, sans-serif', fontSize: 13.5, color: verrouille ? '#6B7280' : '#1F2933', outline: 'none', resize: 'vertical' }}
              />
            </div>
            {/* image entretien + nom du cas (centre) */}
            <div style={{ flex: '0 0 auto', textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#1F2933', marginBottom: 6 }}>{c.nom}</div>
              {c.image && <img src={c.image} alt={c.nom} style={{ width: 200, maxWidth: '100%', display: 'block', margin: '0 auto' }} />}
              {c.videoLien && (
                <a href={c.videoLien} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: '#FFFFFF', color: couleur, border: `1px solid ${couleur}`, borderRadius: 16, padding: '4px 12px', fontSize: 12, fontWeight: 700, marginTop: 8 }}>🎬 Regarder la vidéo</a>
              )}
            </div>
            {/* temoignage client dans une bulle (droite, non editable) */}
            <div style={{ flex: '1 1 240px', minWidth: 220, position: 'relative' }}>
              <div style={{ position: 'relative', background: '#EAF1F8', border: '1px solid #B7C4D6', borderRadius: 16, padding: 14 }}>
                {c.temoignage.map((t, ti) => (
                  <p key={ti} style={{ margin: ti === 0 ? 0 : '6px 0 0', fontSize: 13.5, fontStyle: 'italic', color: '#2A3A53', lineHeight: 1.5 }}>{t}</p>
                ))}
                <div style={{ position: 'absolute', left: -12, top: 24, width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderRight: '12px solid #B7C4D6' }} />
                <div style={{ position: 'absolute', left: -9, top: 26, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: '9px solid #EAF1F8' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, background: '#F8FBF3', padding: 18, display: 'flex', alignItems: 'flex-end', gap: 14 }}>
      <img src={a.perso ?? '/docs/leroy-merlin-m4/perso-conseiller.png'} alt="Conseiller" style={{ width: 110, flexShrink: 0, alignSelf: 'flex-end' }} />
      <div style={{ position: 'relative', flex: 1, marginBottom: 18 }}>
        <div style={{ position: 'relative', background: '#FFFFFF', border: `2px solid ${couleur}`, borderRadius: 16, padding: 14 }}>
          <textarea
            value={saisies[`${a.id}.bulle`] ?? ''}
            onChange={(e) => set(`${a.id}.bulle`, e.target.value)}
            disabled={verrouille}
            rows={a.nbLignes ?? 3}
            placeholder={a.placeholder ?? 'Écrivez votre phrase ici…'}
            style={{ width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', resize: 'vertical', fontFamily: 'Arial, sans-serif', fontSize: 14, color: verrouille ? '#6B7280' : '#1F2933', background: 'transparent', fontStyle: 'italic' }}
          />
          {/* queue de la bulle vers le personnage */}
          <div style={{ position: 'absolute', left: -14, bottom: 16, width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderRight: `14px solid ${couleur}` }} />
          <div style={{ position: 'absolute', left: -10, bottom: 18, width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderRight: '11px solid #FFFFFF' }} />
        </div>
      </div>
    </div>
  )
}

// Frise des etapes de la livraison : schema non lineaire (etiquettes a placer
// dans des cases numerotees) ou frise simple a completer.
function rendreEtapesLivraison(a: AnnexeEtapesLivraison, saisies: Saisies, set: (id: string, v: string) => void, verrouille: boolean, couleur: string) {
  const champ: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '8px 10px', borderRadius: 6, border: '1px dashed #C9A227', background: verrouille ? '#FBF6E5' : '#FFFBEA', color: '#1F2933', outline: 'none', resize: 'vertical' }
  // Mode schema : banque d'etiquettes en desordre + cases numerotees a remplir
  if (a.schema) {
    return (
      <div style={{ border: '1px solid #C9D6E3', borderRadius: 8, overflow: 'hidden', background: '#FFFFFF' }}>
        <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700 }}>{a.titre}</div>
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#4B5563', marginBottom: 8 }}>Étiquettes à replacer dans le bon ordre :</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {a.schema.etiquettes.map((e, i) => (
              <span key={i} style={{ background: '#EAF1F8', border: '1px solid #B7C4D6', borderRadius: 20, padding: '6px 14px', fontSize: 12.5, color: '#2A3A53', fontWeight: 600 }}>{e}</span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, flexWrap: 'wrap' }}>
            {Array.from({ length: a.schema.nbZones }).map((_, i) => (
              <Fragment key={i}>
                <div style={{ flex: '1 1 150px', minWidth: 150, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', background: couleur, color: '#FFFFFF', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                  <textarea value={saisies[`${a.id}.z${i}`] ?? ''} onChange={(e) => set(`${a.id}.z${i}`, e.target.value)} disabled={verrouille} rows={3} placeholder="Étape…" style={{ ...champ, flex: 1 }} />
                </div>
                {i < a.schema!.nbZones - 1 && <div style={{ alignSelf: 'center', color: couleur, fontSize: 22, fontWeight: 800 }}>→</div>}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    )
  }
  // Mode frise simple
  return (
    <div style={{ border: '1px solid #C9D6E3', borderRadius: 8, overflow: 'hidden', background: '#FFFFFF' }}>
      <div style={{ background: couleur, color: '#FFFFFF', padding: '9px 12px', fontSize: 13, fontWeight: 700 }}>{a.titre}</div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {Array.from({ length: a.nbEtapes }).map((_, i) => {
          const pre = a.preEtapes?.[i] ?? ''
          return (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: couleur, color: '#FFFFFF', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                {pre
                  ? <div style={{ flex: 1, background: '#F3F6F9', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 12px', fontSize: 13, color: '#374151', fontWeight: 600 }}>{pre}</div>
                  : <textarea value={saisies[`${a.id}.e${i}`] ?? ''} onChange={(e) => set(`${a.id}.e${i}`, e.target.value)} disabled={verrouille} rows={1} placeholder="À compléter…" style={champ} />}
              </div>
              {i < a.nbEtapes - 1 && <div style={{ marginLeft: 14, height: 16, borderLeft: '2px solid #C9D6E3' }} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Mail en lecture seule (annexe) facon Gmail.
function rendreMailLecture(a: AnnexeMailLecture) {
  return (
    <div style={{ border: '1px solid #DCE8F4', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#EEF3F8', padding: '6px 10px', fontSize: 13, fontWeight: 700, color: '#16456E' }}>{a.titre}</div>
      <div style={{ padding: 12 }}>
        <div style={{ border: '1px solid #C9D1D9', borderRadius: 8, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ background: '#F1F1F1', borderBottom: '1px solid #E1E4E8', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#2C2C2A' }}>Nouveau message</span>
            <span style={{ color: '#9AA5B1', fontSize: 14 }}>—  ?  ✕</span>
          </div>
          <div style={{ padding: '6px 12px', borderBottom: '1px solid #ECEFF2', fontSize: 13.5 }}><b>De :</b> {a.de}</div>
          <div style={{ padding: '6px 12px', borderBottom: '1px solid #ECEFF2', fontSize: 13.5 }}><b>À :</b> {a.a}</div>
          <div style={{ padding: '6px 12px', borderBottom: '1px solid #ECEFF2', fontSize: 13.5 }}><b>Objet :</b> {a.objet}</div>
          <div style={{ padding: 14, fontSize: 13.5, color: '#1F2933', lineHeight: 1.6 }}>
            {a.corps.map((p, pi) => <p key={pi} style={{ margin: '0 0 10px' }}>{p}</p>)}
          </div>
        </div>
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
          <div style={ligne}><span style={lab}>De :</span><input type="text" disabled={verrouille} value={saisies[`${a.id}.de`] ?? a.deParDefaut ?? ''} onChange={(e) => set(`${a.id}.de`, e.target.value)} style={champ} /></div>
          <div style={ligne}><span style={lab}>À :</span><input type="text" disabled={verrouille} value={saisies[`${a.id}.a`] ?? a.aParDefaut ?? ''} onChange={(e) => set(`${a.id}.a`, e.target.value)} style={champ} /></div>
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
