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
  boutonLien?: string // URL ouverte par un bouton (le lien n'apparait jamais en clair)
  boutonLibelle?: string // libelle du bouton (ex : Voir la video de demonstration)
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

// Fiche produit : interface logiciel pro a 3 onglets (technique, equipements,
// commercial), tout en champs saisissables par l'eleve.
export interface AnnexeFicheProduit {
  type: 'ficheproduit'
  id: string
  titre: string
  technique: string[] // libelles des lignes techniques (Energie, Portes...)
  nbEquipements: number // nombre de lignes equipement a saisir
  commercial: string[] // libelles des lignes commerciales (Prix, Annee...)
}

// Tableau methode C.A.P. a 4 colonnes (Mobile / Caracteristique / Avantage / Preuve).
export interface AnnexeCap {
  type: 'cap'
  id: string
  titre: string
  nbLignes: number
}

// Configurateur : simulateur de recherche de vehicule a branchements.
// L'eleve avance etape par etape ; certaines options menent a une impasse,
// le bon chemin mene a l'ecran resultat. Chemin complet enregistre.
export interface OptionConfigurateur {
  libelle: string
  // etape suivante a afficher (id) ; 'resultat' = vehicules trouves ;
  // 'impasse' = aucun vehicule disponible.
  vers: string
}
export interface EtapeConfigurateur {
  id: string
  bandeau: string // titre de section (ex : TYPES, PRIX)
  question: string
  options: OptionConfigurateur[]
}
export interface VehiculeResultat {
  nom: string // ex : RENAULT ZOE
  version: string // ex : Zoe Gris - Electrique - Automatique
  details: string // ex : 18 343 km - 2022
  prix: string // ex : 8 290 EUR TTC
}
export interface AnnexeConfigurateur {
  type: 'configurateur'
  id: string
  titre: string
  intro: string
  etapes: EtapeConfigurateur[]
  resultatTitre: string // ex : 2 vehicules disponibles
  vehicules: VehiculeResultat[]
  impasseTexte: string // ex : Aucun vehicule correspondant...
}

// Dialogue de vente : bulles client (texte fixe) alternees avec questions
// vendeur a saisir, chacune accompagnee de cases a cocher (colonnes, ex O/F/A/CM).
export interface AnnexeDialogue {
  type: 'dialogue'
  id: string
  titre: string
  colonnes: string[] // en-tetes des cases a cocher (ex : O, F, A, CM)
  tours: { role: 'vendeur' | 'client'; texte?: string }[]
}

// Tableau typologie SONCAS : libelle de ligne fixe + case a cocher + justification.
export interface AnnexeSonCase {
  type: 'soncase'
  id: string
  titre: string
  colonneCoche: string // en-tete de la colonne de coche (ex : Mobile exprime)
  colonneJustif: string // en-tete de la colonne justification
  lignes: { id: string; libelle: string }[]
}

export type Annexe = AnnexeTableau | AnnexeHoraires | AnnexeOrganigramme | AnnexeGrille | AnnexeTexte | AnnexeMail | AnnexeSms | AnnexeFicheProduit | AnnexeCap | AnnexeConfigurateur | AnnexeDialogue | AnnexeSonCase

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
// CONTENU : Renault, mission 4 - La decouverte des besoins
// ---------------------------------------------------------------------------
const RENAULT_M4: ContenuMission = {
  travaux: {
    consigne:
      "Menez l'entretien de découverte des besoins de la famille Dupont : construisez le questionnement, identifiez les mobiles et motivations d'achat, puis reformulez les besoins du client.",
    contexte:
      "L'étape de la prise de contact est passée. Vous êtes en confiance pour mener l'entretien de vente en commençant par la recherche des besoins, afin de prodiguer ensuite les meilleurs conseils à vos clients. Vous recevez M. Dupont, accompagné de sa famille, venu envisager le changement de son véhicule.",
    documents: [
      { numero: 1, titre: 'Comment connaître les besoins (les types de questions)', images: ['/docs/renault-m4/doc1.jpg'] },
      { numero: 2, titre: "Les mobiles et motivations d'achat du client (SONCAS-E)", images: ['/docs/renault-m4/doc2.jpg'] },
      { numero: 3, titre: 'Comment reformuler (les types de reformulation)', images: ['/docs/renault-m4/doc3.jpg'] },
    ],
    competence: {
      groupe: 'Groupe de compétences 1',
      intitule: 'Conseiller et vendre',
      detail: 'Découvrir, analyser et reformuler les besoins du client.',
    },
    objectifs: [
      "Construire un questionnement en entonnoir et identifier le type de chaque question.",
      "Repérer les mobiles d'achat (SONCAS-E) exprimés par le client et les justifier.",
      "Repérer les motivations d'achat du client et les justifier.",
      'Reformuler les besoins du client par la reformulation synthèse.',
    ],
    activites: [
      {
        titre: 'Activité 1 — Le questionnement',
        questions: [
          { numero: 1, consigne: "Questionnez M. Dupont avec la méthode en entonnoir (du général au particulier). En fonction de chaque réponse, construisez la question du vendeur et cochez le type de question dont il s'agit.", ressources: "Lire le document 1, compléter l'annexe 1. [C.1.2]", annexeId: 'annexe1dlg' },
        ],
      },
      {
        titre: "Activité 2 — Les mobiles et les motivations d'achat",
        questions: [
          { numero: 2, consigne: "Cochez le ou les mobiles d'achat exprimés par les clients lors du dialogue, puis justifiez en reportant la phrase de M. Dupont.", ressources: "Lire le document 2, compléter l'annexe 2. [C.1.2]", annexeId: 'annexe2mob' },
          { numero: 3, consigne: "Cochez la ou les motivations d'achat exprimées par les clients lors du dialogue, puis justifiez en reportant la phrase de M. Dupont.", ressources: "Lire le document 2, compléter l'annexe 3. [C.1.2]", annexeId: 'annexe3mot' },
        ],
      },
      {
        titre: 'Activité 3 — La reformulation',
        questions: [
          { numero: 4, consigne: "Reformulez toutes les demandes du client en utilisant la reformulation synthèse.", ressources: "Lire le document 3, compléter l'annexe 4. [C.1.2]", annexeId: 'annexe4ref' },
        ],
      },
    ],
    annexes: [
      {
        type: 'dialogue',
        id: 'annexe1dlg',
        titre: 'Annexe 1 — Le dialogue de vente',
        colonnes: ['O', 'F', 'A', 'CM'],
        tours: [
          { role: 'vendeur' },
          { role: 'client', texte: "Oui, j'ai un véhicule Renault que j'ai acheté en 2020. Même si je l'aime beaucoup, on aimerait bien la changer rapidement pour un modèle plus récent." },
          { role: 'vendeur' },
          { role: 'client', texte: "Oui, j'ai regardé un peu sur le site mais j'aime bien me faire une idée en vrai." },
          { role: 'vendeur' },
          { role: 'client', texte: "On partirait plutôt sur une occasion. La voiture que j'ai actuellement c'en est une et elle est très bien." },
          { role: 'vendeur' },
          { role: 'client', texte: "Plutôt un véhicule de type citadine pour emmener et aller chercher les enfants à l'école et aller au travail. Ça permettra de réduire les coûts de carburant qui ne cessent d'augmenter. Et puis le week-end nous allons parfois voir mes beaux-parents en Normandie, à 450 km de Paris ; à ce moment-là nous louerons une voiture." },
          { role: 'vendeur' },
          { role: 'client', texte: "Ah non ! À l'époque où nous sommes, il faut penser à la planète, donc pas de voiture essence ni diésel. Plutôt électrique. Nous sommes très écolos !" },
          { role: 'vendeur' },
          { role: 'client', texte: "On a beaucoup réfléchi avec ma femme : on aime bien les voitures françaises, et on aime la marque Renault." },
          { role: 'vendeur' },
          { role: 'client', texte: "Nous avons vécu 5 ans aux États-Unis et là-bas ce ne sont que des automatiques, donc on a pris l'habitude et je préfère." },
          { role: 'vendeur' },
          { role: 'client', texte: "Non. On n'a pas vraiment pensé à la couleur." },
          { role: 'vendeur' },
          { role: 'client', texte: "Nous aimons surtout les couleurs sobres comme le gris, c'est une belle couleur." },
          { role: 'vendeur' },
          { role: 'client', texte: "Nous savons que ce type de voiture peut coûter cher, donc nous sommes prêts à mettre environ 8 300 € maximum." },
          { role: 'vendeur' },
          { role: 'client', texte: "Oui, un véhicule de moins de 20 000 km." },
        ],
      },
      {
        type: 'soncase',
        id: 'annexe2mob',
        titre: "Annexe 2 — Mobiles d'achat de la famille Dupont",
        colonneCoche: "Mobile exprimé",
        colonneJustif: "Justification (phrase de M. Dupont)",
        lignes: [
          { id: 'securite', libelle: 'Sécurité' },
          { id: 'orgueil', libelle: 'Orgueil' },
          { id: 'nouveaute', libelle: 'Nouveauté' },
          { id: 'confort', libelle: 'Confort' },
          { id: 'argent', libelle: 'Argent' },
          { id: 'sympathie', libelle: 'Sympathie' },
          { id: 'environnement', libelle: 'Environnement' },
        ],
      },
      {
        type: 'soncase',
        id: 'annexe3mot',
        titre: "Annexe 3 — Les motivations d'achat de la famille Dupont",
        colonneCoche: "Motivation exprimée",
        colonneJustif: "Justification (phrase de M. Dupont)",
        lignes: [
          { id: 'hedoniste', libelle: 'Hédoniste' },
          { id: 'oblative', libelle: 'Oblative' },
          { id: 'autoexpression', libelle: 'Auto-expression' },
        ],
      },
      {
        type: 'texte',
        id: 'annexe4ref',
        titre: 'Annexe 4 — La reformulation synthèse des besoins de la famille Dupont',
        lignes: 5,
      },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: 'Le questionnement (annexe 1).',
        documents: ['Document 1', 'Annexe 1'],
        bareme: 6,
        reponse:
          "Questions attendues (méthode en entonnoir), avec leur type : « Je peux vous aider ? » (Ouverte). « Vous avez regardé les modèles sur notre site ? » (Fermée). « Vous recherchez plutôt un véhicule neuf ou d'occasion ? » (Alternative). « Vous cherchez une voiture pour quelle utilisation ? » (Ouverte). « Vous recherchez plutôt une essence, diésel, électrique ou hybride ? » (Choix multiple). « Vous êtes intéressé par une marque en particulier ? » (Ouverte). « Vous préférez une boîte manuelle ou automatique ? » (Alternative). « Avez-vous réfléchi à la couleur ? » (Fermée). « Vous aimez plutôt les couleurs chaudes ou froides ? » (Alternative). « Quel est votre budget ? » (Fermée). « Avez-vous d'autres exigences ? » (Fermée).",
      },
      {
        intitule: "Les mobiles d'achat (annexe 2).",
        documents: ['Document 2', 'Annexe 2'],
        bareme: 4,
        reponse:
          "Nouveauté : « on aimerait bien la changer rapidement pour un modèle plus récent ». Argent : « ce type de voiture peut coûter cher, donc nous sommes prêts à mettre environ 8 300 € maximum ». Sympathie : « on aime la marque Renault ». Environnement : « plutôt électrique, nous sommes très écolos ».",
      },
      {
        intitule: "Les motivations d'achat (annexe 3).",
        documents: ['Document 2', 'Annexe 3'],
        bareme: 3,
        reponse:
          "Hédoniste : l'achat est pour lui et sa femme (« on aimerait bien la changer pour un modèle plus récent »). Oblative : l'achat sert aussi la famille (emmener les enfants à l'école, rendre visite aux beaux-parents). Auto-expression : non exprimée.",
      },
      {
        intitule: 'La reformulation synthèse (annexe 4).',
        documents: ['Document 3', 'Annexe 4'],
        bareme: 4,
        reponse:
          "« Si j'ai bien compris, vous recherchez un véhicule d'occasion électrique de type citadine, gris et de la marque Renault, avec une boîte automatique et moins de 20 000 km, pour un budget maximum de 8 300 €. C'est bien cela ? »",
      },
    ],
  },
  synthese: {
    titre: 'La découverte des besoins',
    proposition: [
      'Questions ouvertes', 'Questions fermées', 'Questions alternatives', 'Questions à choix multiple', 'Questions ricochet', 'Questions miroir',
      'Sécurité', 'Orgueil', 'Nouveauté', 'Confort', 'Argent', 'Sympathie', 'Environnement',
      'Hédoniste', 'Oblative', 'Auto-expression',
      'Écho ou perroquet', 'Miroir ou reflet', 'Résumé ou synthèse',
    ],
    racine: {
      id: 'racine',
      texte: 'La découverte des besoins',
      enfants: [
        {
          id: 'quest', texte: 'Les différents types de question',
          enfants: [
            { id: 'q1', texte: null, reponse: 'Questions ouvertes' },
            { id: 'q2', texte: null, reponse: 'Questions fermées' },
            { id: 'q3', texte: null, reponse: 'Questions alternatives' },
            { id: 'q4', texte: null, reponse: 'Questions à choix multiple' },
            { id: 'q5', texte: null, reponse: 'Questions ricochet' },
            { id: 'q6', texte: null, reponse: 'Questions miroir' },
          ],
        },
        {
          id: 'mob', texte: "Les mobiles d'achat (SONCAS-E)",
          enfants: [
            { id: 'm1', texte: null, reponse: 'Sécurité' },
            { id: 'm2', texte: null, reponse: 'Orgueil' },
            { id: 'm3', texte: null, reponse: 'Nouveauté' },
            { id: 'm4', texte: null, reponse: 'Confort' },
            { id: 'm5', texte: null, reponse: 'Argent' },
            { id: 'm6', texte: null, reponse: 'Sympathie' },
            { id: 'm7', texte: null, reponse: 'Environnement' },
          ],
        },
        {
          id: 'mot', texte: "Les motivations d'achat",
          enfants: [
            { id: 'mo1', texte: null, reponse: 'Hédoniste' },
            { id: 'mo2', texte: null, reponse: 'Oblative' },
            { id: 'mo3', texte: null, reponse: 'Auto-expression' },
          ],
        },
        {
          id: 'ref', texte: 'Les types de reformulation',
          enfants: [
            { id: 'r1', texte: null, reponse: 'Écho ou perroquet' },
            { id: 'r2', texte: null, reponse: 'Miroir ou reflet' },
            { id: 'r3', texte: null, reponse: 'Résumé ou synthèse' },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: 'Construire un questionnement adapté',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas poser de questions au client.' },
          { niveau: 'debrouille', description: 'Je pose quelques questions sans méthode.' },
          { niveau: 'averti', description: "J'applique la méthode en entonnoir." },
          { niveau: 'expert', description: "J'applique la méthode en entonnoir et j'identifie le type de chaque question." },
        ],
      },
      {
        id: 'c2', intitule: "Identifier les mobiles d'achat (SONCAS-E)",
        indicateurs: [
          { niveau: 'novice', description: "Je ne connais pas les mobiles d'achat." },
          { niveau: 'debrouille', description: "Je cite un ou deux mobiles sans justifier." },
          { niveau: 'averti', description: "J'identifie les mobiles exprimés par le client." },
          { niveau: 'expert', description: "J'identifie chaque mobile et je le justifie par une phrase du client." },
        ],
      },
      {
        id: 'c3', intitule: "Identifier les motivations d'achat",
        indicateurs: [
          { niveau: 'novice', description: "Je ne connais pas les motivations d'achat." },
          { niveau: 'debrouille', description: 'Je confonds mobiles et motivations.' },
          { niveau: 'averti', description: "J'identifie les motivations exprimées." },
          { niveau: 'expert', description: "J'identifie chaque motivation et je la justifie." },
        ],
      },
      {
        id: 'c4', intitule: 'Reformuler les besoins du client',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas reformuler.' },
          { niveau: 'debrouille', description: 'Je répète une partie des besoins.' },
          { niveau: 'averti', description: "Je reformule l'essentiel des besoins." },
          { niveau: 'expert', description: 'Je réalise une reformulation synthèse complète et vérifie auprès du client.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Découverte des besoins', definition: "Étape de la vente où le vendeur cherche à connaître les attentes du client." },
      { terme: 'Méthode en entonnoir', definition: "Technique de questionnement qui va des questions générales aux questions précises." },
      { terme: 'Question ouverte', definition: "Question qui laisse le client s'exprimer librement." },
      { terme: 'Question fermée', definition: "Question qui n'appelle qu'une réponse précise (oui/non, un chiffre)." },
      { terme: 'Question alternative', definition: "Question qui propose un choix entre deux possibilités." },
      { terme: "Mobile d'achat", definition: "Motivation profonde qui pousse à acheter (méthode SONCAS-E)." },
      { terme: "Motivation d'achat", definition: "Raison personnelle de l'achat : hédoniste, oblative ou auto-expression." },
      { terme: 'Reformulation', definition: "Reprise des propos du client pour vérifier la bonne compréhension de ses besoins." },
    ],
    flashcards: [
      { recto: "Qu'est-ce que la découverte des besoins ?", verso: "L'étape de la vente où le vendeur cherche à connaître les attentes du client." },
      { recto: "Qu'est-ce que la méthode en entonnoir ?", verso: "Questionner du général au particulier." },
      { recto: 'Donne un exemple de question ouverte.', verso: "« Pour quelle utilisation cherchez-vous une voiture ? »" },
      { recto: 'Donne un exemple de question fermée.', verso: "« Avez-vous réfléchi à la couleur ? »" },
      { recto: 'Donne un exemple de question alternative.', verso: "« Vous préférez une boîte manuelle ou automatique ? »" },
      { recto: 'Que signifie SONCAS-E ?', verso: 'Sécurité, Orgueil, Nouveauté, Confort, Argent, Sympathie, Environnement.' },
      { recto: "Quels mobiles d'achat exprime la famille Dupont ?", verso: 'Nouveauté, Argent, Sympathie, Environnement.' },
      { recto: "Différence entre mobile et motivation d'achat ?", verso: "Le mobile est la raison liée au produit (SONCAS-E) ; la motivation est personnelle (hédoniste, oblative, auto-expression)." },
      { recto: "Qu'est-ce que la reformulation synthèse ?", verso: "Résumer tout ce que le client a dit pour vérifier sa compréhension." },
      { recto: 'Comment introduire une reformulation synthèse ?', verso: "« Si j'ai bien compris… C'est bien cela ? »" },
    ],
    quiz: [
      { type: 'unique', question: "À quoi sert la découverte des besoins ?", options: ['À connaître les attentes du client', 'À signer le contrat', 'À livrer le véhicule', 'À encaisser le paiement'], bonne: 0 },
      { type: 'unique', question: "Qu'est-ce que la méthode en entonnoir ?", options: ['Questionner du général au particulier', 'Parler sans écouter', 'Poser une seule question', 'Commencer par le prix'], bonne: 0 },
      { type: 'unique', question: 'Quelle est une question ouverte ?', options: ['« Pour quelle utilisation ? »', '« Oui ou non ? »', '« Manuelle ou automatique ? »', '« Avez-vous un budget ? »'], bonne: 0 },
      { type: 'unique', question: 'Quelle est une question alternative ?', options: ['« Neuf ou occasion ? »', '« Pourquoi ? »', '« Quelle utilisation ? »', '« Décrivez vos besoins »'], bonne: 0 },
      { type: 'unique', question: 'Que signifie le « N » de SONCAS-E ?', options: ['Nouveauté', 'Nature', 'Nécessité', 'Nominal'], bonne: 0 },
      { type: 'unique', question: "Quel mobile d'achat correspond à « nous sommes très écolos » ?", options: ['Environnement', 'Argent', 'Orgueil', 'Sécurité'], bonne: 0 },
      { type: 'unique', question: "Quel mobile correspond à « on aime la marque Renault » ?", options: ['Sympathie', 'Sécurité', 'Nouveauté', 'Confort'], bonne: 0 },
      { type: 'unique', question: "Quelle motivation d'achat signifie « acheter pour faire plaisir aux autres » ?", options: ['Oblative', 'Hédoniste', 'Auto-expression', 'Sécuritaire'], bonne: 0 },
      { type: 'unique', question: 'Quel type de reformulation résume tout le discours du client ?', options: ['Résumé ou synthèse', 'Écho ou perroquet', 'Miroir ou reflet', 'Question ricochet'], bonne: 0 },
      { type: 'unique', question: 'Comment introduire une reformulation synthèse ?', options: ["« Si j'ai bien compris… »", '« Combien ? »', '« Oui ou non ? »', '« Au revoir »'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque élément dans la bonne catégorie.',
      etiquettes: ['Type de question', "Mobile d'achat", 'Type de reformulation'],
      zones: [
        { libelle: 'Ouverte', etiquetteIndex: 0 },
        { libelle: 'Alternative', etiquetteIndex: 0 },
        { libelle: 'Environnement', etiquetteIndex: 1 },
        { libelle: 'Sympathie', etiquetteIndex: 1 },
        { libelle: 'Écho ou perroquet', etiquetteIndex: 2 },
        { libelle: 'Résumé ou synthèse', etiquetteIndex: 2 },
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
      "Réalisez la fiche produit de deux véhicules à l'aide du configurateur Renault, proposez le véhicule le plus adapté aux besoins de la famille Dupont, puis construisez les arguments de vente avec la méthode C.A.P.",
    contexte:
      "Les clients vous ont confirmé que vous avez bien compris leurs besoins (mission 4). Il est donc temps de leur proposer des produits qui y correspondent. Vous allez utiliser le configurateur de recherche de la concession pour identifier les véhicules disponibles, réaliser leur fiche produit, choisir le plus pertinent, en faire la démonstration puis l'argumenter.",
    documents: [
      { numero: 1, titre: 'Comment convaincre le client (méthode C.A.P. et SONCAS-E)', images: ['/docs/renault-m5/doc1.jpg'] },
      { numero: 2, titre: 'Fiche technique du premier véhicule (Renault Zoé Zen)', images: ['/docs/renault-m5/doc2.jpg'] },
      { numero: 3, titre: 'Fiche technique du second véhicule (Renault Zoé Life)', images: ['/docs/renault-m5/doc3.jpg'] },
    ],
    competence: {
      groupe: 'Groupe de compétences 1',
      intitule: 'Conseiller et vendre',
      detail: 'Conseiller le client en proposant la solution adaptée.',
    },
    objectifs: [
      'Traduire les besoins du client en critères de recherche dans un configurateur professionnel.',
      'Réaliser la fiche produit (caractéristiques techniques et commerciales) de chaque véhicule.',
      'Choisir et proposer le véhicule le plus adapté en justifiant son choix.',
      "Construire des arguments de vente avec la méthode C.A.P. et les mobiles d'achat.",
    ],
    activites: [
      {
        titre: 'Activité 1 — La réalisation de la fiche produit du véhicule',
        questions: [
          { numero: 1, consigne: "Utilisez le configurateur Renault en reportant les besoins de la famille Dupont (mission 4, annexe 1) pour faire apparaître les véhicules disponibles, puis réalisez la fiche produit du premier véhicule.", ressources: "Utiliser le configurateur (annexe 1), lire le document 2, compléter l'annexe 1. [C.1.2]", annexeId: 'annexe1cfg' },
          { numero: 2, consigne: 'Réalisez la fiche produit du second véhicule correspondant aux besoins du couple.', ressources: "Lire le document 3, compléter l'annexe 2. [C.1.2]", annexeId: 'annexe2fp' },
        ],
      },
      {
        titre: 'Activité 2 — La proposition de produit',
        questions: [
          { numero: 3, consigne: 'Quel est le véhicule le plus approprié ? Justifiez votre réponse.', ressources: "Comparer les fiches produit, compléter l'annexe 3. [C.1.2]", annexeId: 'annexe3choix' },
        ],
      },
      {
        titre: 'Activité 3 — La démonstration',
        questions: [
          { numero: 4, consigne: "Montrez aux clients quelques secondes de la vidéo du véhicule pour qu'ils se l'imaginent, puis indiquez ce que vous mettez en avant pendant la démonstration.", ressources: 'Visionner la vidéo de démonstration, compléter l\'annexe 4. [C.1.2]', annexeId: 'annexe4demo' },
        ],
      },
      {
        titre: "Activité 4 — L'argumentation",
        questions: [
          { numero: 5, consigne: 'Construisez les 3 arguments que vous présenterez à la famille Dupont en respectant la méthode C.A.P.', ressources: "Lire le document 1, compléter l'annexe 5. [C.1.2]", annexeId: 'annexe5cap' },
        ],
      },
    ],
    annexes: [
      {
        type: 'configurateur',
        id: 'annexe1cfg',
        titre: 'Annexe 1 — Configurateur de recherche de véhicule et fiche produit du premier véhicule',
        intro: "Sélectionnez les critères correspondant aux besoins de la famille Dupont. Une recherche bien ciblée fait apparaître les véhicules disponibles ; un critère mal choisi mène à une impasse.",
        etapes: [
          { id: 'type', bandeau: 'TYPES', question: 'Le type de véhicule', options: [
            { libelle: 'Véhicule neuf', vers: 'categorie' },
            { libelle: "Véhicule d'occasion", vers: 'categorie' },
            { libelle: 'Véhicule de démonstration', vers: 'categorie' },
          ] },
          { id: 'categorie', bandeau: 'CATEGORIES', question: 'La catégorie du véhicule', options: [
            { libelle: '4x4 / SUV / Crossover', vers: 'marque' },
            { libelle: 'Berline / Break', vers: 'marque' },
            { libelle: 'Citadine', vers: 'marque' },
            { libelle: 'Coupé et Cabriolet', vers: 'marque' },
            { libelle: 'Monospace', vers: 'marque' },
            { libelle: 'Utilitaire', vers: 'marque' },
          ] },
          { id: 'marque', bandeau: 'MARQUES', question: 'La marque du véhicule', options: [
            { libelle: 'RENAULT', vers: 'energie' },
            { libelle: 'DACIA', vers: 'energie' },
            { libelle: 'ALFA ROMEO', vers: 'energie' },
            { libelle: 'AUDI', vers: 'energie' },
            { libelle: 'BMW', vers: 'energie' },
            { libelle: 'CITROËN', vers: 'energie' },
          ] },
          { id: 'energie', bandeau: 'ENERGIE', question: "L'énergie du véhicule", options: [
            { libelle: 'Diésel', vers: 'boite' },
            { libelle: 'Essence', vers: 'boite' },
            { libelle: 'GPL', vers: 'boite' },
            { libelle: 'Hybride', vers: 'boite' },
            { libelle: 'Électrique', vers: 'boite' },
          ] },
          { id: 'boite', bandeau: 'BOITE DE VITESSES', question: 'La boîte de vitesses du véhicule', options: [
            { libelle: 'Automatique', vers: 'couleur' },
            { libelle: 'Manuelle', vers: 'couleur' },
          ] },
          { id: 'couleur', bandeau: 'COULEUR', question: 'La couleur du véhicule', options: [
            { libelle: 'Beige', vers: 'prix' },
            { libelle: 'Blanc', vers: 'prix' },
            { libelle: 'Bleu', vers: 'prix' },
            { libelle: 'Bordeaux', vers: 'prix' },
            { libelle: 'Gris', vers: 'prix' },
            { libelle: 'Jaune', vers: 'prix' },
          ] },
          { id: 'prix', bandeau: 'PRIX', question: 'Le budget', options: [
            { libelle: 'Moins de 5 000 €', vers: 'impasse' },
            { libelle: 'Entre 5 001 € et 6 400 €', vers: 'impasse' },
            { libelle: 'Entre 6 400 € et 7 400 €', vers: 'impasse' },
            { libelle: 'Entre 7 400 € et 8 400 €', vers: 'resultat' },
            { libelle: 'Entre 8 400 € et 9 400 €', vers: 'impasse' },
            { libelle: 'Entre 9 400 € et 15 000 €', vers: 'impasse' },
            { libelle: 'Entre 15 000 € et 25 000 €', vers: 'impasse' },
            { libelle: 'Plus de 25 000 €', vers: 'impasse' },
          ] },
        ],
        resultatTitre: '2 véhicules correspondent à votre recherche',
        vehicules: [
          { nom: 'RENAULT ZOE', version: 'Zoé Gris — Électrique — Automatique', details: '18 343 km — 2022', prix: '8 290 € TTC' },
          { nom: 'RENAULT ZOE', version: 'Zoé Gris — Électrique — Automatique', details: '50 218 km — 2021', prix: '7 900 € TTC' },
        ],
        impasseTexte: "Aucun véhicule correspondant à votre recherche n'est disponible. Revenez aux critères et reportez-vous aux besoins exprimés par la famille Dupont (mission 4).",
      },
      {
        type: 'ficheproduit',
        id: 'annexe2fp',
        titre: 'Annexe 2 — Fiche produit du second véhicule',
        technique: ['Énergie', 'Puissance fiscale', 'Transmission', 'Portes', 'Places', 'Catégorie', 'Version', 'Teinte', 'Poids à vide', 'Longueur', 'Motricité', 'Cylindrée'],
        nbEquipements: 10,
        commercial: ['Prix', 'Année', 'Kilométrage', 'Garantie', 'Nombre de points de contrôle', 'Assistance', 'Satisfaction', 'Contrôle'],
      },
      {
        type: 'tableau',
        id: 'annexe3choix',
        titre: 'Annexe 3 — Choix du véhicule le plus pertinent',
        lignes: [
          { id: 'choix', libelle: 'Le véhicule choisi' },
          { id: 'justif', libelle: 'Justification du choix' },
        ],
      },
      {
        type: 'texte',
        id: 'annexe4demo',
        titre: 'Annexe 4 — La démonstration du véhicule',
        lignes: 4,
        boutonLien: 'https://drive.google.com/file/d/1NQMRC263L6EArw3YJVN-WnrWKhv7-Slx/view',
        boutonLibelle: 'Voir la vidéo de démonstration',
      },
      {
        type: 'cap',
        id: 'annexe5cap',
        titre: 'Annexe 5 — Construction des arguments (méthode C.A.P.)',
        nbLignes: 3,
      },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: 'Configurateur et fiche produit du premier véhicule (annexe 1).',
        documents: ['Configurateur', 'Document 2', 'Annexe 1'],
        bareme: 5,
        reponse:
          "Critères à reporter depuis les besoins Dupont (mission 4) : Occasion, Citadine, Renault, Électrique, Automatique, Gris, budget entre 7 400 € et 8 400 €. Cette combinaison fait apparaître 2 véhicules. Fiche produit du véhicule 1 : électrique, 1 CV, automatique, 5 portes, 5 places, citadine, Zoé, grise, 1435 kg, 4084 cm, traction avant, cylindrée 0 m3. Commercial : 8 290 € TTC, 2022, 18 343 km, garantie jusqu'à 36 mois, 76 points de contrôle, assistance 24h/24, satisfait ou remboursé, contrôle gratuit après 1 mois.",
      },
      {
        intitule: 'Fiche produit du second véhicule (annexe 2).',
        documents: ['Document 3', 'Annexe 2'],
        bareme: 5,
        reponse:
          "Véhicule 2 : électrique, 1 CV, automatique, 5 portes, 5 places, citadine, Zoé, grise, 1435 kg, 4084 cm, traction avant, cylindrée 0 m3. Commercial : 7 900 € TTC, 2021, 50 218 km, garantie jusqu'à 36 mois, 76 points de contrôle, assistance 24h/24, satisfait ou remboursé, contrôle gratuit après 1 mois.",
      },
      {
        intitule: 'Choix du véhicule le plus pertinent (annexe 3).',
        documents: ['Annexes 1 et 2', 'Annexe 3'],
        bareme: 4,
        reponse:
          "Le premier véhicule. Les deux véhicules possèdent la plupart des critères exigés par les clients, sauf le kilométrage : les clients veulent une voiture de moins de 20 000 km. Le premier véhicule affiche 18 343 km ; le second 50 218 km. Le premier véhicule est donc le plus adapté.",
      },
      {
        intitule: 'La démonstration (annexe 4).',
        documents: ['Vidéo de démonstration', 'Annexe 4'],
        bareme: 2,
        reponse:
          "L'élève projette la vidéo de démonstration du véhicule retenu et met en avant des éléments concrets : silhouette de citadine, motorisation électrique silencieuse, équipements de confort et de sécurité, afin que les clients se projettent dans l'usage du véhicule.",
      },
      {
        intitule: "Construction des arguments avec la méthode C.A.P. (annexe 5).",
        documents: ['Document 1', 'Annexe 5'],
        bareme: 4,
        reponse:
          "Trois arguments attendus reliant un mobile d'achat, une caractéristique, un avantage et une preuve. Exemples : Nouveauté — Modèle de 2022 — équipements d'un modèle récent — montrer l'année sur le site. Argent — 8 290 € TTC — correspond au budget maximum — montrer le prix sur le site. Sympathie — Renault — marque française — montrer le logo. Environnement — Électrique — véhicule non polluant conforme aux convictions écologistes — montrer la trappe de recharge.",
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
      texte: 'Les caractéristiques du produit',
      enfants: [
        {
          id: 'tech', texte: 'Les caractéristiques techniques',
          enfants: [
            { id: 't1', texte: null, reponse: 'Nombre de places' },
            { id: 't2', texte: null, reponse: 'Type de moteur' },
            { id: 't3', texte: null, reponse: 'Couleur' },
          ],
        },
        {
          id: 'com', texte: 'Les caractéristiques commerciales',
          enfants: [
            { id: 'c1', texte: null, reponse: 'Prix' },
            { id: 'c2', texte: null, reponse: 'Garantie' },
            { id: 'c3', texte: null, reponse: "L'année du véhicule" },
          ],
        },
        {
          id: 'arg', texte: 'Argumenter (méthode C.A.P. et SONCAS-E)',
          enfants: [
            { id: 'a1', texte: null, reponse: "Mobiles d'achat" },
            { id: 'a2', texte: null, reponse: 'Caractéristiques' },
            { id: 'a3', texte: null, reponse: 'Avantages' },
            { id: 'a4', texte: null, reponse: 'Preuves' },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: 'Réaliser la fiche produit d\'un véhicule',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas où trouver les caractéristiques du véhicule.' },
          { niveau: 'debrouille', description: 'Je complète une partie de la fiche produit.' },
          { niveau: 'averti', description: 'Je complète les caractéristiques techniques et commerciales.' },
          { niveau: 'expert', description: 'Je réalise une fiche produit complète et exacte pour chaque véhicule.' },
        ],
      },
      {
        id: 'c2', intitule: 'Utiliser le configurateur à partir des besoins du client',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas traduire les besoins en critères.' },
          { niveau: 'debrouille', description: 'Je sélectionne quelques critères au hasard.' },
          { niveau: 'averti', description: 'Je reporte la plupart des besoins du client.' },
          { niveau: 'expert', description: 'Je traduis tous les besoins du client et fais apparaître les véhicules adaptés.' },
        ],
      },
      {
        id: 'c3', intitule: 'Choisir et proposer le véhicule le plus adapté',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas comparer les véhicules.' },
          { niveau: 'debrouille', description: 'Je choisis sans justifier.' },
          { niveau: 'averti', description: 'Je choisis et donne une justification simple.' },
          { niveau: 'expert', description: 'Je choisis et justifie précisément à partir des besoins du client.' },
        ],
      },
      {
        id: 'c4', intitule: 'Construire un argument avec la méthode C.A.P.',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas la méthode C.A.P.' },
          { niveau: 'debrouille', description: 'Je cite une caractéristique sans la relier au client.' },
          { niveau: 'averti', description: 'Je construis un argument complet (C.A.P.).' },
          { niveau: 'expert', description: "Je construis plusieurs arguments reliés aux mobiles d'achat du client." },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Fiche produit', definition: "Document qui récapitule les caractéristiques techniques et commerciales d'un produit." },
      { terme: 'Caractéristique technique', definition: "Élément lié à la conception du véhicule (énergie, transmission, poids, motricité...)." },
      { terme: 'Caractéristique commerciale', definition: "Élément lié à la vente (prix, année, kilométrage, garantie...)." },
      { terme: 'Méthode C.A.P.', definition: 'Caractéristique, Avantage, Preuve : méthode de construction d\'un argument de vente.' },
      { terme: 'SONCAS-E', definition: "Sept mobiles d'achat : Sécurité, Orgueil, Nouveauté, Confort, Argent, Sympathie, Environnement." },
      { terme: "Mobile d'achat", definition: "Motivation profonde qui pousse un client à acheter." },
      { terme: 'Argument', definition: "Affirmation qui relie une caractéristique du produit à un avantage pour le client, appuyée par une preuve." },
      { terme: 'Configurateur', definition: "Outil de recherche qui sélectionne les véhicules selon des critères choisis." },
    ],
    flashcards: [
      { recto: 'Que contient une fiche produit ?', verso: 'Les caractéristiques techniques et commerciales du véhicule.' },
      { recto: 'Cite trois caractéristiques techniques.', verso: 'Au choix : énergie, transmission, places, poids, longueur, motricité, cylindrée.' },
      { recto: 'Cite trois caractéristiques commerciales.', verso: 'Au choix : prix, année, kilométrage, garantie, points de contrôle, assistance.' },
      { recto: 'Que signifie la méthode C.A.P. ?', verso: 'Caractéristique, Avantage, Preuve.' },
      { recto: 'Que signifie SONCAS-E ?', verso: 'Sécurité, Orgueil, Nouveauté, Confort, Argent, Sympathie, Environnement.' },
      { recto: "Qu'est-ce qu'un mobile d'achat ?", verso: 'La motivation profonde qui pousse un client à acheter.' },
      { recto: "Quel critère départage les deux Zoé pour la famille Dupont ?", verso: 'Le kilométrage : ils veulent moins de 20 000 km. Le véhicule 1 (18 343 km) convient.' },
      { recto: "À quel mobile d'achat associer l'énergie électrique ?", verso: "À l'Environnement (véhicule non polluant)." },
      { recto: "À quel mobile d'achat associer le prix de 8 290 € ?", verso: "À l'Argent (correspond au budget du client)." },
      { recto: 'Comment apporter la preuve d\'un argument ?', verso: "Par une démonstration, un document ou un chiffre (ex : montrer le prix sur le site)." },
    ],
    quiz: [
      { type: 'unique', question: 'Que contient une fiche produit ?', options: ['Les caractéristiques techniques et commerciales', 'Uniquement le prix', 'Le contrat de vente', "L'adresse du client"], bonne: 0 },
      { type: 'unique', question: 'Laquelle est une caractéristique technique ?', options: ['La motricité', 'Le prix', 'La garantie', 'Le kilométrage'], bonne: 0 },
      { type: 'unique', question: 'Laquelle est une caractéristique commerciale ?', options: ['Le prix', "L'énergie", 'La transmission', 'Le poids à vide'], bonne: 0 },
      { type: 'unique', question: 'Que signifie la méthode C.A.P. ?', options: ['Caractéristique, Avantage, Preuve', 'Client, Achat, Prix', 'Conseil, Argument, Produit', 'Catégorie, Année, Puissance'], bonne: 0 },
      { type: 'unique', question: 'Combien de mobiles d\'achat compte la méthode SONCAS-E ?', options: ['7', '5', '6', '8'], bonne: 0 },
      { type: 'unique', question: 'Le « E » de SONCAS-E correspond à :', options: ['Environnement', 'Économie', 'Énergie', 'Équipement'], bonne: 0 },
      { type: 'unique', question: 'Quel critère départage les deux véhicules pour la famille Dupont ?', options: ['Le kilométrage', 'La couleur', 'La marque', 'Le nombre de portes'], bonne: 0 },
      { type: 'unique', question: 'Quel véhicule proposer à la famille Dupont ?', options: ['Le premier (18 343 km)', 'Le second (50 218 km)', 'Aucun des deux', 'Les deux à la fois'], bonne: 0 },
      { type: 'unique', question: "À quel mobile d'achat relier l'énergie électrique ?", options: ['Environnement', 'Orgueil', 'Sécurité', 'Argent'], bonne: 0 },
      { type: 'unique', question: "Qu'est-ce qu'une preuve dans un argument ?", options: ["L'élément qui démontre l'avantage", 'Le prix du véhicule', 'Le mobile du client', 'La marque du véhicule'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque élément dans la bonne catégorie.',
      etiquettes: ['Caractéristique technique', 'Caractéristique commerciale', "Mobile d'achat (SONCAS-E)"],
      zones: [
        { libelle: 'Énergie électrique', etiquetteIndex: 0 },
        { libelle: 'Traction avant', etiquetteIndex: 0 },
        { libelle: 'Prix 8 290 € TTC', etiquetteIndex: 1 },
        { libelle: 'Garantie 36 mois', etiquetteIndex: 1 },
        { libelle: 'Nouveauté', etiquetteIndex: 2 },
        { libelle: 'Environnement', etiquetteIndex: 2 },
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
    } else if (a.type === 'ficheproduit') {
      lignes.push('  Caractéristiques techniques :')
      a.technique.forEach((t, i) => lignes.push(`    ${t} : ${obj[`${a.id}.t${i}`] ?? ''}`))
      lignes.push('  Équipements :')
      for (let i = 0; i < a.nbEquipements; i++) {
        const v = obj[`${a.id}.e${i}`] ?? ''
        if (v.trim().length > 0) lignes.push(`    - ${v}`)
      }
      lignes.push('  Caractéristiques commerciales :')
      a.commercial.forEach((c, i) => lignes.push(`    ${c} : ${obj[`${a.id}.c${i}`] ?? ''}`))
    } else if (a.type === 'cap') {
      lignes.push("  Mobile d'achat | Caractéristique | Avantage | Preuve")
      for (let r = 0; r < a.nbLignes; r++) {
        const cells = ['mobile', 'carac', 'avantage', 'preuve'].map((c) => obj[`${a.id}.r${r}.${c}`] ?? '')
        if (cells.some((v) => v.trim().length > 0)) lignes.push('  ' + cells.join(' | '))
      }
    } else if (a.type === 'configurateur') {
      const chemin = obj[`${a.id}.chemin`] ?? ''
      lignes.push('  Chemin suivi dans le configurateur : ' + (chemin.length > 0 ? chemin : '(non renseigné)'))
      const issue = obj[`${a.id}.issue`] ?? ''
      if (issue) lignes.push('  Résultat atteint : ' + issue)
      lignes.push('  Fiche produit du premier véhicule :')
      ;['Énergie', 'Puissance fiscale', 'Transmission', 'Portes', 'Places', 'Catégorie', 'Version', 'Teinte', 'Poids à vide', 'Longueur', 'Motricité', 'Cylindrée'].forEach((t, i) => lignes.push(`    ${t} : ${obj[`${a.id}.t${i}`] ?? ''}`))
      lignes.push('    Équipements :')
      for (let i = 0; i < 14; i++) {
        const v = obj[`${a.id}.e${i}`] ?? ''
        if (v.trim().length > 0) lignes.push(`      - ${v}`)
      }
    } else if (a.type === 'dialogue') {
      let qn = 0
      for (const t of a.tours) {
        if (t.role === 'client') {
          lignes.push('  Client : ' + (t.texte ?? ''))
        } else {
          const q = obj[`${a.id}.q${qn}`] ?? ''
          const coches = a.colonnes.filter((c) => (obj[`${a.id}.q${qn}.${c}`] ?? '') === '1')
          lignes.push(`  Vendeur : ${q}` + (coches.length > 0 ? `  [${coches.join(', ')}]` : ''))
          qn++
        }
      }
    } else if (a.type === 'soncase') {
      for (const l of a.lignes) {
        const coche = (obj[`${a.id}.${l.id}.coche`] ?? '') === '1' ? 'X' : '-'
        const justif = obj[`${a.id}.${l.id}.justif`] ?? ''
        lignes.push(`  [${coche}] ${l.libelle} : ${justif}`)
      }
    }
    lignes.push('')
  }
  const txt = lignes.join('\n').trim()
  return txt.length > 0 ? txt : contenu
}
