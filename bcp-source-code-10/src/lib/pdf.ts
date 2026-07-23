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
export const ENCRE_ELEVE = '#1D4ED8' // bleu : reponses de l'eleve
export const ENCRE_PROF = '#B91C1C' // rouge : correction du professeur
export const ENCRE_NEUTRE = '#1F2933' // noir : consignes et libelles

// Echappe le texte insere dans le HTML pour eviter toute injection.
function echapper(texte: string): string {
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
      const classe = s.sautAvant ? 'saut' : ''
      return `<section class="${classe}"><h2>${echapper(s.titre)}</h2>${lignesHtml}${parasHtml}</section>`
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
  section.saut { page-break-before: always; }
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
    <div class="legende">
      Légende : <span class="pastille">noir</span> = consignes et intitulés,
      <span class="pastille eleve">bleu</span> = réponses de l'élève,
      <span class="pastille prof">rouge</span> = correction du professeur et mentions non renseignées.
    </div>
  </header>
  ${sectionsHtml}
  <div class="pied">
    <span class="nom">${piedGauche}</span>
    <span class="contexte">${piedCentre}</span>
    <span class="num"></span>
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
