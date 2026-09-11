// BoutonExportOnglet.tsx
// Bouton d'export PDF d'UN onglet, cote eleve, sur la page de l'exercice.
// Toujours affiche ; grise (desactive) tant que `pret` est faux.
// Le PDF ne contient que la partie concernee, en version remplie, sans date.

import { useState } from 'react'
import { serialiserMissionPdf, type PartieExport } from '../../lib/serialiserMission'
import { imprimerPdf } from '../../lib/pdf'
import { getScenario, TOUTES_MISSIONS } from '../../data/schema'

export function BoutonExportOnglet({
  missionId,
  partie,
  etudiantId,
  pret,
}: {
  missionId: string
  partie: PartieExport
  etudiantId?: string
  pret: boolean
}) {
  const [enCours, setEnCours] = useState(false)
  const actif = pret && !!etudiantId && !enCours

  async function exporter() {
    if (!actif || !etudiantId) return
    setEnCours(true)
    try {
      const sid = TOUTES_MISSIONS.find((x) => x.mission.id === missionId)?.scenario.id
      if (!sid || !getScenario(sid)) return
      const doc = await serialiserMissionPdf(sid, missionId, 'rempli', etudiantId, undefined, {
        parties: [partie],
        sansDate: true,
      })
      if (doc) imprimerPdf(doc)
    } finally {
      setEnCours(false)
    }
  }

  return (
    <button
      type="button"
      onClick={exporter}
      disabled={!actif}
      title={pret ? 'Exporter cet onglet en PDF' : "Disponible une fois le travail envoyé ou la correction disponible"}
      style={{
        fontFamily: 'Arial, sans-serif',
        background: '#FFFFFF',
        border: `1.5px solid ${actif ? '#1D4ED8' : '#C7D2E0'}`,
        color: actif ? '#1D4ED8' : '#9AA5B1',
        borderRadius: 8,
        padding: '9px 16px',
        fontSize: 13,
        fontWeight: 700,
        cursor: actif ? 'pointer' : 'not-allowed',
      }}
    >
      {enCours ? 'Génération du PDF...' : 'Exporter en PDF'}
    </button>
  )
}
