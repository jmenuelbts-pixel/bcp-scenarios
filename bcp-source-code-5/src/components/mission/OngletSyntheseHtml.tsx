// OngletSyntheseHtml.tsx
// Affiche une synthese sous forme de carte HTML autonome (dans public/syntheses/)
// via un iframe, pour les missions qui en ont une. L'app communique avec la
// carte par postMessage : elle recoit le score et les reponses a l'envoi, et
// renvoie les reponses sauvegardees au chargement pour figer la carte.
// La note est enregistree dans reponses_quiz (activite 'synthese'), comme le
// quiz : report automatique dans le releve, delai avant visibilite, verrouillage.

import { useState, useEffect, useRef, useCallback } from 'react'
import { enregistrerQuiz, chargerQuiz } from '../../lib/eleve'
import { appreciationAuto } from '../../lib/appreciations'

interface Props {
  // Identifiant du fichier HTML dans public/syntheses/ (sans extension).
  fichier: string
  couleur: string
  etudiantId?: string
  missionId: string
  onEnvoye?: () => void
}

export function OngletSyntheseHtml({ fichier, couleur, etudiantId, missionId, onEnvoye }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [verrouille, setVerrouille] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [confirmOuvert, setConfirmOuvert] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const reponsesSauvees = useRef<Record<string, string> | null>(null)
  const iframePrete = useRef(false)

  // Charge l'etat existant (note deja envoyee ?) pour figer la carte.
  useEffect(() => {
    let actif = true
    if (!etudiantId) return
    chargerQuiz(etudiantId, missionId, 'synthese').then((s) => {
      if (!actif) return
      if (s) {
        if (s.reponses && typeof s.reponses === 'object') {
          reponsesSauvees.current = s.reponses as Record<string, string>
        }
        if (s.submitted_at) {
          setVerrouille(true)
          appliquerFige()
        }
      }
    })
    return () => { actif = false }
  }, [etudiantId, missionId])

  // Renvoie les reponses sauvegardees a l'iframe pour reafficher + verrouiller.
  const appliquerFige = useCallback(() => {
    if (!iframePrete.current || !reponsesSauvees.current) return
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'appliquer_reponses', reponses: reponsesSauvees.current },
      '*'
    )
  }, [])

  // Ecoute les messages de l'iframe.
  useEffect(() => {
    async function onMessage(ev: MessageEvent) {
      const d = ev.data || {}
      if (d.type === 'synthese_prete') {
        iframePrete.current = true
        appliquerFige()
        return
      }
      if (d.type === 'synthese_reponses' && d.reponses) {
        reponsesSauvees.current = d.reponses as Record<string, string>
        return
      }
      if (d.type === 'synthese_score' && !verrouille && etudiantId) {
        const total = typeof d.total === 'number' && d.total > 0 ? d.total : 1
        const note10 = (d.bons / total) * 10
        const appr = appreciationAuto(note10)
        setEnCours(true)
        const { erreur } = await enregistrerQuiz(
          etudiantId, missionId, 'synthese',
          reponsesSauvees.current ?? {}, d.bons, appr, total
        )
        setEnCours(false)
        if (!erreur) {
          setVerrouille(true)
          setMessage('Travail envoyé au professeur.')
          onEnvoye?.()
        } else {
          setMessage("L'envoi a échoué. Veuillez réessayer.")
        }
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [verrouille, etudiantId, missionId, appliquerFige])

  function envoyer() {
    if (verrouille) return
    setConfirmOuvert(false)
    iframeRef.current?.contentWindow?.postMessage({ type: 'cmd_confirmer' }, '*')
  }

  function voirCorrection() {
    iframeRef.current?.contentWindow?.postMessage({ type: 'cmd_corriger' }, '*')
  }

  // Largeur native des cartes HTML (~1000px + marges). On met a l'echelle
  // pour occuper toute la largeur disponible sans defilement horizontal.
  const LARGEUR_CARTE = 1060
  const conteneurRef = useRef<HTMLDivElement>(null)
  const [echelle, setEchelle] = useState(1)
  useEffect(() => {
    function ajuster() {
      const dispo = conteneurRef.current?.clientWidth ?? LARGEUR_CARTE
      // Sur grand ecran on ne depasse pas 1 (pas d'agrandissement excessif) ;
      // sur ecran etroit on reduit pour tout afficher sans scroll horizontal.
      setEchelle(Math.min(1, dispo / LARGEUR_CARTE))
    }
    ajuster()
    window.addEventListener('resize', ajuster)
    return () => window.removeEventListener('resize', ajuster)
  }, [])

  return (
    <div>
      <div ref={conteneurRef} style={{ width: '100%', overflow: 'hidden', border: '1px solid #E2E8F0', borderRadius: 12, background: '#FAFAF8' }}>
        <div style={{ width: LARGEUR_CARTE, height: 820, transform: `scale(${echelle})`, transformOrigin: 'top left', marginBottom: echelle < 1 ? -(820 * (1 - echelle)) : 0 }}>
          <iframe
            ref={iframeRef}
            src={`/syntheses/${fichier}.html`}
            title="Synthèse"
            style={{ width: LARGEUR_CARTE, height: 820, border: 'none', display: 'block' }}
          />
        </div>
      </div>

      {message && (
        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, color: verrouille ? '#0F7A52' : '#9B2C2C', background: verrouille ? '#DEF3E8' : '#FDECEC', borderRadius: 8, padding: '8px 12px', margin: '12px 0 0' }}>{message}</p>
      )}

      {/* Barre de boutons fixe en bas */}
      <div style={{ position: 'sticky', bottom: 0, marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center', padding: '12px 0', background: 'linear-gradient(to top, #FFFFFF 70%, transparent)' }}>
        <button
          type="button"
          onClick={() => !verrouille && setConfirmOuvert(true)}
          disabled={verrouille || enCours}
          style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, fontWeight: 700, padding: '11px 22px', borderRadius: 8, border: 'none', background: verrouille ? '#C8C6BE' : couleur, color: '#FFFFFF', cursor: verrouille || enCours ? 'not-allowed' : 'pointer' }}
        >
          {verrouille ? 'Travail envoyé' : enCours ? 'Envoi...' : 'Envoyer au professeur'}
        </button>
        <button
          type="button"
          onClick={voirCorrection}
          disabled={!verrouille}
          style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, fontWeight: 700, padding: '11px 22px', borderRadius: 8, border: `1.5px solid ${verrouille ? couleur : '#D8D6CD'}`, background: '#FFFFFF', color: verrouille ? couleur : '#9A9890', cursor: verrouille ? 'pointer' : 'not-allowed' }}
        >
          Voir la correction
        </button>
      </div>

      {confirmOuvert && (
        <div onClick={() => setConfirmOuvert(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(40,38,60,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', borderRadius: 16, maxWidth: 400, width: '100%', padding: 26, textAlign: 'center' }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1F2933', marginBottom: 10 }}>Es-tu sûr(e) ?</div>
            <p style={{ fontSize: 14, color: '#444', lineHeight: 1.5, margin: '0 0 20px' }}>Une fois ton travail envoyé, tu ne pourras plus modifier aucune réponse. Cette action est définitive.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button type="button" onClick={() => setConfirmOuvert(false)} style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, fontWeight: 600, padding: '10px 16px', borderRadius: 8, border: '1px solid #ccc', background: '#F1EFE8', color: '#444', cursor: 'pointer' }}>Annuler</button>
              <button type="button" onClick={envoyer} style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, fontWeight: 700, padding: '10px 16px', borderRadius: 8, border: 'none', background: '#1D9E75', color: '#FFFFFF', cursor: 'pointer' }}>Oui, envoyer mon travail</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
