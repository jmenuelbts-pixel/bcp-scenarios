/* Generateur Word - Leroy Merlin - Mission 3 (vert #7AB51D) */
const fs = require('fs')
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, ImageRun } = require('docx')

const VERT = '7AB51D'
const VERTF = 'EAF5DA'
const GRIS = '4B5563'
const OUT = '/mnt/user-data/outputs'

function H(t, o = {}) { return new Paragraph({ spacing: { before: 220, after: 120 }, children: [new TextRun({ text: t, bold: true, size: o.size || 28, color: o.color || VERT })] }) }
function P(t, o = {}) { return new Paragraph({ spacing: { after: 100 }, alignment: o.align, children: [new TextRun({ text: t, size: o.size || 22, italics: !!o.it, bold: !!o.b, color: o.color })] }) }
function bullet(t) { return new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: t, size: 22 })] }) }
function cell(t, o = {}) {
  return new TableCell({
    width: o.width ? { size: o.width, type: WidthType.PERCENTAGE } : undefined,
    shading: o.head ? { type: ShadingType.SOLID, color: VERT } : (o.fill ? { type: ShadingType.SOLID, color: VERTF } : undefined),
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    children: String(t).split('\n').map((p) => new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: p, bold: o.head || o.b, color: o.head ? 'FFFFFF' : undefined, size: 21 })] })),
  })
}
function tbl(rows) { const b = { style: BorderStyle.SINGLE, size: 4, color: 'C9D6E3' }; return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b }, rows }) }
function blank(n) { const o = []; for (let i = 0; i < n; i++) o.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'C9D6E3', space: 6 } }, spacing: { after: 160 }, children: [new TextRun('')] })); return o }
function bandeau(t) { return new Paragraph({ shading: { type: ShadingType.SOLID, color: VERT }, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: t, bold: true, color: 'FFFFFF', size: 24 })] }) }

function entete() {
  return [
    P('Scénario Vente – LEROY MERLIN – Mission 3', { b: true, color: GRIS }),
    P('MENUEL – Professeur de vente', { it: true, color: GRIS, size: 20 }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 60 }, children: [new TextRun({ text: "S'assurer de la disponibilité du produit et faire de la vente additionnelle", bold: true, size: 30, color: VERT })] }),
    P('Compétences travaillées :', { b: true }),
    bullet('C.1.2 – Réaliser la vente dans un cadre omnicanal'),
    new Paragraph({ spacing: { before: 120, after: 120 }, children: [new TextRun({ text: 'NOM ET PRÉNOM :', bold: true, size: 22 }), new TextRun({ text: '                                                  Mission 3', size: 22 })] }),
    P('Le couple est conquis par votre proposition de dressing. Après avoir vérifié que le produit est bien disponible, vous en profiterez pour faire une vente additionnelle.', { it: true }),
  ]
}

function consignes() {
  return [
    H('Activité 1 – La disponibilité du produit et la fiche client'),
    P("1. Consultez le logiciel de l'entreprise afin de pouvoir indiquer au couple si le dressing qu'il a choisi est en stock. (Compléter les annexes 1a et 1b)."),
    P("2. Afin de pouvoir lancer la commande du dressing, complétez la fiche client à l'aide des réponses données par le couple. (Consulter le document 1, compléter l'annexe 2)."),
    H('Activité 2 – Vente additionnelle : différencier la vente complémentaire et la vente supplémentaire'),
    P('3. Répondez aux questions de votre tutrice. (Consulter le document 2, compléter l\'annexe 3).'),
    P("4. Donnez des exemples de produits complémentaires ou supplémentaires possibles en fonction du produit principal proposé. (Compléter l'annexe 4)."),
    P("5. Retrouvez quel est le produit principal en fonction des exemples de produits complémentaire ou supplémentaire indiqué. (Compléter l'annexe 5)."),
    H('Activité 3 – Les notions de « up-selling » et de « down-selling »'),
    P("Après votre travail concluant sur la vente additionnelle, votre tutrice vous explique ce que sont les techniques de « up-selling » et de « down-selling ».", { it: true }),
    P('6. Analysez les notions de « up et de down selling » en répondant aux questions. (Consulter le document 3, compléter l\'annexe 6).'),
    P("7. Indiquez le produit en « up-selling » que vous pourriez proposer au couple ; justifiez votre réponse. (Consulter le document 4, compléter l'annexe 7)."),
    H("Activité 4 – La proposition d'un produit additionnel"),
    P("8. Relisez la Mission 2, document 1 et retrouvez la phrase énoncée par le couple qui peut faire l'objet d'une vente additionnelle. (Compléter l'annexe 8)."),
    P("9. Indiquez le bien ou le service que vous proposerez au couple ainsi que le prix de ce dernier. (Consulter le document 5, compléter l'annexe 9)."),
  ]
}

function documents() {
  const out = [bandeau('Mission 3 : DOCUMENTS')]
  out.push(H('Document 1 – Coordonnées du couple'))
  out.push(tbl([
    new TableRow({ children: [cell('Coordonnées', { head: true, width: 28 }), cell('', { head: true, width: 72 })] }),
    ...[['Civilité', 'Mme Rebecca Sankouraga'], ['Adresse', '7 rue Dombasle, 75015 Paris'], ['Fixe', '01.02.03.04.XX'], ['Portable', '07.06.05.04.XX'], ['Email', 'r.sankouraga@gmail.com'], ['Installation', "On doit être installé avant le 22 mai, car on part pendant 1 mois en vacances."], ['Avoirs versés', '30% du montant total : 447,86 €']].map((r) => new TableRow({ children: [cell(r[0], { fill: true, b: true }), cell(r[1])] })),
  ]))

  out.push(H("Document 2 – La vente additionnelle pour booster le chiffre d'affaires"))
  out.push(P("La vente additionnelle ou cross-selling, consiste à vendre un produit complémentaire ou supplémentaire (= en plus) à celui initialement acheté ou voulu par le client. La vente additionnelle peut être prise en charge par un vendeur / conseiller / commercial, se faire en magasin ou être provoquée par un système de recommandation produit en e-commerce."))
  out.push(P('Il existe deux formes de vente additionnelle.'))
  out.push(P("La première qu'on appelle la vente complémentaire ou vente croisée, correspond au cas où le produit vendu en plus est un accessoire ou service lié au produit principal acheté. Il s'agit par exemple d'un tube de cirage vendu avec une paire de chaussures ou de la cravate vendue avec une chemise ou encore des extensions de garanties vendues dans le domaine de l'électro-ménager."))
  out.push(P("La deuxième forme de vente additionnelle est la vente supplémentaire. Elle consiste simplement à profiter de la présence du client pour lui proposer un autre produit qui n'est pas forcément lié au premier. Un conseiller bancaire peut par exemple vendre une carte bleue à un client venu souscrire un livret d'épargne (dans ce cas, la carte bleue n'a rien à voir avec le livret que le client est venu ouvrir)."))
  out.push(P("Dans certains domaines d'activités, les ventes additionnelles peuvent représenter un CA ou une marge particulièrement importante."))

  out.push(H("Document 3 – Le up-selling et le down-selling, qu'est-ce que c'est ? : Les explications de votre tutrice"))
  ;["« L'up-sell ou upselling est une technique qui consiste à proposer au client un autre produit que celui qu'il avait initialement choisi.", "Généralement le commercial lui proposera un article plus cher et meilleur en gamme que ce dernier. C'est comme cela que le commercial augmentera sa marge bénéficiaire.", "Même si votre client n'avait pas l'intention d'acquérir un produit, le fait de lui faire la proposition lui insuffle un intérêt certain.", "En pratique, le client est venu acheter un smartphone sorti l'année d'avant, et vous essayez en tant que conseiller de lui vendre le smartphone le plus récent, donc plus cher, en lui indiquant toutes les nouvelles fonctionnalités de celui-ci par rapport à l'ancien.", "C'est un perfectionnement de l'expérience d'achat pour vos clients. L'avantage est multiple car vous augmentez vos ventes et bénéfices, en plus de bénéficier de recommandations de la part de vos clients sur la base de leur satisfaction.", "Le down-sell ou downselling consiste, par opposition à l'up-sell, à proposer à votre client un produit moins chère suite à son refus d'acheter le produit que vous lui avez proposé.", "À noter que le produit proposé peut être moins cher, mais que pour autant le commerçant fera tout de même une marge bénéficiaire important sur ce produit.", "Exemple, vous pouvez proposer des baskets moins chers que celles que le client a refusé, à cause de son prix. Ou, à la place d'une paire de baskets, vous pourriez lui proposer une paire de tennis moins chère.", "Dans le cadre d'une boutique en ligne par exemple, cela consistera à faire afficher une offre moins chère, si l'internaute défile sur un premier produit. »"].forEach((p) => out.push(P(p, { it: true })))

  out.push(H('Document 4 – Les autres dressings disponibles chez Leroy Merlin'))
  const DR = '/home/claude/bcp/public/docs/leroy-merlin-m3/'
  const dressings = [
    ['Dressing blanc semi-fermé', 'dr-blanc.jpg', '1490,86 €', '83013039', 'H 200cm – L 240cm – P 45 cm'],
    ['Armoire dressing semi-fermé', 'dr-armoire.jpg', '1580,66 €', '83299656', 'H 200cm – L 220cm – P 45 cm'],
    ['Dressing chêne / miroir semi-fermé', 'dr-chene-miroir.jpg', '1539,29 €', '83299673', 'H 200cm – L 120cm – P 45 cm'],
    ['Dressing semi-fermé avec lumière', 'dr-lumiere.jpg', '1586,66 €', '83013042', 'H 200cm – L 240cm – P 45 cm'],
    ['Dressing', 'dr-dressing.jpg', '1510,29 €', '83299639', 'H 190cm – L 240cm – P 45 cm'],
    ['Armoire dressing ouvert', 'dr-ouvert.jpg', '1219,28 €', '83013039', 'H 200cm – L 120cm – P 45 cm'],
  ]
  const imgCell = (d) => new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE }, margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [
      new Paragraph({ spacing: { after: 60 }, children: [new ImageRun({ data: fs.readFileSync(DR + d[1]), transformation: { width: 200, height: 200 } })] }),
      new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: d[0], bold: true, size: 22, color: VERT })] }),
      new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: d[4], size: 20 })] }),
      new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: d[2] + '  —  Réf : ' + d[3], bold: true, size: 21, color: '3A7DBF' })] }),
      new Paragraph({ children: [new TextRun({ text: 'Coloris : anthracite (gris) – blanc – couleur chêne', size: 18, color: GRIS })] }),
    ],
  })
  out.push(tbl([
    new TableRow({ children: [imgCell(dressings[0]), imgCell(dressings[1])] }),
    new TableRow({ children: [imgCell(dressings[2]), imgCell(dressings[3])] }),
    new TableRow({ children: [imgCell(dressings[4]), imgCell(dressings[5])] }),
  ]))
  out.push(P('* H = Hauteur  L = Largeur  P = Profondeur', { it: true, size: 20 }))

  out.push(H('Document 5 – Les biens ou services proposés pour faire une vente additionnelle'))
  out.push(P('Les services Leroy Merlin', { b: true }))
  out.push(tbl([
    new TableRow({ children: [cell('Libellé', { head: true, width: 55 }), cell('Prix', { head: true, width: 45 })] }),
    ...[['SERVICE CLIENT — Dépannage', 'Entre 199.00 € et 198.00 €'], ['Service après-vente', 'Selon appareil sous garantie ou non'], ['Entretien de produits motorisés de jardin', 'Selon la panne détectée'], ['Financement', 'Une solution vous sera proposée par téléphone'], ['Retrait et mode de livraison', 'Petit colis à partir de 6,90€ - Gros colis à partir de 99,90€ - Très gros colis à partir de 119,90€'], ["Rachat de produits d'occasion", 'Valeur en carte cadeau'], ['Retour et remboursement', 'Voir conditions générales'], ["LOCATION — Location d'utilitaire", 'À partir de 19.00 € / heure'], ['Location de matériel', 'Entre 10.00 € et 75.00 € / jour selon le matériel'], ['POSE ET INSTALLATION À DOMICILE — Chauffage', 'À partir de 149.00 € / prestation'], ['Climatisation / aération', 'À partir de 119.00 €'], ['Cuisine', 'À partir de 129.00 €'], ['Electronique', 'À partir de 169.00 €'], ['Extérieur', 'À partir de 339.00 €'], ['Plomberie', 'À partir de 129.00 €'], ['Portes / fenêtre', 'À partir de 189.00 €'], ['Rangement / Dressing', 'À partir de 149.00 €'], ['Rénovation / menuiserie', 'À partir de 129.00 €'], ['Salle de bains', 'À partir de 135.00 €'], ['Sol', 'À partir de 16.00 € / m2']].map((r) => new TableRow({ children: [cell(r[0]), cell(r[1])] })),
  ]))
  out.push(P('Les biens Leroy Merlin — Accessoires intérieurs de dressing', { b: true }))
  out.push(tbl([
    new TableRow({ children: [cell('Référence', { head: true, width: 16 }), cell('Libellé', { head: true, width: 44 }), cell('Taille', { head: true, width: 25 }), cell('Prix', { head: true, width: 15 })] }),
    ...[['82336923', 'Panier à suspendre SPACEO Noir', 'H.12 x l.36 x P.26 cm', '4.99 €'], ['82336904', 'Porte-pantalons SPACEO Noir 9 pantalons ss tab', 'H.8.5 x l.34.5 x P.41 cm', '26.90 €'], ['82336914', 'Barre de penderie escamotable et extensible noir Spaceo', 'H.84 x l.100 x P.14 cm', '45.90 €'], ['82336921', 'Panier latéral coulissant SPACEO Noir', 'H.15 x l.20.5 x P.40.2 cm', '19.90 €'], ['82336908', 'Porte-pantalons SPACEO Noir 13 pantalons', 'H.5 x l.76.8 x P.41 cm', '36.90 €'], ['82336909', 'Porte-pantalons SPACEO Noir 13 à 26 pantalons', 'H.5 x l.76.8 x P.56 cm', '41.90 €'], ['82336913', 'Support cintres rabattable SPACEO noir 10 cintres', 'H.7.5 x l.43 x P.7.2 cm', '19.90 €'], ['85202820', 'Elévateur De Penderie Acier - Boîtier Argent', '690-920 Mm', '48.35 €'], ['83356854', 'Porte-parapluie Tetris Acier Noir Vidaxl', '---', '63.99 €'], ['82704672', 'Lot de 2 support de barre de penderie ovale chrome', 'D30 x 15 mm — 18 m', '3.99 €'], ['61953535', 'Barre de penderie ovale chromé', 'D30 x 15 mm — 2 m', '11.90 €'], ['82704641', 'Lot de 1 support de barre de penderie ovale chrome', 'D30 x 15 mm — 21.58 m', '4.99 €'], ['82704679', 'Lot de 1 support de barre de penderie ronde chrome', 'D25 mm — 38 m', '3.99 €'], ['82505738', 'Kit barre de penderie extensible et supports chromé', '0.6 m ovale', '26.90 €'], ['82459989', 'Kit barre de penderie et supports noir', '0.56 m — Diam.30 x 15 mm ovale', '8.99 €'], ['82024499', 'Support de barre de penderie rond noir', 'D28 mm', '9.99 €'], ['83071058', 'Valve Mytube noir', 'D25 mm', '8.99 €'], ['82061892', 'Raccord pour 4 tubes en biais penderie MyTube rond noir', 'D25 mm', '7.99 €'], ['82506566', 'Kit barre de penderie et supports blanc', '1 m', '29.90 €']].map((r) => new TableRow({ children: [cell(r[0]), cell(r[1]), cell(r[2]), cell(r[3])] })),
  ]))
  return out
}

function annexesEleve() {
  const out = [bandeau('Mission 3 : ANNEXES')]
  out.push(H('Annexe 1a – Logiciel de disponibilité des produits Leroy Merlin'))
  out.push(P('Configurateur de disponibilité à compléter dans l\'application (effet chêne, P.45, H.200, L.220).'))
  out.push(H('Annexe 1b – La disponibilité du dressing du couple'))
  out.push(tbl([
    new TableRow({ children: [cell('Le dressing choisi par le couple est-il en stock ?', { fill: true, b: true, width: 60 }), cell('Oui', { head: true, width: 20 }), cell('Non', { head: true, width: 20 })] }),
    new TableRow({ children: [cell("S'il est disponible, combien y en a-t-il en stock ?", { fill: true, b: true }), cell('Il y a ______ dressing(s) en chêne en stock', { width: 40 }), cell('')] }),
  ]))
  out.push(H('Annexe 2 – La fiche client'))
  const fc = ['Type de client (Particulier / Professionnel)', 'Civilité', 'Nom', 'Prénom', 'Adresse', 'Téléphone fixe', 'Téléphone portable', 'Email', 'Produit acheté', 'Montant avoir', 'Commentaire']
  out.push(tbl(fc.map((l) => new TableRow({ children: [cell(l, { fill: true, b: true, width: 35 }), cell('')] }))))
  out.push(H('Annexe 3 – Les questions de votre tutrice'))
  const a3 = ["Expliquez ce qu'est la vente additionnelle", "Comment se fait une vente additionnelle sur internet d'une enseigne ?", 'Quels sont les deux types de vente additionnelle ?', "Donnez la définition d'une vente complémentaire.", "Indiquez en quoi consiste la vente d'un produit supplémentaire.", "Indiquez l'intérêt pour une entreprise de faire de la vente additionnelle."]
  out.push(tbl([new TableRow({ children: [cell('Questions', { head: true, width: 50 }), cell('Vos réponses', { head: true, width: 50 })] }), ...a3.map((q) => new TableRow({ children: [cell(q, { fill: true }), cell('')] }))]))
  out.push(H('Annexe 4 – Les produits complémentaires ou supplémentaires chez Leroy Merlin'))
  out.push(tbl([new TableRow({ children: [cell('Produit principal', { head: true, width: 34 }), cell('Exemple de produit complémentaire', { head: true, width: 33 }), cell('Exemple de produit supplémentaire', { head: true, width: 33 })] }), ...['Un pot de peinture', 'Une table basse de salon', 'Des rideaux', 'Une table de chevet'].map((p) => new TableRow({ children: [cell(p, { fill: true, b: true }), cell(''), cell('')] }))]))
  out.push(H('Annexe 5 – Le produit principal chez Leroy Merlin'))
  out.push(tbl([
    new TableRow({ children: [cell('Exemple de produit complémentaire', { head: true, width: 33 }), cell('Exemple de produit supplémentaire', { head: true, width: 33 }), cell('Produit principal', { head: true, width: 34 })] }),
    new TableRow({ children: [cell('Un parasol de jardin', { fill: true }), cell(''), cell('')] }),
    new TableRow({ children: [cell(''), cell('Des chaises', { fill: true }), cell('')] }),
    new TableRow({ children: [cell('Un pot', { fill: true }), cell(''), cell('')] }),
    new TableRow({ children: [cell(''), cell('Des bougies', { fill: true }), cell('')] }),
  ]))
  out.push(H('Annexe 6 – L\'analyse des notions de « up-selling » et de « down-selling »'))
  const a6 = ['Comment peut-on définir le « up-selling » ?', "Quel est l'avantage pour un commercial de faire du « up-selling » ?", "Donnez un exemple, qui n'est pas dans le texte, de vente en « up-selling »", "Quels sont les deux avantages pour l'entreprise de faire du « up-selling » ?", 'Définissez le « down-selling ».', "Dans le cadre du e-commerce, comment le site de l'enseigne fait-il du « down-selling » ?"]
  out.push(tbl([new TableRow({ children: [cell('Questions', { head: true, width: 50 }), cell('Réponses', { head: true, width: 50 })] }), ...a6.map((q) => new TableRow({ children: [cell(q, { fill: true }), cell('')] }))]))
  out.push(H('Annexe 7 – Le produit proposé en « up-selling » et la justification'))
  out.push(...blank(4))
  out.push(H('Annexe 8 – La phrase énoncée par le couple'))
  out.push(...blank(3))
  out.push(H('Annexe 9 – Le nom du bien ou du service additionnel proposé au couple'))
  out.push(...blank(3))
  return out
}

function annexesCorrige() {
  const out = [bandeau('Mission 3 : ANNEXES (CORRIGÉ)')]
  out.push(H('Annexe 1b – La disponibilité du dressing du couple'))
  out.push(tbl([
    new TableRow({ children: [cell('Le dressing choisi par le couple est-il en stock ?', { fill: true, b: true, width: 60 }), cell('Oui : X', { head: true, width: 20 }), cell('Non', { head: true, width: 20 })] }),
    new TableRow({ children: [cell("S'il est disponible, combien y en a-t-il en stock ?", { fill: true, b: true }), cell('Il y a 3 dressing(s) en chêne en stock'), cell('')] }),
  ]))
  out.push(H('Annexe 2 – La fiche client'))
  out.push(tbl([
    ['Type de client', 'Particulier'], ['Civilité', 'Madame'], ['Nom', 'Sankouraga'], ['Prénom', 'Rebecca'], ['Adresse', '7 rue Dombasle, 75015 Paris'], ['Téléphone fixe', '01.02.03.04.XX'], ['Téléphone portable', '07.06.05.04.XX'], ['Email', 'r.sankouraga@gmail.com'], ['Produit acheté', 'Dressing'], ['Montant avoir', '447,86 €'], ['Commentaire', "L'installation doit être faite avant le 22 mai car les clients partent en vacances pendant 1 mois."],
  ].map((r) => new TableRow({ children: [cell(r[0], { fill: true, b: true, width: 35 }), cell(r[1])] }))))
  out.push(H('Annexe 3 – Les questions de votre tutrice'))
  out.push(tbl([
    new TableRow({ children: [cell('Questions', { head: true, width: 45 }), cell('Réponses', { head: true, width: 55 })] }),
    new TableRow({ children: [cell("Expliquez ce qu'est la vente additionnelle", { fill: true }), cell('Elle consiste à vendre un produit complémentaire ou supplémentaire (= en plus) à celui initialement acheté ou voulu.')] }),
    new TableRow({ children: [cell("Comment se fait une vente additionnelle sur internet ?", { fill: true }), cell('La vente additionnelle peut être provoquée par un système de recommandation produit en e-commerce.')] }),
    new TableRow({ children: [cell('Quels sont les deux types de vente additionnelle ?', { fill: true }), cell('La vente complémentaire ou vente croisée ; la vente supplémentaire.')] }),
    new TableRow({ children: [cell("Définition d'une vente complémentaire.", { fill: true }), cell('Le produit vendu en plus est un accessoire ou service lié au produit principal acheté.')] }),
    new TableRow({ children: [cell("En quoi consiste la vente d'un produit supplémentaire.", { fill: true }), cell("Elle consiste simplement à profiter de la présence du client pour lui proposer un autre produit qui n'est pas forcément lié au premier.")] }),
    new TableRow({ children: [cell("Intérêt de la vente additionnelle pour l'entreprise.", { fill: true }), cell('Les ventes additionnelles peuvent représenter un CA ou une marge particulièrement importante.')] }),
  ]))
  out.push(H('Annexe 4 – Les produits complémentaires ou supplémentaires'))
  out.push(tbl([
    new TableRow({ children: [cell('Produit principal', { head: true, width: 30 }), cell('Complémentaire', { head: true, width: 30 }), cell('Supplémentaire', { head: true, width: 40 })] }),
    new TableRow({ children: [cell('Un pot de peinture', { fill: true, b: true }), cell('Un pinceau'), cell('')] }),
    new TableRow({ children: [cell('Une table basse de salon', { fill: true, b: true }), cell(''), cell('Des coussins, un canapé… (accepter toute réponse cohérente)')] }),
    new TableRow({ children: [cell('Des rideaux', { fill: true, b: true }), cell('Une tringle'), cell('')] }),
    new TableRow({ children: [cell('Une table de chevet', { fill: true, b: true }), cell(''), cell('Un tapis (accepter toute réponse cohérente)')] }),
  ]))
  out.push(H('Annexe 5 – Le produit principal'))
  out.push(tbl([
    new TableRow({ children: [cell('Complémentaire', { head: true, width: 33 }), cell('Supplémentaire', { head: true, width: 33 }), cell('Produit principal', { head: true, width: 34 })] }),
    new TableRow({ children: [cell('Un parasol de jardin'), cell(''), cell('Une table de jardin')] }),
    new TableRow({ children: [cell(''), cell('Des chaises'), cell('Une table basse')] }),
    new TableRow({ children: [cell('Un pot'), cell(''), cell('Des fleurs')] }),
    new TableRow({ children: [cell(''), cell('Des bougies'), cell('Une lampe')] }),
  ]))
  out.push(H('Annexe 6 – L\'analyse des notions de « up-selling » et de « down-selling »'))
  out.push(tbl([
    new TableRow({ children: [cell('Questions', { head: true, width: 42 }), cell('Réponses', { head: true, width: 58 })] }),
    new TableRow({ children: [cell('Définir le « up-selling » ?', { fill: true }), cell("Le « up-selling » est une technique qui consiste à proposer au client un autre produit que celui qu'il avait initialement choisi.")] }),
    new TableRow({ children: [cell("Avantage pour un commercial de faire du « up-selling » ?", { fill: true }), cell('Le commercial augmentera sa marge bénéficiaire.')] }),
    new TableRow({ children: [cell("Exemple (hors texte) de vente en « up-selling »", { fill: true }), cell('Le client vient acheter un téléviseur entrée de gamme, on le dirige vers un téléviseur plus cher et avec plus de fonctionnalités. (accepter toute réponse cohérente)')] }),
    new TableRow({ children: [cell("Deux avantages pour l'entreprise du « up-selling » ?", { fill: true }), cell("L'avantage est multiple car vous augmentez vos ventes et bénéfices, en plus de bénéficier de recommandations de la part de vos clients sur la base de leur satisfaction.")] }),
    new TableRow({ children: [cell('Définir le « down-selling ».', { fill: true }), cell("Le downselling consiste, par opposition à l'up-sell, à proposer à votre client un produit moins chère suite à son refus d'acheter le produit que vous lui avez proposé.")] }),
    new TableRow({ children: [cell("« Down-selling » en e-commerce ?", { fill: true }), cell("Cela consiste à faire afficher une offre moins chère si l'internaute défile sur un premier produit.")] }),
  ]))
  out.push(H('Annexe 7 – Le produit proposé en « up-selling » et la justification'))
  out.push(P("On proposera la référence 83013042, Dressing semi-fermé avec lumière, H 200cm – L 240cm – P 45 cm, couleur chêne, car il a de la lumière ce que n'a pas l'autre et il est plus cher.", { it: true }))
  out.push(H('Annexe 8 – La phrase énoncée par le couple'))
  out.push(P("« Plus jamais ! J'ai pas les compétences pour faire du montage ! Je préfère payer pour le faire. »", { it: true }))
  out.push(H('Annexe 9 – Le nom du bien ou du service additionnel proposé au couple'))
  out.push(P('Le service à proposer au couple : POSE ET INSTALLATION À DOMICILE — Rangement / dressing — À partir de 149.00 €.', { it: true }))
  return out
}

function syntheseAuto() {
  return [
    bandeau('Mission 3 : SYNTHÈSE'),
    P('La vente additionnelle', { b: true }),
    bullet('2 types de ventes additionnelles : La vente complémentaire / La vente supplémentaire'),
    bullet("Les notions d'up-selling et de down-selling : L'up-selling (produit plus cher) / Le down-selling (produit moins cher)"),
    bandeau('Mission 3 : AUTO-ÉVALUATION'),
    P('Évaluez votre compréhension des exercices de la mission 3 ainsi que votre niveau de difficulté pour le réaliser.'),
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
  const doc = new Document({ styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } }, sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children }] })
  const buf = await Packer.toBuffer(doc)
  const name = corrige ? 'Corrige - LEROY MERLIN - M3.docx' : 'LEROY MERLIN - M3.docx'
  fs.writeFileSync(`${OUT}/${name}`, buf)
  console.log('OK', name)
}

;(async () => { await build(false); await build(true) })()
