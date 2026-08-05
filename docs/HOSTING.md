# Hosting — NIS2 Quickscan

## Zonder Node: download de kant-en-klare site

Wie geen ontwikkelomgeving heeft, hoeft niets te bouwen. Elke release draagt een
`nis2-quickscan-vX.Y.Z.zip` met de complete site (±600 KB, 22 bestanden):

1. Download de zip van de **releases**-pagina en pak hem uit.
2. Open `index.html` in een teksteditor en zet het `window.MSP_BRAND`-blok erin
   (naam, logo, kleur, colofon) — zie [MSP-ENABLEMENT.md](MSP-ENABLEMENT.md).
3. Upload alle bestanden naar de map die uw webadres bedient (vaak
   `public_html/` of `www/`).

> **Dubbelklikken op `index.html` werkt niet.** De tool laadt zijn normdata met
> een netwerkverzoek, en een browser blokkeert dat vanaf de harde schijf; u
> krijgt dan een configuratiefout-scherm. Via uw hosting werkt het wel.

Liever begeleiding? De skill `skills/nis2-installatie/` loopt deze stappen in
Claude met u door, inclusief de AVG-vereisten als u de lead-gate aanzet.

## Build

```
npm install
npm run build      # → dist/ (statisch, self-contained, geen CDN)
```

`dist/index.html` is de publieke entry. De build gebruikt production-React uit
node_modules (vendored naar `dist/vendor/`) en zet de lead-gate aan
(`enabled: true`); de dev-variant (`index.html` in de repo-root via Babel/unpkg)
blijft ongewijzigd met gate uit.

## HubSpot-ids invullen (geen rebuild nodig)

In `dist/index.html` (of op de server):

```js
window.HUBSPOT_GATE = { enabled: true, portalId: '<portal>', formId: '<form>' };
```

Ids uit HubSpot > Marketing > Forms. **De gate verschijnt alleen als naast de
ids ook `MSP_BRAND.name` en `MSP_BRAND.privacyUrl` gezet zijn** — wie
persoonsgegevens verzamelt moet zich identificeren en naar zijn eigen
privacyverklaring wijzen. Ontbreekt een van die gegevens, dan blijft het rapport
zichtbaar zonder gate: geen valse "verstuurd"-melding en geen link naar de
privacyverklaring van een andere partij.
De daadwerkelijke PDF-mail is een HubSpot-workflow op dat formulier.

## Nginx (eigen subdomein)

```nginx
server {
    server_name nis2-check.example.nl;  # subdomein t.b.d.
    root /var/www/nis2-intake/dist;
    index index.html;

    add_header Content-Security-Policy "frame-ancestors 'self'" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    location /assets/intake-config.json {
        add_header Cache-Control "no-cache" always;
    }
    location / { try_files $uri $uri/ =404; }
}
```

`intake-config.json` no-cache: de config is bedoeld om bij een normupdate als
los bestand vervangen te worden, dus hij moet altijd gerevalideerd worden —
en `no-cache` levert dan een 304 in plaats van de volle ~105 KB opnieuw.
Gebruik dus geen `no-store`.

## Security headers

De build genereert deze headers al voor twee hostvarianten: `dist/.htaccess`
(Apache/SiteGround) en `dist/_headers` (Cloudflare Pages). Draait u nginx, neem
dan het blok hierboven over — nginx leest geen van beide bestanden.

`frame-ancestors 'self'` is er voor de lead-gate: die vraagt een e-mailadres, en
zonder deze header kan elke derde de pagina in een iframe zetten en de gate
overklikken. De tool is een zelfstandige pagina, geen widget — framen door een
derde heeft geen legitiem gebruik.

Bewust géén volledige `Content-Security-Policy`: `index.html` draagt een inline
script (de HubSpot-ids, zodat u ze server-side kunt invullen zonder rebuild) en
de brand-tokens zetten inline styles. Een werkende CSP zou dus hoe dan ook
`'unsafe-inline'` bevatten — nauwelijks winst, en een reëel risico dat een
white-label-fork stilletjes breekt op zijn eigen leadflow.

## Querystring

| URL | Gedrag |
|-----|--------|
| `index.html` of `?mode=lead` | lead-stand: 5 stappen, rapport achter de gate |
| `?mode=pro` | pro-stand: 6 stappen, nooit een gate, dossier save/load |

De landingspagina (`landing.html`) linkt de publieks-CTA's naar `?mode=lead`
en de consultant-CTA naar `?mode=pro`. Deploy-default zonder querystring is
instelbaar via `MSP_BRAND.mode` (zie MSP-ENABLEMENT.md).

## Gedrag

- Publieke build: gate aan op het rapport (het maatregelenoverzicht is vervaagd tot het e-mailadres is ingevuld).
- `?mode=pro`: nooit een gate.
- De lead-gate is een conversiedrempel, geen beveiliging: de vergrendeling is
  visueel en de pro-stand (`?mode=pro`) toont het rapport altijd.
- Attributie-footer (ADR/NOREA-licentieplicht + Stichting Kwaliteitsinnovatie)
  staat onderaan het rapport en print mee in de PDF.
