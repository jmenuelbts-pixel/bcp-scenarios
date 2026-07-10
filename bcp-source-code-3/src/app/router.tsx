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
import { Exports } from '../pages/enseignant/Exports'
import { Corriges } from '../pages/enseignant/Corriges'
import { Deroulement } from '../pages/enseignant/Deroulement'
import { Progression } from '../pages/enseignant/Progression'
import { ListeEleves } from '../pages/enseignant/ListeEleves'
import { ClassesGroupes } from '../pages/enseignant/ClassesGroupes'
import { ComptesEleves } from '../pages/enseignant/ComptesEleves'
import { ReinitialiserMotDePasse } from '../pages/ReinitialiserMotDePasse'
import { Travaux } from '../pages/enseignant/Travaux'
import { PresenceTempsReel } from '../pages/enseignant/PresenceTempsReel'
import { MessagerieEleve } from '../pages/etudiant/MessagerieEleve'
import { ExportsEleve } from '../pages/etudiant/ExportsEleve'
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
      onOuvrirExports={() => navigate('/exports')}
    />
  )
}

export const router = createBrowserRouter([
  // Route publique (hors gardes) : redefinition du mot de passe via lien email.
  { path: '/reinitialiser', element: <ReinitialiserMotDePasse /> },
  {
    element: <GardeEtudiant />,
    children: [
      { path: '/', element: <AccueilAvecNavigation /> },
      { path: '/scenario/:scenarioId', element: <ScenarioMissions /> },
      { path: '/scenario/:scenarioId/mission/:missionId', element: <Mission /> },
      { path: '/messagerie', element: <MessagerieEleve /> },
      { path: '/exports', element: <ExportsEleve /> },
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
      { path: '/enseignant/exports', element: <Exports /> },
      { path: '/enseignant/corriges', element: <Corriges /> },
      { path: '/enseignant/deroulement', element: <Deroulement /> },
      { path: '/enseignant/progression', element: <Progression /> },
      { path: '/enseignant/liste', element: <ListeEleves /> },
      { path: '/enseignant/classes', element: <ClassesGroupes /> },
      { path: '/enseignant/comptes', element: <ComptesEleves /> },
      { path: '/enseignant/travaux', element: <Travaux /> },
      { path: '/enseignant/presence', element: <PresenceTempsReel /> },
    ],
  },
])
