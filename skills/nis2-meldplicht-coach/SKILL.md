---
name: nis2-meldplicht-coach
description: Begeleid een organisatie of MSP door de NIS2-meldplicht bij een (mogelijk) significant incident - wat moet wanneer gemeld, aan wie, met welke inhoud. Gebruik bij een lopend security-incident bij een in-scope entiteit, of bij het inrichten van een meldproces/draaiboek.
---

# NIS2-meldplicht-coach

Je begeleidt langs de wettelijke meldtijdlijn van de Cbw. Wees concreet over
deadlines en verplichte inhoud; bij een acuut incident is dit een checklist,
geen essay. Meldpunt: **mijn.ncsc.nl**.

## Is het significant?

Voorlopig criterium (drempels volgen bij ministeriële regeling): ernstige
operationele verstoring of financiële schade (of dat risico), of aanzienlijke
materiële/immateriële schade aan anderen. Bij twijfel: behandel als
significant — te vroeg melden is herstelbaar; te laat niet.

## De tijdlijn

1. **Vroegtijdige waarschuwing — ≤ 24 uur** na kennisname. Verplicht is alleen,
   voor zover op dat moment bekend: of het incident vermoedelijk door
   onrechtmatig of kwaadwillig handelen is veroorzaakt, en of er
   grensoverschrijdende gevolgen kunnen zijn. Contactgegevens en een eerste
   beeld hoeven wettelijk nog niet, maar versnellen de afhandeling.
2. **Incidentmelding — ≤ 72 uur** na kennisname. Update van de eerste
   melding: initiële beoordeling ernst en gevolgen, indicatoren van aantasting.
   Óók verplicht als er niets veranderd is.
3. **Tussentijds verslag — op verzoek** van CSIRT of bevoegde autoriteit,
   zolang het incident loopt. Geen vaste termijn.
4. **Eindverslag — ≤ 1 maand** na de incidentmelding: gedetailleerde
   beschrijving, ernst en gevolgen, vermoedelijke oorzaak/dreigingssoort,
   maatregelen, grensoverschrijdende gevolgen. Loopt het incident nog, dan
   dient u op dat moment een voortgangsverslag in; het eindverslag volgt
   ≤ 1 maand na de afhandeling van het incident.

**Andere regimes — geen kortere Cbw-termijn.** Valt de entiteit als financiële
entiteit onder DORA, dan gelden de Cbw-zorgplicht en -meldplicht niet: melden
gaat onder DORA (initiële melding binnen 4 uur na classificatie als majeur
incident, uiterlijk 24 uur na kennisname). Voor als critical- of high-impact
aangemerkte elektriciteitsentiteiten geldt daarnaast de netcode
cyberbeveiliging (Verordening (EU) 2024/1366): melding binnen vier uur nadat
een aanval als meldwaardig is geclassificeerd. Binnen de Cbw zelf is er één
afwijkende termijn: vertrouwensdiensten melden binnen 24 uur.

## Vergeet niet

- Ontvangers van de dienst informeren bij mogelijke impact op hen (Cbw art. 30).
- Bewijsmateriaal veiligstellen vóór herstel (forensics-gereedheid).
- Parallel AVG-datalek? Aparte melding bij de AP binnen 72 uur — de
  NIS2-melding vervangt die niet.
- Log elke melding met tijdstip; de 24/72-uursklok start bij kennisname.

---

<!-- SPDX-License-Identifier: AGPL-3.0-only -->
*Onderdeel van de NIS2 Quickscan — © 2026 Dxfferent B.V., AGPL-3.0-only
([broncode](https://github.com/Dxfferent/nis2-quickscan)). Normbasis:
ADR & NOREA, Cbw (NIS2) Control Framework (2025), CC BY 4.0 gelicenseerd —
bewerkt door Dxfferent B.V.; maatregel-titels en codes uit NIS2 Supply Chain
(Stichting Kwaliteitsinnovatie). Dxfferent is niet verbonden aan, gecertificeerd
door of goedgekeurd door Stichting Kwaliteitsinnovatie. Uitkomsten zijn
indicatief en vormen geen juridisch advies.*
