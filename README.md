# Queens

Ett Queens-pussel för mobil och webbläsare med 100 förgenererade banor (6x6 till 9x9).

Regler: placera en dam per rad, kolumn och färgområde. Inga damer får röra varandra, inte heller diagonalt.

## Spela

Öppna `index.html` i en webbläsare, eller lägg hela mappen på valfri statisk webbplats. Banorna ligger inbäddade i sidan.

### Installera som app (PWA)

Spelet är en PWA. Publicerat över https (t.ex. GitHub Pages) kan det installeras på hemskärmen och spelas helt offline:

- Android/Chrome: menyn → Installera app.
- iPhone/Safari: Dela → Lägg till på hemskärmen.

En service worker förcachar sidan, ikonerna och typsnitten vid första besöket. När en ny version publiceras hämtas den i bakgrunden och används från nästa start. Service workers kräver http(s), så öppnad direkt från disk (`file://`) fungerar sidan som vanligt men utan offline-stöd och installation. Lokalt: `npx http-server .`

- Tryck på en ruta för att växla mellan kryss, dam och tom.
- Tips pekar ut nästa logiska steg. Skälet (område, rad eller kolumn) visas med horisontella ränder, rutan att agera på får vit ram, och en kort text förklarar varför.
- Klarade banor och bästa tid sparas i webbläsaren (localStorage), och appen öppnas på nästa bana.

## Struktur

| Sökväg | Innehåll |
| --- | --- |
| `index.html` | Den färdiga sidan (byggs, men checkas in så den går att köra direkt) |
| `sw.js` | Service worker för offline (byggs, checkas in) |
| `manifest.webmanifest` | PWA-manifest: namn, färger, ikoner |
| `icons/` | `icon.svg` och PNG-ikonerna som renderas från den |
| `fonts/` | Bricolage Grotesque och IBM Plex Mono, latin-delmängd (SIL Open Font License) |
| `src/app.template.html` | Spelets gränssnitt och logik, med platshållaren `__LEVELS__` |
| `src/sw.template.js` | Mall för `sw.js` |
| `src/queens.js` | Generator, unikhetskontroll, reparation och logiklösare |
| `levels.json` | De 100 banorna |
| `scripts/build-page.js` | Bygger `index.html` av mallen och `levels.json`, och `sw.js` med en cacheversion (hash av de förcachade filerna) |
| `scripts/build-icons.js` | Renderar PNG-ikonerna från `icons/icon.svg` (kräver playwright) |
| `scripts/generate-levels.js` | Genererar om `levels.json` (deterministiskt, samma frön ger samma banor) |
| `scripts/verify-levels.py` | Oberoende kontroll att varje bana har exakt en lösning |
| `test/hints.test.js` | Följer Tips på alla banor i en headless-webbläsare (kräver playwright) |

## Publicering (GitHub Pages)

`.github/workflows/pages.yml` gör allt vid push till `main`: kontrollerar banorna, bygger ikoner, `index.html` och `sw.js`, kör tipstestet i Chromium och publicerar. Pull requests byggs och testas men publiceras inte. Inbyggda filer i repot behöver alltså inte vara aktuella för att sajten ska bli rätt.

Engångsinställning i repot: Settings → Pages → Source: **GitHub Actions**.

## Arbetsflöde

```
node scripts/generate-levels.js   # valfritt, ger nya banor om fröna ändras
python3 scripts/verify-levels.py  # kontrollera banorna
node scripts/build-icons.js       # bara om icons/icon.svg ändrats
node scripts/build-page.js        # bygg om index.html och sw.js (görs även i Actions)
node test/hints.test.js           # testa tipsen
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
