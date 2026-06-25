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

// Formulaire de saisie facon logiciel de gestion : liste de champs labellises.
// Rendu comme une fiche professionnelle (label + champ), pas de simples rectangles.
export interface AnnexeFormulaire {
  type: 'formulaire'
  id: string
  titre: string
  entete?: string // titre de la fenetre facon logiciel (ex : Fiche entreprise)
  champs: { cle: string; libelle: string; aire?: boolean }[] // aire = zone multiligne
}

// Module de saisie geographique facon logiciel commercial : lignes
// "ville + departement" ajoutables, le departement etant choisi dans une liste.
export interface AnnexeSaisieGeo {
  type: 'saisiegeo'
  id: string
  titre: string
  entete?: string
  departements: string[] // codes proposes dans le menu deroulant
  nbLignesInitiales?: number
}

// Tableau de criteres de segmentation : case a cocher + justification, facon
// grille d'analyse d'un logiciel commercial.
export interface AnnexeCritereSeg {
  type: 'critereseg'
  id: string
  titre: string
  entete?: string
  criteres: string[] // libelles des criteres a evaluer
}

// Editeur de presentation facon PowerPoint : bandeau de miniatures + diapo
// editable. Page de garde avec champs session/date modifiables. Chaque diapo
// a un titre, une consigne, une competence affichee, et des champs a remplir.
export interface DiapoPpt {
  titre: string
  intitule?: string
  competence?: string
  champs?: { cle: string; libelle?: string; lignes?: number }[]
  garde?: boolean
  mentions?: string[]
}
export interface AnnexePowerPoint {
  type: 'powerpoint'
  id: string
  titre: string
  diapos: DiapoPpt[]
}

// Editeur de redaction d'oral facon traitement de texte : sections guidees
// (introduction, plan, developpement, conclusion, remerciements) a rediger,
// avec compteur et trame d'aide. Bouton optionnel vers une ressource.
export interface AnnexeRedactionOral {
  type: 'redactionoral'
  id: string
  titre: string
  sections: { cle: string; libelle: string; aide?: string; lignes?: number }[]
  boutonLien?: string
  boutonLibelle?: string
}

// Procedure / mode operatoire illustre facon page web : etapes numerotees
// avec titre et description, facon tutoriel d'application.
export interface AnnexeModeOperatoire {
  type: 'modeoperatoire'
  id: string
  titre: string
  entete?: string
  etapes: { titre: string; description: string }[]
  boutonLien?: string
  boutonLibelle?: string
}

// Gabarit de courrier postal (publipostage) facon traitement de texte : zones
// expediteur, destinataire, date, objet, corps, signature, a remplir.
export interface AnnexeCourrier {
  type: 'courrier'
  id: string
  titre: string
}

// Fiche d'appel CROC facon logiciel : 4 zones (Contact, Raison, Objectif,
// Conclusion) a rediger.
export interface AnnexeCroc {
  type: 'croc'
  id: string
  titre: string
}

// Fiche contact / prospect facon CRM : sections coordonnees organisation,
// decisionnaire, besoins, resultat, a completer.
export interface AnnexeFicheContact {
  type: 'fichecontact'
  id: string
  titre: string
}

// Tableau de gestion des appels facon logiciel : en-tetes groupes
// (Rappel > 1er/2eme appel, Envoi > Oui/Non, Rappeler > Plus tard/Raisons),
// lignes a saisir. colonnes = structure d'en-tete sur deux niveaux.
export interface AnnexeTableauAppels {
  type: 'tableauappels'
  id: string
  titre: string
  entete?: string
  organisations: string[] // colonne de gauche pre-remplie (organisations a appeler)
}

// Agenda hebdomadaire facon logiciel de prise de rendez-vous : jours + creneaux.
export interface AnnexeAgenda {
  type: 'agenda'
  id: string
  titre: string
  entete?: string
  jours: string[] // ex : Lundi 13, Mardi 14...
  creneaux: string[] // ex : 8h, 9h, ... 18h
}

// Fichier clients facon tableur : colonnes + lignes a completer (saisie libre).
export interface AnnexeFichierClients {
  type: 'fichierclients'
  id: string
  titre: string
  entete?: string
  colonnes: string[]
  nbLignes: number
}

// Tableau de services avec cases a cocher Marchand / Non marchand.
export interface AnnexeCasesServices {
  type: 'casesservices'
  id: string
  titre: string
  entete?: string
  colonnes: string[] // ex : ['Marchand', 'Non marchand']
  nbLignes: number
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

// Identification d'objections : cartes "phrase du client" (fixe) + menu
// deroulant pour qualifier le type (sincere / pretexte).
export interface AnnexeObjections {
  type: 'objections'
  id: string
  titre: string
  options: string[] // choix du menu (ex : Sincère, Prétexte)
  lignes: { id: string; phrase: string }[]
}

// Traitement d'objections : objection fixe + technique imposee (fixe) +
// zone de reponse a saisir.
export interface AnnexeTraitObjections {
  type: 'traitobjections'
  id: string
  titre: string
  lignes: { id: string; objection: string; technique: string }[]
}

// Simulateur de test en ligne a branchements (type Google Form d'eligibilite).
// Ecran d'accueil, puis questions une par une, branchements, ecran resultat.
// Agrandissable en plein ecran. Chemin complet enregistre.
export interface OptionSimulateur {
  libelle: string
  vers: string // id de l'etape suivante (ou d'un ecran resultat)
}
export interface EtapeSimulateur {
  id: string
  bandeau: string
  question: string
  options: OptionSimulateur[]
}
export interface EcranResultatSimulateur {
  id: string
  type: 'ok' | 'ko'
  texte: string
}
export interface AnnexeSimulateur {
  type: 'simulateur'
  id: string
  titre: string
  introTitre: string
  introTexte: string
  introBouton: string
  nbEtapesAffiche: number // pour la barre de progression (ex : 6)
  etapes: EtapeSimulateur[]
  resultats: EcranResultatSimulateur[]
}

// Catalogue d'accessoires facon site marchand pro : compteur, filtres par
// categorie, grille de produits (nom, categorie, prix). L'eleve selectionne
// l'accessoire a proposer (clic) et saisit une justification.
export interface ProduitCatalogue {
  id: string
  nom: string
  categorie: string
  prix: string // ex : 20,50 € TTC
}
export interface AnnexeCatalogue {
  type: 'catalogue'
  id: string
  titre: string
  compteurAffiche: number // ex : 42 (compteur du site)
  categories: string[] // filtres disponibles
  produits: ProduitCatalogue[]
  demandeJustif: string // libelle de la zone de justification
}

export type Annexe = AnnexeTableau | AnnexeHoraires | AnnexeOrganigramme | AnnexeGrille | AnnexeTexte | AnnexeFormulaire | AnnexeSaisieGeo | AnnexeCasesServices | AnnexeCritereSeg | AnnexeCourrier | AnnexeCroc | AnnexeFicheContact | AnnexeTableauAppels | AnnexeAgenda | AnnexeFichierClients | AnnexePowerPoint | AnnexeRedactionOral | AnnexeModeOperatoire | AnnexeMail | AnnexeSms | AnnexeFicheProduit | AnnexeCap | AnnexeConfigurateur | AnnexeDialogue | AnnexeSonCase | AnnexeObjections | AnnexeTraitObjections | AnnexeSimulateur | AnnexeCatalogue

export interface QuestionTravaux {
  numero: number
  consigne: string // ex : Completez l'identite de l'entreprise.
  ressources?: string // ex : Ressource 1, completez l'annexe 1.
  annexeId?: string // annexe rattachee a remplir
  // Bouton optionnel ouvrant une ressource externe (le lien n'apparait jamais
  // en clair). Utilise par AMParis pour consulter les sites de l'entreprise.
  boutonLien?: string
  boutonLibelle?: string
}

export interface ActiviteTravaux {
  titre: string // ex : Activite 1 - L'entreprise et ses produits
  questions: QuestionTravaux[]
}

// Fiche technique d'un vehicule, affichee en plein ecran depuis le catalogue.
// Chaque section regroupe des lignes (libelle + valeur) ou de simples valeurs.
export interface SectionFicheVehicule {
  titre: string // ex : Equipements, Securite
  lignes: { libelle?: string; valeur: string }[] // libelle optionnel (liste simple si absent)
}
export interface VehiculeCatalogue {
  id: string
  nom: string // ex : Citroen C3
  type: string // ex : Citadine
  prix: string // ex : 19 500 euros
  badge?: string // pastille optionnelle (ex : Electrique)
  sections: SectionFicheVehicule[] // contenu de la fiche technique plein ecran
}
export interface CatalogueVehicules {
  titreLogiciel: string // titre de la fenetre facon logiciel concessionnaire
  intro?: string // phrase d'introduction affichee au-dessus des vignettes
  vehicules: VehiculeCatalogue[]
}

// Noeud d'un organigramme : libelle, sous-titre optionnel, teinte de branche
// et enfants (recursif). teinte = cle de couleur (orange, bleu, jaune, vert...).
export interface NoeudOrga {
  libelle: string
  sousTitre?: string
  teinte?: 'tete' | 'bleu' | 'jaune' | 'vert' | 'rose' | 'gris'
  enfants?: NoeudOrga[]
}

export interface BlocDocumentTexte {
  // Un bloc de texte d'un document : titre de section optionnel + paragraphes,
  // et liste optionnelle (puces). Permet d'afficher un document a lire sans image.
  intertitre?: string
  paragraphes?: string[]
  puces?: string[]
  dialogue?: { locuteur?: string; texte: string; italique?: boolean }[]
  tableau?: { colonnes: string[]; lignes: string[][] }
  // CRM consultable facon logiciel professionnel : liste de fiches organisations
  // cliquables (recherche + detail + retour). Le titre de section sert d'entete.
  crm?: { entete?: string; fiches: { nom: string; activite: string; adresse: string; ville: string; telephone: string; email?: string; fax?: string }[] }
  // Organigramme hierarchique affiche facon logiciel : arbre recursif (chaque
  // noeud peut avoir des enfants), couleur par branche, plus une bande
  // transversale optionnelle (ex : le corps professoral). Lecture seule.
  organigramme?: {
    tete: NoeudOrga
    transversal?: string // bande pleine largeur en bas (ex : Le corps professoral)
  }
  // Habillage facon page web riche : quand true, le bloc est encadre avec un
  // bandeau de marque (logo AMParis) et une mise en page de site.
  pageWeb?: boolean
  // Journal d'appels facon logiciel de compte rendu : liste de fiches d'appel
  // (numero appele + reponse + interlocuteur), cliquables avec detail.
  journalAppels?: { entete?: string; appels: { numero: string; reponse: string; interlocuteur?: string }[] }
}
export interface DocumentRessource {
  numero: number // numero affiche (Document 1, 2...)
  titre: string
  images: string[] // chemins des images (depuis /public), une ou plusieurs pages
  // Contenu textuel du document (reproduit mot pour mot), affiche quand il n'y
  // a pas d'image. Sert pour les documents entierement redactionnels.
  texte?: BlocDocumentTexte[]
  // Document interactif de consultation (lecture seule) : catalogue de
  // vehicules cliquables ouvrant chacun une fiche technique en plein ecran.
  // Quand ce champ est present, il remplace l'affichage des images.
  catalogueVehicules?: CatalogueVehicules
}

export interface ContenuTravaux {
  consigne: string // resume court de la mission a realiser
  contexte?: string // contexte professionnel
  videoContexte?: string // lien video pour ecouter le contexte (bouton discret)
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

export interface TableauCorrige {
  colonnes: string[] // en-tetes
  lignes: string[][] // chaque ligne = valeurs alignees sur colonnes
}

export interface QuestionCorrige {
  intitule: string // la question/le travail tel que pose a l'eleve
  documents: string[] // documents a mobiliser pour repondre
  reponse: string // reponse precise attendue (utilisee si pas de tableau)
  bareme: number // points attribues a cette question
  organigramme?: PosteOrganigramme // organigramme corrige (optionnel)
  tableau?: TableauCorrige // si present, la reponse s'affiche sous forme de tableau
  complement?: string // texte court affiche sous le tableau si necessaire
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
        tableau: {
          colonnes: ['Élément', 'Réponse attendue'],
          lignes: [
            ['Dénomination', 'Renault Paris Championnet (RRG, Renault Retail Group)'],
            ["Secteur d'activité", 'Concessionnaire automobile'],
            ['Forme juridique', 'Filiale'],
            ['Année de création', '1978'],
            ['Adresse', '203-215 rue Championnet, 75018 Paris'],
            ['Téléphone', '01 42 28 36 36 ou 01 53 53 60 75 (les deux acceptés)'],
            ['Site internet', 'renault-occasions-paris-championnet.espacevo.fr'],
          ],
        },
      },
      {
        intitule: "Indiquez les horaires d'ouverture de la partie showroom de la concession.",
        documents: ['Ressource 2', 'Annexe 2'],
        bareme: 3,
        reponse:
          "Du lundi au vendredi : 09h-19h.\nSamedi : 09h-18h.\nDimanche : fermé.",
        tableau: {
          colonnes: ['Jour', 'Horaires showroom'],
          lignes: [
            ['Lundi au vendredi', '09h - 19h'],
            ['Samedi', '09h - 18h'],
            ['Dimanche', 'Fermé'],
          ],
        },
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
        tableau: {
          colonnes: ['Catégorie', 'Services'],
          lignes: [
            ['Services disponibles', "Je recherche un véhicule ; j'entretiens mon véhicule ; j'ai besoin d'un dépannage ; je loue un véhicule"],
            ['Entretien et réparation', 'Entretien ; carrosserie / vitrage ; révision ; diagnostic / réparation'],
          ],
        },
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
      { numero: 3, titre: 'Chèques, relevés d\'identité bancaire et suggestions des clients', images: ['/docs/renault-m2/doc3.jpg'] },
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
          { numero: 5, consigne: 'Indiquez le nom des clients qui recevront l\'invitation (zone primaire ou secondaire et véhicule acheté avant 2022).', ressources: 'Lire l\'annexe 1 et le document 5, compléter l\'annexe 5.', annexeId: 'annexe5' },
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
          "Tableau à compléter avec les 17 clients (nom et prénom, adresse avec le temps de trajet, téléphone, produit acheté, année). Les informations proviennent des chèques, des RIB et des suggestions du document 3. Années des achats : Hutte 2023, Tar 2024, Huze 2023, Aurialle 2022, Hamour 2023, Zion 2020, Rhaves 2022, Dupont 2019, Quilau 2023, Bon 2024, Bambel 2025, Dubois 2022, Anssieux 2024, Auchon 2023, Hémoi 2025, Hique 2022, Dejeu 2024.",
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
        tableau: {
          colonnes: ['Client', 'Temps réel (min)', 'Arrondi (dizaine sup.)'],
          lignes: [
            ['Hutte', '18', '20'], ['Tar', '16', '20'], ['Huze', '4', '10'],
            ['Aurialle', '7', '10'], ['Hamour', '25', '30'], ['Zion', '20', '20'],
            ['Rhaves', '8', '10'], ['Dupont', '10', '10'], ['Quilau', '15', '20'],
            ['Bon', '6', '10'], ['Bambel', '4', '10'], ['Dubois', '24', '30'],
            ['Anssieux', '7', '10'], ['Auchon', '18', '20'], ['Hémoi', '27', '30'],
            ['Hique', '6', '10'], ['Dejeu', '4', '10'],
          ],
        },
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
          "Règle : zone primaire ou secondaire ET véhicule acheté avant 2022. Seuls deux clients remplissent les deux conditions : Eva Zion (zone secondaire, véhicule acheté en 2020) et Éric Dupont (zone primaire, véhicule acheté en 2019).",
        tableau: {
          colonnes: ['Bénéficiaire', 'Zone', 'Année du véhicule'],
          lignes: [
            ['Eva Zion', 'Zone secondaire', '2020'],
            ['Éric Dupont', 'Zone primaire', '2019'],
          ],
        },
        complement: "Règle appliquée : zone primaire ou secondaire ET véhicule acheté avant 2022. Seuls ces deux clients remplissent les deux conditions.",
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
      { type: 'unique', question: "Selon la règle des portes ouvertes, un client est invité s'il est :", options: ['En zone primaire ou secondaire et a un véhicule acheté avant 2022', 'En zone tertiaire uniquement', 'Client depuis moins d\'un an'], bonne: 0 },
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
        tableau: {
          colonnes: ['Élément non verbal', 'Attitude à adopter'],
          lignes: [
            ['Regard', 'Franc, orienté vers le client'],
            ['Expression du visage', 'Sourire franc, yeux grands ouverts (écoute et empathie)'],
            ['Timbre de la voix', 'Respiration maîtrisée, timbre clair, prononciation soignée'],
            ['Gestes', 'Mouvements amples, maîtrisés et lents, poignée de main appuyée'],
            ['Posture', 'Dos droit, pieds ancrés, mains contrôlées, regard non fuyant'],
          ],
        },
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
        tableau: {
          colonnes: ['Question du vendeur', 'Type'],
          lignes: [
            ['Je peux vous aider ?', 'Ouverte'],
            ['Vous avez regardé les modèles sur notre site ?', 'Fermée'],
            ['Vous recherchez plutôt un véhicule neuf ou d\'occasion ?', 'Alternative'],
            ['Vous cherchez une voiture pour quelle utilisation ?', 'Ouverte'],
            ['Essence, diésel, électrique ou hybride ?', 'Choix multiple'],
            ['Vous êtes intéressé par une marque en particulier ?', 'Ouverte'],
            ['Boîte manuelle ou automatique ?', 'Alternative'],
            ['Avez-vous réfléchi à la couleur ?', 'Fermée'],
            ['Couleurs chaudes ou froides ?', 'Alternative'],
            ['Quel est votre budget ?', 'Fermée'],
            ['Avez-vous d\'autres exigences ?', 'Fermée'],
          ],
        },
      },
      {
        intitule: "Les mobiles d'achat (annexe 2).",
        documents: ['Document 2', 'Annexe 2'],
        bareme: 4,
        reponse:
          "Nouveauté : « on aimerait bien la changer rapidement pour un modèle plus récent ». Argent : « ce type de voiture peut coûter cher, donc nous sommes prêts à mettre environ 8 300 € maximum ». Sympathie : « on aime la marque Renault ». Environnement : « plutôt électrique, nous sommes très écolos ».",
        tableau: {
          colonnes: ['Mobile exprimé', 'Justification (phrase de M. Dupont)'],
          lignes: [
            ['Nouveauté', '« on aimerait bien la changer rapidement pour un modèle plus récent »'],
            ['Argent', '« nous sommes prêts à mettre environ 8 300 € maximum »'],
            ['Sympathie', '« on aime la marque Renault »'],
            ['Environnement', '« plutôt électrique, nous sommes très écolos »'],
          ],
        },
        complement: "Mobiles non exprimés : Sécurité, Orgueil, Confort.",
      },
      {
        intitule: "Les motivations d'achat (annexe 3).",
        documents: ['Document 2', 'Annexe 3'],
        bareme: 3,
        reponse:
          "Hédoniste : l'achat est pour lui et sa femme (« on aimerait bien la changer pour un modèle plus récent »). Oblative : l'achat sert aussi la famille (emmener les enfants à l'école, rendre visite aux beaux-parents). Auto-expression : non exprimée.",
        tableau: {
          colonnes: ['Motivation', 'Exprimée ?', 'Justification'],
          lignes: [
            ['Hédoniste', 'Oui', "L'achat est pour lui et sa femme (« la changer pour un modèle plus récent »)"],
            ['Oblative', 'Oui', "L'achat sert la famille (emmener les enfants, visiter les beaux-parents)"],
            ['Auto-expression', 'Non', '—'],
          ],
        },
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
        tableau: {
          colonnes: ['Critère / Caractéristique', 'Réponse attendue'],
          lignes: [
            ['Critères du configurateur', 'Occasion, Citadine, Renault, Électrique, Automatique, Gris, budget 7 400-8 400 €'],
            ['Énergie', 'Électrique'], ['Puissance fiscale', '1 CV'], ['Transmission', 'Automatique'],
            ['Portes / Places', '5 / 5'], ['Catégorie', 'Citadine'], ['Version', 'Zoé'], ['Teinte', 'Grise'],
            ['Poids à vide', '1435 kg'], ['Longueur', '4084 cm'], ['Motricité', 'Traction avant'], ['Cylindrée', '0 m3'],
            ['Prix', '8 290 € TTC'], ['Année', '2022'], ['Kilométrage', '18 343 km'], ['Garantie', "Jusqu'à 36 mois"],
          ],
        },
      },
      {
        intitule: 'Fiche produit du second véhicule (annexe 2).',
        documents: ['Document 3', 'Annexe 2'],
        bareme: 5,
        reponse:
          "Véhicule 2 : électrique, 1 CV, automatique, 5 portes, 5 places, citadine, Zoé, grise, 1435 kg, 4084 cm, traction avant, cylindrée 0 m3. Commercial : 7 900 € TTC, 2021, 50 218 km, garantie jusqu'à 36 mois, 76 points de contrôle, assistance 24h/24, satisfait ou remboursé, contrôle gratuit après 1 mois.",
        tableau: {
          colonnes: ['Caractéristique', 'Réponse attendue'],
          lignes: [
            ['Énergie', 'Électrique'], ['Puissance fiscale', '1 CV'], ['Transmission', 'Automatique'],
            ['Portes / Places', '5 / 5'], ['Catégorie', 'Citadine'], ['Version', 'Zoé'], ['Teinte', 'Grise'],
            ['Poids à vide', '1435 kg'], ['Longueur', '4084 cm'], ['Motricité', 'Traction avant'], ['Cylindrée', '0 m3'],
            ['Prix', '7 900 € TTC'], ['Année', '2021'], ['Kilométrage', '50 218 km'], ['Garantie', "Jusqu'à 36 mois"],
          ],
        },
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
        tableau: {
          colonnes: ["Mobile d'achat", 'Caractéristique', 'Avantage', 'Preuve'],
          lignes: [
            ['Nouveauté', 'Modèle de 2022', "Équipements d'un modèle récent", "Montrer l'année sur le site"],
            ['Argent', '8 290 € TTC', 'Correspond au budget maximum', 'Montrer le prix sur le site'],
            ['Sympathie', 'Renault', 'Marque française', 'Montrer le logo'],
            ['Environnement', 'Électrique', 'Véhicule non polluant, conforme aux convictions écologistes', 'Montrer la trappe de recharge'],
          ],
        },
        complement: "Trois arguments suffisent ; ces quatre exemples sont acceptés.",
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

// ---------------------------------------------------------------------------
// CONTENU : Renault, mission 6 - Le traitement des objections (produit et prix)
// ---------------------------------------------------------------------------
const RENAULT_M6: ContenuMission = {
  travaux: {
    consigne:
      "Identifiez le type des objections formulées par M. Dupont, traitez chacune d'elles avec la technique appropriée, puis annoncez le prix du véhicule en respectant les consignes de votre responsable.",
    contexte:
      "Vous avez conseillé la famille Dupont et lui avez proposé le véhicule le plus adapté. Le client émet désormais des objections sur le produit. Vous devez les lever, puis annoncer le prix avec méthode pour conclure sereinement la vente.",
    documents: [
      { numero: 1, titre: 'Les objections (types et techniques de traitement)', images: ['/docs/renault-m6/doc1.jpg'] },
      { numero: 2, titre: "L'app My Renault (gestion à distance du véhicule électrique)", images: ['/docs/renault-m6/doc2.jpg'] },
      { numero: 4, titre: 'Le courriel de votre responsable (annoncer le prix)', images: ['/docs/renault-m6/doc4.jpg'] },
    ],
    competence: {
      groupe: 'Groupe de compétences 1',
      intitule: 'Conseiller et vendre',
      detail: "Traiter les objections du client et présenter le prix.",
    },
    objectifs: [
      "Distinguer une objection sincère d'une objection prétexte.",
      'Traiter une objection avec la technique adaptée.',
      "Annoncer le prix avec empathie et la technique de l'addition.",
    ],
    activites: [
      {
        titre: "Activité 1 — L'identification des objections",
        questions: [
          { numero: 1, consigne: "Pour chaque phrase de M. Dupont, indiquez s'il s'agit d'une objection sincère ou d'une objection prétexte.", ressources: "Lire le document 1, compléter l'annexe 1. [C.1.2]", annexeId: 'annexe1obj' },
        ],
      },
      {
        titre: 'Activité 2 — Le traitement des objections',
        questions: [
          { numero: 2, consigne: "Traitez chaque objection de M. Dupont en utilisant la technique indiquée. Appuyez-vous sur le document 2 pour l'objection liée à l'autonomie et à la recharge.", ressources: "Lire les documents 1 et 2, compléter l'annexe 2. [C.1.2]", annexeId: 'annexe2trait' },
        ],
      },
      {
        titre: "Activité 3 — L'annonce du prix",
        questions: [
          { numero: 3, consigne: "Rédigez l'annonce du prix du véhicule (8 290 €) en respectant les consignes de votre responsable : faire preuve d'empathie puis utiliser la technique de l'addition.", ressources: "Lire le document 4, compléter l'annexe 3. [C.1.2]", annexeId: 'annexe3prix' },
        ],
      },
    ],
    annexes: [
      {
        type: 'objections',
        id: 'annexe1obj',
        titre: 'Annexe 1 — Le type des objections de M. Dupont',
        options: ['Sincère', 'Prétexte'],
        lignes: [
          { id: 'o1', phrase: "Le problème, c'est que mon fils aime bien jouer avec la portière quand on roule." },
          { id: 'o2', phrase: "Bon, écoutez, je vais réfléchir et je reviendrai sûrement plus tard." },
          { id: 'o3', phrase: "Il est dommage qu'en électrique on ne puisse faire que 200 km avec une recharge à 100 % !" },
          { id: 'o4', phrase: "J'ai vu que la recharge atteint 100 % en 3 à 5h, mais devoir vérifier régulièrement, ça risque d'être fastidieux !" },
        ],
      },
      {
        type: 'traitobjections',
        id: 'annexe2trait',
        titre: 'Annexe 2 — Le traitement des objections',
        lignes: [
          { id: 't1', objection: "Mon fils aime bien jouer avec la portière quand on roule.", technique: 'Anticipation' },
          { id: 't2', objection: "Je vais réfléchir et je reviendrai sûrement plus tard.", technique: 'Témoignage' },
          { id: 't3', objection: "En électrique on ne peut faire que 200 km avec une recharge à 100 %.", technique: 'Oui... mais' },
          { id: 't4', objection: "Devoir vérifier régulièrement la recharge, ça risque d'être fastidieux.", technique: 'Affaiblissement' },
        ],
      },
      {
        type: 'texte',
        id: 'annexe3prix',
        titre: "Annexe 3 — L'annonce du prix (empathie + technique de l'addition)",
        lignes: 5,
      },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: "Identifier le type des objections (annexe 1).",
        documents: ['Document 1', 'Annexe 1'],
        bareme: 4,
        reponse:
          "Objection 1 : sincère. Objection 2 : prétexte. Objection 3 : prétexte. Objection 4 : sincère.",
        tableau: {
          colonnes: ['Objection de M. Dupont', 'Type'],
          lignes: [
            ["Mon fils aime jouer avec la portière quand on roule.", 'Sincère'],
            ["Je vais réfléchir et je reviendrai plus tard.", 'Prétexte'],
            ["On ne fait que 200 km avec une recharge à 100 %.", 'Prétexte'],
            ["Vérifier régulièrement la recharge, ça risque d'être fastidieux.", 'Sincère'],
          ],
        },
      },
      {
        intitule: "Traiter les objections avec la technique indiquée (annexe 2).",
        documents: ['Documents 1 et 2', 'Annexe 2'],
        bareme: 8,
        reponse:
          "Traitement attendu par objection et par technique imposée.",
        tableau: {
          colonnes: ['Objection', 'Technique', 'Traitement attendu'],
          lignes: [
            [
              "Mon fils joue avec la portière en roulant.",
              'Anticipation',
              "« Je sais que vous allez me parler de la sécurité des enfants : c'est justement pourquoi ce véhicule dispose de la sécurité enfant qui verrouille les portes arrière. »",
            ],
            [
              "Je vais réfléchir et je reviendrai plus tard.",
              'Témoignage',
              "« Je comprends, c'est une décision importante. Un client dans la même situation la semaine dernière hésitait aussi ; il est reparti avec le modèle et m'a rappelé pour me dire qu'il ne regrettait pas. Profitons-en pendant que vous êtes là tous les deux. »",
            ],
            [
              "On ne fait que 200 km avec une recharge à 100 %.",
              'Oui... mais',
              "« Oui, l'autonomie est de 200 km, mais vous m'avez dit utiliser la voiture pour les trajets quotidiens (école, travail) ; 200 km couvrent largement ces besoins, et pour la Normandie vous louez un véhicule. »",
            ],
            [
              "Vérifier la recharge, c'est fastidieux.",
              'Affaiblissement',
              "« Ce point est en réalité un avantage : avec l'application My Renault, vous suivez l'état de charge et programmez la recharge à distance depuis votre téléphone, sans avoir à vérifier vous-même. »",
            ],
          ],
        },
      },
      {
        intitule: "Annoncer le prix (annexe 3).",
        documents: ['Document 4', 'Annexe 3'],
        bareme: 4,
        reponse:
          "Annonce attendue : empathie puis technique de l'addition (énumérer des avantages forts avant d'annoncer le prix). Exemple : « Je comprends que le budget compte beaucoup pour vous. Avec ce véhicule, vous avez une motorisation électrique économique, une garantie jusqu'à 36 mois, 76 points de contrôle et l'application de gestion à distance. Le tout pour 8 290 € seulement. »",
      },
    ],
  },
  synthese: {
    titre: 'Le traitement des objections',
    proposition: [
      'Objection sincère', 'Objection prétexte',
      'Oui... mais', 'Affaiblissement', 'Témoignage', 'Compensation', 'Anticipation',
      "L'empathie", "La technique de l'addition",
    ],
    racine: {
      id: 'racine',
      texte: "Le traitement des objections et l'annonce du prix",
      enfants: [
        {
          id: 'types', texte: "Les types d'objections",
          enfants: [
            { id: 'ty1', texte: null, reponse: 'Objection sincère' },
            { id: 'ty2', texte: null, reponse: 'Objection prétexte' },
          ],
        },
        {
          id: 'tech', texte: 'Les techniques de traitement',
          enfants: [
            { id: 'te1', texte: null, reponse: 'Oui... mais' },
            { id: 'te2', texte: null, reponse: 'Affaiblissement' },
            { id: 'te3', texte: null, reponse: 'Témoignage' },
            { id: 'te4', texte: null, reponse: 'Compensation' },
            { id: 'te5', texte: null, reponse: 'Anticipation' },
          ],
        },
        {
          id: 'prix', texte: "L'annonce du prix",
          enfants: [
            { id: 'pr1', texte: null, reponse: "L'empathie" },
            { id: 'pr2', texte: null, reponse: "La technique de l'addition" },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: "Distinguer une objection sincère d'un prétexte",
        indicateurs: [
          { niveau: 'novice', description: "Je ne sais pas ce qu'est une objection." },
          { niveau: 'debrouille', description: 'Je repère une objection sans la qualifier.' },
          { niveau: 'averti', description: 'Je distingue la plupart des objections sincères et prétextes.' },
          { niveau: 'expert', description: 'Je qualifie correctement chaque objection.' },
        ],
      },
      {
        id: 'c2', intitule: 'Traiter une objection avec la bonne technique',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas les techniques de traitement.' },
          { niveau: 'debrouille', description: 'Je réponds sans méthode.' },
          { niveau: 'averti', description: "J'applique la technique demandée à la plupart des objections." },
          { niveau: 'expert', description: "J'applique précisément chaque technique et je rassure le client." },
        ],
      },
      {
        id: 'c3', intitule: "Annoncer le prix avec méthode",
        indicateurs: [
          { niveau: 'novice', description: "J'annonce le prix sans préparation." },
          { niveau: 'debrouille', description: 'Je montre un peu d\'empathie.' },
          { niveau: 'averti', description: "J'utilise l'empathie ou la technique de l'addition." },
          { niveau: 'expert', description: "J'utilise l'empathie ET la technique de l'addition." },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Objection', definition: "Frein ou réserve exprimé par le client au cours de la vente." },
      { terme: 'Objection sincère', definition: "Crainte réelle du client, fondée sur une inquiétude ; il a besoin d'être rassuré." },
      { terme: 'Objection prétexte', definition: "Faux motif que le client avance pour fuir l'entretien de vente." },
      { terme: 'Oui... mais', definition: "Donner raison au client puis avancer un argument." },
      { terme: 'Affaiblissement', definition: "Montrer qu'un point perçu comme faible est en réalité un point fort." },
      { terme: 'Témoignage', definition: "Utiliser l'expérience d'un autre client pour rassurer." },
      { terme: 'Compensation', definition: "Montrer que les points forts sont plus nombreux que les points faibles." },
      { terme: 'Anticipation', definition: "Devancer l'objection du client en avançant soi-même l'argument." },
      { terme: "Technique de l'addition", definition: "Énumérer plusieurs avantages forts du produit avant d'annoncer le prix." },
    ],
    flashcards: [
      { recto: "Qu'est-ce qu'une objection sincère ?", verso: "Une crainte réelle du client ; il a besoin d'être rassuré." },
      { recto: "Qu'est-ce qu'une objection prétexte ?", verso: "Un faux motif pour fuir l'entretien de vente." },
      { recto: 'Technique « Oui... mais » ?', verso: "Donner raison au client puis avancer un argument." },
      { recto: "Technique de l'affaiblissement ?", verso: "Transformer un point faible apparent en point fort." },
      { recto: 'Technique du témoignage ?', verso: "S'appuyer sur l'expérience d'un autre client." },
      { recto: 'Technique de la compensation ?', verso: "Montrer que les points forts dépassent les points faibles." },
      { recto: "Technique de l'anticipation ?", verso: "Devancer l'objection en avançant soi-même l'argument." },
      { recto: "Comment annoncer le prix ?", verso: "Avec empathie, puis la technique de l'addition." },
      { recto: "Qu'est-ce que la technique de l'addition ?", verso: "Énumérer des avantages forts avant d'annoncer le prix." },
      { recto: "Quel outil lève l'objection sur la recharge ?", verso: "L'application My Renault (suivi et programmation à distance)." },
    ],
    quiz: [
      { type: 'unique', question: "Une objection sincère, c'est :", options: ['Une crainte réelle du client', 'Un faux motif pour fuir', 'Une question sur le prix', 'Un compliment'], bonne: 0 },
      { type: 'unique', question: "Une objection prétexte, c'est :", options: ['Un faux motif pour fuir', 'Une crainte réelle', 'Une demande de remise', 'Un accord'], bonne: 0 },
      { type: 'unique', question: 'La technique « Oui... mais » consiste à :', options: ['Donner raison puis argumenter', 'Ignorer le client', 'Baisser le prix', 'Changer de sujet'], bonne: 0 },
      { type: 'unique', question: "L'affaiblissement consiste à :", options: ['Transformer un point faible en point fort', 'Affaiblir le client', 'Réduire le prix', 'Réduire la garantie'], bonne: 0 },
      { type: 'unique', question: 'Le témoignage utilise :', options: ["L'expérience d'un autre client", 'Le prix', 'La fiche technique', 'Le contrat'], bonne: 0 },
      { type: 'unique', question: "La compensation consiste à :", options: ['Montrer plus de points forts que de points faibles', 'Offrir un cadeau', 'Annuler la vente', 'Anticiper l\'objection'], bonne: 0 },
      { type: 'unique', question: "L'anticipation consiste à :", options: ["Devancer l'objection du client", 'Attendre la fin', 'Reformuler', 'Conclure'], bonne: 0 },
      { type: 'unique', question: "Pour annoncer le prix, il faut d'abord :", options: ["Faire preuve d'empathie", 'Donner le prix sans rien dire', 'Proposer un crédit', 'Montrer la concurrence'], bonne: 0 },
      { type: 'unique', question: "La technique de l'addition consiste à :", options: ['Énumérer des avantages avant le prix', 'Additionner les options payantes', 'Ajouter une remise', 'Cumuler les objections'], bonne: 0 },
      { type: 'unique', question: "Quel outil rassure sur la recharge à distance ?", options: ['My Renault', 'Google Maps', 'Le configurateur', 'Le contrat'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Associez chaque élément à sa catégorie.',
      etiquettes: ["Type d'objection", 'Technique de traitement', "Annonce du prix"],
      zones: [
        { libelle: 'Sincère', etiquetteIndex: 0 },
        { libelle: 'Prétexte', etiquetteIndex: 0 },
        { libelle: 'Oui... mais', etiquetteIndex: 1 },
        { libelle: 'Témoignage', etiquetteIndex: 1 },
        { libelle: "L'empathie", etiquetteIndex: 2 },
        { libelle: "La technique de l'addition", etiquetteIndex: 2 },
      ],
    },
  },
}

// ---------------------------------------------------------------------------
// CONTENU : Renault, mission 7 - La conclusion de la vente et le financement
// ---------------------------------------------------------------------------
const RENAULT_M7: ContenuMission = {
  travaux: {
    consigne:
      "Repérez les signaux d'achat de la famille Dupont, concluez la vente avec la technique du « joker », calculez le crédit et le montant final après prime à la conversion, puis commentez le résultat.",
    contexte:
      "Le prix a été annoncé et les clients semblent séduits. Vous devez être attentif à tous les signaux d'achat du couple pour repérer le bon moment de conclure, puis proposer un financement réaliste et vérifier que le crédit peut être accordé.",
    documents: [
      { numero: 1, titre: "Les signaux d'achat positifs ou négatifs", images: ['/docs/renault-m7/doc1.jpg'] },
      { numero: 3, titre: 'Comment conclure la vente (techniques de conclusion)', images: ['/docs/renault-m7/doc3.jpg'] },
      { numero: 4, titre: 'La prime à la conversion (pour un véhicule plus propre)', images: ['/docs/renault-m7/doc4a.jpg'] },
      { numero: 5, titre: 'Réponses au test « prime à la conversion »', images: ['/docs/renault-m7/doc5.jpg'] },
      { numero: 6, titre: 'La méthode de calcul du crédit', images: ['/docs/renault-m7/doc6.jpg'] },
      { numero: 7, titre: 'La situation financière de la famille Dupont', images: ['/docs/renault-m7/doc7.jpg'] },
    ],
    competence: {
      groupe: 'Groupe de compétences 1',
      intitule: "Conseiller et vendre",
      detail: "Formaliser l'accord du client et mettre en place les modalités de règlement.",
    },
    objectifs: [
      "Repérer les signaux d'achat verbaux et non verbaux, positifs et négatifs.",
      "Conclure la vente avec la technique du « joker ».",
      'Calculer le crédit (reste à vivre, taux d\'endettement, intérêts).',
      'Déterminer le montant final après la prime à la conversion et commenter.',
    ],
    activites: [
      {
        titre: "Activité 1 — Les signaux d'achat",
        questions: [
          { numero: 1, consigne: "Indiquez les signaux d'achat de M. et Mme Dupont (verbaux et non verbaux, positifs et négatifs).", ressources: "Lire les documents 1 et 2, compléter l'annexe 1. [C.1.2]", annexeId: 'annexe1sig' },
        ],
      },
      {
        titre: 'Activité 2 — Conclure la vente',
        questions: [
          { numero: 2, consigne: "Retrouvez les deux arguments « joker » importants à présenter aux prospects.", ressources: "Lire les documents 3 et 4, compléter l'annexe 2. [C.1.2]", annexeId: 'annexe2joker' },
          { numero: 3, consigne: "Complétez le test « prime à la conversion » avec les informations du couple. Le test est intégré ci-dessous.", ressources: "Lire les documents 4 et 5, compléter le test (annexe 4b). [C.1.2]", annexeId: 'annexe4btest' },
          { numero: 4, consigne: "Rédigez la phrase que vous prononcerez pour annoncer le résultat, en utilisant la conclusion « joker ».", ressources: "Lire le document 3 et l'annexe 2, compléter l'annexe 3. [C.1.2]", annexeId: 'annexe3phrase' },
        ],
      },
      {
        titre: 'Activité 3 — Calculer le crédit',
        questions: [
          { numero: 5, consigne: "Calculez le crédit proposé à M. et Mme Dupont (reste à vivre, reste à vivre minimum, taux d'endettement, intérêts à payer), puis concluez.", ressources: "Lire les documents 6 et 7, compléter l'annexe 4a. [C.1.3]", annexeId: 'annexe4acredit' },
          { numero: 6, consigne: "Calculez le montant que le couple paiera après déduction de la prime à la conversion.", ressources: "Lire le document 5, consulter l'annexe 4, compléter l'annexe 5. [C.1.3]", annexeId: 'annexe5remise' },
          { numero: 7, consigne: "Commentez les résultats trouvés à l'annexe 5.", ressources: "Compléter l'annexe 6. [C.1.3]", annexeId: 'annexe6comm' },
        ],
      },
    ],
    annexes: [
      {
        type: 'grille',
        id: 'annexe1sig',
        titre: "Annexe 1 — Les signaux d'achat",
        colonnes: ['Client', 'Signaux verbaux positifs', 'Signaux verbaux négatifs', 'Signaux non verbaux positifs', 'Signaux non verbaux négatifs'],
        nbLignes: 2,
      },
      {
        type: 'grille',
        id: 'annexe2joker',
        titre: 'Annexe 2 — Les deux arguments « joker »',
        colonnes: ['Les deux arguments « joker »'],
        nbLignes: 2,
      },
      {
        type: 'simulateur',
        id: 'annexe4btest',
        titre: 'Annexe 4b — Test « prime à la conversion »',
        introTitre: 'Prime à la conversion des véhicules',
        introTexte: "Bénéficiez de la prime à la conversion en échange de la mise au rebut d'un vieux véhicule. Jusqu'à 5 000 € pour un véhicule électrique ou hybride rechargeable, neuf ou d'occasion. Reportez les réponses du couple Dupont (document 5).",
        introBouton: 'Je fais le test',
        nbEtapesAffiche: 6,
        etapes: [
          { id: 'energie', bandeau: 'CARACTÉRISTIQUES', question: 'Précisez les caractéristiques de votre voiture particulière', options: [
            { libelle: 'Véhicule diesel', vers: 'annee_diesel' },
            { libelle: 'Véhicule essence, gaz…', vers: 'rfr_essence' },
          ] },
          { id: 'annee_diesel', bandeau: 'VÉHICULE À RECYCLER', question: 'Votre véhicule diesel a-t-il été immatriculé avant 2011 ?', options: [
            { libelle: 'Oui, avant 2011', vers: 'type' },
            { libelle: 'Non, après 2011', vers: 'ko_recent' },
          ] },
          { id: 'rfr_essence', bandeau: 'REVENU FISCAL', question: "Votre revenu fiscal de référence est-il supérieur à 18 000 € ?", options: [
            { libelle: 'Oui, supérieur à 18 000 €', vers: 'annee_essence' },
            { libelle: 'Non, inférieur à 18 000 €', vers: 'annee_essence' },
          ] },
          { id: 'annee_essence', bandeau: 'VÉHICULE À RECYCLER', question: 'Votre véhicule essence a-t-il été immatriculé avant 2006 ?', options: [
            { libelle: 'Oui, avant 2006', vers: 'type' },
            { libelle: 'Non, après 2006', vers: 'ko_recent' },
          ] },
          { id: 'type', bandeau: 'VÉHICULE À ACHETER', question: 'Quel type de véhicule souhaitez-vous acheter ?', options: [
            { libelle: 'Véhicule particulier ou utilitaire léger', vers: 'neuf' },
            { libelle: 'Vélo, trottinette…', vers: 'ko_type' },
          ] },
          { id: 'neuf', bandeau: 'VÉHICULE À ACHETER', question: "S'agit-il d'un véhicule neuf ou d'occasion ?", options: [
            { libelle: 'Neuf', vers: 'critair' },
            { libelle: 'Occasion', vers: 'critair' },
          ] },
          { id: 'critair', bandeau: "CLASSEMENT CRIT'AIR", question: "Quel est le classement Crit'Air du véhicule à acheter ?", options: [
            { libelle: 'Véhicule électrique ou hydrogène', vers: 'cout' },
            { libelle: "Véhicule Crit'Air 1", vers: 'cout' },
            { libelle: "Véhicule Crit'Air 3, 4, 5 ou non classé", vers: 'ko_critair' },
          ] },
          { id: 'cout', bandeau: "COÛT D'ACQUISITION", question: "Quel est le coût d'acquisition (batterie incluse) du véhicule ?", options: [
            { libelle: 'Inférieur ou égal à 60 000 €', vers: 'ok' },
            { libelle: 'Supérieur à 60 000 €', vers: 'ko_cout' },
          ] },
        ],
        resultats: [
          { id: 'ok', type: 'ok', texte: "Vous pouvez, sous réserve d'instruction du dossier, bénéficier de la prime à la conversion de 5 000 €." },
          { id: 'ko_recent', type: 'ko', texte: "Votre véhicule à recycler n'est pas éligible : il est trop récent." },
          { id: 'ko_type', type: 'ko', texte: "Ce type de véhicule n'ouvre pas droit à la prime à la conversion." },
          { id: 'ko_critair', type: 'ko', texte: "Ce véhicule n'est pas éligible : envisagez un véhicule plus récent (électrique ou Crit'Air 1)." },
          { id: 'ko_cout', type: 'ko', texte: "Ce véhicule n'est pas éligible : le coût d'acquisition dépasse 60 000 €." },
        ],
      },
      {
        type: 'texte',
        id: 'annexe3phrase',
        titre: 'Annexe 3 — La phrase de conclusion « joker »',
        lignes: 4,
      },
      {
        type: 'grille',
        id: 'annexe4acredit',
        titre: 'Annexe 4a — Demande de crédit',
        colonnes: ['Éléments', 'Calculs', 'Résultats'],
        nbLignes: 4,
      },
      {
        type: 'grille',
        id: 'annexe5remise',
        titre: 'Annexe 5 — Montant après la prime',
        colonnes: ['Élément', 'Montant'],
        nbLignes: 3,
      },
      {
        type: 'texte',
        id: 'annexe6comm',
        titre: 'Annexe 6 — Commentaire',
        lignes: 3,
      },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: "Les signaux d'achat (annexe 1).",
        documents: ['Documents 1 et 2', 'Annexe 1'],
        bareme: 4,
        reponse: "Signaux relevés dans le dialogue (document 2).",
        tableau: {
          colonnes: ['Client', 'Verbal +', 'Verbal −', 'Non verbal +', 'Non verbal −'],
          lignes: [
            ['M. Dupont', "Fait valider sa décision : « T'en penses quoi ? C'est pas mal ! »", '« C\'est pas faux… »', 'Enthousiaste', "S'enfonce dans sa chaise"],
            ['Mme Dupont', '« …elle est très bien cette voiture ! »', "« …ce qui m'embête un peu c'est le prix… »", 'Un grand sourire', 'Se gratte la tête'],
          ],
        },
      },
      {
        intitule: 'Les deux arguments « joker » (annexe 2).',
        documents: ['Documents 3 et 4', 'Annexe 2'],
        bareme: 2,
        reponse: "Deux arguments gardés pour précipiter la décision.",
        tableau: {
          colonnes: ['Les deux arguments « joker »'],
          lignes: [
            ['Prime à la conversion de 5 000 €'],
            ['Offre réservée aux 200 000 premiers acheteurs'],
          ],
        },
      },
      {
        intitule: 'Test « prime à la conversion » (annexe 4b).',
        documents: ['Documents 4 et 5', 'Annexe 4b'],
        bareme: 3,
        reponse: "Réponses à saisir dans le test, d'après le document 5.",
        tableau: {
          colonnes: ['Question du test', 'Réponse'],
          lignes: [
            ['Type d\'achat', "Véhicule d'occasion"],
            ['Type de véhicule', 'Véhicule particulier'],
            ['Énergie', 'Électrique'],
            ['Véhicule actuel mis au rebut', 'Acheté en 2005'],
            ['Revenu fiscal de référence', '17 000 €'],
            ['Résultat', 'Éligible à la prime de 5 000 €'],
          ],
        },
      },
      {
        intitule: 'La phrase de conclusion « joker » (annexe 3).',
        documents: ['Document 3', 'Annexe 2', 'Annexe 3'],
        bareme: 3,
        reponse:
          "« Bravo ! Vous êtes éligible à la prime à la conversion de 5 000 €. Je ne veux pas vous presser, mais cette prime n'est réservée qu'aux 200 000 premiers acheteurs sur toute la France, ce qui est très peu. Il ne faut donc pas trop tarder à vous décider. »",
      },
      {
        intitule: 'Le calcul du crédit (annexe 4a).',
        documents: ['Documents 6 et 7', 'Annexe 4a'],
        bareme: 8,
        reponse: "Calculs selon la méthode du document 6.",
        tableau: {
          colonnes: ['Éléments', 'Calculs', 'Résultats'],
          lignes: [
            ['Reste à vivre', '2290 + 2240 + 151,05 − 1030 − 315,67', '3 335,38 €'],
            ['Reste à vivre doit être supérieur à…', '1400 (couple) + 400 + 400 (2 enfants)', '2 200 €'],
            ["Taux d'endettement", '(1030 + 315,67 + 200) / (2290 + 2240) × 100', '34,12 %'],
            ['Intérêts à payer', '(200 × 12 × 5) − 8290', '3 710 €'],
          ],
        },
        complement:
          "Le reste à vivre (3 335,38 €) est supérieur au minimum exigé (2 200 €) et le taux d'endettement (34,12 %) est inférieur au plafond de 35 %. Le crédit peut donc être accordé. Remarque : la future mensualité de 200 € est intégrée au taux d'endettement mais pas au reste à vivre (qui décrit la situation actuelle).",
      },
      {
        intitule: 'Le montant après la prime (annexe 5).',
        documents: ['Document 5', 'Annexe 4', 'Annexe 5'],
        bareme: 4,
        reponse: "Application de la prime à la conversion.",
        tableau: {
          colonnes: ['Élément', 'Montant'],
          lignes: [
            ['Montant total du crédit (200 × 12 × 5)', '12 000 €'],
            ['Prime à la conversion', '5 000 €'],
            ['Montant final payé par le couple (12 000 − 5 000)', '7 000 €'],
          ],
        },
      },
      {
        intitule: 'Le commentaire (annexe 6).',
        documents: ['Annexe 5', 'Annexe 6'],
        bareme: 2,
        reponse:
          "Le crédit est accordé (taux d'endettement 34,12 % < 35 %, reste à vivre confortable). Après la prime à la conversion de 5 000 €, le couple paiera 7 000 €, soit moins que le budget maximum de 8 300 € qu'il s'était fixé.",
      },
    ],
  },
  synthese: {
    titre: 'La conclusion de la vente et le financement du crédit',
    proposition: [
      'Signaux verbaux', 'Signaux non verbaux', 'Signaux positifs', 'Signaux négatifs',
      'La conclusion directe', 'La conclusion alternative', 'La conclusion « joker »',
      'Le reste à vivre', "Le taux d'endettement", 'Les intérêts à payer',
    ],
    racine: {
      id: 'racine',
      texte: 'La conclusion de la vente et le crédit',
      enfants: [
        {
          id: 'sig', texte: "Les signaux d'achat",
          enfants: [
            { id: 's1', texte: null, reponse: 'Signaux verbaux' },
            { id: 's2', texte: null, reponse: 'Signaux non verbaux' },
            { id: 's3', texte: null, reponse: 'Signaux positifs' },
            { id: 's4', texte: null, reponse: 'Signaux négatifs' },
          ],
        },
        {
          id: 'concl', texte: 'Les techniques de conclusion',
          enfants: [
            { id: 'co1', texte: null, reponse: 'La conclusion directe' },
            { id: 'co2', texte: null, reponse: 'La conclusion alternative' },
            { id: 'co3', texte: null, reponse: 'La conclusion « joker »' },
          ],
        },
        {
          id: 'cred', texte: 'Le calcul du crédit',
          enfants: [
            { id: 'cr1', texte: null, reponse: 'Le reste à vivre' },
            { id: 'cr2', texte: null, reponse: "Le taux d'endettement" },
            { id: 'cr3', texte: null, reponse: 'Les intérêts à payer' },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: "Repérer les signaux d'achat",
        indicateurs: [
          { niveau: 'novice', description: "Je ne sais pas ce qu'est un signal d'achat." },
          { niveau: 'debrouille', description: 'Je repère un ou deux signaux.' },
          { niveau: 'averti', description: 'Je distingue signaux verbaux et non verbaux.' },
          { niveau: 'expert', description: 'Je classe les signaux verbaux/non verbaux et positifs/négatifs.' },
        ],
      },
      {
        id: 'c2', intitule: 'Conclure la vente',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas les techniques de conclusion.' },
          { niveau: 'debrouille', description: 'Je cite une technique.' },
          { niveau: 'averti', description: "J'utilise la conclusion « joker »." },
          { niveau: 'expert', description: "Je rédige une phrase de conclusion « joker » convaincante." },
        ],
      },
      {
        id: 'c3', intitule: 'Calculer le crédit',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas calculer le crédit.' },
          { niveau: 'debrouille', description: 'Je calcule le reste à vivre.' },
          { niveau: 'averti', description: "Je calcule le taux d'endettement et les intérêts." },
          { niveau: 'expert', description: 'Je calcule tout et je conclus sur l\'octroi du crédit.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: "Signal d'achat", definition: "Indice (verbal ou non verbal) montrant que le client est prêt à acheter." },
      { terme: 'Signal verbal', definition: "Ce que le client dit (questions sur le délai, le paiement, projection dans l'avenir...)." },
      { terme: 'Signal non verbal', definition: "Attitude du client (sourire, posture, gestes)." },
      { terme: 'Conclusion directe', definition: "Inviter naturellement le client à finaliser la vente." },
      { terme: 'Conclusion alternative', definition: "Proposer un choix entre deux solutions." },
      { terme: 'Conclusion « joker »', definition: "Garder un argument fort pour précipiter la décision." },
      { terme: 'Reste à vivre', definition: "Somme restante après paiement de toutes les charges." },
      { terme: "Taux d'endettement", definition: "Part des revenus consacrée aux dettes (35 % maximum)." },
      { terme: 'Prime à la conversion', definition: "Aide à l'achat d'un véhicule propre en échange d'un vieux véhicule mis au rebut." },
    ],
    flashcards: [
      { recto: "Qu'est-ce qu'un signal d'achat ?", verso: "Un indice montrant que le client est prêt à acheter." },
      { recto: 'Donne un signal verbal positif.', verso: 'Le client demande les délais de livraison ou de paiement.' },
      { recto: 'Donne un signal non verbal positif.', verso: 'Le client sourit, est détendu, avance vers le bureau.' },
      { recto: 'Donne un signal non verbal négatif.', verso: "Le client se gratte la tête, s'enfonce dans sa chaise." },
      { recto: 'Les trois techniques de conclusion ?', verso: 'Directe, alternative, « joker ».' },
      { recto: "Qu'est-ce que la conclusion « joker » ?", verso: "Garder un argument fort pour précipiter la décision." },
      { recto: 'Formule du reste à vivre ?', verso: 'Rentrées d\'argent − dépenses du ménage.' },
      { recto: "Plafond du taux d'endettement ?", verso: '35 % maximum.' },
      { recto: "Formule des intérêts à payer ?", verso: '(mensualité × 12 × années) − montant du véhicule.' },
      { recto: 'Montant de la prime à la conversion pour la famille Dupont ?', verso: '5 000 € (véhicule électrique).' },
    ],
    quiz: [
      { type: 'unique', question: "Un signal d'achat, c'est :", options: ['Un indice que le client est prêt à acheter', 'Une réduction de prix', 'Un type de contrat', 'Une garantie'], bonne: 0 },
      { type: 'unique', question: 'Lequel est un signal verbal positif ?', options: ['Demander les délais de livraison', 'Regarder par la fenêtre', 'Rester silencieux', 'Tapoter des doigts'], bonne: 0 },
      { type: 'unique', question: 'Lequel est un signal non verbal négatif ?', options: ["S'enfoncer dans sa chaise", 'Sourire', 'Avancer vers le bureau', 'Être enthousiaste'], bonne: 0 },
      { type: 'unique', question: 'La conclusion « joker » consiste à :', options: ['Garder un argument fort pour précipiter la décision', 'Baisser le prix', 'Proposer deux choix', 'Attendre'], bonne: 0 },
      { type: 'unique', question: 'Formule du reste à vivre ?', options: ['Rentrées − dépenses', 'Dépenses − rentrées', 'Salaires × 35 %', 'Loyer + crédit'], bonne: 0 },
      { type: 'unique', question: "Plafond du taux d'endettement en 2026 ?", options: ['35 %', '33 %', '40 %', '30 %'], bonne: 0 },
      { type: 'unique', question: "Formule du taux d'endettement ?", options: ['Dépenses / salaires × 100', 'Salaires / dépenses × 100', 'Loyer / revenus', 'Dépenses − salaires'], bonne: 0 },
      { type: 'unique', question: 'Le couple Dupont obtient-il le crédit ?', options: ['Oui, 34,12 % < 35 %', 'Non, taux trop élevé', 'Non, reste à vivre insuffisant', 'On ne peut pas savoir'], bonne: 0 },
      { type: 'unique', question: 'Montant de la prime à la conversion (Dupont) ?', options: ['5 000 €', '3 000 €', '2 000 €', '7 000 €'], bonne: 0 },
      { type: 'unique', question: 'Montant final payé après la prime ?', options: ['7 000 €', '12 000 €', '8 290 €', '5 000 €'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque élément dans la bonne catégorie.',
      etiquettes: ["Signal d'achat", 'Technique de conclusion', 'Calcul du crédit'],
      zones: [
        { libelle: 'Le client sourit', etiquetteIndex: 0 },
        { libelle: 'Le client demande le délai de paiement', etiquetteIndex: 0 },
        { libelle: 'La conclusion « joker »', etiquetteIndex: 1 },
        { libelle: 'La conclusion alternative', etiquetteIndex: 1 },
        { libelle: 'Le reste à vivre', etiquetteIndex: 2 },
        { libelle: "Le taux d'endettement", etiquetteIndex: 2 },
      ],
    },
  },
}

// ---------------------------------------------------------------------------
// CONTENU : Renault, mission 8 - La vente additionnelle
// ---------------------------------------------------------------------------
const RENAULT_M8: ContenuMission = {
  travaux: {
    consigne:
      "Repérez dans la découverte des besoins (mission 4) la phrase de M. Dupont qui peut donner lieu à une vente additionnelle, puis proposez l'accessoire le plus adapté et son prix à partir du catalogue.",
    contexte:
      "Vous avez emporté l'adhésion du client grâce à l'argument « joker ». Il est temps de penser à la vente additionnelle. Votre responsable a fait passer une note rappelant l'intérêt de proposer des produits complémentaires ou supplémentaires.",
    documents: [
      { numero: 1, titre: 'La note de M. Prauviste (vente complémentaire et supplémentaire)', images: ['/docs/renault-m8/doc1.jpg'] },
    ],
    competence: {
      groupe: 'Groupe de compétences 1',
      intitule: 'Conseiller et vendre',
      detail: 'Proposer une vente additionnelle adaptée aux besoins du client.',
    },
    objectifs: [
      'Distinguer vente complémentaire et vente supplémentaire.',
      "Repérer dans le dialogue un besoin pouvant donner lieu à une vente additionnelle.",
      "Proposer l'accessoire adapté et indiquer son prix à partir du catalogue.",
    ],
    activites: [
      {
        titre: 'Activité 1 — La phrase de M. Dupont',
        questions: [
          { numero: 1, consigne: "Relisez la mission 4 (annexe 1, découverte des besoins). Retrouvez la phrase de M. Dupont qui peut faire l'objet d'une vente additionnelle, puis recopiez-la.", ressources: "Relire la mission 4 (annexe 1), compléter l'annexe 1. [C.1.2]", annexeId: 'annexe1phrase' },
        ],
      },
      {
        titre: "Activité 2 — L'accessoire à proposer",
        questions: [
          { numero: 2, consigne: "Dans le catalogue d'accessoires, sélectionnez l'accessoire le plus adapté à la phrase de M. Dupont, puis justifiez votre choix et indiquez son prix.", ressources: "Consulter le catalogue (annexe 2), compléter l'annexe 2. [C.1.2]", annexeId: 'annexe2cat' },
        ],
      },
    ],
    annexes: [
      {
        type: 'texte',
        id: 'annexe1phrase',
        titre: 'Annexe 1 — La phrase de M. Dupont',
        lignes: 3,
      },
      {
        type: 'catalogue',
        id: 'annexe2cat',
        titre: 'Annexe 2 — Le catalogue des accessoires Renault',
        compteurAffiche: 42,
        categories: ['Tous', 'Signalisation secours', 'Diffuseur parfum', 'Stickers', 'Accessoires de la marque'],
        demandeJustif: "Justifiez votre choix au regard de la phrase de M. Dupont",
        produits: [
          { id: 'sacbagoto', nom: 'Sac Bagoto', categorie: 'Accessoires de la marque', prix: '2,00 € TTC' },
          { id: 'stylorenaultb', nom: 'Stylo Renault B', categorie: 'Accessoires de la marque', prix: '1,25 € TTC' },
          { id: 'extincteur2kg', nom: 'Extincteur 2kg avec manomètre', categorie: 'Signalisation secours', prix: '33,74 € TTC' },
          { id: 'fixationmaster', nom: 'Fixation pour extincteur (Master III)', categorie: 'Signalisation secours', prix: '32,24 € TTC' },
          { id: 'etuiip6', nom: 'Étui iP6 Alpine', categorie: 'Accessoires de la marque', prix: '20,00 € TTC' },
          { id: 'stickerslignes', nom: 'Stickers personnalisation - Lignes blanches (Twingo III)', categorie: 'Stickers', prix: '387,29 € TTC' },
          { id: 'stickersvintage', nom: 'Stickers personnalisation - Vintage (Twingo III)', categorie: 'Stickers', prix: '387,29 € TTC' },
          { id: 'oursonalpine', nom: 'Ourson Alpine', categorie: 'Accessoires de la marque', prix: '35,00 € TTC' },
          { id: 'portecleslosange', nom: 'Porte-clés Losange', categorie: 'Accessoires de la marque', prix: '2,00 € TTC' },
          { id: 'kitalpine', nom: 'Kit de sécurité pour Nouvelle Alpine', categorie: 'Signalisation secours', prix: '20,40 € TTC' },
          { id: 'kitsecurite', nom: 'Kit Sécurité (gilet, triangle…)', categorie: 'Signalisation secours', prix: '20,50 € TTC' },
          { id: 'pinslosange', nom: 'Pins Losange 9mm', categorie: 'Accessoires de la marque', prix: '1,50 € TTC' },
          { id: 'tasserenaultb', nom: 'Tasse Renault B', categorie: 'Accessoires de la marque', prix: '15,00 € TTC' },
          { id: 'batterierenaultb', nom: 'Batterie Renault B', categorie: 'Accessoires de la marque', prix: '30,00 € TTC' },
          { id: 'rechargeparfum', nom: 'Recharge Parfum Stimulating Forest', categorie: 'Diffuseur parfum', prix: '6,49 € TTC' },
          { id: 'portecles', nom: 'Porte-clés', categorie: 'Accessoires de la marque', prix: '5,50 € TTC' },
          { id: 'stylo', nom: 'Stylo', categorie: 'Accessoires de la marque', prix: '30,00 € TTC' },
          { id: 'extincteur1kg', nom: 'Extincteur 1kg avec manomètre (Nouvelle Alpine)', categorie: 'Signalisation secours', prix: '21,67 € TTC' },
          { id: 'stickerssecu', nom: 'Stickers Sécurité véhicule de société (Trafic III)', categorie: 'Stickers', prix: '104,11 € TTC' },
          { id: 'styloblancf1', nom: 'Stylo Blanc F1', categorie: 'Accessoires de la marque', prix: '2,95 € TTC' },
          { id: 'stickercartecle', nom: 'Sticker carte-clé - Diamant Noir', categorie: 'Stickers', prix: '8,69 € TTC' },
          { id: 'coquetwingo', nom: 'Coque Tel Twingo', categorie: 'Accessoires de la marque', prix: '15,00 € TTC' },
        ],
      },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: 'La phrase de M. Dupont (annexe 1).',
        documents: ['Mission 4 (annexe 1)', 'Annexe 1'],
        bareme: 4,
        reponse:
          "« D'ailleurs il faudra qu'on achète un autre kit de sécurité parce que celui qui est dans ma voiture est complètement déchiré. »",
      },
      {
        intitule: "L'accessoire à proposer (annexe 2).",
        documents: ['Catalogue (annexe 2)', 'Annexe 2'],
        bareme: 6,
        reponse: "Accessoire adapté à la phrase de M. Dupont.",
        tableau: {
          colonnes: ['Élément', 'Réponse attendue'],
          lignes: [
            ['Accessoire proposé', 'Kit Sécurité (gilet, triangle…)'],
            ['Prix', '20,50 € TTC'],
            ['Type de vente', 'Vente supplémentaire'],
            ['Justification', "M. Dupont a indiqué que son kit de sécurité actuel est déchiré : on lui propose donc un kit de remplacement."],
          ],
        },
        complement: "Attention au piège : le « Kit de sécurité pour Nouvelle Alpine » à 20,40 € est destiné à un autre véhicule. Le bon choix est le Kit Sécurité (gilet, triangle) à 20,50 €.",
      },
    ],
  },
  synthese: {
    titre: 'La vente additionnelle',
    proposition: ['La vente complémentaire', 'La vente supplémentaire', 'Augmenter le chiffre d\'affaires', 'Obtenir des primes'],
    racine: {
      id: 'racine',
      texte: 'La vente additionnelle',
      enfants: [
        {
          id: 'types', texte: 'Les 2 types de vente additionnelle',
          enfants: [
            { id: 't1', texte: null, reponse: 'La vente complémentaire' },
            { id: 't2', texte: null, reponse: 'La vente supplémentaire' },
          ],
        },
        {
          id: 'enjeux', texte: 'Les enjeux pour le commercial',
          enfants: [
            { id: 'e1', texte: null, reponse: "Augmenter le chiffre d'affaires" },
            { id: 'e2', texte: null, reponse: 'Obtenir des primes' },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: 'Distinguer vente complémentaire et supplémentaire',
        indicateurs: [
          { niveau: 'novice', description: "Je ne connais pas la vente additionnelle." },
          { niveau: 'debrouille', description: 'Je confonds les deux types.' },
          { niveau: 'averti', description: 'Je distingue vente complémentaire et supplémentaire.' },
          { niveau: 'expert', description: 'Je distingue les deux et je donne un exemple de chaque.' },
        ],
      },
      {
        id: 'c2', intitule: 'Repérer un besoin de vente additionnelle',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne repère pas le besoin dans le dialogue.' },
          { niveau: 'debrouille', description: 'Je repère un besoin sans le relier au bon produit.' },
          { niveau: 'averti', description: 'Je repère la phrase pertinente.' },
          { niveau: 'expert', description: 'Je repère la phrase et propose le produit adapté.' },
        ],
      },
      {
        id: 'c3', intitule: "Proposer l'accessoire adapté",
        indicateurs: [
          { niveau: 'novice', description: 'Je propose un accessoire au hasard.' },
          { niveau: 'debrouille', description: 'Je propose un accessoire approchant.' },
          { niveau: 'averti', description: "Je propose le bon accessoire." },
          { niveau: 'expert', description: "Je propose le bon accessoire, son prix et je justifie." },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Vente additionnelle', definition: "Vente d'un produit ou service en plus du produit principal." },
      { terme: 'Vente complémentaire', definition: "Produit qui complète l'esthétique ou l'usage du produit principal (ex : pare-soleil)." },
      { terme: 'Vente supplémentaire', definition: "Produit sans lien direct avec le produit principal mais utile au client (ex : siège bébé)." },
      { terme: "Chiffre d'affaires", definition: "Montant total des ventes de l'entreprise." },
      { terme: 'Prime', definition: "Rémunération supplémentaire accordée au commercial sur ses ventes." },
      { terme: 'Accessoire', definition: "Produit annexe proposé en complément du véhicule." },
    ],
    flashcards: [
      { recto: "Qu'est-ce que la vente additionnelle ?", verso: "Vendre un produit ou service en plus du produit principal." },
      { recto: "Qu'est-ce que la vente complémentaire ?", verso: "Un produit qui complète l'esthétique ou l'usage du produit principal." },
      { recto: "Qu'est-ce que la vente supplémentaire ?", verso: "Un produit sans lien direct avec le produit principal mais utile au client." },
      { recto: 'Exemple de vente complémentaire ?', verso: "Un pare-soleil pour l'achat d'une voiture." },
      { recto: 'Exemple de vente supplémentaire ?', verso: 'Un siège bébé.' },
      { recto: 'Deux intérêts de la vente additionnelle ?', verso: "Augmenter le chiffre d'affaires et obtenir des primes." },
      { recto: 'Quel accessoire proposer à M. Dupont ?', verso: 'Le Kit Sécurité (gilet, triangle) à 20,50 €.' },
      { recto: 'Pourquoi ce kit de sécurité ?', verso: 'Parce que son kit actuel est déchiré (besoin exprimé en M4).' },
      { recto: 'La vente du kit de sécurité est de quel type ?', verso: 'Vente supplémentaire (sans lien direct avec la voiture mais utile).' },
      { recto: 'Quel est le piège du catalogue ?', verso: 'Le « Kit pour Nouvelle Alpine » à 20,40 € concerne un autre véhicule.' },
    ],
    quiz: [
      { type: 'unique', question: "La vente additionnelle, c'est :", options: ['Vendre un produit en plus du principal', 'Baisser le prix', 'Refuser une vente', 'Reprendre un véhicule'], bonne: 0 },
      { type: 'unique', question: 'La vente complémentaire est :', options: ["Un produit qui complète le produit principal", 'Un produit sans lien', 'Une remise', 'Un crédit'], bonne: 0 },
      { type: 'unique', question: 'La vente supplémentaire est :', options: ['Un produit utile mais sans lien direct', 'Une option du véhicule', 'Une réduction', 'Une reprise'], bonne: 0 },
      { type: 'unique', question: 'Exemple de vente complémentaire ?', options: ['Un pare-soleil', 'Un siège bébé sans rapport', 'Un crédit', 'Une assurance vie'], bonne: 0 },
      { type: 'unique', question: 'Exemple de vente supplémentaire ?', options: ['Un siège bébé', 'Une option moteur', 'Une jante', 'Un toit ouvrant'], bonne: 0 },
      { type: 'unique', question: 'Deux intérêts de la vente additionnelle ?', options: ["Chiffre d'affaires et primes", 'Remise et fidélité', 'Stock et livraison', 'Garantie et SAV'], bonne: 0 },
      { type: 'unique', question: 'Quel accessoire proposer à M. Dupont ?', options: ['Le Kit Sécurité à 20,50 €', 'Un porte-clés', 'Une tasse Renault', 'Un ourson Alpine'], bonne: 0 },
      { type: 'unique', question: 'Pourquoi ce kit ?', options: ['Son kit actuel est déchiré', 'Il aime la sécurité', 'Il est en promotion', 'Le vendeur le pousse'], bonne: 0 },
      { type: 'unique', question: 'La vente de ce kit est :', options: ['Supplémentaire', 'Complémentaire', 'Une reprise', 'Un crédit'], bonne: 0 },
      { type: 'unique', question: 'Quel est le piège du catalogue ?', options: ['Le kit Alpine à 20,40 € (autre véhicule)', 'Le prix trop élevé', 'La rupture de stock', 'La couleur'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque exemple dans la bonne catégorie.',
      etiquettes: ['Vente complémentaire', 'Vente supplémentaire'],
      zones: [
        { libelle: 'Un pare-soleil', etiquetteIndex: 0 },
        { libelle: 'La proposition d\'options', etiquetteIndex: 0 },
        { libelle: 'Un tapis de sol', etiquetteIndex: 0 },
        { libelle: 'Un siège bébé', etiquetteIndex: 1 },
        { libelle: 'Un kit de sécurité', etiquetteIndex: 1 },
        { libelle: 'Une gourde', etiquetteIndex: 1 },
      ],
    },
  },
}

// ---------------------------------------------------------------------------
// CONTENU : Citroën, mission 1 - La présentation de l'entreprise
// ---------------------------------------------------------------------------
const CITROEN_M1: ContenuMission = {
  travaux: {
    consigne:
      "Analysez l'entreprise Citroën : son histoire et ses valeurs, son marché et sa gamme de produits, à partir des documents fournis par votre tuteur.",
    contexte:
      "Depuis quelques années, l'industrie automobile en France est en pleine transformation, avec un accent croissant sur l'innovation technologique et la durabilité. Citroën se positionne comme un acteur clé, proposant des modèles adaptés aux jeunes conducteurs, alliant style, économie de carburant et respect de l'environnement.\nClara, 19 ans, vient d'obtenir son permis de conduire et est actuellement en première année de BTS NDRC (Négociation et digitalisation de la relation client). Elle doit se déplacer fréquemment entre son lycée et ses stages, ce qui nécessite un moyen de transport fiable.\nSon père, Marc, souhaite lui offrir une voiture pour marquer son entrée dans l'âge adulte. Ensemble, ils se rendent chez un concessionnaire Citroën, où ils exploreront les différentes citadines, qui sont adaptées aux trajets urbains et au style de vie étudiant. Ce processus d'achat est une étape cruciale pour Clara. Il lui permettra d'acquérir autonomie et responsabilité dans sa vie quotidienne.",
    videoContexte: 'https://drive.google.com/file/d/1Z-bYMIdGDl-rkupJOdxDk_6QDqBPftSK/view',
    documents: [
      { numero: 1, titre: 'Histoire de Citroën', images: ['/docs/citroen-m1/doc1.jpg'] },
      { numero: 2, titre: 'Vision et valeurs de Citroën', images: ['/docs/citroen-m1/doc2.jpg'] },
      { numero: 3, titre: 'Chiffres clés de Citroën', images: ['/docs/citroen-m1/doc3.jpg'] },
      { numero: 4, titre: 'Analyse de marché', images: ['/docs/citroen-m1/doc4.jpg'] },
      { numero: 5, titre: 'Tendances de consommation', images: ['/docs/citroen-m1/doc5.jpg'] },
      { numero: 6, titre: 'Gamme de produits Citroën', images: ['/docs/citroen-m1/doc6.jpg'] },
      { numero: 7, titre: 'Nouveaux modèles', images: ['/docs/citroen-m1/doc7.jpg'] },
    ],
    competence: {
      groupe: 'Groupe de compétences 1',
      intitule: "Rechercher et actualiser les informations sur l'entreprise et son marché",
      detail: "Maîtriser la technologie des produits et le positionnement de la marque.",
    },
    objectifs: [
      "Identifier l'histoire, les valeurs et les chiffres clés de Citroën.",
      'Analyser le marché : concurrents, positionnement, tendances.',
      'Étudier la gamme de produits et les innovations de la marque.',
    ],
    activites: [
      {
        titre: "Activité 1 — Recherche d'informations sur l'entreprise",
        questions: [
          { numero: 1, consigne: "Donnez le nom du fondateur de l'entreprise et l'année de création.", ressources: "Consulter le document 1, compléter l'annexe 1. [C.1.1]", annexeId: 'annexe1' },
          { numero: 2, consigne: "Expliquez comment l'entreprise voit les déplacements écologiques.", ressources: "Consulter le document 2, compléter l'annexe 1. [C.1.1]", annexeId: 'annexe1' },
          { numero: 3, consigne: "Indiquez le chiffre d'affaires réalisé par Citroën.", ressources: "Consulter le document 3, compléter l'annexe 1. [C.1.1]", annexeId: 'annexe1' },
          { numero: 4, consigne: "Énumérez les 2 modèles marquants de l'histoire de Citroën.", ressources: "Consulter le document 1, compléter l'annexe 1. [C.1.1]", annexeId: 'annexe1' },
          { numero: 5, consigne: 'Indiquez le nombre de voitures vendues par Citroën en 2023.', ressources: "Consulter le document 3, compléter l'annexe 1. [C.1.1]", annexeId: 'annexe1' },
        ],
      },
      {
        titre: 'Activité 2 — Analyse du marché de Citroën',
        questions: [
          { numero: 6, consigne: 'Citez les principaux concurrents de Citroën sur le marché français.', ressources: "Consulter le document 4, compléter l'annexe 2. [C.1.1]", annexeId: 'annexe2' },
          { numero: 7, consigne: 'Indiquez les 2 gammes principales de véhicules que vend la marque.', ressources: "Consulter le document 4, compléter l'annexe 2. [C.1.1]", annexeId: 'annexe2' },
          { numero: 8, consigne: "Détaillez la méthode qui a permis à l'entreprise de conquérir le marché français.", ressources: "Consulter le document 4, compléter l'annexe 2. [C.1.1]", annexeId: 'annexe2' },
          { numero: 9, consigne: 'Précisez les tendances de consommation actuelles en matière de véhicules.', ressources: "Consulter le document 5, compléter l'annexe 2. [C.1.1]", annexeId: 'annexe2' },
          { numero: 10, consigne: 'Indiquez pourquoi les jeunes consommateurs sont attirés par les véhicules Citroën.', ressources: "Consulter le document 5, compléter l'annexe 2. [C.1.1]", annexeId: 'annexe2' },
        ],
      },
      {
        titre: 'Activité 3 — Étude des produits de la marque',
        questions: [
          { numero: 11, consigne: 'Indiquez les 4 types de véhicules de la gamme Citroën.', ressources: "Consulter le document 6, compléter l'annexe 3. [C.1.1]", annexeId: 'annexe3' },
          { numero: 12, consigne: 'Citez les deux points forts des modèles Citroën mentionnés dans le document.', ressources: "Consulter le document 6, compléter l'annexe 4. [C.1.1]", annexeId: 'annexe4' },
          { numero: 13, consigne: 'Donnez le nom du nouveau modèle lancé par Citroën en 2023.', ressources: "Consulter le document 7, compléter l'annexe 5. [C.1.1]", annexeId: 'annexe5' },
          { numero: 14, consigne: 'Précisez comment Citroën répond à la demande de véhicules électriques.', ressources: "Consulter le document 6, compléter l'annexe 6. [C.1.1]", annexeId: 'annexe6' },
          { numero: 15, consigne: 'Nommez la nouvelle technologie intégrée dans les modèles récents pour améliorer la conduite.', ressources: "Consulter le document 6, compléter l'annexe 7. [C.1.1]", annexeId: 'annexe7' },
        ],
      },
    ],
    annexes: [
      { type: 'grille', id: 'annexe1', titre: "Annexe 1 — Éléments de l'histoire de l'entreprise", colonnes: ['Élément', 'Réponse'], nbLignes: 7 },
      { type: 'grille', id: 'annexe2', titre: 'Annexe 2 — Le marché de Citroën', colonnes: ["Éléments d'analyse", 'Réponses'], nbLignes: 5 },
      { type: 'grille', id: 'annexe3', titre: 'Annexe 3 — Les types de véhicules de la gamme', colonnes: ['Type 1', 'Type 2', 'Type 3', 'Type 4'], nbLignes: 1 },
      { type: 'texte', id: 'annexe4', titre: 'Annexe 4 — Les points forts des modèles', lignes: 3 },
      { type: 'texte', id: 'annexe5', titre: 'Annexe 5 — Le nouveau modèle', lignes: 2 },
      { type: 'texte', id: 'annexe6', titre: 'Annexe 6 — La réponse à la demande de véhicules électriques', lignes: 3 },
      { type: 'texte', id: 'annexe7', titre: 'Annexe 7 — La nouvelle technologie', lignes: 3 },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: "Éléments de l'histoire de l'entreprise (annexe 1).",
        documents: ['Documents 1, 2 et 3', 'Annexe 1'],
        bareme: 10,
        reponse: "Voir tableau.",
        tableau: {
          colonnes: ['Élément', 'Réponse'],
          lignes: [
            ["Créateur de l'entreprise", 'André Citroën'],
            ['Date de création', '1919'],
            ["Secteur d'activité", 'Automobile'],
            ['Vision sur les déplacements écologiques', "Devenir un leader de la mobilité durable en développant des solutions de transport respectueuses de l'environnement, en plaçant le client au cœur de ses préoccupations."],
            ["Chiffre d'affaires", "20 milliards d'euros (2023)"],
            ['Nombre de véhicules vendus', '1,2 million (2023)'],
            ['2 modèles marquants', 'Traction Avant (1934) et 2CV (1948)'],
          ],
        },
      },
      {
        intitule: 'Le marché de Citroën (annexe 2).',
        documents: ['Documents 4 et 5', 'Annexe 2'],
        bareme: 10,
        reponse: 'Voir tableau.',
        tableau: {
          colonnes: ["Éléments d'analyse", 'Réponses'],
          lignes: [
            ['Concurrents', 'Renault, Peugeot, Volkswagen, Toyota'],
            ['Segments de marché', 'Citadines et SUV'],
            ['Méthode de conquête', "Marketing digital ciblant les jeunes : campagnes sur les réseaux sociaux et partenariats avec des influenceurs."],
            ['Tendances de consommation', "Intérêt pour les véhicules écologiques et connectés, demande de voitures compactes et de solutions respectueuses de l'environnement."],
            ['Attirance des jeunes', 'Fonctionnalités, style, pratiques durables.'],
          ],
        },
      },
      {
        intitule: 'Les types de véhicules de la gamme (annexe 3).',
        documents: ['Document 6', 'Annexe 3'],
        bareme: 4,
        reponse: 'Voir tableau.',
        tableau: {
          colonnes: ['Type 1', 'Type 2', 'Type 3', 'Type 4'],
          lignes: [
            ['Citadines', 'SUV', 'Électriques et hybrides', 'Utilitaires'],
          ],
        },
      },
      {
        intitule: 'Les points forts des modèles (annexe 4).',
        documents: ['Document 6', 'Annexe 4'],
        bareme: 2,
        reponse: "Le design moderne et la compacité de la C3 pour la vie urbaine ; l'espace intérieur généreux et les technologies avancées du C5 Aircross.",
      },
      {
        intitule: 'Le nouveau modèle (annexe 5).',
        documents: ['Document 7', 'Annexe 5'],
        bareme: 2,
        reponse: "Le nouveau modèle lancé par Citroën en 2023 est la ë-C3, un véhicule entièrement électrique.",
      },
      {
        intitule: 'La réponse à la demande de véhicules électriques (annexe 6).',
        documents: ['Document 6', 'Annexe 6'],
        bareme: 2,
        reponse: "Citroën développe plusieurs modèles électriques, dont la ë-C3, qui offre une autonomie de 300 km et intègre des technologies optimisées pour l'efficacité énergétique.",
      },
      {
        intitule: 'La nouvelle technologie (annexe 7).',
        documents: ['Document 6', 'Annexe 7'],
        bareme: 2,
        reponse: "Les modèles récents intègrent des systèmes d'assistance à la conduite et des technologies de connectivité avancées pour améliorer le confort et la sécurité des passagers.",
      },
    ],
  },
  synthese: {
    titre: 'La présentation de l\'entreprise Citroën',
    proposition: ['Renault', 'Peugeot', 'Volkswagen', 'Toyota', 'Citadines', 'SUV', 'Électriques et hybrides', 'Utilitaires', 'Fonctionnalités', 'Style', 'Pratiques durables'],
    racine: {
      id: 'racine',
      texte: 'Le marché de Citroën',
      enfants: [
        {
          id: 'conc', texte: 'Les 4 concurrents',
          enfants: [
            { id: 'c1', texte: null, reponse: 'Renault' },
            { id: 'c2', texte: null, reponse: 'Peugeot' },
            { id: 'c3', texte: null, reponse: 'Volkswagen' },
            { id: 'c4', texte: null, reponse: 'Toyota' },
          ],
        },
        {
          id: 'prod', texte: 'Les 4 types de véhicules',
          enfants: [
            { id: 'p1', texte: null, reponse: 'Citadines' },
            { id: 'p2', texte: null, reponse: 'SUV' },
            { id: 'p3', texte: null, reponse: 'Électriques et hybrides' },
            { id: 'p4', texte: null, reponse: 'Utilitaires' },
          ],
        },
        {
          id: 'jeune', texte: "L'attirance des jeunes (3 critères)",
          enfants: [
            { id: 'j1', texte: null, reponse: 'Fonctionnalités' },
            { id: 'j2', texte: null, reponse: 'Style' },
            { id: 'j3', texte: null, reponse: 'Pratiques durables' },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: "Rechercher des informations sur l'entreprise",
        indicateurs: [
          { niveau: 'novice', description: "Je ne retrouve pas les informations dans les documents." },
          { niveau: 'debrouille', description: 'Je retrouve quelques informations.' },
          { niveau: 'averti', description: "Je retrouve la plupart des informations demandées." },
          { niveau: 'expert', description: "Je retrouve et organise toutes les informations clés." },
        ],
      },
      {
        id: 'c2', intitule: 'Analyser le marché',
        indicateurs: [
          { niveau: 'novice', description: "Je ne sais pas identifier les concurrents." },
          { niveau: 'debrouille', description: 'Je cite un ou deux concurrents.' },
          { niveau: 'averti', description: 'Je distingue concurrents, segments et tendances.' },
          { niveau: 'expert', description: 'Je relie marché, positionnement et tendances de consommation.' },
        ],
      },
      {
        id: 'c3', intitule: 'Étudier la gamme de produits',
        indicateurs: [
          { niveau: 'novice', description: "Je ne connais pas la gamme." },
          { niveau: 'debrouille', description: 'Je cite un ou deux types de véhicules.' },
          { niveau: 'averti', description: 'Je liste les 4 types de véhicules.' },
          { niveau: 'expert', description: 'Je relie les modèles à leurs points forts et innovations.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Citadine', definition: 'Voiture compacte conçue pour les trajets urbains (ex : C3).' },
      { terme: 'SUV', definition: 'Véhicule spacieux et surélevé (ex : C5 Aircross).' },
      { terme: 'Véhicule électrique', definition: 'Véhicule fonctionnant uniquement à l\'électricité (ex : ë-C3).' },
      { terme: 'Mobilité durable', definition: 'Solutions de transport respectueuses de l\'environnement.' },
      { terme: 'Marketing digital', definition: 'Promotion via Internet et les réseaux sociaux.' },
      { terme: "Chiffre d'affaires", definition: "Montant total des ventes de l'entreprise." },
      { terme: 'Positionnement', definition: 'Place qu\'occupe une marque sur son marché par rapport aux concurrents.' },
      { terme: 'Tendance de consommation', definition: 'Évolution des comportements et attentes des clients.' },
    ],
    flashcards: [
      { recto: 'Qui a fondé Citroën et en quelle année ?', verso: 'André Citroën, en 1919.' },
      { recto: "Secteur d'activité de Citroën ?", verso: 'Automobile.' },
      { recto: "Chiffre d'affaires en 2023 ?", verso: "20 milliards d'euros." },
      { recto: 'Nombre de véhicules vendus en 2023 ?', verso: '1,2 million.' },
      { recto: 'Deux modèles marquants ?', verso: 'Traction Avant (1934) et 2CV (1948).' },
      { recto: 'Les 4 concurrents principaux ?', verso: 'Renault, Peugeot, Volkswagen, Toyota.' },
      { recto: 'Les 2 segments principaux ?', verso: 'Citadines et SUV.' },
      { recto: 'Les 4 types de véhicules de la gamme ?', verso: 'Citadines, SUV, électriques et hybrides, utilitaires.' },
      { recto: 'Nouveau modèle 2023 ?', verso: 'La ë-C3, entièrement électrique.' },
      { recto: 'Autonomie de la ë-C3 ?', verso: '300 km.' },
    ],
    quiz: [
      { type: 'unique', question: 'Qui a fondé Citroën ?', options: ['André Citroën', 'Louis Renault', 'Armand Peugeot', 'Henri Ford'], bonne: 0 },
      { type: 'unique', question: 'En quelle année Citroën a-t-elle été créée ?', options: ['1919', '1934', '1948', '1900'], bonne: 0 },
      { type: 'unique', question: "Secteur d'activité de Citroën ?", options: ['Automobile', 'Aéronautique', 'Énergie', 'Informatique'], bonne: 0 },
      { type: 'unique', question: "Chiffre d'affaires 2023 ?", options: ["20 milliards d'euros", "2 milliards d'euros", "200 millions d'euros", "50 milliards d'euros"], bonne: 0 },
      { type: 'unique', question: 'Combien de véhicules vendus en 2023 ?', options: ['1,2 million', '12 millions', '120 000', '500 000'], bonne: 0 },
      { type: 'unique', question: 'Lequel n\'est PAS un concurrent cité ?', options: ['Ferrari', 'Renault', 'Peugeot', 'Toyota'], bonne: 0 },
      { type: 'unique', question: 'Les 2 segments principaux de Citroën ?', options: ['Citadines et SUV', 'Berlines et coupés', 'Camions et bus', 'Motos et scooters'], bonne: 0 },
      { type: 'unique', question: 'Nouveau modèle électrique 2023 ?', options: ['ë-C3', '2CV', 'C5 Aircross', 'Berlingo'], bonne: 0 },
      { type: 'unique', question: 'Autonomie de la ë-C3 ?', options: ['300 km', '100 km', '600 km', '150 km'], bonne: 0 },
      { type: 'unique', question: 'Quelle méthode pour conquérir le marché ?', options: ['Marketing digital et influenceurs', 'Baisse des prix uniquement', 'Publicité télévisée seule', 'Vente par correspondance'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque élément dans la bonne catégorie.',
      etiquettes: ['Concurrent', 'Type de véhicule', "Valeur de la marque"],
      zones: [
        { libelle: 'Renault', etiquetteIndex: 0 },
        { libelle: 'Toyota', etiquetteIndex: 0 },
        { libelle: 'Citadine', etiquetteIndex: 1 },
        { libelle: 'SUV', etiquetteIndex: 1 },
        { libelle: 'Innovation', etiquetteIndex: 2 },
        { libelle: 'Durabilité', etiquetteIndex: 2 },
      ],
    },
  },
}

// ---------------------------------------------------------------------------
// CONTENU : Citroen, mission 2 - Le processus d'achat chez Citroen
// ---------------------------------------------------------------------------
const CITROEN_M2: ContenuMission = { //x
  
  travaux: {
    consigne:
      "Étudiez le processus d'achat d'un véhicule chez Citroën, de la prise de contact jusqu'à l'accord final du client.",
    contexte:
      "Votre responsable vous demande maintenant d'étudier le processus d'achat d'un véhicule chez Citroën. Vous en profitez pour découvrir les différentes étapes que suit un client, depuis la prise de contact initiale avec le concessionnaire jusqu'à l'accord final pour l'achat du véhicule. Chaque étape est essentielle pour garantir une expérience client positive.",
    documents: [
      { numero: 1, titre: 'Comment prendre contact avec un client', images: [], texte: [
        { paragraphes: ['La prise de contact avec un client est une étape cruciale dans le processus de vente. Voici quelques étapes clés à suivre :'] },
        { puces: [
          'Préparation : Avant d\u2019aborder le client, assurez-vous de connaître les produits que vous proposez et d\'être informé des promotions en cours. Ayez également un sourire accueillant et un langage corporel ouvert.',
          'Accueillir le client : Lorsque vous approchez le client, saluez-le avec courtoisie et présentez-vous.',
          'Écouter : Posez des questions ouvertes pour comprendre les besoins et les attentes du client. Montrez un intérêt sincère pour ses souhaits.',
          'Créer un lien : Engagez la conversation sur des sujets d\'intérêt commun, comme l\'automobile ou les besoins spécifiques du client. Cela aide à établir une relation de confiance.',
          'Transmettre des informations : Donnez des informations pertinentes sur les véhicules, en mettant en avant leurs caractéristiques et avantages.',
          'Proposer une suite : Suggérez de visiter les véhicules disponibles ou de fixer un rendez-vous pour une démonstration.',
        ] },
      ] },
      { numero: 2, titre: 'Dialogue entre Clara et son père', images: [], texte: [
        { dialogue: [
          { texte: 'Clara et son père Marc sont dans la concession Citroën, et regarde les voitures.', italique: true },
          { locuteur: 'Clara', texte: 'Bonjour, papa. Je pense qu\'il est temps que je choisisse ma première voiture. J\'ai quelques critères en tête.' },
          { locuteur: 'Marc', texte: 'Bien sûr, Clara. Quels sont tes critères ?' },
          { locuteur: 'Clara', texte: 'Eh bien, je voudrais une voiture qui soit :' },
        ] },
        { puces: [
          'Économique en carburant,',
          'Assez petite pour se garer facilement en ville,',
          'Équipée de la technologie Bluetooth pour écouter ma musique et passer des appels,',
          'Et idéalement, une voiture avec une bonne sécurité.',
        ] },
        { dialogue: [
          { locuteur: 'Marc', texte: 'Ça a l\'air bien réfléchi. Est-ce que tu as un budget en tête ?' },
          { locuteur: 'Clara', texte: 'Je préfère ne pas dépasser 20 000 euros, si possible.' },
        ] },
      ] },
      { numero: 3, titre: 'Critères détaillés de Clara pour sa voiture', images: [], texte: [
        { dialogue: [
          { texte: 'Vous vous approchez de Clara et son père Marc pour leur proposer des options.', italique: true },
        ] },
        { tableau: { colonnes: ['Critères', 'Détails'], lignes: [
          ['Économie de carburant', 'Clara souhaite une consommation inférieure à 5 L/100 km.'],
          ['Taille compacte', 'Elle préfère un modèle de moins de 4 mètres de long pour faciliter le stationnement.'],
          ['Technologie', 'Elle veut un système Bluetooth, un écran tactile, et éventuellement une caméra de recul.'],
          ['Sécurité', "Clara recherche des véhicules avec au moins 5 étoiles aux tests Euro NCAP et des systèmes d'aide à la conduite (freinage d'urgence, aide au maintien de voie)."],
          ['Budget', 'Elle a un budget maximum de 20 000 euros, mais souhaite également connaître les options de financement.'],
        ] } },
      ] },
      { numero: 4, titre: 'Dialogue entre Vous, Clara et son père Marc', images: [], texte: [
        { dialogue: [
          { texte: 'Vous vous approchez de Clara et son père Marc pour leur proposer des options.', italique: true },
          { locuteur: 'Vous', texte: '« Bonjour, Clara et Marc. Je comprends que vous cherchez une citadine pour Clara. Voici trois modèles qui pourraient correspondre à vos critères. »' },
          { locuteur: 'Clara', texte: '« Oui, nous avons quelques critères en tête. »' },
          { locuteur: 'Vous', texte: '« Parfait, regardons les options. »' },
        ] },
      ] },
      {
        numero: 5,
        titre: 'Fiches techniques des véhicules que vous proposez',
        images: [],
        catalogueVehicules: {
          titreLogiciel: 'Citroën — Catalogue véhicules',
          intro: 'Cliquez sur un véhicule pour consulter sa fiche technique complète.',
          vehicules: [
            {
              id: 'c3',
              nom: 'Citroën C3',
              type: 'Citadine',
              prix: '19 500 euros',
              sections: [
                { titre: 'Caractéristiques', lignes: [
                  { libelle: 'Modèle', valeur: 'Citroën C3' },
                  { libelle: 'Type', valeur: 'Citadine' },
                  { libelle: 'Moteur', valeur: '1.2 PureTech 110 ch' },
                  { libelle: 'Transmission', valeur: 'Manuelle à 6 vitesses / Automatique' },
                  { libelle: 'Consommation', valeur: '4,8 L/100 km (cycle mixte)' },
                  { libelle: 'Émissions de CO2', valeur: '109 g/km' },
                ] },
                { titre: 'Dimensions', lignes: [
                  { libelle: 'Longueur', valeur: '3 994 mm' },
                  { libelle: 'Largeur', valeur: '1 749 mm' },
                  { libelle: 'Hauteur', valeur: '1 467 mm' },
                  { libelle: 'Capacité du coffre', valeur: '300 L' },
                ] },
                { titre: 'Équipements', lignes: [
                  { valeur: "Système d'info-divertissement avec écran tactile 7 pouces" },
                  { valeur: 'Connectivité Bluetooth et USB' },
                  { valeur: '6 airbags (avant, latéraux, rideaux)' },
                  { valeur: 'Aide au stationnement arrière' },
                  { valeur: 'Climatisation manuelle' },
                ] },
                { titre: 'Sécurité', lignes: [
                  { valeur: 'Note de sécurité : 5 étoiles Euro' },
                  { valeur: "Système de freinage d'urgence automatique" },
                ] },
                { titre: 'Tarif et garantie', lignes: [
                  { libelle: 'Prix', valeur: '19 500 euros' },
                  { libelle: 'Garantie', valeur: '5 ans ou 100 000 km' },
                ] },
              ],
            },
            {
              id: 'c4',
              nom: 'Citroën C4',
              type: 'Berline compacte',
              prix: '21 000 euros',
              sections: [
                { titre: 'Caractéristiques', lignes: [
                  { libelle: 'Modèle', valeur: 'Citroën C4' },
                  { libelle: 'Type', valeur: 'Berline compacte' },
                  { libelle: 'Moteur', valeur: '1.5 BlueHDi 130 ch.' },
                  { libelle: 'Transmission', valeur: 'Manuelle à 6 vitesses / Automatique' },
                  { libelle: 'Consommation', valeur: '5,2 L/100 km (cycle mixte)' },
                  { libelle: 'Émissions de CO2', valeur: '122 g/km' },
                ] },
                { titre: 'Dimensions', lignes: [
                  { libelle: 'Longueur', valeur: '4 360 mm' },
                  { libelle: 'Largeur', valeur: '1 830 mm' },
                  { libelle: 'Hauteur', valeur: '1 525 mm' },
                  { libelle: 'Capacité du coffre', valeur: '380 L' },
                ] },
                { titre: 'Équipements', lignes: [
                  { valeur: 'Système de navigation intégré' },
                  { valeur: 'Connectivité Bluetooth et Apple CarPlay/Android Auto' },
                  { valeur: '6 airbags (avant, latéraux, rideaux)' },
                  { valeur: 'Aide au stationnement avant et arrière' },
                  { valeur: 'Climatisation automatique' },
                ] },
                { titre: 'Sécurité', lignes: [
                  { valeur: 'Note de sécurité : 5 étoiles Euro NCAP' },
                  { valeur: 'Système de contrôle de la stabilité' },
                  { valeur: 'Alerte de franchissement de ligne' },
                ] },
                { titre: 'Tarif et garantie', lignes: [
                  { libelle: 'Prix', valeur: '21 000 euros' },
                  { libelle: 'Garantie', valeur: '5 ans ou 100 000 km' },
                ] },
              ],
            },
            {
              id: 'ec3',
              nom: 'Citroën ë-C3',
              type: 'Citadine électrique',
              prix: '24 000 euros',
              badge: 'Électrique',
              sections: [
                { titre: 'Caractéristiques', lignes: [
                  { libelle: 'Modèle', valeur: 'Citroën ë-C3' },
                  { libelle: 'Type', valeur: 'Citadine électrique' },
                  { libelle: 'Moteur', valeur: 'Électrique 136 ch.' },
                  { libelle: 'Transmission', valeur: 'Automatique' },
                  { libelle: 'Autonomie', valeur: '300 km (cycle WLTP)' },
                  { libelle: 'Consommation', valeur: '0,0 L/100 km' },
                  { libelle: 'Émissions de CO2', valeur: '0 g/km' },
                ] },
                { titre: 'Temps de recharge', lignes: [
                  { valeur: 'Recharge rapide (80% en 30 minutes)' },
                  { valeur: 'Recharge domestique (0 à 100% en 7 heures)' },
                ] },
                { titre: 'Dimensions', lignes: [
                  { libelle: 'Longueur', valeur: '4 000 mm' },
                  { libelle: 'Largeur', valeur: '1 749 mm' },
                  { libelle: 'Hauteur', valeur: '1 467 mm' },
                  { libelle: 'Capacité du coffre', valeur: '311 L' },
                ] },
                { titre: 'Équipements', lignes: [
                  { valeur: 'Écran tactile 10 pouces avec navigation' },
                  { valeur: 'Connectivité Bluetooth et USB' },
                  { valeur: '6 airbags (avant, latéraux, rideaux)' },
                  { valeur: 'Aide au stationnement arrière' },
                  { valeur: 'Climatisation automatique' },
                  { valeur: 'Système de régulateur de vitesse adaptatif' },
                ] },
                { titre: 'Sécurité', lignes: [
                  { valeur: 'Note de sécurité : 5 étoiles Euro' },
                  { valeur: 'Système de détection de fatigue' },
                  { valeur: "Système de freinage d'urgence automatique" },
                ] },
                { titre: 'Tarif et garantie', lignes: [
                  { libelle: 'Prix', valeur: '24 000 euros' },
                  { libelle: 'Garantie', valeur: '8 ans ou 160 000 km pour la batterie' },
                ] },
              ],
            },
          ],
        },
      },
      { numero: 6, titre: "La procédure d'accord du client", images: [], texte: [
        { intertitre: 'Étape 1 : Évaluation des options', paragraphes: [
          'Marc, conscient que c\'est un moment important pour sa fille, propose de faire un dernier point sur les options. « Alors Clara, qu\'est-ce qui te plaît le plus dans la C3 par rapport aux autres modèles ? » demande-t-il. Clara réfléchit un instant et répond : « Je trouve qu\u2019elle est parfaite pour mes trajets au lycée. Elle est économique, et j\u2019adore les fonctionnalités connectées. En plus, elle est assez compacte pour me garer facilement en ville. »',
          'En tant que vendeur, vous intervenez pour confirmer son choix. « La C3 est effectivement une excellente option, Clara. En plus de ses équipements, elle a reçu d\'excellentes notes en matière de sécurité. »',
        ] },
        { intertitre: 'Étape 2 : Choix du modèle', paragraphes: [
          'Après cette discussion, Clara prend sa décision. « Je suis prête à avancer avec la Citroën C3, » déclare-t-elle avec un sourire. Marc acquiesce, fier de sa fille. « Très bien, je pense que c\u2019est un bon choix. »',
        ] },
        { intertitre: 'Étape 3 : Discussion sur le financement', paragraphes: [
          'Vous commencez alors à expliquer les différentes options de financement. « Nous avons plusieurs solutions qui peuvent convenir. » « Si vous le souhaitez, nous pouvons discuter d\'un crédit auto classique ou d\'un leasing. Cela dépend vraiment de ce que vous préférez. »',
          'Marc demande : « Quels sont les avantages de chaque option ? » Vous lui expliquez : « Avec un crédit, vous devenez propriétaire de la voiture dès le premier paiement, tandis qu\u2019avec un leasing, vous payez pour utiliser le véhicule pendant une période déterminée. Les mensualités peuvent être plus faibles avec le leasing, mais vous n\u2019avez pas de propriété à la fin du contrat. »',
          'Clara et Marc prennent le temps de réfléchir. Clara, ayant un budget limité, se demande ce qui serait le mieux pour elle. Vous proposez de préparer un tableau comparatif des deux options pour faciliter la décision.',
        ] },
        { intertitre: 'Étape 4 : Signature du contrat', paragraphes: [
          'Une fois le choix du financement fait, Vous invitez Clara et Marc à votre bureau pour finaliser la transaction. Vous sortez un contrat de vente détaillé. « Voici le contrat. Je vais vous expliquer chaque section, pour que vous soyez à l\u2019aise avec tout ce qui y est inscrit. »',
          'Vous parcourez les clauses du contrat, expliquant les conditions de garantie, les assurances possibles et les obligations liées au financement. Clara écoute attentivement, posant des questions sur les aspects qui lui semblent flous. Après avoir clarifié tous les points, elle se sent prête à signer.',
          '« Je suis vraiment excitée de commencer cette nouvelle aventure avec ma première voiture, » dit-elle en signant le document. Marc sourit, heureux de voir sa fille si enthousiaste.',
        ] },
        { intertitre: 'Étape 5 : Remise des clés', paragraphes: [
          'Après la signature, Vous les accompagnez vers la voiture. « Voilà, votre nouvelle Citroën C3 est prête ! » dites-vous en ouvrant la porte. Clara monte à l\u2019intérieur, et vous lui montrez les différentes fonctionnalités, y compris le système de navigation, le Bluetooth, et l\u2019aide au stationnement.',
          '« N\u2019oubliez pas de vérifier le manuel pour toute question, et vous pouvez toujours revenir ici si vous avez besoin d\'assistance, » concluez-vous.',
        ] },
      ] },
    ],
    competence: {
      groupe: 'Groupe de compétences 1',
      intitule: 'Prendre contact avec le client',
      detail:
        "Découvrir, analyser et identifier les besoins du client, proposer les produits et/ou les services, formaliser l'accord du client.",
    },
    objectifs: [
      'Maîtriser les étapes de la prise de contact avec un client en concession.',
      "Découvrir et analyser les besoins d'une cliente pour lui proposer un véhicule adapté.",
      "Suivre le processus de finalisation de l'achat jusqu'à l'accord du client.",
    ],
    activites: [
      {
        titre: 'Activité 1 — Prise de contact en face-à-face',
        questions: [
          { numero: 1, consigne: 'Énumérez les étapes clés à suivre lors de la prise de contact avec un client dans une concession automobile.', ressources: "Consulter le document 1, compléter l'annexe 1. [C.1.2]", annexeId: 'annexe1' },
          { numero: 2, consigne: "Indiquez pourquoi il est important d'avoir une bonne préparation avant d'aborder un client.", ressources: "Consulter le document 1, compléter l'annexe 2. [C.1.2]", annexeId: 'annexe2' },
          { numero: 3, consigne: 'Créez 2 questions ouvertes et 2 questions fermées qui seront posées au client pour mieux découvrir ses besoins.', ressources: "Consulter le document 1, compléter l'annexe 3. [C.1.2]", annexeId: 'annexe3' },
          { numero: 4, consigne: 'Expliquez comment un vendeur peut créer un lien de confiance avec le client lors de la première rencontre.', ressources: "Consulter le document 1, compléter l'annexe 4. [C.1.2]", annexeId: 'annexe4' },
          { numero: 5, consigne: "Indiquez l'importance de donner aux clients des informations utiles sur les véhicules.", ressources: "Consulter le document 1, compléter l'annexe 5. [C.1.2]", annexeId: 'annexe5' },
        ],
      },
      {
        titre: 'Activité 2 — Découverte des besoins',
        questions: [
          { numero: 6, consigne: 'Énumérez les critères mentionnés par Clara pour sa voiture.', ressources: "Consulter le document 2 et le document 3, compléter l'annexe 6. [C.1.2]", annexeId: 'annexe6' },
          { numero: 7, consigne: 'Indiquez pourquoi la taille de la voiture est importante pour Clara.', ressources: "Consulter le document 2, compléter l'annexe 7. [C.1.2]", annexeId: 'annexe7' },
          { numero: 8, consigne: 'Donnez le budget maximum que Clara souhaite respecter.', ressources: "Consulter le document 2, compléter l'annexe 8. [C.1.2]", annexeId: 'annexe8' },
        ],
      },
      {
        titre: "Activité 3 — La proposition d'une voiture",
        questions: [
          { numero: 9, consigne: 'Citez les 3 modèles proposés par le vendeur.', ressources: "Consulter le document 4, compléter l'annexe 9. [C.1.2]", annexeId: 'annexe9' },
          { numero: 10, consigne: 'Indiquez quel modèle est entièrement électrique et quel est son prix.', ressources: "Consulter le document 5, compléter l'annexe 9. [C.1.2]", annexeId: 'annexe9' },
          { numero: 11, consigne: 'Donnez le nom du modèle le plus économique en termes de consommation de carburant. Justifiez votre réponse.', ressources: "Consulter le document 5, compléter l'annexe 9. [C.1.2]", annexeId: 'annexe9' },
          { numero: 12, consigne: 'Précisez quel équipement commun est présent sur les 3 véhicules.', ressources: "Consulter le document 5, compléter l'annexe 9. [C.1.2]", annexeId: 'annexe9' },
          { numero: 13, consigne: 'Citez le modèle qui dépasse le budget de Clara. Justifiez votre réponse.', ressources: "Consulter le document 5, compléter l'annexe 9. [C.1.2]", annexeId: 'annexe9' },
        ],
      },
      {
        titre: "Activité 4 — L'accord du client",
        questions: [
          { numero: 14, consigne: "Citez les étapes que Clara et son père doivent suivre pour finaliser l'achat de la voiture.", ressources: "Consulter le document 6, compléter l'annexe 10. [C.1.2]", annexeId: 'annexe10' },
          { numero: 15, consigne: "Indiquez les 2 types d'options de financement proposé par le vendeur.", ressources: "Consulter le document 6, compléter l'annexe 11. [C.1.2]", annexeId: 'annexe11' },
          { numero: 16, consigne: 'Selon vous, pourquoi est-il importante que Clara comprenne bien le contrat avant de le signer.', ressources: "Consulter le document 6, compléter l'annexe 12. [C.1.2]", annexeId: 'annexe12' },
          { numero: 17, consigne: 'Racontez ce qui se passe au moment de la remise des clés.', ressources: "Consulter le document 6, compléter l'annexe 12. [C.1.2]", annexeId: 'annexe12' },
        ],
      },
    ],
    annexes: [
      { type: 'grille', id: 'annexe1', titre: 'Annexe 1 — Les étapes clés', colonnes: ['Étape', 'Réponse'], nbLignes: 6 },
      { type: 'texte', id: 'annexe2', titre: "Annexe 2 — L'importance d'une bonne préparation", lignes: 3 },
      { type: 'grille', id: 'annexe3', titre: 'Annexe 3 — Questions aux clients', colonnes: ['4 questions', 'Réponse'], nbLignes: 4 },
      { type: 'texte', id: 'annexe4', titre: 'Annexe 4 — Création du lien de confiance', lignes: 3 },
      { type: 'texte', id: 'annexe5', titre: "Annexe 5 — Importance de donner des informations sur le véhicule", lignes: 3 },
      { type: 'grille', id: 'annexe6', titre: 'Annexe 6 — Critères de Clara pour sa voiture', colonnes: ['5 critères', 'Réponse'], nbLignes: 5 },
      { type: 'texte', id: 'annexe7', titre: 'Annexe 7 — Taille du véhicule', lignes: 3 },
      { type: 'texte', id: 'annexe8', titre: 'Annexe 8 — Budget', lignes: 2 },
      { type: 'grille', id: 'annexe9', titre: "Annexe 9 — Proposition d'une voiture", colonnes: ['Élément', 'Réponse'], nbLignes: 7 },
      { type: 'grille', id: 'annexe10', titre: "Annexe 10 — Étapes de finalisation de l'achat", colonnes: ['Étape', 'Réponse'], nbLignes: 5 },
      { type: 'texte', id: 'annexe11', titre: 'Annexe 11 — Options de financement', lignes: 2 },
      { type: 'grille', id: 'annexe12', titre: 'Annexe 12 — Lire le contrat et la remise des clés', colonnes: ['Élément', 'Réponse'], nbLignes: 2 },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: 'Les étapes clés (annexe 1).',
        documents: ['Document 1', 'Annexe 1'],
        bareme: 6,
        reponse: 'Voir tableau.',
        tableau: {
          colonnes: ['Étape', 'Réponse'],
          lignes: [
            ['Étape 1', 'La préparation'],
            ['Étape 2', "L'accueil du client"],
            ['Étape 3', "L'écoute des besoins"],
            ['Étape 4', "La création d'un lien"],
            ['Étape 5', "La transmission d'information sur les produits"],
            ['Étape 6', "La proposition d'une suite"],
          ],
        },
      },
      {
        intitule: "L'importance d'une bonne préparation (annexe 2).",
        documents: ['Document 1', 'Annexe 2'],
        bareme: 2,
        reponse:
          "Une bonne préparation permet au vendeur de connaître les produits, les promotions, et d'adopter une attitude accueillante, ce qui contribue à établir une relation de confiance dès le départ.",
      },
      {
        intitule: 'Questions aux clients (annexe 3).',
        documents: ['Document 1', 'Annexe 3'],
        bareme: 4,
        reponse: 'Voir tableau.',
        tableau: {
          colonnes: ['4 questions', 'Réponse'],
          lignes: [
            ['Question 1', '« Que recherchez-vous dans une voiture ? »'],
            ['Question 2', '« Quels sont vos critères principaux ? »'],
            ['Question 3', '« Avez-vous un type de voiture en tête ? »'],
            ['Question 4', '« Pour quel type d\'utilisation recherchez-vous une voiture ? »'],
          ],
        },
      },
      {
        intitule: 'Création du lien de confiance (annexe 4).',
        documents: ['Document 1', 'Annexe 4'],
        bareme: 2,
        reponse:
          "En s'engageant dans une conversation amicale, en posant des questions sur les besoins spécifiques du client, et en montrant un intérêt sincère pour ses souhaits.",
      },
      {
        intitule: "Importance de donner des informations sur le véhicule (annexe 5).",
        documents: ['Document 1', 'Annexe 5'],
        bareme: 2,
        reponse:
          "Transmettre des informations pertinentes aide le client à prendre une décision éclairée et démontre que le vendeur connaît bien ses produits, renforçant ainsi la confiance.",
      },
      {
        intitule: 'Critères de Clara pour sa voiture (annexe 6).',
        documents: ['Documents 2 et 3', 'Annexe 6'],
        bareme: 5,
        reponse: 'Voir tableau.',
        tableau: {
          colonnes: ['5 critères', 'Réponse'],
          lignes: [
            ['Critère 1', 'Économique en carburant'],
            ['Critère 2', 'Taille compacte'],
            ['Critère 3', 'Équipée de technologie Bluetooth'],
            ['Critère 4', 'Bonne sécurité'],
            ['Critère 5', 'Budget maximum de 20 000 euros'],
          ],
        },
      },
      {
        intitule: 'Taille du véhicule (annexe 7).',
        documents: ['Document 2', 'Annexe 7'],
        bareme: 2,
        reponse:
          "Clara souhaite une voiture suffisamment petite pour faciliter le stationnement en ville, ce qui est crucial pour ses trajets quotidiens au lycée.",
      },
      {
        intitule: 'Budget (annexe 8).',
        documents: ['Document 2', 'Annexe 8'],
        bareme: 2,
        reponse: "Clara ne souhaite pas dépasser 20 000 euros pour l'achat de sa voiture.",
      },
      {
        intitule: "Proposition d'une voiture (annexe 9).",
        documents: ['Documents 4 et 5', 'Annexe 9'],
        bareme: 10,
        reponse: 'Voir tableau.',
        tableau: {
          colonnes: ['Élément', 'Réponse'],
          lignes: [
            ['3 modèles', 'Citroën C3, Citroën C4, Citroën ë-C3'],
            ['Modèle complètement électrique et son prix', 'Citroën ë-C3 — Prix : 24 000 €'],
            ['Modèle le plus économique', 'La Citroën C3, avec une consommation de 4,8 L/100 km'],
            ['Équipement commun aux 3 véhicules', 'Un système de connectivité Bluetooth pour écouter de la musique et passer des appels.'],
            ['Modèle au-dessus de son budget', 'La Citroën C4, qui coûte 21 000 euros, dépasse le budget de Clara si elle souhaite rester sous 20 000 euros.'],
          ],
        },
      },
      {
        intitule: "Étapes de finalisation de l'achat (annexe 10).",
        documents: ['Document 6', 'Annexe 10'],
        bareme: 5,
        reponse: 'Voir tableau.',
        tableau: {
          colonnes: ['Étape', 'Réponse'],
          lignes: [
            ['Étape 1', 'Évaluation des options'],
            ['Étape 2', 'Choix du modèle'],
            ['Étape 3', 'Discussion sur le financement'],
            ['Étape 4', 'Signature du contrat'],
            ['Étape 5', 'Remise des clés'],
          ],
        },
      },
      {
        intitule: 'Options de financement (annexe 11).',
        documents: ['Document 6', 'Annexe 11'],
        bareme: 2,
        reponse: 'Le vendeur propose un crédit auto classique et un leasing.',
      },
      {
        intitule: 'Lire le contrat et la remise des clés (annexe 12).',
        documents: ['Document 6', 'Annexe 12'],
        bareme: 4,
        reponse: 'Voir tableau.',
        tableau: {
          colonnes: ['Élément', 'Réponse'],
          lignes: [
            ["L'importance de bien lire le contrat", "Comprendre le contrat est crucial pour connaître les conditions de garantie, les obligations de paiement et les options d'assurance, afin d'éviter les surprises après l'achat."],
            ['Le moment de la remise des clés', "Le vendeur montre à Clara les différentes fonctionnalités de la voiture, lui explique comment les utiliser, et l'encourage à revenir si elle a besoin d'assistance."],
          ],
        },
      },
    ],
  },
  synthese: {
    titre: "Le processus d'achat chez Citroën",
    proposition: ['La préparation', "L'accueil du client", "L'écoute des besoins", "La création d'un lien", "La transmission d'information", "La proposition d'une suite"],
    racine: {
      id: 'racine',
      texte: "Le processus d'achat",
      enfants: [
        {
          id: 'contact', texte: 'La prise de contact en face-à-face (6 étapes)',
          enfants: [
            { id: 'e1', texte: null, reponse: 'La préparation' },
            { id: 'e2', texte: null, reponse: "L'accueil du client" },
            { id: 'e3', texte: null, reponse: "L'écoute des besoins" },
            { id: 'e4', texte: null, reponse: "La création d'un lien" },
            { id: 'e5', texte: null, reponse: "La transmission d'information" },
            { id: 'e6', texte: null, reponse: "La proposition d'une suite" },
          ],
        },
        {
          id: 'etapes', texte: 'Les autres étapes du processus',
          enfants: [
            { id: 'b1', texte: 'La découverte des besoins' },
            { id: 'b2', texte: "La proposition d'une voiture" },
            { id: 'b3', texte: "L'accord du client" },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: 'Prendre contact avec le client',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas les étapes de la prise de contact.' },
          { niveau: 'debrouille', description: 'Je cite quelques étapes de la prise de contact.' },
          { niveau: 'averti', description: 'Je connais les 6 étapes de la prise de contact.' },
          { niveau: 'expert', description: "Je relie chaque étape à son rôle dans la relation de confiance." },
        ],
      },
      {
        id: 'c2', intitule: 'Découvrir et analyser les besoins',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne retrouve pas les critères du client.' },
          { niveau: 'debrouille', description: 'Je retrouve un ou deux critères.' },
          { niveau: 'averti', description: 'Je liste tous les critères et le budget du client.' },
          { niveau: 'expert', description: 'Je relie les critères du client aux véhicules proposés.' },
        ],
      },
      {
        id: 'c3', intitule: "Proposer un produit et formaliser l'accord",
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas quel véhicule proposer.' },
          { niveau: 'debrouille', description: 'Je propose un véhicule sans justifier.' },
          { niveau: 'averti', description: 'Je propose un véhicule adapté et justifie mon choix.' },
          { niveau: 'expert', description: "Je conduis le client jusqu'à l'accord et la remise des clés." },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Prise de contact', definition: "Première étape de la vente où le vendeur établit le contact avec le client." },
      { terme: 'Question ouverte', definition: "Question qui invite le client à s'exprimer librement (commence souvent par pourquoi, comment, que)." },
      { terme: 'Question fermée', definition: 'Question à laquelle on répond par oui, non ou une information précise.' },
      { terme: 'Découverte des besoins', definition: "Étape où le vendeur identifie les attentes et critères du client." },
      { terme: 'Citadine', definition: 'Voiture compacte conçue pour les trajets urbains (ex : C3).' },
      { terme: 'Véhicule électrique', definition: "Véhicule fonctionnant uniquement à l'électricité (ex : ë-C3)." },
      { terme: 'Crédit auto', definition: 'Financement par lequel le client devient propriétaire du véhicule dès le premier paiement.' },
      { terme: 'Leasing', definition: "Location du véhicule pendant une période déterminée, sans propriété à la fin du contrat." },
      { terme: 'Contrat de vente', definition: 'Document détaillant les conditions de garantie, les assurances et les obligations de financement.' },
      { terme: 'Remise des clés', definition: "Dernière étape de la vente où le vendeur remet le véhicule et présente ses fonctionnalités." },
    ],
    flashcards: [
      { recto: 'Quelle est la première étape de la prise de contact ?', verso: 'La préparation.' },
      { recto: 'Combien y a-t-il d\'étapes dans la prise de contact ?', verso: 'Six étapes.' },
      { recto: 'Quels sont les critères de Clara ?', verso: 'Économique, taille compacte, Bluetooth, bonne sécurité, budget de 20 000 euros.' },
      { recto: 'Quel est le budget maximum de Clara ?', verso: '20 000 euros.' },
      { recto: 'Quels sont les 3 modèles proposés ?', verso: 'Citroën C3, Citroën C4, Citroën ë-C3.' },
      { recto: 'Quel modèle est entièrement électrique et à quel prix ?', verso: 'La ë-C3, à 24 000 euros.' },
      { recto: 'Quel est le modèle le plus économique en carburant ?', verso: 'La C3, avec 4,8 L/100 km.' },
      { recto: 'Quel équipement est commun aux 3 véhicules ?', verso: 'La connectivité Bluetooth.' },
      { recto: 'Quel modèle dépasse le budget de Clara ?', verso: 'La C4, à 21 000 euros.' },
      { recto: 'Quelles sont les 2 options de financement ?', verso: 'Le crédit auto classique et le leasing.' },
    ],
    quiz: [
      { type: 'unique', question: 'Quelle est la première étape de la prise de contact ?', options: ['La préparation', "L'accueil du client", 'La proposition', 'La signature'], bonne: 0 },
      { type: 'unique', question: 'Combien y a-t-il d\'étapes dans la prise de contact ?', options: ['6', '4', '5', '3'], bonne: 0 },
      { type: 'unique', question: 'Quel est le budget maximum de Clara ?', options: ['20 000 euros', '24 000 euros', '21 000 euros', '19 500 euros'], bonne: 0 },
      { type: 'unique', question: 'Quel modèle est entièrement électrique ?', options: ['La ë-C3', 'La C3', 'La C4', 'La C5 Aircross'], bonne: 0 },
      { type: 'unique', question: 'Quel est le prix de la ë-C3 ?', options: ['24 000 euros', '19 500 euros', '21 000 euros', '20 000 euros'], bonne: 0 },
      { type: 'unique', question: 'Quel modèle est le plus économique en carburant ?', options: ['La C3 (4,8 L/100 km)', 'La C4 (5,2 L/100 km)', 'La ë-C3', 'Aucun'], bonne: 0 },
      { type: 'unique', question: 'Quel équipement est commun aux 3 véhicules ?', options: ['La connectivité Bluetooth', 'La navigation intégrée', 'La climatisation automatique', 'Le régulateur adaptatif'], bonne: 0 },
      { type: 'unique', question: 'Quel modèle dépasse le budget de Clara ?', options: ['La C4 (21 000 euros)', 'La C3', 'La ë-C3', 'Aucun'], bonne: 0 },
      { type: 'unique', question: 'Que devient le client avec un crédit auto ?', options: ['Propriétaire dès le premier paiement', 'Locataire du véhicule', 'Sans aucune obligation', 'Propriétaire à la fin seulement'], bonne: 0 },
      { type: 'unique', question: "Quelle est la dernière étape du processus d'achat ?", options: ['La remise des clés', 'La signature', 'Le financement', "L'accueil"], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque élément dans la bonne catégorie.',
      etiquettes: ['Étape de la prise de contact', 'Critère de Clara', 'Option de financement'],
      zones: [
        { libelle: 'La préparation', etiquetteIndex: 0 },
        { libelle: "L'accueil du client", etiquetteIndex: 0 },
        { libelle: 'Économique en carburant', etiquetteIndex: 1 },
        { libelle: 'Bonne sécurité', etiquetteIndex: 1 },
        { libelle: 'Le crédit auto', etiquetteIndex: 2 },
        { libelle: 'Le leasing', etiquetteIndex: 2 },
      ],
    },
  },
}

const CITROEN_M3: ContenuMission = {
  travaux: {
    consigne:
      "Étudiez le suivi de la commande d'un véhicule chez Citroën, de la signature du contrat à la livraison, et apprenez à informer le client sur les conditions et les délais de livraison.",
    contexte:
      "Votre tuteur vous demande de vous concentrer sur le suivi de la commande d'un véhicule chez Citroën, depuis la signature du contrat jusqu'à la livraison finale. Il souhaite que vous découvriez les étapes clés de cette procédure, ainsi que les informations nécessaires à fournir au client concernant les conditions et délais de livraison.",
    documents: [
      { numero: 1, titre: 'Procédure de commande entre la signature du contrat et la livraison du véhicule', images: [], texte: [
        { paragraphes: ["La procédure de commande d'un véhicule chez Citroën se déroule en plusieurs étapes clés, garantissant une expérience client fluide et transparente. Voici un aperçu détaillé de cette procédure :"] },
        { intertitre: '1. Signature du contrat', paragraphes: ["Après la sélection du véhicule et la validation de l'offre, le client signe un contrat d'achat. Ce contrat inclut des détails sur le modèle choisi, les options sélectionnées, le prix total, et les modalités de paiement."] },
        { intertitre: '2. Confirmation de commande', paragraphes: ["Une fois le contrat signé, la commande est confirmée par le concessionnaire. Un numéro de commande unique est attribué, permettant de suivre l'évolution de celle-ci."] },
        { intertitre: '3. Production du véhicule', paragraphes: ["Citroën commence la production du véhicule selon les spécifications du client. Cette étape peut durer de quelques semaines à plusieurs mois, en fonction de la disponibilité des composants et des options choisies. Les clients peuvent recevoir des mises à jour sur l'état de la production via des notifications par e-mail ou par téléphone."] },
        { intertitre: '4. Contrôle qualité', paragraphes: ["Avant la livraison, chaque véhicule subit un contrôle qualité rigoureux pour s'assurer qu'il répond aux normes de sécurité et de performance de Citroën. Cela inclut des tests de fonctionnalité et une inspection visuelle."] },
        { intertitre: '5. Préparation à la livraison', paragraphes: ["Une fois le contrôle qualité terminé, le véhicule est préparé pour la livraison. Cela comprend le nettoyage, l'ajout d'accessoires (le cas échéant) et la vérification finale des documents administratifs nécessaires."] },
        { intertitre: '6. Livraison', paragraphes: ["Le client est contacté pour convenir d'un rendez-vous de livraison. Lors de la livraison, le concessionnaire explique les fonctionnalités du véhicule, remet les documents nécessaires (carte grise, garantie, manuel d'utilisation) et effectue une dernière inspection avec le client."] },
        { intertitre: '7. Suivi post-livraison', paragraphes: ["Après la livraison, un suivi est effectué par le concessionnaire pour s'assurer de la satisfaction du client et répondre à toute question éventuelle."] },
      ] },
      { numero: 2, titre: 'Conditions de livraison de la citadine', images: [], texte: [
        { paragraphes: ["La livraison d'un véhicule Citroën est soumise à certaines conditions afin d'assurer une transaction sécurisée et satisfaisante :"] },
        { puces: [
          "Disponibilité du modèle : La date de livraison dépend de la disponibilité du modèle et des options choisies. Les modèles en stock peuvent être livrés plus rapidement que ceux nécessitant une production spéciale.",
          "Documents requis : Avant la livraison, le client doit fournir des documents tels que son permis de conduire, une pièce d'identité, et tout document relatif au financement (si applicable).",
          "Contrôle de qualité : La livraison ne peut avoir lieu que si le véhicule a passé avec succès le contrôle qualité.",
          "Modalités de paiement : Le paiement doit être effectué dans les délais convenus dans le contrat avant la livraison. Si un financement est choisi, les conditions doivent être approuvées.",
          "Respect des délais : Citroën s'engage à respecter les délais de livraison, mais ceux-ci peuvent être affectés par des circonstances imprévues, telles que des retards dans la production ou des conditions météorologiques.",
        ] },
      ] },
      { numero: 3, titre: 'Délais de livraison des citadines', images: [], texte: [
        { paragraphes: ['Les délais de livraison pour les modèles de citadines chez Citroën varient en fonction de plusieurs facteurs :'] },
        { puces: [
          "Modèle en stock : Pour les modèles disponibles en stock, le délai de livraison est généralement de 1 à 2 semaines.",
          "Modèle personnalisé : Pour un modèle personnalisé, le délai peut aller de 4 à 12 semaines, selon la complexité des options choisies.",
          "Véhicules électriques et hybrides : Les délais de livraison pour les véhicules électriques et hybrides peuvent être plus longs, allant jusqu'à 16 semaines, en raison de la demande croissante et des spécificités techniques.",
          "Notifications de livraison : Les clients reçoivent des notifications concernant l'état de leur commande, ainsi qu'une estimation des délais de livraison, afin de les tenir informés tout au long du processus.",
        ] },
      ] },
    ],
    competence: {
      groupe: 'Groupe de compétences 2',
      intitule: "Suivre l'évolution de la commande et du règlement",
      detail: 'Informer les clients des délais et des modalités de mise à disposition.',
    },
    objectifs: [
      "Identifier les étapes du suivi d'une commande, de la signature du contrat à la livraison.",
      'Informer le client sur les conditions et les documents nécessaires à la livraison.',
      'Connaître les délais de livraison selon le type de véhicule.',
    ],
    activites: [
      {
        titre: "Activité 1 — Suivre l'évolution de la commande",
        questions: [
          { numero: 1, consigne: 'Indiquez quelle est la première étape après avoir fait la sélection du véhicule.', ressources: "Consulter le document 1, compléter l'annexe 1. [C.2.1]", annexeId: 'annexe1' },
          { numero: 2, consigne: "Expliquez ce qu'est un numéro de commande et son rôle.", ressources: "Consulter le document 1, compléter l'annexe 2. [C.2.1]", annexeId: 'annexe2' },
          { numero: 3, consigne: "Indiquez combien de temps peut durer la production d'un véhicule.", ressources: "Consulter le document 1, compléter l'annexe 3. [C.2.1]", annexeId: 'annexe3' },
          { numero: 4, consigne: 'Détaillez ce qui se passe lors de la livraison du véhicule.', ressources: "Consulter le document 1, compléter l'annexe 4. [C.2.1]", annexeId: 'annexe4' },
        ],
      },
      {
        titre: 'Activité 2 — Informer le client sur les conditions et les délais de livraison',
        questions: [
          { numero: 5, consigne: "Indiquez comment la disponibilité d'un modèle peut changer la date de livraison.", ressources: "Consulter le document 2, compléter l'annexe 5. [C.2.1]", annexeId: 'annexe5' },
          { numero: 6, consigne: 'Listez les documents que le client doit fournir avant la livraison.', ressources: "Consulter le document 2, compléter l'annexe 6. [C.2.1]", annexeId: 'annexe6' },
          { numero: 7, consigne: 'Indiquez toutes les vérifications qui doivent être faites avant la livraison.', ressources: "Consulter le document 2, compléter l'annexe 7. [C.2.1]", annexeId: 'annexe7' },
          { numero: 8, consigne: 'Détaillez ce que le client doit faire concernant le paiement avant la livraison.', ressources: "Consulter le document 2, compléter l'annexe 8. [C.2.1]", annexeId: 'annexe8' },
          { numero: 9, consigne: 'Indiquez les délais de livraison pour un modèle en stock.', ressources: "Consulter le document 3, compléter l'annexe 9. [C.2.1]", annexeId: 'annexe9' },
          { numero: 10, consigne: "Retrouvez le temps que peut prendre la livraison d'un modèle personnalisé.", ressources: "Consulter le document 3, compléter l'annexe 10. [C.2.1]", annexeId: 'annexe10' },
          { numero: 11, consigne: 'Indiquez les délais de livraison pour les véhicules électriques et hybrides.', ressources: "Consulter le document 3, compléter l'annexe 11. [C.2.1]", annexeId: 'annexe11' },
          { numero: 12, consigne: "Précisez ce que reçoivent les clients pour connaître l'état de leur commande. Expliquez-en l'intérêt.", ressources: "Consulter le document 3, compléter l'annexe 12. [C.2.1]", annexeId: 'annexe12' },
          { numero: 13, consigne: 'Détaillez les raisons pour lesquelles les délais de livraison peuvent varier.', ressources: "Consulter le document 3, compléter l'annexe 13. [C.2.1]", annexeId: 'annexe13' },
        ],
      },
    ],
    annexes: [
      { type: 'texte', id: 'annexe1', titre: 'Annexe 1 — La première étape de la sélection', lignes: 2 },
      { type: 'texte', id: 'annexe2', titre: 'Annexe 2 — Le numéro de commande', lignes: 2 },
      { type: 'texte', id: 'annexe3', titre: 'Annexe 3 — La production des véhicules', lignes: 2 },
      { type: 'texte', id: 'annexe4', titre: 'Annexe 4 — La livraison du véhicule', lignes: 3 },
      { type: 'texte', id: 'annexe5', titre: "Annexe 5 — La disponibilité d'un modèle", lignes: 3 },
      { type: 'grille', id: 'annexe6', titre: 'Annexe 6 — Les documents à fournir', colonnes: ['Document', 'Document'], nbLignes: 2 },
      { type: 'texte', id: 'annexe7', titre: 'Annexe 7 — Les vérifications à opérer', lignes: 2 },
      { type: 'texte', id: 'annexe8', titre: 'Annexe 8 — Le paiement à la livraison', lignes: 2 },
      { type: 'texte', id: 'annexe9', titre: 'Annexe 9 — Les délais de livraison', lignes: 2 },
      { type: 'texte', id: 'annexe10', titre: "Annexe 10 — La livraison d'un modèle personnalisé", lignes: 2 },
      { type: 'texte', id: 'annexe11', titre: 'Annexe 11 — Les délais pour une voiture électrique ou hybride', lignes: 2 },
      { type: 'texte', id: 'annexe12', titre: "Annexe 12 — Connaissance de l'état de la commande", lignes: 3 },
      { type: 'grille', id: 'annexe13', titre: 'Annexe 13 — Les délais de livraison', colonnes: ['Raison', 'Raison'], nbLignes: 2 },
    ],
  },
  corrige: {
    questions: [
      { intitule: 'La première étape de la sélection (annexe 1).', documents: ['Document 1', 'Annexe 1'], bareme: 2, reponse: 'La première étape est la signature du contrat.' },
      { intitule: 'Le numéro de commande (annexe 2).', documents: ['Document 1', 'Annexe 2'], bareme: 2, reponse: "C'est un numéro unique attribué à chaque commande, permettant de suivre son évolution." },
      { intitule: 'La production des véhicules (annexe 3).', documents: ['Document 1', 'Annexe 3'], bareme: 2, reponse: 'Cela peut durer de quelques semaines à plusieurs mois, en fonction de divers facteurs.' },
      { intitule: 'La livraison du véhicule (annexe 4).', documents: ['Document 1', 'Annexe 4'], bareme: 2, reponse: 'Lors de la livraison, le concessionnaire explique les fonctionnalités, remet les documents nécessaires, et effectue une dernière inspection avec le client.' },
      { intitule: "La disponibilité d'un modèle (annexe 5).", documents: ['Document 2', 'Annexe 5'], bareme: 2, reponse: "La disponibilité détermine si le véhicule peut être livré rapidement ou s'il nécessite une production spéciale, ce qui peut retarder la livraison." },
      {
        intitule: 'Les documents à fournir (annexe 6).', documents: ['Document 2', 'Annexe 6'], bareme: 3, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Document', 'Document'], lignes: [
          ['Le permis de conduire', 'Les documents du financement'],
          ["Une pièce d'identité", ''],
        ] },
      },
      { intitule: 'Les vérifications à opérer (annexe 7).', documents: ['Document 2', 'Annexe 7'], bareme: 2, reponse: 'Le véhicule doit avoir passé avec succès le contrôle qualité.' },
      { intitule: 'Le paiement à la livraison (annexe 8).', documents: ['Document 2', 'Annexe 8'], bareme: 2, reponse: 'Le paiement doit être effectué dans les délais convenus dans le contrat avant la livraison.' },
      { intitule: 'Les délais de livraison (annexe 9).', documents: ['Document 3', 'Annexe 9'], bareme: 2, reponse: 'Le délai de livraison est généralement de 1 à 2 semaines.' },
      { intitule: "La livraison d'un modèle personnalisé (annexe 10).", documents: ['Document 3', 'Annexe 10'], bareme: 2, reponse: 'Cela peut aller de 4 à 12 semaines.' },
      { intitule: 'Les délais pour une voiture électrique ou hybride (annexe 11).', documents: ['Document 3', 'Annexe 11'], bareme: 2, reponse: "Les délais peuvent aller jusqu'à 16 semaines." },
      { intitule: "Connaissance de l'état de la commande (annexe 12).", documents: ['Document 3', 'Annexe 12'], bareme: 2, reponse: "Les clients reçoivent des notifications concernant l'état de leur commande et une estimation des délais de livraison." },
      {
        intitule: 'Les délais de livraison (annexe 13).', documents: ['Document 3', 'Annexe 13'], bareme: 3, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Raison', 'Raison'], lignes: [
          ['La disponibilité du modèle', 'La demande'],
          ['La complexité des options choisies', ''],
        ] },
      },
    ],
  },
  synthese: {
    titre: "Le suivi de la commande et la livraison",
    proposition: ['La signature du contrat', 'Le rôle du numéro de commande', 'Le temps de production', 'La livraison du véhicule'],
    racine: {
      id: 'racine',
      texte: 'Le suivi de la commande',
      enfants: [
        {
          id: 'suivi', texte: "Suivre l'évolution de la commande",
          enfants: [
            { id: 'a', texte: null, reponse: 'La signature du contrat' },
            { id: 'b', texte: null, reponse: 'Le rôle du numéro de commande' },
            { id: 'c', texte: null, reponse: 'Le temps de production' },
            { id: 'd', texte: null, reponse: 'La livraison du véhicule' },
          ],
        },
        {
          id: 'info', texte: 'Informer le client sur les conditions et les délais de livraison',
          enfants: [
            { id: 'doc', texte: 'Les documents nécessaires avant la livraison' },
            { id: 'pi', texte: "Une pièce d'identité" },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: "Suivre l'évolution de la commande",
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas les étapes du suivi de commande.' },
          { niveau: 'debrouille', description: 'Je cite quelques étapes du suivi.' },
          { niveau: 'averti', description: 'Je connais les étapes de la signature à la livraison.' },
          { niveau: 'expert', description: "Je relie chaque étape à son rôle dans le suivi de commande." },
        ],
      },
      {
        id: 'c2', intitule: 'Informer le client sur les conditions de livraison',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas quels documents sont nécessaires.' },
          { niveau: 'debrouille', description: 'Je cite un ou deux documents requis.' },
          { niveau: 'averti', description: 'Je liste les documents et les conditions de livraison.' },
          { niveau: 'expert', description: 'Je conseille le client sur les conditions et vérifications.' },
        ],
      },
      {
        id: 'c3', intitule: 'Connaître les délais de livraison',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas les délais.' },
          { niveau: 'debrouille', description: 'Je connais un délai.' },
          { niveau: 'averti', description: 'Je distingue les délais selon le type de véhicule.' },
          { niveau: 'expert', description: 'Je justifie les variations de délais au client.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Numéro de commande', definition: "Numéro unique attribué à chaque commande pour suivre son évolution." },
      { terme: 'Contrôle qualité', definition: "Inspection rigoureuse du véhicule avant livraison (tests et inspection visuelle)." },
      { terme: 'Carte grise', definition: "Document officiel d'immatriculation du véhicule, remis à la livraison." },
      { terme: 'Modèle en stock', definition: 'Véhicule disponible immédiatement, livrable en 1 à 2 semaines.' },
      { terme: 'Modèle personnalisé', definition: 'Véhicule produit selon les options du client, livrable en 4 à 12 semaines.' },
      { terme: 'Suivi post-livraison', definition: "Contact du concessionnaire après livraison pour vérifier la satisfaction du client." },
      { terme: 'Préparation à la livraison', definition: "Nettoyage, ajout d'accessoires et vérification des documents avant remise du véhicule." },
      { terme: 'Délai de livraison', definition: "Temps entre la commande et la mise à disposition du véhicule." },
    ],
    flashcards: [
      { recto: 'Première étape après la sélection du véhicule ?', verso: 'La signature du contrat.' },
      { recto: "Qu'est-ce qu'un numéro de commande ?", verso: 'Un numéro unique attribué à chaque commande pour suivre son évolution.' },
      { recto: "Combien de temps dure la production ?", verso: 'De quelques semaines à plusieurs mois.' },
      { recto: 'Délai pour un modèle en stock ?', verso: '1 à 2 semaines.' },
      { recto: 'Délai pour un modèle personnalisé ?', verso: '4 à 12 semaines.' },
      { recto: 'Délai pour un véhicule électrique ou hybride ?', verso: "Jusqu'à 16 semaines." },
      { recto: 'Quels documents le client doit-il fournir ?', verso: "Permis de conduire, pièce d'identité, documents de financement." },
      { recto: 'Condition liée au contrôle qualité ?', verso: 'Le véhicule doit avoir passé avec succès le contrôle qualité.' },
      { recto: "Que reçoivent les clients sur l'état de la commande ?", verso: 'Des notifications et une estimation des délais.' },
      { recto: 'Documents remis à la livraison ?', verso: "Carte grise, garantie, manuel d'utilisation." },
    ],
    quiz: [
      { type: 'unique', question: 'Première étape après la sélection du véhicule ?', options: ['La signature du contrat', 'La production', 'La livraison', 'Le paiement'], bonne: 0 },
      { type: 'unique', question: "À quoi sert le numéro de commande ?", options: ["À suivre l'évolution de la commande", 'À payer le véhicule', 'À immatriculer le véhicule', 'À choisir les options'], bonne: 0 },
      { type: 'unique', question: 'Combien de temps dure la production ?', options: ['De quelques semaines à plusieurs mois', "Quelques heures", '1 an minimum', '2 jours'], bonne: 0 },
      { type: 'unique', question: 'Délai pour un modèle en stock ?', options: ['1 à 2 semaines', '4 à 12 semaines', '16 semaines', '6 mois'], bonne: 0 },
      { type: 'unique', question: 'Délai pour un modèle personnalisé ?', options: ['4 à 12 semaines', '1 à 2 semaines', '24 heures', '1 an'], bonne: 0 },
      { type: 'unique', question: 'Délai pour un véhicule électrique ou hybride ?', options: ["Jusqu'à 16 semaines", '1 semaine', '48 heures', '2 ans'], bonne: 0 },
      { type: 'unique', question: "Lequel n'est PAS un document requis ?", options: ['Le livret de famille', 'Le permis de conduire', "Une pièce d'identité", 'Les documents de financement'], bonne: 0 },
      { type: 'unique', question: 'Condition avant livraison liée à la qualité ?', options: ['Avoir passé le contrôle qualité', 'Avoir 2 ans', 'Être électrique', 'Être en promotion'], bonne: 0 },
      { type: 'unique', question: "Que reçoit le client pour suivre sa commande ?", options: ['Des notifications', 'Un SMS publicitaire', 'Rien', 'Une facture seulement'], bonne: 0 },
      { type: 'unique', question: 'Document remis à la livraison ?', options: ['La carte grise', 'Un bon de réduction', 'Un catalogue', 'Une carte de fidélité'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque élément dans la bonne catégorie.',
      etiquettes: ['Étape du suivi de commande', 'Document à fournir', 'Délai de livraison'],
      zones: [
        { libelle: 'La signature du contrat', etiquetteIndex: 0 },
        { libelle: 'Le contrôle qualité', etiquetteIndex: 0 },
        { libelle: 'Le permis de conduire', etiquetteIndex: 1 },
        { libelle: "Une pièce d'identité", etiquetteIndex: 1 },
        { libelle: '1 à 2 semaines (stock)', etiquetteIndex: 2 },
        { libelle: '16 semaines (électrique)', etiquetteIndex: 2 },
      ],
    },
  },
}

const AMPARIS_M1: ContenuMission = {
  travaux: {
    consigne:
      "Réalisez la carte d'identité de l'entreprise AMParis : identifiez l'entreprise, ses biens et services, sa zone de chalandise, son partenaire et son type de clientèle.",
    contexte:
      "Vous êtes en stage dans la société AMParis, située à Asnières-sur-Seine. L'entreprise est spécialisée dans la vente et la location de photocopieurs, d'imprimantes et de télécopieurs. C'est votre premier jour et donc avant de vous confier des tâches importantes, votre tutrice Mme Eva Pauret souhaite que vous vous familiarisiez avec l'entreprise, son personnel et son marché. Votre tutrice vous demande de réaliser la « carte d'identité » de l'entreprise.",
    documents: [
      { numero: 1, titre: "Fiche d'identité de l'entreprise", images: [], texte: [
        { tableau: { colonnes: ['Information', 'Valeur'], lignes: [
          ['Statut RCS', 'Immatriculée au RCS le 18-06-1992'],
          ['Statut INSEE', "Enregistrée à l'INSEE le 01-05-1992"],
          ['Dénomination', 'A.M.PARIS'],
          ['Adresse', '50 AV D ARGENTEUIL 92600 ASNIERES-SUR-SEINE'],
          ['Téléphone', 'Afficher le numéro'],
          ['SIREN', '387 749 914'],
          ['SIRET (siege)', '38774991400025'],
          ['N° de TVA Intracommunautaire', 'Obtenir le numéro de TVA'],
          ['Activité (Code NAF ou APE)', "Réparation d'ordinateurs et d'équipements périphériques (9511Z)"],
          ['Forme juridique', 'Société par actions simplifiée'],
          ['Date immatriculation RCS', '18-06-1992'],
          ['Date de dernière mise à jour', '01-10-2020'],
          ['Effectif moyen', '22'],
          ['Capital social', '400 000,00 €'],
          ["Chiffre d'affaires 2018", '6 385 500.00 €'],
        ] } },
        { intertitre: 'Des services sur mesure', paragraphes: [
          "AM Paris vend, loue et se charge de l'entretien ou du dépannage de photocopieurs, d'imprimantes et de télécopieurs dans toute l'Ile-de-France, mais aussi dans le reste de la France par l'intermédiaire de ses nombreux partenaires.",
          "AMParis propose également des solutions de gestion électronique de documents et de l'information (GED/GEIDE) aux petites et grandes entreprises, via la commercialisation du logiciel Docuware 5.",
        ] },
        { intertitre: "Notre secteur d'intervention", paragraphes: ["Quelques exemples de communes sur lesquelles nous assurons nos services de location d'imprimante et de photocopieur :"] },
        { puces: ['Paris', 'Boulogne-Billancourt', 'Saint-Denis', 'Montreuil', 'Nanterre', 'Créteil', 'Courbevoie', 'Versailles', 'Puteaux', 'Asnières-sur-Seine', 'Rueil-Malmaison', 'Saint-Maur-des-Fossés', 'Champigny-sur-Marne', 'Aubervilliers', 'Issy-les-Moulineaux', 'Beauvais'] },
        { intertitre: 'NOS PRODUITS', puces: ['Photocopieur couleur', 'Photocopieur noir et blanc', 'Copieur tireur de plan', 'Copieur haut volume', 'Duplicopieur'] },
        { intertitre: 'NOTRE PARTENAIRE', puces: ['Ricoh'] },
        { intertitre: 'NOS SERVICES', puces: ['Vente', 'Location', 'Location courte durée', 'GEI/GEIDE', 'Contrat de maintenance'] },
        { intertitre: 'Coordonnées', paragraphes: ['29, bd du Général Delambre', '95870 BEZONS', '+33(0)1 47 90 27 79', 'contact@amparis.fr'] },
      ] },
      { numero: 2, titre: "Page produits et présentation de l'entreprise", images: [], texte: [
        { intertitre: 'Catalogue produits', puces: [
          'PHOTOCOPIEUR COULEUR', 'PHOTOCOPIEUR NOIR ET BLANC', 'IMPRIMANTE NOIR ET BLANC', 'IMPRIMANTE COULEUR', 'DUPLICOPIEUR', 'COPIEUR HAUT VOLUME', 'COPIEUR TIREUR DE PLAN', 'IMPRIMANTE GRAND FORMAT', "PHOTOCOPIEUR D'OCCASION", "IMPRIMANTE D'OCCASION", 'IMPRIMANTE RECONDITIONNÉE', 'CONTRÔLEUR IMPRESSION', 'FAX TÉLÉCOPIEUR', 'SCANNER', 'ÉCRAN INTERACTIF', 'SYSTÈME DE VISIOCONFÉRENCE', 'CAMÉRA 360°', 'IMPRIMANTE TEXTILE', 'IMPRIMANTE 3D',
        ] },
        { paragraphes: [
          "La société AM Paris est spécialisée dans la vente, la location et l'entretien de photocopieurs, d'imprimantes et de télécopieurs.",
          "Elle apporte aussi des solutions logicielles (GED/GEIDE) destinées aux professionnels, qu'elle conseille afin de leur permettre d'acquérir le produit conforme à leurs besoins.",
          "Distributeur agréé de RICOH, leader sur le marché des photocopieurs, imprimantes et télécopieurs.",
        ] },
      ] },
      { numero: 3, titre: 'Page services et secteur', images: [], texte: [
        { intertitre: 'Services proposés', puces: [
          'Livraison — sur toute la France',
          'Location courte durée — pour salons, événements...',
          "Matériel d'occasion — reconditionné par nos soins",
          "Besoin d'aide ? — 01 47 90 27 79",
          "Contrat d'entretien — dépannage et maintenance",
        ] },
        { intertitre: 'Une réputation solide', paragraphes: [
          "En croissance régulière depuis 1992, date de sa création, AM Paris ne néglige aucun aspect de son activité : conseils avisés, services personnalisés et respect des engagements font partie de ses atouts, renforcés par des procédés techniques et commerciaux en constante évolution.",
          "La qualité de ses services et sa rigueur lui ont permis de devenir l'un des partenaires « Privilège » de RICOH, dont elle distribue et promeut les produits.",
        ] },
        { intertitre: 'Une équipe fiable', paragraphes: [
          "AM Paris, spécialiste de l'impression depuis près de 25 ans, intègre également un centre de reprographie qui exécute des travaux exceptionnels ou confidentiels.",
          "Cette exploitation est située au 50, avenue d'Argenteuil à Asnières (92), tandis que la plateforme technique d'AM Paris, qui regroupe les livraisons, les stocks de consommables, les pièces détachées, le centre d'appel et la direction technique, se situe au 55, rue du Révérend Père Christian Gilbert à Asnières.",
          "AM Paris possède également une filiale, AM Paris Finance, une société de management en pleine expansion, et s'est également entourée des partenaires suivants :",
        ] },
        { puces: [
          "Trematique, spécialisée, depuis plus de 30 ans, dans la vente, la location et l'entretien de matériel mais aussi dans le facility management (travaille principalement avec des entreprises de l'Est Parisien) ;",
          "Eurohead, spécialiste du fax et des systèmes de transmission sécurisés pour les données confidentielles.",
        ] },
        { intertitre: 'Des services sur mesure', paragraphes: [
          "AM Paris vend, loue et se charge de l'entretien ou du dépannage de photocopieurs, d'imprimantes et de télécopieurs dans toute l'Ile-de-France, mais aussi dans le reste de la France par l'intermédiaire de ses nombreux partenaires.",
          "AMParis propose également des solutions de gestion électronique de documents et de l'information (GED/GEIDE) aux petites et grandes entreprises, via la commercialisation du logiciel Docuware 5.",
        ] },
        { intertitre: "Notre secteur d'intervention", paragraphes: ["Quelques exemples de communes sur lesquelles nous assurons nos services de location d'imprimante et de photocopieur :"] },
        { puces: ['Paris', 'Boulogne-Billancourt', 'Saint-Denis', 'Montreuil', 'Nanterre', 'Créteil', 'Courbevoie', 'Versailles', 'Puteaux', 'Asnières-sur-Seine', 'Rueil-Malmaison', 'Saint-Maur-des-Fossés', 'Champigny-sur-Marne', 'Aubervilliers', 'Issy-les-Moulineaux', 'Beauvais'] },
        { intertitre: 'NOS PRODUITS', puces: ['Photocopieur couleur', 'Photocopieur noir et blanc', 'Copieur tireur de plan', 'Copieur haut volume', 'Duplicopieur'] },
        { intertitre: 'NOTRE PARTENAIRE', puces: ['Ricoh'] },
        { intertitre: 'NOS SERVICES', puces: ['Vente', 'Location', 'Location courte durée', 'GEI/GEIDE', 'Contrat de maintenance'] },
      ] },
      { numero: 4, titre: "Notre secteur d'intervention", images: [], texte: [
        { intertitre: "Notre secteur d'intervention", paragraphes: ["Quelques exemples de communes sur lesquelles nous assurons nos services de location d'imprimante et de photocopieur :"] },
        { puces: ['Paris', 'Boulogne-Billancourt', 'Saint-Denis', 'Montreuil', 'Nanterre', 'Créteil', 'Courbevoie', 'Versailles', 'Puteaux', 'Asnières-sur-Seine', 'Rueil-Malmaison', 'Saint-Maur-des-Fossés', 'Champigny-sur-Marne', 'Aubervilliers', 'Issy-les-Moulineaux', 'Beauvais'] },
        { intertitre: 'NOS PRODUITS', puces: ['Photocopieur couleur', 'Photocopieur noir et blanc', 'Copieur tireur de plan', 'Copieur haut volume', 'Duplicopieur'] },
        { intertitre: 'NOTRE PARTENAIRE', puces: ['Ricoh'] },
        { intertitre: 'NOS SERVICES', puces: ['Vente', 'Location', 'Location courte durée', 'GEI/GEIDE', 'Contrat de maintenance'] },
        { intertitre: 'Coordonnées', paragraphes: ['29, bd du Général Delambre', '95870 BEZONS', '+33(0)1 47 90 27 79', 'contact@amparis.fr'] },
      ] },
      { numero: 5, titre: 'Notre partenaire', images: [], texte: [
        { intertitre: 'NOTRE PARTENAIRE', puces: ['Ricoh'] },
        { intertitre: 'NOS PRODUITS', puces: ['Photocopieur couleur', 'Photocopieur noir et blanc', 'Copieur tireur de plan', 'Copieur haut volume', 'Duplicopieur'] },
        { intertitre: 'NOS SERVICES', puces: ['Vente', 'Location', 'Location courte durée', 'GEI/GEIDE', 'Contrat de maintenance'] },
      ] },
      { numero: 6, titre: 'Les différents types de clientèle', images: [], texte: [
        { paragraphes: [
          "Par définition, le marketing B2B (entre professionnels) concerne les échanges commerciaux par une entreprise avec une autre entreprise, et le marketing B2C les échanges commerciaux entre une entreprise et une clientèle de particuliers. La cible de ces deux types de marketing est donc très différente : limitée en nombre, mais spécialisée en Business to Business (B2B), beaucoup plus large, mais moins experte en Business to Consumer (B2C). En effet, les entreprises visées en B2B, déjà a priori mieux informées que le particulier, font en plus un travail de recherches important auprès d'experts pour l'analyse de leurs besoins et la recherche de solutions adéquates. Il faut donc mettre en œuvre, en B2B, une stratégie marketing qui fournit des informations beaucoup plus spécifiques et pointues qu'en B2C, car les clients, en général, connaissent moins bien les produits et solutions proposées. Dans ce dernier cas, l'utilisation d'un langage plus simple fonctionne mieux auprès des particuliers.",
        ] },
      ] },
    ],
    competence: {
      groupe: 'Groupe de compétences 4B',
      intitule: 'Rechercher et analyser les informations à des fins d\u2019exploitation',
      detail: "Identifier l'entreprise, ses biens et services, son marché et sa clientèle.",
    },
    objectifs: [
      "Identifier l'entreprise et établir sa carte d'identité.",
      "Distinguer les biens et les services, marchands et non marchands.",
      'Délimiter la zone de chalandise et identifier le type de clientèle.',
    ],
    activites: [
      {
        titre: "Activité 1 — Identification de l'entreprise",
        questions: [
          { numero: 1, consigne: "Complétez l'identité de l'entreprise.", ressources: "Consulter le document 1, compléter l'annexe 1. [C.4B.1]", annexeId: 'annexe1' },
        ],
      },
      {
        titre: "Activité 2 — Les biens et les services de l'entreprise",
        questions: [
          { numero: 2, consigne: "Listez les 3 grands types de biens vendus par l'entreprise.", ressources: "Consulter le document 2, compléter l'annexe 2. [C.4B.1]", annexeId: 'annexe2' },
          { numero: 3, consigne: "Listez les différents services proposés par l'entreprise puis cochez s'ils sont marchands ou non marchands.", ressources: "Consulter le document 3, compléter l'annexe 3. [C.4B.1]", annexeId: 'annexe3' },
          { numero: 4, consigne: "Quelles sont les villes dans lesquelles s'étend la zone de chalandise (secteur d'intervention) de AMParis. Dans quel département se trouve chacune d'elle.", ressources: "Consulter le document 4, compléter l'annexe 4. [C.4B.1]", annexeId: 'annexe4' },
          { numero: 5, consigne: "Donnez le nom du partenaire de l'entreprise.", ressources: "Consulter le document 5, compléter l'annexe 5. [C.4B.1]", annexeId: 'annexe5' },
          { numero: 6, consigne: "Après avoir lu les différents documents de l'entreprise, dites selon vous quel est le type de clientèle de l'entreprise.", ressources: "Consulter le document 6, compléter l'annexe 6. [C.4B.1]", annexeId: 'annexe6' },
        ],
      },
    ],
    annexes: [
      {
        type: 'formulaire', id: 'annexe1', titre: "Annexe 1 — Identité de l'entreprise", entete: 'Fiche entreprise',
        champs: [
          { cle: 'denomination', libelle: 'Dénomination' },
          { cle: 'forme', libelle: 'Forme juridique' },
          { cle: 'rcs', libelle: "Date de création ou d'immatriculation RCS" },
          { cle: 'telephone', libelle: 'Téléphone' },
          { cle: 'ca', libelle: "Chiffre d'affaires" },
          { cle: 'secteur', libelle: "Secteur d'activité" },
          { cle: 'email', libelle: 'E-mail' },
          { cle: 'nationalite', libelle: 'Nationalité' },
          { cle: 'adresse', libelle: 'Adresse', aire: true },
        ],
      },
      { type: 'grille', id: 'annexe2', titre: 'Annexe 2 — Les biens', colonnes: ['Les grands types de biens vendus'], nbLignes: 3 },
      { type: 'casesservices', id: 'annexe3', titre: 'Annexe 3 — Les services', entete: 'Services proposés', colonnes: ['Marchand', 'Non marchand'], nbLignes: 6 },
      { type: 'saisiegeo', id: 'annexe4', titre: 'Annexe 4 — La zone de chalandise', entete: 'Secteur d\u2019intervention', departements: ['60', '75', '78', '92', '93', '94'], nbLignesInitiales: 16 },
      { type: 'texte', id: 'annexe5', titre: 'Annexe 5 — Le partenaire', lignes: 1 },
      { type: 'texte', id: 'annexe6', titre: 'Annexe 6 — La clientèle', lignes: 2 },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: "Identité de l'entreprise (annexe 1).", documents: ['Sites internet', 'Annexe 1'], bareme: 9, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Champ', 'Réponse'], lignes: [
          ['Dénomination', 'A.M.PARIS'],
          ['Forme juridique', 'Société par actions simplifiée (S.A.S)'],
          ["Date de création ou d'immatriculation RCS", '18-06-1992'],
          ['Téléphone', '+33 (0)1 47 90 27 79'],
          ["Chiffre d'affaires", '6 385 500 €'],
          ["Secteur d'activité", "Réparation d'ordinateurs et d'équipements périphériques (9511Z)"],
          ['E-mail', 'contact@amparis.fr'],
          ['Nationalité', 'Française'],
          ['Adresse', "50 av. d'Argenteuil, 92600 Asnières-sur-Seine"],
        ] },
      },
      {
        intitule: 'Les biens (annexe 2).', documents: ['Site internet', 'Annexe 2'], bareme: 3, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Les grands types de biens vendus'], lignes: [['Photocopieurs'], ['Imprimantes'], ['Télécopieurs']] },
      },
      {
        intitule: 'Les services (annexe 3).', documents: ['Site internet', 'Annexe 3'], bareme: 6, reponse: 'Voir tableau. (X* : selon le cas, le commercial peut proposer la gratuité quand il veut emporter l\u2019adhésion de l\u2019acheteur.)',
        tableau: { colonnes: ['Les services', 'Marchand', 'Non marchand'], lignes: [
          ['Livraison', 'X*', 'X*'],
          ['Location', 'X', ''],
          ['Location longue durée', 'X', ''],
          ['GEI/GEIDE (gestion électronique de documents et d\u2019information)', 'X', ''],
          ['Contrat de maintenance (= entretien)', 'X*', 'X*'],
          ['Besoin d\u2019aide ? (014790...)', 'X', ''],
        ] },
      },
      {
        intitule: 'La zone de chalandise (annexe 4).', documents: ['Site internet', 'Annexe 4'], bareme: 8, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Villes', 'Département'], lignes: [
          ['Paris', '75'], ['Boulogne-Billancourt', '92'], ['Saint-Denis', '93'], ['Montreuil', '93'],
          ['Nanterre', '92'], ['Créteil', '94'], ['Courbevoie', '92'], ['Versailles', '78'],
          ['Puteaux', '92'], ['Asnières', '92'], ['Rueil-Malmaison', '92'], ['Saint-Maur-des-Fossés', '94'],
          ['Champigny-sur-Marne', '94'], ['Aubervilliers', '93'], ['Issy-les-Moulineaux', '92'], ['Beauvais', '60'],
        ] },
      },
      { intitule: 'Le partenaire (annexe 5).', documents: ['Site internet', 'Annexe 5'], bareme: 1, reponse: 'Ricoh.' },
      { intitule: 'La clientèle (annexe 6).', documents: ['Document', 'Annexe 6'], bareme: 2, reponse: "C'est une clientèle de professionnels." },
    ],
  },
  synthese: {
    titre: "La carte d'identité de l'entreprise",
    proposition: ["L'identité de l'entreprise", 'Les types de produits vendus', 'Les services', 'La clientèle'],
    racine: {
      id: 'racine', texte: "La présentation de l'entreprise",
      enfants: [
        {
          id: 'ident', texte: "L'identité de l'entreprise",
          enfants: [
            { id: 'fj', texte: null, reponse: 'Forme juridique' },
            { id: 'ca', texte: null, reponse: "Chiffre d'affaires" },
            { id: 'nat', texte: null, reponse: 'Nationalité' },
          ],
        },
        {
          id: 'prod', texte: "Les types de produits vendus par l'entreprise",
          enfants: [
            { id: 'biens', texte: '2 types de produits' },
            { id: 'serv', texte: 'Les services' },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: "Identifier l'entreprise",
        indicateurs: [
          { niveau: 'novice', description: "Je ne sais pas retrouver l'identité de l'entreprise." },
          { niveau: 'debrouille', description: 'Je complète quelques champs de la carte d\u2019identité.' },
          { niveau: 'averti', description: 'Je complète toute la carte d\u2019identité.' },
          { niveau: 'expert', description: "Je vérifie et recoupe les informations entre les sources." },
        ],
      },
      {
        id: 'c2', intitule: 'Distinguer biens et services',
        indicateurs: [
          { niveau: 'novice', description: 'Je confonds biens et services.' },
          { niveau: 'debrouille', description: 'Je liste les biens.' },
          { niveau: 'averti', description: 'Je distingue services marchands et non marchands.' },
          { niveau: 'expert', description: "Je justifie le caractère marchand ou non d'un service." },
        ],
      },
      {
        id: 'c3', intitule: 'Analyser le marché et la clientèle',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas définir la zone de chalandise.' },
          { niveau: 'debrouille', description: 'Je cite quelques villes du secteur.' },
          { niveau: 'averti', description: 'Je délimite la zone et identifie le type de clientèle.' },
          { niveau: 'expert', description: 'Je relie le type de clientèle (B2B/B2C) à la stratégie commerciale.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Bien', definition: "Produit matériel et tangible vendu par l'entreprise (ex : photocopieur)." },
      { terme: 'Service', definition: 'Prestation immatérielle proposée au client (ex : livraison, maintenance).' },
      { terme: 'Service marchand', definition: 'Service vendu contre paiement.' },
      { terme: 'Service non marchand', definition: 'Service fourni gratuitement ou à un prix non significatif.' },
      { terme: 'Zone de chalandise', definition: "Secteur géographique d'où provient la clientèle d'une unité commerciale." },
      { terme: 'B2B (Business to Business)', definition: 'Échanges commerciaux entre une entreprise et une autre entreprise.' },
      { terme: 'B2C (Business to Consumer)', definition: 'Échanges commerciaux entre une entreprise et des particuliers.' },
      { terme: 'Forme juridique', definition: "Statut légal de l'entreprise (ex : S.A.S)." },
      { terme: "Chiffre d'affaires", definition: "Montant total des ventes réalisées sur une période." },
      { terme: 'RCS', definition: 'Registre du commerce et des sociétés, où sont immatriculées les entreprises.' },
    ],
    flashcards: [
      { recto: "Dénomination de l'entreprise ?", verso: 'AMParis.' },
      { recto: "Forme juridique ?", verso: 'S.A.S.' },
      { recto: "Chiffre d'affaires ?", verso: '6 385 500 €.' },
      { recto: "Date d'immatriculation RCS ?", verso: '18.06.1992.' },
      { recto: 'Nationalité ?', verso: 'Française.' },
      { recto: 'Les 3 grands types de biens ?', verso: 'Photocopieurs, imprimantes, télécopieurs.' },
      { recto: 'Nom du partenaire ?', verso: 'Ricoh.' },
      { recto: "Type de clientèle ?", verso: 'Une clientèle de professionnels (B2B).' },
      { recto: 'Que signifie B2B ?', verso: 'Business to Business : échanges entre entreprises.' },
      { recto: 'Que signifie B2C ?', verso: 'Business to Consumer : échanges avec des particuliers.' },
    ],
    quiz: [
      { type: 'unique', question: "Forme juridique d'AMParis ?", options: ['S.A.S', 'S.A.R.L', 'S.A', 'Auto-entreprise'], bonne: 0 },
      { type: 'unique', question: "Chiffre d'affaires d'AMParis ?", options: ['6 385 500 €', '638 550 €', '63 855 000 €', '1 000 000 €'], bonne: 0 },
      { type: 'unique', question: 'Quel est le partenaire ?', options: ['Ricoh', 'Canon', 'Xerox', 'HP'], bonne: 0 },
      { type: 'unique', question: "Lequel n'est PAS un bien vendu par AMParis ?", options: ['Ordinateur portable', 'Photocopieur', 'Imprimante', 'Télécopieur'], bonne: 0 },
      { type: 'unique', question: 'La location est un service...', options: ['Marchand', 'Non marchand', 'Gratuit', 'Interdit'], bonne: 0 },
      { type: 'unique', question: "Type de clientèle d'AMParis ?", options: ['Professionnels (B2B)', 'Particuliers (B2C)', 'Étudiants', 'Administrations uniquement'], bonne: 0 },
      { type: 'unique', question: 'Que signifie B2C ?', options: ['Business to Consumer', 'Business to Company', 'Back to Class', 'Buy to Choose'], bonne: 0 },
      { type: 'unique', question: 'La zone de chalandise désigne...', options: ['Le secteur géographique de la clientèle', "Le chiffre d'affaires", 'La forme juridique', 'Le nombre de salariés'], bonne: 0 },
      { type: 'unique', question: 'Dans quel département se trouve Paris ?', options: ['75', '92', '93', '94'], bonne: 0 },
      { type: 'unique', question: 'En B2B, la stratégie marketing est...', options: ['Spécifique et pointue', 'Toujours simple', 'Identique au B2C', 'Inutile'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque élément dans la bonne catégorie.',
      etiquettes: ["Identité de l'entreprise", 'Bien vendu', 'Service'],
      zones: [
        { libelle: 'S.A.S', etiquetteIndex: 0 },
        { libelle: '6 385 500 €', etiquetteIndex: 0 },
        { libelle: 'Photocopieur', etiquetteIndex: 1 },
        { libelle: 'Imprimante', etiquetteIndex: 1 },
        { libelle: 'La location', etiquetteIndex: 2 },
        { libelle: 'Le contrat de maintenance', etiquetteIndex: 2 },
      ],
    },
  },
}

const AMPARIS_M2: ContenuMission = {
  travaux: {
    consigne:
      "Identifiez la cible d'une opération de prospection : critères de segmentation, définition de la cible, puis repérez dans l'annuaire les organisations qui correspondent à cette cible.",
    contexte:
      "Votre tutrice Mme Pauret estime que vous êtes désormais prêt(e) à intégrer l'équipe comme un commercial à part entière. En effet, le directeur de l'entreprise souhaite que vous participiez à la mise en place d'une opération de prospection lors de laquelle sera proposé des photocopieurs en location afin d'augmenter le portefeuille clients de l'entreprise. Mais avant de vous mettre au travail, Mme Pauret souhaite procéder par étape.",
    documents: [
      { numero: 1, titre: 'Explication de Mme Eva Pauret', images: [], texte: [
        { dialogue: [
          { texte: "« Nous avons beaucoup d'organisations qui sont nos clients. Je pense par exemple à des entreprises, des collectivités locales ou encore des associations. En consultant nos fichiers, je me suis rendu compte que nous avions trop peu d'établissements scolaires du 17ème arrondissement qui sont nos clients. Ce sont ces établissements qui doivent en cette période, retenir toute notre attention car c'est vers eux que sera dirigée notre campagne de prospection. »", italique: true },
        ] },
      ] },
      { numero: 2, titre: 'La segmentation en B to B', images: [], texte: [
        { paragraphes: ["La segmentation, c'est le fait de découper les clients ou prospects pour les répartir en ensemble homogène selon différents critères. Les professionnels peuvent être répartis selon leur :"] },
        { puces: [
          "Localisation (ex : tous les clients de Paris ou du 93, ou de l'Île de France...) ;",
          "Secteur d'activité (ex : banque, immobilier...) ;",
          "Taille (ex : les clients/ prospects ayant 10, 50, 100... salariés...) ;",
          "Chiffre d'affaires (ex : les entreprises ayant un chiffre d'affaires de plus de 50 000€...) ;",
          "Statut juridique (ex : les SARL, les EURL, les SAS...).",
        ] },
      ] },
      { numero: 3, titre: 'Extrait du fichier des établissements scolaires de Paris', images: [], texte: [
        { crm: { entete: 'Annuaire — Paris / Banlieue', fiches: [
          { nom: 'ALPHA SERVICES', activite: 'Sanitaire – Chauffage – Plombier', adresse: '71, rue Dulong', ville: '75020 Paris', telephone: '01.42.12.04.75', email: 'alphaservices75@gmail.com' },
          { nom: 'LEON GAMBETTA', activite: 'Collège public', adresse: '149, Avenue Gambetta', ville: '75017 Paris', telephone: '01.43.61.87.16', email: 'leongambetta@ac-paris.fr' },
          { nom: 'LAFORET TERNES', activite: 'Immobilier', adresse: '16, rue Saint-Ferdinand', ville: '75017 Paris', telephone: '01.58.05.00.45', email: 'contact@laforet.fr' },
          { nom: 'COPY TOP', activite: 'Imprimeur', adresse: '88, avenue de Villiers', ville: '75017 Paris', telephone: '01.83.62.09.22', email: 'villiers@copytop.com' },
          { nom: 'MARIA DERAISMES', activite: 'Lycée Professionnel', adresse: '19, rue Maria Deraismes', ville: '75017 Paris', telephone: '01.46.27.94.37', email: 'ce.0753350j@ac-paris.fr' },
          { nom: 'LATIN', activite: 'Collège Privé', adresse: '12, rue du Colonel Moll', ville: '75017 Paris', telephone: '01.84.16.37.59', email: 'info@collegelatin.fr' },
          { nom: 'SOCIETE GENERALE', activite: 'Banque', adresse: '14, rue de la Chapelle', ville: '75017 Paris', telephone: '01.46.07.05.10', email: 'contact@societegenerale.fr' },
          { nom: 'MOZART', activite: 'Collège', adresse: '7, rue Jomard', ville: '75019 Paris', telephone: '01.40.34.78.83', email: 'collegemozart@ac-paris.fr' },
          { nom: 'TOURTILLE', activite: 'Ecole primaire', adresse: '38, rue de Toutille', ville: '75020 Paris', telephone: '01.46.36.73.64', email: 'ecoletourtielle@ac-paris.fr' },
          { nom: 'PIERRE DE RONSARD', activite: 'Collège public', adresse: '140, avenue de Wagram', ville: '75017 Paris', telephone: '01.47.63.16.17', email: 'pierrederonsard@ac-paris.fr' },
          { nom: 'BALIBARIS', activite: 'Vêtements', adresse: '65, rue Legendre', ville: '75017 Paris', telephone: '01.45.23.07.82', email: 'serviceclient@balibaris.com' },
          { nom: 'RABELAIS', activite: 'Lycée Polyvalent', adresse: '9, rue Francis de Croisset', ville: '75018 Paris', telephone: '01.53.09.13.00', email: 'contact-rabelais@paris.fr' },
          { nom: "LES TABLES D'AUGUSTIN", activite: 'Restauration', adresse: '44, rue Guy Môquet', ville: '75017 Paris', telephone: '09.83.43.11.11', email: 'contact@lestablesdaugustin.fr' },
          { nom: 'LES EPINETTES', activite: 'Ecole maternelle publique', adresse: '44, rue des Epinettes', ville: '75017 Paris', telephone: '01.46.27.50.99', email: 'ce.0751299E@ac-paris.fr' },
          { nom: 'OR FLANDRES', activite: 'Bijouterie', adresse: '82, avenue de Flandres', ville: '75019 Paris', telephone: '01.44.72.91.86', email: 'contact@orflandres.fr' },
          { nom: 'SAINT MICHEL DES BATIGNOLLES', activite: 'Lycée Privé', adresse: '14, avenue de Saint-Ouen', ville: '75017 Paris', telephone: '01.58.22.20.70', fax: '01.46.27.27.18' },
          { nom: 'CORIOLIS TELECOM', activite: 'Téléphonie', adresse: '99, avenue de Clichy', ville: '75017 Paris', telephone: '01.42.12.04.75', email: 'touchstone75017@gmail.com' },
          { nom: 'CARNOT', activite: 'Lycée polyvalent', adresse: '145, Boulevard Malesherbes', ville: '75017 Paris', telephone: '01.56.21.36.36', email: 'carnot@ac-paris.fr' },
          { nom: 'BERNARD BUFFET', activite: 'Ecole Polyvalente', adresse: '14, rue Bernard Buffet', ville: '75017 Paris', telephone: '01.53.31.36.30', email: 'bernardbuffet@ac-paris.fr' },
          { nom: '5àSEC', activite: 'Pressing', adresse: '25, rue des Dames', ville: '75017 Paris', telephone: '01.43.87.36.75', email: 'serviceclient@5asec.com' },
          { nom: 'AMPERE', activite: 'Ecole maternelle publique', adresse: '18, rue Ampère', ville: '75017 Paris', telephone: '01.47.63.23.72', email: 'collegeampere@ac-paris.fr' },
          { nom: 'MAISON DIMANCHE', activite: 'Boulangerie', adresse: '1, rue Tarbé', ville: '75017 Paris', telephone: '01.83.89.72.24', email: 'contact@maisondim.com' },
          { nom: 'VOLTAIRE', activite: 'Collège', adresse: '21, rue Montaigne', ville: '92600 Asnières-sur-Seine', telephone: '01.47.91.33.11', email: '0921547g@ac-versailles.fr' },
          { nom: 'SBA', activite: 'Comptabilité', adresse: '10, rue de Penthièvre', ville: '75008 Paris', telephone: '01.86.95.38.10', email: 'contact@sba.fr' },
          { nom: 'ANDRE MALRAUX', activite: 'Collège public', adresse: '5 bis, rue Saint Ferdinand', ville: '75017 Paris', telephone: '01.45.74.49.15', email: 'colandremalraux@ac-paris.fr' },
          { nom: 'LA ROSE BLANCHE', activite: 'Collège public', adresse: '34, rue Georges Picquart', ville: '75017 Paris', telephone: '01.46.07.05.10', email: 'laroseblanche@ac-paris.fr' },
          { nom: 'MARTIN NADAUD', activite: 'Lycée Polyvalent', adresse: '23, rue de la Bidassoa', ville: '75020 Paris', telephone: '01.40.33.80.50', email: 'scolarite@lyceenadaud.fr' },
        ] } },
      ] },
    ],
    competence: {
      groupe: 'Groupe de compétences 4B',
      intitule: 'Rechercher et analyser les informations à des fins d\u2019exploitation',
      detail: "Identifier la cible d'une opération de prospection et exploiter un fichier d'organisations.",
    },
    objectifs: [
      'Comprendre la segmentation et ses critères en B to B.',
      'Identifier et définir la cible de prospection.',
      "Exploiter un annuaire pour repérer les organisations correspondant à la cible.",
    ],
    activites: [
      {
        titre: 'Activité 1 — La segmentation et la cible de prospection',
        questions: [
          { numero: 1, consigne: 'Cochez les critères de segmentation retenus par votre tutrice et justifiez votre réponse.', ressources: "Lire les documents 1 et 2, compléter l'annexe 1. [C.4B.1]", annexeId: 'annexe1' },
        ],
      },
      {
        titre: 'Activité 2 — La cible de la prospection',
        questions: [
          { numero: 2, consigne: 'Indiquez quelle est la cible que votre responsable souhaite viser.', ressources: "Lire le document 1, compléter l'annexe 2. [C.4B.1]", annexeId: 'annexe2' },
          { numero: 3, consigne: 'Selon vous, quelle est la définition de la cible.', ressources: "Lire le document 2, compléter l'annexe 3. [C.4B.1]", annexeId: 'annexe3' },
          { numero: 4, consigne: 'Retrouvez les organisations qui correspondent à la cible indiquée par votre responsable.', ressources: "Lire le document 3, compléter l'annexe 4. [C.4B.1]", annexeId: 'annexe4' },
        ],
      },
    ],
    annexes: [
      { type: 'critereseg', id: 'annexe1', titre: 'Annexe 1 — Critères de segmentation retenus', entete: 'Analyse de segmentation', criteres: ['Localisation', "Secteur d'activité", 'Taille', "Chiffre d'affaires", 'Statut juridique'] },
      { type: 'texte', id: 'annexe2', titre: 'Annexe 2 — La cible', lignes: 2 },
      { type: 'texte', id: 'annexe3', titre: 'Annexe 3 — Définition de la cible', lignes: 3 },
      { type: 'grille', id: 'annexe4', titre: 'Annexe 4 — Les organisations correspondant à la cible', colonnes: ['Nom', 'Activité', 'Adresse', 'Numéro de téléphone', 'E-mail'], nbLignes: 11 },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: 'Critères de segmentation retenus (annexe 1).', documents: ['Documents 1 et 2', 'Annexe 1'], bareme: 4, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Critères de segmentation', 'Cochez les critères', 'Justification'], lignes: [
          ['Localisation', 'X', '17ème arrondissement de Paris'],
          ["Secteur d'activité", 'X', 'Établissements scolaires'],
          ['Taille', '', ''],
          ["Chiffre d'affaires", '', ''],
          ['Statut juridique', '', ''],
        ] },
      },
      { intitule: 'La cible (annexe 2).', documents: ['Document 1', 'Annexe 2'], bareme: 2, reponse: 'Les établissements scolaires du 17ème arrondissement.' },
      { intitule: 'Définition de la cible (annexe 3).', documents: ['Document 2', 'Annexe 3'], bareme: 2, reponse: "C'est l'ensemble des clients ou prospects que l'entreprise souhaite toucher à travers ses actions commerciales ou de communication afin d'augmenter ses ventes." },
      {
        intitule: 'Les organisations correspondant à la cible (annexe 4).', documents: ['Document 3', 'Annexe 4'], bareme: 11, reponse: 'Les établissements scolaires du 17ème arrondissement. Voir tableau.',
        tableau: { colonnes: ['Nom', 'Activité', 'Adresse', 'Numéro de tél', 'E-mail'], lignes: [
          ['Léon Gambetta', 'Collège public', '149, avenue Gambetta', '01.43.61.87.16', 'leongambetta@ac-paris.fr'],
          ['Maria Deraismes', 'Lycée Professionnel', '19, rue Maria Deraismes', '01.46.27.94.37', 'ce.0753350j@ac-paris.fr'],
          ['Latin', 'Collège Privé', '12, rue du Colonel Moll', '01.84.16.37.59', 'info@collegelatin.fr'],
          ['Pierre de Ronsard', 'Collège public', '140, avenue de Wagram', '01.47.63.16.17', 'pierrederonsard@ac-paris.fr'],
          ['Les Épinettes', 'Ecole maternelle publique', '44, rue des Epinettes', '01.46.27.50.99', 'ce.0751299E@ac-paris.fr'],
          ['Saint Michel des Batignolles', 'Lycée Privé', '14, avenue de Saint-Ouen', '01.58.22.20.70', '(fax : 01.46.27.27.18)'],
          ['Carnot', 'Lycée polyvalent', '145, Boulevard Malesherbes', '01.56.21.36.36', 'carnot@ac-paris.fr'],
          ['Bernard Buffet', 'Ecole Polyvalente', '14, rue Bernard Buffet', '01.53.31.36.30', 'bernardbuffet@ac-paris.fr'],
          ['Ampère', 'Ecole maternelle publique', '18, rue Ampère', '01.47.63.23.72', 'collegeampere@ac-paris.fr'],
          ['André Malraux', 'Collège public', '5 bis, rue Saint Ferdinand', '01.45.74.49.15', 'colandremalraux@ac-paris.fr'],
          ['La Rose Blanche', 'Collège public', '34, rue Georges Picquart', '01.46.07.05.10', 'laroseblanche@ac-paris.fr'],
        ] },
      },
    ],
  },
  synthese: {
    titre: "La segmentation et la cible de prospection",
    proposition: ['Localisation', 'Statut juridique', 'La définition de la cible', 'Les critères de segmentation'],
    racine: {
      id: 'racine', texte: 'Les recherches et l\u2019exploitation d\u2019information',
      enfants: [
        {
          id: 'seg', texte: 'La segmentation et la cible de prospection',
          enfants: [
            { id: 'loc', texte: null, reponse: 'Localisation' },
            { id: 'stat', texte: null, reponse: 'Statut juridique' },
          ],
        },
        {
          id: 'cible', texte: 'La cible',
          enfants: [
            { id: 'def', texte: 'Un groupe spécifique de clients potentiels auxquels un produit est destiné' },
            { id: 'crit', texte: 'Les critères de segmentation' },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: 'Comprendre la segmentation',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas ce qu\u2019est la segmentation.' },
          { niveau: 'debrouille', description: 'Je cite un critère de segmentation.' },
          { niveau: 'averti', description: 'Je connais les critères de segmentation en B to B.' },
          { niveau: 'expert', description: 'Je choisis les critères pertinents pour une cible donnée.' },
        ],
      },
      {
        id: 'c2', intitule: 'Identifier et définir la cible',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas ce qu\u2019est une cible.' },
          { niveau: 'debrouille', description: 'Je donne une définition approximative de la cible.' },
          { niveau: 'averti', description: 'Je définis la cible et je l\u2019identifie.' },
          { niveau: 'expert', description: 'Je relie la cible aux critères de segmentation.' },
        ],
      },
      {
        id: 'c3', intitule: 'Exploiter un fichier',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas exploiter un annuaire.' },
          { niveau: 'debrouille', description: 'Je repère quelques organisations.' },
          { niveau: 'averti', description: 'Je sélectionne les organisations correspondant à la cible.' },
          { niveau: 'expert', description: 'Je justifie chaque sélection au regard de la cible.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Segmentation', definition: "Découpage des clients ou prospects en ensembles homogènes selon des critères." },
      { terme: 'Cible', definition: "Ensemble des clients ou prospects que l'entreprise souhaite toucher par ses actions commerciales." },
      { terme: 'Prospect', definition: "Client potentiel qui n'a pas encore acheté." },
      { terme: 'Prospection', definition: "Démarche visant à conquérir de nouveaux clients." },
      { terme: 'B to B', definition: 'Échanges commerciaux entre professionnels (entreprise à entreprise).' },
      { terme: 'Critère de localisation', definition: 'Découpage selon le lieu (ville, département, région).' },
      { terme: "Critère de secteur d'activité", definition: 'Découpage selon le domaine (banque, immobilier, enseignement...).' },
      { terme: 'Statut juridique', definition: "Forme légale de l'organisation (SARL, EURL, SAS...)." },
      { terme: 'Portefeuille clients', definition: "Ensemble des clients d'une entreprise." },
      { terme: 'Annuaire', definition: "Fichier répertoriant des organisations avec leurs coordonnées." },
    ],
    flashcards: [
      { recto: "Qu'est-ce que la segmentation ?", verso: 'Le découpage des clients/prospects en ensembles homogènes selon des critères.' },
      { recto: 'Citez les 5 critères de segmentation.', verso: "Localisation, secteur d'activité, taille, chiffre d'affaires, statut juridique." },
      { recto: 'Quelle est la cible visée par Mme Pauret ?', verso: 'Les établissements scolaires du 17ème arrondissement.' },
      { recto: "Qu'est-ce qu'une cible ?", verso: "L'ensemble des clients ou prospects que l'entreprise souhaite toucher pour augmenter ses ventes." },
      { recto: 'Quels critères ont été retenus ?', verso: "Localisation (17ème) et secteur d'activité (établissements scolaires)." },
      { recto: 'Que veut dire B to B ?', verso: 'Échanges commerciaux entre professionnels.' },
      { recto: "Donnez un exemple de critère de statut juridique.", verso: 'SARL, EURL, SAS.' },
      { recto: "Qu'est-ce qu'un prospect ?", verso: "Un client potentiel qui n'a pas encore acheté." },
      { recto: "Quel est le but de la prospection ?", verso: "Augmenter le portefeuille clients de l'entreprise." },
      { recto: "Quel produit sera proposé lors de la prospection ?", verso: 'Des photocopieurs en location.' },
    ],
    quiz: [
      { type: 'unique', question: "Qu'est-ce que la segmentation ?", options: ['Le découpage des prospects en ensembles homogènes', 'La vente directe', 'La livraison', 'La facturation'], bonne: 0 },
      { type: 'unique', question: "Lequel n'est PAS un critère de segmentation cité ?", options: ['La couleur préférée', 'La localisation', 'La taille', 'Le statut juridique'], bonne: 0 },
      { type: 'unique', question: 'Quelle est la cible visée ?', options: ['Les établissements scolaires du 17ème', 'Les banques', 'Les particuliers', 'Les boulangeries'], bonne: 0 },
      { type: 'unique', question: 'Les 2 critères retenus sont...', options: ["Localisation et secteur d'activité", 'Taille et CA', 'CA et statut juridique', 'Taille et localisation'], bonne: 0 },
      { type: 'unique', question: 'B to B signifie...', options: ['Entre professionnels', 'Entre particuliers', 'Business to Bank', 'Back to Basics'], bonne: 0 },
      { type: 'unique', question: 'Quel produit sera proposé en prospection ?', options: ['Photocopieurs en location', 'Ordinateurs', 'Logiciels', 'Imprimantes 3D'], bonne: 0 },
      { type: 'unique', question: "Qu'est-ce qu'un prospect ?", options: ["Un client potentiel non encore acheteur", 'Un fournisseur', 'Un salarié', 'Un concurrent'], bonne: 0 },
      { type: 'unique', question: 'Exemple de statut juridique ?', options: ['SAS', 'Paris', 'Banque', '50 salariés'], bonne: 0 },
      { type: 'unique', question: 'Le but de la prospection est de...', options: ['Augmenter le portefeuille clients', 'Réduire les coûts', 'Licencier', 'Fermer des agences'], bonne: 0 },
      { type: 'unique', question: 'La cible sert à...', options: ['Orienter les actions commerciales', 'Calculer la TVA', 'Recruter', 'Livrer'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque élément dans la bonne catégorie.',
      etiquettes: ['Critère de segmentation', 'Organisation cible', 'Organisation hors cible'],
      zones: [
        { libelle: 'Localisation', etiquetteIndex: 0 },
        { libelle: 'Statut juridique', etiquetteIndex: 0 },
        { libelle: 'Léon Gambetta (collège)', etiquetteIndex: 1 },
        { libelle: 'Carnot (lycée)', etiquetteIndex: 1 },
        { libelle: 'Laforet Ternes (immobilier)', etiquetteIndex: 2 },
        { libelle: 'Société Générale (banque)', etiquetteIndex: 2 },
      ],
    },
  },
}

const AMPARIS_M3: ContenuMission = {
  travaux: {
    consigne:
      "Préparez l'opération de prospection : choisissez les techniques adaptées, rédigez la prospection écrite, préparez l'appel téléphonique (méthode CROC) et réalisez la fiche prospect.",
    contexte:
      "Vous avez désormais toutes les informations nécessaires sur la clientèle à cibler et ses caractéristiques. Vous pouvez donc préparer l'opération de prospection.",
    documents: [
      { numero: 1, titre: 'Les explications de Mme Pauret', images: [], texte: [
        { pageWeb: true },
        { dialogue: [
          { texte: "« Il existe plusieurs techniques de prospection tels que le boîtage, le mailing, le publipostage, le phoning...", italique: true },
          { texte: "Lorsqu'on lance des opérations de prospection chez AMParis, il peut nous arriver d'utiliser l'une d'entre elle, mais le plus souvent nous faisons une combinaison de deux techniques et quelques rares fois de trois techniques.", italique: true },
          { texte: "La première technique que nous utilisons est souvent une technique de prospection à distance : l'écrit. Elle permet d'attirer l'attention du client/prospect et de le faire réfléchir. On laisse passer un peu de temps puis pour le relancer, on utilise une deuxième technique : dite de contact direct. Cette technique permet, comme son nom l'indique, d'entrer directement en contact avec le client afin de répondre à ses questions pour essayer d'obtenir un rendez-vous. »", italique: true },
          { texte: "Dans tous les cas, je ne veux pas que les techniques qui seront utilisées nous coûtent chères. Le budget que nous pouvons mettre est très faible : 20 € maximum. Pour autant il faut que celles qui seront choisies dynamiques et attirent l'œil du prospect.", italique: true },
        ] },
      ] },
      { numero: 2, titre: 'Les techniques de prospection', images: [], texte: [
        { pageWeb: true },
        { intertitre: 'Le boîtage', paragraphes: [
          "Le boîtage est l'action de déposer, dans les boîtes à lettres d'un ensemble de prospects, d'où le terme boîtage, un prospectus leur donnant des informations sur un service ou un produit donné.",
          "Il permet un ciblage extrêmement précis. Qu'il s'agisse de cibler un quartier spécifique, une rue, voire un type de bien.",
          "C'est un moyen efficace de générer de la sympathie. Par exemple, certaines agences envoient un mot pour les fêtes de fin d'année.",
          "Le boîtage peut être perçu comme étant assez envahissant. De ce fait, en répétant de façon plus que nécessaire votre distribution, vous risquez de lasser le client potentiel.",
          "Mettre en place une opération de ce type est plutôt chronophage. Sachez que la création d'un contenu de qualité et sa distribution peuvent prendre de nombreuses heures.",
        ] },
        { intertitre: "L'e-mailing", paragraphes: [
          "Une campagne d'e-mailing a l'avantage d'être très peu coûteuse. Elle peut permettre de générer des demandes de devis ou de prises de rendez-vous. Elle permet également de mettre des liens vers les produits de l'entreprise, de mettre des images animées et dynamique qui attirent l'attention de celui qui le lit. Mais il présente aussi des inconvénients. D'abord, son taux de retour (= réponse) extrêmement faible, inférieur à 1 % car l'emailing est souvent considéré comme un Spam.",
        ] },
        { intertitre: 'Le publipostage (= courrier adressé à un client ou prospect pour lui proposer une offre)', paragraphes: [
          "S'il touche 100 % de vos cibles, le mailing est cependant long en conception et en délai d'acheminement. Autre inconvénient : son coût. On estime qu'un mailing revient entre 1 et 2 euros l'unité.",
        ] },
        { intertitre: 'Le phoning (= prospection téléphonique)', paragraphes: [
          "Le téléphone reste, et de loin, l'outil roi en matière de prospection commerciale. Une condition est néanmoins pré-requise : que le fichier clients soit à jour. « Le téléphone reste le meilleur outil en B to B car les clients veulent aujourd'hui une bonne offre mais aussi et surtout un bon relationnel », indique Francine Carton, auteur de « Trouver ses clients ».",
          "Les vastes campagnes de télémarketing BtoC issues de centres d'appels ont entaché durablement la vision du phoning, y compris en BtoB. Appels de masse, démarches proches de l'arnaque, basse qualité de l'échange, ces coups de fil intempestifs pèsent lourdement dans la vision publique du télémarketing.",
        ] },
        { intertitre: 'La prospection de terrain (= le démarchage à domicile)', paragraphes: [
          "Cela vous permet de connaitre parfaitement votre secteur et de détecter tous les avantages et inconvénients d'un quartier : proximité des commerces, des services publiques, parcs, métro, nuisances sonores... Toutes ces informations vous seront très utiles pour vendre des biens lorsque vous aurez obtenu plusieurs mandats.",
          "L'exercice est très chronophage (= demande beaucoup de temps) dans sa préparation et son exécution.",
        ] },
      ] },
      { numero: 3, titre: 'Intervention de Mme Pauret', images: [], texte: [
        { pageWeb: true },
        { dialogue: [
          { texte: "« Comme je te l'ai déjà dit, je veux que le document que tu rédigeras soit dynamique. Ton document devra donc comporter :", italique: true },
        ] },
        { puces: [
          "Un destinataire, un expéditeur et un objet ;",
          "Une phrase d'accroche pour donner envie de lire (nous faisons – 20% la première année) ;",
          "Rappeler la date limite de l'offre le 28 mars 202N ;",
          "Insérer un lien cliquable et menant directement aux photocopieurs en location : https://www.amparis.fr/photocopieur-couleur",
          "Précisez le téléphone de l'entreprise pour être rappelé. » Fais bien attention à ton orthographe !!! »",
        ] },
      ] },
      { numero: 4, titre: "Conseil d'Eva Pauret", images: [], texte: [
        { pageWeb: true },
        { dialogue: [
          { texte: "« Le phoning peut-être une technique de prospection très efficace, à condition qu'elle ne soit pas faite n'importe comment. Rappelez-vous toujours que le prospect n'est pas en train de vous attendre. Donc s'il se rend compte que vous ne maîtrisez pas votre sujet, il raccrochera… parfois sans même vous prévenir.", italique: true },
          { texte: "Le phoning doit être préparé en amont par le commercial qui veut réussir son appel et pour cela il doit utiliser la méthode : CROC. »", italique: true },
        ] },
        { paragraphes: ["En émission d'appel, utilisez le C.R.O.C.", "Lorsque vous appelez un client où un prospect, vous appliquerez pendant l'appel, la méthode C.R.O.C."] },
      ] },
      { numero: 5, titre: 'Méthode CROC', images: [], texte: [
        { pageWeb: true },
        { tableau: { colonnes: ['CROC', 'Éléments de communication'], lignes: [
          ['Contact', "Saluer, se présenter, présenter l'entreprise, demander l'interlocuteur désiré"],
          ["Raison d'appel", 'Dire la raison pour laquelle vous appelez le client'],
          ['Objectif', 'Proposer et obtenir un rendez-vous'],
          ['Conclusion', "Reformuler : date, heure et lieu du rendez-vous. Prendre congé : remercier, saluer et raccrocher après l'interlocuteur"],
        ] } },
      ] },
      { numero: 6, titre: 'Consignes de votre tutrice pour réaliser une fiche contact', images: [], texte: [
        { pageWeb: true },
        { paragraphes: ["« Lorsque vous réaliserez la fiche contact pour les prospects, elle devra comporter quatre grandes parties en plus de la date du contact qui doit y figurer :"] },
        { intertitre: 'Avant le rendez-vous', puces: ["Les coordonnées de l'entreprises ;", 'Les coordonnées du décisionnaire ;'] },
        { intertitre: 'Pendant le rendez-vous', puces: ['Les besoins du client ;', 'Le résultat de la prospection (rappel, rendez-vous…) »'] },
      ] },
      { numero: 7, titre: 'Organigramme', images: [], texte: [
        { pageWeb: true },
        { organigramme: {
          tete: {
            libelle: 'Proviseur', teinte: 'tete',
            enfants: [
              { libelle: 'Vie scolaire', teinte: 'bleu', enfants: [
                { libelle: 'C.P.E 1', teinte: 'bleu', enfants: [ { libelle: 'A.E.D', teinte: 'bleu' } ] },
                { libelle: 'C.P.E 2', teinte: 'bleu' },
              ] },
              { libelle: 'Secrétariat direction', teinte: 'jaune' },
              { libelle: 'Gestionnaire', sousTitre: 'Mme Barbara Larue — 01.46.27.94.37', teinte: 'vert', enfants: [
                { libelle: 'Secrétariat Intendance', teinte: 'vert' },
                { libelle: 'Agents', teinte: 'vert' },
              ] },
            ],
          },
          transversal: 'Le corps professoral',
        } },
      ] },
      { numero: 8, titre: 'Procédure pour compléter la fiche prospect', images: [], texte: [
        { pageWeb: true },
        { paragraphes: ["« Avant d'aller à un rendez-vous avec un prospect ou un client, il vous faut compléter les deux premières parties de la fiche prospect :"] },
        { puces: ["Les coordonnées de l'entreprise ;", 'Les coordonnées de la personne décisionnaire.'] },
        { paragraphes: ["Pour ce faire, je vous demande de vous rendre sur le logiciel de l'entreprise pour le compléter. Vous avez 2 possibilités :"] },
        { intertitre: 'AMParis — Fiche Prospect (logiciel Quizinière)', paragraphes: ['Documents & Systèmes — AMParis — tél. 01 47 90 71 20', 'FICHE PROSPECT'] },
        { intertitre: "COORDONNEES DE L'ORGANISATION (Entreprise, école, association…)", puces: ['Dénomination :', 'Adresse :', 'Téléphone :', 'Site internet :'] },
        { intertitre: 'COORDONNEES DU DECISIONNAIRE', puces: ['Nom :', 'Prénom :', 'Fonction :', 'E-mail :'] },
        { intertitre: 'LES BESOINS DU CLIENT', paragraphes: ['Votre texte'] },
        { intertitre: 'LE RESULTAT DE LA PROSPECTION', paragraphes: ['Votre texte'] },
      ] },
    ],
    competence: {
      groupe: 'Groupe de compétences 4B',
      intitule: "Participer à la conception d'une opération de prospection",
      detail: "Choisir les techniques de prospection, rédiger les supports écrits et préparer le contact téléphonique.",
    },
    objectifs: [
      'Comparer les techniques de prospection et choisir les plus adaptées.',
      "Rédiger un support de prospection écrite (e-mailing, publipostage).",
      "Préparer un appel téléphonique avec la méthode CROC et réaliser une fiche prospect.",
    ],
    activites: [
      {
        titre: 'Activité 1 — Les techniques de prospection adaptées',
        questions: [
          { numero: 1, consigne: 'Listez les avantages et les inconvénients de chaque technique de prospection.', ressources: "Lire le document 2, compléter l'annexe 1. [C.4B.2]", annexeId: 'annexe1' },
          { numero: 2, consigne: "Répartissez les techniques de prospection selon qu'elles soient à distance ou de contact direct.", ressources: "Lire les documents 1 et 2, compléter l'annexe 2. [C.4B.2]", annexeId: 'annexe2' },
          { numero: 3, consigne: "Retrouvez toutes les techniques qu'il est possible d'utiliser chez AMParis. Justifiez votre réponse par rapport aux exigences de votre tutrice.", ressources: "Lire le document 2, compléter l'annexe 3. [C.4B.2]", annexeId: 'annexe3' },
          { numero: 4, consigne: 'Indiquez les 2 techniques que vous retiendrez pour la prospection de votre cible. Justifiez votre réponse en citant le document 2.', ressources: "Compléter l'annexe 4. [C.4B.2]", annexeId: 'annexe4' },
        ],
      },
      {
        titre: 'Activité 2 — La prospection écrite',
        questions: [
          { numero: 5, consigne: 'Rédigez le document de prospection écrite que vous allez envoyer à vos prospects.', ressources: "Lire le document 3, compléter l'annexe 5. [C.4B.2]", annexeId: 'annexe5' },
          { numero: 6, consigne: "Retournez à la Mission 2, l'annexe 4, puis indiquez quelle coordonnée est manquante.", ressources: "Compléter l'annexe 6. [C.4B.2]", annexeId: 'annexe6' },
          { numero: 7, consigne: "Donnez le nom de l'organisation dont la coordonnée est manquante.", ressources: "Compléter l'annexe 7. [C.4B.2]", annexeId: 'annexe7' },
          { numero: 8, consigne: "Quelle autre coordonnée de l'organisation est disponible pour envoyer le document de prospection écrit.", ressources: "Compléter l'annexe 8. [C.4B.2]", annexeId: 'annexe8' },
          { numero: 9, consigne: "Indiquez quelle autre technique de prospection écrite il est possible d'utiliser.", ressources: "Relire le document 2, compléter l'annexe 9. [C.4B.2]", annexeId: 'annexe9' },
          { numero: 10, consigne: "Rédigez le document de prospection écrite que vous allez envoyer à vos prospects. N'oubliez pas d'adapter le document 3 au type de document que vous allez rédiger.", ressources: "Relire le document 3, compléter l'annexe 10. [C.4B.2]", annexeId: 'annexe10' },
        ],
      },
      {
        titre: 'Activité 3 — La prospection téléphonique',
        questions: [
          { numero: 11, consigne: 'Préparez votre appel téléphonique en utilisant la méthode CROC.', ressources: "Lire les documents 4 et 5, compléter l'annexe 11. [C.4B.2]", annexeId: 'annexe11' },
        ],
      },
      {
        titre: "Activité 4 — La réalisation d'une fiche prospect",
        questions: [
          { numero: 12, consigne: "Listez tous les éléments que vous devez faire figurer dans chaque partie d'une fiche prospect.", ressources: "Lire le document 6, compléter l'annexe 12. [C.4B.2]", annexeId: 'annexe12' },
          { numero: 13, consigne: 'Réalisez un modèle de fiche prospect.', ressources: "Compléter l'annexe 13. [C.4B.2]", annexeId: 'annexe13' },
          { numero: 14, consigne: 'Complétez les deux premières parties de la fiche prospect.', ressources: "Consulter la Mission 2 document 3 puis lire les documents 7 et 8, compléter l'annexe 13. [C.4B.2]", annexeId: 'annexe13' },
        ],
      },
    ],
    annexes: [
      { type: 'grille', id: 'annexe1', titre: 'Annexe 1 — Avantages et inconvénients', colonnes: ['Techniques de prospection', 'Avantages', 'Inconvénients'], nbLignes: 5 },
      { type: 'grille', id: 'annexe2', titre: 'Annexe 2 — Les techniques de prospection à distance ou de contact (direct)', colonnes: ['Prospection à distance', 'Prospection de contact'], nbLignes: 3 },
      { type: 'grille', id: 'annexe3', titre: "Annexe 3 — Les techniques utilisables dans l'entreprise", colonnes: ['Techniques utilisables', 'Justifications'], nbLignes: 2 },
      { type: 'grille', id: 'annexe4', titre: 'Annexe 4 — Les techniques retenues', colonnes: ['Techniques', 'Justifications'], nbLignes: 2 },
      { type: 'mail', id: 'annexe5', titre: 'Annexe 5 — Rédaction de la prospection écrite (e-mailing)' },
      { type: 'texte', id: 'annexe6', titre: 'Annexe 6 — La coordonnée manquante', lignes: 1 },
      { type: 'texte', id: 'annexe7', titre: "Annexe 7 — Le nom de l'organisation dont il manque la coordonnée", lignes: 1 },
      { type: 'texte', id: 'annexe8', titre: "Annexe 8 — L'autre coordonnée disponible", lignes: 1 },
      { type: 'texte', id: 'annexe9', titre: "Annexe 9 — L'autre technique de prospection écrite", lignes: 1 },
      { type: 'courrier', id: 'annexe10', titre: 'Annexe 10 — Rédaction de la prospection écrite (publipostage)' },
      { type: 'croc', id: 'annexe11', titre: "Annexe 11 — Complétez la fiche d'appel CROC" },
      { type: 'grille', id: 'annexe12', titre: 'Annexe 12 — Liste des éléments sur une fiche prospect', colonnes: ['Partie de la fiche', 'Éléments à faire figurer'], nbLignes: 4 },
      { type: 'fichecontact', id: 'annexe13', titre: 'Annexe 13 — Création du modèle de fiche contact' },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: 'Avantages et inconvénients (annexe 1).', documents: ['Document 2', 'Annexe 1'], bareme: 10, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Techniques de prospection', 'Avantages', 'Inconvénients'], lignes: [
          ['Le boîtage', 'Il permet un ciblage extrêmement précis. Moyen efficace de générer de la sympathie.', 'Perçu comme étant assez envahissant. Chronophage.'],
          ["L'e-mailing", "Très peu coûteuse. Permet de générer des demandes de devis ou de prises de rendez-vous. Mettre des images animées et dynamique qui attirent l'attention.", 'Taux de retour (= réponse) extrêmement faible.'],
          ['Le publipostage', 'Touche 100 % de vos cibles.', "Long en conception et en délai d'acheminement."],
          ['La prospection de terrain', "Permet de détecter tous les avantages et inconvénients d'un quartier.", "Très chronophage. Son coût entre 1 et 2 euros l'unité."],
          ['Le phoning', 'Le téléphone reste le meilleur outil en B to B.', "Appels de masse, démarches proches de l'arnaque, basse qualité de l'échange."],
        ] },
      },
      {
        intitule: 'Techniques à distance ou de contact (annexe 2).', documents: ['Documents 1 et 2', 'Annexe 2'], bareme: 5, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Prospection à distance', 'Prospection de contact'], lignes: [
          ['E-mailing', 'Boîtage'],
          ['Publipostage', 'Prospection de terrain'],
          ['', 'Phoning'],
        ] },
      },
      {
        intitule: "Techniques utilisables dans l'entreprise (annexe 3).", documents: ['Document 2', 'Annexe 3'], bareme: 4, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Techniques utilisables', 'Justifications'], lignes: [
          ["L'e-mailing", 'Les techniques de prospection choisies doivent être dynamiques.'],
          ['Le phoning', '« Avoir un contact direct et chaleureux avec les prospects. »'],
        ] },
      },
      {
        intitule: 'Techniques retenues (annexe 4).', documents: ['Document 2', 'Annexe 4'], bareme: 4, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Techniques', 'Justifications'], lignes: [
          ["L'e-mailing", "Document 2 : « …permet également de mettre des liens vers les produits de l'entreprise, de mettre des images animées et dynamique qui attirent l'attention »"],
          ['Le phoning', "Document 2 : « …les clients veulent aujourd'hui une bonne offre mais aussi et surtout un bon relationnel. »"],
        ] },
      },
      {
        intitule: 'Rédaction de la prospection écrite — e-mailing (annexe 5).', documents: ['Document 3', 'Annexe 5'], bareme: 6, reponse:
          "Nouveau message — De : contact@amparis.fr — A : [destinataire] — Objet : Remise sur la location des photocopieurs. Corps : – 20 % pendant 1 an pour la location d'un photocopieur couleur. Offre valable jusqu'au 28.03.202N. https://www.amparis.fr/photocopieur-couleur. Tél : 01.47.90.27.79" },
      { intitule: 'La coordonnée manquante (annexe 6).', documents: ['Mission 2 annexe 4', 'Annexe 6'], bareme: 1, reponse: 'Il manque un e-mail.' },
      { intitule: "Le nom de l'organisation (annexe 7).", documents: ['Mission 2 annexe 4', 'Annexe 7'], bareme: 1, reponse: 'Lycée privé Saint Michel des Batignolles.' },
      { intitule: "L'autre coordonnée disponible (annexe 8).", documents: ['Mission 2 annexe 4', 'Annexe 8'], bareme: 1, reponse: "L'adresse postale (14, avenue de Saint-Ouen)." },
      { intitule: "L'autre technique de prospection écrite (annexe 9).", documents: ['Document 2', 'Annexe 9'], bareme: 1, reponse: 'Le publipostage.' },
      {
        intitule: 'Rédaction de la prospection écrite — publipostage (annexe 10).', documents: ['Document 3', 'Annexe 10'], bareme: 6, reponse:
          "Lycée Privé Saint Michel Des Batignolles, 14, avenue de Saint-Ouen, 75017 Paris. Paris, le 15 mars 202N. Objet : Remise sur la location des photocopieurs. Notre société AMParis a le plaisir de vous informer de l'offre promotionnelle du mois. Afin de vous aider à faire des économies, nous vous proposons une remise exceptionnelle de - 20 % la première année sur la location de photocopieurs. La remise est valable jusqu'au 28 mars 202N. Ne tardez pas et soyez le premier à réserver votre photocopieur. Nous vous remercions de votre attention et nous vous invitons à vous rendre sur notre site pour découvrir toute notre sélection de photocopieurs : https://www.amparis.fr/photocopieur-couleur. AMParis." },
      {
        intitule: "Fiche d'appel CROC (annexe 11).", documents: ['Documents 4 et 5', 'Annexe 11'], bareme: 8, reponse: 'Voir fiche.',
        tableau: { colonnes: ['Étape', 'Contenu'], lignes: [
          ['Contact', "Bonjour, Mme/ M…., Je suis Prénom NOM d'AMParis, vous êtes bien le (la) gestionnaire de l'établissement (nom de l'établissement) ?"],
          ['Raison', "Je vous appelle suite à l'e-mail que je vous ai envoyé il y a une semaine. Il y a -20% sur les locations de photocopieurs couleurs pendant un an."],
          ['Objectif', 'Je souhaiterais prendre rendez-vous avec vous pour vous présenter notre offre et ses avantages plus en détail. Quand seriez-vous disponible pour que nous puissions nous rencontrer ?'],
          ['Conclusion', "Nous disons donc rendez-vous le… à… au (adresse). Je vous remercie pour votre accueil et je vous souhaite une bonne journée. Au revoir Mme/ M. …"],
        ] },
      },
      {
        intitule: "Éléments d'une fiche prospect (annexe 12).", documents: ['Document 6', 'Annexe 12'], bareme: 8, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Partie de la fiche', 'Éléments à faire figurer'], lignes: [
          ["Coordonnées de l'entreprise", 'Dénomination, Téléphone, Adresse, Site internet'],
          ['Coordonnées du décisionnaire', 'Nom, Prénom, Fonction, E-mail'],
          ['Besoins du client', 'Caractéristiques du produit souhaité'],
          ['Résultat de la prospection', 'Souhaite un 2ème rendez-vous ; Souhaite être rappelé ; A passé commande…'],
        ] },
      },
      {
        intitule: 'Modèle de fiche contact complété (annexe 13).', documents: ['Mission 2 document 3', 'Documents 7 et 8', 'Annexe 13'], bareme: 8, reponse:
          "FICHE CONTACT. Coordonnées de l'organisation : Dénomination Maria Deraismes (Lycée Professionnel), Adresse 19, rue Maria Deraismes 75017 Paris, Téléphone 01.46.27.94.37, Site internet [à compléter]. Coordonnées du décisionnaire : Nom Larue, Prénom Barbara, Fonction Gestionnaire, E-mail [à compléter]. Les besoins du client et le résultat de la prospection sont complétés pendant le rendez-vous." },
    ],
  },
  synthese: {
    titre: "La préparation de l'opération de prospection",
    proposition: ["L'e-mailing", 'Le phoning', "Phrase d'accroche", 'La méthode C.R.O.C.', 'Conclusion'],
    racine: {
      id: 'racine', texte: "La préparation de la prospection",
      enfants: [
        { id: 'tech', texte: 'Les techniques de prospection', enfants: [
          { id: 'mail', texte: null, reponse: "L'e-mailing" },
          { id: 'phon', texte: null, reponse: 'Le phoning' },
        ] },
        { id: 'ecrit', texte: 'La prospection écrite', enfants: [
          { id: 'acc', texte: "Phrase d'accroche" },
          { id: 'reg', texte: 'Règles de rédaction' },
        ] },
        { id: 'tel', texte: 'La prospection téléphonique', enfants: [
          { id: 'croc', texte: 'La méthode C.R.O.C.' },
        ] },
        { id: 'fiche', texte: 'La fiche prospect', enfants: [
          { id: 'coord', texte: "Coordonnées de l'entreprise" },
          { id: 'info', texte: "Informations d'une fiche prospect" },
        ] },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: 'Choisir les techniques de prospection',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas les techniques de prospection.' },
          { niveau: 'debrouille', description: 'Je cite quelques techniques.' },
          { niveau: 'averti', description: 'Je compare avantages et inconvénients des techniques.' },
          { niveau: 'expert', description: 'Je choisis et justifie les techniques adaptées à la cible.' },
        ],
      },
      {
        id: 'c2', intitule: 'Rédiger un support de prospection écrite',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas rédiger un support de prospection.' },
          { niveau: 'debrouille', description: 'Je rédige un message incomplet.' },
          { niveau: 'averti', description: 'Je rédige un e-mailing ou un publipostage complet.' },
          { niveau: 'expert', description: 'Je respecte toutes les consignes (accroche, offre, lien, contact).' },
        ],
      },
      {
        id: 'c3', intitule: 'Préparer le contact téléphonique et la fiche prospect',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas la méthode CROC.' },
          { niveau: 'debrouille', description: 'Je cite les étapes du CROC.' },
          { niveau: 'averti', description: "Je prépare une fiche d'appel CROC complète." },
          { niveau: 'expert', description: 'Je réalise une fiche prospect complète et exploitable.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Boîtage', definition: "Dépôt d'un prospectus dans les boîtes à lettres d'un ensemble de prospects." },
      { terme: 'E-mailing', definition: "Envoi d'un message commercial par courrier électronique." },
      { terme: 'Publipostage', definition: 'Courrier adressé à un client ou prospect pour lui proposer une offre.' },
      { terme: 'Phoning', definition: 'Prospection téléphonique.' },
      { terme: 'Prospection de terrain', definition: 'Démarchage à domicile.' },
      { terme: 'Prospection à distance', definition: 'Technique sans contact physique (e-mailing, publipostage).' },
      { terme: 'Prospection de contact', definition: 'Technique avec contact (boîtage, phoning, terrain).' },
      { terme: 'Méthode CROC', definition: "Contact, Raison d'appel, Objectif, Conclusion : trame d'un appel de prospection." },
      { terme: "Phrase d'accroche", definition: "Phrase qui donne envie de lire un support de prospection." },
      { terme: 'Fiche prospect', definition: "Fiche regroupant les coordonnées et besoins d'un prospect." },
    ],
    flashcards: [
      { recto: "Qu'est-ce que le boîtage ?", verso: "Le dépôt d'un prospectus dans les boîtes à lettres des prospects." },
      { recto: "Avantage de l'e-mailing ?", verso: 'Très peu coûteux, liens et images dynamiques.' },
      { recto: "Inconvénient de l'e-mailing ?", verso: 'Taux de retour très faible (souvent considéré comme spam).' },
      { recto: 'Coût du publipostage ?', verso: "Entre 1 et 2 euros l'unité." },
      { recto: 'Que signifie CROC ?', verso: "Contact, Raison d'appel, Objectif, Conclusion." },
      { recto: 'Budget maximum imposé par Mme Pauret ?', verso: '20 € maximum.' },
      { recto: 'Les 2 techniques retenues ?', verso: "L'e-mailing et le phoning." },
      { recto: 'Techniques de prospection à distance ?', verso: 'E-mailing et publipostage.' },
      { recto: 'Techniques de prospection de contact ?', verso: 'Boîtage, prospection de terrain, phoning.' },
      { recto: "Les 4 parties d'une fiche prospect ?", verso: "Coordonnées de l'entreprise, du décisionnaire, besoins du client, résultat de la prospection." },
    ],
    quiz: [
      { type: 'unique', question: 'Que signifie CROC ?', options: ["Contact, Raison, Objectif, Conclusion", 'Client, Relation, Offre, Contrat', 'Contact, Réponse, Objet, Clôture', 'Cible, Relance, Offre, Conclusion'], bonne: 0 },
      { type: 'unique', question: 'Budget maximum imposé ?', options: ['20 €', '200 €', '50 €', '100 €'], bonne: 0 },
      { type: 'unique', question: 'Les 2 techniques retenues sont...', options: ['E-mailing et phoning', 'Boîtage et terrain', 'Publipostage et boîtage', 'Terrain et phoning'], bonne: 0 },
      { type: 'unique', question: "Inconvénient de l'e-mailing ?", options: ['Taux de retour très faible', 'Très coûteux', 'Long à concevoir', 'Envahissant'], bonne: 0 },
      { type: 'unique', question: 'Le publipostage est une prospection...', options: ['À distance', 'De contact', 'De terrain', 'Téléphonique'], bonne: 0 },
      { type: 'unique', question: 'Coût du publipostage ?', options: ["1 à 2 € l'unité", 'Gratuit', "10 € l'unité", "0,10 € l'unité"], bonne: 0 },
      { type: 'unique', question: 'Le phoning est...', options: ['La prospection téléphonique', 'Le démarchage à domicile', "L'envoi d'e-mails", 'Le boîtage'], bonne: 0 },
      { type: 'unique', question: "Coordonnée manquante pour Saint Michel des Batignolles ?", options: ["L'e-mail", "L'adresse", 'Le téléphone', 'Le nom'], bonne: 0 },
      { type: 'unique', question: 'Date limite de l\u2019offre ?', options: ['28 mars 202N', '15 mars 202N', '22 octobre', '1er janvier'], bonne: 0 },
      { type: 'unique', question: "Combien de parties dans une fiche prospect ?", options: ['4', '2', '3', '5'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque technique selon son type de prospection.',
      etiquettes: ['Prospection à distance', 'Prospection de contact', 'Étape CROC'],
      zones: [
        { libelle: "L'e-mailing", etiquetteIndex: 0 },
        { libelle: 'Le publipostage', etiquetteIndex: 0 },
        { libelle: 'Le boîtage', etiquetteIndex: 1 },
        { libelle: 'Le phoning', etiquetteIndex: 1 },
        { libelle: 'Contact', etiquetteIndex: 2 },
        { libelle: 'Conclusion', etiquetteIndex: 2 },
      ],
    },
  },
}

const AMPARIS_M4: ContenuMission = {
  travaux: {
    consigne:
      "Réalisez l'opération de prospection téléphonique et analysez ses résultats : listez les prospects, gérez les appels, mesurez le taux de réalisation, calculez le coût et mettez à jour le fichier clients.",
    contexte:
      "C'est le jour « J » et vous allez commencer votre campagne de téléprospection qui s'étendra du 13 au 17 mars. Afin d'être sûr de ce que vous avez à faire aujourd'hui vous faites une liste par ordre chronologique.",
    documents: [
      { numero: 1, titre: 'Les réponses à vos appels', images: [], texte: [
        { pageWeb: true },
        { journalAppels: { entete: "Journal des appels — Téléprospection", appels: [
          { numero: '01.45.74.49.15', reponse: "« J'ai bien reçu votre document. Justement nous souhaitons changer notre photocopieur. Je vous propose de nous rencontrer le 17 mars à 14h.", interlocuteur: 'Mme Fanta Diagoura - Gestionnaire' },
          { numero: '01.47.63.23.72', reponse: "« Merci, mais je ne suis pas intéressée car notre école Ampère s'est équipé en début d'année scolaire d'un nouveau photocopieur. »", interlocuteur: "M. Julien Tabua - Directeur d'Ecole" },
          { numero: '01.46.07.05.10', reponse: "« Je suis intéressé, mais je vous avoue que je n'ai pas vu votre mail. Pourriez-vous le renvoyer à l'adresse suivante : gestionnaire.laroseblanche@ac-paris.fr", interlocuteur: 'Mme Odile Gomez' },
          { numero: '01.84.16.37.59', reponse: "« Bonjour, La personne décisionnaire est en réunion veuillez la rappeler en début d'après-midi. »", interlocuteur: "L'agent d'accueil" },
          { numero: '01.43.61.87.16', reponse: "« Je suis personnel d'accueil. Nous ne répondons jamais au démarchage par téléphone. Donc je ne peux pas donner suite à votre appel. Bonne journée à vous, au revoir. »", interlocuteur: '' },
          { numero: '01.56.21.36.36', reponse: "« Quand pourrions-nous nous rencontrer ? Le mercredi après-midi il n'y a pas d'élève, je peux vous recevoir le 14 mars à 14h30.", interlocuteur: 'Mme Corinne Forest - Gestionnaire' },
          { numero: '01.46.27.50.99', reponse: "« Bonjour, je suis la gestionnaire. Nous avons le projet de remplacer notre photocopieur mais plus l'an prochain car nous n'avons pas assez de budget. Rappelez-moi en janvier. Voilà mon numéro direct : 01.46.27.50.97 »", interlocuteur: 'Mme Sarah Picard' },
          { numero: '01.58.22.20.70', reponse: "« C'est vous qui avez appelé ce matin ? Je suis, sa secrétaire. Il ne sera pas disponible pour vous parler. Je suis désolée.", interlocuteur: 'Le secrétariat' },
          { numero: '01.46.27.94.37', reponse: "« Je suis la gestionnaire. J'ai consulté votre site internet avec beaucoup d'intérêt et il y a des équipements qui m'intéresse. Nous pouvons nous rencontrer le 16 mars à 16h30 ».", interlocuteur: 'Mme Barbara Larue' },
          { numero: '01.53.31.36.30', reponse: "« Bonjour, Le directeur est en congé maladie. Je ne suis que sa remplaçante. Rappelez d'ici 15 jours environ.", interlocuteur: 'Mme Laure Trompe' },
          { numero: '01.47.63.16.17', reponse: "« J'ai un problème avec ma boîte mail. Pourriez-vous me renvoyer le tout s'il vous plait ? »", interlocuteur: 'M. Pierre Goulet - Le gestionnaire' },
        ] } },
      ] },
      { numero: 2, titre: 'Taux de réalisation', images: [], texte: [
        { pageWeb: true },
        { paragraphes: ["Pour évaluer la rentabilité du commercial, l'entreprise compare ce qui a été réalisé par ce dernier par rapport aux objectifs qui lui avaient été fixés."] },
        { paragraphes: ['Ces calculs permettent de savoir si le commercial :'] },
        { puces: ["N'a pas atteint ses objectifs (<100 %) ;", 'A atteint ses objectifs (= 100 %) ;', 'A dépassé ses objectifs (> 100 %).'] },
        { intertitre: 'La formule permettant de calculer la réalisation des objectifs', paragraphes: ['(Objectifs réalisés / Objectifs à atteindre) x 100'] },
      ] },
      { numero: 3, titre: "Données de l'opération de prospection", images: [], texte: [
        { pageWeb: true },
        { paragraphes: ['Pour calculer le coût de l\u2019opération vous devez prendre compte :'] },
        { puces: ["Le nombre d'appels passés", 'Le nombre publipostages créés et envoyé :'] },
        { intertitre: 'Détail des coûts', puces: ['Enveloppe : 0,15 cts', 'Timbre : 1,05 €', 'Encre, papier, temps de rédaction : 0,30 cts', 'Un appel est facturé 0,08 € (tarif entreprise)'] },
      ] },
    ],
    competence: {
      groupe: 'Groupe de compétences 4B',
      intitule: "Réaliser une opération de prospection et analyser ses résultats",
      detail: "Gérer les appels, mesurer la performance (taux de réalisation), calculer le coût et mettre à jour le fichier clients.",
    },
    objectifs: [
      "Organiser et réaliser une campagne d'appels de prospection.",
      'Mesurer la performance : nombre de rendez-vous et taux de réalisation.',
      "Calculer le coût de l'opération et mettre à jour le fichier clients.",
    ],
    activites: [
      {
        titre: 'Activité 1 — Les tâches à effectuer',
        questions: [
          { numero: 1, consigne: "Listez les prospects que vous allez appeler aujourd'hui.", ressources: "Consulter la Mission 2 annexe 4, compléter l'annexe 1. [C.4B.2]", annexeId: 'annexe1' },
          { numero: 2, consigne: "Complétez le fichier contacts à l'aide des numéros que vous avez eu en appelant.", ressources: "Lire le document 1, compléter l'annexe 2. [C.4B.2]", annexeId: 'annexe2' },
        ],
      },
      {
        titre: 'Activité 2 — Les objectifs de rendez-vous',
        questions: [
          { numero: 3, consigne: 'Combien de rendez-vous avez-vous réussi à avoir suite à votre campagne de téléprospection ?', ressources: "Consulter l'annexe 2, compléter l'annexe 3. [C.4B.2]", annexeId: 'annexe3' },
          { numero: 4, consigne: "Complétez votre agenda en y inscrivant les rendez-vous que vous avez réussi à obtenir.", ressources: "Consulter l'annexe 2, compléter l'annexe 4. [C.4B.2]", annexeId: 'annexe4' },
          { numero: 5, consigne: 'Calculez votre taux de réalisation.', ressources: "Lire le document 2, compléter l'annexe 5. [C.4B.2]", annexeId: 'annexe5' },
          { numero: 6, consigne: 'Quel commentaire pouvez-vous faire lorsque vous comparez les objectifs qui vous ont été fixés et ce que vous avez réalisé ?', ressources: "Consulter l'annexe 5, compléter l'annexe 6. [C.4B.2]", annexeId: 'annexe6' },
        ],
      },
      {
        titre: "Activité 3 — Calcul du coût de l'opération",
        questions: [
          { numero: 7, consigne: "Calculez le coût de l'opération.", ressources: "Consulter la Mission 2 annexe 4 puis lire le document 3, compléter l'annexe 7. [C.4B.2]", annexeId: 'annexe7' },
          { numero: 8, consigne: 'Commentez ces résultats au regard du budget que vous a accordé Mme Pauret pour la mise en place de l\u2019opération.', ressources: "Consulter l'annexe 7, compléter l'annexe 8. [C.4B.2]", annexeId: 'annexe8' },
        ],
      },
      {
        titre: 'Activité 4 — Mettre à jour le fichier client',
        questions: [
          { numero: 9, consigne: 'Mettez à jour le fichier clients en rentrant les informations qui vous ont été données au cours de vos appels.', ressources: "Relire le document 1 (Mission 4) et le document 2 (Mission 2), compléter l'annexe 9. [C.4B.2]", annexeId: 'annexe9' },
        ],
      },
    ],
    annexes: [
      { type: 'grille', id: 'annexe1', titre: 'Annexe 1 — Prospects à contacter', colonnes: ['Organisations', 'Numéro de téléphone'], nbLignes: 11 },
      { type: 'tableauappels', id: 'annexe2', titre: 'Annexe 2 — Tableau de gestion des appels', entete: "Gestion des appels — Téléprospection", organisations: ['Léon Gambetta', 'Maria Deraismes', 'Latin', 'Pierre de Ronsard', 'Les Épinettes', 'Saint Michel des Batignolles', 'Carnot', 'Bernard Buffet', 'Ampère', 'André Malraux', 'La Rose Blanche'] },
      { type: 'texte', id: 'annexe3', titre: 'Annexe 3 — Nombre de rendez-vous obtenus', lignes: 1 },
      { type: 'agenda', id: 'annexe4', titre: 'Annexe 4 — Votre agenda', entete: 'Agenda — Mars 202N', jours: ['Lundi 13', 'Mardi 14', 'Mercredi 15', 'Jeudi 16', 'Vendredi 17'], creneaux: ['8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h'] },
      { type: 'texte', id: 'annexe5', titre: 'Annexe 5 — Calcul du taux de réalisation', lignes: 2 },
      { type: 'texte', id: 'annexe6', titre: 'Annexe 6 — Commentaire', lignes: 2 },
      { type: 'grille', id: 'annexe7', titre: "Annexe 7 — Coût de l'opération", colonnes: ['Éléments', 'Quantité', 'Calculs', 'Résultats'], nbLignes: 3 },
      { type: 'texte', id: 'annexe8', titre: 'Annexe 8 — Commentaire', lignes: 2 },
      { type: 'fichierclients', id: 'annexe9', titre: 'Annexe 9 — Fichier clients', entete: 'Fichier clients — AMParis', colonnes: ["Type d'organisation", "Nom de l'organisation", 'Adresse', 'Personne décisionnaire', 'Téléphone du décisionnaire ou de l\u2019organisation', 'E-mail du décisionnaire ou de l\u2019organisation', 'Refus (cause)'], nbLignes: 11 },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: 'Prospects à contacter (annexe 1).', documents: ['Mission 2 annexe 4', 'Annexe 1'], bareme: 11, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Organisations', 'Numéro de téléphone'], lignes: [
          ['École maternelle publique Ampère', '01.47.63.23.72'],
          ['Collège public André Malraux', '01.45.74.49.15'],
          ['Collège privé Latin', '01.84.16.37.59'],
          ['Collège public La Rose Blanche', '01.46.07.05.10'],
          ['Lycée polyvalent Carnot', '01.56.21.36.36'],
          ['Collège Léon Gambetta', '01 43 61 87 16'],
          ['École maternelle publique Les Épinettes', '01.46.27.50.99'],
          ['Lycée privée Saint Michel des Batignolles', '01.58.22.20.70'],
          ['École polyvalente Bernard Buffet', '01.53.31.36.30'],
          ['Lycée professionnel Maria Deraismes', '01.46.27.94.37'],
          ['Collège public Pierre de Ronsard', '01.47.63.16.17'],
        ] },
      },
      {
        intitule: 'Tableau de gestion des appels (annexe 2).', documents: ['Document 1', 'Annexe 2'], bareme: 11, reponse: "Voir tableau. Chaque ligne reprend l'organisation, l'interlocuteur, le téléphone, le rappel, la date de RDV éventuelle, l'envoi de documents, le rappel à prévoir et le motif de refus.",
        tableau: { colonnes: ['Organisation', 'Interlocuteur / fonction', 'Téléphone', 'Rdv (date)', 'Refus (cause)'], lignes: [
          ['Léon Gambetta', "Personnel d'accueil", '01 43 61 87 16', 'Non', 'Pas de démarchage'],
          ['Maria Deraismes', 'Barbara Larue - Gestionnaire', '01.46.27.94.37', '16.03 à 16H30', ''],
          ['Latin', "Agent d'accueil", '01.84.16.37.59', 'NON (rappeler)', 'Décisionnaire en réunion'],
          ['Pierre de Ronsard', 'M. Pierre Goulet - Gestionnaire', '01.47.63.16.17', 'NON (rappeler)', 'Pb boîte mail'],
          ['Les Épinettes', 'Sarah Picard - Gestionnaire', '01.46.27.50.99', 'NON (rappeler en janvier)', 'Plus de budget'],
          ['Saint Michel des Batignolles', 'La secrétaire', '01.58.22.20.70', 'NON', 'Pas disponible'],
          ['Carnot', 'Corine Forest - Gestionnaire', '01.56.21.36.36', '14.03 à 14H', ''],
          ['Bernard Buffet', 'Laure Trompe - Remplaçante', '01.53.31.36.30', 'NON (rappeler)', 'Congé maladie'],
          ['Ampère', 'Julien Tabua - Directeur Ecole', '01.47.63.23.72', 'NON', 'Nouveau photocopieur'],
          ['André Malraux', 'Fanta Diagoura - Gestionnaire', '01.45.74.49.15', '17.03 à 14H', ''],
          ['La Rose Blanche', 'Odile Gomez - Gestionnaire', '01.46.07.05.10', 'NON (envoi documents)', ''],
        ] },
      },
      { intitule: 'Nombre de rendez-vous obtenus (annexe 3).', documents: ['Annexe 2', 'Annexe 3'], bareme: 1, reponse: '3 rendez-vous (Maria Deraismes - Carnot - André Malraux).' },
      {
        intitule: 'Agenda (annexe 4).', documents: ['Annexe 2', 'Annexe 4'], bareme: 3, reponse: 'Mars 202N : Carnot le 14 mars à 14h, André Malraux le 17 mars à 14h, Maria Deraismes le 16 mars à 16h30.',
      },
      { intitule: 'Calcul du taux de réalisation (annexe 5).', documents: ['Document 2', 'Annexe 5'], bareme: 2, reponse: 'Objectifs réalisés / objectifs à atteindre x 100 = 3 / 2 x 100 = 150 %.' },
      { intitule: 'Commentaire (annexe 6).', documents: ['Annexe 5', 'Annexe 6'], bareme: 2, reponse: "Les objectifs fixés par l'entreprise ont été dépassés (150 %, soit 3 rendez-vous obtenus pour 2 demandés)." },
      {
        intitule: "Coût de l'opération (annexe 7).", documents: ['Mission 2 annexe 4', 'Document 3', 'Annexe 7'], bareme: 4, reponse: 'Voir tableau. Total = 2,46 €.',
        tableau: { colonnes: ['Éléments', 'Quantité', 'Calculs', 'Résultats'], lignes: [
          ['Coût appels passés', '12', '12 x 0,08', '0,96 €'],
          ['Coût publipostage', '1', '1 x (0,15 + 1,05 + 0,30)', '1,50 €'],
          ['Total', '', '', '2,46 €'],
        ] },
      },
      { intitule: 'Commentaire (annexe 8).', documents: ['Annexe 7', 'Annexe 8'], bareme: 2, reponse: "Le budget donné par Mme Pauret qui était de 20 € maximum n'a pas été dépassé (coût réel : 2,46 €)." },
      {
        intitule: 'Fichier clients mis à jour (annexe 9).', documents: ['Mission 4 doc 1', 'Mission 2 doc 2', 'Annexe 9'], bareme: 11, reponse: 'Voir tableau.',
        tableau: { colonnes: ["Type d'organisation", "Nom", 'Personne décisionnaire', 'Téléphone'], lignes: [
          ['École maternelle publique', 'Ampère', 'Julien Tabua', '01.47.63.23.72'],
          ['Collège public', 'André Malraux', 'Fanta Diagoura', '01.45.74.49.15'],
          ['Collège privé', 'Latin', 'Non communiqué', '01.84.16.37.59'],
          ['Collège public', 'La Rose Blanche', 'Odile Gomez', '01.46.07.05.10'],
          ['Lycée polyvalent', 'Carnot', 'Corinne Forest', '01.56.21.36.36'],
          ['Collège', 'Léon Gambetta', 'Non communiqué', '01 43 61 87 16'],
          ['École maternelle publique', 'Les Épinettes', 'Sarah Picard', '01.46.27.50.99'],
          ['Lycée privée', 'Saint Michel des Batignolles', 'Non communiqué', '01.58.22.20.70'],
          ['École polyvalente', 'Bernard Buffet', 'Non communiqué', '01.53.31.36.30'],
          ['Lycée professionnel', 'Maria Deraismes', 'Barbara Larue', '01.46.27.94.37'],
          ['Collège public', 'Pierre de Ronsard', 'Pierre Goulet', '01.47.63.16.17'],
        ] },
      },
    ],
  },
  synthese: {
    titre: "La réalisation de l'opération de prospection",
    proposition: ['Le taux de réalisation', "Le coût de l'opération", 'Le nombre de rendez-vous', 'La mise à jour du fichier'],
    racine: {
      id: 'racine', texte: "La réalisation de la prospection",
      enfants: [
        { id: 'perf', texte: 'La performance', enfants: [
          { id: 'rdv', texte: null, reponse: 'Le nombre de rendez-vous' },
          { id: 'taux', texte: null, reponse: 'Le taux de réalisation' },
        ] },
        { id: 'cout', texte: "Le coût de l'opération", enfants: [
          { id: 'appels', texte: 'Le coût des appels' },
          { id: 'publi', texte: 'Le coût du publipostage' },
        ] },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: "Réaliser et gérer les appels",
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas organiser mes appels.' },
          { niveau: 'debrouille', description: 'Je liste les prospects à appeler.' },
          { niveau: 'averti', description: "Je gère les appels et complète le tableau de suivi." },
          { niveau: 'expert', description: "Je tiens à jour l'ensemble du suivi et obtiens des rendez-vous." },
        ],
      },
      {
        id: 'c2', intitule: 'Mesurer la performance',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas calculer un taux de réalisation.' },
          { niveau: 'debrouille', description: 'Je compte les rendez-vous obtenus.' },
          { niveau: 'averti', description: 'Je calcule le taux de réalisation.' },
          { niveau: 'expert', description: "Je commente la performance au regard des objectifs." },
        ],
      },
      {
        id: 'c3', intitule: "Calculer le coût et mettre à jour le fichier",
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas calculer un coût.' },
          { niveau: 'debrouille', description: 'Je calcule un coût partiel.' },
          { niveau: 'averti', description: "Je calcule le coût total de l'opération." },
          { niveau: 'expert', description: 'Je commente le coût et mets à jour le fichier clients.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Téléprospection', definition: 'Prospection commerciale réalisée par téléphone.' },
      { terme: 'Taux de réalisation', definition: '(Objectifs réalisés / objectifs à atteindre) x 100.' },
      { terme: 'Objectif', definition: "But chiffré fixé au commercial (ici : 2 rendez-vous)." },
      { terme: 'Fichier contacts', definition: 'Tableau de suivi des appels et de leurs résultats.' },
      { terme: 'Fichier clients', definition: "Base de données des clients et de leurs coordonnées." },
      { terme: 'Publipostage', definition: 'Courrier adressé à un prospect pour lui proposer une offre.' },
      { terme: 'Décisionnaire', definition: "Personne habilitée à décider d'un achat dans l'organisation." },
      { terme: 'Relance', definition: "Nouveau contact pour faire avancer un prospect (rappel)." },
      { terme: "Coût de l'opération", definition: "Somme des dépenses engagées (appels + publipostage)." },
      { terme: 'Rentabilité', definition: "Rapport entre les résultats obtenus et les moyens engagés." },
    ],
    flashcards: [
      { recto: 'Objectif de rendez-vous fixé ?', verso: '2 rendez-vous.' },
      { recto: 'Nombre de rendez-vous obtenus ?', verso: '3 rendez-vous (Maria Deraismes, Carnot, André Malraux).' },
      { recto: 'Formule du taux de réalisation ?', verso: '(Objectifs réalisés / objectifs à atteindre) x 100.' },
      { recto: 'Taux de réalisation obtenu ?', verso: '3 / 2 x 100 = 150 %.' },
      { recto: "Coût d'un appel ?", verso: '0,08 € (tarif entreprise).' },
      { recto: "Coût total de l'opération ?", verso: '2,46 €.' },
      { recto: 'Budget maximum accordé ?', verso: '20 € maximum.' },
      { recto: "Coût d'un timbre ?", verso: '1,05 €.' },
      { recto: 'Période de la campagne ?', verso: 'Du 13 au 17 mars.' },
      { recto: "Combien d'appels passés ?", verso: '12 appels.' },
    ],
    quiz: [
      { type: 'unique', question: 'Objectif de rendez-vous fixé ?', options: ['2 rendez-vous', '5 rendez-vous', '10 rendez-vous', '1 rendez-vous'], bonne: 0 },
      { type: 'unique', question: 'Rendez-vous obtenus ?', options: ['3', '2', '1', '5'], bonne: 0 },
      { type: 'unique', question: 'Formule du taux de réalisation ?', options: ['(Réalisés / à atteindre) x 100', '(À atteindre / réalisés) x 100', 'Réalisés x à atteindre', 'Réalisés + à atteindre'], bonne: 0 },
      { type: 'unique', question: 'Taux de réalisation obtenu ?', options: ['150 %', '100 %', '50 %', '25 %'], bonne: 0 },
      { type: 'unique', question: "Coût total de l'opération ?", options: ['2,46 €', '20 €', '0,96 €', '5 €'], bonne: 0 },
      { type: 'unique', question: 'Budget maximum accordé ?', options: ['20 €', '2 €', '50 €', '100 €'], bonne: 0 },
      { type: 'unique', question: "Coût d'un appel ?", options: ['0,08 €', '0,80 €', '1 €', '0,15 €'], bonne: 0 },
      { type: 'unique', question: 'Période de la campagne ?', options: ['Du 13 au 17 mars', 'Du 1 au 5 mars', 'En novembre', 'En décembre'], bonne: 0 },
      { type: 'unique', question: 'Les objectifs ont été...', options: ['Dépassés', 'Non atteints', 'Juste atteints', 'Annulés'], bonne: 0 },
      { type: 'unique', question: "Coût d'un timbre ?", options: ['1,05 €', '1,50 €', '0,15 €', '0,30 €'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque élément dans la bonne catégorie.',
      etiquettes: ['Rendez-vous obtenu', 'Refus', "Coût de l'opération"],
      zones: [
        { libelle: 'Maria Deraismes (16 mars)', etiquetteIndex: 0 },
        { libelle: 'Carnot (14 mars)', etiquetteIndex: 0 },
        { libelle: 'Ampère (nouveau photocopieur)', etiquetteIndex: 1 },
        { libelle: 'Léon Gambetta (pas de démarchage)', etiquetteIndex: 1 },
        { libelle: '12 x 0,08 € (appels)', etiquetteIndex: 2 },
        { libelle: '1,50 € (publipostage)', etiquetteIndex: 2 },
      ],
    },
  },
}

const ORPI_M1: ContenuMission = {
  travaux: {
    consigne:
      "Réalisez la phase préparatoire à la mise en œuvre d'une action de FDRC : identité de l'entreprise, clientèle, SWOT, concurrents, sollicitations clients, outils de fidélisation, constat, problématique et propositions d'actions.",
    contexte:
      "L'agence immobilière Orpi Guy Môquet, située dans le 17ème arrondissement de Paris, à proximité du métro Guy Môquet, est une agence familiale spécialisée dans la vente de biens immobiliers, la gestion locative et les services pour investisseurs. L'agence bénéficie d'une solide réputation dans le quartier. Maxime est stagiaire chez Orpi et travaille aux côtés de M. Lefevre, le responsable des ventes. Il souhaite évaluer la situation de l'entreprise et trouver des solutions adaptées à l'amélioration de la relation client. Dans le cadre de son premier stage de terminale bac pro MCVB, Maxime doit réaliser un PowerPoint visant à présenter ses propositions d'amélioration pour la fidélisation et le développement de la relation client (FDRC). Pour cela, il doit d'abord comprendre en détail l'identité de l'entreprise, les besoins de la clientèle, les forces et faiblesses de l'agence, ainsi que les sollicitations des clients. Toutes les questions qu'il pose à son tuteur ont pour objectif de recueillir les informations nécessaires à la rédaction de la phase préparatoire à la mise en œuvre des actions de FDRC qu'il présentera dans un second temps à l'oral face à son professeur et à son tuteur.",
    videoContexte: 'https://drive.google.com/file/d/184x8o6NNVTXJIaDDyPXHmM6cSmoe7dsM/view',
    documents: [
      { numero: 1, titre: "Dialogue entre Maxime et le directeur d'agence, M. Lefevre", images: [], texte: [
        { pageWeb: true },
        { dialogue: [
          { locuteur: 'Maxime', texte: "Bonjour M. Lefevre, j'ai quelques questions à vous poser car j'aimerais comprendre un peu plus le fonctionnement de l'agence. Pouvez-vous me parler de son identité ? Cela me permettra ensuite de réaliser sa fiche signalétique ?" },
          { locuteur: 'M. Lefevre', texte: "Bien sûr, Maxime. Pour commencer, l'agence a été créée en 2012 fait partie du réseau Orpi, ce qui nous apporte une notoriété nationale et une solidité en termes de services. C'est une SARL, et nous sommes une équipe de 10 collaborateurs répartis entre la vente de biens, la gestion locative et l'accompagnement des investisseurs. Le chiffre d'affaires de l'agence tourne autour de 2 millions d'euros par an, mais il est fluctuant, car il dépend surtout des ventes exceptionnelles et des nouveaux biens qui arrivent sur le marché." },
          { locuteur: 'Maxime', texte: "D'accord, merci. Et concernant la zone de prospection de l'agence, quel est notre périmètre géographique ?" },
          { locuteur: 'M. Lefevre', texte: "Nous avons une zone de prospection assez ciblée, principalement autour du 17ème arrondissement de Paris. Mais nous touchons aussi les arrondissements voisins, comme le 18ème ou le 9ème. Nos clients proviennent souvent des quartiers environnants, même si nous avons aussi des personnes venant de la région parisienne, principalement des investisseurs intéressés par la rentabilité des biens." },
          { locuteur: 'Maxime', texte: "Ok, je comprends. Et concernant la clientèle, quel est client-type de l'agence ?" },
          { locuteur: 'M. Lefevre', texte: "Notre clientèle est assez diverse, mais je dirais que la majorité des personnes qui viennent vers nous sont intéressées par l'achat ou la location de biens pour habiter. Les autres clients, en revanche, sont des investisseurs cherchant des opportunités intéressantes pour acheter des biens à rénover ou à mettre en gestion locative." },
          { locuteur: 'Maxime', texte: "Ah, je vois. Mais est-ce que vous avez une idée de l'âge moyen des clients ?" },
          { locuteur: 'M. Lefevre', texte: "Oui, la tranche d'âge principale se situe entre 30 et 45 ans. Ce souvent des jeunes couples ou des professionnels qui cherchent à s'installer dans un quartier calme et accessible financièrement à Paris." },
          { locuteur: 'Maxime', texte: "D'accord. Maintenant, pourriez-vous m'expliquer quelles sont les principales atouts et points faibles de l'agence ?" },
          { locuteur: 'M. Lefevre', texte: "Nos atouts sont avant tout notre réputation locale et la fidélité de nos clients, ce qui fait que nous sommes souvent recommandés par le bouche-à-oreille. Notre équipe est compétente, réactive et très attachée à fournir un service de qualité. Cependant, notre faiblesse majeure réside dans l'absence d'une approche numérique de notre relation client. Nos outils sont trop classiques et ne répondent pas encore aux attentes des jeunes générations, qui recherchent un service digitalisé." },
          { locuteur: 'M. Lefevre', texte: "Cependant, il existe également des perspectives intéressantes à exploiter. Par exemple, il y a un important programme immobilier d'une cinquantaine d'appartements en cours de construction à proximité. Toutefois, il faut également prendre en compte certaines menaces, notamment l'augmentation des taux d'intérêt, qui pourrait freiner les achats immobiliers." },
          { locuteur: 'Maxime', texte: "Je vois, il y a donc un réel potentiel d'amélioration sur la partie digitale. Mais… qu'en est-il des concurrents ? Qui sont-ils dans notre secteur ?" },
          { locuteur: 'M. Lefevre', texte: "Nous avons plusieurs concurrents dans le quartier. Century 21, par exemple, est situé à quelques pas de l'agence, juste en face du métro Guy Môquet. Ils sont très présents sur les réseaux sociaux, ce qui leur permet de toucher une clientèle plus large et plus jeune. Il y a aussi L'Adresse, une autre agence à quelques minutes à pied d'ici, qui est particulièrement compétitive en termes de prix. Et bien sûr comme toutes les autres agences nous avons la concurrence des sites internet comme Seloger.com" },
        ] },
        { intertitre: 'Partie II : Les sollicitations clients et la gestion des demandes', dialogue: [
          { locuteur: 'M. Lefevre', texte: "A mon tour de te poser quelques questions. Depuis ton arrivé à l'agence il y a 3 semaines, peux-tu me dire quelles sont les sollicitations des clients que tu as le plus rencontrées ?" },
          { locuteur: 'Maxime', texte: "Elles varient beaucoup d'un prospect à l'autre, mais de manière générale, j'ai reçu beaucoup de demandes sur les prix des biens et la disponibilité des appartements en vente ou en location." },
          { locuteur: 'M. Lefevre', texte: "Très bien ! Explique-moi comment les as-tu traitées et ta contribution ?" },
          { locuteur: 'Maxime', texte: "Eh bien, Virginie, ma tutrice, m'a expliqué que dès qu'une demande arrive, je dois y répondre de manière rapide et personnalisée. Par exemple, quand un client nous contacte par téléphone ou par e-mail pour des informations sur un bien, ma priorité est de lui fournir des détails précis, accompagnés de photos et de visites virtuelles quand c'est possible. Je sais qu'une réponse rapide et un suivi de qualité renforcent la relation client et augmentent sa fidélité." },
        ] },
        { intertitre: "Partie III : Les outils de fidélisation et le potentiel d'amélioration du numérique de l'entreprise", dialogue: [
          { locuteur: 'Maxime', texte: "Sinon, j'avais une autre question. En termes d'outils de fidélisation, est-ce qu'il y a des dispositifs qui sont mis en place ?" },
          { locuteur: 'M. Lefevre', texte: "Nous disposons de plusieurs outils, comme un compte Instagram mais que nous n'avons pas utilisé depuis plusieurs mois. Nous avons également mis en place un système de parrainage, où nous récompensons les clients, appelés « apporteurs d'affaires », qui nous apportent de nouveaux clients." },
          { locuteur: 'Maxime', texte: "Donc, il y a un fort potentiel pour améliorer la relation client sur le plan numérique. D'accord, cela me semble clair. Merci pour toutes ces informations." },
        ] },
      ] },
    ],
    competence: {
      groupe: 'Épreuve E33 — Bloc 3',
      intitule: 'Préparer une action de FDRC',
      detail: "3.1.2 Recueillir, extraire, exploiter, synthétiser les données de sources internes et externes ; 3.1.1 Traiter les messages et/ou les demandes de clients ; 3.1.4 Proposer des actions de fidélisation et/ou de développement de la relation client.",
    },
    objectifs: [
      "Être capable de sélectionner les sources d'information pertinentes de l'entreprise.",
      'Être capable de traiter les sollicitations des clients de manière efficace et professionnelle.',
      "Être capable de proposer des actions pertinentes au regard du contexte dans l'entreprise.",
    ],
    activites: [
      {
        titre: "Activité 1 — Les sources d'informations internes et externes de l'entreprise",
        questions: [
          { numero: 1, consigne: "Réalisez la fiche d'identité de l'entreprise Orpi Guy Môquet.", ressources: 'Consulter le document 1, compléter la diapositive 1. [3.1.2]', annexeId: 'ppt' },
          { numero: 2, consigne: "Indiquez quelle est la zone de prospection de l'entreprise.", ressources: 'Consulter le document 1, compléter la diapositive 2. [3.1.2]', annexeId: 'ppt' },
          { numero: 3, consigne: 'Dressez le profil de la clientèle.', ressources: 'Consulter le document 1, compléter la diapositive 3. [3.1.2]', annexeId: 'ppt' },
          { numero: 4, consigne: "Listez les forces et les faiblesses de l'agence ainsi que les opportunités et les menaces qui peuvent peser sur elle.", ressources: 'Consulter le document 1, compléter la diapositive 4. [3.1.2]', annexeId: 'ppt' },
          { numero: 5, consigne: 'Identifiez les deux catégories de concurrents puis listez-les.', ressources: 'Consulter le document 1, compléter la diapositive 5. [3.1.2]', annexeId: 'ppt' },
        ],
      },
      {
        titre: 'Activité 2 — Les sollicitations clients et leur traitement',
        questions: [
          { numero: 6, consigne: "Repérez les demandes de clients les plus fréquentes et la façon dont elles sont traitées.", ressources: 'Consulter le document 1, compléter la diapositive 6. [3.1.1]', annexeId: 'ppt' },
        ],
      },
      {
        titre: 'Activité 3 — Les outils de fidélisation et/ou de développement de la relation client',
        questions: [
          { numero: 7, consigne: "Précisez les méthodes de fidélisation mises en place au sein de l'entreprise.", ressources: 'Consulter le document 1, compléter la diapositive 7. [3.1.4]', annexeId: 'ppt' },
          { numero: 8, consigne: "En vous appuyant sur les propos de M. Lefevre, identifiez le problème de fidélisation (= constat) qui existe au sein de l'agence.", ressources: 'Consulter le document 1, compléter la diapositive 8. [3.1.4]', annexeId: 'ppt' },
          { numero: 9, consigne: 'À partir du constat, formulez la problématique sous forme de question.', ressources: 'Consulter le document 1, compléter la diapositive 9. [3.1.4]', annexeId: 'ppt' },
          { numero: 10, consigne: "Proposez 2 actions au regard du contexte exposé par M. Lefevre. Justifiez ce choix en indiquant l'avantage et/ou l'objectif de chacune d'elle.", ressources: 'Consulter le document 1, compléter la diapositive 10. [3.1.4]', annexeId: 'ppt' },
        ],
      },
    ],
    annexes: [
      { type: 'powerpoint', id: 'ppt', titre: 'Annexe — Le PowerPoint de Maxime', diapos: [
        { titre: 'Page de garde', garde: true, mentions: ['BACCALAUREAT PROFESSIONNEL METIERS DU COMMERCE ET DE LA VENTE option B', 'EPREUVE E33', 'Situation d\u2019évaluation n°1', 'Phase préparatoire à la mise en œuvre d\u2019une action de FDRC', 'Lycée Maria Deraismes'] },
        { titre: 'Diapositive 1', intitule: "Fiche d'identité de l'entreprise", competence: '3.1.2 : Recueillir, extraire, exploiter, synthétiser les données de sources internes et externes', champs: [
          { cle: 'nom', libelle: "Nom de l'entreprise" }, { cle: 'creation', libelle: 'Date de création' }, { cle: 'forme', libelle: 'Forme juridique' }, { cle: 'effectif', libelle: 'Effectif' }, { cle: 'reseau', libelle: 'Réseau' }, { cle: 'ca', libelle: "Chiffre d'affaires" }, { cle: 'activite', libelle: 'Activités', lignes: 2 },
        ] },
        { titre: 'Diapositive 2', intitule: 'La zone de prospection', competence: '3.1.2 : Recueillir, extraire, exploiter, synthétiser les données de sources internes et externes', champs: [{ cle: 'zone', lignes: 3 }] },
        { titre: 'Diapositive 3', intitule: 'Le profil de la clientèle', competence: '3.1.2 : Recueillir, extraire, exploiter, synthétiser les données de sources internes et externes', champs: [
          { cle: 'typologie', libelle: 'Typologie', lignes: 2 }, { cle: 'caracteristiques', libelle: 'Caractéristiques', lignes: 2 }, { cle: 'soncase', libelle: "Mobiles d'achat SONCASE", lignes: 2 },
        ] },
        { titre: 'Diapositive 4', intitule: 'Le SWOT (FFOM)', competence: '3.1.2 : Recueillir, extraire, exploiter, synthétiser les données de sources internes et externes', champs: [
          { cle: 'forces', libelle: 'Forces', lignes: 2 }, { cle: 'faiblesses', libelle: 'Faiblesses', lignes: 2 }, { cle: 'opportunites', libelle: 'Opportunités', lignes: 2 }, { cle: 'menaces', libelle: 'Menaces', lignes: 2 },
        ] },
        { titre: 'Diapositive 5', intitule: 'Les concurrents', competence: '3.1.2 : Recueillir, extraire, exploiter, synthétiser les données de sources internes et externes', champs: [
          { cle: 'directs', libelle: 'Concurrents directs', lignes: 2 }, { cle: 'indirects', libelle: 'Concurrents indirects', lignes: 2 },
        ] },
        { titre: 'Diapositive 6', intitule: 'Les sollicitations clients et leur traitement', competence: '3.1.1 : Traiter les messages et/ou les demandes de clients', champs: [
          { cle: 'exemples', libelle: 'Exemples', lignes: 2 }, { cle: 'traitement', libelle: 'Traitement et contribution à la réponse', lignes: 3 },
        ] },
        { titre: 'Diapositive 7', intitule: "Les outils de fidélisation actuels de l'entreprise", competence: '3.1.4 : Proposer des actions de fidélisation et/ou de développement de la relation client', champs: [
          { cle: 'outil1', libelle: "Nom de l'outil actuel" }, { cle: 'outil2', libelle: "Nom de l'outil actuel" }, { cle: 'detail', lignes: 2 },
        ] },
        { titre: 'Diapositive 8', intitule: 'Le constat', competence: '3.1.4 : Proposer des actions de fidélisation et/ou de développement de la relation client', champs: [{ cle: 'constat', lignes: 3 }] },
        { titre: 'Diapositive 9', intitule: 'La problématique', competence: '3.1.4 : Proposer des actions de fidélisation et/ou de développement de la relation client', champs: [{ cle: 'problematique', lignes: 2 }] },
        { titre: 'Diapositive 10', intitule: "Les 2 propositions d'action de Maxime", competence: '3.1.4 : Proposer des actions de fidélisation et/ou de développement de la relation client', champs: [
          { cle: 'action1', libelle: "Proposition d'action 1 (avantage / objectif)", lignes: 3 }, { cle: 'action2', libelle: "Proposition d'action 2 (avantage / objectif)", lignes: 3 },
        ] },
      ] },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: "Fiche d'identité (diapositive 1).", documents: ['Document 1'], bareme: 7, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Élément', 'Réponse'], lignes: [
          ["Nom de l'entreprise", 'Orpi Guy Môquet'],
          ['Date de création', '2012'],
          ['Forme juridique', 'SARL'],
          ['Effectif', '10 collaborateurs'],
          ['Réseau', 'Orpi (notoriété nationale)'],
          ["Chiffre d'affaires", "Environ 2 millions d'euros par an (fluctuant)"],
          ['Activités', 'Vente de biens, gestion locative, accompagnement des investisseurs'],
        ] },
      },
      { intitule: 'La zone de prospection (diapositive 2).', documents: ['Document 1'], bareme: 2, reponse: "Principalement le 17ème arrondissement de Paris, ainsi que les arrondissements voisins (18ème, 9ème) et la région parisienne (investisseurs)." },
      {
        intitule: 'Le profil de la clientèle (diapositive 3).', documents: ['Document 1'], bareme: 3, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Critère', 'Réponse'], lignes: [
          ['Typologie', "Particuliers (acheteurs/locataires pour habiter) et investisseurs"],
          ['Caractéristiques', "Tranche d'âge 30-45 ans, jeunes couples ou professionnels cherchant un quartier calme et accessible"],
          ['Mobiles SONCASE', "Sécurité (quartier calme), Argent (accessible financièrement, rentabilité pour investisseurs), Confort"],
        ] },
      },
      {
        intitule: 'Le SWOT (diapositive 4).', documents: ['Document 1'], bareme: 4, reponse: 'Voir tableau.',
        tableau: { colonnes: ['', ''], lignes: [
          ['Forces', 'Réputation locale, fidélité des clients, bouche-à-oreille, équipe compétente et réactive'],
          ['Faiblesses', "Absence d'approche numérique, outils trop classiques inadaptés aux jeunes générations"],
          ['Opportunités', "Programme immobilier d'une cinquantaine d'appartements en construction à proximité"],
          ['Menaces', "Augmentation des taux d'intérêt freinant les achats immobiliers, concurrence"],
        ] },
      },
      {
        intitule: 'Les concurrents (diapositive 5).', documents: ['Document 1'], bareme: 3, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Catégorie', 'Concurrents'], lignes: [
          ['Concurrents directs', 'Century 21 (face au métro Guy Môquet), L\u2019Adresse'],
          ['Concurrents indirects', 'Les sites internet comme Seloger.com'],
        ] },
      },
      {
        intitule: 'Sollicitations clients et traitement (diapositive 6).', documents: ['Document 1'], bareme: 4, reponse: 'Voir tableau.',
        tableau: { colonnes: ['', ''], lignes: [
          ['Exemples', "Demandes sur les prix des biens et la disponibilité des appartements en vente ou en location"],
          ['Traitement', "Réponse rapide et personnalisée, détails précis avec photos et visites virtuelles ; un suivi de qualité renforce la relation client et la fidélité"],
        ] },
      },
      {
        intitule: 'Outils de fidélisation actuels (diapositive 7).', documents: ['Document 1'], bareme: 2, reponse: 'Compte Instagram (non utilisé depuis plusieurs mois) ; système de parrainage récompensant les apporteurs d\u2019affaires.',
      },
      { intitule: 'Le constat (diapositive 8).', documents: ['Document 1'], bareme: 3, reponse: "L'agence dispose d'outils numériques (Instagram) mais ne les exploite pas. La relation client n'est pas digitalisée, ce qui ne répond pas aux attentes des jeunes générations." },
      { intitule: 'La problématique (diapositive 9).', documents: ['Document 1'], bareme: 2, reponse: "Comment l'agence Orpi Guy Môquet peut-elle améliorer la fidélisation et la relation client grâce au numérique ?" },
      {
        intitule: "Propositions d'action (diapositive 10).", documents: ['Document 1'], bareme: 4, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Action', 'Avantage / Objectif'], lignes: [
          ['Action 1 : réactiver et animer le compte Instagram', "Toucher une clientèle plus large et plus jeune, améliorer la visibilité (comme Century 21)"],
          ['Action 2 : développer le système de parrainage / un dispositif numérique de fidélisation', "Récompenser les apporteurs d'affaires et fidéliser les clients existants"],
        ] },
      },
    ],
  },
  synthese: {
    titre: "La phase préparatoire à l'action de FDRC",
    proposition: ['Sources internes', 'Sources externes', 'Le SWOT', 'La zone de prospection'],
    racine: {
      id: 'racine', texte: "Les sources d'informations de l'entreprise",
      enfants: [
        { id: 'sources', texte: 'Les sources d\u2019informations', enfants: [
          { id: 'int', texte: null, reponse: 'Sources internes' },
          { id: 'ext', texte: null, reponse: 'Sources externes' },
        ] },
        { id: 'analyse', texte: "L'analyse de l'entreprise", enfants: [
          { id: 'swot', texte: 'Le SWOT (FFOM)' },
          { id: 'zone', texte: 'La zone de prospection' },
        ] },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: 'Recueillir et exploiter les sources (3.1.2)',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas distinguer les sources internes et externes.' },
          { niveau: 'debrouille', description: "Je relève quelques informations sur l'entreprise." },
          { niveau: 'averti', description: "Je réalise la fiche d'identité et le SWOT." },
          { niveau: 'expert', description: "Je synthétise toutes les données pour préparer l'action de FDRC." },
        ],
      },
      {
        id: 'c2', intitule: 'Traiter les demandes clients (3.1.1)',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas identifier les sollicitations clients.' },
          { niveau: 'debrouille', description: 'Je cite une demande fréquente.' },
          { niveau: 'averti', description: 'Je repère les demandes et leur traitement.' },
          { niveau: 'expert', description: 'Je propose un traitement personnalisé et rapide.' },
        ],
      },
      {
        id: 'c3', intitule: 'Proposer des actions de FDRC (3.1.4)',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas formuler un constat.' },
          { niveau: 'debrouille', description: 'Je formule un constat simple.' },
          { niveau: 'averti', description: 'Je formule une problématique et une action.' },
          { niveau: 'expert', description: "Je propose 2 actions justifiées au regard du contexte." },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'FDRC', definition: 'Fidélisation et Développement de la Relation Client.' },
      { terme: 'SWOT (FFOM)', definition: "Analyse des Forces, Faiblesses, Opportunités et Menaces d'une entreprise." },
      { terme: 'Zone de prospection', definition: "Zone géographique où l'entreprise recherche de nouveaux clients." },
      { terme: 'Sources internes', definition: "Informations issues de l'entreprise elle-même (fichiers, équipe, CA)." },
      { terme: 'Sources externes', definition: "Informations issues de l'environnement (concurrents, marché)." },
      { terme: 'SONCASE', definition: "Mobiles d'achat : Sécurité, Orgueil, Nouveauté, Confort, Argent, Sympathie, Environnement." },
      { terme: 'Concurrent direct', definition: 'Entreprise proposant le même service (autre agence immobilière).' },
      { terme: 'Concurrent indirect', definition: 'Solution différente répondant au même besoin (sites internet).' },
      { terme: 'Parrainage', definition: "Dispositif récompensant les clients qui apportent de nouveaux clients (apporteurs d'affaires)." },
      { terme: 'Problématique', definition: "Question centrale à laquelle l'action de FDRC doit répondre." },
    ],
    flashcards: [
      { recto: "Date de création de l'agence ?", verso: '2012.' },
      { recto: 'Forme juridique ?', verso: 'SARL.' },
      { recto: "Effectif de l'agence ?", verso: '10 collaborateurs.' },
      { recto: "Chiffre d'affaires annuel ?", verso: "Environ 2 millions d'euros (fluctuant)." },
      { recto: 'Zone de prospection principale ?', verso: '17ème arrondissement de Paris (+ 18ème, 9ème).' },
      { recto: "Tranche d'âge de la clientèle ?", verso: '30 à 45 ans.' },
      { recto: 'Faiblesse majeure ?', verso: "L'absence d'approche numérique de la relation client." },
      { recto: 'Concurrents directs ?', verso: 'Century 21 et L\u2019Adresse.' },
      { recto: 'Concurrent indirect ?', verso: 'Les sites internet comme Seloger.com.' },
      { recto: 'Outils de fidélisation actuels ?', verso: 'Instagram (inutilisé) et le parrainage.' },
    ],
    quiz: [
      { type: 'unique', question: "Date de création de l'agence ?", options: ['2012', '2002', '2020', '2015'], bonne: 0 },
      { type: 'unique', question: 'Forme juridique ?', options: ['SARL', 'SAS', 'SA', 'EURL'], bonne: 0 },
      { type: 'unique', question: 'Effectif ?', options: ['10 collaborateurs', '5 collaborateurs', '20 collaborateurs', '2 collaborateurs'], bonne: 0 },
      { type: 'unique', question: 'Zone de prospection principale ?', options: ['17ème arrondissement', '1er arrondissement', 'Lyon', 'Marseille'], bonne: 0 },
      { type: 'unique', question: 'Faiblesse majeure ?', options: ["Absence d'approche numérique", 'Mauvaise réputation', 'Équipe incompétente', 'Prix trop élevés'], bonne: 0 },
      { type: 'unique', question: 'Quel est un concurrent direct ?', options: ['Century 21', 'Seloger.com', 'Le Bon Coin', 'Google'], bonne: 0 },
      { type: 'unique', question: 'Quel est un concurrent indirect ?', options: ['Seloger.com', 'Century 21', "L'Adresse", 'Orpi'], bonne: 0 },
      { type: 'unique', question: 'Que signifie FDRC ?', options: ['Fidélisation et Développement de la Relation Client', 'Fichier Des Relations Commerciales', 'Force De Réaction Commerciale', 'Fonds De Roulement Client'], bonne: 0 },
      { type: 'unique', question: "Outil de fidélisation inutilisé ?", options: ['Instagram', 'Le parrainage', 'Le téléphone', 'Les visites'], bonne: 0 },
      { type: 'unique', question: 'Une menace pour l\u2019agence ?', options: ["L'augmentation des taux d'intérêt", 'La baisse des prix', 'Le programme immobilier', 'La réputation'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque élément dans la bonne catégorie SWOT.',
      etiquettes: ['Force', 'Faiblesse', 'Opportunité / Menace'],
      zones: [
        { libelle: 'Réputation locale', etiquetteIndex: 0 },
        { libelle: 'Fidélité des clients', etiquetteIndex: 0 },
        { libelle: "Absence d'approche numérique", etiquetteIndex: 1 },
        { libelle: 'Outils trop classiques', etiquetteIndex: 1 },
        { libelle: 'Programme immobilier voisin', etiquetteIndex: 2 },
        { libelle: "Hausse des taux d'intérêt", etiquetteIndex: 2 },
      ],
    },
  },
}

const ORPI_M2: ContenuMission = {
  travaux: {
    consigne:
      "Préparez l'oral de la phase préparatoire à la mise en œuvre de l'action de FDRC : rédigez votre présentation orale à partir du PowerPoint de Maxime, enregistrez-vous, puis créez une animation de présentation.",
    contexte:
      "Afin de vous préparer à votre propre oral en entreprise qui aura lieu dans quelques semaines, votre professeur d'économie-gestion vous demande de vous exercer sur le PowerPoint de Maxime. Votre entraînement devra durer 10 minutes maximum.",
    documents: [
      { numero: 1, titre: "Mode opératoire : Rédaction de l'oral pour une présentation devant un jury", images: [], texte: [
        { pageWeb: true },
        { intertitre: '1. Introduction : Se présenter et introduire le sujet', paragraphes: ["La première étape consiste à bien commencer l'oral, à la fois pour capter l'attention du jury et poser le cadre de la présentation."] },
        { intertitre: 'A. Se présenter', paragraphes: ['Exemple de début :', "« Bonjour, je m'appelle [Nom], je suis élève en [classe] au lycée [Nom du lycée]. Aujourd'hui, je vais vous présenter mon travail sur [nom du sujet], dans le cadre de [expliquer le contexte, par exemple : un projet, un exposé, un thème étudié, etc.]. »"] },
        { puces: ['Ce qu\u2019il faut inclure : Nom et prénom', 'Le contexte de la présentation (classe, projet, matière)', "Le sujet de l'oral"] },
        { paragraphes: ["Conseils : Parlez lentement, de façon claire et assurez-vous d'établir un contact visuel avec le jury pour paraître confiant."] },
        { intertitre: 'B. Annonce du plan', paragraphes: ['Exemple :', "« Pour vous exposer mon travail, je vais procéder en trois parties : d'abord, je vous présenterai…, ensuite nous verrons…, et enfin, je conclurai en abordant... »"] },
        { puces: ['Ce qu\u2019il faut inclure : Annonce claire des grandes lignes de la présentation', 'Structure logique du discours'] },
        { intertitre: '2. Développement', paragraphes: ["Cette étape constitue le cœur de la présentation, où l'élève explique les différentes diapositives."] },
        { intertitre: "3. Conclusion : Résumer et clore l'oral", paragraphes: ["La conclusion doit marquer la fin de votre présentation en résumant les points clés et en ouvrant sur une réflexion ou une question.", 'Récapituler brièvement les points principaux :', '« Pour conclure, nous avons vu que [résumer les trois parties principales]. »'] },
        { intertitre: '4. Répondre aux questions du jury', paragraphes: ["Une fois votre présentation terminée, le jury pourra poser des questions. Vous devez être prêt à y répondre.", "Terminez votre par : « Je vous remercie de m'avoir écouté. Je suis prêt(e) à répondre à vos questions »."] },
        { intertitre: '5. Quelques conseils supplémentaires pour la rédaction de votre présentation orale', paragraphes: [
          "Clarté et concision : La présentation orale doit être clair et simple. Rédigez un discours fluide et facilement compréhensible.",
          "Langage approprié : Évitez les phrases trop longues et les répétitions. Utilisez des phrases courtes et efficaces, adaptées à la parole.",
          "Pratiquez la lecture à voix haute : Une fois votre présentation rédigée, lisez-la à voix haute plusieurs fois pour vérifier son rythme et son efficacité. Cela vous aidera à le rendre plus naturel et à mieux gérer votre temps.",
        ] },
        { intertitre: 'Exemple de présentation', paragraphes: [
          "Introduction : « Bonjour, je m'appelle [Nom], je suis en [classe] et aujourd'hui je vais vous présenter mon travail sur le sujet suivant : [nom du sujet]. Cette présentation se divise en trois parties : d'abord, nous verrons [point 1], puis nous aborderons [point 2], et enfin, je conclurai sur [point 3]. »",
          "Développement : « La première diapositive traite de… »",
          "Conclusion : « En conclusion, nous avons vu... Je vous remercie de votre attention. »",
        ] },
      ] },
      { numero: 2, titre: "Mode opératoire pour la création d'une animation", images: [], texte: [
        { pageWeb: true },
        { intertitre: 'Création d\u2019une animation (Adobe Express)', paragraphes: ['Ouvrez une page internet et dans Google tapez : ADOBE EXPRESS ANIMATION.'] },
        { puces: [
          'Cliquez sur « CRÉER MAINTENANT ».',
          'Choisissez un personnage, un arrière-plan uniquement.',
          'Dans CATEGORIE cliquez sur PROFESSIONNELS puis choisissez un personnage. Vous ne pourrez choisir que des personnages HUMAINS car c\u2019est une vidéo professionnelle. Donc pas de monstres, pas d\u2019animaux, pas de légumes…',
          'Cliquez ici puis choisissez le fichier audio où vous avez enregistré votre oral.',
          'Cliquez sur « TELECHARGER ».',
          'Cliquez sur « S\u2019INSCRIRE ».',
          'Cliquez sur Google puis saisissez votre compte gmail.',
          'C\u2019est bon ! Votre personnage se retrouvera dans le dossier « Téléchargement » de votre ordinateur.',
          'Ensuite, vous mettrez votre capsule vidéo dans votre DIGIPAD à la rubrique « MES VIDEOS ».',
        ] },
      ] },
    ],
    competence: {
      groupe: 'Épreuve E33 — Bloc 3',
      intitule: "Présenter à l'oral la phase préparatoire de l'action de FDRC",
      detail: "3.1.4 Proposer des actions de fidélisation et/ou de développement de la relation client : préparer et présenter à l'oral devant un jury.",
    },
    objectifs: [
      "Rédiger une présentation orale structurée (introduction, développement, conclusion).",
      "S'entraîner à l'oral et s'enregistrer (10 minutes maximum).",
      "Créer une animation vidéo de présentation de la situation.",
    ],
    activites: [
      {
        titre: "Activité 1 — Préparer l'oral de la situation 1",
        questions: [
          { numero: 1, consigne: 'Mettez par écrit tous les éléments du PowerPoint.', ressources: "Lire le document 1, compléter l'annexe 1. [3.1.4]", annexeId: 'annexe1' },
          { numero: 2, consigne: 'Enregistrez votre oral sur votre téléphone mobile pendant 10 minutes maximum.', ressources: 'Étape pratique (enregistrement audio).', annexeId: undefined },
          { numero: 3, consigne: "Téléchargez votre oral de votre portable à votre session d'ordinateur.", ressources: 'Étape pratique (transfert du fichier).', annexeId: undefined },
        ],
      },
      {
        titre: 'Activité 2 — Créer une animation de présentation de la situation 1',
        questions: [
          { numero: 4, consigne: 'Suivez les instructions pour créer votre animation de présentation.', ressources: "Consulter le document 2, suivre l'annexe 2. [3.1.4]", annexeId: 'annexe2' },
        ],
      },
    ],
    annexes: [
      { type: 'redactionoral', id: 'annexe1', titre: "Annexe 1 — Rédaction de l'oral", boutonLien: 'https://drive.google.com/file/d/1l7d5Up3OaCAiAthhBkriiRFxuNS6AFFB/view', boutonLibelle: 'Ouvrir le document support', sections: [
        { cle: 'introduction', libelle: 'Introduction — Se présenter et annoncer le plan', aide: 'Nom et prénom, classe, lycée, sujet, contexte, puis annonce des 3 parties.', lignes: 4 },
        { cle: 'developpement', libelle: 'Développement — Présenter les diapositives', aide: 'Reprenez chaque diapositive du PowerPoint (identité, zone, clientèle, SWOT, concurrents, sollicitations, fidélisation, constat, problématique, propositions).', lignes: 10 },
        { cle: 'conclusion', libelle: 'Conclusion — Résumer et conclure', aide: 'Récapitulez les points principaux et remerciez le jury.', lignes: 3 },
        { cle: 'remerciements', libelle: 'Remerciements et ouverture aux questions', aide: '« Je vous remercie de m\u2019avoir écouté. Je suis prêt(e) à répondre à vos questions ».', lignes: 2 },
      ] },
      { type: 'modeoperatoire', id: 'annexe2', titre: "Annexe 2 — Mode opératoire pour la création d'une animation", entete: 'Adobe Express — Création d\u2019une animation', boutonLien: 'https://drive.google.com/file/d/1qM9Df47ltyoM5J4sHsnvnOq1tSVyY7iE/view', boutonLibelle: 'Ouvrir le mode opératoire complet', etapes: [
        { titre: 'Étape 1 — Accéder à Adobe Express', description: 'Ouvrez une page internet et dans Google tapez : ADOBE EXPRESS ANIMATION. Cliquez sur « CRÉER MAINTENANT ».' },
        { titre: 'Étape 2 — Choisir un personnage', description: 'Choisissez un personnage et un arrière-plan uniquement. Dans CATEGORIE cliquez sur PROFESSIONNELS puis choisissez un personnage HUMAIN (pas de monstres, animaux, légumes…).' },
        { titre: 'Étape 3 — Importer votre oral', description: 'Cliquez pour choisir le fichier audio où vous avez enregistré votre oral.' },
        { titre: 'Étape 4 — Télécharger', description: 'Cliquez sur « TELECHARGER », puis « S\u2019INSCRIRE », puis Google avec votre compte gmail.' },
        { titre: 'Étape 5 — Déposer la capsule', description: 'Votre personnage se retrouve dans le dossier « Téléchargement ». Mettez votre capsule vidéo dans votre DIGIPAD à la rubrique « MES VIDEOS ».' },
      ] },
    ],
  },
  corrige: {
    questions: [
      { intitule: "Rédaction de l'oral (annexe 1).", documents: ['Document 1'], bareme: 10, reponse: "L'oral reprend la trame du document 1. Introduction : « Bonjour, je m'appelle [Nom], je suis en terminale Bac Pro MCV B au lycée Maria Deraismes. Aujourd'hui je vais vous présenter la phase préparatoire d'une action de FDRC menée chez Orpi Guy Môquet. Ma présentation se divise en trois parties : d'abord l'analyse de l'entreprise, ensuite les sollicitations clients, et enfin mes propositions d'actions. » Développement : présentation des 10 diapositives (identité, zone de prospection, clientèle, SWOT, concurrents, sollicitations clients, outils de fidélisation, constat, problématique, deux propositions d'action). Conclusion : « Pour conclure, nous avons vu l'identité et la situation de l'agence, les demandes des clients et deux actions pour améliorer la fidélisation grâce au numérique. Je vous remercie de m'avoir écouté. Je suis prêt(e) à répondre à vos questions. »" },
      { intitule: 'Enregistrement et transfert (étapes pratiques).', documents: ['Document 1'], bareme: 0, reponse: "Étapes pratiques : enregistrer l'oral (10 minutes maximum) sur le téléphone, puis transférer le fichier audio sur la session de l'ordinateur." },
      { intitule: "Création de l'animation (annexe 2).", documents: ['Document 2'], bareme: 0, reponse: "Suivre le mode opératoire Adobe Express : créer maintenant, choisir un personnage humain (catégorie Professionnels) et un arrière-plan, importer le fichier audio de l'oral, télécharger la vidéo, s'inscrire avec le compte Google, puis déposer la capsule dans le DIGIPAD à la rubrique « MES VIDEOS »." },
    ],
  },
  synthese: {
    titre: "La préparation de l'oral",
    proposition: ['Se présenter et introduire le sujet', 'Clarté et concision', 'Utiliser un logiciel', 'Mode opératoire'],
    racine: {
      id: 'racine', texte: "La préparation de l'oral",
      enfants: [
        { id: 'redac', texte: "La rédaction de l'oral", enfants: [
          { id: 'intro', texte: null, reponse: 'Se présenter et introduire le sujet' },
          { id: 'conseils', texte: null, reponse: 'Clarté et concision' },
        ] },
        { id: 'anim', texte: "La création d'une animation", enfants: [
          { id: 'logiciel', texte: 'Utiliser un logiciel' },
          { id: 'mode', texte: 'Mode opératoire' },
        ] },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: "Rédiger une présentation orale",
        indicateurs: [
          { niveau: 'novice', description: "Je ne sais pas structurer un oral." },
          { niveau: 'debrouille', description: 'Je rédige une introduction.' },
          { niveau: 'averti', description: 'Je rédige introduction, développement et conclusion.' },
          { niveau: 'expert', description: "Je rédige un oral clair, concis et structuré (10 min)." },
        ],
      },
      {
        id: 'c2', intitule: "S'entraîner et s'enregistrer",
        indicateurs: [
          { niveau: 'novice', description: "Je ne m'enregistre pas." },
          { niveau: 'debrouille', description: "Je m'enregistre partiellement." },
          { niveau: 'averti', description: "Je m'enregistre en respectant le temps." },
          { niveau: 'expert', description: "Je m'enregistre, me réécoute et m'améliore." },
        ],
      },
      {
        id: 'c3', intitule: "Créer une animation",
        indicateurs: [
          { niveau: 'novice', description: "Je ne sais pas utiliser le logiciel." },
          { niveau: 'debrouille', description: "Je crée un personnage." },
          { niveau: 'averti', description: "Je crée une animation avec mon audio." },
          { niveau: 'expert', description: "Je crée et dépose ma capsule dans le DIGIPAD." },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Oral devant un jury', definition: "Présentation structurée évaluée par un jury (introduction, développement, conclusion)." },
      { terme: 'Introduction', definition: "Début de l'oral : se présenter, annoncer le sujet et le plan." },
      { terme: 'Annonce du plan', definition: 'Présentation claire des grandes parties du discours.' },
      { terme: 'Développement', definition: "Cœur de la présentation, où l'on explique les diapositives." },
      { terme: 'Conclusion', definition: "Fin de l'oral : résumé des points clés et ouverture." },
      { terme: 'Clarté et concision', definition: 'Discours fluide, phrases courtes et efficaces, adaptées à la parole.' },
      { terme: 'Lecture à voix haute', definition: "Technique pour vérifier le rythme et l'efficacité d'un oral." },
      { terme: 'Animation', definition: "Capsule vidéo créée avec un logiciel (Adobe Express) à partir de l'audio." },
      { terme: 'Adobe Express', definition: "Logiciel en ligne de création de vidéos d'animation." },
      { terme: 'DIGIPAD', definition: "Mur numérique où l'élève dépose ses productions (rubrique MES VIDEOS)." },
    ],
    flashcards: [
      { recto: "Durée maximale de l'oral ?", verso: '10 minutes maximum.' },
      { recto: 'Les 3 grandes parties d\u2019un oral ?', verso: 'Introduction, développement, conclusion.' },
      { recto: "Que contient l'introduction ?", verso: 'Nom et prénom, contexte (classe, projet), sujet, annonce du plan.' },
      { recto: 'Phrase de fin recommandée ?', verso: "« Je vous remercie de m'avoir écouté. Je suis prêt(e) à répondre à vos questions »." },
      { recto: 'Conseils de rédaction ?', verso: 'Clarté et concision, langage approprié, lecture à voix haute.' },
      { recto: 'Quel logiciel pour l\u2019animation ?', verso: 'Adobe Express.' },
      { recto: 'Type de personnage autorisé ?', verso: 'Uniquement des personnages humains (catégorie Professionnels).' },
      { recto: 'Où déposer la capsule vidéo ?', verso: 'Dans le DIGIPAD, rubrique « MES VIDEOS ».' },
      { recto: "Comment vérifier son oral ?", verso: 'Le lire à voix haute plusieurs fois (rythme, efficacité).' },
      { recto: "Que faire après le développement ?", verso: 'Conclure en résumant les points principaux puis remercier le jury.' },
    ],
    quiz: [
      { type: 'unique', question: "Durée maximale de l'oral ?", options: ['10 minutes', '30 minutes', '2 minutes', '1 heure'], bonne: 0 },
      { type: 'unique', question: "Que contient l'introduction ?", options: ['Nom, contexte, sujet, plan', 'La conclusion', 'Les questions du jury', 'Le coût'], bonne: 0 },
      { type: 'unique', question: 'Combien de parties dans un oral structuré ?', options: ['3', '2', '5', '1'], bonne: 0 },
      { type: 'unique', question: 'Quel logiciel pour l\u2019animation ?', options: ['Adobe Express', 'Excel', 'Photoshop', 'Word'], bonne: 0 },
      { type: 'unique', question: 'Type de personnage autorisé ?', options: ['Humain (Professionnels)', 'Animal', 'Monstre', 'Légume'], bonne: 0 },
      { type: 'unique', question: 'Où déposer la capsule ?', options: ['DIGIPAD (MES VIDEOS)', 'Par mail', 'Sur Instagram', 'Nulle part'], bonne: 0 },
      { type: 'unique', question: 'Un conseil de rédaction ?', options: ['Clarté et concision', 'Phrases très longues', 'Beaucoup de répétitions', 'Parler vite'], bonne: 0 },
      { type: 'unique', question: 'Comment vérifier son oral ?', options: ['Lire à voix haute', 'Ne pas relire', "L'écrire une seule fois", 'Demander à un ami de le faire'], bonne: 0 },
      { type: 'unique', question: 'Phrase de fin recommandée ?', options: ["« Je vous remercie de m'avoir écouté… »", '« Au revoir »', '« C\u2019est fini »', '« Bonne journée »'], bonne: 0 },
      { type: 'unique', question: 'Le développement sert à...', options: ['Expliquer les diapositives', 'Se présenter', 'Conclure', 'Remercier'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: "Classez chaque élément dans la bonne étape de l'oral.",
      etiquettes: ['Introduction', 'Développement', 'Conclusion'],
      zones: [
        { libelle: 'Se présenter (nom, classe)', etiquetteIndex: 0 },
        { libelle: 'Annoncer le plan', etiquetteIndex: 0 },
        { libelle: 'Expliquer les diapositives', etiquetteIndex: 1 },
        { libelle: 'Présenter le SWOT', etiquetteIndex: 1 },
        { libelle: 'Résumer les points clés', etiquetteIndex: 2 },
        { libelle: 'Remercier le jury', etiquetteIndex: 2 },
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
  'renault-m6': RENAULT_M6,
  'renault-m7': RENAULT_M7,
  'renault-m8': RENAULT_M8,
  'citroen-m1': CITROEN_M1,
  'citroen-m2': CITROEN_M2,
  'citroen-m3': CITROEN_M3,
  'amparis-m1': AMPARIS_M1,
  'amparis-m2': AMPARIS_M2,
  'amparis-m3': AMPARIS_M3,
  'amparis-m4': AMPARIS_M4,
  'orpi-m1': ORPI_M1,
  'orpi-m2': ORPI_M2,
}

// Charge le contenu d'une mission, ou undefined si non encore redige.
export function getContenuMission(missionId: string): ContenuMission | undefined {
  return CONTENUS[missionId]
}

// Indique si une mission dispose d'un contenu redige.
export function aContenu(missionId: string): boolean {
  return missionId in CONTENUS
}

// --- Fiche de deroulement (enseignant) -------------------------------------
export interface PhaseDeroule {
  phase: string
  duree: string
  modalite: string
  supports: string
}
export interface FicheDeroule {
  intitule: string
  contexte?: string
  competence?: { groupe: string; intitule: string; detail: string }
  objectifs: string[]
  dureeTotale: string
  phases: PhaseDeroule[]
  nbActivites: number
  nbQuestions: number
}

// Construit automatiquement la fiche de deroulement d'une mission a partir de
// son contenu (objectifs, competence, activites, annexes). Renvoie undefined
// si la mission n'a pas de contenu.
export function construireDeroule(missionId: string, titre: string): FicheDeroule | undefined {
  const c = CONTENUS[missionId]
  if (!c) return undefined
  const t = c.travaux
  const activites = t.activites ?? []
  const nbQuestions = activites.reduce((s, a) => s + a.questions.length, 0)

  // Deroule pedagogique type (1 seance d'1 heure), commun a la trame des missions.
  const phases: PhaseDeroule[] = [
    { phase: 'Mise en situation et lecture du contexte', duree: '5 min', modalite: 'Classe entière', supports: 'Vidéoprojecteur, contexte de la mission' },
    { phase: 'Consultation des documents de la mission', duree: '10 min', modalite: 'Individuel', supports: 'Documents (onglet Travaux), visionneuse' },
    { phase: `Réalisation des activités (${nbQuestions} question${nbQuestions > 1 ? 's' : ''} dans ${activites.length} activité${activites.length > 1 ? 's' : ''})`, duree: '30 min', modalite: 'Individuel', supports: 'Annexes à compléter (onglet Travaux)' },
    { phase: 'Synthèse de la mission', duree: '5 min', modalite: 'Classe entière', supports: 'Onglet Synthèse (carte à compléter)' },
    { phase: 'Auto-évaluation', duree: '5 min', modalite: 'Individuel', supports: 'Onglet Auto-évaluation' },
    { phase: "Activités d'entraînement (glossaire, flashcards, quiz, glisser-déposer)", duree: '5 min', modalite: 'Individuel', supports: 'Onglet Activités' },
  ]

  return {
    intitule: titre,
    contexte: t.contexte,
    competence: t.competence,
    objectifs: t.objectifs ?? [],
    dureeTotale: '1 heure',
    phases,
    nbActivites: activites.length,
    nbQuestions,
  }
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
    } else if (a.type === 'objections') {
      for (const l of a.lignes) {
        const t = obj[`${a.id}.${l.id}`] ?? ''
        lignes.push(`  « ${l.phrase} » → ${t}`)
      }
    } else if (a.type === 'traitobjections') {
      for (const l of a.lignes) {
        lignes.push(`  Objection : ${l.objection} [${l.technique}]`)
        lignes.push(`    Réponse : ${obj[`${a.id}.${l.id}`] ?? ''}`)
      }
    } else if (a.type === 'simulateur') {
      const chemin = obj[`${a.id}.chemin`] ?? ''
      lignes.push('  Chemin suivi dans le test : ' + (chemin.length > 0 ? chemin : '(non renseigné)'))
      const issue = obj[`${a.id}.issue`] ?? ''
      if (issue) lignes.push('  Résultat atteint : ' + issue)
    } else if (a.type === 'catalogue') {
      const selId = obj[`${a.id}.choix`] ?? ''
      const prod = a.produits.find((p) => p.id === selId)
      lignes.push('  Accessoire choisi : ' + (prod ? `${prod.nom} (${prod.prix})` : '(aucun)'))
      lignes.push('  Justification : ' + (obj[`${a.id}.justif`] ?? ''))
    }
    lignes.push('')
  }
  const txt = lignes.join('\n').trim()
  return txt.length > 0 ? txt : contenu
}
