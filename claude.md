Portail Client Freelances — CLAUDE.md

Projet

SaaS B2B pour freelances français. Un portail client tout-en-un : partage de fichiers, messagerie projet, statut de mission, facturation conforme droit français.

Stack


Framework : Next.js 15, App Router, React 19, TypeScript strict
Auth : Supabase Auth (JWT en httpOnly cookie via @supabase/ssr)
Base de données : Supabase (PostgreSQL) + Drizzle ORM
Fichiers : Cloudflare R2 (presigned URLs, jamais le bucket exposé publiquement)
Paiements SaaS : Stripe Billing (abonnements freelance)
Paiements clients : Stripe Payment Links (factures payables depuis le portail)
Email : Resend + React Email
Déploiement : Vercel
Styles : Tailwind CSS


Structure des dossiers

src/
  app/
    (auth)/           # login, signup, callback
    (dashboard)/      # espace freelance (protégé)
    portal/[slug]/    # portail client (accès magic link)
    api/
      auth/           # callbacks Supabase
      stripe/         # checkout, webhooks
      uploads/        # presigned URLs R2
  db/
    schema.ts         # schéma Drizzle
    migrations/       # fichiers SQL générés
    index.ts          # client Drizzle
  lib/
    supabase/
      server.ts       # createServerClient()
      client.ts       # createBrowserClient()
    stripe.ts         # client Stripe
    r2.ts             # client S3-compatible R2
    resend.ts         # client Resend
  components/
    ui/               # composants génériques (Button, Input, Modal...)
    dashboard/        # composants espace freelance
    portal/           # composants vue client
  emails/             # templates React Email
  middleware.ts       # protection des routes

Variables d'environnement (.env.local)

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # serveur uniquement, jamais côté client

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

RESEND_API_KEY=

CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
CLOUDFLARE_R2_PUBLIC_URL=

Multi-tenancy


Chaque freelance a un workspace avec un slug unique
Les portails clients sont accessibles à /portal/[workspace-slug]
Pas de sous-domaines pour l'instant (complexité wildcard SSL inutile au MVP)
Toutes les queries Drizzle sont filtrées par workspace_id
RLS Supabase en double sécurité : workspace_id = auth.uid() sur toutes les tables


Auth Flow


Freelance : email/password via Supabase Auth → redirigé vers /dashboard
Client du freelance : magic link envoyé par le freelance → accès /portal/[slug] sans compte Supabase
Middleware src/middleware.ts :

/dashboard/* → auth requise (freelance)
/portal/* → token magic link vérifié (client invité)
/api/stripe/webhook → jamais protégé par middleware auth





Conventions importantes


Soft deletes partout : colonne deleted_at TIMESTAMPTZ sur toutes les tables, jamais de DELETE SQL
Service role key : uniquement dans les Server Actions et API routes, jamais exposée au navigateur
Fichiers R2 : toujours via presigned URL générée côté serveur, jamais le bucket public
Stripe webhook : route /api/stripe/webhook exclue du middleware auth, signature vérifiée via stripe.webhooks.constructEvent()
Drizzle : pas de select *, toujours lister les colonnes explicitement
Notifications : table notification_queue pour toutes les notifications email (fire-and-forget via Resend, loggable)


Commandes utiles

bashnpm run dev          # dev server
npm run db:generate  # générer les migrations Drizzle
npm run db:migrate   # appliquer les migrations sur Supabase
npm run db:studio    # Drizzle Studio (UI DB)
stripe listen --forward-to localhost:3000/api/stripe/webhook  # webhook local

À ne jamais faire


Ne pas utiliser localStorage pour stocker des tokens auth
Ne pas mettre SUPABASE_SERVICE_ROLE_KEY dans une variable NEXT_PUBLIC_
Ne pas exposer le bucket R2 en accès public
Ne pas oublier d'exclure /api/stripe/webhook du middleware
Ne pas faire de hard delete sur les données utilisateur
