/* Generateur Word - ORPI Guy Mo\u0302quet - Missions 1 a 4 (rouge Orpi #E2001A)
   Pilote par src/data/contenus.ts (source de verite). Genere pour chaque
   mission une fiche eleve + un corrige. Les mises en situation par activite
   (champ contexte) sont rendues en italique sous le titre d'activite. */
const fs = require('fs')
const ts = require('typescript')
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
} = require('docx')

const ROUGE = 'E2001A'
const ROUGEF = 'FBE3E6'
const GRIS = '4B5563'
const OUT = '/mnt/user-data/outputs'

// ---- charge les donnees reelles depuis contenus.ts -------------------------
const srcTs = fs.readFileSync('src/data/contenus.ts', 'utf8')
const transpiled = ts.transpileModule(srcTs, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
}).outputText
const tmp = '/tmp/orpigen/_contenus_run.cjs'
fs.mkdirSync('/tmp/orpigen', { recursive: true })
fs.writeFileSync(tmp, transpiled)
const DATA = require(tmp)

// ---- helpers docx ----------------------------------------------------------
function H(txt, opts = {}) {
  return new Paragraph({ spacing: { before: 220, after: 120 }, children: [new TextRun({ text: txt, bold: true, size: opts.size || 28, color: opts.color || ROUGE })] })
}
function P(txt, opts = {}) {
  return new Paragraph({ spacing: { after: 100 }, alignment: opts.align, children: [new TextRun({ text: txt, size: opts.size || 22, italics: !!opts.it, bold: !!opts.b, color: opts.color })] })
}
function bullet(txt, opts = {}) {
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: txt, size: 22, bold: !!opts.b })] })
}
function cell(txt, opts = {}) {
  const lines = String(txt).split('\n')
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.head ? { type: ShadingType.SOLID, color: ROUGE } : (opts.fill ? { type: ShadingType.SOLID, color: ROUGEF } : undefined),
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    children: lines.map((l) => new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: l, bold: opts.head || opts.b, color: opts.head ? 'FFFFFF' : undefined, size: 21 })] })),
  })
}
function tbl(rows) {
  const b = { style: BorderStyle.SINGLE, size: 4, color: 'D9C2C5' }
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b }, rows })
}
function blank(n) {
  const out = []
  for (let i = 0; i < n; i++) out.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D9C2C5', space: 6 } }, spacing: { after: 150 }, children: [new TextRun('')] }))
  return out
}
function bandeau(txt) {
  return new Paragraph({ shading: { type: ShadingType.SOLID, color: ROUGE }, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: txt, bold: true, color: 'FFFFFF', size: 24 })] })
}

// ---- corriges des diapositives (valeurs tirees des dialogues sources) -------
// Cle : missionId -> { cleChamp : valeur }. Seules M1 et M3 ont un PowerPoint.
const CORRIGES = {
  'orpi-m1': {
    nom: 'Orpi Guy Mo\u0302quet', creation: '2012', forme: 'SARL', effectif: '10 collaborateurs',
    reseau: 'Re\u0301seau Orpi (notorie\u0301te\u0301 nationale)', ca: 'Environ 2 millions d\u2019euros par an (fluctuant)',
    activite: 'Vente de biens immobiliers ; gestion locative ; accompagnement des investisseurs.',
    zone: 'Zone cible\u0301e autour du 17e arrondissement de Paris, e\u0301largie aux arrondissements voisins (18e, 9e). Clients des quartiers environnants et investisseurs de la re\u0301gion parisienne.',
    typologie: 'Particuliers (achat ou location pour habiter) et investisseurs (biens a\u0300 re\u0301nover ou en gestion locative).',
    caracteristiques: 'Tranche d\u2019a\u0302ge principale : 30 a\u0300 45 ans. Jeunes couples et professionnels cherchant a\u0300 s\u2019installer dans un quartier calme et accessible financie\u0300rement a\u0300 Paris.',
    soncase: 'Se\u0301curite\u0301 (quartier calme), Argent (accessibilite\u0301 financie\u0300re), Nouveaute\u0301 (premier achat), parfois Orgueil et Sympathie.',
    forces: 'Re\u0301putation locale ; fide\u0301lite\u0301 des clients ; bouche-a\u0300-oreille ; e\u0301quipe compe\u0301tente, re\u0301active et attache\u0301e a\u0300 la qualite\u0301 de service.',
    faiblesses: 'Absence d\u2019approche nume\u0301rique de la relation client ; outils trop classiques, peu adapte\u0301s aux jeunes ge\u0301ne\u0301rations.',
    opportunites: 'Programme immobilier d\u2019une cinquantaine d\u2019appartements en construction a\u0300 proximite\u0301.',
    menaces: 'Augmentation des taux d\u2019inte\u0301re\u0302t, qui peut freiner les achats immobiliers.',
    directs: 'Century 21 (en face du me\u0301tro Guy Mo\u0302quet, tre\u0300s pre\u0301sent sur les re\u0301seaux sociaux) ; L\u2019Adresse (tre\u0300s compe\u0301titive en prix).',
    indirects: 'Sites internet d\u2019annonces immobilie\u0300res (ex. Seloger.com).',
    exemples: 'Demandes sur les prix des biens et la disponibilite\u0301 des appartements en vente ou en location (te\u0301le\u0301phone, mail, face-a\u0300-face).',
    traitement: 'Re\u0301ponse rapide et personnalise\u0301e : de\u0301tails pre\u0301cis, photos et visites virtuelles quand c\u2019est possible. Un suivi de qualite\u0301 renforce la relation client et la fide\u0301lite\u0301.',
    methodes: 'Compte Instagram (inutilise\u0301 depuis plusieurs mois) ; syste\u0300me de parrainage re\u0301compensant les \u00ab apporteurs d\u2019affaires \u00bb.',
    constat: 'Le compte Instagram de l\u2019agence n\u2019est plus anime\u0301 depuis plusieurs mois, alors qu\u2019un fort potentiel nume\u0301rique reste inexploite\u0301 pour fide\u0301liser une cliente\u0300le plus jeune.',
    problematique: 'Comment l\u2019agence Orpi Guy Mo\u0302quet peut-elle moderniser sa relation client gra\u0302ce au nume\u0301rique afin de fide\u0301liser et de de\u0301velopper sa cliente\u0300le ?',
    actions: 'Action 1 : re\u0301activer et animer le compte Instagram (objectif : moderniser l\u2019image, toucher une cliente\u0300le plus jeune). Action 2 : relancer le syste\u0300me de parrainage (objectif : de\u0301velopper la cliente\u0300le par recommandation).',
  },
  'orpi-m3': {
    nom_action: 'Mise a\u0300 jour et animation du compte Instagram de l\u2019agence.',
    cible_objectifs: 'Cible : jeunes couples et investisseurs immobiliers connecte\u0301s. Objectifs : renforcer l\u2019image de l\u2019agence, garder le contact avec les clients et accroi\u0302tre la visibilite\u0301.',
    outils_contraintes: 'Outils : re\u0301seaux sociaux (Instagram), cre\u0301ation de contenu, planification des publications. Contraintes : de\u0301lais (environ 5 heures par semaine), collaboration avec Virginie pour photos et informations, budget limite\u0301 (temps et effort).',
    etapes_role: 'Audit du compte existant ; cre\u0301ation d\u2019un calendrier e\u0301ditorial ; cre\u0301ation et publication du contenu ; interaction avec les abonne\u0301s ; analyse des re\u0301sultats. Ro\u0302le de Maxime : calendrier e\u0301ditorial, gestion des publications, participation a\u0300 l\u2019analyse des re\u0301sultats.',
    rebond: 'Visites prive\u0301es ou virtuelles, suivi personnalise\u0301 par e-mail, proposition d\u2019un service de gestion locative aux investisseurs inte\u0301resse\u0301s.',
    sic: 'Ajout au CRM des interactions Instagram (messages, nouveaux abonne\u0301s) avec leurs pre\u0301fe\u0301rences (type de bien, zone ge\u0301ographique) pour personnaliser et cibler les relances.',
    indicateurs: 'Quantitatifs : +20 % de vues, publication a\u0300 350 vues et 50 likes (contre 100 vues et 15 likes avant), +10 % d\u2019abonne\u0301s en deux semaines, 5 visites en agence dont 3 rendez-vous. Qualitatifs : retours et satisfaction des clients sur les publications.',
    suggestions: 'Ame\u0301liorer la re\u0301gularite\u0301 des publications, varier les formats (photos, vide\u0301os, te\u0301moignages), re\u0301pondre plus vite aux messages et soigner la qualite\u0301 visuelle des posts.',
  },
}
// correspondance cle de diapo -> cle de corrige (les cles de champ peuvent
// differer selon les diapos ; on tente cle directe puis quelques alias).
function valeurCorrige(missionId, cle) {
  const c = CORRIGES[missionId] || {}
  if (c[cle] != null) return c[cle]
  const alias = {
    'action': 'nom_action', 'nomaction': 'nom_action', 'cible': 'cible_objectifs',
    'objectifs': 'cible_objectifs', 'outils': 'outils_contraintes', 'contraintes': 'outils_contraintes',
    'etapes': 'etapes_role', 'role': 'etapes_role', 'venterebond': 'rebond', 'enrichissementsic': 'sic',
    'quanti': 'indicateurs', 'quali': 'indicateurs',
  }
  return c[alias[cle]] || ''
}

// ---- rendu d'un bloc document ----------------------------------------------
function renderBloc(b) {
  const out = []
  if (b.intertitre) out.push(P(b.intertitre, { b: true, color: ROUGE }))
  if (b.paragraphes) b.paragraphes.forEach((p) => out.push(P(p)))
  if (b.puces) b.puces.forEach((p) => out.push(bullet(p)))
  if (b.dialogue) b.dialogue.forEach((d) => out.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: d.locuteur + ' : ', bold: true, size: 22, color: GRIS }), new TextRun({ text: d.texte, size: 22 })] })))
  return out
}

// ---- rendu d'une annexe (eleve / corrige) ----------------------------------
function renderAnnexe(missionId, a, corrige) {
  const out = []
  out.push(H(a.titre))
  if (a.type === 'powerpoint') {
    a.diapos.forEach((d) => {
      if (d.garde) {
        out.push(P(d.titre, { b: true }))
        ;(d.mentions || []).forEach((m) => out.push(P(m, { align: 'center' })))
        return
      }
      out.push(P(d.titre + (d.intitule ? ' \u2014 ' + d.intitule : ''), { b: true }))
      if (d.competence) out.push(P('Compe\u0301tence travaille\u0301e : ' + d.competence, { it: true, size: 20, color: GRIS }))
      const champs = d.champs || []
      if (corrige) {
        champs.forEach((ch) => {
          const v = valeurCorrige(missionId, ch.cle)
          out.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: (ch.libelle ? ch.libelle + ' : ' : ''), bold: true, size: 21 }), new TextRun({ text: v || '\u2026', size: 21, color: '1A7A3A' })] }))
        })
      } else {
        champs.forEach((ch) => {
          out.push(P((ch.libelle ? ch.libelle + ' :' : ''), { b: true, size: 21 }))
          out.push(...blank(ch.lignes || 1))
        })
      }
    })
  } else if (a.type === 'redactionoral') {
    a.sections.forEach((s) => {
      out.push(P(s.libelle, { b: true }))
      if (s.aide) out.push(P(s.aide, { it: true, size: 20, color: GRIS }))
      out.push(...blank(s.lignes || 3))
    })
    if (corrige) out.push(P('Le contenu de l\u2019oral est re\u0301dige\u0301 par l\u2019e\u0301le\u0300ve a\u0300 partir des e\u0301le\u0301ments du PowerPoint des missions pre\u0301ce\u0301dentes ; il n\u2019existe pas de corrige\u0301 unique.', { it: true, color: GRIS }))
  } else if (a.type === 'modeoperatoire') {
    if (a.entete) out.push(P(a.entete, { it: true, color: GRIS }))
    a.etapes.forEach((e, i) => {
      out.push(P((i + 1) + '. ' + e.titre, { b: true }))
      out.push(P(e.description))
    })
  }
  return out
}

// ---- consignes (activites + contextes) -------------------------------------
function renderConsignes(t, corrige) {
  const out = []
  t.activites.forEach((act) => {
    out.push(H(act.titre))
    if (act.contexte) out.push(P(act.contexte, { it: true }))
    act.questions.forEach((q) => {
      if (q.contexteAvant) out.push(P(q.contexteAvant, { it: true }))
      const ress = q.ressources ? '  (' + q.ressources + ')' : ''
      out.push(P(q.numero + '. ' + q.consigne + ress))
    })
  })
  return out
}

// ---- en-tete ---------------------------------------------------------------
function entete(missionNum, t) {
  const titreMission = {
    1: 'La phase pre\u0301paratoire a\u0300 la mise en \u0153uvre d\u2019une action de FDRC',
    2: 'L\u2019oral de la phase pre\u0301paratoire a\u0300 la mise en \u0153uvre de l\u2019action de FDRC',
    3: 'La pre\u0301sentation de la mise en \u0153uvre de l\u2019action de FDRC retenue',
    4: 'L\u2019oral de pre\u0301sentation de la mise en \u0153uvre de l\u2019action de FDRC retenue',
  }[missionNum]
  const out = [
    P('Pre\u0301paration e\u0301preuve E33 \u2014 ORPI GUY MO\u0302QUET \u2014 Mission ' + missionNum, { b: true, color: GRIS }),
    new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: 'Sce\u0301nario Orpi', bold: true, size: 24, color: ROUGE })] }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 60 }, children: [new TextRun({ text: titreMission, bold: true, size: 30, color: ROUGE })] }),
  ]
  if (t.competence) {
    out.push(P('Compe\u0301tences travaille\u0301es :', { b: true }))
    out.push(P(t.competence.detail || t.competence.intitule, { size: 21 }))
  }
  if (t.objectifs && t.objectifs.length) {
    out.push(P('Objectifs :', { b: true }))
    t.objectifs.forEach((o) => out.push(bullet(o)))
  }
  out.push(new Paragraph({ spacing: { before: 120, after: 120 }, children: [new TextRun({ text: 'NOM ET PRE\u0301NOM :', bold: true, size: 22 }), new TextRun({ text: '                                                  Mission ' + missionNum, size: 22 })] }))
  if (t.contexte) out.push(P(t.contexte, { it: true }))
  return out
}

// ---- documents -------------------------------------------------------------
function renderDocuments(t) {
  const out = []
  ;(t.documents || []).forEach((doc) => {
    out.push(bandeau('Document ' + doc.numero + ' \u2014 ' + doc.titre))
    ;(doc.texte || []).forEach((b) => out.push(...renderBloc(b)))
  })
  return out
}

// ---- synthese + auto-eval --------------------------------------------------
function syntheseAuto(missionNum) {
  return [
    bandeau('Mission ' + missionNum + ' : SYNTHE\u0300SE'),
    P('Reportez ici les points cle\u0301s de la mission (notions, me\u0301thode, vocabulaire professionnel).', { it: true, color: GRIS }),
    ...blank(4),
    bandeau('Mission ' + missionNum + ' : AUTO-E\u0301VALUATION'),
    P('E\u0301valuez votre compre\u0301hension des exercices de la mission ' + missionNum + ' ainsi que votre niveau de difficulte\u0301 pour les re\u0301aliser.'),
    tbl([
      new TableRow({ children: [cell('Insuffisant', { head: true, width: 25 }), cell('Fragile', { head: true, width: 25 }), cell('Satisfaisant', { head: true, width: 25 }), cell('Mai\u0302trise\u0301', { head: true, width: 25 })] }),
      new TableRow({ children: [cell(''), cell(''), cell(''), cell('')] }),
    ]),
  ]
}

// ---- build d'une mission ---------------------------------------------------
async function build(missionId, missionNum, corrige) {
  const m = DATA.getContenuMission(missionId)
  const t = m.travaux
  const children = []
  children.push(...entete(missionNum, t))
  children.push(...renderConsignes(t, corrige))
  children.push(...renderDocuments(t))
  ;(t.annexes || []).forEach((a) => children.push(...renderAnnexe(missionId, a, corrige)))
  children.push(...syntheseAuto(missionNum))

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children }],
  })
  const buf = await Packer.toBuffer(doc)
  const name = (corrige ? 'Corrige - ORPI - M' : 'ORPI - M') + missionNum + '.docx'
  fs.writeFileSync(OUT + '/' + name, buf)
  console.log('OK', name)
}

;(async () => {
  const missions = [['orpi-m1', 1], ['orpi-m2', 2], ['orpi-m3', 3], ['orpi-m4', 4]]
  for (const [id, n] of missions) { await build(id, n, false); await build(id, n, true) }
})()
