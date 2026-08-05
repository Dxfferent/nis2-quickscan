# Bijdragen

Welkom! Zo werkt het:

1. Fork de repo, maak een branch (`feature/…` of `fix/…`).
2. Test lokaal: `node tests/engine-smoke.mjs` (moet groen) en `npm run build`
   (moet slagen, `dist/` zonder JS/CSS van CDN's; fonts zijn lokaal
   meegeleverd onder `assets/fonts/`).
3. Open een PR met een korte beschrijving van wat + waarom.

## Spelregels

- **Normdata** (`assets/intake-config.json`) wordt gegenereerd uit de
  officiële bronnen — inhoudelijke correcties graag als issue met
  bronverwijzing (artikel/paragraaf), niet als handmatige JSON-edit.
- De attributie-footer, de *powered by Dxfferent*-vermelding en de disclaimer
  zijn geen onderwerp van PR's (zie ATTRIBUTION.md).
- Geen nieuwe dependencies zonder issue vooraf; de tool is bewust een
  statische site zonder backend.
- Taal van de tool is Nederlands (doelgroep: Nederlandse organisaties onder
  de Cyberbeveiligingswet).

## Licentie van bijdragen (CLA)

Bijdragen vallen onder de AGPL-3.0-only van deze repo.
Bij je eerste PR vraagt de CLA-check je eenmalig onze korte Contributor
License Agreement ([CLA.md](CLA.md)) te accepteren; die geeft Dxfferent
B.V. het recht je bijdrage ook onder andere voorwaarden te licenseren
(bijv. partner- en commerciële overeenkomsten) — het auteursrecht blijft
van jou.

Vragen: hallo@dxfferent.nl of open een issue.
