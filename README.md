# naturfag
Læringsressurser jeg og andre lærere kan bruke i naturfagsundervisning

Nettside: https://theodorjs.github.io/naturfag/

## Struktur

- `index.html` er forsiden med ett kort per tema.
- `naeringskjeder/` er temaet Næringskjeder og økosystemer.
- `periode-og-gruppe/` er temaet Periode eller gruppe?
- `reaksjonstid/` er temaet Søvn og reaksjonstid: en reaksjonstest på 2 minutter som kan legges på hjemskjermen som web-app.
- `bindinger/` er temaet Bindinger i bevegelse: animasjoner av molekylbinding, saltbinding og metallbinding.

## Legge til et nytt tema

1. Lag en mappe med temaets navn, for eksempel `fotosyntese/`, med en `index.html`.
2. Legg en lenke til forsiden øverst på temasiden: `<a href="../">← Alle temaer</a>`.
3. Bruk bare relative stier til filer inne i mappa.
4. Kopier et `<li>` med `<a class="tema">` i `index.html` i rota, og endre lenke, emne, tittel, beskrivelse og trinn.

Forhåndsvis lokalt med `python3 -m http.server` i rota, og åpne http://localhost:8000.
