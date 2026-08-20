# Ogrodje frontenda — Sistem za sledenje procesom

## Struktura

```
frontend/
├── index.html                 prijavna stran
├── dashboard.html              nadzorna plošča (filtri: proces, lokacija, status)
├── process-details.html        podrobnosti procesa (?id=)
├── reports.html                 poročila
├── forms/
│   ├── nova-raziskava.html      vnos raziskave (ID, pacient, laboratorij, miza, reagent, podpis)
│   └── zaloga-reagentov.html    vnos pošiljke reagenta + pregled trenutne zaloge z opozorilom
├── css/style.css                enoten design sistem
└── js/
    ├── config.js                API_BASE_URL
    ├── api.js                   kontrakt vseh backend klicev
    ├── auth.js / nav.js
    ├── dashboard.js              filtri in statistika
    ├── process.js / reports.js
    ├── research.js               logika obrazca "Nova raziskava" (podpisna ploščica)
    └── reagents.js               logika obrazca "Zaloga reagentov" (opozorilo pri ≤2 škatlicah)
```

## Ključne odločitve

- **Zaloga reagentov**: količina se meri v številu škatlic, brez enote. Ko je
  zaloga posameznega reagenta ≤ 2 škatlici, se prikaže rdeč opozorilni trak
  in oznaka "Naroči" v tabeli zaloge. Prag je nastavljen v `LOW_STOCK_THRESHOLD`
  v `js/reagents.js`.
- **Nova raziskava**: ločeni polji za laboratorij (Laboratorij 1/2/3) in mizo
  za pipetiranje (Miza 1-4), polje za pacienta, ter podpisna ploščica
  (canvas), ki se ob oddaji pretvori v base64 sliko (`signature` polje).
  Datum se izpolni samodejno.
- Vsi seznami (laboratoriji, mize, reagenti) so trenutno mock podatki v
  `js/research.js` in `js/reagents.js` - ko bo backend na voljo, se
  zamenjajo s klici `API.getLaboratories()`, `API.getBenches()`,
  `API.getReagents()`.

## Zagon

Odpri `index.html` v brskalniku ali postreži mapo s `python3 -m http.server`.
