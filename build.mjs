// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Dxfferent B.V.
// Onderdeel van NIS2 Quickscan. Gelicenseerd onder de GNU AGPL v3.0 (zie LICENSE).
// Aanvullende voorwaarden onder AGPL-3.0 §7 van toepassing: zie ATTRIBUTION.md,
// sectie 'Licentie & aanvullende voorwaarden'.
// Productie-build (esbuild-transform, geen
// Vite — de app is bewust global-script-architectuur, geen ESM). Output:
// dist/ = statisch hostbaar, production React uit node_modules, geen CDN.
import { transform } from 'esbuild';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const GATE_DEV_DEFAULT = 'enabled: false';
const JSX_FILES = ['assets/nis2-data.jsx', 'assets/wizard-app.jsx'];
const COPY_FILES = ['assets/tokens.css', 'assets/wizard.css', 'assets/dxfferent-theme.css', 'assets/intake-config.json'];
const COPY_DIRS = ['assets/fonts'];
// De UMD-bundels dragen alleen een copyrightregel die naar een LICENSE-bestand
// verwijst; MIT eist dat de permission notice zelf meegeleverd wordt. Die
// LICENSE-bestanden reizen daarom mee naar dist/vendor/.
const VENDOR = [
  ['node_modules/react/umd/react.production.min.js', 'dist/vendor/react.production.min.js'],
  ['node_modules/react-dom/umd/react-dom.production.min.js', 'dist/vendor/react-dom.production.min.js'],
  ['node_modules/react/LICENSE', 'dist/vendor/react-LICENSE.txt'],
  ['node_modules/react-dom/LICENSE', 'dist/vendor/react-dom-LICENSE.txt'],
];

await rm('dist', { recursive: true, force: true });
await mkdir('dist/assets', { recursive: true });
await mkdir('dist/vendor', { recursive: true });

for (const file of JSX_FILES) {
  const src = await readFile(file, 'utf8');
  const { code } = await transform(src, { loader: 'jsx', jsx: 'transform', minify: true, target: 'es2020',
    banner: '/* SPDX-License-Identifier: AGPL-3.0-only — (C) 2026 Dxfferent B.V. Zie LICENSE + ATTRIBUTION.md (AGPL-3.0 §7-voorwaarden). */' });
  await writeFile(`dist/${file.replace(/\.jsx$/, '.js')}`, code);
}

for (const file of COPY_FILES) { await cp(file, `dist/${file}`); }
for (const dir of COPY_DIRS) { await cp(dir, `dist/${dir}`, { recursive: true }); }
for (const [from, to] of VENDOR) { await cp(from, to); }

await cp('landing.html', 'dist/landing.html');

let html = await readFile('index.html', 'utf8');
// De gate-flip hieronder is een string-replace: gaat de dev-default in
// index.html op de schop, dan shipt de build stil zónder lead-gate.
if (!html.includes(GATE_DEV_DEFAULT)) { throw new Error(`index.html mist "${GATE_DEV_DEFAULT}" — de build kan de lead-gate niet aanzetten`); }
html = html
  .replace(/<script src="https:\/\/unpkg\.com\/react@[^"]+"[^>]*><\/script>/, '<script src="vendor/react.production.min.js"></script>')
  .replace(/<script src="https:\/\/unpkg\.com\/react-dom@[^"]+"[^>]*><\/script>/, '<script src="vendor/react-dom.production.min.js"></script>')
  .replace(/<script src="https:\/\/unpkg\.com\/@babel\/standalone[^"]+"[^>]*><\/script>\s*/, '')
  .replace(/<script type="text\/babel" src="([^"]+)\.jsx"><\/script>/g, '<script src="$1.js"></script>')
  .replace(GATE_DEV_DEFAULT, 'enabled: true');
if (html.includes('unpkg') || html.includes('text/babel')) { throw new Error('dist/index.html bevat nog dev-referenties'); }
await writeFile('dist/index.html', html);

// Config wordt als file geswapt bij regen — altijd revalideren (no-cache geeft
// een 304 i.p.v. de volle 105 KB opnieuw; no-store deed dat laatste). Beide
// hostvarianten: .htaccess (Apache/SiteGround) + _headers (Cloudflare Pages).
//
// frame-ancestors 'self': de lead-gate vraagt een e-mailadres, dus de pagina
// mag niet door een derde geframed worden (clickjacking). De tool is een
// zelfstandige pagina, geen widget: framen door een derde heeft geen legitiem
// gebruik. Bewust géén volledige CSP: index.html draagt een
// inline script (de HubSpot-ids, server-side invulbaar zonder rebuild) en de
// brand-tokens zetten inline styles, dus een werkende CSP zou hoe dan ook
// 'unsafe-inline' bevatten — en een MSP-fork breken op zijn eigen leadflow.
await writeFile('dist/.htaccess', `<IfModule mod_headers.c>
  Header always set Content-Security-Policy "frame-ancestors 'self'"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  <Files "intake-config.json">
    Header set Cache-Control "no-cache"
  </Files>
</IfModule>
`);
await writeFile('dist/_headers', `/*
  Content-Security-Policy: frame-ancestors 'self'
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/assets/intake-config.json
  Cache-Control: no-cache
`);

// Single-file review-variant: alles inline, config als window.__NIS2_CONFIG —
// deelbaar als losse file of claude.ai-artifact (artifact levert zelf het
// doctype/head/body-skelet, dus alleen fragment). Landt BUITEN dist/: het is
// een intern reviewbestand, geen hostbare site.
const esc = (s) => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const inline = async (p) => esc(await readFile(p, 'utf8'));
// Single-file variant heeft geen assets/fonts-pad: @font-face eruit — alle
// families vallen terug op de systeem-fallbacks uit de token-stacks.
const themeCss = (await readFile('assets/dxfferent-theme.css', 'utf8'))
  .replace(/@font-face \{[^}]*\}\n/g, '');
// charset eerst: zonder declaratie valt een lokaal geopende file terug op de
// systeem-codepage (Windows-1252) en wordt alle UTF-8 mojibake.
const review = `<meta charset="utf-8">
<title>NIS2 Quickscan</title>
<style>
${await readFile('assets/tokens.css', 'utf8')}
${await readFile('assets/wizard.css', 'utf8')}
${themeCss}
</style>
<div id="root"></div>
<script>
window.HUBSPOT_GATE = { enabled: false, portalId: '', formId: '' };
window.__NIS2_CONFIG = ${esc(await readFile('assets/intake-config.json', 'utf8'))};
</script>
<!--
React en React-DOM 18.3.1 zijn hieronder ingesloten onder de MIT-licentie.
${await inline('node_modules/react/LICENSE')}
-->
<script>${await inline('node_modules/react/umd/react.production.min.js')}</script>
<script>${await inline('node_modules/react-dom/umd/react-dom.production.min.js')}</script>
<script>${await inline('dist/assets/nis2-data.js')}</script>
<script>${await inline('dist/assets/wizard-app.js')}</script>
`;
await mkdir('review', { recursive: true });
await writeFile('review/nis2-quickscan-review.html', review);

console.log('Build klaar: dist/ (hostbaar) + review/nis2-quickscan-review.html (intern, niet hosten)');
