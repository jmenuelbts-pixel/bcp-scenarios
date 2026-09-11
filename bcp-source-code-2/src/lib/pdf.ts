// pdf.ts
// Generation de PDF sans librairie externe : on construit une page HTML sobre
// et on declenche l'impression du navigateur. L'utilisateur choisit ensuite
// "Enregistrer en PDF". Conforme au workflow d'impression via Safari.
//
// Regles de couleur :
//   - noir  : consignes, libelles, titres (contenu non produit par l'eleve)
//   - bleu  : tout ce que l'eleve a ecrit
//   - rouge : la correction du professeur, et les mentions "Non renseigne"
// La correction n'apparait que dans les exports cote enseignant.
//
// Pied de page : repete sur CHAQUE page imprimee (nom et prenom de l'eleve,
// scenario et mission si l'export porte sur une seule mission, pagination).

import { COULEUR_PROF } from '../data/schema'

// Couleurs de rendu.

// Nom de l'enseignant, appose en pied de chaque export PDF.
export const NOM_ENSEIGNANT = 'Jacky MENUEL'

export const ENCRE_ELEVE = '#1D4ED8' // bleu : reponses de l'eleve
export const ENCRE_PROF = '#B91C1C' // rouge : correction du professeur
export const ENCRE_NEUTRE = '#1F2933' // noir : consignes et libelles

// Echappe le texte insere dans le HTML pour eviter toute injection.
export function echapper(texte: string): string {
  return texte
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Echappe une chaine destinee a une declaration CSS content : les guillemets
// et les antislashs y sont significatifs et casseraient la regle @page.
function echapperCss(texte: string): string {
  return texte.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

// Nature d'une ligne : elle decide de la couleur du texte.
//   'eleve'   -> bleu   (reponse de l'eleve)
//   'prof'    -> rouge  (correction du professeur)
//   'neutre'  -> noir   (consigne, intitule de mission, information)
export type NatureLigne = 'eleve' | 'prof' | 'neutre'

export interface LignePdf {
  label: string
  valeur: string | null | undefined
  nature?: NatureLigne // defaut : 'eleve'
}

export interface SectionPdf {
  titre: string
  lignes?: LignePdf[]
  paragraphes?: string[]
  // HTML deja mis en forme (documents riches, questions), insere tel quel.
  htmlLibre?: string
  // Force un saut de page avant cette section (export classe : un eleve par page).
  sautAvant?: boolean
}

export interface DocumentPdf {
  titre: string
  sousTitre?: string
  sections: SectionPdf[]
  // Pied de page repete sur chaque page.
  piedNom?: string // "NOM Prenom" de l'eleve
  piedContexte?: string // "Enchanted Tools - Mission 8 : ..." si export d'une seule mission
  // Cote eleve : masque la date/heure d'export (true). Cote prof : affichee.
  sansDate?: boolean
}

// Construit un bloc label + valeur, colore selon la nature de la ligne.
function bloc(ligne: LignePdf): string {
  const nature = ligne.nature ?? 'eleve'
  // Un label seul (valeur volontairement vide et nature neutre) sert de
  // sous-titre de mission : on n'affiche pas "Non renseigne" dans ce cas.
  if (nature === 'neutre' && ligne.valeur === '') {
    return `<div class="bloc"><div class="soustitre-mission">${echapper(ligne.label)}</div></div>`
  }
  const vide = !ligne.valeur || ligne.valeur.trim().length === 0
  // Une valeur vide devient "Non renseigne" en rouge, quelle que soit la nature.
  const classe = vide ? 'prof' : nature
  const valeur = vide ? 'Non renseigné' : echapper(ligne.valeur as string)
  return `<div class="bloc"><div class="label">${echapper(ligne.label)}</div><div class="valeur ${classe}">${valeur}</div></div>`
}

// Ouvre une fenetre d'impression avec le document fourni.
export function imprimerPdf(doc: DocumentPdf): void {
  const sectionsHtml = doc.sections
    .map((s) => {
      const lignesHtml = (s.lignes ?? []).map(bloc).join('')
      const parasHtml = (s.paragraphes ?? [])
        .map((p) => `<p class="para">${echapper(p)}</p>`)
        .join('')
      const libre = s.htmlLibre ?? ''
      const classe = (s.sautAvant ? 'saut ' : '') + (libre ? 'riche' : '')
      return `<section class="${classe.trim()}"><h2>${echapper(s.titre)}</h2>${lignesHtml}${parasHtml}${libre}</section>`
    })
    .join('')

  // Le pied de page repete utilise position: fixed, rejoue par le navigateur
  // sur chaque page a l'impression. La pagination s'appuie sur un compteur CSS.
  const piedGauche = doc.piedNom ? echapper(doc.piedNom) : ''
  const piedCentre = doc.piedContexte ? echapper(doc.piedContexte) : ''
  // Les memes valeurs reinjectees dans une declaration CSS content : il faut
  // echapper les guillemets et les antislashs, sinon la regle @page casse.
  const cssPiedGauche = echapperCss(doc.piedNom ?? '')
  const cssPiedCentre = echapperCss(doc.piedContexte ?? '')

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>${echapper(doc.titre)}</title>
<style>
  * { font-family: Arial, sans-serif; box-sizing: border-box; }
  body { margin: 0; padding: 32px 36px 46px; color: ${ENCRE_NEUTRE}; }
  header { border-bottom: 3px solid ${COULEUR_PROF}; padding-bottom: 14px; margin-bottom: 22px; }
  h1 { font-size: 20px; color: ${COULEUR_PROF}; margin: 0; }
  .soustitre { font-size: 13px; color: #4B5563; margin-top: 4px; }
  .legende { font-size: 11px; color: #6B7280; margin-top: 8px; }
  .legende .pastille { font-weight: 700; }
  .legende .eleve { color: ${ENCRE_ELEVE}; }
  .legende .prof { color: ${ENCRE_PROF}; }
  section { margin-bottom: 22px; page-break-inside: avoid; }
  section.riche { page-break-inside: auto; }
  section.saut { page-break-before: always; }
  .doc { border: 1px solid #C9D6E3; border-radius: 6px; padding: 12px 14px; margin: 0 0 16px; page-break-inside: avoid; }
  .doc-titre { font-size: 13px; font-weight: 800; color: ${COULEUR_PROF}; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.3px; }
  .doc-intertitre { font-size: 12.5px; font-weight: 700; color: #1F2933; margin: 10px 0 4px; }
  .doc p { font-size: 12px; line-height: 1.5; margin: 0 0 6px; }
  .doc ul { margin: 4px 0 8px; padding-left: 18px; }
  .doc li { font-size: 12px; line-height: 1.45; }
  .doc img { max-width: 100%; margin: 8px 0; border: 1px solid #E2E8F0; border-radius: 4px; }
  .doc table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 11.5px; }
  .doc th { background: ${COULEUR_PROF}; color: #FFFFFF; border: 1px solid ${COULEUR_PROF}; padding: 5px 7px; text-align: left; }
  .doc td { border: 1px solid #CDD6DF; padding: 5px 7px; }
  .contexte-pro { background: #F1F6FB; border-left: 3px solid ${COULEUR_PROF}; padding: 10px 12px; font-size: 12px; line-height: 1.5; font-style: italic; color: #33404d; margin: 0 0 16px; }
  .q { margin: 0 0 14px; page-break-inside: avoid; }
  .q-contexte { background: #FBF6E9; border-left: 3px solid #E0B84B; padding: 8px 10px; font-size: 11.5px; font-style: italic; color: #4a3f22; margin: 0 0 6px; }
  .q-consigne { font-size: 12.5px; line-height: 1.5; margin: 0 0 3px; }
  .q-consigne b { color: ${COULEUR_PROF}; }
  .q-ressource { font-size: 10.5px; color: #6B7280; margin: 0 0 6px; }
  .q-reponse-label { font-size: 10px; font-weight: 700; color: #6B7280; letter-spacing: 0.4px; margin: 4px 0 3px; }
  .q-vide { border: 1px solid #B9C4CF; border-radius: 4px; height: 66px; background: repeating-linear-gradient(transparent, transparent 21px, #E6EBF0 21px, #E6EBF0 22px); }
  .q-reponse { font-size: 12.5px; line-height: 1.5; color: ${ENCRE_ELEVE}; white-space: pre-wrap; border-left: 2px solid ${ENCRE_ELEVE}; padding-left: 8px; }
  .q-vide-court { border: 1px solid #B9C4CF; border-radius: 4px; height: 30px; }
  h2 { font-size: 15px; color: ${COULEUR_PROF}; border-bottom: 1px solid #D8E2EC; padding-bottom: 5px; margin: 0 0 12px; }
  .bloc { margin-bottom: 10px; }
  .label { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 2px; }
  .soustitre-mission { font-size: 13px; font-weight: 700; color: ${ENCRE_NEUTRE}; margin-top: 14px; border-left: 3px solid ${COULEUR_PROF}; padding-left: 8px; }
  .valeur { font-size: 13px; white-space: pre-wrap; line-height: 1.5; }
  .valeur.eleve { color: ${ENCRE_ELEVE}; }
  .valeur.prof { color: ${ENCRE_PROF}; }
  .valeur.neutre { color: ${ENCRE_NEUTRE}; }
  .para { font-size: 13px; line-height: 1.5; margin: 0 0 8px; white-space: pre-wrap; }

  /* Pied de page repete sur chaque page imprimee. */
  .pied {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    font-size: 10px;
    color: #4B5563;
    border-top: 1px solid #CBD5E1;
    padding-top: 4px;
    background: #FFFFFF;
  }
  .pied .nom { font-weight: 700; color: ${ENCRE_NEUTRE}; white-space: nowrap; }
  .pied .contexte { flex: 1; text-align: center; }
  .pied .num { white-space: nowrap; }

  @media print {
    body { padding: 0; }
    /* Pagination native : seule methode fiable pour numeroter chaque page.
       Le nom de l'eleve et le contexte sont repetes dans les marges basses. */
    @page {
      margin: 16mm 16mm 22mm;
      @bottom-left {
        content: "${cssPiedGauche}";
        font-family: Arial, sans-serif;
        font-size: 9pt;
        font-weight: bold;
        color: ${ENCRE_NEUTRE};
      }
      @bottom-center {
        content: "${cssPiedCentre}";
        font-family: Arial, sans-serif;
        font-size: 8pt;
        color: #4B5563;
      }
      @bottom-right {
        content: "page " counter(page) " sur " counter(pages);
        font-family: Arial, sans-serif;
        font-size: 9pt;
        color: #4B5563;
      }
    }
    /* Le pied HTML sert de repli pour les navigateurs qui ignorent @bottom-*.
       Chrome et Safari appliquent @page : on le masque pour eviter le doublon. */
    .pied { display: none; }
  }
</style>
</head>
<body>
  <header>
    <h1>${echapper(doc.titre)}</h1>
    ${doc.sousTitre ? `<div class="soustitre">${echapper(doc.sousTitre)}</div>` : ''}
    ${doc.sansDate ? '' : `<div class="soustitre">Exporté le ${echapper(new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }))}</div>`}
    <div class="legende">
      Légende : <span class="pastille">noir</span> = consignes et intitulés,
      <span class="pastille eleve">bleu</span> = réponses de l'élève,
      <span class="pastille prof">rouge</span> = correction du professeur et mentions non renseignées.
    </div>
  </header>
  ${sectionsHtml}
  <div class="pied">
    <span class="nom">${piedGauche || echapper(NOM_ENSEIGNANT)}</span>
    <span class="contexte">${piedCentre}</span>
    <span class="num">${echapper(NOM_ENSEIGNANT)}</span>
  </div>
  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`

  const fenetre = window.open('', '_blank')
  if (!fenetre) {
    alert("L'ouverture de la fenêtre d'impression a été bloquée. Autorisez les fenêtres surgissantes pour ce site.")
    return
  }
  fenetre.document.open()
  fenetre.document.write(html)
  fenetre.document.close()
}

// ---------------------------------------------------------------------------
// EXPORT DU CORRIGE D'UNE MISSION (espace enseignant)
// ---------------------------------------------------------------------------
// Document a contenu pedagogique (pas de donnees eleve) : consigne, contexte,
// puis pour chaque travail attendu l'intitule, les documents a mobiliser, la
// reponse attendue et le bareme. Destine a un dossier ou a une inspection.

import { getContenuMission, construireDeroule } from '../data/contenus'

// Construit le document PDF du corrige d'une mission. Renvoie null si la
// mission n'a pas de corrige structure.
export function documentCorrigeMission(
  missionId: string,
  titreMission: string,
  nomScenario: string,
): DocumentPdf | null {
  const contenu = getContenuMission(missionId)
  if (!contenu || !contenu.corrige || contenu.corrige.questions.length === 0) {
    return null
  }

  const sections: SectionPdf[] = []

  // Rappel de la consigne generale et du contexte, en neutre.
  const enTete: LignePdf[] = []
  if (contenu.travaux?.consigne) {
    enTete.push({ label: 'Consigne', valeur: contenu.travaux.consigne, nature: 'neutre' })
  }
  if (contenu.travaux?.contexte) {
    enTete.push({ label: 'Contexte', valeur: contenu.travaux.contexte, nature: 'neutre' })
  }
  if (enTete.length > 0) {
    sections.push({ titre: 'Présentation', lignes: enTete })
  }

  // Un bloc par question du corrige.
  let baremeTotal = 0
  contenu.corrige.questions.forEach((q, i) => {
    baremeTotal += q.bareme || 0
    const lignes: LignePdf[] = [
      { label: 'Travail demandé', valeur: q.intitule, nature: 'neutre' },
    ]
    if (q.documents && q.documents.length > 0) {
      lignes.push({ label: 'Documents à mobiliser', valeur: q.documents.join(' ; '), nature: 'neutre' })
    }
    // La reponse attendue est la correction : en rouge (nature 'prof').
    if (q.tableau) {
      const t = q.tableau
      const lignesTexte = t.lignes
        .map((l) => l.join(' | '))
        .join('\n')
      lignes.push({ label: 'Réponse attendue', valeur: `${t.colonnes.join(' | ')}\n${lignesTexte}`, nature: 'prof' })
    } else {
      lignes.push({ label: 'Réponse attendue', valeur: q.reponse, nature: 'prof' })
    }
    if (q.complement) {
      lignes.push({ label: 'Complément', valeur: q.complement, nature: 'prof' })
    }
    lignes.push({ label: 'Barème', valeur: `${q.bareme} point(s)`, nature: 'neutre' })

    sections.push({ titre: `Travail ${i + 1}`, lignes })
  })

  // Total du bareme en fin de document.
  sections.push({
    titre: 'Total',
    lignes: [{ label: 'Barème total', valeur: `${baremeTotal} point(s)`, nature: 'neutre' }],
  })

  return {
    titre: `Corrigé — ${titreMission}`,
    sousTitre: nomScenario,
    sections,
    piedContexte: `${nomScenario} — ${titreMission}`,
  }
}

// Exporte (imprime) le corrige d'une mission. Renvoie false si aucun corrige.
export function exporterCorrigeMission(
  missionId: string,
  titreMission: string,
  nomScenario: string,
): boolean {
  const doc = documentCorrigeMission(missionId, titreMission, nomScenario)
  if (!doc) return false
  imprimerPdf(doc)
  return true
}

// --- Export du bilan de presence -------------------------------------------

export interface LigneBilanPresence {
  nom: string
  prenom: string
  heures_absence: number
  heures_retard: number
  heures_exclusion: number
}

// Construit le document PDF du bilan de presence d'une periode.
export function documentBilanPresence(
  titre: string,
  periode: string,
  lignes: LigneBilanPresence[]
): DocumentPdf {
  const sections: SectionPdf[] = lignes.map((l) => ({
    titre: `${l.nom} ${l.prenom}`,
    lignes: [
      { label: "Heures d'absence", valeur: String(l.heures_absence), nature: 'neutre' },
      { label: 'Heures de retard', valeur: String(l.heures_retard), nature: 'neutre' },
      { label: "Heures d'exclusion", valeur: String(l.heures_exclusion), nature: 'neutre' },
    ],
  }))
  return {
    titre,
    sousTitre: periode,
    sections,
    piedNom: NOM_ENSEIGNANT,
  }
}

export function exporterBilanPresence(titre: string, periode: string, lignes: LigneBilanPresence[]): void {
  imprimerPdf(documentBilanPresence(titre, periode, lignes))
}

// --- Export du deroulement d'une mission (cote enseignant) -----------------

// Construit le document PDF de la fiche de deroulement d'une mission.
export function documentDeroulementMission(
  missionId: string,
  titreMission: string,
  numeroMission: number,
  nomScenario: string
): DocumentPdf | null {
  const d = construireDeroule(missionId, titreMission)
  if (!d) return null

  const sections: SectionPdf[] = []

  sections.push({
    titre: 'Informations',
    lignes: [
      { label: 'Durée totale', valeur: d.dureeTotale, nature: 'neutre' },
      { label: "Nombre d'activités", valeur: String(d.nbActivites), nature: 'neutre' },
      { label: 'Nombre de questions', valeur: String(d.nbQuestions), nature: 'neutre' },
    ],
  })

  if (d.contexte) {
    sections.push({ titre: 'Contexte', paragraphes: [d.contexte] })
  }

  if (d.competence) {
    sections.push({
      titre: 'Compétence visée',
      lignes: [
        { label: d.competence.groupe, valeur: d.competence.intitule, nature: 'neutre' },
        { label: 'Détail', valeur: d.competence.detail, nature: 'neutre' },
      ],
    })
  }

  if (d.objectifs.length > 0) {
    const lignes = '<ul style="margin:0;padding-left:18px;">' +
      d.objectifs.map((o) => `<li>${echapper(o)}</li>`).join('') +
      '</ul>'
    sections.push({ titre: 'Objectifs', htmlLibre: lignes })
  }

  const enTete = ['Phase', 'Durée', 'Modalité', 'Supports']
    .map((h) => `<th style="text-align:left;padding:7px 8px;font-size:12px;border:1px solid #333;background:#EEE;">${h}</th>`)
    .join('')
  const corps = d.phases
    .map((ph) => {
      const cellules = [ph.phase, ph.duree, ph.modalite, ph.supports]
        .map((v) => `<td style="padding:7px 8px;font-size:12px;border:1px solid #999;vertical-align:top;">${echapper(v)}</td>`)
        .join('')
      return `<tr>${cellules}</tr>`
    })
    .join('')
  const tableau = `<table style="border-collapse:collapse;width:100%;"><thead><tr>${enTete}</tr></thead><tbody>${corps}</tbody></table>`
  sections.push({ titre: 'Déroulé de la séance', htmlLibre: tableau })

  return {
    titre: titreMission,
    sousTitre: `${nomScenario} · Mission ${numeroMission}`,
    sections,
    piedNom: NOM_ENSEIGNANT,
    piedContexte: `${nomScenario} - Mission ${numeroMission} : ${titreMission}`,
  }
}

// Ouvre l'impression du deroulement d'une mission. Renvoie false si la mission
// n'a pas de contenu.
export function exporterDeroulementMission(
  missionId: string,
  titreMission: string,
  numeroMission: number,
  nomScenario: string
): boolean {
  const doc = documentDeroulementMission(missionId, titreMission, numeroMission, nomScenario)
  if (!doc) return false
  imprimerPdf(doc)
  return true
}
