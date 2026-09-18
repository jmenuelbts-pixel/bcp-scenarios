// tutoriel.ts
// Contenu statique du tutoriel, cote professeur et cote eleve, organise en
// themes puis sous-themes, chacun avec des etapes pas-a-pas. Sert a la page
// Tutoriel (recherche + onglets) et a l'export Word.

export interface SousTheme {
  titre: string
  ou: string // ou aller dans l'application
  etapes: string[]
}

export interface ThemeTuto {
  titre: string
  sousThemes: SousTheme[]
}

export const TUTO_PROF: ThemeTuto[] = [
  {
    titre: 'Connexion et sécurité',
    sousThemes: [
      {
        titre: 'Se connecter',
        ou: 'Page de connexion enseignant',
        etapes: [
          'Ouvrez l\'application et choisissez l\'espace professeur.',
          'Saisissez votre adresse email et votre mot de passe.',
          'Cliquez sur « Se connecter ».',
        ],
      },
      {
        titre: 'Activer Face ID sur cet appareil',
        ou: 'Tableau de bord > Sécurité / Face ID',
        etapes: [
          'Connectez-vous d\'abord avec votre mot de passe.',
          'Ouvrez la tuile « Sécurité / Face ID ».',
          'Cliquez sur « Activer Face ID sur cet appareil » et validez avec votre visage.',
          'À la prochaine connexion, l\'icône Face ID apparaîtra sur la page de connexion.',
          'Pour désactiver : revenez sur la même page et cliquez « Ne plus proposer Face ID sur cet appareil ». Le mot de passe reste toujours disponible.',
        ],
      },
      {
        titre: 'Me déconnecter de tous les appareils',
        ou: 'Tableau de bord > Sécurité / Face ID',
        etapes: [
          'Ouvrez la tuile « Sécurité / Face ID ».',
          'En bas, cliquez « Me déconnecter de partout ».',
          'Confirmez : toutes vos sessions ouvertes, sur tous les appareils, sont fermées, y compris celle-ci.',
          'Utile si vous avez peut-être laissé votre session ouverte ailleurs. Reconnectez-vous ensuite normalement.',
        ],
      },
      {
        titre: 'Déconnecter les élèves de partout',
        ou: 'Tableau de bord > Sécurité / Face ID',
        etapes: [
          'Ouvrez la tuile « Sécurité / Face ID ».',
          'Dans « Déconnecter les élèves de partout », choisissez une classe, ou laissez « Toutes les classes ».',
          'Cliquez « Déconnecter les élèves » puis confirmez.',
          'Les élèves concernés sont déconnectés de tous leurs appareils. Pratique quand certains oublient de se déconnecter en fin de cours.',
        ],
      },
    ],
  },
  {
    titre: 'Gestion de la classe',
    sousThemes: [
      {
        titre: 'Créer et gérer des classes et des groupes',
        ou: 'Tableau de bord > Classes et groupes',
        etapes: [
          'Ouvrez la tuile « Classes et groupes ».',
          'En haut, créez une classe (par exemple votre classe entière), renommez-la ou supprimez-la avec les icônes à côté de son nom.',
          'Sélectionnez une classe, puis dans « Groupes de cette classe » tapez un nom (par exemple « Demi-groupe A ») et cliquez « Créer le groupe ». Recommencez pour chaque groupe.',
          'Dans la liste des élèves en bas, cochez le ou les groupes de chaque élève. Un élève peut appartenir à la classe entière et à un demi-groupe en même temps.',
          'Les groupes servent ensuite à filtrer l\'appel, les notes et le déverrouillage : partout où il y a une liste d\'élèves, choisissez la classe puis le groupe.',
        ],
      },
      {
        titre: 'Gérer les comptes élèves',
        ou: 'Tableau de bord > Comptes élèves',
        etapes: [
          'Ouvrez la tuile « Comptes élèves ».',
          'Consultez la liste des comptes, réattribuez une classe ou supprimez un compte.',
        ],
      },
      {
        titre: 'Donner un accès invité (collègue ou inspecteur)',
        ou: 'Tableau de bord > Comptes élèves',
        etapes: [
          'Ouvrez la tuile « Comptes élèves » : le panneau « Collègue ou inspecteur » se trouve en haut.',
          'Choisissez un mot de passe puis créez l\'accès invité. Un compte unique est créé.',
          'Rattachez l\'invité à une classe pour qu\'il voie les scénarios de cette classe.',
          'Vous pouvez désactiver ou réactiver cet accès, ou redéfinir son mot de passe à tout moment.',
        ],
      },
      {
        titre: 'Traiter les demandes d\'inscription',
        ou: 'Tableau de bord > Demandes d\'inscription',
        etapes: [
          'Ouvrez la tuile « Demandes d\'inscription ».',
          'Acceptez ou refusez chaque demande en attente.',
        ],
      },
      {
        titre: 'Déverrouiller un onglet ou un travail',
        ou: 'Tableau de bord > Déverrouillage, ou Suivi des élèves',
        etapes: [
          'Pour ouvrir/fermer des onglets d\'une mission : utilisez la tuile « Déverrouillage ».',
          'Pour rouvrir un travail déjà envoyé (y compris une synthèse), deux endroits au choix : « Suivi des élèves » (cliquez sur l\'élève, filtrez par scénario et mission, bouton « Rouvrir »), ou « Déverrouillage » (choisissez l\'élève, puis « Rouvrir » sous la mission concernée).',
          'Tout ce que l\'élève a déjà saisi est conservé : il peut compléter ou corriger, puis renvoyer. Utile quand un élève a cliqué « Envoyer » sans avoir rien rempli.',
        ],
      },
    ],
  },
  {
    titre: 'Au quotidien',
    sousThemes: [
      {
        titre: 'Consulter la liste des élèves',
        ou: 'Tableau de bord > Liste des élèves',
        etapes: [
          'Ouvrez la tuile « Liste des élèves » pour voir vos élèves et gérer l\'appel par heures.',
        ],
      },
      {
        titre: 'Ajouter un élève à la main',
        ou: 'Tableau de bord > Liste des élèves',
        etapes: [
          'Ouvrez la tuile « Liste des élèves ».',
          'En haut, dans « Ajouter un élève », saisissez le prénom, le nom et une adresse email.',
          'Cliquez « Ajouter » : l\'élève apparaît dans la liste et pourra se connecter avec cet email.',
          'Les élèves inscrits acceptés apparaissent automatiquement ; l\'ajout à la main sert à ceux que vous inscrivez vous-même.',
        ],
      },
      {
        titre: 'Suivre la présence en temps réel',
        ou: 'Tableau de bord > Présence en temps réel',
        etapes: [
          'Ouvrez la tuile « Présence en temps réel ».',
          'Quand un élève est hors ligne, la date et l\'heure de sa dernière connexion s\'affichent (« Vu le ... ») : utile pour repérer une connexion en dehors des heures de cours.',
          'Filtrez par classe ou par groupe pour voir qui est connecté.',
        ],
      },
      {
        titre: 'Faire l\'appel et le bilan de présence',
        ou: 'Liste des élèves > onglet Appel',
        etapes: [
          'Ouvrez « Liste des élèves » puis l\'onglet Appel.',
          'Indiquez le nombre d\'heures et le statut de chaque élève (présent, absent, retard, exclusion).',
          'Pour un bilan sur une période : choisissez les dates puis exportez le bilan en PDF.',
        ],
      },
      {
        titre: 'Appel automatique (présence depuis les connexions)',
        ou: 'Liste des élèves > onglet Appel',
        etapes: [
          'À partir du 10 septembre, la présence se remplit toute seule : un élève connecté au moins 10 minutes sur un créneau horaire est marqué présent.',
          'Les connexions sont enregistrées en continu pendant le cours, même si vous n\'ouvrez pas la page ; l\'appel est calculé quand vous ouvrez l\'onglet Appel.',
          'Vous pouvez toujours corriger un statut à la main : une correction manuelle n\'est jamais remplacée par le calcul automatique.',
          'Les séances antérieures au 10 se font à la main.',
        ],
      },
    ],
  },
  {
    titre: 'Suivi et correction',
    sousThemes: [
      {
        titre: 'Suivre le travail d\'un élève',
        ou: 'Tableau de bord > Suivi des élèves',
        etapes: [
          'Ouvrez « Suivi des élèves » et cliquez sur un élève.',
          'Utilisez les filtres Scénario et Mission pour retrouver un travail.',
          'Dépliez une mission pour consulter les activités, les travaux rendus et le journal.',
        ],
      },
      {
        titre: 'Corriger un travail à rendre',
        ou: 'Suivi des élèves > mission > Travaux rendus',
        etapes: [
          'Dépliez la mission concernée.',
          'Sous « Travaux rendus », écrivez votre commentaire et renseignez les compétences.',
          'La note et l\'appréciation s\'affichent en rouge et restent réservées au professeur.',
        ],
      },
      {
        titre: 'Notes et appréciations automatiques (Quiz et Glisser-déposer)',
        ou: 'Suivi des élèves',
        etapes: [
          'À l\'envoi d\'un quiz ou d\'un glisser-déposer, une note et une appréciation sont générées automatiquement.',
          'Vous les voyez immédiatement, en rouge, dans le suivi de l\'élève.',
        ],
      },
      {
        titre: 'Reporter les notes de quiz / glisser-déposer dans le relevé',
        ou: 'Liste des élèves > onglet Notes',
        etapes: [
          'Ouvrez « Liste des élèves » puis l\'onglet Notes.',
          'Dès qu\'un élève a passé un quiz ou un glisser-déposer, une colonne est créée automatiquement (par exemple « Renault - M1 - Quiz ») et la note y est reportée.',
          'Réglez le barème de la colonne (sur 10 ou sur 20) ; la note se convertit automatiquement.',
          'Vous pouvez modifier une note à la main : elle est alors protégée et ne sera plus écrasée par le report automatique.',
          'Filtrez par classe pour ne voir que les colonnes des scénarios travaillés par cette classe.',
        ],
      },
      {
        titre: 'Régler le délai avant que l\'élève voie sa correction',
        ou: 'Suivi des élèves (liste) > encart en haut',
        etapes: [
          'Ouvrez « Suivi des élèves » (la liste des élèves).',
          'En haut, réglez le délai (15 min à 24 h, 1 h par défaut).',
          'Ce délai s\'applique à tous les élèves, calculé depuis l\'heure d\'envoi de chacun. Vous, vous voyez la note tout de suite.',
        ],
      },
      {
        titre: 'Voir la synthèse par classe',
        ou: 'Tableau de bord > Synthèse par classe',
        etapes: [
          'Ouvrez « Synthèse par classe » pour les moyennes, l\'assiduité et l\'avancement.',
          'Vous pouvez éditer un bulletin par élève.',
        ],
      },
    ],
  },
  {
    titre: 'Préparer et suivre les séances',
    sousThemes: [
      {
        titre: 'Consulter les corrigés',
        ou: 'Barre du haut > Corrigés',
        etapes: [
          'Cliquez sur l\'onglet « Corrigés » en haut de l\'écran.',
          'Dépliez un scénario puis une mission pour afficher son corrigé.',
          'Vous pouvez exporter le corrigé de la mission en PDF.',
        ],
      },
      {
        titre: 'Voir le déroulement d\'une mission',
        ou: 'Barre du haut > Déroulement',
        etapes: [
          'Cliquez sur l\'onglet « Déroulement » en haut de l\'écran.',
          'Choisissez un scénario dans la colonne de gauche, puis une mission.',
          'Le déroulé pédagogique de la mission s\'affiche à droite.',
        ],
      },
      {
        titre: 'Suivre la progression par mission',
        ou: 'Barre du haut > Progression',
        etapes: [
          'Cliquez sur l\'onglet « Progression » en haut de l\'écran.',
          'Choisissez un scénario puis une mission.',
          'Le tableau liste les élèves en lignes et les parties de la mission en colonnes ; une coche verte indique une partie envoyée.',
        ],
      },
    ],
  },
  {
    titre: 'Messagerie',
    sousThemes: [
      {
        titre: 'Échanger avec les élèves',
        ou: 'Tableau de bord > Messagerie',
        etapes: [
          'Ouvrez la tuile « Messagerie ».',
          'Écrivez à un élève, joignez un fichier si besoin, ou publiez une annonce à toute la classe.',
          'En fin d\'année, vous pouvez nettoyer les pièces jointes pour libérer de l\'espace, sans perdre les messages.',
        ],
      },
    ],
  },
  {
    titre: 'Exports PDF',
    sousThemes: [
      {
        titre: 'Exporter une mission en version vierge',
        ou: 'Tableau de bord > Exports PDF',
        etapes: [
          'Ouvrez « Exports PDF ».',
          'Choisissez la classe et la mission.',
          'Dans « Parties à inclure », cochez les onglets voulus (ou Tout / Rien).',
          'Cliquez « Exporter la version vierge (à imprimer) ».',
          'Dans la fenêtre d\'impression, choisissez « Enregistrer en PDF ».',
        ],
      },
      {
        titre: 'Exporter la copie remplie d\'un élève',
        ou: 'Tableau de bord > Exports PDF',
        etapes: [
          'Ouvrez « Exports PDF » et choisissez la mission et les parties à inclure.',
          'Dans la liste des élèves, cliquez « Exporter rempli » en face de l\'élève voulu.',
          'Le PDF reprend les documents, les questions et les réponses de l\'élève.',
        ],
      },
    ],
  },
]

export const TUTO_ELEVE: ThemeTuto[] = [
  {
    titre: 'Connexion',
    sousThemes: [
      {
        titre: 'Se connecter',
        ou: 'Page de connexion élève',
        etapes: [
          'Choisissez l\'espace élève.',
          'Saisissez votre identifiant et votre mot de passe, puis validez.',
          'Sur téléphone ou tablette, vous pouvez activer Face ID depuis l\'icône dans l\'en-tête de l\'accueil.',
        ],
      },
      {
        titre: 'Activer Face ID',
        ou: 'Accueil élève > icône Face ID en haut (téléphone ou tablette)',
        etapes: [
          'Connectez-vous d\'abord avec votre mot de passe.',
          'Sur l\'accueil, touchez l\'icône Face ID en haut, puis « Activer ».',
          'À la prochaine connexion, l\'écran Face ID s\'affiche : touchez l\'icône pour vous connecter sans mot de passe.',
          'Le bouton « Utiliser mon mot de passe » reste toujours disponible en secours.',
        ],
      },
    ],
  },
  {
    titre: 'Faire un exercice',
    sousThemes: [
      {
        titre: 'Naviguer dans une mission',
        ou: 'Accueil élève > un scénario > une mission',
        etapes: [
          'Ouvrez un scénario puis une mission.',
          'Parcourez les onglets : Travaux à rendre, Synthèse, Auto-évaluation, Activités, Journal de bord.',
        ],
      },
      {
        titre: 'Compléter la synthèse',
        ou: 'Onglet Synthèse',
        etapes: [
          'Complétez la carte de synthèse de la mission.',
          'Cliquez « Envoyer au professeur » puis confirmez.',
          'Une fois envoyée, la synthèse n\'est plus modifiable, sauf si le professeur la rouvre.',
        ],
      },
      {
        titre: 'Faire son auto-évaluation',
        ou: 'Onglet Auto-évaluation',
        etapes: [
          'Pour chaque compétence, choisissez votre niveau de maîtrise.',
          'Cliquez « Envoyer au professeur » puis confirmez.',
          'Une fois envoyée, l\'auto-évaluation est verrouillée.',
        ],
      },
      {
        titre: 'Répondre et envoyer un travail',
        ou: 'Onglets Travaux, Synthèse, Auto-évaluation',
        etapes: [
          'Complétez vos réponses (vous pouvez envoyer même si tout n\'est pas rempli).',
          'Cliquez « Envoyer au professeur » puis confirmez dans la fenêtre.',
          'Une fois envoyé, le travail n\'est plus modifiable, sauf si le professeur le rouvre.',
        ],
      },
      {
        titre: 'Faire un quiz ou un glisser-déposer',
        ou: 'Onglet Activités',
        etapes: [
          'Répondez puis envoyez.',
          'Votre note et votre appréciation apparaîtront après un délai, comme une correction du professeur.',
        ],
      },
      {
        titre: 'Remplir le journal de bord',
        ou: 'Onglet Journal de bord',
        etapes: [
          'Notez ce qui n\'a pas été réussi et ce qui a été le moins bien réussi.',
          'Le journal reste accessible à tout moment.',
        ],
      },
    ],
  },
  {
    titre: 'Exporter en PDF',
    sousThemes: [
      {
        titre: 'Exporter un onglet',
        ou: 'Dans chaque onglet, bouton « Exporter en PDF »',
        etapes: [
          'Le bouton « Exporter en PDF » apparaît en gris puis devient actif selon l\'onglet.',
          'Travaux, Synthèse, Auto-évaluation : actif après l\'envoi.',
          'Quiz et Glisser-déposer : actif une fois la correction disponible.',
          'Journal de bord : toujours disponible.',
          'Cliquez dessus puis choisissez « Enregistrer en PDF ».',
        ],
      },
    ],
  },
  {
    titre: 'Messagerie',
    sousThemes: [
      {
        titre: 'Écrire au professeur',
        ou: 'Accueil élève > icône messagerie',
        etapes: [
          'Ouvrez la messagerie depuis l\'icône en forme d\'enveloppe.',
          'Écrivez votre message et joignez un fichier si besoin.',
        ],
      },
    ],
  },
]
