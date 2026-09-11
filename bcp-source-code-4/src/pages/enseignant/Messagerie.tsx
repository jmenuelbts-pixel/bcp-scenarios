// Messagerie.tsx (professeur)
// Liste des eleves a gauche avec badge de messages non lus, conversation a
// droite. Possibilite d'envoyer un message individuel ou collectif (classe).

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COULEUR_PROF } from '../../data/schema'
import { useAuth } from '../../lib/auth'
import { listerElevesAcceptes } from '../../lib/enseignant'
import { listerClasses, type Classe } from '../../lib/classes'
import {
  conversation,
  envoyerMessage,
  envoyerMessageCollectif,
  messagesRecus,
  marquerLus,
  supprimerConversation,
  sonderMessages,
  sonderConversation,
  classeVerrouillee,
  definirVerrouClasse,
  modifierMessage,
  supprimerMessage,
  viderPjConversation,
  viderToutesPj,
  verifierFichierPj,
  PJ_NOMBRE_MAX,
  type Message,
} from '../../lib/messagerie'
import { BulleMessage } from '../../lib/piecesJointes'
import type { Profil } from '../../lib/auth'
import { PastilleInitiales } from '../../lib/theme'

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
  const [fichiers, setFichiers] = useState<File[]>([])
  const [chargement, setChargement] = useState(true)
  const finRef = useRef<HTMLDivElement>(null)
  const [classes, setClasses] = useState<Classe[]>([])
  const [classeVerrou, setClasseVerrou] = useState<string>('')
  const [verrouille, setVerrouille] = useState(false)
  const [majVerrou, setMajVerrou] = useState(false)
  // Reflete la selection courante pour le rappel temps reel sans recreer
  // l'abonnement a chaque changement de selection.
  const selectionRef = useRef<string | null>(null)
  useEffect(() => {
    selectionRef.current = selection
  }, [selection])

  useEffect(() => {
    listerClasses().then((cs) => {
      setClasses(cs)
      if (cs.length > 0) setClasseVerrou((prec) => prec || cs[0].id)
    })
  }, [])

  useEffect(() => {
    if (!classeVerrou) { setVerrouille(false); return }
    classeVerrouillee(classeVerrou).then(setVerrouille)
    const t = setInterval(() => classeVerrouillee(classeVerrou).then(setVerrouille), 5000)
    return () => clearInterval(t)
  }, [classeVerrou])

  async function basculerVerrou() {
    if (!classeVerrou) return
    setMajVerrou(true)
    const nouvel = !verrouille
    const { erreur } = await definirVerrouClasse(classeVerrou, nouvel)
    setMajVerrou(false)
    if (erreur) { alert('Erreur : ' + erreur); return }
    setVerrouille(nouvel)
  }

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

  // Sondage periodique des messages recus : les badges de non-lus se mettent
  // a jour seuls, sans actualiser la page. Si une conversation est ouverte,
  // les messages de cet eleve sont comptes comme lus.
  useEffect(() => {
    if (!profId) return
    const arret = sonderMessages(profId, (recus) => {
      const compte: Record<string, number> = {}
      for (const m of recus) {
        if (!m.lu && m.expediteur_id && m.expediteur_id !== selectionRef.current) {
          compte[m.expediteur_id] = (compte[m.expediteur_id] ?? 0) + 1
        }
      }
      setNonLus(compte)
    })
    return arret
  }, [profId])

  // Sondage de la conversation ouverte : les messages de l'eleve selectionne
  // s'affichent sans actualiser, et sont marques lus.
  useEffect(() => {
    if (!profId || !selection) return
    const arret = sonderConversation(profId, selection, (conv) => {
      setMessages((prec) => {
        if (prec.length !== conv.length) {
          marquerLus(profId, selection)
          setNonLus((n) => ({ ...n, [selection]: 0 }))
          setTimeout(() => finRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        }
        return conv
      })
    })
    return arret
  }, [profId, selection])

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
    if (!profId) return
    const contenu = texte.trim()
    if (contenu.length === 0 && fichiers.length === 0) return
    const pj = fichiers
    setTexte('')
    setFichiers([])
    if (collectif) {
      const cls = classes.find((c) => c.id === classeVerrou)
      await envoyerMessageCollectif(profId, contenu, classeVerrou || null, cls?.nom, pj)
    } else if (selection) {
      await envoyerMessage(profId, selection, contenu, pj)
      const conv = await conversation(profId, selection)
      setMessages(conv)
      setTimeout(() => finRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  async function modifierUnMessage(m: Message) {
    const nouveau = window.prompt('Modifier le message :', m.contenu ?? '')
    if (nouveau === null || !profId || !selection) return
    await modifierMessage(m.id, nouveau)
    setMessages(await conversation(profId, selection))
  }

  async function supprimerUnMessage(m: Message) {
    if (!window.confirm('Supprimer ce message ?') || !profId || !selection) return
    await supprimerMessage(m.id)
    setMessages(await conversation(profId, selection))
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

  // Efface tous les messages echanges avec l'eleve selectionne, apres
  // confirmation.
  async function effacerConversation() {
    if (!profId || !selection) return
    const ok = window.confirm('Effacer toute la conversation avec cet élève ? Cette action est définitive.')
    if (!ok) return
    await supprimerConversation(profId, selection)
    setMessages([])
  }

  async function viderPjDeLaConversation() {
    if (!profId || !selection) return
    const ok = window.confirm('Supprimer toutes les pièces jointes de cette conversation ? Le texte des messages est conservé. Action définitive.')
    if (!ok) return
    const { supprimes, erreur } = await viderPjConversation(profId, selection)
    if (erreur) { alert('Erreur : ' + erreur); return }
    setMessages(await conversation(profId, selection))
    alert(supprimes > 0 ? `${supprimes} pièce(s) jointe(s) supprimée(s).` : 'Aucune pièce jointe dans cette conversation.')
  }

  async function viderToutesLesPj() {
    const ok = window.confirm('Supprimer TOUTES les pièces jointes de toute la messagerie (toutes les conversations) ? Le texte des messages est conservé. Action définitive, à réserver au ménage de fin d\'année.')
    if (!ok) return
    const { supprimes, erreur } = await viderToutesPj()
    if (erreur) { alert('Erreur : ' + erreur); return }
    if (profId && selection) setMessages(await conversation(profId, selection))
    alert(supprimes > 0 ? `${supprimes} pièce(s) jointe(s) supprimée(s) au total.` : 'Aucune pièce jointe à supprimer.')
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F1F6F3' }}>
      <header style={{ background: COULEUR_PROF, color: '#FFFFFF', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <button type="button" onClick={() => navigate('/enseignant')} style={btnRetour}>
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="15,5 8,12 15,19" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Tableau de bord
          </button>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>Messagerie</h1>
          <button
            type="button"
            onClick={viderToutesLesPj}
            style={{ fontFamily: 'Arial, sans-serif', marginTop: 8, background: 'rgba(255,255,255,0.18)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Nettoyer toutes les pièces jointes (fin d'année)
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        {/* Barre de verrou des discussions entre eleves, par classe */}
        <div style={{ background: verrouille ? '#FDECEA' : '#FFFFFF', border: `1px solid ${verrouille ? '#F0C2BC' : '#EAF0F5'}`, borderRadius: 14, boxShadow: '0 2px 10px rgba(14, 165, 233, 0.08)', padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1F2933' }}>Discussions entre élèves :</span>
          <select
            value={classeVerrou}
            onChange={(e) => setClasseVerrou(e.target.value)}
            style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #C9D6E3', borderRadius: 8, padding: '8px 10px', fontSize: 14, minWidth: 170 }}
          >
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <span style={{ fontSize: 13, fontWeight: 700, color: verrouille ? '#C0392B' : '#0F9E75' }}>
            {verrouille ? 'Verrouillées' : 'Autorisées'}
          </span>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={basculerVerrou}
            disabled={majVerrou || !classeVerrou}
            style={{
              fontFamily: 'Arial, sans-serif',
              background: verrouille ? '#C0392B' : COULEUR_PROF,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: majVerrou ? 'wait' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {verrouille ? 'Déverrouiller' : 'Verrouiller (évaluation)'}
          </button>
          <span style={{ fontSize: 12, color: '#6B7280', width: '100%' }}>
            {verrouille
              ? "Les élèves de cette classe ne peuvent plus se parler entre eux ni voir leur historique. Ils peuvent toujours vous écrire."
              : "Les élèves de cette classe peuvent discuter entre eux. Verrouillez pendant une évaluation."}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        {/* Colonne gauche : liste des eleves */}
        <div style={{ background: '#FFFFFF', border: '1px solid #EAF0F5', borderRadius: 14, boxShadow: '0 2px 10px rgba(14, 165, 233, 0.08)', padding: 12, height: 'fit-content' }}>
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
        <div style={{ background: '#FFFFFF', border: '1px solid #EAF0F5', borderRadius: 14, boxShadow: '0 2px 10px rgba(14, 165, 233, 0.08)', display: 'flex', flexDirection: 'column', minHeight: 420 }}>
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
                <span style={{ display: 'inline-flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={viderPjDeLaConversation}
                    style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', color: '#8A5A00', border: '1px solid #F0C24B', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    Vider les pièces jointes
                  </button>
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
                </span>
              </div>
              <div style={{ flex: 1, padding: 16, overflowY: 'auto', maxHeight: 460 }}>
                {messages.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9AA5B1' }}>Aucun message pour le moment.</p>
                ) : (
                  messages.map((m) => (
                    <BulleMessage key={m.id} message={m} deMoi={m.expediteur_id === profId} couleurMoi={COULEUR_PROF} montrerLu onModifier={modifierUnMessage} onSupprimer={supprimerUnMessage} />
                  ))
                )}
                <div ref={finRef} />
              </div>
            </>
          )}

          {/* Zone de saisie */}
          {(selection || collectif) && (
            <div style={{ borderTop: '1px solid #EEF2F6', padding: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontFamily: 'Arial, sans-serif', background: '#FEF3C7', border: '1px solid #F0C24B', color: '#8A5A00', borderRadius: 8, padding: '8px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                + Fichier
                <input type="file" multiple accept="image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => choisirFichiers(e.target.files)} style={{ display: 'none' }} />
              </label>
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
                style={{ fontFamily: 'Arial, sans-serif', background: texte.trim().length === 0 && fichiers.length === 0 ? '#C9CDD2' : COULEUR_PROF, color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Envoyer
              </button>
            </div>
          )}
        </div>
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
