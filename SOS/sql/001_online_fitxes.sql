-- ══════════════════════════════════════════════════════════════════════════
-- /SOS/online · el directori públic de qui s'hi vol donar d'alta
-- ══════════════════════════════════════════════════════════════════════════
--
-- Aquesta taula guarda **fitxes que la pròpia persona ha escrit i ha firmat**.
-- No és el mateix que el paquet públic d'un node (`supplyPublicPack`), que surt
-- agregat i sense noms precisament perquè allà un node publica dades de tercers
-- que mai van dir que sí. Aquí sí que hi ha nom i municipi, i l'única cosa que
-- ho fa legítim és que qui apareix ha estat qui ho ha publicat.
--
-- ── Per què és NOMÉS-AFEGIR ────────────────────────────────────────────────
-- No hi ha comptes ni contrasenyes: qualsevol pot escriure a la taula. Si es
-- permetés `update` o `delete`, qualsevol podria sobreescriure o esborrar la
-- fitxa d'un altre, i el directori es podria censurar des de fora.
--
-- La integritat NO la dona el permís: la dona la firma. Cada fila porta una
-- fitxa firmada amb la clau privada de qui la publica, que no surt mai del seu
-- navegador. Qui vulgui falsificar-ne una pot inserir la fila —això no s'evita—
-- però la firma no li quadrarà, i **el client la descarta en llegir-la**. És el
-- mateix sedàs que la resta de l'aplicació: es confia en el que es pot
-- comprovar, no en qui allotja.
--
-- Conseqüència pràctica: el que es llegeix és, per cada `did`, **la fitxa vàlida
-- més nova**. Actualitzar-se és publicar-ne una altra. Retirar-se és publicar-ne
-- una amb `retirada: true`, que també va firmada —i per això només se'n pot
-- donar de baixa un mateix.
--
-- ── El que això NO resol ───────────────────────────────────────────────────
-- Una taula oberta a escriptura es pot inundar. Les restriccions de sota posen
-- un sostre a la mida i a la forma de cada fila, que atura l'accident i el
-- bot ximple, però no algú decidit. Si passa, el següent pas és una funció amb
-- límit per IP, no tancar l'escriptura: tancar-la tornaria a posar el control a
-- les mans de qui allotja, que és el que aquest disseny evita.

create table if not exists public.online_fitxes (
  id          bigint generated always as identity primary key,
  did         text        not null,
  fitxa       jsonb       not null,
  creat       timestamptz not null default now(),

  -- Un `did` d'aquesta casa: `did:sos:<alg>:<32 caràcters>`. Filtra el gruix
  -- del soroll abans que arribi al client.
  constraint online_did_forma check (did ~ '^did:sos:[a-z0-9-]{4,16}:[A-Za-z0-9_-]{16,64}$'),
  -- Una fitxa és un grapat de línies de text, no un fitxer. 24 KB hi caben de
  -- sobres i deixen fora qui vulgui fer servir això com a magatzem.
  constraint online_mida check (pg_column_size(fitxa) < 24576),
  -- El `did` de dins ha de ser el de la columna: si no, la fila no és ni
  -- consultable pel seu propietari.
  constraint online_did_quadra check (fitxa->>'did' = did),
  -- Ha de venir firmada. Que la firma sigui BONA no ho pot saber Postgres
  -- —ho comprova el navegador—, però una fila sense firma és brossa segura.
  constraint online_firmada check (fitxa ? 'sig' and fitxa ? 'signer')
);

-- ── Camps nous ─────────────────────────────────────────────────────────────
-- La fitxa és `jsonb` i per això afegir-hi camps **no és una migració**: el
-- setembre del 2026 hi van entrar `nick` i `pais` i aquest fitxer no es va
-- haver de tocar. Qui mana sobre què hi viatja és la llista `CAMPS` del client,
-- que és on es decideix; Postgres només comprova la forma i la mida.
--
-- El corol·lari, que val la pena tenir escrit: **una fitxa antiga segueix sent
-- vàlida**. No porta `nick` ni `pais`, i el client ha de pintar-la igual. Si
-- algun dia un camp nou es fes obligatori, les fitxes de tothom deixarien de
-- validar de cop i ningú entendria per què.

-- Es llegeix sempre «l'última fitxa vàlida de cada did»: aquest és l'ordre.
create index if not exists online_fitxes_did_creat on public.online_fitxes (did, creat desc);
create index if not exists online_fitxes_creat on public.online_fitxes (creat desc);

alter table public.online_fitxes enable row level security;

-- Llegir: tothom. És un directori públic; aquest és tot el sentit.
drop policy if exists online_llegir on public.online_fitxes;
create policy online_llegir on public.online_fitxes
  for select to anon, authenticated using (true);

-- Escriure: tothom pot AFEGIR. Vegeu el raonament de dalt: qui insereix brossa
-- no aconsegueix res, perquè la firma no li quadrarà.
drop policy if exists online_afegir on public.online_fitxes;
create policy online_afegir on public.online_fitxes
  for insert to anon, authenticated with check (true);

-- Modificar i esborrar: ningú. No hi ha cap política d'`update` ni de `delete`,
-- i amb RLS activat l'absència de política és una prohibició. Ni tan sols la
-- persona pot esborrar la seva fila: es retira publicant-ne una de nova amb
-- `retirada: true`, que deixa rastre del que va passar i quan.
