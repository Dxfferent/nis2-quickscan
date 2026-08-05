#!/usr/bin/env node
/* SPDX-License-Identifier: AGPL-3.0-only
   Copyright (C) 2026 Dxfferent B.V.
   Onderdeel van NIS2 Quickscan. Gelicenseerd onder de GNU AGPL v3.0 (zie LICENSE).
   Aanvullende voorwaarden onder AGPL-3.0 §7 van toepassing: zie ATTRIBUTION.md. */
/* ============================================================
   Smoke test — intake-config.json schema + engine parity.
   Run: node tests/engine-smoke.mjs

   Dit script porteert de reken-engine (evalTrigger/buildContext/
   buildReport) naar plain Node-JS omdat assets/nis2-data.jsx JSX
   bevat en zonder buildtoolchain niet direct in Node te importeren
   is (de app is bewust build-vrij in de bron). De poort volgt de
   scoringsrelevante logica van assets/nis2-data.jsx op de voet
   (incl. tierOverride, scope-koppeling en de governance-escalatie
   in recommendedDomains; de rto/rpo-presentatie blijft buiten
   beschouwing). Wijzigt de engine dáár, dan moet deze poort mee —
   en andersom.
   ============================================================ */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '..', 'assets', 'intake-config.json');
const cfg = JSON.parse(readFileSync(configPath, 'utf8'));

let failures = 0;
function assert(cond, msg) {
  if (cond) { console.log(`OK:   ${msg}`); }
  else { console.error(`FAIL: ${msg}`); failures++; }
}

// ---------- schema essentials ----------
assert(cfg.domains.length === 9, `9 domains (got ${cfg.domains.length})`);

const allMeasures = cfg.domains.flatMap((d) => d.measures);
assert(allMeasures.length === 78, `78 measures total (got ${allMeasures.length})`);

// "heeft cbw_ref" = het veld is aanwezig (kan null zijn — niet elke SC-maatregel
// heeft een Cbw-pendant); sc_code en service moeten wel een waarde hebben.
const badMeasures = allMeasures.filter(
  (m) => !('sc_code' in m) || !('cbw_ref' in m) || !('service' in m) || (!m.sc_code && !m.cbw_ref) || !m.service || !m.title
);
assert(badMeasures.length === 0, `elke measure heeft service+title en minstens één normref (sc_code of cbw_ref) (${badMeasures.length} incompleet)`);

// ---------- normref-tags ----------
const REF_GROUP_WHITELIST = new Set(['cbw', 'sc', 'iso27001', 'cis8', 'iec62443', 'nist']);

assert(
  Array.isArray(cfg.ref_groups) && cfg.ref_groups.length >= 5,
  `ref_groups bevat >= 5 groepen (got ${cfg.ref_groups?.length})`
);
const refGroupKeys = (cfg.ref_groups || []).map((g) => g.key);
const badRefGroups = refGroupKeys.filter((k) => !REF_GROUP_WHITELIST.has(k));
assert(badRefGroups.length === 0, `alle ref_groups.key zitten in de whitelist (onbekend: ${badRefGroups.join(', ') || '-'})`);
assert(
  (cfg.ref_groups || []).every((g) => typeof g.label === 'string' && g.label.length > 0),
  'elke ref_group heeft een niet-lege label'
);

const measuresWithoutRefs = allMeasures.filter((m) => !Array.isArray(m.refs) || m.refs.length === 0);
assert(measuresWithoutRefs.length === 0, `elke measure heeft >= 1 ref in refs[] (${measuresWithoutRefs.length} zonder refs)`);

const badRefs = allMeasures.flatMap((m) => m.refs || []).filter(
  (r) => !REF_GROUP_WHITELIST.has(r.group) || typeof r.code !== 'string' || !r.code
);
assert(badRefs.length === 0, `elke ref heeft group in de whitelist + niet-lege letterlijke code (${badRefs.length} ongeldig)`);

// elke measure met een cbw_domain heeft een 'cbw'-ref met dezelfde letterlijke
// code als een van de domein-article_codes (letterlijk de artikelcode);
// domeinen zonder article-niveau-codes (bv. domein 3/13) vallen terug op
// control_codes (bv. "3.1") — zie cfg.domains[].control_codes.
const domainByCode = Object.fromEntries(cfg.cbw_domains.map((d) => [d.code, d]));
const cbwRefMismatches = allMeasures.filter((m) => {
  if (!m.cbw_domain) { return false; }
  const cbwRefs = (m.refs || []).filter((r) => r.group === 'cbw');
  if (!cbwRefs.length) { return false; }
  const dom = domainByCode[m.cbw_domain];
  const validCodes = [...(dom?.article_codes || []), ...(dom?.control_codes || [])];
  return !cbwRefs.every((r) => validCodes.includes(r.code));
});
assert(cbwRefMismatches.length === 0, `cbw-refs bevatten letterlijke domein-article_codes of control_codes-fallback (${cbwRefMismatches.length} mismatch)`);

// ---------- SC-strip-guard (alleen titels + codes) ----------
// Doelteksten (goal), de niveau-toepasselijkheidsmapping en de
// niveau-omschrijvingen zijn SC-schema-materiaal en mogen deze publieke
// config NIET in; alleen sc_code-verwijzingen en maatregel-titels blijven.
// Uitzondering (schriftelijke toestemming Stichting Kwaliteitsinnovatie,
// zie ATTRIBUTION.md): het gereduceerde vanaf-niveau `sc_from` per maatregel.
// Checkt oude (qm_*) én nieuwe (sc_*) veldnamen: een regen uit een oudere
// pipeline mag niet stil onder de oude naam lekken.
// Applicability-waarden idem (leak-guard).
const stripLeaks = allMeasures.filter((m) => 'goal' in m || 'qm_levels' in m || 'sc_levels' in m);
assert(stripLeaks.length === 0, `measures bevatten geen goal/qm_levels/sc_levels-velden (${stripLeaks.length} gevonden)`);
assert(!('qm_certification_levels' in cfg) && !('sc_certification_levels' in cfg), 'config bevat geen qm_/sc_certification_levels');

// sc_from: elk sc_code-dragend measure draagt het vanaf-niveau; Cbw-only
// maatregelen dragen het veld juist niet (er is geen SC-niveau om te claimen).
const SC_FROM_ENUM = new Set(['10', '20', '30']);
const badScFrom = allMeasures.filter((m) => (m.sc_code ? !SC_FROM_ENUM.has(m.sc_from) : 'sc_from' in m));
assert(badScFrom.length === 0, `sc_from ∈ 10|20|30 op elk sc_code-dragend measure, afwezig op Cbw-only (${badScFrom.length} fout)`);

// quoted JSON-waarden, geen kale substrings: 'voluntary_note' (meldplicht,
// publieke info) mag wel bestaan.
const rawConfig = readFileSync(configPath, 'utf8');
const applicabilityLeaks = ['"mandatory"', '"voluntary"', '"not_applicable"'].filter((t) => rawConfig.includes(t));
assert(applicabilityLeaks.length === 0, `publieke config lekt geen applicability-waarden (gevonden: ${applicabilityLeaks.join(', ') || '-'})`);

assert(allMeasures.some((m) => (m.refs || []).some((r) => r.group === 'cbw')),
  'minstens één measure draagt een cbw-ref (Cbw-filter niet leeg)');

// work-classificatie: elke maatregel draagt een werk-type uit de vaste enum —
// de rapport-telling (techniek vs papier) valt stil op een ontbrekend veld,
// en een config-regen zonder dit veld hoort hier te stranden.
const WORK_ENUM = new Set(['techniek', 'beleid', 'mensen', 'toetsing']);
const badWork = allMeasures.filter((m) => !WORK_ENUM.has(m.work));
assert(badWork.length === 0, `elke measure draagt work ∈ techniek|beleid|mensen|toetsing (${badWork.length} zonder/ongeldig)`);

// De themes zijn de MSP-werkpakketten waar de teksten een aantal van noemen
// (README, landing.html, llms.txt, skills/nis2-rapport-adviseur). Dat getal is
// eerder stil uit de pas gelopen (24 in de ene tekst, 25 in de andere); wie hier
// een thema toevoegt, moet die teksten meenemen.
const themeCount = cfg.domains.reduce((n, d) => n + (d.themes || []).length, 0);
assert(themeCount === 25, `25 MSP-werkpakketten (themes) — werk de teksten bij als dit wijzigt (got ${themeCount})`);

assert(Object.keys(cfg.tiers.definitions).length === 4, `4 tier-definities (got ${Object.keys(cfg.tiers.definitions).length})`);
assert(cfg.tiers.order.length === 4, `4 tiers in tiers.order (got ${cfg.tiers.order.length})`);

assert(
  typeof cfg.scope_check?.disclaimer === 'string' && cfg.scope_check.disclaimer.length > 0,
  'scope_check.disclaimer aanwezig en niet-leeg'
);

// Elke configwaarde die in een href belandt moet een web-URL zijn. `startsWith`
// alleen is te zwak: "http:evil" of een javascript:-URL met vreemde casing
// glipt erdoor, en de app rendert die href in de origin waar de gate en de
// localStorage leven. Toets daarom het geparste protocol, op álle URL-velden.
const urlFields = [
  ['scope_check.rdi_self_assessment_url', cfg.scope_check?.rdi_self_assessment_url],
  ['scope_check.registration_portal_url', cfg.scope_check?.registration_portal_url],
  ['reporting_obligation.portal_url', cfg.reporting_obligation?.portal_url],
  ['attribution.cbw.license_url', cfg.attribution?.cbw?.license_url],
];
const badUrls = urlFields.filter(([, v]) => {
  if (typeof v !== 'string') { return true; }
  try { return !['http:', 'https:'].includes(new URL(v).protocol); } catch { return true; }
});
assert(badUrls.length === 0, `elke config-URL is http(s) (fout: ${badUrls.map(([k]) => k).join(', ') || '-'})`);

// ---------- scope_check ----------
assert(
  Array.isArray(cfg.scope_check?.outcomes) && cfg.scope_check.outcomes.length >= 3,
  `scope_check.outcomes bevat >= 3 uitkomsten (got ${cfg.scope_check?.outcomes?.length})`
);
assert(
  typeof cfg.scope_check?.rdi_self_assessment_url === 'string' && cfg.scope_check.rdi_self_assessment_url.startsWith('http'),
  'scope_check.rdi_self_assessment_url aanwezig en is een URL'
);
assert(
  typeof cfg.scope_check?.registration_portal_url === 'string' && cfg.scope_check.registration_portal_url.startsWith('http'),
  'scope_check.registration_portal_url aanwezig en is een URL'
);
assert(
  typeof cfg.scope_check?.registration_note === 'string' && cfg.scope_check.registration_note.length > 0,
  'scope_check.registration_note aanwezig en niet-leeg'
);
assert(
  Array.isArray(cfg.scope_check?.sectors) && cfg.scope_check.sectors.length > 0,
  `scope_check.sectors niet-leeg (got ${cfg.scope_check?.sectors?.length})`
);
assert(
  Array.isArray(cfg.scope_check?.always_in_scope) && cfg.scope_check.always_in_scope.length > 0,
  `scope_check.always_in_scope niet-leeg (got ${cfg.scope_check?.always_in_scope?.length})`
);
// De scope-stap mapt hier blind overheen; een criterium waarvoor de app geen
// drempelwaarden kent (SIZE_CAP_BUCKETS in assets/nis2-data.jsx) rendert stil
// een lege keuzerij i.p.v. een zichtbare fout.
const SIZE_CAP_IDS = new Set(['employees', 'annual_turnover', 'balance_sheet_total']);
assert(
  Array.isArray(cfg.scope_check?.size_cap_criteria) && cfg.scope_check.size_cap_criteria.length > 0,
  `scope_check.size_cap_criteria niet-leeg (got ${cfg.scope_check?.size_cap_criteria?.length})`
);
const unknownSizeCriteria = (cfg.scope_check?.size_cap_criteria || []).filter((c) => !SIZE_CAP_IDS.has(c.id));
assert(
  unknownSizeCriteria.length === 0,
  `elk size_cap_criterium heeft drempelwaarden in de app (onbekend: ${unknownSizeCriteria.map((c) => c.id).join(', ') || '-'})`
);

// ---------- reporting_obligation ----------
assert(
  Array.isArray(cfg.reporting_obligation?.phases) && cfg.reporting_obligation.phases.length === 4,
  `reporting_obligation.phases bevat 4 fasen incl. tussentijds verslag (got ${cfg.reporting_obligation?.phases?.length})`
);
assert(
  Array.isArray(cfg.reporting_obligation?.exceptions) && cfg.reporting_obligation.exceptions.length >= 1,
  `reporting_obligation.exceptions bevat >= 1 kortere-termijn-uitzondering (got ${cfg.reporting_obligation?.exceptions?.length})`
);
// DORA is lex specialis (geen kortere termijn binnen de Cbw) en hoort dus in
// lex_specialis_note, niet in de exceptions-rij.
assert(
  typeof cfg.reporting_obligation?.lex_specialis_note === 'string' && cfg.reporting_obligation.lex_specialis_note.includes('DORA'),
  'reporting_obligation.lex_specialis_note aanwezig en noemt DORA'
);
assert(
  typeof cfg.reporting_obligation?.portal_url === 'string' && cfg.reporting_obligation.portal_url.startsWith('http'),
  'reporting_obligation.portal_url aanwezig en is een URL'
);
assert(
  typeof cfg.reporting_obligation?.significance_note === 'string' && cfg.reporting_obligation.significance_note.length > 0,
  'reporting_obligation.significance_note aanwezig en niet-leeg'
);

// ---------- package_suggestion ----------
const pkgTiers = cfg.package_suggestion?.tiers;
assert(Array.isArray(pkgTiers) && pkgTiers.length === 3, `package_suggestion.tiers bevat 3 SC-niveaus (got ${pkgTiers?.length})`);
const badTiers = (pkgTiers || []).filter((t) => !t.id || !t.label || !t.sc_ambition || !t.when);
assert(badTiers.length === 0, `elke tier heeft id/label/when en een SC-niveaunaam (${badTiers.length} incompleet)`);

// menukaart-matrix: elke dienstregel hoort bij een bestaand niveau, en elk
// niveau draagt minstens één regel — anders rendert er een lege kolom.
const pkgLines = cfg.package_suggestion?.lines;
assert(Array.isArray(pkgLines) && pkgLines.length >= 10, `package_suggestion.lines bevat >= 10 dienstregels (got ${pkgLines?.length})`);
const badLines = (pkgLines || []).filter(
  (l) => !l.label || !Number.isInteger(l.from) || l.from < 0 || l.from >= (pkgTiers?.length || 0)
    || !Array.isArray(l.cbw) || !Array.isArray(l.sc)
);
assert(badLines.length === 0, `elke dienstregel heeft label, 'from' binnen het tier-bereik en cbw+sc-arrays (${badLines.length} ongeldig)`);

// Geen enkele dienstregel staat zonder normverwijzing: de menukaart is de
// vertaling van de norm, niet een los commercieel blok.
const linesZonderNorm = (pkgLines || []).filter((l) => !(l.cbw || []).length && !(l.sc || []).length);
assert(linesZonderNorm.length === 0, `elke dienstregel draagt minstens één Cbw- of SC-verwijzing (${linesZonderNorm.length} zonder)`);

// SC-codes op de menukaart bestaan als sc_code in de normdata — dezelfde
// koppeling-eis als voor de Cbw-codes hieronder.
const knownScCodes = new Set(allMeasures.flatMap((m) => (m.refs || []).filter((r) => r.group === 'sc').map((r) => r.code)));
const unknownScCodes = (pkgLines || []).flatMap((l) => l.sc || []).filter((code) => !knownScCodes.has(code));
assert(unknownScCodes.length === 0, `elke SC-code op de menukaart bestaat in de normdata (onbekend: ${[...new Set(unknownScCodes)].join(', ') || '-'})`);

// De wetsartikelen op de menukaart zijn dezelfde letterlijke codes als in de
// normdata — geen los onderhouden tweede waarheid die stil uit de pas loopt.
const knownCbwCodes = new Set(cfg.cbw_domains.flatMap((d) => [...(d.article_codes || []), ...(d.control_codes || [])]));
const unknownPkgCodes = (pkgLines || []).flatMap((l) => l.cbw || []).filter((code) => !knownCbwCodes.has(code));
assert(unknownPkgCodes.length === 0, `elke Cbw-code op de menukaart bestaat in cbw_domains (onbekend: ${[...new Set(unknownPkgCodes)].join(', ') || '-'})`);
assert(
  typeof cfg.package_suggestion?.legal_note === 'string' && /Cyberbeveiligingswet/.test(cfg.package_suggestion.legal_note),
  'package_suggestion.legal_note verankert de menukaart in de Cyberbeveiligingswet'
);
const tiersWithoutOwnLine = (pkgTiers || []).map((t, i) => i).filter((i) => !(pkgLines || []).some((l) => l.from === i));
assert(tiersWithoutOwnLine.length === 0, `elk niveau voegt minstens één dienst toe (leeg: ${tiersWithoutOwnLine.join(', ') || '-'})`);

// De from-index is norm-gedreven, geen commerciële keuze: een sc-dragende
// dienstregel start op het laagste vanaf-niveau (sc_from) van haar codes.
// Cbw-only regels (geen sc[]) houden hun handmatige from.
const SC_FROM_IDX = { '10': 0, '20': 1, '30': 2 };
const scFromByCode = Object.fromEntries(allMeasures.filter((m) => m.sc_code).map((m) => [m.sc_code, m.sc_from]));
const fromMismatch = (pkgLines || []).filter((l) => {
  const scs = l.sc || [];
  if (!scs.length) { return false; }
  return l.from !== Math.min(...scs.map((c) => SC_FROM_IDX[scFromByCode[c]]));
});
assert(fromMismatch.length === 0, `menukaart-from volgt min(sc_from) van de regel-codes (${fromMismatch.length} mismatch: ${fromMismatch.map((l) => l.label).join(', ') || '-'})`);

// Secties: elke regel hangt aan een bestaande sectie en elke sectie draagt regels.
// Een `requires` verwijst naar een datatype-id, anders verdwijnt de sectie stil.
const pkgSections = cfg.package_suggestion?.sections;
assert(Array.isArray(pkgSections) && pkgSections.length > 0, `package_suggestion.sections niet-leeg (got ${pkgSections?.length})`);
const sectionIds = new Set((pkgSections || []).map((s) => s.id));
const orphanLines = (pkgLines || []).filter((l) => !sectionIds.has(l.section));
assert(orphanLines.length === 0, `elke dienstregel hangt aan een bestaande sectie (${orphanLines.length} zonder)`);
const emptySections = (pkgSections || []).filter((s) => !(pkgLines || []).some((l) => l.section === s.id));
assert(emptySections.length === 0, `elke sectie draagt minstens één dienstregel (leeg: ${emptySections.map((s) => s.id).join(', ') || '-'})`);
const DATATYPE_IDS = new Set(['pii', 'finance', 'email', 'apps', 'backups', 'identity', 'web', 'ot']);
const badRequires = (pkgSections || []).filter((s) => s.requires && !DATATYPE_IDS.has(s.requires));
assert(badRequires.length === 0, `elke sectie-'requires' is een bestaand datatype-id (onbekend: ${badRequires.map((s) => s.requires).join(', ') || '-'})`);
assert(
  typeof cfg.package_suggestion?.note === 'string' && cfg.package_suggestion.note.length > 0,
  'package_suggestion.note aanwezig en niet-leeg (indicatief-disclaimer)'
);
// De niveaunamen zijn publieke ambitie-indicatie; de volledige
// toepasselijkheidsmatrix blijft auditmateriaal en wordt hierboven door de
// strip-guard geweerd (het gereduceerde sc_from-vanaf-niveau is de enige,
// schriftelijk toegestane uitzondering).
const badAmbitions = (pkgTiers || []).filter((t) => !/SC-\d0/.test(t.sc_ambition));
assert(badAmbitions.length === 0, `elke sc_ambition is een publieke SC-niveaunaam (${badAmbitions.length} afwijkend)`);

// poort van suggestPackage() in assets/nis2-data.jsx
function suggestPackage(pkgCfg, scopeOutcome, maxCrit, chainAccess) {
  const tiers = pkgCfg?.tiers || [];
  if (!tiers.length) { return null; }
  const top = tiers.length - 1;
  const crit = maxCrit ?? 0;
  const idx = (scopeOutcome === 'essentieel' || crit >= 3) ? top
    : (scopeOutcome === 'belangrijk' || chainAccess || crit >= 2) ? Math.min(1, top)
      : 0;
  return tiers[idx] || null;
}

const PKG = cfg.package_suggestion;
assert(suggestPackage(PKG, 'essentieel', 0)?.id === pkgTiers[2].id, `suggestPackage: essentieel -> ${pkgTiers[2].id}`);
assert(suggestPackage(PKG, 'onbekend', 3)?.id === pkgTiers[2].id, `suggestPackage: maxCrit 3 (kritiek) -> ${pkgTiers[2].id}`);
assert(suggestPackage(PKG, 'belangrijk', 0)?.id === pkgTiers[1].id, `suggestPackage: belangrijk -> ${pkgTiers[1].id}`);
assert(suggestPackage(PKG, 'onbekend', 2)?.id === pkgTiers[1].id, `suggestPackage: maxCrit 2 (hoog) -> ${pkgTiers[1].id}`);
assert(suggestPackage(PKG, 'onbekend', 1)?.id === pkgTiers[0].id, `suggestPackage: maxCrit 1 (middel) -> ${pkgTiers[0].id}`);
assert(suggestPackage(PKG, 'onbekend', 0)?.id === pkgTiers[0].id, `suggestPackage: geen scope + maxCrit 0 -> ${pkgTiers[0].id}`);
assert(suggestPackage(PKG, 'waarschijnlijk_buiten_scope', 0)?.id === pkgTiers[0].id, `suggestPackage: buiten scope -> ${pkgTiers[0].id} (nooit 'geen niveau')`);
assert(suggestPackage({ tiers: [] }, 'essentieel', 3) === null, 'suggestPackage: lege tier-lijst -> null (kaart verdwijnt)');
// white-label MSP_BRAND.packages met minder dan drie niveaus: de trap klimt naar het
// zwaarste beschikbare i.p.v. undefined (gedocumenteerd in MSP-ENABLEMENT.md).
assert(suggestPackage({ tiers: [{ id: 'a' }, { id: 'b' }] }, 'essentieel', 3)?.id === 'b',
  'suggestPackage: eigen menukaart van 2 niveaus -> zwaarste beschikbare');
assert(suggestPackage({ tiers: [{ id: 'a' }] }, 'belangrijk', 2)?.id === 'a',
  'suggestPackage: menukaart van 1 niveau -> dat niveau (geen index-overloop)');
assert(suggestPackage(PKG, 'keten', 0, true)?.id === pkgTiers[1].id,
  `suggestPackage: keten mét systeemtoegang -> ${pkgTiers[1].id} (SC-20-positionering)`);
assert(suggestPackage(PKG, 'keten', 0, false)?.id === pkgTiers[0].id,
  `suggestPackage: keten zonder toegang + lage impact -> ${pkgTiers[0].id}`);

// ---------- ketenpositie + EU 2024/2690 (scope_check) ----------
assert(cfg.scope_check.outcomes.some((o) => o.id === 'keten'), "scope_check.outcomes bevat 'keten' (indirect geraakt)");
const chainQ = cfg.scope_check.chain_question;
assert(chainQ && chainQ.title && Array.isArray(chainQ.options) && chainQ.options.length === 3,
  `chain_question aanwezig met 3 opties (got ${chainQ?.options?.length})`);
assert(JSON.stringify((chainQ?.options || []).map((o) => o.v)) === JSON.stringify(['none', 'supplier', 'access']),
  'chain_question.options dragen de vaste waarden none/supplier/access (engine matcht hierop)');
const sectorIds = new Set(cfg.scope_check.sectors.map((s) => s.id));
const badEu2690 = (cfg.scope_check.eu2690?.sectors || []).filter((id) => !sectorIds.has(id));
assert(cfg.scope_check.eu2690 && (cfg.scope_check.eu2690.sectors || []).length > 0 && badEu2690.length === 0,
  `eu2690.sectors niet-leeg en elk id bestaat als sector (onbekend: ${badEu2690.join(', ') || '-'})`);
assert(/2024\/2690/.test(cfg.scope_check.eu2690?.note || ''), 'eu2690.note noemt de uitvoeringsverordening');

// ---------- reken-engine (poort van assets/nis2-data.jsx) ----------
const TIER_ORDER = cfg.tiers.order;
const RTO_BY_AVAIL = cfg.tiers.rto_by_avail;
const RPO_BY_FREQ = cfg.tiers.rpo_by_freq;
const PRIORITY_META = cfg.priority_meta;
const DOMAINS = cfg.domains;
// volwassenheid per maatregel: score = niveau * 25, default niveau 2 (= 50%)
const MATURITY_DEFAULT = 2;
function maturityPct(v) { return (v ?? MATURITY_DEFAULT) * 25; }
function measureKey(domId, m) { return `${domId}:${m.sc_code || m.title}`; }

function tierFromScore(s) { return TIER_ORDER[s] || 'basis'; }

function profileFor(answers) {
  const a = answers || {};
  const av = a.avail ?? 1, cf = a.conf ?? 1, fq = a.freq ?? 2;
  const crit = Math.max(av, cf);
  return { tier: tierFromScore(crit), rto: RTO_BY_AVAIL[av], rpo: RPO_BY_FREQ[fq], avail: av, conf: cf, freq: fq };
}

function buildContext(state) {
  const sel = state.selected || [];
  let maxCrit = 0, maxConf = 0;
  const has = {};
  sel.forEach((id) => {
    // tierOverride vervangt de afgeleide tier (de rto/rpo-projectie is
    // presentatie en telt niet mee in de score, dus die blijft hier weg)
    const base = profileFor(state.answers?.[id]);
    const p = state.tierOverride?.[id] ? { ...base, tier: state.tierOverride[id] } : base;
    maxCrit = Math.max(maxCrit, TIER_ORDER.indexOf(p.tier));
    maxConf = Math.max(maxConf, p.conf ?? 0);
    has[id] = true;
  });
  return { has, maxCrit, maxConf, selected: sel, scopeOutcome: determineScopeOutcome(state.scope) };
}

function metricValue(ctx, metric) {
  if (metric === 'max_crit') { return ctx.maxCrit; }
  if (metric === 'max_conf') { return ctx.maxConf; }
  return ctx[metric];
}

function evalCond(cond, ctx) {
  if (cond.any) { return cond.any.some((c) => evalCond(c, ctx)); }
  if (cond.all) { return cond.all.every((c) => evalCond(c, ctx)); }
  if (cond.metric === 'has') { return !!ctx.has[cond.flag]; }
  const val = metricValue(ctx, cond.metric);
  switch (cond.op) {
    case 'gte': return val >= cond.value;
    case 'gt': return val > cond.value;
    case 'lte': return val <= cond.value;
    case 'lt': return val < cond.value;
    case 'eq': return val === cond.value;
    default: return false;
  }
}

function evalTrigger(trigger, ctx) {
  if (!trigger) { return null; }
  for (const rule of trigger.rules || []) {
    if (evalCond(rule.if, ctx)) { return rule.result; }
  }
  return trigger.default ?? null;
}

function recommendedDomains(ctx) {
  return DOMAINS
    .map((d) => ({ d, prio: evalTrigger(d.trigger, ctx) }))
    .filter((x) => x.prio)
    .map((x) => {
      let prio = x.prio;
      if (x.d.id === 'governance') {
        if (ctx.scopeOutcome === 'essentieel') { prio = 'hoog'; }
        else if (ctx.scopeOutcome === 'belangrijk' && PRIORITY_META[prio].weight < PRIORITY_META.aanbevolen.weight) { prio = 'aanbevolen'; }
      }
      return { ...x.d, priority: prio, meta: PRIORITY_META[prio] };
    })
    .sort((a, b) => b.meta.weight - a.meta.weight);
}

function buildReport(state) {
  const ctx = buildContext(state);
  const domains = recommendedDomains(ctx);
  const readiness = state.readiness || {};
  const rows = domains.map((dom) => {
    const scores = dom.measures.map((m) => maturityPct(readiness[measureKey(dom.id, m)]));
    const cur = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return { ...dom, current: cur, target: dom.meta.target };
  });
  let wsum = 0, w = 0;
  rows.forEach((r) => { wsum += r.current * r.meta.weight; w += r.meta.weight; });
  const overall = w ? Math.round(wsum / w) : 0;
  return { rows, overall };
}

// ---------- parity-fixture ----------
// Referentiewaarde bepaald op 2026-07-15 door de PRE-config engine (de oude
// hardcoded assets/nis2-data.jsx vóór F2, zie git-historie) handmatig na te
// rekenen voor input: selected = ['pii', 'backups'], answers = { avail: 2,
// conf: 2, freq: 1 } (voor beide datatypes gelijk), readiness = 'deels' voor
// elk domein.
//
// Trace (oude hardcoded trigger-functies):
//   profileFor({avail:2,conf:2,freq:1}) -> crit = max(2,2) = 2 -> tier 'hoog'
//   (TIER_ORDER = ['basis','middel','hoog','kritiek'], index 2) voor zowel
//   pii als backups.
//   buildContext -> maxCrit = 2 (index van 'hoog'), maxConf = 2,
//   has = { pii: true, backups: true }.
//   Trigger-uitkomst per domein:
//     continuity  : maxCrit>=2                              -> hoog
//     incident    : maxCrit>=2                              -> hoog
//     access      : has.identity || maxConf>=2 (2>=2)        -> hoog
//     technical   : maxCrit>=2 || has.web || has.apps        -> hoog
//     assets      : maxConf>=2                                -> aanbevolen
//     supply      : has.apps || has.web || has.email (geen)  -> baseline
//     governance  : altijd                                    -> baseline
//     people      : altijd                                    -> baseline
//     ot          : has.ot (geen)                              -> null (uitgesloten)
//   Volwassenheid niet ingevuld -> elke maatregel MATURITY_DEFAULT (2) =
//   50%, dus elk domein-gemiddelde = 50 en het gewogen totaal reduceert tot
//   exact 50, ongeacht de weight-mix — zelfde referentiewaarde als de oude
//   per-domein 'deels'-default.
const REFERENCE_OVERALL = 50;
const REFERENCE_DOMAIN_IDS = ['access', 'assets', 'continuity', 'governance', 'incident', 'people', 'supply', 'technical'].sort();
const REFERENCE_PRIORITIES = {
  continuity: 'hoog', incident: 'hoog', access: 'hoog', technical: 'hoog',
  assets: 'aanbevolen', supply: 'baseline', governance: 'baseline', people: 'baseline',
};

const fixtureState = {
  selected: ['pii', 'backups'],
  answers: {
    pii: { avail: 2, conf: 2, freq: 1 },
    backups: { avail: 2, conf: 2, freq: 1 },
  },
  readiness: {}, // leeg = elke maatregel op default-niveau 2 (50%)
};

const report = buildReport(fixtureState);

assert(report.overall === REFERENCE_OVERALL, `parity: overall score === ${REFERENCE_OVERALL} (got ${report.overall})`);

const includedIds = report.rows.map((r) => r.id).sort();
assert(
  JSON.stringify(includedIds) === JSON.stringify(REFERENCE_DOMAIN_IDS),
  `parity: 8 domeinen aanbevolen, 'ot' uitgesloten (got: ${includedIds.join(', ')})`
);

const priorityById = Object.fromEntries(report.rows.map((r) => [r.id, r.priority]));
assert(
  JSON.stringify(Object.fromEntries(Object.entries(priorityById).sort())) === JSON.stringify(Object.fromEntries(Object.entries(REFERENCE_PRIORITIES).sort())),
  'parity: per-domein prioriteit gelijk aan de pre-config trigger-semantiek'
);

// De takken die de fixture hierboven bewust niet raakt: governance-escalatie
// op het scope-verdict (nis2-data.jsx recommendedDomains) en tierOverride
// (nis2-data.jsx buildContext).
const escGov = buildReport({ ...fixtureState, scope: { sectorId: 'energie', sizeAnswers: { employees: 'large', annual_turnover: 'large', balance_sheet_total: 'large' } } }).rows.find((r) => r.id === 'governance');
assert(escGov?.priority === 'hoog', `parity: governance escaleert naar 'hoog' bij scope essentieel (got ${escGov?.priority})`);
const belGov = buildReport({ ...fixtureState, scope: { sectorId: 'energie', sizeAnswers: { employees: 'medium', annual_turnover: 'medium', balance_sheet_total: 'medium' } } }).rows.find((r) => r.id === 'governance');
assert(belGov?.priority === 'aanbevolen', `parity: governance escaleert naar 'aanbevolen' bij scope belangrijk (got ${belGov?.priority})`);
const ovrCtx = buildContext({ selected: ['pii'], answers: { pii: { avail: 0, conf: 0, freq: 2 } }, tierOverride: { pii: 'kritiek' } });
assert(ovrCtx.maxCrit === TIER_ORDER.indexOf('kritiek'), `parity: tierOverride tilt maxCrit naar 'kritiek' (got ${ovrCtx.maxCrit})`);

// ---------- naturalCompare (poort van assets/nis2-data.jsx) ----------
function naturalCompare(a, b) {
  const re = /\d+|\D+/g;
  const ax = String(a || '').match(re) || [];
  const bx = String(b || '').match(re) || [];
  const len = Math.max(ax.length, bx.length);
  for (let i = 0; i < len; i++) {
    const av = ax[i] ?? '';
    const bv = bx[i] ?? '';
    const aNum = /^\d+$/.test(av);
    const bNum = /^\d+$/.test(bv);
    if (aNum && bNum) {
      const diff = parseInt(av, 10) - parseInt(bv, 10);
      if (diff !== 0) { return diff; }
    } else if (av !== bv) {
      return av < bv ? -1 : 1;
    }
  }
  return 0;
}

assert(naturalCompare('4.5', '4.11') < 0, "naturalCompare: '4.5' < '4.11' (dot-component, niet decimaal)");
assert(naturalCompare('4.11', '4.5') > 0, "naturalCompare: '4.11' > '4.5'");
assert(naturalCompare('A.5.19', 'A.8.13') < 0, "naturalCompare: 'A.5.19' < 'A.8.13'");
assert(naturalCompare('CP-2', 'CP-9') < 0, "naturalCompare: 'CP-2' < 'CP-9'");
assert(naturalCompare('21.3.c', '21.3.d') < 0, "naturalCompare: '21.3.c' < '21.3.d'");
assert(naturalCompare('4.5', '4.5') === 0, "naturalCompare: '4.5' === '4.5' -> 0");
const sortedCodes = ['4.11', '4.5', '4.2'].sort(naturalCompare);
assert(
  JSON.stringify(sortedCodes) === JSON.stringify(['4.2', '4.5', '4.11']),
  `naturalCompare als Array.sort-comparator: [4.11,4.5,4.2] -> [4.2,4.5,4.11] (got ${JSON.stringify(sortedCodes)})`
);

// ---------- scope-beslisboom (poort van assets/nis2-data.jsx:360-420) ----------
// Vastgelegd na de wettekst-verificatie van 05-08-2026: NIS2 art. 3 /
// Cbw art. 8.f + 12.1.a-b + art. 2(7-8)-uitzonderingen. Wijzigt de beslisboom
// in nis2-data.jsx, dan MOET deze poort mee — en andersom.
function scopeSizeClass(sizeAnswers) {
  const SIZE_ORDER = ['small', 'medium', 'large'];
  const a = sizeAnswers || {};
  const idxOf = (v) => (v ? SIZE_ORDER.indexOf(v) : -1);
  const fte = idxOf(a.employees);
  const fin = Math.min(idxOf(a.annual_turnover), idxOf(a.balance_sheet_total));
  const idx = Math.max(fte, fin);
  return idx >= 0 ? SIZE_ORDER[idx] : null;
}
function directScopeOutcome(scope) {
  const sectorId = scope?.sectorId || null;
  const checked = scope?.alwaysInScope || [];
  const sizeClass = scopeSizeClass(scope?.sizeAnswers || {});
  const ENTITY_EXCEPTIONS = ['rechterlijk', 'dnb', 'inlichtingen'];
  if ((scope?.exceptions || []).some((id) => ENTITY_EXCEPTIONS.includes(id))) { return 'waarschijnlijk_buiten_scope'; }
  const items = (cfg.scope_check.always_in_scope || []).filter((i) => checked.includes(i.id));
  const vanRechtswege = items.filter((i) => i.outcome && i.outcome !== 'informatief');
  if (vanRechtswege.some((i) => i.outcome === 'essentieel')) { return 'essentieel'; }
  if (vanRechtswege.some((i) => i.outcome === 'size_based')) {
    return sizeClass === 'medium' || sizeClass === 'large' ? 'essentieel' : 'belangrijk';
  }
  if (vanRechtswege.some((i) => i.outcome === 'size_based_large')) {
    return sizeClass === 'large' ? 'essentieel' : 'belangrijk';
  }
  if (vanRechtswege.length > 0) { return 'belangrijk'; }
  const touched = !!(sectorId || checked.length > 0 || sizeClass);
  if (!touched) { return 'onbekend'; }
  if (!sectorId) { return 'onbekend'; }
  const annex = (cfg.scope_check.sectors || []).find((s) => s.id === sectorId)?.annex || null;
  if (sizeClass === 'large') { return annex === '2' ? 'belangrijk' : 'essentieel'; }
  if (sizeClass === 'medium') { return 'belangrijk'; }
  if (sizeClass === 'small') { return 'waarschijnlijk_buiten_scope'; }
  return 'onbekend';
}
function determineScopeOutcome(scope) {
  const base = directScopeOutcome(scope);
  const chain = scope?.chain;
  if ((base === 'waarschijnlijk_buiten_scope' || base === 'onbekend')
    && (chain === 'supplier' || chain === 'access')) { return 'keten'; }
  return base;
}
const SZ = { small: { employees: 'small', annual_turnover: 'small', balance_sheet_total: 'small' },
  medium: { employees: 'medium', annual_turnover: 'medium', balance_sheet_total: 'medium' },
  large: { employees: 'large', annual_turnover: 'large', balance_sheet_total: 'large' } };
const SCOPE_CASES = [
  ['bijlage 1 + groot -> essentieel (Cbw 8.f)', { sectorId: 'energie', sizeAnswers: SZ.large }, 'essentieel'],
  ['bijlage 1 + middelgroot -> belangrijk (Cbw 12.1.a)', { sectorId: 'energie', sizeAnswers: SZ.medium }, 'belangrijk'],
  ['bijlage 2 + groot -> belangrijk, nooit essentieel op omvang', { sectorId: 'voedsel', sizeAnswers: SZ.large }, 'belangrijk'],
  ['bijlage 2 + middelgroot -> belangrijk (Cbw 12.1.b)', { sectorId: 'voedsel', sizeAnswers: SZ.medium }, 'belangrijk'],
  ['bijlage 1 + klein -> waarschijnlijk buiten scope', { sectorId: 'energie', sizeAnswers: SZ.small }, 'waarschijnlijk_buiten_scope'],
  ['klein + keten met toegang -> keten', { sectorId: 'energie', sizeAnswers: SZ.small, chain: 'access' }, 'keten'],
  ['essentieel + keten -> keten vervangt classificatie niet', { sectorId: 'energie', sizeAnswers: SZ.large, chain: 'access' }, 'essentieel'],
  ['2003/361: omzet groot maar balans klein telt niet omhoog', { sectorId: 'energie', sizeAnswers: { employees: 'small', annual_turnover: 'large', balance_sheet_total: 'small' } }, 'waarschijnlijk_buiten_scope'],
  ['2003/361: omzet EN balans groot -> groot, ook met weinig FTE', { sectorId: 'energie', sizeAnswers: { employees: 'small', annual_turnover: 'large', balance_sheet_total: 'large' } }, 'essentieel'],
  ['gekwalificeerde vertrouwensdienst + micro -> essentieel (van rechtswege)', { alwaysInScope: ['vertrouwensdiensten_gekwalificeerd'], sizeAnswers: SZ.small }, 'essentieel'],
  ['niet-gekwalificeerde vertrouwensdienst -> belangrijk', { alwaysInScope: ['vertrouwensdiensten_overig'] }, 'belangrijk'],
  ['e-communicatie + middelgroot -> essentieel (size_based)', { alwaysInScope: ['e_communicatienetwerken'], sizeAnswers: SZ.medium }, 'essentieel'],
  ['e-communicatie + klein -> belangrijk (size_based)', { alwaysInScope: ['e_communicatienetwerken'], sizeAnswers: SZ.small }, 'belangrijk'],
  ['entiteitsbrede uitzondering wint van overheid (art. 6(35) NIS2)', { alwaysInScope: ['overheidsorganisaties'], exceptions: ['rechterlijk'] }, 'waarschijnlijk_buiten_scope'],
  ['activiteit-gebonden uitzondering laat de classificatie staan (art. 2(7-8))', { sectorId: 'energie', sizeAnswers: SZ.large, exceptions: ['defensie'] }, 'essentieel'],
  ['niet-gekwalificeerde vertrouwensdienst + groot -> essentieel (art. 3.1.a)', { alwaysInScope: ['vertrouwensdiensten_overig'], sizeAnswers: SZ.large }, 'essentieel'],
  ['alleen domeinnaamregistratie (informatief) -> onbekend, geen classificatie', { alwaysInScope: ['domeinnaamregistratie'] }, 'onbekend'],
  ['sector gekozen, omvang leeg -> onbekend', { sectorId: 'energie' }, 'onbekend'],
];
for (const [label, scope, expected] of SCOPE_CASES) {
  const got = determineScopeOutcome(scope);
  assert(got === expected, `scope: ${label} (got ${got})`);
}

// ---------- exit ----------
if (failures > 0) {
  console.error(`\n${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log('\nAlle assertions geslaagd.');
process.exit(0);
