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
  // Pre-remplissage optionnel de certaines cellules (libelles fixes a gauche,
  // le reste a completer). Tableau de lignes ; '' = cellule a saisir.
  prerempli?: string[][]
  // Largeurs de colonnes optionnelles (ex : ['35%','65%']) pour donner plus de
  // place aux reponses.
  largeurs?: string[]
  // Si vrai, les cellules saisissables sont des zones multi-lignes (textarea).
  reponseMultiligne?: boolean
  lignesReponse?: number // nb de lignes de la zone de saisie (defaut 3)
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

// Tableau de cochage facon logiciel : lignes de dialogue avec case a cocher
// (ex : intervention "a ameliorer"). L'eleve coche les lignes concernees.
export interface AnnexeCochage {
  type: 'cochage'
  id: string
  titre: string
  entete: string // libelle de la colonne a cocher
  lignes: { numero: string; protagoniste: string; texte: string }[]
}

// Fiche d'appel CERC facon logiciel : sections (Contact, Ecoute, Reponse,
// Conclusion) avec sous-zones a rediger.
export interface AnnexeFicheTechnique {
  type: 'fichetechnique'
  id: string
  titre: string
  sections: { nom: string; lignes: { cle: string; libelle?: string }[] }[]
}
// Zone de reponse sur reseau social facon application (X / Facebook) : entete
// avec compte + message du client, puis zone de redaction de la reponse.
export interface AnnexeReponseReseau {
  type: 'reponsereseau'
  id: string
  titre: string
  plateforme: 'x' | 'facebook'
  enReponseA: string
  boutonLien?: string
  boutonLibelle?: string
}
export interface AnnexeArgumentaire {
  type: 'argumentaire'
  id: string
  titre: string
  colonnes: string[]
  nbLignes: number
}
export interface AnnexeReformulation {
  type: 'reformulation'
  id: string
  titre: string
  nbLignes: number
}
export interface AnnexeFicheAppel {
  type: 'ficheappel'
  id: string
  titre: string
  sections: { cle: string; libelle: string; aide?: string; lignes?: number }[]
}

// Fiche signaletique facon logiciel (registre entreprise) : champs etiquetes.
export interface AnnexeFicheSignaletique {
  type: 'fichesignaletique'
  id: string
  titre: string
  champs: { cle: string; libelle: string; lignes?: number }[]
}

// Grille tarifaire facon comparateur de forfaits : colonnes = offres (prix).
export interface AnnexeGrilleTarifaire {
  type: 'grilletarifaire'
  id: string
  titre: string
  offres: string[]
  nbLignes: number
}

// Organigramme a completer : cases reliees, deux menus deroulants (nom +
// fonction) par case que l'eleve choisit.
export interface NoeudOrgaVide {
  cle: string
  enfants?: NoeudOrgaVide[]
}
export interface AnnexeOrganigrammeAremplir {
  type: 'organigrammearemplir'
  id: string
  titre: string
  noms: string[]
  fonctions: string[]
  tete: NoeudOrgaVide
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

// Mail en lecture seule facon Gmail/Yahoo : en-tete fenetre, De/A/Objet figes,
// corps affiche (paragraphes). Sert a reproduire un courriel a lire.
export interface AnnexeMailLecture {
  type: 'maillecture'
  id: string
  titre: string
  de: string
  a: string
  objet: string
  corps: string[]
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
  // Personnalisation de l'habillage (optionnel ; valeurs par defaut = prime conversion)
  enteteTitre?: string // bandeau du haut
  accrocheTitre?: string // gros titre de l'ecran d'accueil
  accrocheSousTitre?: string // sous-titre de l'ecran d'accueil
  libelleEtape?: string // mot affiche dans la progression (ex : Question, Étape)
  libelleResultatProgression?: string // mot affiche a la fin de la progression
  resultatTitreOk?: string // titre de l'ecran resultat positif
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

// Module d'analyse de clientele facon CRM : un bloc repartition (type de
// clientele, cases a cocher + pourcentage) et un bloc profil-type (un critere
// par ligne, reponse + pourcentage). Look fiche d'etude de clientele.
export interface AnnexeClientele {
  type: 'clientele'
  id: string
  titre: string
  typesClientele: string[] // ex : Particuliers, Professionnels
  criteres: string[] // ex : Sexe, Tranche d'age, Lieu d'habitation...
}

// Tableau de veille concurrentielle facon logiciel d'etude de marche : une
// ligne par concurrent (nom + cases Direct / Indirect exclusives + zone de
// justification). Ergonomie type CRM.
export interface AnnexeConcurrents {
  type: 'concurrents'
  id: string
  titre: string
  entete?: string
  nbLignes: number
}

// Formulaire d'etude facon outil de reporting : questions numerotees avec zone
// de reponse, presentation type questionnaire professionnel.
export interface AnnexeQuestionsReponses {
  type: 'questionsreponses'
  id: string
  titre: string
  entete?: string
  questions: { libelle: string; lignes?: number }[]
}

// Tableau de freins facon logiciel : zone de citation du frein + cases a cocher
// exclusives parmi des types (Peur / Inhibition / Prix).
export interface AnnexeFreins {
  type: 'freins'
  id: string
  titre: string
  entete?: string
  colonnes: string[] // types de freins (ex : Peur, Inhibition, Prix)
  nbLignes: number
}

// Fiche client facon vrai logiciel de gestion commerciale : fenetre avec barre
// de titre, sections Identite / Coordonnees / Divers, menus deroulants, boutons
// Nettoyer / Historique / Valider / Quitter.
export interface AnnexeFicheClient {
  type: 'ficheclient'
  id: string
  titre: string
}

// Planning d'interventions facon logiciel de prise de rendez-vous : grille
// calendrier (jours en colonnes, creneaux matin / apres-midi en lignes), cases
// pre-remplies avec les interventions existantes, cases vides cliquables ou
// l'eleve place le rendez-vous du client. Logo en en-tete.
export interface CreneauPlanning {
  jour: number // numero du jour dans le mois
  creneau: 'matin' | 'aprem'
  texte?: string // intervention pre-remplie (vide = a completer par l'eleve)
  ferie?: boolean
}
export interface MoisPlanning {
  titre: string // ex : AVRIL 202N
  // premier jour de la semaine du 1er (0 = lundi ... 6 = dimanche)
  decalage: number
  nbJours: number
  creneaux: CreneauPlanning[]
}
export interface AnnexePlanning {
  type: 'planning'
  id: string
  titre: string
  logo?: string
  mois: MoisPlanning[]
}

// Bon de commande facon logiciel professionnel : en-tete enseigne, coordonnees
// client, lignes d'articles, totaux TVA, zone signature. Champs saisissables.
export interface LigneBonCommande {
  reference?: string
  libelle?: string
  quantite?: string
  prixHT?: string
  prixTTC?: string
}
export interface AnnexeBonCommande {
  type: 'boncommande'
  id: string
  titre: string
  numero: string
  vendeur: string[] // bloc enseigne (adresse, tel)
  nbLignesArticles: number
  preLignes?: LigneBonCommande[]
}

// Frise des etapes de la livraison : suite d'etapes a remettre dans l'ordre /
// completer. Certaines etapes sont fixes, d'autres a saisir (cases jaunes).
export interface AnnexeEtapesLivraison {
  type: 'etapeslivraison'
  id: string
  titre: string
  nbEtapes: number
  preEtapes?: string[] // etapes pre-remplies ('' = a completer)
  // Disposition en schema non lineaire : etiquettes des cases melangees + zones
  // jaunes a numeroter / completer (comme le document d'origine). Si fournie,
  // remplace le rendu lineaire.
  schema?: { etiquettes: string[]; nbZones: number }
}

// Personnage + bulle de dialogue : l'eleve ecrit dans la bulle (comme une vraie
// scene de vente). Reproduit les annexes "phrase a prononcer".
export interface AnnexeBulle {
  type: 'bulle'
  id: string
  titre: string
  perso?: string // image du personnage
  placeholder?: string
  nbLignes?: number
}

export type Annexe = AnnexeTableau | AnnexeHoraires | AnnexeOrganigramme | AnnexeGrille | AnnexeTexte | AnnexeFormulaire | AnnexeSaisieGeo | AnnexeCasesServices | AnnexeCritereSeg | AnnexeCourrier | AnnexeCroc | AnnexeFicheContact | AnnexeTableauAppels | AnnexeAgenda | AnnexeFichierClients | AnnexePowerPoint | AnnexeRedactionOral | AnnexeModeOperatoire | AnnexeFicheSignaletique | AnnexeGrilleTarifaire | AnnexeOrganigrammeAremplir | AnnexeCochage | AnnexeReformulation | AnnexeFicheAppel | AnnexeFicheTechnique | AnnexeReponseReseau | AnnexeArgumentaire | AnnexeMail | AnnexeSms | AnnexeFicheProduit | AnnexeCap | AnnexeConfigurateur | AnnexeDialogue | AnnexeSonCase | AnnexeObjections | AnnexeTraitObjections | AnnexeSimulateur | AnnexeCatalogue | AnnexeClientele | AnnexeConcurrents | AnnexeQuestionsReponses | AnnexeFreins | AnnexeFicheClient | AnnexePlanning | AnnexeBonCommande | AnnexeEtapesLivraison | AnnexeBulle | AnnexeMailLecture

export interface QuestionTravaux {
  numero: number
  consigne: string // ex : Completez l'identite de l'entreprise.
  ressources?: string // ex : Ressource 1, completez l'annexe 1.
  annexeId?: string // annexe rattachee a remplir
  annexeId2?: string // seconde annexe rattachee (ex : 1a + 1b)
  // Mise en situation intercalee, affichee juste AVANT cette question (encadre
  // italique). Reproduit les contextualisations glissees entre deux questions.
  contexteAvant?: string
  // Bouton optionnel ouvrant une ressource externe (le lien n'apparait jamais
  // en clair). Utilise par AMParis pour consulter les sites de l'entreprise.
  boutonLien?: string
  boutonLibelle?: string
}

export interface ActiviteTravaux {
  titre: string // ex : Activite 1 - L'entreprise et ses produits
  // Mise en situation affichee sous le titre de l'activite (encadre italique).
  contexte?: string
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
  // Lien audio optionnel pour ecouter une partie de dialogue (bouton discret).
  audioLien?: string
  // Transcription en temps reel facon logiciel (centre d'appel) : echanges
  // numerotes, bulles entrant/sortant facon messagerie.
  transcription?: { entete?: string; echanges: { numero: string; locuteur: string; texte: string; entrant?: boolean }[] }
  // Procedure illustree facon page web : etapes avec icone + encadre d'alerte +
  // sections. Rendue facon vraie page (ex : "Comment resilier votre abonnement").
  procedure?: {
    titre1: string
    intro?: string
    etapes: { icone: 'tel' | 'mail' | 'box'; titre: string; texte: string }[]
    alerte?: string[]
    titre2?: string
    section2?: string[]
  }
  // Mail en lecture seule facon client de messagerie (entete De/A/Objet + corps).
  mailLecture?: { de: string; a: string; objet: string; corps: string[] }
  // Bloc prix facon page Free : grand prix mis en avant + sous-texte, cercles.
  offrePrix?: { titre: string; prix: string; cents?: string; periode?: string; soustexte?: string[] }
  // Deux cartes techniques opposees (ex : addition / soustraction) avec icone.
  cartesTechniques?: { rappel?: string; cartes: { icone: 'plus' | 'moins'; titre: string; texte: string }[] }
  // Offre flash facon encart promo : badge + lignes mises en avant.
  offreFlash?: { badge: string; lignes: string[]; mention?: string }
  // Bareme de prime facon logiciel RH : seuils -> pourcentage, ligne en avant.
  bareme?: { intro?: string[]; colonnes: [string, string]; lignes: [string, string][] }
  // Article a etapes facon blog pro : intro + etapes numerotees avec puce.
  articleEtapes?: { etapes: { numero: string; texte: string[] }[] }
  // Post de reseau social realiste (X, Facebook, Instagram) facon application.
  reseauSocial?: {
    plateforme: 'x' | 'facebook' | 'instagram'
    compte: string
    pseudo?: string
    avatarInitiale?: string
    date?: string
    message: string[]
    stats?: { repondre?: string; reposter?: string; jaime?: string; vues?: string }
  }
  // Jauge de satisfaction facon widget : smileys de rouge a vert + libelle.
  jaugeSatisfaction?: { libelle?: string }
  // Questionnaire dynamique facon logiciel : l'eleve avance question par
  // question (navigation conditionnelle possible), choisit une reponse, valide,
  // puis ecran final. Chaque question a un id, un type et des options (avec
  // saut conditionnel optionnel vers une autre question ou 'fin').
  questionnaire?: {
    titre: string
    intro?: string[]
    sousTitre?: string
    questions: {
      id: string
      numero?: string
      libelle: string
      obligatoire?: boolean
      type: 'unique' | 'echelle' | 'likert' | 'texte'
      min?: number // pour echelle (ex 1)
      max?: number // pour echelle (ex 10)
      options?: { libelle: string; saut?: string }[] // pour unique ; saut = id question ou 'fin'
      saut?: string // saut systematique apres cette question (id ou 'fin')
    }[]
    final?: string[]
  }
  // Mockup smartphone affichant une page Instagram cliquable qui ouvre un
  // questionnaire integre (defini par le champ questionnaire ci-dessus).
  instagramTelephone?: {
    compte: string
    sousTitre?: string
    bio?: string[]
    libelleLien: string // texte du lien clicable dans la bio
    statistiques?: { publications?: string; abonnes?: string; abonnements?: string }
  }
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
  // Image illustrative inseree dans le flux du document (logo, graphique,
  // capture). Reproduit les visuels d'origine (camembert, histogramme, icones
  // reseaux sociaux, grille produits...). Legende optionnelle.
  image?: { src: string; alt: string; legende?: string; largeur?: number }
  // Galerie de produits facon site marchand : cartes avec photo, titre, prix,
  // reference, coloris, dimensions. Reproduit une page catalogue riche.
  galerieProduits?: { titre: string; image: string; prix: string; reference: string; coloris: string; dimensions: string }[]
  // Suite d'etapes visuelles (cartes numerotees reliees par des fleches) facon
  // schema de processus. Plus dynamique qu'une simple liste a puces.
  etapesVisuelles?: string[]
  // Cartes d'offres de prestation facon page Leroy Merlin (titre, prix, photo,
  // note avis, details, conditions, engagements).
  offresPrestation?: {
    titre: string
    prix: string
    prixLibelle?: string
    image?: string
    note?: string
    avis?: string
    details: string[]
    conditions?: string[]
    engagements?: { titre: string; texte: string }[]
    filAriane?: string
  }[]
  // Logo affiche en haut a droite du bloc (ex : en-tete de note interne).
  logoEntete?: string
  // Habillage facon page web riche : quand true, le bloc est encadre avec un
  // bandeau de marque (logo AMParis) et une mise en page de site.
  pageWeb?: boolean
  // Journal d'appels facon logiciel de compte rendu : liste de fiches d'appel
  // (numero appele + reponse + interlocuteur), cliquables avec detail.
  journalAppels?: { entete?: string; appels: { numero: string; reponse: string; interlocuteur?: string }[] }
  // Cheques bancaires realistes : chaque cheque reprend la couleur et le logo
  // (initiales) de sa banque (Societe Generale rouge/noir, BNP vert, Credit
  // Agricole vert, LCL bleu...). Sert de support pour relever les coordonnees.
  cheques?: {
    banque: string
    couleur: string // couleur dominante de la banque
    agence?: string // ligne agence (adresse de la banque)
    titulaire: string
    adresse?: string
    telephone?: string
    montant?: string // montant en chiffres (ex : 8 290,00 €)
    montantLettres?: string // montant en toutes lettres
    beneficiaire?: string // a l'ordre de
    lieu?: string
    date?: string
    micr?: string // ligne magnetique bas de cheque
    // Post-it colle sur le cheque : annee d'achat du vehicule + accessoire achete.
    postitAnnee?: string
    postitAccessoire?: string
  }[]
  // Post-it de suggestions clients facon note manuscrite (papier jaune, coin
  // corne). Reproduit les fiches suggestion laissees par les clients.
  postits?: {
    prenom?: string
    nom?: string
    adresse?: string
    telephone?: string
    suggestion?: string
    date?: string
    couleur?: string // couleur du papier (defaut jaune)
  }[]
  // Relevé d'identité bancaire (RIB) facon document bancaire : entete banque
  // coloree + bloc titulaire + IBAN/BIC. Reprend la couleur/logo de la banque.
  ribs?: {
    banque: string
    couleur: string
    titulaire: string
    adresse?: string
    iban?: string
    bic?: string
    postitAnnee?: string
    postitAccessoire?: string
  }[]
  // Configurateur de recherche vehicule facon formulaire Google/logiciel concession :
  // suite d'etapes (Type, Categorie, Marque, Energie, Boite, Couleur, Prix...) avec
  // options. Affiche comme un vrai formulaire a choix, etape par etape.
  configurateurVehicule?: {
    marque?: string
    etapes: { titre: string; obligatoire?: boolean; aide?: string; options: string[] }[]
  }
  // Fiches produit vehicule consultables facon logiciel de concession : chaque fiche
  // a des onglets (Fiche technique / Equipements / Services / Offres), un prix, une
  // photo, des caracteristiques cle. L'eleve clique pour explorer chaque vehicule.
  fichesVehicule?: {
    titre?: string
    vehicules: {
      modele: string
      version?: string
      prix?: string
      bandeau?: string // ex : Eligible prime a la conversion
      image?: string
      resume?: string // ex : Electrique - Zen - Automatique - 18 383 km - 2014
      lieu?: string
      etat?: string // Occasion / Neuf
      garantie?: string
      essentiel?: { label: string; valeur: string }[]
      caracteristiques?: { label: string; valeur: string }[]
      equipements?: string[]
    }[]
  }
  // Simulateur/formulaire professionnel facon logiciel (prime a la conversion, calcul
  // de credit...) : suite d'etapes, chacune soit a choix, soit a saisie libre (champs).
  formulaireInteractif?: {
    titre?: string
    intro?: string[]
    accent?: string // couleur d'accent (defaut : vert Quiziniere)
    logo?: string // chemin image logo a afficher en tete
    etapes: {
      section?: string // bandeau de section
      titre: string
      obligatoire?: boolean
      aide?: string
      options?: { label: string; suite?: string }[] // choix (avec branchement optionnel)
      champs?: { label: string; suffixe?: string }[] // saisies libres
    }[]
  }
  // Catalogue d'accessoires facon boutique en ligne : barre de filtres par categorie
  // + grille de produits (nom, sous-titre, prix, categorie). L'eleve filtre et consulte.
  catalogueAccessoires?: {
    titre?: string
    nbTotal?: number
    categories?: string[]
    produits: { nom: string; categorie?: string; sousTitre?: string; prix: string; image?: string }[]
  }
  // Document facon livre ouvert a pages tournables : chaque page a un titre et du
  // contenu (paragraphes/puces). L'eleve tourne les pages comme dans un vrai support.
  livreOuvert?: {
    titre?: string
    pages: { titre?: string; paragraphes?: string[]; puces?: string[] }[]
  }
  // Temoignage facon personnage + bulle de dialogue : avatar a gauche, bulle a droite
  // avec le texte, et un bouton discret pour regarder la video (accessibilite).
  bulle?: {
    nom?: string
    role?: string
    avatar?: string // image du personnage (optionnel)
    initiale?: string // sinon, initiale dans une pastille
    couleurAvatar?: string
    lignes: string[] // paragraphes du temoignage
    videoLien?: string
  }
}
export interface DocumentRessource {
  numero: number // numero affiche (Document 1, 2...)
  titre: string
  images?: string[] // chemins des images (depuis /public), une ou plusieurs pages ; optionnel si le document est entierement textuel
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
      { numero: 1, titre: "Identité de l'entreprise (site RRG Championnet)", texte: [
        { pageWeb: true },
        { intertitre: 'Présentation de RENAULT CHAMPIONNET' },
        { paragraphes: ['Bienvenue chez Renault Championnet Occasions.'] },
        { intertitre: 'Qui sommes-nous ?' },
        { puces: ['Société créée en 1978', 'Concessionnaire'] },
        { paragraphes: [
          'Nous mettons à votre disposition en exposition un très large choix de véhicules d\u2019occasion, plus de 500 véhicules toutes marques dont utilitaires récents, révisés, peu kilométrés et garantis.',
          'Nous vous proposons également des solutions de financement adaptées sur mesure à vos besoins et à votre budget, ainsi que des devis de reprise de votre ancien véhicule sur place ou à domicile.',
          'Un taux en TAEG à 1,90 % sur 12 mois pour 2000 € emprunté assurance incluse, ou un taux à 3,90 % en TEG sur 24 à 36 mois peu importe la somme empruntée. Une LOA est également possible sur des véhicules d\u2019occasions. Essai également possible sur RDV.',
        ] },
        { tableau: { colonnes: ['Contact société', ''], lignes: [
          ['Raison sociale', 'RENAULT RETAIL GROUP — Championnet'],
          ['Adresse', '215 rue Championnet, 75018 Paris (Métro Guy Môquet)'],
          ['Téléphone', '01 42 28 36 36'],
          ['Langues parlées', 'Français, Anglais, Allemand, Espagnol, Italien'],
          ['Site internet', 'renault-occasions-paris-championnet.espacevo.fr'],
        ] } },
      ] },
      { numero: 2, titre: "Horaires d'ouverture du showroom", texte: [
        { pageWeb: true },
        { intertitre: 'Le showroom' },
        { tableau: { colonnes: ['Jour', 'Horaires'], lignes: [
          ['Lundi', '09:00 - 19:00'],
          ['Mardi', '09:00 - 19:00'],
          ['Mercredi', '09:00 - 19:00'],
          ['Jeudi', '09:00 - 19:00'],
          ['Vendredi', '09:00 - 19:00'],
          ['Samedi', '09:00 - 18:00'],
          ['Dimanche', 'Fermé'],
        ] } },
        { intertitre: 'Atelier mécanique' },
        { tableau: { colonnes: ['Jour', 'Matin', 'Après-midi'], lignes: [
          ['Lundi', '07:30 - 12:00', '13:00 - 18:00'],
          ['Mardi', '07:30 - 12:00', '13:00 - 18:00'],
          ['Mercredi', '07:30 - 12:00', '13:00 - 18:00'],
          ['Jeudi', '07:30 - 12:00', '13:00 - 18:00'],
          ['Vendredi', '07:30 - 12:00', '13:00 - 18:00'],
          ['Samedi', 'Fermé', 'Fermé'],
          ['Dimanche', 'Fermé', 'Fermé'],
        ] } },
      ] },
      { numero: 3, titre: 'Les biens (site RRG Championnet)', texte: [
        { pageWeb: true },
        { intertitre: 'Nos véhicules' },
        { paragraphes: ['La concession propose à la vente deux grands types de véhicules.'] },
        { puces: [
          'Véhicules neufs : la gamme Renault (Clio, Captur, Mégane, Kadjar, Twingo, Espace, Scénic, utilitaires…).',
          'Véhicules d\u2019occasion : plus de 500 véhicules toutes marques, révisés, garantis, peu kilométrés (Clio 4, Kadjar, Nissan Qashqai 2…).',
        ] },
        { intertitre: 'Exemples de véhicules d\u2019occasion (nos coups de cœur)' },
        { tableau: { colonnes: ['Modèle', 'Prix', 'Kilométrage'], lignes: [
          ['Renault Clio 4', '11 290 €', '33 966 km'],
          ['Renault Kadjar', '20 290 €', '18 890 km'],
          ['Nissan Qashqai 2', '—', '—'],
        ] } },
      ] },
      { numero: 4, titre: 'Les services', texte: [
        { pageWeb: true },
        { intertitre: 'Services disponibles' },
        { puces: [
          'Je recherche un véhicule : renseignez-vous sur nos véhicules neufs et d\u2019occasion.',
          'J\u2019entretiens mon véhicule : prenez rendez-vous en atelier.',
          'J\u2019ai besoin d\u2019un dépannage : contactez Renault Assistance.',
          'Je loue un véhicule : louez un véhicule avec Renault Rent ou Renault Mobility.',
        ] },
        { intertitre: 'Entretien et réparation' },
        { paragraphes: ['Entretien et Service APV de votre véhicule par des experts du réseau Renault, n° 01 53 53 60 75.'] },
        { intertitre: 'Nos interventions' },
        { puces: ['Entretien', 'Carrosserie / Vitrage', 'Révision', 'Diagnostic / réparation'] },
      ] },
      { numero: 5, titre: 'Le personnel (équipes présentées dans le désordre)', texte: [
        { pageWeb: true },
        { intertitre: 'L\u2019équipe des véhicules neufs' },
        { tableau: { colonnes: ['Nom', 'Fonction'], lignes: [
          ['Celine ETCHECOPAR', 'Assistant(e) de livraison'],
          ['Pascal JEAN', 'Conseiller(e) commercial(e) véhicules neufs'],
          ['Guillaume RAMUS', 'Chef des ventes véhicules neufs'],
          ['Sergio POLATIAN', 'Directeur'],
          ['José BENITEZ', 'Conseiller(e) commercial(e) véhicules neufs'],
        ] } },
        { intertitre: 'L\u2019équipe des véhicules d\u2019occasions' },
        { tableau: { colonnes: ['Nom', 'Fonction'], lignes: [
          ['Yayha ALLAOUI', 'Conseiller(e) commercial(e) véhicule occasion'],
          ['Cyril COTTARD', 'Conseiller(e) commercial(e) véhicule occasion'],
        ] } },
        { intertitre: 'L\u2019équipe Services' },
        { tableau: { colonnes: ['Nom', 'Fonction'], lignes: [
          ['Matthieu MULLIEZ', 'Chef des ventes pièces de rechange'],
          ['Bernard MERCIER', 'Conseiller(e) pièces de rechange'],
          ['Badr CHATRAOUI', 'Chef des services techniques'],
        ] } },
      ] },
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
        contexte: "Votre responsable vous demande de vous familiariser avec l'entreprise en complétant son identité.",
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
      { numero: 1, titre: 'Les explications de M. Prauviste (la zone de chalandise)', texte: [
        { pageWeb: true },
        { dialogue: [
          { texte: "« La zone de chalandise est la zone géographique qui entoure l'unité commerciale et dans laquelle on retrouve les clients et des prospects.", italique: true },
          { texte: "Cet espace est traditionnellement réparti en trois zones :", italique: true },
        ] },
        { puces: [
          "Primaire : c'est celle qui est la plus proche de l'unité commerciale et qui comporte la majorité de ses clients ou prospects ;",
          "Secondaire : elle se trouve autour de la zone primaire et comporte un peu moins de clients ou prospects ;",
          "Tertiaire : c'est la zone la plus éloignée de l'unité commerciale. Elle comporte un très petit nombre de clients ou prospects.",
        ] },
        { dialogue: [
          { texte: "Le schéma de la zone de chalandise, avec ses trois zones géographiques, peut être représenté :", italique: true },
        ] },
        { puces: ['En temps (minutes) ;', 'En distance ;', 'En densité de clients. »'] },
      ] },
      { numero: 2, titre: 'Les différentes représentations de la zone de chalandise', texte: [
        { pageWeb: true },
        { intertitre: 'Les trois représentations' },
        { paragraphes: ['La zone de chalandise peut être représentée de trois manières différentes selon le critère retenu.'] },
        { image: { src: '/docs/renault-m2/zone-chalandise.png', alt: 'Les trois représentations de la zone de chalandise : en temps (courbes isochrones), en distance (courbes isométriques), en densité de clients ou prospects.', legende: 'En temps : courbes isochrones — En distance : courbes isométriques — En densité de clients ou prospects.' } },
        { tableau: { colonnes: ['Représentation', 'Légende'], lignes: [
          ['En temps : courbes isochrones', 'Moins de 5 minutes / Moins de 10 minutes / Moins de 15 minutes'],
          ['En distance : courbes isométriques', "Moins d'1 kilomètre / Moins de 3 kilomètres / Moins de 5 kilomètres"],
          ['En densité de clients ou prospects', 'Forte densité / Densité moyenne / Faible densité de clients ou prospects'],
        ] } },
      ] },
      { numero: 3, titre: "Chèques, relevés d'identité bancaire et suggestions des clients", texte: [
        { pageWeb: true },
        { intertitre: 'Les chèques' },
        { cheques: [
          { banque: 'Crédit Agricole', couleur: '#006B3F', agence: 'Mutuel — Caisse Régionale du Centre de la Normandie, 10 rue Guilbert, 14300 Caen', titulaire: 'Mme Sasha Hutte', adresse: '7 rue Molière, 75001 Paris', telephone: '01.76.01.39.84', montant: '20,50 €', montantLettres: 'vingt euros et cinquante centimes', lieu: 'Paris', date: '02/10/2013', micr: '\u2448 0925614 \u2448   11006 \u2446 02041 \u2446 00021457893 \u2448', postitAnnee: '2016', postitAccessoire: 'Kit de sécurité 3 en 1' },
          { banque: 'Caisse d\u2019Épargne', couleur: '#C8102E', agence: 'CE-060809 — Paris 15ème, 18 rue de la Banque, 75015 Paris', titulaire: 'Mme Édith Aurialle', adresse: '12 rue du Plaisir, 93400 Saint-Ouen', telephone: '01.63.90.58.32', montant: '412,33 €', montantLettres: 'quatre cent douze euros et 33 centimes', lieu: 'Paris', date: '28/03/2017', micr: '000036   0230021566985   00700065456', postitAccessoire: 'Aide au stationnement avant' },
          { banque: 'Banque', couleur: '#1565C0', agence: 'Paris 18ème, 14 avenue de la Banque, 75018 Paris', titulaire: 'M. Tristan Hamour', adresse: '20 rue des Écoles, 92700 Colombes', telephone: '01.04.07.02.09', montant: '54,00 €', montantLettres: 'cinquante quatre euros', lieu: 'Paris', date: '10/04/2018', micr: '000048   0480042598712   00800015297', postitAnnee: '2010', postitAccessoire: 'Tapis de sol textile' },
          { banque: 'Banque', couleur: '#C8A415', agence: 'CE-060809 — Paris 15ème, 18 rue de la Banque, 75015 Paris', titulaire: 'Mme Beth Rhaves', adresse: '62 rue de Douai, 75009 Paris', telephone: '01.23.84.67.21', montant: '668,00 €', montantLettres: 'six cent soixante huit euros', lieu: 'Clichy', date: '04/07/2017', micr: '000036   0230021566985   00700065456', postitAnnee: '2017', postitAccessoire: 'Porte vélo sur attelage' },
          { banque: 'Banque', couleur: '#1565C0', agence: 'CE-060809 — Paris 15ème, 18 rue de la Banque, 75015 Paris', titulaire: 'Mme Sandy Quilau', adresse: '13 rue de Rome, 75008 Paris', telephone: '01.03.63.81.01', montant: '89,64 €', montantLettres: 'quatre vingt neuf euros et soixante quatre centimes', lieu: 'Paris', date: '06/01/2014', micr: '0230021566985   00700065456', postitAnnee: '2006', postitAccessoire: 'Antivol mécanique' },
          { banque: 'Spécimen Chèque', couleur: '#5B6770', agence: 'Paris 18ème, 36 quai de la Bourse, 75018 Paris', titulaire: 'M. Larry Bambel', adresse: '2 rue Vincent Compoint, 75018 Paris', telephone: '01.09.63.58.88', montant: '407,01 €', montantLettres: 'quatre cent sept euros et 1 centime', lieu: 'Paris', date: '13/02/2020', micr: '00001234   98765556789002000   189654123', postitAnnee: '2011', postitAccessoire: 'Coffre de toit' },
          { banque: 'BNP Paribas', couleur: '#00915A', agence: 'Domiciliation Grenette (00622)', titulaire: 'M. Cyril Hique', adresse: '9 rue Ganneron, 75017 Paris', telephone: '01.61.94.70.36', montant: '43,83 €', montantLettres: 'quarante trois euros et quatre vingt trois centimes', lieu: 'Paris', date: '15/05/2010', micr: '003564   66   7054   45126358   01', postitAnnee: '2010', postitAccessoire: 'Enjoliveur noir et jaune' },
          { banque: 'Banque', couleur: '#C8A415', agence: 'CE-060809 — Paris 15ème, 18 rue de la Banque, 75015 Paris', titulaire: 'Mme Bernadette Dejeu', adresse: '8 rue Eugène Carrière, 75018 Paris', telephone: '01.73.18.95.49', montant: '802,99 €', montantLettres: 'huit cent deux euros et 99 centimes', lieu: 'Paris', date: '21/05/2020', micr: '000036   0230021566985   00700065456', postitAnnee: '2019', postitAccessoire: 'Pack attelage col de cygne 13B' },
        ] },
        { intertitre: "Les relevés d'identité bancaire (RIB)" },
        { ribs: [
          { banque: 'Société Générale', couleur: '#E2241A', titulaire: 'M. Guy Tar', adresse: '12 rue Arsène Houssaye, 92230 Gennevilliers — Tél : 01.71.67.23.98', iban: 'FR76 30003 03200 00050509796 96', bic: 'SOGEFRPP', postitAnnee: '2020', postitAccessoire: 'Aide au stationnement avant' },
          { banque: 'LCL', couleur: '#003B7E', titulaire: 'M. Jacques Huze', adresse: '33 rue de la Joncquière, 75017 Paris — Tél : 01.39.45.93.25', iban: 'FR76 3000 2080 2600 0006 6341 X20', bic: 'CRLYFRPP', postitAnnee: '2016' },
          { banque: 'Banque', couleur: '#1565C0', titulaire: 'Mme Eva Zion', adresse: '11 rue Georges Seurat, 92110 Clichy — Tél : 01.65.84.03.69', iban: 'FR00 1234 5123 4512 3456 7891 A12', bic: 'ABCDEFGH', postitAnnee: '2010' },
          { banque: 'Crédit Agricole', couleur: '#006B3F', titulaire: 'M. Éric Dupont', adresse: '8 rue des Fermiers, 75017 Paris — Tél : 01.02.03.04.05', iban: 'FR76 1990 6000 0942 5760 0800 171', bic: 'AGRIRERX', postitAnnee: '2006' },
          { banque: 'CIC — Crédit Industriel et Commercial', couleur: '#003B7E', titulaire: 'M. Yvan Dubois', adresse: '60 rue du Colonel Fabien, 93100 Montreuil — Tél : 01.56.18.94.03', iban: 'FR76 3006 6107 4100 0104 6100 156', bic: 'CMCIFRPP', postitAnnee: '2011' },
          { banque: 'Caisse d\u2019Épargne', couleur: '#C8102E', titulaire: 'M. Jean Bon', adresse: '6 rue du Dr Paul Brousse, 75017 Paris — Tél : 01.41.84.07.40', iban: 'FR76 1382 5002 0008 1101 8161 990', bic: 'CEPAFRPP382', postitAnnee: '2018' },
          { banque: 'BNP Paribas', couleur: '#00915A', titulaire: 'Mme Élise Hémoi', adresse: '32 rue du Général Bertrand, 75007 Paris — Tél : 01.78.41.29.57', iban: 'FR76 3000 4006 2200 0102 6178 556', bic: 'BNPAFRPPTAS', postitAnnee: '2019' },
        ] },
        { intertitre: 'Les suggestions des clients' },
        { postits: [
          { prenom: 'Cécile', nom: 'Anssieux', adresse: '1 rue Fructidor, 93400 Saint-Ouen', telephone: '01.91.36.01.57', suggestion: "J'étais venue pour un rétroviseur. Je suis enceinte de 8 mois et j'aurais aimé pouvoir m'asseoir en attendant mon tour.", date: '06 déc. 2019' },
          { prenom: 'Paul', nom: 'Auchon', adresse: '11 Passage de Flandres, 75015 Paris', telephone: '01.58.23.94.71', suggestion: "Je suis venu acheter un autoradio, il y avait une queue pas possible. Il aurait été appréciable avec cette chaleur qu'il y ait une fontaine à eau à disposition des clients.", date: '22 juin 2015', couleur: '#F4C9D7' },
        ] },
      ] },
      { numero: 4, titre: "Tableau d'arrondis en temps", texte: [
        { pageWeb: true },
        { tableau: { colonnes: ['Zone', 'Distance en minutes', 'Arrondi des minutes'], lignes: [
          ['Zone primaire', 'Entre 0 min et 10 min', '10 minutes'],
          ['Zone secondaire', 'Entre 11 min et 20 min', '20 minutes'],
          ['Zone tertiaire', 'Entre 21 min et 30 min', '30 minutes'],
        ] } },
      ] },
      { numero: 5, titre: 'Extrait du fichier client', texte: [
        { pageWeb: true },
        { intertitre: 'Fichier clients' },
        { tableau: { colonnes: ['Nom et prénom', 'Téléphone portable', 'Téléphone fixe', 'Adresse mail'], lignes: [
          ['Éric Dupont', '07.61.94.70.36', '01.02.03.04.05', 'dupont.eric@gmail.com'],
          ['Jean Bon', '07.39.45.93.25', '01.41.84.07.40', 'j.bon@gmail.com'],
          ['Bernadette Dejeu', '06.03.63.81.01', '01.73.18.95.49', 'bernadejeu@yahoo.fr'],
          ['Tristan Hamour', '07.58.23.94.71', '01.04.07.02.09', 'hamour.t@laposte.fr'],
          ['Sandy Quilau', '06.56.18.94.03', '01.03.63.81.01', 's.quilau@hotmail.fr'],
          ['Larry Bambel', '06.41.84.07.40', '01.09.63.58.88', 'l.bambel2@orange.fr'],
          ['Beth Rhaves', '06.65.84.03.69', '01.23.84.67.21', 'rhavesbeth@yahoo.fr'],
          ['Cyril Hique', '07.34.25.61.28', '01.61.94.70.36', 'cyrilhique@icloud.fr'],
          ['Cécile Anssieux', '06.10.12.56.65', '01.91.36.01.57', 'cecile.anssieux@gmail.com'],
          ['Yvan Dubois', '07.76.01.39.84', '01.56.18.94.03', 'duboisyvan75@outlook.com'],
          ['Guy Tar', '06.64.46.82.28', '01.71.67.23.98', 'guy.tar@hotmail.com'],
          ['Édith Aurialle', '06.61.94.70.36', '01.63.90.58.32', 'e_aurialle@orange.fr'],
          ['Paul Auchon', '07.41.98.02.06', '01.58.23.94.71', 'polochon@free.fr'],
          ['Eva Zion', '07.63.90.58.32', '01.65.84.03.69', 'e.zion@caramail.com'],
          ['Sasha Hutte', '06.63.93.17.39', '01.76.01.39.84', 'sashahutte@sfr.fr'],
          ['Élise Hémoi', '06.03.63.81.01', '01.78.41.29.57', 'hemoi-elise@gmail.com'],
          ['Jacques Huze', '06.04.07.02.09', '01.39.45.93.25', 'jhuze@outlook.com'],
        ] } },
      ] },
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
        contexte: "Votre responsable M. Prauviste souhaite mettre en place une campagne de communication. Il vous demande donc d'analyser le lieu de provenance des clients de la concession et du garage à partir du fichier clients car il souhaite informer ceux qui sont à 20 minutes maximum, des Journées Portes Ouvertes qui auront lieu le 11 novembre à 10 heures à 20 heures.",
        questions: [
          { numero: 1, consigne: 'À partir des chèques, des relevés d\'identité bancaire et des suggestions des clients, complétez le tableau de provenance.', ressources: 'Lire les documents 1, 2 et 3, compléter l\'annexe 1.', annexeId: 'annexe1' },
        ],
      },
      {
        titre: 'Activité 2 — La détermination de la zone de chalandise : en temps',
        contexte: "Maintenant, votre tuteur M. Yves Jamen souhaite que vous évaluiez, en voiture, la distance en temps qui sépare les clients de la concession.",
        questions: [
          { numero: 2, consigne: 'Retrouvez et notez l\'adresse de la concession Renault.', ressources: 'Compléter l\'annexe 2.', annexeId: 'annexe2' },
          { numero: 3, consigne: 'Complétez le tableau en inscrivant les nom et prénom des clients, calculez la distance en temps (Google Maps) puis arrondissez à la dizaine supérieure.', ressources: 'Lire le document 4, compléter l\'annexe 3.', annexeId: 'annexe3' },
        ],
      },
      {
        titre: 'Activité 3 — La construction de la zone de chalandise',
        contexte: "Maintenant que vous avez identifié la provenance des clients et le temps qu'ils mettent pour se rendre à la concession, votre tuteur vous demande de répondre à sa question.",
        questions: [
          { numero: 4, consigne: 'Selon vous, quel est l\'avantage pour la concession Renault de connaître d\'où viennent ses clients ?', ressources: 'Compléter l\'annexe 4.', annexeId: 'annexe4' },
        ],
      },
      {
        titre: 'Activité 4 — Sélectionner les clients',
        contexte: "Votre tuteur vous annonce qu'il ne souhaite faire bénéficier de ces journées portes ouvertes qu'aux clients de la zone primaire ou secondaire et qui ont une voiture achetée avant 2015. Il vous charge de les identifier tandis que les prospects, eux, seront contactés par l'autre stagiaire de la concession.",
        questions: [
          { numero: 5, consigne: 'Indiquez le nom et le mail des clients qui recevront l\'invitation (zone primaire ou secondaire et véhicule acheté avant 2015).', ressources: 'Lire l\'annexe 1 et le document 5, compléter l\'annexe 5.', annexeId: 'annexe5' },
        ],
      },
    ],
    annexes: [
      { type: 'grille', id: 'annexe1', titre: 'Annexe 1 — Provenance des clients de la concession', colonnes: ['Nom et prénom', 'Adresse', 'Téléphone', 'Produit acheté', 'Année'], nbLignes: 17 },
      { type: 'tableau', id: 'annexe2', titre: 'Annexe 2 — Adresse de la concession', lignes: [{ id: 'adr', libelle: 'Adresse de la concession' }] },
      { type: 'grille', id: 'annexe3', titre: 'Annexe 3 — Calcul de la distance en km et en temps', colonnes: ['Nom', 'Prénom', 'Distance entre le domicile du client et la concession en km', 'Distance entre le domicile du client et la concession en minute', 'Arrondir le temps à la dizaine supérieur'], nbLignes: 17 },
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
      { numero: 1, titre: 'Note de M. Prauviste (contenu du courriel)', texte: [
        { pageWeb: true },
        { intertitre: "Note d'information" },
        { paragraphes: ['Le courriel doit inciter les clients à venir découvrir les nouveaux modèles Renault.'] },
        { paragraphes: ['Pour rédiger le courriel :'] },
        { puces: [
          'Écrivez en gros le nom de la concession ;',
          "Écrivez une phrase d'accroche ;",
          "Écrivez la date et l'heure de l'évènement ;",
          'Insérez la photo d\u2019un des modèles de véhicules récents qui sera exposé ;',
          "Écrivez l'adresse de la concession.",
        ] },
        { paragraphes: ["N'oubliez pas d'écrire l'adresse mail de tous les destinataires ainsi que celui de l'entreprise dpo@renault.com."] },
      ] },
      { numero: 2, titre: "Consignes pour la rédaction d'un SMS commercial", texte: [
        { pageWeb: true },
        { paragraphes: ["« SMS » signifie Short Message Service, c'est-à-dire « service de messages courts ». Cela signifie qu'en très peu de mots et en allant à l'essentiel, le client doit savoir de quoi il s'agit quand il ouvre le message."] },
        { paragraphes: ['Donc pour rédiger le message de rappel, vous le structurerez de la façon suivante :'] },
        { puces: [
          "Nom de l'entreprise ;",
          "Phrase d'accroche rappelant l'évènement ;",
          "La date et l'heure ;",
          "Site de l'entreprise et numéro de téléphone ;",
          'STOP 36321 (cela donne la possibilité au client ou au prospect de ne plus recevoir de message publicitaire s\u2019il le souhaite).',
        ] },
        { paragraphes: ['Une fois le message rédigé, vérifiez votre orthographe puis envoyez-le. »'] },
      ] },
      { numero: 3, titre: "Consignes d'accueil de M. Prauviste", texte: [
        { pageWeb: true },
        { intertitre: 'Le livret du stagiaire' },
        { intertitre: '1 — Accueillir le client' },
        { paragraphes: ["Lors de l'accueil :"] },
        { puces: [
          'Faire attention à votre communication non-verbale ;',
          "Saluer le client avec une phrase d'accueil chaleureuse ;",
        ] },
      ] },
      { numero: 4, titre: 'Le paralangage (éléments non verbaux et signification)', texte: [
        { pageWeb: true },
        { tableau: { colonnes: ['Éléments non verbaux', 'Signification'], lignes: [
          ['Regard', "Plus il est franc et long, plus il sera considéré comme « intéressé » ; plus il est court, plus il affirmera votre manque d'intérêt. Une personne dont le regard est fuyant ou focalisé sur les détails plutôt que sur ses interlocuteurs envoie un message négatif."],
          ['Expression du visage', "Les froncements de sourcils marquent un mécontentement ou une remise en cause de l'échange ; les sourires en coin expriment un manque d'intérêt voire de sérieux ; le mordillement des lèvres une certaine gêne. À l'inverse, le sourire franc et les yeux grands ouverts traduisent l'ouverture d'esprit, l'écoute et l'empathie."],
          ['Timbre de la voix', "Une voix tremblante, à peine audible, et une élocution rapide marquent un état d'anxiété, alors que la maîtrise de sa respiration, le timbre clair et une parfaite prononciation sont des preuves d'une forte personnalité."],
          ['Gestes', "Passer sa main dans ses cheveux, se frotter le nez, la bouche ou le menton peuvent trahir un doute ou une grande anxiété, de même que des mouvements saccadés ou rapides. Au contraire, des mouvements amples, maîtrisés et lents sont des signes de confiance en soi. On peut citer la poignée de main, plus ou moins molle, plus ou moins appuyée."],
          ['Posture', "Le dos droit, les pieds bien ancrés dans le sol, les mains contrôlées, le regard non fuyant montrent la confiance en soi, la solidité, la force ou un certain charisme. Le dos courbé, le regard fuyant, les mains constamment torturées marquent timidité, malaise, manque de confiance, nervosité. Bras ou jambes croisés dénotent une attitude fermée."],
        ] } },
      ] },
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
        contexte: "Nous sommes le 2 novembre et votre tuteur est absent du bureau aujourd'hui. Il vous laisse une note dans laquelle il vous demande de rédiger le courriel commercial qui sera envoyé à tous les clients que vous avez sélectionnés précédemment selon les critères qu'il vous avait donnés.",
        questions: [
          { numero: 1, consigne: 'Rédigez le courriel destiné aux clients sélectionnés. Vous pouvez le rédiger directement sur l\'annexe 1a, ou en ligne (lien Quizinière / QR code, annexe 1b).', ressources: 'Lire le document 1, compléter l\'annexe 1a.', annexeId: 'annexe1a' },
        ],
      },
      {
        titre: 'Activité 2 — La prise de contact par SMS',
        contexte: "Nous sommes le 10 novembre et c'est demain qu'auront lieu les Journées Portes Ouvertes organisées par Renault. Ce sera une journée très importante pour la concession et votre tuteur souhaite absolument que vous vous entraîniez à prendre contact avec la clientèle et ce quel que soit le canal utilisé.",
        questions: [
          { numero: 2, consigne: 'Rédigez le SMS destiné aux clients sélectionnés pour rappeler l\'évènement.', ressources: 'Lire le document 2, compléter l\'annexe 2.', annexeId: 'annexe2' },
        ],
      },
      {
        titre: 'Activité 3 — La prise de contact en face-à-face',
        contexte: "Nous sommes aujourd'hui le 11 novembre il est 9h et l'évènement organisé va commencer dans une heure. Vous jetez un dernier coup d'œil rapide sur le livret que vous a donné votre responsable la veille. Il comporte les consignes pour faire un accueil positif au client.",
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
      { numero: 1, titre: 'Comment connaître les besoins (les types de questions)', texte: [
        { pageWeb: true },
        { intertitre: 'Le livret du stagiaire — 2. Recherche des besoins' },
        { paragraphes: ['Les types de questions :'] },
        { tableau: { colonnes: ['Type de question', 'Définition', 'Exemple'], lignes: [
          ['Ouverte « O »', "Elle laisse le client s'exprimer.", "Pourquoi préférez-vous ce type d'enjoliveur ?"],
          ['Fermée « F »', 'Elle ne permet qu\u2019une réponse précise : oui ou non, âge, pointure…', "Q : « Avez-vous déjà un autoradio ? » — R : « Oui » (ou non). Q : « Quelle est votre pointure ? » — R : « Je fais du 39 »"],
          ['Alternative « A »', 'Elle donne le choix entre 2 possibilités.', 'Vous recherchez une voiture de 3 ou 5 portes ?'],
          ['Questions à choix multiple « CM »', 'Elle donne le choix entre plusieurs possibilités. Le client peut donner plusieurs réponses parmi celles proposées.', 'Q : Vous prenez la cravate, la chemise, le pantalon, la ceinture ? — R : Je vais prendre la chemise, la cravate et la ceinture.'],
          ['Question ricochet « R »', 'Elle permet de faire rebondir la conversation pour faire préciser sa pensée au client.', 'Pourquoi dites-vous que… ?'],
          ['Question miroir « M »', 'Elle permet de relancer le dialogue en répétant de façon interrogative ce que vient de dire le client.', 'Client : Cette couleur me semble un peu voyante. Vendeur : Voyante ?'],
        ] } },
      ] },
      { numero: 2, titre: "Les mobiles et motivations d'achat du client (SONCAS-E)", texte: [
        { pageWeb: true },
        { intertitre: 'Le livret du stagiaire — 3. Identification des mobiles et des motivations' },
        { paragraphes: ["Les mobiles d'achat :"] },
        { tableau: { colonnes: ['Typologie', 'Exemples'], lignes: [
          ['S comme Sécurité', 'Produit solide, fiable, robuste, garanti, de qualité'],
          ['O comme Orgueil', 'Produit prestigieux, de marque'],
          ['N comme Nouveauté', 'Produit récent, à la mode, innovant, moderne'],
          ['C comme Confort', "Produit pratique, facile d'utilisation, efficace"],
          ['A comme Argent', 'Paiement en plusieurs fois, produit économique, en promotion'],
          ['S comme Sympathie', "Plaisir procuré par l'achat, attirance pour une couleur, une forme"],
          ['E comme Environnement', 'Produit durable, écologique'],
        ] } },
        { paragraphes: ["Les motivations d'achat :"] },
        { tableau: { colonnes: ['Typologie', 'Définition'], lignes: [
          ['Hédoniste ou personnelle', 'Achat pour se faire plaisir'],
          ['Oblative ou altruiste', 'Achat pour faire plaisir aux autres'],
          ['Auto-expression', "Achat pour s'affirmer, se démarquer des autres"],
        ] } },
      ] },
      { numero: 3, titre: 'Comment reformuler (les types de reformulation)', texte: [
        { pageWeb: true },
        { intertitre: 'Le livret du stagiaire — 4. Reformuler' },
        { paragraphes: ['Les types de reformulation :'] },
        { tableau: { colonnes: ['Type de reformulation', 'Définition', 'Exemple'], lignes: [
          ['Écho ou perroquet', 'Elle consiste à répéter les paroles du client ou un terme important, comme un perroquet.', 'Le client : Je n\u2019aime pas ce modèle. Le commercial : Vous n\u2019aimez pas ce modèle ? — « Un bon prix ? »'],
          ['Miroir ou reflet', 'Vous reformulez les propos du client avec vos propres mots.', '« Vous recherchez donc une voiture d\u2019occasion, avec une fonction GPS simple à utiliser et à un prix raisonnable ? »'],
          ['Résumé ou synthèse', 'Vous faites une synthèse de tout ce que vous a dit le client. En d\u2019autres termes… / Vous voulez dire que… / Si j\u2019ai bien compris… C\u2019est bien cela ?', '« Si j\u2019ai bien compris, vous recherchez une voiture d\u2019occasion, qui vous permettra de calculer facilement vos trajets et à un bon prix. C\u2019est bien cela ? »'],
        ] } },
      ] },
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
        contexte: "L'étape de la prise de contact passée, vous êtes en confiance pour pouvoir mener l'entretien de vente en commençant par faire la recherche des besoins afin de pouvoir ensuite prodiguer les meilleurs conseils à vos clients.",
        questions: [
          { numero: 1, consigne: "Questionnez M. Dupont avec la méthode en entonnoir (du général au particulier). En fonction de chaque réponse, construisez la question du vendeur et cochez le type de question dont il s'agit.", ressources: "Lire le document 1, compléter l'annexe 1. [C.1.2]", annexeId: 'annexe1dlg' },
        ],
      },
      {
        titre: "Activité 2 — Les mobiles et les motivations d'achat",
        contexte: "Maintenant que vous avez questionné les clients quant à leurs attentes, vous cherchez à connaître les raisons qui incitent la famille Dupont à changer de voiture. Vous consultez la page 3 de votre livret.",
        questions: [
          { numero: 2, consigne: "Cochez le ou les mobiles d'achat exprimés par les clients lors du dialogue, puis justifiez en reportant la phrase de M. Dupont.", ressources: "Lire le document 2, compléter l'annexe 2. [C.1.2]", annexeId: 'annexe2mob' },
          { numero: 3, consigne: "Cochez la ou les motivations d'achat exprimées par les clients lors du dialogue, puis justifiez en reportant la phrase de M. Dupont.", ressources: "Lire le document 2, compléter l'annexe 3. [C.1.2]", annexeId: 'annexe3mot' },
        ],
      },
      {
        titre: 'Activité 3 — La reformulation',
        contexte: "Vous avez fait une recherche des besoins exhaustive et pour être sûr que vous avez correctement compris toutes les exigences de la famille Dupont, vous procédez à la reformulation.",
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
      { numero: 1, titre: 'Le logiciel de recherche des offres véhicules (Renault Championnet)', texte: [
        { pageWeb: true },
        { paragraphes: ["Renseignez les critères de la famille Dupont pour trouver le véhicule correspondant. Chaque étape filtre les offres disponibles."] },
        { configurateurVehicule: { marque: 'Renault', etapes: [
          { titre: 'Le type de véhicule', obligatoire: true, options: ['Véhicule neuf', "Véhicule d'occasion", 'Véhicule de démonstration'] },
          { titre: 'La catégorie du véhicule', obligatoire: true, options: ['4 X 4 / SUV / Crossover', 'Berline / Break', 'Citadine', 'Coupé et Cabriolet', 'Monospace', 'Utilitaire'] },
          { titre: 'La marque du véhicule', obligatoire: true, options: ['RENAULT', 'DACIA', 'ALPHA ROMEO', 'AUDI', 'BMW', 'CITROËN'] },
          { titre: "L'énergie du véhicule", obligatoire: true, options: ['Diésel', 'Essence', 'GPL', 'Hybride', 'Electrique'] },
          { titre: 'Boîte de vitesses du véhicule', obligatoire: true, options: ['Automatique', 'Manuelle'] },
          { titre: 'La couleur du véhicule', obligatoire: true, options: ['Beige', 'Blanc', 'Bleu', 'Bordeau', 'Gris', 'Jaune'] },
          { titre: 'Prix', obligatoire: true, options: ['- 5000 €', 'entre 5001 € et 6400 €', 'entre 6400 € et 7400 €', 'entre 7400 € et 8400 €', 'entre 8400 € et 9400 €', 'entre 9400 € et 15 000 €', 'entre 15 000 et 25 000 €', 'Plus de 25 000 €'] },
        ] } },
        { paragraphes: ['Pour la recherche « entre 7400 € et 8400 € », deux véhicules correspondent.'] },
      ] },
      { numero: 2, titre: 'Les véhicules disponibles (fiches produit)', texte: [
        { pageWeb: true },
        { intertitre: '2 véhicules disponibles' },
        { fichesVehicule: { vehicules: [
          { modele: 'RENAULT ZOE', version: 'Zoe Gris', prix: '8 290 €', bandeau: 'Éligible prime à la conversion', image: '/docs/renault-m5/fiche-zoe-8290.png', resume: 'Électrique - Zen - Automatique - 18 383 km - 2014', etat: 'Occasion', lieu: 'Paris Lefebvre', garantie: 'Garantie jusqu\u2019à 36 mois | Contrôle de 76 points | Assistance 24/24H | Satisfait ou remboursé | Contrôle gratuit après 1 mois',
            essentiel: [
              { label: 'Énergie', valeur: 'Électrique' }, { label: 'Places', valeur: '5' },
              { label: 'Puissance DIN', valeur: '88 cv' }, { label: 'Catégorie', valeur: 'Citadine' },
              { label: 'Puissance fiscale', valeur: '1' }, { label: 'Version', valeur: 'Zoe' },
              { label: 'Transmission', valeur: 'Automatique' }, { label: 'Teinte', valeur: 'Gris' },
              { label: 'Portes', valeur: '5' },
            ],
            caracteristiques: [
              { label: 'Poids à vide', valeur: '1 435 kg' }, { label: 'Motricité', valeur: 'Traction avant' },
              { label: 'Longueur', valeur: '4 084 cm' }, { label: 'Cylindrée', valeur: '0 cm³' },
              { label: 'Hauteur', valeur: '1 568 cm' }, { label: 'Pneu', valeur: '195/55 R16' },
            ],
            equipements: ['Régulateur limiteur de vitesse', 'Système de fixation ISOFIX', 'Aide au parking AR', 'Rétroviseurs extérieurs électriques dégivrants', 'Carte fonction "mains libres"', 'Allumage automatique des feux et des essuie-glaces', 'Climatisation automatique régulée', 'Navigation Carminat TomTom Z.E. Live', '6 Airbags frontaux et latéraux', 'ABS + AFU', 'Contrôle dynamique de trajectoire ESC', 'Lève-vitres AV électriques (impulsionnel conducteur) et AR', 'Radiosat Mid Classic + Son auditorium « 3D sound by Arkamys » 6HP', 'Condamnation centralisée des ouvrants', 'My Z.E. Connect with Navigation 36m', 'Condamnation automatique des ouvrants', 'R-Link + Carminat TomTom Z.E. Live', 'Lève-vitres AV électriques', 'Enjoliveurs Flexwheel 16" Ozedia'],
          },
          { modele: 'RENAULT ZOE', version: 'Zoe Gris', prix: '7 900 €', bandeau: 'Éligible prime à la conversion', image: '/docs/renault-m5/fiche-zoe-7900.png', resume: 'Électrique - Life - Automatique - 50 218 km - 2015', etat: 'Occasion', lieu: 'Paris Lefebvre', garantie: 'Garantie jusqu\u2019à 36 mois | Contrôle de 76 points | Assistance 24/24H | Satisfait ou remboursé | Contrôle gratuit après 1 mois',
            essentiel: [
              { label: 'Énergie', valeur: 'Électrique' }, { label: 'Places', valeur: '5' },
              { label: 'Puissance DIN', valeur: '88 cv' }, { label: 'Catégorie', valeur: 'Citadine' },
              { label: 'Puissance fiscale', valeur: '1' }, { label: 'Version', valeur: 'Zoe' },
              { label: 'Transmission', valeur: 'Automatique' }, { label: 'Teinte', valeur: 'Gris' },
              { label: 'Portes', valeur: '5' },
            ],
            caracteristiques: [
              { label: 'Poids à vide', valeur: '1 435 kg' }, { label: 'Motricité', valeur: 'Traction avant' },
              { label: 'Longueur', valeur: '4 084 cm' }, { label: 'Cylindrée', valeur: '0 cm³' },
              { label: 'Hauteur', valeur: '1 562 cm' }, { label: 'Pneu', valeur: '185/65 R15' },
            ],
            equipements: ['Régulateur limiteur de vitesse', 'Lève-vitres AV électriques', 'Peinture métallisée', 'Rétroviseurs extérieurs électriques dégivrants', 'Climatisation automatique régulée', 'ABS + AFU', 'Contrôle dynamique de trajectoire ESC', 'Feux de jour à LED', 'Condamnation automatique des ouvrants', 'Détection pression des pneus'],
          },
        ] } },
      ] },
      { numero: 3, titre: 'Comment convaincre le client (méthode C.A.P. et SONCAS-E)', texte: [
        { pageWeb: true },
        { intertitre: 'Le livret du stagiaire — 5. Argumenter' },
        { paragraphes: ["Lorsque vous arrivez à l'étape de l'argumentation, vous devez respecter la méthode C.A.P. pour construire vos arguments. Il vous faut également retrouver les mobiles d'achat émis par le client."] },
        { intertitre: "La construction d'un argument avec les mobiles d'achat et la méthode C.A.P." },
        { tableau: { colonnes: ["Mobile d'achat", 'Caractéristique', 'Avantage', 'Preuve'], lignes: [
          ['Sécurité / Orgueil / Nouveauté / Confort / Argent / Sympathie / Environnement', '', '', ''],
        ] } },
        { paragraphes: ['Exemple :'] },
        { tableau: { colonnes: ["Mobiles d'achat du client", 'Caractéristique', 'Avantage', 'Preuve'], lignes: [
          ['Confort', 'Commande vocale du GPS', 'Pas besoin de réglages manuels', 'Regardez comment je fais !'],
          ['Argent', '99 € par mois', 'Un impact faible sur votre budget', 'Tableau de financement page 5'],
        ] } },
      ] },
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
        contexte: "Les clients vous ont confirmé que vous avez bien compris leurs besoins. Il est donc temps de leur proposer des produits correspondant à leurs besoins.",
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
        contexte: "Vous faites une démonstration aux clients pour les inciter à acheter le véhicule que vous leur conseillez.",
        questions: [
          { numero: 4, consigne: "Montrez aux clients quelques secondes de la vidéo du véhicule pour qu'ils se l'imaginent, puis indiquez ce que vous mettez en avant pendant la démonstration.", ressources: 'Visionner la vidéo de démonstration, compléter l\'annexe 4. [C.1.2]', annexeId: 'annexe4demo' },
        ],
      },
      {
        titre: "Activité 4 — L'argumentation",
        contexte: "Maintenant que vous avez fait une proposition qui semble plaire aux clients. Vous allez devoir argumenter pour leur montrer en quoi selon vous, c'est le véhicule qui leur correspond le mieux.",
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
      { numero: 1, titre: 'Les objections (types et techniques de traitement)', texte: [
        { pageWeb: true },
        { intertitre: 'Le livret du stagiaire — 6. Le traitement des objections' },
        { paragraphes: ["Il arrive que pendant le dialogue de vente le client ait des doutes ou des inquiétudes quant au produit qui lui est proposé. Il appartient au commercial de les lever pour faciliter la vente."] },
        { intertitre: "Les types d'objections" },
        { tableau: { colonnes: ['Les objections', 'Définition'], lignes: [
          ['Objections sincères', "Le client a une crainte qui est réelle, fondée sur son expérience passée négative, des craintes… Le client a besoin d'être rassuré."],
          ['Objections prétextes', "Le client cherche à fuir le commercial pour ne pas entrer dans l'entretien de vente."],
        ] } },
        { intertitre: 'Techniques de traitement des objections' },
        { tableau: { colonnes: ['Technique', 'Définition', 'Exemple'], lignes: [
          ['Oui… mais', 'Le commercial donne raison au client puis avance un argument.', '« Oui, je comprends mais… »'],
          ['Affaiblissement', "Le commercial montre au client que ce qu'il pense être un point faible est en fait un point fort.", "« Le coffre a été conçu pour s'ouvrir facilement dans les cas où le client peut avoir les mains prises. »"],
          ['Témoignage', "Le commercial utilise l'expérience d'un autre client pour argumenter.", '« On peut demander à ma collègue. Elle a offert le même GPS à sa mère de 70 ans et elle le trouve très simple à utiliser. »'],
          ['Compensation', 'Le commercial montre que les points forts sont plus nombreux que les points faibles détectés par le client.', "« Il n'y a que cette fonctionnalité qui manque, car il y a tout de même un toit ouvrant, le siège chauffant et le GPS intégré. »"],
          ['Anticipation', "Le commercial devance l'objection du client en avançant un argument.", '« Je sais que vous allez me dire que… »'],
        ] } },
      ] },
      { numero: 2, titre: "L'app My Renault (gestion à distance du véhicule électrique)", texte: [
        { pageWeb: true },
        { intertitre: 'My Renault — Application mobile' },
        { paragraphes: ["L'application My Renault permet de gérer à distance son véhicule électrique depuis son smartphone."] },
        { puces: [
          'Consulter le niveau de charge de la batterie en temps réel ;',
          'Programmer et suivre la recharge à distance ;',
          "Recevoir une notification lorsque la charge atteint 100 % ;",
          'Préconditionner la température de l\u2019habitacle avant de partir ;',
          'Localiser les bornes de recharge à proximité ;',
          'Suivre l\u2019autonomie restante et l\u2019historique des trajets.',
        ] },
      ] },
      { numero: 3, titre: 'Objection de M. Dupont', texte: [
        { pageWeb: true },
        { dialogue: [
          { locuteur: 'M. Dupont', texte: "C'est super mais il y a une question que je me pose depuis tout à l'heure. Combien ça risque de nous coûter ? Un véhicule comme ça, je suppose que c'est pas donné !" },
        ] },
      ] },
      { numero: 4, titre: 'Le courriel de votre responsable (annoncer le prix)', texte: [
        { pageWeb: true },
        { mailLecture: {
          de: 'votreresponsable@renault.fr',
          a: 'commerciauxrenault@renault.fr',
          objet: 'Annoncer le prix au client',
          corps: [
            'Bonjour,',
            "Je vous rappelle que l'annonce du prix du véhicule est un moment important qui peut faire fuir le client. Il faut donc la soigner en respectant un certain nombre de règles.",
            "C'est pour cela que je vous demanderais de faire preuve d'empathie, en montrant au client que vous le comprenez, puis faites simple et annoncez le prix en utilisant la technique de « l'addition ». Elle consiste à énumérer quelques avantages forts du véhicule qui justifient le prix qu'on va annoncer.",
            'Je compte sur vous pour appliquer cette technique et surtout vendre beaucoup de voitures le jour des Journées Portes Ouvertes.',
            'Cordialement,',
            'M. Prauviste — Directeur concession Renault',
          ],
        } },
      ] },
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
        contexte: "Malgré votre démonstration et votre argumentaire très pertinent, cela n'a pas suffi à complètement rassurer la famille Dupont. En effet, pendant la discussion, elle a émis plusieurs objections qui lui font douter quant au véhicule que vous lui avez proposé. Il vous appartient maintenant de lever ses freins pour avancer dans le processus de vente.",
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
        contexte: "Les clients ont été convaincus par vos réponses face à leurs nombreux doutes. Ils ont donc une dernière objection sur le prix.",
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
      { numero: 1, titre: "Les signaux d'achat positifs ou négatifs", texte: [
        { pageWeb: true },
        { intertitre: 'Le livret du stagiaire — 7. Les signaux positifs ou négatifs' },
        { tableau: { colonnes: ["Signaux d'achat", 'Positifs', 'Négatifs'], lignes: [
          ['Signaux verbaux', 'Le client : se projette dans l\u2019avenir ; demande les délais de livraison, de la garantie ou du paiement ; souhaite des détails ; demande un avantage supplémentaire ; fait intervenir un tiers pour valider sa décision ; fait de l\u2019humour ; il parle davantage.', "Le client : n'émet que des objections prétextes ; est très critique ; ne voit que les aspects négatifs du produit."],
          ['Signaux non verbaux', 'Le client : sourit de plus en plus ; est détendu ; avance vers le bureau ; est enthousiaste.', 'Le client : reste silencieux ; regarde constamment son smartphone ; se gratte la tête ; tapote des doigts sur la table ; s\u2019enfonce dans sa chaise ; regarde par la fenêtre.'],
        ] } },
      ] },
      { numero: 2, titre: 'Dialogue entre M. et Mme Dupont', texte: [
        { pageWeb: true },
        { paragraphes: ['Assis face à la famille Dupont, vous écoutez le couple discuter à propos du véhicule.'] },
        { dialogue: [
          { locuteur: 'M. Dupont', texte: "Alors, t'en penses quoi toi ? C'est pas mal !" },
          { locuteur: 'Mme Dupont', texte: '(Avec un grand sourire) Oui, elle est très bien cette voiture !' },
          { locuteur: 'M. Dupont', texte: "(Enthousiaste) C'est vrai qu'elle a tout ce qu'on souhaite. Comme il nous le disait, elle a tout ce qu'il nous faut, elle ne pollue pas, la couleur est belle…" },
          { locuteur: 'Mme Dupont', texte: "(Se gratte la tête) La seule chose qui m'embête un peu c'est le prix. Même si elle est parfaite et dans nos prix, je pensais qu'on aurait pu avoir un véhicule à un prix un peu plus bas. C'est juste ça !" },
          { locuteur: 'M. Dupont', texte: "(S'enfonce dans sa chaise) C'est pas faux…" },
        ] },
      ] },
      { numero: 3, titre: 'Comment conclure la vente (techniques de conclusion)', texte: [
        { pageWeb: true },
        { intertitre: 'Le livret du stagiaire — 3. Comment conclure la vente ?' },
        { tableau: { colonnes: ['Technique de conclusion', 'Caractéristiques', 'Exemple'], lignes: [
          ['La conclusion directe', 'Le commercial invite tout naturellement le client à finaliser la vente.', 'Alors vous la prenez ?'],
          ['La conclusion alternative', 'Le commercial incite le client en lui proposant le choix entre 2 solutions.', 'Vous la voulez en essence ou diésel ?'],
          ['La conclusion « joker »', "Le commercial apporte un argument important qu'il avait gardé afin de précipiter la décision du client.", "C'est le dernier jour de la promotion !"],
        ] } },
      ] },
      { numero: 4, titre: 'La prime à la conversion (pour acheter un véhicule plus propre)', texte: [
        { pageWeb: true },
        { image: { src: '/docs/renault-m7/prime-conversion.png', alt: 'Prime à la conversion des véhicules et bonus écologique — Testez votre éligibilité en 6 étapes maximum.', legende: 'Testez votre éligibilité en 6 étapes maximum.' } },
        { paragraphes: ["Cette prime exceptionnelle est réservée aux 200 000 premiers acheteurs, alors n'attendez plus pour faire votre choix parmi les voitures neuves ou plus de 6 000 voitures d'occasion disponibles immédiatement et éligibles à la prime à la conversion."] },
        { intertitre: 'Testez votre éligibilité — Prime à la conversion et bonus écologique' },
        { formulaireInteractif: { titre: 'Prime à la conversion des véhicules et bonus écologique', intro: [
          'Dès maintenant, bénéficiez de la prime à la conversion.',
          "L'objectif du nouveau dispositif est d'aider tous les Français, particuliers ou professionnels, à acheter un véhicule neuf ou d'occasion en échange de la mise au rebut d'un vieux véhicule.",
          "La prime peut atteindre 3 000 € pour l'achat d'un véhicule thermique neuf ou d'occasion et 5 000 € pour l'achat d'un véhicule électrique ou hybride rechargeable neuf ou d'occasion.",
        ], etapes: [
          { titre: 'Puis-je bénéficier de la prime à la conversion ? Je fais le test', obligatoire: true, options: [{ label: 'OUI, je commence le test', suite: 'Passer à la question 2' }, { label: 'Non, je ne fais pas le test', suite: 'Passer à la question 3' }] },
          { titre: 'Précisez les caractéristiques de votre voiture particulière', obligatoire: true, options: [{ label: 'Véhicule diesel', suite: 'Passer à la question 4' }, { label: 'Véhicule essence, gaz…', suite: 'Passer à la question 16' }] },
          { titre: 'Sur votre avis d\u2019imposition 2019 sur les revenus 2018, votre « revenu fiscal de référence » est-il supérieur à 18 000 € ?', obligatoire: true, options: [{ label: 'Oui' }, { label: 'Non', suite: 'Passer à la question 6' }] },
          { titre: 'Votre véhicule diesel a-t-il été immatriculé avant 2011 ?', obligatoire: true, options: [{ label: 'Oui', suite: 'Passer à la question 8' }, { label: 'Non', suite: 'Passer à la question 7' }] },
          { titre: 'Quel type de véhicule souhaitez-vous acheter ?', obligatoire: true, options: [{ label: 'Véhicule particulier ou véhicule utilitaire léger', suite: 'Passer à la question 9' }, { label: 'Vélo, trottinette…', suite: 'Passer à la question 15' }] },
          { titre: "S'agit-il d'un véhicule neuf ou d'occasion ?", obligatoire: true, options: [{ label: 'Neuf', suite: 'Passer à la question 10' }, { label: 'Occasion', suite: 'Passer à la question 10' }] },
          { titre: "Quel est le classement Crit'Air du véhicule que vous souhaitez acheter ?", obligatoire: true, options: [{ label: 'Véhicule électrique ou hydrogène', suite: 'Passer à la question 12' }, { label: "Véhicule Crit'Air 1", suite: 'Passer à la question 12' }, { label: "Véhicule Crit'Air 3, 4, 5 ou non classé", suite: 'Passer à la question 11' }] },
          { titre: "Quel est le coût d'acquisition (location de la batterie incluse) du véhicule que vous souhaitez acheter ?", obligatoire: true, options: [{ label: 'Le coût est inférieur ou égal à 60 000 €', suite: 'Passer à la question 13' }, { label: 'Le coût est supérieur à 60 000 €', suite: 'Passer à la question 14' }] },
          { titre: 'Résultat', obligatoire: true, options: [{ label: "Bonne nouvelle, vous pouvez, sous réserve d'instruction du dossier, bénéficier de la prime à la conversion de 5 000 €." }] },
        ] } },
      ] },
      { numero: 5, titre: 'Réponses au test « prime à la conversion »', texte: [
        { pageWeb: true },
        { intertitre: 'Réponses données par M. et Mme Dupont' },
        { puces: [
          'Véhicule actuel acheté en 2005 ;',
          'Revenu fiscal de référence : 17 000 € ;',
          "Je souhaite acheter un véhicule d'occasion ;",
          'Je souhaite acheter un véhicule de 8 300 € maximum ;',
          'Je souhaite acheter un véhicule électrique ;',
          'Je souhaite acheter un véhicule particulier.',
        ] },
      ] },
      { numero: 6, titre: 'La méthode de calcul du crédit', texte: [
        { pageWeb: true },
        { intertitre: 'Le livret du stagiaire — 8. Calculer le crédit' },
        { paragraphes: ['Le reste à vivre doit être supérieur à :'] },
        { puces: ['650 € pour une personne célibataire ;', '1 400 € pour un couple ;', '400 € par enfant présent dans le foyer.'] },
        { paragraphes: [
          "Reste à vivre (c'est la somme qui reste à un individu pour vivre une fois toutes ses charges payées) = l'ensemble des rentrées d'argent − l'ensemble des dépenses du ménage.",
          "Le taux d'endettement du foyer doit être de 33 % maximum ; au-delà, le crédit ne peut être accordé. Taux d'endettement = l'ensemble des dépenses du ménage / les salaires du couple × 100.",
          'Intérêts à payer = (montant de la mensualité × 12 mois × nombre d\u2019années de remboursement) − montant du véhicule.',
        ] },
      ] },
      { numero: 7, titre: 'La situation financière de la famille Dupont', texte: [
        { pageWeb: true },
        { tableau: { colonnes: ['Élément', 'Montant'], lignes: [
          ['Salaire de M. Dupont', '2 184,98 €'],
          ['Salaire de Mme Dupont', '2 000,43 €'],
          ['Allocations familiales', '131,95 €'],
          ['Nombre d\u2019enfants', '2 enfants'],
          ['Loyer', '1 030 €'],
          ['Crédit à la consommation', '315,67 €'],
        ] } },
        { paragraphes: ['Le couple souhaite emprunter la totalité du coût de la voiture sur 5 ans avec des mensualités de 200 € par mois.'] },
      ] },
      { numero: 8, titre: 'Calcul du crédit de M. et Mme Dupont (simulateur)', texte: [
        { pageWeb: true },
        { formulaireInteractif: { titre: 'RENAULT — Calcul du crédit de M. et Mme Dupont', logo: undefined, intro: ['Demande de crédit — Renseignez les informations concernant le client (mettez des chiffres ou une croix selon la réponse du client).'], etapes: [
          { section: 'DEMANDE DE CRÉDIT', titre: 'Informations concernant le client', champs: [
            { label: 'Nombre de personnes total dans le foyer' },
            { label: 'Célibataire' }, { label: 'En couple / marié' }, { label: 'Veuf / veuve' },
          ] },
          { titre: 'Reste à vivre', champs: [{ label: 'Calcul' }, { label: 'Résultat', suffixe: '€' }] },
          { titre: 'Reste à vivre supérieur à', champs: [{ label: 'Calcul' }, { label: 'Résultat', suffixe: '€' }] },
          { titre: "Taux d'endettement", champs: [{ label: 'Calcul' }, { label: 'Résultat', suffixe: '%' }] },
          { titre: 'Intérêts à payer', champs: [{ label: 'Calcul' }, { label: 'Résultat', suffixe: '€' }] },
          { titre: 'Commentaire du commercial', champs: [{ label: 'Commentaire' }] },
        ] } },
      ] },
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
        contexte: "Le prix a été annoncé et les clients semblent séduits.",
        questions: [
          { numero: 1, consigne: "Indiquez les signaux d'achat de M. et Mme Dupont (verbaux et non verbaux, positifs et négatifs).", ressources: "Lire les documents 1 et 2, compléter l'annexe 1. [C.1.2]", annexeId: 'annexe1sig' },
        ],
      },
      {
        titre: 'Activité 2 — Conclure la vente',
        contexte: "En écoutant la conversation en aparté du couple, vous vous rendez compte qu'il est prêt à acheter cette voiture. Pour les inciter à se décider vous choisissez de conclure.",
        questions: [
          { numero: 2, consigne: "Retrouvez les deux arguments « joker » importants à présenter aux prospects.", ressources: "Lire les documents 3 et 4, compléter l'annexe 2. [C.1.2]", annexeId: 'annexe2joker' },
          { numero: 3, consigne: "Complétez le test « prime à la conversion » avec les informations du couple. Le test est intégré ci-dessous.", ressources: "Lire les documents 4 et 5, compléter le test (annexe 4b). [C.1.2]", annexeId: 'annexe4btest' },
          { numero: 4, consigne: "Rédigez la phrase que vous prononcerez pour annoncer le résultat, en utilisant la conclusion « joker ».", ressources: "Lire le document 3 et l'annexe 2, compléter l'annexe 3. [C.1.2]", annexeId: 'annexe3phrase' },
        ],
      },
      {
        titre: 'Activité 3 — Calculer le crédit',
        contexte: "Le couple est séduit par votre argument et souhaite acheter le véhicule. Cependant, il veut savoir combien cet achat va lui coûter.",
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
      { numero: 1, titre: 'La note de M. Prauviste (vente complémentaire et supplémentaire)', texte: [
        { pageWeb: true },
        { intertitre: "Note d'information — La vente additionnelle" },
        { paragraphes: [
          "Je vous rappelle qu'il est important de vendre des produits ou services en plus à vos clients quand cela est possible, car cela permet non seulement d'augmenter le chiffre d'affaires de l'entreprise mais aussi de vous accorder des primes sur ces ventes.",
          'Vous trouverez ci-dessous un tableau explicatif sur la vente additionnelle.',
          'La direction',
        ] },
        { tableau: { colonnes: ['Vente additionnelle', 'Caractéristiques', 'Exemples'], lignes: [
          ['La vente complémentaire', "C'est un produit qui complète l'esthétique du produit principal ou est utile pour utiliser le produit principal.", "Un pare-soleil pour l'achat d'une voiture ; la proposition d'options"],
          ['La vente supplémentaire', "C'est un produit qui n'a rien à voir avec le produit principal mais qui peut être utile pour le client.", 'Un siège bébé'],
        ] } },
      ] },
      { numero: 2, titre: 'Le catalogue des accessoires (Renault Championnet)', texte: [
        { pageWeb: true },
        { catalogueAccessoires: { titre: 'Trouver mes accessoires', nbTotal: 42, categories: ['Signalisation secours', 'Diffuseur parfum', 'Stickers', 'Accessoires de la marque', 'Multimédia', 'Extincteurs et supports', 'Écriture', 'Porte-clés', 'Habillement'], produits: [
          { nom: 'SAC BAGOTO', sousTitre: 'Sac shopping, sac publicitaire', categorie: 'Accessoires de la marque', prix: '2,00 €' },
          { nom: 'STYLO RENAULT B', sousTitre: 'Écriture', categorie: 'Écriture', prix: '1,25 €' },
          { nom: 'Extincteur 2 kg avec manomètre', sousTitre: 'Extincteurs et supports', categorie: 'Extincteurs et supports', prix: '33,74 €' },
          { nom: 'Fixation pour extincteur pour MASTER III', sousTitre: 'Extincteurs et supports', categorie: 'Extincteurs et supports', prix: '32,24 €' },
          { nom: 'ETUI IP6 ALPINE', sousTitre: 'Accessoires de téléphonie', categorie: 'Multimédia', prix: '20,00 €' },
          { nom: 'Stickers de personnalisation extérieure — Lignes blanches pour TWINGO III', sousTitre: 'Décors adhésifs extérieurs spécifiques', categorie: 'Stickers', prix: '387,29 €' },
          { nom: 'Stickers de personnalisation extérieure — Vintage pour TWINGO III', sousTitre: 'Décors adhésifs extérieurs spécifiques', categorie: 'Stickers', prix: '387,29 €' },
          { nom: 'OURSON ALPINE', sousTitre: 'Autres objets de communication', categorie: 'Accessoires de la marque', prix: '35,00 €' },
          { nom: 'Porte-clés Losange', sousTitre: 'Porte-clés', categorie: 'Porte-clés', prix: '2,00 €' },
          { nom: 'Kit de sécurité pour NOUVELLE ALPINE', sousTitre: 'Kits de sécurité', categorie: 'Signalisation secours', prix: '20,40 €' },
          { nom: 'Kit Sécurité', sousTitre: 'Kits de sécurité', categorie: 'Signalisation secours', prix: '20,50 €' },
          { nom: 'PINS LOSANGE 9MM', sousTitre: "Pin's", categorie: 'Accessoires de la marque', prix: '1,50 €' },
          { nom: 'TASSE RENAULT B', sousTitre: 'Autres objets de communication', categorie: 'Accessoires de la marque', prix: '15,00 €' },
          { nom: 'BATTERIE RENAULTB', sousTitre: 'Accessoires de téléphonie', categorie: 'Multimédia', prix: '30,00 €' },
          { nom: 'Recharge Parfum Stimulating Forest', sousTitre: 'Cartouches de parfum', categorie: 'Diffuseur parfum', prix: '6,49 €' },
          { nom: 'Porte-clés', sousTitre: 'Porte-clés', categorie: 'Porte-clés', prix: '5,50 €' },
          { nom: 'Stylo', sousTitre: 'Écriture', categorie: 'Écriture', prix: '30,00 €' },
          { nom: 'Extincteur 1 kg avec manomètre pour NOUVELLE ALPINE', sousTitre: 'Extincteurs et supports', categorie: 'Extincteurs et supports', prix: '21,67 €' },
          { nom: 'Stickers Sécurité pour véhicule de société — Classe A pour TRAFIC III', sousTitre: 'Bandes réfléchissantes', categorie: 'Stickers', prix: '104,11 €' },
          { nom: 'STYLO BLANC F1', sousTitre: 'Écriture', categorie: 'Écriture', prix: '2,95 €' },
          { nom: 'Sticker de personnalisation de carte-clé — Diamant Noir', sousTitre: 'Décors adhésifs extérieurs spécifiques', categorie: 'Stickers', prix: '8,69 €' },
          { nom: 'COQUE TEL TWINGO', sousTitre: 'Accessoires de téléphonie', categorie: 'Multimédia', prix: '15,00 €' },
        ] } },
        { image: { src: '/docs/renault-m8/catalogue-accessoires.png', alt: "Catalogue des accessoires Renault Championnet — 42 accessoires disponibles.", legende: 'Aperçu du catalogue en ligne : 42 accessoires disponibles.' } },
      ] },
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
      { numero: 1, titre: 'Histoire de Citroën', texte: [
        { pageWeb: true },
        { intertitre: 'Histoire de Citroën' },
        { paragraphes: [
          "Citroën a été fondée en 1919 par André Citroën, un ingénieur et industriel qui a joué un rôle pionnier dans l'automobile en Europe. À ses débuts, Citroën se distingue en introduisant des techniques de production avancées inspirées des méthodes américaines, notamment la chaîne de montage, ce qui lui permet de réduire les coûts de production et d'accélérer la fabrication de véhicules. En 1934, la marque lance la Traction Avant, qui révolutionne le marché avec son architecture innovante, un moteur avant et une carrosserie en acier monocoque, offrant une meilleure maniabilité et un confort accru.",
          "Dans les années qui suivent, Citroën continue d'innover avec des modèles emblématiques tels que la 2CV en 1948, conçue pour être économique et accessible, répondant ainsi aux besoins des familles françaises d'après-guerre. Cette voiture devient rapidement un symbole de liberté et de praticité.",
          "Au fil des décennies, Citroën fait face à plusieurs défis, notamment des difficultés financières dans les années 1970. Cependant, l'entreprise parvient à se redresser grâce à des modèles innovants comme la BX et la ZX, tout en développant de nouvelles technologies telles que la suspension hydropneumatique. À partir des années 2000, Citroën entame une transformation en intégrant des pratiques durables dans ses processus de production et en investissant dans des véhicules électriques.",
          "Aujourd'hui, Citroën s'engage à devenir un acteur majeur de la mobilité durable, en proposant des véhicules hybrides et électriques tout en continuant d'innover pour répondre aux besoins variés de sa clientèle. Avec une présence mondiale, Citroën est reconnue pour son design unique, son confort et son rapport qualité-prix.",
        ] },
      ] },
      { numero: 2, titre: 'Vision et valeurs de Citroën', texte: [
        { pageWeb: true },
        { intertitre: 'Vision et valeurs de Citroën' },
        { paragraphes: [
          "La vision de Citroën repose sur l'idée de rendre la mobilité accessible et durable pour tous. L'entreprise aspire à devenir un leader dans le secteur de la mobilité durable en développant des solutions de transport respectueuses de l'environnement. Citroën met un point d'honneur à placer le client au cœur de ses préoccupations, cherchant constamment à améliorer l'expérience utilisateur à travers l'innovation et le confort.",
          'Les valeurs fondamentales qui guident la marque comprennent :',
        ] },
        { puces: [
          "Innovation : Citroën investit massivement dans la recherche et le développement pour créer des véhicules qui intègrent les dernières technologies, comme la connectivité avancée, l'assistance à la conduite et les systèmes de sécurité innovants.",
          "Durabilité : Citroën s'engage à réduire son empreinte carbone, tant dans la production que dans l'utilisation de ses véhicules. Cela passe par des initiatives telles que l'électrification de sa gamme et l'optimisation de ses processus de fabrication.",
          "Accessibilité : la marque s'efforce de rendre ses véhicules accessibles à un large public, en proposant des modèles économiques tout en maintenant un haut niveau de qualité.",
          "Confort et bien-être : Citroën se concentre sur l'expérience de conduite en intégrant des technologies visant à améliorer le confort des passagers, comme des sièges ergonomiques et des systèmes de divertissement intuitifs.",
        ] },
      ] },
      { numero: 3, titre: 'Chiffres clés de Citroën', texte: [
        { pageWeb: true },
        { intertitre: 'Chiffres clés de Citroën' },
        { tableau: { colonnes: ['Indicateur', 'Valeur'], lignes: [
          ["Année de création", '1919'],
          ['Fondateur', 'André Citroën'],
          ["Chiffre d'affaires annuel", '≈ 16 milliards €'],
          ['Nombre de véhicules vendus en 2023', '≈ 1 million de véhicules'],
          ['Part des ventes électriques et hybrides', '≈ 25 % des ventes'],
          ['Présence', 'Marque présente à l\u2019international'],
        ] } },
      ] },
      { numero: 4, titre: 'Analyse de marché', texte: [
        { pageWeb: true },
        { intertitre: 'Analyse de marché' },
        { paragraphes: [
          "Le marché automobile en France est marqué par une forte concurrence. Les principaux acteurs, tels que Renault, Peugeot, Volkswagen et Toyota, dominent le paysage, chacun proposant une gamme variée de véhicules allant des citadines aux SUV. Citroën se positionne principalement sur le segment des citadines et des SUV, visant à attirer des jeunes conducteurs et des familles à la recherche de praticité et de style.",
          "Pour rester compétitive, Citroën a renforcé sa stratégie de marketing digital, ciblant les jeunes consommateurs à travers des campagnes sur les réseaux sociaux et des partenariats avec des influenceurs. La marque met également en avant ses valeurs d'innovation et de durabilité pour séduire un public de plus en plus conscient des enjeux environnementaux.",
          "Il y a 1 an, les ventes de véhicules électriques et hybrides ont continué de croître, représentant environ 25 % des ventes totales de la marque. Citroën a investi dans le développement de nouveaux modèles électriques, comme la ë-C3, pour répondre à cette demande croissante.",
        ] },
      ] },
      { numero: 5, titre: 'Tendances de consommation', texte: [
        { pageWeb: true },
        { intertitre: 'Tendances de consommation' },
        { paragraphes: [
          "Les tendances de consommation dans le secteur automobile révèlent un intérêt accru pour les véhicules écologiques et connectés. Les jeunes consommateurs, en particulier, sont de plus en plus attirés par les voitures compactes qui allient fonctionnalité et esthétique. En parallèle, la montée du télétravail a modifié les comportements d'achat, avec une demande pour des véhicules adaptés aux déplacements quotidiens et aux loisirs.",
          "Les aspects écologiques sont devenus des critères essentiels dans le choix d'un véhicule. Les consommateurs recherchent des solutions de transport qui minimisent leur empreinte carbone et privilégient les marques qui adoptent des pratiques durables. Citroën, en répondant à ces attentes, se positionne comme un acteur de choix pour les acheteurs soucieux de l'environnement.",
        ] },
      ] },
      { numero: 6, titre: 'Gamme de produits Citroën', texte: [
        { pageWeb: true },
        { intertitre: 'Gamme de produits Citroën' },
        { paragraphes: ['Citroën propose une large gamme de véhicules, adaptés aux besoins variés des consommateurs :'] },
        { puces: [
          "Citadines : les modèles comme la C3 se distinguent par leur design moderne, leur compacité et leurs fonctionnalités pratiques pour la vie urbaine. La C3 est équipée de technologies telles que la connectivité Bluetooth, des systèmes de navigation et des options de personnalisation.",
          "SUV : le C5 Aircross offre un espace intérieur généreux, avec une capacité de chargement impressionnante. Ce modèle intègre des technologies avancées pour le confort et la sécurité, notamment des systèmes d'assistance à la conduite et une connectivité améliorée.",
          "Véhicules électriques et hybrides : Citroën a lancé plusieurs modèles électriques, dont la ë-C3, qui offre une autonomie de 300 km. Ces modèles intègrent des technologies pour optimiser l'efficacité énergétique et le confort des passagers.",
          "Véhicules utilitaires : Citroën propose également des modèles pour les professionnels, comme le Berlingo et le Jumpy, qui allient fonctionnalité et économie.",
        ] },
      ] },
      { numero: 7, titre: 'Nouveaux modèles', texte: [
        { pageWeb: true },
        { intertitre: 'Nouveaux modèles' },
        { paragraphes: ["L'an dernier, Citroën a présenté plusieurs nouveaux modèles et mises à jour, dont :"] },
        { puces: [
          "La ë-C3 : ce modèle entièrement électrique répond à la demande croissante pour des solutions de mobilité durable. Il est conçu pour offrir une expérience de conduite agréable avec des performances respectueuses de l'environnement.",
          "Mises à jour de la C5 Aircross : ce modèle a été amélioré avec un système d'info-divertissement moderne et de nouvelles options de motorisation, y compris une version hybride rechargeable. Les améliorations comprennent également des fonctionnalités de sécurité avancées et une ergonomie optimisée pour le confort des passagers.",
        ] },
        { paragraphes: ["Citroën a également mis l'accent sur le design de ses véhicules, en introduisant des lignes modernes et des options de personnalisation qui répondent aux goûts variés des consommateurs."] },
      ] },
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
        contexte: "Pour mieux connaître la marque, vous plongez dans l'histoire de Citroën car il est important de connaître les origines de l'entreprise, ses modèles emblématiques et sa vision pour comprendre son identité.",
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
        contexte: "Ensuite, votre responsable vous demande d'analyser le marché dans lequel Citroën évolue en identifiant les principaux concurrents de la marque et en examinant son positionnement ainsi que les tendances de consommation qui influencent le secteur automobile.",
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
        contexte: "Maintenant, vous allez vous concentrer sur l'étude des produits offerts par Citroën et découvrir la diversité de sa gamme de véhicules, les caractéristiques de certains modèles et les innovations récentes.",
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
      { type: 'grille', id: 'annexe1', titre: "Annexe 1 — Éléments de l'histoire de l'entreprise", colonnes: ['Élément', 'Réponse'], nbLignes: 6, largeurs: ['45%', '55%'], reponseMultiligne: true, lignesReponse: 2, prerempli: [
        ["Créateur de l'entreprise", ''],
        ['Date de création', ''],
        ['La vision de la marque à propos des déplacements écologiques', ''],
        ["Chiffre d'affaires", ''],
        ['2 modèles marquants et leur année de lancement', ''],
        ['Nombre de véhicules vendus', ''],
      ] },
      { type: 'grille', id: 'annexe2', titre: 'Annexe 2 — Le marché de Citroën', colonnes: ["Éléments d'analyse", 'Réponses'], nbLignes: 5, largeurs: ['45%', '55%'], reponseMultiligne: true, lignesReponse: 2, prerempli: [
        ['Ses concurrents', ''],
        ['Le secteur de marché sur lequel il se positionne', ''],
        ['La méthode', ''],
        ['Les tendances de consommation actuelles', ''],
        ["L'attirance des jeunes pour ses véhicules", ''],
      ] },
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
        contexte: "Votre tuteur vous demande d'apprendre comment établir un contact efficace avec un concessionnaire automobile car selon lui, une bonne prise de contact est fondamentale pour instaurer un climat de confiance et commencer une relation commerciale fructueuse.",
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
        contexte: "Il vous demande ensuite d'étudier les besoins d'une cliente à travers un dialogue pour lui proposer ensuite un véhicule adapté.",
        questions: [
          { numero: 6, consigne: 'Énumérez les critères mentionnés par Clara pour sa voiture.', ressources: "Consulter le document 2 et le document 3, compléter l'annexe 6. [C.1.2]", annexeId: 'annexe6' },
          { numero: 7, consigne: 'Indiquez pourquoi la taille de la voiture est importante pour Clara.', ressources: "Consulter le document 2, compléter l'annexe 7. [C.1.2]", annexeId: 'annexe7' },
          { numero: 8, consigne: 'Donnez le budget maximum que Clara souhaite respecter.', ressources: "Consulter le document 2, compléter l'annexe 8. [C.1.2]", annexeId: 'annexe8' },
        ],
      },
      {
        titre: "Activité 3 — La proposition d'une voiture",
        contexte: "Ensuite votre responsable vous apprend à présenter des véhicules qui correspondent aux critères émis par le client car cette étape est essentielle pour le convaincre que les options proposées répondent bien à ses besoins.",
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
        contexte: "Enfin, il vous demande de suivre le processus de finalisation de l'achat d'une voiture. Il vous montre les étapes clés comme choisir le modèle, discuter du financement, comprendre le contrat, et enfin, recevoir les clés de la voiture. Il souhaite que vous compreniez l'importance de bien se préparer avant de signer et de s'assurer que tout est clair.",
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
      { type: 'grille', id: 'annexe9', titre: "Annexe 9 — Proposition d'une voiture", colonnes: ['Élément', 'Réponse'], nbLignes: 7, largeurs: ['45%', '55%'], reponseMultiligne: true, lignesReponse: 2, prerempli: [
        ['3 modèles', ''],
        ['', ''],
        ['', ''],
        ['Modèle complètement électrique et son prix', ''],
        ['Modèle le plus économique', ''],
        ['Équipement commun aux 3 véhicules', ''],
        ['Modèle au-dessus de son budget', ''],
      ] },
      { type: 'grille', id: 'annexe10', titre: "Annexe 10 — Étapes de finalisation de l'achat", colonnes: ['Étape', 'Réponse'], nbLignes: 5 },
      { type: 'texte', id: 'annexe11', titre: 'Annexe 11 — Options de financement', lignes: 2 },
      { type: 'grille', id: 'annexe12', titre: 'Annexe 12 — Lire le contrat et la remise des clés', colonnes: ['Élément', 'Réponse'], nbLignes: 2, largeurs: ['45%', '55%'], reponseMultiligne: true, lignesReponse: 2, prerempli: [
        ["L'importance de bien lire le contrat", ''],
        ['Le moment de la remise des clés', ''],
      ] },
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
        contexte: "Vous décidez d'étudier les étapes à suivre pour assurer le suivi d'une commande après la signature du contrat. En effet, cette procédure est essentielle pour garantir une expérience client satisfaisante et pour s'assurer que le véhicule est livré dans les délais.",
        questions: [
          { numero: 1, consigne: 'Indiquez quelle est la première étape après avoir fait la sélection du véhicule.', ressources: "Consulter le document 1, compléter l'annexe 1. [C.2.1]", annexeId: 'annexe1' },
          { numero: 2, consigne: "Expliquez ce qu'est un numéro de commande et son rôle.", ressources: "Consulter le document 1, compléter l'annexe 2. [C.2.1]", annexeId: 'annexe2' },
          { numero: 3, consigne: "Indiquez combien de temps peut durer la production d'un véhicule.", ressources: "Consulter le document 1, compléter l'annexe 3. [C.2.1]", annexeId: 'annexe3' },
          { numero: 4, consigne: 'Détaillez ce qui se passe lors de la livraison du véhicule.', ressources: "Consulter le document 1, compléter l'annexe 4. [C.2.1]", annexeId: 'annexe4' },
        ],
      },
      {
        titre: 'Activité 2 — Informer le client sur les conditions et les délais de livraison',
        contexte: "Enfin, votre tuteur vous demande d'examiner la façon d'informer le client sur les conditions et les délais de livraison de sa citadine.",
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
        contexte: "Pour commencer, elle souhaite que vous sachiez ce qu'est une cible et que vous l'identifiiez.",
        questions: [
          { numero: 1, consigne: 'Cochez les critères de segmentation retenus par votre tutrice et justifiez votre réponse.', ressources: "Lire les documents 1 et 2, compléter l'annexe 1. [C.4B.1]", annexeId: 'annexe1' },
        ],
      },
      {
        titre: 'Activité 2 — La cible de la prospection',
        contexte: "Maintenant que vous savez quelle est la cible à viser, votre tutrice vous remet un extrait d'annuaire comportant des types d'organisations différentes.",
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
        contexte: "Votre tutrice vous demande de lui proposer deux techniques de prospection les plus adaptées pour vous mettre en contact avec les prospects. Votre tutrice vous rappelle que s'il existe une infinité de techniques de prospection, toutes ne peuvent pas être applicables dans tous les types d'entreprise car certaines ne conviennent pas à la structure ou l'image de celle-ci. Elle souhaite que les techniques de prospection que vous choisirez soient dynamiques mais qu'elles permettent également d'avoir un contact direct et chaleureux avec les prospects.",
        questions: [
          { numero: 1, consigne: 'Listez les avantages et les inconvénients de chaque technique de prospection.', ressources: "Lire le document 2, compléter l'annexe 1. [C.4B.2]", annexeId: 'annexe1' },
          { numero: 2, consigne: "Répartissez les techniques de prospection selon qu'elles soient à distance ou de contact direct.", ressources: "Lire les documents 1 et 2, compléter l'annexe 2. [C.4B.2]", annexeId: 'annexe2' },
          { numero: 3, consigne: "Retrouvez toutes les techniques qu'il est possible d'utiliser chez AMParis. Justifiez votre réponse par rapport aux exigences de votre tutrice.", ressources: "Lire le document 2, compléter l'annexe 3. [C.4B.2]", annexeId: 'annexe3' },
          { numero: 4, consigne: 'Indiquez les 2 techniques que vous retiendrez pour la prospection de votre cible. Justifiez votre réponse en citant le document 2.', ressources: "Compléter l'annexe 4. [C.4B.2]", annexeId: 'annexe4' },
        ],
      },
      {
        titre: 'Activité 2 — La prospection écrite',
        contexte: "Vous avez déterminé le type de prospection à distance que vous souhaitez mettre en place et grâce à votre justification pertinente, votre tuteur vous a donné son accord. Vous observez attentivement les coordonnées de chacune des organisations que vous avez sélectionnées (Mission 2 annexe 4). Le document de prospection écrit est « dynamique et pas cher » comme vous l'a demandé votre tutrice dans le document 1.",
        questions: [
          { numero: 5, consigne: 'Rédigez le document de prospection écrite que vous allez envoyer à vos prospects.', ressources: "Lire le document 3, compléter l'annexe 5. [C.4B.2]", annexeId: 'annexe5' },
          { numero: 6, consigne: "Retournez à la Mission 2, l'annexe 4, puis indiquez quelle coordonnée est manquante.", ressources: "Compléter l'annexe 6. [C.4B.2]", annexeId: 'annexe6', contexteAvant: "Cependant, vous constatez que pour l'une des organisations, les coordonnées nécessaires à l'envoi du document ne sont pas disponibles." },
          { numero: 7, consigne: "Donnez le nom de l'organisation dont la coordonnée est manquante.", ressources: "Compléter l'annexe 7. [C.4B.2]", annexeId: 'annexe7' },
          { numero: 8, consigne: "Quelle autre coordonnée de l'organisation est disponible pour envoyer le document de prospection écrit.", ressources: "Compléter l'annexe 8. [C.4B.2]", annexeId: 'annexe8' },
          { numero: 9, consigne: "Indiquez quelle autre technique de prospection écrite il est possible d'utiliser.", ressources: "Relire le document 2, compléter l'annexe 9. [C.4B.2]", annexeId: 'annexe9' },
          { numero: 10, consigne: "Rédigez le document de prospection écrite que vous allez envoyer à vos prospects. N'oubliez pas d'adapter le document 3 au type de document que vous allez rédiger.", ressources: "Relire le document 3, compléter l'annexe 10. [C.4B.2]", annexeId: 'annexe10' },
        ],
      },
      {
        titre: 'Activité 3 — La prospection téléphonique',
        contexte: "Le document de prospection écrite que vous avez rédigé a été validé par votre tutrice. Cela fait une semaine que vous avez tout envoyé, et vous vous préparez maintenant pour la prospection de contact direct pour relancer vos prospects, les gestionnaires et les chefs d'établissements.",
        questions: [
          { numero: 11, consigne: 'Préparez votre appel téléphonique en utilisant la méthode CROC.', ressources: "Lire les documents 4 et 5, compléter l'annexe 11. [C.4B.2]", annexeId: 'annexe11' },
        ],
      },
      {
        titre: "Activité 4 — La réalisation d'une fiche prospect",
        contexte: "Après avoir réalisé votre fiche d'appel, votre tutrice vous demande de préparer la fiche prospect qui sera utilisée lors de la campagne de prospection téléphonique.",
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
          { numero: 2, consigne: "Complétez le fichier contacts à l'aide des numéros que vous avez eu en appelant.", ressources: "Lire le document 1, compléter l'annexe 2. [C.4B.2]", annexeId: 'annexe2', contexteAvant: "Vous avez passé les appels à l'ensemble des organisations sélectionnées. Certains décisionnaires vous ont répondu ce qui permet de compléter le fichier contacts." },
        ],
      },
      {
        titre: 'Activité 2 — Les objectifs de rendez-vous',
        contexte: "Votre tuteur tient à ce que votre opération de phoning soit rentable et pour qu'elle le soit, étant donné le fait que vous soyez dans l'entreprise depuis très peu de temps, elle vous demande de réussir à obtenir au moins 2 rendez-vous.",
        questions: [
          { numero: 3, consigne: 'Combien de rendez-vous avez-vous réussi à avoir suite à votre campagne de téléprospection ?', ressources: "Consulter l'annexe 2, compléter l'annexe 3. [C.4B.2]", annexeId: 'annexe3' },
          { numero: 4, consigne: "Complétez votre agenda en y inscrivant les rendez-vous que vous avez réussi à obtenir.", ressources: "Consulter l'annexe 2, compléter l'annexe 4. [C.4B.2]", annexeId: 'annexe4' },
          { numero: 5, consigne: 'Calculez votre taux de réalisation.', ressources: "Lire le document 2, compléter l'annexe 5. [C.4B.2]", annexeId: 'annexe5' },
          { numero: 6, consigne: 'Quel commentaire pouvez-vous faire lorsque vous comparez les objectifs qui vous ont été fixés et ce que vous avez réalisé ?', ressources: "Consulter l'annexe 5, compléter l'annexe 6. [C.4B.2]", annexeId: 'annexe6' },
        ],
      },
      {
        titre: "Activité 3 — Calcul du coût de l'opération",
        contexte: "Votre tutrice vous avait demandé au moment de la mise en place de l'opération de prospection, que celle-ci ne coûte pas trop cher à l'entreprise, soit 20€ maximum. Elle vous demande maintenant de calculer le coût réel de l'opération.",
        questions: [
          { numero: 7, consigne: "Calculez le coût de l'opération.", ressources: "Consulter la Mission 2 annexe 4 puis lire le document 3, compléter l'annexe 7. [C.4B.2]", annexeId: 'annexe7' },
          { numero: 8, consigne: 'Commentez ces résultats au regard du budget que vous a accordé Mme Pauret pour la mise en place de l\u2019opération.', ressources: "Consulter l'annexe 7, compléter l'annexe 8. [C.4B.2]", annexeId: 'annexe8' },
        ],
      },
      {
        titre: 'Activité 4 — Mettre à jour le fichier client',
        contexte: "L'opération de prospection s'est bien passée et votre tutrice est satisfaite. Pour que celle-ci soit complétement terminée, elle vous demande de mettre à jour le fichier clients en rentrant les informations qui vous ont été données au cours de vos appels.",
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
        contexte: "Maxime fait appel à vous pour l'aider à préparer son PowerPoint en utilisant les informations qu'il a recueillies auprès de son tuteur.",
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
        contexte: "M. Lefevre, le responsable de l'agence, vous interroge à son tour sur les demandes des clients que vous avez reçues, qu'elles aient été formulées en face-à-face, par mail ou par téléphone.",
        questions: [
          { numero: 6, consigne: "Repérez les demandes de clients les plus fréquentes et la façon dont elles sont traitées.", ressources: 'Consulter le document 1, compléter la diapositive 6. [3.1.1]', annexeId: 'ppt' },
        ],
      },
      {
        titre: 'Activité 3 — Les outils de fidélisation et/ou de développement de la relation client',
        contexte: "Toujours dans le cadre de la constitution de son dossier pour son oral, Maxime s'intéresse à la fidélisation chez Orpi Guy Môquet.",
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
        contexte: "Afin de vous préparer à votre propre oral en entreprise qui aura lieu dans quelques semaines, votre professeur d'économie-gestion vous demande de vous exercer sur le PowerPoint de Maxime. Votre entraînement devra durer 10 minutes maximum.",
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

const ORPI_M3: ContenuMission = {
  travaux: {
    consigne:
      "Présentez la mise en œuvre de l'action de FDRC retenue (réactivation du compte Instagram) : cible, objectifs, outils, contraintes, étapes, ventes au rebond, enrichissement du SIC, puis évaluation et bilan de l'action.",
    contexte:
      "Maxime, élève de terminale Bac Pro MCVB, a effectué son premier stage au sein de l'agence Orpi Guy Môquet. À la fin de ce premier stage, il avait proposé deux actions pour améliorer la relation client et fidéliser la clientèle. L'action retenue pour mise en œuvre était la mise à jour et l'animation du compte Instagram de l'agence, qui n'avait pas été utilisée depuis plusieurs mois. Après avoir pris conscience de l'importance de la présence numérique dans la relation client, Maxime a désormais entamé sa deuxième période de stage au sein de la même agence. Son objectif pour cette deuxième période est de mettre en œuvre l'action de fidélisation choisie et d'évaluer ses résultats à travers un PowerPoint qu'il présentera à son tuteur, M. Lefevre, et à son professeur.",
    videoContexte: 'https://drive.google.com/file/d/18YRhTetHDxQu5raeNDO0IiuIMEm4-sTc/view',
    documents: [
      { numero: 1, titre: "Suite du dialogue entre Maxime et le directeur d'agence, M. Lefevre", images: [], texte: [
        { pageWeb: true },
        { intertitre: "Partie Ia : Fidélisation client — la réactivation du compte Instagram de l'entreprise", dialogue: [
          { locuteur: 'Maxime', texte: "Bonjour M. Lefevre, je suis content de reprendre mon stage ici et de pouvoir mettre en œuvre l'action de fidélisation que vous avez choisie avec mon professeur : la mise à jour du compte Instagram de l'agence. Pour ce second PowerPoint que je vais réaliser pour mon examen, je voudrais aborder plusieurs points afin de détailler la mise en œuvre de l'action. Est-ce que vous pouvez m'aider à répondre à mes questions ?" },
          { locuteur: 'M. Lefevre', texte: "Bien sûr Maxime, je suis ravi que tu sois de retour et que tu t'occupes de cette action importante pour l'agence. Dis-moi, par quoi veux-tu commencer ?" },
          { locuteur: 'Maxime', texte: "Je vais commencer par la présentation de l'action. Je vais expliquer que l'action retenue est la mise à jour et l'animation du compte Instagram de l'agence, car c'est un moyen efficace de toucher une clientèle plus jeune et de renforcer notre présence numérique. Mais j'aimerais avoir votre avis : pourquoi, selon vous, c'est une bonne idée de se concentrer sur Instagram ?" },
          { locuteur: 'M. Lefevre', texte: "C'est une très bonne question, Maxime. Instagram est devenu un outil incontournable pour les entreprises qui souhaitent toucher une clientèle dynamique et connectée. Beaucoup de nos clients potentiels, notamment les jeunes couples et les investisseurs immobiliers, utilisent Instagram pour se tenir informés des tendances du marché et des nouvelles opportunités. Nous avons un potentiel inexploité sur cette plateforme, et mettre à jour notre compte nous permettra de moderniser notre image tout en nous rapprochant de cette cible plus jeune et active." },
          { locuteur: 'Maxime', texte: "Très bien, je vais l'indiquer dans ma présentation. Ensuite, il faut que je parle des objectifs de l'action. Je pensais mentionner la volonté de renforcer l'image de l'agence, mais aussi de garder le contact avec nos clients, notamment en les tenant informés des nouveaux biens ou des actualités immobilières. Vous en pensez quoi ?" },
          { locuteur: 'M. Lefevre', texte: "Exactement ! Ces deux objectifs sont essentiels. Instagram nous permettra de garder un lien constant avec nos clients, même lorsqu'ils ne sont pas directement en recherche d'un bien. De plus, cette plateforme peut augmenter notre visibilité et attirer une nouvelle clientèle, ce qui est important pour la croissance de l'agence. Pour l'image, cela nous aidera à moderniser notre approche et à être perçus comme une agence à la fois locale et connectée aux nouvelles tendances numériques." },
          { locuteur: 'Maxime', texte: "Parfait. Je vais aussi parler des outils nécessaires à la réalisation de l'action. Dans ce cas, l'outil principal sera les réseaux sociaux, particulièrement Instagram, bien sûr. Je vais devoir prendre en charge la création de contenu, la planification des publications et interagir avec les abonnés. Est-ce qu'il y a des contraintes auxquelles je devrais faire attention ?" },
          { locuteur: 'M. Lefevre', texte: "Oui, bien sûr. Les principales contraintes seront les délais. Je pense que tu pourras y consacrer environ 5 heures par semaine pour préparer le contenu, planifier les publications, et répondre aux messages ou commentaires. Il te faudra aussi une bonne collaboration avec Virginie, pour t'aider à obtenir les photos et informations nécessaires. Quant au budget, il ne devrait pas être un problème, car nous n'avons pas besoin de dépenses supplémentaires si ce n'est du temps et de l'effort." },
        ], audioLien: 'https://drive.google.com/file/d/1Xp8B3hf4S5M4GL0mGG5g3heHJvKPIXKB/view' },
        { intertitre: 'Partie Ib : la réactivation du compte Instagram (suite)', dialogue: [
          { locuteur: 'Maxime', texte: "D'accord, j'en prends note. Ensuite, il faudra que je décrive les étapes de l'action. Selon vous, quelles sont les étapes clés pour réussir la mise à jour du compte Instagram ?" },
          { locuteur: 'M. Lefevre', texte: "Le processus peut être découpé en plusieurs étapes : Audit du compte existant : j'ai vérifié ce qui est déjà en ligne et je me suis assuré que les informations sont à jour. Création d'un calendrier éditorial : j'ai planifié les types de contenu à publier (biens à vendre, témoignages clients, actualités du marché, etc.). Création et publication du contenu : j'ai réalisé des photos et vidéos attractives pour montrer les biens, les services de l'agence, ou des éléments qui valorisent notre expertise locale. Interaction avec les abonnés : j'ai répondu aux commentaires, messages directs, et créé une relation plus personnalisée avec nos abonnés. Analyse des résultats : j'ai fait une évaluation de l'impact des publications en termes de vues, likes, interactions et nouveaux abonnés." },
          { locuteur: 'Maxime', texte: "Super, je vais détailler ces étapes. Pour ma participation, je vais essentiellement me concentrer sur la création du calendrier et la gestion des publications. Je vais aussi participer à l'analyse des résultats après quelques semaines." },
          { locuteur: 'M. Lefevre', texte: "Très bien, ça me semble cohérent. Passons maintenant aux opportunités de vente au rebond. Dans le cadre de l'animation d'Instagram, je vois plusieurs occasions où nous pourrions proposer des services supplémentaires, comme des visites privées ou des conseils en investissement. Par exemple, lorsqu'un client s'intéresse à un bien, tu pourrais lui proposer des visites virtuelles ou un suivi personnalisé par email. Une autre situation pourrait être de proposer un service de gestion locative à un investisseur intéressé par un bien pour le mettre en location." },
          { locuteur: 'Maxime', texte: "Oui, ce sont de très bonnes idées. Je vais inclure ces opportunités dans ma présentation. Ensuite, je dois parler de l'enrichissement du SIC (Système d'Information Client). Comment puis-je enrichir le SIC avec l'action Instagram ?" },
          { locuteur: 'M. Lefevre', texte: "Tu peux enrichir le SIC en ajoutant des informations sur les interactions que nous avons avec les clients via Instagram. Par exemple, lorsqu'un client nous contacte par message ou s'abonne à notre page, tu peux l'ajouter au CRM, en notant ses préférences (type de bien recherché, zone géographique, etc.). Cela nous permettra de mieux personnaliser les futurs échanges et de relancer les clients de manière plus ciblée." },
        ], audioLien: 'https://drive.google.com/file/d/1tIDcfQwswTDLLEV_-0jLUJRja9bdV-VJ/view' },
        { intertitre: "Partie II : L'évaluation et le bilan de l'action", paragraphes: ["Deux semaines après la mise en place de la mise à jour du compte Instagram de l'agence Orpi Guy Môquet, Maxime, stagiaire, fait le point avec M. Lefevre sur les résultats de l'action de fidélisation. Ils discutent des premiers retours obtenus, des indicateurs quantitatifs et qualitatifs, et des ajustements à envisager pour améliorer l'efficacité de l'action."], dialogue: [
          { locuteur: 'Maxime', texte: "D'accord, pour l'évaluation de l'action, je vais me baser sur des indicateurs quantitatifs, comme les vues, les likes, le nombre de nouveaux abonnés et l'impact sur les visites en agence. Pour les indicateurs qualitatifs, j'analyserai les commentaires des clients et leur satisfaction." },
          { locuteur: 'M. Lefevre', texte: "Parfait. C'est important de comparer ces résultats avec ceux d'avant. Et pour les retours des clients, prends bien note de ce qu'ils ont aimé et ce qu'on pourrait améliorer." },
          { locuteur: 'Maxime', texte: "Oui, je me suis déjà penché sur ces indicateurs. En termes quantitatifs, je peux déjà te donner quelques chiffres. En ce qui concerne les likes et vues : nos derniers posts ont généré environ 20% de vues en plus par rapport à avant la mise à jour du compte. Par exemple, la publication sur l'appartement récemment rénové a eu 350 vues et 50 likes, contre 100 vues et 15 likes en moyenne avant l'action. Pour ce qui est des nouveaux abonnés : nous avons gagné 10% de nouveaux abonnés en seulement deux semaines, ce qui est un bon début. Enfin, pour les visites en agence : concernant les visites physiques, 5 clients sont venus après avoir vu un post sur Instagram, et plusieurs ont pris contact pour des renseignements supplémentaires, dont 3 ont réservé une visite pour un appartement en particulier." },
          { locuteur: 'M. Lefevre', texte: "C'est un bon début ! Et les retours des clients ?" },
          { locuteur: 'Maxime', texte: "Les commentaires sont globalement positifs : ils apprécient les photos et descriptions détaillées. Cependant, il y a eu quelques commentaires négatifs sur le peu des posts publiés et certains clients qui déplorent une trop longue attente pour avoir une réponse." },
          { locuteur: 'M. Lefevre', texte: "D'accord, la réactivité est essentielle. Pour améliorer ça, il faut publier plus souvent et répondre plus vite aux messages." },
          { locuteur: 'Maxime', texte: "Je propose de publier 3 à 4 fois par semaine et de répondre plus rapidement aux commentaires. Aussi, les stories Instagram pourraient être un bon moyen de maintenir l'engagement en temps réel." },
          { locuteur: 'M. Lefevre', texte: "Très bien, ça semble une bonne stratégie. Et pour ton bilan de l'action, tu vas souligner quoi ?" },
          { locuteur: 'Maxime', texte: "Je vais présenter les points positifs, comme l'augmentation des interactions, la meilleure visibilité de l'agence et les premiers retours positifs des clients. Toutefois, je vais aussi souligner les aspects à améliorer, comme le manque de réactivité dans certains posts et les quelques commentaires négatifs sur certains biens. Pour ces aspects négatifs, je proposerai de publier 3 à 4 fois par semaine. Aussi, les stories Instagram pourraient être un bon moyen de maintenir l'engagement en temps réel. Il faudrait également répondre plus rapidement aux commentaires et aussi peut-être faire plus attention à la diversité des biens présentés (par exemple, plus de photos d'intérieur pour les appartements plus petits, pas seulement les biens hauts de gamme)." },
          { locuteur: 'M. Lefevre', texte: "Exactement, chaque retour est une opportunité d'amélioration. Tu fais du bon travail, Maxime." },
          { locuteur: 'Maxime', texte: "Merci, M. Lefevre ! Je vais finaliser mon Powerpoint et vous le montrer dès que j'aurai fini pour qu'il soit parfait pour mon oral." },
        ], audioLien: 'https://drive.google.com/file/d/1U9u1Wi7EmkA5t98lMF7uZe3F2VbvN8pk/view' },
      ] },
      { numero: 2, titre: "Quelques exemples de cibles visées par une action ainsi que l'objectif", images: [], texte: [
        { pageWeb: true },
        { intertitre: 'Définition de la cible', paragraphes: ["Cela désigne les prospects ou clients potentiels que l'entreprise cherche à atteindre, en fonction de critères particuliers (démographiques, lieux d'habitation, comportements d'achat, etc.). Un ciblage précis permet d'augmenter les chances de transformer les prospects en clients. Cela aide à concentrer les actions sur les segments les plus pertinents."] },
        { intertitre: '1. Secteur Immobilier', paragraphes: ['Cible : Jeunes couples à la recherche de leur première maison'] },
        { puces: ['Objectif : Fidéliser ces clients en leur offrant des conseils personnalisés et des visites de biens correspondant à leurs besoins.', 'Proposer des alertes sur les nouveaux biens qui correspondent à leurs critères.'] },
        { paragraphes: ['Cible : Investisseurs immobiliers'] },
        { puces: ['Objectif : Offrir des services de conseil en investissement immobilier et des offres de biens à fort potentiel.', "Fidéliser ces clients en leur proposant des opportunités exclusives avant qu'elles ne soient publiques."] },
        { intertitre: '2. Secteur Automobile', paragraphes: ['Cible : Clients ayant acheté un véhicule récemment'] },
        { puces: ["Objectif : Les inciter à revenir pour des services après-vente comme l'entretien, les réparations ou l'achat d'accessoires.", 'Proposer des offres de fidélité pour des remises sur les services ou pièces de rechange.'] },
        { paragraphes: ["Cible : Conducteurs de voitures d'occasion"] },
        { puces: ["Objectif : Proposer des garanties supplémentaires ou des services d'entretien à prix réduit pour encourager les clients à revenir.", 'Mettre en place un programme de fidélité où les clients accumulent des points à chaque service ou achat.'] },
      ] },
      { numero: 3, titre: "Quelques exemples d'outils nécessaires à la réalisation d'une action", images: [], texte: [
        { pageWeb: true },
        { intertitre: '1. Secteur Immobilier', puces: [
          "CRM (Gestion de la Relation Client) : C'est un outil qui aide à suivre ce que les clients veulent, à garder une trace de leurs préférences et à organiser des rappels pour rester en contact avec eux.",
          "Réseaux sociaux (Instagram, Facebook, LinkedIn) : Ces plateformes permettent de publier des annonces de biens, des avis de clients satisfaits, des informations sur le marché, et des conseils en immobilier.",
          "Emailing personnalisé : Cela consiste à envoyer des emails avec des offres ou des informations sur des biens qui correspondent aux critères de recherche des clients (comme le type de bien ou la localisation).",
          "Visites virtuelles : Outil qui permet aux clients de visiter un bien immobilier depuis chez eux, en ligne, pour les aider à mieux décider.",
        ] },
        { intertitre: '2. Secteur Automobile', puces: [
          "Programme de fidélité : Un système qui offre des points ou des réductions pour récompenser les clients qui reviennent pour des services comme l'entretien, les réparations ou l'achat d'un véhicule.",
          "SMS ou Emailing pour rappels de service : Envoi de messages pour rappeler aux clients de faire entretenir leur voiture, vérifier les garanties, ou profiter d'offres spéciales sur des accessoires.",
          "CRM automobile : Outil utilisé pour suivre l'historique des achats et des entretiens des clients, et pour planifier des rappels ou des suivis personnalisés.",
          "Offres exclusives ou réductions : Envoi d'offres spéciales ou de réductions aux clients qui ont déjà acheté une voiture, via SMS ou email.",
        ] },
        { intertitre: '3. Secteur Bancaire / Assurances', puces: [
          "Emailing et newsletters : Envoi de messages personnalisés avec des informations financières, des conseils, ou des offres sur des produits comme les prêts ou les assurances.",
          "Applications bancaires : Des applications mobiles qui permettent aux clients de gérer leurs comptes et de recevoir des alertes sur des offres spéciales ou des opportunités.",
          "Système de recommandation de produits : Logiciels qui analysent les informations des clients et leur suggèrent des produits bancaires ou d'assurance qui pourraient les intéresser.",
        ] },
      ] },
      { numero: 4, titre: "Quelques exemples de contraintes liées à la réalisation d'une action", images: [], texte: [
        { pageWeb: true },
        { intertitre: '1. Secteur Immobilier', puces: [
          "Budget limité : Organiser des événements ou créer des contenus de qualité pour les réseaux sociaux peut coûter cher.",
          "Temps de travail : Mettre à jour les informations sur les biens à vendre et créer des contenus intéressants peut prendre beaucoup de temps, ce qui peut être difficile à gérer.",
          "Outils complexes : Utiliser des logiciels comme des CRM (gestion des contacts clients) ou des outils pour les visites virtuelles demande parfois des formations et un budget supplémentaire.",
          "Beaucoup de concurrence : L'immobilier est un secteur où il y a beaucoup d'agences, et fidéliser les clients peut être difficile si d'autres agences proposent des offres plus intéressantes.",
        ] },
        { intertitre: '2. Secteur Automobile', puces: [
          "Coût des offres spéciales : Offrir des réductions ou des cadeaux pour les clients fidèles peut diminuer les profits de l'entreprise.",
          "Entretien des outils de fidélisation : Gérer des cartes de fidélité ou des applications mobiles pour les clients demande de l'argent et du temps pour maintenir le service.",
          "Besoins différents des clients : Certains clients veulent acheter une voiture neuve, d'autres ont besoin de réparations. Il est donc plus difficile de créer des offres de fidélisation qui conviennent à tout le monde.",
          "Équipe réduite : Si l'équipe commerciale est petite, elle peut avoir du mal à gérer à la fois les ventes et les actions pour fidéliser les clients, ce qui peut affecter la qualité du service.",
        ] },
        { intertitre: '3. Secteur Bancaire / Assurances', puces: [
          "Réglementation stricte : Les banques et les assurances ont des règles très strictes qui limitent certaines actions de fidélisation, comme offrir des cadeaux ou des promotions.",
          "Produits difficiles à comprendre : Les produits financiers (comptes, assurances, etc.) sont souvent compliqués pour les clients, ce qui rend difficile de personnaliser les offres de fidélisation.",
          "Protection des données : Il est très important de respecter la confidentialité et la sécurité des informations des clients, ce qui rend la gestion des données sensibles pour la fidélisation.",
          "Marché saturé : Les clients sont souvent contactés par différentes banques ou assurances, ce qui rend difficile de se démarquer et d'obtenir leur fidélité.",
        ] },
      ] },
      { numero: 5, titre: "Quelques exemples d'opportunités de vente au rebond", images: [], texte: [
        { pageWeb: true },
        { intertitre: 'Définition de la vente au rebond', paragraphes: ["Le rebond commercial est une technique qui consiste à profiter de l'appel d'un client ou de sa venue en agence ou en magasin pour lui proposer une offre commerciale additionnelle.", "Par exemple, lorsque le client contacte son banquier ou son assureur pour des informations concernant son contrat, le professionnel peut lui proposer une offre additionnelle (assurance supplémentaire, option payante, banque en ligne etc.)"] },
        { intertitre: "1. Secteur de l'immobilier", puces: [
          "Services de gestion locative : Après la vente d'un bien à un investisseur, proposer un service de gestion locative pour faciliter la gestion des propriétés.",
          "Assurance habitation : Offrir des assurances habitation lors de la vente d'un bien immobilier ou lors d'une location.",
          "Rénovation et aménagement : Proposer des services de rénovation ou de décoration intérieure après la vente d'un appartement ou d'une maison.",
          "Visites privées ou services personnalisés : Offrir des visites privées de nouveaux biens ou des conseils personnalisés pour les acheteurs potentiels.",
        ] },
        { intertitre: '2. Secteur automobile', puces: [
          "Accessoires et pièces détachées : Après la vente d'un véhicule, proposer des accessoires complémentaires (chaises auto, tapis, sièges chauffants, systèmes audio, etc.).",
          "Contrats de maintenance et garantie : Offrir des contrats de maintenance ou de prolongation de garantie pour le véhicule acheté.",
          "Assurance auto : Proposer une assurance auto lors de la vente de la voiture.",
          "Produits d'entretien automobile : Vendre des produits comme des nettoyants, des protections de carrosserie, des huiles ou des fluides.",
        ] },
        { intertitre: '3. Secteur du prêt bancaire / assurance', puces: [
          "Prêts complémentaires ou refinancement : Après avoir accordé un prêt immobilier, proposer des prêts à la consommation ou des refinancements si le client a des projets futurs.",
          "Assurances complémentaires : Proposer des assurances vie, santé ou invalidité après la souscription d'une assurance emprunteur.",
          "Cartes bancaires premium : Offrir des cartes bancaires haut de gamme, avec des avantages supplémentaires, après l'ouverture d'un compte courant.",
        ] },
      ] },
      { numero: 6, titre: "Quelques exemples d'indicateurs quantitatifs et qualitatifs pour l'évaluation de l'action", images: [], texte: [
        { pageWeb: true },
        { intertitre: 'Définition indicateurs quantitatifs', paragraphes: ["Les indicateurs quantitatifs sont des chiffres ou des données qui permettent de mesurer quelque chose de manière précise. Ces indicateurs sont souvent utilisés pour savoir combien de choses se sont produites ou pour évaluer l'ampleur d'un phénomène. Exemples : nombre de ventes, chiffre d'affaires, nombre de clients, nombre de likes sur les réseaux sociaux. Ce sont des données chiffrées qui aident à évaluer des résultats de manière quantifiable."] },
        { intertitre: 'Indicateurs quantitatifs — 1. Secteur Immobilier', puces: [
          "Nombre de nouveaux contacts (leads) : Nombre de personnes qui ont montré de l'intérêt pour des biens immobiliers après une action de fidélisation.",
          "Taux de conversion : Proportion de ces contacts qui deviennent des clients réels (qui achètent ou louent un bien).",
          "Nombre de visites sur le site internet : Nombre de fois que les clients visitent le site après avoir vu une offre ou une information sur les réseaux sociaux.",
          "Ventes réalisées : Combien de biens ont été vendus ou loués grâce à l'action de fidélisation.",
          "Nombre de clients revenant : Nombre de clients qui reviennent pour acheter ou louer à nouveau après une première expérience.",
        ] },
        { intertitre: 'Définition indicateurs qualitatifs', paragraphes: ["Les indicateurs qualitatifs sont des éléments qui permettent de mesurer la qualité de quelque chose, mais pas avec des chiffres. Ils permettent de savoir comment les gens réagissent ou ce qu'ils pensent, mais sans donner un nombre exact. Ces indicateurs mesurent les opinions, les ressentis ou les impressions, et non des quantités précises."] },
        { intertitre: 'Indicateurs qualitatifs — 1. Secteur Immobilier', puces: [
          "Satisfaction des clients : Comment les clients se sentent après avoir utilisé les services de l'agence.",
          "Commentaires sur les réseaux sociaux : Avis laissés par les clients sur des plateformes comme Instagram ou Facebook : sont-ils positifs ou négatifs ?",
          "Qualité des témoignages : Les témoignages de clients sur les biens ou services sont-ils enthousiastes et détaillés ?",
        ] },
        { intertitre: "Indicateurs négatifs et propositions d'amélioration — Secteur Immobilier", paragraphes: ['Indicateur Quantitatif Négatif : Baisse du nombre de vues sur les publications Instagram.', "Axe d'Amélioration : Publier plus régulièrement ; utiliser des hashtags populaires pour toucher une audience plus large ; améliorer la qualité visuelle des photos et vidéos ; collaborer avec des influenceurs ou des partenaires locaux pour étendre la portée.", 'Indicateur Qualitatif Négatif : Commentaires négatifs sur les biens en vente.', "Axe d'Amélioration : Répondre rapidement aux commentaires pour clarifier les informations ; fournir plus de détails sur les biens (vidéos de visite, description détaillée) ; ajuster les prix si nécessaire ou proposer des alternatives qui correspondent mieux aux attentes des clients."] },
      ] },
    ],
    competence: {
      groupe: 'Épreuve E33 — Bloc 3',
      intitule: "Mettre en œuvre et évaluer une action de FDRC",
      detail: "3.2.1 Sélectionner et mettre en œuvre les outils de FDRC ; 3.2.2 Concourir à la préparation et l'organisation d'opérations de FDRC ; 3.2.5 Effectuer des ventes au rebond ; 3.3.1 Enrichir et actualiser le SIC ; 3.3.2 Mesurer et analyser les résultats ; 3.3.4 Proposer des axes d'amélioration.",
    },
    objectifs: [
      "Présenter la mise en œuvre d'une action de fidélisation (cible, objectifs, outils, contraintes, étapes).",
      "Identifier les opportunités de vente au rebond et enrichir le SIC.",
      "Évaluer l'action à l'aide d'indicateurs quantitatifs et qualitatifs et proposer des améliorations.",
    ],
    activites: [
      {
        titre: "Activité 1 — La mise en œuvre de l'action de fidélisation : mise à jour du compte Instagram",
        questions: [
          { numero: 1, consigne: "Notez le nom de l'action qui a été retenue après le premier oral de Maxime.", ressources: 'Lire le document 1, compléter la diapositive 1. [3.2.1]', annexeId: 'ppt' },
          { numero: 2, consigne: "Indiquez quelle est la cible et les objectifs de l'action.", ressources: 'Lire les documents 1 et 2, compléter la diapositive 2. [3.2.1]', annexeId: 'ppt' },
          { numero: 3, consigne: "Listez les outils nécessaires à la réalisation de l'action ainsi que les contraintes auxquelles Maxime devra faire face.", ressources: 'Lire les documents 1, 3 et 4, compléter la diapositive 3. [3.2.1]', annexeId: 'ppt' },
          { numero: 4, consigne: "Indiquez les principales étapes de la mise en place de l'action ainsi que le rôle de Maxime à chaque étape.", ressources: 'Lire le document 1, compléter la diapositive 4. [3.2.2]', annexeId: 'ppt' },
          { numero: 5, consigne: "Énumérez les opportunités de vente au rebond qui ont été saisies par Maxime lors de l'action de fidélisation.", ressources: 'Lire les documents 1 et 5, compléter la diapositive 5. [3.2.5]', annexeId: 'ppt' },
          { numero: 6, consigne: "Expliquez comment Maxime a enrichi la S.I.C. suite à l'action.", ressources: 'Lire le document 1, compléter la diapositive 6. [3.3.1]', annexeId: 'ppt' },
        ],
      },
      {
        titre: "Activité 2 — L'évaluation et le bilan de l'action",
        contexte: "Deux semaines après la mise à jour du compte Instagram de l'agence Orpi Guy Môquet, Maxime, stagiaire, fait le bilan avec M. Lefevre sur les résultats de l'action de fidélisation. Ils analysent les premiers retours, les indicateurs de performance et envisagent des ajustements pour optimiser l'efficacité de l'action.",
        questions: [
          { numero: 7, consigne: "Évaluez l'action de fidélisation mise en place par Maxime en analysant les indicateurs quantitatifs et qualitatifs.", ressources: 'Lire les documents 1 et 6, compléter la diapositive 7. [3.3.2]', annexeId: 'ppt' },
          { numero: 8, consigne: "Pour chaque indicateur qualitatif négatif, présentez les suggestions d'amélioration proposées par Maxime.", ressources: 'Lire les documents 1 et 6, compléter la diapositive 8. [3.3.2 / 3.3.4]', annexeId: 'ppt' },
        ],
      },
    ],
    annexes: [
      { type: 'powerpoint', id: 'ppt', titre: 'Annexe — Le PowerPoint de Maxime', diapos: [
        { titre: 'Page de garde', garde: true, mentions: ['BACCALAUREAT PROFESSIONNEL METIERS DU COMMERCE ET DE LA VENTE option B', 'EPREUVE E33', "Situation d\u2019évaluation n°2", "Présentation de la mise en œuvre de l\u2019action de FDRC retenue", 'Lycée Maria Deraismes'] },
        { titre: 'Diapositive 1', intitule: "Le nom de l'action retenue", competence: '3.2.1 : Sélectionner et mettre en œuvre les outils de FDRC de l\u2019entreprise', champs: [{ cle: 'action', lignes: 2 }] },
        { titre: 'Diapositive 2', intitule: "La cible et les objectifs de l'action", competence: '3.2.1 : Sélectionner et mettre en œuvre les outils de FDRC de l\u2019entreprise', champs: [{ cle: 'cible', libelle: 'La cible', lignes: 2 }, { cle: 'objectifs', libelle: 'Les objectifs', lignes: 3 }] },
        { titre: 'Diapositive 3', intitule: 'Les outils et les contraintes', competence: '3.2.1 : Sélectionner et mettre en œuvre les outils de FDRC de l\u2019entreprise', champs: [{ cle: 'outils', libelle: 'Les outils', lignes: 2 }, { cle: 'contraintes', libelle: 'Les contraintes', lignes: 3 }] },
        { titre: 'Diapositive 4', intitule: "Les étapes de l'action et la participation de Maxime", competence: '3.2.2 : Concourir à la préparation et à l\u2019organisation d\u2019évènements ou d\u2019opérations de FDRC', champs: [
          { cle: 'etape1', libelle: '1ère étape + ma participation', lignes: 2 }, { cle: 'etape2', libelle: '2ème étape + ma participation', lignes: 2 }, { cle: 'etape3', libelle: '3ème étape + ma participation', lignes: 2 }, { cle: 'etape4', libelle: '4ème étape + ma participation', lignes: 2 }, { cle: 'etape5', libelle: '5ème étape + ma participation', lignes: 2 },
        ] },
        { titre: 'Diapositive 5', intitule: 'Les opportunités de vente au rebond', competence: '3.2.5 : Effectuer des ventes au rebond', champs: [{ cle: 'situation1', libelle: 'Situation 1 + opportunité', lignes: 2 }, { cle: 'situation2', libelle: 'Situation 2 + opportunité', lignes: 2 }] },
        { titre: 'Diapositive 6', intitule: "L'enrichissement du S.I.C.", competence: '3.3.1 : Enrichir et actualiser le S.I.C.', champs: [{ cle: 'sic', lignes: 3 }] },
        { titre: 'Diapositive 7', intitule: "L'évaluation de l'action", competence: '3.3.2 : Mesurer et analyser les résultats', champs: [{ cle: 'quanti', libelle: 'Indicateurs quantitatifs', lignes: 4 }, { cle: 'quali', libelle: 'Indicateurs qualitatifs', lignes: 3 }] },
        { titre: 'Diapositive 8', intitule: "Le bilan de l'action", competence: '3.3.2 : Mesurer et analyser les résultats / 3.3.4 : Proposer des axes d\u2019amélioration', champs: [{ cle: 'negatifs', libelle: 'Indicateurs négatifs', lignes: 3 }, { cle: 'suggestions', libelle: "Suggestions d'amélioration", lignes: 4 }] },
      ] },
    ],
  },
  corrige: {
    questions: [
      { intitule: "Nom de l'action (diapositive 1).", documents: ['Document 1'], bareme: 2, reponse: "La mise à jour et l'animation du compte Instagram de l'agence." },
      {
        intitule: 'Cible et objectifs (diapositive 2).', documents: ['Documents 1 et 2'], bareme: 4, reponse: 'Voir tableau.',
        tableau: { colonnes: ['', ''], lignes: [
          ['Cible', "Une clientèle plus jeune et connectée : jeunes couples et investisseurs immobiliers qui utilisent Instagram."],
          ['Objectifs', "Renforcer l'image de l'agence et la moderniser ; garder le contact avec les clients (nouveaux biens, actualités) ; augmenter la visibilité et attirer une nouvelle clientèle."],
        ] },
      },
      {
        intitule: 'Outils et contraintes (diapositive 3).', documents: ['Documents 1, 3 et 3 bis'], bareme: 4, reponse: 'Voir tableau.',
        tableau: { colonnes: ['', ''], lignes: [
          ['Outils', 'Les réseaux sociaux, particulièrement Instagram (création de contenu, planification des publications, interaction avec les abonnés).'],
          ['Contraintes', "Les délais (environ 5 heures par semaine) ; la collaboration nécessaire avec Virginie pour les photos et informations ; le budget (pas de dépenses supplémentaires, surtout du temps et de l'effort)."],
        ] },
      },
      {
        intitule: 'Étapes et participation (diapositive 4).', documents: ['Document 1'], bareme: 5, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Étape', 'Participation de Maxime'], lignes: [
          ['1. Audit du compte existant', 'Vérifier ce qui est en ligne et la mise à jour des informations'],
          ['2. Création d\u2019un calendrier éditorial', 'Création du calendrier (rôle principal de Maxime)'],
          ['3. Création et publication du contenu', 'Gestion des publications (rôle principal de Maxime)'],
          ['4. Interaction avec les abonnés', 'Répondre aux commentaires et messages'],
          ['5. Analyse des résultats', "Participer à l'analyse après quelques semaines"],
        ] },
      },
      {
        intitule: 'Ventes au rebond (diapositive 5).', documents: ['Documents 1 et 4'], bareme: 4, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Situation', 'Opportunité'], lignes: [
          ["Un client s'intéresse à un bien", 'Proposer des visites virtuelles ou un suivi personnalisé par email'],
          ['Un investisseur intéressé par un bien', 'Proposer un service de gestion locative pour le mettre en location'],
        ] },
      },
      { intitule: 'Enrichissement du SIC (diapositive 6).', documents: ['Document 1'], bareme: 3, reponse: "Ajouter au CRM les informations sur les interactions Instagram : lorsqu'un client contacte l'agence par message ou s'abonne, l'ajouter au CRM en notant ses préférences (type de bien recherché, zone géographique), pour personnaliser les futurs échanges et relancer de manière ciblée." },
      {
        intitule: "Évaluation de l'action (diapositive 7).", documents: ['Documents 1, 5 et 5 bis'], bareme: 6, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Indicateurs quantitatifs', 'Indicateurs qualitatifs'], lignes: [
          ['+20% de vues ; post appartement rénové : 350 vues / 50 likes (contre 100 vues / 15 likes avant)', 'Commentaires globalement positifs : clients apprécient les photos et descriptions détaillées'],
          ['+10% de nouveaux abonnés en 2 semaines', 'Commentaires négatifs : trop peu de posts publiés'],
          ['5 clients venus en agence après un post, 3 ont réservé une visite', "Clients déplorent une trop longue attente pour avoir une réponse"],
        ] },
      },
      {
        intitule: "Bilan et suggestions d'amélioration (diapositive 8).", documents: ['Documents 1 et 6'], bareme: 6, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Indicateur négatif', "Suggestion d'amélioration"], lignes: [
          ['Trop peu de posts publiés', 'Publier 3 à 4 fois par semaine ; utiliser les stories Instagram pour maintenir l\u2019engagement en temps réel'],
          ['Trop longue attente pour une réponse', 'Répondre plus rapidement aux commentaires et messages'],
          ['Manque de diversité des biens présentés', 'Plus de photos d\u2019intérieur pour les appartements plus petits, pas seulement les biens hauts de gamme'],
        ] },
      },
    ],
  },
  synthese: {
    titre: "La mise en œuvre et l'évaluation de l'action",
    proposition: ["Le nom de l'action", 'La cible', 'Les indicateurs quantitatifs', 'Les indicateurs qualitatifs'],
    racine: {
      id: 'racine', texte: "L'action de fidélisation",
      enfants: [
        { id: 'mise', texte: "La mise en œuvre de l'action", enfants: [
          { id: 'nom', texte: null, reponse: "Le nom de l'action" },
          { id: 'cible', texte: null, reponse: 'La cible' },
        ] },
        { id: 'eval', texte: "L'évaluation de l'action", enfants: [
          { id: 'quanti', texte: 'Les indicateurs quantitatifs' },
          { id: 'quali', texte: 'Les indicateurs qualitatifs' },
        ] },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: "Mettre en œuvre l'action (3.2.1 / 3.2.2)",
        indicateurs: [
          { niveau: 'novice', description: "Je ne sais pas décrire une action de fidélisation." },
          { niveau: 'debrouille', description: "Je nomme l'action et sa cible." },
          { niveau: 'averti', description: "Je décris outils, contraintes et étapes." },
          { niveau: 'expert', description: "Je présente toute la mise en œuvre et mon rôle." },
        ],
      },
      {
        id: 'c2', intitule: "Vente au rebond et SIC (3.2.5 / 3.3.1)",
        indicateurs: [
          { niveau: 'novice', description: "Je ne connais pas la vente au rebond." },
          { niveau: 'debrouille', description: "Je cite une opportunité de vente au rebond." },
          { niveau: 'averti', description: "J'identifie les ventes au rebond et j'enrichis le SIC." },
          { niveau: 'expert', description: "Je relie ventes au rebond et SIC à la fidélisation." },
        ],
      },
      {
        id: 'c3', intitule: "Évaluer l'action (3.3.2 / 3.3.4)",
        indicateurs: [
          { niveau: 'novice', description: "Je ne distingue pas quantitatif et qualitatif." },
          { niveau: 'debrouille', description: "Je cite un indicateur." },
          { niveau: 'averti', description: "J'analyse indicateurs quantitatifs et qualitatifs." },
          { niveau: 'expert', description: "Je propose des axes d'amélioration justifiés." },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Action de fidélisation', definition: "Action visant à conserver et renforcer la relation avec les clients (ici : réactivation d'Instagram)." },
      { terme: 'Cible', definition: "Prospects ou clients que l'entreprise cherche à atteindre selon des critères." },
      { terme: 'Calendrier éditorial', definition: 'Planification des types de contenu à publier et de leur date.' },
      { terme: 'Vente au rebond', definition: "Profiter de l'appel ou de la venue d'un client pour proposer une offre additionnelle." },
      { terme: 'SIC', definition: "Système d'Information Client : ensemble des informations sur les clients (souvent dans un CRM)." },
      { terme: 'CRM', definition: 'Outil de gestion de la relation client (préférences, historique, relances).' },
      { terme: 'Indicateur quantitatif', definition: 'Donnée chiffrée mesurant un résultat (vues, likes, abonnés, ventes).' },
      { terme: 'Indicateur qualitatif', definition: 'Élément mesurant la qualité, le ressenti (satisfaction, commentaires).' },
      { terme: 'Taux de conversion', definition: 'Proportion de contacts qui deviennent des clients réels.' },
      { terme: 'Story Instagram', definition: 'Publication éphémère permettant de maintenir l\u2019engagement en temps réel.' },
    ],
    flashcards: [
      { recto: "Nom de l'action retenue ?", verso: "La mise à jour et l'animation du compte Instagram." },
      { recto: 'Cible de l\u2019action ?', verso: 'Une clientèle jeune et connectée (jeunes couples, investisseurs).' },
      { recto: 'Outil principal ?', verso: 'Les réseaux sociaux, particulièrement Instagram.' },
      { recto: 'Temps consacré par semaine ?', verso: 'Environ 5 heures par semaine.' },
      { recto: "Que signifie SIC ?", verso: "Système d'Information Client." },
      { recto: 'Définition de la vente au rebond ?', verso: "Profiter de l'appel ou de la venue d'un client pour proposer une offre additionnelle." },
      { recto: 'Évolution des vues ?', verso: '+20% de vues (350 vues / 50 likes sur le post de l\u2019appartement rénové).' },
      { recto: 'Évolution des abonnés ?', verso: '+10% de nouveaux abonnés en 2 semaines.' },
      { recto: 'Indicateur qualitatif négatif ?', verso: 'Trop peu de posts et trop longue attente pour une réponse.' },
      { recto: 'Suggestion d\u2019amélioration ?', verso: 'Publier 3 à 4 fois par semaine et utiliser les stories.' },
    ],
    quiz: [
      { type: 'unique', question: "Nom de l'action retenue ?", options: ["Mise à jour du compte Instagram", 'Création d\u2019un site web', 'Campagne SMS', 'Programme de parrainage'], bonne: 0 },
      { type: 'unique', question: 'Outil principal de l\u2019action ?', options: ['Instagram', 'Le téléphone', 'Le courrier', "L'affichage"], bonne: 0 },
      { type: 'unique', question: 'Temps hebdomadaire consacré ?', options: ['Environ 5 heures', '1 heure', '20 heures', '40 heures'], bonne: 0 },
      { type: 'unique', question: "Que signifie SIC ?", options: ["Système d'Information Client", 'Service Interne Commercial', 'Suivi Important Client', 'Stock Initial Client'], bonne: 0 },
      { type: 'unique', question: 'Évolution des vues ?', options: ['+20%', '-20%', '+200%', 'Aucune'], bonne: 0 },
      { type: 'unique', question: 'Nouveaux abonnés en 2 semaines ?', options: ['+10%', '+50%', '-10%', '+1%'], bonne: 0 },
      { type: 'unique', question: 'La vente au rebond consiste à...', options: ['Proposer une offre additionnelle', 'Baisser les prix', 'Licencier', 'Fermer l\u2019agence'], bonne: 0 },
      { type: 'unique', question: 'Un indicateur quantitatif ?', options: ['Nombre de likes', 'La satisfaction', "L'image de marque", 'Les commentaires'], bonne: 0 },
      { type: 'unique', question: 'Un indicateur qualitatif ?', options: ['La satisfaction client', 'Le nombre de vues', 'Le nombre d\u2019abonnés', 'Le taux de conversion'], bonne: 0 },
      { type: 'unique', question: 'Suggestion d\u2019amélioration ?', options: ['Publier 3 à 4 fois par semaine', 'Arrêter Instagram', 'Publier 1 fois par an', 'Ne rien changer'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque élément dans la bonne catégorie.',
      etiquettes: ['Indicateur quantitatif', 'Indicateur qualitatif', "Suggestion d'amélioration"],
      zones: [
        { libelle: '+20% de vues', etiquetteIndex: 0 },
        { libelle: '+10% d\u2019abonnés', etiquetteIndex: 0 },
        { libelle: 'Clients satisfaits des photos', etiquetteIndex: 1 },
        { libelle: 'Attente trop longue pour une réponse', etiquetteIndex: 1 },
        { libelle: 'Publier 3 à 4 fois par semaine', etiquetteIndex: 2 },
        { libelle: 'Utiliser les stories Instagram', etiquetteIndex: 2 },
      ],
    },
  },
}

const ORPI_M4: ContenuMission = {
  travaux: {
    consigne:
      "Préparez l'oral de présentation de la mise en œuvre de l'action de FDRC retenue : rédigez votre présentation orale à partir de la 2ème partie du PowerPoint de Maxime, enregistrez-vous, puis créez une animation de présentation.",
    contexte:
      "Afin de vous préparer à votre propre oral qui aura lieu dans quelques semaines dans votre établissement scolaire, votre professeur d'économie-gestion vous demande de vous exercer sur la 2ème partie du PowerPoint de Maxime.",
    documents: [
      { numero: 1, titre: "Mode opératoire : Rédaction du 2ème oral pour une présentation devant un jury", images: [], texte: [
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
      intitule: "Présenter à l'oral la mise en œuvre de l'action de FDRC",
      detail: "3.3.2 Mesurer et analyser les résultats ; 3.3.4 Proposer des axes d'amélioration : préparer et présenter à l'oral devant un jury la mise en œuvre et le bilan de l'action.",
    },
    objectifs: [
      "Rédiger une présentation orale structurée de la 2ème partie du PowerPoint (mise en œuvre et bilan).",
      "S'entraîner à l'oral et s'enregistrer (10 minutes maximum).",
      "Créer une animation vidéo de présentation de la situation 2.",
    ],
    activites: [
      {
        titre: "Activité 1 — Préparer l'oral de la situation 2",
        contexte: "Afin de vous préparer à votre propre oral qui aura lieu dans quelques semaines dans votre établissement scolaire, votre professeur d'économie-gestion vous demande de vous exercer sur la 2ème partie du PowerPoint de Maxime.",
        questions: [
          { numero: 1, consigne: 'Mettez par écrit tous les éléments du PowerPoint (2ème partie).', ressources: "Lire le document 1, compléter l'annexe 1. [3.3.2]", annexeId: 'annexe1' },
          { numero: 2, consigne: 'Enregistrez votre oral sur votre téléphone mobile pendant 10 minutes maximum.', ressources: 'Étape pratique (enregistrement audio).', annexeId: undefined },
          { numero: 3, consigne: "Téléchargez votre oral de votre portable à votre session d'ordinateur.", ressources: 'Étape pratique (transfert du fichier).', annexeId: undefined },
        ],
      },
      {
        titre: 'Activité 2 — Créer une animation de présentation de la situation 2',
        questions: [
          { numero: 4, consigne: 'Suivez les instructions pour créer votre animation de présentation.', ressources: "Consulter le document 2, suivre l'annexe 2. [3.3.4]", annexeId: 'annexe2' },
        ],
      },
    ],
    annexes: [
      { type: 'redactionoral', id: 'annexe1', titre: "Annexe 1 — Rédaction de l'oral", boutonLien: 'https://drive.google.com/file/d/1l7d5Up3OaCAiAthhBkriiRFxuNS6AFFB/view', boutonLibelle: 'Ouvrir le document support', sections: [
        { cle: 'introduction', libelle: 'Introduction — Se présenter et annoncer le plan', aide: 'Nom et prénom, classe, lycée, sujet (la mise en œuvre de l\u2019action de FDRC), puis annonce des parties.', lignes: 4 },
        { cle: 'developpement', libelle: 'Développement — Présenter les diapositives (2ème partie)', aide: "Reprenez les diapositives de la mise en œuvre et de l'évaluation : nom de l'action, cible et objectifs, outils et contraintes, étapes, ventes au rebond, enrichissement du SIC, indicateurs quantitatifs et qualitatifs, bilan et suggestions.", lignes: 12 },
        { cle: 'conclusion', libelle: 'Conclusion — Résumer et conclure', aide: 'Récapitulez les points principaux (résultats et axes d\u2019amélioration) et remerciez le jury.', lignes: 3 },
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
      { intitule: "Rédaction de l'oral (annexe 1).", documents: ['Document 1'], bareme: 10, reponse: "L'oral reprend la trame du document 1 appliquée à la 2ème partie du PowerPoint. Introduction : « Bonjour, je m'appelle [Nom], je suis en terminale Bac Pro MCV B au lycée Maria Deraismes. Aujourd'hui je vais vous présenter la mise en œuvre et le bilan d'une action de FDRC menée chez Orpi Guy Môquet. Ma présentation se divise en deux parties : d'abord la mise en œuvre de l'action, ensuite son évaluation et son bilan. » Développement : présentation des diapositives (nom de l'action : mise à jour du compte Instagram ; cible et objectifs ; outils et contraintes ; étapes et participation ; ventes au rebond ; enrichissement du SIC ; indicateurs quantitatifs +20% de vues et +10% d'abonnés ; indicateurs qualitatifs ; bilan et suggestions : publier 3 à 4 fois par semaine, utiliser les stories, répondre plus vite). Conclusion : « Pour conclure, l'action a augmenté la visibilité et les interactions de l'agence ; des axes d'amélioration restent à mettre en place. Je vous remercie de m'avoir écouté. Je suis prêt(e) à répondre à vos questions. »" },
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
      { recto: 'Sur quoi porte le 2ème oral ?', verso: 'La 2ème partie du PowerPoint : mise en œuvre et bilan de l\u2019action.' },
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
      { type: 'unique', question: 'Sur quoi porte le 2ème oral ?', options: ['La mise en œuvre et le bilan', 'La page de garde', 'Le coût', 'Les concurrents'], bonne: 0 },
      { type: 'unique', question: 'Combien de parties dans un oral structuré ?', options: ['3', '2', '5', '1'], bonne: 0 },
      { type: 'unique', question: 'Quel logiciel pour l\u2019animation ?', options: ['Adobe Express', 'Excel', 'Photoshop', 'Word'], bonne: 0 },
      { type: 'unique', question: 'Type de personnage autorisé ?', options: ['Humain (Professionnels)', 'Animal', 'Monstre', 'Légume'], bonne: 0 },
      { type: 'unique', question: 'Où déposer la capsule ?', options: ['DIGIPAD (MES VIDEOS)', 'Par mail', 'Sur Instagram', 'Nulle part'], bonne: 0 },
      { type: 'unique', question: 'Un conseil de rédaction ?', options: ['Clarté et concision', 'Phrases très longues', 'Beaucoup de répétitions', 'Parler vite'], bonne: 0 },
      { type: 'unique', question: 'Comment vérifier son oral ?', options: ['Lire à voix haute', 'Ne pas relire', "L'écrire une seule fois", 'Demander à un ami'], bonne: 0 },
      { type: 'unique', question: 'Phrase de fin recommandée ?', options: ["« Je vous remercie de m'avoir écouté… »", '« Au revoir »', '« C\u2019est fini »', '« Bonne journée »'], bonne: 0 },
      { type: 'unique', question: 'Le développement sert à...', options: ['Expliquer les diapositives', 'Se présenter', 'Conclure', 'Remercier'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: "Classez chaque élément dans la bonne étape de l'oral.",
      etiquettes: ['Introduction', 'Développement', 'Conclusion'],
      zones: [
        { libelle: 'Se présenter (nom, classe)', etiquetteIndex: 0 },
        { libelle: 'Annoncer le plan', etiquetteIndex: 0 },
        { libelle: 'Présenter les indicateurs', etiquetteIndex: 1 },
        { libelle: 'Expliquer le bilan', etiquetteIndex: 1 },
        { libelle: 'Résumer les points clés', etiquetteIndex: 2 },
        { libelle: 'Remercier le jury', etiquetteIndex: 2 },
      ],
    },
  },
}

const FREE_M1: ContenuMission = {
  travaux: {
    consigne:
      "Présentez l'unité commerciale et sa clientèle : réalisez la fiche signalétique de Free, identifiez la clientèle, listez les services et les biens, les concurrents directs et indirects, puis reproduisez l'organigramme.",
    contexte:
      "Vous êtes en stage dans l'entreprise Free, située à Paris et spécialisée dans la téléphonie. Vous êtes là depuis quelques jours et votre tuteur souhaite que vous connaissiez mieux l'entreprise en étudiant ses principales caractéristiques. Votre tuteur vous demande de réaliser la « fiche signalétique » de celle-ci.",
    documents: [
      { numero: 1, titre: 'La concurrence', images: [], texte: [
        { pageWeb: true },
        { tableau: { colonnes: ['', 'Concurrents directs', 'Concurrents indirects'], lignes: [
          ['Définitions', "Un concurrent direct est une entreprise ou une organisation qui propose un produit ou un service similaire ou comparable à celui d'une autre entreprise. Elles ont la même activité principale.", 'Un concurrent indirect est une entreprise ou une organisation qui propose un produit ou un service différent, mais susceptible de répondre au même besoin du consommateur.'],
          ['Exemples : Un client qui veut aller à Toulouse il peut le faire avec la compagnie Air France', "Ce client peut aussi voyager avec des concurrents directs d'Air France : Easy Jet, Ryan Air", "Ce client peut aussi voyager avec des concurrents indirects d'Air France : Co-voiturage, Train SNCF"],
        ] } },
      ] },
      { numero: 2, titre: "Le site internet de Free — Les offres", images: [], texte: [
        { pageWeb: true },
        { intertitre: 'LES OFFRES FREE SANS ENGAGEMENT', paragraphes: ['Forfait à 2 €/mois (0€/mois pour les abonnés Freebox) : Internet en 4G+ 50Mo ; Appels 2H, SMS, MMS illimités ; à l\u2019étranger : Internet 50Mo, Appels 2H (décomptés du forfait) et SMS, MMS illimités depuis Europe & DOM.'] },
        { paragraphes: ['SÉRIE FREE 80GO — 12,99 €/mois (pendant 1 an, puis Forfait Free à 19.99€) : Internet en 4G+ 80 Go ; Appels SMS, MMS illimités ; à l\u2019étranger : Internet 10Go, Appels, SMS, MMS illimités depuis Europe & DOM.'] },
        { paragraphes: ['19,99 €/mois (15,99€/mois pour les abonnés Freebox, 9,99€/mois pour les abonnés Freebox Pop) — Abonnés Freebox : 4G+ illimitée en France : Internet en 4G+ 100 Go ; Appels SMS, MMS illimités ; à l\u2019étranger : Internet 25Go depuis + 65 destinations, Appels, SMS, MMS illimités depuis Europe, DOM, USA, Canada, Australie, Afrique du Sud, Israël, Nouvelle-Zélande. Free Ligue 1 Uber Eats inclus.'] },
        { intertitre: 'Les offres Freebox', paragraphes: ["Déjà plus de 2 millions d'abonnés à la Fibre Free. Testez votre éligibilité Fibre.", 'Offre à 29,99€/mois (pendant 1 an puis 39,99€/mois, sans engagement) : Internet Fibre jusqu\u2019à 5Gbit/s partagés, 700 Mbit/s ; Wi-Fi : Répéteur Wi-Fi inclus ; TV/Replay inclus, Netflix/Prime Video/CANAL+ disponibles en option ; Free Ligue 1 Uber Eats inclus.', 'Offre à 39,99€/mois (pendant 1 an puis 49,99€/mois, sans engagement) : Internet Fibre Techno 10G EPON ; Wi-Fi : Répéteur Wi-Fi inclus ; TV/Replay inclus, contenus inclus : Netflix, Amazon Prime, TV by CANAL ; Free Ligue 1 Uber Eats inclus. Player Pop inclus ou Player Free Devialet 480€.'] },
      ] },
      { numero: 3, titre: "La fiche entreprise de Free", images: [], texte: [
        { pageWeb: true },
        { intertitre: 'Nous contacter', paragraphes: ['Par téléphone, appelez-nous au 3244 pour être mis en relation avec un conseiller. 7j/7 de 7 heures à minuit. Gratuit depuis une ligne Free ou prix d\u2019un appel normal.'] },
        { puces: ['Sur Facebook : FreeFrance', 'Sur Twitter : Free', 'Sur Twitter, pour un compte spécifique à Freebox : @Freebox', 'Sur Twitter, pour ne rien manquer sur le Mobile : @freemobile', 'Sur Youtube, pour suivre des tutoriels conçus par nos équipes : Free', 'Retrouvez également Free sur Instagram, avec les fameux "Easter Eggs" sur la Freebox Delta et notre assistant vocal "Ok Freebox" : ok_freebox'] },
        { tableau: { colonnes: ['Information', 'Valeur'], lignes: [
          ['Statut RCS', 'Immatriculée au RCS le 18-02-1999'],
          ['Statut INSEE', "Enregistrée à l'INSEE le 01-02-1999"],
          ['Dénomination', 'FREE'],
          ['Adresse', '8 RUE DE LA VILLE L EVEQUE 75008 PARIS'],
          ['SIREN', '421 938 861'],
          ['SIRET (siege)', '42193886100034'],
          ['Activité (Code NAF ou APE)', 'Télécommunications filaires (6110Z)'],
          ['Forme juridique', 'Société par actions simplifiée'],
          ['Date immatriculation RCS', '18-02-1999'],
          ['Date de dernière mise à jour', '01-10-2020'],
          ['Effectif moyen', '213'],
          ['Capital social', '3 441 812,00 €'],
        ] } },
      ] },
      { numero: 4, titre: "Les opérateurs concurrents (guides)", images: [], texte: [
        { pageWeb: true },
        { puces: [
          "B&YOU : à l'origine, B&YOU devait venir concurrencer Free au niveau des offres sans engagement. Bouygues Telecom propose ainsi des forfaits subventionnés Sensation et des offres sans engagement B&YOU.",
          "Syma Mobile : l'un des nombreux opérateurs de réseau mobile virtuel de France (MVNO).",
          "NRJ Mobile : marque qui appartient au MVNA Euro-Information Telecom, profite des accords négociés pour proposer ses services (réseaux SFR, Orange ou Bouygues Telecom).",
          "La Poste Mobile : l'un des premiers opérateurs de réseau mobile virtuel, détenu à 49% par le groupe SFR.",
          "Prixtel : opérateur de réseau mobile virtuel sans engagement, basé dans le sud de la France (réseaux Orange ou SFR).",
          "Coriolis Telecom : opérateur de réseau mobile virtuel (réseaux SFR et Orange).",
          "Auchan Telecom : opérateur de réseau mobile virtuel lancé par le groupe Auchan (propriété d'Euro-Information Telecom ; réseaux Orange, SFR et Bouygues Telecom).",
          "Cdiscount Mobile : opérateur de réseau mobile virtuel du e-commerce (propriété d'EI Telecom).",
          "Réglo Mobile : opérateur du groupe Leclerc, sans engagement, tarifs très bas.",
          "Crédit Mutuel Mobile : opérateur de réseau mobile virtuel appartenant au groupe Euro-Information Telecom.",
          "CIC Mobile : deuxième opérateur du groupe Crédit Mutuel - CIC (réseaux Orange, SFR et Bouygues Telecom).",
          "Budget Mobile : MVNO proposant des forfaits basiques.",
          "Orange mobile : premier opérateur de téléphonie mobile de France (ex-France Télécom).",
          "SFR : la Société Française du Radiotéléphone, second opérateur de France (opérateur au carré rouge).",
          "Bouygues Telecom : filiale du groupe Bouygues, spécialisé dans les télécommunications.",
        ] },
      ] },
      { numero: 5, titre: "L'organigramme de l'équipe dirigeante d'Iliad / Free", images: [], texte: [
        { pageWeb: true },
        { paragraphes: ["Iliad a procédé à un important réaménagement à sa tête, aussi bien au sein du Conseil d'Administration que de l'équipe dirigeante. On note 5 nouvelles nominations, dont la plus importante, celle de Thomas Reynaud en tant que Directeur Général, en remplacement de Maxime Lombardini, qui prend la tête du Conseil d'Administration. On retrouve notamment Rani Assaf en tant que directeur technique, Angélique Gérard directrice de la relation abonné, ou encore Xavier Niel directeur délégué à la stratégie."] },
        { tableau: { colonnes: ['Fonction (anglais)', 'Personne', 'Fonction (français)'], lignes: [
          ['CSO', 'Xavier Niel', 'Directeur délégué à la stratégie'],
          ['CEO', 'Thomas Reynaud', 'Directeur Général'],
          ['CTO', 'Rani Assaf', 'Directeur Général délégué (technique)'],
          ['Head of IT', 'Antoine Levavasseur', 'Directeur Général délégué'],
          ['Purchasing Director', 'Patrick Fouquerière', 'Directeur des relations fournisseurs'],
          ['Head of Customer Care', 'Angélique Gérard', 'Directrice de la relation abonnés'],
          ['CFO', 'Nicolas Jaeger', 'Directeur Financier'],
          ['Marketing Director', 'Camille Perrin', 'Directrice Marketing'],
          ['Deputy Corporate Secretary', 'Shahrzad Sharvan', 'Secrétaire Générale'],
          ['HR Director', 'Aude Mercier', 'Directrice des Ressources Humaines'],
        ] } },
      ] },
    ],
    competence: {
      groupe: 'Groupe de compétences 4B',
      intitule: "Présenter l'unité commerciale et sa clientèle",
      detail: "Identifier l'entreprise (fiche signalétique), sa clientèle, ses biens et services, ses concurrents et son organigramme.",
    },
    objectifs: [
      "Réaliser la fiche signalétique de l'entreprise.",
      'Identifier la clientèle, les biens et les services.',
      'Distinguer concurrents directs et indirects, et lire un organigramme.',
    ],
    activites: [
      {
        titre: "Activité 1 — Identification de l'entreprise",
        questions: [
          { numero: 1, consigne: "Consultez le site internet de l'entreprise puis complétez l'identité de l'entreprise.", ressources: "Consulter le document 3, compléter l'annexe 1. [C.4B.1]", annexeId: 'annexe1' },
          { numero: 2, consigne: 'Indiquez selon vous le type de clientèle visée par Free.', ressources: "Compléter l'annexe 2. [C.4B.1]", annexeId: 'annexe2' },
        ],
      },
      {
        titre: "Activité 2 — Les biens et les services de l'entreprise",
        questions: [
          { numero: 3, consigne: "Listez les différents services proposés par l'entreprise.", ressources: "Consulter le document 2, compléter l'annexe 3. [C.4B.1]", annexeId: 'annexe3' },
          { numero: 4, consigne: "Énumérez les 2 biens que l'on retrouve chez Free.", ressources: "Consulter le document 2, compléter l'annexe 4. [C.4B.1]", annexeId: 'annexe4' },
        ],
      },
      {
        titre: 'Activité 3 — Les concurrents',
        questions: [
          { numero: 5, consigne: "Listez les différents concurrents de l'entreprise.", ressources: "Lire le document 1 et le document 4, compléter l'annexe 5. [C.4B.1]", annexeId: 'annexe5' },
        ],
      },
      {
        titre: "Activité 4 — L'organigramme",
        questions: [
          { numero: 6, consigne: "Reproduisez l'organigramme de Free en plaçant chaque personne et sa fonction (en français).", ressources: "Consulter le document 5, compléter l'annexe 6. [C.4B.1]", annexeId: 'annexe6' },
        ],
      },
    ],
    annexes: [
      { type: 'fichesignaletique', id: 'annexe1', titre: "Annexe 1 — Identité de l'entreprise", champs: [
        { cle: 'secteur', libelle: "Secteur d'activité" }, { cle: 'creation', libelle: 'Date de création ou immatriculation RCS' }, { cle: 'denomination', libelle: 'Dénomination' }, { cle: 'ca', libelle: "Chiffre d'affaires" }, { cle: 'adresse', libelle: 'Adresse', lignes: 2 }, { cle: 'forme', libelle: 'Forme juridique' }, { cle: 'nationalite', libelle: 'Nationalité' }, { cle: 'reseaux', libelle: 'Réseaux sociaux', lignes: 4 }, { cle: 'serviceclient', libelle: 'Numéro service client' },
      ] },
      { type: 'texte', id: 'annexe2', titre: 'Annexe 2 — La clientèle', lignes: 2 },
      { type: 'grilletarifaire', id: 'annexe3', titre: 'Annexe 3 — Les services', offres: ['2€', '12,99€', '19,99€', '29,99€', '39,99€'], nbLignes: 3 },
      { type: 'grille', id: 'annexe4', titre: 'Annexe 4 — Les biens', colonnes: ['Les biens', ''], nbLignes: 2 },
      { type: 'grille', id: 'annexe5', titre: 'Annexe 5 — Les concurrents directs et indirects', colonnes: ['Les concurrents directs', 'Les concurrents indirects'], nbLignes: 1 },
      { type: 'organigrammearemplir', id: 'annexe6', titre: 'Annexe 6 — Organigramme de Free', noms: ['Xavier Niel', 'Thomas Reynaud', 'Rani Assaf', 'Antoine Levavasseur', 'Patrick Fouquerière', 'Angélique Gérard', 'Nicolas Jaeger', 'Camille Perrin', 'Shahrzad Sharvan', 'Aude Mercier'], fonctions: ['Directeur délégué à la stratégie', 'Directeur Général', 'Directeur Général délégué', 'Directeur des relations fournisseurs', 'Directrice de la relation abonnés', 'Directeur Financier', 'Directrice Marketing', 'Secrétaire Générale', 'Directrice des Ressources Humaines'], tete: {
        cle: 'dg', enfants: [
          { cle: 'cto' }, { cle: 'it' }, { cle: 'achats' }, { cle: 'care' }, { cle: 'cfo' }, { cle: 'mkt' }, { cle: 'secretaire' }, { cle: 'rh' },
        ],
      } },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: "Identité de l'entreprise (annexe 1).", documents: ['Document 3'], bareme: 9, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Champ', 'Réponse'], lignes: [
          ["Secteur d'activité", 'Télécommunications filaires'],
          ['Date de création / immatriculation RCS', '18.02.1999'],
          ['Dénomination', 'FREE'],
          ["Chiffre d'affaires", '2 907 500 000'],
          ['Adresse', "8 rue de la Ville l'Évêque, 75008 PARIS"],
          ['Forme juridique', 'Société par actions simplifiée'],
          ['Nationalité', 'Française'],
          ['Réseaux sociaux', 'Facebook : FreeFrance ; Twitter : @freebox ou @freemobile ; Youtube : Free ; Instagram : ok_freebox'],
          ['Numéro service client', '3244'],
        ] },
      },
      { intitule: 'La clientèle (annexe 2).', documents: ['Annexe 2'], bareme: 1, reponse: 'Ce sont des particuliers car les produits proposés sont faits pour les particuliers (forfait téléphonique et Freebox).' },
      {
        intitule: 'Les services (annexe 3).', documents: ['Document 2'], bareme: 15, reponse: 'Voir tableau.',
        tableau: { colonnes: ['2€', '12,99€', '19,99€', '29,99€', '39,99€'], lignes: [
          ['Internet en 4G+ 50 Mo', 'Internet en 4G+ 80 Go', 'Internet en 4G+ 100 Go', 'Internet Fibre jusqu\u2019à 5Gbit/s', 'Internet Fibre techno 10G Epon'],
          ['Appels 2h SMS, MMS illimité', 'Appels 2h SMS, MMS illimité', 'Appels 2h SMS, MMS illimité', 'Wifi Répéteur Wifi inclus', 'Wifi Répéteur Wifi inclus'],
          ['A l\u2019étranger 50 Mo', 'A l\u2019étranger Internet 10 Go', 'A l\u2019étranger Internet 25 Go', 'TV/Replay inclus, Netflix/Prime Video/Canal+ en option', 'TV/Replay inclus, Netflix/Prime Video/Canal+ en option'],
        ] },
      },
      {
        intitule: 'Les biens (annexe 4).', documents: ['Document 2'], bareme: 2, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Les biens', ''], lignes: [['Freebox', 'Mobile']] },
      },
      {
        intitule: 'Les concurrents (annexe 5).', documents: ['Documents 1 et 4'], bareme: 15, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Les concurrents directs', 'Les concurrents indirects'], lignes: [
          ['Orange ; SFR ; Bouygues', 'B&YOU ; Syma Mobile ; NRJ Mobile ; La Poste Mobile ; Prixtel ; Coriolis Telecom ; Auchan Telecom ; Cdiscount Mobile ; Réglo Mobile ; Crédit Mutuel Mobile ; CIC Mobile ; Budget Mobile'],
        ] },
      },
      {
        intitule: "Organigramme (annexe 6).", documents: ['Document 5'], bareme: 10, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Personne', 'Fonction'], lignes: [
          ['Xavier Niel', 'Directeur délégué à la stratégie'],
          ['Thomas Reynaud', 'Directeur Général'],
          ['Rani Assaf', 'Directeur Général délégué'],
          ['Antoine Levavasseur', 'Directeur Général délégué'],
          ['Patrick Fouquerière', 'Directeur des relations fournisseurs'],
          ['Angélique Gérard', 'Directrice de la relation abonnés'],
          ['Nicolas Jaeger', 'Directeur Financier'],
          ['Camille Perrin', 'Directrice Marketing'],
          ['Shahrzad Sharvan', 'Secrétaire Générale'],
          ['Aude Mercier', 'Directrice des Ressources Humaines'],
        ] },
      },
    ],
  },
  synthese: {
    titre: "La présentation de l'unité commerciale",
    proposition: ['La fiche signalétique', 'La clientèle', 'Concurrents directs', 'Concurrents indirects'],
    racine: {
      id: 'racine', texte: "L'unité commerciale",
      enfants: [
        { id: 'ident', texte: "L'identification", enfants: [
          { id: 'fiche', texte: null, reponse: 'La fiche signalétique' },
          { id: 'clients', texte: null, reponse: 'La clientèle' },
        ] },
        { id: 'concur', texte: 'Les concurrents', enfants: [
          { id: 'directs', texte: null, reponse: 'Concurrents directs' },
          { id: 'indirects', texte: null, reponse: 'Concurrents indirects' },
        ] },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: "Identifier l'entreprise",
        indicateurs: [
          { niveau: 'novice', description: "Je ne sais pas faire une fiche signalétique." },
          { niveau: 'debrouille', description: 'Je relève quelques informations.' },
          { niveau: 'averti', description: "Je complète la fiche signalétique." },
          { niveau: 'expert', description: "Je complète la fiche et identifie la clientèle." },
        ],
      },
      {
        id: 'c2', intitule: 'Distinguer biens et services',
        indicateurs: [
          { niveau: 'novice', description: 'Je confonds biens et services.' },
          { niveau: 'debrouille', description: 'Je cite un service.' },
          { niveau: 'averti', description: 'Je liste les services et les biens.' },
          { niveau: 'expert', description: 'Je classe correctement biens et services.' },
        ],
      },
      {
        id: 'c3', intitule: 'Concurrents et organigramme',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne distingue pas direct et indirect.' },
          { niveau: 'debrouille', description: 'Je cite un concurrent.' },
          { niveau: 'averti', description: 'Je classe les concurrents.' },
          { niveau: 'expert', description: "Je classe les concurrents et complète l'organigramme." },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Fiche signalétique', definition: "Document qui résume l'identité d'une entreprise (dénomination, forme juridique, adresse…)." },
      { terme: 'SIREN', definition: "Numéro à 9 chiffres identifiant une entreprise." },
      { terme: 'SIRET', definition: "Numéro à 14 chiffres identifiant un établissement." },
      { terme: 'Code NAF / APE', definition: "Code de l'activité principale exercée par l'entreprise." },
      { terme: 'Forme juridique', definition: "Statut légal de l'entreprise (SAS, SARL…)." },
      { terme: 'Bien', definition: 'Produit matériel (ex : Freebox, Mobile).' },
      { terme: 'Service', definition: 'Prestation immatérielle (ex : forfait internet, TV).' },
      { terme: 'Concurrent direct', definition: 'Entreprise proposant un produit similaire, même activité principale.' },
      { terme: 'Concurrent indirect', definition: 'Entreprise proposant un produit différent répondant au même besoin.' },
      { terme: 'Organigramme', definition: "Schéma représentant la structure hiérarchique d'une entreprise." },
    ],
    flashcards: [
      { recto: 'Forme juridique de Free ?', verso: 'Société par actions simplifiée (SAS).' },
      { recto: "Date d'immatriculation RCS ?", verso: '18.02.1999.' },
      { recto: 'Adresse du siège ?', verso: "8 rue de la Ville l'Évêque, 75008 PARIS." },
      { recto: 'Numéro du service client ?', verso: '3244.' },
      { recto: "Secteur d'activité ?", verso: 'Télécommunications filaires (6110Z).' },
      { recto: 'Les 2 biens de Free ?', verso: 'La Freebox et le Mobile.' },
      { recto: 'Concurrents directs ?', verso: 'Orange, SFR, Bouygues.' },
      { recto: 'Qui est le Directeur Général ?', verso: 'Thomas Reynaud.' },
      { recto: 'Type de clientèle visée ?', verso: 'Les particuliers.' },
      { recto: 'Capital social ?', verso: '3 441 812,00 €.' },
    ],
    quiz: [
      { type: 'unique', question: 'Forme juridique de Free ?', options: ['SAS', 'SARL', 'SA', 'EURL'], bonne: 0 },
      { type: 'unique', question: "Date d'immatriculation RCS ?", options: ['18.02.1999', '01.01.2000', '18.02.2009', '08.12.1999'], bonne: 0 },
      { type: 'unique', question: 'Numéro service client ?', options: ['3244', '3900', '1014', '3000'], bonne: 0 },
      { type: 'unique', question: "Secteur d'activité ?", options: ['Télécommunications filaires', 'Banque', 'Transport', 'Énergie'], bonne: 0 },
      { type: 'unique', question: 'Les 2 biens de Free ?', options: ['Freebox et Mobile', 'TV et Radio', 'Internet et Eau', 'Voiture et Vélo'], bonne: 0 },
      { type: 'unique', question: 'Un concurrent direct ?', options: ['Orange', 'La SNCF', 'Air France', 'EDF'], bonne: 0 },
      { type: 'unique', question: 'Un concurrent indirect ?', options: ['NRJ Mobile', 'Orange', 'SFR', 'Bouygues'], bonne: 0 },
      { type: 'unique', question: 'Qui est le Directeur Général ?', options: ['Thomas Reynaud', 'Xavier Niel', 'Rani Assaf', 'Nicolas Jaeger'], bonne: 0 },
      { type: 'unique', question: 'Type de clientèle visée ?', options: ['Les particuliers', 'Les collectivités', 'Les grandes entreprises', "L'État"], bonne: 0 },
      { type: 'unique', question: 'Capital social ?', options: ['3 441 812,00 €', '1 000 000 €', '421 938 €', '213 €'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque élément dans la bonne catégorie.',
      etiquettes: ['Bien', 'Service', 'Concurrent direct'],
      zones: [
        { libelle: 'La Freebox', etiquetteIndex: 0 },
        { libelle: 'Le Mobile', etiquetteIndex: 0 },
        { libelle: 'Forfait internet 4G+', etiquetteIndex: 1 },
        { libelle: 'TV/Replay', etiquetteIndex: 1 },
        { libelle: 'Orange', etiquetteIndex: 2 },
        { libelle: 'SFR', etiquetteIndex: 2 },
      ],
    },
  },
}

const DIALOGUE_M2 = [
  { numero: '1', protagoniste: 'Free Helper', texte: 'Bonjour madame !' },
  { numero: '2', protagoniste: 'Cliente', texte: "Bonjour, monsieur c'est bien le service client Free ?" },
  { numero: '3', protagoniste: 'Free Helper', texte: 'Oui, oui !' },
  { numero: '4', protagoniste: 'Cliente', texte: "Je suis Madame Bréssou. Je vous appelle parce que j'ai un souci en ce moment avec internet…" },
  { numero: '5', protagoniste: 'Free Helper', texte: '… C\u2019est quoi le problème ?' },
  { numero: '6', protagoniste: 'Cliente', texte: "Justement j'y viens… J'ai l'impression qu'internet chez moi n'est pas du stable, quand…" },
  { numero: '7', protagoniste: 'Free Helper', texte: 'Ca veut dire quoi « n\u2019est pas stable » ?' },
  { numero: '8', protagoniste: 'Cliente', texte: "J'y viens aussi… Comme je vous le disais, je suis obligée de choisir entre avoir du Wifi et regarder la télé. Si j'active internet, alors la télévision ne marche plus et vice versa." },
  { numero: '9', protagoniste: 'Free Helper', texte: 'Ah bon ? C\u2019est bizarre ça !' },
  { numero: '10', protagoniste: 'Cliente', texte: "Ben oui… Du coup j'ai besoin d'internet parce que je travaille quelques fois à domicile. Mais lorsque mes enfants veulent regarder la télévision je suis obligé de faire un partage de connexion avec mon ordinateur." },
  { numero: '11', protagoniste: 'Free Helper', texte: 'En gros, on peut dire qu\u2019internet fonctionne mal ! C\u2019est ça !' },
  { numero: '12', protagoniste: 'Cliente', texte: 'Oui, on peut le reformuler comme ça.' },
  { numero: '13', protagoniste: 'Free Helper', texte: "En fait, Je n'peux rien faire à distance, donc je vais ouvrir un ticket ; c'est-à-dire que je vais demander à un technicien Free de passer chez vous. Il viendra diagnostiquer sur place les causes de la rupture et à partir de là s'il peut la réparer tout de suite il le fera." },
  { numero: '14', protagoniste: 'Cliente', texte: 'Ah bon ? Mais moi je travaille. Comment ça va se passer ?' },
  { numero: '15', protagoniste: 'Free Helper', texte: 'Et ben justement j\u2019allais vous en parler. Vous est dispo quand ?' },
  { numero: '16', protagoniste: 'Cliente', texte: 'Je ne sais pas… je dirais mercredi après-midi.' },
  { numero: '17', protagoniste: 'Free Helper', texte: 'A quelle heure ?' },
  { numero: '18', protagoniste: 'Cliente', texte: 'Peu m\u2019importe… 14h c\u2019est bien !' },
  { numero: '19', protagoniste: 'Free Helper', texte: 'Il faut bloquer un créneau de 2 heures, donc je mets 14h- 16h.' },
  { numero: '20', protagoniste: 'Cliente', texte: 'D\u2019accord c\u2019est bon pour moi.' },
  { numero: '21', protagoniste: 'Free Helper', texte: 'Pas de souci, bonne journée.' },
  { numero: '22', protagoniste: 'Cliente', texte: 'Merci M. merci à vous, bonne journée également.' },
]
const FREE_HELPER_LIGNES = DIALOGUE_M2.filter((d) => d.protagoniste === 'Free Helper')

const FREE_M2: ContenuMission = {
  travaux: {
    consigne:
      "Traitez une réclamation en réception d'appel : appliquez la méthode C.E.R.C., repérez et reformulez les interventions à améliorer, puis rédigez votre propre plan de réception d'appel.",
    contexte:
      "Cela fait une semaine que vous êtes chez Free et votre tutrice souhaite vous confronter pendant une demi-journée aux appels du service clients de l'entreprise. Elle vous rappelle que c'est un service très stratégique car vous contribuez à véhiculer une image positive de l'entreprise. Après la formation qui a eu lieu hier, votre tutrice vous demande d'analyser un appel entrant.",
    documents: [
      { numero: 1, titre: 'Les conseils de votre tutrice', images: [], texte: [
        { pageWeb: true },
        { intertitre: 'L\u2019accueil téléphonique', paragraphes: [
          "C'est une évidence, l'accueil téléphonique professionnel peut relever de l'anecdote comme de la mission la plus délicate. Qui plus est, lors de la réception d'un appel externe, l'enjeu est souvent inconnu au moment de saisir le combiné. C'est pourquoi les techniques permettant d'améliorer la qualité des appels entrants ou sortants font partie de la formation de base de certaines professions (assistant, vendeur…). L'exercice est parfois ardu, mais fort heureusement les signes non verbaux (sourire, intonation, débit…) peuvent appuyer et nuancer les propos.",
          "Comme l'accueil physique, l'accueil téléphonique en entreprise nécessite une certaine empathie. Lorsque vous appelez un correspondant, par exemple votre banquier, vous estimez qu'il est normal d'être convenablement reçu et de recevoir un message clair, professionnel et qui réponde à votre attente. Eh bien il suffit d'en faire de même lorsque c'est vous qui recevez l'appel ! »",
        ] },
      ] },
      { numero: 2, titre: 'Conversation téléphonique', images: [], texte: [
        { pageWeb: true },
        { transcription: { entete: 'Transcription en temps réel — Appel entrant 3244', echanges: DIALOGUE_M2.map((d) => ({ numero: d.numero, locuteur: d.protagoniste, texte: d.texte, entrant: d.protagoniste === 'Cliente' })) } },
      ] },
      { numero: 3, titre: 'La méthode C.E.R.C', images: [], texte: [
        { pageWeb: true },
        { intertitre: 'En réception d\u2019appel, utilisez le CERC', paragraphes: ["Lorsque vous recevez l'appel d'un client ou d'un prospect, vous appliquerez pendant l'appel, la méthode CERC."] },
        { tableau: { colonnes: ['Étape', 'Phase', 'Contenu'], lignes: [
          ['Étape 1', 'Contact', "Saluer, indiquer le nom de l'entreprise, se présenter, montrer sa disponibilité ou demander l'objet de l'appel."],
          ['Étape 2', 'Écoute', "Écouter attentivement la demande de l'interlocuteur, le questionner, reformuler si nécessaire."],
          ['Étape 3', 'Réponse', "Traiter ou répondre à la demande, proposer de rappeler ou prendre le message. S'assurer que le client est satisfait de la réponse apportée."],
          ['Étape 4', 'Conclusion', "Remercier, prendre congé et raccrocher après l'interlocuteur."],
        ] } },
      ] },
      { numero: 4, titre: "Procédure d'entretien du Free Helper", images: [], texte: [
        { pageWeb: true },
        { organigramme: { tete: {
          libelle: '1 - Je reçois un appel : j\u2019applique le contact', teinte: 'tete', enfants: [
            { libelle: '2 - Je pratique l\u2019écoute', teinte: 'bleu', enfants: [
              { libelle: '3 - Je prends en charge le problème', teinte: 'jaune', enfants: [
                { libelle: '4A - Le problème n\u2019a pas pu être traité', teinte: 'rose', enfants: [ { libelle: '5A - Je propose au client de le rappeler', teinte: 'gris', enfants: [ { libelle: '7 - Je conclue', teinte: 'vert' } ] } ] },
                { libelle: '4B - Une solution a été trouvée', teinte: 'rose', enfants: [ { libelle: '7 - Je conclue', teinte: 'vert' } ] },
              ] },
            ] },
          ],
        } } },
      ] },
      { numero: 5, titre: 'La réclamation du client', images: [], texte: [
        { pageWeb: true },
        { dialogue: [
          { locuteur: 'M. Axel Haire', texte: "Bonjour, je suis Monsieur Axel Haire et je vous appelle car je souhaite résilier mon abonnement Free car je déménage à l'étranger. Je ne sais pas comment faire." },
        ] },
      ] },
      { numero: 6, titre: 'Procédure de résiliation Freebox du Free Helper', images: [], texte: [
        { pageWeb: true },
        { procedure: {
          titre1: 'Comment résilier votre abonnement Freebox ?',
          intro: 'Afin de résilier votre abonnement Freebox (ADSL ou Fibre) :',
          etapes: [
            { icone: 'tel', titre: 'ÉTAPE 1', texte: 'Contactez le 3244 (appel inclus depuis une ligne Free).' },
            { icone: 'mail', titre: 'ÉTAPE 2', texte: "Adressez votre demande par courrier à l'adresse communiquée : Publidispatch – Free résiliation, Service résiliation, 6 rue Désir Prévost – La Grande Brèche, 91 070 Bondoufle." },
          ],
          alerte: [
            'Votre résiliation sera effective sous 10 jours à compter de la réception de ce courrier par nos services ou à la fin du mois si vous le demandez.',
            "Vous avez la possibilité d'annuler une demande de résiliation depuis votre Espace Abonné tant que celle-ci n'est pas effective.",
          ],
          titre2: 'Pensez à retourner vos équipements Freebox',
          section2: [
            'Les équipements et accessoires des box mis à votre disposition doivent nous être retournés au plus tard 15 jours suivant la prise d\u2019effet de la résiliation.',
            'Les informations relatives à la restitution (éléments à rendre, adresse, moyen de retour etc.) vous seront communiquées lors de votre appel au 3244.',
          ],
        } },
      ] },
      { numero: 7, titre: 'Coordonnées Free', images: [], texte: [
        { pageWeb: true },
        { intertitre: 'Nous contacter', paragraphes: ['Par téléphone : 3244 (service client, 7j/7 de 7 heures à minuit).'] },
        { puces: ['Adresse résiliation : Publidispatch – Free résiliation, Service résiliation, 6 rue Désir Prévost – La Grande Brèche, 91 070 Bondoufle.', 'Siège : 8 rue de la Ville l\u2019Évêque, 75008 PARIS.'] },
      ] },
    ],
    competence: {
      groupe: 'Groupe de compétences',
      intitule: "Traiter une réclamation en réception d'appel",
      detail: "Appliquer la méthode C.E.R.C., adopter une posture professionnelle au téléphone, reformuler et rédiger un plan de réception d'appel.",
    },
    objectifs: [
      'Identifier les éléments d\u2019une bonne prise de contact.',
      'Repérer les étapes de la méthode C.E.R.C. dans un dialogue.',
      'Reformuler les interventions à améliorer et rédiger une fiche d\u2019appel.',
    ],
    activites: [
      {
        titre: 'Activité 1 — La méthode C.E.R.C. en réception d\u2019appel',
        contexte: "Avant d'analyser cet appel, votre tutrice vous donne quelques conseils et vous rappelle quelques règles.",
        questions: [
          { numero: 1, consigne: "Pour chacun des éléments d'une bonne prise de contact, retrouvez les contenus qui les constituent.", ressources: "Lire le document 1, compléter l'annexe 1.", annexeId: 'annexe1' },
          { numero: 2, consigne: 'Indiquez les numéros dans le dialogue qui correspondent aux différentes étapes de la méthode C.E.R.C.', ressources: "Lire les documents 2 et 3, compléter l'annexe 2.", annexeId: 'annexe2' },
          { numero: 3, consigne: "Cochez les interventions du Free Helper (conseiller relation client à distance Free) qui selon vous méritent d'être améliorées.", ressources: "Compléter l'annexe 3.", annexeId: 'annexe3' },
          { numero: 4, consigne: 'Reformulez et corrigez toutes les interventions que vous avez cochées et qui selon vous sont à améliorer.', ressources: "Observer l'annexe 3 puis compléter l'annexe 4.", annexeId: 'annexe4' },
        ],
      },
      {
        titre: 'Activité 2 — L\u2019accueil téléphonique',
        contexte: "Vous êtes maintenant prêt à recevoir votre premier appel en appliquant tous les conseils que vous a donné votre tutrice. Un client vous contacte au 3244.",
        questions: [
          { numero: 5, consigne: "Utilisez la méthode C.E.R.C. pour rédiger votre plan de réception d'appel en fonction de la réclamation du client.", ressources: "Lire les documents 3 à 6, compléter l'annexe 5.", annexeId: 'annexe5' },
        ],
      },
    ],
    annexes: [
      { type: 'grille', id: 'annexe1', titre: 'Annexe 1 — Les éléments de la prise de contact', colonnes: ["Les éléments d'une bonne prise de contact", 'Contenus'], nbLignes: 3, prerempli: [['Les signes non verbaux', ''], ["L'attitude en face-à-face ou au téléphone", ''], ['Les caractéristiques du message verbal', '']] },
      { type: 'grille', id: 'annexe2', titre: 'Annexe 2 — Les étapes correspondant à la méthode C.E.R.C.', colonnes: ['Étapes', 'La méthode C.E.R.C.'], nbLignes: 4, prerempli: [['1', ''], ['2', ''], ['3', ''], ['4', '']] },
      { type: 'cochage', id: 'annexe3', titre: 'Annexe 3 — Les interventions à améliorer', entete: 'À améliorer', lignes: FREE_HELPER_LIGNES },
      { type: 'reformulation', id: 'annexe4', titre: "Annexe 4 — Proposition de correction de l'intervention du Free Helper", nbLignes: 8 },
      { type: 'ficheappel', id: 'annexe5', titre: 'Annexe 5 — La fiche d\u2019appel C.E.R.C.', sections: [
        { cle: 'contact', libelle: 'CONTACT', aide: 'Saluer, se présenter, montrer sa disponibilité.', lignes: 2 },
        { cle: 'ecoute', libelle: 'ÉCOUTE (questionnement + reformulation)', aide: 'Questionner puis reformuler le besoin du client.', lignes: 4 },
        { cle: 'reponse', libelle: 'RÉPONSE', aide: 'Traiter la demande (ici : procédure de résiliation).', lignes: 5 },
        { cle: 'conclusion', libelle: 'CONCLUSION', aide: 'Remercier, prendre congé.', lignes: 2 },
      ] },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: 'Éléments de la prise de contact (annexe 1).', documents: ['Document 1'], bareme: 3, reponse: 'Voir tableau.',
        tableau: { colonnes: ["Les éléments d'une bonne prise de contact", 'Contenus'], lignes: [
          ['Les signes non verbaux', 'Sourire, intonation, débit…'],
          ["L'attitude en face-à-face ou au téléphone", 'Empathie'],
          ['Les caractéristiques du message verbal', 'Message clair et professionnel'],
        ] },
      },
      {
        intitule: 'Étapes de la méthode C.E.R.C. (annexe 2).', documents: ['Documents 2 et 3'], bareme: 10, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Étapes', 'Numéros dans le dialogue'], lignes: [
          ['1 — Contact', '1'],
          ['2 — Écoute', '5 – 7 – 9 – 11'],
          ['3 — Réponse', '13 – 15 – 17 – 19'],
          ['4 — Conclusion', '21'],
        ] },
      },
      {
        intitule: 'Interventions à améliorer (annexe 3).', documents: ['Document 2'], bareme: 8, reponse: 'Interventions à améliorer : 1, 5, 7, 9, 11, 15, 19, 21.',
        tableau: { colonnes: ['Numéro', 'À améliorer'], lignes: [
          ['1', 'X'], ['3', ''], ['5', 'X'], ['7', 'X'], ['9', 'X'], ['11', 'X'], ['13', ''], ['15', 'X'], ['17', ''], ['19', 'X'], ['21', 'X'],
        ] },
      },
      {
        intitule: 'Reformulations (annexe 4).', documents: ['Annexe 3'], bareme: 8, reponse: 'Voir tableau.',
        tableau: { colonnes: ["N°", 'Proposition de reformulation'], lignes: [
          ['1', '« Bonjour, [prénom] de chez Free, à votre écoute. »'],
          ['5', '« En quoi puis-je vous aider ? »'],
          ['7', '« Pourriez-vous me préciser ce que vous entendez par « n\u2019est pas stable » ? »'],
          ['9', '« Je comprends… »'],
          ['11', '« Si j\u2019ai bien compris, le wifi et la télévision fonctionnent alternativement et pas en même temps. » OU « Si j\u2019ai bien compris, vous avez un problème avec votre Wifi qui empêche un fonctionnement normal de la télévision lorsqu\u2019il est activé. C\u2019est bien cela ? »'],
          ['15', '« C\u2019est justement ce que j\u2019allais vous demander. Quelles sont vos disponibilités ? » OU « Quand seriez-vous disponible pour qu\u2019un technicien passe chez vous ? »'],
          ['19', '« Il faut bloquer un créneau de 2 heures, donc je mets 14h – 16h. Ça vous convient ? »'],
          ['21', '« Très bien ! Le technicien passera donc chez vous mercredi entre 14h et 16h. Je vous remercie et je vous souhaite une excellente journée, à bientôt. » OU « Je vous souhaite une très bonne journée. Au revoir ! »'],
        ] },
      },
      {
        intitule: 'Fiche d\u2019appel C.E.R.C. (annexe 5).', documents: ['Documents 3 à 6'], bareme: 6, reponse: 'Voir fiche.',
        tableau: { colonnes: ['Étape', 'Contenu'], lignes: [
          ['CONTACT', '« Bonjour, [Prénom] de chez Free, à votre écoute. »'],
          ['ÉCOUTE — Questionnement', '« En quoi puis-je vous aider ? » / « Dans combien de temps déménagez-vous ? »'],
          ['ÉCOUTE — Reformulation', '« Si j\u2019ai bien compris… c\u2019est bien cela ? »'],
          ['RÉPONSE', "« Pour résilier votre abonnement, vous devez : envoyer votre courrier à Publidispatch – Free résiliation, Service résiliation, 6 rue Désir Prévost – La Grande Brèche, 91 070 Bondoufle ; votre résiliation sera effective 10 jours après réception ; au plus tard 15 jours après, retourner les équipements et accessoires des box. »"],
          ['CONCLUSION', '« Je vous remercie et je vous souhaite une excellente journée, à bientôt. »'],
        ] },
      },
    ],
  },
  synthese: {
    titre: "Le traitement de la réclamation en réception d'appel",
    proposition: ['Contact', 'Écoute', 'Réponse', 'Conclusion'],
    racine: {
      id: 'racine', texte: 'La méthode C.E.R.C.',
      enfants: [
        { id: 'debut', texte: "Le début de l'appel", enfants: [
          { id: 'c', texte: null, reponse: 'Contact' },
          { id: 'e', texte: null, reponse: 'Écoute' },
        ] },
        { id: 'fin', texte: "La fin de l'appel", enfants: [
          { id: 'r', texte: null, reponse: 'Réponse' },
          { id: 'concl', texte: null, reponse: 'Conclusion' },
        ] },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: 'Adopter une posture professionnelle',
        indicateurs: [
          { niveau: 'novice', description: "Je ne connais pas les règles de l'accueil téléphonique." },
          { niveau: 'debrouille', description: 'Je cite un élément de la prise de contact.' },
          { niveau: 'averti', description: 'Je connais les signes non verbaux et l\u2019empathie.' },
          { niveau: 'expert', description: "Je sais appliquer une posture professionnelle complète." },
        ],
      },
      {
        id: 'c2', intitule: 'Appliquer la méthode C.E.R.C.',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas la méthode C.E.R.C.' },
          { niveau: 'debrouille', description: 'Je cite les 4 étapes.' },
          { niveau: 'averti', description: 'Je repère les étapes dans un dialogue.' },
          { niveau: 'expert', description: 'Je rédige une fiche d\u2019appel structurée.' },
        ],
      },
      {
        id: 'c3', intitule: 'Reformuler une intervention',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne repère pas les interventions à améliorer.' },
          { niveau: 'debrouille', description: 'Je repère une intervention à améliorer.' },
          { niveau: 'averti', description: 'Je reformule quelques interventions.' },
          { niveau: 'expert', description: 'Je reformule professionnellement toutes les interventions.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'C.E.R.C.', definition: 'Méthode de réception d\u2019appel : Contact, Écoute, Réponse, Conclusion.' },
      { terme: 'Réception d\u2019appel', definition: 'Traitement d\u2019un appel entrant (appel reçu par le conseiller).' },
      { terme: 'Free Helper', definition: 'Conseiller relation client à distance de Free.' },
      { terme: 'Signes non verbaux', definition: 'Sourire, intonation, débit qui accompagnent la parole.' },
      { terme: 'Empathie', definition: 'Capacité à se mettre à la place du client pour mieux le comprendre.' },
      { terme: 'Reformulation', definition: 'Redire avec ses mots ce que le client a exprimé pour vérifier la compréhension.' },
      { terme: 'Questionnement', definition: 'Poser des questions pour clarifier la demande du client.' },
      { terme: 'Ticket', definition: 'Demande d\u2019intervention enregistrée (ex : passage d\u2019un technicien).' },
      { terme: 'Résiliation', definition: 'Fin d\u2019un abonnement à la demande du client.' },
      { terme: 'Plan de réception d\u2019appel', definition: 'Trame structurée (fiche d\u2019appel) pour mener l\u2019entretien.' },
    ],
    flashcards: [
      { recto: 'Que signifie C.E.R.C. ?', verso: 'Contact, Écoute, Réponse, Conclusion.' },
      { recto: 'Étape 1 de la méthode ?', verso: 'Contact : saluer, nommer l\u2019entreprise, se présenter.' },
      { recto: 'Étape 4 de la méthode ?', verso: 'Conclusion : remercier, prendre congé, raccrocher après l\u2019interlocuteur.' },
      { recto: 'Qui est le Free Helper ?', verso: 'Le conseiller relation client à distance de Free.' },
      { recto: 'Les signes non verbaux ?', verso: 'Sourire, intonation, débit…' },
      { recto: 'Numéro du service client ?', verso: '3244.' },
      { recto: 'Quand la résiliation est-elle effective ?', verso: '10 jours après la réception du courrier.' },
      { recto: 'Délai de retour des équipements ?', verso: '15 jours au plus tard après la résiliation.' },
      { recto: 'Adresse de résiliation ?', verso: 'Publidispatch – Free résiliation, 6 rue Désir Prévost, 91 070 Bondoufle.' },
      { recto: 'Que faire après l\u2019écoute ?', verso: 'Reformuler pour vérifier la bonne compréhension.' },
    ],
    quiz: [
      { type: 'unique', question: 'Que signifie C.E.R.C. ?', options: ['Contact, Écoute, Réponse, Conclusion', 'Client, Échange, Réclamation, Contrat', 'Contact, Échange, Rappel, Clôture', 'Compte, Espace, Réseau, Client'], bonne: 0 },
      { type: 'unique', question: 'Étape 1 de la méthode ?', options: ['Contact', 'Écoute', 'Réponse', 'Conclusion'], bonne: 0 },
      { type: 'unique', question: 'Dernière étape de la méthode ?', options: ['Conclusion', 'Contact', 'Écoute', 'Réponse'], bonne: 0 },
      { type: 'unique', question: 'Un signe non verbal ?', options: ['Le sourire', 'Le contrat', 'Le prix', 'La facture'], bonne: 0 },
      { type: 'unique', question: 'Numéro du service client ?', options: ['3244', '3900', '1014', '3000'], bonne: 0 },
      { type: 'unique', question: 'Résiliation effective après...', options: ['10 jours', '2 jours', '30 jours', '1 an'], bonne: 0 },
      { type: 'unique', question: 'Retour des équipements sous...', options: ['15 jours', '2 jours', '6 mois', '1 an'], bonne: 0 },
      { type: 'unique', question: 'Que faut-il faire après avoir écouté ?', options: ['Reformuler', 'Raccrocher', 'Crier', 'Ignorer'], bonne: 0 },
      { type: 'unique', question: 'Qui reçoit l\u2019appel ?', options: ['Le Free Helper', 'Le client', 'Le technicien', 'Le directeur'], bonne: 0 },
      { type: 'unique', question: 'Une qualité essentielle au téléphone ?', options: ["L'empathie", "L'agressivité", "L'impatience", 'Le silence total'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque intervention dans la bonne étape de la méthode C.E.R.C.',
      etiquettes: ['Contact', 'Écoute', 'Conclusion'],
      zones: [
        { libelle: '« Bonjour, [prénom] de chez Free »', etiquetteIndex: 0 },
        { libelle: 'Se présenter et nommer l\u2019entreprise', etiquetteIndex: 0 },
        { libelle: '« En quoi puis-je vous aider ? »', etiquetteIndex: 1 },
        { libelle: 'Reformuler le besoin du client', etiquetteIndex: 1 },
        { libelle: 'Remercier le client', etiquetteIndex: 2 },
        { libelle: 'Raccrocher après l\u2019interlocuteur', etiquetteIndex: 2 },
      ],
    },
  },
}

const FREE_M3: ContenuMission = {
  travaux: {
    consigne:
      "Réalisez la fiche technique et commerciale de la Freebox Pop, identifiez les mobiles d'achat SONCASE qu'elle suscite, puis construisez les arguments pour convaincre les clients.",
    contexte:
      "Maintenant que vous maîtrisez la méthode de la réception d'appel, votre tutrice souhaite que vous proposiez aux clients le dernier né de Free : la nouvelle Freebox Pop. Mais avant d'arriver à cette étape, vous devez réaliser la fiche technique du produit afin de pouvoir répondre aux questions éventuelles.",
    documents: [
      { numero: 1, titre: "Définition des caractéristiques techniques d'un produit", images: [], texte: [
        { pageWeb: true },
        { intertitre: 'Caractéristiques techniques', paragraphes: ["Ce sont tous les renseignements relatifs au fonctionnement et à l'utilisation d'un produit."] },
        { tableau: { colonnes: ['Type', 'Exemples'], lignes: [
          ['Techniques', 'Forme, coupe'],
          ['', 'Entretien, nettoyage'],
          ['', 'Coloris'],
          ['', 'Dimension, taille, poids, performance'],
          ['', 'Description'],
          ['', 'Puissance, voltage'],
          ['', 'Matière, composition'],
          ['', 'Accessoires'],
        ] } },
      ] },
      { numero: 2, titre: "Définition des caractéristiques commerciales d'un produit", images: [], texte: [
        { pageWeb: true },
        { intertitre: 'Caractéristiques commerciales', paragraphes: ["Ce sont tous les renseignements relatifs à la vente et à l'après-vente du produit."] },
        { tableau: { colonnes: ['Type', 'Exemples'], lignes: [
          ['Commerciales', 'Prix – Qualité'],
          ['', 'Lieu de vente - Marque'],
          ['', 'Conditionnement'],
          ['', 'S.A.V. – Livraison'],
          ['', 'Installation – Garantie'],
        ] } },
      ] },
      { numero: 3, titre: "Les mobiles d'achat (SONCASE)", images: [], texte: [
        { pageWeb: true },
        { tableau: { colonnes: ['SONCASE', 'Typologie', 'Exemples'], lignes: [
          ['S', 'comme Sécurité', 'Produit solide, fiable, robuste, garantie, de qualité'],
          ['O', 'comme Orgueil', 'Produit prestigieux, de marque, qui permet de se distinguer des autres'],
          ['N', 'comme Nouveauté', 'Produit récent, à la mode, innovant, moderne'],
          ['C', 'comme Confort', 'Produit pratique, facile d\u2019utilisation, efficace'],
          ['A', 'comme Argent', 'Paiement en plusieurs fois, produit économique, en promotion'],
          ['S', 'comme Sympathie', 'Plaisir procuré par l\u2019achat, attirance pour une couleur, forme particulière'],
          ['E', 'comme Environnement', 'Produit durable, écologique'],
        ] } },
      ] },
      { numero: 4, titre: 'La Freebox Pop — pages produit', images: [], texte: [
        { pageWeb: true },
        { intertitre: 'La Fibre ultra rapide', paragraphes: ["Regardez un film ou une série, passez vos appels en visio, téléchargez vos fichiers, jouez en réseau. Tous vos usages à toute vitesse, en même temps et sans interruption. La Fibre aussi rapide c'est seulement chez Free !", 'Jusqu\u2019à 5 Gbit/s partagés en débit descendant ; jusqu\u2019à 700 Mbit/s en débit montant ; plus de 100 fois plus rapide que l\u2019ADSL.'] },
        { intertitre: 'Un Wi-Fi rapide et fiable', paragraphes: ["Avec Freebox Pop, profitez d'une connexion Wi-Fi rapide et fiable même avec un grand nombre d'appareils connectés (fonction MU-MIMO). Pour connecter vos équipements mobiles, scannez le QR Code qui s'affiche sur le Server Freebox Pop. Freebox Pop intègre le nouveau protocole de chiffrement WPA3, pour améliorer la protection de vos connexions."] },
        { intertitre: 'Répéteur Wi-Fi Pop', paragraphes: ["Le répéteur Wi-Fi Pop vous permet d'étendre la connexion Wi-Fi partout à la maison. Ses fonctions intelligentes vous permettent de profiter dans toutes les pièces de votre logement d'un Wi-Fi de qualité."] },
        { intertitre: 'Application Freebox Connect', paragraphes: ["Pilotez votre réseau internet en quelques clics. Contrôlez vos équipements en un coup d'œil. Partagez votre connexion Wi-Fi simplement. Planifiez des plages horaires d'accès au Wi-Fi. Définissez des profils familiaux."] },
        { intertitre: 'Google Play', paragraphes: ["Freebox Pop vous permet d'accéder à des tonnes d'applications sur votre TV (Netflix, Spotify, YouTube, Prime Video, Deezer…). Grâce à l'Assistant Google et la fonction Chromecast intégrés, diffusez votre contenu sur votre TV en utilisant votre voix."] },
        { intertitre: 'Pilotez votre TV simplement', paragraphes: ["La télécommande Freebox Pop intègre un raccourci vers l'interface TV Free by OQEE et vers vos applis favorites Netflix et Prime Video. Accédez directement à Netflix, Prime Video, l'interface TV Free by OQEE et l'Assistant Google."] },
        { intertitre: 'Téléphonez sans limite', paragraphes: ["L'offre Freebox Pop inclut les appels vers les mobiles en France métropolitaine, DOM et certaines destinations comme les États-Unis, la Chine, le Canada et le Cambodge ainsi que vers les fixes de plus de 110 destinations."] },
        { intertitre: 'Caractéristiques techniques (serveur)', paragraphes: [
          'Connectivité : Compatible FIBRE, ADSL2+ ou VDSL2 selon éligibilité ; Wi-Fi AC2100 MU-MIMO, Bi-band (2.4 GHz et 5 GHz) ; Norme WPA3 (protocole de chiffrement dernière génération) ; Bluetooth 5.0 Low Energy.',
          'Connectiques : 3 ports Ethernet RJ45 (1Gbits + Power, 1Gbits et 2,5Gbits) ; Connecteur RJ11 DSL ; Port SFP réservé à la fibre optique ; Port d\u2019alimentation USB Type-C, nouveau standard ; Connecteur RJ11 (ligne Fixe Freebox) ; Port USB3.',
          'Dimensions : 16,1 cm (diamètre) x 4 cm (hauteur) ; Poids : 420g.',
        ] },
      ] },
      { numero: 5, titre: 'Une offre à prix Free', images: [], texte: [
        { pageWeb: true },
        { intertitre: 'Une offre à prix Free', paragraphes: ['29,99 €/mois pendant 1 an puis 39,99€/mois. Sans engagement.'] },
        { intertitre: 'Nous contacter', paragraphes: ['En ligne (identifiez-vous avec vos identifiants Freebox) ; en boutique (proche de chez vous) ; en visio/audio (service d\u2019assistance par webcam, face to free) ; par téléphone au 3244 (7j/7 de 7 heures à minuit, gratuit depuis une ligne Free ou prix d\u2019un appel normal).'] },
      ] },
    ],
    competence: {
      groupe: 'Groupe de compétences',
      intitule: "Caractériser un produit et construire une argumentation",
      detail: "Distinguer caractéristiques techniques et commerciales, identifier les mobiles d'achat SONCASE et construire un argumentaire CAP.",
    },
    objectifs: [
      'Réaliser la fiche technique et commerciale d\u2019un produit.',
      'Identifier les mobiles d\u2019achat SONCASE suscités par un produit.',
      'Construire des arguments (caractéristique → avantage) pour convaincre.',
    ],
    activites: [
      {
        titre: 'Activité 1 — La réalisation de la fiche technique de la Freebox Pop',
        contexte: "Votre tutrice vous demande de réaliser la fiche produit de la nouvelle Freebox Pop.",
        questions: [
          { numero: 1, consigne: 'Complétez les caractéristiques techniques en consultant les pages internet Free.', ressources: "Lire le document 1 (et le document 4), compléter l'annexe 1.", annexeId: 'annexe1', boutonLien: 'https://drive.google.com/file/d/1o2WOxZIrinhZKujwzvZn11ZZLfLJ8OnH/view', boutonLibelle: 'Ouvrir la page Freebox Pop' },
          { numero: 2, consigne: 'Complétez les caractéristiques commerciales en consultant les pages internet Free.', ressources: "Lire le document 2 (et le document 5), compléter l'annexe 2.", annexeId: 'annexe2', boutonLien: 'https://drive.google.com/file/d/1LMqNdUlRYr9jNx1qMSZWfp6YhBQeORyC/view', boutonLibelle: 'Ouvrir la page offre Freebox Pop' },
        ],
      },
      {
        titre: 'Activité 2 — Les mobiles d\u2019achat',
        contexte: "Votre tutrice vous demande maintenant de repérer à l'avance les mobiles suscités par l'achat de la nouvelle Freebox chez les clients afin de pouvoir anticiper leurs motivations d'achat profondes lorsqu'ils seront au téléphone.",
        questions: [
          { numero: 3, consigne: "À partir de l'annexe 1 « caractéristiques de base » et de l'annexe 2 « prix », cochez les mobiles SONCASE qui correspondent à la Freebox Pop puis justifiez votre réponse.", ressources: "Lire le document 3, compléter l'annexe 3.", annexeId: 'annexe3' },
        ],
      },
      {
        titre: 'Activité 3 — L\u2019argumentation',
        contexte: "Désormais vous avez toutes les connaissances sur les caractéristiques de la Freebox et les mobiles d'achat qu'elle suscite, votre tutrice vous demande de construire des arguments pour convaincre les clients.",
        questions: [
          { numero: 4, consigne: "Pour chaque mobile d'achat, construisez les arguments que vous présenterez au client pour l'inciter à souscrire à la nouvelle Freebox Pop.", ressources: "Compléter l'annexe 4.", annexeId: 'annexe4' },
        ],
      },
    ],
    annexes: [
      { type: 'fichetechnique', id: 'annexe1', titre: 'Annexe 1 — Caractéristiques techniques de la Freebox Pop', sections: [
        { nom: 'Caractéristiques de base', lignes: [{ cle: 'b1' }, { cle: 'b2' }, { cle: 'b3' }, { cle: 'b4' }, { cle: 'b5' }, { cle: 'b6' }, { cle: 'b7' }] },
        { nom: 'Connectivité', lignes: [{ cle: 'cv1' }, { cle: 'cv2' }, { cle: 'cv3' }, { cle: 'cv4' }] },
        { nom: 'Connectiques', lignes: [{ cle: 'cq1' }, { cle: 'cq2' }, { cle: 'cq3' }, { cle: 'cq4' }, { cle: 'cq5' }, { cle: 'cq6' }] },
        { nom: 'Dimensions', lignes: [{ cle: 'd1' }, { cle: 'd2' }] },
      ] },
      { type: 'grille', id: 'annexe2', titre: 'Annexe 2 — Caractéristiques commerciales de la Freebox Pop', colonnes: ['Caractéristique', 'Réponse'], nbLignes: 4, prerempli: [['Contact Free', ''], ['', ''], ['', ''], ['Prix', '']] },
      { type: 'soncase', id: 'annexe3', titre: 'Annexe 3 — Les mobiles d\u2019achat', colonneCoche: 'Cochez', colonneJustif: 'Justifications', lignes: [
        { id: 'securite', libelle: 'Sécurité' }, { id: 'orgueil', libelle: 'Orgueil' }, { id: 'nouveaute', libelle: 'Nouveauté' }, { id: 'confort', libelle: 'Confort' }, { id: 'argent', libelle: 'Argent' }, { id: 'sympathie', libelle: 'Sympathie' }, { id: 'environnement', libelle: 'Environnement' },
      ] },
      { type: 'argumentaire', id: 'annexe4', titre: 'Annexe 4 — Construction des arguments à présenter au client', colonnes: ['Mobiles d\u2019achat', 'Caractéristiques', 'Avantages'], nbLignes: 5 },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: 'Caractéristiques techniques (annexe 1).', documents: ['Documents 1 et 4'], bareme: 19, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Section', 'Caractéristiques'], lignes: [
          ['Caractéristiques de base', 'La fibre ultra rapide ; un wifi rapide et fiable ; répéteur wifi Pop ; application Freebox Connect ; Google Play ; télécommande ; téléphonez sans limite'],
          ['Connectivité', 'Compatible fibre, ADSL2… ; Wi-Fi AC2100 MU-MIMO, Bi-band ; Norme WPA3 ; Bluetooth'],
          ['Connectiques', '3 ports Ethernet ; connecteur RJ11 DSL ; port SFP réservé à la fibre optique ; port d\u2019alimentation USB Type-C ; connecteur RJ11 (ligne Fixe Freebox) ; Port USB3'],
          ['Dimensions', '16,1 cm (diamètre) x 4 cm (hauteur) ; Poids : 420 g'],
        ] },
      },
      {
        intitule: 'Caractéristiques commerciales (annexe 2).', documents: ['Documents 2 et 5'], bareme: 4, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Caractéristique', 'Réponse'], lignes: [
          ['Contact Free', 'En ligne'],
          ['', 'En boutique'],
          ['', 'En visio/audio'],
          ['Prix', '29,99 € par mois'],
        ] },
      },
      {
        intitule: 'Mobiles d\u2019achat SONCASE (annexe 3).', documents: ['Document 3'], bareme: 4, reponse: 'Voir tableau.',
        tableau: { colonnes: ['SONCASE', 'Coché', 'Justification'], lignes: [
          ['Sécurité', 'X', 'Wifi fiable, intègre le nouveau protocole de chiffrement WPA3'],
          ['Orgueil', '', ''],
          ['Nouveauté', 'X', 'Freebox Connect'],
          ['Confort', 'X', 'Ultra rapide ; télécommande pour accéder facilement à Netflix, Google Assistant, Prime Video ; téléphoner sans limite'],
          ['Argent', 'X', '29,99 € pendant 1 an'],
          ['Sympathie', '', ''],
          ['Environnement', '', ''],
        ] },
      },
      {
        intitule: 'Construction des arguments (annexe 4).', documents: ['Annexes 1, 2 et 3'], bareme: 12, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Mobiles d\u2019achat', 'Caractéristiques', 'Avantages'], lignes: [
          ['Sécurité', 'Nouveau protocole de chiffrement WPA3', 'Protection des connexions'],
          ['Nouveauté', 'Freebox Connect', "Contrôler ses équipements d'un coup d'œil ; planifier des plages horaires d'accès au wifi"],
          ['Confort', 'Fibre ultra rapide (5 Gbit/s, 700 Mbit/s, +100 fois plus rapide que l\u2019ADSL) ; répéteur wifi Pop ; téléphoner sans limite ; télécommande', "Regarder un film ou une série, passer ses appels en visio, télécharger, jouer en réseau à toute vitesse ; Wifi de qualité dans toutes les pièces ; appeler dans plus de 110 pays sans surcoût ; Netflix, Google Assistant… plus besoin de plusieurs télécommandes"],
          ['Argent', '29,99 € pendant 1 an', 'Pendant un an réduction de 10 € soit une économie de 120 €'],
        ] },
      },
    ],
  },
  synthese: {
    titre: "Les caractéristiques du produit et l'argumentation",
    proposition: ['Caractéristiques techniques', 'Caractéristiques commerciales', 'Le mobile SONCASE', "L'argument"],
    racine: {
      id: 'racine', texte: 'Le produit et son argumentation',
      enfants: [
        { id: 'carac', texte: 'Les caractéristiques', enfants: [
          { id: 'tech', texte: null, reponse: 'Caractéristiques techniques' },
          { id: 'com', texte: null, reponse: 'Caractéristiques commerciales' },
        ] },
        { id: 'argu', texte: "L'argumentation", enfants: [
          { id: 'mobile', texte: null, reponse: 'Le mobile SONCASE' },
          { id: 'arg', texte: null, reponse: "L'argument" },
        ] },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: 'Caractériser un produit',
        indicateurs: [
          { niveau: 'novice', description: 'Je confonds caractéristiques techniques et commerciales.' },
          { niveau: 'debrouille', description: 'Je cite une caractéristique technique.' },
          { niveau: 'averti', description: 'Je complète la fiche technique et commerciale.' },
          { niveau: 'expert', description: 'Je réalise une fiche produit complète et structurée.' },
        ],
      },
      {
        id: 'c2', intitule: 'Identifier les mobiles SONCASE',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas la méthode SONCASE.' },
          { niveau: 'debrouille', description: 'Je cite un mobile d\u2019achat.' },
          { niveau: 'averti', description: 'Je repère les mobiles SONCASE d\u2019un produit.' },
          { niveau: 'expert', description: 'Je justifie chaque mobile à partir des caractéristiques.' },
        ],
      },
      {
        id: 'c3', intitule: 'Construire un argument',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas construire un argument.' },
          { niveau: 'debrouille', description: 'Je cite une caractéristique.' },
          { niveau: 'averti', description: 'Je relie une caractéristique à un avantage.' },
          { niveau: 'expert', description: 'Je construis un argumentaire complet par mobile.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Caractéristique technique', definition: "Renseignement relatif au fonctionnement et à l'utilisation d'un produit." },
      { terme: 'Caractéristique commerciale', definition: "Renseignement relatif à la vente et à l'après-vente du produit." },
      { terme: 'SONCASE', definition: 'Mobiles d\u2019achat : Sécurité, Orgueil, Nouveauté, Confort, Argent, Sympathie, Environnement.' },
      { terme: 'Mobile d\u2019achat', definition: 'Motivation profonde qui pousse un client à acheter.' },
      { terme: 'Argument', definition: 'Caractéristique transformée en avantage pour le client.' },
      { terme: 'Freebox Pop', definition: 'Box Free : fibre, Wi-Fi, TV, téléphonie, à 29,99 €/mois la 1ère année.' },
      { terme: 'WPA3', definition: 'Protocole de chiffrement Wi-Fi de dernière génération (sécurité).' },
      { terme: 'MU-MIMO', definition: 'Technologie Wi-Fi permettant de connecter de nombreux appareils.' },
      { terme: 'Freebox Connect', definition: 'Application de pilotage du réseau internet et du Wi-Fi.' },
      { terme: 'OQEE', definition: 'Interface TV de Free accessible via la télécommande Pop.' },
    ],
    flashcards: [
      { recto: 'Prix de la Freebox Pop la 1ère année ?', verso: '29,99 €/mois (puis 39,99 €/mois).' },
      { recto: 'Débit descendant de la fibre Pop ?', verso: 'Jusqu\u2019à 5 Gbit/s partagés.' },
      { recto: 'Que signifie SONCASE ?', verso: 'Sécurité, Orgueil, Nouveauté, Confort, Argent, Sympathie, Environnement.' },
      { recto: 'Protocole de sécurité du Wi-Fi Pop ?', verso: 'WPA3.' },
      { recto: 'Application de pilotage du réseau ?', verso: 'Freebox Connect.' },
      { recto: 'Combien de destinations pour les fixes ?', verso: 'Plus de 110 destinations.' },
      { recto: 'Dimensions du serveur Pop ?', verso: '16,1 cm de diamètre x 4 cm, 420 g.' },
      { recto: 'Mobile lié au prix réduit ?', verso: 'Argent (29,99 € pendant 1 an).' },
      { recto: 'Mobile lié à WPA3 ?', verso: 'Sécurité (protection des connexions).' },
      { recto: 'Un argument = ?', verso: 'Une caractéristique + un avantage pour le client.' },
    ],
    quiz: [
      { type: 'unique', question: 'Prix la 1ère année ?', options: ['29,99 €/mois', '39,99 €/mois', '19,99 €/mois', '9,99 €/mois'], bonne: 0 },
      { type: 'unique', question: 'Débit descendant fibre Pop ?', options: ['5 Gbit/s', '700 Mbit/s', '100 Mbit/s', '1 Gbit/s'], bonne: 0 },
      { type: 'unique', question: 'Que signifie le S de SONCASE ?', options: ['Sécurité', 'Service', 'Stock', 'Style'], bonne: 0 },
      { type: 'unique', question: 'Protocole Wi-Fi de sécurité ?', options: ['WPA3', 'HTTP', 'USB', 'RJ45'], bonne: 0 },
      { type: 'unique', question: "L'appli de pilotage du réseau ?", options: ['Freebox Connect', 'Netflix', 'Spotify', 'OQEE'], bonne: 0 },
      { type: 'unique', question: 'Combien de destinations (fixes) ?', options: ['+110', '+10', '+50', '+1000'], bonne: 0 },
      { type: 'unique', question: 'Le mobile lié au prix ?', options: ['Argent', 'Orgueil', 'Sympathie', 'Environnement'], bonne: 0 },
      { type: 'unique', question: 'Le mobile lié à WPA3 ?', options: ['Sécurité', 'Nouveauté', 'Confort', 'Argent'], bonne: 0 },
      { type: 'unique', question: "Une caractéristique commerciale ?", options: ['Le prix', 'Le poids', 'Le Wi-Fi', 'La fibre'], bonne: 0 },
      { type: 'unique', question: 'Un argument est...', options: ['Une caractéristique + un avantage', 'Un prix', 'Une marque', 'Un défaut'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque élément dans la bonne catégorie.',
      etiquettes: ['Caractéristique technique', 'Caractéristique commerciale', 'Mobile SONCASE'],
      zones: [
        { libelle: 'Wi-Fi AC2100 MU-MIMO', etiquetteIndex: 0 },
        { libelle: '3 ports Ethernet RJ45', etiquetteIndex: 0 },
        { libelle: 'Prix 29,99 €/mois', etiquetteIndex: 1 },
        { libelle: 'Sans engagement', etiquetteIndex: 1 },
        { libelle: 'Sécurité (WPA3)', etiquetteIndex: 2 },
        { libelle: 'Nouveauté (Freebox Connect)', etiquetteIndex: 2 },
      ],
    },
  },
}

const FREE_M4: ContenuMission = {
  travaux: {
    consigne:
      "Traitez une réclamation en réception d'appel puis réalisez une vente au rebond : définissez la vente au rebond, préparez votre fiche d'appel C.E.R.C., traitez la demande, proposez la Freebox Pop, annoncez le prix, réfutez l'objection et expliquez la livraison.",
    contexte:
      "Désormais, vous maîtrisez parfaitement toutes les caractéristiques et l'argumentation de la nouvelle Freebox Pop et c'est pour cela que votre tutrice vous propose d'être jusqu'à la fin de votre stage au service clients de l'entreprise. Elle souhaite non seulement que vous soyez prêt à recevoir un appel selon les règles que vous avez apprises, mais surtout que vous sachiez repérer les opportunités de faire des ventes au rebond.",
    documents: [
      { numero: 1, titre: 'Les explications de Mme Marie Vière', images: [], texte: [
        { pageWeb: true },
        { intertitre: 'Le rebond commercial (vente au rebond)', paragraphes: [
          "« Le rebond commercial ou vente au rebond consiste à profiter d'un contact généralement pris à l'initiative du client pour évoquer ou formuler une offre commerciale distincte après avoir traité sa demande initiale. Le rebond commercial peut se pratiquer en face à face ou par téléphone.",
          "La pratique du rebond commercial est notamment utilisée dans le domaine de la banque et de l'assurance. Un chargé d'accueil en agence peut par exemple pratiquer le rebond commercial auprès d'un client venu effectuer une opération courante au guichet d'accueil et proposer ainsi une solution d'épargne s'il constate un excédent de liquidités sur un compte courant.",
          "De même, un responsable d'Orange évoque que, malgré ses pertes initiales, le développement d'Orange Bank permettait de générer des externalités positives en donnant la possibilité d'effectuer des rebonds commerciaux relatifs à la téléphonie auprès des prospects venant en agences se renseigner sur l'offre bancaire. »",
        ] },
      ] },
      { numero: 2, titre: 'La vente additionnelle', images: [], texte: [
        { pageWeb: true },
        { intertitre: 'La vente additionnelle', paragraphes: [
          "« La vente additionnelle est mise en œuvre par un commercial lorsque le client qui vient acheter un produit se voit en proposer un autre pour compléter le produit principal. Il existe deux formes de vente additionnelle.",
          "La première correspond à la vente complémentaire. C'est le cas lorsque le produit proposé en plus est directement lié au produit principal acheté. Il s'agit par exemple de la vente de protéine proposée avec la vente d'un abonnement à une salle de sport, ou encore des extensions de garanties proposées par le commercial pendant la vente d'un photocopieur.",
          "La deuxième forme de vente additionnelle est la vente supplémentaire. Elle consiste simplement à profiter de la présence du client pour lui proposer un autre produit qui n'a rien à voir avec le produit principal. Un conseiller bancaire peut par exemple vendre une carte bleue Visa Premier à un client venu souscrire un livret d'épargne. »",
        ] },
      ] },
      { numero: 3, titre: "Procédure de l'entretien téléphonique", images: [], texte: [
        { pageWeb: true },
        { organigramme: { tete: {
          libelle: '1 - Je reçois un appel : j\u2019applique le contact', teinte: 'tete', enfants: [
            { libelle: '2 - Je pratique l\u2019écoute et je questionne', teinte: 'bleu', enfants: [
              { libelle: '3 - Je prends en charge le problème', teinte: 'jaune', enfants: [
                { libelle: '4A - Le problème n\u2019a pas pu être traité', teinte: 'rose', enfants: [ { libelle: '5A - Je propose au client de le rappeler', teinte: 'gris', enfants: [ { libelle: '7 - Je conclue', teinte: 'vert' } ] } ] },
                { libelle: '4B - Une solution a été trouvée', teinte: 'rose', enfants: [ { libelle: '5B - Je tente de faire une vente de rebond', teinte: 'gris', enfants: [ { libelle: '6B - J\u2019annonce le prix', teinte: 'bleu', enfants: [ { libelle: '6B - J\u2019annonce les délais de livraison', teinte: 'jaune', enfants: [ { libelle: '7 - Je conclue', teinte: 'vert' } ] } ] } ] } ] },
              ] },
            ] },
          ],
        } } },
      ] },
      { numero: 4, titre: 'La réclamation du client', images: [], texte: [
        { pageWeb: true },
        { dialogue: [
          { locuteur: 'Client', texte: "Bonjour, je vous appelle car j'ai depuis 6 ans la Freebox Révolution. J'ai eu des soucis qui ont été réglés. Je vous rappelle parce qu'aujourd'hui c'est la télécommande qui ne fonctionne pas. La veille tout marchait bien. Et là plus rien." },
        ] },
      ] },
      { numero: 5, titre: 'Les réponses du client à vos questions', images: [], texte: [
        { pageWeb: true },
        { dialogue: [
          { locuteur: 'Client', texte: '« Oui, c\u2019est la télécommande qui ne marche plus. »' },
          { locuteur: 'Client', texte: '« Je suis M. Alex Seption. »' },
          { locuteur: 'Client', texte: '« Non, non ! Dans le salon il n\u2019y a que la télévision. Rien d\u2019autre ! »' },
          { locuteur: 'Client', texte: '« Je suis au 179 rue Camille Godard – 33000 Bordeaux. »' },
          { locuteur: 'Client', texte: '« C\u2019est la première chose que j\u2019ai fait, changer les piles. »' },
          { locuteur: 'Client', texte: '« Non, je n\u2019ai pas réessayé d\u2019associer la télécommande à la Freebox Player. »' },
        ] },
      ] },
      { numero: 6, titre: 'Le traitement de la demande du client', images: [], texte: [
        { pageWeb: true },
        { intertitre: 'La procédure d\u2019échange de la télécommande Freebox', paragraphes: [
          "Lorsque malgré toutes les manipulations qu'a fait faire le Free Helper au client par téléphone, l'appareil défectueux ne fonctionne toujours pas, le Free Helper doit, sans lui poser davantage de questions, lui proposer le remplacement par l'envoi d'une télécommande neuve et sans frais.",
          "Lorsque le Free Helper aura validé le remplacement de la télécommande, il précisera au client qu'UPS s'occupera d'effectuer l'échange le plus rapidement possible. Pour cela, un e-mail de confirmation lui sera envoyé.",
          "Ensuite, il recevra un second e-mail, ainsi qu'un message sur son téléphone portable afin de l'informer de la livraison du colis. Cette livraison a lieu en général dans les 48 heures qui suivent l'e-mail. Une fois qu'il est envoyé, il pourra suivre son colis sur son Espace Client dans la rubrique « Mon abonnement ».",
          "Pour la dernière étape, un agent d'UPS viendra à son domicile pour effectuer l'échange et lui fera signer un justificatif précisant qu'il a bien reçu sa nouvelle télécommande et qu'il a bien remis celle qui est défectueuse.",
          "L'équipe Free",
        ] },
      ] },
      { numero: 7, titre: 'Le prix de la Freebox Pop', images: [], texte: [
        { pageWeb: true },
        { offrePrix: { titre: 'Une offre à prix Free.', prix: '29', cents: '€99', periode: '/mois', soustexte: ['pendant 1 an puis 39,99€/mois.', 'Sans engagement'] } },
      ] },
      { numero: 8, titre: "L'objection sur le prix de M. Seption", images: [], texte: [
        { pageWeb: true },
        { dialogue: [
          { locuteur: 'M. Seption', texte: "« Ah oui ! C'est intéressant comme offre. Effectivement, je pense à changer mais bon pour l'instant je ne suis pas pressé. Je pense que je vais réfléchir et je verrai plus tard. »" },
        ] },
      ] },
      { numero: 9, titre: 'Les techniques de réfutation du prix', images: [], texte: [
        { pageWeb: true },
        { cartesTechniques: { rappel: "Vous utiliserez l'une de ces deux techniques pour réfuter l'objection du client par rapport au prix.", cartes: [
          { icone: 'plus', titre: "La technique de l'addition", texte: "Le commercial énumère au client l'ensemble des avantages du produit, ce qui justifie son prix." },
          { icone: 'moins', titre: 'La technique de la soustraction', texte: "Le commercial montre au client ce qu'il perd s'il ne prend pas le produit." },
        ] } },
      ] },
      { numero: 10, titre: "L'offre Freebox", images: [], texte: [
        { pageWeb: true },
        { offreFlash: { badge: 'Offre valable aujourd\u2019hui uniquement', lignes: ['Frais de migration (49€) offerts', 'Frais d\u2019envoi (20€) offerts'], mention: 'soit 69€ d\u2019économie' } },
      ] },
      { numero: 11, titre: 'Les délais de livraison', images: [], texte: [
        { pageWeb: true },
        { intertitre: 'Free livre en priorité les nouveaux abonnés', paragraphes: [
          "Free indique que les nouveaux abonnés sont livrés dans les délais, mais il y a au moins 3 mois d'attente pour les migrations.",
          "Les raisons de ces délais à rallonge ? Free a indiqué que c'est le succès de cette offre qui en est la cause et assure qu'il « livre en priorité les nouveaux abonnés ». Il n'y a pas de retard pour les nouveaux abonnés Freebox Delta + Pop, mais il y en a toujours pour les Freenautes ayant demandé une migration. Pour ceux qui sont dans cette situation, il faudra donc attendre environ 3 mois selon Free avant de recevoir sa nouvelle Freebox. Tant que la migration n'est pas effective, l'ancienne Freebox fonctionne toujours.",
          "Les raisons de ces retards ne sont pas dues à un problème de stock de Player Pop puisque les envois de Freebox Pop se font dans les délais. Il s'agit visiblement d'un problème de stock de Server Freebox Delta. Free n'avait visiblement pas anticipé le succès de l'offre Freebox Delta Pop.",
        ] },
      ] },
      { numero: 12, titre: 'La procédure pour bénéficier de la Freebox Pop', images: [], texte: [
        { pageWeb: true },
        { intertitre: 'Échanger une ancienne Freebox pour la nouvelle Freebox Pop', paragraphes: [
          "Lorsqu'un client valide avec vous l'échange de sa Freebox actuelle pour la Freebox Pop, le Free Helper lui rappellera la procédure à suivre.",
          "Lorsqu'il sera informé par mail et par SMS de l'arrivée de son nouveau matériel, afin de pouvoir faire l'échange, il devra mettre dans un carton rigide les équipements qu'il a reçus :",
        ] },
        { puces: [
          'deux FreePlugs (si fournis avec la Freebox),',
          'une télécommande,',
          'un cordon d\u2019alimentation électrique (sur la FreePlug),',
          'un cordon Ethernet (jaune bien souvent),',
          'un cordon Péritel (Péritel d\u2019un côté seulement),',
          'un adaptateur téléphonique,',
          'la Freebox.',
        ] },
        { paragraphes: [
          "Il emballera le tout soigneusement dans la boîte puis il écrira en gros : « Retour Free - Upgrade ».",
          "Il déposera son carton dans le point relais où il recevra en échange son nouvel équipement.",
          "Enfin, après vérification, s'il manque un de ces équipements dans le carton, des frais pourront être facturés (Freebox : 190€ ; Sagem : 49€ ; Boîtier Freebox : 150€ ; Boîtier HD : 290€ ; 20€/accessoire).",
          "L'équipe Free",
        ] },
      ] },
      { numero: 13, titre: "Conclusion d'appel spécifique à Free", images: [], texte: [
        { pageWeb: true },
        { mailLecture: { de: 'chefserviceclient.free.fr', a: 'listing.relationclient@free.fr', objet: 'Conclure un appel', corps: [
          "À tous les Free Helper,",
          "Je vous rappelle, comme il a été dit en formation la semaine dernière, que la conclusion de l'appel est un moment important car, comme la prise de contact, elle reflète l'image de Free. Il faut donc la soigner en respectant la procédure établie. Vous êtes donc invité à :",
          "- Confirmer avec le client que vous avez bien répondu à toutes ses interrogations ;",
          "- L'informer que juste après l'appel, il recevra un questionnaire et que vous lui demandez de bien vouloir le remplir ;",
          "- Le remercier au nom de Free ;",
          "- Le saluer chaleureusement ;",
          "- Raccrocher après lui.",
          "Je compte sur toute l'équipe pour appliquer cette procédure.",
          "Cordialement, Chef service client",
        ] } },
      ] },
    ],
    competence: {
      groupe: 'Groupe de compétences',
      intitule: "Traiter une réclamation et réaliser une vente au rebond",
      detail: "Distinguer vente au rebond et vente additionnelle, traiter une demande, proposer un produit (vente au rebond), annoncer et défendre le prix, expliquer la livraison.",
    },
    objectifs: [
      'Définir et distinguer vente au rebond et vente additionnelle.',
      'Construire une fiche d\u2019appel C.E.R.C. complète.',
      'Réaliser une vente au rebond : argumenter, annoncer le prix, réfuter l\u2019objection, expliquer la livraison.',
    ],
    activites: [
      {
        titre: 'Activité 1 — La définition de la vente au rebond',
        contexte: "Afin que vous compreniez ce qu'est la vente au rebond, Mme Vière vous donne quelques explications.",
        questions: [
          { numero: 1, consigne: 'Analysez la vente au rebond.', ressources: "Lire le document 1, compléter l'annexe 1.", annexeId: 'annexe1' },
          { numero: 2, consigne: 'Analysez la vente additionnelle.', ressources: "Lire le document 2, compléter l'annexe 2.", annexeId: 'annexe2' },
          { numero: 3, consigne: 'Expliquez la différence entre la vente au rebond et la vente additionnelle.', ressources: "Lire les documents 1 et 2, compléter l'annexe 3.", annexeId: 'annexe3' },
        ],
      },
      {
        titre: 'Activité 2 — Se préparer à recevoir l\u2019appel',
        contexte: "Avant de recevoir l'appel, votre tutrice vous transmet l'ensemble des procédures à appliquer.",
        questions: [
          { numero: 4, consigne: "Indiquez les étapes à respecter pour faire une vente au rebond lors d'une réception d'appel.", ressources: "Consulter le document 3, compléter l'annexe 4.", annexeId: 'annexe4' },
          { numero: 5, consigne: 'Rédigez la première partie (Contact) de votre plan de réception d\u2019appel.', ressources: "Consulter le document 3, compléter l'annexe 5.", annexeId: 'annexe5' },
          { numero: 6, consigne: 'Rédigez la deuxième partie (Écoute) de votre plan de réception d\u2019appel puis questionnez le client.', ressources: "Lire les documents 3 et 4, compléter l'annexe 5 ; lire le document 5, compléter l'annexe 6.", annexeId: 'annexe5' },
          { numero: 7, consigne: 'Indiquez les différentes étapes de la procédure de traitement de la demande du client.', ressources: "Lire le document 6, compléter l'annexe 7.", annexeId: 'annexe7' },
          { numero: 8, consigne: 'Rédigez la troisième partie (Réponse) de votre plan de réception d\u2019appel.', ressources: "Lire le document 6, compléter l'annexe 5.", annexeId: 'annexe5' },
        ],
      },
      {
        titre: 'Activité 3 — La pratique de la vente au rebond',
        contexte: "La demande du client est traitée, vous allez maintenant tenter de faire une vente au rebond en proposant la nouvelle Freebox Pop.",
        questions: [
          { numero: 9, consigne: 'Rédigez la manière dont vous allez présenter au téléphone à M. Seption la nouvelle Freebox en choisissant 3 arguments par rapport aux caractéristiques de base.', ressources: "Consulter la Mission 3 (annexe 4), compléter l'annexe 8.", annexeId: 'annexe8' },
        ],
      },
      {
        titre: 'Activité 4 — L\u2019annonce du prix et la livraison',
        contexte: "Le client a validé votre proposition. Vous lui annoncez le prix et les modalités de livraison.",
        questions: [
          { numero: 10, consigne: "Annoncez le prix au client ainsi que sa subtilité, puis utilisez la technique de la « soustraction » pour réfuter son objection sur le prix.", ressources: "Lire le document 7 ; lire les documents 8, 9 et 10, compléter l'annexe 9.", annexeId: 'annexe9' },
          { numero: 11, consigne: 'Annoncez au client les délais de livraison de sa nouvelle Freebox en le rassurant.', ressources: "Lire le document 11, compléter l'annexe 10.", annexeId: 'annexe10' },
          { numero: 12, consigne: 'Expliquez au client la procédure pour bénéficier de la Freebox Pop.', ressources: "Consulter le document 12, compléter l'annexe 11.", annexeId: 'annexe11' },
          { numero: 13, consigne: 'Rédigez la quatrième partie (Conclusion) de votre plan de réception d\u2019appel.', ressources: "Lire le document 13, compléter l'annexe 5.", annexeId: 'annexe5' },
        ],
      },
    ],
    annexes: [
      { type: 'grille', id: 'annexe1', titre: 'Annexe 1 — L\u2019analyse des explications de Mme Vière', colonnes: ['Questions', 'Réponses'], nbLignes: 4, prerempli: [["Qui prend l'initiative du contact ?", ''], ['Donnez la définition de la vente au rebond.', ''], ['Quels sont les deux cas dans lesquels la vente au rebond peut-elle se pratiquer ?', ''], ['Donnez un exemple de vente au rebond.', '']] },
      { type: 'grille', id: 'annexe2', titre: 'Annexe 2 — La vente additionnelle', colonnes: ['Questions', 'Réponses'], nbLignes: 6, prerempli: [['Définissez la vente additionnelle.', ''], ['Citez les deux types de vente additionnelle.', ''], ["Expliquez ce qu'est la vente complémentaire.", ''], ['Donnez un exemple de produit et de vente complémentaire.', ''], ["Expliquez ce qu'est la vente supplémentaire.", ''], ['Donnez un exemple de produit et de vente supplémentaire.', '']] },
      { type: 'texte', id: 'annexe3', titre: 'Annexe 3 — La différence entre la vente au rebond et la vente additionnelle', lignes: 4 },
      { type: 'organigrammearemplir', id: 'annexe4', titre: 'Annexe 4 — Le cheminement permettant de faire une vente au rebond', noms: ['1 - Je reçois un appel', '2 - Je pratique l\u2019écoute et je questionne', '3 - Je prends en charge le problème', '4B - Une solution a été trouvée', '5B - Je tente de faire une vente de rebond', '6B - J\u2019annonce le prix', '6B - J\u2019annonce les délais de livraison', '7 - Je conclue'], fonctions: ['Étape'], tete: { cle: 'e1', enfants: [{ cle: 'e2', enfants: [{ cle: 'e3', enfants: [{ cle: 'e4', enfants: [{ cle: 'e5', enfants: [{ cle: 'e6', enfants: [{ cle: 'e7', enfants: [{ cle: 'e8' }] }] }] }] }] }] }] } },
      { type: 'ficheappel', id: 'annexe5', titre: 'Annexe 5 — Complétez la fiche d\u2019appel C.E.R.C.', sections: [
        { cle: 'contact', libelle: 'CONTACT', aide: 'Saluer, se présenter, montrer sa disponibilité.', lignes: 2 },
        { cle: 'ecoute', libelle: 'ÉCOUTE', aide: 'Reformuler la demande puis commencer le questionnaire (voir annexe 6).', lignes: 3 },
        { cle: 'reponse', libelle: 'RÉPONSE', aide: 'Annoncer la procédure d\u2019échange de la télécommande (étapes 1, 2, 3).', lignes: 6 },
        { cle: 'conclusion', libelle: 'CONCLUSION', aide: 'Confirmer, annoncer le questionnaire, remercier, saluer.', lignes: 3 },
      ] },
      { type: 'texte', id: 'annexe6', titre: 'Annexe 6 — Le questionnaire (lien / QR Code)', lignes: 1, boutonLien: 'https://forms.gle/DxZffUh4kzLWTuGZ8', boutonLibelle: 'Ouvrir le questionnaire de traitement de la réclamation' },
      { type: 'grille', id: 'annexe7', titre: 'Annexe 7 — Les étapes de l\u2019échange de la télécommande', colonnes: ['Numéro de l\u2019étape', 'Contenu de l\u2019étape'], nbLignes: 3, prerempli: [['1', ''], ['2', ''], ['3', '']] },
      { type: 'texte', id: 'annexe8', titre: 'Annexe 8 — La présentation des caractéristiques de la nouvelle Freebox', lignes: 6 },
      { type: 'grille', id: 'annexe9', titre: 'Annexe 9 — L\u2019annonce du prix', colonnes: ['Consigne', 'Réponse'], nbLignes: 2, prerempli: [["Indiquez le prix de l'abonnement ainsi que sa subtilité", ''], ["Rédigez la phrase qui vous servira à réfuter l'objection de M. Seption", '']] },
      { type: 'texte', id: 'annexe10', titre: 'Annexe 10 — Les délais de livraison', lignes: 4 },
      { type: 'grille', id: 'annexe11', titre: 'Annexe 11 — Les étapes de l\u2019échange de la Freebox', colonnes: ['Numéro de l\u2019étape', 'Contenu de l\u2019étape'], nbLignes: 4, prerempli: [['1', ''], ['2', ''], ['3', ''], ['4', '']] },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: 'Analyse de la vente au rebond (annexe 1).', documents: ['Document 1'], bareme: 4, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Questions', 'Réponses'], lignes: [
          ["Qui prend l'initiative du contact ?", "Le client (« … à l'initiative du client… »)."],
          ['Définition de la vente au rebond', "Profiter d'un contact généralement pris à l'initiative du client pour évoquer ou formuler une offre commerciale distincte après avoir traité sa demande initiale."],
          ['Les deux cas où elle se pratique', 'En face à face ou par téléphone.'],
          ['Exemple', "Un chargé d'accueil en agence propose une solution d'épargne à un client venu effectuer une opération courante ; ou Orange Bank permettant des rebonds vers la téléphonie."],
        ] },
      },
      {
        intitule: 'La vente additionnelle (annexe 2).', documents: ['Document 2'], bareme: 6, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Questions', 'Réponses'], lignes: [
          ['Définition', "La vente additionnelle est mise en œuvre par un commercial lorsque le client qui vient acheter un produit se voit en proposer un autre pour compléter le produit principal."],
          ['Les deux types', 'La vente complémentaire ; la vente supplémentaire.'],
          ['Vente complémentaire', "C'est le cas lorsque le produit proposé en plus est directement lié au produit principal acheté."],
          ['Exemple (complémentaire)', 'Accepter toute réponse cohérente (ex : housse vendue avec un téléphone).'],
          ['Vente supplémentaire', "Profiter de la présence du client pour lui proposer un autre produit qui n'a rien à voir avec le produit principal."],
          ['Exemple (supplémentaire)', 'Accepter toute réponse cohérente (ex : carte bleue proposée avec un livret d\u2019épargne).'],
        ] },
      },
      { intitule: 'La différence (annexe 3).', documents: ['Documents 1 et 2'], bareme: 2, reponse: "Dans la vente au rebond, le commercial propose un produit lors d'un contact pris par le client pour un autre sujet. Dans la vente additionnelle, le commercial profite de l'achat d'un produit par le client pour lui en proposer un deuxième qui lui est directement lié." },
      {
        intitule: 'Le cheminement de la vente au rebond (annexe 4).', documents: ['Document 3'], bareme: 6, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Ordre', 'Étape'], lignes: [
          ['1', "Je reçois un appel et j'applique le contact"],
          ['2', 'Je pratique l\u2019écoute et je questionne'],
          ['3', 'Je prends en charge le problème'],
          ['4B', 'Une solution a été trouvée'],
          ['5B', 'Je tente de faire une vente de rebond'],
          ['6B', 'J\u2019annonce le prix'],
          ['6B', 'J\u2019annonce les délais de livraison'],
          ['7', 'Je conclue'],
        ] },
      },
      {
        intitule: 'Fiche d\u2019appel C.E.R.C. (annexe 5).', documents: ['Documents 3, 4, 6 et 13'], bareme: 8, reponse: 'Voir fiche.',
        tableau: { colonnes: ['Étape', 'Contenu'], lignes: [
          ['CONTACT', '« Bonjour, Freemobile, [Prénom], à votre écoute (ou : en quoi puis-je vous aider ?) »'],
          ['ÉCOUTE', '« Très bien, alors nous allons voir tout ça ensemble. » (commencer le questionnaire, voir QR Code annexe 6)'],
          ['RÉPONSE', '« Nous avons fait toutes les manipulations nécessaires et votre télécommande ne fonctionne toujours pas, dans ce cas je vais procéder à l\u2019envoi d\u2019une télécommande neuve et sans frais. » 1 – Un mail de confirmation vous sera envoyé ; 2 – 48h après, un second mail et un SMS vous informeront de la livraison ; 3 – Un agent UPS viendra à votre domicile effectuer l\u2019échange et vous fera signer un justificatif. « C\u2019est bon pour vous ? »'],
          ['CONCLUSION', "« J'espère avoir répondu à toutes vos questions. Juste après cet appel, vous recevrez un questionnaire de satisfaction, je vous prie de bien vouloir y répondre. Je vous remercie et je vous souhaite une excellente journée au nom de Free. »"],
        ] },
      },
      { intitule: 'Le questionnaire (annexe 6).', documents: ['Document 5'], bareme: 0, reponse: "Lien du questionnaire : https://forms.gle/DxZffUh4kzLWTuGZ8 (à flasher ou cliquer)." },
      {
        intitule: 'Étapes de l\u2019échange de la télécommande (annexe 7).', documents: ['Document 6'], bareme: 3, reponse: 'Voir tableau.',
        tableau: { colonnes: ['N°', 'Contenu de l\u2019étape'], lignes: [
          ['1', 'Envoi par Free d\u2019un mail de confirmation au client.'],
          ['2', 'Envoi, 48h après, d\u2019un deuxième mail et d\u2019un SMS sur le téléphone portable du client pour l\u2019informer de la livraison du produit.'],
          ['3', "Un agent d'UPS viendra à son domicile pour effectuer l'échange et lui fera signer un justificatif."],
        ] },
      },
      { intitule: 'Présentation des caractéristiques (annexe 8).', documents: ['Mission 3'], bareme: 6, reponse: "« Je profite de votre appel M. Seption pour vous dire qu'en ce moment, il y a la nouvelle Freebox Pop qui est sortie. - Elle possède la fibre ultra rapide : vous pourrez regarder un film, télécharger des fichiers à toute vitesse et sans interruption ; - Elle intègre le nouveau protocole de chiffrement WPA3 qui permet de protéger vos connexions ; - Avec sa ligne fixe, vous pourrez appeler dans plus de 110 pays sans surcoût ; - Elle dispose d'un répéteur wifi Pop qui vous permettra d'avoir un wifi de qualité dans toutes les pièces. Est-ce que vous seriez intéressé par cette offre ? »" },
      {
        intitule: 'L\u2019annonce du prix et la réfutation (annexe 9).', documents: ['Documents 7, 8, 9 et 10'], bareme: 4, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Consigne', 'Réponse'], lignes: [
          ['Prix et subtilité', '29,99 € pendant 1 an puis 39,99 €, sans engagement.'],
          ['Phrase de réfutation (soustraction)', "« Je vous comprends M. Seption, mais pour toute souscription valable aujourd'hui uniquement, Free vous offre les frais de migration de 49€ et les frais d'envoi de 20€. »"],
        ] },
      },
      { intitule: 'Les délais de livraison (annexe 10).', documents: ['Document 11'], bareme: 4, reponse: "« Votre Freebox Pop vous sera livrée d'ici 3 mois. Nous sommes désolés pour ce délai mais c'est dû à un problème de stock de Server Free Delta car l'offre a beaucoup de succès. Mais soyez rassuré, votre commande a bien été enregistrée et tant que la migration ne sera pas effective, votre Freebox actuelle fonctionnera normalement. »" },
      {
        intitule: 'Étapes de l\u2019échange de la Freebox (annexe 11).', documents: ['Document 12'], bareme: 4, reponse: 'Voir tableau.',
        tableau: { colonnes: ['N°', 'Contenu de l\u2019étape'], lignes: [
          ['1', "Le client sera informé par mail ou par SMS de l'arrivée de sa Freebox pour faire l'échange."],
          ['2', "Le client doit emballer dans un carton tous les équipements qu'il a reçus."],
          ['3', 'Le client doit écrire en gros sur le carton : « Retour Free – Upgrade ».'],
          ['4', 'Tout équipement manquant sera facturé (Freebox : 190€ ; Sagem : 49€ ; Boîtier Freebox : 150€ ; Boîtier HD : 290€ ; 20€/accessoire).'],
        ] },
      },
    ],
  },
  synthese: {
    titre: "La vente au rebond",
    proposition: ['Contact', 'La vente au rebond', 'La vente additionnelle', 'Conclusion'],
    racine: {
      id: 'racine', texte: "Le traitement de l'appel et la vente",
      enfants: [
        { id: 'appel', texte: "La réception d'appel", enfants: [
          { id: 'c', texte: null, reponse: 'Contact' },
          { id: 'concl', texte: null, reponse: 'Conclusion' },
        ] },
        { id: 'vente', texte: 'Les ventes', enfants: [
          { id: 'rebond', texte: null, reponse: 'La vente au rebond' },
          { id: 'add', texte: null, reponse: 'La vente additionnelle' },
        ] },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: 'Distinguer les types de vente',
        indicateurs: [
          { niveau: 'novice', description: 'Je confonds vente au rebond et vente additionnelle.' },
          { niveau: 'debrouille', description: 'Je définis la vente au rebond.' },
          { niveau: 'averti', description: 'Je distingue rebond, complémentaire et supplémentaire.' },
          { niveau: 'expert', description: 'Je donne des exemples pertinents de chaque type.' },
        ],
      },
      {
        id: 'c2', intitule: 'Traiter une réclamation (C.E.R.C.)',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas structurer un appel.' },
          { niveau: 'debrouille', description: 'Je rédige le contact.' },
          { niveau: 'averti', description: 'Je rédige une fiche C.E.R.C. complète.' },
          { niveau: 'expert', description: 'Je traite la demande et propose la procédure d\u2019échange.' },
        ],
      },
      {
        id: 'c3', intitule: 'Réaliser une vente au rebond',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne propose pas de produit additionnel.' },
          { niveau: 'debrouille', description: 'Je propose la Freebox Pop.' },
          { niveau: 'averti', description: 'J\u2019argumente, annonce le prix et la livraison.' },
          { niveau: 'expert', description: 'Je réfute l\u2019objection prix avec une technique adaptée.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Vente au rebond', definition: "Profiter d'un contact pris à l'initiative du client pour proposer une offre commerciale distincte après avoir traité sa demande." },
      { terme: 'Vente additionnelle', definition: 'Proposer un produit supplémentaire à un client venu acheter un produit principal.' },
      { terme: 'Vente complémentaire', definition: 'Produit proposé en plus, directement lié au produit principal.' },
      { terme: 'Vente supplémentaire', definition: 'Produit proposé en plus, sans lien avec le produit principal.' },
      { terme: 'Technique de l\u2019addition', definition: 'Énumérer tous les avantages du produit pour justifier son prix.' },
      { terme: 'Technique de la soustraction', definition: "Montrer au client ce qu'il perd s'il ne prend pas le produit." },
      { terme: 'Objection', definition: 'Frein ou réserve exprimé par le client (ex : sur le prix).' },
      { terme: 'Migration', definition: "Passage d'une ancienne Freebox à une nouvelle (échange de matériel)." },
      { terme: 'C.E.R.C.', definition: 'Contact, Écoute, Réponse, Conclusion : méthode de réception d\u2019appel.' },
      { terme: 'Free Helper', definition: 'Conseiller relation client à distance de Free.' },
    ],
    flashcards: [
      { recto: 'Qui prend l\u2019initiative dans la vente au rebond ?', verso: 'Le client.' },
      { recto: 'Vente complémentaire ?', verso: 'Produit lié au produit principal (ex : housse + téléphone).' },
      { recto: 'Vente supplémentaire ?', verso: 'Produit sans lien avec le produit principal.' },
      { recto: 'Technique de la soustraction ?', verso: "Montrer ce que le client perd s'il n'achète pas." },
      { recto: 'Prix de la Freebox Pop ?', verso: '29,99 € pendant 1 an puis 39,99 €, sans engagement.' },
      { recto: 'Frais offerts aujourd\u2019hui ?', verso: 'Migration (49€) et envoi (20€) offerts.' },
      { recto: 'Délai de livraison en migration ?', verso: 'Environ 3 mois.' },
      { recto: 'Qui livre la télécommande ?', verso: 'UPS (échange à domicile, sous 48h après le mail).' },
      { recto: 'Que doit écrire le client sur le carton ?', verso: '« Retour Free - Upgrade ».' },
      { recto: 'Pénalité si Freebox manquante ?', verso: '190 €.' },
    ],
    quiz: [
      { type: 'unique', question: 'Qui prend l\u2019initiative dans la vente au rebond ?', options: ['Le client', 'Le commercial', 'Le livreur', 'Le directeur'], bonne: 0 },
      { type: 'unique', question: 'La vente complémentaire propose un produit...', options: ['Lié au produit principal', 'Sans lien', 'Moins cher', 'Gratuit'], bonne: 0 },
      { type: 'unique', question: 'La technique de la soustraction montre...', options: ["Ce que le client perd", 'Tous les avantages', 'Le prix barré', 'La marque'], bonne: 0 },
      { type: 'unique', question: 'Prix Freebox Pop la 1ère année ?', options: ['29,99 €/mois', '39,99 €/mois', '19,99 €/mois', '9,99 €/mois'], bonne: 0 },
      { type: 'unique', question: 'Frais offerts aujourd\u2019hui ?', options: ['Migration + envoi', 'TV + Netflix', 'Aucun', 'Téléphone'], bonne: 0 },
      { type: 'unique', question: 'Délai en migration ?', options: ['Environ 3 mois', '48h', '1 an', '1 semaine'], bonne: 0 },
      { type: 'unique', question: 'Qui effectue l\u2019échange à domicile ?', options: ['UPS', 'Free', 'La Poste', 'Le client'], bonne: 0 },
      { type: 'unique', question: 'Mention à écrire sur le carton ?', options: ['Retour Free - Upgrade', 'Fragile', 'Urgent', 'Cadeau'], bonne: 0 },
      { type: 'unique', question: 'Pénalité si Freebox manquante ?', options: ['190 €', '49 €', '20 €', '290 €'], bonne: 0 },
      { type: 'unique', question: 'Première étape de la méthode C.E.R.C. ?', options: ['Contact', 'Écoute', 'Réponse', 'Conclusion'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque élément dans la bonne catégorie.',
      etiquettes: ['Vente au rebond', 'Vente complémentaire', 'Vente supplémentaire'],
      zones: [
        { libelle: 'Épargne proposée au guichet', etiquetteIndex: 0 },
        { libelle: 'Freebox Pop proposée après dépannage', etiquetteIndex: 0 },
        { libelle: 'Housse avec un téléphone', etiquetteIndex: 1 },
        { libelle: 'Extension de garantie avec un photocopieur', etiquetteIndex: 1 },
        { libelle: 'Carte bleue avec un livret d\u2019épargne', etiquetteIndex: 2 },
        { libelle: 'Produit sans lien avec l\u2019achat', etiquetteIndex: 2 },
      ],
    },
  },
}

const FREE_M5: ContenuMission = {
  travaux: {
    consigne:
      "Étudiez la satisfaction du client (types de questions, résultats d'enquête, calcul de la prime) puis travaillez la fidélisation (titres des étapes, réponses aux clients mécontents sur les réseaux sociaux).",
    contexte:
      "Mme Vière vous rappelle que si le service client est un service très stratégique parce qu'il contribue à véhiculer une image positive de l'entreprise, la satisfaction du client est tout aussi importante car elle permet de le fidéliser. Elle souhaite donc dans un premier temps que vous étudiiez le questionnaire de satisfaction qu'elle a créé afin que vous sachiez les points sur lesquels il vous faut être vigilant lors du contact avec les clients, puis dans un deuxième temps les actions de fidélisation qu'elle a mises en place.",
    documents: [
      { numero: 1, titre: 'Comment connaître les différents types de questions', images: [], texte: [
        { pageWeb: true },
        { tableau: { colonnes: ['Types de questions', 'Définition', 'Exemple'], lignes: [
          ['Ouverte « O »', "Elle laisse le client s'exprimer.", 'Dites-nous ce que vous avez pensé de notre site internet.'],
          ['Fermée « F »', 'Elle ne permet qu\u2019une réponse précise : Oui ou non.', 'Les informations qui vous ont été données vous ont-elles aidé ? Oui / Non'],
          ['Alternative « A »', 'Elle donne le choix entre 2 possibilités.', 'Préférez-vous nous contacter par téléphone ou par internet ?'],
          ['Questions à choix multiple à réponse unique', "Elle donne le choix entre plusieurs possibilités. Le client ne peut donner qu'une seule réponse parmi celles proposées.", 'Quel est le réseau social que vous utilisez le plus : Facebook / Instagram / Snapchat / Pinterest ?'],
          ['Questions à échelle ou échelle d\u2019évaluation', "Échelle comportant une plage de valeurs en guise d'options de réponse (0 à 100, 1 à 10, etc.). Les participants sélectionnent le chiffre qui se rapproche le plus de ce qu'ils pensent.", 'Comment notez-vous votre expérience d\u2019achat dans notre enseigne ? (note de 0 à 10)'],
          ['Questions avec échelle de Likert', "Questions de type « D'accord / Pas d'accord » qui permettent d'évaluer l'opinion et le ressenti des participants.", 'Vous trouvez tout ce dont vous avez besoin : Tout à fait d\u2019accord – D\u2019accord – Pas d\u2019accord – Pas du tout d\u2019accord'],
        ] } },
      ] },
      { numero: 2, titre: 'Le questionnaire de satisfaction client', images: [], texte: [
        { pageWeb: true },
        { jaugeSatisfaction: { libelle: 'Votre avis nous intéresse' } },
        { questionnaire: {
          titre: 'Questionnaire de satisfaction client',
          intro: [
            "Dans le cadre de l'amélioration continue de nos services, Free est à votre écoute.",
            "Afin de nous aider à comprendre comment mieux vous satisfaire, nous vous proposons de consacrer 2 minutes de votre temps pour répondre à cette enquête, suite au(x) contact(s) que vous avez eu avec notre Service Abonné.",
            "Nous vous remercions par avance de votre participation. L'équipe Free.",
          ],
          questions: [
            { id: 'q1', numero: '1', libelle: "Avez-vous été au téléphone avec un conseiller aujourd'hui ?", obligatoire: true, type: 'unique', options: [{ libelle: 'Oui', saut: 'q2' }, { libelle: 'Non', saut: 'q11' }] },
            { id: 'q2', numero: '2', libelle: 'Évaluez le contact que vous avez eu avec le conseiller (1 étant très insatisfaisant, 10 excellent).', obligatoire: true, type: 'echelle', min: 1, max: 10, saut: 'q3' },
            { id: 'q3', numero: '3', libelle: "À propos du contact avec le (la) conseiller(e), diriez-vous qu'il (elle) était aimable et courtois(e) ?", obligatoire: true, type: 'likert', saut: 'q4' },
            { id: 'q4', numero: '4', libelle: "À propos du contact avec le (la) conseiller(e), diriez-vous qu'il (elle) s'exprimait clairement en utilisant un vocabulaire simple et compréhensible ?", obligatoire: true, type: 'likert', saut: 'q5' },
            { id: 'q5', numero: '5', libelle: "À propos du contact avec le (la) conseiller(e), diriez-vous qu'il (elle) était compétent(e) et possédait les connaissances professionnelles suffisantes pour vous répondre ?", obligatoire: true, type: 'likert', saut: 'q6' },
            { id: 'q6', numero: '6', libelle: "Si vous estimez que le (la) conseiller(e) était compétent(e) et professionnel(le), expliquez pourquoi.", type: 'texte', saut: 'q7' },
            { id: 'q7', numero: '7', libelle: "À propos du contact avec le (la) conseiller(e), diriez-vous qu'il (elle) était à votre écoute ?", obligatoire: true, type: 'unique', options: [{ libelle: 'Oui', saut: 'q9' }, { libelle: 'Non', saut: 'q8' }] },
            { id: 'q8', numero: '8', libelle: "Si vous estimez qu'il (elle) n'a pas été suffisamment à votre écoute, expliquez pourquoi.", type: 'texte', saut: 'q9' },
            { id: 'q9', numero: '9', libelle: "À propos du contact avec le (la) conseiller(e), diriez-vous qu'il (elle) a bien pris en charge votre demande ?", obligatoire: true, type: 'likert', saut: 'q10' },
            { id: 'q10', numero: '10', libelle: "À propos du contact avec le (la) conseiller(e), diriez-vous qu'il (elle) était à votre écoute ?", obligatoire: true, type: 'likert', saut: 'q11' },
            { id: 'q11', numero: '11', libelle: 'Si vous avez des remarques ou des suggestions complémentaires concernant la prestation du conseiller, vous pouvez les formuler ici.', type: 'texte', saut: 'fin' },
          ],
          final: ['Merci pour votre participation !', 'Vos réponses ont bien été enregistrées.', "L'équipe Free"],
        } },
      ] },
      { numero: 3, titre: "Les résultats de l'enquête sur la performance au téléphone", images: [], texte: [
        { pageWeb: true },
        { tableau: { colonnes: ['Questions de l\u2019enquête sur le conseiller', 'Nombre d\u2019avis négatifs', 'Nombre d\u2019avis positifs'], lignes: [
          ['2 - Évaluez le contact (de 0 à 10)', '15', '285'],
          ['3 - L\u2019amabilité et la courtoisie', '23', '277'],
          ['4 - Une expression claire et un vocabulaire simple et compréhensible', '58', '242'],
          ['5 - La compétence et les connaissances professionnelles', '44', '256'],
          ['7 - L\u2019écoute', '21', '279'],
          ['9 - La prise en charge de la demande', '73', '227'],
        ] } },
      ] },
      { numero: 4, titre: 'Le système de rémunération', images: [], texte: [
        { pageWeb: true },
        { bareme: {
          intro: [
            "L'objectif de tout conseiller est de satisfaire à 100 % les clients qui nous appellent. C'est l'image de notre entreprise qui est en jeu.",
            "Pour vous motiver dans l'atteinte de cet objectif, nous avons mis en place une prime qui sera versée au prorata de la satisfaction de ces derniers à travers le questionnaire qu'ils rempliront.",
            "Cette prime s'élève à 200 €, pour ceux qui atteignent ou s'approchent le plus près possible de l'objectif de 100 %. La prime se répartira de la façon suivante :",
          ],
          colonnes: ['Taux de réalisation des objectifs (en %)', 'Pourcentage de la prime'],
          lignes: [
            ['Entre 0 % et 55 % d\u2019avis positifs', '0 % de la prime'],
            ['Entre 56 % et 60 % d\u2019avis positifs', '10 % de la prime'],
            ['Entre 61 % et 70 % d\u2019avis positifs', '20 % de la prime'],
            ['Entre 71 % et 80 % d\u2019avis positifs', '70 % de la prime'],
            ['Entre 80 % et 90 % d\u2019avis positifs', '80 % de la prime'],
            ['Plus de 90 % d\u2019avis positifs', '100 % de la prime'],
          ],
        } },
      ] },
      { numero: 5, titre: 'Comment bien communiquer sur les réseaux sociaux pour fidéliser les clients', images: [], texte: [
        { pageWeb: true },
        { articleEtapes: { etapes: [
          { numero: '#1', texte: [
            "Les études sont toutes d'accord sur le sujet : vos clients attendent de vous un échange sur les réseaux sociaux et surtout une réponse quand ils vous sollicitent. Ils sont même d'ailleurs 53 % à attendre une réponse de votre part dans l'heure sur les réseaux sociaux, ce taux grimpant à 72 % en cas de plainte !",
            "Pour bien communiquer sur les réseaux sociaux et fidéliser vos clients, vous devez donc être à leur écoute et être réactif en cas de sollicitation.",
          ] },
          { numero: '#2', texte: [
            "Une communauté de clients constitue un espace où votre clientèle peut partager des conseils et des expériences. Développer une communauté vous permet également de prendre part à la conversation une fois la prestation effectuée, dans un environnement différent des services de relation client. Elle facilite la prise en compte des commentaires des clients pour les exploiter.",
            "L'objectif est que vos clients puissent avant tout vous contacter facilement. Les clients apprécient un support réactif et pratique et c'est ce qui les amène de plus en plus à se tourner vers les réseaux sociaux.",
          ] },
          { numero: '#3', texte: [
            "Si vous avez mené à bien les premières étapes, vous aurez inévitablement converti une partie de vos clients en ambassadeurs sur les réseaux sociaux. Il y a une règle qui dit que 90 % des internautes consultent du contenu sur les réseaux sociaux sans agir, que 9 % aiment ou partagent et que seuls 1 % commentent.",
            "Si vous parvenez donc à convaincre 10 % de vos clients de faire votre promotion sur les réseaux sociaux, vous aurez fait du bon boulot !",
          ] },
        ] } },
      ] },
      { numero: 6, titre: '« X »', images: [], texte: [
        { pageWeb: true },
        { reseauSocial: { plateforme: 'x', compte: 'Trobairitz', pseudo: '@s_rhmzn', avatarInitiale: 'T', date: '09:14 · 15 févr. 202N', message: ["@free impossible de me connecter sur votre page abonné, une page d'erreur s'affiche à chaque fois ! C'est insupportable, ça fait deux jours que ça dure…"], stats: { repondre: '12', reposter: '3', jaime: '8', vues: '1 204' } } },
      ] },
      { numero: 7, titre: 'Facebook', images: [], texte: [
        { pageWeb: true },
        { reseauSocial: { plateforme: 'facebook', compte: 'Anthony Dumas', avatarInitiale: 'A', date: '15 février à 08:42', message: ["Bonjour, j'ai un gros problème avec ma facture ce mois-ci, on m'a prélevé deux fois ! Je veux qu'on me rembourse rapidement. @Free"], stats: { jaime: '5', repondre: '2', reposter: '1' } } },
      ] },
      { numero: 8, titre: 'Procédure pour répondre sur les réseaux sociaux', images: [], texte: [
        { pageWeb: true },
        { organigramme: { tete: {
          libelle: 'Saluer le client', teinte: 'tete', enfants: [
            { libelle: 'Si la réclamation concerne un problème non personnel', teinte: 'bleu', enfants: [ { libelle: 'Montrer au client que le problème soulevé a été pris en compte et qu\u2019il va être réglé rapidement', teinte: 'vert', enfants: [ { libelle: 'Salutations au client', teinte: 'gris' } ] } ] },
            { libelle: 'Si la réclamation concerne un problème personnel', teinte: 'jaune', enfants: [ { libelle: 'Ne jamais donner de réponse directe : demander au client de contacter Free en message privé', teinte: 'rose', enfants: [ { libelle: 'Demander de préciser son n° de tél. ; demander son nom et prénom', teinte: 'rose', enfants: [ { libelle: 'Salutations au client', teinte: 'gris' } ] } ] } ] },
          ],
        } } },
      ] },
      { numero: 9, titre: 'Questionnaire satisfaction Freebox Pop (Instagram) — Partie II', images: [], texte: [
        { pageWeb: true },
        { instagramTelephone: {
          compte: 'assistance.freebox',
          sousTitre: 'Assistance Freebox',
          bio: ['Service Abonné Free', 'Votre avis compte : aidez-nous à améliorer la Freebox Pop', '👇 Répondez à notre enquête'],
          libelleLien: 'forms.gle/freebox-pop',
          statistiques: { publications: '128', abonnes: '54,2 k', abonnements: '12' },
        }, questionnaire: {
          titre: 'Questionnaire satisfaction Freebox Pop',
          intro: [
            'Instagrameur, Instagrameuse,',
            'Vous avez certainement entendu parler de la nouvelle Freebox Pop et votre avis nous est précieux. Nous vous proposons de consacrer 2 minutes pour répondre à cette enquête.',
            'Nous vous remercions par avance pour votre participation.',
          ],
          questions: [
            { id: 'p1', numero: '1', libelle: 'Possédez-vous la Freebox Pop ?', obligatoire: true, type: 'unique', options: [{ libelle: 'Oui', saut: 'p2' }, { libelle: 'Non', saut: 'p7' }] },
            { id: 'p2', numero: '2', libelle: 'Comment avez-vous connu la nouvelle Freebox Pop ?', obligatoire: true, type: 'unique', options: [{ libelle: 'Par internet', saut: 'p3' }, { libelle: 'Sur les réseaux sociaux', saut: 'p3' }, { libelle: 'À la télévision', saut: 'p3' }] },
            { id: 'p3', numero: '3', libelle: 'Évaluez le contact que vous avez eu avec le Service Abonné Free pour la souscription à la Freebox Pop.', obligatoire: true, type: 'echelle', min: 1, max: 5, saut: 'p4' },
            { id: 'p4', numero: '4', libelle: 'Évaluez le délai de réception de la Freebox Pop.', obligatoire: true, type: 'echelle', min: 1, max: 5, saut: 'p5' },
            { id: 'p5', numero: '5', libelle: 'Évaluez les avantages de la Freebox Pop par rapport à votre ancienne box, quel que soit l\u2019opérateur.', obligatoire: true, type: 'echelle', min: 1, max: 5, saut: 'p6' },
            { id: 'p6', numero: '6', libelle: 'Concernant la Freebox Pop et les services proposés, dans quelle mesure seriez-vous prêt à la recommander autour de vous ?', obligatoire: true, type: 'echelle', min: 1, max: 5, saut: 'p7' },
            { id: 'p7', numero: '7', libelle: 'Dans quelle mesure seriez-vous prêt à recommander Free autour de vous ?', obligatoire: true, type: 'echelle', min: 1, max: 5, saut: 'p8' },
            { id: 'p8', numero: '8', libelle: "Avez-vous eu l'occasion de recommander Free autour de vous ?", obligatoire: true, type: 'unique', options: [{ libelle: 'Oui', saut: 'p9' }, { libelle: 'Non', saut: 'fin' }] },
            { id: 'p9', numero: '9', libelle: 'À combien de personnes avez-vous recommandé Free ?', obligatoire: true, type: 'unique', options: [{ libelle: '1 personne', saut: 'fin' }, { libelle: '2 personnes', saut: 'fin' }, { libelle: '3 personnes', saut: 'fin' }, { libelle: '4 personnes', saut: 'fin' }, { libelle: '5 personnes', saut: 'fin' }, { libelle: 'Plus de 5 personnes', saut: 'fin' }] },
          ],
          final: ["Nous vous remercions d'avoir pris ces quelques minutes pour répondre à ce questionnaire.", 'À bientôt !'],
        } },
        { intertitre: 'Partie II — FREE ET VOUS', paragraphes: ["La partie II du questionnaire (questions 6 à 9) porte sur la recommandation de Free et de la Freebox Pop autour de soi."] },
      ] },
    ],
    competence: {
      groupe: 'Groupe de compétences',
      intitule: "Mesurer la satisfaction et fidéliser le client",
      detail: "Identifier les types de questions d'une enquête, exploiter des résultats (calculs de pourcentages, prime), et répondre aux clients sur les réseaux sociaux pour fidéliser.",
    },
    objectifs: [
      'Identifier les types de questions d\u2019un questionnaire de satisfaction.',
      'Exploiter les résultats d\u2019une enquête (pourcentages) et calculer une prime.',
      'Répondre à des clients mécontents sur les réseaux sociaux selon une procédure.',
    ],
    activites: [
      {
        titre: 'Activité 1 — La satisfaction du client',
        contexte: "Votre tutrice vous remet le questionnaire de satisfaction qui est envoyé à chaque client après son appel. En effet, il est important que vous sachiez les points sur lesquels vous serez jugé, car la note obtenue conditionne à la fin de chaque mois le versement d'une prime.",
        questions: [
          { numero: 1, consigne: "Pour chacune des questions de l'enquête de satisfaction, indiquez le type de question dont il s'agit.", ressources: "Lire le document 1, consulter le document 2, compléter l'annexe 1.", annexeId: 'annexe1' },
          { numero: 2, consigne: 'Calculez ce que représentent en pourcentage les avis négatifs et positifs.', ressources: "Lire le document 3, compléter l'annexe 2.", annexeId: 'annexe2a', contexteAvant: "Nous sommes à la fin du mois et vous avez reçu 300 appels. Vous souhaitez savoir le montant de la prime que vous allez percevoir sur votre salaire." },
          { numero: 3, consigne: 'Calculez le montant de la rémunération que vous allez percevoir ce mois-ci.', ressources: "Lire le document 4, compléter l'annexe 3.", annexeId: 'annexe3' },
        ],
      },
      {
        titre: 'Activité 2 — La fidélisation du client',
        contexte: "Mme Vière vous transmet un document qu'elle a trouvé dans la presse spécialisée et vous demande de l'étudier.",
        questions: [
          { numero: 4, consigne: 'Trouvez un titre pour chaque étape du document.', ressources: "Lire le document 5, compléter l'annexe 4.", annexeId: 'annexe4' },
          { numero: 5, consigne: 'Rédigez sur X la réponse à Trobairitz, puis répondez via le lien.', ressources: "Lire les documents 6 et 8, compléter l'annexe 5a ; compléter l'annexe 5b.", annexeId: 'annexe5a', contexteAvant: "Free est très présent sur les réseaux sociaux. Votre tutrice vous a sélectionné un certain nombre de messages de clients mécontents et elle vous demande de leur répondre consciencieusement car trouver une solution efficace fait partie du processus de fidélisation." },
          { numero: 6, consigne: 'Rédigez sur Facebook la réponse à Anthony, puis répondez via le lien.', ressources: "Lire les documents 7 et 8, compléter l'annexe 6a ; compléter l'annexe 6b.", annexeId: 'annexe6a' },
          { numero: 7, consigne: "Analysez la partie II du questionnaire « FREE ET VOUS » (Instagram) et indiquez à quelle étape du document 5 elle correspond. Justifiez.", ressources: "Lire le document 9, compléter l'annexe 7.", annexeId: 'annexe7' },
        ],
      },
    ],
    annexes: [
      { type: 'grille', id: 'annexe1', titre: 'Annexe 1 — Le questionnaire de satisfaction', colonnes: ['Numéro de la question', 'Type de question'], nbLignes: 11, prerempli: [['1', ''], ['2', ''], ['3', ''], ['4', ''], ['5', ''], ['6', ''], ['7', ''], ['8', ''], ['9', ''], ['10', ''], ['11', '']] },
      { type: 'grille', id: 'annexe2a', titre: 'Annexe 2a — Les résultats de l\u2019enquête (en %)', colonnes: ['Questions de l\u2019enquête sur le conseiller', 'Avis négatifs en % (calcul + résultat)', 'Avis positifs en % (calcul + résultat)'], nbLignes: 6, prerempli: [['2 - Évaluez le contact (de 0 à 10)', '', ''], ['3 - L\u2019amabilité et la courtoisie', '', ''], ['4 - Expression claire et vocabulaire simple', '', ''], ['5 - La compétence et les connaissances', '', ''], ['7 - L\u2019écoute', '', ''], ['9 - La prise en charge de la demande', '', '']] },
      { type: 'grille', id: 'annexe2b', titre: 'Annexe 2b — Transformation du nombre d\u2019avis en pourcentage', colonnes: ['Avis négatifs en % (calcul + résultat)', 'Avis positifs en % (calcul + résultat)'], nbLignes: 1 },
      { type: 'grille', id: 'annexe3', titre: 'Annexe 3 — Le calcul de votre rémunération', colonnes: ['Nature de la prime', 'Objectif fixé', 'Objectif d\u2019avis positifs réalisé', 'Tranche de % de la prime', 'Montant de la prime', 'Rémunération de base'], nbLignes: 2, prerempli: [['Prime sur objectif', '100 %', '', '', '', '1219 €'], ['Votre rémunération totale (calcul + résultat)', '', '', '', '', '']] },
      { type: 'grille', id: 'annexe4', titre: 'Annexe 4 — Titre de chaque étape', colonnes: ['Étape', 'Titre'], nbLignes: 3, prerempli: [['Étape 1', ''], ['Étape 2', ''], ['Étape 3', '']] },
      { type: 'reponsereseau', id: 'annexe5a', titre: 'Annexe 5a — Réponse au Tweet de Trobairitz', plateforme: 'x', enReponseA: '@s_rhmzn', boutonLien: 'https://www.quiziniere.com/#/Exercice/785AE3', boutonLibelle: 'Annexe 5b — Répondre via Quizinière (QR Code / lien)' },
      { type: 'reponsereseau', id: 'annexe6a', titre: 'Annexe 6a — Réponse au message Facebook d\u2019Anthony', plateforme: 'facebook', enReponseA: 'Anthony', boutonLien: 'https://www.quiziniere.com/#/Exercice/NW4G7X', boutonLibelle: 'Annexe 6b — Répondre via Quizinière (QR Code / lien)' },
      { type: 'grille', id: 'annexe7', titre: 'Annexe 7 — Analyse de la Partie II du questionnaire', colonnes: ['Étape du document 5', 'Justifications'], nbLignes: 1 },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: 'Type de chaque question (annexe 1).', documents: ['Documents 1 et 2'], bareme: 11, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Question', 'Type'], lignes: [
          ['1', 'Question fermée'], ['2', 'Question à échelle (échelle d\u2019évaluation)'], ['3', 'Question avec échelle de Likert'], ['4', 'Question avec échelle de Likert'], ['5', 'Question avec échelle de Likert'], ['6', 'Question ouverte'], ['7', 'Question fermée'], ['8', 'Question ouverte'], ['9', 'Question avec échelle de Likert'], ['10', 'Question avec échelle de Likert'], ['11', 'Question ouverte'],
        ] },
      },
      {
        intitule: 'Avis en pourcentage (annexe 2a et 2b).', documents: ['Document 3'], bareme: 12, reponse: 'Sur 300 avis par question. Négatif % = négatifs / 300 × 100.',
        tableau: { colonnes: ['Question', 'Avis négatifs en %', 'Avis positifs en %'], lignes: [
          ['2 - Contact', '15/300 = 5 %', '95 %'],
          ['3 - Amabilité/courtoisie', '23/300 = 7,67 %', '92,33 %'],
          ['4 - Expression claire', '58/300 = 19,33 %', '80,67 %'],
          ['5 - Compétence', '44/300 = 14,67 %', '85,33 %'],
          ['7 - Écoute', '21/300 = 7 %', '93 %'],
          ['9 - Prise en charge', '73/300 = 24,33 %', '75,67 %'],
          ['Moyenne (annexe 2b)', '78 / 6 = 13 %', '522 / 6 = 87 %'],
        ] },
      },
      {
        intitule: 'Calcul de la rémunération (annexe 3).', documents: ['Document 4'], bareme: 6, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Élément', 'Valeur'], lignes: [
          ['Objectif d\u2019avis positifs réalisé', '87 %'],
          ['Tranche de la prime', 'Entre 80 % et 90 % → 80 % de la prime'],
          ['Montant de la prime', '200 × 0,8 = 160 €'],
          ['Rémunération de base', '1219 €'],
          ['Rémunération totale', '1219 + 160 = 1279 € (fixe + prime)'],
        ] },
      },
      {
        intitule: 'Titres des étapes (annexe 4).', documents: ['Document 5'], bareme: 3, reponse: 'Voir tableau.',
        tableau: { colonnes: ['Étape', 'Titre'], lignes: [
          ['Étape 1', 'Écouter et interagir avec ses clients'],
          ['Étape 2', 'Créer une communauté de clients'],
          ['Étape 3', 'Transformer ses clients en ambassadeurs'],
        ] },
      },
      { intitule: 'Réponse à Trobairitz sur X (annexe 5a).', documents: ['Documents 6 et 8'], bareme: 4, reponse: "« Bonjour, nous vous remercions de nous alerter quant à la page d'erreur qui s'affiche lorsque vous essayez de vous connecter sur notre page. Notre équipe technique met tout en œuvre pour un retour à la normale dans les plus brefs délais. Bonne journée. » (problème non personnel : réponse directe rassurante.)" },
      { intitule: 'Réponse à Anthony sur Facebook (annexe 6a).', documents: ['Documents 7 et 8'], bareme: 4, reponse: "« Bonjour, afin de pouvoir vous apporter une réponse précise, je vous invite à formuler votre demande en message privé, en précisant votre nom et votre prénom ou votre numéro de téléphone. Bonne journée. » (problème personnel : pas de réponse directe, passage en message privé.)" },
      { intitule: 'Analyse de la Partie II (annexe 7).', documents: ['Documents 5 et 9'], bareme: 4, reponse: "Il s'agit de l'étape 3. La partie II du questionnaire sur Instagram correspond à cette étape car elle pose des questions sur le fait de recommander « Free » ou la « Freebox » : l'entreprise cherche à savoir si ses clients jouent les ambassadeurs." },
    ],
  },
  synthese: {
    titre: "La satisfaction et la fidélisation",
    proposition: ['Question fermée', 'Échelle de Likert', 'Écouter et interagir', 'Transformer en ambassadeurs'],
    racine: {
      id: 'racine', texte: 'La relation client',
      enfants: [
        { id: 'satis', texte: 'La satisfaction', enfants: [
          { id: 'fermee', texte: null, reponse: 'Question fermée' },
          { id: 'likert', texte: null, reponse: 'Échelle de Likert' },
        ] },
        { id: 'fidel', texte: 'La fidélisation', enfants: [
          { id: 'ecoute', texte: null, reponse: 'Écouter et interagir' },
          { id: 'ambass', texte: null, reponse: 'Transformer en ambassadeurs' },
        ] },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1', intitule: 'Identifier les types de questions',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas les types de questions.' },
          { niveau: 'debrouille', description: 'Je distingue ouverte et fermée.' },
          { niveau: 'averti', description: 'Je reconnais Likert, échelle, alternative…' },
          { niveau: 'expert', description: 'Je qualifie chaque question d\u2019un questionnaire.' },
        ],
      },
      {
        id: 'c2', intitule: 'Exploiter des résultats chiffrés',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas calculer un pourcentage.' },
          { niveau: 'debrouille', description: 'Je calcule un pourcentage simple.' },
          { niveau: 'averti', description: 'Je calcule des moyennes de pourcentages.' },
          { niveau: 'expert', description: 'Je calcule la prime à partir d\u2019un barème.' },
        ],
      },
      {
        id: 'c3', intitule: 'Répondre sur les réseaux sociaux',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas répondre à un client mécontent.' },
          { niveau: 'debrouille', description: 'Je rédige une réponse polie.' },
          { niveau: 'averti', description: 'J\u2019applique la procédure (privé / public).' },
          { niveau: 'expert', description: 'Je distingue problème personnel et non personnel.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Satisfaction client', definition: "Niveau de contentement du client après un contact ou un achat." },
      { terme: 'Fidélisation', definition: 'Ensemble des actions visant à conserver durablement un client.' },
      { terme: 'Question ouverte', definition: "Question qui laisse le client s'exprimer librement." },
      { terme: 'Question fermée', definition: 'Question à réponse précise (Oui / Non).' },
      { terme: 'Échelle de Likert', definition: 'Échelle d\u2019accord (Tout à fait d\u2019accord → Pas du tout d\u2019accord).' },
      { terme: 'Échelle d\u2019évaluation', definition: 'Note sur une plage de valeurs (ex : 0 à 10).' },
      { terme: 'Ambassadeur', definition: 'Client qui fait la promotion de la marque autour de lui.' },
      { terme: 'Prime sur objectif', definition: 'Rémunération variable versée selon l\u2019atteinte d\u2019un objectif.' },
      { terme: 'Avis positif', definition: 'Réponse favorable d\u2019un client à une question d\u2019enquête.' },
      { terme: 'Réseau social', definition: 'Plateforme (X, Facebook, Instagram) d\u2019échange avec les clients.' },
    ],
    flashcards: [
      { recto: 'Question « Oui / Non » ?', verso: 'Question fermée.' },
      { recto: 'Question « Tout à fait d\u2019accord… » ?', verso: 'Échelle de Likert.' },
      { recto: 'Question « note de 0 à 10 » ?', verso: 'Échelle d\u2019évaluation.' },
      { recto: 'Montant maximal de la prime ?', verso: '200 €.' },
      { recto: '% positifs moyen obtenu ?', verso: '87 %.' },
      { recto: 'Tranche de prime pour 87 % ?', verso: 'Entre 80 et 90 % → 80 % de la prime (160 €).' },
      { recto: 'Rémunération totale ?', verso: '1219 + 160 = 1279 €.' },
      { recto: 'Titre de l\u2019étape 3 ?', verso: 'Transformer ses clients en ambassadeurs.' },
      { recto: 'Problème personnel sur les réseaux : que faire ?', verso: 'Passer en message privé, demander nom/prénom ou n° de tél.' },
      { recto: 'Délai de réponse attendu en cas de plainte ?', verso: '72 % attendent une réponse dans l\u2019heure.' },
    ],
    quiz: [
      { type: 'unique', question: 'Question « Oui / Non » ?', options: ['Fermée', 'Ouverte', 'Likert', 'Alternative'], bonne: 0 },
      { type: 'unique', question: 'Question « note de 0 à 10 » ?', options: ['Échelle d\u2019évaluation', 'Fermée', 'Ouverte', 'Alternative'], bonne: 0 },
      { type: 'unique', question: 'Question « Tout à fait d\u2019accord » ?', options: ['Échelle de Likert', 'Fermée', 'Ouverte', 'Alternative'], bonne: 0 },
      { type: 'unique', question: 'Montant maximal de la prime ?', options: ['200 €', '100 €', '1219 €', '160 €'], bonne: 0 },
      { type: 'unique', question: '% positifs moyen obtenu ?', options: ['87 %', '78 %', '95 %', '13 %'], bonne: 0 },
      { type: 'unique', question: 'Prime perçue pour 87 % ?', options: ['160 €', '200 €', '140 €', '0 €'], bonne: 0 },
      { type: 'unique', question: 'Rémunération totale ?', options: ['1279 €', '1219 €', '1379 €', '1059 €'], bonne: 0 },
      { type: 'unique', question: 'Titre de l\u2019étape 3 ?', options: ['Transformer ses clients en ambassadeurs', 'Écouter ses clients', 'Créer une communauté', 'Vendre plus'], bonne: 0 },
      { type: 'unique', question: 'Problème personnel sur les réseaux ?', options: ['Passer en message privé', 'Répondre publiquement', 'Ignorer', 'Supprimer le message'], bonne: 0 },
      { type: 'unique', question: 'Un client ambassadeur...', options: ['Fait la promotion de la marque', 'Se plaint toujours', 'Résilie', 'Ne paie pas'], bonne: 0 },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque question dans le bon type.',
      etiquettes: ['Question fermée', 'Échelle de Likert', 'Question ouverte'],
      zones: [
        { libelle: 'Avez-vous été au téléphone ? (Oui/Non)', etiquetteIndex: 0 },
        { libelle: 'Étiez-vous à votre écoute ? (Oui/Non)', etiquetteIndex: 0 },
        { libelle: 'Le conseiller était aimable (D\u2019accord…)', etiquetteIndex: 1 },
        { libelle: 'A bien pris en charge la demande (D\u2019accord…)', etiquetteIndex: 1 },
        { libelle: 'Expliquez pourquoi il était compétent', etiquetteIndex: 2 },
        { libelle: 'Vos remarques complémentaires', etiquetteIndex: 2 },
      ],
    },
  },
}


// ---------------------------------------------------------------------------
// CONTENU : Leroy Merlin, mission 1 - La presentation de l'unite commerciale
// et de son marche
// ---------------------------------------------------------------------------
const LEROY_MERLIN_M1: ContenuMission = {
  travaux: {
    consigne:
      "Réalisez la « carte d'identité » de l'entreprise Leroy Merlin : identité, partenaires, clientèle, biens et services, concurrents et marché du bricolage.",
    contexte:
      "Vous êtes en PFMP dans l'entreprise Leroy Merlin, situé à Paris. L'enseigne est spécialisée dans l'amélioration de l'habitat (construction, aménagement, décoration, bricolage et jardinage). C'est votre premier jour et donc avant de vous confier des tâches importantes, votre responsable Mme Annie Mâle souhaite que vous vous familiarisiez avec l'entreprise, ses produits et son marché. Votre tuteur vous demande de réaliser la « carte d'identité » de celle-ci.",
    documents: [
      {
        numero: 1,
        titre: "Identité de l'entreprise",
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: "IDENTITÉ DE L'ENTREPRISE" },
          { paragraphes: ['03 28 80 80 80'] },
          { intertitre: 'Renseignements juridiques' },
          {
            tableau: {
              colonnes: ['Renseignements juridiques', ''],
              lignes: [
                ['Forme juridique', "SA à conseil d'administration"],
                ['Noms commerciaux', 'LEROY MERLIN FRANCE'],
                ['Téléphone', '03 28 80 80 80'],
                ['Adresse postale', 'RUE CHANZY 59260 LEZENNES'],
              ],
            },
          },
          {
            tableau: {
              colonnes: ["Numéros d'identification", ''],
              lignes: [
                ['Numéro SIREN', '384560942'],
                ['Numéro SIRET (siège)', '38456094200045'],
                ['Numéro TVA Intracommunautaire', 'FR49384560942'],
                ['Numéro RCS', 'Lille Metropole B 384 560 942'],
              ],
            },
          },
          {
            tableau: {
              colonnes: ['Informations commerciales', ''],
              lignes: [
                ['Catégorie', 'Commerce de détail'],
                ['Activité (Code NAF ou APE)', 'Commerce de détail de quincaillerie, peintures et verres en grandes surfaces (400 m² et plus) (4752B)'],
              ],
            },
          },
          {
            tableau: {
              colonnes: ["Taille de l'entreprise", ''],
              lignes: [
                ['Effectif moyen', '25 322'],
                ['Capital social', '100 000 000,00 €'],
                ["Chiffre d'affaires 2020", '6 607 737 500.00 €'],
              ],
            },
          },
          { intertitre: '1924' },
          {
            paragraphes: [
              "À l'issue de la première guerre mondiale, Adolphe Leroy père s'intéresse au surplus des Stocks américains, véritable mine de matériel indispensable à une époque où tout est à reconstruire, à commencer par les logements. En 1924, son fils Adolphe épouse Rose Merlin. Ensemble, le couple ouvre son premier magasin à Noeux-les-Mines. Dans les années 30, ils y proposent des maisons vendues en kit et d'autres matériaux de construction.",
            ],
          },
          { image: { src: '/docs/leroy-merlin-m1/reseaux.jpg', alt: 'Réseaux sociaux de Leroy Merlin', largeur: 240 } },
        ],
      },
      {
        numero: 2,
        titre: 'Nos partenaires actuels de recherche (Leroy Merlin Source)',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Nos partenaires actuels de recherche' },
          {
            paragraphes: [
              "L'Agence de l'environnement et de la maîtrise de l'énergie (ADEME) participe à la mise en œuvre des politiques publiques dans les domaines de l'environnement, de l'énergie et du développement durable. Elle aide en outre au financement de projets, de la recherche à la mise en œuvre (gestion des déchets, préservation des sols, efficacité énergétique et énergies renouvelables, économies de matières premières, qualité de l'air, lutte contre le bruit, transition vers l'économie circulaire…).",
              "Le Centre d'étude des mutations sociales (CEMS) rassemble des personnes physiques et morales étudiant les mutations sociales dans de nombreux domaines : travail, action sociale, discriminations, inégalités, politiques publiques, etc. Il produit des connaissances interdisciplinaires co-construites avec une pluralité d'acteurs : institutionnels, entreprises, centres de recherche… Pour réaliser ses missions de recherches scientifiques, d'expertises techniques et de conseils ou pour l'animation et l'organisation de formations, le CEMS fait appel à des chercheur.e.s en sciences humaines et sociales.",
              "Le centre d'expertise nationale en stimulation cognitive (CEN Stimco) intervient dans le champ des aides techniques pour sur la stimulation et la compensation cognitives, quels que soient l'âge, les pathologies et les handicaps des publics utilisateurs. Son action, tournée vers l'utilité sociale et basée sur des méthodes scientifiques, s'articule autour de 3 axes : l'information, la formation, l'évaluation.",
              "Le Centre Max Weber est un laboratoire de recherche de sociologie généraliste. Il regroupe un grand nombre de sociologues du site de Lyon-Saint-Étienne. Situé sur quatre sites géographiques, il est rattaché institutionnellement à quatre tutelles : le CNRS, l'École Normale Supérieure de Lyon, l'Université Jean Monnet Saint-Étienne et l'Université Lumière Lyon 2. Il est membre de la Maison des Sciences de l'Homme Lyon Saint-Étienne.",
              "Le CERLIS est un laboratoire de recherche en sciences humaines et sociales centré sur la question du lien social. Ses tutelles sont l'Université Paris Descartes, l'Université Sorbonne Nouvelle et le CNRS (Unité Mixte de Recherche 8070).",
              "Le Forum urbain a vocation à rapprocher les mondes de la recherche et des territoires avec une double ambition : ancrer la recherche dans la réalité de ceux qui font et vivent la ville (décideurs, professionnels, associations, habitants), et apporter un éclairage aux problématiques contemporaines afin d'améliorer les pratiques.",
              "Créé en 2011, le FORUM VIES MOBILES est un institut de recherche sur la mobilité qui prépare la transition vers des modes de vie plus désirés et durables. Il encadre des recherches, publie des ouvrages et organise des événements dans les domaines scientifique et artistique.",
              "Mixing Générations est un cabinet d'études et de recherche. Il ambitionne de transformer le regard de la société française sur les relations entre les générations en apportant un nouveau regard politique et culturel. Objectif : stopper l'indifférence et la stigmatisation liées à notre diversité sociale et en faire une richesse et un axe d'évolution.",
              "Agence d'études et de conseil : atelier de prospective, fabrique de services, laboratoire des usages. (Nova 7)",
              "Le laboratoire PAVE, école nationale supérieure d'architecture et du paysage de Bordeaux (Ensap Bx), travaille depuis 1998 au croisement disciplinaire entre sociologie, anthropologie et architecture pour investir la connaissance des formes matérielles des sociétés.",
              "Le laboratoire REGARDS (Recherches en Economie Gestion AgroRessources Durabilité Santé) de l'Université de Reims a pour « front de recherche » celui de la formation de préférences collectives, généralement mal appréhendée en théorie économique ou en sciences de gestion, au-delà de l'hypothèse d'une somme de préférences individuelles : résistance du consommateur, conséquences sociales et sociétales de la consommation, consommations alternatives ou émergentes, RSE, stratégies organisationnelles ou formes originales d'entrepreneuriat…",
              "SOLIHA est issu de la fusion en mai 2015 des Mouvements PACT et Habitat & Développement. Avec SOLIHA, Solidaires pour l'habitat, un nouveau Mouvement associatif est né. Ce Mouvement plus solide est capable d'apporter plus de solutions aux personnes qui rencontrent des difficultés pour se maintenir ou accéder à un logement compatible avec leurs ressources. Le Mouvement SOLIHA est le 1er acteur associatif en matière d'amélioration de l'habitat. Ce Mouvement est composé d'une Fédération nationale et de 163 organismes locaux présents sur tout le territoire national. L'Union Régionale Nouvelle-Aquitaine, regroupe 12 structures locales.",
              "Le TASDA rassemble les acteurs du bien-vieillir et développe, de façon collective, les usages des nouvelles technologies intégrées aux prises en charge à domicile de demain. Il travaille dans une démarche collective avec les usagers, les acteurs de terrain, les entreprises, les financeurs, en Auvergne Rhône-Alpes. Et selon une approche systémique intégrant la dimension des pratiques métiers, des organisations, des solutions techniques, des politiques publiques, des modèles économiques.",
            ],
          },
          { image: { src: '/docs/leroy-merlin-m1/partenaires-1.jpg', alt: 'Partenaires de recherche Leroy Merlin Source (1)' } },
          { image: { src: '/docs/leroy-merlin-m1/partenaires-2.jpg', alt: 'Partenaires de recherche Leroy Merlin Source (2)' } },
        ],
      },
      {
        numero: 3,
        titre: 'La clientèle (Leroy Merlin Studio)',
        images: [],
        texte: [
          { pageWeb: true },
          {
            paragraphes: [
              "« Notre plateforme connecte nos clients à un réseau d'architectes, souligne la responsable Nathalie Hervet. Nous avons constitué un réseau d'architectes DPLG (diplômés par l'État), des architectes d'intérieur et décorateurs. Il y a également une équipe Leroy Merlin Studio en back office afin de mettre en relation les projets soumis et l'équipe d'architectes appelé 'pilote' (38 personnes actuellement avec un objectif de 50 pilotes en fin d'année). » Concrètement, le client demande un rendez-vous téléphonique. Leroy Merlin Studio le rappelle sous 48 heures et programme une visite à domicile (tarifée à 45 euros). « Cette visite est réalisée par notre 'pilote' -architecte d'intérieur, décorateur ou architecte DPLG-. Nous faisons coïncider le profil du pilote avec le projet accompagné. Puis, nous délivrons un devis sous 10 jours afin d'aider le client à se projeter en respectant son budget. »",
            ],
          },
          { intertitre: '« Un seul pro pour diriger les travaux »' },
          {
            paragraphes: [
              "Un expert unique accompagne le client tout du long du projet de rénovation. Le slogan même du service : « Un seul pro pour diriger les travaux ». « Nous nous inscrivons dans le processus d'achat ou de réalisation du client à partir de 15 000 euros, pointe Nathalie Hervet. Cela nous permet d'avoir une prestation en cohérence avec le projet. » Aujourd'hui, le panier moyen frôle les 40 000 euros. De gros projets dédiés à la rénovation et à l'aménagement de l'habitat parisien. Les profils clients sont sensiblement différents de ceux fréquentant les magasins de l'enseigne. Une clientèle de 35-55 ans, CSP++*, n'ayant pas envie ou choisi de réaliser les travaux. « Initialement, nos points de vente sont plutôt installés en périphérie et touchent peu le cœur des villes, indique la responsable de Leroy Merlin Studio. C'est la raison pour laquelle nous avons créé ce concept digital afin de cibler les hyper urbains. » Et cerise sur le gâteau, 73% des produits sélectionnés pour réaliser les chantiers sont ceux de Leroy Merlin.",
              "Contrairement aux idées reçues selon laquelle la clientèle de Leroy Merlin serait surtout professionnel, elle est surtout composée à 98% de particuliers.",
              "Nous traitons essentiellement avec des propriétaires (69%) résidant en zone urbaine (96%). Ces données nous permettent de connaître notre clientèle.",
              "À titre indicatif, 63% de nos clients sont des hommes, contre 37% de femmes. Cette tendance tend à s'inverser car de plus en plus de femme tendent à s'initier au bricolage.",
              "* Situation professionnelle",
            ],
          },
        ],
      },
      {
        numero: 4,
        titre: 'Les services (Retour & remboursement)',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Retour & remboursement' },
          {
            paragraphes: [
              "Leroy Merlin reprend vos articles jusqu'à 6 mois après vos achats. Vous avez trouvé moins cher ailleurs ? Leroy Merlin vous rembourse la différence.",
            ],
          },
          { intertitre: 'Retour en magasin' },
          {
            paragraphes: [
              "Les magasins ne reprennent que les articles en parfait état. Si votre article est cassé ou défectueux, veuillez contacter le Service Client, qui se charge d'organiser le retour de votre article.",
              "Selon l'état général de l'article, les magasins ont la possibilité de vous rediriger vers le Service Client.",
            ],
          },
          { intertitre: 'Remboursement et remplacement' },
          {
            paragraphes: [
              "Les remboursements et remplacements d'articles retournés sont émis à réception de l'article initial par nos services.",
              "En cas de remboursement, celui-ci est effectué sur la méthode de paiement choisie pour la commande initiale. En cas de paiement par chèque, il vous est demandé de nous fournir un Relevé d'Identité Bancaire. Vous êtes averti par email dès que le remboursement est effectué.",
              "Si vous avez choisi un remplacement de votre article, veuillez noter que le délai de livraison de l'échange est calculé à réception de l'article retourné par nos services et en fonction de sa disponibilité.",
            ],
          },
          { intertitre: 'Remboursement de la différence' },
          {
            paragraphes: [
              "Nous vous remboursons la différence.",
              "Vous offrir les meilleurs produits au meilleur prix, c'est pour nous la moindre des choses. Alors, si vous trouvez moins cher dans un autre magasin, nous vous remboursons la différence (Voir conditions en magasin)",
            ],
          },
          { intertitre: 'À chaque type de colis, son tarif adapté !' },
          {
            tableau: {
              colonnes: ['Type de colis', 'Dimensions', 'Tarifs de livraison'],
              lignes: [
                ['Les petits colis', "Inférieur et égal à 30 kg et 0,5m³. Colis d'environ 1m x 1m x 0,5m. Par exemple : une perceuse", 'Retrait magasin : Gratuit. Livraison chez vous ou point retrait : 2,90€. Livraison en 24h : 6,90€'],
                ['Les gros colis', 'Supérieur à 30 Kg et inférieur à 500 Kg ou supérieur à 0.5 m³. Par exemple : du carrelage', 'Retrait magasin : Gratuit. Livraison devant chez vous ou point retrait : 49.90€. Livraison en 24h : 99.90€'],
                ['Les très gros colis', "Supérieur à 500 Kg. Par exemple : un portail, un abri de jardin…", 'Retrait magasin : Gratuit. Livraison chez vous ou point retrait : 99.90€. Livraison en 24h : 119.90€'],
              ],
            },
          },
          { image: { src: '/docs/leroy-merlin-m1/services-bandeau.jpg', alt: 'Services Leroy Merlin : retrait gratuit, livraison à domicile, retour gratuit, 6 mois pour changer d\'avis' } },
        ],
      },
      {
        numero: 5,
        titre: 'Les biens (catalogue Produits)',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Produits' },
          { image: { src: '/docs/leroy-merlin-m1/produits-grille.jpg', alt: 'Catalogue des produits Leroy Merlin' } },
          {
            puces: [
              'Carrelage, parquet et sol souple',
              'Chauffage et plomberie',
              'Menuiserie',
              'Salle de bains',
              'Décoration et éclairage',
              'Peinture et droguerie',
              'Électricité et domotique',
              'Outillage',
              'Quincaillerie',
              'Cuisine',
              'Rangement et dressing',
              'Terrasse et jardin',
              'Matériaux de construction',
              'Meuble',
            ],
          },
        ],
      },
      {
        numero: 6,
        titre: 'Les concurrents',
        images: [],
        texte: [
          { pageWeb: true },
          { image: { src: '/docs/leroy-merlin-m1/concurrents-graph.jpg', alt: 'Chiffres des enseignes concurrentes du bricolage' } },
          { intertitre: 'Schimdt « Cuisines au cœur de la maison »' },
          {
            paragraphes: [
              "Le magasin Schmidt se situe dans la région rennaise, à Melesse. C'est une société de meubles, familiale d'origine alsacienne de meubles (SALM) qui fabrique et commercialise une large gamme de meubles pour cuisines et salles de bains, de rangements et de tables et chaises.",
            ],
          },
          { intertitre: 'Mobalpa' },
          {
            paragraphes: [
              "Mobalpa est une marque de meubles de cuisines, de salles de bains et de rangements. Mobalpa - ou Mobilier des Alpes - est une marque de la société Fournier, entreprise savoyarde fondée en 1907 et installée à Thônes, en Haute-Savoie (France)",
            ],
          },
          { intertitre: 'Hygena' },
          {
            paragraphes: [
              "Hygena est un cuisiniste, équipementier de salles de bains et d'électroménager français.",
            ],
          },
          { intertitre: 'Conforama Henri Fréville « Bien chez soi, bien moins cher »' },
          {
            paragraphes: [
              "Conforama est un détaillant de mobilier et objets de décoration en kit, d'origine française. Les produits, en kit, sont quasiment tous vendus en paquets plats pour que le transport soit moins cher et que le client puisse le rapporter lui-même à son domicile et le monter.",
            ],
          },
          { intertitre: 'Ikea' },
          {
            paragraphes: [
              "Ikea est une entreprise néerlandaise d'origine suédoise, spécialisée dans la conception et la vente de détail de mobilier et objets de décoration en kit. Le concept repose sur le libre service de la grande distribution",
            ],
          },
          { intertitre: 'Alinea' },
          {
            paragraphes: [
              "Alinéa est une chaîne de détaillant de mobilier, souvent à assembler, uniquement basé en France appartenant au groupe Auchan.",
            ],
          },
          { intertitre: 'Point P' },
          {
            paragraphes: [
              "Le Groupe Point.P est une entreprise qui revendique le titre de leader en Europe de la distribution de matériaux de construction. Ainsi, ce magasin ne propose pas de cuisine à proprement parlé, seulement du matériel, dont une large gamme de plans de travail.",
            ],
          },
        ],
      },
      {
        numero: 7,
        titre: "Le marché du bricolage",
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: "Le secteur du bricolage en hausse d'environ 6%" },
          {
            paragraphes: [
              "Chez Castorama, un des géants du secteur, le chiffre d'affaires a augmenté de 6,5 % pour atteindre 2,5 milliards d'euros. Celui de Leroy Merlin a également grimpé de 5,2 % à 7,345 milliards d'euros. Cet acteur majeur a généré 546 millions d'euros de chiffre d'affaires grâce aux ventes en ligne. L'autre record : les visites enregistrées sur son site Internet : 562 millions de visites.",
              "En Europe, les trois enseignes du groupement des Mousquetaires d'équipement de la maison ont enregistré un chiffre d'affaires de 3,97 milliards d'euros. Au sein de l'Hexagone, Bricomarché, Bricorama et Brico Cash constituent le premier réseau de proximité et d'indépendants. Ainsi, les trois enseignes ont réalisé un chiffre d'affaires cumulé de 3,2 milliards d'euros, en progression de 11% l'année passée. Un chiffre d'affaires porté par les rayons jardin et décoration.",
              "Les trois enseignes ont également pu miser sur la croissance du e-commerce et du drive. Rappelons que la prise de participation dans BricoPrivé.com cette année est le signe d'une véritable volonté de transformation omnicanale, avec un renforcement des compétences digitales.",
              "Entreprise du Groupe ADEO depuis 2004, Weldom compte 213 magasins et 4 000 collaborateurs. L'enseigne a réalisé, l'année passée, un chiffre d'affaires de 884 millions d'euros.",
              "Spécialiste du commerce indépendant en bricolage de proximité en France, Mr Bricolage comptait, au 30 juin, 855 magasins sous enseigne ou affiliés dont 69 à l'International, implantés dans 9 pays. Nouvelle plateforme de marque, nouveau concept, nouvelle identité visuelle, transformation digitale, plan de développement ambitieux, nouveaux formats de magasin… Depuis quelques mois, l'enseigne met les bouchées doubles pour devenir le leader incontesté de la proximité.",
              "(+ 8% par rapport à l'année précédente)",
            ],
          },
          { image: { src: '/docs/leroy-merlin-m1/marche-camembert.jpg', alt: 'Le marché du bricolage : 24,8 milliards €', largeur: 480 } },
        ],
      },
      {
        numero: 8,
        titre: 'La concurrence (définitions et exemples)',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Document — La concurrence' },
          {
            tableau: {
              colonnes: ['', 'Concurrents directs', 'Concurrents indirects'],
              lignes: [
                [
                  'Définitions',
                  "Un concurrent direct est une entreprise ou une organisation qui propose un produit, un service ou un prix similaire ou comparable à celui d'une autre entreprise. Elles ont la même activité principale.",
                  "Un concurrent indirect est une entreprise ou une organisation dont l'activité principale n'est pas la même ou qui propose un produit ou un service comparable ou différent, mais susceptible de répondre au même besoin du consommateur.",
                ],
                [
                  'Exemple 1 : Un client qui veut aller à Toulouse il peut le faire avec la compagnie Air France',
                  "Ce client peut aussi voyager avec des concurrents directs d'Air France :\n- Easy Jet\n- Rayan Air",
                  "Ce client peut aussi voyager avec des concurrents indirects d'Air France :\n- Co-voiturage\n- Train SNCF",
                ],
                [
                  'Exemple 2 : Un client veut acheter des vêtements chez H&M',
                  "Ce client peut aussi acheter des vêtements chez des concurrents directs d'H&M :\n- Bershka\n- Zara\nL'activité principale des deux enseignes est la vente de vêtements",
                  "Ce client peut aussi acheter des vêtements chez des concurrents indirects d'H&M :\n- Louis Vuitton\n- Gucci\nIls ne proposent pas du tout les mêmes prix qu'H&M alors même qu'ils vendent aussi des vêtements.",
                ],
                [
                  'Exemple 3 : Un client veut acheter un four à micro-onde chez Darty',
                  "Ce client peut aussi acheter son four micro-onde chez des concurrents directs de Darty :\n- Boulanger\nL'activité principale des deux enseignes sont la télé, la Hi-fi et l'électroménager.",
                  "Ce client peut aussi acheter des vêtements chez des concurrents indirects Darty :\n- Carrefour\nCarrefour vend certes des micro-ondes aussi mais son activité principale est l'alimentaire.",
                ],
                [
                  'Exemple 4 : Un client cherche un appartement chez La Forêt Immobilier',
                  "Ce client peut aussi chercher son appartement chez des concurrents directs de La Forêt Immobilier :\n- ERA Immobilier\n- Century 21",
                  "Ce client peut aussi chercher son appartement chez des concurrents indirects de La Forêt Immobilier :\n- Agence immobilière en ligne\n- Magazine (ex : Particulier à Particulier)",
                ],
              ],
            },
          },
        ],
      },
    ],
    objectifs: [
      "Rechercher et actualiser les informations sur l'entreprise et son marché.",
      "Identifier l'identité, la clientèle, les biens et services, les concurrents et le marché de l'unité commerciale.",
    ],
    competence: {
      groupe: 'Compétences travaillées',
      intitule: "C.1.1 — Rechercher, actualiser les informations sur l'entreprise et son marché",
      detail: 'Maîtriser la technologie des produits.',
    },
    activites: [
      {
        titre: "Activité 1 — Identification de l'entreprise",
        questions: [
          { numero: 1, consigne: "Complétez l'identité de l'entreprise.", ressources: 'Consulter le document 1, compléter l\'annexe 1.', annexeId: 'annexe1' },
          { numero: 2, consigne: "Indiquez les partenaires de l'entreprise.", ressources: 'Consulter le document 2, compléter l\'annexe 2.', annexeId: 'annexe2' },
          { numero: 3, consigne: "Réalisez le profil-type de la clientèle de l'entreprise.", ressources: 'Consulter le document 3, compléter l\'annexe 3.', annexeId: 'annexe3' },
        ],
      },
      {
        titre: "Activité 2 — Les biens et les services de l'entreprise",
        questions: [
          { numero: 4, consigne: "Listez les différents services proposés par l'entreprise, puis cochez s'ils sont marchands ou non marchands.", ressources: 'Consulter le document 4, compléter l\'annexe 4.', annexeId: 'annexe4' },
          { numero: 5, consigne: 'Listez tous les biens proposés par Leroy Merlin à sa clientèle.', ressources: 'Consulter le document 5, compléter l\'annexe 5.', annexeId: 'annexe5' },
        ],
      },
      {
        titre: 'Activité 3 — Les concurrents',
        questions: [
          { numero: 6, consigne: "Listez les différents concurrents de l'entreprise.", ressources: 'Consulter les documents 6 et 8, compléter l\'annexe 6.', annexeId: 'annexe6' },
        ],
      },
      {
        titre: 'Activité 4 — Le marché',
        questions: [
          { numero: 7, consigne: 'Étudier le marché du bricolage.', ressources: 'Consulter le document 7, compléter l\'annexe 7.', annexeId: 'annexe7' },
        ],
      },
    ],
    annexes: [
      {
        type: 'fichesignaletique',
        id: 'annexe1',
        titre: "Annexe 1 — Identité de l'entreprise",
        champs: [
          { cle: 'denom', libelle: 'Dénomination' },
          { cle: 'secteur', libelle: "Secteur d'activité", lignes: 2 },
          { cle: 'nationalite', libelle: 'Nationalité' },
          { cle: 'datecrea', libelle: 'Date de création' },
          { cle: 'ca', libelle: "Chiffres d'affaires" },
          { cle: 'reseaux', libelle: 'Réseaux sociaux', lignes: 2 },
          { cle: 'adresse', libelle: 'Adresse', lignes: 2 },
        ],
      },
      {
        type: 'reformulation',
        id: 'annexe2',
        titre: 'Annexe 2 — Les partenaires',
        nbLignes: 6,
      },
      {
        type: 'clientele',
        id: 'annexe3',
        titre: 'Annexe 3 — La clientèle',
        typesClientele: ['Particuliers', 'Professionnels'],
        criteres: ['Sexe', "Tranche d'âge", "Lieu d'habitation", 'Panier moyen', 'Situation professionnelle'],
      },
      {
        type: 'casesservices',
        id: 'annexe4',
        titre: 'Annexe 4 — Les services',
        entete: 'Annexe 4 — Les services (Marchand = payant ; Non marchand = gratuit ou quasi-gratuit)',
        colonnes: ['Marchand', 'Non marchand'],
        nbLignes: 5,
      },
      {
        type: 'grille',
        id: 'annexe5',
        titre: 'Annexe 5 — Les biens',
        colonnes: ['Les types de biens vendus', ''],
        nbLignes: 7,
      },
      {
        type: 'concurrents',
        id: 'annexe6',
        titre: 'Annexe 6 — Les concurrents',
        entete: 'Annexe 6 — Les concurrents',
        nbLignes: 14,
      },
      {
        type: 'questionsreponses',
        id: 'annexe7',
        titre: 'Annexe 7 — Étude du marché du bricolage',
        entete: 'Annexe 7 — Étude du marché du bricolage',
        questions: [
          { libelle: "Parmi les enseignes citées, quelle est celle qui a le plus augmentée son chiffre d'affaires et celle qui a le moins augmenté ?", lignes: 2 },
          { libelle: "Quelle est l'enseigne qui a le plus augmenté son chiffre d'affaires en pourcentage ?", lignes: 2 },
          { libelle: "Listez l'ensemble des actions mises en œuvre par Mr Bricolage pour devenir le leader du marché du bricolage de proximité ?", lignes: 3 },
          { libelle: "Quel est le chiffre d'affaires de Weldom ?", lignes: 1 },
          { libelle: 'De quel groupe fait partie Bricorama ?', lignes: 1 },
          { libelle: "Quelles sont les deux méthodes de vente qui ont permis aux enseignes de bricolage d'augmenter autant leur chiffre d'affaires ?", lignes: 2 },
        ],
      },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: "Complétez l'identité de l'entreprise.",
        documents: ['Document 1', 'Annexe 1'],
        bareme: 4,
        reponse: '',
        tableau: {
          colonnes: ['Élément', 'Réponse attendue'],
          lignes: [
            ['Dénomination', 'Leroy Merlin'],
            ["Secteur d'activité", 'Commerce de détail de quincaillerie, peinture et verre en grandes surfaces'],
            ['Nationalité', 'Française'],
            ['Date de création', '1924'],
            ["Chiffres d'affaires", '6 244 471 900 €'],
            ['Réseaux sociaux', 'Facebook ; Twitter ; Pinterest'],
            ['Adresse', 'Rue Chanzy 59260 LEZENNES'],
          ],
        },
      },
      {
        intitule: "Indiquez les partenaires de l'entreprise.",
        documents: ['Document 2', 'Annexe 2'],
        bareme: 3,
        reponse:
          "ADEME – CEMS – Broca Living Lab – Max Weber – CERLIS – Forum Urbain – Mobile Lives FORUM Vie Mobile – Mixing Generations – Nova 7 – PAVE – Regards – Union Régionale SOLIHA – TASDA",
      },
      {
        intitule: "Réalisez le profil-type de la clientèle de l'entreprise.",
        documents: ['Document 3', 'Annexe 3'],
        bareme: 5,
        reponse: '',
        tableau: {
          colonnes: ['Critère', 'Réponse', 'Pourcentage'],
          lignes: [
            ['Type de clientèle — Particuliers', 'Coché', '98 %'],
            ['Type de clientèle — Professionnels', 'Coché', '2 %'],
            ['Sexe', 'Hommes', '63 %'],
            ["Tranche d'âge", '35 – 55 ans', ''],
            ["Lieu d'habitation", 'Résidant en zone urbaine', '96 %'],
            ['Panier moyen', '40 000 €', ''],
            ['Situation professionnelle', 'CSP++', ''],
          ],
        },
      },
      {
        intitule: "Listez les différents services proposés par l'entreprise, puis cochez s'ils sont marchands ou non marchands.",
        documents: ['Document 4', 'Annexe 4'],
        bareme: 5,
        reponse: '',
        tableau: {
          colonnes: ['Les services', 'Marchand', 'Non marchand'],
          lignes: [
            ['Remboursement et remplacement', '', 'X'],
            ['Remboursement de la différence', '', 'X'],
            ['Retrait gratuit en magasin', '', 'X'],
            ['Livraison à domicile', 'X', ''],
            ['Retour gratuit en magasin', '', 'X'],
          ],
        },
      },
      {
        intitule: 'Listez tous les biens proposés par Leroy Merlin à sa clientèle.',
        documents: ['Document 5', 'Annexe 5'],
        bareme: 4,
        reponse:
          "Carrelage, parquet et sol souple ; Chauffage et plomberie ; Menuiserie ; Salle de bains ; Décoration et éclairage ; Peinture et droguerie ; Électricité et domotique ; Outillage ; Quincaillerie ; Cuisine ; Rangement / dressing ; Terrasse et jardin ; Matériaux de construction ; Meuble.",
      },
      {
        intitule: "Listez les différents concurrents de l'entreprise.",
        documents: ['Document 6', 'Document 8', 'Annexe 6'],
        bareme: 7,
        reponse: '',
        tableau: {
          colonnes: ['Nom des concurrents', 'Concurrent', 'Justification'],
          lignes: [
            ['Castorama', 'Direct', 'Même activité principale'],
            ['Brico Dépôt', 'Direct', 'Même activité principale'],
            ['Brico Marché', 'Direct', 'Même activité principale'],
            ['Mano Mano', 'Direct', 'Même activité principale'],
            ['Mr. Bricolage', 'Direct', 'Même activité principale'],
            ['Bricorama', 'Direct', 'Même activité principale'],
            ['Lapeyre', 'Direct', 'Même activité principale'],
            ['Weldom', 'Indirect', 'Activité principale différente'],
            ['Schmidt', 'Indirect', 'Activité principale différente'],
            ['Mobalpa', 'Indirect', 'Activité principale différente'],
            ['Hygena', 'Indirect', 'Activité principale différente'],
            ['Ikea', 'Indirect', 'Activité principale différente'],
            ['Alinéa', 'Indirect', 'Activité principale différente'],
            ['Point P.', 'Indirect', 'Activité principale différente'],
          ],
        },
      },
      {
        intitule: 'Étudier le marché du bricolage.',
        documents: ['Document 7', 'Annexe 7'],
        bareme: 6,
        reponse: '',
        tableau: {
          colonnes: ['Questions', 'Réponses'],
          lignes: [
            ["Celle qui a le plus / le moins augmenté son CA en €", "Plus augmenté : Leroy Merlin (7,345 milliards d'€). Moins augmenté : Castorama (2,5 milliards d'€)."],
            ["Enseigne qui a le plus augmenté son CA en %", 'En progression de 11% l\'an passé (Bricomarché, Bricorama et Brico Cash).'],
            ['Actions de Mr Bricolage pour devenir le leader de proximité', 'Nouvelle plateforme de marque, nouveau concept, nouvelle identité visuelle, transformation digitale, plan de développement ambitieux, nouveaux formats de magasin…'],
            ["Chiffre d'affaires de Weldom", "884 millions d'€"],
            ['Groupe de Bricorama', 'Les Mousquetaires'],
            ['Deux méthodes de vente', 'En magasin ; Sur internet (e-commerce)'],
          ],
        },
      },
    ],
  },
  synthese: {
    titre: "Présentation de l'unité commerciale et de son marché",
    proposition: [
      'Particuliers',
      'Hommes',
      '40 000 €',
      'Les biens',
      'Les services',
      'Concurrents directs',
      'Concurrents indirects',
    ],
    racine: {
      id: 'racine',
      texte: 'Leroy Merlin',
      enfants: [
        {
          id: 'clientele',
          texte: 'Le profil-type de la clientèle',
          enfants: [
            { id: 'cl-1', texte: 'Types de clientèle', enfants: [{ id: 'cl-1-1', texte: null, reponse: 'Particuliers' }] },
            { id: 'cl-2', texte: 'Sexe', enfants: [{ id: 'cl-2-1', texte: null, reponse: 'Hommes' }] },
            { id: 'cl-3', texte: 'Panier moyen', enfants: [{ id: 'cl-3-1', texte: null, reponse: '40 000 €' }] },
          ],
        },
        {
          id: 'produits',
          texte: 'Les produits vendus par l\'entreprise',
          enfants: [
            { id: 'pr-1', texte: null, reponse: 'Les biens' },
            { id: 'pr-2', texte: null, reponse: 'Les services' },
          ],
        },
        {
          id: 'concurrents',
          texte: 'Les types de concurrents',
          enfants: [
            { id: 'co-1', texte: null, reponse: 'Concurrents directs' },
            { id: 'co-2', texte: null, reponse: 'Concurrents indirects' },
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
          { niveau: 'averti', description: "Je décris l'identité de l'unité de façon structurée." },
          { niveau: 'expert', description: "Je décris l'unité et je la situe sur son marché." },
        ],
      },
      {
        id: 'c2',
        intitule: 'Distinguer les biens et les services',
        indicateurs: [
          { niveau: 'novice', description: "Je ne connais pas l'offre de l'enseigne." },
          { niveau: 'debrouille', description: "Je cite quelques éléments de l'offre." },
          { niveau: 'averti', description: 'Je distingue clairement les biens et les services (marchands / non marchands).' },
          { niveau: 'expert', description: "Je relie chaque élément de l'offre à un besoin client." },
        ],
      },
      {
        id: 'c3',
        intitule: 'Identifier les concurrents et le marché',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas distinguer un concurrent direct d\'un concurrent indirect.' },
          { niveau: 'debrouille', description: 'Je cite quelques concurrents sans les classer.' },
          { niveau: 'averti', description: 'Je classe les concurrents (directs / indirects) et je les justifie.' },
          { niveau: 'expert', description: 'Je situe l\'enseigne sur son marché à partir de données chiffrées.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Unité commerciale', definition: 'Lieu physique ou virtuel où un client peut accéder à une offre de biens et de services.' },
      { terme: 'Bien', definition: 'Produit matériel et tangible que l\'on peut stocker (ex : une perceuse, du carrelage).' },
      { terme: 'Service', definition: 'Prestation immatérielle proposée au client (ex : livraison, retour, remboursement).' },
      { terme: 'Service marchand', definition: 'Service payant fourni par l\'entreprise (ex : livraison à domicile).' },
      { terme: 'Service non marchand', definition: 'Service gratuit ou quasi-gratuit (ex : retrait gratuit en magasin).' },
      { terme: 'Concurrent direct', definition: 'Entreprise ayant la même activité principale et proposant un produit ou un prix comparable.' },
      { terme: 'Concurrent indirect', definition: 'Entreprise dont l\'activité principale diffère mais qui répond au même besoin du consommateur.' },
      { terme: 'Panier moyen', definition: 'Montant moyen dépensé par un client lors d\'un achat.' },
      { terme: 'CSP', definition: 'Catégorie socio-professionnelle ; CSP++ désigne les catégories les plus aisées.' },
      { terme: 'Partenaire', definition: 'Organisation associée à l\'entreprise pour mener des projets communs (recherche, financement…).' },
    ],
    flashcards: [
      { recto: 'Date de création de Leroy Merlin ?', verso: '1924' },
      { recto: "Chiffre d'affaires de Leroy Merlin ?", verso: '6 244 471 900 €' },
      { recto: 'Part de particuliers dans la clientèle ?', verso: '98 %' },
      { recto: 'Panier moyen (Leroy Merlin Studio) ?', verso: '40 000 €' },
      { recto: 'Un concurrent direct, c\'est…', verso: 'Une enseigne ayant la même activité principale.' },
      { recto: 'Un concurrent indirect, c\'est…', verso: 'Une enseigne d\'activité différente répondant au même besoin.' },
      { recto: 'Groupe de Bricorama ?', verso: 'Les Mousquetaires' },
      { recto: "Chiffre d'affaires de Weldom ?", verso: "884 millions d'€" },
    ],
    quiz: [
      { type: 'unique', question: 'En quelle année Leroy Merlin a-t-il été créé ?', options: ['1907', '1924', '1959', '2004'], bonne: 1 },
      { type: 'unique', question: 'Quelle est la part de particuliers dans la clientèle ?', options: ['69 %', '96 %', '98 %', '63 %'], bonne: 2 },
      { type: 'qcm', question: 'Parmi ces enseignes, lesquelles sont des concurrents DIRECTS de Leroy Merlin ?', options: ['Castorama', 'Ikea', 'Brico Dépôt', 'Point P'], bonnes: [0, 2] },
      { type: 'unique', question: 'La livraison à domicile est un service…', options: ['Non marchand', 'Marchand', 'Gratuit', 'Interdit'], bonne: 1 },
      { type: 'unique', question: 'De quel groupe fait partie Bricorama ?', options: ['ADEO', 'Les Mousquetaires', 'Auchan', 'Kingfisher'], bonne: 1 },
      { type: 'trous', texte: 'Un concurrent {x} a la même activité principale, un concurrent {x} a une activité différente.', reponses: ['direct', 'indirect'] },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque enseigne comme concurrent direct ou indirect de Leroy Merlin.',
      etiquettes: ['Castorama', 'Brico Dépôt', 'Ikea', 'Mobalpa'],
      zones: [
        { libelle: 'Concurrent direct', etiquetteIndex: 0 },
        { libelle: 'Concurrent direct', etiquetteIndex: 1 },
        { libelle: 'Concurrent indirect', etiquetteIndex: 2 },
        { libelle: 'Concurrent indirect', etiquetteIndex: 3 },
      ],
    },
  },
}



// ---------------------------------------------------------------------------
// CONTENU : Leroy Merlin, mission 2 - La recherche des besoins et la
// proposition de produit
// ---------------------------------------------------------------------------
const LEROY_MERLIN_M2: ContenuMission = {
  travaux: {
    consigne:
      "Recherchez les besoins du couple Sankouraga (mobiles, motivations, freins), reformulez leurs attentes, puis proposez le produit adapté à l'aide de la méthode QQCCP et du configurateur de dressing.",
    contexte:
      "Un couple, Mme et M. Sankouraga, est venu se renseigner pour l'achat d'un dressing. Vous les avez accueillis en leur offrant une boisson chaude. Il est temps pour vous de vous lancer dans la recherche de leurs besoins avant de leur proposer le produit adapté à leurs critères.",
    documents: [
      {
        numero: 1,
        titre: 'Intervention du couple',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Document 1 — Intervention du couple' },
          {
            dialogue: [
              { locuteur: 'Le commercial', texte: 'Bonjour Madame, Monsieur ! Comment puis-je vous aider ?', italique: true },
              { locuteur: 'M. Sankouraga', texte: "Bonjour ! Nous avons emménagé dans notre nouvel appartement il y a quelques semaines et nous souhaitons faire un dressing. Les anciens propriétaires en avait laissé un, mais on a trouvé qu'il était abîmé et plus vraiment au goût du jour, donc on l'a enlevé. C'est pour cela qu'on recherche quelque chose de plus contemporain." },
              { locuteur: 'Mme Sankouraga', texte: "Effectivement ! Du coup on a un peu regardé sur internet et on a vu que de nos jours on fait de très beaux dressings. On aimerait bien un modèle en bois recyclé et spacieux car nous sommes des fashions-addict. On a tous les deux pas mal de vêtements et pas beaucoup de place pour les ranger." },
              { locuteur: 'Le commercial', texte: 'Je comprends tout à fait. Et vous avez déjà une idée de ce qui vous plairait ?', italique: true },
              { locuteur: 'M. Sankouraga', texte: "Oui, on a un peu regardé ! On voudrait vraiment quelque chose de beau, avec une belle couleur naturelle… Un truc qui nous plait vraiment quoi !" },
              { locuteur: 'Mme Sankouraga', texte: "Je suis d'accord, mais après tu sais comment est ta mère. Comme d'habitude quand elle le verra, je n'ai pas envie qu'elle nous dise qu'on a exagéré en dépensant autant pour un dressing." },
              { locuteur: 'M. Sankouraga', texte: "C'est pas faux ! Mais bon…", italique: true },
              { locuteur: 'Mme Sankouraga', texte: "…Bref ! après tout, je me dis que si on veut quelque chose de bien il faut y mettre le prix. Chez mes parents la cuisine et la salle de bains ont été faites par Leroy Merlin et à chaque fois qu'il y a eu un problème tout a été pris en charge par la garantie. Et ça, c'est super important pour nous !" },
              { locuteur: 'M. Sankouraga', texte: "C'est vrai, mais tu te rappelles comment on a galéré pour monter tout ça ? On a pris presque 4 jours pour la cuisine. Plus jamais ! J'ai pas les compétences pour faire du montage ! Je préfère payer pour le faire." },
            ],
          },
          { paragraphes: ['* Fashions-addict : accro à la mode'] },
        ],
      },
      {
        numero: 2,
        titre: "Les mobiles d'achat (SONCASE)",
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: "Document 2 — Les mobiles d'achat" },
          {
            tableau: {
              colonnes: ['S O N C A S E', 'Typologie', 'Exemples'],
              lignes: [
                ['S', 'comme Sécurité', 'Produit solide, fiable, robuste, garantie, de qualité'],
                ['O', 'comme Orgueil', 'Produit prestigieux, de marque'],
                ['N', 'comme Nouveauté', 'Produit récent, à la mode, innovant, moderne'],
                ['C', 'comme Confort', "Produit pratique, facile d'utilisation, efficace"],
                ['A', 'comme Argent', 'Paiement en plusieurs fois, produit économique, en promotion'],
                ['S', 'comme Sympathie', "Plaisir procuré par l'achat, attirance pour une couleur, forme…"],
                ['E', 'comme Environnement', 'Produit durable, écologique'],
              ],
            },
          },
        ],
      },
      {
        numero: 3,
        titre: "Les motivations d'achat",
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: "Document 3 — Les motivations d'achat" },
          {
            tableau: {
              colonnes: ['Typologies', 'Définition'],
              lignes: [
                ['Hédoniste ou personnelle', 'Achat pour se faire plaisir'],
                ['Oblative ou altruiste', 'Achat pour faire plaisir aux autres'],
                ['Auto-expression', "Achat pour s'affirmer, se démarquer des autres"],
              ],
            },
          },
        ],
      },
      {
        numero: 4,
        titre: "Les freins à l'achat",
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: "Document 4 — Les freins à l'achat" },
          {
            paragraphes: [
              "Les freins d'achat sont les causes matériels ou psychologique qui empêchent ou retarde la décision d'achat.",
              'Les freins sont de trois ordres :',
            ],
          },
          { puces: ['La peur ;', "L'inhibition ;", 'Le prix.'] },
          {
            paragraphes: [
              "La peur peut avoir différentes causes : la peur de ne pas savoir utiliser le produit ou la peur du danger, de l'utilisation, ou des produits chimiques.",
              "L'inhibition elle aussi peut avoir différentes causes tels que la crainte d'être mal jugé, le ridicule, le sentiment de gêne ou de honte.",
              'Enfin, le prix : le client trouve le produit trop cher ou pas assez cher.',
            ],
          },
        ],
      },
      {
        numero: 5,
        titre: 'Reformuler les besoins des prospects',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Document 5 — Reformuler les besoins des prospects' },
          { paragraphes: ['1 — Les types de reformulation :'] },
          {
            tableau: {
              colonnes: ['Types de reformulation', 'Définition', 'Exemple'],
              lignes: [
                ['Écho ou perroquet', 'Elle consiste à répéter les paroles du client ou un terme important… comme un perroquet', "Le client : Je n'aime pas ce modèle.\nLe commercial : Vous n'aimez pas ce modèle ?"],
                ['Miroir ou reflet', 'Vous reformulez les propos du client avec vos propres mots', "- En d'autres termes…\n- Vous voulez dire que…"],
                ['Résumé ou synthèse', 'Vous faites une synthèse de tout ce que vous a dit le client', "Si j'ai bien compris… C'est bien cela ?"],
              ],
            },
          },
          { paragraphes: ['2 — Exemple :', 'Le client : « Un bon prix ? »'] },
          {
            tableau: {
              colonnes: ['Type', 'Exemple'],
              lignes: [
                ['Écho ou perroquet', '« Un bon prix ? »'],
                ['Miroir ou reflet', "« En d'autres termes, vous recherchez donc une voiture d'occasion, avec une fonction GPS simple à utiliser et à un prix raisonnable ? »"],
                ['Résumé ou synthèse', "« Si j'ai bien compris vous en recherchez une d'occasion, qui vous permettra de calculer facilement vos trajets et à un bon prix. C'est bien cela ? »"],
              ],
            },
          },
        ],
      },
      {
        numero: 6,
        titre: 'La présentation des produits (méthode QQCCP)',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Document 6 — La présentation des produits' },
          { paragraphes: ['Lorsque vous présenterez la solution que vous avez retenue pour le client, vous appliquerez la technique QQCCP.'] },
          {
            tableau: {
              colonnes: ['QQCCP', 'Caractéristiques'],
              lignes: [
                ['Quand ?', "Au moment où :\n- Le client le demande ;\n- Le vendeur connaît les mobiles d'achat du client/prospect"],
                ['Quel produit ?', "Le produit :\n- Qui correspond aux mobiles d'achat du client/prospect ;\n- Qui correspond aux caractéristiques énoncées par le client/prospect."],
                ['Combien ?', "Le commercial présente :\n- Un produit, celui qui correspond le mieux aux critères du client/prospect ;\n- Deux produits : le produit correspondant au client et un produit moins cher ;\n- Trois produits : le produit correspondant au client, plus un produit d'entrée de gamme, moins cher et enfin un produit haut de gamme, plus cher."],
                ['Comment ?', "Il faut :\n- Faire essayer le produit ;\n- Favoriser la prise en main du produit ;\n- Inciter le client/prospect à se projeter avec le produit dans son environnement personnel (maison ou travail e fonction du produit)"],
                ['Pourquoi ?', "Le commercial incite le client/prospect à se projeter pour lui donner le sentiment que le produit lui appartient déjà."],
              ],
            },
          },
        ],
      },
      {
        numero: 7,
        titre: 'Les exigences de Mme et M. Sankouraga',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Document 7 — Les exigences de Mme et M. Sankouraga' },
          { image: { src: '/docs/leroy-merlin-m2/dressing-situation.jpg', alt: 'Dressing en situation', largeur: 380 } },
          {
            puces: [
              'On cherche des caissons standards',
              'Des caissons couleur chêne, ça serait pas mal',
              'Le mur de gauche fait 3m30',
              '200cm de hauteur pour les caissons, c\'est bien !',
              '45 cm de profondeur pour les caissons c\'est suffisant',
              'C\'est du parquet marron',
              'Avec des poignées en métal',
              'Dans la chambre on a des murs gris',
              'Une porte de H100 x L40',
              'Le mur de droite fait 3m30',
              '2 tiroirs chacun ça nous paraît bien !',
              'Il y 2m de hauteur sous plafond',
              'Non, non ! il n\'y a aucune contrainte',
              'Je crois que le mur d\'en face fait 4m',
              '220cm de largeur pour les caissons',
            ],
          },
        ],
      },
    ],
    objectifs: [
      "Identifier les mobiles, motivations et freins d'achat d'un client.",
      'Reformuler les besoins et proposer un produit adapté à l\'aide de la méthode QQCCP.',
    ],
    competence: {
      groupe: 'Compétences travaillées',
      intitule: 'C.1.2 — Réaliser la vente dans un cadre omnicanal',
      detail: "Rechercher les besoins du client, reformuler et proposer une solution adaptée.",
    },
    activites: [
      {
        titre: "Activité 1 — Les mobiles, motivations et freins à l'achat des prospects",
        questions: [
          { numero: 1, consigne: "Retrouvez les mobiles d'achat du couple en indiquant à chaque fois le mot ou le groupe de mots permettant de justifier votre choix.", ressources: 'Consulter les documents 1 et 2, compléter l\'annexe 1.', annexeId: 'annexe1' },
          { numero: 2, consigne: "Cochez la motivation d'achat du couple puis justifiez la en citant le texte.", ressources: 'Consulter les documents 1 et 3, compléter l\'annexe 2.', annexeId: 'annexe2' },
          { numero: 3, consigne: "Relevez dans l'intervention du couple, les deux freins liés à l'achat puis cochez le type de frein.", ressources: 'Consulter les documents 1 et 4, compléter l\'annexe 3.', annexeId: 'annexe3' },
        ],
      },
      {
        titre: 'Activité 2 — La reformulation',
        questions: [
          { numero: 4, consigne: "Reformulez les besoins du client en utilisant la « reformulation synthèse ».", ressources: 'Consulter le document 5, compléter l\'annexe 4.', annexeId: 'annexe4' },
        ],
      },
      {
        titre: "Activité 3 — La proposition d'une solution adaptée",
        questions: [
          { numero: 5, consigne: "Préparez la présentation du produit en utilisant la méthode « QQCCP ». Pour chaque lettre, choisissez la caractéristique qui s'applique le mieux au cas de vos clients.", ressources: 'Consulter le document 6, compléter l\'annexe 5.', annexeId: 'annexe5' },
          { numero: 6, consigne: 'Après avoir lu les réponses du couple, complétez le logiciel qui permettra de proposer le dressing leur correspondant.', ressources: 'Consulter le document 7, compléter l\'annexe 6.', annexeId: 'annexe6' },
          { numero: 7, consigne: 'Indiquez les caractéristiques du produit proposé au couple.', ressources: 'Relire l\'annexe 6, compléter l\'annexe 7.', annexeId: 'annexe7' },
        ],
      },
    ],
    annexes: [
      {
        type: 'soncase',
        id: 'annexe1',
        titre: "Annexe 1 — Mobile(s) d'achat du couple Sankouraga",
        colonneCoche: "Cocher le(s) mobile(s) d'achat du couple",
        colonneJustif: 'Justification',
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
        id: 'annexe2',
        titre: "Annexe 2 — Les motivations d'achat du couple",
        colonneCoche: 'La ou les motivation(s) du couple',
        colonneJustif: 'Justification',
        lignes: [
          { id: 'hedoniste', libelle: 'Hédoniste' },
          { id: 'oblative', libelle: 'Oblative' },
          { id: 'autoexpression', libelle: 'Auto-expression' },
        ],
      },
      {
        type: 'freins',
        id: 'annexe3',
        titre: 'Annexe 3 — Les freins de M. et Mme Sankouraga',
        entete: 'Annexe 3 — Les freins de M. et Mme Sankouraga',
        colonnes: ['Peur', 'Inhibition', 'Prix'],
        nbLignes: 2,
      },
      {
        type: 'reformulation',
        id: 'annexe4',
        titre: 'Annexe 4 — La reformulation des besoins du couple Sankouraga',
        nbLignes: 4,
      },
      {
        type: 'ficheappel',
        id: 'annexe5',
        titre: 'Annexe 5 — La méthode QQCCP',
        sections: [
          { cle: 'quand', libelle: 'Quand ?', lignes: 2 },
          { cle: 'quel', libelle: 'Quel produit ?', lignes: 3 },
          { cle: 'combien', libelle: 'Combien ?', lignes: 2 },
          { cle: 'comment', libelle: 'Comment ?', lignes: 2 },
          { cle: 'pourquoi', libelle: 'Pourquoi ? (Rédiger la phrase que vous prononcerez pour inciter les clients à se projeter)', lignes: 3 },
        ],
      },
      {
        type: 'simulateur',
        id: 'annexe6',
        titre: 'Annexe 6 — Concevoir mon aménagement intérieur',
        introTitre: "CONCEVOIR L'AMÉNAGEMENT DE MON DRESSING SUR MESURE",
        introTexte: 'Reportez les réponses du couple Sankouraga (document 7) dans le configurateur. Répondez aux questions une par une : dimensions, caissons, tiroirs et accessoires, puis validez pour obtenir le produit correspondant.',
        introBouton: 'Je conçois mon dressing',
        enteteTitre: "Leroy Merlin — Configurateur de dressing sur mesure",
        accrocheTitre: 'Concevez votre dressing',
        accrocheSousTitre: '… en 15 étapes',
        libelleEtape: 'Question',
        libelleResultatProgression: 'PRODUIT',
        resultatTitreOk: 'Votre dressing est prêt !',
        nbEtapesAffiche: 15,
        etapes: [
          { id: 'plafond', bandeau: 'DIMENSIONS', question: '1. Hauteur plafond', options: [
            { libelle: '150 cm', vers: 'murg' }, { libelle: '180 cm', vers: 'murg' }, { libelle: '190 cm', vers: 'murg' },
            { libelle: '200 cm', vers: 'murg' }, { libelle: '210 cm', vers: 'murg' }, { libelle: '220 cm', vers: 'murg' }, { libelle: '250 cm', vers: 'murg' },
          ] },
          { id: 'murg', bandeau: 'DIMENSIONS', question: '2. Largeur du mur de gauche', options: [
            { libelle: '250 cm', vers: 'murf' }, { libelle: '260 cm', vers: 'murf' }, { libelle: '270 cm', vers: 'murf' }, { libelle: '280 cm', vers: 'murf' },
            { libelle: '290 cm', vers: 'murf' }, { libelle: '300 cm', vers: 'murf' }, { libelle: '310 cm', vers: 'murf' }, { libelle: '320 cm', vers: 'murf' },
            { libelle: '330 cm', vers: 'murf' }, { libelle: '340 cm', vers: 'murf' }, { libelle: '350 cm', vers: 'murf' }, { libelle: '360 cm', vers: 'murf' },
            { libelle: '370 cm', vers: 'murf' }, { libelle: '380 cm', vers: 'murf' }, { libelle: '390 cm', vers: 'murf' }, { libelle: '400 cm', vers: 'murf' },
          ] },
          { id: 'murf', bandeau: 'DIMENSIONS', question: "3. Largeur du mur d'en face", options: [
            { libelle: '250 cm', vers: 'murd' }, { libelle: '260 cm', vers: 'murd' }, { libelle: '270 cm', vers: 'murd' }, { libelle: '280 cm', vers: 'murd' },
            { libelle: '290 cm', vers: 'murd' }, { libelle: '300 cm', vers: 'murd' }, { libelle: '310 cm', vers: 'murd' }, { libelle: '320 cm', vers: 'murd' },
            { libelle: '330 cm', vers: 'murd' }, { libelle: '340 cm', vers: 'murd' }, { libelle: '350 cm', vers: 'murd' }, { libelle: '360 cm', vers: 'murd' },
            { libelle: '370 cm', vers: 'murd' }, { libelle: '380 cm', vers: 'murd' }, { libelle: '390 cm', vers: 'murd' }, { libelle: '400 cm', vers: 'murd' },
          ] },
          { id: 'murd', bandeau: 'DIMENSIONS', question: '4. Largeur du mur de droite', options: [
            { libelle: '250 cm', vers: 'mursm' }, { libelle: '260 cm', vers: 'mursm' }, { libelle: '270 cm', vers: 'mursm' }, { libelle: '280 cm', vers: 'mursm' },
            { libelle: '290 cm', vers: 'mursm' }, { libelle: '300 cm', vers: 'mursm' }, { libelle: '310 cm', vers: 'mursm' }, { libelle: '320 cm', vers: 'mursm' },
            { libelle: '330 cm', vers: 'mursm' }, { libelle: '340 cm', vers: 'mursm' }, { libelle: '350 cm', vers: 'mursm' }, { libelle: '360 cm', vers: 'mursm' },
            { libelle: '370 cm', vers: 'mursm' }, { libelle: '380 cm', vers: 'mursm' }, { libelle: '390 cm', vers: 'mursm' }, { libelle: '400 cm', vers: 'mursm' },
          ] },
          { id: 'mursm', bandeau: 'DIMENSIONS', question: '5. Couleur des murs', options: [
            { libelle: 'Blanc', vers: 'sol' }, { libelle: 'Noir', vers: 'sol' }, { libelle: 'Beige', vers: 'sol' }, { libelle: 'Gris', vers: 'sol' },
            { libelle: 'Marron', vers: 'sol' }, { libelle: 'Rouge', vers: 'sol' }, { libelle: 'Jaune', vers: 'sol' }, { libelle: 'Vert', vers: 'sol' },
            { libelle: 'Bleu', vers: 'sol' }, { libelle: 'Rose', vers: 'sol' }, { libelle: 'Violet', vers: 'sol' },
          ] },
          { id: 'sol', bandeau: 'DIMENSIONS', question: '6. Couleur du sol', options: [
            { libelle: 'Blanc', vers: 'contraintes' }, { libelle: 'Noir', vers: 'contraintes' }, { libelle: 'Beige', vers: 'contraintes' }, { libelle: 'Gris', vers: 'contraintes' },
            { libelle: 'Marron', vers: 'contraintes' }, { libelle: 'Rouge', vers: 'contraintes' }, { libelle: 'Jaune', vers: 'contraintes' }, { libelle: 'Vert', vers: 'contraintes' },
            { libelle: 'Bleu', vers: 'contraintes' }, { libelle: 'Rose', vers: 'contraintes' }, { libelle: 'Violet', vers: 'contraintes' },
          ] },
          { id: 'contraintes', bandeau: 'DIMENSIONS', question: '7. Contraintes', options: [
            { libelle: 'Fenêtres', vers: 'decor' }, { libelle: 'Portes', vers: 'decor' }, { libelle: 'Escaliers', vers: 'decor' }, { libelle: 'Cheminée', vers: 'decor' }, { libelle: 'Aucune', vers: 'decor' },
          ] },
          { id: 'decor', bandeau: 'CAISSONS', question: '8. Choix du décor (couleur)', options: [
            { libelle: 'Anthracite (gris)', vers: 'profondeur' }, { libelle: 'Blanc', vers: 'profondeur' }, { libelle: 'Effet chêne naturel', vers: 'profondeur' },
          ] },
          { id: 'profondeur', bandeau: 'CAISSONS', question: '9. Choix de la profondeur', options: [
            { libelle: '15 cm', vers: 'hauteur' }, { libelle: '30 cm', vers: 'hauteur' }, { libelle: '45 cm', vers: 'hauteur' }, { libelle: '60 cm', vers: 'hauteur' },
          ] },
          { id: 'hauteur', bandeau: 'CAISSONS', question: '10. Choix de la hauteur', options: [
            { libelle: '100 cm', vers: 'largeur' }, { libelle: '200 cm', vers: 'largeur' }, { libelle: '240 cm', vers: 'largeur' },
          ] },
          { id: 'largeur', bandeau: 'CAISSONS', question: '11. Choix de la largeur', options: [
            { libelle: '120 cm', vers: 'meubles' }, { libelle: '130 cm', vers: 'meubles' }, { libelle: '140 cm', vers: 'meubles' }, { libelle: '150 cm', vers: 'meubles' },
            { libelle: '160 cm', vers: 'meubles' }, { libelle: '170 cm', vers: 'meubles' }, { libelle: '180 cm', vers: 'meubles' }, { libelle: '190 cm', vers: 'meubles' },
            { libelle: '200 cm', vers: 'meubles' }, { libelle: '210 cm', vers: 'meubles' }, { libelle: '220 cm', vers: 'meubles' },
          ] },
          { id: 'meubles', bandeau: 'CAISSONS', question: '12. Les meubles', options: [
            { libelle: 'Caissons standars', vers: 'tiroirs' }, { libelle: "Caissons d'angle", vers: 'tiroirs' },
          ] },
          { id: 'tiroirs', bandeau: 'TIROIRS ET ACCESSOIRES', question: '13. Nombre de tiroirs', options: [
            { libelle: '1', vers: 'poignees' }, { libelle: '2', vers: 'poignees' }, { libelle: '3', vers: 'poignees' }, { libelle: '4', vers: 'poignees' }, { libelle: '5', vers: 'poignees' },
          ] },
          { id: 'poignees', bandeau: 'TIROIRS ET ACCESSOIRES', question: '14. Types de poignées', options: [
            { libelle: 'Standard (en métal)', vers: 'portes' }, { libelle: 'En bois', vers: 'portes' }, { libelle: 'En plastique', vers: 'portes' },
          ] },
          { id: 'portes', bandeau: 'TIROIRS ET ACCESSOIRES', question: '15. Portes', options: [
            { libelle: 'H40 x L40', vers: 'resultat' }, { libelle: 'H100 x L40', vers: 'resultat' }, { libelle: 'H200 x L40', vers: 'resultat' }, { libelle: 'Aucune porte', vers: 'resultat' },
          ] },
        ],
        resultats: [
          { id: 'resultat', type: 'ok', texte: "Vu de face du dressing et des murs de votre chambre. Produit : Dressing chêne H.200 x L.240 x P.45cm Home — 1492.86 € / Lot (dont 12.04 € éco-participation). Référence : 83299641. Retrait en magasin : DISPONIBLE. Livraison chez vous : DISPONIBLE. Livraison en France hors D.O.M. et T.O.M." },
        ],
      },
      {
        type: 'grille',
        id: 'annexe7',
        titre: 'Annexe 7 — Les informations sur le produit',
        colonnes: ['Référence du produit', 'Libellé produit', 'Taille', 'Prix'],
        nbLignes: 1,
      },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: "Retrouvez les mobiles d'achat du couple en indiquant à chaque fois le mot ou le groupe de mots permettant de justifier votre choix.",
        documents: ['Document 1', 'Document 2', 'Annexe 1'],
        bareme: 5,
        reponse: '',
        tableau: {
          colonnes: ['Typologie SONCAS', 'Coché', 'Justification'],
          lignes: [
            ['Sécurité', 'X', '« …tout a été pris en charge par la garantie. Et ça, c\'est super important pour nous ! »'],
            ['Orgueil', '', ''],
            ['Nouveauté', 'X', '« …on recherche quelque chose de plus contemporain. »'],
            ['Confort', 'X', '« …spacieux. » / « pas beaucoup de place pour les ranger »'],
            ['Argent', '', ''],
            ['Sympathie', 'X', '« …on recherche quelque chose…, avec une belle couleur… »'],
            ['Environnement', 'X', '« …un modèle en bois recyclé. »'],
          ],
        },
      },
      {
        intitule: "Cochez la motivation d'achat du couple puis justifiez la en citant le texte.",
        documents: ['Document 1', 'Document 3', 'Annexe 2'],
        bareme: 3,
        reponse: '',
        tableau: {
          colonnes: ['Typologie', 'Coché', 'Justification'],
          lignes: [
            ['Hédoniste', 'X', "« Nous avons emménagé dans notre nouvel appartement il y a quelques semaines et nous souhaitons faire un dressing. » ou « Un truc qui nous plait vraiment quoi ! » (accepter toute réponse pertinente)"],
            ['Oblative', '', ''],
            ['Auto-expression', '', ''],
          ],
        },
      },
      {
        intitule: "Relevez dans l'intervention du couple, les deux freins liés à l'achat puis cochez le type de frein.",
        documents: ['Document 1', 'Document 4', 'Annexe 3'],
        bareme: 2,
        reponse: "Frein relevé : « …après tu sais comment est ta mère… Quand elle verra ça… » → type : Inhibition (X).",
      },
      {
        intitule: "Reformulez les besoins du client en utilisant la « reformulation synthèse ».",
        documents: ['Document 5', 'Annexe 4'],
        bareme: 3,
        reponse: "« Si j'ai bien compris, vous souhaitez faire un dressing, contemporain, en bois recyclé, spacieux, avec une belle couleur naturelle et garantie, c'est bien cela ? »",
      },
      {
        intitule: "Préparez la présentation du produit en utilisant la méthode « QQCCP ».",
        documents: ['Document 6', 'Annexe 5'],
        bareme: 5,
        reponse: '',
        tableau: {
          colonnes: ['QQCCP', 'Réponse attendue'],
          lignes: [
            ['Quand ?', "« Le vendeur connaît les mobiles d'achat du client/prospect »"],
            ['Quel produit ?', "Le produit : qui correspond aux mobiles d'achat du client/prospect ; qui correspond aux caractéristiques énoncées par le client/prospect."],
            ['Combien ?', "Un produit, celui qui correspond le mieux aux critères du client/prospect."],
            ['Comment ?', "Inciter le client/prospect à se projeter avec le produit dans son environnement personnel (maison ou travail e fonction du produit)."],
            ['Pourquoi ?', "« C'est le dressing qu'il vous faut. Il correspond à tous vos critères. Imaginez-le dans votre chambre avec toute la place dont vous avez toujours rêvé pour ranger vos vêtements. » (accepter toute réponse pertinente)"],
          ],
        },
      },
      {
        intitule: 'Après avoir lu les réponses du couple, complétez le logiciel qui permettra de proposer le dressing leur correspondant.',
        documents: ['Document 7', 'Annexe 6'],
        bareme: 4,
        reponse: "Configuration : décor effet chêne naturel, profondeur 45 cm, hauteur 200 cm, largeur 220 cm, caissons standards, 2 tiroirs, poignées standard (métal), porte H100 x L40. Produit obtenu : Dressing chêne H.200 x L.240 x P.45cm — Référence 83299641 — 1492.86 €.",
      },
      {
        intitule: 'Indiquez les caractéristiques du produit proposé au couple.',
        documents: ['Annexe 6', 'Annexe 7'],
        bareme: 3,
        reponse: '',
        tableau: {
          colonnes: ['Référence du produit', 'Libellé produit', 'Taille', 'Prix'],
          lignes: [
            ['83299641', 'Dressing chêne', 'H.200 X L.240 X P.45', '1492.86 €'],
          ],
        },
      },
    ],
  },
  synthese: {
    titre: 'La recherche des besoins et la proposition de produit',
    proposition: [
      'Écho ou perroquet',
      'Nouveauté',
      'Combien ?',
      "Les mobiles d'achat",
      "Les motivations d'achat",
      'Les types de freins',
    ],
    racine: {
      id: 'racine',
      texte: "La recherche des besoins",
      enfants: [
        {
          id: 'besoins',
          texte: "Les mobiles, motivations et freins d'achat",
          enfants: [
            { id: 'b-1', texte: null, reponse: "Les mobiles d'achat" },
            { id: 'b-2', texte: null, reponse: "Les motivations d'achat" },
            { id: 'b-3', texte: null, reponse: 'Les types de freins' },
          ],
        },
        {
          id: 'reformulation',
          texte: 'La reformulation',
          enfants: [
            { id: 'r-1', texte: 'Les types de reformulation', enfants: [{ id: 'r-1-1', texte: null, reponse: 'Écho ou perroquet' }] },
          ],
        },
        {
          id: 'proposition',
          texte: "La proposition d'une solution adaptée",
          enfants: [
            { id: 'p-1', texte: 'La méthode « QQCCP »', enfants: [{ id: 'p-1-1', texte: null, reponse: 'Combien ?' }] },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1',
        intitule: "Identifier les mobiles, motivations et freins d'achat",
        indicateurs: [
          { niveau: 'novice', description: "Je ne sais pas distinguer mobile, motivation et frein." },
          { niveau: 'debrouille', description: 'Je repère un mobile ou un frein sans le justifier.' },
          { niveau: 'averti', description: "Je classe les mobiles (SONCAS) et je les justifie par le texte." },
          { niveau: 'expert', description: "J'analyse finement mobiles, motivations et freins pour orienter la vente." },
        ],
      },
      {
        id: 'c2',
        intitule: 'Reformuler les besoins du client',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas reformuler une demande.' },
          { niveau: 'debrouille', description: 'Je répète les propos sans les synthétiser.' },
          { niveau: 'averti', description: 'Je réalise une reformulation synthèse correcte.' },
          { niveau: 'expert', description: 'Je reformule en validant tous les critères du client.' },
        ],
      },
      {
        id: 'c3',
        intitule: 'Proposer un produit adapté (QQCCP)',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas présenter un produit.' },
          { niveau: 'debrouille', description: 'Je présente un produit sans méthode.' },
          { niveau: 'averti', description: 'Je structure ma présentation avec la méthode QQCCP.' },
          { niveau: 'expert', description: 'Je relie chaque caractéristique du produit aux besoins du client.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: "Mobile d'achat", definition: "Raison profonde qui pousse un client à acheter (méthode SONCASE)." },
      { terme: 'SONCASE', definition: 'Sécurité, Orgueil, Nouveauté, Confort, Argent, Sympathie, Environnement.' },
      { terme: "Motivation d'achat", definition: "Type de plaisir recherché : hédoniste (soi), oblative (les autres), auto-expression (s'affirmer)." },
      { terme: "Frein à l'achat", definition: "Cause matérielle ou psychologique qui empêche ou retarde la décision d'achat (peur, inhibition, prix)." },
      { terme: 'Reformulation', definition: "Technique consistant à redire les besoins du client pour vérifier sa compréhension (écho, miroir, synthèse)." },
      { terme: 'QQCCP', definition: 'Quand, Quel produit, Combien, Comment, Pourquoi : méthode de présentation d\'un produit.' },
      { terme: 'Caisson', definition: 'Élément modulaire de rangement composant un dressing.' },
      { terme: 'Éco-participation', definition: 'Contribution incluse dans le prix servant à financer le recyclage du produit.' },
    ],
    flashcards: [
      { recto: 'Que signifie SONCASE ?', verso: 'Sécurité, Orgueil, Nouveauté, Confort, Argent, Sympathie, Environnement' },
      { recto: 'Motivation hédoniste ?', verso: 'Acheter pour se faire plaisir' },
      { recto: 'Les 3 types de freins ?', verso: 'La peur, l\'inhibition, le prix' },
      { recto: 'Reformulation synthèse ?', verso: '« Si j\'ai bien compris… c\'est bien cela ? »' },
      { recto: 'Que signifie QQCCP ?', verso: 'Quand, Quel produit, Combien, Comment, Pourquoi' },
      { recto: 'Référence du dressing proposé ?', verso: '83299641 — 1492.86 €' },
    ],
    quiz: [
      { type: 'unique', question: '« Un modèle en bois recyclé » correspond à quel mobile ?', options: ['Sécurité', 'Environnement', 'Argent', 'Orgueil'], bonne: 1 },
      { type: 'unique', question: 'La garantie évoquée par le couple relève du mobile…', options: ['Confort', 'Nouveauté', 'Sécurité', 'Sympathie'], bonne: 2 },
      { type: 'qcm', question: 'Quels mobiles sont exprimés par le couple ?', options: ['Sécurité', 'Argent', 'Nouveauté', 'Environnement'], bonnes: [0, 2, 3] },
      { type: 'unique', question: 'Le frein « peur du jugement de la mère » est de type…', options: ['Peur', 'Inhibition', 'Prix', 'Aucun'], bonne: 1 },
      { type: 'trous', texte: 'La méthode {x} sert à présenter le produit ; la méthode {x} sert à identifier les mobiles.', reponses: ['QQCCP', 'SONCASE'] },
    ],
    glisserDeposer: {
      consigne: 'Associez chaque citation du couple au mobile SONCASE correspondant.',
      etiquettes: ['Bois recyclé', 'Garantie prise en charge', 'Quelque chose de plus contemporain', 'Spacieux'],
      zones: [
        { libelle: 'Environnement', etiquetteIndex: 0 },
        { libelle: 'Sécurité', etiquetteIndex: 1 },
        { libelle: 'Nouveauté', etiquetteIndex: 2 },
        { libelle: 'Confort', etiquetteIndex: 3 },
      ],
    },
  },
}



// ---------------------------------------------------------------------------
// CONTENU : Leroy Merlin, mission 3 - S'assurer de la disponibilite du produit
// et faire de la vente additionnelle
// ---------------------------------------------------------------------------
const LEROY_MERLIN_M3: ContenuMission = {
  travaux: {
    consigne:
      "Vérifiez la disponibilité du dressing choisi par le couple, complétez la fiche client, puis réalisez une vente additionnelle (vente complémentaire, supplémentaire, up-selling et down-selling).",
    contexte:
      "Le couple est conquis par votre proposition de dressing. Après avoir vérifié que le produit est bien disponible, vous en profiterez pour faire une vente additionnelle.",
    documents: [
      {
        numero: 1,
        titre: 'Coordonnées du couple',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Document 1 — Coordonnées du couple' },
          {
            tableau: {
              colonnes: ['Coordonnées', ''],
              lignes: [
                ['Civilité', 'Mme Rebecca Sankouraga'],
                ['Adresse', '7 rue Dombasle, 75015 Paris'],
                ['Fixe', '01.02.03.04.XX'],
                ['Portable', '07.06.05.04.XX'],
                ['Email', 'r.sankouraga@gmail.com'],
                ['Installation', "On doit être installé avant le 22 mai, car on part pendant 1 mois en vacances."],
                ['Avoirs versés', '30% du montant total : 447,86 €'],
              ],
            },
          },
        ],
      },
      {
        numero: 2,
        titre: "La vente additionnelle pour booster le chiffre d'affaires",
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: "Document 2 — La vente additionnelle pour booster le chiffre d'affaires" },
          {
            paragraphes: [
              "La vente additionnelle ou cross-selling, consiste à vendre un produit complémentaire ou supplémentaire (= en plus) à celui initialement acheté ou voulu par le client. La vente additionnelle peut être prise en charge par un vendeur / conseiller / commercial, se faire en magasin ou être provoquée par un système de recommandation produit en e-commerce.",
              'Il existe deux formes de vente additionnelle.',
              "La première qu'on appelle la vente complémentaire ou vente croisée, correspond au cas où le produit vendu en plus est un accessoire ou service lié au produit principal acheté. Il s'agit par exemple d'un tube de cirage vendu avec une paire de chaussures ou de la cravate vendue avec une chemise ou encore des extensions de garanties vendues dans le domaine de l'électro-ménager.",
              "La deuxième forme de vente additionnelle est la vente supplémentaire. Elle consiste simplement à profiter de la présence du client pour lui proposer un autre produit qui n'est pas forcément lié au premier. Un conseiller bancaire peut par exemple vendre une carte bleue à un client venu souscrire un livret d'épargne (dans ce cas, la carte bleue n'a rien à voir avec le livret que le client est venu ouvrir).",
              "Dans certains domaines d'activités, les ventes additionnelles peuvent représenter un CA ou une marge particulièrement importante.",
            ],
          },
        ],
      },
      {
        numero: 3,
        titre: "Le up-selling et le down-selling, qu'est-ce que c'est ?",
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: "Document 3 — Le up-selling et le down-selling, qu'est-ce que c'est ? : Les explications de votre tutrice" },
          {
            paragraphes: [
              "« L'up-sell ou upselling est une technique qui consiste à proposer au client un autre produit que celui qu'il avait initialement choisi.",
              "Généralement le commercial lui proposera un article plus cher et meilleur en gamme que ce dernier. C'est comme cela que le commercial augmentera sa marge bénéficiaire.",
              "Même si votre client n'avait pas l'intention d'acquérir un produit, le fait de lui faire la proposition lui insuffle un intérêt certain.",
              "En pratique, le client est venu acheter un smartphone sorti l'année d'avant, et vous essayez en tant que conseiller de lui vendre le smartphone le plus récent, donc plus cher, en lui indiquant toutes les nouvelles fonctionnalités de celui-ci par rapport à l'ancien.",
              "C'est un perfectionnement de l'expérience d'achat pour vos clients. L'avantage est multiple car vous augmentez vos ventes et bénéfices, en plus de bénéficier de recommandations de la part de vos clients sur la base de leur satisfaction.",
              "Le down-sell ou downselling consiste, par opposition à l'up-sell, à proposer à votre client un produit moins chère suite à son refus d'acheter le produit que vous lui avez proposé.",
              "À noter que le produit proposé peut être moins cher, mais que pour autant le commerçant fera tout de même une marge bénéficiaire important sur ce produit.",
              "Exemple, vous pouvez proposer des baskets moins chers que celles que le client a refusé, à cause de son prix. Ou, à la place d'une paire de baskets, vous pourriez lui proposer une paire de tennis moins chère.",
              "Dans le cadre d'une boutique en ligne par exemple, cela consistera à faire afficher une offre moins chère, si l'internaute défile sur un premier produit. »",
            ],
          },
        ],
      },
      {
        numero: 4,
        titre: 'Les autres dressings disponibles chez Leroy Merlin',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Document 4 — Les autres dressings disponibles chez Leroy Merlin' },
          {
            galerieProduits: [
              { titre: 'Dressing blanc semi-fermé', image: '/docs/leroy-merlin-m3/dr-blanc.jpg', prix: '1490,86 €', reference: '83013039', coloris: 'anthracite (gris) – blanc – couleur chêne', dimensions: 'H 200cm – L 240cm – P 45 cm' },
              { titre: 'Armoire dressing semi-fermé', image: '/docs/leroy-merlin-m3/dr-armoire.jpg', prix: '1580,66 €', reference: '83299656', coloris: 'anthracite (gris) – blanc – couleur chêne', dimensions: 'H 200cm – L 220cm – P 45 cm' },
              { titre: 'Dressing chêne / miroir semi-fermé', image: '/docs/leroy-merlin-m3/dr-chene-miroir.jpg', prix: '1539,29 €', reference: '83299673', coloris: 'anthracite (gris) – blanc – couleur chêne', dimensions: 'H 200cm – L 120cm – P 45 cm' },
              { titre: 'Dressing semi-fermé avec lumière', image: '/docs/leroy-merlin-m3/dr-lumiere.jpg', prix: '1586,66 €', reference: '83013042', coloris: 'anthracite (gris) – blanc – couleur chêne', dimensions: 'H 200cm – L 240cm – P 45 cm' },
              { titre: 'Dressing', image: '/docs/leroy-merlin-m3/dr-dressing.jpg', prix: '1510,29 €', reference: '83299639', coloris: 'anthracite (gris) – blanc – couleur chêne', dimensions: 'H 190cm – L 240cm – P 45 cm' },
              { titre: 'Armoire dressing ouvert', image: '/docs/leroy-merlin-m3/dr-ouvert.jpg', prix: '1219,28 €', reference: '83013039', coloris: 'anthracite (gris) – blanc – couleur chêne', dimensions: 'H 200cm – L 120cm – P 45 cm' },
            ],
          },
          { paragraphes: ['* H = Hauteur  L = Largeur  P = Profondeur'] },
        ],
      },
      {
        numero: 5,
        titre: 'Les biens ou services à proposer pour une vente additionnelle',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Document 5 — Les biens ou services proposés pour faire une vente additionnelle' },
          { intertitre: 'Les services Leroy Merlin' },
          {
            tableau: {
              colonnes: ['Libellé', 'Prix'],
              lignes: [
                ['SERVICE CLIENT — Dépannage', 'Entre 199.00 € et 198.00 €'],
                ['Service après-vente', 'Selon appareil sous garantie ou non'],
                ['Entretien de produits motorisés de jardin', 'Selon la panne détectée'],
                ['Financement', 'Une solution vous sera proposée par téléphone'],
                ['Retrait et mode de livraison', 'Petit colis à partir de 6,90€ - Gros colis à partir de 99,90€ - Très gros colis à partir de 119,90€'],
                ["Rachat de produits d'occasion", 'Valeur en carte cadeau'],
                ['Retour et remboursement', 'Voir conditions générales'],
                ["LOCATION — Location d'utilitaire", 'À partir de 19.00 € / heure'],
                ['Location de matériel', 'Entre 10.00 € et 75.00 € / jour selon le matériel'],
                ['POSE ET INSTALLATION À DOMICILE — Chauffage', 'À partir de 149.00 € / prestation'],
                ['Climatisation / aération', 'À partir de 119.00 €'],
                ['Cuisine', 'À partir de 129.00 €'],
                ['Electronique', 'À partir de 169.00 €'],
                ['Extérieur', 'À partir de 339.00 €'],
                ['Plomberie', 'À partir de 129.00 €'],
                ['Portes / fenêtre', 'À partir de 189.00 €'],
                ['Rangement / Dressing', 'À partir de 149.00 €'],
                ['Rénovation / menuiserie', 'À partir de 129.00 €'],
                ['Salle de bains', 'À partir de 135.00 €'],
                ['Sol', 'À partir de 16.00 € / m2'],
              ],
            },
          },
          { intertitre: 'Les biens Leroy Merlin — Accessoires intérieurs de dressing' },
          {
            tableau: {
              colonnes: ['Référence', 'Libellé', 'Taille', 'Prix'],
              lignes: [
                ['82336923', 'Panier à suspendre SPACEO Noir', 'H.12 x l.36 x P.26 cm', '4.99 €'],
                ['82336904', 'Porte-pantalons SPACEO Noir 9 pantalons ss tab', 'H.8.5 x l.34.5 x P.41 cm', '26.90 €'],
                ['82336914', 'Barre de penderie escamotable et extensible noir Spaceo', 'H.84 x l.100 x P.14 cm', '45.90 €'],
                ['82336921', 'Panier latéral coulissant SPACEO Noir', 'H.15 x l.20.5 x P.40.2 cm', '19.90 €'],
                ['82336908', 'Porte-pantalons SPACEO Noir 13 pantalons', 'H.5 x l.76.8 x P.41 cm', '36.90 €'],
                ['82336909', 'Porte-pantalons SPACEO Noir 13 à 26 pantalons', 'H.5 x l.76.8 x P.56 cm', '41.90 €'],
                ['82336913', 'Support cintres rabattable SPACEO noir 10 cintres', 'H.7.5 x l.43 x P.7.2 cm', '19.90 €'],
                ['85202820', 'Elévateur De Penderie Acier - Boîtier Argent - Largeur Dressing', '690-920 Mm', '48.35 €'],
                ['83356854', 'Porte-parapluie Tetris Acier Noir Vidaxl', '---', '63.99 €'],
                ['82704672', 'Lot de 2 support de barre de penderie ovale chrome', 'D30 x 15 mm — 18 m', '3.99 €'],
                ['61953535', 'Barre de penderie ovale chromé', 'D30 x 15 mm — 2 m', '11.90 €'],
                ['82704641', 'Lot de 1 support de barre de penderie ovale chrome', 'D30 x 15 mm — 21.58 m', '4.99 €'],
                ['82704679', 'Lot de 1 support de barre de penderie ronde chrome', 'D25 mm — 38 m', '3.99 €'],
                ['82505738', 'Kit barre de penderie extensible et supports chromé', '0.6 m ovale', '26.90 €'],
                ['82459989', 'Kit barre de penderie et supports noir', '0.56 m — Diam.30 x 15 mm ovale', '8.99 €'],
                ['82024499', 'Support de barre de penderie rond noir', 'D28 mm', '9.99 €'],
                ['83071058', 'Valve Mytube noir', 'D25 mm', '8.99 €'],
                ['82061892', 'Raccord pour 4 tubes en biais penderie MyTube rond noir', 'D25 mm', '7.99 €'],
                ['82506566', 'Kit barre de penderie et supports blanc', '1 m', '29.90 €'],
              ],
            },
          },
        ],
      },
    ],
    objectifs: [
      "Vérifier la disponibilité d'un produit et compléter une fiche client.",
      "Distinguer vente complémentaire, supplémentaire, up-selling et down-selling, et proposer une vente additionnelle.",
    ],
    competence: {
      groupe: 'Compétences travaillées',
      intitule: 'C.1.2 — Réaliser la vente dans un cadre omnicanal',
      detail: "S'assurer de la disponibilité du produit et réaliser une vente additionnelle.",
    },
    activites: [
      {
        titre: 'Activité 1 — La disponibilité du produit et la fiche client',
        questions: [
          { numero: 1, consigne: "Consultez le logiciel de l'entreprise afin de pouvoir indiquer au couple si le dressing qu'il a choisi est en stock.", ressources: 'Compléter les annexes 1a et 1b.', annexeId: 'annexe1a', annexeId2: 'annexe1b' },
          { numero: 2, consigne: "Afin de pouvoir lancer la commande du dressing, complétez la fiche client à l'aide des réponses données par le couple.", ressources: 'Consulter le document 1, compléter l\'annexe 2.', annexeId: 'annexe2' },
        ],
      },
      {
        titre: 'Activité 2 — Vente additionnelle : différencier la vente complémentaire et la vente supplémentaire',
        questions: [
          { numero: 3, consigne: 'Répondez aux questions de votre tutrice.', ressources: 'Consulter le document 2, compléter l\'annexe 3.', annexeId: 'annexe3' },
          { numero: 4, consigne: "À l'aide de vos connaissances personnelles, donnez des exemples de produits complémentaires ou supplémentaires possibles en fonction du produit principal proposé.", ressources: 'Compléter l\'annexe 4.', annexeId: 'annexe4' },
          { numero: 5, consigne: "À l'aide de vos connaissances personnelles, retrouvez quel est le produit principal en fonction des exemples de produits complémentaire ou supplémentaire indiqué.", ressources: 'Compléter l\'annexe 5.', annexeId: 'annexe5' },
        ],
      },
      {
        titre: 'Activité 3 — Les notions de « up-selling » et de « down-selling »',
        contexte: "Après votre travail concluant sur la vente additionnelle, votre tutrice vous explique ce que sont les techniques de « up-selling » et de « down-selling ».",
        questions: [
          { numero: 6, consigne: 'Analysez les notions de « up et de down selling » en répondant aux questions.', ressources: 'Consulter le document 3, compléter l\'annexe 6.', annexeId: 'annexe6' },
          { numero: 7, consigne: "Indiquez le produit en « up-selling » que vous pourriez proposer au couple ; justifiez votre réponse.", ressources: 'Consulter le document 4, compléter l\'annexe 7.', annexeId: 'annexe7' },
        ],
      },
      {
        titre: "Activité 4 — La proposition d'un produit additionnel",
        questions: [
          { numero: 8, consigne: "Relisez la Mission 2, document 1 et retrouvez la phrase énoncée par le couple qui peut faire l'objet d'une vente additionnelle.", ressources: 'Compléter l\'annexe 8.', annexeId: 'annexe8' },
          { numero: 9, consigne: "Indiquez le bien ou le service que vous proposerez au couple ainsi que le prix de ce dernier par rapport à la phrase qu'il a prononcé.", ressources: 'Consulter le document 5, compléter l\'annexe 9.', annexeId: 'annexe9' },
        ],
      },
    ],
    annexes: [
      {
        type: 'simulateur',
        id: 'annexe1a',
        titre: 'Annexe 1a — Logiciel de disponibilité des produits Leroy Merlin',
        introTitre: 'Disponibilité des produits Leroy Merlin',
        introTexte: "Renseignez les caractéristiques du dressing choisi par le couple (effet chêne, P.45, H.200, L.220) pour vérifier sa disponibilité en stock.",
        introBouton: 'Vérifier la disponibilité',
        enteteTitre: 'Leroy Merlin — Disponibilité des produits',
        accrocheTitre: 'Délais de livraison',
        accrocheSousTitre: '… en 4 étapes',
        libelleEtape: 'Question',
        libelleResultatProgression: 'STOCK',
        resultatTitreOk: 'Produit disponible',
        nbEtapesAffiche: 4,
        etapes: [
          { id: 'decor', bandeau: 'CARACTÉRISTIQUES', question: '1. Choix du décor (couleur)', options: [
            { libelle: 'Anthracite (gris)', vers: 'profondeur' }, { libelle: 'Blanc', vers: 'profondeur' }, { libelle: 'Effet chêne naturel', vers: 'profondeur' },
          ] },
          { id: 'profondeur', bandeau: 'CARACTÉRISTIQUES', question: '2. Choix de la profondeur', options: [
            { libelle: '15 cm', vers: 'hauteur' }, { libelle: '30 cm', vers: 'hauteur' }, { libelle: '45 cm', vers: 'hauteur' }, { libelle: '60 cm', vers: 'hauteur' },
          ] },
          { id: 'hauteur', bandeau: 'CARACTÉRISTIQUES', question: '3. Choix de la hauteur', options: [
            { libelle: '100 cm', vers: 'largeur' }, { libelle: '200 cm', vers: 'largeur' }, { libelle: '240 cm', vers: 'largeur' },
          ] },
          { id: 'largeur', bandeau: 'CARACTÉRISTIQUES', question: '4. Choix de la largeur', options: [
            { libelle: '120 cm', vers: 'resultat' }, { libelle: '130 cm', vers: 'resultat' }, { libelle: '140 cm', vers: 'resultat' }, { libelle: '150 cm', vers: 'resultat' },
            { libelle: '160 cm', vers: 'resultat' }, { libelle: '170 cm', vers: 'resultat' }, { libelle: '180 cm', vers: 'resultat' }, { libelle: '190 cm', vers: 'resultat' },
            { libelle: '200 cm', vers: 'resultat' }, { libelle: '210 cm', vers: 'resultat' }, { libelle: '220 cm', vers: 'resultat' },
          ] },
        ],
        resultats: [
          { id: 'resultat', type: 'ok', texte: "Le dressing chêne (réf. 83299641) est en stock. Il y a 3 dressing(s) en chêne disponibles. Délai fabrication + livraison : 30 jours à compter de la commande. L'installation avant le 22 mai est donc possible." },
        ],
      },
      {
        type: 'grille',
        id: 'annexe1b',
        titre: 'Annexe 1b — La disponibilité du dressing du couple',
        colonnes: ['Question', 'Réponse'],
        nbLignes: 2,
        prerempli: [
          ['Le dressing choisi par le couple est-il en stock ? (Oui / Non)', ''],
          ["S'il est disponible, combien y en a-t-il en stock ? (… dressing(s) en chêne)", ''],
        ],
      },
      {
        type: 'ficheclient',
        id: 'annexe2',
        titre: 'Annexe 2 — La fiche client',
      },
      {
        type: 'grille',
        id: 'annexe3',
        titre: 'Annexe 3 — Les questions de votre tutrice',
        colonnes: ['Questions', 'Vos réponses'],
        nbLignes: 6,
        prerempli: [
          ["Expliquez ce qu'est la vente additionnelle", ''],
          ["Comment se fait une vente additionnelle sur internet d'une enseigne ?", ''],
          ['Quels sont les deux types de vente additionnelle ?', ''],
          ["Donnez la définition d'une vente complémentaire.", ''],
          ["Indiquez en quoi consiste la vente d'un produit supplémentaire.", ''],
          ["Indiquez l'intérêt pour une entreprise de faire de la vente additionnelle.", ''],
        ],
      },
      {
        type: 'grille',
        id: 'annexe4',
        titre: 'Annexe 4 — Les produits complémentaires ou supplémentaires chez Leroy Merlin',
        colonnes: ['Produit principal', 'Exemple de produit complémentaire', 'Exemple de produit supplémentaire'],
        nbLignes: 4,
        prerempli: [
          ['Un pot de peinture', '', ''],
          ['Une table basse de salon', '', ''],
          ['Des rideaux', '', ''],
          ['Une table de chevet', '', ''],
        ],
      },
      {
        type: 'grille',
        id: 'annexe5',
        titre: 'Annexe 5 — Le produit principal chez Leroy Merlin',
        colonnes: ['Exemple de produit complémentaire', 'Exemple de produit supplémentaire', 'Produit principal'],
        nbLignes: 4,
        prerempli: [
          ['Un parasol de jardin', '', ''],
          ['', 'Des chaises', ''],
          ['Un pot', '', ''],
          ['', 'Des bougies', ''],
        ],
      },
      {
        type: 'grille',
        id: 'annexe6',
        titre: "Annexe 6 — L'analyse des notions de « up-selling » et de « down-selling »",
        colonnes: ['Questions', 'Réponses'],
        nbLignes: 6,
        prerempli: [
          ['Comment peut-on définir le « up-selling » ?', ''],
          ["Quel est l'avantage pour un commercial de faire du « up-selling » ?", ''],
          ["Donnez un exemple, qui n'est pas dans le texte, de vente en « up-selling »", ''],
          ["Quels sont les deux avantages pour l'entreprise de faire du « up-selling » ?", ''],
          ['Définissez le « down-selling ».', ''],
          ["Dans le cadre du e-commerce, comment le site de l'enseigne fait-il du « down-selling » ?", ''],
        ],
      },
      {
        type: 'reformulation',
        id: 'annexe7',
        titre: 'Annexe 7 — Le produit proposé en « up-selling » et la justification',
        nbLignes: 4,
      },
      {
        type: 'reformulation',
        id: 'annexe8',
        titre: 'Annexe 8 — La phrase énoncée par le couple',
        nbLignes: 3,
      },
      {
        type: 'reformulation',
        id: 'annexe9',
        titre: 'Annexe 9 — Le nom du bien ou du service additionnel proposé au couple',
        nbLignes: 3,
      },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: "Consultez le logiciel de l'entreprise afin de pouvoir indiquer au couple si le dressing qu'il a choisi est en stock.",
        documents: ['Annexe 1a', 'Annexe 1b'],
        bareme: 3,
        reponse: '',
        tableau: {
          colonnes: ['Question', 'Réponse'],
          lignes: [
            ['Le dressing choisi par le couple est-il en stock ?', 'Oui (X)'],
            ["S'il est disponible, combien y en a-t-il en stock ?", 'Il y a 3 dressing(s) en chêne en stock.'],
          ],
        },
      },
      {
        intitule: "Afin de pouvoir lancer la commande du dressing, complétez la fiche client.",
        documents: ['Document 1', 'Annexe 2'],
        bareme: 5,
        reponse: '',
        tableau: {
          colonnes: ['Champ', 'Réponse attendue'],
          lignes: [
            ['Type de client', 'Particulier'],
            ['Civilité', 'Madame'],
            ['Nom', 'Sankouraga'],
            ['Prénom', 'Rebecca'],
            ['Adresse', '7 rue Dombasle, 75015 Paris'],
            ['Téléphone fixe', '01.02.03.04.XX'],
            ['Téléphone portable', '07.06.05.04.XX'],
            ['Email', 'r.sankouraga@gmail.com'],
            ['Produit acheté', 'Dressing'],
            ['Montant avoir', '447,86 €'],
            ['Commentaire', "L'installation doit être faite avant le 22 mai car les clients partent en vacances pendant 1 mois."],
          ],
        },
      },
      {
        intitule: 'Répondez aux questions de votre tutrice.',
        documents: ['Document 2', 'Annexe 3'],
        bareme: 6,
        reponse: '',
        tableau: {
          colonnes: ['Questions', 'Réponses'],
          lignes: [
            ["Expliquez ce qu'est la vente additionnelle", 'Elle consiste à vendre un produit complémentaire ou supplémentaire (= en plus) à celui initialement acheté ou voulu.'],
            ["Comment se fait une vente additionnelle sur internet d'une enseigne ?", 'La vente additionnelle peut être provoquée par un système de recommandation produit en e-commerce.'],
            ['Quels sont les deux types de vente additionnelle ?', 'La vente complémentaire ou vente croisée ; la vente supplémentaire.'],
            ["Donnez la définition d'une vente complémentaire.", 'Le produit vendu en plus est un accessoire ou service lié au produit principal acheté.'],
            ["Indiquez en quoi consiste la vente d'un produit supplémentaire.", "Elle consiste simplement à profiter de la présence du client pour lui proposer un autre produit qui n'est pas forcément lié au premier."],
            ["Indiquez l'intérêt pour une entreprise de faire de la vente additionnelle.", 'Les ventes additionnelles peuvent représenter un CA ou une marge particulièrement importante.'],
          ],
        },
      },
      {
        intitule: 'Donnez des exemples de produits complémentaires ou supplémentaires en fonction du produit principal.',
        documents: ['Annexe 4'],
        bareme: 4,
        reponse: '',
        tableau: {
          colonnes: ['Produit principal', 'Complémentaire', 'Supplémentaire'],
          lignes: [
            ['Un pot de peinture', 'Un pinceau', ''],
            ['Une table basse de salon', '', 'Des coussins, un canapé… (accepter toute réponse cohérente)'],
            ['Des rideaux', 'Une tringle', ''],
            ['Une table de chevet', '', 'Un tapis (accepter toute réponse cohérente)'],
          ],
        },
      },
      {
        intitule: 'Retrouvez quel est le produit principal en fonction des exemples donnés.',
        documents: ['Annexe 5'],
        bareme: 4,
        reponse: '',
        tableau: {
          colonnes: ['Complémentaire', 'Supplémentaire', 'Produit principal'],
          lignes: [
            ['Un parasol de jardin', '', 'Une table de jardin'],
            ['', 'Des chaises', 'Une table basse'],
            ['Un pot', '', 'Des fleurs'],
            ['', 'Des bougies', 'Une lampe'],
          ],
        },
      },
      {
        intitule: 'Analysez les notions de « up-selling » et de « down-selling ».',
        documents: ['Document 3', 'Annexe 6'],
        bareme: 6,
        reponse: '',
        tableau: {
          colonnes: ['Questions', 'Réponses'],
          lignes: [
            ['Comment peut-on définir le « up-selling » ?', "Le « up-selling » est une technique qui consiste à proposer au client un autre produit que celui qu'il avait initialement choisi."],
            ["Quel est l'avantage pour un commercial de faire du « up-selling » ?", 'Le commercial augmentera sa marge bénéficiaire.'],
            ["Donnez un exemple, qui n'est pas dans le texte, de vente en « up-selling »", "Le client vient acheter un téléviseur entrée de gamme, on le dirige vers un téléviseur plus cher et avec plus de fonctionnalités. (accepter toute réponse cohérente)"],
            ["Quels sont les deux avantages pour l'entreprise de faire du « up-selling » ?", "L'avantage est multiple car vous augmentez vos ventes et bénéfices, en plus de bénéficier de recommandations de la part de vos clients sur la base de leur satisfaction."],
            ['Définissez le « down-selling ».', "Le downselling consiste, par opposition à l'up-sell, à proposer à votre client un produit moins chère suite à son refus d'acheter le produit que vous lui avez proposé."],
            ["Dans le cadre du e-commerce, comment le site de l'enseigne fait-il du « down-selling » ?", "Cela consiste à faire afficher une offre moins chère si l'internaute défile sur un premier produit."],
          ],
        },
      },
      {
        intitule: 'Indiquez le produit en « up-selling » que vous pourriez proposer au couple ; justifiez.',
        documents: ['Document 4', 'Annexe 7'],
        bareme: 3,
        reponse: "On proposera la référence 83013042, Dressing semi-fermé avec lumière, H 200cm – L 240cm – P 45 cm, couleur chêne, car il a de la lumière ce que n'a pas l'autre et il est plus cher.",
      },
      {
        intitule: "Retrouvez la phrase énoncée par le couple qui peut faire l'objet d'une vente additionnelle.",
        documents: ['Mission 2 — Document 1', 'Annexe 8'],
        bareme: 2,
        reponse: "« Plus jamais ! J'ai pas les compétences pour faire du montage ! Je préfère payer pour le faire. »",
      },
      {
        intitule: 'Indiquez le bien ou le service additionnel proposé au couple ainsi que son prix.',
        documents: ['Document 5', 'Annexe 9'],
        bareme: 3,
        reponse: "Le service à proposer au couple : POSE ET INSTALLATION À DOMICILE — Rangement / dressing — À partir de 149.00 €.",
      },
    ],
  },
  synthese: {
    titre: "S'assurer de la disponibilité du produit et faire de la vente additionnelle",
    proposition: [
      'La vente complémentaire',
      'La vente supplémentaire',
      "L'up-selling",
      'Le down-selling',
    ],
    racine: {
      id: 'racine',
      texte: 'La vente additionnelle',
      enfants: [
        {
          id: 'types',
          texte: '2 types de ventes additionnelles',
          enfants: [
            { id: 't-1', texte: null, reponse: 'La vente complémentaire' },
            { id: 't-2', texte: null, reponse: 'La vente supplémentaire' },
          ],
        },
        {
          id: 'notions',
          texte: "Les notions d'up-selling et de down-selling",
          enfants: [
            { id: 'n-1', texte: 'Produit plus cher', enfants: [{ id: 'n-1-1', texte: null, reponse: "L'up-selling" }] },
            { id: 'n-2', texte: 'Produit moins cher', enfants: [{ id: 'n-2-1', texte: null, reponse: 'Le down-selling' }] },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1',
        intitule: "Vérifier la disponibilité et compléter une fiche client",
        indicateurs: [
          { niveau: 'novice', description: "Je ne sais pas vérifier un stock ni remplir une fiche client." },
          { niveau: 'debrouille', description: 'Je consulte le stock mais je remplis la fiche de façon incomplète.' },
          { niveau: 'averti', description: 'Je vérifie la disponibilité et je complète correctement la fiche client.' },
          { niveau: 'expert', description: "Je vérifie disponibilité et délais, et je complète la fiche sans erreur." },
        ],
      },
      {
        id: 'c2',
        intitule: 'Distinguer les types de vente additionnelle',
        indicateurs: [
          { niveau: 'novice', description: 'Je confonds vente complémentaire et supplémentaire.' },
          { niveau: 'debrouille', description: 'Je distingue les deux types sans les illustrer.' },
          { niveau: 'averti', description: "Je distingue et j'illustre vente complémentaire et supplémentaire." },
          { niveau: 'expert', description: 'Je maîtrise complémentaire, supplémentaire, up-selling et down-selling.' },
        ],
      },
      {
        id: 'c3',
        intitule: 'Proposer une vente additionnelle pertinente',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas proposer de produit additionnel.' },
          { niveau: 'debrouille', description: 'Je propose un produit sans le justifier.' },
          { niveau: 'averti', description: 'Je propose un produit additionnel justifié par les propos du client.' },
          { niveau: 'expert', description: 'Je relie ma proposition à un besoin précis et à un prix adapté.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Vente additionnelle', definition: 'Cross-selling : vendre un produit en plus de celui initialement acheté ou voulu.' },
      { terme: 'Vente complémentaire', definition: 'Vente croisée : le produit en plus est un accessoire ou service lié au produit principal.' },
      { terme: 'Vente supplémentaire', definition: "Profiter de la présence du client pour proposer un autre produit non lié au premier." },
      { terme: 'Up-selling', definition: "Proposer un produit plus cher et de meilleure gamme que celui choisi pour augmenter la marge." },
      { terme: 'Down-selling', definition: "Proposer un produit moins cher après le refus du produit initialement proposé." },
      { terme: 'Marge bénéficiaire', definition: "Différence entre le prix de vente et le coût de revient d'un produit." },
      { terme: 'Avoir', definition: 'Somme dont dispose le client à valoir sur un achat (ici versée à la commande).' },
      { terme: 'Fiche client', definition: 'Document récapitulant les coordonnées et la commande du client.' },
    ],
    flashcards: [
      { recto: 'Autre nom de la vente additionnelle ?', verso: 'Cross-selling' },
      { recto: 'Vente complémentaire ?', verso: 'Produit accessoire/service lié au produit principal' },
      { recto: 'Vente supplémentaire ?', verso: 'Produit non lié, proposé en profitant de la présence du client' },
      { recto: 'Up-selling ?', verso: 'Proposer un produit plus cher / meilleure gamme' },
      { recto: 'Down-selling ?', verso: 'Proposer un produit moins cher après un refus' },
      { recto: 'Service additionnel proposé au couple ?', verso: 'Pose / installation dressing — à partir de 149 €' },
    ],
    quiz: [
      { type: 'unique', question: 'Un tube de cirage vendu avec des chaussures est une vente…', options: ['supplémentaire', 'complémentaire', 'up-selling', 'down-selling'], bonne: 1 },
      { type: 'unique', question: "Proposer un smartphone plus récent et plus cher, c'est du…", options: ['down-selling', 'up-selling', 'cross-selling', 'retour'], bonne: 1 },
      { type: 'unique', question: 'Le dressing du couple est-il en stock ?', options: ['Non', 'Oui, 3 en chêne', 'Oui, 1 seul', 'En rupture'], bonne: 1 },
      { type: 'qcm', question: 'Quels sont les deux types de vente additionnelle ?', options: ['Complémentaire', 'Up-selling', 'Supplémentaire', 'Down-selling'], bonnes: [0, 2] },
      { type: 'trous', texte: "L'{x} propose plus cher, le {x} propose moins cher après un refus.", reponses: ['up-selling', 'down-selling'] },
    ],
    glisserDeposer: {
      consigne: 'Classez chaque situation dans la bonne catégorie de vente.',
      etiquettes: ['Cravate avec une chemise', 'Carte bleue avec un livret', 'Smartphone plus cher proposé', 'Baskets moins chères après refus'],
      zones: [
        { libelle: 'Vente complémentaire', etiquetteIndex: 0 },
        { libelle: 'Vente supplémentaire', etiquetteIndex: 1 },
        { libelle: 'Up-selling', etiquetteIndex: 2 },
        { libelle: 'Down-selling', etiquetteIndex: 3 },
      ],
    },
  },
}



// ---------------------------------------------------------------------------
// CONTENU : Leroy Merlin, mission 4 - L'accord du client, les modalites de
// livraison et la prise de conge
// ---------------------------------------------------------------------------
const LEROY_MERLIN_M4: ContenuMission = {
  travaux: {
    consigne:
      "Obtenez l'accord du client, complétez le bon de commande, planifiez et suivez la livraison, puis soignez la prise de congé.",
    contexte:
      "Maintenant que vous avez informé le couple de la disponibilité du dressing et du nombre de produits restants en stock, vous mettez tout en œuvre pour obtenir leur accord sur le bon de commande.",
    documents: [
      {
        numero: 1,
        titre: "Obtenir l'accord du client",
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: "Document 1 — Obtenir l'accord du client" },
          {
            tableau: {
              colonnes: ['Les techniques de conclusion', 'Caractéristiques', 'Exemples'],
              lignes: [
                ['La conclusion directe', 'Le commercial invite tout naturellement le client à finaliser la vente.', 'Alors vous la prenez ?'],
                ["La peau de l'ours", "Le commercial se comporte comme si le client avait déjà acheté le produit alors que celui-ci ne l'a pas encore fait.", "Vous souhaitez une extension de garantie avec ? Elle n'est pas très chère."],
                ['Le regret', "Le commercial présente au client un avantage dont celui-ci ne pourra bénéficier que s'il achète immédiatement.", 'Je peux vous faire -15% si vous le prenez !'],
              ],
            },
          },
        ],
      },
      {
        numero: 2,
        titre: 'Le bon de commande signé vaut engagement',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Document 2 — Le bon de commande signé vaut engagement' },
          {
            paragraphes: [
              "Selon votre secteur d'activité, l'établissement d'un bon de commande signé par vos soins constitue une obligation. En règle générale, il est toutefois recommandé de délivrer systématiquement ce document au client lorsque sa commande porte sur un montant ou des volumes importants.",
              "Le bon de commande, une fois signé et daté par le client, implique son accord pour entamer les travaux et le prive ensuite de toute voie de recours concernant le tarif demandé. En plus de la signature, l'ajout d'une mention type comme « Lu et approuvé » ou « Bon pour accord » peut constituer une sécurité supplémentaire pour vous. Le client reste bien sûr libre de s'opposer à une prestation ou une surfacturation non prévue au devis initial, sauf s'il consent à signer un avenant au devis dans les mêmes conditions. A défaut d'une signature sur le devis lui-même, le client peut vous faire parvenir une « lettre de bon pour accord », dans laquelle il vous fait connaître explicitement son accord : ce formalisme est un peu plus lourd, et l'engage de la même façon.",
              "Dans tous les cas, un bon de commande non signé par le client ne l'engage en rien, même s'il vous a manifesté verbalement son accord ! N'engagez pas des frais importants sans cette garantie minimale.",
            ],
          },
        ],
      },
      {
        numero: 3,
        titre: 'Note de votre tutrice',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Document 3 — Note de votre tutrice' },
          { logoEntete: '/docs/leroy-merlin-m4/logo.jpg' },
          { intertitre: 'NOTE INTERNE' },
          { paragraphes: ['A l\'attention des conseillers de vente,', "Lorsque vous serez sur le point d'annoncer du délai de livraison au client et de compléter le planning d'intervention, suivez les étapes suivantes :"] },
          {
            puces: [
              '1° - Retrouvez le délai livraison sur le logiciel ;',
              "2° - Commencez à compter le délai à partir du jour qui suit la signature du bon de commande par le client (dans le comptage enlevez les dimanches et les jours fériés) ;",
              "3° - Complétez le planning d'intervention avec le nom du client et le type d'intervention qui sera effectué.",
            ],
          },
          { paragraphes: ['Bonnes ventes à tous,', 'Mme Annie Mâle — Responsable'] },
        ],
      },
      {
        numero: 4,
        titre: 'Les étapes de la livraison',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Document 4 — Les étapes de la livraison' },
          {
            etapesVisuelles: [
              'Signature du bon de commande',
              'Préparation du produit',
              'Une semaine avant, appel pour le choix du créneau de livraison',
              'SMS de rappel la veille de la livraison',
              'Livraison à domicile des articles',
              "Réception d'un SMS pour l'évaluation de la livraison",
            ],
          },
        ],
      },
      {
        numero: 5,
        titre: "Rédaction d'un SMS de rappel",
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: "Document 5 — Rédaction d'un SMS de rappel" },
          { paragraphes: ["Lors de la rédaction d'un SMS de rappel, vous devrez faire attention à :"] },
          {
            puces: [
              'Commencer par une salutation personnalisée ;',
              "Rappeler l'article acheté ;",
              'Rappeler le créneau de 2h de la livraison (de 9h à 11h) ;',
              "Remercier, saluer et ajouter le site internet de l'entreprise.",
            ],
          },
        ],
      },
      {
        numero: 6,
        titre: "La prise de congé : la technique des « 4 R »",
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: "Document 6 — La prise de congé : la technique des « 4 R »" },
          {
            paragraphes: [
              "La prise de congé est un moment aussi important que l'accueil. En partant, le client doit avoir une bonne image du commercial et/ou de l'entreprise. D'une part pour rassurer le client sur son achat en le félicitant pour sa décision ou en lui donnant des conseils supplémentaires et d'autre part pour l'inciter à revenir.",
              "La confiance qui s'est installée au fur et à mesure des étapes de l'entretien de vente doit perdurer même quand le client a signé et que le moment est venu de se quitter.",
              'Pour ce faire, vous pouvez utiliser les 4 R :',
            ],
          },
          { puces: ['Rassurer et remercier', 'Raccompagner', 'Revoir'] },
          { intertitre: 'Pourquoi Rassurer et Remercier ?' },
          {
            paragraphes: [
              'Inscrivez la vente dans une démarche à long terme.',
              "En cas de vente, vous devez remercier le client de la confiance qu'il vous a accordé tout au long du processus d'achat...",
              "Vous devez également le féliciter de sa décision. Le client doit être conforté dans le choix qu'il vient de faire. Rappelez-lui votre disponibilité, votre engagement afin de pérenniser votre relation.",
            ],
          },
          { intertitre: 'Comment Raccompagner ?' },
          {
            paragraphes: [
              'Évitez les bavardages inutiles...mais partez sans précipitation !',
              "Il s'agit de clore le rendez-vous en développant une relation privilégiée.",
              "La politesse c'est l'attitude à adopter chaque fois qu'un individu veut montrer du respect à son interlocuteur. Elle doit être observée jusqu'au moment de la prise de congé, et ce même si la vente n'a pas été conclue. « Au revoir. Merci de m'avoir reçu/d'être venu ». Raccompagnez le client si c'est vous qui l'avez reçu.",
            ],
          },
          { intertitre: 'Comment réussir à Revoir ?' },
          {
            paragraphes: [
              "Il faut avant tout montrer que vous restez à la disposition du client, par exemple en lui remettant votre carte de visite.",
              "Il s'agit de clore le rendez-vous en développant une relation privilégiée. Par exemple, il est de bon ton, pour un vendeur, de s'enquérir, quelques jours après la vente, de ce que pense le client de son achat : respect des délais de livraison, difficultés d'installation ou d'apprentissage.",
              "Pour le commercial, c'est l'occasion de renforcer la qualité de la relation vendeur-client car rappelez-vous, la prise de congé est la dernière étape de la vente mais la première étape à la fidélisation.",
            ],
          },
        ],
      },
    ],
    objectifs: [
      "Obtenir l'accord du client et formaliser la commande.",
      'Planifier et suivre la livraison, puis réussir la prise de congé (4 R).',
    ],
    competence: {
      groupe: 'Compétences travaillées',
      intitule: "C.1.3 — S'assurer de l'exécution de la vente",
      detail: "Obtenir l'accord, formaliser la commande, suivre la livraison et prendre congé.",
    },
    activites: [
      {
        titre: "Activité 1 — L'accord du client",
        contexte: "Maintenant que vous avez informé le couple de la disponibilité du dressing et du nombre de produits restants en stock, vous mettez tout en œuvre pour obtenir leur accord sur le bon de commande.",
        questions: [
          { numero: 1, consigne: "Utilisez la technique de la « peau de l'ours » pour rédiger la phrase que vous allez prononcer face aux clients pour obtenir leur accord.", ressources: 'Consulter le document 1, compléter l\'annexe 1.', annexeId: 'annexe1' },
          { numero: 2, consigne: "Analysez l'article qui vous a été remis par votre tutrice, sur la formalisation de l'accord du client.", ressources: 'Consulter le document 2, compléter l\'annexe 2.', annexeId: 'annexe2' },
          { numero: 3, consigne: 'Grâce à toutes les informations recueillies dans la Mission 3 (document 1 et annexe 1a), complétez le bon de commande.', ressources: 'Compléter l\'annexe 3.', annexeId: 'annexe3' },
        ],
      },
      {
        titre: 'Activité 2 — Les modalités et le suivi de la livraison',
        contexte: "Nous sommes le 8 avril 202N et Mme et M. Sankouraga ont formalisé leur accord en s'engageant sur le bon de commande que vous leur avez proposé. Vous leur expliquez comment suivre l'évolution de la livraison et comment celle-ci se passera.",
        questions: [
          { numero: 4, consigne: "Consultez le planning d'intervention du magasin et complétez-le en indiquant, sur le jour que vous aurez choisi, le nom du client et le type d'intervention.", ressources: 'Consulter le document 3, compléter l\'annexe 4.', annexeId: 'annexe4' },
          { numero: 5, consigne: 'Reconstituez les différentes étapes entre la signature du bon de commande et la livraison.', ressources: 'Consulter le document 4, compléter l\'annexe 5.', annexeId: 'annexe5' },
          { numero: 6, consigne: 'Faites une phrase pour indiquer au couple les délais et les différentes étapes de la livraison.', ressources: 'Compléter l\'annexe 6.', annexeId: 'annexe6' },
          { numero: 7, consigne: 'Rédigez le SMS qui sera envoyé la veille pour rappeler la livraison.', ressources: 'Consulter le document 5, compléter l\'annexe 7.', annexeId: 'annexe7' },
        ],
      },
      {
        titre: 'Activité 3 — La prise de congé',
        contexte: "Le couple est satisfait de son achat. Il est prêt à s'en aller. Vous soignez donc la prise de congé.",
        questions: [
          { numero: 8, consigne: 'Votre tutrice souhaite vérifier que vous maîtrisez la prise de congé et vous interroge sur les documents qu\'elle vous a remis.', ressources: 'Consulter le document 6, compléter l\'annexe 8.', annexeId: 'annexe8' },
          { numero: 9, consigne: 'Rédigez la phrase de la prise de congé pour le couple en respectant les 4 R.', ressources: 'Compléter l\'annexe 9.', annexeId: 'annexe9' },
        ],
      },
    ],
    annexes: [
      {
        type: 'bulle',
        id: 'annexe1',
        titre: "Annexe 1 — Technique de la « peau de l'ours » pour obtenir l'accord du couple",
        perso: '/docs/leroy-merlin-m4/perso-conseiller.png',
        placeholder: "Rédigez ici la phrase que vous prononcerez face aux clients…",
        nbLignes: 3,
      },
      {
        type: 'grille',
        id: 'annexe2',
        titre: "Annexe 2 — Analyse de l'article",
        colonnes: ['Questions', 'Réponses'],
        nbLignes: 3,
        largeurs: ['38%', '62%'],
        reponseMultiligne: true,
        lignesReponse: 4,
        prerempli: [
          ['Quelle est la conséquence une fois le bon de commande daté et signé par le client ?', ''],
          ["Quel autre moyen que la signature le client a-t-il pour manifester son accord ?", ''],
          ["Si le client dit oralement qu'il est d'accord, est-il engagé ? Justifiez votre réponse.", ''],
        ],
      },
      {
        type: 'boncommande',
        id: 'annexe3',
        titre: 'Annexe 3 — Bon de commande',
        numero: '2535753',
        vendeur: ['Leroy Merlin Daumesnil', '139 avenue Daumesnil', '75012 Paris', 'Téléphone : 01.33.XX.XX.XX.'],
        nbLignesArticles: 3,
      },
      {
        type: 'planning',
        id: 'annexe4',
        titre: "Annexe 4 — Planning d'intervention Leroy Merlin",
        logo: '/docs/leroy-merlin-m4/logo.jpg',
        mois: [
          {
            titre: 'AVRIL 202N', decalage: 0, nbJours: 30,
            creneaux: [
              { jour: 1, creneau: 'matin', texte: 'M. LEROY - Remplacer un chauffe-eau' },
              { jour: 1, creneau: 'aprem', texte: "M. et Mme SIMON - Installation d'un robot tondeuse" },
              { jour: 2, creneau: 'matin', texte: 'M. CARPENTIER - Installation WC' },
              { jour: 2, creneau: 'aprem', texte: "M. SANCHEZ - Installation adoucisseur d'eau" },
              { jour: 3, creneau: 'matin', texte: 'M HUET - Entretien et ramonage poêle à bois' },
              { jour: 3, creneau: 'aprem', texte: 'M BERNARD - Pose porte de garage avec portillon intégré' },
              { jour: 4, creneau: 'matin', texte: 'M VASSEUR - Installation climatiseur monobloc' },
              { jour: 4, creneau: 'aprem', texte: 'M MOREL - Installation et aménagement de dressing' },
              { jour: 5, creneau: 'matin', texte: 'M PEREZ - Installation cuisine' },
              { jour: 5, creneau: 'aprem', texte: 'M DUPUIS - Isolation de comble' },
              { jour: 6, creneau: 'matin', texte: 'M RICHARD - Installation alarme maison' },
              { jour: 6, creneau: 'aprem', texte: 'M GIRARD - Pose et installation de baignoire' },
              { jour: 8, creneau: 'aprem', texte: 'M MULLER - Pose de parquet stratifié' },
              { jour: 9, creneau: 'matin', texte: 'M DUPONT - Pose de plan de travail cuisine' },
              { jour: 9, creneau: 'aprem', texte: 'M LEFEVRE - Pose de bloc porte intérieur' },
              { jour: 10, creneau: 'matin', texte: 'M LAMBERT - Pose flottante de dalles' },
              { jour: 10, creneau: 'aprem', texte: 'M FAURE - Pose de verrière de 4 à 7 carreaux' },
              { jour: 11, creneau: 'matin', texte: "M FONTAINE - Pose de baignoir d'angle" },
              { jour: 11, creneau: 'aprem', texte: 'M MERCIER - Installation et aménagement de dressing' },
              { jour: 12, creneau: 'matin', texte: 'M ROUSSEAU - Installation climatiseur monobloc' },
              { jour: 13, creneau: 'matin', ferie: true },
              { jour: 13, creneau: 'aprem', ferie: true },
              { jour: 15, creneau: 'matin', texte: 'M BOYER - Installation WC' },
              { jour: 16, creneau: 'matin', texte: 'M CHEVALIER - Remplacer un chauffe-eau' },
              { jour: 16, creneau: 'aprem', texte: 'M GARNIER - Isolation de comble' },
              { jour: 17, creneau: 'matin', texte: 'M LEGRAND - Installation WC' },
              { jour: 17, creneau: 'aprem', texte: "M GAUTIER - Installation d'un robot tondeuse" },
              { jour: 18, creneau: 'matin', texte: 'M PERRIER - Pose porte de garage avec portillon intégré' },
              { jour: 18, creneau: 'aprem', texte: 'M GARCIAS - Pose de verrière de 4 à 7 carreaux' },
              { jour: 19, creneau: 'aprem', texte: "M BARRE - Pose de baignoir d'angle" },
              { jour: 22, creneau: 'matin', texte: 'M MARCHAND - Pose de verrière de 4 à 7 carreaux' },
              { jour: 22, creneau: 'aprem', texte: 'M DUVAL - Pose de plan de travail cuisine' },
              { jour: 24, creneau: 'matin', texte: 'M MEYER - Pose de bloc porte intérieur' },
              { jour: 24, creneau: 'aprem', texte: 'M DUMONT - Pose porte de garage avec portillon intégré' },
              { jour: 25, creneau: 'matin', texte: 'M DUFOUR - Pose et installation de baignoire' },
              { jour: 25, creneau: 'aprem', texte: 'M MEUNIER - Installation WC' },
              { jour: 26, creneau: 'matin', texte: 'M PELLETIER - Isolation de comble' },
              { jour: 26, creneau: 'aprem', texte: 'M LE GOLF - Installation et aménagement de dressing' },
              { jour: 27, creneau: 'matin', texte: 'M LEBRUN - Pose de parquet stratifié' },
              { jour: 29, creneau: 'matin', texte: 'M HAMON - Remplacer un chauffe-eau' },
              { jour: 29, creneau: 'aprem', texte: 'M MALLET - Pose flottante de dalles' },
            ],
          },
          {
            titre: 'MAI 202N', decalage: 3, nbJours: 31,
            creneaux: [
              { jour: 1, creneau: 'matin', ferie: true },
              { jour: 1, creneau: 'aprem', ferie: true },
              { jour: 3, creneau: 'matin', texte: 'M ROBERT - Installation alarme maison' },
              { jour: 8, creneau: 'matin', ferie: true },
              { jour: 8, creneau: 'aprem', ferie: true },
              { jour: 9, creneau: 'matin', texte: 'M GILLET - Installation cuisine' },
              { jour: 13, creneau: 'matin', texte: 'M PERROT' },
              { jour: 14, creneau: 'aprem', texte: 'M LACROIX - Remplacer un chauffe-eau' },
              { jour: 17, creneau: 'aprem', texte: 'M GUICHARD - Entretien et ramonage poêle à bois' },
              { jour: 22, creneau: 'aprem', texte: "M CORDIER - Installation d'un robot tondeuse" },
              { jour: 25, creneau: 'matin', ferie: true },
              { jour: 25, creneau: 'aprem', ferie: true },
              { jour: 27, creneau: 'matin', texte: 'M FABRE - Installation climatiseur monobloc' },
              { jour: 27, creneau: 'aprem', texte: 'M BICHON - Remplacer un chauffe-eau' },
            ],
          },
        ],
      },
      {
        type: 'etapeslivraison',
        id: 'annexe5',
        titre: 'Annexe 5 — Reconstitution des étapes de la livraison',
        nbEtapes: 6,
        schema: {
          etiquettes: [
            'Livraison à votre domicile des articles',
            'Signature du bon de commande',
            'SMS de rappel la veille de la livraison',
            'Préparation du produit',
            'Évaluez la livraison sur votre smartphone',
            "Une semaine avant, appel pour le choix de l'heure du créneau de livraison",
          ],
          nbZones: 6,
        },
      },
      {
        type: 'bulle',
        id: 'annexe6',
        titre: 'Annexe 6 — Énoncé des délais et des étapes de la livraison',
        perso: '/docs/leroy-merlin-m4/perso-conseiller.png',
        placeholder: 'Expliquez au couple le délai et les différentes étapes de la livraison…',
        nbLignes: 6,
      },
      {
        type: 'sms',
        id: 'annexe7',
        titre: 'Annexe 7 — SMS de rappel',
        entete: 'Leroy Merlin',
        date: "Aujourd'hui 08 : 43",
      },
      {
        type: 'grille',
        id: 'annexe8',
        titre: 'Annexe 8 — Questions de votre tutrice',
        colonnes: ['Questions', 'Réponses'],
        nbLignes: 4,
        largeurs: ['30%', '70%'],
        reponseMultiligne: true,
        lignesReponse: 4,
        prerempli: [
          ['Résumez ce que signifie « Rassurer » dans la technique des « 4 R »', ''],
          ['Résumez ce que signifie « Remercier » dans la technique des « 4 R »', ''],
          ['Résumez ce que signifie « Raccompagner » dans la technique des « 4 R »', ''],
          ['Résumez ce que signifie « Revoir » dans la technique des « 4 R »', ''],
        ],
      },
      {
        type: 'bulle',
        id: 'annexe9',
        titre: 'Annexe 9 — Phrase de la prise de congé',
        perso: '/docs/leroy-merlin-m4/perso-conseiller.png',
        placeholder: 'Rédigez la phrase de prise de congé en respectant les 4 R…',
        nbLignes: 5,
      },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: "Utilisez la technique de la « peau de l'ours » pour rédiger la phrase d'accord.",
        documents: ['Document 1', 'Annexe 1'],
        bareme: 2,
        reponse: "« Alors quand seriez-vous disponible pour la pose de votre dressing ? »",
      },
      {
        intitule: "Analysez l'article sur la formalisation de l'accord du client.",
        documents: ['Document 2', 'Annexe 2'],
        bareme: 3,
        reponse: '',
        tableau: {
          colonnes: ['Questions', 'Réponses'],
          lignes: [
            ['Conséquence une fois le bon de commande daté et signé ?', "Le bon de commande, une fois signé et daté par le client, implique son accord pour entamer les travaux et le prive ensuite de toute voie de recours concernant le tarif demandé."],
            ["Autre moyen que la signature pour manifester son accord ?", "A défaut d'une signature sur le devis lui-même, le client peut vous faire parvenir une « lettre de bon pour accord », dans laquelle il vous fait connaître explicitement son accord…"],
            ["Accord oral : le client est-il engagé ?", "Dans tous les cas, un bon de commande non signé par le client ne l'engage en rien, même s'il vous a manifesté verbalement son accord !"],
          ],
        },
      },
      {
        intitule: 'Complétez le bon de commande.',
        documents: ['Mission 3 — Document 1 et annexe 1a', 'Annexe 3'],
        bareme: 6,
        reponse: '',
        tableau: {
          colonnes: ['Champ', 'Réponse attendue'],
          lignes: [
            ['Coordonnées client', 'Mme Rebecca Sankouraga — 7 rue Dombasle, 75015 Paris — Tél : 07.06.05.04.XX'],
            ['Date', '02 avril 202N'],
            ['Référence', '83299641'],
            ['Libellé article', 'Dressing chêne H200 x L240'],
            ['Quantité', '1'],
            ['Prix HT', '1244,05'],
            ['Prix TTC', '1492,86'],
            ['Base HT (TVA 20%)', '1244,05'],
            ['Montant Total', '1492,86'],
            ["Montant de l'avoir (30%)", '447,86 €'],
            ['Délais de livraison', '30 jours'],
          ],
        },
      },
      {
        intitule: "Complétez le planning d'intervention.",
        documents: ['Document 3', 'Annexe 4'],
        bareme: 4,
        reponse: "Délai de 30 jours à compter du jour suivant la signature (02 avril 202N), hors dimanches et jours fériés. Le créneau retenu est le mardi 2 mai 202N (après-midi) : « Mme Sankouraga - Installation et aménagement de dressing ».",
      },
      {
        intitule: 'Reconstituez les étapes de la livraison.',
        documents: ['Document 4', 'Annexe 5'],
        bareme: 6,
        reponse: "1. Signature du bon de commande ; 2. Préparation du produit ; 3. Une semaine avant, appel pour le choix de l'heure du créneau de livraison ; 4. SMS de rappel la veille de la livraison ; 5. Livraison à votre domicile des articles ; 6. Évaluez la livraison sur votre smartphone.",
      },
      {
        intitule: 'Faites une phrase indiquant les délais et étapes de la livraison.',
        documents: ['Annexe 6'],
        bareme: 4,
        reponse: "« Maintenant que vous avez signé le bon de commande, je vais vous expliquer comment va se passer la suite. Votre dressing va être préparé et sera livré d'ici 30 jours. Une semaine avant la livraison, vous recevrez un appel du service client pour convenir d'un créneau (matin ou après-midi). Ensuite la veille, vous recevrez un SMS qui vous rappellera le créneau de livraison. Enfin, le lendemain, votre dressing sera livré à votre domicile et, une fois que cela sera fait, vous recevrez un SMS pour évaluer la livraison. »",
      },
      {
        intitule: 'Rédigez le SMS de rappel envoyé la veille.',
        documents: ['Document 5', 'Annexe 7'],
        bareme: 3,
        reponse: "« Bonjour Mme Sankouraga, votre dressing sera livré demain entre 9h et 11h. Merci et à bientôt sur www.leroymerlin.fr »",
      },
      {
        intitule: 'Répondez aux questions de votre tutrice sur les 4 R.',
        documents: ['Document 6', 'Annexe 8'],
        bareme: 4,
        reponse: '',
        tableau: {
          colonnes: ['Questions', 'Réponses'],
          lignes: [
            ['Rassurer', "Vous devez féliciter le client de sa décision. Le client veut être sûr d'avoir fait le bon choix… Rappelez-lui votre disponibilité, votre engagement afin de pérenniser votre relation."],
            ['Remercier', "En cas de vente, vous devez remercier le client de la confiance qu'il vous a accordé tout au long du processus d'achat..."],
            ['Raccompagner', "Il s'agit de clore le rendez-vous en développant une relation privilégiée. La politesse est l'attitude à adopter pour montrer du respect. Raccompagnez le client si c'est vous qui l'avez reçu."],
            ['Revoir', "Il faut avant tout montrer que vous restez à la disposition du client, par exemple en lui remettant votre carte de visite."],
          ],
        },
      },
      {
        intitule: 'Rédigez la phrase de prise de congé (4 R).',
        documents: ['Annexe 9'],
        bareme: 4,
        reponse: "« Vous avez vraiment fait un excellent choix. C'est un très beau dressing que vous avez choisi (Rassurer) et je vous remercie d'être venu chez Leroy Merlin (Remercier). Allez-y ! Je vous raccompagne (Raccompagner). Après l'installation, je vous passerai un petit coup de fil pour savoir si tout s'est bien passé (Revoir). »",
      },
    ],
  },
  synthese: {
    titre: "L'accord du client, les modalités de livraison et la prise de congé",
    proposition: [
      "La conclusion directe",
      "La peau de l'ours",
      'Le regret',
      'Signature du bon de commande',
      'Livraison à domicile des articles',
      'Rassurer',
      'Remercier',
      'Raccompagner',
      'Revoir',
    ],
    racine: {
      id: 'racine',
      texte: "L'exécution de la vente",
      enfants: [
        {
          id: 'accord',
          texte: "L'accord du client — 3 techniques de conclusion",
          enfants: [
            { id: 'a-1', texte: null, reponse: 'La conclusion directe' },
            { id: 'a-2', texte: null, reponse: "La peau de l'ours" },
            { id: 'a-3', texte: null, reponse: 'Le regret' },
          ],
        },
        {
          id: 'commande',
          texte: 'La formalisation',
          enfants: [
            { id: 'co-1', texte: "Le bon de commande signé et daté vaut engagement" },
          ],
        },
        {
          id: 'livraison',
          texte: 'Le suivi de la livraison',
          enfants: [
            { id: 'l-1', texte: '1re étape', enfants: [{ id: 'l-1-1', texte: null, reponse: 'Signature du bon de commande' }] },
            { id: 'l-2', texte: '5e étape', enfants: [{ id: 'l-2-1', texte: null, reponse: 'Livraison à domicile des articles' }] },
          ],
        },
        {
          id: 'conge',
          texte: 'La prise de congé — La technique des 4 R',
          enfants: [
            { id: 'c-1', texte: null, reponse: 'Rassurer' },
            { id: 'c-2', texte: null, reponse: 'Remercier' },
            { id: 'c-3', texte: null, reponse: 'Raccompagner' },
            { id: 'c-4', texte: null, reponse: 'Revoir' },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1',
        intitule: "Obtenir l'accord et formaliser la commande",
        indicateurs: [
          { niveau: 'novice', description: "Je ne sais pas conclure une vente ni remplir un bon de commande." },
          { niveau: 'debrouille', description: 'Je conclus maladroitement et remplis le bon de façon incomplète.' },
          { niveau: 'averti', description: "J'utilise une technique de conclusion et complète correctement le bon de commande." },
          { niveau: 'expert', description: "Je conclus avec aisance et formalise une commande sans erreur." },
        ],
      },
      {
        id: 'c2',
        intitule: 'Planifier et suivre la livraison',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas planifier une intervention.' },
          { niveau: 'debrouille', description: 'Je place le rendez-vous sans tenir compte des délais.' },
          { niveau: 'averti', description: 'Je calcule le délai et planifie correctement l\'intervention.' },
          { niveau: 'expert', description: 'Je planifie et j\'explique clairement toutes les étapes de la livraison.' },
        ],
      },
      {
        id: 'c3',
        intitule: 'Réussir la prise de congé (4 R)',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas la technique des 4 R.' },
          { niveau: 'debrouille', description: 'Je cite quelques R sans les appliquer.' },
          { niveau: 'averti', description: 'Je rédige une prise de congé respectant les 4 R.' },
          { niveau: 'expert', description: 'Je soigne la prise de congé pour fidéliser le client.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: "Peau de l'ours", definition: "Technique de conclusion où le commercial se comporte comme si le client avait déjà acheté." },
      { terme: 'Conclusion directe', definition: 'Le commercial invite naturellement le client à finaliser la vente.' },
      { terme: 'Le regret', definition: "Présenter un avantage dont le client ne profitera que s'il achète immédiatement." },
      { terme: 'Bon de commande', definition: "Document qui, signé et daté, engage le client pour entamer les travaux." },
      { terme: 'Bon pour accord', definition: "Mention apposée par le client valant acceptation de la commande." },
      { terme: '4 R', definition: 'Rassurer, Remercier, Raccompagner, Revoir : technique de prise de congé.' },
      { terme: 'Fidélisation', definition: "Ensemble d'actions visant à inciter le client à revenir." },
      { terme: 'Avoir', definition: "Somme versée à la commande (ici 30% du montant total)." },
    ],
    flashcards: [
      { recto: "Peau de l'ours ?", verso: 'Se comporter comme si le client avait déjà acheté' },
      { recto: 'Conclusion directe ?', verso: 'Inviter naturellement le client à finaliser la vente' },
      { recto: 'Technique du regret ?', verso: "Présenter un avantage réservé à un achat immédiat" },
      { recto: 'Que faut-il pour engager le client ?', verso: 'Un bon de commande signé et daté' },
      { recto: 'Mention de sécurité sur un bon de commande ?', verso: '« Lu et approuvé » ou « Bon pour accord »' },
      { recto: 'Que signifient les 4 R ?', verso: 'Rassurer, Remercier, Raccompagner, Revoir' },
      { recto: 'Délai de livraison du dressing ?', verso: '30 jours' },
      { recto: 'Montant de l\'avoir (30%) ?', verso: '447,86 €' },
      { recto: 'Dernière étape de la vente / première de la fidélisation ?', verso: 'La prise de congé' },
      { recto: 'Comment compte-t-on le délai de livraison ?', verso: 'À partir du jour suivant la signature, hors dimanches et jours fériés' },
    ],
    quiz: [
      { type: 'unique', question: "« Vous souhaitez une extension de garantie avec ? » est une technique…", options: ['Conclusion directe', "Peau de l'ours", 'Le regret', 'La relance'], bonne: 1 },
      { type: 'unique', question: "« Alors vous la prenez ? » correspond à…", options: ['La conclusion directe', "La peau de l'ours", 'Le regret', "L'alternative"], bonne: 0 },
      { type: 'unique', question: "« Je peux vous faire -15% si vous le prenez ! » est…", options: ['La conclusion directe', "La peau de l'ours", 'Le regret', 'La synthèse'], bonne: 2 },
      { type: 'unique', question: "Qu'est-ce qui engage réellement le client ?", options: ['Accord oral', 'Bon de commande signé et daté', 'Un email', 'Un appel'], bonne: 1 },
      { type: 'unique', question: 'Quelle mention renforce la sécurité du bon de commande ?', options: ['« Vu »', '« Bon pour accord »', '« Reçu »', '« Noté »'], bonne: 1 },
      { type: 'qcm', question: 'Quels éléments composent les 4 R ?', options: ['Rassurer', 'Réduire', 'Raccompagner', 'Revoir'], bonnes: [0, 2, 3] },
      { type: 'unique', question: 'Quel est le délai de livraison du dressing ?', options: ['15 jours', '30 jours', '45 jours', '60 jours'], bonne: 1 },
      { type: 'unique', question: "Le montant de l'avoir versé (30%) est de…", options: ['447,86 €', '1244,05 €', '1492,86 €', '149,00 €'], bonne: 0 },
      { type: 'unique', question: 'Quelle est la première étape de la livraison ?', options: ['Préparation du produit', 'Signature du bon de commande', 'SMS de rappel', 'Livraison'], bonne: 1 },
      { type: 'unique', question: "La prise de congé est la dernière étape de la vente mais la première de…", options: ['la prospection', 'la fidélisation', "l'accueil", 'la négociation'], bonne: 1 },
    ],
    glisserDeposer: {
      consigne: 'Associez chaque élément à la bonne catégorie de la mission 4.',
      etiquettes: [
        "« Alors vous la prenez ? »",
        "« Vous souhaitez une extension de garantie avec ? »",
        '« Je peux vous faire -15% si vous le prenez ! »',
        'Bon de commande signé et daté',
        '« Bon pour accord »',
        'Rassurer et Remercier',
        'Raccompagner',
        'Revoir',
        '30 jours',
        '447,86 €',
      ],
      zones: [
        { libelle: 'Conclusion directe', etiquetteIndex: 0 },
        { libelle: "Peau de l'ours", etiquetteIndex: 1 },
        { libelle: 'Le regret', etiquetteIndex: 2 },
        { libelle: 'Ce qui engage le client', etiquetteIndex: 3 },
        { libelle: 'Mention de sécurité', etiquetteIndex: 4 },
        { libelle: 'Féliciter et remercier le client', etiquetteIndex: 5 },
        { libelle: 'Clore en relation privilégiée', etiquetteIndex: 6 },
        { libelle: 'Remettre sa carte de visite', etiquetteIndex: 7 },
        { libelle: 'Délai de livraison', etiquetteIndex: 8 },
        { libelle: "Montant de l'avoir (30%)", etiquetteIndex: 9 },
      ],
    },
  },
}



// ---------------------------------------------------------------------------
// CONTENU : Leroy Merlin, mission 5 - Selectionner le prestataire le plus
// adapte, suivre l'execution du service et rendre compte
// ---------------------------------------------------------------------------
const LEROY_MERLIN_M5: ContenuMission = {
  travaux: {
    consigne:
      "Étudiez les forfaits de pose, sélectionnez l'artisan le plus adapté selon les critères de l'enseigne, puis suivez l'exécution du service et rendez compte.",
    contexte:
      "Avant de vous lancer dans la sélection de l'artisan qui installera le dressing chez les clients, vous étudiez les différents forfaits qui sont proposés par l'enseigne.",
    documents: [
      {
        numero: 1,
        titre: 'Forfaits installation Leroy Merlin',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Document 1 — Forfaits installation Leroy Merlin' },
          {
            offresPrestation: [
              {
                titre: 'Installation de portes de placard coulissantes',
                prix: '229.00 € / Prestation',
                prixLibelle: 'À partir de',
                image: '/docs/leroy-merlin-m5/forfait1.jpg',
                note: '5', avis: '223 avis',
                details: [
                  "La dépose et la mise en déchetterie des éventuelles anciennes portes",
                  'La fixation des rails',
                  "L'installation et le réglage des deux vantaux",
                  'La découpe de plinthes en bois si nécessaire',
                  'En option : Pose d\'un vantail supplémentaire +49€',
                  "En option : Pose d'une joue pour création d'une niche +85€",
                  'En option : Découpe de vos portes de placard standards recoupables (hors miroir) +70€',
                ],
                conditions: [
                  'Le lieu de pose sera accessible et dégagé',
                  "Les dimensions de l'ouverture sont adaptées aux nouveaux vantaux",
                ],
                engagements: [
                  { titre: 'Des artisans sélectionnés', texte: "Vos travaux sont réalisés par l'un de nos 6000 artisans partenaires signataires de la Charte Qualité Leroy Merlin" },
                  { titre: 'Des travaux garantis', texte: "Nous garantissons le bon achèvement de vos travaux, les produits et la prestation de pose jusqu'à 10 ans." },
                  { titre: 'Des prix fixes et sans surprise', texte: 'Les prix de nos forfaits de pose sont fermes et définitifs.' },
                ],
              },
              {
                titre: "Montage d'un rangement Spaceo Home jusqu'à 4 caissons",
                prix: '149.00 €',
                prixLibelle: "L'installation :",
                image: '/docs/leroy-merlin-m5/forfait2.jpg',
                note: '5', avis: '19 avis',
                filAriane: "Accueil › Services › Bricolage pour vos travaux à domicile › Pose et installation à domicile › Tous nos forfaits de pose › Rangement / dressing",
                details: ['Le montage des caissons et de leurs tablettes uniquement'],
                conditions: [
                  "Le lieu d'entretien sera accessible et dégagé",
                  'Le montage concernera les caissons Spaceo Home',
                ],
                engagements: [
                  { titre: 'Des artisans sélectionnés', texte: "Vos travaux sont réalisés par l'un de nos 6000 artisans partenaires signataires de la Charte Qualité Leroy Merlin" },
                  { titre: 'Des travaux garantis', texte: "Nous garantissons le bon achèvement de vos travaux, les produits et la prestation de pose jusqu'à 10 ans." },
                ],
              },
              {
                titre: 'Installation et aménagement de rangement Spaceo Home, 4 caissons et accessoires',
                prix: '289.00 € / Prestation',
                prixLibelle: "L'installation :",
                image: '/docs/leroy-merlin-m5/forfait3.jpg',
                note: '5', avis: '38 avis',
                filAriane: "Accueil › Services › Bricolage pour vos travaux à domicile › Pose et installation à domicile › Tous nos forfaits de pose › Rangement / dressing",
                details: [
                  "L'installation des caissons, tablettes, accessoires, portes, tiroirs, aménagements intérieurs, découpes sur plinthes bois",
                  "L'installation des éclairages éventuels (sur alimentation électrique existante à moins d'1 mètre de l'installation), la fixation au mur",
                ],
                conditions: [
                  'Le lieu de pose sera accessible et dégagé',
                  "Les revêtements de mur et de sol ne nécessitent pas d'être repris.",
                ],
                engagements: [
                  { titre: 'Des artisans sélectionnés', texte: "Vos travaux sont réalisés par l'un de nos 6000 artisans partenaires signataires de la Charte Qualité Leroy Merlin" },
                  { titre: 'Des travaux garantis', texte: "Nous garantissons le bon achèvement de vos travaux, les produits et la prestation de pose jusqu'à 10 ans." },
                  { titre: 'Des prix fixes et sans surprise', texte: 'Les prix de nos forfaits de pose sont fermes et définitifs.' },
                ],
              },
            ],
          },
        ],
      },
      {
        numero: 2,
        titre: "Critères de sélection de l'artisan",
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: "Document 2 — Critères de sélection de l'artisan" },
          {
            mailLecture: {
              de: 'annie.male@leroymerlin.fr',
              a: 'conseillers.vente@leroymerlin.fr',
              objet: 'Sélectionner le meilleur artisan pour la pose de matériel',
              corps: [
                'Bonjour,',
                "Pour vous aider à sélectionner le meilleur artisan pour la pose des articles achetés par nos clients, vous respecterez les critères suivants :",
                "Pour des raisons environnementales, l'artisan devra se trouver à 10km maximum du domicile du client ;",
                "L'artisan devra évidemment être disponible pour l'installation le lendemain du jour de la livraison ;",
                "L'artisan devra être spécialisé dans l'installation de rangement et de dressings ;",
                'Le coût de la prestation devra être inférieur ou égal à celui annoncé sur le site Leroy Merlin ;',
                "L'équipe de l'artisan doit être constituée de deux professionnels minimums pour la pose ;",
                "L'équipe doit être disponible pendant 4h pour effectuer la prestation.",
                'Cordialement,',
                'Annie Mâle, Responsable',
              ],
            },
          },
        ],
      },
      {
        numero: 3,
        titre: 'Extrait de la liste des artisans travaillant avec Leroy Merlin',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Document 3a — Extrait de la liste des artisans travaillant avec Leroy Merlin' },
          {
            tableau: {
              colonnes: ['Entreprises', 'Localisation', "Indisponibilités (mai)", 'Services proposés', 'Nb pros', 'Heures dispo', 'Coût prestation', 'Remarques'],
              lignes: [
                ["Install'Tout André", '12 rue Solférino, 92 Vanves', '2 – 7 – 12 – 22 – 27 – 16/05', 'Rangements/Dressing', '2', '4', '71,25€/heure', 'R.A.S.*'],
                ['Établissements Gaudriche', '25 av. de Lamballe, 75016 Paris', '5 – 9 – 11 – 23 – 28 – 30/05', 'Plombier/Chauffagiste', '2', '4', '73,00€/heure', 'Utilitaire de travail en réparation'],
                ['Akus Installation', '4 rue Michelet, 92150 Suresnes', '4 – 6 – 12 – 21 – 27 – 17/05', 'Rangements/Dressing', '3', '4', '79,25€/heure', 'R.A.S.*'],
                ['CycloInstallation', '20 rue Rambuteau, 75003 Paris', '2 – 9 – 13 – 18 – 25 – 28/05', 'Rangements/Dressing', '2', '4', '71,50€/heure', 'R.A.S.*'],
                ['Entreprise Sanchez', '13 av. Jean Moulin, 75014 Paris', '3 – 4 – 9 – 11 – 15 – 16/05', 'Portes et fenêtres', '4', '4', '72,25€/heure', 'R.A.S.*'],
                ['Les Installateurs du 92', '41 rue Armengaud, 92110 Saint-Cloud', '7 – 8 – 9 – 10 – 11 – 15/05', 'Rangements/Dressing', '1', '4', '68.00€/heure', 'R.A.S.*'],
                ['Atelier Carlier', '22 rue Bonnelais, 94140 Clamart', '11 – 13 – 17 – 27 – 28 – 30/05', 'Climatisation', '2', '4', '55,00€/heure', 'R.A.S.*'],
                ["Les artisans de l'Installation", '33 rue Blanche, 75009 Paris', '2 – 7 – 12 – 22 – 27 – 16/05', 'Rangements/Dressing', '2', '4', '72,25€/heure', 'Un salarié en arrêt maladie'],
                ['Installateurs 2000', '7 rue Jules Ferry, 94200 Ivry sur Seine', '2 – 7 – 16 – 22 – 26 – 28/05', 'Rangements/Dressing', '3', '4', '72,25€/heure', 'R.A.S.*'],
                ['Établissements FGT', '15 rue Danton, 93100 Montreuil', '4 – 6 – 14 – 18 – 25 – 30/05', 'Rénovation/Menuiserie', '2', '4', '72,25€/heure', 'R.A.S.*'],
                ['Entreprise Lecomte', '22 rue Parmentier, 92200 Neuilly', '3 – 7 – 14 – 17 – 27 – 29/05', 'Rangements/Dressing', '2', '4', '70,25€/heure', 'R.A.S.*'],
                ['Les Installateurs Parisiens', '25 rue Chanzy, 75011 Paris', '2 – 9 – 12 – 20 – 26 – 29/05', 'Rangements/Dressing', '1', '4', '69,25€/heure', 'R.A.S.*'],
              ],
            },
          },
          { paragraphes: ['R.A.S.* = Rien à signaler = Aucune remarque à faire'] },
          { intertitre: '3b — Calcul de la distance avec Google Maps' },
          { paragraphes: ['Cliquez sur le bouton ci-dessous pour ouvrir Google Maps et calculer la distance en voiture entre l\'entreprise et le domicile des clients.'] },
        ],
      },
      {
        numero: 4,
        titre: 'La méthode C.R.O.C.',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Document 4 — La méthode C.R.O.C.' },
          { paragraphes: ["En émission d'appel, utilisez le CROC.", "Lorsque vous appelez un client ou un prospect, vous appliquerez pendant l'appel la méthode CROC."] },
          {
            tableau: {
              colonnes: ['CROC', 'Éléments de communication'],
              lignes: [
                ['Contact', "Saluer, se présenter, présenter l'entreprise, demander l'interlocuteur désiré"],
                ["Raison d'appel", 'Dire le motif pour lequel vous appelez le client'],
                ['Objectif', 'Ce que le commercial veut obtenir : une information, un rendez-vous, une vente…'],
                ['Conclusion', "Reformuler ce qui a été dit pendant l'objectif. Prendre congé : remercier, saluer et raccrocher après l'interlocuteur"],
              ],
            },
          },
        ],
      },
      {
        numero: 5,
        titre: 'La réponse de Mme Sankouraga',
        images: [],
        texte: [
          { pageWeb: true },
          { intertitre: 'Document 5 — La réponse de Mme Sankouraga' },
          {
            mailLecture: {
              de: 'r.sankouraga@gmail.com',
              a: 'conseillerdeventestagiaire@leroymerlin.fr',
              objet: 'Réponse à votre appel',
              corps: [
                'Bonjour,',
                "J'ai bien reçu votre appel sur mon portable il y a quelques jours, mais comme nous vous l'avions dit le jour où nous nous sommes rencontrés, nous sommes partis en vacances pour quelques semaines.",
                "Concernant votre question sur l'installation de notre dressing, globalement, tout s'est bien passé mais je comptais tout de même vous contacter à mon retour pour vous exposer deux problèmes.",
                "Premièrement, l'équipe de montage est arrivée avec 1h30 de retard ce qui a été problématique car j'avais un rendez-vous après que j'ai dû annuler. Enfin, l'une des portes du dressing n'a pas été correctement montée puisque le soir même en la manipulant, la charnière du haut s'est décrochée. C'est mon mari qui a été obligé de tout remettre (v. photo).",
                "Pour autant, je vous remercie d'avoir pris de nos nouvelles.",
                'Cordialement,',
                'Rebecca Sankouraga',
              ],
            },
          },
        ],
      },
    ],
    objectifs: [
      "Sélectionner le prestataire le plus adapté à partir de critères précis.",
      "Suivre l'exécution du service (appel CROC) et rendre compte par écrit.",
    ],
    competence: {
      groupe: 'Compétences travaillées',
      intitule: 'C.2.2 — Mettre en œuvre le ou les service(s) associé(s)',
      detail: "Sélectionner le prestataire, suivre l'exécution du service et rendre compte.",
    },
    activites: [
      {
        titre: 'Activité 1 — La sélection du prestataire le plus adapté',
        contexte: "Avant de vous lancer dans la sélection de l'artisan qui installera le dressing chez les clients, vous étudiez les différents forfaits qui sont proposés par l'enseigne.",
        questions: [
          { numero: 1, consigne: "Trois forfaits de pose sont proposés chez Leroy Merlin. Pour chacun d'eux, indiquez quels sont les détails de l'offre.", ressources: 'Consulter le document 1, compléter l\'annexe 1.', annexeId: 'annexe1' },
          { numero: 2, consigne: "Relisez la Mission 2 annexe 5, puis indiquez parmi les 3 prestations laquelle choisir pour le montage et l'installation du dressing de Mme et M. Sankouraga. Justifiez.", ressources: 'Consulter le document 1, compléter l\'annexe 2.', annexeId: 'annexe2' },
          { numero: 3, consigne: "Retrouvez l'adresse des clients et écrivez-la.", ressources: 'Consulter la Mission 3 document 1, compléter l\'annexe 3.', annexeId: 'annexe3', contexteAvant: "Nous sommes 7 jours après la signature du bon de commande et votre tutrice, Mme Annie Mâle, vous demande de sélectionner sur la liste des artisans travaillant avec Leroy Merlin, celui qui réalisera la prestation." },
          { numero: 4, consigne: "À partir de l'adresse des clients, calculez la distance en voiture entre l'adresse de l'entreprise et le domicile des clients.", ressources: 'Consulter les documents 3a et 3b, compléter l\'annexe 4.', annexeId: 'annexe4', boutonLien: 'https://www.google.fr/maps/@46.2192649,2.0517,6z', boutonLibelle: 'Ouvrir Google Maps' },
          { numero: 5, consigne: "Identifiez l'artisan qui ira installer le dressing chez le couple. Justifiez votre réponse en reprenant chaque critère.", ressources: 'Consulter le document 2, le document 3a et l\'annexe 4, compléter l\'annexe 5.', annexeId: 'annexe5' },
        ],
      },
      {
        titre: "Activité 2 — Suivre l'exécution du service et rendre compte",
        contexte: "Le dressing a été installé depuis quelques jours et votre responsable vous demande de contacter Mme et M. Sankouraga par téléphone pour savoir comment s'est passée la prestation.",
        questions: [
          { numero: 6, consigne: 'Préparez votre appel téléphonique en utilisant la méthode CROC.', ressources: 'Consulter le document 4, compléter l\'annexe 6.', annexeId: 'annexe6' },
          { numero: 7, consigne: "À partir de la réponse envoyée par Mme Sankouraga, faites un compte rendu par mail à votre responsable (annie.male@leroymerlin.fr) pour la tenir au courant.", ressources: 'Consulter le document 5, compléter l\'annexe 7.', annexeId: 'annexe7', contexteAvant: "Vous n'avez pas réussi à joindre directement le couple par téléphone. Vous avez laissé un message à Mme Sankouraga sur son smartphone et elle vous a répondu sur votre mail dont l'adresse est (conseillerventestagiaire@leroymerlin.fr)." },
        ],
      },
    ],
    annexes: [
      {
        type: 'grille',
        id: 'annexe1',
        titre: 'Annexe 1 — Les détails des prestations',
        colonnes: ['Nom de la prestation', 'Détails de la prestation', "Conditions d'application"],
        nbLignes: 3,
        largeurs: ['24%', '46%', '30%'],
        reponseMultiligne: true,
        lignesReponse: 5,
      },
      {
        type: 'grille',
        id: 'annexe2',
        titre: 'Annexe 2 — La prestation retenue',
        colonnes: ['Nom de la prestation', 'Justification'],
        nbLignes: 1,
        largeurs: ['40%', '60%'],
        reponseMultiligne: true,
        lignesReponse: 4,
      },
      {
        type: 'bulle',
        id: 'annexe3',
        titre: 'Annexe 3 — L\'adresse de Mme et M. Sankouraga',
        perso: '/docs/leroy-merlin-m4/perso-conseiller.png',
        placeholder: "Recopiez ici l'adresse des clients…",
        nbLignes: 2,
      },
      {
        type: 'grille',
        id: 'annexe4',
        titre: 'Annexe 4 — La distance en km entre l\'entreprise et le domicile du couple',
        colonnes: ['Entreprises', 'Distance (km)', 'Entreprises', 'Distance (km)'],
        nbLignes: 6,
        largeurs: ['30%', '20%', '30%', '20%'],
        prerempli: [
          ["Install'Tout André", '', 'Atelier Carlier', ''],
          ['Établissements Gaudriche', '', "Les artisans de l'Installation", ''],
          ['Akus Installation', '', 'Installateurs 2000', ''],
          ['CycloInstallation', '', 'Établissements FGT', ''],
          ['Entreprise Sanchez', '', 'Entreprise Lecomte', ''],
          ['Les Installateurs du 92', '', 'Les Installateurs Parisiens', ''],
        ],
      },
      {
        type: 'grille',
        id: 'annexe5',
        titre: 'Annexe 5 — L\'artisan retenu',
        colonnes: ['Critère', 'Justification'],
        nbLignes: 7,
        largeurs: ['40%', '60%'],
        reponseMultiligne: true,
        lignesReponse: 2,
        prerempli: [
          ["Nom de l'artisan retenu", ''],
          ['Critère 1 : La distance (10 km maximum)', ''],
          ["Critère 2 : La disponibilité de l'artisan", ''],
          ["Critère 3 : La spécialisation de l'artisan", ''],
          ['Critère 4 : Le coût de la prestation', ''],
          ['Critère 5 : Le nombre de professionnels pour la pose', ''],
          ['Critère 6 : Le temps de pose (4h)', ''],
        ],
      },
      {
        type: 'ficheappel',
        id: 'annexe6',
        titre: "Annexe 6 — Fiche d'appel CROC",
        sections: [
          { cle: 'contact', libelle: 'CONTACT', aide: "Saluer, se présenter, présenter l'entreprise, vérifier l'interlocuteur", lignes: 2 },
          { cle: 'raison', libelle: "RAISON D'APPEL", aide: "Dire le motif de l'appel", lignes: 2 },
          { cle: 'objectif', libelle: 'OBJECTIF', aide: 'Ce que vous voulez obtenir', lignes: 2 },
          { cle: 'conclusion', libelle: 'CONCLUSION', aide: 'Reformuler, remercier, saluer, raccrocher après l\'interlocuteur', lignes: 3 },
        ],
      },
      {
        type: 'mail',
        id: 'annexe7',
        titre: 'Annexe 7 — Compte rendu par mail',
      },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: "Pour chaque forfait, indiquez les détails de l'offre.",
        documents: ['Document 1', 'Annexe 1'],
        bareme: 9,
        reponse: '',
        tableau: {
          colonnes: ['Nom de la prestation', "Détails de l'offre", "Conditions d'application"],
          lignes: [
            ['Installation de portes de placard coulissantes', "Dépose et mise en déchetterie des anciennes portes ; fixation des rails ; installation et réglage des deux vantaux ; découpe de plinthes en bois si nécessaire (+ options).", "Le lieu de pose sera accessible et dégagé ; les dimensions de l'ouverture sont adaptées aux nouveaux vantaux."],
            ["Montage d'un rangement Spaceo Home jusqu'à 4 caissons", 'Le montage des caissons et de leurs tablettes uniquement.', "Le lieu de pose sera accessible et dégagé ; le montage concernera les caissons Spaceo Home."],
            ['Installation et aménagement de rangement Spaceo Home, 4 caissons et accessoires', "Installation des caissons, tablettes, accessoires, portes, tiroirs, aménagements intérieurs, découpes sur plinthes bois ; installation des éclairages éventuels, fixation au mur.", "Le lieu de pose sera accessible et dégagé ; les revêtements de mur et de sol ne nécessitent pas d'être repris."],
          ],
        },
      },
      {
        intitule: 'Indiquez la prestation à retenir et justifiez.',
        documents: ['Mission 2 annexe 5', 'Document 1', 'Annexe 2'],
        bareme: 2,
        reponse: "Installation et aménagement de rangement Spaceo Home, 4 caissons et accessoires. Cette prestation comprend le montage du dressing, des tiroirs, des portes et des accessoires contrairement aux 2 autres.",
      },
      {
        intitule: "Retrouvez l'adresse des clients.",
        documents: ['Mission 3 document 1', 'Annexe 3'],
        bareme: 1,
        reponse: '15 rue Dombasle, 75015 Paris.',
      },
      {
        intitule: "Calculez la distance entre l'entreprise et le domicile du couple.",
        documents: ['Documents 3a et 3b', 'Annexe 4'],
        bareme: 6,
        reponse: '',
        tableau: {
          colonnes: ['Entreprises', 'Distance', 'Entreprises', 'Distance'],
          lignes: [
            ["Install'Tout André", '2,1 km', 'Atelier Carlier', '5,3 km'],
            ['Établissements Gaudriche', '3,2 km', "Les artisans de l'Installation", '7,1 km'],
            ['Akus Installation', '9 km', 'Installateurs 2000', '8,2 km'],
            ['CycloInstallation', '6 km', 'Établissements FGT', '19 km'],
            ['Entreprise Sanchez', '4,2 km', 'Entreprise Lecomte', '1,5 km'],
            ['Les Installateurs du 92', '7,5 km', 'Les Installateurs Parisiens', '7,6 km'],
          ],
        },
      },
      {
        intitule: "Identifiez l'artisan retenu et justifiez par chaque critère.",
        documents: ['Document 2', 'Document 3a', 'Annexe 4', 'Annexe 5'],
        bareme: 6,
        reponse: '',
        tableau: {
          colonnes: ['Critère', 'Justification'],
          lignes: [
            ["Nom de l'artisan retenu", 'Installateurs 2000'],
            ['Distance (10 km max)', 'Situé à 8,2 km'],
            ['Disponibilité (lendemain de la livraison, le 18/05)', "Rien dans son planning le 18/05"],
            ['Spécialisation', 'Spécialisé dans le rangement/dressing'],
            ['Coût (≤ prix du site)', '72,25 €/h × 4h = 289 € (égal au prix annoncé sur le site Leroy Merlin)'],
            ['Nombre de professionnels (2 min)', "L'équipe est constituée de 3 professionnels"],
            ['Temps de pose (4h)', "L'équipe est disponible 4h"],
          ],
        },
      },
      {
        intitule: "Préparez l'appel téléphonique avec la méthode CROC.",
        documents: ['Document 4', 'Annexe 6'],
        bareme: 4,
        reponse: '',
        tableau: {
          colonnes: ['CROC', 'Réponse attendue'],
          lignes: [
            ['Contact', "Bonjour, M. X de l'entreprise Leroy Merlin, c'est bien Mme Sankouraga ?"],
            ["Raison d'appel", "Je vous appelle par rapport au dressing qui vous a été livré et installé il y a quelques jours."],
            ['Objectif', "Je souhaiterais savoir si tout s'est bien passé lors de la pose de votre dressing."],
            ['Conclusion', "Reformuler (selon ce qu'a dit la cliente). Je vous remercie Mme Sankouraga d'avoir répondu à mes questions. Je vous souhaite une très bonne journée. Au revoir !"],
          ],
        },
      },
      {
        intitule: 'Rédigez le compte rendu par mail à votre responsable.',
        documents: ['Document 5', 'Annexe 7'],
        bareme: 5,
        reponse: "De : conseillerdeventestagiaire@leroymerlin.fr — À : annie.male@leroymerlin.fr — Objet : Compte rendu de l'appel à Mme Sankouraga. « Bonjour Madame Mâle, comme convenu, j'ai contacté il y a quelques jours Mme Sankouraga pour savoir comment s'était déroulée la pose de son dressing. Je n'ai pas réussi à la joindre directement car elle est en vacances à l'étranger, donc je lui ai laissé un message. Elle m'a répondu par mail. Dans son message, elle explique que si globalement tout s'est bien passé, elle a rencontré deux problèmes : tout d'abord, l'équipe de montage est arrivée avec 1h30 de retard, ce qui a été problématique car elle avait un rendez-vous après qu'elle a dû annuler. Enfin, l'une des portes du dressing n'a pas été correctement montée puisque le soir même, en la manipulant, la charnière du haut s'est décrochée ; c'est son mari qui a été obligé de tout remettre. Cordialement, Conseiller de vente. »",
      },
    ],
  },
  synthese: {
    titre: "Sélectionner le prestataire, suivre l'exécution du service et rendre compte",
    proposition: [
      'Contact',
      "Raison d'appel",
      'Objectif',
      'Conclusion',
      'Saluer',
      "Se présenter",
      "Présenter l'entreprise",
      "Vérifier l'interlocuteur",
    ],
    racine: {
      id: 'racine',
      texte: "Mettre en œuvre le service associé",
      enfants: [
        {
          id: 'selection',
          texte: "La sélection du prestataire",
          enfants: [
            { id: 's-1', texte: 'Critères : distance, disponibilité, spécialisation, coût, nombre de pros, temps de pose' },
          ],
        },
        {
          id: 'croc',
          texte: "Suivre l'exécution par téléphone — La méthode C.R.O.C.",
          enfants: [
            { id: 'cr-1', texte: null, reponse: 'Contact' },
            { id: 'cr-2', texte: null, reponse: "Raison d'appel" },
            { id: 'cr-3', texte: null, reponse: 'Objectif' },
            { id: 'cr-4', texte: null, reponse: 'Conclusion' },
          ],
        },
        {
          id: 'contact',
          texte: 'Le Contact comprend',
          enfants: [
            { id: 'c-1', texte: null, reponse: 'Saluer' },
            { id: 'c-2', texte: null, reponse: 'Se présenter' },
            { id: 'c-3', texte: null, reponse: "Présenter l'entreprise" },
            { id: 'c-4', texte: null, reponse: "Vérifier l'interlocuteur" },
          ],
        },
        {
          id: 'rendre',
          texte: 'Rendre compte par e-mail',
          enfants: [
            { id: 'rc-1', texte: 'Expéditeur, personnalisation, fonction, mentions obligatoires' },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1',
        intitule: 'Sélectionner un prestataire selon des critères',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas comparer des prestataires.' },
          { niveau: 'debrouille', description: 'Je compare sur un seul critère.' },
          { niveau: 'averti', description: 'Je croise plusieurs critères pour choisir le bon artisan.' },
          { niveau: 'expert', description: "Je justifie le choix de l'artisan critère par critère sans erreur." },
        ],
      },
      {
        id: 'c2',
        intitule: "Préparer un appel avec la méthode CROC",
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas la méthode CROC.' },
          { niveau: 'debrouille', description: 'Je cite les étapes sans les rédiger.' },
          { niveau: 'averti', description: 'Je rédige une fiche d\'appel CROC complète.' },
          { niveau: 'expert', description: 'Je mène un appel structuré et professionnel avec le CROC.' },
        ],
      },
      {
        id: 'c3',
        intitule: 'Rendre compte par écrit',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas rédiger un compte rendu.' },
          { niveau: 'debrouille', description: 'Je rédige un compte rendu incomplet.' },
          { niveau: 'averti', description: 'Je rédige un compte rendu clair reprenant les faits.' },
          { niveau: 'expert', description: 'Je rends compte de façon professionnelle, structurée et fidèle.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Prestataire', definition: "Entreprise ou artisan qui réalise un service pour le compte de l'enseigne." },
      { terme: 'Forfait de pose', definition: 'Prestation d\'installation à prix ferme et défini.' },
      { terme: 'Charte Qualité', definition: 'Engagement signé par les artisans partenaires de Leroy Merlin.' },
      { terme: 'CRM', definition: 'Outil de gestion de la relation et des données clients/partenaires.' },
      { terme: 'Méthode CROC', definition: "Contact, Raison d'appel, Objectif, Conclusion : structure d'un appel sortant." },
      { terme: 'Émission d\'appel', definition: "Appel sortant passé par le commercial vers un client ou prospect." },
      { terme: 'Rendre compte', definition: "Informer sa hiérarchie du déroulement et du résultat d'une action." },
      { terme: 'TVA à taux réduit', definition: "Taux de TVA appliqué à certains travaux dans l'habitat." },
      { terme: 'R.A.S.', definition: 'Rien à signaler : aucune remarque à faire.' },
      { terme: 'Prestation', definition: 'Service réalisé (ici, la pose/installation du dressing).' },
    ],
    flashcards: [
      { recto: 'Que signifie CROC ?', verso: "Contact, Raison d'appel, Objectif, Conclusion" },
      { recto: 'Distance maximale de l\'artisan ?', verso: '10 km du domicile du client' },
      { recto: 'Quand l\'artisan doit-il être disponible ?', verso: 'Le lendemain du jour de la livraison' },
      { recto: 'Spécialisation requise ?', verso: 'Installation de rangements et de dressings' },
      { recto: 'Nombre minimum de professionnels ?', verso: '2 minimum' },
      { recto: 'Durée de la prestation ?', verso: '4 heures' },
      { recto: 'Artisan retenu pour le couple ?', verso: 'Installateurs 2000 (8,2 km, 18/05, 289 €, 3 pros)' },
      { recto: 'Prix du forfait installation + aménagement Spaceo Home ?', verso: '289,00 € / prestation' },
      { recto: 'Que contient le Contact (CROC) ?', verso: "Saluer, se présenter, présenter l'entreprise, vérifier l'interlocuteur" },
      { recto: 'Deux problèmes signalés par Mme Sankouraga ?', verso: '1h30 de retard et une charnière de porte décrochée' },
    ],
    quiz: [
      { type: 'unique', question: 'Que signifie le C de CROC ?', options: ['Conclusion', 'Contact', 'Coût', 'Client'], bonne: 1 },
      { type: 'unique', question: "Distance maximale autorisée pour l'artisan ?", options: ['5 km', '10 km', '15 km', '20 km'], bonne: 1 },
      { type: 'unique', question: 'Quand l\'artisan doit-il intervenir ?', options: ['Le jour de la livraison', 'Le lendemain de la livraison', 'La semaine suivante', 'Au choix du client'], bonne: 1 },
      { type: 'unique', question: 'Quel artisan est retenu ?', options: ["Install'Tout André", 'Installateurs 2000', 'CycloInstallation', 'Entreprise Lecomte'], bonne: 1 },
      { type: 'unique', question: 'Coût de la prestation retenue (4h) ?', options: ['149 €', '229 €', '289 €', '339 €'], bonne: 2 },
      { type: 'qcm', question: 'Quels critères servent à choisir l\'artisan ?', options: ['La distance', 'La couleur du camion', 'La spécialisation', 'Le coût'], bonnes: [0, 2, 3] },
      { type: 'unique', question: 'Nombre minimum de professionnels exigé ?', options: ['1', '2', '3', '4'], bonne: 1 },
      { type: 'unique', question: 'Que signifie R.A.S. ?', options: ['Rangement à suivre', 'Rien à signaler', 'Réparation à suivre', 'Retard au service'], bonne: 1 },
      { type: 'unique', question: "Le O de CROC correspond à…", options: ['Objet', 'Objectif', 'Opération', 'Origine'], bonne: 1 },
      { type: 'qcm', question: 'Quels problèmes Mme Sankouraga signale-t-elle ?', options: ['1h30 de retard', 'Mauvaise couleur', 'Charnière décrochée', 'Prix trop élevé'], bonnes: [0, 2] },
    ],
    glisserDeposer: {
      consigne: 'Associez chaque élément à la bonne catégorie de la mission 5.',
      etiquettes: [
        "Saluer, se présenter, présenter l'entreprise",
        "Dire le motif de l'appel",
        'Ce que le commercial veut obtenir',
        "Reformuler, remercier, saluer",
        '10 km maximum',
        'Le lendemain de la livraison',
        'Rangements/Dressing',
        '289 € pour 4h',
        '2 professionnels minimum',
        'Installateurs 2000',
      ],
      zones: [
        { libelle: 'Contact (CROC)', etiquetteIndex: 0 },
        { libelle: "Raison d'appel (CROC)", etiquetteIndex: 1 },
        { libelle: 'Objectif (CROC)', etiquetteIndex: 2 },
        { libelle: 'Conclusion (CROC)', etiquetteIndex: 3 },
        { libelle: 'Critère distance', etiquetteIndex: 4 },
        { libelle: 'Critère disponibilité', etiquetteIndex: 5 },
        { libelle: 'Critère spécialisation', etiquetteIndex: 6 },
        { libelle: 'Critère coût', etiquetteIndex: 7 },
        { libelle: 'Critère équipe', etiquetteIndex: 8 },
        { libelle: 'Artisan retenu', etiquetteIndex: 9 },
      ],
    },
  },
}


// ---------------------------------------------------------------------------
// CONTENU : Peugeot, mission 1 - Le secteur de l'automobile
// ---------------------------------------------------------------------------
const PEUGEOT_M1: ContenuMission = {
  travaux: {
    consigne:
      "Découvrez le secteur de la concession automobile : étudiez le marché des concessions en France, comprenez ce qu'est une concession automobile et les particularités du contrat de concession, à partir des documents remis par votre tuteur.",
    contexte:
      "Vous êtes en PFMP dans la concession Peugeot située dans le 17ème arrondissement. L'entreprise est spécialisée dans la vente de véhicules neufs, d'occasions et d'accessoires. L'enseigne a ouvert ses portes il y a 4 mois.\nVotre tuteur, M. Paul Auchon, est commercial à ConcessionCollet depuis l'ouverture.\nÉtant donné que vous allez passer 4 semaines dans l'entreprise, il vous a fait un planning des différents services que vous allez découvrir tout au long de la période. Il vous remet le planning dont vous prenez connaissance.\nC'est votre premier jour de PFMP à la concession et vous le passez avec le directeur, M. Collet. C'est à votre tour de poser des questions à votre tuteur pour comprendre tout ce que recouvre le terme concession automobile. Il vous donne des documents concernant le secteur de la concession automobile et il vous demande de les étudier.",
    videoContexte: 'https://drive.google.com/file/d/1ZH-c_bdwpqT-TSZH12RmW5S6rtAYwVUt/view',
    documents: [
      { numero: 1, titre: 'Les chiffres sur les concessionnaires en France', texte: [
        { pageWeb: true },
        { intertitre: '122,604 milliards d\u2019euros de chiffre d\u2019affaires' },
        { paragraphes: [
          "En 2020, le chiffre d'affaires des concessionnaires français approchait les 122,604 milliards d'euros. Le secteur compte notamment 54 966 entreprises, dont plus de 6 000 concessionnaires exerçant avec les constructeurs et près de 8 000 agents de marque. Ces derniers travaillent en collaboration avec les concessionnaires.",
          "Si le chiffre d'affaires global est élevé, il est cependant inégal dans le détail puisque certains concessionnaires en enregistrent plus que d'autres. Au premier trimestre 2022, le groupe Parot arrive ainsi à faire 91 millions d'euros contre 87,4 millions d'euros l'année précédente sur la même période.",
        ] },
        { intertitre: '13 536 points de vente de marques automobiles en France' },
        { paragraphes: [
          "Sur la base des données communiquées par les constructeurs et les concessionnaires, L'Argus affirme qu'il y a eu une baisse du nombre total de points de vente auto. Avec les réseaux de distribution des principales marques, on comptait ainsi en janvier 2021, 13 536 points de vente de marques automobiles en France, soit une baisse de 168 sites par rapport à l'année précédente.",
          "Il est important de rappeler que certaines concessionnaires abritent parfois plusieurs marques. Aussi, le nombre de points de vente peut ne pas correspondre à 100 % au nombre de sites implantés sur tout le territoire. La baisse concerne surtout les agents de marque et les succursales des constructeurs qui ont perdu 36 sites en 2020 au profit d'opérateurs privés. Le nombre de concessions détenues par les grands groupes de distribution a, quant à lui, augmenté de 54 en 2020.",
        ] },
        { intertitre: '1,66 million de véhicules particuliers neufs vendus' },
        { paragraphes: [
          "Selon les chiffres communiqués par la PFA, l'année 2021 n'a pas été mirobolante pour le marché des automobiles. Sur l'année, 1,66 million de véhicules particuliers neufs ont été vendus, soit une hausse de 0,54 % par rapport à l'année précédente. Dans le détail, cela représente 9 000 voitures supplémentaires vendues par rapport à 2020.",
          "Comparés aux chiffres de vente de 2019, ceux de 2021 ne sont toutefois pas très reluisants puisqu'on enregistre une baisse des ventes de près de 25 %. En ce qui concerne les voitures électriques, il semblerait que les Français soient de plus en plus intéressés. En 2021, elles ont en effet réussi à atteindre une part de marché de plus de 10 % sur les voitures particulières neuves vendues sur le territoire.",
        ] },
        { intertitre: 'Une part de marché de 13 % pour l\u2019électrique' },
        { paragraphes: [
          "En 2022, les voitures électriques confirment leur succès en captant 13 % de parts de marché, soit tout autant que le diesel. En effet, ce dernier a perdu des points en 2022 et peine à atteindre les 14 % en termes de part de marché. L'hybride affiche également une baisse notable de 9 % tandis que les voitures fonctionnant avec des carburants alternatifs comme le GPL et le bioéthanol (6 % des immatriculations) semblent tenir le cap. Elles enregistrent en effet une hausse de près de 152 %.",
          "2022 voit par ailleurs un recul du nombre d'achats de voitures de la part des entreprises. Le marché des utilitaires accuse en effet une baisse de 28,60 % en mars et comptait ainsi seulement 34 055 immatriculations. Enfin, le marché de l'occasion affiche aussi une baisse de 14,3 % en mars avec 506 222 immatriculations enregistrées.",
        ] },
        { image: { src: '/docs/peugeot-m1/chiffres-concessionnaires.png', alt: 'Les chiffres sur les concessionnaires en France (page internet).', legende: 'Les chiffres sur les concessionnaires en France.' } },
      ] },
      { numero: 2, titre: 'Les explications du directeur M. Collet', texte: [
        { pageWeb: true },
        { intertitre: "Qu'est-ce qu'une concession automobile ?" },
        { paragraphes: [
          "Une concession automobile est une entreprise qui vend des véhicules neufs ou d'occasion. C'est un point de vente qui a signé un contrat avec une marque (le constructeur) pour distribuer ses véhicules et assurer le service après-vente.",
        ] },
        { intertitre: 'Les particularités du contrat de concession' },
        { puces: [
          "La durée : on décide de la durée pendant laquelle je pourrai vendre mes véhicules (10, 15, 20 ans…).",
          "La zone géographique : chaque concessionnaire est affecté à une zone géographique.",
          "L'engagement d'approvisionnement : je me suis engagé à me fournir chez la marque.",
        ] },
      ] },
    ],
    objectifs: [
      "Rechercher, hiérarchiser et actualiser les informations sur l'entreprise et son marché.",
      "Définir la concession automobile et identifier les particularités du contrat de concession.",
    ],
    competence: {
      groupe: 'Groupe de compétences 1',
      intitule: 'Conseiller et vendre — Assurer la veille commerciale',
      detail:
        "C.1.1 — Rechercher, hiérarchiser et actualiser les informations sur l'entreprise et son marché.",
    },
    activites: [
      {
        titre: 'Activité 1 — Le marché des concessions automobiles en France',
        contexte: "C'est votre premier jour de PFMP à la concession et vous le passez avec le directeur, M. Collet.",
        questions: [
          { numero: 1, consigne: 'Répondez aux questions de votre tuteur.', ressources: 'Lire le document 1, compléter l\'annexe 1.', annexeId: 'annexe1' },
        ],
      },
      {
        titre: "Activité 2 — Qu'est-ce qu'une concession automobile ?",
        contexte: "C'est à votre tour de poser des questions à votre tuteur pour comprendre tout ce que recouvre le terme concession automobile.",
        questions: [
          { numero: 2, consigne: "Expliquez avec vos propres mots ce qu'est une concession automobile.", ressources: 'Lire le document 2, compléter l\'annexe 2.', annexeId: 'annexe2' },
          { numero: 3, consigne: 'Citez les 3 particularités (caractéristiques) du contrat de concession.', ressources: 'Lire le document 2, compléter l\'annexe 3.', annexeId: 'annexe3' },
        ],
      },
    ],
    annexes: [
      {
        type: 'tableau',
        id: 'annexe1',
        titre: 'Annexe 1 — Les réponses aux questions du directeur M. Collet',
        lignes: [
          { id: 'q1', libelle: '« Combien y avait-il de concessionnaires en France en 2020 ? »' },
          { id: 'q2', libelle: '« Quel est le chiffre d\u2019affaires du groupe Parot en 2022 et 2021 ? Que constatez-vous ? »' },
          { id: 'q3', libelle: '« Quelle différence peut-on constater entre le nombre de points de vente des agents de marque et de succursales d\u2019un côté et le nombre de concessions des grandes marques ? »' },
          { id: 'q4', libelle: '« De combien a été l\u2019augmentation du nombre de véhicules vendus en 2021, en % et en nombre d\u2019unités ? »' },
          { id: 'q5', libelle: '« Comment se porte le marché de la voiture électrique par rapport aux autres types de véhicules ? »' },
          { id: 'q6', libelle: '« Combien d\u2019utilitaires ont été vendus en 2022 en % et en nombre d\u2019immatriculations ? »' },
        ],
      },
      {
        type: 'tableau',
        id: 'annexe2',
        titre: "Annexe 2 — Qu'est-ce qu'une concession automobile ?",
        lignes: [
          { id: 'def', libelle: 'Définition' },
        ],
      },
      {
        type: 'tableau',
        id: 'annexe3',
        titre: 'Annexe 3 — Le contrat de concession',
        lignes: [
          { id: 'p1', libelle: '', prefixe: 'Ses particularités' },
          { id: 'p2', libelle: '', prefixe: 'Ses particularités' },
          { id: 'p3', libelle: '', prefixe: 'Ses particularités' },
        ],
      },
      {
        type: 'planning',
        id: 'annexe4',
        titre: 'Le planning stagiaire — du 04/02/202N au 29/04/202N',
        mois: [
          {
            titre: 'FÉVRIER 202N', decalage: 3, nbJours: 29,
            creneaux: [
              { jour: 5, creneau: 'matin', texte: 'Avec le directeur' },
              { jour: 5, creneau: 'aprem', texte: 'Avec le directeur' },
              { jour: 6, creneau: 'matin', texte: 'Service juridique' },
              { jour: 6, creneau: 'aprem', texte: 'Service juridique' },
              { jour: 7, creneau: 'matin', texte: 'Avec le directeur' },
              { jour: 7, creneau: 'aprem', texte: 'Avec chef des ventes' },
              { jour: 8, creneau: 'matin', texte: 'Avec son tuteur' },
              { jour: 8, creneau: 'aprem', texte: 'Avec son tuteur' },
              { jour: 9, creneau: 'matin', texte: 'Avec son tuteur' },
              { jour: 9, creneau: 'aprem', texte: 'Avec son tuteur' },
              { jour: 12, creneau: 'matin', texte: 'Avec chef des ventes' },
              { jour: 12, creneau: 'aprem', texte: 'Avec Marjorie' },
              { jour: 13, creneau: 'matin', texte: 'Avec Michel' },
              { jour: 13, creneau: 'aprem', texte: 'Avec Michel' },
              { jour: 14, creneau: 'matin', texte: 'Avec Michel' },
              { jour: 14, creneau: 'aprem', texte: 'Avec Michel' },
              { jour: 15, creneau: 'matin', texte: 'Avec son tuteur' },
              { jour: 15, creneau: 'aprem', texte: 'Avec son tuteur' },
              { jour: 16, creneau: 'matin', texte: 'Avec son tuteur' },
              { jour: 16, creneau: 'aprem', texte: 'Avec son tuteur' },
              { jour: 19, creneau: 'matin', texte: 'Service commercial' },
              { jour: 19, creneau: 'aprem', texte: 'Service commercial' },
              { jour: 20, creneau: 'matin', texte: 'Service commercial' },
              { jour: 20, creneau: 'aprem', texte: 'Service commercial' },
              { jour: 21, creneau: 'matin', texte: "Avec l'ensemble des commerciaux" },
              { jour: 21, creneau: 'aprem', texte: "Avec l'ensemble des commerciaux" },
              { jour: 22, creneau: 'matin', texte: "Avec l'ensemble des commerciaux" },
              { jour: 22, creneau: 'aprem', texte: "Avec l'ensemble des commerciaux" },
              { jour: 23, creneau: 'matin', texte: 'Avec Marjorie' },
              { jour: 23, creneau: 'aprem', texte: 'Avec Marjorie' },
              { jour: 26, creneau: 'matin', texte: 'Service juridique' },
              { jour: 26, creneau: 'aprem', texte: 'Service juridique' },
              { jour: 27, creneau: 'matin', texte: 'Service juridique' },
              { jour: 27, creneau: 'aprem', texte: 'Service juridique' },
              { jour: 28, creneau: 'matin', texte: 'Avec son tuteur' },
              { jour: 28, creneau: 'aprem', texte: 'Avec son tuteur' },
            ],
          },
        ],
      },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: 'Répondez aux questions de votre tuteur.',
        documents: ['Document 1', 'Annexe 1'],
        bareme: 6,
        reponse:
          "En 2020 : 6 000 concessionnaires exerçant avec les constructeurs. Groupe Parot : 91 millions d'euros cette année contre 84 millions l'an dernier. On constate une baisse du nombre de points de vente de marques automobiles en France. Hausse des ventes en 2021 : 0,54 %. Le marché de l'électrique se porte bien : les voitures électriques captent 13 % de parts de marché. Utilitaires 2022 : 28,6 %, soit 34 055 utilitaires.",
        tableau: {
          colonnes: ['Question', 'Réponse attendue'],
          lignes: [
            ['Concessionnaires en 2020', '6 000 concessionnaires exerçant avec les constructeurs'],
            ['CA groupe Parot 2022 / 2021', 'Cette année 91 millions, et l\u2019an dernier 84 millions'],
            ['Agents/succursales vs grands groupes', 'Il y a une baisse du nombre de points de vente de marques automobiles en France'],
            ['Hausse des ventes 2021', '0,54 %'],
            ['Marché de l\u2019électrique', 'Elles captent 13 % de parts de marché'],
            ['Utilitaires 2022', '28,6 %, soit 34 055 utilitaires'],
          ],
        },
      },
      {
        intitule: "Expliquez avec vos propres mots ce qu'est une concession automobile.",
        documents: ['Document 2', 'Annexe 2'],
        bareme: 2,
        reponse:
          "C'est une entreprise qui vend des véhicules neufs ou d'occasion.",
      },
      {
        intitule: 'Citez les 3 particularités (caractéristiques) du contrat de concession.',
        documents: ['Document 2', 'Annexe 3'],
        bareme: 3,
        reponse:
          "1) « On décide de la durée pendant laquelle je pourrai vendre mes véhicules (10, 15, 20 ans…). » 2) « Chaque concessionnaire est affecté à une zone géographique. » 3) « Je me suis engagé à me fournir chez la marque. »",
        tableau: {
          colonnes: ['Particularité', 'Explication'],
          lignes: [
            ['La durée', 'On décide de la durée pendant laquelle je pourrai vendre mes véhicules (10, 15, 20 ans…)'],
            ['La zone géographique', 'Chaque concessionnaire est affecté à une zone géographique'],
            ['L\u2019engagement d\u2019approvisionnement', 'Je me suis engagé à me fournir chez la marque'],
          ],
        },
      },
    ],
  },
  synthese: {
    titre: 'Le secteur de la concession automobile',
    proposition: [
      'Vend des véhicules neufs ou d\u2019occasion',
      'Une durée (10, 15, 20 ans…)',
      'Une zone géographique',
      'Se fournir chez la marque',
    ],
    racine: {
      id: 'racine',
      texte: 'La concession automobile',
      enfants: [
        {
          id: 'def',
          texte: 'Définition',
          enfants: [
            { id: 'd-1', texte: null, reponse: 'Vend des véhicules neufs ou d\u2019occasion' },
          ],
        },
        {
          id: 'contrat',
          texte: 'Les 3 particularités du contrat',
          enfants: [
            { id: 'c-1', texte: null, reponse: 'Une durée (10, 15, 20 ans…)' },
            { id: 'c-2', texte: null, reponse: 'Une zone géographique' },
            { id: 'c-3', texte: null, reponse: 'Se fournir chez la marque' },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1',
        intitule: 'Analyser le marché des concessions automobiles',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas décrire le marché des concessions.' },
          { niveau: 'debrouille', description: 'Je cite quelques chiffres sans les interpréter.' },
          { niveau: 'averti', description: 'Je repère et j\u2019interprète les principaux chiffres du marché.' },
          { niveau: 'expert', description: 'Je mets les chiffres en perspective (tendances, évolutions).' },
        ],
      },
      {
        id: 'c2',
        intitule: "Définir une concession automobile",
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas ce qu\u2019est une concession automobile.' },
          { niveau: 'debrouille', description: 'J\u2019en donne une définition approximative.' },
          { niveau: 'averti', description: 'Je définis clairement la concession automobile.' },
          { niveau: 'expert', description: 'Je définis la concession et je la situe dans le réseau de la marque.' },
        ],
      },
      {
        id: 'c3',
        intitule: 'Identifier les particularités du contrat de concession',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas les particularités du contrat.' },
          { niveau: 'debrouille', description: 'Je cite une particularité.' },
          { niveau: 'averti', description: 'Je cite les trois particularités du contrat.' },
          { niveau: 'expert', description: 'J\u2019explique chaque particularité avec un exemple.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Concession automobile', definition: "Entreprise qui vend des véhicules neufs ou d'occasion sous contrat avec une marque (le constructeur)." },
      { terme: 'Contrat de concession', definition: "Contrat entre le concessionnaire et la marque : il fixe une durée, une zone géographique et l'engagement de se fournir chez la marque." },
      { terme: 'Agent de marque', definition: "Professionnel qui vend et entretient les véhicules d'une marque, en collaboration avec le concessionnaire, mais avec moins d'engagements." },
      { terme: 'Succursale', definition: "Point de vente détenu directement par le constructeur (et non par un concessionnaire indépendant)." },
      { terme: 'Part de marché', definition: "Pourcentage des ventes d'un type de produit par rapport aux ventes totales du marché." },
      { terme: 'Immatriculation', definition: "Enregistrement officiel d'un véhicule, utilisé pour mesurer les ventes du marché automobile." },
    ],
    flashcards: [
      { recto: "Qu'est-ce qu'une concession automobile ?", verso: "Une entreprise qui vend des véhicules neufs ou d'occasion sous contrat avec une marque." },
      { recto: 'Citez une particularité du contrat de concession.', verso: "Au choix : une durée (10, 15, 20 ans…), une zone géographique, s'engager à se fournir chez la marque." },
      { recto: 'Combien de concessionnaires en France en 2020 ?', verso: 'Plus de 6 000 concessionnaires (et près de 8 000 agents de marque).' },
      { recto: "Quel était le CA des concessionnaires français en 2020 ?", verso: "Environ 122,604 milliards d'euros." },
      { recto: 'Combien de points de vente automobiles en janvier 2021 ?', verso: '13 536 points de vente, soit 168 de moins que l\u2019année précédente.' },
      { recto: 'Combien de véhicules particuliers neufs vendus en 2021 ?', verso: '1,66 million, soit +0,54 % par rapport à 2020.' },
      { recto: "Quelle part de marché pour l'électrique en 2022 ?", verso: '13 %, soit autant que le diesel.' },
      { recto: 'Quelle différence entre un agent de marque et une succursale ?', verso: "L'agent collabore avec le concessionnaire ; la succursale appartient directement au constructeur." },
      { recto: 'Que signifie l\u2019exclusivité territoriale ?', verso: 'La concession distribue la marque sur un secteur géographique délimité.' },
      { recto: 'Auprès de qui le concessionnaire s\u2019engage-t-il à se fournir ?', verso: 'Auprès de la marque, c\u2019est-à-dire le constructeur.' },
    ],
    quiz: [
      { type: 'unique', question: "Qu'est-ce qu'une concession automobile ?", options: ["Une entreprise qui vend des véhicules neufs ou d'occasion", 'Une usine de fabrication de voitures', 'Un simple garage sans lien avec une marque'], bonne: 0 },
      { type: 'unique', question: 'Combien de concessionnaires exerçaient avec les constructeurs en 2020 ?', options: ['6 000', '500', '50 000'], bonne: 0 },
      { type: 'unique', question: "Quel était le CA des concessionnaires en 2020 ?", options: ['Environ 122,604 milliards d\u2019euros', 'Environ 12 milliards d\u2019euros', 'Environ 1 milliard d\u2019euros'], bonne: 0 },
      { type: 'unique', question: 'Combien de véhicules particuliers neufs vendus en 2021 ?', options: ['1,66 million', '660 000', '16,6 millions'], bonne: 0 },
      { type: 'unique', question: "Quelle part de marché pour l'électrique en 2022 ?", options: ['13 %', '50 %', '1 %'], bonne: 0 },
      { type: 'qcm', question: 'Quelles sont les particularités du contrat de concession ?', options: ['Une durée déterminée', 'Une zone géographique', 'Se fournir chez la marque', 'Vente de produits alimentaires'], bonnes: [0, 1, 2] },
      { type: 'qcm', question: 'Que vend la concession Peugeot du scénario ?', options: ['Des véhicules neufs', "Des véhicules d'occasion", 'Des accessoires', 'Des meubles'], bonnes: [0, 1, 2] },
      { type: 'unique', question: 'Une succursale appartient :', options: ['Au constructeur', 'À un concessionnaire indépendant', 'À la mairie'], bonne: 0 },
      { type: 'trous', texte: 'Le concessionnaire s\u2019engage à se fournir chez la {0} sur une {1} géographique définie.', reponses: ['marque', 'zone'] },
      { type: 'trous', texte: 'En 2022, l\u2019{0} a capté 13 % de parts de marché, autant que le {1}.', reponses: ['électrique', 'diesel'] },
    ],
    glisserDeposer: {
      consigne: 'Associez chaque élément à la bonne catégorie.',
      etiquettes: ['Particularité du contrat', 'Chiffre du marché', 'Type de véhicule'],
      zones: [
        { libelle: 'Une zone géographique affectée', etiquetteIndex: 0 },
        { libelle: '1,66 million de véhicules neufs vendus en 2021', etiquetteIndex: 1 },
        { libelle: 'Se fournir chez la marque', etiquetteIndex: 0 },
        { libelle: '13 % de parts de marché pour l\u2019électrique', etiquetteIndex: 1 },
        { libelle: 'Un véhicule utilitaire', etiquetteIndex: 2 },
      ],
    },
  },
}

// ---------------------------------------------------------------------------
// CONTENU : Peugeot, mission 2 - La reglementation sur les concessions
// ---------------------------------------------------------------------------
const PEUGEOT_M2: ContenuMission = {
  travaux: {
    consigne:
      "Comprenez la réglementation en matière de concession automobile : étudiez le document remis par le service juridique, puis répondez aux questions d'Élise.",
    contexte:
      "C'est votre deuxième jour en entreprise, et vous suivez le planning qui vous a été remis le premier jour. Vous passez la journée au service juridique. Élise, l'employée qui s'occupe de vous dans le service, vous donne un document à étudier puis vous interroge pour savoir ce que vous en avez compris.",
    videoContexte: 'https://drive.google.com/file/d/1hL8-gntOZo1VSe2EITMdp43rjT-tWaAe/view',
    documents: [
      { numero: 1, titre: "Les règles à respecter en matière d'achat / vente de véhicules", texte: [
        { pageWeb: true },
        { livreOuvert: { titre: "Les règles à respecter en matière d'achat / vente de véhicules", pages: [
          { titre: 'Règle 1 — L\u2019investissement de départ', paragraphes: ["Pour démarrer une concession, je prévois un investissement de départ compris entre 100 000 € et 500 000 €, voire plus."] },
          { titre: 'Règle 2 — L\u2019inscription', paragraphes: ["Je dois faire une demande d'inscription sur le registre des vendeurs mobiliers auprès de la préfecture."] },
          { titre: 'Règle 3 — L\u2019assurance', paragraphes: ["Je dois souscrire une assurance responsabilité professionnelle spécifique à l'activité de négociation automobile (assurance du parc de véhicules)."] },
          { titre: 'Règle 4 — La trésorerie', paragraphes: ["Je prévois également 2 000 € à 3 000 € de trésorerie pour mes charges fixes et mon local (en cas de besoin)."] },
          { titre: 'Règle 5 — Le diplôme', paragraphes: ["Je n'ai pas à justifier de diplôme ou de certification professionnelle pour exercer cette activité."] },
          { titre: 'Le livre de police', paragraphes: ["J'ai l'obligation d'avoir un livre de police qui permet d'enregistrer les achats et les ventes de la concession."] },
        ] } },
      ] },
    ],
    objectifs: [
      "Rechercher, hiérarchiser et actualiser les informations sur l'entreprise et son marché.",
      "Identifier les règles à respecter pour ouvrir et exercer une activité de concession automobile.",
    ],
    competence: {
      groupe: 'Groupe de compétences 1',
      intitule: 'Conseiller et vendre — Assurer la veille commerciale',
      detail:
        "C.1.1 — Rechercher, hiérarchiser et actualiser les informations sur l'entreprise et son marché.",
    },
    activites: [
      {
        titre: 'Activité — Comprendre la réglementation en matière de concession automobile',
        contexte: "Élise, l'employée qui s'occupe de vous dans le service juridique, vous interroge pour savoir ce que vous avez compris du document.",
        questions: [
          { numero: 1, consigne: "Répondez aux questions d'Élise.", ressources: 'Lire le document, compléter l\'annexe.', annexeId: 'annexe1' },
        ],
      },
    ],
    annexes: [
      {
        type: 'tableau',
        id: 'annexe1',
        titre: 'Annexe — Les réponses aux questions',
        lignes: [
          { id: 'q1', libelle: '1 — Quel montant faut-il pour démarrer une concession ?' },
          { id: 'q2', libelle: "2 — Où doit-on s'inscrire pour ouvrir une concession automobile ?" },
          { id: 'q3', libelle: '3 — Quelle assurance faut-il souscrire quand on fait de la négociation automobile comme dans une concession ?' },
          { id: 'q4', libelle: "4 — À combien estime-t-on la somme à prévoir pour le paiement des premières charges d'une concession ?" },
          { id: 'q5', libelle: '5 — Quel diplôme faut-il pour devenir concessionnaire automobile ?' },
          { id: 'q6', libelle: "6 — Comment s'appelle le document pour enregistrer les achats et les ventes de véhicules dans une concession ?" },
        ],
      },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: "Répondez aux questions d'Élise.",
        documents: ['Document', 'Annexe'],
        bareme: 6,
        reponse:
          "1) « Je prévois un investissement de départ compris entre 100 000 € et 500 000 €, voire plus. » 2) « Je dois faire une demande d'inscription sur le registre des vendeurs mobiliers auprès de la préfecture. » 3) « Je dois souscrire une assurance responsabilité professionnelle spécifique à l'activité de négociation auto (assurance du parc de véhicules). » 4) « Je prévois également 2 000 € à 3 000 € de trésorerie pour mes charges fixes et mon local (en cas de besoin). » 5) « Je n'ai pas à justifier de diplôme ou de certification professionnelle pour exercer cette activité. » 6) « J'ai l'obligation d'avoir un livre de police qui permet d'enregistrer les achats et les ventes de la concession. »",
        tableau: {
          colonnes: ['Question', 'Réponse attendue'],
          lignes: [
            ['1 — Montant pour démarrer', 'Un investissement de départ entre 100 000 € et 500 000 €, voire plus'],
            ['2 — Où s\u2019inscrire', 'Sur le registre des vendeurs mobiliers auprès de la préfecture'],
            ['3 — Assurance', 'Une assurance responsabilité professionnelle spécifique à la négociation auto (assurance du parc de véhicules)'],
            ['4 — Premières charges', 'Entre 2 000 € et 3 000 € de trésorerie pour les charges fixes et le local'],
            ['5 — Diplôme', "Aucun diplôme ni certification professionnelle n'est nécessaire"],
            ['6 — Document d\u2019enregistrement', 'Le livre de police (enregistre les achats et les ventes)'],
          ],
        },
      },
    ],
  },
  synthese: {
    titre: "Quelques règles importantes à respecter en matière d'achat / vente de véhicules",
    proposition: [
      'Investissement de 100 000 à 500 000 € voire plus',
      'Inscription au registre des vendeurs mobiliers (préfecture)',
      'Assurance responsabilité professionnelle',
      'Trésorerie de 2 000 à 3 000 € pour les charges',
      'Livre de police pour enregistrer les achats / ventes',
    ],
    racine: {
      id: 'racine',
      texte: '5 règles importantes',
      enfants: [
        {
          id: 'regles',
          texte: 'Les règles à respecter',
          enfants: [
            { id: 'r-1', texte: null, reponse: 'Investissement de 100 000 à 500 000 € voire plus' },
            { id: 'r-2', texte: null, reponse: 'Inscription au registre des vendeurs mobiliers (préfecture)' },
            { id: 'r-3', texte: null, reponse: 'Assurance responsabilité professionnelle' },
            { id: 'r-4', texte: null, reponse: 'Trésorerie de 2 000 à 3 000 € pour les charges' },
            { id: 'r-5', texte: null, reponse: 'Livre de police pour enregistrer les achats / ventes' },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1',
        intitule: 'Identifier les règles pour ouvrir une concession',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas les règles pour ouvrir une concession.' },
          { niveau: 'debrouille', description: 'Je cite une ou deux règles.' },
          { niveau: 'averti', description: 'Je cite la plupart des règles à respecter.' },
          { niveau: 'expert', description: 'Je cite toutes les règles et je les explique.' },
        ],
      },
      {
        id: 'c2',
        intitule: 'Comprendre la réglementation de la négociation automobile',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne comprends pas la réglementation.' },
          { niveau: 'debrouille', description: 'Je comprends quelques éléments isolés.' },
          { niveau: 'averti', description: 'Je comprends l\u2019essentiel de la réglementation.' },
          { niveau: 'expert', description: 'Je relie chaque règle à son intérêt pour la concession.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Registre des vendeurs mobiliers', definition: "Registre tenu par la préfecture sur lequel doit s'inscrire toute personne qui vend des biens mobiliers, comme des véhicules." },
      { terme: 'Livre de police', definition: "Document obligatoire dans une concession qui permet d'enregistrer tous les achats et toutes les ventes de véhicules." },
      { terme: 'Assurance responsabilité professionnelle', definition: "Assurance qui couvre les dommages liés à l'activité professionnelle ; pour une concession, elle couvre notamment le parc de véhicules." },
      { terme: 'Trésorerie', definition: "Somme d'argent disponible pour payer les charges courantes de l'entreprise (loyer, charges fixes…)." },
      { terme: 'Charges fixes', definition: "Dépenses régulières de l'entreprise qui ne dépendent pas du niveau d'activité (loyer, assurances…)." },
      { terme: 'Investissement de départ', definition: "Somme nécessaire pour lancer l'activité (local, stock de véhicules, aménagement…)." },
    ],
    flashcards: [
      { recto: 'Quel investissement de départ pour une concession ?', verso: 'Entre 100 000 € et 500 000 €, voire plus.' },
      { recto: "Où s'inscrire pour ouvrir une concession ?", verso: 'Sur le registre des vendeurs mobiliers auprès de la préfecture.' },
      { recto: 'Quelle assurance faut-il souscrire ?', verso: 'Une assurance responsabilité professionnelle spécifique à la négociation auto (assurance du parc de véhicules).' },
      { recto: 'Combien de trésorerie prévoir pour les premières charges ?', verso: 'Entre 2 000 € et 3 000 €.' },
      { recto: 'Quel diplôme faut-il pour devenir concessionnaire ?', verso: 'Aucun diplôme ni certification professionnelle n\u2019est exigé.' },
      { recto: 'Comment s\u2019appelle le document qui enregistre les achats et ventes ?', verso: 'Le livre de police.' },
      { recto: 'À quoi sert le livre de police ?', verso: 'À enregistrer tous les achats et toutes les ventes de véhicules de la concession.' },
      { recto: 'Auprès de qui se fait l\u2019inscription au registre des vendeurs mobiliers ?', verso: 'Auprès de la préfecture.' },
      { recto: 'Que couvre l\u2019assurance du concessionnaire ?', verso: "Sa responsabilité professionnelle et le parc de véhicules." },
      { recto: 'Faut-il un diplôme pour être concessionnaire ?', verso: 'Non, aucun diplôme n\u2019est obligatoire.' },
    ],
    quiz: [
      { type: 'unique', question: 'Quel investissement de départ pour une concession ?', options: ['Entre 100 000 € et 500 000 €, voire plus', 'Entre 1 000 € et 5 000 €', 'Rien du tout'], bonne: 0 },
      { type: 'unique', question: "Où s'inscrire pour ouvrir une concession ?", options: ['Registre des vendeurs mobiliers, à la préfecture', 'À la mairie uniquement', 'Aucune inscription nécessaire'], bonne: 0 },
      { type: 'unique', question: 'Quelle assurance faut-il souscrire ?', options: ['Responsabilité professionnelle spécifique à la négociation auto', 'Assurance habitation', 'Aucune assurance'], bonne: 0 },
      { type: 'unique', question: 'Combien de trésorerie pour les premières charges ?', options: ['Entre 2 000 € et 3 000 €', 'Entre 50 € et 100 €', 'Plus de 100 000 €'], bonne: 0 },
      { type: 'unique', question: 'Quel diplôme faut-il pour devenir concessionnaire ?', options: ['Aucun diplôme obligatoire', 'Un doctorat', 'Un CAP obligatoire'], bonne: 0 },
      { type: 'unique', question: "Comment s'appelle le document qui enregistre achats et ventes ?", options: ['Le livre de police', 'Le livre de comptes', 'Le carnet de bord'], bonne: 0 },
      { type: 'qcm', question: 'Quelles règles faut-il respecter pour ouvrir une concession ?', options: ["S'inscrire au registre des vendeurs mobiliers", 'Souscrire une assurance responsabilité professionnelle', 'Tenir un livre de police', 'Avoir un doctorat'], bonnes: [0, 1, 2] },
      { type: 'qcm', question: 'Que permet le livre de police ?', options: ['Enregistrer les achats', 'Enregistrer les ventes', 'Payer les impôts à la place du concessionnaire', 'Assurer les véhicules'], bonnes: [0, 1] },
      { type: 'trous', texte: 'Il faut s\u2019inscrire sur le registre des vendeurs {0} auprès de la {1}.', reponses: ['mobiliers', 'préfecture'] },
      { type: 'trous', texte: 'Le {0} de {1} permet d\u2019enregistrer les achats et les ventes de la concession.', reponses: ['livre', 'police'] },
    ],
    glisserDeposer: {
      consigne: 'Associez chaque élément à la bonne règle.',
      etiquettes: ['Investissement / trésorerie', 'Formalité administrative', 'Document obligatoire'],
      zones: [
        { libelle: 'Entre 100 000 € et 500 000 € pour démarrer', etiquetteIndex: 0 },
        { libelle: 'Inscription au registre des vendeurs mobiliers', etiquetteIndex: 1 },
        { libelle: 'Le livre de police', etiquetteIndex: 2 },
        { libelle: 'Entre 2 000 € et 3 000 € pour les charges', etiquetteIndex: 0 },
        { libelle: "Souscrire une assurance responsabilité professionnelle", etiquetteIndex: 1 },
      ],
    },
  },
}

// ---------------------------------------------------------------------------
// CONTENU : Peugeot, mission 3 - Les 3 metiers de relation client
// ---------------------------------------------------------------------------
const PEUGEOT_M3: ContenuMission = {
  travaux: {
    consigne:
      "Faites le tour des trois principaux métiers de la relation client de la concession : le directeur, le chef des ventes et le commercial automobile. Interrogez chaque employé et complétez les fiches métier.",
    contexte:
      "Pendant cette première semaine de stage, vous faites le tour des différents métiers de la relation client de la concession et vous interrogez les différents employés.",
    documents: [
      { numero: 1, titre: 'Le mot du directeur de concession', texte: [
        { pageWeb: true },
        { bulle: { nom: 'M. Collet', role: 'Directeur de concession', initiale: 'C', videoLien: 'https://drive.google.com/file/d/1MYRDg0X7xBjKocMcob6Bu-poYFdKL_oG/view', lignes: [
          "Je suis responsable de toutes les activités de la concession automobile. J'assure la gérance et l'animation de la concession, ainsi que la réalisation des objectifs.",
          "J'ai un niveau Bac + 2 mais j'ai des collègues qui ont un Bac + 4. Pour occuper ce poste, il me fallait avoir cinq années d'expérience dans la vente automobile et dans le management d'équipe.",
          "C'est moi qui définit la politique commerciale, c'est-à-dire que je gère l'organisation administrative et financière du site ; je manage l'équipe : objectifs, motivation… ; je veille à la rentabilité du site et à l'améliorer ; et enfin je fais des rapports réguliers auprès du PDG.",
          "Les plus importantes sont pour moi : avoir de bonnes connaissances de gestion commerciale et financière et du marketing ; des connaissances approfondies des spécificités de vente du secteur automobile ; un bon esprit d'analyse et de synthèse ; des capacités d'anticipation ; de la diplomatie et un sens relationnel poussé ; un esprit gestionnaire et créatif à la fois ; de la rigueur et être organisé ; et enfin, avoir une bonne maîtrise de l'anglais.",
        ] } },
      ] },
      { numero: 2, titre: 'Le mot du chef des ventes', texte: [
        { pageWeb: true },
        { bulle: { nom: 'Mathieu', role: 'Chef des ventes', initiale: 'M', couleurAvatar: '#0A6C4E', videoLien: 'https://drive.google.com/file/d/1bNAuc_aAfDaYnehXLj0awyfO5yqDeXeS/view', lignes: [
          "Je suis le « trait d'union » entre la force de vente et la direction commerciale. Je suis spécialisé sur un type de produits, c'est-à-dire les véhicules.",
          "J'ai été recruté au niveau Bac + 5, d'une école supérieure de commerce. J'avais déjà une expérience de 3 ans dans l'industrie automobile.",
          "Mon travail est de prospecter l'ensemble du marché potentiel ; mettre à jour les fichiers clients et prospects ; répondre aux appels d'offre ; définir la politique commerciale avec la direction ; coordonner la réalisation de contrats projets ; initier des stratégies de vente avec le service marketing (distribution, promotion, packaging, campagnes de publicité) ; motiver et animer les équipes de commerciaux ; dresser des bilans pour toute opération de stimulation des ventes.",
          "Il faut de solides compétences de gestion commerciale et financière et du marketing ; des connaissances approfondies des spécificités de vente du secteur automobile ; ou encore un bon esprit d'analyse et de synthèse pour bien réussir dans ce métier.",
        ] } },
      ] },
      { numero: 3, titre: 'Le mot du commercial VN-VO', texte: [
        { pageWeb: true },
        { paragraphes: ['Le commercial automobile VN-VO (VN : véhicules neufs et VO : véhicules d\u2019occasion).'] },
        { bulle: { nom: 'Paul', role: 'Commercial VN-VO (votre tuteur)', initiale: 'P', couleurAvatar: '#1565C0', videoLien: 'https://drive.google.com/file/d/1L1-GFEG-K54CsR866VtJh2eapgbUzOBG/view', lignes: [
          "Dans le secteur de la vente automobile, les recrutements sont nombreux, et le métier peut donc être très rémunérateur.",
          "En revanche, les horaires sont irréguliers et les week-ends et jours fériés peuvent être travaillés. L'atteinte des objectifs peut aussi entraîner du stress.",
        ] } },
      ] },
    ],
    objectifs: [
      "Rechercher, hiérarchiser et actualiser les informations sur l'entreprise et son marché.",
      "Identifier les trois principaux métiers de la relation client en concession (missions, formation, compétences).",
    ],
    competence: {
      groupe: 'Groupe de compétences 1',
      intitule: 'Conseiller et vendre — Assurer la veille commerciale',
      detail:
        "C.1.1 — Rechercher, hiérarchiser et actualiser les informations sur l'entreprise et son marché.",
    },
    activites: [
      {
        titre: 'Activité 1 — Le directeur de concession',
        contexte: "Afin de créer la fiche métier du directeur de concession, vous vous rendez dans le bureau de M. Collet pour lui demander de vous expliquer sa fonction.",
        questions: [
          { numero: 1, consigne: 'Présentez le poste de directeur de concession.', ressources: 'Lire le document 1, compléter l\'annexe 1.', annexeId: 'annexe1' },
          { numero: 2, consigne: 'Indiquez sa formation.', ressources: 'Lire le document 1, compléter l\'annexe 1.', annexeId: 'annexe1' },
          { numero: 3, consigne: 'Énumérez ses différentes missions.', ressources: 'Lire le document 1, compléter l\'annexe 1.', annexeId: 'annexe1' },
          { numero: 4, consigne: 'Repérez les compétences nécessaires pour exercer ce métier.', ressources: 'Lire le document 1, compléter l\'annexe 1.', annexeId: 'annexe1' },
        ],
      },
      {
        titre: 'Activité 2 — Le chef des ventes',
        contexte: "Puis, vous vous rendez dans le bureau de Mathieu, le chef des ventes, pour qu'il vous explique à son tour son métier.",
        questions: [
          { numero: 1, consigne: 'Présentez le poste de chef des ventes.', ressources: 'Lire le document 2, compléter l\'annexe 2.', annexeId: 'annexe2' },
          { numero: 2, consigne: 'Indiquez sa formation.', ressources: 'Lire le document 2, compléter l\'annexe 2.', annexeId: 'annexe2' },
          { numero: 3, consigne: 'Énumérez ses différentes missions.', ressources: 'Lire le document 2, compléter l\'annexe 2.', annexeId: 'annexe2' },
          { numero: 4, consigne: 'Repérez les compétences nécessaires pour exercer ce métier.', ressources: 'Lire le document 2, compléter l\'annexe 2.', annexeId: 'annexe2' },
        ],
      },
      {
        titre: 'Activité 3 — Le commercial automobile',
        contexte: "Enfin, vous croisez Paul, votre tuteur, dans le showroom de la concession. Il a très peu de temps à vous consacrer mais vous en profitez tout de même pour lui demander les avantages et les inconvénients du métier de commercial automobile.",
        questions: [
          { numero: 1, consigne: 'Indiquez 2 avantages et 2 inconvénients du poste de commercial en concession automobile VN-VO.', ressources: 'Lire le document 3, compléter l\'annexe 3.', annexeId: 'annexe3' },
        ],
      },
    ],
    annexes: [
      {
        type: 'tableau',
        id: 'annexe1',
        titre: 'Annexe 1 — Fiche métier du directeur de concession',
        lignes: [
          { id: 'poste', libelle: 'Présentation du poste' },
          { id: 'formation', libelle: 'Formation' },
          { id: 'missions', libelle: 'Missions' },
          { id: 'competences', libelle: 'Compétences' },
        ],
      },
      {
        type: 'tableau',
        id: 'annexe2',
        titre: 'Annexe 2 — Fiche métier du chef des ventes',
        lignes: [
          { id: 'poste', libelle: 'Présentation du poste' },
          { id: 'formation', libelle: 'Formation' },
          { id: 'missions', libelle: 'Missions' },
          { id: 'competences', libelle: 'Compétences' },
        ],
      },
      {
        type: 'grille',
        id: 'annexe3',
        titre: 'Annexe 3 — Avantages et inconvénients du métier de commercial automobile',
        colonnes: ['2 avantages', '2 inconvénients'],
        nbLignes: 2,
      },
    ],
  },
  corrige: {
    questions: [
      {
        intitule: 'Fiche métier du directeur de concession (présentation, formation, missions, compétences).',
        documents: ['Document 1', 'Annexe 1'],
        bareme: 4,
        reponse:
          "Présentation : « Je suis responsable de toutes les activités de la concession automobile. J'assure la gérance et l'animation de la concession, ainsi que la réalisation des objectifs. » Formation : niveau Bac + 2 (des collègues ont un Bac + 4), avec cinq années d'expérience dans la vente automobile et le management d'équipe. Missions : définir la politique commerciale, gérer l'organisation administrative et financière du site, manager l'équipe (objectifs, motivation), veiller à la rentabilité du site et l'améliorer, faire des rapports réguliers auprès du PDG. Compétences : gestion commerciale et financière et marketing, connaissances des spécificités de vente du secteur automobile, esprit d'analyse et de synthèse, capacités d'anticipation, diplomatie et sens relationnel, esprit gestionnaire et créatif, rigueur et organisation, bonne maîtrise de l'anglais.",
        tableau: {
          colonnes: ['Rubrique', 'Réponse attendue'],
          lignes: [
            ['Présentation du poste', "Responsable de toutes les activités de la concession ; assure la gérance, l'animation et la réalisation des objectifs"],
            ['Formation', 'Bac + 2 (parfois Bac + 4) et 5 ans d\u2019expérience en vente auto et management'],
            ['Missions', "Définir la politique commerciale, gérer l'administratif et le financier, manager l'équipe, veiller à la rentabilité, faire des rapports au PDG"],
            ['Compétences', "Gestion commerciale/financière et marketing, connaissance du secteur auto, analyse et synthèse, anticipation, diplomatie, rigueur, anglais"],
          ],
        },
      },
      {
        intitule: 'Fiche métier du chef des ventes (présentation, formation, missions, compétences).',
        documents: ['Document 2', 'Annexe 2'],
        bareme: 4,
        reponse:
          "Présentation : « Je suis le trait d'union entre la force de vente et la direction commerciale. Je suis spécialisé sur un type de produits, les véhicules. » Formation : recruté au niveau Bac + 5, école supérieure de commerce, avec déjà 3 ans d'expérience dans l'industrie automobile. Missions : prospecter le marché potentiel, mettre à jour les fichiers clients et prospects, répondre aux appels d'offre, définir la politique commerciale avec la direction, coordonner les contrats projets, initier des stratégies de vente avec le marketing, motiver et animer les commerciaux, dresser des bilans des opérations de stimulation des ventes. Compétences : solides compétences de gestion commerciale et financière et du marketing, connaissances approfondies des spécificités de vente du secteur automobile, bon esprit d'analyse et de synthèse.",
        tableau: {
          colonnes: ['Rubrique', 'Réponse attendue'],
          lignes: [
            ['Présentation du poste', "Trait d'union entre la force de vente et la direction commerciale ; spécialisé sur les véhicules"],
            ['Formation', 'Bac + 5, école de commerce, 3 ans d\u2019expérience dans l\u2019automobile'],
            ['Missions', 'Prospecter, mettre à jour les fichiers, répondre aux appels d\u2019offre, définir la politique commerciale, coordonner les contrats, stratégies avec le marketing, animer les commerciaux, dresser des bilans'],
            ['Compétences', 'Gestion commerciale/financière et marketing, connaissance du secteur auto, esprit d\u2019analyse et de synthèse'],
          ],
        },
      },
      {
        intitule: 'Indiquez 2 avantages et 2 inconvénients du poste de commercial VN-VO.',
        documents: ['Document 3', 'Annexe 3'],
        bareme: 4,
        reponse:
          "2 avantages : dans le secteur de la vente automobile, les recrutements sont nombreux ; le métier peut donc être très rémunérateur. 2 inconvénients : les horaires sont irréguliers et les week-ends et jours fériés peuvent être travaillés ; l'atteinte des objectifs peut entraîner du stress.",
        tableau: {
          colonnes: ['2 avantages', '2 inconvénients'],
          lignes: [
            ['Les recrutements sont nombreux dans la vente automobile', 'Les horaires sont irréguliers (week-ends et jours fériés possibles)'],
            ['Le métier peut être très rémunérateur', "L'atteinte des objectifs peut entraîner du stress"],
          ],
        },
      },
    ],
  },
  synthese: {
    titre: 'Les 3 principaux métiers de relation client dans une concession',
    proposition: [
      'Manager l\u2019équipe',
      'Veiller à la rentabilité',
      'Connaissance de la gestion commerciale',
      'Bon esprit d\u2019analyse',
      'Bac + 5, école de commerce',
      '3 ans d\u2019expérience',
    ],
    racine: {
      id: 'racine',
      texte: 'Les métiers de la concession',
      enfants: [
        {
          id: 'directeur',
          texte: 'Le directeur — missions',
          enfants: [
            { id: 'di-1', texte: null, reponse: 'Manager l\u2019équipe' },
            { id: 'di-2', texte: null, reponse: 'Veiller à la rentabilité' },
          ],
        },
        {
          id: 'dircomp',
          texte: 'Le directeur — compétences',
          enfants: [
            { id: 'dc-1', texte: null, reponse: 'Connaissance de la gestion commerciale' },
            { id: 'dc-2', texte: null, reponse: 'Bon esprit d\u2019analyse' },
          ],
        },
        {
          id: 'chef',
          texte: 'Le chef des ventes — formation',
          enfants: [
            { id: 'ch-1', texte: null, reponse: 'Bac + 5, école de commerce' },
            { id: 'ch-2', texte: null, reponse: '3 ans d\u2019expérience' },
          ],
        },
      ],
    },
  },
  autoEval: {
    competences: [
      {
        id: 'c1',
        intitule: 'Décrire le métier de directeur de concession',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas décrire le métier de directeur.' },
          { niveau: 'debrouille', description: 'Je cite une ou deux missions.' },
          { niveau: 'averti', description: 'Je décris le poste, la formation, les missions et les compétences.' },
          { niveau: 'expert', description: 'Je décris le métier et je le compare aux autres postes.' },
        ],
      },
      {
        id: 'c2',
        intitule: 'Décrire le métier de chef des ventes',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne sais pas décrire le métier de chef des ventes.' },
          { niveau: 'debrouille', description: 'Je cite une ou deux missions.' },
          { niveau: 'averti', description: 'Je décris le poste, la formation, les missions et les compétences.' },
          { niveau: 'expert', description: 'Je situe le chef des ventes entre la force de vente et la direction.' },
        ],
      },
      {
        id: 'c3',
        intitule: 'Identifier avantages et inconvénients du commercial automobile',
        indicateurs: [
          { niveau: 'novice', description: 'Je ne connais pas les avantages ni les inconvénients.' },
          { niveau: 'debrouille', description: 'Je cite un avantage ou un inconvénient.' },
          { niveau: 'averti', description: 'Je cite 2 avantages et 2 inconvénients.' },
          { niveau: 'expert', description: 'Je nuance selon le profil et les conditions de travail.' },
        ],
      },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Directeur de concession', definition: "Responsable de toutes les activités de la concession : gérance, animation et réalisation des objectifs." },
      { terme: 'Chef des ventes', definition: "Trait d'union entre la force de vente et la direction commerciale, spécialisé sur un type de produits (les véhicules)." },
      { terme: 'Commercial VN-VO', definition: "Commercial qui vend des véhicules neufs (VN) et des véhicules d'occasion (VO)." },
      { terme: 'Politique commerciale', definition: "Ensemble des décisions qui orientent l'activité de vente d'une entreprise (objectifs, prix, promotions…)." },
      { terme: 'Prospection', definition: "Action de rechercher de nouveaux clients (prospects) pour développer les ventes." },
      { terme: 'Force de vente', definition: "Ensemble des commerciaux d'une entreprise chargés de vendre ses produits." },
    ],
    flashcards: [
      { recto: 'Que fait le directeur de concession ?', verso: 'Il est responsable de toutes les activités : gérance, animation et réalisation des objectifs.' },
      { recto: 'Quelle formation pour le directeur de concession ?', verso: 'Bac + 2 (parfois Bac + 4) et 5 ans d\u2019expérience en vente auto et management.' },
      { recto: 'Citez 2 missions du directeur.', verso: 'Définir la politique commerciale, manager l\u2019équipe, veiller à la rentabilité, faire des rapports au PDG (2 au choix).' },
      { recto: 'Qui est le chef des ventes ?', verso: 'Le trait d\u2019union entre la force de vente et la direction commerciale, spécialisé sur les véhicules.' },
      { recto: 'Quelle formation pour le chef des ventes ?', verso: 'Bac + 5, école de commerce, avec 3 ans d\u2019expérience dans l\u2019automobile.' },
      { recto: 'Citez 2 missions du chef des ventes.', verso: 'Prospecter, mettre à jour les fichiers clients, définir la politique commerciale, animer les commerciaux (2 au choix).' },
      { recto: 'Que veut dire VN-VO ?', verso: 'VN : véhicules neufs ; VO : véhicules d\u2019occasion.' },
      { recto: 'Citez 2 avantages du commercial automobile.', verso: 'Recrutements nombreux ; métier qui peut être très rémunérateur.' },
      { recto: 'Citez 2 inconvénients du commercial automobile.', verso: 'Horaires irréguliers (week-ends, jours fériés) ; stress lié aux objectifs.' },
      { recto: 'Citez 2 compétences du directeur.', verso: 'Gestion commerciale/financière et marketing ; esprit d\u2019analyse et de synthèse (2 au choix).' },
    ],
    quiz: [
      { type: 'unique', question: 'Quelle formation pour le directeur de concession ?', options: ['Bac + 2 (parfois Bac + 4) et 5 ans d\u2019expérience', 'Aucun diplôme', 'CAP obligatoire'], bonne: 0 },
      { type: 'unique', question: 'Quelle formation pour le chef des ventes ?', options: ['Bac + 5, école de commerce, 3 ans d\u2019expérience', 'Bac uniquement', 'Aucune expérience'], bonne: 0 },
      { type: 'unique', question: 'Que veut dire VN-VO ?', options: ['Véhicules neufs et véhicules d\u2019occasion', 'Ventes nationales et ventes ouvertes', 'Véhicules noirs et blancs'], bonne: 0 },
      { type: 'unique', question: 'Le chef des ventes est le trait d\u2019union entre :', options: ['La force de vente et la direction commerciale', 'Les clients et la banque', 'Les fournisseurs et la préfecture'], bonne: 0 },
      { type: 'unique', question: 'Un avantage du métier de commercial automobile :', options: ['Les recrutements sont nombreux', 'Les horaires sont fixes', 'Aucun objectif'], bonne: 0 },
      { type: 'unique', question: 'Un inconvénient du métier de commercial automobile :', options: ['Horaires irréguliers (week-ends, jours fériés)', 'Salaire toujours faible', 'Aucun contact client'], bonne: 0 },
      { type: 'qcm', question: 'Quelles sont des missions du directeur de concession ?', options: ['Définir la politique commerciale', "Manager l'équipe", 'Veiller à la rentabilité', 'Réparer les moteurs'], bonnes: [0, 1, 2] },
      { type: 'qcm', question: 'Quelles sont des missions du chef des ventes ?', options: ['Prospecter le marché', 'Mettre à jour les fichiers clients', 'Animer les commerciaux', 'Fixer les impôts'], bonnes: [0, 1, 2] },
      { type: 'trous', texte: 'Le chef des ventes est le trait d\u2019union entre la force de {0} et la {1} commerciale.', reponses: ['vente', 'direction'] },
      { type: 'trous', texte: 'VN signifie véhicules {0} et VO véhicules d\u2019{1}.', reponses: ['neufs', 'occasion'] },
    ],
    glisserDeposer: {
      consigne: 'Associez chaque élément au bon métier.',
      etiquettes: ['Directeur de concession', 'Chef des ventes', 'Commercial VN-VO'],
      zones: [
        { libelle: 'Responsable de toutes les activités de la concession', etiquetteIndex: 0 },
        { libelle: 'Trait d\u2019union entre la force de vente et la direction', etiquetteIndex: 1 },
        { libelle: 'Vend des véhicules neufs et d\u2019occasion', etiquetteIndex: 2 },
        { libelle: 'Bac + 5, école de commerce', etiquetteIndex: 1 },
        { libelle: 'Veille à la rentabilité du site', etiquetteIndex: 0 },
      ],
    },
  },
}

// ---------------------------------------------------------------------------
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
  'orpi-m3': ORPI_M3,
  'orpi-m4': ORPI_M4,
  'free-m1': FREE_M1,
  'free-m2': FREE_M2,
  'free-m3': FREE_M3,
  'free-m4': FREE_M4,
  'free-m5': FREE_M5,
  'leroy-merlin-m1': LEROY_MERLIN_M1,
  'leroy-merlin-m2': LEROY_MERLIN_M2,
  'leroy-merlin-m3': LEROY_MERLIN_M3,
  'leroy-merlin-m4': LEROY_MERLIN_M4,
  'leroy-merlin-m5': LEROY_MERLIN_M5,
  'peugeot-m1': PEUGEOT_M1,
  'peugeot-m2': PEUGEOT_M2,
  'peugeot-m3': PEUGEOT_M3,
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
