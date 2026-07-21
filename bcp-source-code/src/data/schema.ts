// schema.ts
// Reference centrale du projet : types TypeScript, definition des onglets,
// liste des scenarios et de leurs missions.
// Convention : aucun emoji, tiret simple uniquement, libelles sobres.

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

// Identifiant des onglets d'une mission cote eleve.
export type OngletId =
  | 'travaux'
  | 'synthese'
  | 'autoeval'
  | 'activites'
  | 'journal'

// Roles utilisateur.
export type Role = 'etudiant' | 'enseignant'

// Statut d'inscription d'un eleve.
export type Statut = 'en_attente' | 'accepte' | 'refuse'

// Niveaux de maitrise utilises dans les grilles d'auto-evaluation
// et le suivi de competences.
export type NiveauCompetence = 'novice' | 'debrouille' | 'averti' | 'expert'

// Definition d'un onglet de mission.
export interface Onglet {
  id: OngletId
  libelle: string
  // Un onglet verrouillable peut etre ferme par le professeur.
  // Le journal de bord n'est jamais verrouillable.
  verrouillable: boolean
  // Ordre d'affichage dans la barre d'onglets.
  ordre: number
}

// Definition d'une mission au sein d'un scenario.
export interface Mission {
  id: string // identifiant stable, ex : 'renault-m1'
  numero: number // numero affiche, ex : 1
  titre: string
}

// Definition d'un scenario (entreprise).
export interface Scenario {
  id: string // identifiant stable, ex : 'renault'
  nom: string // nom affiche, ex : 'Renault'
  // Couleur principale du scenario (utilisee pour les pastilles, barres,
  // en-tetes de mission cote eleve).
  couleur: string
  missions: Mission[]
}

// ---------------------------------------------------------------------------
// ONGLETS DE MISSION
// ---------------------------------------------------------------------------

// Le journal de bord est toujours accessible : verrouillable = false.
// Les evaluations ne sont pas un onglet de mission ; elles sont gerees
// globalement par le professeur (ouverture/fermeture cote Deverrouillage).
export const ONGLETS: Onglet[] = [
  { id: 'travaux', libelle: 'Travaux à rendre', verrouillable: true, ordre: 1 },
  { id: 'synthese', libelle: 'Synthèse', verrouillable: true, ordre: 2 },
  { id: 'autoeval', libelle: 'Auto-évaluation', verrouillable: true, ordre: 3 },
  { id: 'activites', libelle: 'Activités', verrouillable: true, ordre: 4 },
  { id: 'journal', libelle: 'Journal de bord', verrouillable: false, ordre: 5 },
]

// Acces direct par identifiant.
export const ONGLETS_PAR_ID: Record<OngletId, Onglet> = ONGLETS.reduce(
  (acc, o) => {
    acc[o.id] = o
    return acc
  },
  {} as Record<OngletId, Onglet>
)

// ---------------------------------------------------------------------------
// SCENARIOS ET MISSIONS
// ---------------------------------------------------------------------------

// Fonction utilitaire pour construire les missions d'un scenario a partir
// d'une simple liste de titres, en numerotant et en prefixant les identifiants.
function construireMissions(scenarioId: string, titres: string[]): Mission[] {
  return titres.map((titre, index) => ({
    id: `${scenarioId}-m${index + 1}`,
    numero: index + 1,
    titre,
  }))
}

// --- Renault : scenario modele de reference, entierement renseigne ---------
const RENAULT: Scenario = {
  id: 'renault',
  nom: 'Renault',
  couleur: '#FFCC00',
  missions: construireMissions('renault', [
    "La presentation de l'unite",
    'La zone de chalandise',
    'La prise de contact',
    'La decouverte des besoins',
    'Le conseil et la proposition de produit',
    'Le traitement des objections liees au produit et au prix',
    'La conclusion de la vente et le financement du credit',
    'La vente additionnelle',
  ]),
}

// --- Peugeot ----------------------------------------------------------------
const PEUGEOT: Scenario = {
  id: 'peugeot',
  nom: 'Peugeot',
  couleur: '#00513B',
  missions: construireMissions('peugeot', [
    "Le secteur de l'automobile",
    'La reglementation sur les concessions automobiles',
    'Les 3 principaux metiers de relation client dans une concession automobile',
    'Le commercial en concession auto',
    "L'analyse du CV du commercial automobile",
    'La remuneration du commercial',
    'Les caracteristiques techniques des vehicules',
    'Le demarchage',
    "Les mobiles d'achat lors de l'achat d'un vehicule",
    "L'essai du vehicule d'occasion",
    'Les obligations du commercial avant la vente',
    'Les obligations du commercial au moment de la vente',
    "L'animation et la fidelisation des clients",
  ]),
}

// --- Orpi -------------------------------------------------------------------
const ORPI: Scenario = {
  id: 'orpi',
  nom: 'Orpi',
  couleur: '#E2001A',
  missions: construireMissions('orpi', [
    "La phase preparatoire a la mise en oeuvre d'une action de FDRC",
    "L'oral de la phase preparatoire a la mise en oeuvre de l'action de FDRC",
    "La presentation de la mise en oeuvre de l'action de FDRC retenue",
    "L'oral de presentation de la mise en oeuvre de l'action de FDRC retenue",
  ]),
}

// --- Mamie And Co -----------------------------------------------------------
const MAMIE_AND_CO: Scenario = {
  id: 'mamie-and-co',
  nom: 'Mamie And Co',
  couleur: '#C71585',
  missions: construireMissions('mamie-and-co', [
    "La presentation de l'unite commerciale et de la clientele",
    "Les caracteristiques du produit et les mobiles d'achat",
    'La preparation des outils pour la vente',
    'La prise de contact',
    "La presentation du produit et l'argumentation",
    'La commande, les modalites de reglement et de livraison',
    'Le traitement des reclamations client',
    'Les differents types de relance client',
  ]),
}

// --- Leroy Merlin -----------------------------------------------------------
const LEROY_MERLIN: Scenario = {
  id: 'leroy-merlin',
  nom: 'Leroy Merlin',
  couleur: '#7AB51D',
  missions: construireMissions('leroy-merlin', [
    "La presentation de l'unite commerciale et de son marche",
    'La recherche des besoins et la proposition de produit',
    "S'assurer de la disponibilite du produit et faire de la vente",
    "L'accord du client, les modalites de livraison et la prise de conge",
    "Selectionner le prestataire le plus adapte, suivre l'execution du service et rendre compte",
  ]),
}

// --- Hydrao -----------------------------------------------------------------
const HYDRAO: Scenario = {
  id: 'hydrao',
  nom: 'Hydrao',
  couleur: '#0090D4',
  missions: construireMissions('hydrao', [
    "La presentation de l'unite commerciale et de la clientele",
    'La participation a une operation de prospection',
    "Les caracteristiques du produit et l'argumentation",
    "La garantie legale de conformite et l'extension de garantie",
    'La reponse aux objections sur le produit et sur le prix',
    'Le traitement des reclamations et le service apres-vente',
    'Collecter les informations, mesurer et analyser la satisfaction client',
  ]),
}

// --- Free -------------------------------------------------------------------
const FREE: Scenario = {
  id: 'free',
  nom: 'Free',
  couleur: '#CD1F2D',
  missions: construireMissions('free', [
    "La presentation de l'unite commerciale et de la clientele",
    "Le traitement de la reclamation en reception d'appel",
    "Les caracteristiques du produit et l'argumentation",
    "Le traitement de la reclamation en reception d'appel et la vente au rebond",
    'La satisfaction et la fidelisation du client',
  ]),
}

// --- Citroen ----------------------------------------------------------------
const CITROEN: Scenario = {
  id: 'citroen',
  nom: 'Citroen',
  couleur: '#DA291C',
  missions: construireMissions('citroen', [
    "La presentation de l'entreprise Citroen",
    "Le processus d'achat chez Citroen",
    'Le suivi de la commande et les informations sur les conditions de livraison',
  ]),
}

// --- AMParis ----------------------------------------------------------------
const AMPARIS: Scenario = {
  id: 'amparis',
  nom: 'AMParis',
  couleur: '#1B6B3A',
  missions: construireMissions('amparis', [
    "La presentation de l'unite commerciale et de la clientele",
    "Les recherches et l'exploitation d'information",
    "La preparation de l'operation de prospection",
    "La realisation de l'operation de prospection et ses resultats",
  ]),
}

// --- Chausson Materiaux -----------------------------------------------------
// --- Kiloutou ---------------------------------------------------------------
const KILOUTOU: Scenario = {
  id: 'kiloutou',
  nom: 'Kiloutou',
  couleur: '#E2001A',
  missions: construireMissions('kiloutou', [
    'Comprendre le contrat de location',
    "Preparer la livraison et etablir l'etat des lieux",
    'Suivre les contrats de location en cours',
    'Facturer la prolongation',
    'Controler la restitution et les degradations',
    'Chiffrer la remise en etat et la franchise',
    'Traiter la contestation et relancer',
    'Analyser la rentabilite du client',
  ]),
}

const CHAUSSON: Scenario = {
  id: 'chausson',
  nom: 'Chausson Materiaux',
  couleur: '#0B3C7A',
  missions: construireMissions('chausson', [
    'Prendre en main le suivi des commandes',
    'Verifier et enregistrer la commande',
    "Suivre l'acheminement",
    'Controler la livraison et constater les reserves',
    "Etablir l'avoir",
    'Repondre a la reclamation du client',
    'Relancer le reglement',
    "Rendre compte de l'affaire",
  ]),
}

// Liste ordonnee des 10 scenarios.
export const SCENARIOS: Scenario[] = [
  KILOUTOU,
  CHAUSSON,
  RENAULT,
  PEUGEOT,
  ORPI,
  MAMIE_AND_CO,
  LEROY_MERLIN,
  HYDRAO,
  FREE,
  CITROEN,
  AMPARIS,
]

// ---------------------------------------------------------------------------
// ACCES UTILITAIRES
// ---------------------------------------------------------------------------

export function getScenario(scenarioId: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === scenarioId)
}

export function getMission(
  scenarioId: string,
  missionId: string
): Mission | undefined {
  return getScenario(scenarioId)?.missions.find((m) => m.id === missionId)
}

// Liste a plat de toutes les missions, utile pour les exports et le suivi.
export const TOUTES_MISSIONS: { scenario: Scenario; mission: Mission }[] =
  SCENARIOS.flatMap((scenario) =>
    scenario.missions.map((mission) => ({ scenario, mission }))
  )

// Couleur principale du professeur (convention du projet).
export const COULEUR_PROF = '#1B6B3A'

// ---------------------------------------------------------------------------
// LISIBILITE DES COULEURS
// ---------------------------------------------------------------------------

// Luminance relative percue d'une couleur hex (0 = sombre, 1 = clair).
function luminance(hex: string): number {
  const v = hex.replace('#', '')
  const r = parseInt(v.substring(0, 2), 16) / 255
  const g = parseInt(v.substring(2, 4), 16) / 255
  const b = parseInt(v.substring(4, 6), 16) / 255
  // Ponderation perceptuelle standard.
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Assombrit une couleur hex d'un facteur (0 = inchange, 1 = noir).
function assombrir(hex: string, facteur: number): string {
  const v = hex.replace('#', '')
  const r = parseInt(v.substring(0, 2), 16)
  const g = parseInt(v.substring(2, 4), 16)
  const b = parseInt(v.substring(4, 6), 16)
  const m = (c: number) => Math.round(c * (1 - facteur))
  const hx = (c: number) => m(c).toString(16).padStart(2, '0')
  return `#${hx(r)}${hx(g)}${hx(b)}`
}

// Couleur de fond d'en-tete lisible pour un scenario : si la couleur de marque
// est trop claire (jaune Renault par exemple), on l'assombrit afin que le texte
// blanc reste lisible. La couleur de marque d'origine reste utilisee pour les
// pastilles et barres sur fond clair.
export function couleurEntete(couleur: string): string {
  return luminance(couleur) > 0.6 ? assombrir(couleur, 0.35) : couleur
}

// Couleur de texte lisible (fonce ou blanc) a poser sur un fond donne.
export function couleurTexteSur(couleur: string): string {
  return luminance(couleur) > 0.6 ? '#1F2933' : '#FFFFFF'
}

// Eclaircit une couleur en la melangeant avec du blanc. facteur entre 0 et 1
// (0 = couleur d'origine, 1 = blanc). Utile pour les teintes derivees douces.
export function eclaircir(hex: string, facteur: number): string {
  const v = hex.replace('#', '')
  const r = parseInt(v.substring(0, 2), 16)
  const g = parseInt(v.substring(2, 4), 16)
  const b = parseInt(v.substring(4, 6), 16)
  const m = (c: number) => Math.round(c + (255 - c) * facteur)
  const hx = (c: number) => m(c).toString(16).padStart(2, '0')
  return `#${hx(r)}${hx(g)}${hx(b)}`
}
