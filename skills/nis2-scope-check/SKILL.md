---
name: nis2-scope-check
description: Bepaal of een organisatie onder de Cyberbeveiligingswet (NIS2) valt en of ze essentieel of belangrijk is. Gebruik bij vragen als "valt mijn klant onder NIS2/Cbw", "zijn wij essentieel of belangrijk", scope-checks in klantgesprekken, of het voorbereiden van een registratie.
---

# Cbw-scope-check

Je helpt een MSP (of diens klant) de Cbw-scope te bepalen. Je geeft een
onderbouwde **indicatie** — bepalend is de wettekst (Cbw/Cbb), en de
RDI-zelfevaluatie op regelhulpenvoorbedrijven.nl/NIS-2-NL is het officiële
hulpmiddel om de classificatie vast te stellen; verwijs daar altijd naar.

## Beslislogica (in deze volgorde)

1. **Van-rechtswege-categorieën eerst** — deze zijn in scope ongeacht omvang:
   - Aanbieders openbare elektronische communicatienetwerken/-diensten
     (middelgroot+: essentieel; klein/micro: belangrijk)
   - Gekwalificeerde vertrouwensdiensten (essentieel); niet-gekwalificeerde:
     groot → essentieel, anders belangrijk
   - TLD-registers en DNS-dienstverleners (essentieel)
   - Wwke-kritieke entiteiten → altijd essentieel
   - Overheidsorganisaties (Rijk/ZBO/provincie/gemeente/waterschap; uitzonderingen:
     Defensie, inlichtingendiensten, politie, OM, rechterlijke macht, Staten-Generaal, DNB)
   - Domeinnaamregistratie-dienstverleners: registratie-/informatieplicht, geen volledige classificatie
2. **Sector**: bijlage 1 (o.a. energie, vervoer, bankwezen, zorg, drinkwater,
   digitale infrastructuur, **beheer van ICT-diensten b2b — MSP's/MSSP's zelf!**,
   overheid, ruimtevaart) of bijlage 2 (o.a. post, afval, chemie, voedsel,
   fabricage, digitale aanbieders, onderzoek).
3. **Size-cap**: middelgroot = ≥50 fte óf (>€10 mln omzet én >€10 mln balans);
   groot = ≥250 fte óf (>€50 mln omzet én >€43 mln balans).
   Bijlage 1 + groot → essentieel. Overig in-sector + middelgroot+ → belangrijk.
   Klein/micro → waarschijnlijk buiten scope, tenzij een van-rechtswege-categorie
   of aanwijzing geldt (enige aanbieder, openbare veiligheid, systeemrisico).
   Tel verbonden ondernemingen volledig mee en partnerondernemingen naar rato
   (bijlage bij Aanbeveling 2003/361/EG): een kleine dochter van een groot
   concern telt zelden als klein.
4. **Jurisdictie**: de hoofdvestigingsregel — het land van het
   beslissingscentrum bepaalt welke lidstaat bevoegd is — geldt alleen voor de
   digitale categorieën (DNS, TLD, cloud, datacenters, CDN, beheerde diensten,
   onlineplatforms en sociale netwerken). Voor alle overige sectoren telt het
   land van vestiging: wie in Nederland gevestigd is valt onder de Cbw, ook met
   een buitenlands moederbedrijf. Benoem dit expliciet bij twijfel.

## Output-vorm

Geef altijd: (a) indicatie essentieel/belangrijk/indirect-geraakt-via-de-keten/
waarschijnlijk-buiten-scope,
(b) de doorslaggevende regel(s), (c) de vervolgstap: RDI-zelfevaluatie doen en
bij in-scope registreren via mijn.ncsc.nl, (d) het voorbehoud dat dit geen
juridisch advies is. Bij buiten-scope: wijs op vrijwillige basishygiëne en op
ketendruk (in-scope klanten stellen eisen aan hun leveranciers).

---

<!-- SPDX-License-Identifier: AGPL-3.0-only -->
*Onderdeel van de NIS2 Quickscan — © 2026 Dxfferent B.V., AGPL-3.0-only
([broncode](https://github.com/Dxfferent/nis2-quickscan)). Normbasis:
ADR & NOREA, Cbw (NIS2) Control Framework (2025), CC BY 4.0 gelicenseerd —
bewerkt door Dxfferent B.V.; maatregel-titels en codes uit NIS2 Supply Chain
(Stichting Kwaliteitsinnovatie). Dxfferent is niet verbonden aan, gecertificeerd
door of goedgekeurd door Stichting Kwaliteitsinnovatie. Uitkomsten zijn
indicatief en vormen geen juridisch advies.*
