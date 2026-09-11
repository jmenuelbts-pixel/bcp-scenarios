// exportExercice.tsx
// Export PDF fidele d'un exercice complet par capture des vues reellement
// affichees (html2canvas), puis assemblage en pages A4 et impression navigateur.
// Fidelite garantie a l'app (images /docs, tableaux, visuels dessines par code)
// sans reimplementer chaque type de contenu.
//
// Mode 'vierge'  : champs de saisie vides, bonne reponse jamais montree
//                  (feuille de style d'impression).
// Mode 'rempli'  : etat courant de la page (reponses de l'eleve visibles).

import html2canvas from 'html2canvas'

export type ModeExport = 'vierge' | 'rempli'

const LARGEUR_PX = 794 // ~210mm a 96dpi (A4)

function attendre(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function capturer(noeud: HTMLElement): Promise<string> {
  const canvas = await html2canvas(noeud, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#FFFFFF',
    logging: false,
  })
  return canvas.toDataURL('image/png')
}

function imprimerImages(images: string[], titre: string, piedNom?: string): void {
  const fenetre = window.open('', '_blank')
  if (!fenetre) {
    alert('Autorisez les fenêtres pop-up pour générer le PDF.')
    return
  }
  const pied = piedNom ? `<div class="pied">${piedNom}</div>` : ''
  const pages = images.map((src) => `<div class="page"><img src="${src}" />${pied}</div>`).join('')
  fenetre.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${titre}</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, sans-serif; }
  .page { position: relative; width: 100%; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  .page img { width: 100%; display: block; }
  .pied { position: fixed; bottom: 3mm; left: 0; right: 0; text-align: center; font-size: 9px; color: #6B7280; }
</style></head><body>${pages}
<script>window.onload=function(){setTimeout(function(){window.print();},350);};</script>
</body></html>`)
  fenetre.document.close()
}

// Decoupe un long rendu en pages A4 pour une pagination propre.
async function capturerNoeudPagine(noeud: HTMLElement): Promise<string[]> {
  const largeurReelle = noeud.getBoundingClientRect().width || LARGEUR_PX
  const hauteurPage = largeurReelle * (297 / 210)
  const total = noeud.scrollHeight
  if (total <= hauteurPage * 1.05) {
    return [await capturer(noeud)]
  }
  const pleine = await html2canvas(noeud, { scale: 2, useCORS: true, backgroundColor: '#FFFFFF', logging: false })
  const echelle = pleine.width / largeurReelle
  const hautPagePx = Math.floor(hauteurPage * echelle)
  const images: string[] = []
  let y = 0
  while (y < pleine.height) {
    const h = Math.min(hautPagePx, pleine.height - y)
    const morceau = document.createElement('canvas')
    morceau.width = pleine.width
    morceau.height = h
    const ctx = morceau.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, morceau.width, morceau.height)
      ctx.drawImage(pleine, 0, y, pleine.width, h, 0, 0, pleine.width, h)
      images.push(morceau.toDataURL('image/png'))
    }
    y += h
  }
  return images
}

// Capture un unique noeud (deja rendu) en PDF pagine A4.
export async function capturerNoeudEnPdf(noeud: HTMLElement, titre: string, piedNom?: string): Promise<void> {
  const images = await capturerNoeudPagine(noeud)
  if (images.length === 0) {
    alert('Rien à exporter.')
    return
  }
  imprimerImages(images, titre, piedNom)
}

// Capture successivement des zones DOM deja affichees. `preparer` change
// d'onglet avant chaque capture ; `obtenirNoeud` renvoie la zone a capturer.
export async function capturerZonesEnPdf(
  etapes: { preparer: () => Promise<void> | void; obtenirNoeud: () => HTMLElement | null }[],
  mode: ModeExport,
  titre: string,
  piedNom?: string
): Promise<void> {
  document.body.classList.add('impression-pdf')
  document.body.classList.toggle('impression-vierge', mode === 'vierge')
  const images: string[] = []
  try {
    for (const etape of etapes) {
      await etape.preparer()
      await attendre(500)
      const noeud = etape.obtenirNoeud()
      if (noeud) {
        const pages = await capturerNoeudPagine(noeud)
        images.push(...pages)
      }
    }
  } finally {
    document.body.classList.remove('impression-pdf', 'impression-vierge')
  }
  if (images.length === 0) {
    alert('Rien à exporter pour cet exercice.')
    return
  }
  imprimerImages(images, titre, piedNom)
}
