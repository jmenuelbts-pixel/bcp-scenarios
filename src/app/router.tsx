// router.tsx
// Routes de l'application, protegees par les gardes d'authentification.
// Espace étudiant (accepte) : accueil, scenario, mission.
// Espace enseignant : accueil professeur (placeholder a ce stade).

import { createBrowserRouter, useNavigate } from 'react-router-dom'
import { GardeEtudiant, GardeEnseignant } from './Racine'
import { AccueilEtudiant } from '../pages/etudiant/AccueilEtudiant'
import { ScenarioMissions } from '../pages/etudiant/ScenarioMissions'
import { Mission } from '../pages/etudiant/Mission'
import { AccueilEnseignant } from '../pages/enseignant/AccueilEnseignant'
import { Inscriptions } from '../pages/enseignant/Inscriptions'
import { Deverrouillage } from '../pages/enseignant/Deverrouillage'
import { Etudiants } from '../pages/enseignant/Etudiants'
import { SuiviEleve } from '../pages/enseignant/SuiviEleve'
import { Messagerie } from '../pages/enseignant/Messagerie'
import { MessagerieEleve } from '../pages/etudiant/MessagerieEleve'
import { useAuth } from '../lib/auth'
import { useEffect, useState } from 'react'
import { nombreNonLus } from '../lib/messagerie'

// Enveloppe l'accueil etudiant pour injecter navigation, prenom, deconnexion,
// et le nombre de messages non lus pour le badge de la messagerie.
function AccueilAvecNavigation() {
  const navigate = useNavigate()
  const { profil, session, deconnecter } = useAuth()
  const [nonLus, setNonLus] = useState(0)

  useEffect(() => {
    if (session?.user?.id) {
      nombreNonLus(session.user.id).then(setNonLus)
    }
  }, [session])

  return (
    <AccueilEtudiant
      prenom={profil?.prenom ?? undefined}
      onOuvrirScenario={(id) => navigate(`/scenario/${id}`)}
      onDeconnexion={deconnecter}
      nonLus={nonLus}
      onOuvrirMessagerie={() => navigate('/messagerie')}
    />
  )
}

export const router = createBrowserRouter([
  {
    element: <GardeEtudiant />,
    children: [
      { path: '/', element: <AccueilAvecNavigation /> },
      { path: '/scenario/:scenarioId', element: <ScenarioMissions /> },
      { path: '/scenario/:scenarioId/mission/:missionId', element: <Mission /> },
      { path: '/messagerie', element: <MessagerieEleve /> },
    ],
  },
  {
    element: <GardeEnseignant />,
    children: [
      { path: '/enseignant', element: <AccueilEnseignant /> },
      { path: '/enseignant/inscriptions', element: <Inscriptions /> },
      { path: '/enseignant/deverrouillage', element: <Deverrouillage /> },
      { path: '/enseignant/eleves', element: <Etudiants /> },
      { path: '/enseignant/eleves/:eleveId', element: <SuiviEleve /> },
      { path: '/enseignant/messagerie', element: <Messagerie /> },
    ],
  },
])
