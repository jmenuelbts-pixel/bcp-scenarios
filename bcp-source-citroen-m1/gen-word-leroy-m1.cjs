/* Generateur Word - Leroy Merlin - Mission 1 (vert #7AB51D) */
const fs = require('fs')
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
} = require('docx')

const VERT = '7AB51D'
const VERTF = 'EAF5DA'
const GRIS = '4B5563'
const OUT = '/mnt/user-data/outputs'

function H(txt, opts = {}) {
  return new Paragraph({
    spacing: { before: 220, after: 120 },
    children: [new TextRun({ text: txt, bold: true, size: opts.size || 28, color: opts.color || VERT })],
  })
}
function P(txt, opts = {}) {
  return new Paragraph({
    spacing: { after: 100 },
    alignment: opts.align,
    children: [new TextRun({ text: txt, size: opts.size || 22, italics: !!opts.it, bold: !!opts.b, color: opts.color })],
  })
}
function bullet(txt) {
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: txt, size: 22 })] })
}
function cell(txt, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.head ? { type: ShadingType.SOLID, color: VERT } : (opts.fill ? { type: ShadingType.SOLID, color: VERTF } : undefined),
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    children: [new Paragraph({ children: [new TextRun({ text: txt, bold: opts.head || opts.b, color: opts.head ? 'FFFFFF' : undefined, size: 21 })] })],
  })
}
function tbl(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'C9D6E3' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'C9D6E3' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'C9D6E3' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'C9D6E3' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'C9D6E3' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'C9D6E3' },
    },
    rows,
  })
}
function blank(n) {
  const out = []
  for (let i = 0; i < n; i++) out.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'C9D6E3', space: 6 } }, spacing: { after: 160 }, children: [new TextRun('')] }))
  return out
}
function titreBandeau(txt) {
  return new Paragraph({
    shading: { type: ShadingType.SOLID, color: VERT },
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text: txt, bold: true, color: 'FFFFFF', size: 24 })],
  })
}

// ====================== EN-TETE COMMUN ======================
function entete() {
  return [
    P('Scénario Vente – LEROY MERLIN – Mission 1', { b: true, color: GRIS }),
    P('MENUEL – Professeur de vente', { it: true, color: GRIS, size: 20 }),
    new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: 'Scénario 6', bold: true, size: 24, color: VERT })] }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 60 }, children: [new TextRun({ text: "La présentation de l'unité commerciale et de son marché", bold: true, size: 30, color: VERT })] }),
    P('Compétences travaillées :', { b: true }),
    bullet("C.1.1 - Rechercher, actualiser les informations sur l'entreprise et son marché"),
    bullet('Maîtriser la technologie des produits'),
    new Paragraph({ spacing: { before: 120, after: 120 }, children: [new TextRun({ text: 'NOM ET PRÉNOM :', bold: true, size: 22 }), new TextRun({ text: '                                                  Mission 1', size: 22 })] }),
    P("Vous êtes en PFMP dans l'entreprise Leroy Merlin, situé à Paris. L'enseigne est spécialisée dans l'amélioration de l'habitat (construction, aménagement, décoration, bricolage et jardinage).", { it: true }),
    P("C'est votre premier jour et donc avant de vous confier des tâches importantes, votre responsable Mme Annie Mâle souhaite que vous vous familiarisiez avec l'entreprise, ses produits et son marché.", { it: true }),
    P("Votre tuteur vous demande de réaliser la « carte d'identité » de celle-ci.", { it: true }),
  ]
}

// ====================== CONSIGNES ======================
function consignes(corrige) {
  const lien = (n) => corrige ? `Consulter le document ${n}` : `Consulter le document ${n}`
  return [
    H("Activité 1 – Identification de l'entreprise"),
    P(`1. Complétez l'identité de l'entreprise (${lien(1)}, compléter l'annexe 1).`),
    P(`2. Indiquez les partenaires de l'entreprise (${lien(2)}, compléter l'annexe 2).`),
    P(`3. Réalisez le profil-type de la clientèle de l'entreprise (${lien(3)}, compléter l'annexe 3).`),
    H("Activité 2 – Les biens et les services de l'entreprise"),
    P(`4. Listez les différents services proposés par l'entreprise, puis cochez s'ils sont marchands ou non marchands (${lien(4)}, compléter l'annexe 4).`),
    P(`5. Listez tous les biens proposés par Leroy Merlin à sa clientèle (${lien(5)}, compléter l'annexe 5).`),
    H('Activité 3 – Les concurrents'),
    P(`6. Listez les différents concurrents de l'entreprise (${lien(6)} et le document, compléter l'annexe 6).`),
    H('Activité 4 – Le marché'),
    P(`7. Étudier le marché du bricolage (${lien(7)}, compléter l'annexe 7).`),
  ]
}

// ====================== DOCUMENT CONCURRENCE ======================
function docConcurrence() {
  const dirDef = "Un concurrent direct est une entreprise ou une organisation qui propose un produit, un service ou un prix similaire ou comparable à celui d'une autre entreprise. Elles ont la même activité principale."
  const indDef = "Un concurrent indirect est une entreprise ou une organisation dont l'activité principale n'est pas la même ou qui propose un produit ou un service comparable ou différent, mais susceptible de répondre au même besoin du consommateur."
  const rows = [
    ['Définitions', dirDef, indDef],
    ['Exemple 1 : Un client qui veut aller à Toulouse il peut le faire avec la compagnie Air France', "Ce client peut aussi voyager avec des concurrents directs d'Air France :\n- Easy Jet\n- Rayan Air", "Ce client peut aussi voyager avec des concurrents indirects d'Air France :\n- Co-voiturage\n- Train SNCF"],
    ['Exemple 2 : Un client veut acheter des vêtements chez H&M', "Ce client peut aussi acheter des vêtements chez des concurrents directs d'H&M :\n- Bershka\n- Zara\nL'activité principale des deux enseignes est la vente de vêtements", "Ce client peut aussi acheter des vêtements chez des concurrents indirects d'H&M :\n- Louis Vuitton\n- Gucci\nIls ne proposent pas du tout les mêmes prix qu'H&M alors même qu'ils vendent aussi des vêtements."],
    ['Exemple 3 : Un client veut acheter un four à micro-onde chez Darty', "Ce client peut aussi acheter son four micro-onde chez des concurrents directs de Darty :\n- Boulanger\nL'activité principale des deux enseignes sont la télé, la Hi-fi et l'électroménager.", "Ce client peut aussi acheter des vêtements chez des concurrents indirects Darty :\n- Carrefour\nCarrefour vend certes des micro-ondes aussi mais son activité principale est l'alimentaire."],
    ['Exemple 4 : Un client cherche un appartement chez La Forêt Immobilier', "Ce client peut aussi chercher son appartement chez des concurrents directs de La Forêt Immobilier :\n- ERA Immobilier\n- Century 21", "Ce client peut aussi chercher son appartement chez des concurrents indirects de La Forêt Immobilier :\n- Agence immobilière en ligne\n- Magazine (ex : Particulier à Particulier)"],
  ]
  const multiCell = (txt, opts = {}) => {
    const parts = String(txt).split('\n')
    return new TableCell({
      width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
      shading: opts.fill ? { type: ShadingType.SOLID, color: VERTF } : undefined,
      margins: { top: 60, bottom: 60, left: 90, right: 90 },
      children: parts.map((p) => new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: p, bold: opts.b, size: 20 })] })),
    })
  }
  const trs = [new TableRow({ children: [cell('', { head: true, width: 22 }), cell('Concurrents directs', { head: true, width: 39 }), cell('Concurrents indirects', { head: true, width: 39 })] })]
  rows.forEach((r) => trs.push(new TableRow({ children: [multiCell(r[0], { fill: true, b: true, width: 22 }), multiCell(r[1]), multiCell(r[2])] })))
  return [
    titreBandeau('Mission 1 : DOCUMENT'),
    H('Document – La concurrence'),
    tbl(trs),
  ]
}

// ====================== ANNEXES (FICHE ELEVE) ======================
function annexesEleve() {
  const out = [titreBandeau('Mission 1 : ANNEXES')]
  // Annexe 1
  out.push(H("Annexe 1 – Identité de l'entreprise"))
  out.push(tbl([
    new TableRow({ children: [cell('Dénomination', { fill: true, b: true, width: 40 }), cell('')] }),
    new TableRow({ children: [cell("Secteur d'activité", { fill: true, b: true }), cell('')] }),
    new TableRow({ children: [cell('Nationalité', { fill: true, b: true }), cell('')] }),
    new TableRow({ children: [cell('Date de création', { fill: true, b: true }), cell('')] }),
    new TableRow({ children: [cell("Chiffres d'affaires", { fill: true, b: true }), cell('')] }),
    new TableRow({ children: [cell('Réseaux sociaux', { fill: true, b: true }), cell('')] }),
    new TableRow({ children: [cell('Adresse', { fill: true, b: true }), cell('')] }),
  ]))
  // Annexe 2
  out.push(H('Annexe 2 – Les partenaires'))
  out.push(...blank(6))
  // Annexe 3
  out.push(H('Annexe 3 – La clientèle'))
  out.push(tbl([
    new TableRow({ children: [cell('Type de clientèle', { head: true, width: 40 }), cell('Cochez', { head: true, width: 25 }), cell('Pourcentage', { head: true, width: 35 })] }),
    new TableRow({ children: [cell('Particuliers', { b: true }), cell(''), cell('')] }),
    new TableRow({ children: [cell('Professionnels', { b: true }), cell(''), cell('')] }),
  ]))
  out.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun('')] }))
  out.push(tbl([
    new TableRow({ children: [cell('Critères', { head: true, width: 40 }), cell('Réponses', { head: true, width: 35 }), cell('Pourcentage', { head: true, width: 25 })] }),
    new TableRow({ children: [cell('Sexe', { fill: true, b: true }), cell(''), cell('')] }),
    new TableRow({ children: [cell("Tranche d'âge", { fill: true, b: true }), cell(''), cell('')] }),
    new TableRow({ children: [cell("Lieu d'habitation", { fill: true, b: true }), cell(''), cell('')] }),
    new TableRow({ children: [cell('Panier moyen', { fill: true, b: true }), cell(''), cell('')] }),
    new TableRow({ children: [cell('Situation professionnelle', { fill: true, b: true }), cell(''), cell('')] }),
  ]))
  // Annexe 4
  out.push(H('Annexe 4 – Les services'))
  out.push(P('Marchand = payant - Non marchand = gratuit ou quasi-gratuit', { it: true, size: 20 }))
  const a4 = [new TableRow({ children: [cell('Les services', { head: true, width: 50 }), cell('Marchand', { head: true, width: 25 }), cell('Non marchand', { head: true, width: 25 })] })]
  for (let i = 0; i < 5; i++) a4.push(new TableRow({ children: [cell(''), cell(''), cell('')] }))
  out.push(tbl(a4))
  // Annexe 5
  out.push(H('Annexe 5 – Les biens'))
  const a5 = [new TableRow({ children: [cell('Les types de biens vendus', { head: true, width: 50 }), cell('', { head: true, width: 50 })] })]
  for (let i = 0; i < 7; i++) a5.push(new TableRow({ children: [cell(''), cell('')] }))
  out.push(tbl(a5))
  // Annexe 6
  out.push(H('Annexe 6 – Les concurrents'))
  const a6 = [new TableRow({ children: [cell('Nom des concurrents', { head: true, width: 35 }), cell('Direct', { head: true, width: 12 }), cell('Indirect', { head: true, width: 13 }), cell('Justification', { head: true, width: 40 })] })]
  for (let i = 0; i < 14; i++) a6.push(new TableRow({ children: [cell(''), cell(''), cell(''), cell('')] }))
  out.push(tbl(a6))
  // Annexe 7
  out.push(H('Annexe 7 – Étude du marché du bricolage'))
  const q = [
    "Parmi les enseignes citées, quelle est celle qui a le plus augmentée son chiffre d'affaires et celle qui a le moins augmenté ?",
    "Quelle est l'enseigne qui a le plus augmenté son chiffre d'affaires en pourcentage ?",
    "Listez l'ensemble des actions mises en œuvre par Mr Bricolage pour devenir le leader du marché du bricolage de proximité ?",
    "Quel est le chiffre d'affaires de Weldom ?",
    'De quel groupe fait partie Bricorama ?',
    "Quelles sont les deux méthodes de vente qui ont permis aux enseignes de bricolage d'augmenter autant leur chiffre d'affaires ?",
  ]
  const a7 = [new TableRow({ children: [cell('Questions', { head: true, width: 55 }), cell('Réponses', { head: true, width: 45 })] })]
  q.forEach((qq) => a7.push(new TableRow({ children: [cell(qq, { fill: true }), cell('')] })))
  out.push(tbl(a7))
  return out
}

// ====================== ANNEXES (CORRIGE) ======================
function annexesCorrige() {
  const out = [titreBandeau('Mission 1 : ANNEXES (CORRIGÉ)')]
  out.push(H("Annexe 1 – Identité de l'entreprise"))
  out.push(tbl([
    new TableRow({ children: [cell('Dénomination', { fill: true, b: true, width: 40 }), cell('Leroy Merlin')] }),
    new TableRow({ children: [cell("Secteur d'activité", { fill: true, b: true }), cell('Commerce de détail de quincaillerie, peinture et verre en grandes surfaces')] }),
    new TableRow({ children: [cell('Nationalité', { fill: true, b: true }), cell('Française')] }),
    new TableRow({ children: [cell('Date de création', { fill: true, b: true }), cell('1924')] }),
    new TableRow({ children: [cell("Chiffres d'affaires", { fill: true, b: true }), cell('6 244 471 900 €')] }),
    new TableRow({ children: [cell('Réseaux sociaux', { fill: true, b: true }), cell('Facebook ; Twitter ; Pinterest')] }),
    new TableRow({ children: [cell('Adresse', { fill: true, b: true }), cell('Rue Chanzy 59260 LEZENNES')] }),
  ]))
  out.push(H('Annexe 2 – Les partenaires'))
  out.push(P('ADEME – CEMS – Broca Living Lab – Max Weber – CERLIS – Forum Urbain – Mobile Lives FORUM Vie Mobile – Mixing Generations – Nova 7 – PAVE – Regards – Union Régionale SOLIHA – TASDA'))
  out.push(H('Annexe 3 – La clientèle'))
  out.push(tbl([
    new TableRow({ children: [cell('Type de clientèle', { head: true, width: 40 }), cell('Cochez', { head: true, width: 25 }), cell('Pourcentage', { head: true, width: 35 })] }),
    new TableRow({ children: [cell('Particuliers', { b: true }), cell('X'), cell('98 %')] }),
    new TableRow({ children: [cell('Professionnels', { b: true }), cell('X'), cell('2 %')] }),
  ]))
  out.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun('')] }))
  out.push(tbl([
    new TableRow({ children: [cell('Critères', { head: true, width: 40 }), cell('Réponses', { head: true, width: 35 }), cell('Pourcentage', { head: true, width: 25 })] }),
    new TableRow({ children: [cell('Sexe', { fill: true, b: true }), cell('Hommes'), cell('63 %')] }),
    new TableRow({ children: [cell("Tranche d'âge", { fill: true, b: true }), cell('35 – 55 ans'), cell('')] }),
    new TableRow({ children: [cell("Lieu d'habitation", { fill: true, b: true }), cell('Résidant en zone urbaine'), cell('96 %')] }),
    new TableRow({ children: [cell('Panier moyen', { fill: true, b: true }), cell('40 000 €'), cell('')] }),
    new TableRow({ children: [cell('Situation professionnelle', { fill: true, b: true }), cell('CSP++'), cell('')] }),
  ]))
  out.push(H('Annexe 4 – Les services'))
  out.push(tbl([
    new TableRow({ children: [cell('Les services', { head: true, width: 50 }), cell('Marchand', { head: true, width: 25 }), cell('Non marchand', { head: true, width: 25 })] }),
    new TableRow({ children: [cell('Remboursement et remplacement'), cell(''), cell('X')] }),
    new TableRow({ children: [cell('Remboursement de la différence'), cell(''), cell('X')] }),
    new TableRow({ children: [cell('Retrait gratuit en magasin'), cell(''), cell('X')] }),
    new TableRow({ children: [cell('Livraison à domicile'), cell('X'), cell('')] }),
    new TableRow({ children: [cell('Retour gratuit en magasin'), cell(''), cell('X')] }),
  ]))
  out.push(H('Annexe 5 – Les biens'))
  const biens = [
    ['Carrelage, parquet et sol souple', 'Outillage'],
    ['Chauffage et plomberie', 'Quincaillerie'],
    ['Menuiserie', 'Cuisine'],
    ['Salle de bains', 'Rangement / dressing'],
    ['Décoration et éclairage', 'Terrasse et jardin'],
    ['Peinture et droguerie', 'Matériaux de construction'],
    ['Électricité et domotique', 'Meuble'],
  ]
  const a5 = [new TableRow({ children: [cell('Les types de biens vendus', { head: true, width: 50 }), cell('', { head: true, width: 50 })] })]
  biens.forEach((r) => a5.push(new TableRow({ children: [cell(r[0]), cell(r[1])] })))
  out.push(tbl(a5))
  out.push(H('Annexe 6 – Les concurrents'))
  const conc = [
    ['Castorama', 'X', '', 'Même activité principale'],
    ['Brico Dépôt', 'X', '', 'Même activité principale'],
    ['Brico Marché', 'X', '', 'Même activité principale'],
    ['Mano Mano', 'X', '', 'Même activité principale'],
    ['Mr. Bricolage', 'X', '', 'Même activité principale'],
    ['Bricorama', 'X', '', 'Même activité principale'],
    ['Lapeyre', 'X', '', 'Même activité principale'],
    ['Weldom', '', 'X', 'Activité principale différente'],
    ['Schmidt', '', 'X', 'Activité principale différente'],
    ['Mobalpa', '', 'X', 'Activité principale différente'],
    ['Hygena', '', 'X', 'Activité principale différente'],
    ['Ikea', '', 'X', 'Activité principale différente'],
    ['Alinéa', '', 'X', 'Activité principale différente'],
    ['Point P.', '', 'X', 'Activité principale différente'],
  ]
  const a6 = [new TableRow({ children: [cell('Nom des concurrents', { head: true, width: 35 }), cell('Direct', { head: true, width: 12 }), cell('Indirect', { head: true, width: 13 }), cell('Justification', { head: true, width: 40 })] })]
  conc.forEach((r) => a6.push(new TableRow({ children: [cell(r[0], { b: true }), cell(r[1]), cell(r[2]), cell(r[3])] })))
  out.push(tbl(a6))
  out.push(H('Annexe 7 – Étude du marché du bricolage'))
  const a7data = [
    ["Parmi les enseignes citées, quelle est celle qui a le plus augmentée son chiffre d'affaires et celle qui a le moins augmenté ?", "Celle qui a le plus augmenté son CA : Leroy Merlin (7,345 milliards d'€). Celle qui a le moins augmenté son CA : Castorama (2,5 milliards d'€)."],
    ["Quelle est l'enseigne qui a le plus augmenté son chiffre d'affaires en pourcentage ?", "Celle qui a le plus augmenté son CA en % : en progression de 11 % l'an passé (Bricomarché, Bricorama et Brico Cash)."],
    ["Listez l'ensemble des actions mises en œuvre par Mr Bricolage pour devenir le leader du marché du bricolage de proximité ?", "Nouvelle plateforme de marque, nouveau concept, nouvelle identité visuelle, transformation digitale, plan de développement ambitieux, nouveaux formats de magasin…"],
    ["Quel est le chiffre d'affaires de Weldom ?", "884 millions d'€"],
    ['De quel groupe fait partie Bricorama ?', 'Les Mousquetaires'],
    ["Quelles sont les deux méthodes de vente qui ont permis aux enseignes de bricolage d'augmenter autant leur chiffre d'affaires ?", 'En magasin ; Sur internet (e-commerce)'],
  ]
  const a7 = [new TableRow({ children: [cell('Questions', { head: true, width: 50 }), cell('Réponses', { head: true, width: 50 })] })]
  a7data.forEach((r) => a7.push(new TableRow({ children: [cell(r[0], { fill: true }), cell(r[1])] })))
  out.push(tbl(a7))
  return out
}

// ====================== SYNTHESE + AUTO-EVAL ======================
function syntheseAuto() {
  return [
    titreBandeau('Mission 1 : SYNTHÈSE'),
    P('Le profil-type de la clientèle', { b: true }),
    bullet('Types de clientèle : Particuliers'),
    bullet('Sexe : Hommes'),
    bullet('Panier moyen : 40 000 €'),
    P('Les produits vendus par l\'entreprise', { b: true }),
    bullet('Les biens'),
    bullet('Les services'),
    P('Les types de concurrents', { b: true }),
    bullet('Concurrents directs : 2 entreprises qui ont la même activité principale'),
    bullet('Concurrents indirects'),
    titreBandeau('Mission 1 : AUTO-ÉVALUATION'),
    P('Évaluez votre compréhension des exercices de la mission 1 ainsi que votre niveau de difficulté pour le réaliser.'),
    tbl([
      new TableRow({ children: [cell('Insuffisant', { head: true, width: 25 }), cell('Fragile', { head: true, width: 25 }), cell('Satisfaisant', { head: true, width: 25 }), cell('Maîtrisé', { head: true, width: 25 })] }),
      new TableRow({ children: [cell(''), cell(''), cell(''), cell('')] }),
      new TableRow({ children: [cell(''), cell(''), cell(''), cell('')] }),
    ]),
  ]
}

async function build(corrige) {
  const children = [...entete(), ...consignes(corrige), ...docConcurrence()]
  if (corrige) children.push(...annexesCorrige())
  else children.push(...annexesEleve())
  children.push(...syntheseAuto())
  const doc = new Document({
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children }],
  })
  const buf = await Packer.toBuffer(doc)
  const name = corrige ? 'Corrige - LEROY MERLIN - M1.docx' : 'LEROY MERLIN - M1.docx'
  fs.writeFileSync(`${OUT}/${name}`, buf)
  console.log('OK', name)
}

;(async () => { await build(false); await build(true) })()
