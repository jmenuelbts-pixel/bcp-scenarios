const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } = require('docx')
const fs = require('fs')
const VERT='00513B', GRIS='F2F2F2', ROUGE='C00000'
function cell(t,o={}){return new TableCell({width:o.width?{size:o.width,type:WidthType.PERCENTAGE}:undefined,shading:o.shading?{fill:o.shading}:undefined,children:(Array.isArray(t)?t:[t]).map((x)=>new Paragraph({children:[new TextRun({text:x,bold:!!o.bold,color:o.color||'000000',size:o.size||18})],alignment:o.align||AlignmentType.LEFT}))})}
function hr(cols,c){return new TableRow({tableHeader:true,children:cols.map((x)=>cell(x,{bold:true,color:'FFFFFF',shading:c||VERT,align:AlignmentType.CENTER}))})}
function H(t,s,c){return new Paragraph({children:[new TextRun({text:t,bold:true,size:s||24,color:c||VERT})],spacing:{before:120,after:80}})}
function P(t,o={}){return new Paragraph({children:[new TextRun({text:t,size:o.size||20,italics:!!o.i})],spacing:{after:o.after||120}})}
function bullet(t){return new Paragraph({bullet:{level:0},children:[new TextRun({text:t,size:20})]})}
function save(d,n){return Packer.toBuffer(d).then((b)=>{fs.writeFileSync(n,b);console.log('OK',n)})}

const der=new Document({sections:[{children:[
  new Paragraph({children:[new TextRun({text:'Scénario MCV — PEUGEOT',bold:true,size:20,color:VERT})]}),
  new Paragraph({children:[new TextRun({text:"Fiche de déroulement — Mission 13 : Les JPO et la fidélisation de la clientèle",bold:true,size:30,color:VERT})],spacing:{after:120}}),
  new Paragraph({children:[new TextRun({text:'Bac Pro Métiers du Commerce et de la Vente — Option B',italics:true,size:20})],spacing:{after:200}}),
  H('Compétence travaillée'),P("Participer à des actions de fidélisation et à la mesure de la satisfaction client.",{after:160}),
  H('Objectifs pédagogiques'),
  bullet("Repérer les étapes d'organisation d'une Journée Portes Ouvertes."),
  bullet("Sélectionner et justifier des animations adaptées."),
  bullet("Rédiger un compte rendu professionnel par mail."),
  new Paragraph({bullet:{level:0},children:[new TextRun({text:"Expliquer l'intérêt de la fidélisation et créer un questionnaire de satisfaction.",size:20})],spacing:{after:160}}),
  H('Déroulement de la séance'),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[
    hr(['Phase','Durée',"Activité de l'élève","Activité de l'enseignant",'Supports']),
    new TableRow({children:[cell('Lancement',{width:14,bold:true,shading:GRIS}),cell('10 min',{width:8,align:AlignmentType.CENTER}),cell("Découvre le contexte des JPO (doc 1).",{width:30}),cell("Présente la mission et les deux activités.",{width:30}),cell('Doc 1',{width:18})]}),
    new TableRow({children:[cell('Activité 1',{width:14,bold:true,shading:GRIS}),cell('40 min',{width:8,align:AlignmentType.CENTER}),cell("Répond aux questions (annexe 1), choisit 2 animations (annexe 2, carrousel), rédige le compte rendu par mail (annexe 3).",{width:30}),cell("Guide la lecture, accompagne le choix des animations et la rédaction du mail.",{width:30}),cell('Doc 1-2 + Annexes 1-3',{width:18})]}),
    new TableRow({children:[cell('Activité 2',{width:14,bold:true,shading:GRIS}),cell('40 min',{width:8,align:AlignmentType.CENTER}),cell("Explique la fidélisation (annexe 4), répond au directeur (annexe 5), crée le questionnaire puis le met en forme Google Form (annexe 6).",{width:30}),cell("Explique la fidélisation, les types de questions, le tutoriel Google Form.",{width:30}),cell('Doc 3-6 + Annexes 4-6',{width:18})]}),
    new TableRow({children:[cell('Synthèse',{width:14,bold:true,shading:GRIS}),cell('15 min',{width:8,align:AlignmentType.CENTER}),cell("Complète la carte mentale, s'auto-évalue, réalise le quiz.",{width:30}),cell("Institutionnalise, lance le défi quiz.",{width:30}),cell('Synthèse + Quiz',{width:18})]}),
  ]}),
]}]})

const el=new Document({sections:[{children:[
  new Paragraph({children:[new TextRun({text:'Scénario MCV — PEUGEOT',bold:true,size:20,color:VERT})]}),
  new Paragraph({children:[new TextRun({text:"Mission 13 : Les JPO et la fidélisation de la clientèle",bold:true,size:30,color:VERT})],spacing:{after:200}}),
  H("Activité 1 — Les Journées Portes Ouvertes",24),
  bullet("Répondez aux questions de M. Collet. (Lire le document 1, compléter l'annexe 1)"),
  bullet("Par groupe de 2, sélectionnez les 2 animations les plus adaptées et justifiez. (Lire le document 2, compléter l'annexe 2)"),
  bullet("Rédigez un compte rendu à M. Collet depuis stagiaire@concessionpeugeot.fr. (Compléter l'annexe 3)"),
  H("Activité 2 — La fidélisation de la clientèle",24),
  bullet("Expliquez avec vos propres mots ce qu'est la fidélisation. (Lire le document 3, compléter l'annexe 4)"),
  bullet("Répondez aux questions du directeur. (Lire le document 3, compléter l'annexe 5)"),
  bullet("Créez le questionnaire de satisfaction. L'annexe 6 comporte 9 pages : une question par page, en respectant le thème imposé et en choisissant le bon type. Utilisez Suivant/Retour. (Lire les documents 4 et 5, compléter l'annexe 6)"),
  new Paragraph({children:[new TextRun({text:'Mission 13 : ANNEXES',bold:true,size:28,color:ROUGE})],spacing:{before:240,after:120}}),
  H("Annexe 1 — Questions de M. Collet"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[hr(['Questions','Vos réponses']),
    ...["1 - Jusqu'à combien de fois je peux organiser des JPO par an ?","2 - Quel est le but des JPO ?","3 - Quelles sont les 4 étapes à respecter pour organiser ma campagne de communication ?","4 - Quel est l'intérêt primordial d'organiser des JPO ?","5 - Quels sont les 2 moyens de communication les plus utilisés aujourd'hui ?","6 - Une fois qu'on a communiqué, comment faire pour que les clients ne nous oublient pas ?","7 - Comment faire pour donner envie aux prospects d'acheter ?","8 - Quelles actions concrètes pourrait-on mettre en place le jour des JPO ?"].map((q)=>new TableRow({children:[cell(q,{width:55}),cell('',{width:45})]}))]}),
  H("Annexe 2 — Animations proposées"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[hr(['N°',"Nom de l'animation",'Justification de votre choix']),
    ...[1,2].map((n)=>new TableRow({children:[cell(String(n),{width:6,align:AlignmentType.CENTER}),cell('',{width:34}),cell('',{width:60})]}))]}),
  H("Annexe 3 — Compte rendu à M. Collet (mail)"),
  P("De : stagiaire@concessionpeugeot.fr — À : jerome.collet@concessionpeugeot.fr"),
  P("Objet : ................................................................"),
  P("Message : ................................................................................................................"),
  H("Annexe 4 — Expliquez la fidélisation"),
  P("Expliquez avec vos propres mots : ................................................................................................................"),
  H("Annexe 5 — Questions du directeur"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[hr(['Questions','Vos réponses']),
    ...["1 - Pourquoi avoir des ambassadeurs serait un atout ?","2 - Comment mettre en place un parcours client irréprochable ?","3 - À quoi servent les campagnes de SMS ?","4 - Pourquoi est-il important de fidéliser dans l'automobile ?","5 - Quel bénéfice mon entreprise peut-elle tirer de la fidélisation ?","6 - Quels outils digitaux pourrais-je mettre en place ?"].map((q)=>new TableRow({children:[cell(q,{width:55}),cell('',{width:45})]}))]}),
  H("Annexe 6 — Création des questions pour l'enquête de satisfaction"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[hr(['N°','Question de satisfaction','Type / mise en forme Google Form']),
    ...[1,2,3,4,5,6,7,8,9].map((n)=>new TableRow({children:[cell(String(n),{width:6,align:AlignmentType.CENTER}),cell('',{width:54}),cell('',{width:40})]}))]}),
]}]})

const co=new Document({sections:[{children:[
  new Paragraph({children:[new TextRun({text:'Scénario MCV — PEUGEOT — CORRIGÉ',bold:true,size:20,color:ROUGE})]}),
  new Paragraph({children:[new TextRun({text:"Mission 13 : Les JPO et la fidélisation de la clientèle",bold:true,size:30,color:VERT})],spacing:{after:200}}),
  H("Annexe 1 — Questions de M. Collet (corrigé)"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[hr(['Question','Réponse attendue']),
    ...[['1 - Combien de fois par an ?','Jusqu\'à quatre fois par an.'],['2 - But des JPO','Un moment d\'échange et de rencontre qui doit susciter l\'intérêt mais aussi l\'émotion des visiteurs.'],['3 - Les 4 étapes de la communication','Définir l\'objectif ; avoir une idée précise de l\'objet et de la clientèle ; contacter les clients actuels ; viser un public local (médias locaux, réseaux sociaux).'],['4 - Intérêt primordial','Attirer de nouveaux prospects.'],['5 - Les 2 moyens les plus utilisés','Les médias locaux et les réseaux sociaux.'],['6 - Ne pas se faire oublier','Lancer régulièrement des rappels.'],['7 - Donner envie d\'acheter','Laisser une expérience inoubliable ; faire de la concession un lieu interactif de découverte.'],['8 - Actions concrètes le jour J','Créer des animations ou un circuit aménagé pour découvrir les produits autrement.']].map((r)=>new TableRow({children:[cell(r[0],{width:38,bold:true}),cell(r[1],{width:62})]}))]}),
  H("Annexe 2 — Animations proposées (corrigé)"),
  P("Accepter toute réponse cohérente : 2 animations choisies parmi les 10 avec une justification cohérente (public visé, budget, image de marque, effet sur les prospects)."),
  H("Annexe 3 — Compte rendu à M. Collet (corrigé)"),
  P("Le mail part de stagiaire@concessionpeugeot.fr vers jerome.collet@concessionpeugeot.fr, avec un objet clair, un corps reprenant les étapes d'organisation et les 2 animations retenues justifiées, et une formule de politesse. Accepter toute rédaction professionnelle cohérente."),
  H("Annexe 4 — Expliquez la fidélisation (corrigé)"),
  P("Réponse personnelle. Idée : instaurer une relation de confiance durable avec le client, avant, pendant et après l'achat, pour le satisfaire, le faire revenir et assurer la pérennité de l'entreprise."),
  H("Annexe 5 — Questions du directeur (corrigé)"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[hr(['Question','Réponse attendue']),
    ...[['1 - Pourquoi des ambassadeurs ?','Ils portent l\'image du véhicule et de la marque (surtout via les réseaux sociaux) et deviennent des conseillers influents pour les nouveaux clients.'],['2 - Parcours client irréprochable','Personnaliser ses actions, qualité irréprochable dans les conseils, services additionnels gratuits (nettoyage, prêt de véhicule).'],['3 - À quoi servent les SMS ?','Outils de fidélisation qui assurent un suivi proche de la clientèle ; personnalisation recommandée.'],['4 - Pourquoi fidéliser ?','Construire une relation de confiance basée sur l\'empathie et l\'expertise technique et augmenter le chiffre d\'affaires.'],['5 - Quel bénéfice ?','Nouveaux achats, image positive, pérennité de l\'entreprise.'],['6 - Quels outils digitaux ?','Outils d\'accueil et de suivi SAV, configurateur 3D, sites digitalisés, formations des équipes, tablettes contact.']].map((r)=>new TableRow({children:[cell(r[0],{width:36,bold:true}),cell(r[1],{width:64})]}))]}),
  H("Annexe 6 — Questionnaire de satisfaction (corrigé)"),
  P("1 question par thème en respectant le type indiqué (doc 5), puis mise en forme Google Form. Types attendus : concession en général = ouverte ; accessibilité = matrice ; accueil = réponse unique ; ambiance = question ; aménagement de l'espace = ouverte ; choix de produits = évaluation (étoiles) ; conseils = évaluation (étoiles) ; âge = réponse unique ; sexe = alternative. Accepter toute formulation cohérente avec le bon type."),
]}]})

Promise.all([
  save(der,'/mnt/user-data/outputs/PEUGEOT-M13-fiche-deroulement.docx'),
  save(el,'/mnt/user-data/outputs/PEUGEOT-M13-fiche-eleve.docx'),
  save(co,'/mnt/user-data/outputs/PEUGEOT-M13-corrige.docx'),
]).then(()=>console.log('done'))
