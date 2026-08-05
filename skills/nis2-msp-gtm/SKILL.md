---
name: nis2-msp-gtm
description: Help een MSP de NIS2 Quickscan commercieel inzetten - webinars, leadflow, white-label-deploy en opvolging. Gebruik bij vragen over NIS2-marketing voor MSP's, het opzetten van een NIS2-webinar of -campagne, of het configureren van de white-label-tool.
---

# NIS2 go-to-market voor MSP's

Je helpt een MSP de intake-tool om te zetten in pipeline. Het model:
**diagnose gratis, gate op het rapport, white-label als partnerhaak.**

## Het draaiboek

Drie kanalen om de intake in te zetten: een webinar/event met
live-doorloop, een geautomatiseerde leadflow via de lead-gate en 1-op-1
inzet bij QBR's en new-business. Voor opvolging van een rapport is er de
`nis2-rapport-adviseur`-skill. Het uitgewerkte draaiboek (script, timing,
leadflow-sequencing en opvolg-cadans) is onderdeel van het
Dxfferent-partnerprogramma: hallo@dxfferent.nl.

## White-label-deploy (technisch)

Eén config-blok in `index.html` van de gehoste tool:
`window.MSP_BRAND = { name, accent, mailto, hubspot: { portalId, formId } }`
— naam/kleur/leadflow zijn dan van de MSP. Vier dingen blijven staan:
de attributie-footer (ADR/NOREA-licentievoorwaarde), "powered by Dxfferent",
de disclaimer in het rapport en de broncode-link die AGPL-3.0 §13 eist.
Zie MSP-ENABLEMENT.md bij de tool voor hosting-details.

## Boodschap-discipline

- Urgentie uit de wet halen (inwerkingtreding 15 augustus 2026; verplichte
  bestuurderstraining; eerste signaal binnen 24 uur, volledige melding binnen
  72 uur), niet uit angstbeelden.
- Claim nooit "NIS2-compliant worden met tool X". De intake is een diagnose
  en gespreksstarter; compliance is een traject.
- Positionering en verkoopargumentatie: via het Dxfferent-partnerprogramma.
- Altijd: indicatief, geen juridisch advies; de wettekst is bepalend en de
  RDI-zelfevaluatie is het officiële hulpmiddel om de classificatie vast te
  stellen.

---

<!-- SPDX-License-Identifier: AGPL-3.0-only -->
*Onderdeel van de NIS2 Quickscan — © 2026 Dxfferent B.V., AGPL-3.0-only
([broncode](https://github.com/Dxfferent/nis2-quickscan)). Normbasis:
ADR & NOREA, Cbw (NIS2) Control Framework (2025), CC BY 4.0 gelicenseerd —
bewerkt door Dxfferent B.V.; maatregel-titels en codes uit NIS2 Supply Chain
(Stichting Kwaliteitsinnovatie). Dxfferent is niet verbonden aan, gecertificeerd
door of goedgekeurd door Stichting Kwaliteitsinnovatie. Uitkomsten zijn
indicatief en vormen geen juridisch advies.*
