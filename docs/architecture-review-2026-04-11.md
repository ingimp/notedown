# Architectural Review — notedown (2026-04-11)

## 1. Executive summary

Notedown è oggi un **MVP monolitico Next.js server-first**: UI editor, rendering markdown, persistenza file-system e export statico convivono nello stesso deploy e nello stesso repository.

Giudizio: **base tecnica valida per un prototipo standalone**, ma per diventare frontend di una piattaforma con backend Java/Spring richiede **refactoring moderato/importante** sui confini applicativi (application layer, adapter API, identity, workflow asincroni).

Risposta netta: **sì, può diventare frontend di un backend Spring Boot**, ma non “as is”: serve una separazione esplicita tra use case frontend e infrastruttura (oggi locale FS + route handlers Next).

## 2. Architettura attuale (reale)

### Rendering
- Parsing/render markdown in `core/notedown/rendering.ts` con pipeline `unified + remark-parse + remark-gfm + remark-math + remark-rehype + rehype-katex + rehype-stringify`.
- Rendering usato sia in preview runtime (`/api/render`) sia in export statico (`renderCollection`).

### Editor
- Pagina editor server-side (`src/app/collections/[username]/[collectionSlug]/[[...docSlug]]/page.tsx`) carica collection dal filesystem e passa dati al client shell.
- `WorkspaceShell` (client) concentra: stato docs, autosave, debounce preview, rename-by-H1, conflitti slug, creazione/cancellazione docs, routing.

### Preview
- Preview separata in route Next (`src/app/preview/.../page.tsx`) che renderizza la collection con `renderCollection` e navigazione documento/indice.
- Nell’editor, preview live via POST `/api/render`.

### Export statico
- Endpoint export route (`src/app/collections/.../export/route.ts`) invoca `buildStaticSiteZip`.
- `buildStaticSiteZip` genera zip con HTML statico, CSS, metadati publication/documents e asset KaTeX copiati da `node_modules`.

### Gestione stato
- Stato locale React in `WorkspaceShell` (save state, docs list, content, error, timers).
- Nessuno state manager globale.
- Nessun livello di caching/query orchestration (es. React Query).

### Persistenza
- Persistenza locale FS in `src/core/notedown/storage.ts` con root `data/notes` (o env override).
- Modello: `manifest.json` + file markdown per doc.
- API route handlers Next fanno da thin controller su `storage.ts`.

### Routing
- Routing path-based multi-tenant semplice (`/collections/{username}/{collectionSlug}` e `/preview/{...}`).
- Helper centralizzati in `src/core/notedown/paths.ts`.

### Parsing markdown/math
- Centralizzato in `rendering.ts`, condiviso tra preview ed export.

### Coupling osservato
- Forte coupling tra UI editor e contratti API “locali” (shape risposte route handlers) dentro `WorkspaceShell`.
- Regole applicative (slug/title derivation, conflitti) duplicate tra client (`slug-conflict`, slugify locale) e server (`storage.updateDocument`).
- `core/notedown` mescola domain-like logic e infrastructure FS/export I/O.

## 3. Punti forti

1. **Core markdown coerente e riusabile**: una sola pipeline rendering usata in preview/export.
2. **Path/slug helpers centralizzati**: riduce incoerenze URL e naming.
3. **Modello dati semplice e leggibile** (`types.ts`, manifest+docs).
4. **Export già prodotto come artefatto portabile** (zip + metadata), utile base per publishing pipeline futura.
5. **Route handlers relativamente sottili**: buon punto di partenza per sostituire backend locale con API remote.

## 4. Debolezze e rischi

1. **WorkspaceShell troppo “god component”**
   - UI + orchestration + policy + networking + routing in un solo modulo.
2. **Assenza di application layer frontend**
   - Use case (`createDoc`, `saveDoc`, `deleteDoc`, `renameOnH1`) embedded nella UI.
3. **Duplicazione regole client/server**
   - Conflitti slug e rename gestiti lato client e lato server, con rischio divergenza.
4. **Dominio e infrastruttura non separati chiaramente**
   - `storage.ts` contiene policy + accesso filesystem.
5. **Assenza totale di auth/session/workspace reali**
   - `DEFAULT_USERNAME = anonymous`; nessuna boundary identity.
6. **Export sincrono in request path**
   - Potenziale blocco su collezioni grandi; manca job orchestration/status.
7. **Error handling povero e stringly-typed**
   - Conflitti dedotti con `String(err).includes("CONFLICT")` nelle API route.
8. **Nessuna astrazione per backend remoto**
   - Nessun repository/API client interface; fetch dirette nel componente.

## 5. Compatibilità con backend Java/Spring

Valutazione: **recuperabile con refactoring moderato/importante**.

- Come frontend puro separato: **sì**, ma serve estrarre use-case/app services dal layer component.
- Integrato con API Spring: **sì**, introducendo adapter HTTP typed e contratti DTO stabili.
- Base per piattaforma più ampia: **parzialmente**; core rendering/export è riusabile, ma orchestrazione editor va modularizzata.

Decisione consigliata: **non riscrivere da zero**, ma fare hardening progressivo.

## 6. Refactoring consigliato

### Essenziali
1. Introdurre `application/` frontend con use cases (`saveDocument`, `createDocument`, `deleteDocument`, `loadCollection`, `triggerExport`).
2. Introdurre `infrastructure/` con adapter `LocalApiAdapter` (attuale Next API) e futuro `SpringApiAdapter`.
3. Spezzare `WorkspaceShell` in moduli (editor pane, doc tree, toolbar, save controller).
4. Definire error model typed (`ConflictError`, `NotFoundError`, `ValidationError`).
5. Eliminare duplicazione policy slug/title: una sola fonte server-side, client fa optimistic UX ma valida su risposta canonical.

### Consigliati
1. Introdurre query/mutation layer (TanStack Query) per caching/retry/invalidation.
2. Definire DTO e OpenAPI contract con Spring.
3. Preparare auth boundary (session token/cookie, guard route, current user context).
4. Spostare export in job async (`POST /exports`, `GET /exports/{id}` status, download URL).

### Opzionali
1. Event sourcing leggero delle revisioni doc.
2. Collaborazione realtime (OT/CRDT) con channel separato.
3. Feature flags per modalità `standalone` vs `client-server`.

## 7. Architettura target proposta

### Frontend (Next.js mantenuto)
- **Presentation**: componenti React puri e route Next.
- **Application**: use case services + command/query models.
- **Domain (lightweight frontend)**: tipi e regole condivise (slug/title policy minimali).
- **Infrastructure adapters**:
  - `LocalNotedownAdapter` (compatibilità standalone, usa route locali).
  - `SpringNotedownAdapter` (REST backend Java).

### Backend Spring Boot
- Bounded contexts minimi:
  - Identity/Auth
  - Workspace/Collections/Documents
  - Publication/ExportJobs
- Persistenza DB + object storage per artifact export.
- API versionate e contratti stabili.

### Modalità operativa duale
- `NOTEDOWN_MODE=standalone|remote`.
- In standalone: backend locale Next mantiene esperienza attuale.
- In remote: frontend usa adapter Spring senza cambiare UI.

## 8. Piano evolutivo pragmatico

1. **Step 0 (stabilizzazione)**
   - test coverage use-case core attuali (save/rename/conflict/export metadata).
2. **Step 1 (modularizzazione frontend)**
   - estrarre servizi applicativi da `WorkspaceShell`.
3. **Step 2 (adapter abstraction)**
   - introdurre interfacce repository/client e adapter locale.
4. **Step 3 (contratti API target)**
   - definire DTO/openapi allineati con Spring.
5. **Step 4 (auth + user context)**
   - rimuovere `anonymous` hardcoded, introdurre sessione.
6. **Step 5 (remote persistence)**
   - implementare adapter Spring per collections/docs.
7. **Step 6 (export async)**
   - migrare export a job asincrono con polling/status.
8. **Step 7 (decommission parziale locale)**
   - mantenere FS/export locale solo come modalità standalone.

## Classificazione finale

- **Già buono**: pipeline markdown/render, preview/export statico, semplicità modello dati.
- **Recuperabile**: routing/path helpers, route handlers, esperienza editor.
- **Da ripensare**: confini UI/use-case/infrastructure, identity/auth, export sincrono, integrazione backend enterprise.
