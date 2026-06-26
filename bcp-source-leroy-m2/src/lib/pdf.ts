// pdf.ts
// Generation de PDF sans librairie externe : on construit une page HTML sobre
// et on declenche l'impression du navigateur. L'utilisateur choisit ensuite
// "Enregistrer en PDF". Conforme au workflow d'impression via Safari.
// Police Arial, couleur professeur, accents francais preserves.

import { COULEUR_PROF } from '../data/schema'

// Echappe le texte insere dans le HTML pour eviter toute injection.
function echapper(texte: string): string {
  return texte
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Construit un paragraphe ou un tiret si le contenu est vide.
function bloc(label: string, contenu: string | null | undefined): string {
  const valeur = contenu && contenu.trim().length > 0 ? echapper(contenu) : '-'
  return `<div class="bloc"><div class="label">${echapper(label)}</div><div class="valeur">${valeur}</div></div>`
}

export interface SectionPdf {
  titre: string
  // Lignes simples (label + valeur) ou texte libre.
  lignes?: { label: string; valeur: string | null | undefined }[]
  // Texte libre additionnel (paragraphes).
  paragraphes?: string[]
}

export interface DocumentPdf {
  titre: string
  sousTitre?: string
  sections: SectionPdf[]
}

// Ouvre une fenetre d'impression avec le document fourni.
export function imprimerPdf(doc: DocumentPdf): void {
  const dateJour = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const sectionsHtml = doc.sections
    .map((s) => {
      const lignesHtml = (s.lignes ?? [])
        .map((l) => bloc(l.label, l.valeur))
        .join('')
      const parasHtml = (s.paragraphes ?? [])
        .map((p) => `<p class="para">${echapper(p)}</p>`)
        .join('')
      return `<section><h2>${echapper(s.titre)}</h2>${lignesHtml}${parasHtml}</section>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>${echapper(doc.titre)}</title>
<style>
  * { font-family: Arial, sans-serif; box-sizing: border-box; }
  body { margin: 0; padding: 32px 36px; color: #1F2933; }
  header { border-bottom: 3px solid ${COULEUR_PROF}; padding-bottom: 14px; margin-bottom: 22px; }
  h1 { font-size: 20px; color: ${COULEUR_PROF}; margin: 0; }
  .soustitre { font-size: 13px; color: #4B5563; margin-top: 4px; }
  .date { font-size: 12px; color: #6B7280; margin-top: 4px; }
  section { margin-bottom: 22px; page-break-inside: avoid; }
  h2 { font-size: 15px; color: ${COULEUR_PROF}; border-bottom: 1px solid #D8E2EC; padding-bottom: 5px; margin: 0 0 12px; }
  .bloc { margin-bottom: 10px; }
  .label { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 2px; }
  .valeur { font-size: 13px; color: #1F2933; white-space: pre-wrap; line-height: 1.5; }
  .para { font-size: 13px; line-height: 1.5; margin: 0 0 8px; white-space: pre-wrap; }
  @media print { body { padding: 0; } @page { margin: 18mm; } }
</style>
</head>
<body>
  <header>
    <h1>${echapper(doc.titre)}</h1>
    ${doc.sousTitre ? `<div class="soustitre">${echapper(doc.sousTitre)}</div>` : ''}
    <div class="date">Édité le ${echapper(dateJour)}</div>
  </header>
  ${sectionsHtml}
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
