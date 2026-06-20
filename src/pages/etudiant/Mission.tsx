// Mission.tsx
// Page d'une mission : barre des 5 onglets (Travaux, Synthèse, Auto-évaluation,
// Activités, Journal de bord). Les onglets verrouilles affichent un cadenas noir,
// un texte grise et un curseur not-allowed. Le journal est toujours accessible.

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getScenario, getMission, ONGLETS, couleurEntete, couleurTexteSur, type OngletId } from '../../data/schema'
import { getContenuMission } from '../../data/contenus'
import { ongletOuvert, chargerDeverrouillages, DEVERROUILLAGE_DEFAUT, type EtatDeverrouillage } from '../../lib/deverrouillage'
import { OngletTravaux } from '../../components/mission/OngletTravaux'
import { OngletSynthese } from '../../components/mission/OngletSynthese'
import { OngletAutoEval } from '../../components/mission/OngletAutoEval'
import { OngletActivites } from '../../components/mission/OngletActivites'
import { OngletJournal } from '../../components/mission/OngletJournal'
import { useAuth } from '../../lib/auth'
import { marquerVisite } from '../../lib/eleve'
import { definirOngletCourant } from '../../lib/useBattementPresence'

export function Mission() {
  const { scenarioId, missionId } = useParams<{ scenarioId: string; missionId: string }>()
  const navigate = useNavigate()

  const scenario = scenarioId ? getScenario(scenarioId) : undefined
  const mission = scenarioId && missionId ? getMission(scenarioId, missionId) : undefined
  const contenu = missionId ? getContenuMission(missionId) : undefined

  const { session } = useAuth()
  const userId = session?.user?.id

  const [actif, setActif] = useState<OngletId>('travaux')
  const [etatDeverr, setEtatDeverr] = useState<EtatDeverrouillage>(DEVERROUILLAGE_DEFAUT)

  useEffect(() => {
    chargerDeverrouillages().then(setEtatDeverr)
  }, [])

  // Enregistre la visite de l'onglet actif pour alimenter la progression
  // et le suivi cote professeur.
  useEffect(() => {
    if (userId && missionId) {
      void marquerVisite(userId, missionId, actif)
    }
  }, [userId, missionId, actif])

  // Informe le heartbeat de presence de l'onglet reellement ouvert.
  useEffect(() => {
    definirOngletCourant(actif)
    return () => definirOngletCourant(null)
  }, [actif])

  if (!scenario || !mission) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', padding: 32 }}>
        <p style={{ color: '#444' }}>Mission introuvable.</p>
        <button type="button" onClick={() => navigate('/')} style={btnRetour}>
          Retour a l'accueil
        </button>
      </div>
    )
  }

  // Couleur d'accent lisible sur fond blanc (onglets, boutons) et couleur
  // de fond d'en-tete. Pour les teintes claires comme le jaune, on utilise
  // une version assombrie afin de garder le texte lisible.
  const accent = couleurEntete(scenario.couleur)
  const texteEntete = couleurTexteSur(scenario.couleur)

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #EAF3FB 0%, #D6E8F7 45%, #C2DCF2 100%)',
        padding: '0 0 48px 0',
      }}
    >
      {/* En-tete */}
      <header style={{ background: accent, color: texteEntete, textShadow: '0 1px 2px rgba(0,0,0,0.20)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => navigate(`/scenario/${scenario.id}`)}
            style={{
              fontFamily: 'Arial, sans-serif',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#FFFFFF',
              borderRadius: 99,
              padding: '6px 14px',
              fontSize: 13,
              cursor: 'pointer',
              marginBottom: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="15,5 8,12 15,19" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {scenario.nom}
          </button>
          <div style={{ fontSize: 13, opacity: 0.95 }}>Mission {mission.numero}</div>
          <h1 style={{ margin: '2px 0 0 0', fontSize: 22, fontWeight: 700 }}>{mission.titre}</h1>
        </div>
      </header>

      {/* Barre d'onglets */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexWrap: 'wrap' }}>
          {[...ONGLETS]
            .sort((a, b) => a.ordre - b.ordre)
            .map((o) => {
              const ouvert = ongletOuvert(mission.id, o.id, etatDeverr)
              const estActif = actif === o.id
              return (
                <button
                  key={o.id}
                  type="button"
                  disabled={!ouvert}
                  onClick={() => ouvert && setActif(o.id)}
                  style={{
                    fontFamily: 'Arial, sans-serif',
                    background: 'none',
                    border: 'none',
                    borderBottom: estActif ? `3px solid ${accent}` : '3px solid transparent',
                    padding: '14px 16px',
                    fontSize: 13,
                    fontWeight: estActif ? 700 : 500,
                    color: !ouvert ? '#A0AEC0' : estActif ? accent : '#4A5568',
                    cursor: ouvert ? 'pointer' : 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {!ouvert && (
                    <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="5" y="11" width="14" height="9" rx="2" fill="#1F2933" />
                      <path d="M8 11 V8 a4 4 0 0 1 8 0 v3" fill="none" stroke="#1F2933" strokeWidth="2" />
                    </svg>
                  )}
                  {o.libelle}
                </button>
              )
            })}
        </div>
      </div>

      {/* Contenu de l'onglet actif */}
      <main style={{ maxWidth: 880, margin: '0 auto', padding: 24 }}>
        {!contenu && actif !== 'journal' ? (
          <p style={{ fontSize: 14, color: '#6B7280' }}>
            Le contenu de cette mission n'est pas encore disponible.
          </p>
        ) : (
          <>
            {actif === 'travaux' && contenu && <OngletTravaux contenu={contenu.travaux} couleur={accent} etudiantId={userId} missionId={mission.id} />}
            {actif === 'synthese' && contenu && <OngletSynthese contenu={contenu.synthese} couleur={accent} etudiantId={userId} missionId={mission.id} />}
            {actif === 'autoeval' && contenu && <OngletAutoEval contenu={contenu.autoEval} couleur={accent} etudiantId={userId} missionId={mission.id} />}
            {actif === 'activites' && contenu && <OngletActivites contenu={contenu.activites} couleur={accent} etudiantId={userId} missionId={mission.id} />}
            {actif === 'journal' && <OngletJournal couleur={accent} etudiantId={userId} missionId={mission.id} />}
          </>
        )}
      </main>
    </div>
  )
}

const btnRetour: React.CSSProperties = {
  fontFamily: 'Arial, sans-serif',
  background: '#16456E',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 8,
  padding: '8px 16px',
  cursor: 'pointer',
  marginTop: 12,
}
