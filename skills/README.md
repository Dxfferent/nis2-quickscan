# NIS2 MSP-skillset

Deelbare Claude-skills rond de NIS2 Quickscan in deze repo: twee die de tool
zelf helpen neerzetten (installatie en CRM-koppeling) en vier waarmee een MSP
(of partner) NIS2/Cbw-gesprekken, scope-checks en rapport-opvolging voert op
hetzelfde kennisniveau als de tool zelf.

| Skill | Doel |
|-------|------|
| `nis2-installatie/` | De tool op de eigen website zetten: downloaden, huisstijl, uploaden, AVG bij de lead-gate |
| `nis2-crm-koppeling/` | De lead-gate aan het CRM knopen: HubSpot-form, `nis2_rapport`-veld, rapportmail-workflow, end-to-end-test |
| `nis2-scope-check/` | Cbw-scope bepalen: sector (bijlage 1/2), size-cap, van-rechtswege-categorieën, hoofdvestigingsregel |
| `nis2-meldplicht-coach/` | Meldplicht-begeleiding bij een (mogelijk) significant incident: 24u/72u/verslag-tijdlijn, uitzonderingen |
| `nis2-rapport-adviseur/` | Intake-rapport vertalen naar een concreet MSP-voorstel per werkpakket |
| `nis2-msp-gtm/` | De intake-tool commercieel inzetten: webinar, leadflow, white-label |

## Installeren

Kopieer de skill-mappen naar `.claude/skills/` van uw project (of
`~/.claude/skills/` voor globaal gebruik). Elke skill is een zelfstandige
`SKILL.md` zonder verdere dependencies.

## Bronnen & grenzen

- Feitelijke basis: Cbw (Stb. 2026, 187; inwerkingtreding 15 augustus 2026)
  en het Cbw (NIS2) Control Framework v1.2 (ADR & NOREA, CC BY 4.0 —
  bewerkt door Dxfferent B.V.), met maatregel-titelverwijzingen (SC-codes)
  naar de norm NIS2 Supply Chain (voorheen NIS2 Kwaliteitsmerk;
  Stichting Kwaliteitsinnovatie).
- De skillset bevat GEEN doelteksten, niveau-toepasselijkheidsmapping of
  teksten uit de SC-auditrichtlijnen en geen applicability-matrix — dat is
  schema-/auditmateriaal. Niet verbonden aan of goedgekeurd door Stichting
  Kwaliteitsinnovatie.
- GTM-draaiboeken, sequencing- en voorstelmethodiek zijn geen publieke bron
  en zitten niet in deze skillset — die horen bij het
  Dxfferent-partnerprogramma (hallo@dxfferent.nl).
- Elke skill verplicht doorverwijzing naar de officiële bronnen
  (RDI-zelfevaluatie, mijn.ncsc.nl) en het voorbehoud "geen juridisch advies".

Bronvermeldingen: zie `../ATTRIBUTION.md` — die blijven bij hergebruik intact.
