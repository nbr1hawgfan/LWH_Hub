/* ==========================================================================
   LWH HUB — LINKS  (the only file you need to edit to add / change tiles)
   --------------------------------------------------------------------------
   Each tile:
     { name: 'Shown on the tile',
       url:  'https://…',
       desc: 'One short line under the name',
       icon: '📅',                       // any emoji
       type: 'app',                      // optional — normally detected automatically:
                                         //   GitHub apps = 'app', sites.google.com = 'site',
                                         //   Drive/Docs = 'doc', anything else = 'link'
       for:  ['everyone']                // who it's for — any of:
                                         //   'everyone', 'warehouse', 'transportation',
                                         //   'managers', 'hr', 'customers'
     }
   Sections show in the order below. Remove a tile = delete its line.
   After you edit and commit on GitHub, the hub updates in a minute or two.
   ========================================================================== */

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
      { name: 'Doc Scanner', url: 'https://nbr1hawgfan.github.io/LWH_DocScanner/', desc: 'Scan paperwork to a clean PDF', icon: '📄', for: ['everyone'] },
      { name: 'Business Cards', url: 'https://nbr1hawgfan.github.io/LWH_Business-Card/', desc: 'Digital company business cards', icon: '🪪', for: ['everyone'] },
      { name: 'LWH COMS', url: 'https://nbr1hawgfan.github.io/LWH_COMS/', desc: 'Company communications', icon: '📣', for: ['everyone'] },
      { name: 'Safety Training — Drivers', url: 'https://logisticswarehouse.infinit-i.net/#/login', desc: 'Infinit-I driver safety training', icon: '🦺', for: ['transportation'] },
      { name: 'Safety Training — Warehouse', url: 'https://script.google.com/a/macros/logisticswarehouse.net/s/AKfycbxY_tZyajeHo00TH_EWaFgHBhG-fOWN8uxeXwxufDBzVnA8cOZxCdDtkdJ7N_O0uKfK/exec', desc: 'Warehouse safety training', icon: '⛑️', for: ['warehouse'] }
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
    title: 'Managers',
    links: [
      { name: 'Manager Dashboard', url: 'https://sites.google.com/logisticswarehouse.net/managerdashboard/home', desc: 'Manager links, sheets and dashboards', icon: '🧭', for: ['managers'] },
      { name: 'Warehouse & Transportation Summaries', url: 'https://sites.google.com/logisticswarehouse.net/daily-summary-page/home', desc: 'Daily warehouse and transportation summaries', icon: '📊', for: ['managers'] },
      { name: 'PTO Manager', url: 'https://nbr1hawgfan.github.io/LWH_PTO/manager/', desc: 'Approvals, asks, team calendar, HR reports', icon: '✅', for: ['managers', 'hr'] },
      { name: 'Transportation Manager', url: 'https://nbr1hawgfan.github.io/LWH_Transportation_Manager/', desc: 'Unpaid time off, trailers, dispatch tools', icon: '🗂️', for: ['managers'] },
      { name: 'Driver & Trailer Tracking', url: 'https://nbr1hawgfan.github.io/LWH_Driver-and-Trailer-Tracking/', desc: 'Where drivers and trailers are', icon: '📍', for: ['managers'] },
      { name: 'Forklift Repair Costing', url: 'https://nbr1hawgfan.github.io/LWH_Forklift_Repair_Costing/', desc: 'PM and repair costs by forklift', icon: '💲', for: ['managers'] },
      { name: 'Absence Calendar', url: 'https://nbr1hawgfan.github.io/LWH_Absence_Calendar/', desc: 'Who is out — team absence calendar', icon: '📅', for: ['managers', 'hr'] },
      { name: 'Customer Shipment Weights', url: 'https://nbr1hawgfan.github.io/Customer_Shipment_Weights/', desc: 'Shipment weights by customer', icon: '⚖️', for: ['managers'] }
    ]
  },
  {
    title: 'HR',
    links: [
      { name: 'Logistics HR Dashboard', url: 'https://nbr1hawgfan.github.io/LWH_PTO/#home', desc: 'PTO balances and time off', icon: '👥', for: ['hr'] }
    ]
  },
  {
    title: 'Customers',
    links: [
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
