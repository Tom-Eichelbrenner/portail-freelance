Portail Client Freelances — CLAUDE.md

## Projet

SaaS B2B pour freelances français. Un portail client tout-en-un : partage de fichiers, messagerie projet, statut de mission, facturation conforme droit français.

## Stack

- Framework : **Next.js 16.2.9**, App Router, React 19, TypeScript strict
- Auth : Supabase Auth (JWT en httpOnly cookie via `@supabase/ssr`)
- Base de données : Supabase (PostgreSQL) + Drizzle ORM
- Fichiers : Cloudflare R2 (presigned URLs, jamais le bucket exposé publiquement)
- Paiements SaaS : Stripe Billing (abonnements freelance)
- Paiements clients : Stripe Payment Links (factures payables depuis le portail)
- Email : Resend + React Email
- Déploiement : Vercel
- Styles : Tailwind CSS v4

## Breaking changes Next.js 16

- `middleware.ts` est renommé **`proxy.ts`** — la fonction export s'appelle `proxy`, pas `middleware`
- Voir `src/proxy.ts`, ne jamais créer de `middleware.ts`

## Structure des dossiers

```
src/
  app/
    (auth)/           # login, signup
    (dashboard)/      # espace freelance (protégé par proxy.ts)
    portal/[slug]/    # portail client (accès token magic link)
    actions/
      auth.ts         # login, signup, logout (Server Actions)
      client.ts       # inviteClient (Server Actions)
    api/
      auth/           # callbacks Supabase
      portal/validate/ # validation token invite → pose cookie httpOnly
      stripe/         # checkout, webhooks
      uploads/        # presigned URLs R2
    auth/callback/    # échange code OAuth Supabase → session
  db/
    schema.ts         # schéma Drizzle (7 tables)
    migrations/       # fichiers SQL générés par drizzle-kit
    rls.sql           # politiques RLS à appliquer dans Supabase SQL Editor
    index.ts          # client Drizzle (postgres.js)
  lib/
    auth.ts           # getUser(), getUserWorkspace(), requireAuth()
    supabase/
      server.ts       # createClient() + createServiceClient()
      client.ts       # createClient() browser
    stripe.ts
    r2.ts
    resend.ts
  components/
    ui/               # composants génériques
    dashboard/        # InviteForm.tsx et autres composants freelance
    portal/           # composants vue client
  emails/
    InviteEmail.tsx   # template email invitation client
  proxy.ts            # protection routes (Next.js 16 = middleware)
```

## Variables d'environnement

Noms exacts à utiliser (différents des docs Supabase classiques) :

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # (pas ANON_KEY)
SUPABASE_SECRET_KEY=                     # (pas SERVICE_ROLE_KEY)

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

RESEND_API_KEY=
RESEND_FROM_EMAIL=onboarding@resend.dev  # domaine vérifié en prod

CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
CLOUDFLARE_R2_PUBLIC_URL=

DATABASE_URL=   # session pooler Supabase (port 5432) — voir note ci-dessous
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### DATABASE_URL — connexion Supabase depuis WSL2

Le host direct Supabase (`db.*.supabase.co`) n'a que des enregistrements AAAA (IPv6), **non routé dans WSL2**. Utiliser le **session pooler** (IPv4) :

```
postgresql://postgres.<project-ref>:<password>@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
```

Obtenir l'URL : Supabase → Connect → Direct → Connection Method : **Session pooler**.

## Multi-tenancy

- Chaque freelance a un workspace avec un slug unique (`<nom-slugifié>-<8 premiers chars uuid>`)
- Les portails clients sont accessibles à `/portal/[workspace-slug]`
- Pas de sous-domaines pour l'instant
- Toutes les queries Drizzle filtrées par `workspace_id`
- RLS Supabase en double sécurité sur toutes les tables

## Auth Flow

**Freelance :**

- Signup → `supabase.auth.signUp()` + insert `users` + `workspaces` en transaction Drizzle → `/dashboard`
- Login → `supabase.auth.signInWithPassword()` → `/dashboard`
- Logout → `supabase.auth.signOut()` → `/login`
- `proxy.ts` redirige `/dashboard` → `/login` si pas de session

**Client invité :**

- Freelance envoie invite via `inviteClient()` : crée entry `clients` avec `invite_token` (UUID) + `invite_expires_at` (7j), envoie email Resend
- Client clique lien `/portal/[slug]?token=xxx`
- Page redirige vers `/api/portal/validate?token=xxx&slug=yyy`
- Route handler valide le token (DB + expiration), pose cookie `portal_token` (httpOnly, SameSite=Lax, 30j)
- Redirect vers `/portal/[slug]` — page lit le cookie et affiche le portail

## Ce qui est implémenté (session 2026-06-20)

- [x] Schéma Drizzle (7 tables) + migrations appliquées + RLS
- [x] `src/lib/auth.ts` : `getUser`, `getUserWorkspace`, `requireAuth`
- [x] Auth freelance : signup, login, logout
- [x] `proxy.ts` : session refresh Supabase + protection `/dashboard`
- [x] Dashboard : affiche nom/slug, liste clients, formulaire invitation
- [x] Invitation client : Server Action `inviteClient` + email Resend
- [x] Portail client : validation token → cookie → accès `/portal/[slug]`
- [x] Route `/auth/callback` pour OAuth/magic link Supabase

## À implémenter

- Upload fichiers R2 (presigned URLs)
- Messagerie projet (messages par projet)
- Statut de mission (projects.status)
- Stripe Billing (abonnements freelance)
- Stripe Payment Links (factures clients)
- Page projet dans le portail client
- UI/design (actuellement Tailwind brut sans composants)

## Conventions importantes

- **Soft deletes partout** : colonne `deleted_at` sur toutes les tables, jamais de DELETE SQL
- **Server Actions** dans `src/app/actions/` avec `"use server"` en tête de fichier
- **Validation Zod** sur tous les inputs des Server Actions avant écriture en DB
- **`SUPABASE_SECRET_KEY`** uniquement dans Server Actions et Route Handlers
- **Fichiers R2** : toujours via presigned URL générée côté serveur
- **Stripe webhook** : exclue du proxy auth, vérifier signature via `stripe.webhooks.constructEvent()`
- **Cookie portal_token** : httpOnly, SameSite=Lax, Secure en prod, maxAge 30j

## Commandes utiles

```bash
npm run dev          # dev server
npm run db:generate  # générer les migrations Drizzle
npm run db:migrate   # appliquer les migrations sur Supabase (via session pooler)
npm run db:studio    # Drizzle Studio (UI DB)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## À ne jamais faire

- Créer un `middleware.ts` — utiliser `proxy.ts` (Next.js 16)
- Utiliser `NEXT_PUBLIC_SUPABASE_ANON_KEY` — s'appelle `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Utiliser `SUPABASE_SERVICE_ROLE_KEY` — s'appelle `SUPABASE_SECRET_KEY`
- Mettre `SUPABASE_SECRET_KEY` dans une variable `NEXT_PUBLIC_`
- Exposer le bucket R2 en accès public
- Hard delete sur les données utilisateur
- Chaîner `.where().where()` en Drizzle — utiliser `and()` à la place
- Utiliser le DATABASE_URL direct (`db.*.supabase.co`) depuis WSL2 — IPv6 uniquement
