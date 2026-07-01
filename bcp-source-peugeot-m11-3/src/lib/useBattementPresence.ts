// useBattementPresence.ts
// Heartbeat global de l'eleve : la position est deduite de l'URL et envoyee
// regulierement. Pas de mise hors ligne sur pagehide (qui se declenche au
// moindre changement d'onglet) : l'eleve passe gris tout seul a l'arret des
// battements.

import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from './auth'
import { demarrerBattement, type Position } from './presence'
import { getScenario, getMission, ONGLETS_PAR_ID, ONGLETS, type OngletId } from '../data/schema'

let ongletMissionCourant: OngletId | null = null
let sousOngletCourant: string | null = null
export function definirOngletCourant(onglet: OngletId | null): void {
  ongletMissionCourant = onglet
}
export function definirSousOngletCourant(sousOnglet: string | null): void {
  sousOngletCourant = sousOnglet
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
      // Sur l'onglet Activites, on precise le sous-onglet (Glossaire, Quiz...).
      const detailOnglet =
        onglet === 'activites' && sousOngletCourant
          ? `${libelleOnglet} - ${sousOngletCourant}`
          : libelleOnglet
      return {
        page: detailOnglet ? `${base} (${detailOnglet})` : base,
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

export function useBattementPresence(): string | null {
  const { session } = useAuth()
  const userId = session?.user?.id
  const location = useLocation()
  const [etat, setEtat] = useState<string | null>(null)

  // Le pathname est garde dans une ref, mise a jour a chaque render.
  const pathnameRef = useRef(location.pathname)
  pathnameRef.current = location.pathname

  useEffect(() => {
    if (!userId) {
      setEtat('AUCUN userId (session vide cote eleve)')
      return
    }
    // La position est RECALCULEE a chaque battement (lit pathname + onglet +
    // sous-onglet courants), pour refleter le changement d'onglet meme sans
    // changement d'URL.
    const arreter = demarrerBattement(
      userId,
      () => positionDepuisChemin(pathnameRef.current),
      10000,
      (erreur) => {
        if (erreur) setEtat('ERREUR ecriture : ' + erreur)
        else setEtat('OK battement id=' + userId.slice(0, 8))
      }
    )
    return arreter
  }, [userId])

  return etat
}
