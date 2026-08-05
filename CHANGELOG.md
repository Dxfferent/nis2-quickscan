# Wijzigingen

Alle relevante wijzigingen per release, met de normdata-versie er expliciet
bij. Zo ziet u in één oogopslag of een update u raakt. Een normdata-update is
een config-swap (`assets/intake-config.json` vervangen), geen rebuild.

Opzet volgens [Keep a Changelog](https://keepachangelog.com/nl/); versies
volgen [SemVer](https://semver.org/lang/nl/): major = breaking (bv. ander
configschema), minor = nieuwe functionaliteit of normdata-uitbreiding,
patch = fixes.

## 1.0.0 — augustus 2026

Eerste publieke release.

**Normdata:** Cbw (NIS2) Control Framework v1.2 (ADR & NOREA) ·
NIS2 Supply Chain V3.2 (SC-naamgeving, `sc_from`-niveaus) ·
Cyberbeveiligingswet (Stb. 2026, 187) en Cyberbeveiligingsbesluit
(Stb. 2026, 189), beide vastgesteld en gepubliceerd, in werking
15 augustus 2026.

- Begeleide intake in vijf (lead) of zes (pro) stappen: Cbw-scope-indicatie,
  datatypes, impact, RTO/RPO-herstelprofielen, (pro) volwassenheidsmeting,
  rapport.
- 78 maatregelen over 9 domeinen, geclusterd in 25 MSP-werkpakketten, met
  letterlijke normverwijzingen (Cbw-artikelen, SC, ISO/IEC 27001, CIS v8,
  IEC 62443, NIST SP 800-53).
- Dienstenmenukaart over de drie SC-niveaus, afgeleid uit scope en
  herstelprofiel; vervangbaar per MSP via `MSP_BRAND.packages`.
- Meldplicht-tijdlijn (24u / 72u / eindverslag), inclusief de DORA-route
  (lex specialis) en de kortere termijn voor vertrouwensdiensten.
- White-label via één `MSP_BRAND`-configblok; optionele lead-gate op
  HubSpot-forms met AVG-waarborgen (de gate verschijnt alleen als hij
  volledig geconfigureerd is).
- Statische site zonder backend; release-zip voor hosting zonder
  ontwikkelomgeving; dossier opslaan/laden in de pro-stand.
- Zes Claude-skills: installatie, CRM-koppeling, scope-check,
  meldplicht-coach, rapport-adviseur en MSP go-to-market.
