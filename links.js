/* ==========================================================================
   LWH HUB — LINKS  (the only file you need to edit to add / change tiles)
   --------------------------------------------------------------------------
   Each tile:
     { name: 'Shown on the tile',
       url:  'https://…',
       desc: 'One short line under the name',
       icon: '📅',                       // any emoji
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
      { name: 'Mobile Scan Portal', url: 'http://mobile.logistics-warehouse.biz/', desc: 'Handheld scanning portal', icon: '📱', for: ['warehouse'] }
    ]
  },
  {
    title: 'Transportation',
    links: [
      { name: 'Driver Toolkit', url: 'https://nbr1hawgfan.github.io/LWH_Driver_Toolkit/', desc: 'Trailer inspection, timesheets, unpaid time off, fuel', icon: '🚚', for: ['transportation'] },
      { name: 'Driver Apps', url: 'https://sites.google.com/logisticswarehouse.net/driver-apps/home', desc: 'Driver forms and apps', icon: '🧾', for: ['transportation'] },
      { name: 'Trailer Repair Apps', url: 'https://sites.google.com/logisticswarehouse.net/trailerrepairapps/home', desc: 'Trailer repair requests and tracking', icon: '🔧', for: ['transportation'] },
      { name: 'Trailer Shop', url: 'https://nbr1hawgfan.github.io/LWH_Trailer_Shop/', desc: 'Trailer defect repairs and shop work', icon: '🛠️', for: ['transportation'] }
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
      { name: 'Forklift Repair Costing', url: 'https://nbr1hawgfan.github.io/LWH_Forklift_Repair_Costing/', desc: 'PM and repair costs by forklift', icon: '💲', for: ['managers'] }
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
      { name: 'One Source Inventory', url: 'https://nbr1hawgfan.github.io/ONEPH_Inventory/', desc: 'One Source inventory — Zero St, 5th St, Van Buren', icon: '📦', for: ['customers', 'managers'] }
    ]
  }
];
