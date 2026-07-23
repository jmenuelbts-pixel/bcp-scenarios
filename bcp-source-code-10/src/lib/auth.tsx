// auth.tsx
// Contexte d'authentification : gere la session Supabase, charge le profil de
// l'utilisateur connecte et expose inscription (eleves uniquement), connexion
// et deconnexion. L'espace enseignant est reserve a un unique email autorise.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Statut } from '../data/schema'

// Email du professeur autorise a acceder a l'espace enseignant.
// Aucun autre compte ne peut acceder a cet espace, meme avec un mot de passe valide.
export const EMAIL_ENSEIGNANT = 'menuelmariaderaismes@gmail.com'
// Identifiant unique du compte enseignant. Utilise cote eleve pour adresser
// les messages au professeur sans avoir a lire la table profiles (interdit
// par la securite pour le profil d'autrui).
export const ID_ENSEIGNANT = '856c0aa1-1c19-4f18-baf0-c4b9c927eaad'

export interface Profil {
  id: string
  email: string | null
  prenom: string | null
  nom: string | null
  date_naissance: string | null
  role: 'etudiant' | 'enseignant' | null
  entreprise: string | null
  statut: Statut | null
  classe_id?: string | null
  manuel?: boolean | null
  mdp_simple?: string | null
  created_at?: string | null
}

interface ResultatAuth {
  erreur: string | null
}

interface ContexteAuth {
  session: Session | null
  profil: Profil | null
  chargement: boolean
  erreurProfil: string | null
  // Inscription reservee aux eleves.
  inscrireEleve: (params: {
    email: string
    motDePasse: string
    prenom: string
    nom: string
    dateNaissance: string
  }) => Promise<ResultatAuth>
  connecter: (email: string, motDePasse: string) => Promise<ResultatAuth>
  deconnecter: () => Promise<void>
}

const Contexte = createContext<ContexteAuth | undefined>(undefined)

function traduireErreur(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login')) return 'Adresse e-mail ou mot de passe incorrect.'
  if (m.includes('already registered') || m.includes('already exists'))
    return 'Cette adresse e-mail est déjà utilisée.'
  if (m.includes('password')) return 'Le mot de passe doit comporter au moins 6 caractères.'
  if (m.includes('email')) return "L'adresse e-mail n'est pas valide."
  return 'Une erreur est survenue. Veuillez réessayer.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profil, setProfil] = useState<Profil | null>(null)
  const [chargement, setChargement] = useState(true)

  const [erreurProfil, setErreurProfil] = useState<string | null>(null)

  async function chargerProfil(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, prenom, nom, date_naissance, role, entreprise, statut')
      .eq('id', userId)
      .maybeSingle()
    if (error) {
      setErreurProfil(error.message)
      setProfil(null)
      return
    }
    setErreurProfil(null)
    setProfil((data as Profil) ?? null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) {
        chargerProfil(data.session.user.id).finally(() => setChargement(false))
      } else {
        setChargement(false)
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nouvelleSession) => {
      setSession(nouvelleSession)
      if (nouvelleSession?.user) {
        setChargement(true)
        chargerProfil(nouvelleSession.user.id).finally(() => setChargement(false))
      } else {
        setProfil(null)
        setErreurProfil(null)
        setChargement(false)
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  async function inscrireEleve(params: {
    email: string
    motDePasse: string
    prenom: string
    nom: string
    dateNaissance: string
  }): Promise<ResultatAuth> {
    // L'email enseignant ne peut pas etre utilise pour une inscription eleve.
    if (params.email.trim().toLowerCase() === EMAIL_ENSEIGNANT) {
      return { erreur: 'Cette adresse e-mail est réservée.' }
    }

    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.motDePasse,
    })
    if (error) return { erreur: traduireErreur(error.message) }
    if (!data.user) return { erreur: "L'inscription n'a pas abouti." }

    const { error: erreurProfil } = await supabase.from('profiles').insert({
      id: data.user.id,
      email: params.email,
      prenom: params.prenom,
      nom: params.nom,
      date_naissance: params.dateNaissance || null,
      role: 'etudiant',
      statut: 'en_attente',
    })
    if (erreurProfil) return { erreur: traduireErreur(erreurProfil.message) }

    return { erreur: null }
  }

  async function connecter(email: string, motDePasse: string): Promise<ResultatAuth> {
    const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse })
    if (error) return { erreur: traduireErreur(error.message) }
    return { erreur: null }
  }

  async function deconnecter() {
    await supabase.auth.signOut()
    setProfil(null)
  }

  return (
    <Contexte.Provider
      value={{ session, profil, chargement, erreurProfil, inscrireEleve, connecter, deconnecter }}
    >
      {children}
    </Contexte.Provider>
  )
}

export function useAuth(): ContexteAuth {
  const ctx = useContext(Contexte)
  if (!ctx) throw new Error('useAuth doit etre utilise dans AuthProvider.')
  return ctx
}
