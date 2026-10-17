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
      source = 'live';
      if (session && !d.session) lockUp(true);
      if (session && d.session) { session.admin = !!d.session.admin; P.store.set(K.sess, session, true); }
      // only the public list is cached on the device
      if (!session) { try { localStorage.setItem(K.cache, JSON.stringify({ t: Date.now(), s: SECTIONS })); } catch (e) {} }
    } catch (e) {
      let c = null; try { c = JSON.parse(localStorage.getItem(K.cache) || 'null'); } catch (x) {}
      if (c && c.s) { SECTIONS = c.s; source = 'cache'; } else { SECTIONS = fromLinksJs(); source = 'fallback'; }
    }
    render();
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

  function tile(l) {
    const t = typeOf(l), on = favs.indexOf(l.url) !== -1;
    const lockMark = l.locked ? '<span class="pill lock" title="Managers only">🔒 Managers</span>' : '';
    if (editMode) {
      return '<div class="ht ' + kind(l) + (l.active === false ? ' off-tile' : '') + '" data-edit="' + esc(l.id) + '">' +
        '<span class="ic">' + esc(l.icon || '🔗') + '</span>' +
        '<span style="min-width:0"><b>' + esc(l.name) + '</b>' + (l.desc ? '<span class="d">' + esc(l.desc) + '</span>' : '') +
        '<span class="meta">' + (l.active === false ? '<span class="pill hidden-p">Hidden</span>' : '') + lockMark +
        '<span class="pill ' + t + '">' + TYPES[t].pill + '</span><span class="dom">' + esc(host(l.url)) + '</span></span></span>' +
        '<span class="edit-tools"><button data-mv="up" data-id="' + esc(l.id) + '" title="Move up">↑</button><button data-mv="down" data-id="' + esc(l.id) + '" title="Move down">↓</button></span></div>';
    }
    return '<a class="ht ' + kind(l) + '" href="' + esc(l.url) + '" target="_blank" rel="noopener">' +
      '<span class="ic">' + esc(l.icon || '🔗') + '</span>' +
      '<span style="min-width:0"><b>' + esc(l.name) + '</b>' + (l.desc ? '<span class="d">' + esc(l.desc) + '</span>' : '') +
      '<span class="meta">' + lockMark + '<span class="pill ' + t + '">' + TYPES[t].pill + '</span><span class="dom">' + esc(host(l.url)) + ' ↗</span></span></span>' +
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
      box.innerHTML = '<span class="edit-badge">✎ Editing the hub</span><button class="btn btn-red btn-sm" data-add="">＋ New tile</button><button class="btn btn-black btn-sm" id="doneEdit">Done</button>';
      $('#doneEdit').onclick = () => { editMode = false; document.body.classList.remove('editing'); load(); };
    } else if (session) {
      box.innerHTML = (session.admin ? '<button class="btn btn-black btn-sm" id="startEdit">✎ Edit hub</button>' : '') +
        '<button class="btn btn-ghost btn-sm" id="lockBtn">🔒 Lock</button>';
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
        '<div class="row-2"><div class="field"><label for="etIcon">Icon (emoji)</label><input class="input" id="etIcon" maxlength="8" value="' + esc(r.icon || '') + '" style="font-size:22px;text-align:center"></div>' +
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
    const fav = e.target.closest('[data-fav]');
    if (fav) {
      e.preventDefault(); e.stopPropagation();
      const u = fav.dataset.fav, i = favs.indexOf(u);
      if (i === -1) favs.push(u); else favs.splice(i, 1);
      P.store.set(K.fav, favs, true);
      return render();
    }
    if (e.target.closest('[data-unlock]')) return unlock();
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
})();
