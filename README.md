# Queens

Ett Queens-pussel för mobil och webbläsare med 100 förgenererade banor (6x6 till 9x9).

Regler: placera en dam per rad, kolumn och färgområde. Inga damer får röra varandra, inte heller diagonalt.

## Spela

Öppna `index.html` i en webbläsare. Filen är helt självbärande (banorna ligger inbäddade) och kan läggas på valfri statisk webbplats.

- Tryck på en ruta för att växla mellan kryss, dam och tom.
- Tips pekar ut nästa logiska steg. Skälet (område, rad eller kolumn) visas med horisontella ränder, rutan att agera på får vit ram, och en kort text förklarar varför.
- Klarade banor och bästa tid sparas i webbläsaren (localStorage), och appen öppnas på nästa bana.

## Struktur

| Sökväg | Innehåll |
| --- | --- |
| `index.html` | Den färdiga sidan (byggs, men checkas in så den går att köra direkt) |
| `src/app.template.html` | Spelets gränssnitt och logik, med platshållaren `__LEVELS__` |
| `src/queens.js` | Generator, unikhetskontroll, reparation och logiklösare |
| `levels.json` | De 100 banorna |
| `scripts/build-page.js` | Bygger `index.html` av mallen och `levels.json` |
| `scripts/generate-levels.js` | Genererar om `levels.json` (deterministiskt, samma frön ger samma banor) |
| `scripts/verify-levels.py` | Oberoende kontroll att varje bana har exakt en lösning |
| `test/hints.test.js` | Följer Tips på alla banor i en headless-webbläsare (kräver playwright) |

## Arbetsflöde

```
node scripts/generate-levels.js   # valfritt, ger nya banor om fröna ändras
python3 scripts/verify-levels.py  # kontrollera banorna
node scripts/build-page.js        # bygg om index.html
node test/hints.test.js           # testa tipsen
```

## Hur banorna genereras

1. En giltig damplacering slumpas med backtracking.
2. Varje dam blir frö till ett färgområde som växer slumpmässigt tills rutnätet är fullt.
3. Slumpade områden ger nästan aldrig exakt en lösning (0 av 20 000 från 7x7 och uppåt), så en reparationsrutin flyttar gränsrutor mellan områden tills antalet lösningar är exakt 1. Damerna ligger fast, så den kända lösningen finns alltid kvar.
4. En logiklösare med mänskliga tekniker (ensam kandidat, områden som ryms i färre rader eller kolumner, titta ett steg fram) måste klara banan utan gissning. Dess poäng sorterar banorna.

## Kända begränsningar

- Nästan alla banor hamnar på mellannivå. Svårighetsökningen kommer mest av storleken.
- Brädet ritas på en canvas i hela skärmpixlar för jämna linjer. Det är testat i simulerade telefoner, inte på riktiga enheter.
