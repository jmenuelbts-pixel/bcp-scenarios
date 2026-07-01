// Génère 3 Word pour Peugeot M9 : fiche de déroulement, fiche élève, corrigé
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } = require('docx')
const fs = require('fs')

const VERT = '00513B'
const GRIS = 'F2F2F2'
const ROUGE = 'C00000'

function cell(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.shading ? { fill: opts.shading } : undefined,
    children: (Array.isArray(text) ? text : [text]).map((t) =>
      new Paragraph({ children: [new TextRun({ text: t, bold: !!opts.bold, color: opts.color || '000000', size: opts.size || 20 })], alignment: opts.align || AlignmentType.LEFT })),
  })
}
function headerRow(cols, color) {
  return new TableRow({ tableHeader: true, children: cols.map((c) => cell(c, { bold: true, color: 'FFFFFF', shading: color || VERT, align: AlignmentType.CENTER })) })
}
function H(text, size, color) { return new Paragraph({ children: [new TextRun({ text, bold: true, size: size || 24, color: color || VERT })], spacing: { before: 120, after: 80 } }) }
function P(text, opts = {}) { return new Paragraph({ children: [new TextRun({ text, size: opts.size || 20, italics: !!opts.i, bold: !!opts.b })], spacing: { after: opts.after || 120 } }) }
function bullet(text) { return new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text, size: 20 })] }) }

function save(doc, name) {
  return Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(name, buf); console.log('OK', name) })
}

// ---------------------------------------------------------------------------
// 1) FICHE DE DÉROULEMENT
// ---------------------------------------------------------------------------
const deroulement = new Document({ sections: [{ children: [
  new Paragraph({ children: [new TextRun({ text: 'Scénario MCV — PEUGEOT', bold: true, size: 20, color: VERT })] }),
  new Paragraph({ children: [new TextRun({ text: "Fiche de déroulement — Mission 9 : Les mobiles d'achat et l'argumentation", bold: true, size: 30, color: VERT })], spacing: { after: 120 } }),
  new Paragraph({ children: [new TextRun({ text: 'Bac Pro Métiers du Commerce et de la Vente — Option B', italics: true, size: 20 })], spacing: { after: 200 } }),

  H('Compétence travaillée'),
  P("C.1.2 — Argumenter à partir des mobiles d'achat du client.", { after: 160 }),

  H('Objectifs pédagogiques'),
  bullet("Identifier le mobile d'achat SONCASE d'un client à partir de ce qu'il exprime."),
  bullet("Justifier le mobile d'achat par le mot ou le groupe de mots du client."),
  new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: "Construire des arguments de vente avec la méthode C.A.P.", size: 20 })], spacing: { after: 160 } }),

  H('Contexte'),
  P("Vous poursuivez votre PFMP à la concession ConcessionCollet. Votre tuteur, M. Paul Auchon, vous explique que pour bien vendre, il faut comprendre ce qui motive chaque client à acheter : le mobile d'achat. Il vous confie les témoignages de six clients à analyser, puis vous demande de préparer des arguments avec la méthode C.A.P.", { after: 200 }),

  H('Déroulement de la séance'),
  new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    headerRow(['Phase', 'Durée', "Activité de l'élève", "Activité de l'enseignant", 'Supports']),
    new TableRow({ children: [
      cell('Lancement', { width: 14, bold: true, shading: GRIS }), cell('10 min', { width: 8, align: AlignmentType.CENTER }),
      cell("Prend connaissance du contexte et de la méthode SONCASE (document 1).", { width: 30 }),
      cell("Présente la mission, rappelle le lien avec la vente, propose le choix lire/écouter les témoignages.", { width: 30 }),
      cell('Document 1 (SONCASE)', { width: 18 }),
    ] }),
    new TableRow({ children: [
      cell('Activité 1', { width: 14, bold: true, shading: GRIS }), cell('25 min', { width: 8, align: AlignmentType.CENTER }),
      cell("Identifie le mobile d'achat de chaque client et le justifie par ses mots (annexe 1).", { width: 30 }),
      cell("Circule, guide l'écoute des audios, remédie sur la distinction des mobiles.", { width: 30 }),
      cell('Documents 1 et 2 + Annexe 1', { width: 18 }),
    ] }),
    new TableRow({ children: [
      cell('Activité 2', { width: 14, bold: true, shading: GRIS }), cell('30 min', { width: 8, align: AlignmentType.CENTER }),
      cell("Choisit 3 mobiles et construit des arguments avec la méthode C.A.P. (annexe 2).", { width: 30 }),
      cell("Explique la méthode C.A.P. à partir de l'exemple, accompagne la rédaction des arguments.", { width: 30 }),
      cell('Document 3 + Annexe 2', { width: 18 }),
    ] }),
    new TableRow({ children: [
      cell('Synthèse', { width: 14, bold: true, shading: GRIS }), cell('15 min', { width: 8, align: AlignmentType.CENTER }),
      cell("Complète la carte mentale (SONCASE + C.A.P.), s'auto-évalue et réalise le quiz.", { width: 30 }),
      cell("Institutionnalise SONCASE et C.A.P., lance le défi quiz.", { width: 30 }),
      cell('Synthèse + Quiz', { width: 18 }),
    ] }),
  ] }),
  P('', { after: 120 }),
  H('Prolongement / activités numériques'),
  bullet('Glossaire, 10 flashcards notées, quiz 10 questions, glisser-déposer (10 items), carte mentale.'),
] }] })

// ---------------------------------------------------------------------------
// 2) FICHE ÉLÈVE
// ---------------------------------------------------------------------------
const eleve = new Document({ sections: [{ children: [
  new Paragraph({ children: [new TextRun({ text: 'Scénario MCV — PEUGEOT', bold: true, size: 20, color: VERT })] }),
  new Paragraph({ children: [new TextRun({ text: "Mission 9 : Les mobiles d'achat et l'argumentation", bold: true, size: 30, color: VERT })], spacing: { after: 200 } }),

  H('Activité 1 — SONCASE', 26),
  bullet("Retrouvez le mobile d'achat correspondant aux affirmations de chaque client. (Lire les documents 1 et 2, compléter l'annexe 1)"),
  bullet("Indiquez le mot ou le groupe de mots justifiant votre choix pour chaque mobile d'achat. (Lire le document 2, compléter l'annexe 1)"),

  H('Activité 2 — Argumentation', 26),
  bullet("Choisissez 3 mobiles d'achat parmi les 6, replacez-les dans le tableau puis construisez des arguments en utilisant la méthode C.A.P. (Lire le document 3 et relire l'annexe 1, compléter l'annexe 2)"),

  new Paragraph({ children: [new TextRun({ text: 'Mission 9 : DOCUMENTS', bold: true, size: 28, color: ROUGE })], spacing: { before: 240, after: 120 } }),
  H('Document 1 — Les mobiles d\'achat du client (méthode SONCASE)'),
  new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    headerRow(['Typologie', 'Exemples']),
    ...[['S comme Sécurité','Produit solide, fiable, robuste, garantie, de qualité'],['O comme Orgueil','Produit prestigieux, de marque'],['N comme Nouveauté','Produit récent, à la mode, innovant, moderne'],['C comme Confort',"Produit pratique, facile d'utilisation, efficace"],['A comme Argent','Paiement en plusieurs fois, produit économique, en promotion'],['S comme Sympathie',"Plaisir procuré par l'achat, attirance pour une couleur, forme"],['E comme Environnement','Produit durable, écologique']].map((r)=> new TableRow({ children: [cell(r[0],{width:35,bold:true}), cell(r[1],{width:65})] })),
  ] }),

  H('Document 2 — Les mobiles d\'achat des clients'),
  P("Pour chaque client, lisez ou écoutez son témoignage :"),
  ...[['Mme CHEREL',"« Cette voiture me plaît beaucoup, mais à ce prix-là elle ne rentre pas dans mon budget. J'aurais besoin d'un paiement en plusieurs fois. »"],
      ['M. DUBEC',"« Ce qui me plaît vraiment, c'est que tout se commande vocalement. Je n'ai plus besoin de toucher à quoi que ce soit en conduisant. »"],
      ['M. et Mme BOUR',"« Nous voulons être tranquilles. Le fait qu'il y ait une garantie de 3 ans est pour nous très rassurant. »"],
      ['M. et Mme NIVET',"« Nous adorons ce modèle : c'est celui qu'on voit partout sur les affiches et sur Instagram. »"],
      ['M. POYET',"« Je trouve cette couleur discrète et très belle. Elle me plaît vraiment. »"],
      ['Mme JOSSERAND',"« Ce qui me dérange avec les moteurs classiques, c'est qu'ils émettent trop de CO2. »"]].map(([n,t])=> new Paragraph({ children:[new TextRun({text:n+' : ',bold:true,size:20}), new TextRun({text:t,italics:true,size:20})], spacing:{after:100} })),

  H('Document 3 — Comment convaincre le client ? (méthode C.A.P.)'),
  P("À l'étape de l'argumentation, respectez la méthode C.A.P. : à chaque mobile d'achat, associez une Caractéristique du produit, l'Avantage qu'elle procure au client, puis la Preuve qui le démontre."),
  P("Exemple — Confort : Commande vocale du GPS / Pas besoin de réglages manuels / « Regardez comment je fais ! ». Argent : 99 € par mois / Un impact faible sur votre budget / Tableau de financement.", { i: true }),

  new Paragraph({ children: [new TextRun({ text: 'Mission 9 : ANNEXES', bold: true, size: 28, color: ROUGE })], spacing: { before: 240, after: 120 } }),
  H('Annexe 1 — Les mobiles d\'achat de la clientèle'),
  new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    headerRow(['Nom des clients', "Mobile d'achat", 'Justification']),
    ...['Mme CHEREL','M. DUBEC','M. et Mme BOUR','M. et Mme NIVET','M. POYET','Mme JOSSERAND'].map((n)=> new TableRow({ children:[cell(n,{width:26}), cell('',{width:24}), cell('',{width:50})] })),
  ] }),
  H('Annexe 2 — La construction d\'arguments pour convaincre la clientèle'),
  new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    headerRow(["Mobile d'achat",'Caractéristique','Avantage','Preuve']),
    ...[0,1,2].map(()=> new TableRow({ children:[cell('',{width:25}),cell('',{width:25}),cell('',{width:25}),cell('',{width:25})] })),
  ] }),
] }] })

// ---------------------------------------------------------------------------
// 3) CORRIGÉ
// ---------------------------------------------------------------------------
const corrige = new Document({ sections: [{ children: [
  new Paragraph({ children: [new TextRun({ text: 'Scénario MCV — PEUGEOT — CORRIGÉ', bold: true, size: 20, color: ROUGE })] }),
  new Paragraph({ children: [new TextRun({ text: "Mission 9 : Les mobiles d'achat et l'argumentation", bold: true, size: 30, color: VERT })], spacing: { after: 200 } }),

  H('Annexe 1 — Les mobiles d\'achat de la clientèle (corrigé)'),
  new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    headerRow(['Nom des clients', "Mobile d'achat", 'Justification']),
    ...[['Mme CHEREL','Argent','« Ne rentre pas dans mon budget »'],
        ['M. DUBEC','Confort','« Se commande vocalement »'],
        ['M. et Mme BOUR','Sécurité','« Garantie de 3 ans »'],
        ['M. et Mme NIVET','Nouveauté','« Le modèle qu\'on voit partout sur les affiches et sur Instagram »'],
        ['M. POYET','Sympathie','« Je trouve cette couleur discrète et très belle »'],
        ['Mme JOSSERAND','Environnement','« Ça émet trop de CO2 »']].map((r)=> new TableRow({ children:[cell(r[0],{width:26}),cell(r[1],{width:24,bold:true}),cell(r[2],{width:50})] })),
  ] }),

  H('Annexe 2 — La construction d\'arguments (corrigé, 3 mobiles au choix parmi 6)'),
  new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    headerRow(["Mobile d'achat",'Caractéristique','Avantage','Preuve']),
    ...[['Argent','Mettre un prix',"C'est dans son budget","Montrer le prix sur l'affichage"],
        ['Confort','Commande vocale',"Pas besoin d'utiliser ses mains, juste sa voix","Essayez de parler !"],
        ['Sécurité','Garantie 3 ans',"En cas de problème, vous n'aurez rien à payer","Regardez !"],
        ['Nouveauté','Modèle sorti cette année',"Elle possède plein de nouveautés","Regardez le catalogue !"],
        ['Sympathie','Couleur bleu nuit',"C'est une couleur qui vous plaira","Regardez !"],
        ['Environnement','Motorisation électrique ou hybride',"Émet peu, voire pas du tout de CO2","Électrique : 0 g/km ; Hybride : -120 g/km"]].map((r)=> new TableRow({ children:[cell(r[0],{width:22,bold:true}),cell(r[1],{width:24}),cell(r[2],{width:30}),cell(r[3],{width:24})] })),
  ] }),
] }] })

Promise.all([
  save(deroulement, '/mnt/user-data/outputs/PEUGEOT-M9-fiche-deroulement.docx'),
  save(eleve, '/mnt/user-data/outputs/PEUGEOT-M9-fiche-eleve.docx'),
  save(corrige, '/mnt/user-data/outputs/PEUGEOT-M9-corrige.docx'),
]).then(() => console.log('Tous les Word générés'))
