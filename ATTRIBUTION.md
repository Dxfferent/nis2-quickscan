# Bronvermelding & gebruiksvoorwaarden

## Normdata (verplichte bronvermelding)

De inhoudelijke basis van deze tool (`assets/intake-config.json` en de
`skills/`) komt uit publieke bronnen met eigen voorwaarden:

- **Cbw (NIS2) Control Framework v1.2** — het frameworkbestand is door de
  makers gelicenseerd onder Creative Commons Naamsvermelding 4.0 (CC BY 4.0).
  Voorgeschreven naamsvermelding: "ADR & NOREA, Cbw (NIS2) Control Framework
  (2025), CC BY 4.0 gelicenseerd." Licentie:
  https://creativecommons.org/licenses/by/4.0/. De normdata in
  `assets/intake-config.json` is een door Dxfferent B.V. bewerkte selectie
  (herstructurering naar intake-vragen en koppeling aan referentiekaders);
  de wijzigingen zijn niet door ADR/NOREA goedgekeurd of onderschreven.
  Framework opgesteld o.b.v. wetsvoorstel 36764 + de concept-AMvB; beide
  zijn inmiddels definitief: Cyberbeveiligingswet (Stb. 2026, 187) en
  Cyberbeveiligingsbesluit (Stb. 2026, 189), inwerkingtreding
  15 augustus 2026. De artikelverwijzingen in de normdata zijn na publicatie
  geverifieerd tegen de gepubliceerde teksten (Stb. 2026, 187 en 189),
  laatst herbevestigd 05-08-2026.
- **NIS2 Supply Chain** (tot januari 2026: NIS2 Kwaliteitsmerk) —
  Stichting Kwaliteitsinnovatie. Deze tool gebruikt uitsluitend
  maatregel-titels met numerieke SC-codeverwijzingen, de namen van de
  niveau-indeling (SC10/20/30, voorheen QM-10/20/30) en de norm-referenties
  (ISO/IEC 27001, CIS Controls v8, IEC 62443, NIST SP 800-53) uit de
  officiële Mapping-secties van de "Volledige versie"-documenten (V3.0,
  16-10-2024) — géén doelteksten of teksten uit de auditrichtlijnen.
  De niveau-indeling per maatregel (het vanaf-niveau `sc_from`:
  SC10/20/30, afgeleid uit de niveaudocumenten) is opgenomen met
  schriftelijke toestemming van Stichting Kwaliteitsinnovatie. De volledige mappings (ISO/IEC 27001,
  CIS Controls v8, IEC 62443, NIST SP 800-53) zijn per maatregel
  geverifieerd ongewijzigd tegen de herziene volledige editie van
  8-4-2025 en — voor maatregelcodes en ISO-referenties — tegen de korte
  normversies SC10/20/30 V3.2 (15-12-2025); de release notes V3.2
  (Schema, Norm en Werkwijzer, 01-01-2026) melden geen norminhoudelijke
  wijzigingen in V3.1/V3.2 — uitsluitend schema en proces (terminologie,
  governance, audittijd). Dxfferent B.V. en deze tool zijn niet verbonden aan,
  gecertificeerd door of goedgekeurd door Stichting Kwaliteitsinnovatie.
  De intake is geen certificeringsinstrument: het doorlopen ervan levert
  geen NIS2 Supply Chain-certificaat (voorheen NIS2 Kwaliteitsmerk) op en
  geeft geen recht op het voeren van dat keurmerk.
- **Officiële verwijzingen**: RDI-zelfevaluatie
  (regelhulpenvoorbedrijven.nl/NIS-2-NL), meldpunt mijn.ncsc.nl.

De attributie-footer in het rapport rendert deze bronvermelding en moet in
elke deploy en elke afgeleide versie intact blijven.

## Software en fonts van derden

De gebouwde site (`dist/`) bevat naast eigen code de volgende werken van
derden. Hun licentiebestanden reizen mee in `dist/` en mogen niet verwijderd
worden.

| Werk | Licentie | Waar in de build |
|---|---|---|
| React en React-DOM 18.3.1 — Copyright (c) Facebook, Inc. and its affiliates | MIT | `dist/vendor/`, met de volledige licentietekst in `react-LICENSE.txt` en `react-dom-LICENSE.txt`; in `review/nis2-quickscan-review.html` (buiten `dist/`) staat die tekst als comment vóór de ingesloten scripts |
| esbuild (Evan Wallace) | MIT | build-tooling — er belandt geen esbuild-code in `dist/` |
| Archivo Black — Copyright 2017 The Archivo Black Project Authors | SIL OFL 1.1 | `dist/assets/fonts/`, licentie in `OFL-archivo-black.txt` |
| DM Sans — Copyright 2014 The DM Sans Project Authors | SIL OFL 1.1 | `dist/assets/fonts/`, licentie in `OFL-dm-sans.txt` |
| IBM Plex Mono — Copyright © 2017 IBM Corp. with Reserved Font Name "Plex" | SIL OFL 1.1 | `dist/assets/fonts/`, licentie in `OFL-ibm-plex-mono.txt` |

Buiten de build: `index.html` in de repo-root is een ontwikkelvariant die React
en `@babel/standalone` (MIT) van unpkg laadt. Die reizen niet mee in `dist/` —
de productiebuild vervangt ze door de lokale bestanden hierboven en faalt als er
een CDN-verwijzing achterblijft.

## Licentie & aanvullende voorwaarden

De code is gelicenseerd onder de **GNU AGPL-3.0** (zie LICENSE),
© 2026 Dxfferent B.V. Dat betekent: vrij te gebruiken en aan te passen —
ook commercieel, ook white-label — maar wie een (aangepaste) versie
verspreidt of als publieke webdienst aanbiedt, moet de broncode van die
versie onder dezelfde licentie beschikbaar stellen. Een gesloten of
doorverkochte variant zonder bronpublicatie is daarmee uitgesloten.

Als aanvullende voorwaarde onder **AGPL-3.0 §7(b)** (behoud van
naamsvermeldingen) geldt behoud van:

1. de bronvermelding van de normdata (attributie-footer, zie boven);
2. de vermelding "powered by Dxfferent" in de rail.

Als aanvullende voorwaarde onder **AGPL-3.0 §7(a)** (afwijkende
aansprakelijkheidsbeperking) geldt behoud van:

3. de disclaimer in het rapport (gratis hulpmiddel, uitkomsten indicatief,
   geen aansprakelijkheid, eigen controle verplicht, geen juridisch advies).

Het supportkanaal `hallo@dxfferent.nl` in de rail is een uitnodiging vanuit het
partnermodel, geen licentievoorwaarde — een white-label-partner mag daar zijn
eigen supportadres zetten.

Deze aanvullende voorwaarden zijn aangebracht conform AGPL-3.0 §7; elke
source-file verwijst hiernaar in zijn licentie-header. Het merkenbeleid in
`TRADEMARK.md` berust op §7(e) (geen rechten onder merkenrecht).

## Broncode-aanbod (AGPL-3.0 §13)

De tool draait volledig in de browser en is daarmee een netwerkdienst in de zin
van §13: **wie een (aangepaste) versie aan anderen aanbiedt, moet die gebruikers
de bijbehorende broncode aanbieden.** Daarom staat er in de rail een
`broncode`-link, buiten `MSP_BRAND` en naast de drie vermeldingen hierboven.

Past u de code aan, dan volstaat de link naar Dxfferent niet: die wijst naar
óns werk, niet naar het uwe. Laat `SOURCE_URL` in `assets/wizard-app.jsx` dan
naar uw eigen, publiek benaderbare bron wijzen. Gebruikt u de tool ongewijzigd
(alleen een `MSP_BRAND`-config, wat geen wijziging van de code is), dan mag de
link blijven staan zoals hij is.

## White-label-gebruik

Voor gebruik onder het partnermodel — eigen naam, logo, kleuren en leadflow
via `window.MSP_BRAND` — gelden dezelfde drie vermeldingen hierboven; ze
zitten bewust hardcoded buiten de brand-config:

1. **Attributie-footer** in het rapport blijft staan (normdata-voorwaarde
   hierboven).
2. **"powered by Dxfferent"** + het supportkanaal in de rail blijven staan.
   Dxfferent streeft er daarnaast naar normdata-updates bij wetswijzigingen
   te publiceren en biedt support en white-label-hulp via
   hallo@dxfferent.nl — als vrijblijvende service, zonder gegarandeerde
   termijnen en zonder daartoe verplicht te zijn.
3. **Disclaimer** in het rapport blijft staan: gratis hulpmiddel, uitkomsten
   indicatief o.b.v. de vermelde normdata-versie, geen garantie op
   juistheid/volledigheid/actualiteit, aansprakelijkheid uitgesloten
   behoudens opzet of bewuste roekeloosheid, eigen controle tegen de
   officiële bronnen verplicht, geen juridisch advies.

"Dxfferent" is de handelsnaam van Dxfferent B.V. (KvK 77524950). Op de
naam en het beeldmerk rusten handelsnaam- respectievelijk auteursrechten;
de licentie verleent geen enkel recht op gebruik van de naam of het logo
van Dxfferent, behalve voor zover nodig voor de hierboven vereiste
vermeldingen.

Niets in deze repository is juridisch advies.
