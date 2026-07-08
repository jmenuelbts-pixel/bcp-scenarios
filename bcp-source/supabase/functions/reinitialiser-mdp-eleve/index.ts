// Edge Function : reinitialiser-mdp-eleve
// OPTIONNELLE. Permet au professeur de fixer directement le mot de passe d'un
// eleve (compte Auth) depuis l'app, via un bouton cote prof. La cle
// service_role est detenue UNIQUEMENT ici, cote serveur. Elle ne doit JAMAIS
// figurer dans le front.
//
// -------------------------------------------------------------------------
// DEPLOIEMENT (a faire une seule fois)
// -------------------------------------------------------------------------
// 1. Installer la CLI Supabase : https://supabase.com/docs/guides/cli
// 2. Se connecter :            supabase login
// 3. Lier le projet :          supabase link --project-ref njkslucischlvjlflzrr
// 4. Definir le secret (cle service_role, visible dans Supabase >
//    Project Settings > API > service_role secret) :
//      supabase secrets set SERVICE_ROLE_KEY=coller_la_cle_ici
// 5. Deployer la fonction :
//      supabase functions deploy reinitialiser-mdp-eleve
//
// L'URL sera : https://njkslucischlvjlflzrr.functions.supabase.co/reinitialiser-mdp-eleve
//
// -------------------------------------------------------------------------
// APPEL DEPUIS LE FRONT (cote prof uniquement)
// -------------------------------------------------------------------------
//   const { data, error } = await supabase.functions.invoke(
//     'reinitialiser-mdp-eleve',
//     { body: { eleve_id: '...', nouveau_mdp: '...' } }
//   )
// L'appel est authentifie par le jeton du prof connecte. La fonction verifie
// que l'appelant est bien l'enseignant autorise avant d'agir.
// -------------------------------------------------------------------------

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EMAIL_ENSEIGNANT = 'menuelmariaderaismes@gmail.com'

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

    // 1. Verifier que l'appelant est bien l'enseignant autorise.
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
    const { eleve_id, nouveau_mdp } = await req.json()
    if (!eleve_id || !nouveau_mdp || String(nouveau_mdp).length < 6) {
      return new Response(
        JSON.stringify({ erreur: 'Paramètres invalides (mot de passe : 6 caractères minimum).' }),
        { status: 400, headers: { ...enteteCors, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Modifier le mot de passe avec la cle service_role (cote serveur).
    const admin = createClient(url, serviceKey)
    const { error } = await admin.auth.admin.updateUserById(eleve_id, {
      password: String(nouveau_mdp),
    })
    if (error) {
      return new Response(JSON.stringify({ erreur: error.message }), {
        status: 400,
        headers: { ...enteteCors, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...enteteCors, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ erreur: String(e) }), {
      status: 500,
      headers: { ...enteteCors, 'Content-Type': 'application/json' },
    })
  }
})
