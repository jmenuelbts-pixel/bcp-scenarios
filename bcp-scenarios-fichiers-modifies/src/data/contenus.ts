// contenus.ts
// Loader centralise du contenu pedagogique par mission.
// Definit la forme du contenu d'une mission (onglets Travaux, Synthese,
// Auto-evaluation, Activites) et fournit le contenu Renault comme modele.
// Le journal de bord n'a pas de contenu predefini : il est saisi par l'eleve.

import type { NiveauCompetence } from './schema'

// --- Onglet Travaux a rendre -----------------------------------------------
// --- Onglet Travaux a rendre (fiche eleve complete) ------------------------
// Une annexe a completer : tableau de lignes (libelle fixe + saisie eleve),
// ou organigramme a reconstituer en placant des noms.
export interface LigneAnnexe {
  id: string
  libelle: string // intitule fixe de la ligne (ex : Denomination)
  prefixe?: string // categorie fixe affichee a gauche (ex : Services disponibles)
}

export interface AnnexeTableau {
  type: 'tableau'
  id: string
  titre: string
  lignes: LigneAnnexe[]
}

export interface AnnexeHoraires {
  type: 'horaires'
  id: string
  titre: string
  jours: string[] // ex : Lundi..Dimanche
}

export interface CaseOrganigramme {
  id: string
  niveau: number // 1 = direction, 2 = chefs, 3 = rattaches
  colonne: number // position horizontale dans la trame (0-based)
}

export interface AnnexeOrganigramme {
  type: 'organigramme'
  id: string
  titre: string
  consigne: string
  noms: string[] // liste complete des noms a choisir (menu deroulant)
  fonctions: string[] // liste complete des fonctions a choisir (menu deroulant)
  cases: CaseOrganigramme[] // emplacements de la trame, chacun = 2 menus (nom + fonction)
}

export interface AnnexeGrille {
  type: 'grille'
  id: string
  titre: string
  colonnes: string[] // en-tetes de colonnes
  nbLignes: number // nombre de lignes a saisir
}

export interface AnnexeTexte {
  type: 'texte'
  id: string
  titre: string
  lignes?: number // hauteur de la zone de saisie (defaut 3)
  support?: string // image de support affichee au-dessus de la zone (optionnel)
}

export interface AnnexeMail {
  type: 'mail'
  id: string
  titre: string
}

export interface AnnexeSms {
  type: 'sms'
  id: string
  titre: string
  entete?: string // nom affiche en haut (ex : RENAULT)
  date?: string // date affichee (ex : Mar. 10 nov. à 11:15)
}

export interface LigneDialogue {
  id: string
  role: 'question' | 'reponse'
  texte?: string // pour une reponse : texte fixe affiche ; pour une question : vide (a saisir)
}

export interface AnnexeDialogue {
  type: 'dialogue'
  id: string
  titre: string
  colonnes: string[] // cases a cocher (ex : O, F, A, CM)
  lignes: LigneDialogue[]
}

export interface LigneSoncase {
  id: string
  libelle: string // ex : Sécurité
}

export interface AnnexeSoncase {
  type: 'soncase'
  id: string
  titre: string
  colonneCoche: string // en-tete de la colonne a cocher
  colonneJustif: string // en-tete de la colonne justification
  lignes: LigneSoncase[]
}

export interface LigneFiche {
  id: string
  libelle: string // ex : Énergie, Prix
}

export interface AnnexeFicheProduit {
  type: 'ficheproduit'
  id: string
  titre: string
  technique: LigneFiche[] // caracteristiques techniques (libelle + saisie)
  nbEquipements: number // nombre de lignes d'equipements a saisir
  commercial: LigneFiche[] // caracteristiques commerciales (libelle + saisie)
}

export interface AnnexeCap {
  type: 'cap'
  id: string
  titre: string
  nbLignes: number // nombre d'arguments a construire
}

export type Annexe = AnnexeTableau | AnnexeHoraires | AnnexeOrganigramme | AnnexeGrille | AnnexeTexte | AnnexeMail | AnnexeSms | AnnexeDialogue | AnnexeSoncase | AnnexeFicheProduit | AnnexeCap

export interface QuestionTravaux {
  numero: number
  consigne: string // ex : Completez l'identite de l'entreprise.
  ressources?: string // ex : Ressource 1, completez l'annexe 1.
  annexeId?: string // annexe rattachee a remplir
}

export interface ActiviteTravaux {
  titre: string // ex : Activite 1 - L'entreprise et ses produits
  questions: QuestionTravaux[]
}

export interface DocumentRessource {
  numero: number // numero affiche (Document 1, 2...)
  titre: string
  images: string[] // chemins des images (depuis /public), une ou plusieurs pages
}

export interface ContenuTravaux {
  consigne: string // resume court de la mission a realiser
  contexte?: string // contexte professionnel
  documents?: DocumentRessource[] // bibliotheque de documents a lire (depliables)
  objectifs?: string[] // objectifs de la mission
  competence?: {
    groupe: string // ex : Groupe de competences 1
    intitule: string // ex : Conseiller et vendre / Assurer la veille commerciale
    detail: string // descriptif de la competence
  }
  activites?: ActiviteTravaux[] // activites avec questions
  annexes?: Annexe[] // annexes a completer par l'eleve
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
export interface PosteOrganigramme {
  fonction: string // ex : Directeur, Chef des ventes VN
  personnes: string[] // noms rattaches a ce poste
  sousPostes?: PosteOrganigramme[] // niveaux rattaches en dessous
}

export interface QuestionCorrige {
  intitule: string // la question/le travail tel que pose a l'eleve
  documents: string[] // documents a mobiliser pour repondre
  reponse: string // reponse precise attendue
  bareme: number // points attribues a cette question
  organigramme?: PosteOrganigramme // organigramme corrige (optionnel)
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
      "À partir des ressources fournies, complétez l'identité de l'unité commerciale, ses horaires, ses biens et services, puis réalisez son organigramme.",
    contexte:
      "Vous êtes en PFMP dans la concession Renault Paris Championnet, située 203-215 rue Championnet, 75018 Paris (18e arrondissement). L'entreprise est spécialisée dans la vente de véhicules neufs, de véhicules d'occasion et d'accessoires. C'est votre premier stage dans l'enseigne. Le responsable de l'agence souhaite que vous vous informiez sur l'entreprise afin de prendre en main les clients et les réclamations, sous la responsabilité de votre tuteur.",
    documents: [
      { numero: 1, titre: "Identité de l'entreprise (site RRG Championnet)", images: ['/docs/renault-m1/doc1.jpg'] },
      { numero: 2, titre: "Horaires d'ouverture du showroom", images: ['/docs/renault-m1/doc2.jpg'] },
      { numero: 3, titre: 'Les biens (site RRG Championnet)', images: ['/docs/renault-m1/doc3.jpg'] },
      { numero: 4, titre: 'Les services', images: ['/docs/renault-m1/doc4.jpg'] },
      { numero: 5, titre: 'Le personnel (équipes présentées dans le désordre)', images: ['/docs/renault-m1/doc5a.jpg', '/docs/renault-m1/doc5b.jpg'] },
    ],
    objectifs: [
      "Identifier et présenter l'identité d'une unité commerciale (dénomination, statut, activité, coordonnées).",
      "Distinguer les biens et les services proposés et situer les acteurs dans l'organisation de l'entreprise.",
    ],
    competence: {
      groupe: 'Groupe de compétences 1',
      intitule: 'Conseiller et vendre — Assurer la veille commerciale',
      detail:
        "Rechercher, hiérarchiser, exploiter et actualiser les informations sur l'entreprise et son marché.",
    },
    activites: [
      {
        titre: "Activité 1 — L'entreprise et ses produits",
        questions: [
          { numero: 1, consigne: "Complétez l'identité de l'entreprise.", ressources: 'Lire le document 1, compléter l\'annexe 1.', annexeId: 'annexe1' },
          { numero: 2, consigne: 'Indiquez les horaires d\'ouverture de la partie showroom de la concession.', ressources: 'Lire le document 2, compléter l\'annexe 2.', annexeId: 'annexe2' },
          { numero: 3, consigne: 'Indiquez les deux grands types de biens proposés par la concession Renault.', ressources: 'Lire le document 3, compléter l\'annexe 3.', annexeId: 'annexe3' },
          { numero: 4, consigne: 'Indiquez les services proposés par la concession Renault.', ressources: 'Lire le document 4, compléter l\'annexe 4.', annexeId: 'annexe4' },
        ],
      },
      {
        titre: 'Activité 2 — Le personnel de l\'entreprise',
        questions: [
          { numero: 5, consigne: "Réalisez l'organigramme de l'entreprise en précisant le nom et la fonction de chaque personne.", ressources: 'Lire le document 5, compléter l\'annexe 5.', annexeId: 'annexe5' },
        ],
      },
    ],
    annexes: [
      {
        type: 'tableau',
        id: 'annexe1',
        titre: "Annexe 1 — Identité de l'entreprise",
        lignes: [
          { id: 'denom', libelle: 'Dénomination' },
          { id: 'secteur', libelle: "Secteur d'activité" },
          { id: 'forme', libelle: 'Forme juridique' },
          { id: 'annee', libelle: 'Année de création' },
          { id: 'adresse', libelle: 'Adresse' },
          { id: 'tel', libelle: 'Numéro de téléphone' },
          { id: 'site', libelle: 'Site internet' },
        ],
      },
      {
        type: 'horaires',
        id: 'annexe2',
        titre: "Annexe 2 — Horaires d'ouverture du showroom",
        jours: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      },
      {
        type: 'tableau',
        id: 'annexe3',
        titre: 'Annexe 3 — Les biens',
        lignes: [
          { id: 'bien1', libelle: 'Les biens', prefixe: 'Les biens' },
          { id: 'bien2', libelle: 'Les biens', prefixe: 'Les biens' },
        ],
      },
      {
        type: 'tableau',
        id: 'annexe4',
        titre: 'Annexe 4 — Les services',
        lignes: [
          { id: 'sd1', libelle: '', prefixe: 'Services disponibles' },
          { id: 'sd2', libelle: '', prefixe: 'Services disponibles' },
          { id: 'sd3', libelle: '', prefixe: 'Services disponibles' },
          { id: 'sd4', libelle: '', prefixe: 'Services disponibles' },
          { id: 'er1', libelle: '', prefixe: 'Entretien et réparation' },
          { id: 'er2', libelle: '', prefixe: 'Entretien et réparation' },
          { id: 'er3', libelle: '', prefixe: 'Entretien et réparation' },
          { id: 'er4', libelle: '', prefixe: 'Entretien et réparation' },
        ],
      },
      {
        type: 'organigramme',
        id: 'annexe5',
        titre: 'Annexe 5 — Organigramme de la concession Renault',
        consigne:
          "Pour chaque emplacement, choisissez le bon nom et la bonne fonction à l'aide des deux menus déroulants, en vous appuyant sur le document 5 (les personnes y sont présentées dans le désordre). La trame fixe les liens hiérarchiques ; à vous de placer chaque personne au bon endroit.",
        noms: [
          'Sergio Polatian', 'Guillaume Ramus', 'Pascal Jean', 'José Bénitez', 'Céline Etchecopar',
          'Yayha Allaoui', 'Cyril Cottard', 'Matthieu Mulliez', 'Bernard Mercier', 'Badr Chatraoui',
        ],
        fonctions: [
          'Directeur', 'Chef des ventes véhicules neufs', 'Conseiller commercial VN',
          'Assistante de livraison', "Ventes véhicules d'occasion", 'Conseiller commercial VO',
          'Chef des ventes pièces de rechange', 'Conseiller pièces de rechange', 'Chef des services techniques',
        ],
        cases: [
          { id: 'org1', niveau: 1, colonne: 1 },
          { id: 'org2', niveau: 2, colonne: 0 },
          { id: 'org3', niveau: 2, colonne: 1 },
          { id: 'org4', niveau: 2, colonne: 2 },
          { id: 'org5', niveau: 2, colonne: 3 },
          { id: 'org6', niveau: 3, colonne: 0 },
          { id: 'org7', niveau: 3, colonne: 1 },
          { id: 'org8', niveau: 3, colonne: 2 },
        ],
      },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: "Complétez l'identité de l'entreprise.",
        documents: ['Ressource 1', 'Annexe 1'],
        bareme: 4,
        reponse:
          "Dénomination : Renault Paris Championnet (RRG, Renault Retail Group).\nSecteur d'activité : concessionnaire automobile.\nForme juridique : filiale.\nAnnée de création : 1978.\nAdresse : 203-215 rue Championnet, 75018 Paris.\nTéléphone : 01 42 28 36 36 ou 01 53 53 60 75 (les deux numéros sont acceptés, établissement ou atelier).\nSite internet : renault-occasions-paris-championnet.espacevo.fr",
      },
      {
        intitule: "Indiquez les horaires d'ouverture de la partie showroom de la concession.",
        documents: ['Ressource 2', 'Annexe 2'],
        bareme: 3,
        reponse:
          "Du lundi au vendredi : 09h-19h.\nSamedi : 09h-18h.\nDimanche : fermé.",
      },
      {
        intitule: "Indiquez les deux grands types de biens proposés par la concession Renault.",
        documents: ['Ressource 3', 'Annexe 3'],
        bareme: 2,
        reponse: "Les véhicules (neufs et d'occasion) et les accessoires.",
      },
      {
        intitule: "Indiquez les services proposés par la concession Renault.",
        documents: ['Ressource 4', 'Annexe 4'],
        bareme: 4,
        reponse:
          "Services disponibles : je recherche un véhicule, j'entretiens mon véhicule, j'ai besoin d'un dépannage, je loue un véhicule.\nEntretien et réparation : entretien, carrosserie / vitrage, révision, diagnostic / réparation.",
      },
      {
        intitule:
          "Réalisez l'organigramme de l'entreprise en précisant le nom et la fonction de chaque personne.",
        documents: ['Ressource 5', 'Annexe 5'],
        bareme: 7,
        reponse:
          "Points de vigilance : les conseillers véhicules d'occasion sont rattachés au pôle ventes, et non aux services techniques. Céline Etchecopar (assistante de livraison) est rattachée au pôle ventes véhicules neufs.",
        organigramme: {
          fonction: 'Directeur',
          personnes: ['Sergio Polatian'],
          sousPostes: [
            {
              fonction: 'Chef des ventes véhicules neufs',
              personnes: ['Guillaume Ramus'],
              sousPostes: [
                { fonction: 'Conseiller commercial VN', personnes: ['Pascal Jean', 'José Bénitez'] },
                { fonction: 'Assistante de livraison', personnes: ['Céline Etchecopar'] },
              ],
            },
            {
              fonction: 'Ventes véhicules d\'occasion',
              personnes: [],
              sousPostes: [
                { fonction: 'Conseiller commercial VO', personnes: ['Yayha Allaoui', 'Cyril Cottard'] },
              ],
            },
            {
              fonction: 'Chef des ventes pièces de rechange',
              personnes: ['Matthieu Mulliez'],
              sousPostes: [
                { fonction: 'Conseiller pièces de rechange', personnes: ['Bernard Mercier'] },
              ],
            },
            {
              fonction: 'Chef des services techniques',
              personnes: ['Badr Chatraoui'],
            },
          ],
        },
      },
    ],
  },
  synthese: {
    titre: "Présentation de l'unité commerciale",
    proposition: [
      'Concessionnaire automobile',
      'Filiale',
      '1978',
      'Véhicules',
      'Accessoires',
      'Entretien et réparation',
      'Directeur',
      'Chefs de service',
      'Commerciaux',
    ],
    racine: {
      id: 'racine',
      texte: "L'unite commerciale Renault Championnet",
      enfants: [
        {
          id: 'identite',
          texte: 'Identité',
          enfants: [
            { id: 'id-1', texte: null, reponse: 'Concessionnaire automobile' },
            { id: 'id-2', texte: null, reponse: 'Filiale' },
            { id: 'id-3', texte: null, reponse: '1978' },
          ],
        },
        {
          id: 'offre',
          texte: 'Offre',
          enfants: [
            { id: 'of-1', texte: null, reponse: 'Véhicules' },
            { id: 'of-2', texte: null, reponse: 'Accessoires' },
            { id: 'of-3', texte: null, reponse: 'Entretien et réparation' },
          ],
        },
        {
          id: 'organisation',
          texte: 'Organisation',
          enfants: [
            { id: 'org-1', texte: null, reponse: 'Directeur' },
            { id: 'org-2', texte: null, reponse: 'Chefs de service' },
            { id: 'org-3', texte: null, reponse: 'Commerciaux' },
          ],
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
          { niveau: 'averti', description: "Je décris l'unité de façon structurée (identité, statut, coordonnées)." },
          { niveau: 'expert', description: "Je décris l'unité et je la situe dans le réseau de la marque." },
        ],
      },
      {
        id: 'c2',
        intitule: 'Distinguer les biens et les services proposés',
        indicateurs: [
          { niveau: 'novice', description: "Je ne connais pas l'offre de la concession." },
          { niveau: 'debrouille', description: "Je cite un ou deux éléments de l'offre." },
          { niveau: 'averti', description: 'Je distingue clairement les biens et les services.' },
          { niveau: 'expert', description: 'Je relie chaque élément de l\'offre à un besoin client.' },
        ],
      },
      {
        id: 'c3',
        intitule: "Situer les acteurs dans l'organisation",
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas qui fait quoi dans la concession.' },
          { niveau: 'debrouille', description: "Je place une ou deux personnes dans l'organigramme." },
          { niveau: 'averti', description: "Je place chaque personne et sa fonction dans l'organigramme." },
          { niveau: 'expert', description: 'J\'explique les liens hiérarchiques entre les services.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Unite commerciale', definition: "Lieu physique ou virtuel où un client peut accéder à une offre de biens et de services." },
      { terme: 'Filiale', definition: "Entreprise détenue et contrôlée par une autre entreprise, la société mère." },
      { terme: 'Contrat de concession', definition: "Contrat par lequel un commerçant indépendant distribue les produits d'une marque sur un secteur défini." },
      { terme: 'Bien', definition: "Produit matériel et stockable, comme un véhicule ou un accessoire." },
      { terme: 'Service', definition: "Prestation immatérielle réalisée au moment de la demande du client, comme l'entretien ou le dépannage." },
      { terme: 'Organigramme', definition: "Schéma qui représente l'organisation et les liens hiérarchiques entre les personnes d'une entreprise." },
    ],
    flashcards: [
      { recto: "Qu'est-ce qu'une unité commerciale ?", verso: "Un lieu physique ou virtuel où un client peut accéder à une offre de biens et de services." },
      { recto: 'Quel est le statut juridique de la concession Renault Championnet ?', verso: 'Une filiale.' },
      { recto: 'Quel terme désigne le lien entre la concession et la marque Renault ?', verso: 'Un contrat de concession (la concession distribue la marque).' },
      { recto: 'En quelle année la concession a-t-elle été créée ?', verso: 'En 1978.' },
      { recto: 'Quels sont les deux grands types de biens proposés ?', verso: "Les véhicules et les accessoires." },
      { recto: 'Citez deux services proposés par la concession.', verso: "Au choix : recherche de véhicule, entretien, dépannage, location." },
      { recto: 'Quelle est la différence entre un bien et un service ?', verso: "Le bien est matériel et stockable ; le service est immatériel et réalisé au moment de la demande." },
      { recto: 'Qui dirige la concession ?', verso: 'Le directeur (Sergio Polatian).' },
      { recto: "Quel est le rôle d'un commercial véhicules neufs ?", verso: 'Conseiller et vendre les véhicules neufs aux clients.' },
      { recto: 'À quoi sert un organigramme ?', verso: "À représenter l'organisation et les liens hiérarchiques entre les personnes." },
    ],
    quiz: [
      { type: 'unique', question: "Qu'est-ce qu'une unité commerciale ?", options: ["Un lieu d'accès à une offre de biens et de services", 'Une usine de fabrication', 'Un entrepôt de stockage uniquement'], bonne: 0 },
      { type: 'unique', question: 'Quel est le statut juridique de la concession ?', options: ['Une filiale', 'Une association', 'Une entreprise individuelle'], bonne: 0 },
      { type: 'unique', question: 'Quel terme désigne le lien entre la concession et la marque Renault ?', options: ['Un contrat de concession', 'Une location simple', 'Une franchise alimentaire'], bonne: 0 },
      { type: 'unique', question: 'En quelle année la concession a-t-elle été créée ?', options: ['1978', '1998', '2008'], bonne: 0 },
      { type: 'qcm', question: 'Quels sont les biens proposés par la concession ?', options: ['Les véhicules', 'Les accessoires', 'Les produits alimentaires', 'Les vêtements'], bonnes: [0, 1] },
      { type: 'qcm', question: 'Quelles activités trouve-t-on dans la concession ?', options: ['Vente de véhicules neufs', "Vente de véhicules d'occasion", 'Entretien et réparation', 'Production de pneumatiques'], bonnes: [0, 1, 2] },
      { type: 'unique', question: 'Le showroom est ouvert :', options: ['Du lundi au samedi', '7 jours sur 7', 'Le dimanche uniquement'], bonne: 0 },
      { type: 'unique', question: 'Qui dirige la concession ?', options: ['Le directeur', 'Le commercial', "L'assistante de livraison"], bonne: 0 },
      { type: 'trous', texte: 'Un {0} est matériel et stockable, alors qu\'un {1} est immatériel.', reponses: ['bien', 'service'] },
      { type: 'trous', texte: "L'{0} représente l'organisation et les liens {1} de l'entreprise.", reponses: ['organigramme', 'hiérarchiques'] },
    ],
    glisserDeposer: {
      consigne: 'Associez chaque élément à la bonne catégorie.',
      etiquettes: ['Véhicule neuf', "Véhicule d'occasion", 'Service après-vente'],
      zones: [
        { libelle: 'Une Clio neuve achetée en showroom', etiquetteIndex: 0 },
        { libelle: 'Une révision moteur à l\'atelier', etiquetteIndex: 2 },
        { libelle: 'Un Kadjar avec 18 890 km au compteur', etiquetteIndex: 1 },
        { libelle: 'Un diagnostic / réparation', etiquetteIndex: 2 },
        { libelle: 'Un Captur neuf commandé sur catalogue', etiquetteIndex: 0 },
      ],
    },
  },
}

// Registre des contenus disponibles, indexe par identifiant de mission.
// ---------------------------------------------------------------------------
// CONTENU : Renault, mission 2 - La zone de chalandise
// ---------------------------------------------------------------------------
const RENAULT_M2: ContenuMission = {
  travaux: {
    consigne:
      "À partir des ressources fournies, identifiez la provenance des clients, déterminez la zone de chalandise en temps, puis sélectionnez les clients à inviter aux journées portes ouvertes.",
    contexte:
      "Votre responsable M. Prauviste souhaite mettre en place une campagne de communication. Il vous demande d'analyser le lieu de provenance des clients de la concession à partir du fichier clients, car il souhaite informer ceux qui sont à 20 minutes maximum des Journées Portes Ouvertes qui auront lieu le 11 novembre de 10 heures à 20 heures. Votre tuteur M. Yves Jamen souhaite que vous évaluiez, en voiture, la distance en temps qui sépare les clients de la concession.",
    documents: [
      { numero: 1, titre: 'Les explications de M. Prauvit (la zone de chalandise)', images: ['/docs/renault-m2/doc1.jpg'] },
      { numero: 2, titre: 'Les différentes représentations de la zone de chalandise', images: ['/docs/renault-m2/doc2.jpg'] },
      { numero: 3, titre: 'Chèques, relevés d\'identité bancaire et suggestions des clients', images: ['/docs/renault-m2/doc3a.jpg', '/docs/renault-m2/doc3b.jpg', '/docs/renault-m2/doc3c.jpg', '/docs/renault-m2/doc3d.jpg', '/docs/renault-m2/doc3e.jpg'] },
      { numero: 4, titre: 'Tableau d\'arrondis en temps', images: ['/docs/renault-m2/doc4.jpg'] },
      { numero: 5, titre: 'Extrait du fichier client (noms et adresses mail)', images: ['/docs/renault-m2/doc5.jpg'] },
    ],
    competence: {
      groupe: 'Compétence travaillée',
      intitule: 'C.4B.1.1',
      detail: "Identifier, au sein du SIC, les informations internes utiles à l'opération de prospection, les extraire et les analyser.",
    },
    objectifs: [
      'Comprendre la notion de zone de chalandise et ses trois zones (primaire, secondaire, tertiaire).',
      'Identifier la provenance des clients à partir du système d\'information commercial.',
      'Déterminer la zone de chalandise en temps et sélectionner les clients à cibler.',
    ],
    activites: [
      {
        titre: 'Activité 1 — Les éléments de provenance de la clientèle',
        questions: [
          { numero: 1, consigne: 'À partir des chèques, des relevés d\'identité bancaire et des suggestions des clients, complétez le tableau de provenance.', ressources: 'Lire les documents 1, 2 et 3, compléter l\'annexe 1.', annexeId: 'annexe1' },
        ],
      },
      {
        titre: 'Activité 2 — La détermination de la zone de chalandise : en temps',
        questions: [
          { numero: 2, consigne: 'Retrouvez et notez l\'adresse de la concession Renault.', ressources: 'Compléter l\'annexe 2.', annexeId: 'annexe2' },
          { numero: 3, consigne: 'Complétez le tableau en inscrivant les nom et prénom des clients, calculez la distance en temps (Google Maps) puis arrondissez à la dizaine supérieure.', ressources: 'Lire le document 4, compléter l\'annexe 3.', annexeId: 'annexe3' },
        ],
      },
      {
        titre: 'Activité 3 — La construction de la zone de chalandise',
        questions: [
          { numero: 4, consigne: 'Selon vous, quel est l\'avantage pour la concession Renault de connaître d\'où viennent ses clients ?', ressources: 'Compléter l\'annexe 4.', annexeId: 'annexe4' },
        ],
      },
      {
        titre: 'Activité 4 — Sélectionner les clients',
        questions: [
          { numero: 5, consigne: 'Indiquez le nom des clients qui recevront l\'invitation (zone primaire ou secondaire et véhicule acheté avant 2015).', ressources: 'Lire l\'annexe 1 et le document 5, compléter l\'annexe 5.', annexeId: 'annexe5' },
        ],
      },
    ],
    annexes: [
      { type: 'grille', id: 'annexe1', titre: 'Annexe 1 — Provenance des clients de la concession', colonnes: ['Nom et prénom', 'Adresse', 'Téléphone', 'Produit acheté', 'Année'], nbLignes: 17 },
      { type: 'tableau', id: 'annexe2', titre: 'Annexe 2 — Adresse de la concession', lignes: [{ id: 'adr', libelle: 'Adresse de la concession' }] },
      { type: 'grille', id: 'annexe3', titre: 'Annexe 3 — Calcul de la distance en temps', colonnes: ['Nom', 'Prénom', 'Distance en km', 'Distance en minutes', 'Arrondi (dizaine sup.)'], nbLignes: 17 },
      { type: 'texte', id: 'annexe4', titre: 'Annexe 4 — Avantage pour Renault', lignes: 3 },
      { type: 'grille', id: 'annexe5', titre: 'Annexe 5 — Le nom des bénéficiaires de l\'invitation', colonnes: ['Nom des clients bénéficiaires'], nbLignes: 4 },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: 'Compléter le tableau de provenance des clients (annexe 1).',
        documents: ['Documents 1, 2 et 3'],
        bareme: 5,
        reponse:
          "Tableau à compléter avec les 17 clients (nom et prénom, adresse avec le temps de trajet, téléphone, produit acheté, année). Les informations proviennent des chèques, des RIB et des suggestions du document 3.",
      },
      {
        intitule: "Retrouver l'adresse de la concession (annexe 2).",
        documents: ['Annexe 2'],
        bareme: 1,
        reponse: '215 rue Championnet, 75018 Paris.',
      },
      {
        intitule: 'Compléter nom/prénom, calculer le temps et arrondir (annexe 3).',
        documents: ['Document 4', 'Google Maps'],
        bareme: 8,
        reponse:
          "Temps puis arrondi par client : Hutte 18→20, Tar 16→20, Huze 4→10, Aurialle 7→10, Hamour 25→30, Zion 20→20, Rhaves 8→10, Dupont 10→10, Quilau 15→20, Bon 6→10, Bambel 4→10, Dubois 24→30, Anssieux 7→10, Auchon 18→20, Hémoi 27→30, Hique 6→10, Dejeu 4→10.",
      },
      {
        intitule: 'Avantage de connaître la provenance des clients (annexe 4).',
        documents: ['Annexe 4'],
        bareme: 2,
        reponse:
          "Connaître la provenance des clients permet de construire la zone de chalandise de la concession, donc de cibler la communication (ici les journées portes ouvertes) sur les clients les plus proches et de mieux orienter les actions commerciales.",
      },
      {
        intitule: 'Sélectionner les bénéficiaires de l\'invitation (annexe 5).',
        documents: ['Annexe 1', 'Document 5'],
        bareme: 4,
        reponse:
          "Règle : zone primaire ou secondaire ET véhicule acheté avant 2015. Seuls deux clients remplissent les deux conditions : Eva Zion (zone secondaire, véhicule acheté en 2010) et Éric Dupont (zone primaire, véhicule acheté en 2006).",
      },
    ],
  },
  synthese: {
    titre: 'La zone de chalandise',
    proposition: ['Les chèques', 'Les R.I.B.', 'En temps (courbes isochrones)', 'En distance (courbes isométriques)', 'La zone primaire', 'La zone tertiaire'],
    racine: {
      id: 'racine',
      texte: 'La zone de chalandise',
      enfants: [
        {
          id: 'provenance', texte: '3 éléments de provenance',
          enfants: [
            { id: 'pr1', texte: null, reponse: 'Les chèques' },
            { id: 'pr2', texte: null, reponse: 'Les R.I.B.' },
            { id: 'pr3', texte: 'Les suggestions' },
          ],
        },
        {
          id: 'repr', texte: '3 types de représentation',
          enfants: [
            { id: 're1', texte: null, reponse: 'En temps (courbes isochrones)' },
            { id: 're2', texte: null, reponse: 'En distance (courbes isométriques)' },
            { id: 're3', texte: 'En densité de clients ou prospects' },
          ],
        },
        {
          id: 'zones', texte: '3 zones',
          enfants: [
            { id: 'zo1', texte: null, reponse: 'La zone primaire' },
            { id: 'zo2', texte: 'La zone secondaire' },
            { id: 'zo3', texte: null, reponse: 'La zone tertiaire' },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: 'Identifier les éléments de provenance de la clientèle',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas où trouver les informations sur les clients.' },
          { niveau: 'debrouille', description: 'Je relève quelques informations sans les organiser.' },
          { niveau: 'averti', description: 'Je complète le tableau de provenance de façon structurée.' },
          { niveau: 'expert', description: "Je complète le tableau et je justifie l'origine de chaque information (chèque, RIB, suggestion)." },
        ],
      },
      {
        id: 'c2', intitule: 'Déterminer la zone de chalandise en temps',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas calculer le temps de trajet.' },
          { niveau: 'debrouille', description: 'Je calcule quelques temps mais sans les arrondir.' },
          { niveau: 'averti', description: "Je calcule et j'arrondis correctement les temps à la dizaine supérieure." },
          { niveau: 'expert', description: "Je calcule, j'arrondis et je classe chaque client en zone primaire, secondaire ou tertiaire." },
        ],
      },
      {
        id: 'c3', intitule: 'Sélectionner les clients à cibler',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas quels clients retenir.' },
          { niveau: 'debrouille', description: 'Je retiens des clients sans appliquer toutes les conditions.' },
          { niveau: 'averti', description: "J'applique la règle (zone et année du véhicule) pour sélectionner les clients." },
          { niveau: 'expert', description: "J'applique la règle et j'explique pourquoi chaque client est retenu ou écarté." },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Zone de chalandise', definition: "Zone géographique qui entoure l'unité commerciale et dans laquelle se trouvent ses clients et prospects." },
      { terme: 'Zone primaire', definition: "Zone la plus proche de l'unité commerciale, qui comporte la majorité des clients ou prospects." },
      { terme: 'Zone tertiaire', definition: "Zone la plus éloignée de l'unité commerciale, qui comporte un très petit nombre de clients ou prospects." },
      { terme: 'Courbes isochrones', definition: 'Courbes reliant les points situés à un même temps de trajet de l\'unité commerciale.' },
      { terme: 'Courbes isométriques', definition: 'Courbes reliant les points situés à une même distance de l\'unité commerciale.' },
      { terme: 'Prospect', definition: 'Client potentiel qui n\'a pas encore acheté mais que l\'entreprise cherche à conquérir.' },
    ],
    flashcards: [
      { recto: "Qu'est-ce qu'une zone de chalandise ?", verso: "La zone géographique qui entoure l'unité commerciale et dans laquelle se trouvent ses clients et ses prospects." },
      { recto: "Quelles sont les trois zones d'une zone de chalandise ?", verso: 'La zone primaire, la zone secondaire et la zone tertiaire.' },
      { recto: "Qu'est-ce que la zone primaire ?", verso: "La zone la plus proche de l'unité commerciale, qui comporte la majorité des clients ou prospects." },
      { recto: "Qu'est-ce que la zone tertiaire ?", verso: "La zone la plus éloignée de l'unité commerciale, qui comporte un très petit nombre de clients ou prospects." },
      { recto: "Quels sont les trois types de représentation d'une zone de chalandise ?", verso: 'En temps (courbes isochrones), en distance (courbes isométriques) et en densité de clients ou prospects.' },
      { recto: "Comment appelle-t-on les courbes d'une représentation en temps ?", verso: 'Les courbes isochrones.' },
      { recto: "Comment appelle-t-on les courbes d'une représentation en distance ?", verso: 'Les courbes isométriques.' },
      { recto: "Quels documents permettent d'identifier la provenance des clients ?", verso: "Les chèques, les relevés d'identité bancaire (RIB) et les suggestions des clients." },
      { recto: 'Que signifie « arrondir le temps à la dizaine supérieure » ?', verso: 'Remplacer la durée par la dizaine de minutes immédiatement au-dessus (par exemple 27 min donne 30 min).' },
      { recto: 'À quoi sert de connaître la zone de chalandise pour une campagne de communication ?', verso: 'À cibler les clients selon leur proximité, par exemple pour inviter aux journées portes ouvertes ceux situés à 20 minutes maximum.' },
    ],
    quiz: [
      { type: 'unique', question: "Qu'est-ce qu'une zone de chalandise ?", options: ["La zone géographique d'où provient la clientèle d'une unité commerciale", 'Le rayon de livraison des marchandises', 'La surface de vente du magasin'], bonne: 0 },
      { type: 'unique', question: 'Combien de zones compose une zone de chalandise ?', options: ['Trois', 'Deux', 'Quatre'], bonne: 0 },
      { type: 'unique', question: 'La zone primaire est :', options: ['La plus proche, avec la majorité des clients', 'La plus éloignée, avec peu de clients', 'Une zone sans client'], bonne: 0 },
      { type: 'unique', question: 'La zone tertiaire est :', options: ['La plus éloignée, avec très peu de clients', "La plus proche de l'unité commerciale", 'La zone de stockage'], bonne: 0 },
      { type: 'unique', question: 'Une représentation en temps utilise des courbes :', options: ['Isochrones', 'Isométriques', 'Isobares'], bonne: 0 },
      { type: 'unique', question: 'Une représentation en distance utilise des courbes :', options: ['Isométriques', 'Isochrones', 'Isothermes'], bonne: 0 },
      { type: 'qcm', question: "Quels éléments permettent d'identifier la provenance des clients ?", options: ['Les chèques', 'Les RIB', 'Les suggestions des clients', 'Les bons de commande fournisseurs'], bonnes: [0, 1, 2] },
      { type: 'unique', question: 'Un temps de trajet de 27 minutes arrondi à la dizaine supérieure donne :', options: ['30 minutes', '20 minutes', '25 minutes'], bonne: 0 },
      { type: 'unique', question: "Selon la règle des portes ouvertes, un client est invité s'il est :", options: ['En zone primaire ou secondaire et a un véhicule acheté avant 2015', 'En zone tertiaire uniquement', 'Client depuis moins d\'un an'], bonne: 0 },
      { type: 'unique', question: 'Connaître la provenance des clients permet surtout :', options: ['De construire la zone de chalandise et cibler la communication', 'De fixer le prix des véhicules', 'De recruter des vendeurs'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Associez chaque élément à la bonne catégorie.',
      etiquettes: ['Zone primaire', 'Zone secondaire', 'Zone tertiaire'],
      zones: [
        { libelle: 'Un client situé à 8 minutes de la concession', etiquetteIndex: 0 },
        { libelle: 'Un client situé à 18 minutes de la concession', etiquetteIndex: 1 },
        { libelle: 'Un client situé à 27 minutes de la concession', etiquetteIndex: 2 },
        { libelle: 'Un client situé à 4 minutes de la concession', etiquetteIndex: 0 },
        { libelle: 'Un client situé à 24 minutes de la concession', etiquetteIndex: 2 },
      ],
    },
  },
}


// ---------------------------------------------------------------------------
// CONTENU : Renault, mission 3 - La prise de contact
// ---------------------------------------------------------------------------
const RENAULT_M3: ContenuMission = {
  travaux: {
    consigne:
      "Prenez contact avec les clients sélectionnés par différents canaux : rédigez le courriel d'invitation aux Journées Portes Ouvertes, le SMS de rappel, puis préparez votre accueil en face-à-face (communication non verbale et phrase d'accueil).",
    contexte:
      "Nous sommes le 2 novembre. Votre tuteur est absent et vous laisse une note vous demandant de rédiger le courriel commercial qui sera envoyé aux clients sélectionnés pour les Journées Portes Ouvertes du 11 novembre. Les jours suivants, vous préparerez le SMS de rappel puis l'accueil des clients le jour de l'évènement.",
    documents: [
      { numero: 1, titre: 'Note de M. Prauviste (contenu du courriel)', images: ['/docs/renault-m3/doc1.jpg'] },
      { numero: 2, titre: "Consignes pour la rédaction d'un SMS commercial", images: ['/docs/renault-m3/doc2.jpg'] },
      { numero: 3, titre: "Consignes d'accueil de M. Prauviste", images: ['/docs/renault-m3/doc3.jpg'] },
      { numero: 4, titre: 'Le paralangage (éléments non verbaux et signification)', images: ['/docs/renault-m3/doc4.jpg'] },
    ],
    competence: {
      groupe: 'Groupe de compétences 1',
      intitule: 'Conseiller et vendre',
      detail: 'Prendre contact avec le client.',
    },
    objectifs: [
      'Prendre contact avec le client par différents canaux (courriel, SMS, face-à-face).',
      "Adapter son message et sa communication non verbale à la situation d'accueil.",
    ],
    activites: [
      {
        titre: 'Activité 1 — La rédaction du courriel pour les Journées Portes Ouvertes',
        questions: [
          { numero: 1, consigne: 'Rédigez le courriel destiné aux clients sélectionnés. Vous pouvez le rédiger directement sur l\'annexe 1a, ou en ligne (lien Quizinière / QR code, annexe 1b).', ressources: 'Lire le document 1, compléter l\'annexe 1a.', annexeId: 'annexe1a' },
        ],
      },
      {
        titre: 'Activité 2 — La prise de contact par SMS',
        questions: [
          { numero: 2, consigne: 'Rédigez le SMS destiné aux clients sélectionnés pour rappeler l\'évènement.', ressources: 'Lire le document 2, compléter l\'annexe 2.', annexeId: 'annexe2' },
        ],
      },
      {
        titre: 'Activité 3 — La prise de contact en face-à-face',
        questions: [
          { numero: 3, consigne: 'Pour chaque élément non verbal et sa signification, indiquez la communication que vous adopterez face au client.', ressources: 'Lire les documents 3 et 4, compléter l\'annexe 3.', annexeId: 'annexe3' },
          { numero: 4, consigne: 'Rédigez la phrase d\'accueil que vous prononcerez pour répondre au client.', ressources: 'Lire et compléter l\'annexe 4.', annexeId: 'annexe4' },
        ],
      },
    ],
    annexes: [
      { type: 'mail', id: 'annexe1a', titre: 'Annexe 1a — Rédaction du courriel commercial' },
      { type: 'sms', id: 'annexe2', titre: 'Annexe 2 — Rédaction du SMS', entete: 'RENAULT', date: 'Mar. 10 nov. à 11:15' },
      { type: 'tableau', id: 'annexe3', titre: 'Annexe 3 — La communication non verbale face au client', lignes: [
        { id: 'regard', libelle: 'Regard' },
        { id: 'visage', libelle: 'Expression du visage' },
        { id: 'voix', libelle: 'Timbre de la voix' },
        { id: 'gestes', libelle: 'Gestes' },
        { id: 'posture', libelle: 'Posture' },
      ] },
      { type: 'texte', id: 'annexe4', titre: 'Annexe 4 — Phrase d\'accueil et de prise en charge du client', lignes: 3 },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: 'Le courriel des Journées Portes Ouvertes (annexe 1a).',
        documents: ['Document 1', 'Annexe 1a'],
        bareme: 5,
        reponse:
          "Le courriel comporte les destinataires (clients + dpo@renault.com), un objet accrocheur, le nom de la concession, une phrase d'accroche, la date et l'heure (11 novembre, 10h00), l'adresse (215 rue Championnet, 75018 Paris) et la photo d'un modèle récent.",
      },
      {
        intitule: 'Le SMS de rappel (annexe 2).',
        documents: ['Document 2', 'Annexe 2'],
        bareme: 5,
        reponse:
          "Le SMS contient le nom de l'entreprise, une accroche, la date et l'heure, le site et le numéro de téléphone, et la mention STOP 36321.",
      },
      {
        intitule: 'La communication non verbale (annexe 3).',
        documents: ['Documents 3 et 4', 'Annexe 3'],
        bareme: 5,
        reponse:
          "Regard : franc, orienté vers le client. Expression du visage : sourire franc, yeux grands ouverts (écoute et empathie). Timbre de la voix : respiration maîtrisée, timbre clair, prononciation soignée. Gestes : mouvements amples, maîtrisés et lents, poignée de main appuyée. Posture : dos droit, pieds ancrés, mains contrôlées, regard non fuyant.",
      },
      {
        intitule: 'La phrase d\'accueil (annexe 4).',
        documents: ['Annexe 4'],
        bareme: 5,
        reponse:
          "« Bonjour M. Dupont, bonjour Mme Dupont, comment allez-vous ? Bonjour jeune fille, tu vas bien ? Je vous remercie d'être venus à ces Journées Portes Ouvertes. »",
      },
    ],
  },
  synthese: {
    titre: 'La prise de contact',
    proposition: [
      'Nom de la concession en gros', 'Phrase d\'accroche', 'Date et heure de l\'évènement', 'Photo d\'un modèle récent', 'Adresse de la concession', 'Mails des destinataires', 'Mail entreprise',
      'Nom de l\'entreprise', 'Site et numéro de téléphone', 'STOP au 36321',
      'Regard', 'Expression du visage', 'Timbre de la voix', 'Gestes', 'Posture',
    ],
    racine: {
      id: 'racine',
      texte: 'La prise de contact',
      enfants: [
        {
          id: 'email', texte: 'Règles e-mail',
          enfants: [
            { id: 'em1', texte: null, reponse: 'Nom de la concession en gros' },
            { id: 'em2', texte: null, reponse: 'Phrase d\'accroche' },
            { id: 'em3', texte: null, reponse: 'Date et heure de l\'évènement' },
            { id: 'em4', texte: null, reponse: 'Photo d\'un modèle récent' },
            { id: 'em5', texte: null, reponse: 'Adresse de la concession' },
            { id: 'em6', texte: null, reponse: 'Mails des destinataires' },
            { id: 'em7', texte: null, reponse: 'Mail entreprise' },
          ],
        },
        {
          id: 'sms', texte: 'Règles SMS',
          enfants: [
            { id: 'sm1', texte: null, reponse: 'Nom de l\'entreprise' },
            { id: 'sm2', texte: null, reponse: 'Phrase d\'accroche' },
            { id: 'sm3', texte: null, reponse: 'Date et heure de l\'évènement' },
            { id: 'sm4', texte: null, reponse: 'Site et numéro de téléphone' },
            { id: 'sm5', texte: null, reponse: 'STOP au 36321' },
          ],
        },
        {
          id: 'para', texte: 'Paralangage',
          enfants: [
            { id: 'pa1', texte: null, reponse: 'Regard' },
            { id: 'pa2', texte: null, reponse: 'Expression du visage' },
            { id: 'pa3', texte: null, reponse: 'Timbre de la voix' },
            { id: 'pa4', texte: null, reponse: 'Gestes' },
            { id: 'pa5', texte: null, reponse: 'Posture' },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: 'Rédiger un courriel commercial',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas rédiger un courriel.' },
          { niveau: 'debrouille', description: 'Je rédige un courriel incomplet.' },
          { niveau: 'averti', description: 'Je rédige un courriel structuré avec les informations essentielles.' },
          { niveau: 'expert', description: 'Je rédige un courriel complet, accrocheur et adapté au client.' },
        ],
      },
      {
        id: 'c2', intitule: 'Rédiger un SMS commercial',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas rédiger un SMS de rappel.' },
          { niveau: 'debrouille', description: 'Je rédige un SMS trop long ou incomplet.' },
          { niveau: 'averti', description: 'Je rédige un SMS court contenant l\'essentiel.' },
          { niveau: 'expert', description: 'Je rédige un SMS court, complet et conforme (dont STOP).' },
        ],
      },
      {
        id: 'c3', intitule: 'Adapter sa communication non verbale',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas les éléments du paralangage.' },
          { niveau: 'debrouille', description: 'Je cite un ou deux éléments.' },
          { niveau: 'averti', description: 'J\'associe chaque élément à la bonne attitude.' },
          { niveau: 'expert', description: 'J\'adapte ma communication non verbale à l\'accueil du client.' },
        ],
      },
      {
        id: 'c4', intitule: 'Formuler une phrase d\'accueil',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas accueillir le client.' },
          { niveau: 'debrouille', description: 'Je salue sans personnaliser.' },
          { niveau: 'averti', description: 'Je formule un accueil clair et poli.' },
          { niveau: 'expert', description: 'Je formule un accueil chaleureux et adapté à toute la famille.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Prise de contact', definition: 'Premier échange avec le client, qui doit être positif et professionnel.' },
      { terme: 'SMS', definition: 'Short Message Service : service de messages courts.' },
      { terme: 'Mention STOP', definition: 'Mention (STOP 36321) qui permet au client de ne plus recevoir de messages publicitaires.' },
      { terme: 'Paralangage', definition: 'Ensemble des éléments non verbaux de la communication (regard, voix, gestes, posture, expression).' },
      { terme: 'Communication non verbale', definition: 'Tout ce qui est transmis sans les mots : attitude, regard, gestes, ton de la voix.' },
      { terme: 'Phrase d\'accueil', definition: 'Salutation polie et personnalisée adressée au client à son arrivée.' },
    ],
    flashcards: [
      { recto: 'Qu\'est-ce que la prise de contact ?', verso: 'Le premier échange avec le client, qui doit être positif et professionnel.' },
      { recto: 'Cite trois canaux de prise de contact.', verso: 'Le courriel, le SMS, le face-à-face (le téléphone aussi).' },
      { recto: 'Que signifie SMS ?', verso: 'Short Message Service, service de messages courts.' },
      { recto: 'À quoi sert la mention STOP dans un SMS commercial ?', verso: 'À permettre au client de ne plus recevoir de messages publicitaires.' },
      { recto: 'Que doit contenir un courriel commercial pour les JPO ?', verso: 'Destinataires, objet, accroche, date et heure, adresse, photo d\'un modèle.' },
      { recto: 'Qu\'est-ce que le paralangage ?', verso: 'L\'ensemble des éléments non verbaux de la communication.' },
      { recto: 'Cite deux éléments du paralangage.', verso: 'Au choix : regard, expression du visage, voix, gestes, posture.' },
      { recto: 'Quelle attitude adopter avec le regard ?', verso: 'Un regard franc, orienté vers le client.' },
      { recto: 'Quelle posture traduit la confiance en soi ?', verso: 'Dos droit, pieds ancrés, mains contrôlées, regard non fuyant.' },
      { recto: 'Comment commencer une phrase d\'accueil ?', verso: 'Par une salutation polie et personnalisée (« Bonjour M., bonjour Mme »).' },
    ],
    quiz: [
      { type: 'unique', question: 'Qu\'est-ce que la prise de contact ?', options: ['Le premier échange avec le client', 'La signature du contrat', 'La livraison du véhicule', 'Le service après-vente'], bonne: 0 },
      { type: 'unique', question: 'Que signifie SMS ?', options: ['Short Message Service', 'Service Mobile Sécurisé', 'Système de Messagerie Sociale', 'Service Marketing Spécial'], bonne: 0 },
      { type: 'unique', question: 'À quoi sert la mention STOP dans un SMS commercial ?', options: ['À se désabonner des messages publicitaires', 'À confirmer la commande', 'À obtenir une réduction', 'À contacter le vendeur'], bonne: 0 },
      { type: 'unique', question: 'Quel élément ne doit PAS figurer dans le courriel des JPO ?', options: ['Le prix de reprise de chaque client', 'La date et l\'heure', 'L\'adresse de la concession', 'Une phrase d\'accroche'], bonne: 0 },
      { type: 'unique', question: 'Quelle adresse doit figurer comme expéditeur du courriel ?', options: ['dpo@renault.com', 'contact@gmail.com', 'client@caramail.com', 'info@free.fr'], bonne: 0 },
      { type: 'unique', question: 'Qu\'est-ce que le paralangage ?', options: ['La communication non verbale', 'La langue étrangère', 'Le langage technique', 'Le vocabulaire commercial'], bonne: 0 },
      { type: 'unique', question: 'Quel regard adopter face au client ?', options: ['Un regard franc orienté vers lui', 'Un regard fuyant', 'Un regard fixé sur l\'écran', 'Un regard vers le sol'], bonne: 0 },
      { type: 'unique', question: 'Quelle posture traduit la confiance en soi ?', options: ['Dos droit, pieds ancrés', 'Bras croisés', 'Dos courbé', 'Mains dans les poches'], bonne: 0 },
      { type: 'unique', question: 'Que traduit un sourire franc et des yeux ouverts ?', options: ['L\'écoute et l\'empathie', 'L\'ennui', 'La colère', 'Le mépris'], bonne: 0 },
      { type: 'unique', question: 'Comment débuter une phrase d\'accueil ?', options: ['Par une salutation polie et personnalisée', 'Par le prix du véhicule', 'Par une question fermée', 'Par un reproche'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Associez chaque élément à la bonne catégorie.',
      etiquettes: ['Courriel', 'SMS', 'Communication non verbale'],
      zones: [
        { libelle: 'Objet accrocheur', etiquetteIndex: 0 },
        { libelle: 'Adresse mail des destinataires', etiquetteIndex: 0 },
        { libelle: 'Mention STOP 36321', etiquetteIndex: 1 },
        { libelle: 'Message très court', etiquetteIndex: 1 },
        { libelle: 'Regard franc', etiquetteIndex: 2 },
        { libelle: 'Poignée de main appuyée', etiquetteIndex: 2 },
      ],
    },
  },
}


// ---------------------------------------------------------------------------
// CONTENU : Renault, mission 4 - La découverte des besoins
// ---------------------------------------------------------------------------
const RENAULT_M4: ContenuMission = {
  travaux: {
    consigne:
      "Menez l'entretien de découverte des besoins de la famille Dupont : questionnez le client avec la méthode de l'entonnoir, identifiez ses mobiles et motivations d'achat (SONCASE), puis reformulez ses demandes pour valider votre compréhension.",
    contexte:
      "L'étape de la prise de contact est passée et vous êtes en confiance pour mener l'entretien de vente. Vous commencez par la recherche des besoins afin de pouvoir ensuite prodiguer les meilleurs conseils à la famille Dupont, venue à la concession pour changer de véhicule.",
    documents: [
      { numero: 1, titre: 'Comment connaître les besoins (les types de questions)', images: ['/docs/renault-m4/doc1.jpg'] },
      { numero: 2, titre: "Les mobiles et motivations d'achat (SONCASE)", images: ['/docs/renault-m4/doc2.jpg'] },
      { numero: 3, titre: 'Comment reformuler', images: ['/docs/renault-m4/doc3.jpg'] },
    ],
    competence: {
      groupe: 'Compétence travaillée',
      intitule: 'C.1.2',
      detail: 'Découvrir, analyser et reformuler les besoins du client.',
    },
    objectifs: [
      "Conduire un entretien de découverte des besoins à l'aide d'un questionnement structuré.",
      "Identifier les mobiles et motivations d'achat du client (méthode SONCASE).",
      'Reformuler les besoins pour valider la compréhension avant de proposer un produit.',
    ],
    activites: [
      {
        titre: 'Activité 1 — Le questionnement',
        questions: [
          { numero: 1, consigne: "Questionnez M. Dupont avec la méthode de l'entonnoir (du général au particulier). En fonction des réponses du client, construisez les questions et cochez le type de question dont il s'agit.", ressources: 'Lire le document 1, compléter l\'annexe 1. [C.1.2]', annexeId: 'annexe1' },
        ],
      },
      {
        titre: "Activité 2 — Les mobiles et les motivations d'achat",
        questions: [
          { numero: 2, consigne: "Cochez le ou les mobiles d'achat exprimés par les clients lors du dialogue, puis justifiez en reportant la phrase de M. Dupont.", ressources: 'Lire le document 2, compléter l\'annexe 2. [C.1.2]', annexeId: 'annexe2' },
          { numero: 3, consigne: "Cochez la ou les motivations d'achat exprimées par les clients lors du dialogue, puis justifiez en reportant la phrase de M. Dupont.", ressources: 'Lire le document 2, compléter l\'annexe 3. [C.1.2]', annexeId: 'annexe3' },
        ],
      },
      {
        titre: 'Activité 3 — La reformulation',
        questions: [
          { numero: 4, consigne: "Reformulez toutes les demandes du client en utilisant la reformulation synthèse.", ressources: 'Lire le document 3, compléter l\'annexe 4. [C.1.2]', annexeId: 'annexe4' },
        ],
      },
    ],
    annexes: [
      {
        type: 'dialogue', id: 'annexe1', titre: 'Annexe 1 — Le dialogue de vente', colonnes: ['O', 'F', 'A', 'CM'],
        lignes: [
          { id: 'q1', role: 'question' },
          { id: 'r1', role: 'reponse', texte: "Oui, j'ai un véhicule Renault que j'ai acheté en 2020. Même si je l'aime beaucoup, on aimerait bien la changer rapidement pour un modèle plus récent." },
          { id: 'q2', role: 'question' },
          { id: 'r2', role: 'reponse', texte: "Oui, j'ai regardé un peu sur le site mais j'aime bien me faire une idée en vrai." },
          { id: 'q3', role: 'question' },
          { id: 'r3', role: 'reponse', texte: "On partirait plutôt sur une occasion. La voiture que j'ai actuellement c'en est une et elle est très bien." },
          { id: 'q4', role: 'question' },
          { id: 'r4', role: 'reponse', texte: "Plutôt un véhicule de type citadine pour emmener et aller chercher les enfants à l'école et aller au travail. Ça permettra de réduire les coûts de carburant qui ne cessent d'augmenter. Et le week-end nous allons parfois voir mes beaux-parents en Normandie, à 450 km de Paris ; à ce moment-là nous louerons une voiture. D'ailleurs il faudra qu'on achète un autre kit de sécurité car celui qui est dans ma voiture est complètement déchiré." },
          { id: 'q5', role: 'question' },
          { id: 'r5', role: 'reponse', texte: "Ah non ! À l'époque où nous sommes, il faut penser à la planète, donc pas de voiture essence ni diesel. Donc plutôt électrique. Nous sommes très écolos !" },
          { id: 'q6', role: 'question' },
          { id: 'r6', role: 'reponse', texte: "On a beaucoup réfléchi avec ma femme, on aime bien les voitures françaises, et on aime la marque Renault." },
          { id: 'q7', role: 'question' },
          { id: 'r7', role: 'reponse', texte: "Nous avons vécu 5 ans aux États-Unis et là-bas ce ne sont que des automatiques, donc on a pris l'habitude et je préfère." },
          { id: 'q8', role: 'question' },
          { id: 'r8', role: 'reponse', texte: "Non. On n'a pas vraiment pensé à la couleur." },
          { id: 'q9', role: 'question' },
          { id: 'r9', role: 'reponse', texte: "Nous aimons surtout les couleurs sobres comme le gris, c'est une belle couleur." },
          { id: 'q10', role: 'question' },
          { id: 'r10', role: 'reponse', texte: "Nous savons que ce type de voiture peut coûter cher, donc nous sommes prêts à mettre environ 8 300 € maximum." },
          { id: 'q11', role: 'question' },
          { id: 'r11', role: 'reponse', texte: "Oui, un véhicule de moins de 20 000 km." },
        ],
      },
      {
        type: 'soncase', id: 'annexe2', titre: "Annexe 2 — Mobiles d'achat de la famille Dupont", colonneCoche: "Mobile d'achat", colonneJustif: 'Justification (phrase de M. Dupont)',
        lignes: [
          { id: 's', libelle: 'Sécurité' }, { id: 'o', libelle: 'Orgueil' }, { id: 'n', libelle: 'Nouveauté' },
          { id: 'c', libelle: 'Confort' }, { id: 'a', libelle: 'Argent' }, { id: 'sy', libelle: 'Sympathie' }, { id: 'e', libelle: 'Environnement' },
        ],
      },
      {
        type: 'soncase', id: 'annexe3', titre: "Annexe 3 — Motivations d'achat de la famille Dupont", colonneCoche: 'Motivation', colonneJustif: 'Justification (phrase de M. Dupont)',
        lignes: [
          { id: 'h', libelle: 'Hédoniste' }, { id: 'ob', libelle: 'Oblative' }, { id: 'ae', libelle: 'Auto-expression' },
        ],
      },
      { type: 'texte', id: 'annexe4', titre: 'Annexe 4 — La reformulation synthèse des besoins', lignes: 4 },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: 'Le dialogue de vente et les types de questions (annexe 1).',
        documents: ['Document 1'],
        bareme: 8,
        reponse:
          "Exemples de questions et type attendu : « Je peux vous aider ? » (Ouverte) ; « Vous avez regardé les modèles sur notre site ? » (Fermée) ; « Vous recherchez un véhicule neuf ou d'occasion ? » (Alternative) ; « Pour quelle utilisation ? » (Ouverte) ; « Essence, diesel, électrique ou hybride ? » (Choix multiple) ; « Une marque en particulier ? » (Ouverte) ; « Boîte manuelle ou automatique ? » (Alternative) ; « Avez-vous réfléchi à la couleur ? » (Fermée) ; « Couleurs chaudes ou froides ? » (Alternative) ; « Quel est votre budget ? » (Fermée) ; « D'autres exigences ? » (Fermée).",
      },
      {
        intitule: "Les mobiles d'achat SONCASE (annexe 2).",
        documents: ['Document 2'],
        bareme: 4,
        reponse:
          "Nouveauté : « on aimerait bien la changer rapidement pour un modèle plus récent ». Argent : « ce type de voiture peut coûter cher, donc nous sommes prêts à mettre environ 8 300 € maximum ». Sympathie : « on aime la marque Renault ». Environnement : « il faut penser à la planète, donc plutôt électrique. Nous sommes très écolos ! ».",
      },
      {
        intitule: "Les motivations d'achat (annexe 3).",
        documents: ['Document 2'],
        bareme: 4,
        reponse:
          "Hédoniste et Oblative : « pour emmener et aller chercher les enfants à l'école » et le souhait de changer de voiture pour le couple. L'achat profite à la fois à eux-mêmes (hédoniste) et à leurs enfants (oblative).",
      },
      {
        intitule: 'La reformulation synthèse (annexe 4).',
        documents: ['Document 3'],
        bareme: 4,
        reponse:
          "« Si j'ai bien compris, vous recherchez un véhicule d'occasion électrique de type citadine, de couleur grise, de la marque Renault, avec une boîte automatique et moins de 20 000 km, pour un budget maximum de 8 300 €. C'est bien cela ? »",
      },
    ],
  },
  synthese: {
    titre: 'La découverte des besoins',
    proposition: [
      'Questions ouvertes', 'Questions fermées', 'Questions alternatives', 'Questions à choix multiple',
      'Sécurité', 'Nouveauté', 'Argent', 'Sympathie', 'Environnement',
      'Hédoniste', 'Oblative', 'Auto-expression',
      'Écho ou perroquet', 'Miroir ou reflet', 'Résumé ou synthèse',
    ],
    racine: {
      id: 'racine',
      texte: 'La découverte des besoins',
      enfants: [
        {
          id: 'quest', texte: 'Le questionnement',
          enfants: [
            { id: 'qu1', texte: 'Questions ricochet' },
            { id: 'qu2', texte: null, reponse: 'Questions ouvertes' },
            { id: 'qu3', texte: null, reponse: 'Questions fermées' },
            { id: 'qu4', texte: null, reponse: 'Questions alternatives' },
            { id: 'qu5', texte: null, reponse: 'Questions à choix multiple' },
          ],
        },
        {
          id: 'mob', texte: "Les mobiles et motivations d'achat",
          enfants: [
            { id: 'mo1', texte: 'Les mobiles : SONCASE' },
            { id: 'mo2', texte: null, reponse: 'Hédoniste' },
            { id: 'mo3', texte: null, reponse: 'Oblative' },
            { id: 'mo4', texte: null, reponse: 'Auto-expression' },
          ],
        },
        {
          id: 'refo', texte: 'La reformulation',
          enfants: [
            { id: 'rf1', texte: null, reponse: 'Écho ou perroquet' },
            { id: 'rf2', texte: null, reponse: 'Miroir ou reflet' },
            { id: 'rf3', texte: null, reponse: 'Résumé ou synthèse' },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: 'Questionner le client avec la méthode de l\'entonnoir',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas quelles questions poser.' },
          { niveau: 'debrouille', description: 'Je pose quelques questions sans ordre logique.' },
          { niveau: 'averti', description: 'Je pose des questions du général au particulier et j\'identifie leur type.' },
          { niveau: 'expert', description: 'Je mène un questionnement complet et fluide et je maîtrise tous les types de questions.' },
        ],
      },
      {
        id: 'c2', intitule: 'Identifier les mobiles et motivations d\'achat (SONCASE)',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas la méthode SONCASE.' },
          { niveau: 'debrouille', description: 'Je cite quelques mobiles sans les relier au client.' },
          { niveau: 'averti', description: 'J\'identifie les mobiles exprimés et je les justifie par une phrase du client.' },
          { niveau: 'expert', description: 'J\'identifie tous les mobiles et motivations et je les justifie précisément.' },
        ],
      },
      {
        id: 'c3', intitule: 'Reformuler les besoins du client',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas reformuler.' },
          { niveau: 'debrouille', description: 'Je répète partiellement les propos du client.' },
          { niveau: 'averti', description: 'Je fais une reformulation synthèse reprenant l\'essentiel des besoins.' },
          { niveau: 'expert', description: 'Je fais une reformulation synthèse complète et je vérifie l\'accord du client.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Découverte des besoins', definition: 'Étape de l\'entretien de vente où le commercial cherche à comprendre les attentes du client.' },
      { terme: 'Méthode de l\'entonnoir', definition: 'Technique de questionnement qui part de questions générales pour aller vers le particulier.' },
      { terme: 'Question ouverte', definition: 'Question qui laisse le client s\'exprimer librement.' },
      { terme: 'Question fermée', definition: 'Question qui n\'appelle qu\'une réponse précise (oui/non, un chiffre).' },
      { terme: 'SONCASE', definition: 'Méthode d\'identification des mobiles d\'achat : Sécurité, Orgueil, Nouveauté, Confort, Argent, Sympathie, Environnement.' },
      { terme: 'Mobile d\'achat', definition: 'Raison profonde qui pousse un client à acheter.' },
      { terme: 'Reformulation synthèse', definition: 'Résumé de tout ce que le client a dit, pour vérifier la bonne compréhension.' },
    ],
    flashcards: [
      { recto: 'Qu\'est-ce que la découverte des besoins ?', verso: 'L\'étape de l\'entretien de vente où le commercial cherche à comprendre les attentes du client.' },
      { recto: 'En quoi consiste la méthode de l\'entonnoir ?', verso: 'Commencer par des questions générales pour aller progressivement vers le particulier.' },
      { recto: 'Qu\'est-ce qu\'une question ouverte ?', verso: 'Une question qui laisse le client s\'exprimer librement.' },
      { recto: 'Qu\'est-ce qu\'une question fermée ?', verso: 'Une question qui n\'appelle qu\'une réponse précise : oui/non, un âge, une pointure.' },
      { recto: 'Qu\'est-ce qu\'une question alternative ?', verso: 'Une question qui donne le choix entre deux possibilités.' },
      { recto: 'Que signifie SONCASE ?', verso: 'Sécurité, Orgueil, Nouveauté, Confort, Argent, Sympathie, Environnement.' },
      { recto: 'Qu\'est-ce qu\'un mobile d\'achat ?', verso: 'La raison profonde qui pousse un client à acheter.' },
      { recto: 'Quelle différence entre motivation hédoniste et oblative ?', verso: 'Hédoniste : acheter pour se faire plaisir. Oblative : acheter pour faire plaisir aux autres.' },
      { recto: 'Citez les trois types de reformulation.', verso: 'Écho (perroquet), miroir (reflet), résumé (synthèse).' },
      { recto: 'À quoi sert la reformulation ?', verso: 'À vérifier que le commercial a bien compris tous les besoins avant de proposer un produit.' },
    ],
    quiz: [
      { type: 'unique', question: 'En quoi consiste la méthode de l\'entonnoir ?', options: ['Aller du général au particulier', 'Aller du particulier au général', 'Poser uniquement des questions fermées', 'Ne poser aucune question'], bonne: 0 },
      { type: 'unique', question: 'Une question ouverte sert à :', options: ['Laisser le client s\'exprimer librement', 'Obtenir un oui ou un non', 'Imposer un choix', 'Conclure la vente'], bonne: 0 },
      { type: 'unique', question: '« Vous préférez le neuf ou l\'occasion ? » est une question :', options: ['Alternative', 'Ouverte', 'Fermée', 'Miroir'], bonne: 0 },
      { type: 'unique', question: 'Que signifie le E de SONCASE ?', options: ['Environnement', 'Économie', 'Énergie', 'Esthétique'], bonne: 0 },
      { type: 'unique', question: 'Le mobile « Argent » correspond à :', options: ['Un produit économique, en promotion, payable en plusieurs fois', 'Un produit prestigieux', 'Un produit récent', 'Un produit écologique'], bonne: 0 },
      { type: 'unique', question: '« On aime la marque Renault » traduit le mobile :', options: ['Sympathie', 'Sécurité', 'Orgueil', 'Argent'], bonne: 0 },
      { type: 'unique', question: 'Acheter pour faire plaisir aux autres correspond à une motivation :', options: ['Oblative', 'Hédoniste', 'Auto-expression', 'Sécuritaire'], bonne: 0 },
      { type: 'unique', question: 'La reformulation « perroquet » consiste à :', options: ['Répéter les paroles ou un terme du client', 'Résumer tout l\'entretien', 'Proposer un produit', 'Donner le prix'], bonne: 0 },
      { type: 'unique', question: 'La reformulation synthèse sert à :', options: ['Résumer tous les besoins et vérifier la compréhension', 'Répéter un seul mot', 'Faire une remise', 'Conclure sans valider'], bonne: 0 },
      { type: 'unique', question: 'Pourquoi reformuler avant de proposer un produit ?', options: ['Pour être sûr d\'avoir compris tous les besoins', 'Pour gagner du temps', 'Pour augmenter le prix', 'Pour éviter de questionner'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Associez chaque question à son type.',
      etiquettes: ['Ouverte', 'Fermée', 'Alternative', 'Choix multiple'],
      zones: [
        { libelle: 'Pour quelle utilisation recherchez-vous ce véhicule ?', etiquetteIndex: 0 },
        { libelle: 'Avez-vous déjà regardé sur notre site ?', etiquetteIndex: 1 },
        { libelle: 'Vous préférez le neuf ou l\'occasion ?', etiquetteIndex: 2 },
        { libelle: 'Essence, diesel, électrique ou hybride ?', etiquetteIndex: 3 },
        { libelle: 'Quel est votre budget ?', etiquetteIndex: 1 },
        { libelle: 'Boîte manuelle ou automatique ?', etiquetteIndex: 2 },
      ],
    },
  },
}


// ---------------------------------------------------------------------------
// CONTENU : Renault, mission 5 - Le conseil et la proposition de produit
// ---------------------------------------------------------------------------
const RENAULT_M5: ContenuMission = {
  travaux: {
    consigne:
      "Proposez à la famille Dupont le véhicule adapté à ses besoins : réalisez la fiche produit de deux véhicules, choisissez le plus pertinent, préparez la démonstration et construisez vos arguments avec la méthode C.A.P.",
    contexte:
      "Les clients vous ont confirmé que vous avez bien compris leurs besoins (mission 4). Il est temps de leur proposer des produits correspondants. Vous réalisez la fiche produit de deux véhicules d'occasion, puis vous conseillez celui qui convient le mieux et vous l'argumentez.",
    documents: [
      { numero: 1, titre: 'Comment convaincre le client (méthode C.A.P.)', images: ['/docs/renault-m5/doc1.jpg'] },
    ],
    competence: {
      groupe: 'Compétence travaillée',
      intitule: 'C.1.2',
      detail: 'Conseiller le client en proposant la solution adaptée.',
    },
    objectifs: [
      "Réaliser la fiche produit d'un véhicule (caractéristiques techniques et commerciales).",
      'Choisir et conseiller le produit le plus adapté aux besoins du client.',
      "Construire une argumentation avec la méthode C.A.P. reliée aux mobiles d'achat.",
    ],
    activites: [
      {
        titre: 'Activité 1 — La réalisation de la fiche produit du véhicule',
        questions: [
          { numero: 1, consigne: "À l'aide des fiches techniques et des équipements, complétez les caractéristiques du premier véhicule proposé.", ressources: 'Consulter la fiche du véhicule, compléter les annexes 1 et 2. [C.1.2]', annexeId: 'annexe1' },
          { numero: 2, consigne: 'Réalisez la fiche produit du deuxième véhicule correspondant aux besoins du couple.', ressources: 'Consulter la fiche du véhicule, compléter les annexes 3 et 4. [C.1.2]', annexeId: 'annexe3' },
        ],
      },
      {
        titre: 'Activité 2 — La proposition de produit',
        questions: [
          { numero: 3, consigne: 'Quel est le véhicule le plus approprié ? Justifiez votre réponse au regard des besoins de la famille Dupont.', ressources: "Compléter l'annexe 5. [C.1.2]", annexeId: 'annexe5' },
        ],
      },
      {
        titre: 'Activité 3 — La démonstration',
        questions: [
          { numero: 4, consigne: "Préparez votre démonstration : indiquez ce que vous allez montrer au client pour qu'il s'imagine avec le véhicule (visuels, essai, équipements à présenter).", ressources: "Compléter l'annexe 5 (partie démonstration). [C.1.2]", annexeId: 'annexe5' },
        ],
      },
      {
        titre: "Activité 4 — L'argumentation",
        questions: [
          { numero: 5, consigne: "Construisez les arguments que vous présenterez à la famille Dupont en reliant chaque mobile d'achat à une caractéristique, un avantage et une preuve (méthode C.A.P.).", ressources: 'Lire le document 1, compléter l\'annexe 6. [C.1.2]', annexeId: 'annexe6' },
        ],
      },
    ],
    annexes: [
      {
        type: 'ficheproduit', id: 'annexe1', titre: 'Annexe 1 et 2 — Fiche produit du premier véhicule proposé',
        technique: [
          { id: 'energie', libelle: 'Énergie' }, { id: 'puissance', libelle: 'Puissance fiscale' }, { id: 'transmission', libelle: 'Transmission' },
          { id: 'portes', libelle: 'Portes' }, { id: 'places', libelle: 'Places' }, { id: 'categorie', libelle: 'Catégorie' },
          { id: 'version', libelle: 'Version' }, { id: 'teinte', libelle: 'Teinte' }, { id: 'poids', libelle: 'Poids à vide' },
          { id: 'longueur', libelle: 'Longueur' }, { id: 'motricite', libelle: 'Motricité' }, { id: 'cylindree', libelle: 'Cylindrée' },
        ],
        nbEquipements: 14,
        commercial: [
          { id: 'prix', libelle: 'Prix' }, { id: 'annee', libelle: 'Année' }, { id: 'km', libelle: 'Kilométrage' },
          { id: 'garantie', libelle: 'Garantie' }, { id: 'points', libelle: 'Nombre de points de contrôle' },
          { id: 'assistance', libelle: 'Assistance' }, { id: 'satisfaction', libelle: 'Satisfaction' }, { id: 'controle', libelle: 'Contrôle' },
        ],
      },
      {
        type: 'ficheproduit', id: 'annexe3', titre: 'Annexe 3 et 4 — Fiche produit du deuxième véhicule proposé',
        technique: [
          { id: 'energie', libelle: 'Énergie' }, { id: 'puissance', libelle: 'Puissance fiscale' }, { id: 'transmission', libelle: 'Transmission' },
          { id: 'portes', libelle: 'Portes' }, { id: 'places', libelle: 'Places' }, { id: 'categorie', libelle: 'Catégorie' },
          { id: 'version', libelle: 'Version' }, { id: 'teinte', libelle: 'Teinte' }, { id: 'poids', libelle: 'Poids à vide' },
          { id: 'longueur', libelle: 'Longueur' }, { id: 'motricite', libelle: 'Motricité' }, { id: 'cylindree', libelle: 'Cylindrée' },
        ],
        nbEquipements: 10,
        commercial: [
          { id: 'prix', libelle: 'Prix' }, { id: 'annee', libelle: 'Année' }, { id: 'km', libelle: 'Kilométrage' },
          { id: 'garantie', libelle: 'Garantie' }, { id: 'points', libelle: 'Nombre de points de contrôle' },
          { id: 'assistance', libelle: 'Assistance' }, { id: 'satisfaction', libelle: 'Satisfaction' }, { id: 'controle', libelle: 'Contrôle' },
        ],
      },
      { type: 'texte', id: 'annexe5', titre: 'Annexe 5 — Choix du véhicule, justification et démonstration', lignes: 5 },
      { type: 'cap', id: 'annexe6', titre: 'Annexe 6 — Construction des arguments (méthode C.A.P.)', nbLignes: 4 },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: 'Fiche produit du premier véhicule (annexes 1 et 2).',
        documents: ['Fiche du véhicule (site Renault)'],
        bareme: 5,
        reponse:
          "Caractéristiques techniques (site) : électrique, puissance fiscale 1, automatique, 5 portes, 5 places, citadine, Zoé, teinte grise, poids à vide 1435 kg, longueur 4084 cm, traction avant, cylindrée 0 m3. Caractéristiques commerciales : prix 8 290 € TTC, année 2022, kilométrage 18 343 km, garantie jusqu'à 36 mois, 76 points de contrôle, assistance 24/24h, satisfait ou remboursé, contrôle gratuit après 1 mois.",
      },
      {
        intitule: 'Fiche produit du deuxième véhicule (annexes 3 et 4).',
        documents: ['Fiche du véhicule (site Renault)'],
        bareme: 5,
        reponse:
          "Même modèle (Zoé électrique grise, automatique, 5 portes/places). Caractéristiques commerciales : prix 7 900 € TTC, année 2021, kilométrage 50 218 km, garantie jusqu'à 36 mois, 76 points de contrôle, assistance 24/24h, satisfait ou remboursé, contrôle gratuit après 1 mois.",
      },
      {
        intitule: 'Choix du véhicule le plus pertinent (annexe 5).',
        documents: ['Annexes 1 à 4', 'Besoins mission 4'],
        bareme: 4,
        reponse:
          "Le premier véhicule. Les deux Zoé possèdent la plupart des critères exigés (occasion, électrique, citadine, grise, Renault, automatique), mais le client veut moins de 20 000 km : seul le premier véhicule (18 343 km) respecte ce critère, le second affiche 50 218 km. Le premier est aussi plus récent (2022 contre 2021) et reste dans le budget de 8 300 €.",
      },
      {
        intitule: 'Construction des arguments C.A.P. (annexe 6).',
        documents: ['Document 1'],
        bareme: 6,
        reponse:
          "Nouveauté : caractéristique « modèle de 2022 » → avantage « véhicule récent avec les équipements actuels » → preuve « montrer l'année sur le site ». Argent : « 8 290 € TTC » → « correspond à votre budget maximum » → « montrer le prix sur le site ». Sympathie : « marque Renault » → « une marque française » → « montrer le logo sur le véhicule ». Environnement : « véhicule électrique » → « ne pollue pas et respecte vos convictions écologistes » → « montrer la trappe de recharge ».",
      },
    ],
  },
  synthese: {
    titre: 'Le conseil et la proposition de produit',
    proposition: [
      'Nombre de places', 'Type de moteur', 'Couleur',
      'Prix', 'Garantie', "L'année du véhicule",
      "Mobiles d'achat", 'Caractéristiques', 'Avantages', 'Preuves',
    ],
    racine: {
      id: 'racine',
      texte: 'Le conseil et la proposition de produit',
      enfants: [
        {
          id: 'tech', texte: 'Les caractéristiques techniques',
          enfants: [
            { id: 'te1', texte: null, reponse: 'Nombre de places' },
            { id: 'te2', texte: null, reponse: 'Type de moteur' },
            { id: 'te3', texte: null, reponse: 'Couleur' },
          ],
        },
        {
          id: 'com', texte: 'Les caractéristiques commerciales',
          enfants: [
            { id: 'co1', texte: null, reponse: 'Prix' },
            { id: 'co2', texte: null, reponse: 'Garantie' },
            { id: 'co3', texte: null, reponse: "L'année du véhicule" },
          ],
        },
        {
          id: 'arg', texte: 'Construire un argument (méthode C.A.P.)',
          enfants: [
            { id: 'ar1', texte: null, reponse: "Mobiles d'achat" },
            { id: 'ar2', texte: null, reponse: 'Caractéristiques' },
            { id: 'ar3', texte: null, reponse: 'Avantages' },
            { id: 'ar4', texte: null, reponse: 'Preuves' },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: "Réaliser la fiche produit d'un véhicule",
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas où trouver les caractéristiques du véhicule.' },
          { niveau: 'debrouille', description: 'Je relève quelques caractéristiques sans les classer.' },
          { niveau: 'averti', description: 'Je complète la fiche technique et commerciale du véhicule.' },
          { niveau: 'expert', description: 'Je complète une fiche produit complète et exacte pour chaque véhicule.' },
        ],
      },
      {
        id: 'c2', intitule: 'Choisir le produit adapté aux besoins',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas quel véhicule choisir.' },
          { niveau: 'debrouille', description: 'Je choisis un véhicule sans justifier.' },
          { niveau: 'averti', description: 'Je choisis le bon véhicule et je justifie par un critère.' },
          { niveau: 'expert', description: 'Je choisis le bon véhicule et je justifie au regard de tous les besoins du client.' },
        ],
      },
      {
        id: 'c3', intitule: 'Construire une argumentation C.A.P.',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas la méthode C.A.P.' },
          { niveau: 'debrouille', description: 'Je cite une caractéristique sans avantage ni preuve.' },
          { niveau: 'averti', description: 'Je construis des arguments caractéristique, avantage, preuve.' },
          { niveau: 'expert', description: "Je relie chaque argument C.A.P. à un mobile d'achat du client." },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Fiche produit', definition: 'Document qui présente les caractéristiques techniques et commerciales d\'un produit.' },
      { terme: 'Caractéristique technique', definition: 'Donnée objective sur le produit (énergie, puissance, dimensions, équipements).' },
      { terme: 'Caractéristique commerciale', definition: 'Donnée liée à la vente (prix, année, kilométrage, garantie).' },
      { terme: 'Méthode C.A.P.', definition: 'Caractéristique, Avantage, Preuve : méthode pour construire un argument de vente.' },
      { terme: 'Caractéristique', definition: 'Fait précis et vérifiable sur le produit.' },
      { terme: 'Avantage', definition: 'Ce que la caractéristique apporte concrètement au client.' },
      { terme: 'Preuve', definition: 'Élément qui démontre l\'avantage (démonstration, document, site).' },
    ],
    flashcards: [
      { recto: "Qu'est-ce qu'une fiche produit ?", verso: 'Un document qui présente les caractéristiques techniques et commerciales d\'un produit.' },
      { recto: 'Différence entre caractéristique technique et commerciale ?', verso: 'La technique décrit le produit (moteur, dimensions) ; la commerciale concerne la vente (prix, garantie, année).' },
      { recto: 'Que signifie C.A.P. ?', verso: 'Caractéristique, Avantage, Preuve.' },
      { recto: "Qu'est-ce qu'une caractéristique dans la méthode C.A.P. ?", verso: 'Un fait précis et vérifiable sur le produit.' },
      { recto: "Qu'est-ce qu'un avantage ?", verso: 'Ce que la caractéristique apporte concrètement au client.' },
      { recto: "Qu'est-ce qu'une preuve ?", verso: "L'élément qui démontre l'avantage : démonstration, document, site." },
      { recto: 'Pourquoi relier l\'argument à un mobile d\'achat ?', verso: 'Pour que l\'argument réponde à la motivation réelle du client (SONCASE).' },
      { recto: 'À quoi sert la démonstration ?', verso: "À faire se projeter le client et l'inciter à acheter le véhicule conseillé." },
      { recto: 'Comment choisir le véhicule à proposer ?', verso: 'En comparant les fiches produit aux besoins exprimés par le client.' },
      { recto: 'Citez deux caractéristiques commerciales.', verso: 'Au choix : prix, année, kilométrage, garantie, assistance.' },
    ],
    quiz: [
      { type: 'unique', question: 'Que contient une fiche produit ?', options: ['Les caractéristiques techniques et commerciales', 'Seulement le prix', 'Le nom du vendeur', 'Le planning de livraison'], bonne: 0 },
      { type: 'unique', question: 'Le prix est une caractéristique :', options: ['Commerciale', 'Technique', 'Esthétique', 'Mécanique'], bonne: 0 },
      { type: 'unique', question: 'Le type de moteur est une caractéristique :', options: ['Technique', 'Commerciale', 'Financière', 'Juridique'], bonne: 0 },
      { type: 'unique', question: 'Que signifie le A de C.A.P. ?', options: ['Avantage', 'Argument', 'Accroche', 'Assistance'], bonne: 0 },
      { type: 'unique', question: 'La preuve dans la méthode C.A.P. sert à :', options: ['Démontrer l\'avantage', 'Fixer le prix', 'Choisir la couleur', 'Conclure la vente'], bonne: 0 },
      { type: 'unique', question: 'Un bon argument relie une caractéristique à :', options: ['Un avantage et une preuve', 'Un autre produit', 'Une remise', 'Un concurrent'], bonne: 0 },
      { type: 'unique', question: 'Pourquoi faire une démonstration ?', options: ['Pour faire se projeter le client', 'Pour gagner du temps', 'Pour augmenter le prix', 'Pour éviter d\'argumenter'], bonne: 0 },
      { type: 'unique', question: 'Le mobile d\'achat « Environnement » sera argumenté par :', options: ['Le moteur électrique', 'Le prix bas', 'La marque française', 'La couleur grise'], bonne: 0 },
      { type: 'unique', question: 'Pour choisir le bon véhicule, on le compare :', options: ['Aux besoins du client', 'À la voiture du vendeur', 'Au véhicule le plus cher', 'Au stock disponible'], bonne: 0 },
      { type: 'unique', question: 'Relier l\'argument au mobile d\'achat permet :', options: ['De répondre à la motivation réelle du client', 'De réduire le prix', 'D\'allonger l\'entretien', 'D\'éviter la preuve'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque élément comme caractéristique technique ou commerciale, ou comme étape de la méthode C.A.P.',
      etiquettes: ['Caractéristique technique', 'Caractéristique commerciale', 'Méthode C.A.P.'],
      zones: [
        { libelle: 'Type de moteur', etiquetteIndex: 0 },
        { libelle: 'Nombre de places', etiquetteIndex: 0 },
        { libelle: 'Prix', etiquetteIndex: 1 },
        { libelle: 'Garantie', etiquetteIndex: 1 },
        { libelle: 'Caractéristique, Avantage, Preuve', etiquetteIndex: 2 },
        { libelle: 'Relier au mobile d\'achat', etiquetteIndex: 2 },
      ],
    },
  },
}


const CONTENUS: Record<string, ContenuMission> = {
  'renault-m1': RENAULT_M1,
  'renault-m2': RENAULT_M2,
  'renault-m3': RENAULT_M3,
  'renault-m4': RENAULT_M4,
  'renault-m5': RENAULT_M5,
}

// Charge le contenu d'une mission, ou undefined si non encore redige.
export function getContenuMission(missionId: string): ContenuMission | undefined {
  return CONTENUS[missionId]
}

// Indique si une mission dispose d'un contenu redige.
export function aContenu(missionId: string): boolean {
  return missionId in CONTENUS
}

// Formate les saisies d'annexes (JSON) d'un travail eleve en texte lisible
// pour l'affichage cote enseignant. Si le contenu n'est pas du JSON d'annexes
// (ancien format texte libre), il est renvoye tel quel.
export function formaterTravail(missionId: string, contenu: string): string {
  if (!contenu || contenu.trim().length === 0) return ''
  let obj: Record<string, string>
  try {
    obj = JSON.parse(contenu)
  } catch {
    return contenu
  }
  if (!obj || typeof obj !== 'object') return contenu
  if (typeof obj._texte === 'string' && Object.keys(obj).length === 1) return obj._texte

  const mission = getContenuMission(missionId)
  const annexes = mission?.travaux.annexes ?? []
  const lignes: string[] = []

  for (const a of annexes) {
    lignes.push(a.titre)
    if (a.type === 'tableau') {
      for (const l of a.lignes) {
        const v = obj[`${a.id}.${l.id}`] ?? ''
        lignes.push(`  ${l.prefixe ?? l.libelle} : ${v}`)
      }
    } else if (a.type === 'horaires') {
      for (const j of a.jours) {
        const v = obj[`${a.id}.${j}`] ?? ''
        lignes.push(`  ${j} : ${v}`)
      }
    } else if (a.type === 'organigramme') {
      for (const c of a.cases) {
        const fonction = obj[`${a.id}.${c.id}.fonction`] ?? ''
        const nom = obj[`${a.id}.${c.id}.nom`] ?? ''
        lignes.push(`  ${fonction} : ${nom}`)
      }
    } else if (a.type === 'grille') {
      lignes.push('  ' + a.colonnes.join(' | '))
      for (let r = 0; r < a.nbLignes; r++) {
        const cells = a.colonnes.map((_, ci) => obj[`${a.id}.r${r}.c${ci}`] ?? '')
        if (cells.some((v) => v.trim().length > 0)) lignes.push('  ' + cells.join(' | '))
      }
    } else if (a.type === 'texte') {
      lignes.push('  ' + (obj[`${a.id}.texte`] ?? ''))
    } else if (a.type === 'mail') {
      lignes.push('  De : ' + (obj[`${a.id}.de`] ?? ''))
      lignes.push('  À : ' + (obj[`${a.id}.a`] ?? ''))
      lignes.push('  Objet : ' + (obj[`${a.id}.objet`] ?? ''))
      lignes.push('  ' + (obj[`${a.id}.corps`] ?? ''))
    } else if (a.type === 'sms') {
      lignes.push('  ' + (obj[`${a.id}.corps`] ?? ''))
    } else if (a.type === 'dialogue') {
      for (const l of a.lignes) {
        if (l.role === 'reponse') {
          lignes.push('  Client : ' + (l.texte ?? ''))
        } else {
          const q = obj[`${a.id}.${l.id}.q`] ?? ''
          const types = a.colonnes.filter((c) => (obj[`${a.id}.${l.id}.${c}`] ?? '') === '1')
          lignes.push('  Vendeur : ' + q + (types.length ? '  [' + types.join(', ') + ']' : ''))
        }
      }
    } else if (a.type === 'soncase') {
      for (const l of a.lignes) {
        const coche = (obj[`${a.id}.${l.id}.coche`] ?? '') === '1' ? 'X' : '-'
        const j = obj[`${a.id}.${l.id}.j`] ?? ''
        lignes.push(`  [${coche}] ${l.libelle} : ${j}`)
      }
    } else if (a.type === 'ficheproduit') {
      lignes.push('  Fiche technique :')
      for (const l of a.technique) lignes.push(`    ${l.libelle} : ${obj[`${a.id}.t.${l.id}`] ?? ''}`)
      lignes.push('  Équipements :')
      for (let i = 0; i < a.nbEquipements; i++) { const v = obj[`${a.id}.e.${i}`] ?? ''; if (v.trim()) lignes.push(`    - ${v}`) }
      lignes.push('  Caractéristiques commerciales :')
      for (const l of a.commercial) lignes.push(`    ${l.libelle} : ${obj[`${a.id}.c.${l.id}`] ?? ''}`)
    } else if (a.type === 'cap') {
      lignes.push('  Mobile | Caractéristique | Avantage | Preuve')
      for (let r = 0; r < a.nbLignes; r++) {
        const cells = ['mobile', 'carac', 'avantage', 'preuve'].map((k) => obj[`${a.id}.r${r}.${k}`] ?? '')
        if (cells.some((v) => v.trim())) lignes.push('  ' + cells.join(' | '))
      }
    }
    lignes.push('')
  }
  const txt = lignes.join('\n').trim()
  return txt.length > 0 ? txt : contenu
}
