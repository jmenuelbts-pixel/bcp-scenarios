// Edge Function : deconnecter-classe
// Deconnecte de TOUS leurs appareils tous les eleves d'une classe donnee
// (ou tous les eleves si aucune classe n'est precisee). Utilise la cle
// service_role, cote serveur uniquement. Reserve au professeur.
//
// -------------------------------------------------------------------------
// DEPLOIEMENT (a faire une seule fois)
// -------------------------------------------------------------------------
// 1. Installer la CLI Supabase : https://supabase.com/docs/guides/cli
// 2. supabase login
// 3. supabase link --project-ref njkslucischlvjlflzrr
// 4. Le secret SERVICE_ROLE_KEY est deja defini si vous avez deploye les
//    autres fonctions. Sinon :
//      supabase secrets set SERVICE_ROLE_KEY=coller_la_cle_ici
// 5. supabase functions deploy deconnecter-classe
//
// APPEL DEPUIS LE FRONT (cote prof) :
//   supabase.functions.invoke('deconnecter-classe', { body: { classe_id: '...' } })
//   classe_id null => tous les eleves.
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

    // 2. Lire le parametre classe_id (facultatif).
    const { classe_id } = await req.json().catch(() => ({ classe_id: null }))

    const admin = createClient(url, serviceKey)

    // 3. Recuperer les eleves concernes (role etudiant, classe filtree si fournie).
    let requete = admin.from('profiles').select('id').eq('role', 'etudiant')
    if (classe_id) requete = requete.eq('classe_id', classe_id)
    const { data: eleves, error: eListe } = await requete
    if (eListe) {
      return new Response(JSON.stringify({ erreur: eListe.message }), {
        status: 400,
        headers: { ...enteteCors, 'Content-Type': 'application/json' },
      })
    }

    // 4. Deconnecter chaque eleve de tous ses appareils (revoque ses sessions).
    let deconnectes = 0
    for (const e of (eleves as { id: string }[]) ?? []) {
      const { error } = await admin.auth.admin.signOut(e.id, 'global')
      if (!error) deconnectes += 1
    }

    return new Response(JSON.stringify({ ok: true, deconnectes }), {
      headers: { ...enteteCors, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ erreur: String(e) }), {
      status: 500,
      headers: { ...enteteCors, 'Content-Type': 'application/json' },
    })
  }
})
