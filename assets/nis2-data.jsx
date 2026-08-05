// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Dxfferent B.V.
// Onderdeel van NIS2 Quickscan. Gelicenseerd onder de GNU AGPL v3.0 (zie LICENSE).
// Aanvullende voorwaarden onder AGPL-3.0 §7 van toepassing: zie ATTRIBUTION.md,
// sectie 'Licentie & aanvullende voorwaarden'.
/* global window, fetch */
/* ============================================================
   NIS2 Quickscan — reken-engine + intake-mechaniek
   Normdata (DOMAINS/measures/TIERS/PRIORITY_META) komt NIET meer
   hardcoded uit dit bestand, maar wordt geladen uit
   assets/intake-config.json (gegenereerd door
   `compliance:intake-config` uit de normcatalogus).
   DATATYPES en IMPACT_QUESTIONS zijn intake-mechaniek (geen
   normdata) en blijven hier statisch.
   window.NIS2.ready is een promise die resolvet zodra de config
   geladen en verwerkt is; wizard-app.jsx wacht daarop vóór render.
   ============================================================ */

// ---------- minimale inline icon-set (stroke, 24x24) ----------
const ICONS = {
  users: 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M22 19v-1a4 4 0 0 0-3-3.8M16 4.2a3.5 3.5 0 0 1 0 6.6',
  euro: 'M17 6.5A6 6 0 1 0 17 17.5M4 10h9M4 14h9',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  server: 'M3 4h18v6H3zM3 14h18v6H3zM7 7h.01M7 17h.01',
  database: 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6',
  key: 'M14.5 4a5.5 5.5 0 1 0-3.9 9.4L3 21l2 2M12.5 11.5 15 14M9 12.5 11 14.5',
  factory: 'M3 21V9l6 4V9l6 4V5l6 16zM3 21h18M8 21v-4M13 21v-4M18 21v-4',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18',
  shield: 'M12 3l8 3v6c0 5-3.4 7.7-8 9-4.6-1.3-8-4-8-9V6z',
  layers: 'M12 3 3 8l9 5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  recover: 'M3 12a9 9 0 1 0 3-6.7M3 4v4h4',
  siren: 'M7 18a5 5 0 0 1 10 0zM5 21h14M12 4V2M5.5 6 4 4.5M18.5 6 20 4.5M12 8a4 4 0 0 0-4 4',
  network: 'M9 4h6v4H9zM3 16h6v4H3zM15 16h6v4h-6zM12 8v4M6 16v-2h12v2',
  truck: 'M3 6h11v9H3zM14 9h4l3 3v3h-7zM7 18a1.5 1.5 0 1 0 0 .01M18 18a1.5 1.5 0 1 0 0 .01',
  graduation: 'M12 4 2 9l10 5 10-5zM6 11v5c0 1 2.7 2 6 2s6-1 6-2v-5',
  cpu: 'M7 7h10v10H7zM10 10h4v4h-4zM9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3',
  check: 'M20 6 9 17l-5-5',
  sun: 'M12 4V2M12 22v-2M4 12H2M22 12h-2M6 6 4.5 4.5M19.5 19.5 18 18M18 6l1.5-1.5M4.5 19.5 6 18M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  dot: 'M12 12h.01',
  // sector-iconen (stap 1 scope-check, W1 webinar-fixes) — puur presentatie, geen normdata
  bolt: 'M13 2 3 14h9l-1 8 10-12h-9z',
  heart: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  droplet: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
  send: 'M22 2 11 13M22 2 15 22l-4-9-9-4z',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6',
  flask: 'M9 2h6M9 2v6.5L3.5 20a1 1 0 0 0 1 2h15a1 1 0 0 0 1-2L15 8.5V2M6.5 15h11',
  coffee: 'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3',
};

// ---------- sector-iconen (stap 1, scope-check) — intake-mechaniek, geen normdata ----------
// Mapt sector-id (uit scope_check.sectors in intake-config.json) op een ICONS-key.
// Thematisch hergebruik waar zinvol (beide watersectoren op droplet, financiële
// sectoren op euro) i.p.v. 18 losse iconen — herkenbaarheid > uniciteit per sector.
const SECTOR_ICONS = {
  energie: 'bolt',
  vervoer: 'truck',
  bankwezen: 'euro',
  financiele_infra: 'euro',
  zorg: 'heart',
  drinkwater: 'droplet',
  afvalwater: 'droplet',
  digitale_infra: 'network',
  ict_beheer_b2b: 'server',
  overheid: 'shield',
  ruimtevaart: 'send',
  post: 'mail',
  afvalbeheer: 'trash',
  chemie: 'flask',
  voedsel: 'coffee',
  fabricage: 'factory',
  digitale_aanbieders: 'globe',
  onderzoek: 'graduation',
};

// ---------- datatypes (stap 1) — intake-mechaniek, geen normdata ----------
const DATATYPES = [
  { id: 'pii',      label: 'Klant- & persoonsgegevens', hint: 'PII, AVG, klantdossiers', icon: 'users' },
  { id: 'finance',  label: 'Financiële administratie',   hint: 'Boekhouding, facturatie, betalingen', icon: 'euro' },
  { id: 'email',    label: 'E-mail & communicatie',      hint: 'Mailboxen, chat, documenten', icon: 'mail' },
  { id: 'apps',     label: 'Bedrijfskritische apps / ERP', hint: 'ERP, CRM, branche-software', icon: 'server' },
  { id: 'backups',  label: 'Back-ups & archieven',       hint: 'Reservekopieën, langetermijnopslag', icon: 'database' },
  { id: 'identity', label: 'Identiteit & toegang',       hint: 'AD / Entra ID, accounts, MFA', icon: 'key' },
  { id: 'web',      label: 'Website / e-commerce',       hint: 'Webshop, portalen, publieke diensten', icon: 'globe' },
  { id: 'ot',       label: 'Productie- / OT-systemen',   hint: 'Machines, SCADA, ICS, IoT', icon: 'factory' },
];

// ---------- impactvragen (stap 2, per datatype) — intake-mechaniek ----------
const Q_AVAIL = {
  key: 'avail', label: 'Beschikbaarheid', icon: 'recover',
  q: 'Wat gebeurt er als deze data of dit systeem een dag onbeschikbaar is?',
  help: 'Bepaalt mee hoe snél u moet kunnen herstellen (RTO).',
  options: [
    { v: 0, t: 'Nauwelijks merkbaar', d: 'We werken door, hooguit wat ongemak.' },
    { v: 1, t: 'Merkbare hinder',     d: 'Processen vertragen, klanten merken het.' },
    { v: 2, t: 'Bedrijf staat grotendeels stil', d: 'Kernactiviteiten stoppen, directe schade.' },
    { v: 3, t: 'Acuut bedreigend',    d: 'Veiligheid of voortbestaan in gevaar.' },
  ],
};
const Q_CONF = {
  key: 'conf', label: 'Vertrouwelijkheid', icon: 'lock',
  q: 'Hoe gevoelig is deze data als ze zou uitlekken?',
  help: 'Bepaalt mee de eisen aan classificatie, encryptie en toegang.',
  options: [
    { v: 0, t: 'Openbaar',      d: 'Geen schade bij uitlekken.' },
    { v: 1, t: 'Intern',        d: 'Vervelend, maar beperkte schade.' },
    { v: 2, t: 'Vertrouwelijk', d: 'AVG- of contractueel beschermd, meldplicht.' },
    { v: 3, t: 'Geheim',        d: 'Bestaansbedreigend bij een lek.' },
  ],
};
const Q_FREQ = {
  key: 'freq', label: 'Veranderfrequentie', icon: 'database',
  q: 'Hoe vaak verandert deze data?',
  help: 'Bepaalt hoeveel dataverlies acceptabel is (RPO).',
  options: [
    { v: 0, t: 'Continu',    d: 'De hele dag door, realtime.' },
    { v: 1, t: 'Elk uur',    d: 'Meerdere keren per dag.' },
    { v: 2, t: 'Dagelijks',  d: 'Ongeveer één keer per dag.' },
    { v: 3, t: 'Zelden',     d: 'Wekelijks of minder.' },
  ],
};
const IMPACT_QUESTIONS = [Q_AVAIL, Q_CONF, Q_FREQ];

// ---------- size-cap-drempels (stap 0, scope-check) — intake-mechaniek, geen normdata ----------
// De config (scope_check.size_cap_criteria) levert alleen welke criteria gevraagd
// worden (medewerkers/omzet/balanstotaal), geen drempelwaarden — die zijn geen
// catalogus-normdata maar de wettelijke MKB-omvangscategorieën
// (EU-aanbeveling 2003/361/EG, waarnaar de Cbw-toelichting size-cap-toets
// verwijst).
const SIZE_CAP_BUCKETS = {
  employees: [
    { v: 'small', t: '< 50' },
    { v: 'medium', t: '50 – 249' },
    { v: 'large', t: '≥ 250' },
  ],
  annual_turnover: [
    { v: 'small', t: '≤ € 10 mln' },
    { v: 'medium', t: '€ 10 – 50 mln' },
    { v: 'large', t: '> € 50 mln' },
  ],
  balance_sheet_total: [
    { v: 'small', t: '≤ € 10 mln' },
    { v: 'medium', t: '€ 10 – 43 mln' },
    { v: 'large', t: '> € 43 mln' },
  ],
};
const SIZE_ORDER = ['small', 'medium', 'large'];

// ---------- normdata-containers — gevuld door applyConfig() na fetch ----------
const TIERS = {};
const TIER_ORDER = [];
const RTO_BY_AVAIL = [];
const RPO_BY_FREQ = [];
const DOMAINS = [];
const PRIORITY_META = {};
const SCOPE_CHECK = {};
const REPORTING_OBLIGATION = {};
const PACKAGE_SUGGESTION = {};
const REF_GROUPS = [];

// Volwassenheidsniveaus per maatregel: wij-zinnen in
// klant-taal, 5 niveaus, score = v * 25%. Default (niet ingevuld) = 2 —
// zelfde 50%-baseline als de oude 'deels', maar nu zichtbaar als aanname.
const MATURITY_DEFAULT = 2;
const MATURITY_OPTS = [
  { v: 0, t: 'Niets geregeld', d: 'Hier doen we nog niets mee.' },
  { v: 1, t: 'We zijn er bewust mee bezig', d: 'Het staat op de agenda, maar er is nog niets geregeld.' },
  { v: 2, t: 'We doen het, maar informeel', d: 'In de praktijk werken we meestal zo — het staat nergens op papier en hangt van personen af.' },
  { v: 3, t: 'Vastgelegd én zo werken we', d: 'Er is beleid of een procedure, en zo werken we ook echt.' },
  { v: 4, t: 'Aantoonbaar op orde', d: 'We kunnen het laten zien: vastgelegd, geborgd en bewijsbaar voor een klant of auditor.' },
];
function maturityPct(v) { return (v ?? MATURITY_DEFAULT) * 25; }

// Stabiele sleutel per maatregel-in-domein (sc_code is niet uniek over
// domeinen heen: SC 2.2 draagt in governance en people een eigen titel).
function measureKey(domId, m) { return `${domId}:${m.sc_code || m.title}`; }

function tierFromScore(s) { return TIER_ORDER[s] || 'basis'; }

// per-datatype profiel uit antwoorden
function profileFor(answers) {
  const a = answers || {};
  const av = a.avail ?? 1, cf = a.conf ?? 1, fq = a.freq ?? 2;
  const crit = Math.max(av, cf);
  return {
    tier: tierFromScore(crit),
    rto: RTO_BY_AVAIL[av],
    rpo: RPO_BY_FREQ[fq],
    avail: av, conf: cf, freq: fq,
  };
}

function tierToRtoRpo(tierId) {
  const t = TIERS[tierId] || TIERS.basis;
  return { rto: t.rto, rpo: t.rpo };
}

// ---------- rapport berekenen ----------
function buildContext(state) {
  const sel = state.selected || [];
  const profiles = {};
  let maxCrit = 0, maxConf = 0;
  sel.forEach((id) => {
    const p = state.tierOverride?.[id]
      ? { ...profileFor(state.answers?.[id]), tier: state.tierOverride[id], ...tierToRtoRpo(state.tierOverride[id]) }
      : profileFor(state.answers?.[id]);
    profiles[id] = p;
    maxCrit = Math.max(maxCrit, TIER_ORDER.indexOf(p.tier));
    maxConf = Math.max(maxConf, p.conf ?? 0);
  });
  const has = {};
  sel.forEach((id) => (has[id] = true));
  return { has, maxCrit, maxConf, profiles, selected: sel, scopeOutcome: determineScopeOutcome(state.scope) };
}

// ---------- trigger-evaluatie ----------
// De config codeert triggers als een kleine regel-DSL i.p.v. de oude inline
// functies: { rules: [{ if: <conditie>, result: <prio> }, ...], default: <prio|null> }.
// <conditie> = { metric: 'has', flag: <datatype-id> }
//            | { metric: 'max_crit'|'max_conf', op: 'gte'|'gt'|'lte'|'lt'|'eq', value: n }
//            | { any: [<conditie>, ...] } | { all: [<conditie>, ...] }
// Deze evaluator is functioneel gelijk aan de oude hardcoded trigger-functies
// per domein (geverifieerd in tests/engine-smoke.mjs, parity-assert).
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
      // Cbw art. 24 (bestuursgoedkeuring/-training) + proactief ex-ante-toezicht
      // op essentiële entiteiten (art. 69 e.v.) — governance schaalt
      // mee met het scope-verdict i.p.v. altijd baseline.
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
  // readiness = per-maatregel volwassenheid {measureKey: 0..4}; domein-score
  // = gemiddelde van zijn maatregelen (niet ingevuld telt als MATURITY_DEFAULT).
  const readiness = state.readiness || {};
  const rows = domains.map((dom) => {
    const scores = dom.measures.map((m) => maturityPct(readiness[measureKey(dom.id, m)]));
    const cur = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const target = dom.meta.target;
    const gap = Math.max(0, target - cur);
    return { ...dom, current: cur, target, gap };
  });
  // overall score (gewogen)
  let wsum = 0, w = 0;
  rows.forEach((r) => { wsum += r.current * r.meta.weight; w += r.meta.weight; });
  const overall = w ? Math.round(wsum / w) : 0;
  // roadmap: sorteer op (prioriteitsgewicht * gap)
  const roadmap = rows
    .filter((r) => r.gap > 0)
    .sort((a, b) => (b.meta.weight * b.gap) - (a.meta.weight * a.gap));
  return { ctx, rows, overall, roadmap, domains };
}

// ---------- normref-tags ----------
// De config levert per measure gestructureerde refs [{group, code}] met
// letterlijke artikelcodes (Cbw 21.3.c, SC 4.5, ISO A.8.13, ...) i.p.v. proza.
// ref_groups (top-level) is de geordende tag-group-lijst (label + sorteervolgorde).

// naturalCompare: versie-achtige vergelijking van normcodes (4.5 < 4.11,
// A.5.19 < A.8.13, CP-2 < CP-9). Tokenized op cijferreeksen vs. niet-cijfers;
// cijfertokens numeriek vergeleken (geen parseFloat — dat zou "4.11" < "4.5"
// maken door decimale interpretatie, terwijl dit dot-separated componenten zijn).
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

function refGroupIndex(key) {
  const idx = REF_GROUPS.findIndex((g) => g.key === key);
  return idx === -1 ? REF_GROUPS.length : idx;
}

function refGroupLabel(key) {
  return REF_GROUPS.find((g) => g.key === key)?.label || key;
}

// sorteert refs op ref_groups-volgorde, daarbinnen op naturalCompare(code)
function sortRefs(refs) {
  return [...(refs || [])].sort((a, b) => {
    const gi = refGroupIndex(a.group) - refGroupIndex(b.group);
    return gi !== 0 ? gi : naturalCompare(a.code, b.code);
  });
}

// normLabel: compacte "Cbw <code> · SC <code>"-label voor roadmap-chips en
// print (Cbw-artikel · SC-code, naast elkaar), gevoed uit refs.
function normLabel(m) {
  const refs = m.refs || [];
  const cbw = refs.find((r) => r.group === 'cbw');
  const sc = refs.find((r) => r.group === 'sc');
  const parts = [];
  if (cbw) { parts.push(`Cbw ${cbw.code}`); }
  if (sc) { parts.push(`SC ${sc.code}`); }
  if (parts.length) { return parts.join(' · '); }
  const first = sortRefs(refs)[0];
  return first ? `${refGroupLabel(first.group)} ${first.code}` : (m.title || '');
}

// ---------- scope-check uitkomst (stap 0) ----------
// Minimale, expliciet-indicatieve heuristiek (zie SIZE_CAP_BUCKETS hierboven en
// scope_check.disclaimer in de config) — geen vervanging voor de RDI-zelfevaluatie.
function scopeSizeClass(sizeAnswers) {
  // EU-aanbeveling 2003/361/EG: categorie = FTE-drempel ÓF (omzet ÉN balanstotaal)
  // boven de grens — omzet alleen (zonder balans) telt niet omhoog.
  const a = sizeAnswers || {};
  const idxOf = (v) => (v ? SIZE_ORDER.indexOf(v) : -1);
  const fte = idxOf(a.employees);
  const fin = Math.min(idxOf(a.annual_turnover), idxOf(a.balance_sheet_total));
  const idx = Math.max(fte, fin);
  return idx >= 0 ? SIZE_ORDER[idx] : null;
}

// Ketenpositie (Cbw art. 21.2.d): een leverancier van een Cbw-organisatie valt
// niet zelf onder de wet, maar krijgt de eisen contractueel doorgelegd. Zonder
// deze uitkomst belandt precies de SC-doelgroep op 'buiten scope'. De directe
// classificatie wint altijd — keten vervangt alleen buiten-scope/onbekend.
function determineScopeOutcome(scope) {
  const base = directScopeOutcome(scope);
  const chain = scope?.chain;
  if ((base === 'waarschijnlijk_buiten_scope' || base === 'onbekend')
    && (chain === 'supplier' || chain === 'access')) { return 'keten'; }
  return base;
}

function directScopeOutcome(scope) {
  const sectorId = scope?.sectorId || null;
  const checked = scope?.alwaysInScope || [];
  const sizeClass = scopeSizeClass(scope?.sizeAnswers || {});

  // NIS2 kent twee uitsluitingsfiguren. Entiteitsbreed: rechterlijke macht,
  // parlement en centrale bank vallen buiten de definitie van
  // overheidsinstantie (art. 6 lid 35), inlichtingendiensten idem via art. 2
  // lid 7 — die organisaties vallen als geheel buiten de wet. Activiteit-
  // gebonden (art. 2 lid 7-8): defensie/nationale veiligheid en
  // opsporing/vervolging sluiten alleen díe activiteiten uit; de classificatie
  // van de organisatie zelf blijft staan (de UI toont daarvoor een noot).
  const ENTITY_EXCEPTIONS = ['rechterlijk', 'dnb', 'inlichtingen'];
  if ((scope?.exceptions || []).some((id) => ENTITY_EXCEPTIONS.includes(id))) { return 'waarschijnlijk_buiten_scope'; }

  // Van-rechtswege-categorieën (Cbw art. 8/12): outcome per categorie uit de config.
  // 'essentieel' (o.a. overheid, TLD, DNS, gekwalificeerde vertrouwensdiensten),
  // 'size_based_large' (niet-gekwalificeerde vertrouwensdiensten: groot essentieel, anders belangrijk),
  // 'size_based' (e-communicatie: middelgroot+ essentieel, klein/micro belangrijk),
  // 'informatief' (domeinnaamregistratie: registratie-/informatieplicht, telt niet
  // mee als volwaardige entiteitsclassificatie).
  const items = (SCOPE_CHECK.always_in_scope || []).filter((i) => checked.includes(i.id));
  const vanRechtswege = items.filter((i) => i.outcome && i.outcome !== 'informatief');
  if (vanRechtswege.some((i) => i.outcome === 'essentieel')) { return 'essentieel'; }
  if (vanRechtswege.some((i) => i.outcome === 'size_based')) {
    return sizeClass === 'medium' || sizeClass === 'large' ? 'essentieel' : 'belangrijk';
  }
  // size_based_large: bijlage-1-categorieën die pas boven het middelgroot-
  // plafond essentieel worden maar ongeacht omvang minstens belangrijk zijn
  // (niet-gekwalificeerde vertrouwensdiensten, NIS2 art. 3 lid 1-2).
  if (vanRechtswege.some((i) => i.outcome === 'size_based_large')) {
    return sizeClass === 'large' ? 'essentieel' : 'belangrijk';
  }
  if (vanRechtswege.length > 0) { return 'belangrijk'; }

  const touched = !!(sectorId || checked.length > 0 || sizeClass);
  if (!touched) { return 'onbekend'; }
  // Omvang zonder sector zegt niets over scope: size-cap verkleint alleen een
  // bestaande sector-scope, dus geen "waarschijnlijk buiten scope" op omvang alleen.
  if (!sectorId) { return 'onbekend'; }
  const annex = (SCOPE_CHECK.sectors || []).find((s) => s.id === sectorId)?.annex || null;
  // Cbw art. 8 lid 1 sub f (bijlage 1 boven het middelgroot-plafond = essentieel) en
  // art. 12 lid 1 sub a-b (overige bijlage 1/2 vanaf middelgroot = belangrijk; sub c-e dekken kleine telecom- en vertrouwensdienstverleners, die hier via de van-rechtswege-categorieen lopen);
  // NIS2-richtlijn art. 3 is de EU-pendant.
  if (sizeClass === 'large') { return annex === '2' ? 'belangrijk' : 'essentieel'; }
  if (sizeClass === 'medium') { return 'belangrijk'; }
  if (sizeClass === 'small') { return 'waarschijnlijk_buiten_scope'; }
  return 'onbekend'; // sector gekozen maar omvang (nog) niet ingevuld
}

// ---------- ambitieniveau-suggestie (rapport) ----------
// Deterministische trap over de SC-niveaus: hoogste raak wint. Stuurt op het
// scope-verdict (essentieel/belangrijk) en op maxCrit (index in TIER_ORDER,
// 0 basis … 3 kritiek) — dus op wat de klant zelf over impact en hersteltempo
// zei, niet op maatregel-toepasselijkheid. Die laatste is SC-auditmateriaal en
// zit bewust niet in deze publieke config (zie de strip-guard in
// tests/engine-smoke.mjs); alleen de publieke niveaunamen zijn hier ambitie-
// indicatie.
// Het laagste niveau is SC-10: er is geen 'geen keurmerk'-uitkomst, want een
// niveau waar je niet naartoe stuurt is geen bestemming.
// chainAccess: leverancier mét toegang tot klantsystemen — dat is de
// SC-20-positionering (rechtstreekse dienstverlening aan NIS2-organisaties
// plus toegang tot gevoelige systemen), ook als de eigen scope 'keten' is.
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

// ---------- config laden ----------
const CONFIG_URL = 'assets/intake-config.json';

// Bronvermelding (rapport-footer): ADR/NOREA-licentie op het Cbw-framework
// vereist attributie bij distributie; SC-attributie is afspraak met
// Stichting Kwaliteitsinnovatie.
const ATTRIBUTION = {};

function applyConfig(cfg) {
  Object.assign(ATTRIBUTION, cfg.attribution || {});
  Object.assign(TIERS, cfg.tiers.definitions);
  TIER_ORDER.push(...cfg.tiers.order);
  RTO_BY_AVAIL.push(...cfg.tiers.rto_by_avail);
  RPO_BY_FREQ.push(...cfg.tiers.rpo_by_freq);
  Object.assign(PRIORITY_META, cfg.priority_meta);
  DOMAINS.push(...cfg.domains);
  Object.assign(SCOPE_CHECK, cfg.scope_check);
  Object.assign(REPORTING_OBLIGATION, cfg.reporting_obligation);
  Object.assign(PACKAGE_SUGGESTION, cfg.package_suggestion || {});
  REF_GROUPS.push(...(cfg.ref_groups || []));
}

// normfilter (stap 5): 'all' | 'cbw'. Cbw = maatregel draagt een
// Cbw-artikelref. Filteren op SC-niveau kan niet: de
// niveau-toepasselijkheidsmapping is auditmateriaal en zit bewust niet in
// deze publieke config (zie de SC-strip-guard in tests/engine-smoke.mjs).
function measureInNormFilter(m, f) {
  if (f === 'cbw') { return (m.refs || []).some((r) => r.group === 'cbw'); }
  return true;
}

// AI-NOTE: no-store — de config is bedoeld om op de server als los bestand
// vervangen te worden bij een normupdate, zonder rebuild. Een heuristische
// browser-cache serveerde anders stille stale normdata.
// Single-file builds (artifact/review) leveren de config inline via
// window.__NIS2_CONFIG — daar is geen fetch mogelijk (CSP) of gewenst.
const ready = (window.__NIS2_CONFIG
  ? Promise.resolve(window.__NIS2_CONFIG)
  : fetch(CONFIG_URL, { cache: 'no-store' }).then((res) => {
    if (!res.ok) { throw new Error(`intake-config.json HTTP ${res.status}`); }
    return res.json();
  }))
  .then((cfg) => {
    applyConfig(cfg);
    return window.NIS2;
  });

window.NIS2 = {
  ICONS, DATATYPES, IMPACT_QUESTIONS, MATURITY_OPTS, MATURITY_DEFAULT, maturityPct, measureKey,
  TIERS, TIER_ORDER, PRIORITY_META, DOMAINS,
  SCOPE_CHECK, REPORTING_OBLIGATION, PACKAGE_SUGGESTION, SIZE_CAP_BUCKETS, SECTOR_ICONS,
  REF_GROUPS, ATTRIBUTION,
  profileFor, tierToRtoRpo, buildReport, buildContext, normLabel, suggestPackage,
  naturalCompare, sortRefs, refGroupLabel, refGroupIndex, measureInNormFilter,
  determineScopeOutcome,
  ready,
};
