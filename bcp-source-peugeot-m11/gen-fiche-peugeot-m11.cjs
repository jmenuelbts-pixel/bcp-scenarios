const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } = require('docx')
const fs = require('fs')
const VERT='00513B', GRIS='F2F2F2', ROUGE='C00000'
function cell(text,opts={}){return new TableCell({width:opts.width?{size:opts.width,type:WidthType.PERCENTAGE}:undefined,shading:opts.shading?{fill:opts.shading}:undefined,children:(Array.isArray(text)?text:[text]).map((t)=>new Paragraph({children:[new TextRun({text:t,bold:!!opts.bold,color:opts.color||'000000',size:opts.size||20})],alignment:opts.align||AlignmentType.LEFT}))})}
function headerRow(cols,color){return new TableRow({tableHeader:true,children:cols.map((c)=>cell(c,{bold:true,color:'FFFFFF',shading:color||VERT,align:AlignmentType.CENTER}))})}
function H(t,s,c){return new Paragraph({children:[new TextRun({text:t,bold:true,size:s||24,color:c||VERT})],spacing:{before:120,after:80}})}
function P(t,o={}){return new Paragraph({children:[new TextRun({text:t,size:o.size||20,italics:!!o.i})],spacing:{after:o.after||120}})}
function bullet(t){return new Paragraph({bullet:{level:0},children:[new TextRun({text:t,size:20})]})}
function save(doc,name){return Packer.toBuffer(doc).then((b)=>{fs.writeFileSync(name,b);console.log('OK',name)})}

const deroulement=new Document({sections:[{children:[
  new Paragraph({children:[new TextRun({text:'Scénario MCV — PEUGEOT',bold:true,size:20,color:VERT})]}),
  new Paragraph({children:[new TextRun({text:"Fiche de déroulement — Mission 11 : Les obligations du commercial avant la vente",bold:true,size:30,color:VERT})],spacing:{after:120}}),
  new Paragraph({children:[new TextRun({text:'Bac Pro Métiers du Commerce et de la Vente — Option B',italics:true,size:20})],spacing:{after:200}}),
  H('Compétence travaillée'),P("C.1.1 — Connaître et appliquer les obligations légales du commercial automobile avant la vente.",{after:160}),
  H('Objectifs pédagogiques'),
  bullet("Identifier les mentions obligatoires d'affichage (véhicule neuf et occasion)."),
  bullet("Repérer les erreurs d'affichage sur les affiches des véhicules."),
  new Paragraph({bullet:{level:0},children:[new TextRun({text:"Expliquer l'obligation d'information et conseiller un client.",size:20})],spacing:{after:160}}),
  H('Contexte'),P("Dernière semaine de PFMP, affecté deux jours au service juridique. Élise présente l'obligation d'affichage ; le tuteur Paul apporte deux témoignages illustrant l'obligation d'information.",{after:200}),
  H('Déroulement de la séance'),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[
    headerRow(['Phase','Durée',"Activité de l'élève","Activité de l'enseignant",'Supports']),
    new TableRow({children:[cell('Lancement',{width:14,bold:true,shading:GRIS}),cell('10 min',{width:8,align:AlignmentType.CENTER}),cell("Prend connaissance du contexte (lecture ou écoute audio).",{width:30}),cell("Présente la mission, propose lire/écouter.",{width:30}),cell('Contexte + audio',{width:18})]}),
    new TableRow({children:[cell('Activité 1',{width:14,bold:true,shading:GRIS}),cell('30 min',{width:8,align:AlignmentType.CENTER}),cell("Répond aux questions d'Élise (annexe 1) et retrouve les erreurs d'affichage (annexe 2, carrousel des véhicules).",{width:30}),cell("Guide la lecture du document 1, accompagne l'observation des affiches.",{width:30}),cell('Documents 1 et 2 + Annexes 1-2',{width:18})]}),
    new TableRow({children:[cell('Activité 2',{width:14,bold:true,shading:GRIS}),cell('25 min',{width:8,align:AlignmentType.CENTER}),cell("Conseille les 2 cas clients dans la bulle (annexe 3).",{width:30}),cell("Explique l'obligation d'information et le délai de 5 ans.",{width:30}),cell('Document 3 + Annexe 3',{width:18})]}),
    new TableRow({children:[cell('Synthèse',{width:14,bold:true,shading:GRIS}),cell('15 min',{width:8,align:AlignmentType.CENTER}),cell("Complète la carte mentale, s'auto-évalue, réalise le quiz.",{width:30}),cell("Institutionnalise, lance le défi quiz.",{width:30}),cell('Synthèse + Quiz',{width:18})]}),
  ]}),
]}]})

const eleve=new Document({sections:[{children:[
  new Paragraph({children:[new TextRun({text:'Scénario MCV — PEUGEOT',bold:true,size:20,color:VERT})]}),
  new Paragraph({children:[new TextRun({text:"Mission 11 : Les obligations du commercial avant la vente",bold:true,size:30,color:VERT})],spacing:{after:200}}),
  H("Activité 1 — L'obligation d'affichage du commercial automobile",26),
  bullet("Répondez aux questions d'Élise. (Lire le document 1, compléter l'annexe 1)"),
  bullet("Retrouvez les erreurs qui se sont glissées sur l'ensemble des affiches présentes près des véhicules. (Lire le document 1, observer le document 2, compléter l'annexe 2)"),
  H("Activité 2 — L'obligation d'information du commercial automobile",26),
  bullet("Pour chacun des cas exposés, conseillez les clients sur ce qu'ils peuvent faire ou pas. (Lire le document 3, compléter l'annexe 3)"),
  new Paragraph({children:[new TextRun({text:'Mission 11 : DOCUMENTS',bold:true,size:28,color:ROUGE})],spacing:{before:240,after:120}}),
  H("Document 1 — Quel affichage obligatoire en concession automobile ?"),
  P("Affichage du prix et autres mentions pour les véhicules neufs — une étiquette apposée sur les véhicules ou située à proximité doit lister :"),
  bullet("le prix de vente en euros TTC (TVA à 20%, frais de mise en route, préparation, mise à disposition),"),
  bullet("la dénomination du véhicule vendu (marque, type, modèle, version),"),
  bullet("le niveau des émissions de CO2,"),
  bullet("la consommation de carburant."),
  P("Affichage tarif pour les véhicules d'occasion :"),
  bullet("le prix final en euros TTC, hors coût de la carte grise,"),
  bullet("la dénomination du véhicule vendu (marque, type, modèle, version),"),
  bullet("le kilométrage total parcouru s'il peut être justifié, ou à défaut le kilométrage au compteur avec la mention « non garanti »."),
  H("Document 2 — Les affiches des véhicules en concession"),
  P("Dans l'application, ce document est un carrousel : un véhicule par page, avec les boutons Suivant et Retour. Quatre affiches à observer (une comporte volontairement des erreurs à repérer)."),
  H("Document 3 — Le devoir général d'information du vendeur"),
  P("En vertu de l'article 1112-1 du Code civil, le vendeur professionnel doit informer l'acheteur des antécédents du véhicule. Ne rien dire est systématiquement fautif. En cas de manquement, le client peut demander l'annulation de la vente devant les tribunaux dans un délai de 5 ans, avec d'éventuels dommages et intérêts."),
  new Paragraph({children:[new TextRun({text:'Mission 11 : ANNEXES',bold:true,size:28,color:ROUGE})],spacing:{before:240,after:120}}),
  H("Annexe 1 — Les réponses aux questions d'Élise"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[headerRow(['Questions','Vos réponses']),
    ...["Quel est l'article qui régit l'obligation d'information du vendeur ?","Retrouvez la phrase qui résume en quoi consiste cette obligation du vendeur.","Le commercial automobile peut-il ignorer l'origine du véhicule vendu ?"].map((q)=>new TableRow({children:[cell(q,{width:50}),cell('',{width:50})]}))]}),
  H("Annexe 2 — Les erreurs d'affichage"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[headerRow(['Véhicule concerné','Erreur constatée']),...[0,1,2,3,4,5].map(()=>new TableRow({children:[cell('',{width:35}),cell('',{width:65})]}))]}),
  H("Annexe 3 — Les cas clients"),
  P("Cas n°1 — M. Chevillot : « Quand j'ai acheté mon véhicule d'occasion, le vendeur m'avait dit qu'il n'avait qu'un an. En lisant les papiers je me suis rendu compte qu'il avait en fait 3 ans. Je suis déçu et je ne veux plus de ce véhicule. »",{i:true}),
  P("Votre conseil : ................................................................................................................"),
  P("Cas n°2 — Mme Carlon : « Je suis furieuse : il y a 6 ans j'ai acheté un véhicule neuf à mon fils, 32 000 €. Le commercial m'avait affirmé qu'il l'avait acheté chez le constructeur. Or on s'est rendu compte qu'il nous avait vendu une occasion, ce qui fait que je n'aurais pas dû le payer aussi cher. »",{i:true}),
  P("Votre conseil : ................................................................................................................"),
]}]})

const corrige=new Document({sections:[{children:[
  new Paragraph({children:[new TextRun({text:'Scénario MCV — PEUGEOT — CORRIGÉ',bold:true,size:20,color:ROUGE})]}),
  new Paragraph({children:[new TextRun({text:"Mission 11 : Les obligations du commercial avant la vente",bold:true,size:30,color:VERT})],spacing:{after:200}}),
  H("Annexe 1 — Réponses aux questions d'Élise (corrigé)"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[headerRow(['Question','Réponse attendue']),
    ...[["Quel est l'article qui régit l'obligation d'information ?","L'article 1112-1 du Code civil."],
        ["Phrase qui résume cette obligation.","Ce texte impose au vendeur d'informer l'acheteur des antécédents du véhicule dans la mesure où ils ont une répercussion directe sur l'état d'usure et sur sa valeur sur le marché."],
        ["Le commercial peut-il ignorer l'origine du véhicule ?","Non : il est censé la connaître, ne rien dire est systématiquement fautif."]].map((r)=>new TableRow({children:[cell(r[0],{width:40}),cell(r[1],{width:60})]}))]}),
  H("Annexe 2 — Les erreurs d'affichage (6 erreurs)"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[headerRow(['Véhicule','Erreur']),
    ...[['Voiture violette','Absence du modèle'],['Voiture jaune','Absence du prix TTC (affiché en HT)'],['Voiture orange','Absence du nombre de grammes de CO2'],['Voiture orange','La mention « non garanti » (exigée mais incomplète)'],['Voiture verte','Absence de la version'],['Voiture verte','Absence de la consommation']].map((r)=>new TableRow({children:[cell(r[0],{width:35,bold:true}),cell(r[1],{width:65})]}))]}),
  H("Annexe 3 — Les cas clients (corrigé)"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[headerRow(['Cas','Conseil']),
    ...[["Cas n°1 — M. Chevillot","« Vous pouvez demander l'annulation de la vente ! » L'achat est récent (moins de 5 ans) : le manquement à l'obligation d'information permet l'annulation devant les tribunaux."],
        ["Cas n°2 — Mme Carlon","« On ne peut plus rien faire » : la remise en cause du contrat ne peut se faire que dans les 5 ans, et l'achat date de 6 ans. L'action est prescrite."]].map((r)=>new TableRow({children:[cell(r[0],{width:28,bold:true}),cell(r[1],{width:72})]}))]}),
]}]})

Promise.all([
  save(deroulement,'/mnt/user-data/outputs/PEUGEOT-M11-fiche-deroulement.docx'),
  save(eleve,'/mnt/user-data/outputs/PEUGEOT-M11-fiche-eleve.docx'),
  save(corrige,'/mnt/user-data/outputs/PEUGEOT-M11-corrige.docx'),
]).then(()=>console.log('done'))
