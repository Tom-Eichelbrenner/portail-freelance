# Audit Livra — 2026-06-21

## ✅ Features implémentées et connectées

### Pages dashboard

- `/dashboard` — Stats réelles (clients, projets, factures), liste des 5 clients récents avec dernier projet, fil d'activité fusionné depuis files/messages/invoices/clients
- `/clients` — Table complète avec filtres (onglets Tous/Actifs/Invités), recherche, statut dynamique, lien "Voir le portail", renvoi d'invitation, soft delete
- `/projets` — Table + vue Kanban, filtres par statut et par client, modal "Nouveau projet" → `createProject()`, **changement de statut inline** → `updateProjectStatus()` (venait d'être ajouté)
- `/fichiers` — Table avec jointures projet + client, icône par type MIME, taille formatée, bouton téléchargement → `/api/uploads/download`
- `/factures` — Table avec résumé (encaissé ce mois / en attente / en retard / total), onglets de filtrage, numérotation FAC-YYYY-NNN, **modal "Créer une facture"** → `createInvoice()` (venait d'être ajouté), grisé si plan gratuit
- `/messages` — Colonne conversations + fil de messages par projet, envoi optimiste → `postMessage()`, différenciation visuelle freelance/client
- `/settings` — Formulaire workspace (nom, slug readonly, couleur accent), formulaire profil (nom, email), **changement de mot de passe** → `changePassword()` (venait d'être ajouté), badge abonnement réel (subscriptionStatus + subscriptionPlan), **bouton "Gérer l'abonnement"** → `createBillingPortalSession()` (venait d'être ajouté), danger zone → `deleteAccount()` avec confirmation par nom du workspace

### Portail client

- `/portal/[slug]` — Vue portail avec token d'accès, fichiers, messages, factures

### Auth

- Login / Signup via Supabase email+password
- Callback OAuth (`/auth/callback`)
- Logout
- Validation du token portail client (`/api/portal/validate`)

### Backend / API

- Upload fichiers → Cloudflare R2 via presigned URL (`/api/uploads/presign`)
- Téléchargement sécurisé → R2 presigned GET (`/api/uploads/download`)
- Webhooks Stripe → mise à jour statut abonnement + factures payées (`/api/stripe/webhook`)
- Emails transactionnels via Resend : invitation, facture, facture payée, nouveau message, changement de statut

### Server Actions

- `auth.ts` : `login`, `signup`, `logout`
- `client.ts` : `inviteClient`, `deleteClient`, `resendClientInvite`
- `projects.ts` : `createProject`, `updateProjectStatus`, `deleteProject`
- `messages.ts` : `postMessage`
- `stripe.ts` : `createCheckoutSession`, `upgradeSubscription`, `createBillingPortalSession`, `createInvoice`
- `settings.ts` : `saveSettings`, `changePassword`, `deleteAccount`

### Abonnement & limites

- Check limite clients (5 max sur plan solo) avant invitation
- Check quota stockage (5 Go solo / 20 Go pro) avant upload
- `createInvoice` réservée au plan Pro

---

## ⚠️ Features implémentées mais non connectées à l'UI

- **`deleteProject`** — Server action implémentée dans `projects.ts` mais aucun bouton de suppression dans `ProjectsView` (ni table, ni kanban)
- **`upgradeSubscription`** — Server action implémentée mais non exposée dans l'UI (la page pricing n'utilise que `createCheckoutSession`)
- **`resendClientInvite`** — Wired dans `ClientsTable` mais renvoi uniquement possible si `inviteToken` existe ; si le client est "Inactif" sans token, le bouton est silencieux
- **`notificationQueue`** — Table créée, `sendNotification()` alimentée par les actions, mais le fil d'activité du dashboard lit directement les tables (files/messages/invoices/clients) plutôt que `notification_queue`
- **`FileUpload` component** — Composant complet (`/components/ui/FileUpload.tsx`) mais non utilisé dans `/fichiers` ; le bouton "Importer un fichier" est désactivé avec le tooltip "L'import se fait depuis la page d'un projet" — or aucune page projet individuelle n'existe
- **`MessageThread` component** — (`/components/ui/MessageThread.tsx`) Non utilisé dans l'UI (doublon de MessagesView pour le portail)
- **`InvoiceForm` component** — (`/components/dashboard/InvoiceForm.tsx`) Remplacé par le nouveau modal dans InvoicesTable ; fichier orphelin

---

## ❌ Features manquantes (non codées)

- **[P1] Page projet individuelle** — Pas de page `/projets/[id]` avec détail : description, fil de fichiers (FileUpload), fil de messages (MessageThread), historique de statut, factures liées. Bloque l'upload de fichiers depuis le dashboard.
- **[P1] Relances automatiques** — Mentionnée dans les features Pro (`ReglagesView`) mais aucune logique de relance automatique (cron, queue). La détection "en retard" (+30j) existe mais n'envoie aucun email.
- **[P2] Recherche globale** — Input de recherche dans le header du dashboard est non fonctionnel (placeholder seulement)
- **[P2] Notifications en temps réel** — Pas de polling ou WebSocket ; l'UI se met à jour uniquement après rechargement (router.refresh après action)
- **[P2] Préférences notifications** — Les switches dans `/settings#notifications` sont purement locaux (state React), non persistés en base ni en cookie
- **[P2] Logo workspace** — Bouton "Importer un logo" présent mais non implémenté (pas d'upload vers R2, pas de champ `logoUrl` utilisé dans l'UI)
- **[P2] Photo de profil** — Bouton "Changer la photo" présent mais non implémenté
- **[P2] Date de renouvellement abonnement** — Affichée comme "12 juillet 2026" en dur dans `PLAN_DATA`; non récupérée depuis Stripe
- **[P3] Pagination** — Toutes les listes sont chargées intégralement ; pas de pagination ni de infinite scroll (risque de perf à grande échelle)
- **[P3] Tri des colonnes** — Tableaux (clients, fichiers, factures) non triables au clic
- **[P3] Export PDF/CSV** — Aucune fonctionnalité d'export
- **[P3] Signature électronique** — Mentionnée dans les features Pro mais non implémentée

---

## 🎨 Pages designées mais non implémentées

- Aucune page designée n'est manquante : toutes les pages du design Livra (dashboard, clients, projets, fichiers, factures, messages, réglages) ont été intégrées.

---

## 📋 Pages à designer

- **Page projet individuelle** `/projets/[id]` — Détail d'un projet : infos, fichiers, messages, factures, historique statut
- **Page onboarding** — Premier accès après signup (setup workspace, invitation premier client)
- **Page 404 / erreur** — Actuellement les erreurs renvoient vers login sans message
- **Page portail client enrichie** — Le portail client (`/portal/[slug]`) est fonctionnel mais minimaliste ; manque vue projet, upload client, historique

---

## 🐛 Bugs ou incohérences détectés

- **Sidebar : lien `/livrables` mort** — La nav contenait un lien vers `/livrables` (page inexistante). Supprimé dans cet audit.
- **`saveSettings` revalidate le mauvais path** — `revalidatePath("/settings")` alors que le segment est `(dashboard)/settings` ; peut ne pas invalider le cache correctement. Devrait être `revalidatePath("/")` ou utiliser `revalidatePath("/settings", "layout")`.
- **`deleteAccount` ne supprime pas les fichiers R2** — L'action supprime les enregistrements en base mais n'appelle pas l'API R2 pour supprimer les fichiers physiques. Les fichiers restent sur Cloudflare.
- **`deleteAccount` utilise `admin.deleteUser`** — Nécessite la clé `service_role` Supabase côté serveur. Si non configurée, l'utilisateur Supabase auth n'est pas supprimé mais la session est détruite.
- **`createInvoice` : montant en euros vs centimes** — L'action attend `amount` en euros et multiplie par 100 pour Stripe, mais le commentaire du schema indique "in cents". Cohérent mais trompeur.
- **`MessagesView` : tous les projets apparaissent** — La colonne gauche liste tous les projets (même ceux sans messages), au lieu de n'afficher que ceux ayant au moins un échange. Diverge de la spec ("projets ayant au moins un message").
- **`PLAN_DATA.pro.feats` vs fonctionnalités réelles** — Le plan Pro est listé avec "Signature électronique" et "Relances automatiques" (non implémentées) et "100 Go de stockage" (code limite à 20 Go dans `subscription.ts`).
- **`notificationQueue` : champ `workspaceId` absent** — La table `notificationQueue` n'a pas de `workspaceId`, rendant impossible la requête "notifications de mon workspace" évoquée dans la spec dashboard.
- **Cookies portail client non expirés à la déconnexion** — Le cookie `portal_token` n'est pas supprimé lors du logout du freelance ni lors du soft delete client.
- **`StatusButton` component orphelin** — Le composant `StatusButton.tsx` existant (avec Tailwind classes) n'est plus utilisé nulle part ; remplacé par `InlineStatusSelect` dans `ProjectsView`. Candidat à la suppression.
