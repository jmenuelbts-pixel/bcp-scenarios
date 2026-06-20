// useBattementPresence.ts
// Heartbeat global de l'eleve : la position est deduite de l'URL et envoyee
// regulierement. Pas de mise hors ligne sur pagehide (qui se declenche au
// moindre changement d'onglet) : l'eleve passe gris tout seul a l'arret des
// battements.

import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from './auth'
import { demarrerBattement, type Position } from './presence'
import { getScenario, getMission, ONGLETS_PAR_ID, ONGLETS, type OngletId } from '../data/schema'

let ongletMissionCourant: OngletId | null = null
export function definirOngletCourant(onglet: OngletId | null): void {
  ongletMissionCourant = onglet
}

function positionDepuisChemin(pathname: string): Position {
  const segments = pathname.split('/').filter(Boolean)

  if (segments[0] === 'scenario' && segments[1]) {
    const scenarioId = segments[1]
    const scenario = getScenario(scenarioId)

    if (segments[2] === 'mission' && segments[3]) {
      const missionId = segments[3]
      const mission = getMission(scenarioId, missionId)
      const onglet = ongletMissionCourant ?? 'travaux'
      const libelleOnglet = ONGLETS_PAR_ID[onglet]?.libelle ?? ''
      const rang = ONGLETS.findIndex((o) => o.id === onglet)
      const progression = rang >= 0 ? Math.round(((rang + 1) / ONGLETS.length) * 100) : null
      const base = `${scenario?.nom ?? 'Scénario'} - Mission ${mission?.numero ?? ''} ${mission?.titre ?? ''}`.trim()
      return {
        page: libelleOnglet ? `${base} (${libelleOnglet})` : base,
        scenarioId,
        missionId,
        ongletId: onglet,
        progression,
      }
    }

    return {
      page: `Liste des missions - ${scenario?.nom ?? 'Scénario'}`,
      scenarioId,
      missionId: null,
      ongletId: null,
      progression: null,
    }
  }

  if (segments[0] === 'messagerie') {
    return { page: 'Messagerie', scenarioId: null, missionId: null, ongletId: null, progression: null }
  }
  if (segments[0] === 'exports') {
    return { page: 'Exports', scenarioId: null, missionId: null, ongletId: null, progression: null }
  }

  return { page: "Page d'accueil", scenarioId: null, missionId: null, ongletId: null, progression: null }
}

export function useBattementPresence(): void {
  const { session } = useAuth()
  const userId = session?.user?.id
  const location = useLocation()

  const positionRef = useRef<Position>(positionDepuisChemin(location.pathname))
  positionRef.current = positionDepuisChemin(location.pathname)

  useEffect(() => {
    if (!userId) return
    const arreter = demarrerBattement(userId, () => positionRef.current)
    return arreter
  }, [userId])
}
