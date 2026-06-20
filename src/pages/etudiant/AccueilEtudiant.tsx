// AccueilEtudiant.tsx
// Accueil de l'espace etudiant : fond degrade de bleus lumineux,
// case A propos, grille des 9 scenarios sous forme de paves colores.
// Style entierement inline, police Arial, aucune classe Tailwind dans le JSX.

import { useState, useMemo } from 'react'
import { SCENARIOS } from '../../data/schema'
import {
  PROGRESSION_VIDE,
  type ProgressionEleve,
} from '../../lib/progression'
import { ScenarioCard } from '../../components/ui/ScenarioCard'

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
  // Appele au clic sur le bouton d'export PDF.
  onOuvrirExports?: () => void
}

export function AccueilEtudiant({
  progression = PROGRESSION_VIDE,
  onOuvrirScenario,
  prenom,
  onDeconnexion,
  nonLus = 0,
  onOuvrirMessagerie,
  onOuvrirExports,
}: AccueilEtudiantProps) {
  const [aproposOuvert, setAproposOuvert] = useState(false)

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
            <p style={{ margin: '6px 0 0 0', fontSize: 14, color: '#33648C' }}>
              {salutation ? `${salutation}. ` : ''}
              Choisis une entreprise pour commencer une mission.
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
            {onOuvrirExports && (
              <button
                type="button"
                onClick={onOuvrirExports}
                aria-label="Exporter mes données"
                style={{
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
                  <path d="M7 3 h7 l4 4 v14 a1 1 0 0 1 -1 1 H7 a1 1 0 0 1 -1 -1 V4 a1 1 0 0 1 1 -1 z" fill="none" stroke="#16456E" strokeWidth="2" strokeLinejoin="round" />
                  <polyline points="9,14 12,17 15,14" fill="none" stroke="#16456E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
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
          padding: '8px 24px 0 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20,
        }}
      >
        {SCENARIOS.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            progression={progression}
            onClick={(id) => onOuvrirScenario?.(id)}
          />
        ))}
      </main>

      {/* Modale A propos */}
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
