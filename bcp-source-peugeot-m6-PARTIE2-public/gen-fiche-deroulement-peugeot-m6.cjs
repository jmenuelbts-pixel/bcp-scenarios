// Fiche de deroulement pedagogique - Peugeot M6
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel } = require('docx')
const fs = require('fs')

const VERT = '00513B'
const GRIS = 'F2F2F2'

function cell(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.shading ? { fill: opts.shading } : undefined,
    children: (Array.isArray(text) ? text : [text]).map((t) =>
      new Paragraph({ children: [new TextRun({ text: t, bold: !!opts.bold, color: opts.color || '000000', size: opts.size || 20 })], alignment: opts.align || AlignmentType.LEFT })
    ),
  })
}

function headerRow(cols) {
  return new TableRow({ tableHeader: true, children: cols.map((c) => cell(c, { bold: true, color: 'FFFFFF', shading: VERT, align: AlignmentType.CENTER })) })
}

const doc = new Document({
  sections: [{
    properties: {},
    children: [
      new Paragraph({ children: [new TextRun({ text: 'Scénario MCV — PEUGEOT', bold: true, size: 20, color: VERT })] }),
      new Paragraph({ children: [new TextRun({ text: 'Fiche de déroulement — Mission 4 : La rémunération du commercial', bold: true, size: 30, color: VERT })], spacing: { after: 120 } }),
      new Paragraph({ children: [new TextRun({ text: 'Bac Pro Métiers du Commerce et de la Vente — Option B', italics: true, size: 20 })], spacing: { after: 200 } }),

      new Paragraph({ children: [new TextRun({ text: 'Compétence travaillée', bold: true, size: 24, color: VERT })], spacing: { before: 120, after: 80 } }),
      new Paragraph({ children: [new TextRun({ text: "C.1.1 — Rechercher, hiérarchiser et actualiser les informations sur l'entreprise et son marché.", size: 20 })], spacing: { after: 160 } }),

      new Paragraph({ children: [new TextRun({ text: 'Objectifs pédagogiques', bold: true, size: 24, color: VERT })], spacing: { before: 120, after: 80 } }),
      new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: "Décrire le métier de commercial automobile et ses missions.", size: 20 })] }),
      new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: "Identifier et expliquer les qualités attendues d'un bon commercial.", size: 20 })], spacing: { after: 160 } }),

      new Paragraph({ children: [new TextRun({ text: 'Contexte', bold: true, size: 24, color: VERT })], spacing: { before: 120, after: 80 } }),
      new Paragraph({ children: [new TextRun({ text: "Vous retrouvez Paul, votre tuteur, à un moment plus calme de la journée et il prend le temps de vous expliquer plus en détail son métier.", size: 20 })], spacing: { after: 200 } }),

      new Paragraph({ children: [new TextRun({ text: 'Déroulement de la séance', bold: true, size: 24, color: VERT })], spacing: { before: 120, after: 80 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          headerRow(['Phase', 'Durée', "Activité de l'élève", "Activité de l'enseignant", 'Supports']),
          new TableRow({ children: [
            cell('Lancement', { width: 14, bold: true, shading: GRIS }),
            cell('10 min', { width: 8, align: AlignmentType.CENTER }),
            cell("Prend connaissance du contexte et de l'entretien (lecture ou écoute vidéo).", { width: 30 }),
            cell('Présente la mission, rappelle le lien avec la PFMP, propose le choix lire/écouter.', { width: 30 }),
            cell('Document « Entretien avec votre tuteur » + vidéo', { width: 18 }),
          ] }),
          new TableRow({ children: [
            cell('Activité 1', { width: 14, bold: true, shading: GRIS }),
            cell('25 min', { width: 8, align: AlignmentType.CENTER }),
            cell("Complète la fiche métier : définition du vendeur automobile et ses missions (annexe 1).", { width: 30 }),
            cell("Circule, guide le repérage des missions dans le dialogue, remédie.", { width: 30 }),
            cell('Document + Annexe 1', { width: 18 }),
          ] }),
          new TableRow({ children: [
            cell('Activité 2', { width: 14, bold: true, shading: GRIS }),
            cell('30 min', { width: 8, align: AlignmentType.CENTER }),
            cell("Liste les qualités du bon commercial et les explique avec ses propres mots (annexe 2).", { width: 30 }),
            cell("Accompagne la reformulation, valide les explications, apporte le vocabulaire.", { width: 30 }),
            cell('Document + Annexe 2', { width: 18 }),
          ] }),
          new TableRow({ children: [
            cell('Synthèse', { width: 14, bold: true, shading: GRIS }),
            cell('15 min', { width: 8, align: AlignmentType.CENTER }),
            cell("Complète la carte de synthèse (3 missions, 4 qualités).", { width: 30 }),
            cell("Structure la trace écrite, institutionnalise les notions.", { width: 30 }),
            cell('Synthèse arborescente', { width: 18 }),
          ] }),
          new TableRow({ children: [
            cell('Évaluation', { width: 14, bold: true, shading: GRIS }),
            cell('20 min', { width: 8, align: AlignmentType.CENTER }),
            cell("Réalise les activités : glossaire, 10 flashcards, quiz (10 questions), glisser-déposer (10).", { width: 30 }),
            cell("Lance le quiz noté, relève les résultats, corrige collectivement.", { width: 30 }),
            cell('Activités interactives + AutomobileQuiz', { width: 18 }),
          ] }),
          new TableRow({ children: [
            cell('Auto-évaluation', { width: 14, bold: true, shading: GRIS }),
            cell('10 min', { width: 8, align: AlignmentType.CENTER }),
            cell("Se positionne (Insuffisant / Fragile / Satisfaisant / Maîtrisé).", { width: 30 }),
            cell("Recueille les auto-positionnements, prévoit la remédiation.", { width: 30 }),
            cell('Grille d\u2019auto-évaluation', { width: 18 }),
          ] }),
        ],
      }),
      new Paragraph({ children: [new TextRun({ text: 'Durée totale indicative : 1 h 50', italics: true, size: 20 })], spacing: { before: 160 } }),

      new Paragraph({ children: [new TextRun({ text: 'Modalités et différenciation', bold: true, size: 24, color: VERT })], spacing: { before: 200, after: 80 } }),
      new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: "Choix lecture ou écoute de l'entretien (bouton vidéo discret) pour les élèves à besoins particuliers.", size: 20 })] }),
      new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: "Travail individuel possible en autonomie sur l'application ; correction accessible côté enseignant.", size: 20 })] }),
      new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: 'Dépôt de la mission sur le DIGIPAD ; quiz accessible par lien ou QR code.', size: 20 })] }),
    ],
  }],
})

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync('/mnt/user-data/outputs/Fiche-deroulement-PEUGEOT-M6.docx', buf)
  console.log('Fiche de déroulement générée.')
})
