/* ==========================================================================
   LWH HUB — LINKS  (the only file you need to edit to add / change tiles)
   --------------------------------------------------------------------------
   Each tile:
     { name: 'Shown on the tile',
       url:  'https://…',
       desc: 'One short line under the name',
       icon: '📅',                       // any emoji
       for:  ['everyone']                // who it's for — any of:
                                         //   'everyone', 'managers', 'office', 'customers'
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
      { name: 'Warehouse Toolkit', url: 'https://nbr1hawgfan.github.io/LWH-Warehouse-Toolkit/', desc: 'Inventory, load scans, labels and tools', icon: '🏭', for: ['everyone'] },
      { name: 'Driver Toolkit', url: 'https://nbr1hawgfan.github.io/LWH_Driver_Toolkit/', desc: 'Trailer inspection, timesheets, fuel, weather', icon: '🚚', for: ['everyone'] },
      { name: 'Forklift Inspection', url: 'https://nbr1hawgfan.github.io/LWH_Forklift_Inspections/', desc: 'Daily forklift pre-use inspection', icon: '🛞', for: ['everyone'] },
      { name: 'Safety Training — Drivers', url: 'https://logisticswarehouse.infinit-i.net/#/login', desc: 'Infinit-I driver safety training', icon: '🦺', for: ['everyone'] },
      { name: 'Safety Training — Warehouse', url: 'https://script.google.com/a/macros/logisticswarehouse.net/s/AKfycbxY_tZyajeHo00TH_EWaFgHBhG-fOWN8uxeXwxufDBzVnA8cOZxCdDtkdJ7N_O0uKfK/exec', desc: 'Warehouse safety training', icon: '⛑️', for: ['everyone'] },
      { name: 'Mobile Scan Portal', url: 'http://mobile.logistics-warehouse.biz/', desc: 'Handheld scanning portal', icon: '📱', for: ['everyone'] }
    ]
  },
  {
    title: 'Managers',
    links: [
      { name: 'PTO Manager', url: 'https://nbr1hawgfan.github.io/LWH_PTO/manager/', desc: 'Approvals, asks, team calendar, HR reports', icon: '✅', for: ['managers'] },
      { name: 'Transportation Manager', url: 'https://nbr1hawgfan.github.io/LWH_Transportation_Manager/', desc: 'Unpaid time off, trailers, dispatch tools', icon: '🗂️', for: ['managers'] },
      { name: 'Driver & Trailer Tracking', url: 'https://nbr1hawgfan.github.io/LWH_Driver-and-Trailer-Tracking/', desc: 'Where drivers and trailers are', icon: '📍', for: ['managers'] },
      { name: 'Trailer Shop', url: 'https://nbr1hawgfan.github.io/LWH_Trailer_Shop/', desc: 'Trailer defect repairs and shop work', icon: '🔧', for: ['managers'] },
      { name: 'Forklift Repair Costing', url: 'https://nbr1hawgfan.github.io/LWH_Forklift_Repair_Costing/', desc: 'PM and repair costs by forklift', icon: '💲', for: ['managers', 'office'] }
    ]
  },
  {
    title: 'Customers',
    links: [
      { name: 'Customer Portal', url: 'https://portal.logistics-warehouse.biz/Default.aspx', desc: 'Customer inventory and reports portal', icon: '🌐', for: ['everyone', 'customers'] },
      { name: 'One Source Inventory', url: 'https://nbr1hawgfan.github.io/ONEPH_Inventory/', desc: 'One Source inventory — Zero St, 5th St, Van Buren', icon: '📦', for: ['customers', 'managers'] }
    ]
  },
  {
    title: 'Company Sites & Sheets',
    links: [
      // Add your Google Sites, Sheets and Drive folders here, for example:
      // { name: 'Manager Site', url: 'https://sites.google.com/logisticswarehouse.net/…', desc: 'Manager links and dashboards', icon: '🧭', for: ['managers'] },
      // { name: 'Financial Site', url: 'https://sites.google.com/…', desc: 'Web summary and finance tools', icon: '📊', for: ['office'] },
    ]
  }
];
