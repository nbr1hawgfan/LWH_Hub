# LWH Hub

The Logistics Warehouse company hub: every app, Google Site, Sheet and tool in one branded page.

**Live at:** https://hub.logisticswarehouse.net (also https://nbr1hawgfan.github.io/LWH_Hub/)

## Add or change a tile
Tiles live in the **LWH Hub Links** Google Sheet. Change them from the hub: **🔑 Manager sign-in** → **✎ Edit hub** (admins only). You can also edit the **Links** tab directly.

`links.js` holds the Sheet's API address (`HUB_CONFIG.API_URL`) plus a **public-only backup list**, which is shown only if the Sheet can't be reached. Manager-only links are deliberately left out of this public repo.

Tiles marked **Locked** in the Sheet are sent to the hub only after a manager signs in with their PTO manager PIN.

## Features
- Search (press **/**), filter by department and Apps vs Sites, ★ pin favorites (saved per device)
- Manager-only tiles unlocked with the PTO manager PIN; admins edit tiles in place
- Fort Smith weather, greeting and clock
- Installable to a phone or desktop home screen

## Custom domain
`CNAME` file = `hub.logisticswarehouse.net`. DNS: CNAME `hub` → `nbr1hawgfan.github.io` (Squarespace → DNS Settings → Custom records).
