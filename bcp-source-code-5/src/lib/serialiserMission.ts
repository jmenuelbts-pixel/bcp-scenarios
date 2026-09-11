// serialiserMission.ts
// Construit un DocumentPdf riche et structure a partir du contenu d'une mission :
// contexte, documents du dossier (texte integral, tableaux, images), puis
// activites avec leurs questions. En mode 'rempli', insere les reponses de
// l'eleve (en bleu) ; en mode 'vierge', laisse des zones a remplir.

import { getScenario, getMission } from '../data/schema'
import { getContenuMission } from '../data/contenus'
import type { NoeudSynthese } from '../data/contenus'
import { chargerTravail, chargerQuiz } from './eleve'
import { echapper, type DocumentPdf, type SectionPdf } from './pdf'
import type { ModeExport } from './exportExercice'

// Les 6 parties exportables (correspondent aux onglets, quiz/glisser separes).
export type PartieExport = 'travaux' | 'synthese' | 'autoeval' | 'quiz' | 'glisser' | 'journal'

type Bloc = Record<string, unknown>

function p(txt: string): string {
  return `<p>${echapper(txt)}</p>`
}

function tableauHtml(entetes: string[] | undefined, lignes: string[][] | undefined): string {
  if (!Array.isArray(lignes)) return ''
  const thead = entetes && entetes.length ? `<thead><tr>${entetes.map((c) => `<th>${echapper(c)}</th>`).join('')}</tr></thead>` : ''
  const tbody = `<tbody>${lignes.map((l) => `<tr>${(l as string[]).map((c) => `<td>${echapper(String(c ?? ''))}</td>`).join('')}</tr>`).join('')}</tbody>`
  return `<table>${thead}${tbody}</table>`
}

// Rend une section d'un bloc docRiche (fausse page web, en realite du texte).
function rendreSectionRiche(s: Bloc): string {
  const t = s.type as string
  switch (t) {
    case 'titre':
      return `<div class="doc-intertitre" style="font-size:14px">${echapper(String(s.texte ?? ''))}</div>`
    case 'sousTitre':
      return `<div class="doc-intertitre">${echapper(String(s.texte ?? ''))}</div>`
    case 'texte':
    case 'paragraphe':
      return p(String(s.texte ?? ''))
    case 'paragraphes':
      return (s.textes as string[] ?? []).map(p).join('')
    case 'puces':
      return `<ul>${(s.items as string[] ?? []).map((x) => `<li>${echapper(x)}</li>`).join('')}</ul>`
    case 'citation':
      return `<p style="font-style:italic;border-left:3px solid #C9D6E3;padding-left:8px">${echapper(String(s.texte ?? ''))}${s.auteur ? ` — ${echapper(String(s.auteur))}` : ''}</p>`
    case 'note':
      return `<div class="doc-intertitre">${echapper(String(s.titre ?? 'Note'))}</div>`
    case 'chiffres':
      return `<ul>${(s.items as { valeur: string; libelle: string }[] ?? []).map((c) => `<li><b>${echapper(c.valeur)}</b> — ${echapper(c.libelle)}</li>`).join('')}</ul>`
    case 'servicesIcones':
      return `<ul>${(s.services as { titre: string; detail?: string }[] ?? []).map((c) => `<li><b>${echapper(c.titre)}</b>${c.detail ? ` : ${echapper(c.detail)}` : ''}</li>`).join('')}</ul>`
    case 'fiche':
      return tableauHtml(undefined, (s.lignes as { label: string; valeur: string }[] ?? []).map((l) => [l.label, l.valeur]))
    case 'tableau':
      return tableauHtml(s.entetes as string[] | undefined, s.lignes as string[][] | undefined)
    case 'tableaupct':
    case 'grilletarifaire':
    case 'grilleProduits':
      return tableauHtml(s.colonnes as string[] | undefined, s.lignes as string[][] | undefined)
    case 'procedureEtapes':
      return (s.etapes as { titre: string; detail: string }[] ?? []).map((e) => p(`${e.titre} — ${e.detail}`)).join('')
    case 'bulles':
      return (s.bulles as { numero?: string; texte: string }[] ?? []).map((bu) => p(`${bu.numero ? bu.numero + '. ' : ''}${bu.texte}`)).join('')
    case 'bulle':
      return p(String(s.texte ?? ''))
    case 'cartevisite':
      return `<div class="doc-intertitre">${echapper(String(s.titre ?? 'Carte de visite'))}</div>` +
        p([s.entreprise, s.slogan].filter(Boolean).map(String).join(' — '))
    case 'mail':
    case 'courrier':
    case 'redactionoral':
    case 'reformulation':
      return `<div class="doc-intertitre">${echapper(String(s.titre ?? ''))}</div>`
    case 'boncommandecalcule':
    case 'boncommande': {
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? 'Bon de commande'))}</div>`
      if (s.client) h += p(`Client : ${String(s.client)}`)
      if (Array.isArray(s.lignes) && (s.lignes as unknown[]).length) {
        h += tableauHtml(['Désignation', 'Qté', 'PU HT', 'Total HT'], (s.lignes as Record<string, string>[]).map((l) => [l.designation ?? '', String(l.quantite ?? ''), String(l.pu ?? l.prix ?? ''), String(l.total ?? '')]))
      }
      return h
    }
    case 'grille': {
      // Grille a remplir : on rend l'entete + des lignes vides (ou prerempli).
      const cols = s.colonnes as string[] | undefined
      const pre = s.prerempli as string[][] | undefined
      if (pre && pre.length) return tableauHtml(cols, pre)
      const n = Number(s.nbLignes ?? 0) || 0
      const vides = Array.from({ length: n }, () => (cols ?? ['']).map(() => ''))
      return tableauHtml(cols, vides)
    }
    case 'fichesignaletique':
    case 'ficheclient':
    case 'fichecontact':
    case 'ficheappel':
    case 'fichetechnique':
    case 'ficheproduitpro':
    case 'ficheProduitWeb': {
      if (Array.isArray(s.lignes)) return tableauHtml(undefined, (s.lignes as { label?: string; valeur?: string }[]).map((l) => [l.label ?? '', l.valeur ?? '']))
      return `<div class="doc-intertitre">${echapper(String(s.titre ?? ''))}</div>`
    }
    case 'casesservices': {
      const cols = s.colonnes as string[] | undefined
      const n = Number(s.nbLignes ?? 0) || 3
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? s.entete ?? ''))}</div>`
      h += tableauHtml(cols, Array.from({ length: n }, () => (cols ?? ['']).map(() => '')))
      return h
    }
    case 'saisiegeo': {
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? s.entete ?? ''))}</div>`
      if (Array.isArray(s.departements)) h += `<p class="q-ressource">Départements : ${(s.departements as string[]).map(echapper).join(', ')}</p>`
      const n = Number(s.nbLignesInitiales ?? 0) || 6
      h += tableauHtml(['Ville / secteur', 'Département'], Array.from({ length: n }, () => ['', '']))
      return h
    }
    case 'critereseg': {
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? s.entete ?? ''))}</div>`
      if (Array.isArray(s.criteres)) h += tableauHtml(['Critère', 'Analyse'], (s.criteres as string[]).map((c) => [c, '']))
      return h
    }
    case 'qcm':
    case 'unique': {
      let h = `<div class="q-consigne">${echapper(String(s.question ?? ''))}</div>`
      if (Array.isArray(s.options)) h += `<ul>${(s.options as string[]).map((o) => `<li>${echapper(o)}</li>`).join('')}</ul>`
      return h
    }
    case 'vraifaux': {
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? 'Vrai ou faux'))}</div>`
      const lignes = (s.lignes as { affirmation?: string }[] ?? [])
      h += tableauHtml(['Affirmation', 'Vrai', 'Faux'], lignes.map((l) => [l.affirmation ?? '', '', '']))
      return h
    }
    case 'trous':
      return `<div class="q-consigne">${echapper(String(s.texte ?? ''))}</div>`
    case 'appariement': {
      let h = `<div class="q-consigne">${echapper(String(s.question ?? ''))}</div>`
      const g = s.gauche as string[] ?? [], d = s.droite as string[] ?? []
      h += tableauHtml(['Élément', 'À associer à'], g.map((x, i) => [x, d[i] ?? '']))
      return h
    }
    case 'argumentaire':
    case 'cap':
    case 'pratiques': {
      const cols = s.colonnes as string[] | undefined
      const n = Number(s.nbLignes ?? (Array.isArray(s.clients) ? (s.clients as unknown[]).length : 4)) || 4
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? ''))}</div>`
      h += tableauHtml(cols, Array.from({ length: n }, () => (cols ?? ['', '']).map(() => '')))
      return h
    }
    case 'cochage':
    case 'soncase': {
      const lignes = (s.lignes as { libelle?: string }[] ?? [])
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? s.entete ?? ''))}</div>`
      h += tableauHtml([String(s.entete ?? ''), String(s.colonneCoche ?? 'Cochez'), String(s.colonneJustif ?? '')], lignes.map((l) => [l.libelle ?? '', '', '']))
      return h
    }
    case 'soncaspro': {
      const lignes = (s.lignes as { affirmation?: string }[] ?? [])
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? ''))}</div>`
      if (Array.isArray(s.options)) h += `<p class="q-ressource">Mobiles : ${(s.options as string[]).map(echapper).join(', ')}</p>`
      h += tableauHtml(['Affirmation', "Mobile d'achat"], lignes.map((l) => [l.affirmation ?? '', '']))
      return h
    }
    case 'traitobjections':
    case 'objectionscrm': {
      const lignes = (s.lignes as { objection?: string; technique?: string }[] ?? []) 
      const clients = (s.clients as { objection?: string; technique?: string }[] ?? [])
      const src = lignes.length ? lignes : clients
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? s.entete ?? ''))}</div>`
      h += tableauHtml(['Objection', 'Réponse'], src.map((l) => [l.objection ?? '', l.technique ?? '']))
      return h
    }
    case 'tableauappels': {
      const orgs = s.organisations as string[] ?? []
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? s.entete ?? ''))}</div>`
      h += tableauHtml(['Organisation', 'Résultat appel', 'RDV'], orgs.map((o) => [o, '', '']))
      return h
    }
    case 'agenda': {
      const jours = s.jours as string[] ?? []
      const creneaux = s.creneaux as string[] ?? []
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? s.entete ?? ''))}</div>`
      h += tableauHtml(['Horaire', ...jours], creneaux.map((c) => [c, ...jours.map(() => '')]))
      return h
    }
    case 'fichierclients':
    case 'crmclients': {
      const cols = s.colonnes as string[] | undefined
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? s.entete ?? ''))}</div>`
      if (cols) h += tableauHtml(cols, Array.from({ length: Number(s.nbLignes ?? 6) || 6 }, () => cols.map(() => '')))
      else h += `<p class="q-ressource">${echapper(String(s.entete ?? ''))}</p>`
      return h
    }
    case 'grillePersonnes': {
      const pers = s.personnes as { nom?: string; fonction?: string }[] ?? []
      return `<div class="doc-intertitre">${echapper(String(s.titre ?? ''))}</div>` + tableauHtml(['Nom', 'Fonction'], pers.map((p2) => [p2.nom ?? '', p2.fonction ?? '']))
    }
    case 'organigrammearemplir': {
      const noms = s.noms as string[] ?? [], fonctions = s.fonctions as string[] ?? []
      return `<div class="doc-intertitre">${echapper(String(s.titre ?? ''))}</div>` + tableauHtml(['Nom', 'Fonction'], noms.map((nm, i) => [nm, fonctions[i] ?? '']))
    }
    case 'identiteentreprise': {
      const champs = s.champs as { libelle?: string }[] ?? []
      return `<div class="doc-intertitre">${echapper(String(s.titre ?? ''))}</div>` + tableauHtml(undefined, champs.map((c) => [c.libelle ?? '', '']))
    }
    case 'critereseg2':
      return ''
    case 'article': {
      let h = ''
      if (s.titre) h += `<div class="doc-intertitre">${echapper(String(s.titre))}</div>`
      h += (s.paragraphes as string[] ?? []).map(p).join('')
      return h
    }
    case 'modeoperatoire': {
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? s.entete ?? ''))}</div>`
      h += (s.etapes as { titre?: string; description?: string }[] ?? []).map((e) => p(`${e.titre ?? ''} — ${e.description ?? ''}`)).join('')
      if (s.boutonLien) h += `<p class="q-ressource">Lien : ${echapper(String(s.boutonLien))}</p>`
      return h
    }
    case 'compterendu': {
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? s.entete ?? ''))}</div>`
      const ch = s.champsEntete as { label?: string }[] ?? []
      if (ch.length) h += tableauHtml(undefined, ch.map((c) => [c.label ?? '', '']))
      const secs = s.sections as { titre?: string; indice?: string }[] ?? []
      h += secs.map((se) => `<div class="doc-intertitre">${echapper(se.titre ?? '')}</div>${se.indice ? `<p class="q-ressource">${echapper(se.indice)}</p>` : ''}<div class="q-vide"></div>`).join('')
      return h
    }
    case 'faqpro':
    case 'faqreponses':
    case 'faqOnglets': {
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? s.entete ?? ''))}</div>`
      const secs = (s.sections as { titre?: string; questions?: { question?: string }[] }[] ?? [])
      const clients = (s.clients as { question?: string; numero?: string }[] ?? [])
      const rubriques = (s.rubriques as { nom?: string; qr?: { q?: string; r?: string }[] }[] ?? [])
      secs.forEach((se) => { h += `<div class="doc-intertitre">${echapper(se.titre ?? '')}</div>`; (se.questions ?? []).forEach((q) => h += p(String(q.question ?? ''))) })
      clients.forEach((c) => h += p(`${c.numero ? c.numero + '. ' : ''}${c.question ?? ''}`))
      rubriques.forEach((r) => { h += `<div class="doc-intertitre">${echapper(r.nom ?? '')}</div>`; (r.qr ?? []).forEach((qr) => h += p(`${qr.q ?? ''} — ${qr.r ?? ''}`)) })
      return h
    }
    case 'savprisencharge': {
      const lignes = s.lignes as { produit?: string; probleme?: string }[] ?? []
      return `<div class="doc-intertitre">${echapper(String(s.titre ?? s.entete ?? ''))}</div>` + tableauHtml(['Produit', 'Problème', 'Prise en charge'], lignes.map((l) => [l.produit ?? '', l.probleme ?? '', '']))
    }
    case 'pourcentagestepper': {
      const cols = s.colonnes as string[] | undefined
      const etapes = s.etapes as { theme?: string; lignes?: string[] }[] ?? []
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? s.entete ?? ''))}</div>`
      const rows: string[][] = []
      etapes.forEach((e) => (e.lignes ?? []).forEach((l) => rows.push([e.theme ?? '', l, ''])))
      h += tableauHtml(cols, rows)
      return h
    }
    case 'questionnaire':
    case 'questionnairebuilder': {
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? s.entete ?? ''))}</div>`
      const themes = s.themes as string[] ?? []
      if (themes.length) h += `<ul>${themes.map((t2) => `<li>${echapper(t2)}</li>`).join('')}</ul>`
      const parties = s.parties as { titre?: string; items?: { libelle?: string }[] }[] ?? []
      parties.forEach((pa) => { h += `<div class="doc-intertitre">${echapper(pa.titre ?? '')}</div>`; h += `<ul>${(pa.items ?? []).map((it) => `<li>${echapper(it.libelle ?? '')}</li>`).join('')}</ul>` })
      return h
    }
    case 'reponsereseau':
      return `<div class="doc-intertitre">${echapper(String(s.titre ?? ''))}</div>` + `<p class="q-ressource">${echapper(String(s.plateforme ?? ''))}${s.enReponseA ? ' — en réponse à ' + echapper(String(s.enReponseA)) : ''}</p><div class="q-vide"></div>`
    case 'sms':
      return `<div class="doc-intertitre">${echapper(String(s.titre ?? ''))}</div>` + `<p class="q-ressource">${echapper(String(s.entete ?? ''))}${s.date ? ' — ' + echapper(String(s.date)) : ''}</p><div class="q-vide"></div>`
    case 'etatFrais':
      return `<div class="doc-intertitre">${echapper(String(s.titre ?? "État des frais"))}</div>`
    case 'histogramme':
    case 'powerpoint':
    case 'billetTrain':
    case 'resaHotel':
    case 'itineraire':
    case 'packProduit':
    case 'partenaires':
    case 'choixphotos':
    case 'ecarte':
    case 'image':
    case 'argumentaire2':
      return `<div class="doc-intertitre">${echapper(String(s.titre ?? s.nom ?? s.entete ?? ''))}</div>` +
        (s.legende ? `<p class="q-ressource">${echapper(String(s.legende))}</p>` : '') +
        (Array.isArray(s.diapos) ? (s.diapos as { titre?: string; intitule?: string }[]).map((d) => p(`${d.titre ?? ''}${d.intitule ? ' : ' + d.intitule : ''}`)).join('') : '') +
        (Array.isArray(s.consigne) ? (s.consigne as string[]).map(p).join('') : '')
    case 'croc': {
      let h = `<div class="doc-intertitre">${echapper(String(s.titre ?? "Fiche d'appel CROC"))}</div>`
      h += tableauHtml(undefined, [['C — Contact', ''], ['R — Raison', ''], ['O — Objectif', ''], ['C — Conclusion', '']])
      return h
    }
    default:
      // Types non couverts : on tente titre + texte pour ne rien perdre de lisible.
      if (s.titre) return `<div class="doc-intertitre">${echapper(String(s.titre))}</div>`
      if (s.texte) return p(String(s.texte))
      return ''
  }
}

function rendreDocRiche(dr: Bloc): string {
  let html = ''
  if (dr.marque) html += `<div class="doc-intertitre" style="font-size:14px">${echapper(String(dr.marque))}</div>`
  if (Array.isArray(dr.menu)) html += `<p style="color:#6B7280;font-size:11px">${(dr.menu as string[]).map(echapper).join(' · ')}</p>`
  html += (dr.sections as Bloc[] ?? []).map(rendreSectionRiche).join('')
  return html
}

function rendreTexteBlocs(blocs: Bloc[] | undefined, origine: string): string {
  if (!blocs) return ''
  let html = ''
  for (const b of blocs) {
    if (b.pageWeb) continue // simple marqueur visuel (cadre navigateur) : rien a rendre
    if (b.docRiche) { html += rendreDocRiche(b.docRiche as Bloc); continue }
    if (typeof b.intertitre === 'string') html += `<div class="doc-intertitre">${echapper(b.intertitre)}</div>`
    if (Array.isArray(b.paragraphes)) html += (b.paragraphes as string[]).map(p).join('')
    if (Array.isArray(b.puces)) html += `<ul>${(b.puces as string[]).map((x) => `<li>${echapper(x)}</li>`).join('')}</ul>`
    if (Array.isArray(b.dialogue)) {
      html += (b.dialogue as { locuteur?: string; texte: string }[])
        .map((d) => `<p>${d.locuteur ? `<b>${echapper(d.locuteur)} :</b> ` : ''}${echapper(d.texte)}</p>`)
        .join('')
    }
    const mail = b.mailLecture as { de?: string; a?: string; objet?: string; corps?: string[] } | undefined
    if (mail) {
      html += `<div class="doc-intertitre">Message</div>`
      html += p(`De : ${mail.de ?? ''}`) + p(`À : ${mail.a ?? ''}`) + p(`Objet : ${mail.objet ?? ''}`)
      html += (mail.corps ?? []).map(p).join('')
    }
    const proc = b.procedure as { titre1?: string; intro?: string; etapes?: { titre: string; texte: string }[]; alerte?: string[] } | undefined
    if (proc) {
      if (proc.titre1) html += `<div class="doc-intertitre">${echapper(proc.titre1)}</div>`
      if (proc.intro) html += p(proc.intro)
      html += (proc.etapes ?? []).map((e) => p(`${e.titre} — ${e.texte}`)).join('')
      if (proc.alerte) html += (proc.alerte).map(p).join('')
    }
    const tr = b.transcription as { entete?: string; echanges?: { locuteur: string; texte: string }[] } | undefined
    if (tr) {
      if (tr.entete) html += `<div class="doc-intertitre">${echapper(tr.entete)}</div>`
      html += (tr.echanges ?? []).map((e) => p(`${e.locuteur} : ${e.texte}`)).join('')
    }
    const tab = b.tableau as { colonnes?: string[]; lignes?: string[][] } | undefined
    if (tab && Array.isArray(tab.lignes)) {
      html += tableauHtml(tab.colonnes, tab.lignes)
    }
  }
  return html
}

function rendreImages(images: string[] | undefined, origine: string): string {
  if (!images || images.length === 0) return ''
  return images
    .map((src) => {
      const url = src.startsWith('http') ? src : `${origine}${src.startsWith('/') ? '' : '/'}${src}`
      return `<img src="${echapper(url)}" crossorigin="anonymous" />`
    })
    .join('')
}

export async function serialiserMissionPdf(
  scenarioId: string,
  missionId: string,
  mode: ModeExport,
  etudiantId?: string,
  nomEleve?: string,
  options?: { parties?: PartieExport[]; sansDate?: boolean }
): Promise<DocumentPdf | null> {
  const scenario = getScenario(scenarioId)
  const mission = getMission(scenarioId, missionId)
  const contenu = getContenuMission(missionId)
  if (!scenario || !mission || !contenu) return null
  const origine = typeof window !== 'undefined' ? window.location.origin : ''
  const parties = options?.parties ?? ['travaux', 'synthese', 'autoeval', 'quiz', 'glisser', 'journal']
  const inclure = (p: PartieExport) => parties.includes(p)

  // Reponses de l'eleve (mode rempli).
  let saisies: Record<string, string> = {}
  let repSynthese: Record<string, string> = {}
  let repAutoeval: Record<string, string> = {}
  if (mode === 'rempli' && etudiantId) {
    const brut = await chargerTravail(etudiantId, missionId)
    if (brut) {
      try { saisies = JSON.parse(brut) as Record<string, string> } catch { saisies = {} }
    }
    if (inclure('synthese')) {
      const s = await chargerQuiz(etudiantId, missionId, 'synthese')
      if (s && s.reponses && typeof s.reponses === 'object') repSynthese = s.reponses as Record<string, string>
    }
    if (inclure('autoeval')) {
      const a = await chargerQuiz(etudiantId, missionId, 'autoeval')
      if (a && a.reponses && typeof a.reponses === 'object') repAutoeval = a.reponses as Record<string, string>
    }
  }

  const sections: SectionPdf[] = []
  const trav = contenu.travaux

  // ---- DEVOIR A RENDRE : contexte + documents + activites/questions ----
  if (inclure('travaux')) {
    if (trav.contexte) {
      sections.push({ titre: 'Contexte professionnel', htmlLibre: `<div class="contexte-pro">${echapper(trav.contexte)}</div>` })
    }
    if (trav.documents && trav.documents.length > 0) {
      let html = ''
      for (const d of trav.documents) {
        html += `<div class="doc"><div class="doc-titre">Document ${d.numero} — ${echapper(d.titre)}</div>`
        html += rendreImages(d.images, origine)
        html += rendreTexteBlocs(d.texte as Bloc[] | undefined, origine)
        html += `</div>`
      }
      sections.push({ titre: 'Dossier documentaire', htmlLibre: html })
    }
    if (trav.activites && trav.activites.length > 0) {
      for (const act of trav.activites) {
        let html = ''
        if (act.contexte) html += `<div class="q-contexte">${echapper(act.contexte)}</div>`
        for (const q of act.questions) {
          html += `<div class="q">`
          if (q.contexteAvant) html += `<div class="q-contexte">${echapper(q.contexteAvant)}</div>`
          html += `<div class="q-consigne"><b>${q.numero}.</b> ${echapper(q.consigne)}</div>`
          if (q.ressources) html += `<div class="q-ressource">${echapper(q.ressources)}</div>`
          html += `<div class="q-reponse-label">VOTRE RÉPONSE</div>`
          if (mode === 'rempli') {
            const ids = [q.annexeId, q.annexeId2].filter(Boolean) as string[]
            const reps = Object.entries(saisies)
              .filter(([k]) => ids.some((id) => k === id || k.startsWith(id + '.') || k.startsWith(id + '-')))
              .map(([, v]) => v)
              .filter((v) => v && v.trim().length > 0)
            html += reps.length > 0
              ? `<div class="q-reponse">${echapper(reps.join('\n'))}</div>`
              : `<div class="q-reponse">Pas de réponse</div>`
          } else {
            html += `<div class="q-vide"></div>`
          }
          html += `</div>`
        }
        sections.push({ titre: act.titre, htmlLibre: html })
      }
    }
  }

  // ---- SYNTHESE ----
  if (inclure('synthese') && contenu.synthese) {
    const syn = contenu.synthese
    let html = ''
    if (syn.proposition && syn.proposition.length > 0) {
      html += `<p class="q-ressource">Mots à replacer : ${syn.proposition.map(echapper).join(' · ')}</p>`
    }
    const rendreNoeud = (n: NoeudSynthese): string => {
      let h = ''
      if (n.texte !== null && n.texte !== undefined) h += p(n.texte)
      else {
        const rep = repSynthese[n.id]
        h += (mode === 'rempli' && rep && rep.trim().length > 0)
          ? `<div class="q-reponse">${echapper(rep)}</div>`
          : `<div class="q-vide-court"></div>`
      }
      if (n.enfants) h += `<div style="margin-left:14px">${n.enfants.map(rendreNoeud).join('')}</div>`
      return h
    }
    html += rendreNoeud(syn.racine)
    sections.push({ titre: syn.titre || 'Synthèse', htmlLibre: html })
  }

  // ---- AUTO-EVALUATION ----
  if (inclure('autoeval') && contenu.autoEval?.competences?.length) {
    const LIBELLES_NIVEAU: Record<string, string> = { novice: 'Novice', debrouille: 'Débrouillé', averti: 'Averti', expert: 'Expert' }
    const lignes = contenu.autoEval.competences.map((c) => {
      const niv = repAutoeval[c.id]
      return [c.intitule, mode === 'rempli' && niv ? (LIBELLES_NIVEAU[niv] ?? niv) : '']
    })
    sections.push({
      titre: 'Auto-évaluation',
      htmlLibre: `<div class="doc">${tableauHtml(['Compétence', 'Niveau'], lignes)}</div>`,
    })
  }

  // ---- QUIZ ----
  if (inclure('quiz') && contenu.activites?.quiz?.length) {
    let html = ''
    contenu.activites.quiz.forEach((q, i) => {
      html += `<div class="q">`
      if (q.type === 'qcm' || q.type === 'unique') {
        html += `<div class="q-consigne"><b>${i + 1}.</b> ${echapper(q.question)}</div>`
        html += `<ul>${q.options.map((o) => `<li>${echapper(o)}</li>`).join('')}</ul>`
      } else if (q.type === 'trous') {
        html += `<div class="q-consigne"><b>${i + 1}.</b> ${echapper(q.texte)}</div>`
      }
      html += `</div>`
    })
    sections.push({ titre: 'Quiz', htmlLibre: html })
  }

  // ---- GLISSER-DEPOSER ----
  if (inclure('glisser') && contenu.activites?.glisserDeposer) {
    const gd = contenu.activites.glisserDeposer
    let html = `<div class="q-consigne">${echapper(gd.consigne)}</div>`
    html += `<p class="q-ressource">Étiquettes : ${gd.etiquettes.map(echapper).join(' · ')}</p>`
    html += tableauHtml(['Élément', 'Catégorie'], gd.zones.map((z) => [z.libelle, mode === 'rempli' ? gd.etiquettes[z.etiquetteIndex] ?? '' : '']))
    sections.push({ titre: 'Glisser-déposer', htmlLibre: `<div class="doc">${html}</div>` })
  }

  // ---- JOURNAL DE BORD ----
  if (inclure('journal')) {
    sections.push({
      titre: 'Journal de bord',
      htmlLibre: `<div class="q"><div class="q-consigne">Ce qui n'a pas été réussi</div><div class="q-vide"></div></div>` +
        `<div class="q"><div class="q-consigne">Ce qui a été le moins bien réussi</div><div class="q-vide"></div></div>`,
    })
  }

  const pied = `${scenario.nom} — Mission ${mission.numero} : ${mission.titre}`
  return {
    titre: `${scenario.nom} - Mission ${mission.numero} : ${mission.titre}`,
    sousTitre: mode === 'rempli' && nomEleve ? nomEleve : 'Version à compléter',
    sections,
    piedNom: nomEleve ?? '',
    piedContexte: pied,
    sansDate: options?.sansDate === true,
  }
}
