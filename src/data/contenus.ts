// contenus.ts
// Loader centralise du contenu pedagogique par mission.
// Definit la forme du contenu d'une mission (onglets Travaux, Synthese,
// Auto-evaluation, Activites) et fournit le contenu Renault comme modele.
// Le journal de bord n'a pas de contenu predefini : il est saisi par l'eleve.

import type { NiveauCompetence } from './schema'

// --- Onglet Travaux a rendre -----------------------------------------------
export interface ContenuTravaux {
  consigne: string // enonce de la mission a realiser
}

// --- Onglet Synthese (carte arborescente a completer) ----------------------
export interface NoeudSynthese {
  id: string
  // texte fixe affiche, ou null si c'est une case a completer par l'eleve
  texte: string | null
  // reponse attendue si case a completer (invisible pour l'eleve)
  reponse?: string
  enfants?: NoeudSynthese[]
}

export interface ContenuSynthese {
  titre: string
  // mots et groupes de mots fournis a l'eleve pour completer les cases
  proposition: string[]
  racine: NoeudSynthese
}

// --- Onglet Auto-evaluation ------------------------------------------------
export interface IndicateurNiveau {
  niveau: NiveauCompetence
  description: string
}

export interface CompetenceAutoEval {
  id: string
  intitule: string
  indicateurs: IndicateurNiveau[]
}

export interface ContenuAutoEval {
  competences: CompetenceAutoEval[]
}

// --- Onglet Activites ------------------------------------------------------
export interface TermeGlossaire {
  terme: string
  definition: string
}

export interface Flashcard {
  recto: string
  verso: string
}

export type QuestionQuiz =
  | { type: 'qcm'; question: string; options: string[]; bonnes: number[] }
  | { type: 'unique'; question: string; options: string[]; bonne: number }
  | { type: 'trous'; texte: string; reponses: string[] } // {x} marque un trou
  | { type: 'appariement'; question: string; gauche: string[]; droite: string[]; paires: [number, number][] }

export interface GlisserDeposer {
  consigne: string
  etiquettes: string[]
  zones: { libelle: string; etiquetteIndex: number }[]
}

export interface ContenuActivites {
  glossaire: TermeGlossaire[]
  flashcards: Flashcard[]
  quiz: QuestionQuiz[]
  glisserDeposer?: GlisserDeposer
}

// --- Onglet Corrige (espace enseignant) ------------------------------------
// Corrige structure d'une mission : pour chaque travail demande a l'eleve,
// l'intitule tel qu'il le lit, les documents a mobiliser, la reponse attendue
// et le bareme en points.
export interface QuestionCorrige {
  intitule: string // la question/le travail tel que pose a l'eleve
  documents: string[] // documents a mobiliser pour repondre
  reponse: string // reponse precise attendue
  bareme: number // points attribues a cette question
}

export interface ContenuCorrige {
  questions: QuestionCorrige[]
}

// --- Contenu complet d'une mission -----------------------------------------
export interface ContenuMission {
  travaux: ContenuTravaux
  synthese: ContenuSynthese
  autoEval: ContenuAutoEval
  activites: ContenuActivites
  corrige?: ContenuCorrige // corrige structure, affiche dans l'espace enseignant
}

// ---------------------------------------------------------------------------
// CONTENU MODELE : Renault, mission 1 - La presentation de l'unite
// ---------------------------------------------------------------------------
const RENAULT_M1: ContenuMission = {
  travaux: {
    consigne:
      "A partir des informations sur la concession Renault de votre secteur, rédiger une présentation structurée de l'unité commerciale. Indiquer la forme juridique, la position dans le réseau de la marque, les activités proposées (vente de véhicules neufs et d'occasion, atelier, financement), la zone géographique couverte et l'organisation de l'équipe commerciale. La présentation doit tenir sur une page et adopter un ton professionnel.",
  },
  synthese: {
    titre: "Présentation de l'unité commerciale",
    proposition: [
      'Concessionnaire',
      'Véhicules neufs',
      "Véhicules d'occasion",
      'Atelier après-vente',
      'Zone de chalandise',
      'Équipe commerciale',
    ],
    racine: {
      id: 'racine',
      texte: "L'unite commerciale Renault",
      enfants: [
        {
          id: 'statut',
          texte: 'Statut dans le réseau',
          enfants: [{ id: 'statut-1', texte: null, reponse: 'Concessionnaire' }],
        },
        {
          id: 'activites',
          texte: 'Activites',
          enfants: [
            { id: 'act-1', texte: null, reponse: 'Véhicules neufs' },
            { id: 'act-2', texte: null, reponse: "Véhicules d'occasion" },
            { id: 'act-3', texte: null, reponse: 'Atelier après-vente' },
          ],
        },
        {
          id: 'marche',
          texte: 'Marché local',
          enfants: [{ id: 'marche-1', texte: null, reponse: 'Zone de chalandise' }],
        },
        {
          id: 'organisation',
          texte: 'Organisation',
          enfants: [{ id: 'org-1', texte: null, reponse: 'Équipe commerciale' }],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1',
        intitule: "Identifier les caractéristiques de l'unité commerciale",
        indicateurs: [
          { niveau: 'novice', description: "Je ne sais pas décrire l'unité commerciale." },
          { niveau: 'debrouille', description: 'Je cite quelques caractéristiques sans les organiser.' },
          { niveau: 'averti', description: "Je décris l'unité de façon structurée." },
          { niveau: 'expert', description: "Je décris l'unité et je la situe dans le réseau de la marque." },
        ],
      },
      {
        id: 'c2',
        intitule: 'Repérer les activités proposées',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas les activités.' },
          { niveau: 'debrouille', description: 'Je cite une ou deux activités.' },
          { niveau: 'averti', description: 'Je cite toutes les activités principales.' },
          { niveau: 'expert', description: 'Je relie chaque activité à un besoin client.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Unite commerciale', definition: "Lieu physique ou virtuel où un client peut accéder à une offre de produits ou de services." },
      { terme: 'Concessionnaire', definition: "Commerçant indépendant lié à une marque par un contrat, qui vend ses produits sur un secteur défini." },
      { terme: 'Zone de chalandise', definition: "Zone géographique d'où provient la majorité de la clientèle d'un point de vente." },
    ],
    flashcards: [
      { recto: "Qu'est-ce qu'une unité commerciale ?", verso: "Un lieu, physique ou virtuel, donnant accès à une offre de produits ou services." },
      { recto: 'Quel est le statut du point de vente Renault local ?', verso: 'Concessionnaire lié à la marque par un contrat.' },
    ],
    quiz: [
      {
        type: 'unique',
        question: "Quel terme désigne le lien entre la concession et la marque Renault ?",
        options: ['Un contrat de concession', 'Une location simple', 'Une franchise alimentaire'],
        bonne: 0,
      },
      {
        type: 'qcm',
        question: 'Quelles activités trouve-t-on dans une concession ?',
        options: ['Vente de véhicules neufs', "Vente de véhicules d'occasion", 'Atelier après-vente', 'Production de pneumatiques'],
        bonnes: [0, 1, 2],
      },
      {
        type: 'trous',
        texte: "La {0} est la zone d'où provient la majorité de la {1} du point de vente.",
        reponses: ['zone de chalandise', 'clientele'],
      },
    ],
    glisserDeposer: {
      consigne: 'Associer chaque élément à la bonne catégorie.',
      etiquettes: ['Vente VN', 'Vente VO', 'Atelier'],
      zones: [
        { libelle: 'Véhicules neufs', etiquetteIndex: 0 },
        { libelle: "Véhicules d'occasion", etiquetteIndex: 1 },
        { libelle: 'Réparation et entretien', etiquetteIndex: 2 },
      ],
    },
  },
}

// Registre des contenus disponibles, indexe par identifiant de mission.
const CONTENUS: Record<string, ContenuMission> = {
  'renault-m1': RENAULT_M1,
}

// Charge le contenu d'une mission, ou undefined si non encore redige.
export function getContenuMission(missionId: string): ContenuMission | undefined {
  return CONTENUS[missionId]
}

// Indique si une mission dispose d'un contenu redige.
export function aContenu(missionId: string): boolean {
  return missionId in CONTENUS
}
