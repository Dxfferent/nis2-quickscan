# NIS2 MSP-skillset

Zes Claude-skills die de kennis achter de NIS2 Quickscan meenemen naar het
gesprek: dezelfde normbasis, dezelfde grenzen, maar dan pratend in plaats van
klikkend. Ze werken in Claude Code, Claude Desktop en claude.ai, en er is niets
te installeren behalve de map zelf.

| Skill | Doel |
|-------|------|
| `nis2-installatie/` | De tool op de eigen website zetten: downloaden, huisstijl, uploaden, AVG bij de lead-gate |
| `nis2-crm-koppeling/` | De lead-gate aan het CRM knopen: HubSpot-form, `nis2_rapport`-veld, rapportmail-workflow, end-to-end-test |
| `nis2-scope-check/` | Cbw-scope bepalen: sector (bijlage 1/2), size-cap, van-rechtswege-categorieën, hoofdvestigingsregel |
| `nis2-meldplicht-coach/` | Meldplicht-begeleiding bij een (mogelijk) significant incident: 24u/72u/verslag-tijdlijn, uitzonderingen |
| `nis2-rapport-adviseur/` | Intake-rapport vertalen naar een concreet MSP-voorstel per werkpakket |
| `nis2-msp-gtm/` | De intake-tool commercieel inzetten: webinar, leadflow, white-label |

## De skills één voor één

### `nis2-installatie/` — de tool op uw site krijgen

Loopt stap voor stap met u door: zip downloaden, het `MSP_BRAND`-blok invullen,
uploaden naar uw hosting, en de AVG-vereisten als u de lead-gate aanzet. De
skill gaat ervan uit dat u geen developer bent: geen terminal, geen Node, geen
git.

Vraag bijvoorbeeld:

- "Hoe zet ik deze tool op mijn site?"
- "Hoe krijg ik mijn eigen logo erin?"
- "De tool laadt niet, er staat een configuratiefout."

Wat hij niet doet: inhoudelijke NIS2-vragen beantwoorden (die horen bij de
scope-check of de rapport-adviseur) en juridisch advies geven over uw
privacyverklaring. Op de vraag of de bronvermelding weg mag is het antwoord
nee, met verwijzing naar `ATTRIBUTION.md`.

### `nis2-crm-koppeling/` — leads in uw eigen CRM

Richt de hele keten in: het HubSpot-form, de contact-property `nis2_rapport`,
de workflow die het rapport mailt, en de end-to-end-test die u vóór livegang
draait. Gebruikt u geen HubSpot, dan bespreekt de skill de drie alternatieve
routes.

Vraag bijvoorbeeld:

- "Hoe komen de leads in ons CRM?"
- "De gate verstuurt niets, wat gaat er mis?"
- "Wij gebruiken Autotask, kan dat ook?"

Wat hij niet doet: hij vraagt nooit om uw inloggegevens, u klikt zelf in uw
eigen portal. Juridische toetsing van uw privacyverklaring valt erbuiten.

### `nis2-scope-check/` — valt deze organisatie eronder?

Werkt de beslislogica in vaste volgorde af: eerst de
van-rechtswege-categorieën, dan de sector (bijlage 1 of 2), dan de size-cap,
dan de jurisdictievraag. U krijgt een indicatie, de doorslaggevende regels
erbij, en de vervolgstap.

Vraag bijvoorbeeld:

- "Valt mijn klant met 40 fte in de zorg onder de wet?"
- "Zijn wij essentieel of belangrijk?"
- "Telt onze Duitse moedermaatschappij mee voor de omvang?"

Wat hij niet doet: uw classificatie vaststellen. De wettekst is bepalend en de
RDI-zelfevaluatie is het officiële hulpmiddel om die classificatie vast te
stellen; de skill verwijst daar altijd naar en geeft geen juridisch advies.

### `nis2-meldplicht-coach/` — wat moet wanneer gemeld

Bij een lopend incident is dit een checklist, geen essay: de tijdlijn van
vroegtijdige waarschuwing (24 uur) via incidentmelding (72 uur) naar
eindverslag, met de uitzonderingen erbij. Ook bruikbaar om vooraf een
meldproces of draaiboek in te richten.

Vraag bijvoorbeeld:

- "We hebben een incident — wat moet ik wanneer melden?"
- "Is dit significant genoeg om te melden?"
- "Wij vallen onder DORA, geldt de Cbw-meldplicht dan ook?"

Wat hij niet doet: de melding voor u indienen, of beoordelen of uw specifieke
incident juridisch meldplichtig is. Melden gaat via mijn.ncsc.nl.

### `nis2-rapport-adviseur/` — van rapport naar voorstel

Neemt een ingevuld intake-rapport (gereedheidsscore, gaps per domein, roadmap)
en vertaalt dat naar werkpakketten, prioriteiten en een gespreksagenda, met de
normreferenties uit het rapport zelf als onderbouwing.

Vraag bijvoorbeeld:

- "Hier is het intake-rapport van een klant, waar beginnen we?"
- "Welke werkpakketten dekken deze gaps af?"
- "Hoe maak ik hier een QBR-agenda van?"

Wat hij niet doet: de uitgewerkte sequencing- en offertemethodiek per
scoreband leveren. Dat is geen publieke bron en zit niet in deze skillset; het
hoort bij het Dxfferent-partnerprogramma.

### `nis2-msp-gtm/` — de tool commercieel inzetten

Het model is: diagnose gratis, gate op het rapport, white-label als
partnerhaak. De skill helpt u dat vertalen naar een webinar, een leadflow of
1-op-1-inzet bij QBR's en new business, en bewaakt wat u wel en niet mag
claimen.

Vraag bijvoorbeeld:

- "Hoe bouw ik hier een webinar omheen?"
- "Wat mag ik wel en niet claimen over NIS2 in onze uitingen?"
- "Hoe zet ik dit in bij een bestaande klant?"

Wat hij niet doet: het uitgewerkte draaiboek met script, timing en
opvolg-cadans leveren; ook dat hoort bij het partnerprogramma. En de claim
"NIS2-compliant worden met tool X" wijst de skill af, want de intake is een
diagnose en compliance is een traject.

## Installeren

Elke skill is één map met één `SKILL.md` erin, zonder verdere afhankelijkheden.
Kopiëren is de hele installatie.

### Claude Code

Kopieer de mappen die u wilt gebruiken naar een van deze twee plekken:

- `.claude/skills/` in een project, als u ze alleen daar nodig heeft;
- `~/.claude/skills/` in uw thuismap, als u ze overal wilt kunnen gebruiken.

Daarna stelt u gewoon uw vraag: Claude kiest zelf de passende skill op basis
van waar u naar vraagt. Wilt u er een expliciet aanroepen, typ dan de naam als
commando, bijvoorbeeld `/nis2-scope-check`.

### Claude Desktop en claude.ai

Twee routes, allebei zonder terminal:

- **Als projectkennis.** Maak een Project aan en voeg de `SKILL.md`-bestanden
  toe aan de kennis van dat project. Elk gesprek binnen dat project heeft de
  inhoud dan bij de hand.
- **Via de skills-functie.** Voeg de skill-map toe waar Claude om skills
  vraagt. Claude pakt hem er dan bij zodra uw vraag erop aansluit.

Weet u niet zeker wat uw omgeving ondersteunt: de projectkennis-route werkt
overal en kost twee minuten.

## Skills als agent laten draaien

In Claude Code kunt u werk uitbesteden aan een subagent: een aparte Claude met
een eigen context die één taak afmaakt en het resultaat teruggeeft. Dat loont
zodra u dezelfde skill op meer dan één dossier wilt draaien, of terwijl u zelf
met iets anders bezig bent.

Een scope-check over een klantportefeuille, bijvoorbeeld:

> Draai voor elke organisatie in `klanten.csv` de Cbw-scope-check. Geef per
> organisatie de indicatie, de doorslaggevende regel en de vervolgstap, in één
> tabel. Meld apart welke gevallen te weinig gegevens hebben voor een
> indicatie.

Hetzelfde werkt voor de rapport-adviseur op een stapel intake-dossiers. Twee
dingen om te weten: een subagent ziet alleen wat u hem meegeeft, dus noem de
bestanden expliciet; en de uitkomst blijft een indicatie die u zelf nakijkt,
net als bij een gesprek.

## Samenhang met de tool

De skills en de tool delen hun normbasis, en dus ook hun grenzen. Wat de tool
op het scherm zet, zegt de skill in het gesprek: dezelfde maatregelen, dezelfde
artikelverwijzingen, dezelfde voorbehouden. Een uitkomst uit een skill is net
zo indicatief als een uitkomst uit de intake, en net zomin een juridisch
advies.

Praktisch: gebruik de intake als u een rapport wilt dat de klant meekrijgt, en
de skills als u wilt doorvragen op een uitkomst, een incident moet afhandelen
of het vervolgtraject wilt uittekenen.

## Bronnen & grenzen

- Feitelijke basis: Cbw (Stb. 2026, 187; inwerkingtreding 15 augustus 2026)
  en het Cbw (NIS2) Control Framework v1.2 (ADR & NOREA, CC BY 4.0 —
  bewerkt door Dxfferent B.V.), met maatregel-titelverwijzingen (SC-codes)
  naar de norm NIS2 Supply Chain (voorheen NIS2 Kwaliteitsmerk;
  Stichting Kwaliteitsinnovatie).
- De skillset bevat GEEN doelteksten, niveau-toepasselijkheidsmapping of
  teksten uit de SC-auditrichtlijnen en geen applicability-matrix: dat is
  schema-/auditmateriaal. Niet verbonden aan of goedgekeurd door Stichting
  Kwaliteitsinnovatie.
- GTM-draaiboeken, sequencing- en voorstelmethodiek zijn geen publieke bron
  en zitten niet in deze skillset; die horen bij het
  Dxfferent-partnerprogramma (hallo@dxfferent.nl).
- Elke skill verplicht doorverwijzing naar de officiële bronnen
  (RDI-zelfevaluatie, mijn.ncsc.nl) en het voorbehoud "geen juridisch advies".

Bronvermeldingen: zie `../ATTRIBUTION.md`; die blijven bij hergebruik intact.
