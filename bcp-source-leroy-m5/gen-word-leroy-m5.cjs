/* Generateur Word - Leroy Merlin - Mission 5 (vert #7AB51D) */
const fs = require('fs')
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, AlignmentType, ImageRun } = require('docx')

const VERT = '7AB51D'
const VERTF = 'EAF5DA'
const GRIS = '4B5563'
const OUT = '/mnt/user-data/outputs'
const DR = '/home/claude/bcp/public/docs/leroy-merlin-m5/'

function H(t, o = {}) { return new Paragraph({ spacing: { before: 220, after: 120 }, children: [new TextRun({ text: t, bold: true, size: o.size || 28, color: o.color || VERT })] }) }
function P(t, o = {}) { return new Paragraph({ spacing: { after: 100 }, alignment: o.align, children: [new TextRun({ text: t, size: o.size || 22, italics: !!o.it, bold: !!o.b, color: o.color })] }) }
function bullet(t) { return new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: t, size: 22 })] }) }
function cell(t, o = {}) {
  return new TableCell({
    width: o.width ? { size: o.width, type: WidthType.PERCENTAGE } : undefined,
    shading: o.head ? { type: ShadingType.SOLID, color: o.headColor || VERT } : (o.fill ? { type: ShadingType.SOLID, color: VERTF } : undefined),
    margins: { top: 50, bottom: 50, left: 70, right: 70 },
    children: String(t).split('\n').map((p) => new Paragraph({ spacing: { after: 10 }, alignment: o.align, children: [new TextRun({ text: p, bold: o.head || o.b, color: o.head ? 'FFFFFF' : o.color, size: o.size || 19 })] })),
  })
}
function tbl(rows, o = {}) { const b = { style: BorderStyle.SINGLE, size: 4, color: o.bc || 'C9D6E3' }; return new Table({ width: { size: o.w || 100, type: WidthType.PERCENTAGE }, borders: { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b }, rows }) }
function blank(n) { const o = []; for (let i = 0; i < n; i++) o.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'C9D6E3', space: 6 } }, spacing: { after: 160 }, children: [new TextRun('')] })); return o }
function bandeau(t) { return new Paragraph({ shading: { type: ShadingType.SOLID, color: VERT }, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: t, bold: true, color: 'FFFFFF', size: 24 })] }) }
function mailBox(de, a, objet, corps) {
  const rows = [
    new TableRow({ children: [new TableCell({ shading: { type: ShadingType.SOLID, color: 'F1F1F1' }, margins: { top: 50, bottom: 50, left: 90, right: 90 }, children: [new Paragraph({ children: [new TextRun({ text: 'Nouveau message            _    ?    X', bold: true, size: 20 })] })] })] }),
    new TableRow({ children: [cell('De : ' + de, { size: 19 })] }),
    new TableRow({ children: [cell('À : ' + a, { size: 19 })] }),
    new TableRow({ children: [cell('Objet : ' + objet, { b: true, size: 19 })] }),
    new TableRow({ children: [new TableCell({ margins: { top: 80, bottom: 80, left: 90, right: 90 }, children: corps.map((p) => new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: p, size: 20 })] })) })] }),
  ]
  return tbl(rows, { bc: 'C9D1D9' })
}

function entete() {
  return [
    P('Scénario Vente – LEROY MERLIN – Mission 5', { b: true, color: GRIS }),
    P('MENUEL – Professeur de vente', { it: true, color: GRIS, size: 20 }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 60 }, children: [new TextRun({ text: "Sélectionner le prestataire le plus adapté, suivre l'exécution du service et rendre compte", bold: true, size: 28, color: VERT })] }),
    P('Compétences travaillées :', { b: true }),
    bullet('C.2.2 – Mettre en œuvre le ou les service(s) associé(s)'),
    new Paragraph({ spacing: { before: 120, after: 120 }, children: [new TextRun({ text: 'NOM ET PRÉNOM :', bold: true, size: 22 }), new TextRun({ text: '                                                  Mission 5', size: 22 })] }),
    P("Avant de vous lancer dans la sélection de l'artisan qui installera le dressing chez les clients, vous étudiez les différents forfaits qui sont proposés par l'enseigne.", { it: true }),
  ]
}

function consignes() {
  return [
    H('Activité 1 – La sélection du prestataire le plus adapté'),
    P("1. Trois forfaits de pose sont proposés chez Leroy Merlin. Pour chacun d'eux, indiquez quels sont les détails de l'offre. (Consulter le document 1, compléter l'annexe 1)."),
    P("2. Relisez la Mission 2 annexe 5, puis indiquez parmi les 3 prestations laquelle choisir pour le montage et l'installation du dressing. Justifiez. (Consulter le document 1, compléter l'annexe 2)."),
    P("3. Retrouvez l'adresse des clients et écrivez-la. (Consulter la Mission 3 document 1, compléter l'annexe 3)."),
    P("4. À partir de l'adresse des clients, calculez la distance en voiture entre l'entreprise et le domicile des clients. (Consulter les documents 3a et 3b, compléter l'annexe 4)."),
    P("5. Identifiez l'artisan qui ira installer le dressing chez le couple. Justifiez en reprenant chaque critère. (Consulter le document 2, le document 3a et l'annexe 4, compléter l'annexe 5)."),
    H("Activité 2 – Suivre l'exécution du service et rendre compte"),
    P("6. Préparez votre appel téléphonique en utilisant la méthode CROC. (Consulter le document 4, compléter l'annexe 6)."),
    P("7. À partir de la réponse de Mme Sankouraga, faites un compte rendu par mail à votre responsable (annie.male@leroymerlin.fr). (Consulter le document 5, compléter l'annexe 7)."),
  ]
}

function forfaitCard(out, titre, prixLib, prix, img, details, conditions) {
  out.push(new Paragraph({ spacing: { before: 140, after: 40 }, children: [new TextRun({ text: titre, bold: true, size: 24, color: '1F2933' })] }))
  out.push(tbl([
    new TableRow({ children: [
      new TableCell({ width: { size: 38, type: WidthType.PERCENTAGE }, margins: { top: 60, bottom: 60, left: 80, right: 80 }, children: [
        new Paragraph({ children: [new ImageRun({ data: fs.readFileSync(DR + img), transformation: { width: 200, height: 140 } })] }),
        new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: prixLib + ' ', size: 18, color: GRIS }), new TextRun({ text: prix, bold: true, size: 24, color: VERT })] }),
      ] }),
      new TableCell({ width: { size: 62, type: WidthType.PERCENTAGE }, margins: { top: 60, bottom: 60, left: 80, right: 80 }, children: [
        new Paragraph({ children: [new TextRun({ text: "L'offre comprend :", bold: true, size: 20 })] }),
        ...details.map((d) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 20 }, children: [new TextRun({ text: d, size: 19 })] })),
        new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: "Conditions d'application :", bold: true, size: 20 })] }),
        ...conditions.map((c) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 20 }, children: [new TextRun({ text: c, size: 19 })] })),
      ] }),
    ] }),
  ]))
}

function documents() {
  const out = [bandeau('Mission 5 : DOCUMENTS')]
  out.push(H('Document 1 – Forfaits installation Leroy Merlin'))
  forfaitCard(out, 'Installation de portes de placard coulissantes', 'À partir de', '229.00 € / Prestation', 'forfait1.jpg',
    ["La dépose et la mise en déchetterie des éventuelles anciennes portes", 'La fixation des rails', "L'installation et le réglage des deux vantaux", 'La découpe de plinthes en bois si nécessaire', "En option : Pose d'un vantail supplémentaire +49€", "En option : Pose d'une joue pour création d'une niche +85€", 'En option : Découpe de vos portes de placard standards recoupables (hors miroir) +70€'],
    ['Le lieu de pose sera accessible et dégagé', "Les dimensions de l'ouverture sont adaptées aux nouveaux vantaux"])
  forfaitCard(out, "Montage d'un rangement Spaceo Home jusqu'à 4 caissons", "L'installation :", '149.00 €', 'forfait2.jpg',
    ['Le montage des caissons et de leurs tablettes uniquement'],
    ["Le lieu d'entretien sera accessible et dégagé", 'Le montage concernera les caissons Spaceo Home'])
  forfaitCard(out, 'Installation et aménagement de rangement Spaceo Home, 4 caissons et accessoires', "L'installation :", '289.00 € / Prestation', 'forfait3.jpg',
    ["L'installation des caissons, tablettes, accessoires, portes, tiroirs, aménagements intérieurs, découpes sur plinthes bois", "L'installation des éclairages éventuels (sur alimentation électrique existante à moins d'1 mètre de l'installation), la fixation au mur"],
    ['Le lieu de pose sera accessible et dégagé', "Les revêtements de mur et de sol ne nécessitent pas d'être repris."])

  out.push(H("Document 2 – Critères de sélection de l'artisan"))
  out.push(mailBox('annie.male@leroymerlin.fr', 'conseillers.vente@leroymerlin.fr', 'Sélectionner le meilleur artisan pour la pose de matériel', [
    'Bonjour,', "Pour vous aider à sélectionner le meilleur artisan pour la pose des articles achetés par nos clients, vous respecterez les critères suivants :",
    "- Pour des raisons environnementales, l'artisan devra se trouver à 10km maximum du domicile du client ;",
    "- L'artisan devra évidemment être disponible pour l'installation le lendemain du jour de la livraison ;",
    "- L'artisan devra être spécialisé dans l'installation de rangement et de dressings ;",
    '- Le coût de la prestation devra être inférieur ou égal à celui annoncé sur le site Leroy Merlin ;',
    "- L'équipe de l'artisan doit être constituée de deux professionnels minimums pour la pose ;",
    "- L'équipe doit être disponible pendant 4h pour effectuer la prestation.", 'Cordialement,', 'Annie Mâle, Responsable',
  ]))

  out.push(H('Document 3a – Extrait de la liste des artisans travaillant avec Leroy Merlin'))
  const head = ['Entreprises', 'Localisation', 'Indisponibilités (mai)', 'Services', 'Nb pros', 'Heures', 'Coût', 'Remarques']
  const arts = [
    ["Install'Tout André", '12 rue Solférino, 92 Vanves', '2-7-12-22-27-16/05', 'Rangements/Dressing', '2', '4', '71,25€/h', 'R.A.S.*'],
    ['Établissements Gaudriche', '25 av. de Lamballe, 75016 Paris', '5-9-11-23-28-30/05', 'Plombier/Chauffagiste', '2', '4', '73,00€/h', 'Utilitaire en réparation'],
    ['Akus Installation', '4 rue Michelet, 92150 Suresnes', '4-6-12-21-27-17/05', 'Rangements/Dressing', '3', '4', '79,25€/h', 'R.A.S.*'],
    ['CycloInstallation', '20 rue Rambuteau, 75003 Paris', '2-9-13-18-25-28/05', 'Rangements/Dressing', '2', '4', '71,50€/h', 'R.A.S.*'],
    ['Entreprise Sanchez', '13 av. Jean Moulin, 75014 Paris', '3-4-9-11-15-16/05', 'Portes et fenêtres', '4', '4', '72,25€/h', 'R.A.S.*'],
    ['Les Installateurs du 92', '41 rue Armengaud, 92110 Saint-Cloud', '7-8-9-10-11-15/05', 'Rangements/Dressing', '1', '4', '68.00€/h', 'R.A.S.*'],
    ['Atelier Carlier', '22 rue Bonnelais, 94140 Clamart', '11-13-17-27-28-30/05', 'Climatisation', '2', '4', '55,00€/h', 'R.A.S.*'],
    ["Les artisans de l'Installation", '33 rue Blanche, 75009 Paris', '2-7-12-22-27-16/05', 'Rangements/Dressing', '2', '4', '72,25€/h', 'Salarié en arrêt maladie'],
    ['Installateurs 2000', '7 rue Jules Ferry, 94200 Ivry sur Seine', '2-7-16-22-26-28/05', 'Rangements/Dressing', '3', '4', '72,25€/h', 'R.A.S.*'],
    ['Établissements FGT', '15 rue Danton, 93100 Montreuil', '4-6-14-18-25-30/05', 'Rénovation/Menuiserie', '2', '4', '72,25€/h', 'R.A.S.*'],
    ['Entreprise Lecomte', '22 rue Parmentier, 92200 Neuilly', '3-7-14-17-27-29/05', 'Rangements/Dressing', '2', '4', '70,25€/h', 'R.A.S.*'],
    ['Les Installateurs Parisiens', '25 rue Chanzy, 75011 Paris', '2-9-12-20-26-29/05', 'Rangements/Dressing', '1', '4', '69,25€/h', 'R.A.S.*'],
  ]
  out.push(tbl([new TableRow({ children: head.map((h) => cell(h, { head: true, size: 16 })) }), ...arts.map((r) => new TableRow({ children: r.map((c) => cell(c, { size: 16 })) }))]))
  out.push(P('R.A.S.* = Rien à signaler = Aucune remarque à faire', { it: true, size: 18 }))
  out.push(P('3b – Calcul de la distance avec Google Maps : ouvrez Google Maps pour calculer la distance en voiture entre l\'entreprise et le domicile des clients.', { b: true }))

  out.push(H('Document 4 – La méthode C.R.O.C.'))
  out.push(P("En émission d'appel, utilisez le CROC. Lorsque vous appelez un client ou un prospect, vous appliquerez pendant l'appel la méthode CROC.", { it: true }))
  out.push(tbl([
    new TableRow({ children: [cell('CROC', { head: true, width: 22 }), cell('Éléments de communication', { head: true, width: 78 })] }),
    new TableRow({ children: [cell('Contact', { fill: true, b: true }), cell("Saluer, se présenter, présenter l'entreprise, demander l'interlocuteur désiré")] }),
    new TableRow({ children: [cell("Raison d'appel", { fill: true, b: true }), cell('Dire le motif pour lequel vous appelez le client')] }),
    new TableRow({ children: [cell('Objectif', { fill: true, b: true }), cell('Ce que le commercial veut obtenir : une information, un rendez-vous, une vente…')] }),
    new TableRow({ children: [cell('Conclusion', { fill: true, b: true }), cell("Reformuler ce qui a été dit pendant l'objectif. Prendre congé : remercier, saluer et raccrocher après l'interlocuteur")] }),
  ]))

  out.push(H('Document 5 – La réponse de Mme Sankouraga'))
  out.push(mailBox('r.sankouraga@gmail.com', 'conseillerdeventestagiaire@leroymerlin.fr', 'Réponse à votre appel', [
    'Bonjour,', "J'ai bien reçu votre appel sur mon portable il y a quelques jours, mais comme nous vous l'avions dit le jour où nous nous sommes rencontrés, nous sommes partis en vacances pour quelques semaines.",
    "Concernant votre question sur l'installation de notre dressing, globalement, tout s'est bien passé mais je comptais tout de même vous contacter à mon retour pour vous exposer deux problèmes.",
    "Premièrement, l'équipe de montage est arrivée avec 1h30 de retard ce qui a été problématique car j'avais un rendez-vous après que j'ai dû annuler. Enfin, l'une des portes du dressing n'a pas été correctement montée puisque le soir même en la manipulant, la charnière du haut s'est décrochée. C'est mon mari qui a été obligé de tout remettre (v. photo).",
    "Pour autant, je vous remercie d'avoir pris de nos nouvelles.", 'Cordialement,', 'Rebecca Sankouraga',
  ]))
  return out
}

function annexesEleve() {
  const out = [bandeau('Mission 5 : ANNEXES')]
  out.push(H('Annexe 1 – Les détails des prestations'))
  out.push(tbl([new TableRow({ children: [cell('Nom de la prestation', { head: true, width: 24 }), cell('Détails de la prestation', { head: true, width: 46 }), cell("Conditions d'application", { head: true, width: 30 })] }),
    ...[0, 1, 2].map(() => new TableRow({ children: [cell('\n\n'), cell('\n\n\n\n'), cell('\n\n\n')] }))]))
  out.push(H('Annexe 2 – La prestation retenue'))
  out.push(tbl([new TableRow({ children: [cell('Nom de la prestation', { head: true, width: 40 }), cell('Justification', { head: true, width: 60 })] }), new TableRow({ children: [cell('\n\n'), cell('\n\n\n')] })]))
  out.push(H("Annexe 3 – L'adresse de Mme et M. Sankouraga"))
  out.push(...blank(2))
  out.push(H("Annexe 4 – La distance en km entre l'entreprise et le domicile du couple"))
  const pairs = [["Install'Tout André", 'Atelier Carlier'], ['Établissements Gaudriche', "Les artisans de l'Installation"], ['Akus Installation', 'Installateurs 2000'], ['CycloInstallation', 'Établissements FGT'], ['Entreprise Sanchez', 'Entreprise Lecomte'], ['Les Installateurs du 92', 'Les Installateurs Parisiens']]
  out.push(tbl([new TableRow({ children: [cell('Entreprises', { head: true, width: 30 }), cell('Distance (km)', { head: true, width: 20 }), cell('Entreprises', { head: true, width: 30 }), cell('Distance (km)', { head: true, width: 20 })] }),
    ...pairs.map((p) => new TableRow({ children: [cell(p[0], { fill: true, b: true }), cell(''), cell(p[1], { fill: true, b: true }), cell('')] }))]))
  out.push(H("Annexe 5 – L'artisan retenu"))
  const crit = ["Nom de l'artisan retenu", 'Critère 1 : La distance (10 km maximum)', "Critère 2 : La disponibilité de l'artisan", "Critère 3 : La spécialisation de l'artisan", 'Critère 4 : Le coût de la prestation', 'Critère 5 : Le nombre de professionnels pour la pose', 'Critère 6 : Le temps de pose (4h)']
  out.push(tbl([new TableRow({ children: [cell('Critère', { head: true, width: 40 }), cell('Justification', { head: true, width: 60 })] }), ...crit.map((c) => new TableRow({ children: [cell(c, { fill: true, b: true }), cell('\n')] }))]))
  out.push(H("Annexe 6 – Fiche d'appel CROC"))
  out.push(P('FICHE D\'APPEL', { b: true }))
  ;['CONTACT', "RAISON D'APPEL", 'OBJECTIF', 'CONCLUSION'].forEach((s) => { out.push(P(s + ' :', { b: true, color: VERT })); out.push(...blank(s === 'CONCLUSION' ? 3 : 2)) })
  out.push(H('Annexe 7 – Compte rendu par mail'))
  out.push(mailBox('________________________', '________________________', '________________________', ['', '', '', '', '']))
  return out
}

function annexesCorrige() {
  const out = [bandeau('Mission 5 : ANNEXES (CORRIGÉ)')]
  out.push(H('Annexe 1 – Les détails des prestations'))
  out.push(tbl([
    new TableRow({ children: [cell('Nom de la prestation', { head: true, width: 24 }), cell('Détails de la prestation', { head: true, width: 46 }), cell("Conditions d'application", { head: true, width: 30 })] }),
    new TableRow({ children: [cell('Installation de portes de placard coulissantes', { fill: true, b: true }), cell("Dépose et mise en déchetterie des anciennes portes ; fixation des rails ; installation et réglage des deux vantaux ; découpe de plinthes en bois si nécessaire (+ options)."), cell("Le lieu de pose sera accessible et dégagé ; les dimensions de l'ouverture sont adaptées aux nouveaux vantaux.")] }),
    new TableRow({ children: [cell("Montage d'un rangement Spaceo Home jusqu'à 4 caissons", { fill: true, b: true }), cell('Le montage des caissons et de leurs tablettes uniquement.'), cell("Le lieu de pose sera accessible et dégagé ; le montage concernera les caissons Spaceo Home.")] }),
    new TableRow({ children: [cell('Installation et aménagement de rangement Spaceo Home, 4 caissons et accessoires', { fill: true, b: true }), cell("Installation des caissons, tablettes, accessoires, portes, tiroirs, aménagements intérieurs, découpes sur plinthes bois ; installation des éclairages éventuels, fixation au mur."), cell("Le lieu de pose sera accessible et dégagé ; les revêtements de mur et de sol ne nécessitent pas d'être repris.")] }),
  ]))
  out.push(H('Annexe 2 – La prestation retenue'))
  out.push(tbl([new TableRow({ children: [cell('Nom de la prestation', { head: true, width: 40 }), cell('Justification', { head: true, width: 60 })] }),
    new TableRow({ children: [cell('Installation et aménagement de rangement Spaceo Home, 4 caissons et accessoires', { fill: true, b: true }), cell('Cette prestation comprend le montage du dressing, des tiroirs, des portes et des accessoires contrairement aux 2 autres.')] })]))
  out.push(H("Annexe 3 – L'adresse de Mme et M. Sankouraga"))
  out.push(P('15 rue Dombasle, 75015 Paris.', { it: true }))
  out.push(H("Annexe 4 – La distance en km entre l'entreprise et le domicile du couple"))
  const dist = [["Install'Tout André", '2,1 km', 'Atelier Carlier', '5,3 km'], ['Établissements Gaudriche', '3,2 km', "Les artisans de l'Installation", '7,1 km'], ['Akus Installation', '9 km', 'Installateurs 2000', '8,2 km'], ['CycloInstallation', '6 km', 'Établissements FGT', '19 km'], ['Entreprise Sanchez', '4,2 km', 'Entreprise Lecomte', '1,5 km'], ['Les Installateurs du 92', '7,5 km', 'Les Installateurs Parisiens', '7,6 km']]
  out.push(tbl([new TableRow({ children: [cell('Entreprises', { head: true, width: 30 }), cell('Distance', { head: true, width: 20 }), cell('Entreprises', { head: true, width: 30 }), cell('Distance', { head: true, width: 20 })] }), ...dist.map((r) => new TableRow({ children: [cell(r[0], { fill: true, b: true }), cell(r[1], { align: AlignmentType.CENTER }), cell(r[2], { fill: true, b: true }), cell(r[3], { align: AlignmentType.CENTER })] }))]))
  out.push(H("Annexe 5 – L'artisan retenu"))
  out.push(tbl([
    new TableRow({ children: [cell("Nom de l'artisan retenu", { head: true, width: 40 }), cell('Installateurs 2000', { b: true })] }),
    new TableRow({ children: [cell('Distance (10 km max)', { fill: true, b: true }), cell('Situé à 8,2 km')] }),
    new TableRow({ children: [cell('Disponibilité (le 18/05)', { fill: true, b: true }), cell("Rien dans son planning le 18/05")] }),
    new TableRow({ children: [cell('Spécialisation', { fill: true, b: true }), cell('Spécialisé dans le rangement/dressing')] }),
    new TableRow({ children: [cell('Coût (≤ prix du site)', { fill: true, b: true }), cell('72,25 €/h × 4h = 289 € (égal au prix annoncé sur le site Leroy Merlin)')] }),
    new TableRow({ children: [cell('Nombre de professionnels (2 min)', { fill: true, b: true }), cell("L'équipe est constituée de 3 professionnels")] }),
    new TableRow({ children: [cell('Temps de pose (4h)', { fill: true, b: true }), cell("L'équipe est disponible 4h")] }),
  ]))
  out.push(H("Annexe 6 – Fiche d'appel CROC"))
  out.push(P('CONTACT :', { b: true, color: VERT })); out.push(P("Bonjour, M. X de l'entreprise Leroy Merlin, c'est bien Mme Sankouraga ?", { it: true }))
  out.push(P("RAISON D'APPEL :", { b: true, color: VERT })); out.push(P('Je vous appelle par rapport au dressing qui vous a été livré et installé il y a quelques jours.', { it: true }))
  out.push(P('OBJECTIF :', { b: true, color: VERT })); out.push(P("Je souhaiterais savoir si tout s'est bien passé lors de la pose de votre dressing.", { it: true }))
  out.push(P('CONCLUSION :', { b: true, color: VERT })); out.push(P("Reformuler (selon ce qu'a dit la cliente). Je vous remercie Mme Sankouraga d'avoir répondu à mes questions. Je vous souhaite une très bonne journée. Au revoir !", { it: true }))
  out.push(H('Annexe 7 – Compte rendu par mail'))
  out.push(mailBox('conseillerdeventestagiaire@leroymerlin.fr', 'annie.male@leroymerlin.fr', "Compte rendu de l'appel à Mme Sankouraga", [
    'Bonjour Madame Mâle,', "Comme convenu, j'ai contacté il y a quelques jours Mme Sankouraga pour savoir comment s'était déroulée la pose de son dressing. Je n'ai pas réussi à la joindre directement car elle est en vacances à l'étranger, donc je lui ai laissé un message.",
    "Elle m'a répondu par mail. Dans son message, elle explique que si globalement tout s'est bien passé, elle a rencontré deux problèmes :",
    "Tout d'abord, l'équipe de montage est arrivée avec 1h30 de retard, ce qui a été problématique car elle avait un rendez-vous après qu'elle a dû annuler.",
    "Enfin, l'une des portes du dressing n'a pas été correctement montée puisque le soir même, en la manipulant, la charnière du haut s'est décrochée. C'est son mari qui a été obligé de tout remettre.",
    'Cordialement,', 'Conseiller de vente',
  ]))
  return out
}

function syntheseAuto() {
  return [
    bandeau('Mission 5 : SYNTHÈSE'),
    P("Mettre en œuvre le service associé", { b: true }),
    bullet('La sélection du prestataire : distance, disponibilité, spécialisation, coût, nombre de pros, temps de pose'),
    bullet("Suivre l'exécution par téléphone – La méthode C.R.O.C. : Contact / Raison d'appel / Objectif / Conclusion"),
    bullet("Le Contact comprend : Saluer / Se présenter / Présenter l'entreprise / Vérifier l'interlocuteur"),
    bullet('Rendre compte par e-mail : expéditeur, personnalisation, fonction, mentions obligatoires'),
    bandeau('Mission 5 : AUTO-ÉVALUATION'),
    P('Évaluez votre compréhension des exercices de la mission 5 ainsi que votre niveau de difficulté pour le réaliser.'),
    tbl([
      new TableRow({ children: [cell('Insuffisant', { head: true, width: 25 }), cell('Fragile', { head: true, width: 25 }), cell('Satisfaisant', { head: true, width: 25 }), cell('Maîtrisé', { head: true, width: 25 })] }),
      new TableRow({ children: [cell(''), cell(''), cell(''), cell('')] }),
    ]),
  ]
}

async function build(corrige) {
  const children = [...entete(), ...consignes(), ...documents()]
  children.push(...(corrige ? annexesCorrige() : annexesEleve()))
  children.push(...syntheseAuto())
  const doc = new Document({ styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } }, sections: [{ properties: { page: { size: { orientation: 'landscape' }, margin: { top: 600, bottom: 600, left: 600, right: 600 } } }, children }] })
  const buf = await Packer.toBuffer(doc)
  const name = corrige ? 'Corrige - LEROY MERLIN - M5.docx' : 'LEROY MERLIN - M5.docx'
  fs.writeFileSync(`${OUT}/${name}`, buf)
  console.log('OK', name)
}

;(async () => { await build(false); await build(true) })()
