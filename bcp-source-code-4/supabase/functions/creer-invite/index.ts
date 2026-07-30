// Edge Function : creer-invite
// Cree (ou reactive) LE compte invite unique, cote serveur, avec la cle
// service_role qui ne doit jamais figurer dans le front. Reserve au prof.
//
// Deploiement (une seule fois), voir reinitialiser-mdp-eleve pour la methode.
// Appel depuis le front :
//   supabase.functions.invoke('creer-invite', { body: { mot_de_passe: '...' } })
// Renvoie { email, ok:true } en cas de succes.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EMAIL_ENSEIGNANT = 'menuelmariaderaismes@gmail.com'
const EMAIL_INVITE = 'invite@bcp-scenarios-mcvb.app'

const enteteCors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: enteteCors })
  }

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // 1. Verifier que l'appelant est bien l'enseignant.
    const jeton = req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    const clientAppelant = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${jeton}` } },
    })
    const { data: userData, error: userErr } = await clientAppelant.auth.getUser()
    if (userErr || !userData.user || userData.user.email !== EMAIL_ENSEIGNANT) {
      return new Response(JSON.stringify({ erreur: 'Non autorisé.' }), {
        status: 401,
        headers: { ...enteteCors, 'Content-Type': 'application/json' },
      })
    }

    // 2. Lire les parametres.
    const { mot_de_passe, classe_id } = await req.json()
    if (!mot_de_passe || String(mot_de_passe).length < 6) {
      return new Response(
        JSON.stringify({ erreur: 'Mot de passe : 6 caractères minimum.' }),
        { status: 400, headers: { ...enteteCors, 'Content-Type': 'application/json' } }
      )
    }

    const admin = createClient(url, serviceKey)

    // 3. Le compte invite existe-t-il deja ? On le cherche par email.
    const { data: liste } = await admin.auth.admin.listUsers()
    const existant = liste?.users?.find((u) => u.email === EMAIL_INVITE)

    let inviteId: string
    if (existant) {
      // Reactiver : redefinir le mot de passe et confirmer l'email.
      inviteId = existant.id
      await admin.auth.admin.updateUserById(inviteId, {
        password: String(mot_de_passe),
        email_confirm: true,
      })
    } else {
      // Creer le compte Auth.
      const { data: cree, error: eCree } = await admin.auth.admin.createUser({
        email: EMAIL_INVITE,
        password: String(mot_de_passe),
        email_confirm: true,
      })
      if (eCree || !cree.user) {
        return new Response(JSON.stringify({ erreur: eCree?.message ?? 'Création impossible.' }), {
          status: 400,
          headers: { ...enteteCors, 'Content-Type': 'application/json' },
        })
      }
      inviteId = cree.user.id
    }

    // 4. Creer / mettre a jour le profil invite (role etudiant, marque invite, actif).
    const { error: eProfil } = await admin.from('profiles').upsert({
      id: inviteId,
      email: EMAIL_INVITE,
      nom: 'INVITÉ',
      prenom: 'Visiteur',
      role: 'etudiant',
      statut: 'accepte',
      classe_id: classe_id ?? null,
      est_invite: true,
      invite_actif: true,
      manuel: false,
    }, { onConflict: 'id' })
    if (eProfil) {
      return new Response(JSON.stringify({ erreur: eProfil.message }), {
        status: 400,
        headers: { ...enteteCors, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true, email: EMAIL_INVITE }), {
      headers: { ...enteteCors, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ erreur: String(e) }), {
      status: 500,
      headers: { ...enteteCors, 'Content-Type': 'application/json' },
    })
  }
})
