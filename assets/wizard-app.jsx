// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Dxfferent B.V.
// Onderdeel van NIS2 Quickscan. Gelicenseerd onder de GNU AGPL v3.0 (zie LICENSE).
// Aanvullende voorwaarden onder AGPL-3.0 §7 van toepassing: zie ATTRIBUTION.md,
// sectie 'Licentie & aanvullende voorwaarden'.
/* global React, ReactDOM, NIS2 */
const { useState, useEffect, useMemo, useCallback } = React;

// Config-load: NIS2.ready resolvet zodra assets/intake-config.json
// geladen is en de normdata (DOMAINS/TIERS/PRIORITY_META) in window.NIS2 staat.
// De hele app-body wacht daarop; bij een laadfout tonen we een expliciete
// foutmelding in #root — geen fallback op oude hardcoded normdata.
NIS2.ready.then(() => {
const { ICONS, DATATYPES, IMPACT_QUESTIONS, TIERS, TIER_ORDER, MATURITY_OPTS, MATURITY_DEFAULT, measureKey,
  SCOPE_CHECK, REPORTING_OBLIGATION, PACKAGE_SUGGESTION, SIZE_CAP_BUCKETS, SECTOR_ICONS, REF_GROUPS, ATTRIBUTION,
  profileFor, tierToRtoRpo, buildReport, normLabel, determineScopeOutcome, suggestPackage,
  sortRefs, refGroupLabel, naturalCompare, measureInNormFilter } = NIS2;

// ---------- scope-verdict copy (W1 webinar-fixes) — presentatie, geen normdata ----------
// buiten_scope bewust géén groen vinkje: de visuele geruststelling zou het
// gerechtvaardigd vertrouwen wekken dat de disclaimer juist moet breken.
const SCOPE_VERDICT_ICON = { essentieel: 'siren', belangrijk: 'shield', waarschijnlijk_buiten_scope: 'shield', keten: 'truck' };
const SCOPE_VERDICT_MEANING = {
  essentieel: 'Essentiële entiteiten dragen hetzelfde zorgplicht-pakket als belangrijke entiteiten, maar vallen onder proactief toezicht en de hoogste boetecategorie. Alleen bij essentiële entiteiten kan de toezichthouder een certificering schorsen of een tijdelijk bestuursverbod laten opleggen.',
  belangrijk: 'Belangrijke entiteiten vallen naar verwachting onder de NIS2-zorgplicht en meldplicht, met toezicht achteraf (in plaats van proactief) en een lagere boetecategorie dan essentiële entiteiten.',
  waarschijnlijk_buiten_scope: 'Op basis van deze antwoorden valt uw organisatie waarschijnlijk niet onder de Cbw. Let op: ook kleinere organisaties kunnen alsnog aangewezen worden, bijvoorbeeld als enige aanbieder van een essentiële dienst, bij risico voor de openbare veiligheid of volksgezondheid, bij systeemrisico of als kritieke entiteit (CER/Wwke). Controleer de uitzonderingen in de officiële RDI-zelfevaluatie. Vrijwillige basishygiëne blijft hoe dan ook aan te raden.',
  keten: 'Uw organisatie valt waarschijnlijk niet rechtstreeks onder de Cbw, maar u levert aan organisaties die er wél onder vallen. Die klanten zijn verplicht hun toeleveringsketen te borgen (art. 21) en leggen de eisen contractueel bij u neer: verwacht vragen om bewijs van uw maatregelen en mogelijk audits of een keurmerk-eis.',
  onbekend: "Beantwoord de vragen hierboven voor een indicatie van uw Cbw-classificatie. Overslaan kan ook; de uitkomst blijft dan 'onbekend'.",
};

// ---------- werk-typen (rapport) — presentatie, geen normdata ----------
// Vier soorten werk met elk een natuurlijke eigenaar. De telling is het
// verkoopargument: het merendeel van de maatregelen is geen techniek maar
// papier — zichtbaar maken, niet samenvatten (geen verkleinde top-5).
const WORK_META = {
  techniek: { label: 'Techniek', owner: 'levert uw IT-partner' },
  beleid: { label: 'Beleid & procedures', owner: 'met uw IT- en compliance-partner' },
  mensen: { label: 'Mens & organisatie', owner: 'training en HR samen' },
  toetsing: { label: 'Toetsing & bewijs', owner: 'onafhankelijke partij' },
};
const WORK_ORDER = ['techniek', 'beleid', 'mensen', 'toetsing'];

// ---------- volledige scoping: uitzonderingen, hoofdvestiging, aanwijzing ----------
// Publieke wettekst-feiten (Cbw; NIS2-richtlijn art. 2 lid 7-10 en art. 26) —
// presentatielaag naast de gegenereerde scope_check-config, bewust zonder
// KvK-integratie: een duidelijk keuzemenu volstaat.
const SCOPE_EXTRA = {
  exceptions: [
    { id: 'defensie', label: 'Defensie of nationale veiligheid', note: 'Alleen die activiteiten vallen buiten de wet; de classificatie van uw organisatie blijft staan' },
    { id: 'inlichtingen', label: 'Inlichtingen- en veiligheidsdiensten' },
    { id: 'politie_om', label: 'Politie of Openbaar Ministerie', note: 'Voor zover het opsporing en vervolging betreft; overige taken blijven onder de wet vallen' },
    { id: 'rechterlijk', label: 'Rechterlijke macht of Staten-Generaal', note: 'Vallen buiten de NIS2-definitie van overheidsinstantie' },
    { id: 'dnb', label: 'De Nederlandsche Bank', note: 'Als centrale bank uitgezonderd van de NIS2-definitie van overheidsinstantie' },
  ],
  hq: [
    { v: 'nl', t: 'Nederland', d: 'De Cyberbeveiligingswet en de Nederlandse toezichthouder zijn van toepassing.' },
    { v: 'eu', t: 'Ander EU-land', d: "Voor de meeste sectoren geldt de wet van het land van vestiging: een Nederlandse vestiging valt dan gewoon onder de Cbw. Alleen voor digitale aanbieders (cloud, MSP's, DNS e.d.) is het land van de hoofdvestiging bevoegd." },
    { v: 'non_eu', t: 'Buiten de EU', d: 'Digitale aanbieders zonder EU-vestiging moeten een EU-vertegenwoordiger aanwijzen; dat land wordt bevoegd. Voor overige sectoren geldt de wet van het land van vestiging.' },
  ],
  designation: [
    { id: 'enige_aanbieder', label: 'Enige aanbieder van een essentiële dienst in Nederland' },
    { id: 'openbare_veiligheid', label: 'Verstoring raakt openbare veiligheid of volksgezondheid' },
    { id: 'systeemrisico', label: 'Verstoring kan systeemrisico of grensoverschrijdende gevolgen geven' },
  ],
};

// Klikbare niet-button-elementen (rail-stap, domeinkop, meldplicht-fase): de
// CSS hangt aan de div-structuur, dus geen <button>; wel toetsenbord-pariteit —
// Tab bereikt ze, Enter/Space doen hetzelfde als een klik.
function keyActivatable(onActivate) {
  return {
    role: 'button',
    tabIndex: 0,
    onClick: onActivate,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(); }
    },
  };
}

// ---------- icon ----------
function Icon({ name, className, style }) {
  const d = ICONS[name] || ICONS.dot;
  return (
    <svg className={"svg " + (className || "")} style={style} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

// ---------- normref-tags ----------
// Kleine tag-chip per {group, code}, gesorteerd op ref_groups-volgorde en
// binnen een group op naturalCompare(code). Group-kleur via CSS-classes
// ref-<group> (wizard.css) — geen hardcoded hex, subtiele accent-tint per
// bron (Cbw/SC/ISO/CIS/NIST) op de bestaande semantische tokens.
function RefChips({ refs }) {
  const sorted = sortRefs(refs);
  if (!sorted.length) { return null; }
  return (
    <div className="ref-chips">
      {sorted.map((r, i) => (
        <span className={`ref-chip ref-${r.group}`} key={`${r.group}-${r.code}-${i}`}>
          <span className="rg">{refGroupLabel(r.group)}</span> {r.code}
        </span>
      ))}
    </div>
  );
}

// ---------- schaalrij ----------
// Eén component voor elke schaalvraag (impact, herstelprofiel, volwassenheid):
// links=minder → rechts=meer, radio-dot = gekozen (geen vinkje), neutraal
// positie-balkje. Presentatie-laag; de onderliggende waarden wijzigen niet.
function ScaleRow({ options, value, onSelect, ariaLabel }) {
  return (
    <div className="scale" role="radiogroup" aria-label={ariaLabel}>
      {options.map((o, i) => (
        <button key={o.v} type="button" role="radio" aria-checked={value === o.v} title={o.title}
          className={`opt ${value === o.v ? 'sel' : ''}`} onClick={() => onSelect(o.v)}>
          <div className="t">{o.t}</div>
          {o.d && <div className="d">{o.d}</div>}
          <div className="pos"><i style={{ width: `${Math.round(((i + 1) / options.length) * 100)}%` }} /></div>
        </button>
      ))}
    </div>
  );
}

// korte schaal-labels voor de compacte schaalrij (presentatie-laag; de
// volledige wij-zin blijft de tooltip en het label naast de rij)
const MATURITY_SHORT = ['Niets', 'Bezig', 'Informeel', 'Vastgelegd', 'Aantoonbaar'];

// compacte schaalrij: segmented control met korte titels, wij-zin als tooltip
function ScaleSm({ value, onSelect, ariaLabel, action }) {
  // action: knoppenrij die een bulk-actie uitvoert (geen keuzetoestand) —
  // dan geen radiogroup-semantiek, want er is nooit een geselecteerde radio.
  return (
    <span className="scale-sm" role={action ? 'group' : 'radiogroup'} aria-label={ariaLabel}>
      {MATURITY_OPTS.map((o) => (
        <button key={o.v} type="button" {...(action ? {} : { role: 'radio', 'aria-checked': value === o.v })} title={`${o.t} — ${o.d}`}
          className={value === o.v ? 'sel' : ''} onClick={() => onSelect(o.v)}>{MATURITY_SHORT[o.v]}</button>
      ))}
    </span>
  );
}

// zoekt op letterlijke code (in elke ref) en op titel, case-insensitive
function measureMatches(m, query) {
  if (!query) { return true; }
  const q = query.trim().toLowerCase();
  if (!q) { return true; }
  if ((m.title || '').toLowerCase().includes(q)) { return true; }
  return (m.refs || []).some((r) => r.code.toLowerCase().includes(q));
}

// groepeert measures (met hun domein) per ref_group, gesorteerd op
// naturalCompare(code) — een measure met refs in meerdere groups verschijnt
// in elke betreffende group-sectie (tag-group-logica), maar binnen
// één group maximaal één keer (laagste code = sorteeranker; SC-mappings
// geven soms 10+ codes per norm per measure).
function groupMeasuresByNorm(domains) {
  const byGroup = {};
  REF_GROUPS.forEach((g) => { byGroup[g.key] = []; });
  domains.forEach((dom) => {
    dom.measures.forEach((m) => {
      const seen = new Set();
      (m.refs || []).forEach((r) => {
        if (!byGroup[r.group]) { byGroup[r.group] = []; }
        if (seen.has(r.group)) { return; }
        seen.add(r.group);
        byGroup[r.group].push({ measure: m, domain: dom, code: r.code });
      });
    });
  });
  Object.values(byGroup).forEach((arr) => arr.sort((a, b) => naturalCompare(a.code, b.code)));
  return byGroup;
}

// ---------- accent helpers ----------
function hexToRgb(h) { const m = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16)); }
function darken(h, f) { const [r, g, b] = hexToRgb(h); return `rgb(${Math.round(r * f)},${Math.round(g * f)},${Math.round(b * f)})`; }
function rgba(h, a) { const [r, g, b] = hexToRgb(h); return `rgba(${r},${g},${b},${a})`; }

// ---------- step meta ----------
// Stap 0 blijft de intro (buiten STEPS); STEPS[0] = 'scope' is de nieuwe stap 1
// vóór de datatypes. Totaal is nu 6 genummerde stappen.
const STEPS = [
  { key: 'scope', label: 'Cbw-scope', icon: 'shield' },
  { key: 'data', label: 'Datatypes', icon: 'layers' },
  { key: 'impact', label: 'Impact', icon: 'lock' },
  { key: 'rtorpo', label: 'RTO / RPO', icon: 'recover' },
  { key: 'measures', label: 'Maatregelen', icon: 'shield' },
  { key: 'report', label: 'Rapport', icon: 'check' },
];

// MSP-enablement (white-label deploy): één config-blok in index.html
// brandt de hele tool om — naam, logo, kleuren, thema, eigen leadflow, mailbox.
//   window.MSP_BRAND = {
//     name, accent, logo,                    // logo = URL of data-URI (rail)
//     theme: 'dark' | 'light',               // start-thema
//     tokens: { '--bg-canvas': '#0b1220' },  // vrije CSS-token-overrides
//     mailto, hubspot: { portalId, formId },
//   }
// Zonder MSP_BRAND geldt de Dxfferent-default. Zie docs/MSP-ENABLEMENT.md.
const BRAND = window.MSP_BRAND || {};
// Contactadres van de partij die deze intake aanbiedt — géén Dxfferent-default:
// bij een white-label-deploy zouden de leads van de MSP anders bij ons in de bus
// vallen. Niet gezet = geen mailadres tonen (zie de gate-teksten hieronder).
const BRAND_MAILTO = typeof BRAND.mailto === 'string' && /^[^\s?&@]+@[^\s?&@]+\.[^\s?&@]+$/.test(BRAND.mailto) ? BRAND.mailto : null;

// AI-NOTE: bewust GEEN onderdeel van MSP_BRAND — de powered-by-vermelding,
// het Dxfferent-supportkanaal en de disclaimer zijn voorwaarden voor
// white-label-gebruik (zie ATTRIBUTION.md) en blijven in elke variant staan.
const DXF = { name: 'Dxfferent', url: 'https://dxfferent.com', mailto: 'hallo@dxfferent.nl' };
// AGPL-3.0 §13: wie een (aangepaste) versie via een netwerk aanbiedt, moet
// gebruikers de bijbehorende broncode aanbieden. Deze link is die aanbieding en
// staat daarom buiten MSP_BRAND. Een MSP die de code wijzigt, moet hem naar zijn
// eigen aangepaste bron laten wijzen — zie docs/MSP-ENABLEMENT.md.
const SOURCE_URL = 'https://github.com/Dxfferent/nis2-quickscan';

// De config en MSP_BRAND worden door de deployer geleverd en kunnen van een
// derde komen (config-swap bij een normupdate, of een fork). React blokkeert
// javascript:-URL's niet, dus een href uit die data is een uitvoeringspad in de
// origin waar ook de gate en de localStorage leven. Alleen web- en mailschema's.
function safeUrl(url) {
  if (typeof url !== 'string') { return null; }
  try {
    const u = new URL(url, window.location.href);
    return ['http:', 'https:', 'mailto:'].includes(u.protocol) ? url : null;
  } catch { return null; }
}
// Het MSP-logo mag óók een data-URI zijn — zo staat het in MSP-ENABLEMENT.md.
// Alleen image-types: data:text/html is een navigeerbaar document, en een
// scripthoudende SVG voert in een <img> niets uit.
function safeImageUrl(url) {
  if (typeof url === 'string' && /^data:image\/(png|jpeg|gif|webp|svg\+xml)[;,]/i.test(url)) { return url; }
  return safeUrl(url);
}
const DISCLAIMER = 'Dit is een gratis hulpmiddel. De uitkomsten zijn indicatief en geautomatiseerd gegenereerd op basis van de stand van wet- en regelgeving ten tijde van de in het rapport vermelde normdata-versie; latere wijzigingen (waaronder ministeriële regelingen) kunnen de uitkomst achterhalen. Aan de uitkomsten kunnen geen rechten worden ontleend en er wordt geen garantie gegeven op juistheid, volledigheid of actualiteit. Voor zover wettelijk toegestaan aanvaarden Dxfferent en de aanbiedende partner geen aansprakelijkheid voor schade door gebruik van dit hulpmiddel, behoudens opzet of bewuste roekeloosheid. Controleer de uitkomst altijd zelf tegen de officiële bronnen (RDI-zelfevaluatie, wettekst) en win waar nodig professioneel advies in. Dit is geen juridisch advies.';

// Lead-gate-config: MSP_BRAND.hubspot wint (white-label leads landen bij de
// MSP), anders window.HUBSPOT_GATE (Dxfferent-deploy; ids server-side
// invulbaar zonder rebuild). Zonder ids degradeert de gate naar een eerlijke
// mailto-fallback. De PDF-
// follow-up zelf is een HubSpot-workflow, geconfigureerd dáár.
const GATE_CFG = BRAND.hubspot
  ? { enabled: true, ...BRAND.hubspot }
  : (window.HUBSPOT_GATE || {});
// Een white-label-deploy die wél een eigen HubSpot-portal zet maar géén eigen
// privacyverklaring, zou de bezoeker "verwerkt door <MSP>" tonen met een link
// naar de privacyverklaring van Dxfferent, terwijl de data naar de MSP gaat.
// Dan liever geen gate: dezelfde eerlijkheid als bij ontbrekende ids.
// Wie een gate draait, verzamelt persoonsgegevens en moet zich dus identificeren
// én naar zijn eigen privacyverklaring wijzen (art. 13 AVG). Dat geldt voor élke
// deployer — ook voor die van Dxfferent zelf; er is bewust geen ingebouwde
// uitzondering. Ontbreekt een van beide, dan komt er geen gate en blijft het
// rapport gewoon zichtbaar: liever geen leadformulier dan een oneerlijk.
const GATE_OPERATOR = typeof BRAND.name === 'string' && BRAND.name.trim() ? BRAND.name.trim() : null;
const GATE_PRIVACY_URL = safeUrl(BRAND.privacyUrl);
const BRAND_LOGO = safeImageUrl(BRAND.logo);
const GATE_CONFIGURED = Boolean(GATE_CFG.portalId && GATE_CFG.formId && GATE_OPERATOR && GATE_PRIVACY_URL);
// AVG: rapportlevering vergt géén checkbox (de klik ís het verzoek);
// marketing is een aparte, optionele default-uit opt-in (art. 7(4) AVG + Tw 11.7).
const GATE_CONSENT_TEXT = 'Houd mij per e-mail op de hoogte van NIS2-ontwikkelingen (optioneel; afmelden kan altijd).';

// ---------- mode-schakelaar (OSS lead/pro) ----------
// 'lead' = leadmagnet op de MSP-site: 5 stappen (geen maatregelen-stap,
// readiness blijft op MATURITY_DEFAULT) + lead-gate. 'pro' = intern
// gereedschap voor consultants: alle 6 stappen, nooit een gate, dossier
// save/load.
const MODE_PARAMS = new URLSearchParams(window.location.search);
const MODE = MODE_PARAMS.get('mode') || BRAND.mode || 'lead';
const ACTIVE_STEPS = MODE === 'pro' ? STEPS : STEPS.filter((s) => s.key !== 'measures');

// ---------- autosave (localStorage, beide standen) ----------
const SAVE_KEY = 'nis2-intake-v1';
const SAVED = (() => {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch { return null; }
})();
const EMPTY_SCOPE = { sectorId: null, alwaysInScope: [], sizeAnswers: {}, exceptions: [], hq: null, designation: [], chain: null };

// Herstelde state (localStorage of dossier-file) is untrusted input: onbekende
// datatype/tier-ids uit een oudere normdata-versie of een hand-bewerkt dossier
// crashen anders de render (geen id-lookup-guards in de steps).
const DT_IDS = new Set(DATATYPES.map((d) => d.id));
const NORM_FILTERS = new Set(['all', 'cbw']);
function clampStep(v) {
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? Math.min(n, ACTIVE_STEPS.length) : 0;
}
function sanitizeState(d) {
  if (!d || typeof d !== 'object' || !Array.isArray(d.selected)) { return null; }
  const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
  const scope = { ...EMPTY_SCOPE, ...obj(d.scope) };
  ['alwaysInScope', 'exceptions', 'designation'].forEach((k) => { if (!Array.isArray(scope[k])) { scope[k] = []; } });
  scope.sizeAnswers = obj(scope.sizeAnswers);
  if (!['supplier', 'access'].includes(scope.chain)) { scope.chain = null; }
  const selected = d.selected.filter((id) => DT_IDS.has(id));
  return {
    step: clampStep(d.step),
    scope,
    selected,
    // De impact-stap loopt de datatypes één voor één af; zonder deze index
    // hervat een herladen sessie op datatype 1. Clampen tegen de gefilterde
    // lijst: een dossier uit een oudere normdata-versie kan datatypes dragen
    // die hier wegvallen, en dan wijst de opgeslagen index buiten de lijst.
    impactIdx: Number.isInteger(d.impactIdx) ? Math.max(0, Math.min(selected.length - 1, d.impactIdx)) : 0,
    // Een dossierbestand is untrusted input: clamp de numerieke antwoorden op
    // hun bereik, anders indexeert een handbewerkte waarde buiten de optielijst
    // en sneuvelt de render.
    answers: Object.fromEntries(Object.entries(obj(d.answers))
      .filter(([k]) => DT_IDS.has(k))
      .map(([k, v]) => [k, Object.fromEntries(['avail', 'conf', 'freq']
        .filter((f) => Number.isInteger(obj(v)[f]))
        .map((f) => [f, Math.min(3, Math.max(0, obj(v)[f]))]))])),
    tierOverride: Object.fromEntries(Object.entries(obj(d.tierOverride)).filter(([k, v]) => DT_IDS.has(k) && TIERS[v])),
    readiness: Object.fromEntries(Object.entries(obj(d.readiness))
      .filter(([, v]) => Number.isInteger(v))
      .map(([k, v]) => [k, Math.min(MATURITY_OPTS.length - 1, Math.max(0, v))])),
    measureNormFilter: NORM_FILTERS.has(d.measureNormFilter) ? d.measureNormFilter : 'all',
    submitted: d.submitted === true,
  };
}
const RESTORED = sanitizeState(SAVED);
let RESETTING = false;

// Weergave-instellingen die tijdens de sessie kunnen wijzigen (de thematoggle
// schrijft in `dark`). MSP_BRAND wint waar het gezet is; zonder brand-config
// draait de tool op deze neutrale defaults.
const UI_DEFAULTS = {
  accent: '#ed4c35',
  mspName: '[Uw MSP]',
  dark: true,
};

function useUi(defaults) {
  const [values, setValues] = useState(defaults);
  const set = useCallback((key, val) => setValues((prev) => ({ ...prev, [key]: val })), []);
  return [values, set];
}

function App() {
  const [ui, setUi] = useUi({
    ...UI_DEFAULTS,
    ...(typeof BRAND.accent === 'string' && /^#[0-9a-f]{6}$/i.test(BRAND.accent) ? { accent: BRAND.accent } : {}),
    ...(BRAND.name ? { mspName: BRAND.name } : {}),
    ...(BRAND.theme ? { dark: BRAND.theme === 'dark' } : {}),
  });
  // AI-NOTE: de naam komt uitsluitend uit MSP_BRAND.name (via UI_DEFAULTS),
  // nooit uit de querystring — anders kan iedereen de tool op het domein van de
  // MSP op naam van een derde zetten (?brand=Belastingdienst) inclusief
  // lead-gate, een geloofwaardige impersonatie-opstelling.
  const mspName = ui.mspName;
  const [step, setStep] = useState(RESTORED?.step ?? 0); // 0 intro, 1..N = ACTIVE_STEPS index+1
  const [scope, setScope] = useState(RESTORED?.scope ?? { ...EMPTY_SCOPE });
  const [selected, setSelected] = useState(RESTORED?.selected ?? []);
  const [answers, setAnswers] = useState(RESTORED?.answers ?? {});
  const [tierOverride, setTierOverride] = useState(RESTORED?.tierOverride ?? {});
  const [impactIdx, setImpactIdx] = useState(RESTORED?.impactIdx ?? 0);
  const [openDom, setOpenDom] = useState({});
  const [readiness, setReadiness] = useState(RESTORED?.readiness ?? {});
  const [measureQuery, setMeasureQuery] = useState('');
  const [measureGroupBy, setMeasureGroupBy] = useState('domain'); // 'domain' | 'norm'
  const [measureNormFilter, setMeasureNormFilter] = useState(RESTORED?.measureNormFilter ?? 'all'); // 'all' | 'cbw'
  const [resumed, setResumed] = useState(Boolean(RESTORED && RESTORED.step > 0));
  const [dossierMsg, setDossierMsg] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(RESTORED?.submitted ?? false);
  const [consent, setConsent] = useState(false);
  const [gateState, setGateState] = useState('idle');
  const [mpOpen, setMpOpen] = useState(null);

  // apply accent + theme
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--accent', ui.accent);
    r.style.setProperty('--accent-700', darken(ui.accent, 0.8));
    r.style.setProperty('--accent-soft', rgba(ui.accent, 0.12));
    r.setAttribute('data-theme', ui.dark ? 'dark' : 'light');
    for (const [k, v] of Object.entries(BRAND.tokens || {})) {
      if (k.startsWith('--')) r.style.setProperty(k, String(v));
    }
  }, [ui.accent, ui.dark]);

  const state = { selected, answers, tierOverride, readiness, scope };
  const stepKey = step === 0 ? 'intro' : ACTIVE_STEPS[step - 1]?.key;
  const stepNum = (key) => ACTIVE_STEPS.findIndex((s) => s.key === key) + 1;

  // autosave: intake-state naar localStorage, debounced (~500ms)
  useEffect(() => {
    const id = setTimeout(() => {
      if (RESETTING) { return; } // reset gestart: pending write mag de wis niet ongedaan maken
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({ step, scope, selected, answers, tierOverride, readiness, measureNormFilter, submitted, impactIdx }));
      } catch { /* storage vol/geblokkeerd (private mode): autosave stil uit */ }
    }, 500);
    return () => clearTimeout(id);
  }, [step, scope, selected, answers, tierOverride, readiness, measureNormFilter, submitted, impactIdx]);

  function resetIntake() {
    RESETTING = true;
    try { localStorage.removeItem(SAVE_KEY); } catch { /* idem */ }
    window.location.reload();
  }

  function toggleType(id) {
    if (selected.includes(id)) {
      const next = selected.filter((x) => x !== id);
      setSelected(next);
      setImpactIdx((i) => Math.min(i, Math.max(0, next.length - 1)));
    } else {
      setSelected([...selected, id]);
      setAnswers((a) => (a[id] ? a : { ...a, [id]: { avail: 1, conf: 1, freq: 2 } }));
    }
  }
  function setAns(dt, key, v) { setAnswers((a) => ({ ...a, [dt]: { ...a[dt], [key]: v } })); }

  // ---------- scope-check handlers ----------
  function setScopeSector(id) { setScope((s) => ({ ...s, sectorId: s.sectorId === id ? null : id })); }
  function toggleAlwaysInScope(id) {
    setScope((s) => {
      const has = s.alwaysInScope.includes(id);
      return { ...s, alwaysInScope: has ? s.alwaysInScope.filter((x) => x !== id) : [...s.alwaysInScope, id] };
    });
  }
  function setScopeSize(criterionId, bucket) {
    setScope((s) => ({ ...s, sizeAnswers: { ...s.sizeAnswers, [criterionId]: s.sizeAnswers[criterionId] === bucket ? null : bucket } }));
  }
  function toggleScopeList(key, id) {
    setScope((s) => {
      const list = s[key] || [];
      return { ...s, [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] };
    });
  }
  const scopeOutcome = useMemo(() => determineScopeOutcome(scope), [scope]);

  function go(n) { setStep(n); document.querySelector('.main')?.scrollTo({ top: 0 }); }

  // ---------- navigation handlers ----------
  function next() {
    if (stepKey === 'impact') { // impact: walk datatypes
      if (impactIdx < selected.length - 1) { setImpactIdx(impactIdx + 1); document.querySelector('.main')?.scrollTo({ top: 0 }); return; }
    }
    go(step + 1);
  }
  function back() {
    if (stepKey === 'impact' && impactIdx > 0) { setImpactIdx(impactIdx - 1); document.querySelector('.main')?.scrollTo({ top: 0 }); return; }
    go(Math.max(0, step - 1));
  }

  const report = useMemo(() => (stepKey === 'report' || stepKey === 'measures' ? buildReport(state) : null), [step, selected, answers, tierOverride, readiness, scope]);

  // ---------- compacte rapport-payload (CRM-veld nis2_rapport) ----------
  // Samenvatting van het rapport voor de gate-submit: scope,
  // totaalscore, per-domein score, RTO/RPO-profielen en top-gaps.
  function compactReport(r) {
    return {
      scope: scopeOutcome,
      overall: r.overall,
      domains: r.rows.map((row) => ({ id: row.id, current: row.current, target: row.target, gap: row.gap, priority: row.priority })),
      profiles: selected.map((id) => {
        const base = profileFor(answers[id]);
        const tierId = tierOverride[id] || base.tier;
        const rr = tierOverride[id] ? tierToRtoRpo(tierId) : { rto: base.rto, rpo: base.rpo };
        return { id, tier: tierId, rto: rr.rto, rpo: rr.rpo };
      }),
      top_gaps: r.roadmap.slice(0, 5).map((row) => ({ id: row.id, phase: row.meta.phase, measures: row.measures.slice(0, 3).map((m) => m.title) })),
    };
  }

  // ---------- dossier save/load (pro): intake-state als .json ----------
  function saveDossier() {
    const blob = new Blob(
      [JSON.stringify({ v: 1, saved_at: new Date().toISOString(), step, scope, selected, answers, tierOverride, readiness, measureNormFilter }, null, 2)],
      { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nis2-dossier-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function loadDossier(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // zelfde file opnieuw kiezen moet ook triggeren
    if (!file) { return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const clean = sanitizeState(JSON.parse(reader.result));
        if (!clean) { throw new Error('geen dossier'); }
        setScope(clean.scope);
        setSelected(clean.selected);
        setAnswers(clean.answers);
        setTierOverride(clean.tierOverride);
        setReadiness(clean.readiness);
        setMeasureNormFilter(clean.measureNormFilter);
        setImpactIdx(0);
        setDossierMsg('');
        go(clean.step || ACTIVE_STEPS.length);
      } catch {
        setDossierMsg('Dossier kon niet gelezen worden. Kies een eerder opgeslagen nis2-dossier-*.json.');
      }
    };
    reader.onerror = () => setDossierMsg('Bestand kon niet gelezen worden. Probeer het opnieuw te kiezen.');
    reader.readAsText(file);
  }
  function dossierLoadBtn() {
    return (
      <label className="btn btn-outline btn-sm">
        <input type="file" accept="application/json,.json" hidden onChange={loadDossier} />
        Dossier laden
      </label>
    );
  }

  // ---------- rail ----------
  function rail() {
    return (
      <aside className="rail">
        <div className="rail-brand">
          <div className="rail-mark">{BRAND_LOGO
            ? <img src={BRAND_LOGO} alt={mspName} />
            : ((mspName || 'M').trim().replace(/[^A-Za-z]/g, '').charAt(0).toUpperCase() || 'M')}</div>
          <div>
            <div className="bn">{mspName}</div>
            <div className="bs">NIS2 Quickscan</div>
          </div>
        </div>
        <div className="rail-mid">
          <h2 className="rail-title">Wat is uw data waard als het misgaat?</h2>
          <p className="rail-sub">In {ACTIVE_STEPS.length} stappen van Cbw-scope naar concrete maatregelen en diensten, afgestemd op NIS2.</p>
        </div>
        <nav className="rail-prog">
          {ACTIVE_STEPS.map((s, i) => {
            const cls = step === 0 ? '' : i + 1 < step ? 'done' : i + 1 === step ? 'on' : '';
            const canJump = step !== 0 && i + 1 < step;
            return (
              <div key={s.key} className={`rail-step ${cls} ${canJump ? 'clickable' : ''}`}
                aria-current={i + 1 === step ? 'step' : undefined}
                {...(canJump ? keyActivatable(() => go(i + 1)) : {})}>
                <span className="n">{i + 1 < step ? <Icon name="check" /> : i + 1}</span>{s.label}
              </div>
            );
          })}
        </nav>
        <div className="rail-foot">
          <span>Gratis intaketool · <a href={DXF.url} target="_blank" rel="noopener noreferrer"><b>powered by {DXF.name}</b></a></span>
          {/* De "powered by"-vermelding hierboven is de §7(b)-voorwaarde en staat
              vast; dit supportkanaal is dat niet — een partner die zelf support
              levert, zet hier zijn eigen adres (MSP_BRAND.supportMailto). */}
          {BRAND.supportMailto
            ? <span className="rail-support">Support? <a href={`mailto:${BRAND.supportMailto}?subject=NIS2-intake%20support`}>{BRAND.supportMailto}</a></span>
            : <span className="rail-support">Support of white-label? <a href={`mailto:${DXF.mailto}?subject=NIS2-intake%20support%20/%20white-label`}>{DXF.mailto}</a></span>}
          <span className="rail-source">Open source (AGPL-3.0) · <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">broncode</a></span>
        </div>
      </aside>
    );
  }

  // ---------- step bodies ----------
  function intro() {
    const pts = [
      { ic: 'layers', t: 'Breng uw data in kaart', d: 'Welke gegevens en systemen kan uw bedrijf geen dag missen?' },
      { ic: 'recover', t: 'Bepaal uw hersteltempo', d: 'Hoe snel moet u terug zijn (RTO) en hoeveel verlies is acceptabel (RPO)?' },
      { ic: 'shield', t: 'Zie welke maatregelen nodig zijn', d: 'NIS2-maatregelen plus de diensten waarmee u ze invult, en wat er als eerste moet gebeuren.' },
    ];
    return (
      <div className="intro-hero fade">
        <div className="eyebrow">Begeleide intake · ± 10 minuten</div>
        <h1 className="step-h" style={{ fontSize: 40, maxWidth: '15ch' }}>In {ACTIVE_STEPS.length} stappen van Cbw-scope naar een concreet beveiligingsplan.</h1>
        <p className="step-sub">Doorloop deze intake samen met uw IT-partner. Per type data bepaalt u de impact en het
          benodigde herstelprofiel. Aan het eind ziet u welke NIS2-maatregelen en diensten daarbij horen.</p>
        <div className="intro-points">
          {pts.map((p) => (
            <div className="intro-point" key={p.t}>
              <div className="iconbadge"><Icon name={p.ic} /></div>
              <div><div className="t">{p.t}</div><div className="d">{p.d}</div></div>
            </div>
          ))}
        </div>
        <div className="intro-cta">
          <button className="btn btn-primary" onClick={() => go(1)}>Start de intake <Icon name="arrow" /></button>
          {MODE === 'pro' && dossierLoadBtn()}
          <span className="intro-meta">Geen account nodig · uw antwoorden blijven op dit apparaat, tenzij u zelf het rapport per e-mail aanvraagt.</span>
        </div>
        {dossierMsg && <p className="dossier-msg">{dossierMsg}</p>}
      </div>
    );
  }

  // ---------- scope-check step ----------
  function scopeStep() {
    const sc = SCOPE_CHECK;
    const outcomeMeta = sc.outcomes?.find((o) => o.id === scopeOutcome);
    const outcomeTone = scopeOutcome === 'essentieel' ? 'error'
      : scopeOutcome === 'belangrijk' || scopeOutcome === 'keten' ? 'warning' : 'neutral';
    const inScope = scopeOutcome === 'essentieel' || scopeOutcome === 'belangrijk';
    const scopeNotes = [];
    const eu2690Hit = (scope.sectorId && (sc.eu2690?.sectors || []).includes(scope.sectorId))
      || (scope.alwaysInScope || []).some((id) => id.startsWith('vertrouwensdiensten'));
    if (eu2690Hit && sc.eu2690?.note) { scopeNotes.push(sc.eu2690.note); }
    if ((scope.exceptions || []).length > 0) { scopeNotes.push('U heeft een wettelijke uitzondering aangevinkt: voor die taken of activiteiten geldt de Cbw niet of beperkt. De classificatie hieronder blijft gelden voor uw overige activiteiten. Controleer dit in de RDI-zelfevaluatie.'); }
    // Jurisdictie (NIS2 art. 26): de hoofdvestigingsregel geldt alleen voor de
    // digitale categorieën; overige sectoren vallen onder het land van vestiging.
    const HQ_DIGITAL = new Set(['digitale_infra', 'ict_beheer_b2b', 'digitale_aanbieders']);
    const hqDigital = HQ_DIGITAL.has(scope.sectorId)
      || (scope.alwaysInScope || []).some((id) => id.startsWith('vertrouwensdiensten') || ['tld_registers', 'dns_diensten', 'domeinnaamregistratie'].includes(id));
    if (scope.hq === 'eu') {
      scopeNotes.push(hqDigital
        ? 'Hoofdvestiging in een ander EU-land: voor digitale aanbieders bepaalt de hoofdvestiging welk land bevoegd is (NIS2 art. 26), dus de NIS2-omzetting van dát land is van toepassing. Deze intake volgt de Nederlandse Cbw.'
        : 'Hoofdvestiging in een ander EU-land: voor uw sector geldt de wet van het land van vestiging, dus uw Nederlandse vestiging valt gewoon onder de Cbw, ook met een hoofdkantoor elders.');
    }
    if (scope.hq === 'non_eu') {
      scopeNotes.push(hqDigital
        ? 'Hoofdvestiging buiten de EU: als digitale aanbieder met diensten in de EU moet u een EU-vertegenwoordiger aanwijzen; het land van die vertegenwoordiger wordt bevoegd.'
        : 'Hoofdvestiging buiten de EU: voor uw sector geldt de wet van het land van vestiging, dus uw Nederlandse vestiging valt onder de Cbw.');
    }
    const sizeDone = (sc.size_cap_criteria || []).every((c) => scope.sizeAnswers?.[c.id]);
    const onbekendHint = !scope.sectorId
      ? "Kies hierboven uw sector, of vink een van-rechtswege-categorie aan; de indicatie verschijnt hier direct. Overslaan kan ook, de uitkomst blijft dan 'onbekend'."
      : !sizeDone
        ? 'Uw sector is ingevuld. Vul nu de omvang in (medewerkers, jaaromzet en balanstotaal), dan verschijnt hier uw indicatie.'
        : SCOPE_VERDICT_MEANING.onbekend;
    if (scopeOutcome === 'waarschijnlijk_buiten_scope' && (scope.designation || []).length > 0) { scopeNotes.push('Op basis van de aangevinkte criteria kan uw organisatie ondanks de kleine omvang alsnog worden aangewezen. Houd rekening met verplichtingen en doe de officiële check.'); }
    return (
      <div className="fade">
        <div className="eyebrow">Stap {stepNum('scope')} · Cbw-scope</div>
        <h1 className="step-h">Valt uw organisatie onder de Cyberbeveiligingswet?</h1>
        <p className="step-sub">Beantwoord wat van toepassing is; de indicatie onderaan groeit met elk antwoord mee.
          Wat eruit komt is een onderbouwde inschatting. De wettekst is bepalend, en de{' '}
          <a href={safeUrl(sc.rdi_self_assessment_url)} target="_blank" rel="noopener noreferrer">officiële RDI-zelfevaluatie</a> is het hulpmiddel om uw classificatie vast te stellen.
          Deze stap overslaan mag: de intake werkt ook zonder scope-uitkomst.</p>

        <div className="sec-h">Sector (Cbw bijlage 1/2)</div>
          <div className="dt-grid scope-sector-grid">
            {sc.sectors.map((s) => (
              <button key={s.id} className={`dt scope-sector ${scope.sectorId === s.id ? 'sel' : ''}`}
                aria-pressed={scope.sectorId === s.id} onClick={() => setScopeSector(s.id)}>
                <span className="ic"><Icon name={SECTOR_ICONS[s.id] || 'dot'} /></span>
                <span><span className="tl">{s.label}</span><span className={`hl annex-${s.annex}`}>Bijlage {s.annex}</span></span>
                <span className="tick"><Icon name="check" /></span>
              </button>
            ))}
          </div>

          <div className="sec-h">Omvang (size-cap)</div>
          <div className="scope-size-grid">
            {sc.size_cap_criteria.map((c) => (
              <div className="scope-size-block" key={c.id}>
                <div className="al">{c.label}</div>
                <div className="seg">
                  {(SIZE_CAP_BUCKETS[c.id] || []).map((b) => (
                    <button key={b.v} className={scope.sizeAnswers[c.id] === b.v ? 'on' : ''}
                      aria-pressed={scope.sizeAnswers[c.id] === b.v} onClick={() => setScopeSize(c.id, b.v)}>{b.t}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

        <div className="sec-h">Altijd in scope, ongeacht sector of omvang</div>
          <div className="scope-checklist">
            {sc.always_in_scope.map((a) => (
              <label key={a.id} className={`scope-check-item ${scope.alwaysInScope.includes(a.id) ? 'sel' : ''}`}>
                <input type="checkbox" checked={scope.alwaysInScope.includes(a.id)} onChange={() => toggleAlwaysInScope(a.id)} />
                <span>
                  <span className="tl">{a.label}</span>
                  {a.note && <span className="hl">{a.note}</span>}
                </span>
              </label>
            ))}
          </div>

          <div className="sec-h">Wettelijke uitzonderingen</div>
          <p className="scope-hint">Voor enkele (overheids)taken geldt de Cbw niet of beperkt. Vink aan wat van toepassing is; meestal geldt hier geen van deze uitzonderingen.</p>
          <div className="scope-checklist">
            {SCOPE_EXTRA.exceptions.map((a) => (
              <label key={a.id} className={`scope-check-item ${scope.exceptions.includes(a.id) ? 'sel' : ''}`}>
                <input type="checkbox" checked={scope.exceptions.includes(a.id)} onChange={() => toggleScopeList('exceptions', a.id)} />
                <span>
                  <span className="tl">{a.label}</span>
                  {a.note && <span className="hl">{a.note}</span>}
                </span>
              </label>
            ))}
          </div>

        <div className="sec-h">Waar ligt de hoofdvestiging (het bestuurscentrum)?</div>
          <div className="choices">
            {SCOPE_EXTRA.hq.map((o) => (
              <button key={o.v} className={`choice ${scope.hq === o.v ? 'sel' : ''}`} onClick={() => setScope((s) => ({ ...s, hq: s.hq === o.v ? null : o.v }))}>
                <div className="ct">{o.t}</div><div className="cd">{o.d}</div>
              </button>
            ))}
          </div>

          {sc.chain_question && (<>
            <div className="sec-h">Uw plek in de keten</div>
            <p className="scope-hint">{sc.chain_question.help}</p>
            <div className="choices">
              {sc.chain_question.options.map((o) => (
                <button key={o.v} className={`choice ${scope.chain === o.v ? 'sel' : ''}`}
                  onClick={() => setScope((s) => ({ ...s, chain: s.chain === o.v ? null : o.v }))}>
                  <div className="ct">{o.t}</div><div className="cd">{o.d}</div>
                </button>
              ))}
            </div>
          </>)}

          {scopeOutcome === 'waarschijnlijk_buiten_scope' && (<>
            <div className="sec-h">Mogelijke aanwijzing ondanks kleine omvang</div>
            <p className="scope-hint">Ook kleinere organisaties kunnen worden aangewezen. Geldt een van deze situaties?</p>
            <div className="scope-checklist">
              {SCOPE_EXTRA.designation.map((a) => (
                <label key={a.id} className={`scope-check-item ${scope.designation.includes(a.id) ? 'sel' : ''}`}>
                  <input type="checkbox" checked={scope.designation.includes(a.id)} onChange={() => toggleScopeList('designation', a.id)} />
                  <span><span className="tl">{a.label}</span></span>
                </label>
              ))}
            </div>
          </>)}

        <div className={`verdict-hero tone-${outcomeTone}`} data-outcome={scopeOutcome}>
          <div className="verdict-hero-head">
            <div className="verdict-hero-icon"><Icon name={SCOPE_VERDICT_ICON[scopeOutcome] || 'dot'} /></div>
            <div>
              <div className="verdict-hero-eyebrow">Uw indicatieve classificatie</div>
              <div className="verdict-hero-title">{outcomeMeta?.label || 'Nog onbekend'}</div>
            </div>
          </div>
          <p className="verdict-hero-meaning">{scopeOutcome === 'onbekend' ? onbekendHint : SCOPE_VERDICT_MEANING[scopeOutcome]}</p>
          {scopeNotes.map((n, i) => <p className="verdict-hero-note" key={i}><b>Let op:</b> {n}</p>)}
          {inScope && (
            <div className="verdict-hero-actions">
              <p className="verdict-hero-note">{sc.registration_note}</p>
              <div className="verdict-hero-links">
                <a href={safeUrl(sc.registration_portal_url)} target="_blank" rel="noopener noreferrer">Registreren via mijn.ncsc.nl <Icon name="arrow" /></a>
                <a href={safeUrl(sc.rdi_self_assessment_url)} target="_blank" rel="noopener noreferrer">Officiële RDI-zelfevaluatie <Icon name="arrow" /></a>
              </div>
            </div>
          )}
          {scopeOutcome === 'waarschijnlijk_buiten_scope' && (
            <div className="verdict-hero-actions">
              <button className="btn btn-outline btn-sm" onClick={next}>Toch doorgaan met de intake →</button>
              <div className="verdict-hero-links">
                <a href={safeUrl(sc.rdi_self_assessment_url)} target="_blank" rel="noopener noreferrer">Officiële RDI-zelfevaluatie <Icon name="arrow" /></a>
              </div>
            </div>
          )}
        </div>

        <div className="scope-disclaimer">
          <p>Deze indicatie is géén juridisch advies. De wettekst is bepalend; de officiële <a href={safeUrl(sc.rdi_self_assessment_url)} target="_blank" rel="noopener noreferrer">RDI-zelfevaluatie</a> is het hulpmiddel om uw classificatie vast te stellen.</p>
          <details><summary>Meer over deze indicatie</summary><p>{sc.disclaimer}</p></details>
        </div>
      </div>
    );
  }

  function dataStep() {
    return (
      <div className="fade">
        <div className="eyebrow">Stap {stepNum('data')} · Datatypes</div>
        <h1 className="step-h">Welke data en systemen wilt u beoordelen?</h1>
        <p className="step-sub">Selecteer alles wat van toepassing is. Per onderdeel stellen we straks een paar korte impactvragen.</p>
        <div className="dt-grid">
          {DATATYPES.map((d) => (
            <button key={d.id} className={`dt ${selected.includes(d.id) ? 'sel' : ''}`}
              aria-pressed={selected.includes(d.id)} onClick={() => toggleType(d.id)}>
              <span className="ic"><Icon name={d.icon} /></span>
              <span><span className="tl">{d.label}</span><span className="hl">{d.hint}</span></span>
              <span className="tick"><Icon name="check" /></span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function impactStep() {
    const dtId = selected[impactIdx];
    const dt = DATATYPES.find((d) => d.id === dtId);
    if (!dt) { return <div className="fade"><p className="step-sub">Selecteer eerst een datatype.</p></div>; }
    const a = answers[dtId] || {};
    return (
      <div className="fade" key={dtId}>
        <div className="eyebrow">Stap {stepNum('impact')} · Impact — datatype {impactIdx + 1} van {selected.length}</div>
        <h1 className="step-h" style={{ marginBottom: 14 }}>Hoe belangrijk is dit voor uw bedrijf?</h1>
        <div className="impact-chip"><Icon name={dt.icon} /> {dt.label}</div>
        {IMPACT_QUESTIONS.map((q) => (
          <div className="qblock" key={q.key}>
            <div className="qlab"><Icon name={q.icon} /> {q.label}</div>
            <div className="qtitle">{q.q}</div>
            <div className="qhelp">{q.help}</div>
            <ScaleRow ariaLabel={q.q} value={a[q.key]}
              options={q.options.map((o) => ({ v: o.v, t: o.t, d: o.d }))}
              onSelect={(v) => setAns(dtId, q.key, v)} />
          </div>
        ))}
      </div>
    );
  }

  function rtorpoStep() {
    return (
      <div className="fade">
        <div className="eyebrow">Stap {stepNum('rtorpo')} · Herstelprofiel</div>
        <h1 className="step-h">Dit is uw voorgestelde hersteltempo</h1>
        <p className="step-sub">Op basis van uw antwoorden. Niet passend? Stel het profiel per onderdeel bij; de aanbevelingen passen automatisch mee.</p>
        {selected.map((id) => {
          const dt = DATATYPES.find((d) => d.id === id);
          const base = profileFor(answers[id]);
          const tierId = tierOverride[id] || base.tier;
          const rr = tierOverride[id] ? tierToRtoRpo(tierId) : { rto: base.rto, rpo: base.rpo };
          const tier = TIERS[tierId];
          const confDriven = base.conf > base.avail;
          return (
            <div className="rev-card" key={id}>
              <div className="rev-head">
                <div className="iconbadge"><Icon name={dt.icon} /></div>
                <div className="nm">{dt.label}</div>
                <span className={`tierbadge tone-${tier.tone}`}>{tier.label}</span>
              </div>
              <div className="rtorpo">
                <div className="cell"><div className="l">RTO — weer online</div><div className="v">{rr.rto}</div></div>
                <div className="cell"><div className="l">RPO — max. dataverlies</div><div className="v">{rr.rpo}</div></div>
              </div>
              <p className="rtorpo-note">
                Hersteltijd volgt uw uitval-impact; max. dataverlies volgt hoe vaak de data wijzigt.
                {confDriven && ` Herstelprofiel '${tier.label}' komt door de gevoeligheid van deze data; de hersteltijd mag ruimer zijn, omdat uitval beperkte impact heeft.`}
              </p>
              <div className="adjust">
                <div className="al">Profiel bijstellen</div>
                <ScaleRow ariaLabel={`Herstelprofiel: ${dt.label}`} value={tierId}
                  options={TIER_ORDER.map((tid) => ({ v: tid, t: TIERS[tid].label, d: `RTO ${TIERS[tid].rto} · RPO ${TIERS[tid].rpo}` }))}
                  onSelect={(tid) => setTierOverride((o) => ({ ...o, [id]: tid }))} />
                <div className="qhelp" style={{ marginTop: 10, marginBottom: 0 }}>{tier.blurb}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function measuresStep() {
    const r = report;
    const queryActive = measureQuery.trim() !== '' || measureNormFilter !== 'all';
    const totalCount = r.domains.reduce((n, dom) => n + dom.measures.length, 0);
    const filteredDomains = r.domains.map((dom) => ({
      ...dom,
      measures: dom.measures.filter((m) => measureMatches(m, measureQuery) && measureInNormFilter(m, measureNormFilter)),
    }));
    const matchedCount = filteredDomains.reduce((n, dom) => n + dom.measures.length, 0);
    const byNormGroup = measureGroupBy === 'norm' ? groupMeasuresByNorm(filteredDomains) : null;
    // live gereedheid (suggestie G): zelfde buildReport als het rapport (al
    // gememoized op App-niveau), wit=voortgang. Deze stap bestaat alleen in
    // pro (ACTIVE_STEPS filtert 'measures' uit de lead-flow).
    const allKeys = r.domains.flatMap((dom) => dom.measures.map((m) => measureKey(dom.id, m)));
    const answeredCount = allKeys.filter((k) => readiness[k] !== undefined).length;

    return (
      <div className="fade">
        <div className="eyebrow">Stap {stepNum('measures')} · Maatregelen & huidige situatie</div>
        <h1 className="step-h">Dit heeft u nodig. En waar staat u nu?</h1>
        <p className="step-sub">Op basis van uw profiel zijn dit de relevante NIS2-domeinen. Open een domein, bekijk de
          maatregelen en bijbehorende diensten, en geef per domein aan hoever u al bent. Dat bepaalt uw gap.</p>

        <div className="live-bar" role="status" aria-label="Gereedheid tot nu toe">
          <div className="live-score"><b>{r.overall}</b><span>gereed tot nu toe</span></div>
          <div className="live-doms">
            {r.rows.map((row) => (
              <span className="live-dom" key={row.id} title={`${row.label}: ${row.current}%`}>
                <span className="live-fill"><i style={{ width: row.current + '%' }} /></span>{row.label}
              </span>
            ))}
          </div>
          <span className="live-count">{answeredCount} / {allKeys.length} beantwoord</span>
        </div>

        <div className="measures-toolbar">
          <input className="input measures-search" type="search" placeholder="Zoek op code of titel (bv. A.8.13, 21.3, back-up)"
            value={measureQuery} onChange={(e) => setMeasureQuery(e.target.value)} />
          <div className="seg" role="group" aria-label="Groepeer maatregelen">
            <button className={measureGroupBy === 'domain' ? 'on' : ''} aria-pressed={measureGroupBy === 'domain'}
              onClick={() => setMeasureGroupBy('domain')}>Groepeer: Domein</button>
            <button className={measureGroupBy === 'norm' ? 'on' : ''} aria-pressed={measureGroupBy === 'norm'}
              onClick={() => setMeasureGroupBy('norm')}>Norm</button>
          </div>
          <div className="seg" role="group" aria-label="Filter op norm">
            <button className={measureNormFilter === 'all' ? 'on' : ''} aria-pressed={measureNormFilter === 'all'}
              onClick={() => setMeasureNormFilter('all')}>Alle</button>
            <button className={measureNormFilter === 'cbw' ? 'on' : ''} aria-pressed={measureNormFilter === 'cbw'}
              title="Maatregelen met een Cbw-artikelverwijzing" onClick={() => setMeasureNormFilter('cbw')}>Cbw</button>
          </div>
          <span className="measures-count">{matchedCount} van {totalCount} maatregelen</span>
        </div>

        {measureGroupBy === 'domain' && filteredDomains.map((dom) => {
          const hasMatches = dom.measures.length > 0;
          const open = queryActive ? hasMatches : !!openDom[dom.id];
          return (
            <div className={`dom-card ${open ? 'open' : ''} ${queryActive && !hasMatches ? 'dom-dim' : ''}`} key={dom.id}>
              <div className="dom-top" aria-expanded={open} aria-controls={`dom-body-${dom.id}`}
                {...keyActivatable(() => setOpenDom((o) => ({ ...o, [dom.id]: !o[dom.id] })))}>
                <div className="iconbadge"><Icon name={dom.icon} /></div>
                <div>
                  <div className="nm">{dom.label}</div>
                  <div className="ct">{dom.measures.length} maatregelen</div>
                </div>
                <div className="right">
                  <span className={`prio tone-${dom.meta.tone}`}>{dom.meta.label}</span>
                  <Icon name="arrow" className="chev" />
                </div>
              </div>
              <div className="dom-body" id={`dom-body-${dom.id}`}>
                <div className="dom-intro">{dom.intro}</div>
                {dom.norm_note && <div className="norm-note">{dom.norm_note}</div>}
                <div className="gap-q gap-q-quickset">
                  <span className="gl">Zet het hele domein op één niveau (per maatregel bij te stellen):</span>
                  <ScaleSm action ariaLabel={`Heel domein op één niveau: ${dom.label}`} value={null}
                    onSelect={(v) => setReadiness((s) => {
                      const next = { ...s };
                      dom.measures.forEach((m) => { next[measureKey(dom.id, m)] = v; });
                      return next;
                    })} />
                </div>
                {(dom.themes || []).map((th) => {
                  // volledige thema-set uit het ongefilterde domein: de
                  // thema-picker zet álle onderliggende maatregelen, ook als
                  // de normfilter er een deel van verbergt.
                  const fullDom = r.domains.find((d) => d.id === dom.id);
                  const allInTheme = fullDom.measures.filter((m) => m.theme === th.id);
                  const shown = dom.measures.filter((m) => m.theme === th.id);
                  if (!shown.length) { return null; }
                  const values = allInTheme.map((m) => readiness[measureKey(dom.id, m)] ?? MATURITY_DEFAULT);
                  const uniform = values.every((v) => v === values[0]) ? values[0] : null;
                  const refsSeen = new Set();
                  const themeRefs = allInTheme.flatMap((m) => m.refs || []).filter((ref) => {
                    const k = `${ref.group}:${ref.code}`;
                    if (refsSeen.has(k)) { return false; }
                    refsSeen.add(k); return true;
                  });
                  return (
                    <div className="theme-block" key={th.id}>
                      <div className="theme-head">
                        <div>
                          <div className="theme-title">{th.label}</div>
                          <div className="theme-sub">Eén antwoord dekt {allInTheme.length === 1 ? 'deze normeis' : `${allInTheme.length} normeisen in één keer`}</div>
                        </div>
                        <div className="mat-row">
                          <ScaleSm ariaLabel={`Volwassenheid: ${th.label}`} value={uniform}
                            onSelect={(v) => setReadiness((s) => {
                              const next = { ...s };
                              allInTheme.forEach((m) => { next[measureKey(dom.id, m)] = v; });
                              return next;
                            })} />
                          <span className="mat-label">{uniform !== null ? MATURITY_OPTS[uniform].t : 'Gemengd'}</span>
                        </div>
                      </div>
                      <RefChips refs={themeRefs} />
                      <details className="theme-detail" open={!!measureQuery.trim() || measureNormFilter !== 'all'}>
                        <summary>{shown.length === 1 ? '1 maatregel' : `${shown.length} maatregelen`} & diensten — per maatregel bijstellen</summary>
                        {shown.map((m) => {
                          const mk = measureKey(dom.id, m);
                          const mv = readiness[mk] ?? MATURITY_DEFAULT;
                          return (
                            <div className="mrow" key={m.sc_code || m.title}>
                              <div className="mtitle">{m.title}</div>
                              <RefChips refs={m.refs} />
                              <div className="msvc">Dienst: <b>{m.service}</b></div>
                              <div className="mat-row">
                                <ScaleSm ariaLabel={`Volwassenheid: ${m.title}`} value={mv}
                                  onSelect={(v) => setReadiness((s) => ({ ...s, [mk]: v }))} />
                                <span className="mat-label">{MATURITY_OPTS[mv].t}</span>
                              </div>
                            </div>
                          );
                        })}
                      </details>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {measureGroupBy === 'norm' && (
          <div className="norm-groups">
            {REF_GROUPS.map((g) => {
              const items = byNormGroup[g.key] || [];
              if (!items.length) { return null; }
              return (
                <div className="norm-group" key={g.key}>
                  <div className="sec-h">{g.label} <span className="norm-group-count">({items.length})</span></div>
                  <div className="norm-group-body">
                    {items.map(({ measure: m, domain: dom, code }, i) => (
                      <div className="mrow" key={`${g.key}-${code}-${i}`}>
                        <div className="mtitle">{m.title}</div>
                        <div className="mdom">{dom.label}</div>
                        <RefChips refs={m.refs} />
                        <div className="msvc">Dienst: <b>{m.service}</b></div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {REF_GROUPS.every((g) => !(byNormGroup[g.key] || []).length) && (
              <p className="step-sub">Geen maatregelen gevonden voor deze zoekopdracht.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  async function submitGate(e) {
    e.preventDefault();
    if (!email.includes('@')) { return; }
    setGateState('submitting');
    try {
      const baseFields = [
        { objectTypeId: '0-1', name: 'email', value: email },
        { objectTypeId: '0-1', name: 'message', value: `[nis2-quickscan] scope=${scopeOutcome} score=${report ? report.overall : '-'}` },
      ];
      const rapportField = report
        ? { objectTypeId: '0-1', name: 'nis2_rapport', value: JSON.stringify(compactReport(report)) }
        : null;
      const post = (fields) => fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${GATE_CFG.portalId}/${GATE_CFG.formId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields,
          // Zonder querystring: die kan modus-, brand- of campagneparameters
          // dragen die niets met de rapportaanvraag te maken hebben.
          context: { pageUri: window.location.origin + window.location.pathname, pageName: document.title },
          legalConsentOptions: {
            consent: {
              consentToProcess: true,
              text: 'De bezoeker heeft het rapport per e-mail aangevraagd; e-mailadres en rapport-samenvatting worden verwerkt om het rapport te leveren.',
              // marketing-opt-in alleen bij expliciet aangevinkt (default uit);
              // subscriptionTypeId is per portal — zie MSP-ENABLEMENT.md
              communications: (consent && GATE_CFG.subscriptionTypeId)
                ? [{ value: true, subscriptionTypeId: GATE_CFG.subscriptionTypeId, text: GATE_CONSENT_TEXT }]
                : [],
            },
          },
        }),
      });
      let res = await post(rapportField ? [...baseFields, rapportField] : baseFields);
      if (res.status === 400 && rapportField) {
        // form kent het nis2_rapport-veld niet (zie MSP-ENABLEMENT) —
        // de gate mag daar nooit op breken: opnieuw zonder rapportveld.
        res = await post(baseFields);
      }
      if (!res.ok) { throw new Error(`HTTP ${res.status}`); }
      setGateState('idle');
      setSubmitted(true);
    } catch (err) {
      console.error('Gate-submit mislukt:', err);
      setGateState('error');
    }
  }

  function reportStep() {
    const r = report;
    // AI-NOTE: zonder geconfigureerde ids nooit een gate — anders belooft de
    // UI verzending die niet bestaat.
    const gateOn = GATE_CFG.enabled === true && GATE_CONFIGURED && !submitted && MODE !== 'pro';
    // Lead heeft de maatregelen-stap niet doorlopen: geen gemeten volwassenheid,
    // dus geen gauge/percentages — wél risicoprofiel + prioriteiten + meet-CTA
    // De engine rekent intern gewoon door (MATURITY_DEFAULT).
    const isLead = MODE !== 'pro';
    const tone = r.overall >= 75 ? 'success' : r.overall >= 50 ? 'warning' : 'error';
    const verdict = r.overall >= 75 ? 'Goed op weg' : r.overall >= 50 ? 'Belangrijke gaps' : 'Urgente aandacht nodig';
    const scopeOutcomeMeta = SCOPE_CHECK.outcomes?.find((o) => o.id === scopeOutcome);
    const scopeShort = { essentieel: 'Essentieel', belangrijk: 'Belangrijk', waarschijnlijk_buiten_scope: 'Buiten scope', keten: 'Keten' }[scopeOutcome] || scopeOutcomeMeta?.label;
    const urgentCount = r.roadmap.filter((row) => row.priority === 'hoog').length;
    const urgentLabel = urgentCount === 1 ? 'Domein urgent' : 'Domeinen urgent';
    const openMeasures = r.roadmap.reduce((n, row) => n + row.measures.length, 0);
    const workCounts = {};
    r.roadmap.forEach((row) => row.measures.forEach((m) => { workCounts[m.work] = (workCounts[m.work] || 0) + 1; }));
    // open maatregelen per SC-vanaf-niveau (sc_from); Cbw-only maatregelen
    // dragen geen niveau en tellen hier niet mee.
    const scLevelCounts = { '10': 0, '20': 0, '30': 0 };
    r.roadmap.forEach((row) => row.measures.forEach((m) => { if (m.sc_from && m.sc_from in scLevelCounts) { scLevelCounts[m.sc_from] += 1; } }));
    const scOpenTotal = scLevelCounts['10'] + scLevelCounts['20'] + scLevelCounts['30'];
    const totalMeasures = r.rows.reduce((n, row) => n + row.measures.length, 0);
    const measuredCount = r.rows.reduce((n, row) => n + row.measures.filter((m) => readiness[measureKey(row.id, m)] != null).length, 0);
    // Pro zonder ingevulde meting: geen gauge/percentages op MATURITY_DEFAULT
    // presenteren alsof er gemeten is — zelfde eerlijke variant als lead.
    const unmeasured = !isLead && measuredCount === 0;
    const scopeInScope = scopeOutcome === 'essentieel' || scopeOutcome === 'belangrijk';
    const scopeTone = scopeOutcome === 'essentieel' ? 'error' : scopeOutcome === 'belangrijk' ? 'warning' : 'neutral';
    const worstTierId = selected.reduce((acc, id) => {
      const tid = tierOverride[id] || profileFor(answers[id]).tier;
      return TIER_ORDER.indexOf(tid) > TIER_ORDER.indexOf(acc) ? tid : acc;
    }, TIER_ORDER[0]);
    const worstTier = TIERS[worstTierId];
    const prioMax = r.roadmap.length ? (r.roadmap[0].meta.weight * r.roadmap[0].gap) || 1 : 1;
    // White-label: MSP_BRAND.packages ({ tiers, lines }) vervangt de menukaart uit
    // de config, zodat een partner zijn eigen dienstentrap toont. Alleen als
    // tiers ÉN lines allebei meekomen: een halve override erft de andere helft
    // van de default en dan wijzen from-indices naar kolommen die niet bestaan.
    const pkgOverride = BRAND.packages && Array.isArray(BRAND.packages.tiers) && Array.isArray(BRAND.packages.lines) ? BRAND.packages : null;
    const pkgCfg = { ...PACKAGE_SUGGESTION, ...(pkgOverride || {}) };
    const pkg = suggestPackage(pkgCfg, scopeOutcome, r.ctx.maxCrit, scope.chain === 'access');
    const pkgTiers = pkgCfg.tiers || [];
    const pkgIdx = pkgTiers.indexOf(pkg);
    // Secties met een `requires` tonen alleen bij het bijbehorende datatype: een
    // administratiekantoor krijgt geen OT-kolom, een klant zonder eigen software
    // geen ontwikkelsectie. Lege secties vallen weg.
    const pkgSections = (pkgCfg.sections || [])
      .filter((s) => !s.requires || r.ctx.has[s.requires])
      .map((s) => ({ ...s, lines: (pkgCfg.lines || []).filter((l) => l.section === s.id) }))
      .filter((s) => s.lines.length);
    return (
      <div className="fade">
        <div className="eyebrow">Stap {stepNum('report')} · Rapport</div>
        <h1 className="step-h">Uw NIS2-risicorapport</h1>
        <div className="rep-annot">Rapport — NIS2 Quickscan · <b>{mspName}</b> · {new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
        <p className="step-sub">Een momentopname op basis van deze intake. Bespreek het met uw IT-partner als startpunt voor een plan.</p>

        {scopeOutcomeMeta && (
          <div className={`scope-report-banner tone-${scopeTone}`}>
            <Icon name="shield" style={{ width: 16, height: 16 }} />
            <span>{scopeOutcome === 'keten'
              ? <>Uw organisatie wordt vermoedelijk <b>indirect geraakt via de keten</b>: uw klanten moeten kunnen aantonen dat hun leveranciers (u dus) hun zaken op orde hebben.</>
              : <>Uw organisatie kwalificeert vermoedelijk als <b>{scopeOutcomeMeta?.label || 'Cbw-entiteit'}</b>.{scopeInScope ? ' Vergeet de registratieplicht niet (mijn.ncsc.nl).' : ''}</>}</span>
          </div>
        )}

        {(isLead || unmeasured) ? (<>
          <div className="rep-score">
            <div className="txt">
              <h3>Uw risicoprofiel</h3>
              <p>Scope: <b>{scopeOutcomeMeta?.label || 'nog onbekend'}</b>
                {worstTier && <> · zwaarste herstelprofiel: <b>{worstTier.label}</b> (RTO {worstTier.rto} · RPO {worstTier.rpo})</>}</p>
              <div className="rep-stats">
                <div className="rep-stat"><div className="v">{r.rows.length}</div><div className="l">Domeinen</div></div>
                <div className="rep-stat"><div className="v">{r.roadmap.reduce((n, row) => n + row.measures.length, 0)}</div><div className="l">Maatregelen</div></div>
                <div className="rep-stat"><div className="v">{urgentCount}</div><div className="l">{urgentLabel}</div></div>
                {scopeOutcomeMeta && <div className="rep-stat"><div className="v">{scopeShort}</div><div className="l">Cbw-indicatie</div></div>}
              </div>
            </div>
          </div>

          <div className="sec-h">Waar te beginnen: prioriteit uit uw profiel</div>
          <div className="bars">
            {r.roadmap.map((row) => (
              <div className="bar-row" key={row.id}>
                <div className="bt">
                  <Icon name={row.icon} style={{ width: 16, height: 16 }} />
                  <span className="nm">{row.label}</span>
                  <span className={`prio tone-${row.meta.tone}`} style={{ marginLeft: 4 }}>{row.meta.label}</span>
                </div>
                <div className="track">
                  <div className={`cur fill-${row.meta.tone}`} style={{ width: Math.max(18, Math.round(((row.meta.weight * row.gap) / prioMax) * 100)) + '%' }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="meet-cta">
            <b>Volwassenheid nog niet gemeten.</b>
            {isLead ? (<>
              <p>Doorloop de meting per maatregel samen met uw IT-partner. Dan wordt dit rapport een
                gap-analyse met concrete percentages per domein.</p>
              {BRAND_MAILTO && <a className="btn btn-primary btn-sm" href={`mailto:${BRAND_MAILTO}?subject=${encodeURIComponent('NIS2-meting plannen')}`}>Plan de meting <Icon name="arrow" style={{ width: 15, height: 15 }} /></a>}
            </>) : (<>
              <p>De maatregelen-stap is nog niet ingevuld, dus dit rapport toont geen
                percentages. Vul de maatregelen in om de gap-analyse per domein te zien.</p>
              <button className="btn btn-primary btn-sm" onClick={() => go(stepNum('measures'))}>Naar de maatregelen <Icon name="arrow" style={{ width: 15, height: 15 }} /></button>
            </>)}
          </div>
        </>) : (<>
          <div className="rep-score">
            <div className="gauge" style={{ '--p': r.overall }}>
              <div className="in"><b>{r.overall}</b><span>gereed</span></div>
            </div>
            <div className="txt">
              <h3>{verdict} <span className={`tierbadge tone-${tone}`} style={{ marginLeft: 6 }}>{r.overall}% gereed</span></h3>
              <p>Gewogen gereedheid over {r.rows.length} NIS2-domeinen, op basis van uw huidige situatie en het belang van elk domein voor uw risicoprofiel.</p>
              <div className="rep-stats">
                <div className="rep-stat"><div className="v">{r.rows.length}</div><div className="l">Domeinen</div></div>
                <div className="rep-stat"><div className="v">{r.roadmap.reduce((n, row) => n + row.measures.length, 0)}</div><div className="l">Open maatregelen</div></div>
                <div className="rep-stat"><div className="v">{urgentCount}</div><div className="l">{urgentLabel}</div></div>
                {scopeOutcomeMeta && <div className="rep-stat"><div className="v">{scopeShort}</div><div className="l">Cbw-indicatie</div></div>}
              </div>
            </div>
          </div>
          <div className="verdict-legend">Beoordelingsgrenzen: ≥75 goed op weg · 50–74 belangrijke gaps · &lt;50 urgente aandacht</div>
          {measuredCount < totalMeasures && (
            <div className="verdict-legend">Gemeten: {measuredCount} van {totalMeasures} maatregelen. Niet-ingevulde maatregelen tellen als 'We doen het, maar informeel' (50%).</div>
          )}

          <div className="sec-h">Gap per domein: huidig tegenover gewenst</div>
          <div className="bars">
            {r.rows.map((row) => (
              <div className="bar-row" key={row.id}>
                <div className="bt">
                  <Icon name={row.icon} style={{ width: 16, height: 16 }} />
                  <span className="nm">{row.label}</span>
                  <span className={`prio tone-${row.meta.tone}`} style={{ marginLeft: 4 }}>{row.meta.label}</span>
                  <span className="pc">{row.current}% / {row.target}%</span>
                </div>
                <div className="track">
                  <div className="cur" style={{ width: row.current + '%' }}></div>
                  <div className="tgt" style={{ left: `calc(${row.target}% - 1px)` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="legend">
            <span><i style={{ background: 'var(--fg-highlighted)' }}></i>Huidig (voortgang)</span>
            <span><i style={{ background: 'var(--accent)' }}></i>Gewenst (NIS2-doel)</span>
          </div>
        </>)}

        {pkg && (<>
          <div className="sec-h">{pkgCfg.heading || 'Passend dienstenpakket'}</div>
          <div className="pkg-block">
            <p className="pkg-why">
              <Icon name="layers" style={{ width: 16, height: 16, color: 'var(--accent)' }} />
              <span>Scope <b>{scopeOutcomeMeta?.label || 'nog onbekend'}</b>
                {worstTier && <> · zwaarste herstelprofiel <b>{worstTier.label}</b> (RTO {worstTier.rto})</>}
                {' '}→ hier past vermoedelijk <b>{pkg.label}</b>{pkg.sc_ambition ? ` (${pkg.sc_ambition})` : ''} bij</span>
            </p>
            {scOpenTotal > 0 && pkgIdx >= 0 && (() => {
              // Niveau uit de tier zelf, niet uit de positie: een eigen menukaart
              // (MSP_BRAND.packages) mag meer of minder dan drie niveaus hebben.
              const advised = (pkg.sc_ambition || '').match(/SC-([123]0)/)?.[1];
              if (!advised) { return null; }
              const covered = ['10', '20', '30'].filter((l) => l <= advised).reduce((n, l) => n + scLevelCounts[l], 0);
              return (
                <p className="pkg-levels">
                  Van uw <b>{openMeasures}</b> open punten dragen er <b>{scOpenTotal}</b> een SC-niveau
                  {openMeasures > scOpenTotal && <> ({openMeasures - scOpenTotal} volgen rechtstreeks uit de Cbw)</>}:
                  {['10', '20', '30'].filter((l) => scLevelCounts[l]).map((l, i) => (
                    <span key={l}>{i > 0 ? ' · ' : ' '}<b>{i > 0 ? '+' : ''}{scLevelCounts[l]}</b> vanaf SC-{l}</span>
                  ))}.
                  {' '}Bij <b>{pkg.sc_ambition || pkg.label}</b> horen er <b>{covered}</b>
                  {covered < scOpenTotal ? <>; de overige <b>{scOpenTotal - covered}</b> komen pas bij een hoger ambitieniveau in beeld</> : ': alle niveaus'}.
                  {' '}Weeg dit samen met uw IT-partner: het niveau is een startpunt voor het gesprek, geen uitkomst.
                </p>
              );
            })()}
            <div className="pkg-matrix-wrap">
              <table className="pkg-matrix">
                <thead>
                  <tr>
                    <th className="pkg-rowhead">Dienst <span className="pkg-colnote">wettelijk voorschrift</span></th>
                    {pkgTiers.map((t, i) => (
                      <th key={t.id} className={i === pkgIdx ? 'on' : ''}>
                        <span className="pkg-sc">{t.sc_ambition || t.label}</span>
                        <span className="pkg-tiername">{t.label}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                {pkgSections.map((sec) => (
                  <tbody key={sec.id}>
                    <tr className="pkg-sec">
                      <th scope="colgroup">{sec.label}</th>
                      {pkgTiers.map((t, i) => <td key={t.id} className={i === pkgIdx ? 'on' : ''}></td>)}
                    </tr>
                    {sec.lines.map((l) => (
                      <tr key={l.label}>
                        <th scope="row" className="pkg-rowhead">
                          {l.label}
                          <span className="pkg-cbw">{[
                            ...(l.cbw || []).map((code) => `Cbw ${code}`),
                            ...(l.sc || []).map((code) => `SC ${code}`),
                          ].join(' · ')}</span>
                        </th>
                        {pkgTiers.map((t, i) => (
                          <td key={t.id} className={i === pkgIdx ? 'on' : ''} aria-label={i >= l.from ? 'inbegrepen' : 'niet inbegrepen'}>
                            {i >= l.from ? <span className="pkg-dot"></span> : <span className="pkg-no">·</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>
            {pkgCfg.legal_note && <p className="pkg-legal">{pkgCfg.legal_note}</p>}
            {pkg.when && <p className="pkg-when"><b>Wanneer passend:</b> {pkg.when}</p>}
            {pkgCfg.note && <p className="pkg-note">{pkgCfg.note}</p>}
          </div>
        </>)}

        <div style={{ position: 'relative' }}>
          <div className="work-head">
            <div className="sec-h">Wat er moet gebeuren</div>
            <div className="work-count"><b>{openMeasures}</b> maatregelen open
              {openMeasures > 0 && <> — {WORK_ORDER.filter((w) => workCounts[w]).map((w, i) => (
                <span key={w}>{i > 0 ? ' · ' : ''}<b>{workCounts[w]}</b> {WORK_META[w].label.toLowerCase()}</span>
              ))}</>}
            </div>
            <div className="work-legend">
              {WORK_ORDER.map((w) => (
                <span key={w} className={`work-chip wd-${w}`}><i className="wd"></i>{WORK_META[w].label} · {WORK_META[w].owner}</span>
              ))}
            </div>
          </div>
          <div className={`road ${gateOn ? 'blurred' : ''}`}>
            {r.roadmap.length === 0 && <p className="step-sub">Geen openstaande gaps. Sterk uitgangspunt; blijf toetsen en bijwerken.</p>}
            {r.roadmap.map((row) => (
              <div className={`road-card p-${row.meta.tone}`} key={row.id}>
                <div className="rh">
                  <Icon name={row.icon} style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                  <span className="nm">{row.label}</span>
                  {!isLead && <span className="road-status">Huidig: {row.current}% → doel {row.target}%</span>}
                  <span className={`prio tone-${row.meta.tone}`}>{row.meta.label}</span>
                </div>
                <div className="road-measures">
                  {WORK_ORDER.map((w) => {
                    const ms = row.measures.filter((m) => m.work === w);
                    if (!ms.length) { return null; }
                    return (
                      <React.Fragment key={w}>
                        <div className={`rm-group wd-${w}`}><i className="wd"></i>{WORK_META[w].label} · {WORK_META[w].owner} <span className="rm-group-n">({ms.length})</span></div>
                        {ms.map((m) => (
                          <div className="road-measure" key={m.sc_code || m.title}>
                            <span className="rm-title">{m.title}</span>
                            <span className="rm-meta">
                              {m.sc_from && <span className="rm-sc" title={`Vereist vanaf certificeringsniveau SC-${m.sc_from}`}>SC-{m.sc_from}</span>}
                              <span className="rm-ref">{normLabel(m)}</span>
                            </span>
                          </div>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </div>
                {row.norm_note && <div className="norm-note">{row.norm_note}</div>}
              </div>
            ))}
          </div>

          {gateOn && (
            <div className="gate locked">
              <h3>Ontvang het volledige rapport</h3>
              <p>Vul uw e-mailadres in en het volledige rapport verschijnt direct op het scherm: alle maatregelen met normverwijzingen, plus een PDF om te delen. {GATE_OPERATOR} stuurt u het rapport daarna ook per e-mail.</p>
              <form onSubmit={submitGate}>
                <div className="gate-form">
                  <input type="email" required placeholder="naam@bedrijf.nl" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button className="btn btn-primary btn-sm" type="submit" disabled={gateState === 'submitting'}>
                    {gateState === 'submitting' ? 'Versturen…' : 'Stuur mij het rapport'}
                  </button>
                </div>
                {/* Zonder subscriptionTypeId kan de opt-in niet in HubSpot
                    geregistreerd worden; een vinkje dat nergens landt wekt de
                    indruk dat er toestemming ligt. Dan liever niet tonen. */}
                {GATE_CFG.subscriptionTypeId && (
                  <label className="gate-consent">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                    <span>{GATE_CONSENT_TEXT}</span>
                  </label>
                )}
                <p className="gate-privacy">Uw e-mailadres en de rapport-samenvatting worden verwerkt door {GATE_OPERATOR} om u het rapport te sturen (via HubSpot). <a href={GATE_PRIVACY_URL} target="_blank" rel="noopener noreferrer">Privacyverklaring</a></p>
                {gateState === 'error' && (
                  <p className="gate-msg">Versturen lukte niet. Probeer het opnieuw{BRAND_MAILTO ? <>, of mail <a href={`mailto:${BRAND_MAILTO}?subject=NIS2-risicorapport`}>{BRAND_MAILTO}</a>; dan sturen we het rapport toe</> : ', of neem contact op met de aanbieder van deze intake'}.</p>
                )}
              </form>
            </div>
          )}
        </div>

        <div className="sec-h">Meldplicht bij significante incidenten</div>
        <div className="meldplicht-block">
          <p className="mp-lead">
            {scopeInScope && scopeOutcomeMeta
              ? `Omdat uw organisatie vermoedelijk als ${scopeOutcomeMeta.label.charAt(0).toLowerCase()}${scopeOutcomeMeta.label.slice(1)} kwalificeert, geldt voor u de NIS2-meldplicht bij significante incidenten:`
              : 'Valt uw organisatie onder de Cbw, dan geldt de NIS2-meldplicht bij significante incidenten:'}
          </p>
          <div className="meldplicht-timeline">
            {REPORTING_OBLIGATION.phases.map((phase, i) => (
              <div className={`meldplicht-phase ${mpOpen === phase.id ? 'open' : ''}`} key={phase.id}
                {...keyActivatable(() => setMpOpen(mpOpen === phase.id ? null : phase.id))}>
                <div className="mp-head">
                  <span className="mp-n">{i + 1}</span>
                  <span className="mp-deadline">{phase.deadline}</span>
                  <span className="mp-label">{phase.label}</span>
                </div>
                <p className="mp-desc">{phase.description}</p>
                <div className="mp-more">Lees meer +</div>
              </div>
            ))}
          </div>
          <div className="meldplicht-exceptions">
            <span className="mp-exc-title">Uitzonderingen (kortere termijn):</span>
            {REPORTING_OBLIGATION.exceptions.map((exc) => (
              <span className="svc-chip" key={exc.id}><span className="d"></span>{exc.label} · {exc.deadline}</span>
            ))}
          </div>
          <p className="mp-note">{REPORTING_OBLIGATION.significance_note}</p>
          {REPORTING_OBLIGATION.lex_specialis_note && <p className="mp-note">{REPORTING_OBLIGATION.lex_specialis_note}</p>}
          {REPORTING_OBLIGATION.recipients_note && <p className="mp-note">{REPORTING_OBLIGATION.recipients_note}</p>}
          {REPORTING_OBLIGATION.voluntary_note && <p className="mp-note">{REPORTING_OBLIGATION.voluntary_note}</p>}
          <div className="meldplicht-footer">
            <a href={safeUrl(REPORTING_OBLIGATION.portal_url)} target="_blank" rel="noopener noreferrer">Meldpunt: mijn.ncsc.nl →</a>
            <span className="svc-chip" title="Dienst: Meldplicht-ondersteuning (NIS2 / AVG)"><span className="d"></span>Dienst: Meldplicht-ondersteuning</span>
          </div>
        </div>

        {!gateOn && (
          <div className="gate" style={{ textAlign: 'left' }}>
            {submitted && <div className="ok" style={{ marginBottom: 12 }}><Icon name="check" style={{ width: 16, height: 16 }} /> Aanvraag ontvangen. Het volledige rapport staat hieronder{email ? ` en wordt ook per e-mail gestuurd naar ${email}` : ''}.</div>}
            <h3>Klaar om te delen</h3>
            <p>Download het rapport als PDF of bespreek het met uw IT-partner.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm" onClick={() => window.print()}><Icon name="check" style={{ width: 16, height: 16 }} /> Download PDF</button>
              {MODE === 'pro' && <button className="btn btn-outline btn-sm" onClick={saveDossier}>Dossier opslaan</button>}
              {MODE === 'pro' && dossierLoadBtn()}
              <button className="btn btn-outline btn-sm" onClick={resetIntake}>Nieuwe intake</button>
            </div>
            {dossierMsg && <p className="dossier-msg">{dossierMsg}</p>}
          </div>
        )}

        <div className="attribution">
          {/* AI-NOTE: hardcoded fallback — bronvermelding is CC BY-/§7b-plicht en
              mag niet stil verdwijnen als een deploy het attribution-blok uit de
              config sloopt (zie ATTRIBUTION.md). */}
          {/* CC BY 4.0 art. 3(a)(1)(B) vraagt een link naar de licentie waar
              dat redelijkerwijs kan; de URL staat in de normdata zelf. */}
          <p>Bron: {ATTRIBUTION.cbw ? `${ATTRIBUTION.cbw.source}. ${ATTRIBUTION.cbw.license}` : 'Cbw (NIS2) Control Framework v1.2 (2025) — ADR & NOREA, CC BY 4.0 gelicenseerd, bewerkt door Dxfferent B.V.'}
            {safeUrl(ATTRIBUTION.cbw?.license_url) && <> <a href={safeUrl(ATTRIBUTION.cbw.license_url)} target="_blank" rel="noopener noreferrer">Licentievoorwaarden</a></>}</p>
          {/* AI-NOTE: net als de Cbw-regel hierboven hardcoded fallback — de
              SC-bronvermelding is §7b-plicht en mag niet verdwijnen als een
              deploy attribution.sc uit de config sloopt. */}
          <p>Maatregel-titels en normreferenties (ISO/IEC 27001, CIS Controls v8, IEC 62443, NIST SP 800-53) mede ontleend aan de norm {ATTRIBUTION.sc?.source || 'NIS2 Supply Chain'} (voorheen NIS2 Kwaliteitsmerk) van {ATTRIBUTION.sc?.provider || 'Stichting Kwaliteitsinnovatie'} ({ATTRIBUTION.sc?.version || 'V3.2, 15-12-2025'}). Geen certificering; niet verbonden aan Stichting Kwaliteitsinnovatie.</p>
          {/* colofon (art. 3:15d BW): bij white-label vult de MSP zijn eigen
              gegevens — zie docs/MSP-ENABLEMENT.md */}
          {BRAND.legal && <p>{BRAND.legal}</p>}
          <p className="disclaimer">{DISCLAIMER}</p>
        </div>
      </div>
    );
  }

  const bodyByKey = { scope: scopeStep, data: dataStep, impact: impactStep, rtorpo: rtorpoStep, measures: measuresStep, report: reportStep };
  const body = step === 0 ? intro() : bodyByKey[stepKey]();

  // ---------- footer nav ----------
  const canNext = stepKey === 'data' ? selected.length > 0 : true;
  const isLast = stepKey === 'report';
  function footer() {
    if (step === 0) { return null; }
    let nextLabel = 'Volgende';
    if (stepKey === 'scope') { nextLabel = 'Naar datatypes'; }
    if (stepKey === 'data') { nextLabel = `Naar impact (${selected.length})`; }
    if (stepKey === 'impact') { nextLabel = impactIdx < selected.length - 1 ? 'Volgend datatype' : 'Naar herstelprofiel'; }
    if (stepKey === 'rtorpo') { nextLabel = MODE === 'pro' ? 'Naar maatregelen' : 'Bekijk rapport'; }
    if (stepKey === 'measures') { nextLabel = 'Bekijk rapport'; }
    return (
      <div className="footnav">
        <button className="btn-link" onClick={back}>← Terug</button>
        <span className="count">Stap {step} van {ACTIVE_STEPS.length}</span>
        {!isLast
          ? <button className="btn btn-primary btn-sm" onClick={next} disabled={!canNext}>{nextLabel} →</button>
          : <button className="btn btn-outline btn-sm" onClick={() => go(step - 1)}>← Pas antwoorden aan</button>}
      </div>
    );
  }

  return (
    <div className="app">
      {rail()}
      <main className="main">
        <div className="topbar">
          <button className="icon-btn" title="Licht / donker" aria-label={ui.dark ? 'Schakel naar lichte weergave' : 'Schakel naar donkere weergave'} onClick={() => setUi('dark', !ui.dark)}>
            <Icon name={ui.dark ? 'sun' : 'moon'} />
          </button>
        </div>
        {resumed && (
          <div className="resume-banner" role="status">
            <Icon name="recover" style={{ width: 14, height: 14 }} />
            <span>Verdergegaan waar u was.</span>
            <button className="btn-link" onClick={resetIntake}>Opnieuw beginnen</button>
            <button className="resume-dismiss" aria-label="Melding sluiten" onClick={() => setResumed(false)}>×</button>
          </div>
        )}
        <div className="main-inner">{body}</div>
        {footer()}
      </main>
    </div>
  );
}

// Vangnet: een render-crash (bv. door een save/dossier-vorm die de sanitize
// tóch passeert) mag nooit een permanente white-screen-loop worden — wis de
// save en bied een herstart.
class ErrorShield extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { try { localStorage.removeItem(SAVE_KEY); } catch { /* n.v.t. */ } }
  render() {
    if (!this.state.failed) { return this.props.children; }
    return (
      <div className="config-error">
        <h1>Er ging iets mis.</h1>
        <p>De opgeslagen sessie is gewist zodat u opnieuw kunt beginnen.{' '}
          <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>Opnieuw laden</button></p>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<ErrorShield><App /></ErrorShield>);
}).catch((err) => {
  console.error('NIS2 intake-config kon niet geladen worden:', err);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '<div class="config-error"><h1>Configuratie kon niet geladen worden.</h1>'
      + '<p>De intake kan niet starten zonder <code>intake-config.json</code>. Ververs de pagina '
      + 'of neem contact op met de beheerder.</p></div>';
  }
});
