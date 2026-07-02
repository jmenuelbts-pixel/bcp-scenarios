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
  new Paragraph({children:[new TextRun({text:"Fiche de déroulement — Mission 12 : Le bon de commande et les pratiques illégales",bold:true,size:30,color:VERT})],spacing:{after:120}}),
  new Paragraph({children:[new TextRun({text:'Bac Pro Métiers du Commerce et de la Vente — Option B',italics:true,size:20})],spacing:{after:200}}),
  H('Compétence travaillée'),P("Appliquer la réglementation du bon de commande, de la livraison et des pratiques commerciales.",{after:160}),
  H('Objectifs pédagogiques'),
  bullet("Expliquer l'utilité du bon de commande et ses mentions obligatoires."),
  bullet("Repérer les anomalies d'un bon de commande et les règles applicables."),
  bullet("Conseiller un client en cas de non-respect du délai de livraison."),
  new Paragraph({bullet:{level:0},children:[new TextRun({text:"Distinguer les pratiques commerciales trompeuses et agressives.",size:20})],spacing:{after:160}}),
  H('Déroulement de la séance'),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[
    hr(['Phase','Durée',"Activité de l'élève","Activité de l'enseignant",'Supports']),
    new TableRow({children:[cell('Lancement',{width:14,bold:true,shading:GRIS}),cell('10 min',{width:8,align:AlignmentType.CENTER}),cell("Découvre le bon de commande (doc 1, lecture ou écoute audio).",{width:30}),cell("Présente la mission, propose lire ou écouter le doc 1.",{width:30}),cell('Doc 1 + audio',{width:18})]}),
    new TableRow({children:[cell('Activité 1',{width:14,bold:true,shading:GRIS}),cell('40 min',{width:8,align:AlignmentType.CENTER}),cell("Explique l'utilité (annexe 1), repère les 6 anomalies (annexe 2), conseille les clients sur la livraison (annexe 3).",{width:30}),cell("Guide l'analyse du bon de commande et des cas de livraison.",{width:30}),cell('Doc 1 à 4 + Annexes 1-3',{width:18})]}),
    new TableRow({children:[cell('Activité 2',{width:14,bold:true,shading:GRIS}),cell('35 min',{width:8,align:AlignmentType.CENTER}),cell("Répond aux questions d'Élise (annexe 4), définit la pratique agressive (annexe 5), classe les témoignages (annexe 6).",{width:30}),cell("Explique trompeuse/agressive, accompagne le classement.",{width:30}),cell('Doc 5 à 7 + Annexes 4-6',{width:18})]}),
    new TableRow({children:[cell('Synthèse',{width:14,bold:true,shading:GRIS}),cell('15 min',{width:8,align:AlignmentType.CENTER}),cell("Complète la carte mentale, s'auto-évalue, réalise le quiz.",{width:30}),cell("Institutionnalise, lance le défi quiz.",{width:30}),cell('Synthèse + Quiz',{width:18})]}),
  ]}),
]}]})

const el=new Document({sections:[{children:[
  new Paragraph({children:[new TextRun({text:'Scénario MCV — PEUGEOT',bold:true,size:20,color:VERT})]}),
  new Paragraph({children:[new TextRun({text:"Mission 12 : Le bon de commande et les pratiques illégales",bold:true,size:30,color:VERT})],spacing:{after:200}}),
  H("Activité 1 — La conclusion du bon de commande et le délai de livraison",24),
  bullet("Expliquez l'utilité du bon de commande. (Lire le document 1, compléter l'annexe 1)"),
  bullet("Retrouvez les 6 informations manquantes sur le bon de commande puis citez la règle qui aurait dû être respectée pour chacune. (Lire les documents 1 et 2, compléter l'annexe 2)"),
  bullet("Indiquez la solution pour le cas de chaque client. (Lire les documents 3 et 4, compléter l'annexe 3)"),
  H("Activité 2 — Les pratiques commerciales illégales",24),
  bullet("Répondez aux questions d'Élise. (Lire le document 5, compléter l'annexe 4)"),
  bullet("Expliquez avec vos propres mots ce qu'est une pratique commerciale agressive. (Lire le document 6, compléter l'annexe 5)"),
  bullet("Après avoir reporté le nom de chaque prospect, cochez trompeuse ou agressive et justifiez. (Lire le document 7, compléter l'annexe 6)"),
  new Paragraph({children:[new TextRun({text:'Mission 12 : ANNEXES',bold:true,size:28,color:ROUGE})],spacing:{before:240,after:120}}),
  H("Annexe 1 — L'utilité du bon de commande"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[hr(["L'utilité du bon de commande"]),...[0,1,2].map(()=>new TableRow({children:[cell('',{width:100})]}))]}),
  H("Annexe 2 — Les anomalies du bon de commande du véhicule Peugeot e-308 Active"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[hr(['Anomalie','Règles à respecter']),
    new TableRow({children:[cell("Exemple : Il manque l'adresse du client",{width:45}),cell("Cela fait partie du chapitre 2 : IDENTITE DU CLIENT",{width:55})]}),
    ...[0,1,2,3,4].map(()=>new TableRow({children:[cell('',{width:45}),cell('Cela fait partie du chapitre ..... :',{width:55})]}))]}),
  H("Annexe 3 — Les solutions proposées"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[hr(["Nom de l'intervenant",'Solutions proposées']),
    ...['Mme Aurore POLAIRE','M. Laurent HOUTAN','Mme FOCHE','Mme TANRIEN','Mme BALIOT','M. Rémi FASOL'].map((n)=>new TableRow({children:[cell(n,{width:30,bold:true}),cell('',{width:70})]}))]}),
  H("Annexe 4 — Réponses aux questions d'Élise"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[hr(['Questions','Vos réponses']),
    ...["Quels sont les articles qui régissent les pratiques commerciales trompeuses ?","Citez les deux types de pratiques commerciales trompeuses.","Expliquez avec vos propres mots ce qu'est une pratique commerciale trompeuse.","Quel est le montant de l'amende en cas de pratique commerciale trompeuse ?","Dans quel cas une pratique commerciale trompeuse peut-elle entraîner 3 ans de prison ?"].map((q)=>new TableRow({children:[cell(q,{width:55}),cell('',{width:45})]}))]}),
  H("Annexe 5 — Définition de la pratique commerciale agressive"),
  P("Expliquez avec vos propres mots : ................................................................................................................"),
  P("................................................................................................................"),
  H("Annexe 6 — Les pratiques trompeuses ou agressives"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[hr(['N°','Nom du client','Trompeuse','Agressive','Justification']),
    ...[1,2,3,4,5,6].map((n)=>new TableRow({children:[cell(String(n),{width:6,align:AlignmentType.CENTER}),cell('',{width:22}),cell('',{width:12,align:AlignmentType.CENTER}),cell('',{width:12,align:AlignmentType.CENTER}),cell('',{width:48})]}))]}),
]}]})

const co=new Document({sections:[{children:[
  new Paragraph({children:[new TextRun({text:'Scénario MCV — PEUGEOT — CORRIGÉ',bold:true,size:20,color:ROUGE})]}),
  new Paragraph({children:[new TextRun({text:"Mission 12 : Le bon de commande et les pratiques illégales",bold:true,size:30,color:VERT})],spacing:{after:200}}),
  H("Annexe 1 — L'utilité du bon de commande (corrigé)"),
  P("Le bon de commande sert à établir une preuve de la vente et à prévenir les éventuelles contestations. Il n'est pas obligatoire mais fortement conseillé, surtout pour une voiture neuve, car il apporte plus de sécurité en cas de litige."),
  H("Annexe 2 — Les 6 anomalies (corrigé)"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[hr(['Anomalie','Règle à respecter']),
    ...[['Il manque le RCS','Chapitre 1 : IDENTITE DE L\'ENTREPRISE'],['Il manque le modèle','Chapitre 5 : DETAILS DE LA COMMANDE'],['Il manque le prix TTC (il n\'y a que le HT)','Chapitre 6 : MONTANT DE LA COMMANDE'],['Il manque le mode de règlement','Chapitre 8 : CONDITIONS DE REGLEMENT'],['Il manque « bon pour pouvoir »','Chapitre 10 : SIGNATURE ET NOM DE L\'ACHETEUR'],['Il manque l\'adresse du client (exemple)','Chapitre 2 : IDENTITE DU CLIENT']].map((r)=>new TableRow({children:[cell(r[0],{width:45,bold:true}),cell(r[1],{width:55})]}))]}),
  H("Annexe 3 — Les solutions proposées (corrigé)"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[hr(["Intervenant",'Solution']),
    ...[['Mme Aurore POLAIRE','Adresser une première lettre recommandée avec AR obligeant le vendeur à livrer dans un nouveau délai (au moins 48 h).'],['M. Laurent HOUTAN','Remboursement fait dans les 14 jours : la loi est respectée, pas de majoration.'],['Mme FOCHE','Remboursement après 37 jours : majoration de 50 % (au-delà de 30 jours).'],['Mme TANRIEN','Attendre au moins 48 h à partir de la réception de la lettre recommandée avant d\'aller plus loin.'],['Mme BALIOT','Le concessionnaire a respecté la loi (14 jours) puisqu\'il a remboursé au bout de 9 jours.'],['M. Rémi FASOL','Le véhicule n\'étant toujours pas livré, adresser une seconde lettre recommandée demandant l\'annulation de la vente.']].map((r)=>new TableRow({children:[cell(r[0],{width:26,bold:true}),cell(r[1],{width:74})]}))]}),
  H("Annexe 4 — Réponses aux questions d'Élise (corrigé)"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[hr(['Question','Réponse']),
    ...[['Articles régissant les pratiques trompeuses','L121-2 à L121-5 du Code de la Consommation'],['Deux types de pratiques trompeuses','Par action / Par omission'],['Définition d\'une pratique trompeuse','Une dissimulation, une omission et la communication d\'informations ambiguës ou fallacieuses susceptibles d\'engendrer la confusion.'],['Montant de l\'amende','Amende de 300 000 euros'],['Cas entraînant 3 ans de prison','Lorsque ces pratiques ont été suivies de la conclusion d\'une ou plusieurs ventes.']].map((r)=>new TableRow({children:[cell(r[0],{width:38,bold:true}),cell(r[1],{width:62})]}))]}),
  H("Annexe 5 — Définition de la pratique agressive (corrigé)"),
  P("Réponse personnelle. Idée attendue : méthode de vente trop « musclée » où le professionnel fait pression sur le client (sollicitations répétées, contrainte physique ou morale, influence injustifiée) pour forcer son consentement, altérer sa liberté de choix ou l'empêcher d'exercer ses droits."),
  H("Annexe 6 — Les pratiques trompeuses ou agressives (corrigé)"),
  new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[hr(['N°','Client','Type','Justification']),
    ...[['1','M. GIRARD','Trompeuse','On veut lui vendre un produit plus cher en prétextant que le premier est défectueux.'],['2','M. LAMBERT','Trompeuse','On lui fait payer une garantie de 2 ans qui commence au moment de l\'achat.'],['3','Mme MULLER','Agressive','Chantage à l\'emploi (le patron dit qu\'il licenciera si elle n\'achète pas).'],['4','Mme FAURE','Trompeuse','On lui a dit que le magasin fermait alors que c\'était faux.'],['5','Mme ROBENE','Agressive','Contrainte physique : le directeur a fermé la porte à clé jusqu\'à la signature.'],['6','Mme MACON','Agressive','Sollicitations répétées et insistantes : nombreux appels par semaine.']].map((r)=>new TableRow({children:[cell(r[0],{width:6,align:AlignmentType.CENTER}),cell(r[1],{width:20,bold:true}),cell(r[2],{width:16,align:AlignmentType.CENTER}),cell(r[3],{width:58})]}))]}),
]}]})

Promise.all([
  save(der,'/mnt/user-data/outputs/PEUGEOT-M12-fiche-deroulement.docx'),
  save(el,'/mnt/user-data/outputs/PEUGEOT-M12-fiche-eleve.docx'),
  save(co,'/mnt/user-data/outputs/PEUGEOT-M12-corrige.docx'),
]).then(()=>console.log('done'))
