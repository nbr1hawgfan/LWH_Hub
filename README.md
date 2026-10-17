# LWH Hub

The Logistics Warehouse company hub: every app, Google Site, Sheet and tool in one branded page.

**Live at:** https://hub.logisticswarehouse.net (also https://nbr1hawgfan.github.io/LWH_Hub/)

## Add or change a tile
Edit **`links.js`** on GitHub (pencil icon) → add a line in the right section → **Commit changes**. The hub updates in a minute or two.

```js
{ name: 'Manager Site', url: 'https://sites.google.com/…', desc: 'One short line', icon: '🧭', for: ['managers'] },
```

`for` can be any of `'everyone'`, `'warehouse'`, `'transportation'`, `'managers'`, `'hr'`, `'customers'`. It drives the filter chips (team filters also show the "everyone" tiles) and the tile's color stripe: red = everyone/warehouse, dark red = transportation, black = managers, amber = HR, blue = customers.

## Features
- Search (press **/**), filter by audience, ★ pin favorites (saved per device)
- Fort Smith weather, greeting and clock
- Installable to a phone or desktop home screen

## Custom domain
`CNAME` file = `hub.logisticswarehouse.net`. DNS: CNAME `hub` → `nbr1hawgfan.github.io` (Squarespace → DNS Settings → Custom records).
