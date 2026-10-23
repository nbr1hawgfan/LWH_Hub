/* ==========================================================================
   LWH HUB — CONFIG + FALLBACK LIST
   --------------------------------------------------------------------------
   Tiles are now managed in the "LWH Hub Links" Google Sheet — add/edit them
   from the hub (✎ Edit hub, after signing in as an admin) or on the Sheet.

   HUB_API_URL below connects the hub to that Sheet. The HUB_SECTIONS list
   further down is ONLY a backup shown if the Sheet can't be reached. It has
   no manager-only links on purpose: this file is public on GitHub.
   ========================================================================== */

window.HUB_CONFIG = {
  // National Weather Service warnings shown in the red banner (Severe/Extreme only).
  // Add a line for Dallas when that location opens:  { name: 'Dallas', lat: 32.7767, lon: -96.7970 }
  NWS_POINTS: [
    { name: 'Fort Smith', lat: 35.3859, lon: -94.3985 }
  ],
  API_URL: 'https://script.google.com/macros/s/AKfycbwYqndx1hRNXRu04gP2x8qRdk6gHsgkOaUKfQkEGFwRI0uIVxH1LziqMpCLtuDdAcRk/exec',   // LWH Hub Links Sheet

  // Highlighted tiles: red background + a label pill until the "until" date (YYYY-MM-DD).
  // Matched by the tile's URL or name. Delete a line (or let the date pass) to stop highlighting it.
  FEATURED: [
    { name: 'LWH Portals', url: 'https://nbr1hawgfan.github.io/LWH_Portals/', label: 'New', until: '2026-11-30' },
    { name: 'PDF Tools', url: 'https://pdf.logisticswarehouse.net/', label: 'New', until: '2026-12-31' }
  ]
};

window.PTO_CONFIG = {
  WEATHER: { name: 'Fort Smith, AR', lat: 35.3859, lon: -94.3985 },
  COMPANY: {
    name: 'Logistics Warehouse',
    phone: '1-479-410-2611',
    address: '700 Fresno Street, HQ',
    hours: 'Mon–Fri: 8AM–5PM'
  }
};

window.HUB_SECTIONS = [
  {
    title: 'Everyday',
    links: [
      { name: 'PTO & Time Off', url: 'https://nbr1hawgfan.github.io/LWH_PTO/', desc: 'Request PTO, ask for time off, check your balance', icon: '🌴', for: ['everyone'] },
      { name: 'Employee Handbook', url: 'https://drive.google.com/file/d/1ALaxNglkkOjg8npnXnvYVrl7DkokqPow/view?usp=sharing', desc: 'Company policies and handbook (Google Drive)', icon: '📘', for: ['everyone'] },
      { name: 'Employee Timesheet', url: 'https://nbr1hawgfan.github.io/LWH-Employee-Timesheet/', desc: 'Weekly hours and timesheet', icon: '⏱️', for: ['everyone'] },
      { name: 'PDF Tools', url: 'https://pdf.logisticswarehouse.net/', desc: 'View, combine, mark up, sign, and convert PDFs (PDF to Word/Excel)', icon: 'assets/icons/lwh-pdf-tools.png', for: ['everyone'] },
      { name: 'Doc Scanner', url: 'https://nbr1hawgfan.github.io/LWH_DocScanner/', desc: 'Scan paperwork to a clean PDF', icon: '📄', for: ['everyone'] },
      { name: 'Business Cards', url: 'https://nbr1hawgfan.github.io/LWH_Business-Card/', desc: 'Digital company business cards', icon: '🪪', for: ['everyone'] },
      { name: 'LWH COMS', url: 'https://nbr1hawgfan.github.io/LWH_COMS/', desc: 'Company communications', icon: '📣', for: ['everyone'] },
      { name: 'Safety Training — Drivers', url: 'https://logisticswarehouse.infinit-i.net/#/login', desc: 'Infinit-I driver safety training', icon: '🦺', for: ['transportation'] },
      { name: 'Safety Training — Warehouse', url: 'https://nbr1hawgfan.github.io/LWH_Safety_Training/', desc: 'Warehouse safety training', icon: '⛑️', for: ['warehouse'] }
    ]
  },
  {
    title: 'Warehouse',
    links: [
      { name: 'Warehouse Toolkit', url: 'https://nbr1hawgfan.github.io/LWH-Warehouse-Toolkit/', desc: 'Inventory, load scans, labels and tools', icon: '🏭', for: ['warehouse'] },
      { name: 'LWH Daily Forms', url: 'https://sites.google.com/logisticswarehouse.net/lwhdailyforms/home', desc: 'Daily warehouse forms and checklists', icon: '📝', for: ['warehouse'] },
      { name: 'Inventory Lookups', url: 'https://sites.google.com/logisticswarehouse.net/inventorylookups/home', desc: 'Look up customer inventory', icon: '🔎', for: ['warehouse'] },
      { name: 'Forklift Inspection', url: 'https://nbr1hawgfan.github.io/LWH_Forklift_Inspections/', desc: 'Daily forklift pre-use inspection', icon: '🛞', for: ['warehouse'] },
      { name: 'Mobile Scan Portal', url: 'http://mobile.logistics-warehouse.biz/', desc: 'Handheld scanning portal', icon: '📱', for: ['warehouse'] },
      { name: 'Inventory', url: 'https://nbr1hawgfan.github.io/LWH_Inventory/', desc: 'Warehouse inventory', icon: '📋', for: ['warehouse'] },
      { name: 'Item Search', url: 'https://nbr1hawgfan.github.io/LWH_Item-Search/', desc: 'Search items and locations', icon: '🔍', for: ['warehouse'] },
      { name: 'Pallet & Bay History', url: 'https://nbr1hawgfan.github.io/Pallet-Bay-History/', desc: 'Pallet and bay history lookup', icon: '🗄️', for: ['warehouse'] },
      { name: 'Bay Ops', url: 'https://nbr1hawgfan.github.io/LWH_Bay_OPS/', desc: 'Bay and dock operations', icon: '🚪', for: ['warehouse'] },
      { name: 'Tag Generator', url: 'https://nbr1hawgfan.github.io/LWH_Tag_Generator/', desc: 'Print pallet and load tags', icon: '🏷️', for: ['warehouse'] },
      { name: 'Inventory Barcodes', url: 'https://nbr1hawgfan.github.io/LWH-Inventory-Barcodes/', desc: 'Inventory barcode labels', icon: '▥', for: ['warehouse'] },
      { name: 'OneSource Inbound', url: 'https://nbr1hawgfan.github.io/LWH_-OneSource-Inbound/', desc: 'One Source inbound deliveries', icon: '📥', for: ['warehouse'] },
      { name: 'Off-Site WMS', url: 'https://nbr1hawgfan.github.io/OFF-Site-WMS/', desc: 'Backup outbound loads and BOLs', icon: '📤', for: ['warehouse', 'managers'] },
      { name: 'Nissan', url: 'https://nbr1hawgfan.github.io/LWH-Nissan/', desc: 'Nissan inventory and dispositions', icon: '🚗', for: ['warehouse'] },
      { name: 'Nissan Scrap', url: 'https://nbr1hawgfan.github.io/LWH_Nissan-Scrap/', desc: 'Nissan scrap tracking', icon: '♻️', for: ['warehouse'] }
    ]
  },
  {
    title: 'Transportation',
    links: [
      { name: 'Driver Toolkit', url: 'https://nbr1hawgfan.github.io/LWH_Driver_Toolkit/', desc: 'Trailer inspection, timesheets, unpaid time off, fuel', icon: '🚚', for: ['transportation'] },
      { name: 'Driver Apps', url: 'https://sites.google.com/logisticswarehouse.net/driver-apps/home', desc: 'Driver forms and apps', icon: '🧾', for: ['transportation'] },
      { name: 'Trailer Repair Apps', url: 'https://sites.google.com/logisticswarehouse.net/trailerrepairapps/home', desc: 'Trailer repair requests and tracking', icon: '🔧', for: ['transportation'] },
      { name: 'Trailer Shop', url: 'https://nbr1hawgfan.github.io/LWH_Trailer_Shop/', desc: 'Trailer defect repairs and shop work', icon: '🛠️', for: ['transportation'] },
      { name: 'Load Check-In', url: 'https://nbr1hawgfan.github.io/LWH_Load_Check-In/', desc: 'Driver check-in for scheduled loads', icon: '🛎️', for: ['transportation', 'warehouse'] },
      { name: 'Load Board', url: 'https://nbr1hawgfan.github.io/LWH_LoadBoard/', desc: 'Loads and dispatch board', icon: '🗺️', for: ['transportation', 'managers'] },
      { name: 'Yard Check', url: 'https://nbr1hawgfan.github.io/Yard_Check/', desc: 'Count trailers at a customer yard', icon: '🅿️', for: ['transportation'] },
      { name: 'Trailer Dwell', url: 'https://nbr1hawgfan.github.io/Trailer_Dwell/', desc: 'Trailer dwell time at customer sites', icon: '⏳', for: ['transportation', 'managers'] }
    ]
  },
  {
    title: 'HR',
    links: [
      { name: 'Logistics HR Dashboard', url: 'https://sites.google.com/logisticswarehouse.net/logistics-hr-dashboard/company-messaging-and-announcements-app', desc: 'HR dashboard — company messaging and announcements', icon: '👥', for: ['hr'] }
    ]
  },
  {
    title: 'Customers',
    links: [
      { name: 'LWH Portals', url: 'https://nbr1hawgfan.github.io/LWH_Portals/', desc: 'Customer Portal and Mobile Portal in one app', icon: 'assets/icons/lwh-portals.png', type: 'app', for: ['customers', 'warehouse', 'managers'] },
      { name: 'Customer Portal', url: 'https://portal.logistics-warehouse.biz/Default.aspx', desc: 'Customer inventory and reports portal', icon: '🌐', for: ['customers', 'managers'] },
      { name: 'One Source Inventory', url: 'https://nbr1hawgfan.github.io/ONEPH_Inventory/', desc: 'One Source inventory — Zero St, 5th St, Van Buren', icon: '📦', for: ['customers', 'managers'] },
      { name: 'TRAFO Inventory', url: 'https://nbr1hawgfan.github.io/TRAFO_Inventory/', desc: 'TRAFO customer inventory', icon: '📦', for: ['customers', 'managers'] }
    ]
  },
  {
    title: 'Just for Fun',
    links: [
      { name: 'Office Chair Quarterback', url: 'https://nbr1hawgfan.github.io/Office-Chair-Quarterback/', desc: 'Scores, standings and sports talk for the team', icon: '🏈', for: ['everyone'] }
    ]
  }
];
