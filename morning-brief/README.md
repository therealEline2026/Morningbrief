# Morning Brief — Setup instructies

## Wat dit is
Een persoonlijk markt dashboard met live data van Yahoo Finance, FRED, en Financial Modeling Prep. Gegenereerd met een AI morning briefing elke ochtend.

## Eenmalige setup (15 min)

### Stap 1 — GitHub repository aanmaken
1. Ga naar github.com → klik "New repository"
2. Naam: `morning-brief`
3. Zet op **Private**
4. Klik "Create repository"

### Stap 2 — Bestanden uploaden
Upload deze vier bestanden naar je repository:
- `index.html`
- `netlify.toml`
- `manifest.json`
- `netlify/functions/market-data.js`

Let op: `market-data.js` moet in de map `netlify/functions/` staan.

### Stap 3 — Netlify koppelen
1. Ga naar netlify.com → log in
2. Klik "Add new site" → "Import an existing project"
3. Kies GitHub → selecteer `morning-brief`
4. Build settings hoef je niet te wijzigen → klik "Deploy"

### Stap 4 — API keys instellen (veilig)
In Netlify: ga naar **Site settings → Environment variables** en voeg toe:
- Key: `FRED_KEY` → Value: jouw FRED API key
- Key: `FMP_KEY` → Value: jouw FMP API key

Dit is veiliger dan keys in de code — de code in de functie gebruikt `process.env.FRED_KEY`.

### Stap 5 — Klaar
Je krijgt een URL zoals `https://morning-brief-xyz.netlify.app`. 
Bladwijzer opslaan, elke ochtend openen.

### Optioneel: op telefoon als app
- iOS: open de URL in Safari → deel-knop → "Zet op beginscherm"
- Android: open in Chrome → menu → "Toevoegen aan startscherm"

## API keys roteren (aanbevolen)
Omdat de keys even in een chatgesprek stonden, is het slim om nieuwe aan te maken:
- FRED: fred.stlouisfed.org → My Account → API Keys
- FMP: financialmodelingprep.com → Dashboard → API Key
