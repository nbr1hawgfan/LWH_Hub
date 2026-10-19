/* ==========================================================================
   LWH HUB — page logic
   Tiles come from the LWH Hub Google Sheet (via HUB_API_URL). links.js is only
   a fallback for when that can't be reached. Manager-locked tiles are sent by
   the Sheet only after a manager unlocks with their PTO manager PIN.
   ========================================================================== */
(function () {
  'use strict';
  const P = window.PTO, $ = P.$, $$ = P.$$, esc = P.esc;
  const API = String((window.HUB_CONFIG || {}).API_URL || '').trim();
  const HAS_API = /^https:\/\/script\.google\.com\//.test(API);
  const K = { fav: 'lwhhub_favs', who: 'lwhhub_who', type: 'lwhhub_type', sess: 'lwhhub_session', cache: 'lwhhub_cache' };

  let show = P.store.get(K.type) || 'all';
  let who = P.store.get(K.who) || 'all';
  let favs = P.store.get(K.fav); if (!Array.isArray(favs)) favs = [];
  let session = P.store.get(K.sess);
  if (!session || !session.token || session.expires < Date.now()) { session = null; P.store.del(K.sess); }
  let SECTIONS = [];          // [{title, links:[...], lockedCount}]
  let ANN = [];               // live announcements
  let NWS = [];               // National Weather Service warnings
  let OUT = null;             // who's out (managers)
  let source = 'fallback';    // 'live' | 'cache' | 'fallback'
  let editMode = false, adminRows = null, adminSections = [];

  P.renderChrome({ root: '', sub: 'Company Hub' });
  P.watchOnline();
  P.registerSW('sw.js');
  P.renderWeather($('#wxBox'));

  // --------------------------------------------------------- greeting/clock
  function tick() {
    const d = new Date();
    $('#hello').textContent = P.greeting();
    $('#when').textContent = P.fmt(d, 'long');
    $('#clock').textContent = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  tick(); setInterval(tick, 15000);

  // ------------------------------------------------------------------ API
  async function api(action, payload, timeout) {
    if (!HAS_API) throw new Error('The hub isn’t connected to its Google Sheet yet.');
    const body = Object.assign({ action }, payload || {});
    if (session && session.token) body.token = session.token;
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), timeout || 30000);
    let res;
    try {
      res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), signal: ctrl.signal });
    } catch (e) { throw new Error(e.name === 'AbortError' ? 'The hub server took too long. Try again.' : 'Couldn’t reach the hub server.'); }
    finally { clearTimeout(t); }
    let j; try { j = await res.json(); } catch (e) { throw new Error('Unexpected server response.'); }
    if (!j.ok) {
      if (j.error === 'SESSION_EXPIRED') { lockUp(true); throw new Error('Your manager unlock expired. Enter your PIN again.'); }
      throw new Error(j.error || 'Something went wrong.');
    }
    return j.data;
  }

  // ------------------------------------------------------------------ data
  function fromLinksJs() {
    return (window.HUB_SECTIONS || []).map(s => ({ title: s.title, lockedCount: s.lockedCount || 0, links: (s.links || []).filter(l => l && l.name && l.url) }));
  }
  async function load() {
    if (!HAS_API) { SECTIONS = fromLinksJs(); source = 'fallback'; return render(); }
    try {
      const d = await api('links');
      SECTIONS = d.sections || [];
      ANN = d.announcements || [];
      source = 'live';
      if (session && !d.session) lockUp(true);
      if (session && d.session) { session.admin = !!d.session.admin; session.poster = !!d.session.poster; P.store.set(K.sess, session, true); }
      // only the public list is cached on the device
      if (!session) { try { localStorage.setItem(K.cache, JSON.stringify({ t: Date.now(), s: SECTIONS, a: ANN })); } catch (e) {} }
    } catch (e) {
      let c = null; try { c = JSON.parse(localStorage.getItem(K.cache) || 'null'); } catch (x) {}
      if (c && c.s) { SECTIONS = c.s; ANN = c.a || []; source = 'cache'; } else { SECTIONS = fromLinksJs(); ANN = []; source = 'fallback'; }
    }
    render();
    if (session) loadOut(); else { OUT = null; renderOut(); }
  }

  // ------------------------------------------------------------ who's out
  async function loadOut(fresh) {
    try { OUT = await api('whosout', fresh ? { fresh: true } : {}); }
    catch (e) { OUT = { error: /PTO_RELOGIN/.test(e.message) ? 'relogin' : e.message }; }
    renderOut();
  }
  function outRow(r, showDates) {
    const same = r.start === r.end;
    const when = same ? P.fmt(r.start, 'dow') : P.fmt(r.start, 'md') + ' – ' + P.fmt(r.end, 'md');
    return '<div class="out-r"><span class="avatar">' + esc(P.initials(r.name)) + '</span><span class="out-n"><b>' + esc(r.name) + '</b><span>' + esc(r.type) + '</span></span>' +
      '<span class="out-w">' + esc(showDates ? when : (same ? 'Today' : 'Back after ' + P.fmt(r.end, 'md'))) + '</span></div>';
  }
  function renderOut() {
    const box = $('#whosOut');
    if (!session || editMode) { box.hidden = true; box.innerHTML = ''; return; }
    box.hidden = false;
    const head = '<div class="card-head"><h2>👥 Who’s Out</h2><span class="out-tools">' +
      '<a class="how" href="https://nbr1hawgfan.github.io/LWH_PTO/manager/#calendar" target="_blank" rel="noopener">Team calendar ↗</a>' +
      '<button class="how" id="outRefresh" title="Refresh">↻</button></span></div>';
    let body;
    if (!OUT) body = '<div class="card-body"><div class="skel"></div><div class="skel" style="width:60%"></div></div>';
    else if (OUT.error === 'relogin') body = '<div class="card-body"><div class="note">Your PTO sign-in has timed out. <button class="how" data-relogin>Enter your PIN again</button> to see who’s out.</div></div>';
    else if (OUT.error) body = '<div class="card-body"><div class="note warn">' + esc(OUT.error) + '</div></div>';
    else {
      const later = OUT.outWeek.filter(r => !(r.start <= OUT.today && r.end >= OUT.today));
      body = '<div class="out-grid">' +
        '<div><div class="out-h">Today · ' + esc(P.fmt(OUT.today, 'dow')) + ' <span class="n">' + OUT.outToday.length + '</span></div>' +
        (OUT.outToday.length ? OUT.outToday.map(r => outRow(r, false)).join('') : '<div class="out-e">✅ Everyone’s in</div>') + '</div>' +
        '<div><div class="out-h">This week · ' + esc(P.fmt(OUT.weekStart, 'md') + ' – ' + P.fmt(OUT.weekEnd, 'md')) + ' <span class="n">' + later.length + '</span></div>' +
        (later.length ? later.map(r => outRow(r, true)).join('') : '<div class="out-e">No one else out this week</div>') + '</div></div>' +
        (OUT.pending ? '<div class="out-p"><a href="https://nbr1hawgfan.github.io/LWH_PTO/manager/#approvals" target="_blank" rel="noopener">⏳ ' + OUT.pending + ' PTO request' + (OUT.pending === 1 ? '' : 's') + ' waiting for approval →</a></div>' : '');
    }
    box.innerHTML = head + body;
    $('#outRefresh').onclick = () => { OUT = null; renderOut(); loadOut(true); };
  }

  // ------------------------------------------------- National Weather Service
  const NWS_KEY = 'lwhhub_nws';
  function nwsBar(a) {
    const until = a.ends || a.expires;
    const untilTxt = until ? 'Until ' + new Date(until).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' }) : '';
    return '<div class="alert-bar nws ' + (a.severity === 'Extreme' ? 'ext' : '') + '"><span class="ai">⚠️</span><div class="at">' +
      '<b>' + esc(a.event) + ' — ' + esc(a.place) + '</b><div>' + esc(a.headline || '') + '</div>' +
      '<div class="am">National Weather Service' + (untilTxt ? ' · ' + esc(untilTxt) : '') + '</div></div>' +
      '<a class="al" href="' + esc(a.link) + '" target="_blank" rel="noopener">Details</a></div>';
  }
  async function loadNWS() {
    const pts = ((window.HUB_CONFIG || {}).NWS_POINTS || []).filter(p => p && isFinite(p.lat) && isFinite(p.lon));
    if (!pts.length) return;
    try {
      const c = JSON.parse(localStorage.getItem(NWS_KEY) || 'null');
      if (c && Date.now() - c.t < 10 * 60000) { NWS = c.a; return renderNews(); }
    } catch (e) {}
    const seen = {}, out = [];
    await Promise.all(pts.map(async p => {
      try {
        const r = await fetch('https://api.weather.gov/alerts/active?point=' + (+p.lat).toFixed(4) + ',' + (+p.lon).toFixed(4), { headers: { Accept: 'application/geo+json' } });
        if (!r.ok) return;
        const j = await r.json();
        (j.features || []).forEach(f => {
          const x = f.properties || {};
          if (x.severity !== 'Severe' && x.severity !== 'Extreme') return;
          if (x.status && x.status !== 'Actual') return;
          const end = x.ends || x.expires;
          if (end && new Date(end) < new Date()) return;
          const key = (x.event || '') + '|' + p.name;
          if (seen[key]) return; seen[key] = 1;
          out.push({ event: x.event, headline: x.headline, severity: x.severity, ends: x.ends, expires: x.expires, place: p.name,
            link: 'https://forecast.weather.gov/MapClick.php?lat=' + p.lat + '&lon=' + p.lon });
        });
      } catch (e) { /* weather service unreachable — no banner */ }
    }));
    out.sort((a, b) => (a.severity === 'Extreme' ? 0 : 1) - (b.severity === 'Extreme' ? 0 : 1));
    NWS = out;
    try { localStorage.setItem(NWS_KEY, JSON.stringify({ t: Date.now(), a: NWS })); } catch (e) {}
    renderNews();
  }

  // ---------------------------------------------------------- tile helpers
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } };
  const kind = l => {
    const f = l.for || ['everyone'];
    if (f.indexOf('everyone') !== -1) return '';
    if (f.indexOf('managers') !== -1) return 'mgr';
    if (f.indexOf('hr') !== -1) return 'off';
    if (f.indexOf('customers') !== -1) return 'cust';
    if (f.indexOf('transportation') !== -1) return 'tr';
    return '';
  };
  const TYPES = {
    app:  { pill: '📲 App · Installable', search: 'app apps install pwa' },
    site: { pill: 'Google Site', search: 'site sites google' },
    doc:  { pill: 'Document', search: 'doc document file drive pdf' },
    link: { pill: 'Website', search: 'link website portal' }
  };
  const typeOf = l => {
    if (l.type && TYPES[l.type]) return l.type;
    const h = host(l.url);
    if (/\.github\.io$/.test(h) || h === 'hub.logisticswarehouse.net') return 'app';
    if (h === 'sites.google.com') return 'site';
    if (h === 'drive.google.com' || h === 'docs.google.com') return 'doc';
    return 'link';
  };

  // Icon: an emoji, or an image path/URL (e.g. assets/icons/lwh-portals.png)
  const iconHtml = l => {
    const v = String(l.icon || '').trim();
    if (/^(https?:\/\/|assets\/|\.\/)/i.test(v) || /\.(png|svg|jpe?g|webp|gif)(\?.*)?$/i.test(v)) {
      return '<span class="ic ic-img"><img src="' + esc(v) + '" alt="" loading="lazy"></span>';
    }
    return '<span class="ic">' + esc(v || '🔗') + '</span>';
  };

  // Featured tiles (HUB_CONFIG.FEATURED in links.js): highlighted with a label until their end date
  const featuredOf = l => {
    const list = (window.HUB_CONFIG || {}).FEATURED || [];
    const today = new Date().toISOString().slice(0, 10);
    const norm = s => String(s || '').trim().toLowerCase().replace(/\/+$/, '');
    return list.find(f => f && (!f.until || today <= f.until) &&
      ((f.url && norm(f.url) === norm(l.url)) || (f.name && norm(f.name) === norm(l.name)))) || null;
  };

  function tile(l) {
    const t = typeOf(l), on = favs.indexOf(l.url) !== -1;
    const feat = editMode ? null : featuredOf(l);
    const featMark = feat ? '<span class="pill feat-p">★ ' + esc(feat.label || 'New') + '</span>' : '';
    const lockMark = l.locked ? '<span class="pill lock" title="Managers only">🔒 Managers</span>' : '';
    if (editMode) {
      return '<div class="ht ' + kind(l) + (l.active === false ? ' off-tile' : '') + '" data-edit="' + esc(l.id) + '">' +
        iconHtml(l) +
        '<span style="min-width:0"><b>' + esc(l.name) + '</b>' + (l.desc ? '<span class="d">' + esc(l.desc) + '</span>' : '') +
        '<span class="meta">' + (l.active === false ? '<span class="pill hidden-p">Hidden</span>' : '') + lockMark +
        '<span class="pill ' + t + '">' + TYPES[t].pill + '</span><span class="dom">' + esc(host(l.url)) + '</span></span></span>' +
        '<span class="edit-tools"><button data-mv="up" data-id="' + esc(l.id) + '" title="Move up">↑</button><button data-mv="down" data-id="' + esc(l.id) + '" title="Move down">↓</button></span></div>';
    }
    return '<a class="ht ' + kind(l) + (feat ? ' feat' : '') + '" href="' + esc(l.url) + '" target="_blank" rel="noopener">' +
      iconHtml(l) +
      '<span style="min-width:0"><b>' + esc(l.name) + '</b>' + (l.desc ? '<span class="d">' + esc(l.desc) + '</span>' : '') +
      '<span class="meta">' + featMark + lockMark + '<span class="pill ' + t + '">' + TYPES[t].pill + '</span><span class="dom">' + esc(host(l.url)) + ' ↗</span></span></span>' +
      '<button class="star' + (on ? ' on' : '') + '" data-fav="' + esc(l.url) + '" title="' + (on ? 'Unpin' : 'Pin to top') + '" aria-label="' + (on ? 'Unpin' : 'Pin') + ' ' + esc(l.name) + '">' + (on ? '★' : '☆') + '</button></a>';
  }

  function matches(l, q) {
    if (editMode) return !q || (l.name + ' ' + (l.desc || '') + ' ' + l.url).toLowerCase().indexOf(q) !== -1;
    const f = l.for || ['everyone'];
    if (who !== 'all') {
      const team = who !== 'everyone' && who !== 'customers';
      if (f.indexOf(who) === -1 && !(team && f.indexOf('everyone') !== -1)) return false;
    }
    const t = typeOf(l);
    if (show === 'apps' && t !== 'app') return false;
    if (show === 'sites' && t === 'app') return false;
    if (!q) return true;
    return (l.name + ' ' + (l.desc || '') + ' ' + (l.section || '') + ' ' + host(l.url) + ' ' + TYPES[t].search).toLowerCase().indexOf(q) !== -1;
  }

  function lockCard(n) {
    return '<button class="lock-card" data-unlock>' +
      '<span class="lk">🔒</span><span><b>' + n + ' manager tool' + (n === 1 ? '' : 's') + ' locked</b>' +
      '<span class="d">Managers: tap to unlock with your PTO manager PIN.</span></span></button>';
  }

  // ---------------------------------------------------------------- render
  function sectionsForView() {
    if (!editMode) return SECTIONS;
    return adminSections.map(title => ({ title, lockedCount: 0, links: adminRows.filter(r => r.section === title) }));
  }
  function render() {
    renderBar();
    renderNews();
    renderOut();
    const q = $('#q').value.trim().toLowerCase();
    const view = sectionsForView();
    const all = []; view.forEach(s => s.links.forEach(l => all.push(Object.assign({ section: s.title }, l))));
    const favList = editMode ? [] : favs.map(u => all.find(l => l.url === u)).filter(Boolean).filter(l => matches(l, q));
    $('#favWrap').innerHTML = favList.length
      ? '<div class="sec-title">★ Pinned <span class="n">' + favList.length + '</span></div><div class="tiles-grid">' + favList.map(tile).join('') + '</div>' : '';
    let shown = favList.length;
    $('#sections').innerHTML = view.map(s => {
      const ls = s.links.filter(l => matches(Object.assign({ section: s.title }, l), q));
      const showLock = !editMode && s.lockedCount > 0 && !q && (who === 'all' || who === 'managers');
      shown += ls.length + (showLock ? 1 : 0);
      if (!ls.length && !showLock && !editMode) return '';
      const apps = ls.filter(l => typeOf(l) === 'app'), other = ls.filter(l => typeOf(l) !== 'app');
      const group = (label, sub, list) => list.length ? '<div class="grp"><span class="grp-l">' + label + '</span><span class="grp-s">' + sub + '</span></div><div class="tiles-grid">' + list.map(tile).join('') + '</div>' : '';
      return '<div class="sec-title">' + esc(s.title) + ' <span class="n">' + (ls.length + (showLock ? s.lockedCount : 0)) + '</span></div>' +
        (showLock ? '<div class="tiles-grid" style="margin-bottom:6px">' + lockCard(s.lockedCount) + '</div>' : '') +
        (editMode ? '<div class="tiles-grid">' + ls.map(tile).join('') + '<button class="add-tile" data-add="' + esc(s.title) + '">＋ Add a tile to ' + esc(s.title) + '</button></div>'
          : group('📲 Apps', 'Open here or install on your phone / computer', apps) +
            group('🌐 Sites &amp; Links', 'Google Sites, documents and websites — open in your browser', other));
    }).join('');
    $('#none').hidden = shown > 0;
    $('#srcNote').hidden = source === 'live' || !HAS_API;
    $('#srcNote').textContent = source === 'cache' ? 'Showing the last saved list — the hub server can’t be reached right now.' : 'Showing the basic list — the hub server can’t be reached right now.';
  }

  function renderBar() {
    P.setWho(session ? session.name : '');
    const box = $('#acct');
    if (!HAS_API) { box.innerHTML = ''; return; }
    if (editMode) {
      box.innerHTML = '<span class="edit-badge">✎ Editing tiles</span><button class="btn btn-red btn-sm" data-add="">＋ New tile</button><button class="btn btn-black btn-sm" id="doneEdit">Done</button>';
      $('#doneEdit').onclick = () => { editMode = false; document.body.classList.remove('editing'); load(); };
    } else if (session) {
      box.innerHTML = (session.poster ? '<button class="btn btn-red btn-sm" id="newsBtn">📣 Announcements</button>' : '') +
        (session.admin ? '<button class="btn btn-black btn-sm" id="startEdit">✎ Edit tiles</button>' : '') +
        '<button class="btn btn-ghost btn-sm" id="lockBtn">🔒 Lock</button>';
      if (session.poster) $('#newsBtn').onclick = manageNews;
      if (session.admin) $('#startEdit').onclick = startEdit;
      $('#lockBtn').onclick = () => { lockUp(); P.toast('Manager tools locked on this device.'); };
    } else {
      box.innerHTML = '<button class="btn btn-ghost btn-sm" data-unlock>🔑 Manager sign-in</button>';
    }
  }

  function lockUp(silent) {
    session = null; P.store.del(K.sess); editMode = false; document.body.classList.remove('editing');
    if (!silent) load();
  }

  // ---------------------------------------------------------------- unlock
  async function unlock() {
    let managers = [];
    P.busy('Loading…');
    try { managers = await api('managers'); } catch (e) { P.busy(false); return P.toast(e.message, true); }
    P.busy(false);
    const v = await P.modal({
      title: 'Manager Sign-in',
      html: '<p style="margin-bottom:14px">Use the same <b>4-digit PIN</b> you use in the PTO Manager app.</p>' +
        '<div class="field"><label for="ulName">Your name</label><select class="input" id="ulName"><option value="">— Select —</option>' +
        managers.map(m => '<option value="' + esc(m.id) + '">' + esc(m.name) + '</option>').join('') + '</select></div>' +
        '<div class="field"><label for="ulPin">PIN</label><input class="input pin" id="ulPin" type="password" inputmode="numeric" maxlength="4" placeholder="••••"></div>',
      buttons: [{ label: 'Cancel', cls: 'btn-ghost', value: null }, {
        label: 'Unlock', cls: 'btn-red',
        validate: m => !$('#ulName', m).value ? 'Pick your name.' : !/^\d{4}$/.test($('#ulPin', m).value) ? 'Enter your 4-digit PIN.' : '',
        value: m => ({ id: $('#ulName', m).value, pin: $('#ulPin', m).value })
      }]
    });
    if (!v) return;
    P.busy('Checking PIN…');
    try {
      const r = await api('unlock', v, 45000);
      session = { token: r.token, name: r.name, admin: r.admin, expires: r.expires };
      P.store.set(K.sess, session, true);
      P.busy(false);
      P.toast('Welcome, ' + P.firstName(r.name) + ' — manager tools unlocked on this device.');
      load();
    } catch (e) { P.busy(false); P.toast(e.message, true); }
  }

  // ------------------------------------------------------------------ edit
  async function startEdit() {
    P.busy('Opening editor…');
    try { await refreshAdmin(); editMode = true; document.body.classList.add('editing'); P.busy(false); render(); window.scrollTo(0, 0); }
    catch (e) { P.busy(false); P.toast(e.message, true); }
  }
  async function refreshAdmin() {
    const d = await api('admin.list');
    adminRows = d.rows || []; adminSections = d.sections || [];
  }

  async function editTile(id, sectionForNew) {
    const r = id ? adminRows.find(x => x.id === id) : { section: sectionForNew || adminSections[0] || '', for: ['everyone'], active: true, locked: false, icon: '🔗', type: '' };
    if (!r) return;
    const FOR = [['everyone', 'Everyone'], ['warehouse', 'Warehouse'], ['transportation', 'Transportation'], ['managers', 'Managers'], ['hr', 'HR'], ['customers', 'Customers']];
    const v = await P.modal({
      title: id ? 'Edit Tile' : 'New Tile', wide: true,
      html: '<div class="row-2"><div class="field"><label for="etName">Name</label><input class="input" id="etName" maxlength="80" value="' + esc(r.name || '') + '"></div>' +
        '<div class="field"><label for="etSec">Section</label><input class="input" id="etSec" list="etSecs" maxlength="40" value="' + esc(r.section || '') + '">' +
        '<datalist id="etSecs">' + adminSections.map(s => '<option value="' + esc(s) + '">').join('') + '</datalist><div class="hint">Pick one or type a new section.</div></div></div>' +
        '<div class="field"><label for="etUrl">Link</label><input class="input" id="etUrl" type="url" placeholder="https://…" value="' + esc(r.url || '') + '"></div>' +
        '<div class="row-2"><div class="field"><label for="etDesc">Short description</label><input class="input" id="etDesc" maxlength="140" value="' + esc(r.desc || '') + '"></div>' +
        '<div class="row-2"><div class="field"><label for="etIcon">Icon (emoji or image path)</label><input class="input" id="etIcon" maxlength="300" value="' + esc(r.icon || '') + '" style="font-size:22px;text-align:center"></div>' +
        '<div class="field"><label for="etType">Kind</label><select class="input" id="etType">' +
        [['', 'Auto-detect'], ['app', 'App'], ['site', 'Google Site'], ['doc', 'Document'], ['link', 'Website']].map(o => '<option value="' + o[0] + '"' + ((r.type || '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') +
        '</select></div></div></div>' +
        '<div class="field"><label>Who is it for?</label><div class="chips" id="etFor">' +
        FOR.map(f => '<button type="button" class="chip' + ((r.for || []).indexOf(f[0]) !== -1 ? ' on' : '') + '" data-f="' + f[0] + '">' + f[1] + '</button>').join('') + '</div></div>' +
        '<label class="check"><input type="checkbox" id="etLock"' + (r.locked ? ' checked' : '') + '> 🔒 <b>Managers only</b> — hidden until a manager signs in with their PIN</label>' +
        '<label class="check" style="margin-top:-8px"><input type="checkbox" id="etActive"' + (r.active !== false ? ' checked' : '') + '> Show on the hub (uncheck to hide without deleting)</label>',
      buttons: (id ? [{ label: 'Delete', cls: 'btn-ghost', value: 'delete' }] : []).concat([
        { label: 'Cancel', cls: 'btn-ghost', value: null },
        {
          label: 'Save', cls: 'btn-red',
          validate: m => !$('#etName', m).value.trim() ? 'Name is required.' : !/^https?:\/\/\S+$/i.test($('#etUrl', m).value.trim()) ? 'Link must start with https://' : !$('#etSec', m).value.trim() ? 'Pick a section.' : '',
          value: m => ({
            id: id || '', name: $('#etName', m).value.trim(), section: $('#etSec', m).value.trim(), url: $('#etUrl', m).value.trim(),
            desc: $('#etDesc', m).value.trim(), icon: $('#etIcon', m).value.trim(), type: $('#etType', m).value,
            for: $$('#etFor .chip.on', m).map(c => c.dataset.f), locked: $('#etLock', m).checked, active: $('#etActive', m).checked
          })
        }])
    });
    if (!v) return;
    if (v === 'delete') {
      if (!(await P.confirmBox('Delete tile?', '<p>Remove <b>' + esc(r.name) + '</b> from the hub for everyone? To keep it but hide it, uncheck “Show on the hub” instead.</p>', 'Delete', 'btn-red'))) return;
      P.busy('Deleting…');
      try { await api('admin.delete', { id }); await refreshAdmin(); P.busy(false); P.toast('Deleted.'); render(); }
      catch (e) { P.busy(false); P.toast(e.message, true); }
      return;
    }
    P.busy('Saving…');
    try { await api('admin.save', { link: v }); await refreshAdmin(); P.busy(false); P.toast('Saved — live on the hub for everyone.'); render(); }
    catch (e) { P.busy(false); P.toast(e.message, true); }
  }


  // ---------------------------------------------------------- announcements
  const ANN_T = {
    alert: { icon: '🚨', label: 'Alert', cls: 'alert' },
    notice: { icon: '📅', label: 'Notice', cls: 'notice' },
    celebrate: { icon: '🎉', label: 'Celebration', cls: 'celebrate' }
  };
  const annBody = t => esc(t || '').replace(/\n/g, '<br>');
  const annWhen = a => {
    if (a.type === 'alert') return a.end ? 'Through ' + P.fmt(a.end, 'dow') : '';
    if (a.start && a.end && a.start !== a.end) return P.fmt(a.start, 'md') + ' – ' + P.fmt(a.end, 'md');
    return a.start ? P.fmt(a.start, 'dow') : '';
  };
  const annLink = (a, cls) => a.link ? '<a class="' + cls + '" href="' + esc(a.link) + '" target="_blank" rel="noopener">' + esc(a.linkLabel || 'Learn more') + ' →</a>' : '';
  function renderNews() {
    const alerts = editMode ? [] : ANN.filter(a => a.type === 'alert');
    const news = editMode ? [] : ANN.filter(a => a.type !== 'alert');
    $('#alerts').innerHTML = (editMode ? '' : NWS.map(nwsBar).join('')) + alerts.map(a =>
      '<div class="alert-bar"><span class="ai">🚨</span><div class="at"><b>' + esc(a.title) + '</b>' +
      (a.message ? '<div>' + annBody(a.message) + '</div>' : '') +
      '<div class="am">' + esc(annWhen(a)) + (a.audience === 'managers' ? ' · Managers' : '') + '</div></div>' + annLink(a, 'al') + '</div>').join('');
    const box = $('#news');
    if (!news.length) { box.innerHTML = ''; box.hidden = true; return; }
    box.hidden = false;
    const MAX = 6, more = news.length > MAX && !box.dataset.all;
    box.innerHTML = '<div class="sec-title">📣 Company News <span class="n">' + news.length + '</span></div><div class="news-grid">' +
      (more ? news.slice(0, MAX) : news).map(a => {
        const t = ANN_T[a.type] || ANN_T.notice;
        return '<article class="news ' + t.cls + '"><div class="nh"><span class="ni">' + t.icon + '</span><span class="nk">' + t.label +
          (a.pinned ? ' · 📌' : '') + (a.audience === 'managers' ? ' · 🔒 Managers' : '') + '</span><span class="nd">' + esc(annWhen(a)) + '</span></div>' +
          '<h3>' + esc(a.title) + '</h3>' + (a.message ? '<p>' + annBody(a.message) + '</p>' : '') + annLink(a, 'nl') + '</article>';
      }).join('') + '</div>' +
      (more ? '<button class="btn btn-ghost btn-sm" id="newsAll" style="margin-top:10px">Show all ' + news.length + '</button>' : '');
    const all = $('#newsAll'); if (all) all.onclick = () => { box.dataset.all = '1'; renderNews(); };
  }

  let annRows = [];
  async function manageNews() {
    P.busy('Loading…');
    try { annRows = (await api('ann.list')).rows || []; } catch (e) { P.busy(false); return P.toast(e.message, true); }
    P.busy(false);
    const today = P.ymd(P.today());
    const status = a => !a.active ? ['Hidden', 'b-cancelled'] : (a.start && a.start > today) ? ['Scheduled', 'b-pending'] : (a.end && a.end < today) ? ['Ended', 'b-cancelled'] : ['Live', 'b-approved'];
    const v = await P.modal({
      title: 'Announcements', wide: true,
      html: '<div class="btn-row" style="margin-bottom:14px">' +
        '<button class="btn btn-red btn-sm" data-newann="alert">🚨 New alert</button>' +
        '<button class="btn btn-black btn-sm" data-newann="notice">📅 New notice</button>' +
        '<button class="btn btn-ghost btn-sm" data-newann="celebrate">🎉 New celebration</button></div>' +
        (annRows.length ? '<div class="table-wrap"><table class="tbl"><thead><tr><th>Type</th><th>Headline</th><th>Dates</th><th>Status</th><th></th></tr></thead><tbody>' +
          annRows.map(a => { const st = status(a); return '<tr><td>' + (ANN_T[a.type] || ANN_T.notice).icon + ' ' + (ANN_T[a.type] || ANN_T.notice).label + '</td><td><b>' + esc(a.title) + '</b>' +
            (a.audience === 'managers' ? ' <span class="badge b-denied">Managers</span>' : '') + '</td><td>' + esc((a.start ? P.fmt(a.start, 'md') : 'Now') + ' → ' + (a.end ? P.fmt(a.end, 'md') : 'No end')) + '</td>' +
            '<td><span class="badge ' + st[1] + '">' + st[0] + '</span></td><td><button class="btn btn-ghost btn-sm" data-editann="' + esc(a.id) + '">Edit</button></td></tr>'; }).join('') +
          '</tbody></table></div>' : '<div class="empty">No announcements yet.</div>'),
      buttons: [{ label: 'Close', cls: 'btn-black', value: null }]
    });
    return v;
  }

  async function editNews(id, type) {
    const a = id ? annRows.find(x => x.id === id) : { type: type || 'notice', active: true, audience: 'everyone', start: P.ymd(P.today()), end: type === 'alert' ? P.ymd(P.today()) : '' };
    if (!a) return;
    const hint = {
      alert: 'Shows as a red banner across the top of the hub. Use for closures, delayed starts and emergencies. It disappears after the end date.',
      notice: 'A news card, e.g. “Open enrollment starts Dec 1”. Schedule it ahead with a start date.',
      celebrate: 'A congratulations card, e.g. “Congratulations Jane Doe — 10 years with LWH!”'
    };
    const v = await P.modal({
      title: id ? 'Edit Announcement' : 'New ' + (ANN_T[a.type] || ANN_T.notice).label, wide: true,
      html: '<div class="field"><label>Type</label><div class="seg" id="anType">' + Object.keys(ANN_T).map(k =>
          '<button type="button" data-t="' + k + '"' + (a.type === k ? ' class="on"' : '') + '>' + ANN_T[k].icon + ' ' + ANN_T[k].label + '</button>').join('') + '</div>' +
        '<div class="hint" id="anHint">' + hint[a.type] + '</div></div>' +
        '<div class="field"><label for="anTitle">Headline</label><input class="input" id="anTitle" maxlength="120" value="' + esc(a.title || '') + '" placeholder="' + (a.type === 'alert' ? 'e.g. All locations closed today — ice' : a.type === 'celebrate' ? 'e.g. Congratulations Jane Doe — 10 Years!' : 'e.g. Open Enrollment starts December 1') + '"></div>' +
        '<div class="field"><label for="anMsg">Message <span style="text-transform:none;letter-spacing:0;color:var(--muted)">(optional)</span></label><textarea class="input" id="anMsg" maxlength="2000">' + esc(a.message || '') + '</textarea></div>' +
        '<div class="row-2"><div class="field"><label for="anLink">Link <span style="text-transform:none;letter-spacing:0;color:var(--muted)">(optional)</span></label><input class="input" id="anLink" type="url" placeholder="https://…" value="' + esc(a.link || '') + '"></div>' +
        '<div class="field"><label for="anLinkL">Link text</label><input class="input" id="anLinkL" maxlength="40" placeholder="Learn more" value="' + esc(a.linkLabel || '') + '"></div></div>' +
        '<div class="row-2"><div class="field"><label for="anStart">Show from</label><input class="input" type="date" id="anStart" value="' + esc(a.start || '') + '"></div>' +
        '<div class="field"><label for="anEnd">Show through</label><input class="input" type="date" id="anEnd" value="' + esc(a.end || '') + '"><div class="hint">Leave blank to keep it up until you remove it.</div></div></div>' +
        '<label class="check"><input type="checkbox" id="anMgr"' + (a.audience === 'managers' ? ' checked' : '') + '> 🔒 Managers only (shows after manager sign-in)</label>' +
        '<label class="check" style="margin-top:-8px"><input type="checkbox" id="anPin"' + (a.pinned ? ' checked' : '') + '> 📌 Pin to the front of Company News</label>' +
        '<label class="check" style="margin-top:-8px"><input type="checkbox" id="anActive"' + (a.active !== false ? ' checked' : '') + '> Show on the hub</label>' +
        '<div class="note" style="margin-top:4px;font-size:13px">The hub is a public page. Keep pay, benefit costs and health details off the board — link to a restricted doc instead.</div>',
      buttons: (id ? [{ label: 'Delete', cls: 'btn-ghost', value: 'delete' }] : []).concat([
        { label: 'Cancel', cls: 'btn-ghost', value: null },
        {
          label: id ? 'Save' : 'Post', cls: 'btn-red',
          validate: m => { if (!$('#anTitle', m).value.trim()) return 'Add a headline.'; const l = $('#anLink', m).value.trim(); if (l && !/^https?:\/\/\S+$/i.test(l)) return 'Link must start with https://';
            const s1 = $('#anStart', m).value, e1 = $('#anEnd', m).value; if (s1 && e1 && e1 < s1) return '“Show through” is before “Show from”.'; return ''; },
          value: m => ({
            id: id || '', type: ($('#anType .on', m) || {}).dataset ? $('#anType .on', m).dataset.t : 'notice',
            title: $('#anTitle', m).value.trim(), message: $('#anMsg', m).value.trim(), link: $('#anLink', m).value.trim(), linkLabel: $('#anLinkL', m).value.trim(),
            start: $('#anStart', m).value, end: $('#anEnd', m).value, audience: $('#anMgr', m).checked ? 'managers' : 'everyone',
            pinned: $('#anPin', m).checked, active: $('#anActive', m).checked
          })
        }])
    });
    if (!v) return manageNews();
    if (v === 'delete') {
      if (!(await P.confirmBox('Delete announcement?', '<p>Remove <b>' + esc(a.title) + '</b> for everyone?</p>', 'Delete', 'btn-red'))) return manageNews();
      P.busy('Deleting…');
      try { await api('ann.delete', { id }); P.busy(false); P.toast('Deleted.'); await load(); } catch (e) { P.busy(false); P.toast(e.message, true); }
      return manageNews();
    }
    P.busy(id ? 'Saving…' : 'Posting…');
    try {
      await api('ann.save', { ann: v });
      P.busy(false);
      const today = P.ymd(P.today());
      P.toast(v.start && v.start > today ? 'Scheduled — it will appear on ' + P.fmt(v.start, 'dow') + '.' : (id ? 'Saved.' : 'Posted — live on the hub now.'));
      await load();
    } catch (e) { P.busy(false); P.toast(e.message, true); }
    manageNews();
  }

  // ---------------------------------------------------------------- events
  $('#q').addEventListener('input', render);
  $('#q').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !editMode) { const first = $('a.ht'); if (first) window.open(first.href, '_blank', 'noopener'); }
    if (e.key === 'Escape') { $('#q').value = ''; render(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== $('#q') && !document.querySelector('.modal-bg')) { e.preventDefault(); $('#q').focus(); }
  });
  $$('#show .chip').forEach(c => {
    c.classList.toggle('on', c.dataset.s === show);
    c.onclick = () => { show = c.dataset.s; P.store.set(K.type, show, true); $$('#show .chip').forEach(x => x.classList.toggle('on', x === c)); render(); };
  });
  $$('#who .chip').forEach(c => {
    c.classList.toggle('on', c.dataset.w === who);
    c.onclick = () => { who = c.dataset.w; P.store.set(K.who, who, true); $$('#who .chip').forEach(x => x.classList.toggle('on', x === c)); render(); };
  });
  $('#howInstall').onclick = () => P.modal({
    title: 'Installing an App',
    html: '<p style="margin-bottom:14px">Tiles marked <span class="pill app">📲 App · Installable</span> can be added to your phone or computer like a regular app: their own icon, full screen, and quicker to open. Open the app first, then:</p>' +
      '<dl class="kv"><dt>iPhone / iPad</dt><dd>In <b>Safari</b>, tap <b>Share</b> (square with arrow) → <b>Add to Home Screen</b> → Add.</dd>' +
      '<dt>Android</dt><dd>In <b>Chrome</b>, tap <b>⋮</b> → <b>Install app</b> (or <b>Add to Home screen</b>).</dd>' +
      '<dt>Computer</dt><dd>In <b>Chrome</b> or <b>Edge</b>, click the <b>install icon</b> at the right end of the address bar (or ⋮ → Save and share → Install).</dd></dl>' +
      '<p class="hint" style="margin-top:14px"><b>Sites &amp; Links</b> (Google Sites, documents, websites) just open in your browser. Bookmark them as usual.</p>',
    buttons: [{ label: 'Got it', cls: 'btn-black', value: true }]
  });
  document.addEventListener('click', async e => {
    const fc = e.target.closest('#etFor .chip');
    if (fc) { fc.classList.toggle('on'); return; }
    const at = e.target.closest('#anType button');
    if (at) {
      $$('#anType button').forEach(x => x.classList.toggle('on', x === at));
      const H = { alert: 'Shows as a red banner across the top of the hub. Use for closures, delayed starts and emergencies. It disappears after the end date.', notice: 'A news card, e.g. “Open enrollment starts Dec 1”. Schedule it ahead with a start date.', celebrate: 'A congratulations card, e.g. “Congratulations Jane Doe — 10 years with LWH!”' };
      $('#anHint').textContent = H[at.dataset.t];
      return;
    }
    const na = e.target.closest('[data-newann]');
    if (na) { const bg = na.closest('.modal-bg'); if (bg) bg.remove(); return editNews('', na.dataset.newann); }
    const ea = e.target.closest('[data-editann]');
    if (ea) { const bg = ea.closest('.modal-bg'); if (bg) bg.remove(); return editNews(ea.dataset.editann); }
    const fav = e.target.closest('[data-fav]');
    if (fav) {
      e.preventDefault(); e.stopPropagation();
      const u = fav.dataset.fav, i = favs.indexOf(u);
      if (i === -1) favs.push(u); else favs.splice(i, 1);
      P.store.set(K.fav, favs, true);
      return render();
    }
    if (e.target.closest('[data-unlock]') || e.target.closest('[data-relogin]')) return unlock();
    const mv = e.target.closest('[data-mv]');
    if (mv && editMode) {
      e.stopPropagation();
      try { await api('admin.move', { id: mv.dataset.id, dir: mv.dataset.mv }); await refreshAdmin(); render(); } catch (err) { P.toast(err.message, true); }
      return;
    }
    const add = e.target.closest('[data-add]');
    if (add && editMode) return editTile('', add.dataset.add);
    const ed = e.target.closest('[data-edit]');
    if (ed && editMode) return editTile(ed.dataset.edit);
  });

  render();
  load();
  loadNWS();
  setInterval(() => { loadNWS(); if (session && !document.hidden) loadOut(); }, 10 * 60000);
})();
