# Queens

Ett Queens-pussel för mobil och webbläsare med förgenererade banor (6x6 till 9x9).

Regler: placera en dam per rad, kolumn och färgområde. Inga damer får röra varandra, inte heller diagonalt.

## Spela

Den publicerade versionen byggs och läggs ut av GitHub Actions (se Publicering). För att spela lokalt: kör `node scripts/build-page.js` och öppna sedan `index.html` i en webbläsare. Banorna ligger inbäddade i sidan.

### Installera som app (PWA)

Spelet är en PWA. Publicerat över https (t.ex. GitHub Pages) kan det installeras på hemskärmen och spelas helt offline:

- Android/Chrome: menyn → Installera app.
- iPhone/Safari: Dela → Lägg till på hemskärmen.

En service worker förcachar sidan, ikonerna och typsnitten vid första besöket. När en ny version publiceras hämtas den i bakgrunden och används från nästa start. Service workers kräver http(s), så öppnad direkt från disk (`file://`) fungerar sidan som vanligt men utan offline-stöd och installation. Lokalt: `npx http-server .`

- Tryck på en ruta för att växla mellan kryss, dam och tom.
- Dra över brädet för att kryssa alla rutor fingret passerar, åt vilket håll som helst. Damer lämnas orörda. Börjar dragningen på ett kryss suddas kryss i stället. En dragning är ett steg i Ångra.
- Tips pekar ut nästa logiska steg. Skälet (område, rad eller kolumn) visas med horisontella ränder, rutan att agera på får vit ram, och en kort text förklarar varför.
- Appen öppnar på en startskärm med logon (samma krona som ikonen), antal klarade banor och knapparna Spela (fortsätter på nästa bana), Välj bana och Regler.
- Regler (även via **?** i spelet): kort förklaring med små exempelbräden. De ritas i appen med spelets egna färger och markeringar, så de följer med om utseendet ändras. Första gången man trycker Spela visas reglerna först.
- Klarade banor och bästa tid sparas i webbläsaren (localStorage), och appen öppnas på nästa bana.
- Liggande telefon får en egen layout: brädet till vänster, rubrik, status och knappar till höger.

## Struktur

| Sökväg | Innehåll |
| --- | --- |
| `index.html` | Den färdiga sidan (byggs, checkas inte in) |
| `sw.js` | Service worker för offline (byggs, checkas inte in) |
| `manifest.webmanifest` | PWA-manifest: namn, färger, ikoner |
| `icons/` | `icon.svg` (appikon) och `og.svg` (delningsbild 1200 x 630); PNG-filerna renderas från dem vid bygget och checkas inte in |
| `fonts/` | Bricolage Grotesque och IBM Plex Mono, latin-delmängd (SIL Open Font License) |
| `src/app.template.html` | Spelets gränssnitt och logik, med platshållaren `__LEVELS__` |
| `src/sw.template.js` | Mall för `sw.js` |
| `src/queens.js` | Generator, unikhetskontroll, reparation och logiklösare |
| `levels.json` | Banorna |
| `scripts/build-page.js` | Bygger `index.html` av mallen och `levels.json` (adressen för delningsbilden från `SITE_URL`, versionen på startskärmen från git: datum och kort id för senaste commit), och `sw.js` med en cacheversion (hash av de förcachade filerna) |
| `scripts/build-icons.js` | Renderar PNG-ikonerna och delningsbilden från `icons/*.svg` (kräver playwright) |
| `scripts/generate-levels.js` | Genererar om `levels.json` (deterministiskt, samma frön ger samma banor) |
| `scripts/verify-levels.py` | Oberoende kontroll att varje bana har exakt en lösning |
| `test/hints.test.js` | Följer Tips på alla banor i en headless-webbläsare (kräver playwright) |

## Publicering (GitHub Pages)

`.github/workflows/pages.yml` gör allt vid push till `main`: kontrollerar banorna, bygger ikoner, `index.html` och `sw.js`, kör tipstestet i Chromium och publicerar. Pull requests byggs och testas men publiceras inte. Byggda filer checkas inte in, så sajten byggs alltid från källan.

Engångsinställning i repot: Settings → Pages → Source: **GitHub Actions**.

Delningsbilden (`og:image`) måste vara en fullständig adress. Bygget använder `https://<ägare>.github.io/<repo>/`; vid egen domän, sätt repo-variabeln `SITE_URL` (Settings → Secrets and variables → Actions → Variables).

## Arbetsflöde

```
node scripts/generate-levels.js   # valfritt, ger nya banor om fröna ändras
python3 scripts/verify-levels.py  # kontrollera banorna
node scripts/build-icons.js       # valfritt lokalt (kräver playwright), behövs bara för offline/installation
node scripts/build-page.js        # bygg index.html och sw.js (görs även i Actions)
node test/hints.test.js           # testa tipsen (kräver playwright och en byggd index.html)
```

## Hur banorna genereras

1. En giltig damplacering slumpas med backtracking.
2. Varje dam blir frö till ett färgområde som växer slumpmässigt tills rutnätet är fullt.
3. Slumpade områden ger nästan aldrig exakt en lösning (0 av 20 000 från 7x7 och uppåt), så en reparationsrutin flyttar gränsrutor mellan områden tills antalet lösningar är exakt 1. Damerna ligger fast, så den kända lösningen finns alltid kvar.
4. En logiklösare med mänskliga tekniker (ensam kandidat, områden som ryms i färre rader eller kolumner, titta ett steg fram) måste klara banan utan gissning. Dess poäng sorterar banorna.

## Kända begränsningar

- Nästan alla banor hamnar på mellannivå. Svårighetsökningen kommer mest av storleken.
- Sparat framsteg (localStorage) är knutet till adressen. På iPhone får en hemskärmsapp egen lagring, så framsteg från Safari-fliken följer inte med in i den installerade appen.
- Brädet ritas på en canvas i hela skärmpixlar för jämna linjer. Det är testat i simulerade telefoner, inte på riktiga enheter.
