/* Generateur Word - Leroy Merlin - Mission 2 (vert #7AB51D) */
const fs = require('fs')
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } = require('docx')

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
function tbl(rows) {
  const b = { style: BorderStyle.SINGLE, size: 4, color: 'C9D6E3' }
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b }, rows })
}
function blank(n) { const o = []; for (let i = 0; i < n; i++) o.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'C9D6E3', space: 6 } }, spacing: { after: 160 }, children: [new TextRun('')] })); return o }
function bandeau(t) { return new Paragraph({ shading: { type: ShadingType.SOLID, color: VERT }, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: t, bold: true, color: 'FFFFFF', size: 24 })] }) }
function dlg(loc, txt, it) { return new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: loc + ' : ', bold: true, size: 22 }), new TextRun({ text: txt, italics: !!it, size: 22 })] }) }

function entete() {
  return [
    P('Scénario Vente – LEROY MERLIN – Mission 2', { b: true, color: GRIS }),
    P('MENUEL – Professeur de vente', { it: true, color: GRIS, size: 20 }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 60 }, children: [new TextRun({ text: 'La recherche des besoins et la proposition de produit', bold: true, size: 30, color: VERT })] }),
    P('Compétences travaillées :', { b: true }),
    bullet('C.1.2 – Réaliser la vente dans un cadre omnicanal'),
    new Paragraph({ spacing: { before: 120, after: 120 }, children: [new TextRun({ text: 'NOM ET PRÉNOM :', bold: true, size: 22 }), new TextRun({ text: '                                                  Mission 2', size: 22 })] }),
    P("Un couple, Mme et M. Sankouraga, est venu se renseigner pour l'achat d'un dressing. Vous les avez accueillis en leur offrant une boisson chaude. Il est temps pour vous de vous lancer dans la recherche de leurs besoins avant de leur proposer le produit adapté à leurs critères.", { it: true }),
  ]
}

function consignes() {
  return [
    H("Activité 1 – Les mobiles, motivations et freins à l'achat des prospects"),
    P("1. Retrouvez les mobiles d'achat du couple en indiquant à chaque fois le mot ou le groupe de mots permettant de justifier votre choix. (Consulter les documents 1 et 2, compléter l'annexe 1)."),
    P("2. Cochez la motivation d'achat du couple puis justifiez la en citant le texte. (Consulter les documents 1 et 3, compléter l'annexe 2)."),
    P("3. Relevez dans l'intervention du couple, les deux freins liés à l'achat puis cochez le type de frein. (Consulter les documents 1 et 4, compléter l'annexe 3)."),
    H('Activité 2 – La reformulation'),
    P("4. Reformulez les besoins du client en utilisant la « reformulation synthèse ». (Consulter le document 5, compléter l'annexe 4)."),
    H("Activité 3 – La proposition d'une solution adaptée"),
    P("5. Préparez la présentation du produit en utilisant la méthode « QQCCP ». (Consulter le document 6, compléter l'annexe 5)."),
    P("6. Après avoir lu les réponses du couple, complétez le logiciel qui permettra de proposer le dressing leur correspondant. (Consulter le document 7, compléter l'annexe 6)."),
    P("7. Indiquez les caractéristiques du produit proposé au couple. (Relire l'annexe 6, compléter l'annexe 7)."),
  ]
}

function documents() {
  const out = [bandeau('Mission 2 : DOCUMENTS')]
  out.push(H('Document 1 – Intervention du couple'))
  out.push(dlg('Le commercial', 'Bonjour Madame, Monsieur ! Comment puis-je vous aider ?', true))
  out.push(dlg('M. Sankouraga', "Bonjour ! Nous avons emménagé dans notre nouvel appartement il y a quelques semaines et nous souhaitons faire un dressing. Les anciens propriétaires en avait laissé un, mais on a trouvé qu'il était abîmé et plus vraiment au goût du jour, donc on l'a enlevé. C'est pour cela qu'on recherche quelque chose de plus contemporain."))
  out.push(dlg('Mme Sankouraga', "Effectivement ! Du coup on a un peu regardé sur internet et on a vu que de nos jours on fait de très beaux dressings. On aimerait bien un modèle en bois recyclé et spacieux car nous sommes des fashions-addict. On a tous les deux pas mal de vêtements et pas beaucoup de place pour les ranger."))
  out.push(dlg('Le commercial', 'Je comprends tout à fait. Et vous avez déjà une idée de ce qui vous plairait ?', true))
  out.push(dlg('M. Sankouraga', "Oui, on a un peu regardé ! On voudrait vraiment quelque chose de beau, avec une belle couleur naturelle… Un truc qui nous plait vraiment quoi !"))
  out.push(dlg('Mme Sankouraga', "Je suis d'accord, mais après tu sais comment est ta mère. Comme d'habitude quand elle le verra, je n'ai pas envie qu'elle nous dise qu'on a exagéré en dépensant autant pour un dressing."))
  out.push(dlg('M. Sankouraga', "C'est pas faux ! Mais bon…", true))
  out.push(dlg('Mme Sankouraga', "…Bref ! après tout, je me dis que si on veut quelque chose de bien il faut y mettre le prix. Chez mes parents la cuisine et la salle de bains ont été faites par Leroy Merlin et à chaque fois qu'il y a eu un problème tout a été pris en charge par la garantie. Et ça, c'est super important pour nous !"))
  out.push(dlg('M. Sankouraga', "C'est vrai, mais tu te rappelles comment on a galéré pour monter tout ça ? On a pris presque 4 jours pour la cuisine. Plus jamais ! J'ai pas les compétences pour faire du montage ! Je préfère payer pour le faire."))
  out.push(P('* Fashions-addict : accro à la mode', { it: true, size: 20 }))

  out.push(H("Document 2 – Les mobiles d'achat"))
  out.push(tbl([
    new TableRow({ children: [cell('S O N C A S E', { head: true, width: 14 }), cell('Typologie', { head: true, width: 30 }), cell('Exemples', { head: true, width: 56 })] }),
    ...[['S', 'comme Sécurité', 'Produit solide, fiable, robuste, garantie, de qualité'], ['O', 'comme Orgueil', 'Produit prestigieux, de marque'], ['N', 'comme Nouveauté', 'Produit récent, à la mode, innovant, moderne'], ['C', 'comme Confort', "Produit pratique, facile d'utilisation, efficace"], ['A', 'comme Argent', 'Paiement en plusieurs fois, produit économique, en promotion'], ['S', 'comme Sympathie', "Plaisir procuré par l'achat, attirance pour une couleur, forme…"], ['E', 'comme Environnement', 'Produit durable, écologique']].map((r) => new TableRow({ children: [cell(r[0], { fill: true, b: true }), cell(r[1], { b: true }), cell(r[2])] })),
  ]))

  out.push(H("Document 3 – Les motivations d'achat"))
  out.push(tbl([
    new TableRow({ children: [cell('Typologies', { head: true, width: 35 }), cell('Définition', { head: true, width: 65 })] }),
    ...[['Hédoniste ou personnelle', 'Achat pour se faire plaisir'], ['Oblative ou altruiste', 'Achat pour faire plaisir aux autres'], ['Auto-expression', "Achat pour s'affirmer, se démarquer des autres"]].map((r) => new TableRow({ children: [cell(r[0], { fill: true, b: true }), cell(r[1])] })),
  ]))

  out.push(H("Document 4 – Les freins à l'achat"))
  out.push(P("Les freins d'achat sont les causes matériels ou psychologique qui empêchent ou retarde la décision d'achat."))
  out.push(P('Les freins sont de trois ordres :'))
  out.push(bullet('La peur ;')); out.push(bullet("L'inhibition ;")); out.push(bullet('Le prix.'))
  out.push(P("La peur peut avoir différentes causes : la peur de ne pas savoir utiliser le produit ou la peur du danger, de l'utilisation, ou des produits chimiques."))
  out.push(P("L'inhibition elle aussi peut avoir différentes causes tels que la crainte d'être mal jugé, le ridicule, le sentiment de gêne ou de honte."))
  out.push(P('Enfin, le prix : le client trouve le produit trop cher ou pas assez cher.'))

  out.push(H('Document 5 – Reformuler les besoins des prospects'))
  out.push(P('1 – Les types de reformulation :'))
  out.push(tbl([
    new TableRow({ children: [cell('Types de reformulation', { head: true, width: 25 }), cell('Définition', { head: true, width: 40 }), cell('Exemple', { head: true, width: 35 })] }),
    new TableRow({ children: [cell('Écho ou perroquet', { fill: true, b: true }), cell('Elle consiste à répéter les paroles du client ou un terme important… comme un perroquet'), cell("Le client : Je n'aime pas ce modèle.\nLe commercial : Vous n'aimez pas ce modèle ?")] }),
    new TableRow({ children: [cell('Miroir ou reflet', { fill: true, b: true }), cell('Vous reformulez les propos du client avec vos propres mots'), cell("- En d'autres termes…\n- Vous voulez dire que…")] }),
    new TableRow({ children: [cell('Résumé ou synthèse', { fill: true, b: true }), cell('Vous faites une synthèse de tout ce que vous a dit le client'), cell("Si j'ai bien compris… C'est bien cela ?")] }),
  ]))
  out.push(P('2 – Exemple :'))
  out.push(P('Le client : « Un bon prix ? »', { it: true }))
  out.push(tbl([
    new TableRow({ children: [cell('Écho ou perroquet', { fill: true, b: true, width: 28 }), cell('« Un bon prix ? »')] }),
    new TableRow({ children: [cell('Miroir ou reflet', { fill: true, b: true }), cell("« En d'autres termes, vous recherchez donc une voiture d'occasion, avec une fonction GPS simple à utiliser et à un prix raisonnable ? »")] }),
    new TableRow({ children: [cell('Résumé ou synthèse', { fill: true, b: true }), cell("« Si j'ai bien compris vous en recherchez une d'occasion, qui vous permettra de calculer facilement vos trajets et à un bon prix. C'est bien cela ? »")] }),
  ]))

  out.push(H('Document 6 – La présentation des produits'))
  out.push(P('Lorsque vous présenterez la solution que vous avez retenue pour le client, vous appliquerez la technique QQCCP.', { it: true }))
  out.push(tbl([
    new TableRow({ children: [cell('QQCCP', { head: true, width: 22 }), cell('Caractéristiques', { head: true, width: 78 })] }),
    new TableRow({ children: [cell('Quand ?', { fill: true, b: true }), cell("Au moment où :\n- Le client le demande ;\n- Le vendeur connaît les mobiles d'achat du client/prospect")] }),
    new TableRow({ children: [cell('Quel produit ?', { fill: true, b: true }), cell("Le produit :\n- Qui correspond aux mobiles d'achat du client/prospect ;\n- Qui correspond aux caractéristiques énoncées par le client/prospect.")] }),
    new TableRow({ children: [cell('Combien ?', { fill: true, b: true }), cell("Le commercial présente :\n- Un produit, celui qui correspond le mieux aux critères du client/prospect ;\n- Deux produits : le produit correspondant au client et un produit moins cher ;\n- Trois produits : le produit correspondant au client, plus un produit d'entrée de gamme, moins cher et enfin un produit haut de gamme, plus cher.")] }),
    new TableRow({ children: [cell('Comment ?', { fill: true, b: true }), cell("Il faut :\n- Faire essayer le produit ;\n- Favoriser la prise en main du produit ;\n- Inciter le client/prospect à se projeter avec le produit dans son environnement personnel (maison ou travail e fonction du produit)")] }),
    new TableRow({ children: [cell('Pourquoi ?', { fill: true, b: true }), cell("Le commercial incite le client/prospect à se projeter pour lui donner le sentiment que le produit lui appartient déjà.")] }),
  ]))

  out.push(H('Document 7 – Les exigences de Mme et M. Sankouraga'))
  const ex = ['On cherche des caissons standards', 'Des caissons couleur chêne, ça serait pas mal', 'Le mur de gauche fait 3m30', "200cm de hauteur pour les caissons, c'est bien !", "45 cm de profondeur pour les caissons c'est suffisant", "C'est du parquet marron", 'Avec des poignées en métal', 'Dans la chambre on a des murs gris', 'Une porte de H100 x L40', 'Le mur de droite fait 3m30', '2 tiroirs chacun ça nous paraît bien !', 'Il y 2m de hauteur sous plafond', "Non, non ! il n'y a aucune contrainte", "Je crois que le mur d'en face fait 4m", '220cm de largeur pour les caissons']
  ex.forEach((e) => out.push(bullet('« ' + e + ' »')))
  return out
}

function annexesEleve() {
  const out = [bandeau('Mission 2 : ANNEXES')]
  out.push(H("Annexe 1 – Mobile(s) d'achat du couple Sankouraga"))
  const a1 = [new TableRow({ children: [cell('Typologie SONCAS', { head: true, width: 25 }), cell("Cocher le(s) mobile(s) d'achat du couple", { head: true, width: 30 }), cell('Justification', { head: true, width: 45 })] })]
  ;['Sécurité', 'Orgueil', 'Nouveauté', 'Confort', 'Argent', 'Sympathie', 'Environnement'].forEach((t) => a1.push(new TableRow({ children: [cell(t, { fill: true, b: true }), cell(''), cell('')] })))
  out.push(tbl(a1))
  out.push(H("Annexe 2 – Les motivations d'achat du couple"))
  const a2 = [new TableRow({ children: [cell('Typologie SONCAS', { head: true, width: 25 }), cell('La ou les motivation(s) du couple', { head: true, width: 30 }), cell('Justification', { head: true, width: 45 })] })]
  ;['Hédoniste', 'Oblative', 'Auto-expression'].forEach((t) => a2.push(new TableRow({ children: [cell(t, { fill: true, b: true }), cell(''), cell('')] })))
  out.push(tbl(a2))
  out.push(H('Annexe 3 – Les freins de M. et Mme Sankouraga'))
  out.push(tbl([
    new TableRow({ children: [cell("Les freins liés à l'achat", { head: true, width: 55 }), cell('Peur', { head: true, width: 15 }), cell('Inhibition', { head: true, width: 15 }), cell('Prix', { head: true, width: 15 })] }),
    new TableRow({ children: [cell(''), cell(''), cell(''), cell('')] }),
    new TableRow({ children: [cell(''), cell(''), cell(''), cell('')] }),
  ]))
  out.push(H('Annexe 4 – La reformulation des besoins du couple Sankouraga'))
  out.push(...blank(4))
  out.push(H('Annexe 5 – La méthode QQCCP'))
  const a5 = [['Quand ?'], ['Quel produit ?'], ['Combien ?'], ['Comment ?'], ['Pourquoi ? (Rédiger la phrase que vous prononcerez pour inciter les clients à se projeter)']]
  out.push(tbl(a5.map((r) => new TableRow({ children: [cell(r[0], { fill: true, b: true, width: 35 }), cell('')] }))))
  out.push(H('Annexe 6 – Concevoir mon aménagement intérieur'))
  out.push(P('Configurateur en ligne (Google Form) à compléter dans l\'application avec les réponses du couple (document 7).'))
  out.push(P('Lien : https://docs.google.com/forms/d/e/1FAIpQLSdbyLk6W3q-21yX3EZbN781AltB_ZREW7YF_JHOlaoHNthw4w/viewform', { size: 18 }))
  out.push(H('Annexe 7 – Les informations sur le produit'))
  out.push(tbl([
    new TableRow({ children: [cell('Référence du produit', { head: true, width: 25 }), cell('Libellé produit', { head: true, width: 25 }), cell('Taille', { head: true, width: 25 }), cell('Prix', { head: true, width: 25 })] }),
    new TableRow({ children: [cell(''), cell(''), cell(''), cell('')] }),
  ]))
  return out
}

function annexesCorrige() {
  const out = [bandeau('Mission 2 : ANNEXES (CORRIGÉ)')]
  out.push(H("Annexe 1 – Mobile(s) d'achat du couple Sankouraga"))
  out.push(tbl([
    new TableRow({ children: [cell('Typologie SONCAS', { head: true, width: 22 }), cell("Cocher", { head: true, width: 13 }), cell('Justification', { head: true, width: 65 })] }),
    new TableRow({ children: [cell('Sécurité', { fill: true, b: true }), cell('X'), cell("« …tout a été pris en charge par la garantie. Et ça, c'est super important pour nous ! »")] }),
    new TableRow({ children: [cell('Orgueil', { fill: true, b: true }), cell(''), cell('')] }),
    new TableRow({ children: [cell('Nouveauté', { fill: true, b: true }), cell('X'), cell("« …on recherche quelque chose de plus contemporain. »")] }),
    new TableRow({ children: [cell('Confort', { fill: true, b: true }), cell('X'), cell("« …spacieux. » / « pas beaucoup de place pour les ranger »")] }),
    new TableRow({ children: [cell('Argent', { fill: true, b: true }), cell(''), cell('')] }),
    new TableRow({ children: [cell('Sympathie', { fill: true, b: true }), cell('X'), cell("« …on recherche quelque chose…, avec une belle couleur… »")] }),
    new TableRow({ children: [cell('Environnement', { fill: true, b: true }), cell('X'), cell("« …un modèle en bois recyclé. »")] }),
  ]))
  out.push(H("Annexe 2 – Les motivations d'achat du couple"))
  out.push(tbl([
    new TableRow({ children: [cell('Typologie', { head: true, width: 22 }), cell('Coché', { head: true, width: 13 }), cell('Justification', { head: true, width: 65 })] }),
    new TableRow({ children: [cell('Hédoniste', { fill: true, b: true }), cell('X'), cell("« Nous avons emménagé dans notre nouvel appartement il y a quelques semaines et nous souhaitons faire un dressing. » ou « Un truc qui nous plait vraiment quoi ! » (accepter toute réponse pertinente)")] }),
    new TableRow({ children: [cell('Oblative', { fill: true, b: true }), cell(''), cell('')] }),
    new TableRow({ children: [cell('Auto-expression', { fill: true, b: true }), cell(''), cell('')] }),
  ]))
  out.push(H('Annexe 3 – Les freins de M. et Mme Sankouraga'))
  out.push(tbl([
    new TableRow({ children: [cell("Les freins liés à l'achat", { head: true, width: 55 }), cell('Peur', { head: true, width: 15 }), cell('Inhibition', { head: true, width: 15 }), cell('Prix', { head: true, width: 15 })] }),
    new TableRow({ children: [cell("« …après tu sais comment est ta mère… Quand elle verra ça… »"), cell(''), cell('X'), cell('')] }),
  ]))
  out.push(H('Annexe 4 – La reformulation des besoins du couple Sankouraga'))
  out.push(P("« Si j'ai bien compris, vous souhaitez faire un dressing, contemporain, en bois recyclé, spacieux, avec une belle couleur naturelle et garantie, c'est bien cela ? »", { it: true }))
  out.push(H('Annexe 5 – La méthode QQCCP'))
  out.push(tbl([
    new TableRow({ children: [cell('Quand ?', { fill: true, b: true, width: 35 }), cell("« Le vendeur connaît les mobiles d'achat du client/prospect »")] }),
    new TableRow({ children: [cell('Quel produit ?', { fill: true, b: true }), cell("Le produit : qui correspond aux mobiles d'achat du client/prospect ; qui correspond aux caractéristiques énoncées par le client/prospect.")] }),
    new TableRow({ children: [cell('Combien ?', { fill: true, b: true }), cell("Un produit, celui qui correspond le mieux aux critères du client/prospect.")] }),
    new TableRow({ children: [cell('Comment ?', { fill: true, b: true }), cell("Inciter le client/prospect à se projeter avec le produit dans son environnement personnel (maison ou travail e fonction du produit).")] }),
    new TableRow({ children: [cell('Pourquoi ?', { fill: true, b: true }), cell("« C'est le dressing qu'il vous faut. Il correspond à tous vos critères. Imaginez-le dans votre chambre avec toute la place dont vous avez toujours rêvé pour ranger vos vêtements. » (accepter toute réponse pertinente)")] }),
  ]))
  out.push(H('Annexe 6 – Concevoir mon aménagement intérieur'))
  out.push(P('Configuration attendue (réponses du couple) : décor effet chêne naturel, profondeur 45 cm, hauteur 200 cm, largeur 220 cm, caissons standards, 2 tiroirs, poignées standard (métal), porte H100 x L40.'))
  out.push(P('Produit obtenu : Dressing chêne H.200 x L.240 x P.45cm — Référence 83299641 — 1492.86 €.', { b: true }))
  out.push(H('Annexe 7 – Les informations sur le produit'))
  out.push(tbl([
    new TableRow({ children: [cell('Référence du produit', { head: true, width: 25 }), cell('Libellé produit', { head: true, width: 25 }), cell('Taille', { head: true, width: 25 }), cell('Prix', { head: true, width: 25 })] }),
    new TableRow({ children: [cell('83299641'), cell('Dressing chêne'), cell('H.200 X L.240 X P.45'), cell('1492.86 €')] }),
  ]))
  return out
}

function syntheseAuto() {
  return [
    bandeau('Mission 2 : SYNTHÈSE'),
    P('La recherche des besoins', { b: true }),
    bullet("Les mobiles, les motivations et les freins d'achat : Les mobiles d'achat / Les motivations d'achat / Les types de freins"),
    bullet('La reformulation : Les types de reformulation → Écho ou perroquet'),
    bullet("La proposition d'une solution adaptée : La méthode « QQCCP » → Combien ?"),
    bandeau('Mission 2 : AUTO-ÉVALUATION'),
    P('Évaluez votre compréhension des exercices de la mission 2 ainsi que votre niveau de difficulté pour le réaliser.'),
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
  const name = corrige ? 'Corrige - LEROY MERLIN - M2.docx' : 'LEROY MERLIN - M2.docx'
  fs.writeFileSync(`${OUT}/${name}`, buf)
  console.log('OK', name)
}

;(async () => { await build(false); await build(true) })()
