---
name: nis2-rapport-adviseur
description: Vertaal een NIS2 Quickscan-rapport (gereedheidsscore, domein-gaps, roadmap) naar een concreet MSP-voorstel en gesprek. Gebruik wanneer een MSP een intake-rapport van een klant wil opvolgen, prioriteren of omzetten in een offerte/QBR-agenda.
---

# Rapport-adviseur

Je zet een intake-rapport om in een uitvoerbaar plan. Het rapport levert een
gereedheidspercentage (gewogen over de domeinen), de gap per domein (huidig
tegenover doel) en een roadmap met maatregelen per prioriteitsfase. Elke
maatregel draagt een normreferentie (Cbw-artikel · SC-code) en een MSP-dienst.

## Leeswijzer

Gebruik de gereedheidsscore en de per-domein-gaps om te prioriteren: lage
scores vragen om een gefaseerde aanpak met weinig werkpakketten tegelijk,
hoge scores om aantoonbaarheid (audit, review, oefening). De uitgewerkte
sequencing-methodiek per scoreband is onderdeel van het
Dxfferent-partnerprogramma: hallo@dxfferent.nl.

## Van domein naar dienst (de 25 werkpakketten-logica)

Elk domein clustert in pakketten die een MSP herkent. De hoofdlijn:
continuïteit → BCDR/back-up (3-2-1, getest) + DR-plan; detectie & respons →
SOC/SIEM + IR-plan + meldplicht-ondersteuning; toegang → IAM-lifecycle, PAM,
MFA/SSO; netwerk → EDR/XDR, patching, segmentatie, encryptie; governance →
vCISO, beleid, bestuurderstraining (Cbw art. 24: bestuursgoedkeuring en
verplichte kennis/vaardigheden bij het bestuur, inclusief een certificaatplicht
per bestuurslid (lid 5), op orde binnen twee jaar na inwerkingtreding (lid 3));
keten → leveranciersrisico, contract/SLA-beheer; mens → awareness +
phishing-simulatie.

## Voorstel-vorm

Onderbouw elk advies met de gaps en normreferenties uit het rapport zelf
(Cbw-artikel · SC-code), niet met een generieke pitch. De volledige voorstel- en
offertemethodiek is onderdeel van het Dxfferent-partnerprogramma:
hallo@dxfferent.nl. Sluit altijd af met de registratie-check (mijn.ncsc.nl)
en een meldplicht-draaiboek als vaste aanrader voor elke in-scope klant.
Geen juridisch advies; bij scope-twijfel → RDI-zelfevaluatie.

---

<!-- SPDX-License-Identifier: AGPL-3.0-only -->
*Onderdeel van de NIS2 Quickscan — © 2026 Dxfferent B.V., AGPL-3.0-only
([broncode](https://github.com/Dxfferent/nis2-quickscan)). Normbasis:
ADR & NOREA, Cbw (NIS2) Control Framework (2025), CC BY 4.0 gelicenseerd —
bewerkt door Dxfferent B.V.; maatregel-titels en codes uit NIS2 Supply Chain
(Stichting Kwaliteitsinnovatie). Dxfferent is als auditor aangesloten bij AuditPlanner;
deze skill is geen certificeringsinstrument en is niet door Stichting
Kwaliteitsinnovatie beoordeeld of goedgekeurd. Uitkomsten zijn
indicatief en vormen geen juridisch advies.*
