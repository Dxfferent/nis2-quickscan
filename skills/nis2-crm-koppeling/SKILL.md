---
name: nis2-crm-koppeling
description: Koppel de lead-gate van de NIS2 Quickscan aan het CRM van een MSP — HubSpot-form aanmaken, het nis2_rapport-veld, de follow-up-workflow die het rapport mailt, en de verplichte end-to-end-test. Gebruik bij vragen als "hoe komen de leads in ons CRM", "hoe koppel ik HubSpot", "de gate verstuurt niets", "wij gebruiken geen HubSpot", of het inrichten van de rapportmail.
---

# CRM-koppeling NIS2 Quickscan

Je helpt een MSP de lead-gate van de tool aan zijn CRM knopen. De tool submit
native uitsluitend naar de **HubSpot Forms API v3**; andere CRM's kunnen ook,
maar via HubSpot als tussenstation of een eigen code-aanpassing (zie onderaan).

Werk stapsgewijs en wacht steeds op antwoord. Jij begeleidt; de MSP klikt zelf
in de eigen HubSpot. Vraag nooit om inloggegevens.

## Stap 0 — Welk CRM draait de MSP?

- **HubSpot** → stap 1 t/m 4.
- **Iets anders** (Autotask, HaloPSA, Salesforce, Pipedrive, …) → sectie
  *Geen HubSpot?* onderaan.
- **Geen CRM of geen leads nodig** → gate uit laten (geen `hubspot`-blok in
  `MSP_BRAND`). De tool werkt volledig zonder gate; bezoekers zien direct hun
  hele rapport. Klaar.

## Stap 1 — HubSpot-form aanmaken

In HubSpot: **Marketing → Forms → Create form** (embedded form). Vereisten:

- veld **`email`** (verplicht veld);
- veld **`message`** (tekstveld) — de tool vult hier automatisch een regel met
  herkomst-tag, scope-uitkomst en score in;
- **reCAPTCHA uit** op dit form — de Forms API weigert submits op forms met
  reCAPTCHA, en de bezoeker ziet dan alleen de mailto-fallback.

Noteer het **portalId** (het cijfer in de HubSpot-URL of embed-code) en het
**formId** (de GUID uit de embed-code van het form).

## Stap 2 — Contact-property `nis2_rapport` (aanbevolen)

**Settings → Properties → Contact properties → Create property**: naam
`nis2_rapport`, type **multi-line text**. Voeg hem als (hidden) veld toe aan
het form uit stap 1.

De gate stuurt dan per lead een compacte rapport-samenvatting mee (JSON:
scope-uitkomst, totaalscore, score per domein, RTO/RPO-profielen, top-gaps).
Daarmee ziet sales bij elke lead direct waar het gesprek over moet gaan.
Ontbreekt de property, dan herhaalt de tool de submit automatisch zonder dit
veld: de lead landt dan alsnog, alleen zonder diagnose.

## Stap 3 — De rapportmail (workflow): verplicht bij een actieve gate

De gate zegt tegen de bezoeker dat de MSP het rapport ook per e-mail stuurt.
**Die mail verstuurt HubSpot niet vanzelf.** Daar hoort een workflow bij:

1. **Automations → Workflows → Create**: trigger = *Form submission* van het
   form uit stap 1.
2. Actie: *Send email* (geautomatiseerde marketing-e-mail). Advies-inhoud:
   bedankt-regel, de kern van de uitkomst, en een concrete
   vervolgstap-CTA ("plan het gesprek"). Let op: `nis2_rapport` is een
   JSON-blok voor intern gebruik. Plak het niet één-op-één in een klantmail;
   houd de mail leesbaar en verwijs naar het rapport dat de bezoeker al op
   het scherm (en als PDF) heeft.
3. Draait de NIS2-updates-opt-in mee (`hubspot.subscriptionTypeId` in
   `MSP_BRAND`)? Koppel dat nummer aan het juiste subscription-type
   (**Settings → Marketing → Email → Subscription types**) en mail alleen
   nieuwsbrieven aan contacten mét die opt-in.

## Stap 4 — Config en end-to-end-test

Zet de ids in het brand-blok in `index.html`:

```js
window.MSP_BRAND = {
  name: 'Bedrijfsnaam',
  privacyUrl: 'https://voorbeeld.nl/privacy', // verplicht voor de gate
  hubspot: { portalId: '12345678', formId: 'abcd-…' },
  // …overige branding, zie docs/MSP-ENABLEMENT.md
};
```

Test daarna één keer **end-to-end met een eigen e-mailadres**, pas daarna live:

- [ ] gate verschijnt op de rapportstap (lead-stand);
- [ ] na submit toont de pagina het volledige rapport;
- [ ] het contact staat in HubSpot, mét `message` en (indien ingericht)
      `nis2_rapport`;
- [ ] de workflow-mail komt daadwerkelijk aan.

Faalt de submit ("Versturen lukte niet"): controleer reCAPTCHA (uit), de twee
verplichte velden en de ids. Verschijnt er helemaal geen gate: er ontbreekt
een verplichte sleutel (`name`, `privacyUrl` of een van de ids). Dat is
bedoeld gedrag, geen bug.

## Geen HubSpot?

Drie routes, in volgorde van minste werk:

1. **HubSpot gratis als lead-inbox.** Een gratis HubSpot-portal vangt de leads
   en stuurt de rapportmail; een native integratie of koppelaar (bijv. Zapier/
   Make) schuift het contact door naar het eigen CRM. Geen code-aanpassing.
2. **Gate uit, eigen CTA.** Zonder gate is het rapport direct zichtbaar; de
   MSP zet het bestaande contact-/afspraakkanaal in voor de opvolging. Nul
   koppeling, ook nul leads.
3. **Code aanpassen.** De submit zit in `submitGate` in
   `assets/wizard-app.jsx` en kan naar een eigen endpoint wijzen. Let op
   AGPL-3.0 §13: wie een gewijzigde versie aanbiedt, publiceert de gewijzigde
   bron en laat `SOURCE_URL` naar die eigen repo wijzen (zie ATTRIBUTION.md).

## Grenzen

- Wie een gate draait verwerkt persoonsgegevens: `privacyUrl` naar een eigen
  privacyverklaring is verplicht, met HubSpot als verwerker benoemd; zie
  `docs/MSP-ENABLEMENT.md` (*Privacy (AVG)*) en `docs/PRIVACY-TEMPLATE.md`.
  Je geeft geen juridisch advies; adviseer een eigen juridische check.
- Installatie van de tool zelf hoort bij `nis2-installatie/`; inhoudelijke
  rapportvragen bij `nis2-rapport-adviseur/`.

<!-- SPDX-License-Identifier: AGPL-3.0-only -->
*Onderdeel van de NIS2 Quickscan — © 2026 Dxfferent B.V., AGPL-3.0-only
([broncode](https://github.com/Dxfferent/nis2-quickscan)). Normbasis:
ADR & NOREA, Cbw (NIS2) Control Framework (2025), CC BY 4.0 gelicenseerd —
bewerkt door Dxfferent B.V.; maatregel-titels en codes uit NIS2 Supply Chain
(Stichting Kwaliteitsinnovatie). Dxfferent is als auditor aangesloten bij AuditPlanner;
deze skill is geen certificeringsinstrument en is niet door Stichting
Kwaliteitsinnovatie beoordeeld of goedgekeurd. Uitkomsten zijn
indicatief en vormen geen juridisch advies.*
