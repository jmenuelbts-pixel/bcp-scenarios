// Authentification.tsx
// Orchestre le parcours d'authentification non connecte :
// accueil de selection de role, puis connexion etudiant ou connexion
// professeur. Chaque ecran enfant gere son propre bouton Retour.

import { useState } from 'react'
import { AccueilRole } from './AccueilRole'
import { ConnexionEtudiant } from './ConnexionEtudiant'
import { ConnexionEnseignant } from './ConnexionEnseignant'

type Ecran = 'accueil' | 'etudiant' | 'enseignant'

export function Authentification() {
  const [ecran, setEcran] = useState<Ecran>('accueil')

  if (ecran === 'etudiant') {
    return <ConnexionEtudiant onRetour={() => setEcran('accueil')} />
  }
  if (ecran === 'enseignant') {
    return <ConnexionEnseignant onRetour={() => setEcran('accueil')} />
  }
  return <AccueilRole onChoisir={(role) => setEcran(role)} />
}
