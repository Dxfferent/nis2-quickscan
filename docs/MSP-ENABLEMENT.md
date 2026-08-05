# MSP-enablement — NIS2 Quickscan white-label

De tool is white-label inzetbaar door elke MSP-partner: eigen naam, kleur,
mailbox en leadflow, met één config-blok en zonder rebuild.

## Snel starten (MSP-deploy)

1. Draai `npm install && npm run build` → `dist/` is de complete site. Zonder
   ontwikkelomgeving: download de kant-en-klare zip van de laatste release
   (zie [HOSTING.md](HOSTING.md)); het brand-blok gaat dan in de `index.html`
   uit de zip.
2. Zet in `dist/index.html` het brand-blok (of laat Dxfferent dit doen):

```html
<script>
window.MSP_BRAND = {
  name: 'Acme IT',                 // naam in de rail + rapportkop
  logo: '/acme-logo.svg',          // eigen logo in de rail (URL of data-URI)
  accent: '#0d9488',               // merk-accentkleur (hex)
  theme: 'dark',                   // start-thema: 'dark' of 'light'
  tokens: {                        // optioneel: vrije CSS-token-overrides
    '--bg-canvas': '#0b1220',      //   (elke --token uit tokens.css /
    '--font-sans': 'Inter, sans-serif', //  dxfferent-theme.css kan hier)
  },
  mode: 'lead',                    // deploy-default: 'lead' of 'pro' (querystring wint)
  mailto: 'security@acme-it.example',   // contactadres in de gate-fallbacks
  supportMailto: 'support@acme-it.example', // optioneel: uw eigen supportkanaal in de rail
  legal: 'Acme IT B.V. · KvK 12345678 · Straat 1, 1234 AB Plaats', // colofon (art. 3:15d BW)
  privacyUrl: 'https://acme-it.example/privacy', // VERPLICHT voor de gate: uw privacyverklaring
  hubspot: {                       // eigen leadflow: leads landen bij de MSP
    portalId: '12345678',
    formId: 'abcd-…',
    subscriptionTypeId: 123,       // optioneel: HubSpot-subscription voor de NIS2-updates-opt-in
  },
  packages: { tiers: [], lines: [] }, // uw eigen menukaart — zie 'Pakket-suggestie' hieronder
};
</script>
```

3. Host `dist/` statisch (elke webserver/CDN; `.htaccess` + `_headers` met de
   cache-regel en de security-headers zitten in de build; draait u nginx, zie
   [HOSTING.md](HOSTING.md)).

### Controleer vóór u live gaat

- [ ] `MSP_BRAND.name` is ingevuld. Zonder die sleutel toont de rail de
      placeholder **`[Uw MSP]`**, ook in de rapportkop en dus in de PDF.
- [ ] `MSP_BRAND.legal` gevuld (colofon, art. 3:15d BW).
- [ ] Draait u de lead-gate? Dan zijn `privacyUrl` én de HubSpot-ids gezet.
      Ontbreekt er één, dan verschijnt er bewust géén gate; zie
      *Privacy (AVG)* hieronder.
- [ ] Logo laadt (URL of data-URI); andere schema's worden genegeerd.
- [ ] Gate aan? Test hem dan één keer end-to-end met een eigen e-mailadres.
      De gate belooft "u ontvangt het rapport per e-mail" — die mail verstuurt
      HubSpot niet vanzelf, dat is úw follow-up-workflow (zie *CRM-veld*
      hieronder). Ga pas live als die testmail echt aankomt.

## Valt u als MSP zélf onder de Cbw?

Vaak wel, als u ICT-omgevingen van klanten beheert. En dat is een
verkoopargument, geen bedreiging. "Beheer van ICT-diensten
(business-to-business)", waaronder MSP's en MSSP's, staat in **bijlage 1**
van de wet (sector met hoge kriticiteit).

"Aanbieder van beheerde diensten" is in de wet afgebakend (NIS2 art. 6 lid
39): u installeert, beheert, exploiteert of onderhoudt ICT-producten,
-netwerken, -infrastructuur of -toepassingen van klanten, op locatie of op
afstand. Een softwareleverancier of reseller zonder beheer valt daar niet
onder.

Drie uitkomsten:

| Uw omvang | Uitkomst |
|---|---|
| Groot (≥ 250 FTE, óf omzet > € 50 mln én balans > € 43 mln) | **Essentiële entiteit** — zwaarste regime |
| Middelgroot (≥ 50 FTE, óf omzet > € 10 mln én balans > € 10 mln, en onder de groot-drempels) | **Belangrijke entiteit** — zorgplicht, meldplicht en registratieplicht |
| Kleiner | Niet rechtstreeks onder de wet. Maar uw in-scope klanten leggen de eisen **contractueel** bij u neer (art. 21: ketenborging), en u kunt alsnog individueel aangewezen worden |

Tel bij de omvang ook moeder-, dochter- en partnerondernemingen mee
(verbonden ondernemingen volledig, partnerondernemingen naar rato; bijlage
bij Aanbeveling 2003/361/EG).

Doorloop de intake dus óók één keer voor uw eigen organisatie (`?mode=pro`).
Een MSP die zelf aantoonbaar aan de Cbw voldoet, voert het klantgesprek uit
ervaring. Ook voor uw eigen classificatie geldt: de wettekst is bepalend, en de
RDI-zelfevaluatie is het officiële hulpmiddel om die classificatie vast te
stellen.

## Twee standen: lead en pro

| | `mode=lead` (default) | `mode=pro` |
|---|---|---|
| Inzet | leadmagnet op uw site | intern gereedschap consultants |
| Stappen | 5 (maatregelen niet invullen) | 6 (volledige volwassenheidsmeting) |
| Gate | aan (indien geconfigureerd) | nooit |
| Dossier | — | opslaan/laden als `.json` |

- Kiezen kan per link (`index.html?mode=lead` / `?mode=pro`) of als
  deploy-default via `MSP_BRAND.mode: 'lead' | 'pro'`. De querystring wint.
- Beide standen bewaren voortgang automatisch in localStorage van het
  apparaat; "Nieuwe intake" of "Opnieuw beginnen" wist die.
- **Dossier (pro):** "Dossier opslaan" op de rapportstap downloadt de
  volledige intake-staat als `nis2-dossier-<datum>.json`; "Dossier laden"
  (op intro én rapportstap) zet hem terug. Bewaar per klant: bij de volgende
  QBR laadt u het dossier en meet u opnieuw.

## Ambitieniveau en menukaart

Het rapport sluit af met een **matrix**: dienstregels × de drie SC-niveaus, met
een bolletje waar de dienst in dat niveau zit en het geadviseerde niveau
uitgelicht. De keuze is deterministisch: essentiële entiteit of een kritiek
herstelprofiel komt op SC-30 uit, belangrijke entiteit of een hoog profiel op
SC-20, de rest op SC-10. **Er is geen 'geen keurmerk'-uitkomst**: een niveau
waar u niet naartoe stuurt, is geen bestemming.

Elke dienstregel draagt het Cbw-artikel dat ze raakt, zodat de menukaart
zichtbaar in de wet verankerd is en niet overkomt als een los verkoopblok.
Regels zonder Cbw-pendant tonen `SC`: dat zijn eisen van het SC-schema
zonder rechtstreeks wetsartikel.

Default staan drie generieke niveaus in `assets/intake-config.json`
(`package_suggestion`). Zet `MSP_BRAND.packages` om die te vervangen door uw
eigen menukaart. Geef `tiers` **oplopend in zwaarte** (de trap kiest op
positie, niet op naam) en `lines` in de volgorde waarin u ze wilt tonen:

```js
packages: {
  tiers: [
    {
      id: 'sc10',
      label: 'Basis op orde',          // uw pakketnaam, onder de SC-kop
      sc_ambition: 'SC-10 Basic',      // kolomkop
      when: 'Wanneer dit niveau passend is, in één zin.',
    },
    /* … SC-20 en SC-30 … */
  ],
  sections: [
    { id: 'workplace', label: 'Werkplekken en e-mail' },
    { id: 'ot', label: 'Productie- en OT-systemen', requires: 'ot' },
  ],
  lines: [
    { label: 'Beheer van werkplekken', section: 'workplace', from: 0,
      cbw: ['21.3.e'], sc: ['4.1'] },
    { label: 'Overzicht van OT-systemen', section: 'ot', from: 1,
      cbw: [], sc: ['5.1', '5.11'] },
  ],
}
```

- `from` is de **index** van het laagste niveau waarin de dienst zit; alles
  daarboven erft hem (cumulatieve trap). Voor regels mét `sc`-codes is `from`
  **norm-gedreven**: het laagste `sc_from`-vanaf-niveau van die codes in de
  normdata (een smoke-assert bewaakt dat). Alleen regels zonder `sc`-codes
  (Cbw-only) kiezen hun `from` zelf.
- `sections` groepeert de regels naar wat een MSP beheert (werkplekken,
  servers, netwerk, beleid, ontwikkeling, OT …). Een sectie met `requires`
  verschijnt **alleen als de klant dat datatype selecteerde**: OT-diensten
  blijven weg bij een administratiekantoor, ontwikkeldiensten bij een klant
  zonder eigen software. Lege secties vallen automatisch weg.
- `cbw` en `sc` zijn de normverwijzingen die de dienst raakt; elke regel draagt
  er minstens één. Gebruik alleen codes die in de normdata bestaan; een
  smoke-assert bewaakt dat, zodat de menukaart geen tweede waarheid wordt die
  uit de pas loopt.
- `sc_ambition` is **alleen een ambitie-indicatie** met de publieke
  niveaunamen van NIS2 Supply Chain (SC-10 Basic / SC-20 Substantial /
  SC-30 High). De normdata draagt per maatregel wél een vanaf-niveau
  (`sc_from`, opgenomen met schriftelijke toestemming van Stichting
  Kwaliteitsinnovatie — zie ATTRIBUTION.md); de volledige
  toepasselijkheidsmatrix en doelteksten blijven auditmateriaal van het
  SC-schema en horen niet in een publieke deploy.
- **Lever `tiers` én `lines` altijd samen aan.** De override telt alleen als
  beide arrays aanwezig zijn; ontbreekt er één, dan wordt het hele
  `packages`-blok genegeerd en toont de tool de menukaart uit
  `assets/intake-config.json`, zonder foutmelding.
- Minder dan drie niveaus mag: de trap kiest dan het zwaarste beschikbare.
  Een lege `tiers` laat de hele kaart verdwijnen.
- Houd de regels **functioneel en vendorneutraal** ("Bewaking en respons rond
  de klok", niet de productnaam uit uw catalogus): de klant leest de kaart, u
  vertaalt hem in het gesprek naar uw eigen dienstnamen.
- De regels onder de kaart komen uit `package_suggestion.legal_note` (de
  NIS2/Cbw-verankering) en `package_suggestion.note` (de disclaimer).

## CRM-veld `nis2_rapport` (aanbevolen)

De gate-submit stuurt naast het e-mailadres een compacte rapport-payload
(JSON-string: scope-uitkomst, totaalscore, per-domein score, RTO/RPO-
profielen, top-gaps) naar het veld `nis2_rapport`. Maak in HubSpot een
**multi-line text contact-property `nis2_rapport`** aan en voeg het als
(hidden) veld toe aan het form. Dan landt de diagnose bij de lead in uw
CRM.

De skill [`skills/nis2-crm-koppeling/`](../skills/nis2-crm-koppeling/) loopt
de hele koppeling met u door: form, property, rapportmail-workflow en de
end-to-end-test, inclusief de routes voor MSP's zonder HubSpot.

**Form-vereisten** (de tool submit via de HubSpot Forms API v3):

- het form bevat minimaal de velden `email` en `message`;
- reCAPTCHA staat **uit** op dit form (de API weigert reCAPTCHA-forms);
- `nis2_rapport` is optioneel: ontbreekt alleen dát veld, dan herhaalt de
  tool de submit automatisch zonder rapportveld. Ontbreken `email`/`message`
  of staat reCAPTCHA aan, dan faalt de submit en ziet de bezoeker de
  mailto-fallback. Test het form dus één keer end-to-end na aanmaak.

## Gedrag

- **De gate eist `name` én `privacyUrl`.** Wie een gate draait verzamelt
  persoonsgegevens en moet zich identificeren en naar zijn eigen
  privacyverklaring wijzen (art. 13 AVG). Ontbreekt een van beide, dan
  verschijnt er géén gate en blijft het rapport gewoon zichtbaar. Dat geldt voor
  elke deployer, ook voor die van Dxfferent zelf: de tool kent hier geen
  ingebouwde uitzondering en geen Dxfferent-fallback.
- `MSP_BRAND.hubspot` gezet → gate staat aan en submit gaat naar de
  HubSpot-forms van de MSP (rapportlevering zonder checkbox — de actieve
  aanvraag geldt als toestemming, de NIS2-updates-opt-in blijft een aparte
  checkbox; de PDF-mail is een HubSpot-workflow aan MSP-kant).
- Geen `hubspot` → gate volgt `window.HUBSPOT_GATE` (Dxfferent-default);
  zonder ingevulde ids verschijnt er **geen gate** en is het rapport direct
  volledig zichtbaar: de gate belooft nooit verzending die niet bestaat.
- Het demo-paneel (naam/kleur live proeven) zit alleen in de review-variant
  (`review/nis2-quickscan-review.html`, bewust buiten `dist/` zodat u het niet
  per ongeluk meehost),
  niet in de publieke build; `MSP_BRAND` is de deploy-waarheid.

## Privacy (AVG) — verplicht bij de lead-stand

Bij een deploy met eigen HubSpot bent **u (de MSP) verwerkingsverantwoordelijke**
voor de leaddata; Dxfferent ontvangt bij uw deploy geen leaddata (de browser
stuurt direct naar uw portal). Concreet:

1. Zet `MSP_BRAND.privacyUrl` naar uw eigen privacyverklaring. Zonder die
   link hoort de gate niet live. Vermeld daarin: uw entiteit +
   contactgegevens, doel (rapportlevering; optioneel NIS2-updates), HubSpot
   als verwerker incl. EU-VS-doorgifte onder het Data Privacy Framework, het
   veld `nis2_rapport` (rapport-samenvatting gekoppeld aan het e-mailadres),
   bewaartermijn en de AVG-rechten incl. intrekken toestemming. Startpunt:
   [docs/PRIVACY-TEMPLATE.md](PRIVACY-TEMPLATE.md).
2. Accepteer de HubSpot-verwerkersovereenkomst (legal.hubspot.com/dpa) op uw
   eigen account.
3. NIS2-updates alleen aan leads die de optionele opt-in aanvinkten
   (koppel `hubspot.subscriptionTypeId` aan het juiste subscription-type in
   uw portal).
4. **Colofon:** bij een white-label-deploy bent ú de dienstverlener — zet uw
   eigen bedrijfsnaam, KvK-nummer, btw-id en adres in de footer van de
   pagina waarop u de tool aanbiedt (art. 3:15d BW).

## Wat níet configureerbaar is (voorwaarden white-label-gebruik)

Vier elementen zitten bewust buiten `MSP_BRAND` en blijven in elke variant staan
(zie `ATTRIBUTION.md`):

1. **Attributie-footer** (ADR/NOREA + NIS2 Supply Chain) — licentievoorwaarde
   bronvermelding van de normdata.
2. **"powered by Dxfferent"** + het supportkanaal (`hallo@dxfferent.nl`) in de
   rail — dat is het partnermodel: de MSP vangt de leads; Dxfferent biedt
   daarnaast support, white-label-hulp en normdata-updates aan als
   vrijblijvende service, zonder gegarandeerde termijnen.
3. **Disclaimer** in het rapport (print mee in de PDF): gratis hulpmiddel,
   uitkomsten indicatief o.b.v. de vermelde normdata-versie, geen garantie,
   aansprakelijkheid uitgesloten behoudens opzet of bewuste roekeloosheid,
   eigen controle tegen de officiële bronnen verplicht, geen juridisch
   advies.
4. **Broncode-link** in de rail — dit is geen naamsvermelding maar de
   verplichting uit **AGPL-3.0 §13**: een tool die u via een netwerk aanbiedt,
   moet de gebruiker de bijbehorende broncode aanbieden. Draait u de tool
   ongewijzigd met alleen een `MSP_BRAND`-config, dan mag de link naar
   Dxfferent blijven staan. **Wijzigt u de code, dan moet `SOURCE_URL` in
   `assets/wizard-app.jsx` naar úw eigen publieke bron wijzen** — de link naar
   ons dekt uw versie niet.

## Verantwoordelijkheden

| Wie | Wat |
|-----|-----|
| MSP | hosting/subdomein, HubSpot-form + follow-up-workflow, opvolging van leads, eigen privacyverklaring + colofon |
| Dxfferent | tool-updates, normdata-onderhoud (config-regen bij wetswijziging) en support — vrijblijvend, zonder gegarandeerde termijnen |

Normdata komt uit `assets/intake-config.json`. Bij een nieuwe versie volstaat
een config-swap (de no-cache-regel zit in de build); een rebuild is niet nodig.
