// ScenarioCard.tsx
// Pave d'un scenario sur l'accueil etudiant.
// Style entierement inline, police Arial, aucune classe Tailwind dans le JSX.

import { useState } from 'react'
import type { Scenario } from '../../data/schema'
import { couleurEntete, couleurTexteSur } from '../../data/schema'
import {
  missionsAbordees,
  pourcentageScenario,
  type ProgressionEleve,
} from '../../lib/progression'

interface ScenarioCardProps {
  scenario: Scenario
  progression: ProgressionEleve
  onClick: (scenarioId: string) => void
}

// Eclaircit une couleur hex en la melangeant avec du blanc (ratio 0 a 1).
function eclaircir(hex: string, ratio: number): string {
  const v = hex.replace('#', '')
  const r = parseInt(v.substring(0, 2), 16)
  const g = parseInt(v.substring(2, 4), 16)
  const b = parseInt(v.substring(4, 6), 16)
  const m = (c: number) => Math.round(c + (255 - c) * ratio)
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`
}

export function ScenarioCard({ scenario, progression, onClick }: ScenarioCardProps) {
  const [survol, setSurvol] = useState(false)

  const total = scenario.missions.length
  const abordees = missionsAbordees(scenario, progression)
  const pct = pourcentageScenario(scenario, progression)

  return (
    <button
      type="button"
      onClick={() => onClick(scenario.id)}
      onMouseEnter={() => setSurvol(true)}
      onMouseLeave={() => setSurvol(false)}
      style={{
        fontFamily: 'Arial, sans-serif',
        textAlign: 'left',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        background: '#FFFFFF',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: survol
          ? '0 8px 20px rgba(0, 0, 0, 0.16)'
          : '0 2px 8px rgba(0, 0, 0, 0.10)',
        transform: survol ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      {/* Bandeau colore du scenario avec son nom */}
      <div
        style={{
          background: couleurEntete(scenario.couleur),
          padding: '18px 18px 16px 18px',
          color: couleurTexteSur(scenario.couleur),
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.20)',
        }}
      >
        <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.2 }}>
          {scenario.nom}
        </div>
        <div style={{ fontSize: 13, fontWeight: 400, marginTop: 4, opacity: 0.95 }}>
          {total} missions
        </div>
      </div>

      {/* Corps : progression + pastilles */}
      <div style={{ padding: '16px 18px 18px 18px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 12, color: '#555' }}>Progression</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: couleurEntete(scenario.couleur) }}>
            {pct} %
          </span>
        </div>

        {/* Barre de progression */}
        <div
          style={{
            height: 8,
            background: '#EDF1F5',
            borderRadius: 99,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: scenario.couleur,
              borderRadius: 99,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Pastilles de missions */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginTop: 14,
          }}
        >
          {scenario.missions.map((m) => {
            const faite = progression.has(m.id)
            return (
              <span
                key={m.id}
                title={`Mission ${m.numero} - ${m.titre}`}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: faite ? scenario.couleur : eclaircir(scenario.couleur, 0.82),
                  color: faite ? '#FFFFFF' : '#7A7A7A',
                  border: faite ? 'none' : `1px solid ${eclaircir(scenario.couleur, 0.6)}`,
                }}
              >
                {m.numero}
              </span>
            )
          })}
        </div>

        <div style={{ fontSize: 11, color: '#888', marginTop: 12 }}>
          {abordees} sur {total} missions abordees
        </div>
      </div>
    </button>
  )
}
