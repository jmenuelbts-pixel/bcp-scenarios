// AccueilEtudiant.tsx
// Accueil de l'espace etudiant : fond degrade de bleus lumineux,
// case A propos, grille des 9 scenarios sous forme de paves colores.
// Style entierement inline, police Arial, aucune classe Tailwind dans le JSX.

import { useState, useMemo, useEffect } from 'react'
import { SCENARIOS } from '../../data/schema'
import { useAuth } from '../../lib/auth'
import { scenariosOuverts } from '../../lib/invite'
import { nombreTravauxCorriges } from '../../lib/eleve'
import { faceIdDisponible, faceIdActiveSurCetAppareil, activerFaceId, desactiverFaceIdLocal, estMobileOuTablette } from '../../lib/faceId'
import {
  PROGRESSION_VIDE,
  type ProgressionEleve,
} from '../../lib/progression'
import { ScenarioCard } from '../../components/ui/ScenarioCard'
import { TUTO_ELEVE } from '../../data/tutoriel'

interface AccueilEtudiantProps {
  // Progression de l'eleve connecte. Vide par defaut tant que le suivi
  // n'est pas branche sur Supabase.
  progression?: ProgressionEleve
  // Appele au clic sur un scenario (navigation vers la page scenario).
  onOuvrirScenario?: (scenarioId: string) => void
  // Prénom de l'eleve, affiche dans l'en-tete si disponible.
  prenom?: string
  // Appele au clic sur le bouton de deconnexion.
  onDeconnexion?: () => void
  // Nombre de messages non lus, pour le badge de l'enveloppe.
  nonLus?: number
  // Appele au clic sur l'icone messagerie.
  onOuvrirMessagerie?: () => void
}

export function AccueilEtudiant({
  progression = PROGRESSION_VIDE,
  onOuvrirScenario,
  prenom,
  onDeconnexion,
  nonLus = 0,
  onOuvrirMessagerie,
}: AccueilEtudiantProps) {
  const [aproposOuvert, setAproposOuvert] = useState(false)
  const [aideOuverte, setAideOuverte] = useState(false)
  const [faceIdOuvert, setFaceIdOuvert] = useState(false)
  const [faceIdActif, setFaceIdActif] = useState(faceIdActiveSurCetAppareil())
  const [faceIdMsg, setFaceIdMsg] = useState<{ texte: string; ok: boolean } | null>(null)
  const [faceIdEnCours, setFaceIdEnCours] = useState(false)
  // Face ID cote eleve : seulement sur smartphone / tablette, jamais sur ordinateur.
  const montrerFaceId = estMobileOuTablette() && faceIdDisponible()

  async function activerFaceIdEleve() {
    setFaceIdMsg(null); setFaceIdEnCours(true)
    try {
      const { erreur } = await activerFaceId()
      if (erreur) { setFaceIdMsg({ texte: erreur, ok: false }); return }
      setFaceIdActif(true)
      setFaceIdMsg({ texte: 'Face ID est activé sur cet appareil. Tu pourras l\'utiliser à ta prochaine connexion.', ok: true })
    } finally {
      setFaceIdEnCours(false)
    }
  }

  function desactiverFaceIdEleve() {
    desactiverFaceIdLocal()
    setFaceIdActif(false)
    setFaceIdMsg({ texte: 'Face ID ne sera plus proposé sur cet appareil.', ok: true })
  }
  const { profil } = useAuth()
  const estInvite = profil?.est_invite === true
  const [scenariosVisibles, setScenariosVisibles] = useState<string[] | null>(null)
  const [nbCorriges, setNbCorriges] = useState(0)
  const [bannereVue, setBannereVue] = useState(false)

  // Notification : nombre de travaux corriges. On memorise le dernier total vu
  // dans le navigateur pour ne signaler que les nouvelles corrections.
  useEffect(() => {
    const id = profil?.id
    if (!id) return
    nombreTravauxCorriges(id).then((n) => {
      setNbCorriges(n)
      const vu = Number(localStorage.getItem(`bcp_corriges_vus_${id}`) ?? '0')
      setBannereVue(n <= vu)
    })
  }, [profil])

  function fermerNotif() {
    const id = profil?.id
    if (id) localStorage.setItem(`bcp_corriges_vus_${id}`, String(nbCorriges))
    setBannereVue(true)
  }

  // Si l'utilisateur est l'invite, on ne montre que les scenarios ouverts.
  useEffect(() => {
    if (!estInvite) { setScenariosVisibles(null); return }
    scenariosOuverts().then(setScenariosVisibles)
  }, [estInvite])

  const scenariosAffiches = estInvite
    ? SCENARIOS.filter((sc) => (scenariosVisibles ?? []).includes(sc.id))
    : SCENARIOS

  // Message d'accueil tire au hasard a chaque connexion, toujours avec le prenom.
  const salutation = useMemo(() => {
    if (!prenom) return ''
    const messages = [
      `Bonjour ${prenom}`,
      `Salut ${prenom}`,
      `Content de te revoir, ${prenom}`,
      `Re-bonjour ${prenom}`,
      `Bienvenue ${prenom}`,
      `On s'y remet, ${prenom} ?`,
      `Bonne séance, ${prenom}`,
      `À toi de jouer, ${prenom}`,
      `Heureux de te retrouver, ${prenom}`,
      `C'est reparti, ${prenom}`,
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }, [prenom])

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        background:
          'linear-gradient(160deg, #EAF3FB 0%, #D6E8F7 45%, #C2DCF2 100%)',
        padding: '0 0 48px 0',
      }}
    >
      {nbCorriges > 0 && !bannereVue && (
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '14px 24px 0' }}>
          <div style={{ background: '#DEF3E8', border: '1px solid #8FD3AE', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: '#0F7A52', fontWeight: 700, flex: 1 }}>
              {nbCorriges === 1 ? 'Un de tes travaux a été corrigé par ton professeur.' : `${nbCorriges} de tes travaux ont été corrigés par ton professeur.`} Va voir le retour dans la mission concernée.
            </span>
            <button type="button" onClick={fermerNotif} style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', border: '1px solid #8FD3AE', color: '#0F7A52', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>J'ai vu</button>
          </div>
        </div>
      )}
      {/* En-tete */}
      <header
        style={{
          padding: '28px 24px 20px 24px',
          maxWidth: 1080,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 700,
                color: '#16456E',
              }}
            >
              Scénarios MCV B
            </h1>
            <p style={{ margin: '16px 0 0 0', fontSize: 19, color: '#33648C', fontWeight: 500 }}>
              {salutation}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {onOuvrirMessagerie && (
              <button
                type="button"
                onClick={onOuvrirMessagerie}
                aria-label="Messagerie"
                style={{
                  position: 'relative',
                  fontFamily: 'Arial, sans-serif',
                  background: '#FFFFFF',
                  border: '1px solid #BFD6EC',
                  borderRadius: 99,
                  width: 40,
                  height: 40,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="#16456E" strokeWidth="2" />
                  <polyline points="4,7 12,13 20,7" fill="none" stroke="#16456E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {nonLus > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: '#E24B4A',
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 700,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 99,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}>
                    {nonLus}
                  </span>
                )}
              </button>
            )}
            {montrerFaceId && (
              <button
                type="button"
                onClick={() => { setFaceIdMsg(null); setFaceIdOuvert(true) }}
                aria-label="Connexion par Face ID"
                style={{
                  fontFamily: 'Arial, sans-serif',
                  background: faceIdActif ? '#EAF2FF' : '#FFFFFF',
                  border: '1px solid #BFD6EC',
                  borderRadius: 99,
                  width: 40,
                  height: 40,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                }}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 8 V6 a2 2 0 0 1 2 -2 h2" /><path d="M16 4 h2 a2 2 0 0 1 2 2 v2" /><path d="M20 16 v2 a2 2 0 0 1 -2 2 h-2" /><path d="M8 20 H6 a2 2 0 0 1 -2 -2 v-2" />
                  <path d="M9 10 v1.5" /><path d="M15 10 v1.5" /><path d="M12 9.5 v4" /><path d="M9 15.5 s1 1.3 3 1.3 3 -1.3 3 -1.3" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={() => setAideOuverte(true)}
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                color: '#16456E',
                background: '#FFFFFF',
                border: '1px solid #BFD6EC',
                borderRadius: 99,
                padding: '8px 16px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="none" stroke="#16456E" strokeWidth="2" />
                <path d="M9.2 9.2 a2.8 2.8 0 0 1 5.4 1 c0 1.9 -2.6 2.4 -2.6 4" fill="none" stroke="#16456E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="17.4" r="1.2" fill="#16456E" />
              </svg>
              Aide
            </button>
            <button
              type="button"
              onClick={() => setAproposOuvert(true)}
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                color: '#16456E',
                background: '#FFFFFF',
                border: '1px solid #BFD6EC',
                borderRadius: 99,
                padding: '8px 16px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
              }}
            >
              {/* Icone information en SVG inline */}
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="none" stroke="#16456E" strokeWidth="2" />
                <line x1="12" y1="11" x2="12" y2="16" stroke="#16456E" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="7.5" r="1.2" fill="#16456E" />
              </svg>
              À propos
            </button>

            {onDeconnexion && (
              <button
                type="button"
                onClick={onDeconnexion}
                style={{
                  fontFamily: 'Arial, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#16456E',
                  background: '#FFFFFF',
                  border: '1px solid #BFD6EC',
                  borderRadius: 99,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 4 H6 a2 2 0 0 0 -2 2 v12 a2 2 0 0 0 2 2 h8" fill="none" stroke="#16456E" strokeWidth="2" strokeLinecap="round" />
                  <polyline points="17,8 21,12 17,16" fill="none" stroke="#16456E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="21" y1="12" x2="10" y2="12" stroke="#16456E" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Se déconnecter
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Grille des scenarios */}
      <main
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '28px 24px 0 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20,
        }}
      >
        {scenariosAffiches.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            progression={progression}
            onClick={(id) => onOuvrirScenario?.(id)}
          />
        ))}
      </main>

      {/* Modale A propos */}
      {faceIdOuvert && (
        <div
          onClick={() => setFaceIdOuvert(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 9999 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', borderRadius: 16, padding: 24, maxWidth: 380, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ width: 46, height: 46, borderRadius: 12, background: '#EAF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 8 V6 a2 2 0 0 1 2 -2 h2" /><path d="M16 4 h2 a2 2 0 0 1 2 2 v2" /><path d="M20 16 v2 a2 2 0 0 1 -2 2 h-2" /><path d="M8 20 H6 a2 2 0 0 1 -2 -2 v-2" />
                  <path d="M9 10 v1.5" /><path d="M15 10 v1.5" /><path d="M12 9.5 v4" /><path d="M9 15.5 s1 1.3 3 1.3 3 -1.3 3 -1.3" />
                </svg>
              </span>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1F2933' }}>Connexion par Face ID</div>
            </div>
            <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.55, margin: '0 0 14px' }}>
              Active Face ID pour te connecter d'un simple regard sur ce téléphone, sans taper ton mot de passe. Ton mot de passe reste toujours disponible.
            </p>
            {faceIdMsg && (
              <p style={{ fontSize: 13, borderRadius: 8, padding: '9px 11px', margin: '0 0 14px', color: faceIdMsg.ok ? '#0F7A52' : '#9B2C2C', background: faceIdMsg.ok ? '#DEF3E8' : '#FDECEC' }}>{faceIdMsg.texte}</p>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setFaceIdOuvert(false)} style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', color: '#6B7280', border: '1px solid #D8DEE5', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Fermer</button>
              {faceIdActif ? (
                <button type="button" onClick={desactiverFaceIdEleve} style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', color: '#B0413E', border: '1px solid #E2B3B1', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Ne plus proposer</button>
              ) : (
                <button type="button" onClick={activerFaceIdEleve} disabled={faceIdEnCours} style={{ fontFamily: 'Arial, sans-serif', background: faceIdEnCours ? '#9BB8DE' : '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 700, cursor: faceIdEnCours ? 'wait' : 'pointer' }}>{faceIdEnCours ? 'Patiente...' : 'Activer'}</button>
              )}
            </div>
          </div>
        </div>
      )}

      {aideOuverte && (
        <div
          onClick={() => setAideOuverte(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(16, 52, 84, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              fontFamily: 'Arial, sans-serif',
              background: '#FFFFFF',
              borderRadius: 16,
              maxWidth: 560,
              width: '100%',
              maxHeight: '82vh',
              overflowY: 'auto',
              padding: 28,
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#16456E' }}>Aide</div>
              <button
                type="button"
                onClick={() => setAideOuverte(false)}
                aria-label="Fermer"
                style={{ fontFamily: 'Arial, sans-serif', background: 'transparent', border: 'none', fontSize: 22, color: '#6B7280', cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 20px' }}>
              Comment utiliser l'application, étape par étape.
            </p>
            {TUTO_ELEVE.map((theme) => (
              <div key={theme.titre} style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#16456E', marginBottom: 10 }}>{theme.titre}</div>
                {theme.sousThemes.map((st) => (
                  <div key={st.titre} style={{ marginBottom: 14, paddingLeft: 12, borderLeft: '3px solid #BFD6EC' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2933' }}>{st.titre}</div>
                    <div style={{ fontSize: 12, color: '#8A97A6', margin: '2px 0 6px' }}>{st.ou}</div>
                    <ol style={{ margin: 0, paddingLeft: 18 }}>
                      {st.etapes.map((e, i) => (
                        <li key={i} style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, marginBottom: 3 }}>{e}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {aproposOuvert && (
        <div
          onClick={() => setAproposOuvert(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(16, 52, 84, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              fontFamily: 'Arial, sans-serif',
              background: '#FFFFFF',
              borderRadius: 16,
              maxWidth: 440,
              width: '100%',
              padding: 28,
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 19, color: '#16456E' }}>A propos</h2>
              <button
                type="button"
                onClick={() => setAproposOuvert(false)}
                aria-label="Fermer"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  lineHeight: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <line x1="6" y1="6" x2="18" y2="18" stroke="#16456E" strokeWidth="2" strokeLinecap="round" />
                  <line x1="18" y1="6" x2="6" y2="18" stroke="#16456E" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <p style={{ fontSize: 14, color: '#444', lineHeight: 1.7, margin: 0 }}>
              Cette application accompagne la formation au Baccalauréat Métiers du
              Commerce et de la Vente, option B Prospection clientèle et valorisation
              de l'offre commerciale. Elle s'appuie sur des scénarios d'entreprises
              réelles ou fictives au sein desquels chaque élève réalise des missions
              professionnelles concrètes. Chaque mission propose des travaux à rendre,
              une synthèse de cours, une auto-évaluation, des activités interactives
              et un journal de bord. L'objectif est de développer et d'évaluer les
              compétences par une mise en situation proche du réel. Le suivi de la
              progression permet de préparer l'évaluation par compétences dans le
              cadre des contrôles en cours de formation CCF E31 et E32. Le professeur
              accède au travail de chaque élève, le corrige et communique avec lui
              directement dans l'application.
            </p>
            <p style={{ fontSize: 13, color: '#16456E', fontWeight: 700, margin: '16px 0 0 0' }}>
              Jacky MENUEL - Professeur Économie-Gestion
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
