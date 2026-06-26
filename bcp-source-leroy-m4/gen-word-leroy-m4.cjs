/* Generateur Word - Leroy Merlin - Mission 4 (vert #7AB51D) */
const fs = require('fs')
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, AlignmentType } = require('docx')

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
    shading: o.head ? { type: ShadingType.SOLID, color: o.headColor || VERT } : (o.fill ? { type: ShadingType.SOLID, color: o.fillColor || VERTF } : undefined),
    margins: { top: 50, bottom: 50, left: 70, right: 70 },
    children: String(t).split('\n').map((p) => new Paragraph({ spacing: { after: 10 }, alignment: o.align, children: [new TextRun({ text: p, bold: o.head || o.b, color: o.head ? 'FFFFFF' : o.color, size: o.size || 20 })] })),
  })
}
function tbl(rows, o = {}) { const b = { style: BorderStyle.SINGLE, size: 4, color: o.bc || 'C9D6E3' }; return new Table({ width: { size: o.w || 100, type: WidthType.PERCENTAGE }, borders: { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b }, rows }) }
function blank(n) { const o = []; for (let i = 0; i < n; i++) o.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'C9D6E3', space: 6 } }, spacing: { after: 160 }, children: [new TextRun('')] })); return o }
function bandeau(t) { return new Paragraph({ shading: { type: ShadingType.SOLID, color: VERT }, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: t, bold: true, color: 'FFFFFF', size: 24 })] }) }

const JOURS = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE']

function entete() {
  return [
    P('Scénario Vente – LEROY MERLIN – Mission 4', { b: true, color: GRIS }),
    P('MENUEL – Professeur de vente', { it: true, color: GRIS, size: 20 }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 60 }, children: [new TextRun({ text: "L'accord du client, les modalités de livraison et la prise de congé", bold: true, size: 30, color: VERT })] }),
    P('Compétences travaillées :', { b: true }),
    bullet("C.1.3 – S'assurer de l'exécution de la vente"),
    new Paragraph({ spacing: { before: 120, after: 120 }, children: [new TextRun({ text: 'NOM ET PRÉNOM :', bold: true, size: 22 }), new TextRun({ text: '                                                  Mission 4', size: 22 })] }),
    P("Maintenant que vous avez informé le couple de la disponibilité du dressing et du nombre de produits restants en stock, vous mettez tout en œuvre pour obtenir leur accord sur le bon de commande.", { it: true }),
  ]
}

function consignes() {
  return [
    H("Activité 1 – L'accord du client"),
    P("1. Utilisez la technique de la « peau de l'ours » pour rédiger la phrase que vous allez prononcer face aux clients pour obtenir leur accord. (Consulter le document 1, compléter l'annexe 1)."),
    P("2. Analysez l'article qui vous a été remis par votre tutrice, sur la formalisation de l'accord du client. (Consulter le document 2, compléter l'annexe 2)."),
    P("3. Grâce à toutes les informations recueillies dans la Mission 3 (document 1 et annexe 1a), complétez le bon de commande. (Compléter l'annexe 3)."),
    H('Activité 2 – Les modalités et le suivi de la livraison'),
    P("4. Consultez le planning d'intervention du magasin et complétez-le en indiquant, sur le jour choisi, le nom du client et le type d'intervention. (Consulter le document 3, compléter l'annexe 4)."),
    P("5. Reconstituez les différentes étapes entre la signature du bon de commande et la livraison. (Consulter le document 4, compléter l'annexe 5)."),
    P("6. Faites une phrase pour indiquer au couple les délais et les différentes étapes de la livraison. (Compléter l'annexe 6)."),
    P("7. Rédigez le SMS qui sera envoyé la veille pour rappeler la livraison. (Consulter le document 5, compléter l'annexe 7)."),
    H('Activité 3 – La prise de congé'),
    P("8. Votre tutrice vous interroge sur les documents qu'elle vous a remis. (Consulter le document 6, compléter l'annexe 8)."),
    P("9. Rédigez la phrase de la prise de congé pour le couple en respectant les 4 R. (Compléter l'annexe 9)."),
  ]
}

function documents() {
  const out = [bandeau('Mission 4 : DOCUMENTS')]
  out.push(H("Document 1 – Obtenir l'accord du client"))
  out.push(tbl([
    new TableRow({ children: [cell('Les techniques de conclusion', { head: true, width: 25 }), cell('Caractéristiques', { head: true, width: 45 }), cell('Exemples', { head: true, width: 30 })] }),
    new TableRow({ children: [cell('La conclusion directe', { fill: true, b: true }), cell('Le commercial invite tout naturellement le client à finaliser la vente.'), cell('Alors vous la prenez ?')] }),
    new TableRow({ children: [cell("La peau de l'ours", { fill: true, b: true }), cell("Le commercial se comporte comme si le client avait déjà acheté le produit alors que celui-ci ne l'a pas encore fait."), cell("Vous souhaitez une extension de garantie avec ? Elle n'est pas très chère.")] }),
    new TableRow({ children: [cell('Le regret', { fill: true, b: true }), cell("Le commercial présente au client un avantage dont celui-ci ne pourra bénéficier que s'il achète immédiatement."), cell('Je peux vous faire -15% si vous le prenez !')] }),
  ]))

  out.push(H('Document 2 – Le bon de commande signé vaut engagement'))
  ;["Selon votre secteur d'activité, l'établissement d'un bon de commande signé par vos soins constitue une obligation. En règle générale, il est toutefois recommandé de délivrer systématiquement ce document au client lorsque sa commande porte sur un montant ou des volumes importants.", "Le bon de commande, une fois signé et daté par le client, implique son accord pour entamer les travaux et le prive ensuite de toute voie de recours concernant le tarif demandé. En plus de la signature, l'ajout d'une mention type comme « Lu et approuvé » ou « Bon pour accord » peut constituer une sécurité supplémentaire pour vous. Le client reste bien sûr libre de s'opposer à une prestation ou une surfacturation non prévue au devis initial, sauf s'il consent à signer un avenant au devis dans les mêmes conditions. A défaut d'une signature sur le devis lui-même, le client peut vous faire parvenir une « lettre de bon pour accord », dans laquelle il vous fait connaître explicitement son accord : ce formalisme est un peu plus lourd, et l'engage de la même façon.", "Dans tous les cas, un bon de commande non signé par le client ne l'engage en rien, même s'il vous a manifesté verbalement son accord ! N'engagez pas des frais importants sans cette garantie minimale."].forEach((p) => out.push(P(p)))

  out.push(H('Document 3 – Note de votre tutrice'))
  out.push(P('NOTE INTERNE', { b: true }))
  out.push(P("A l'attention des conseillers de vente,"))
  out.push(P("Lorsque vous serez sur le point d'annoncer du délai de livraison au client et de compléter le planning d'intervention, suivez les étapes suivantes :"))
  out.push(bullet('1° - Retrouvez le délai livraison sur le logiciel ;'))
  out.push(bullet('2° - Commencez à compter le délai à partir du jour qui suit la signature du bon de commande par le client (dans le comptage enlevez les dimanches et les jours fériés) ;'))
  out.push(bullet("3° - Complétez le planning d'intervention avec le nom du client et le type d'intervention qui sera effectué."))
  out.push(P('Bonnes ventes à tous,')); out.push(P('Mme Annie Mâle — Responsable', { b: true }))

  out.push(H('Document 4 – Les étapes de la livraison'))
  ;['Signature du bon de commande', 'Préparation du produit', 'Une semaine avant, appel pour le choix du créneau de livraison', 'SMS de rappel la veille de la livraison', 'Livraison à domicile des articles', "Réception d'un SMS pour l'évaluation de la livraison"].forEach((e) => out.push(bullet(e)))

  out.push(H("Document 5 – Rédaction d'un SMS de rappel"))
  out.push(P("Lors de la rédaction d'un SMS de rappel, vous devrez faire attention à :"))
  ;['Commencer par une salutation personnalisée ;', "Rappeler l'article acheté ;", 'Rappeler le créneau de 2h de la livraison (de 9h à 11h) ;', "Remercier, saluer et ajouter le site internet de l'entreprise."].forEach((e) => out.push(bullet(e)))

  out.push(H("Document 6 – La prise de congé : la technique des « 4 R »"))
  ;["La prise de congé est un moment aussi important que l'accueil. En partant, le client doit avoir une bonne image du commercial et/ou de l'entreprise. D'une part pour rassurer le client sur son achat en le félicitant pour sa décision ou en lui donnant des conseils supplémentaires et d'autre part pour l'inciter à revenir.", "La confiance qui s'est installée au fur et à mesure des étapes de l'entretien de vente doit perdurer même quand le client a signé et que le moment est venu de se quitter.", 'Pour ce faire, vous pouvez utiliser les 4 R :'].forEach((p) => out.push(P(p)))
  out.push(bullet('Rassurer et remercier')); out.push(bullet('Raccompagner')); out.push(bullet('Revoir'))
  out.push(P('Pourquoi Rassurer et Remercier ?', { b: true, color: VERT }))
  ;['Inscrivez la vente dans une démarche à long terme.', "En cas de vente, vous devez remercier le client de la confiance qu'il vous a accordé tout au long du processus d'achat...", "Vous devez également le féliciter de sa décision. Le client doit être conforté dans le choix qu'il vient de faire. Rappelez-lui votre disponibilité, votre engagement afin de pérenniser votre relation."].forEach((p) => out.push(P(p)))
  out.push(P('Comment Raccompagner ?', { b: true, color: VERT }))
  ;['Évitez les bavardages inutiles...mais partez sans précipitation !', "Il s'agit de clore le rendez-vous en développant une relation privilégiée.", "La politesse c'est l'attitude à adopter chaque fois qu'un individu veut montrer du respect à son interlocuteur. Elle doit être observée jusqu'au moment de la prise de congé, et ce même si la vente n'a pas été conclue. « Au revoir. Merci de m'avoir reçu/d'être venu ». Raccompagnez le client si c'est vous qui l'avez reçu."].forEach((p) => out.push(P(p)))
  out.push(P('Comment réussir à Revoir ?', { b: true, color: VERT }))
  ;["Il faut avant tout montrer que vous restez à la disposition du client, par exemple en lui remettant votre carte de visite.", "Il s'agit de clore le rendez-vous en développant une relation privilégiée. Par exemple, il est de bon ton, pour un vendeur, de s'enquérir, quelques jours après la vente, de ce que pense le client de son achat : respect des délais de livraison, difficultés d'installation ou d'apprentissage.", "Pour le commercial, c'est l'occasion de renforcer la qualité de la relation vendeur-client car rappelez-vous, la prise de congé est la dernière étape de la vente mais la première étape à la fidélisation."].forEach((p) => out.push(P(p)))
  return out
}

// Planning sous forme de tableau Word (jours en colonnes, matin/aprem en lignes)
function planningTable(mois, remplissages) {
  const rows = []
  // bandeau mois
  rows.push(new TableRow({ children: [new TableCell({ columnSpan: 7, shading: { type: ShadingType.SOLID, color: VERT }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: mois.titre, bold: true, color: 'FFFFFF', size: 22 })] })] })] }))
  rows.push(new TableRow({ children: JOURS.map((j) => cell(j, { head: true, headColor: '2E6DB4', align: AlignmentType.CENTER, size: 16 })) }))
  const total = mois.decalage + mois.nbJours
  const semaines = Math.ceil(total / 7)
  for (let s = 0; s < semaines; s++) {
    const jourCells = [], matinCells = [], apremCells = []
    for (let d = 0; d < 7; d++) {
      const idx = s * 7 + d
      const jn = idx - mois.decalage + 1
      const valide = jn >= 1 && jn <= mois.nbJours
      jourCells.push(cell(valide ? String(jn) : '', { fill: true, fillColor: 'EAF1F8', b: true, color: '2E6DB4', align: AlignmentType.RIGHT, size: 16 }))
      const find = (cr) => valide ? (mois.creneaux.find((c) => c.jour === jn && c.creneau === cr)) : undefined
      const txt = (c, key) => {
        if (!valide) return ''
        if (c?.ferie) return 'JOUR FERIE'
        if (c?.texte) return c.texte
        return remplissages?.[key] || ''
      }
      matinCells.push(cell(txt(find('matin'), `${mois.titre}-${jn}-matin`), { size: 14 }))
      apremCells.push(cell(txt(find('aprem'), `${mois.titre}-${jn}-aprem`), { size: 14 }))
    }
    rows.push(new TableRow({ children: jourCells }))
    rows.push(new TableRow({ children: [cell('Matin (8h)', { fill: true, b: true, size: 13, width: 1 })].concat(matinCells.slice(1)) }))
    // pour conserver 7 colonnes alignees on remet matin complet
    rows.pop()
    rows.push(new TableRow({ children: matinCells }))
    rows.push(new TableRow({ children: apremCells }))
  }
  return tbl(rows, { bc: 'B7C4D6' })
}

function annexesEleve() {
  const out = [bandeau('Mission 4 : ANNEXES')]
  out.push(H("Annexe 1 – Technique de la « peau de l'ours » pour obtenir l'accord du couple"))
  out.push(...blank(3))
  out.push(H("Annexe 2 – Analyse de l'article"))
  const a2 = ['Quelle est la conséquence une fois le bon de commande daté et signé par le client ?', "Quel autre moyen que la signature le client a-t-il pour manifester son accord ?", "Si le client dit oralement qu'il est d'accord, est-il engagé ? Justifiez votre réponse."]
  out.push(tbl([new TableRow({ children: [cell('Questions', { head: true, width: 50 }), cell('Réponses', { head: true, width: 50 })] }), ...a2.map((q) => new TableRow({ children: [cell(q, { fill: true }), cell('')] }))]))
  out.push(H('Annexe 3 – Bon de commande'))
  out.push(P('COMMANDE N° 2535753 — Leroy Merlin Daumesnil, 139 avenue Daumesnil, 75012 Paris — Téléphone : 01.33.XX.XX.XX.', { b: true }))
  out.push(P('BRICOLAGE – CONSTRUCTION – DECORATION – ENTRETIEN', { size: 18, color: GRIS }))
  out.push(P('Coordonnées client : ____________________________________________'))
  out.push(P('Date : ______________            Délais de livraison : ______ jours'))
  out.push(tbl([
    new TableRow({ children: [cell('Référence', { head: true, width: 18 }), cell('Libellé article', { head: true, width: 34 }), cell('Quantité', { head: true, width: 12 }), cell('Prix HT', { head: true, width: 18 }), cell('Prix TTC', { head: true, width: 18 })] }),
    new TableRow({ children: [cell(''), cell(''), cell(''), cell(''), cell('')] }),
  ]))
  out.push(P('Livraison : offerte pour les articles de plus de 1000€', { it: true, size: 18 }))
  out.push(tbl([
    new TableRow({ children: [cell('Taux TVA', { head: true, width: 33 }), cell('Base HT', { head: true, width: 33 }), cell('Montant Total', { head: true, width: 34 })] }),
    new TableRow({ children: [cell('20.00 %', { align: AlignmentType.CENTER }), cell(''), cell('')] }),
  ], { w: 60 }))
  out.push(P("Montant de l'avoir (30%) : ______________            Bon pour accord — Signature client : ______________"))
  out.push(H("Annexe 4 – Planning d'intervention Leroy Merlin"))
  out.push(P('Complétez la case du créneau choisi (nom du client + intervention). Matin à partir de 8h · Après-midi à partir de 14h.', { it: true, size: 18 }))
  PLANNING_MOIS.forEach((m) => { out.push(planningTable(m, null)); out.push(P('')) })
  out.push(H('Annexe 5 – Reconstitution des étapes de la livraison'))
  for (let i = 1; i <= 6; i++) out.push(P(`${i}. ____________________________________________`))
  out.push(H('Annexe 6 – Énoncé des délais et des étapes de la livraison'))
  out.push(...blank(5))
  out.push(H('Annexe 7 – SMS de rappel'))
  out.push(P('Leroy Merlin — Aujourd\'hui 08 : 43', { b: true }))
  out.push(...blank(4))
  out.push(H('Annexe 8 – Questions de votre tutrice'))
  const a8 = ['Résumez ce que signifie « Rassurer » dans la technique des « 4 R »', 'Résumez ce que signifie « Remercier » dans la technique des « 4 R »', 'Résumez ce que signifie « Raccompagner » dans la technique des « 4 R »', 'Résumez ce que signifie « Revoir » dans la technique des « 4 R »']
  out.push(tbl([new TableRow({ children: [cell('Questions', { head: true, width: 50 }), cell('Réponses', { head: true, width: 50 })] }), ...a8.map((q) => new TableRow({ children: [cell(q, { fill: true }), cell('')] }))]))
  out.push(H('Annexe 9 – Phrase de la prise de congé'))
  out.push(...blank(4))
  return out
}

function annexesCorrige() {
  const out = [bandeau('Mission 4 : ANNEXES (CORRIGÉ)')]
  out.push(H("Annexe 1 – Technique de la « peau de l'ours »"))
  out.push(P("« Alors quand seriez-vous disponible pour la pose de votre dressing ? »", { it: true }))
  out.push(H("Annexe 2 – Analyse de l'article"))
  out.push(tbl([
    new TableRow({ children: [cell('Questions', { head: true, width: 38 }), cell('Réponses', { head: true, width: 62 })] }),
    new TableRow({ children: [cell('Conséquence une fois le bon de commande daté et signé ?', { fill: true }), cell("Le bon de commande, une fois signé et daté par le client, implique son accord pour entamer les travaux et le prive ensuite de toute voie de recours concernant le tarif demandé.")] }),
    new TableRow({ children: [cell('Autre moyen que la signature ?', { fill: true }), cell("A défaut d'une signature sur le devis lui-même, le client peut vous faire parvenir une « lettre de bon pour accord », dans laquelle il vous fait connaître explicitement son accord…")] }),
    new TableRow({ children: [cell('Accord oral : le client est-il engagé ?', { fill: true }), cell("Dans tous les cas, un bon de commande non signé par le client ne l'engage en rien, même s'il vous a manifesté verbalement son accord !")] }),
  ]))
  out.push(H('Annexe 3 – Bon de commande'))
  out.push(P('COMMANDE N° 2535753 — Leroy Merlin Daumesnil, 139 avenue Daumesnil, 75012 Paris — Téléphone : 01.33.XX.XX.XX.', { b: true }))
  out.push(P('Coordonnées client : Mme Rebecca Sankouraga — 7 rue Dombasle, 75015 Paris — Tél : 07.06.05.04.XX'))
  out.push(P('Date : 02 avril 202N            Délais de livraison : 30 jours'))
  out.push(tbl([
    new TableRow({ children: [cell('Référence', { head: true, width: 18 }), cell('Libellé article', { head: true, width: 34 }), cell('Quantité', { head: true, width: 12 }), cell('Prix HT', { head: true, width: 18 }), cell('Prix TTC', { head: true, width: 18 })] }),
    new TableRow({ children: [cell('83299641'), cell('Dressing chêne H200 x L240'), cell('1', { align: AlignmentType.CENTER }), cell('1244,05'), cell('1492,86')] }),
  ]))
  out.push(P('Livraison : offerte pour les articles de plus de 1000€', { it: true, size: 18 }))
  out.push(tbl([
    new TableRow({ children: [cell('Taux TVA', { head: true, width: 33 }), cell('Base HT', { head: true, width: 33 }), cell('Montant Total', { head: true, width: 34 })] }),
    new TableRow({ children: [cell('20.00 %', { align: AlignmentType.CENTER }), cell('1244,05', { align: AlignmentType.CENTER }), cell('1492,86', { align: AlignmentType.CENTER })] }),
  ], { w: 60 }))
  out.push(P("Montant de l'avoir (30%) : 447,86 €", { b: true }))
  out.push(H("Annexe 4 – Planning d'intervention Leroy Merlin (corrigé)"))
  out.push(P('Délai de 30 jours à compter du 02 avril 202N (hors dimanches et jours fériés) → créneau retenu : mardi 2 mai 202N après-midi.', { b: true }))
  const remp = { 'MAI 202N-2-aprem': 'Mme Sankouraga - Installation et aménagement de dressing' }
  PLANNING_MOIS.forEach((m) => { out.push(planningTable(m, remp)); out.push(P('')) })
  out.push(H('Annexe 5 – Reconstitution des étapes de la livraison'))
  ;['1. Signature du bon de commande', '2. Préparation du produit', "3. Une semaine avant, appel pour le choix de l'heure du créneau de livraison", '4. SMS de rappel la veille de la livraison', '5. Livraison à votre domicile des articles', '6. Évaluez la livraison sur votre smartphone'].forEach((e) => out.push(P(e, { it: true })))
  out.push(H('Annexe 6 – Énoncé des délais et des étapes de la livraison'))
  out.push(P("« Maintenant que vous avez signé le bon de commande, je vais vous expliquer comment va se passer la suite. Votre dressing va être préparé et sera livré d'ici 30 jours. Une semaine avant la livraison, vous recevrez un appel du service client pour convenir d'un créneau (matin ou après-midi). Ensuite la veille, vous recevrez un SMS qui vous rappellera le créneau de livraison. Enfin, le lendemain, votre dressing sera livré à votre domicile et, une fois que cela sera fait, vous recevrez un SMS pour évaluer la livraison. »", { it: true }))
  out.push(H('Annexe 7 – SMS de rappel'))
  out.push(P("« Bonjour Mme Sankouraga, votre dressing sera livré demain entre 9h et 11h. Merci et à bientôt sur www.leroymerlin.fr »", { it: true }))
  out.push(H('Annexe 8 – Questions de votre tutrice'))
  out.push(tbl([
    new TableRow({ children: [cell('Questions', { head: true, width: 25 }), cell('Réponses', { head: true, width: 75 })] }),
    new TableRow({ children: [cell('Rassurer', { fill: true, b: true }), cell("Vous devez féliciter le client de sa décision. Le client veut être sûr d'avoir fait le bon choix… Rappelez-lui votre disponibilité, votre engagement afin de pérenniser votre relation.")] }),
    new TableRow({ children: [cell('Remercier', { fill: true, b: true }), cell("En cas de vente, vous devez remercier le client de la confiance qu'il vous a accordé tout au long du processus d'achat...")] }),
    new TableRow({ children: [cell('Raccompagner', { fill: true, b: true }), cell("Il s'agit de clore le rendez-vous en développant une relation privilégiée. La politesse est l'attitude à adopter pour montrer du respect. Raccompagnez le client si c'est vous qui l'avez reçu.")] }),
    new TableRow({ children: [cell('Revoir', { fill: true, b: true }), cell("Il faut avant tout montrer que vous restez à la disposition du client, par exemple en lui remettant votre carte de visite.")] }),
  ]))
  out.push(H('Annexe 9 – Phrase de la prise de congé'))
  out.push(P("« Vous avez vraiment fait un excellent choix. C'est un très beau dressing que vous avez choisi (Rassurer) et je vous remercie d'être venu chez Leroy Merlin (Remercier). Allez-y ! Je vous raccompagne (Raccompagner). Après l'installation, je vous passerai un petit coup de fil pour savoir si tout s'est bien passé (Revoir). »", { it: true }))
  return out
}

function syntheseAuto() {
  return [
    bandeau('Mission 4 : SYNTHÈSE'),
    P("L'exécution de la vente", { b: true }),
    bullet("L'accord du client — 3 techniques de conclusion → La peau de l'ours"),
    bullet('Le suivi de la livraison : 1. Signature du bon de commande … 5. Livraison à domicile des articles … 6. Évaluation par SMS'),
    bullet('La prise de congé — La technique des 4 R → Rassurer, Remercier, Raccompagner, Revoir'),
    bandeau('Mission 4 : AUTO-ÉVALUATION'),
    P('Évaluez votre compréhension des exercices de la mission 4 ainsi que votre niveau de difficulté pour le réaliser.'),
    tbl([
      new TableRow({ children: [cell('Insuffisant', { head: true, width: 25 }), cell('Fragile', { head: true, width: 25 }), cell('Satisfaisant', { head: true, width: 25 }), cell('Maîtrisé', { head: true, width: 25 })] }),
      new TableRow({ children: [cell(''), cell(''), cell(''), cell('')] }),
    ]),
  ]
}

// Donnees planning partagees (memes que l'app)
const PLANNING_MOIS = [
  { titre: 'AVRIL 202N', decalage: 0, nbJours: 30, creneaux: [
    { jour: 1, creneau: 'matin', texte: 'M. LEROY - Remplacer un chauffe-eau' }, { jour: 1, creneau: 'aprem', texte: "M. et Mme SIMON - Installation d'un robot tondeuse" },
    { jour: 2, creneau: 'matin', texte: 'M. CARPENTIER - Installation WC' }, { jour: 2, creneau: 'aprem', texte: "M. SANCHEZ - Installation adoucisseur d'eau" },
    { jour: 3, creneau: 'matin', texte: 'M HUET - Entretien et ramonage poêle à bois' }, { jour: 3, creneau: 'aprem', texte: 'M BERNARD - Pose porte de garage avec portillon intégré' },
    { jour: 4, creneau: 'matin', texte: 'M VASSEUR - Installation climatiseur monobloc' }, { jour: 4, creneau: 'aprem', texte: 'M MOREL - Installation et aménagement de dressing' },
    { jour: 5, creneau: 'matin', texte: 'M PEREZ - Installation cuisine' }, { jour: 5, creneau: 'aprem', texte: 'M DUPUIS - Isolation de comble' },
    { jour: 6, creneau: 'matin', texte: 'M RICHARD - Installation alarme maison' }, { jour: 6, creneau: 'aprem', texte: 'M GIRARD - Pose et installation de baignoire' },
    { jour: 8, creneau: 'aprem', texte: 'M MULLER - Pose de parquet stratifié' },
    { jour: 9, creneau: 'matin', texte: 'M DUPONT - Pose de plan de travail cuisine' }, { jour: 9, creneau: 'aprem', texte: 'M LEFEVRE - Pose de bloc porte intérieur' },
    { jour: 10, creneau: 'matin', texte: 'M LAMBERT - Pose flottante de dalles' }, { jour: 10, creneau: 'aprem', texte: 'M FAURE - Pose de verrière de 4 à 7 carreaux' },
    { jour: 11, creneau: 'matin', texte: "M FONTAINE - Pose de baignoir d'angle" }, { jour: 11, creneau: 'aprem', texte: 'M MERCIER - Installation et aménagement de dressing' },
    { jour: 12, creneau: 'matin', texte: 'M ROUSSEAU - Installation climatiseur monobloc' },
    { jour: 13, creneau: 'matin', ferie: true }, { jour: 13, creneau: 'aprem', ferie: true },
    { jour: 15, creneau: 'matin', texte: 'M BOYER - Installation WC' },
    { jour: 16, creneau: 'matin', texte: 'M CHEVALIER - Remplacer un chauffe-eau' }, { jour: 16, creneau: 'aprem', texte: 'M GARNIER - Isolation de comble' },
    { jour: 17, creneau: 'matin', texte: 'M LEGRAND - Installation WC' }, { jour: 17, creneau: 'aprem', texte: "M GAUTIER - Installation d'un robot tondeuse" },
    { jour: 18, creneau: 'matin', texte: 'M PERRIER - Pose porte de garage avec portillon intégré' }, { jour: 18, creneau: 'aprem', texte: 'M GARCIAS - Pose de verrière de 4 à 7 carreaux' },
    { jour: 19, creneau: 'aprem', texte: "M BARRE - Pose de baignoir d'angle" },
    { jour: 22, creneau: 'matin', texte: 'M MARCHAND - Pose de verrière de 4 à 7 carreaux' }, { jour: 22, creneau: 'aprem', texte: 'M DUVAL - Pose de plan de travail cuisine' },
    { jour: 24, creneau: 'matin', texte: 'M MEYER - Pose de bloc porte intérieur' }, { jour: 24, creneau: 'aprem', texte: 'M DUMONT - Pose porte de garage avec portillon intégré' },
    { jour: 25, creneau: 'matin', texte: 'M DUFOUR - Pose et installation de baignoire' }, { jour: 25, creneau: 'aprem', texte: 'M MEUNIER - Installation WC' },
    { jour: 26, creneau: 'matin', texte: 'M PELLETIER - Isolation de comble' }, { jour: 26, creneau: 'aprem', texte: 'M LE GOLF - Installation et aménagement de dressing' },
    { jour: 27, creneau: 'matin', texte: 'M LEBRUN - Pose de parquet stratifié' },
    { jour: 29, creneau: 'matin', texte: 'M HAMON - Remplacer un chauffe-eau' }, { jour: 29, creneau: 'aprem', texte: 'M MALLET - Pose flottante de dalles' },
  ] },
  { titre: 'MAI 202N', decalage: 3, nbJours: 31, creneaux: [
    { jour: 1, creneau: 'matin', ferie: true }, { jour: 1, creneau: 'aprem', ferie: true },
    { jour: 3, creneau: 'matin', texte: 'M ROBERT - Installation alarme maison' },
    { jour: 8, creneau: 'matin', ferie: true }, { jour: 8, creneau: 'aprem', ferie: true },
    { jour: 9, creneau: 'matin', texte: 'M GILLET - Installation cuisine' },
    { jour: 13, creneau: 'matin', texte: 'M PERROT' },
    { jour: 14, creneau: 'aprem', texte: 'M LACROIX - Remplacer un chauffe-eau' },
    { jour: 17, creneau: 'aprem', texte: 'M GUICHARD - Entretien et ramonage poêle à bois' },
    { jour: 22, creneau: 'aprem', texte: "M CORDIER - Installation d'un robot tondeuse" },
    { jour: 25, creneau: 'matin', ferie: true }, { jour: 25, creneau: 'aprem', ferie: true },
    { jour: 27, creneau: 'matin', texte: 'M FABRE - Installation climatiseur monobloc' }, { jour: 27, creneau: 'aprem', texte: 'M BICHON - Remplacer un chauffe-eau' },
  ] },
]

async function build(corrige) {
  const children = [...entete(), ...consignes(), ...documents()]
  children.push(...(corrige ? annexesCorrige() : annexesEleve()))
  children.push(...syntheseAuto())
  const doc = new Document({ styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } }, sections: [{ properties: { page: { size: { orientation: 'landscape' }, margin: { top: 600, bottom: 600, left: 600, right: 600 } } }, children }] })
  const buf = await Packer.toBuffer(doc)
  const name = corrige ? 'Corrige - LEROY MERLIN - M4.docx' : 'LEROY MERLIN - M4.docx'
  fs.writeFileSync(`${OUT}/${name}`, buf)
  console.log('OK', name)
}

;(async () => { await build(false); await build(true) })()
