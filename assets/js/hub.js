/* ==========================================================================
   LWH HUB — page logic (tiles come from links.js)
   ========================================================================== */
(function () {
  'use strict';
  const P = window.PTO, $ = P.$, $$ = P.$$, esc = P.esc;
  const SECTIONS = (window.HUB_SECTIONS || []).map(s => Object.assign({}, s, { links: (s.links || []).filter(l => l && l.name && l.url) }));
  const FAV_KEY = 'lwhhub_favs', WHO_KEY = 'lwhhub_who', TYPE_KEY = 'lwhhub_type';
  let show = P.store.get(TYPE_KEY) || 'all';
  let favs = P.store.get(FAV_KEY) || [];
  let who = P.store.get(WHO_KEY) || 'all';
  if (!Array.isArray(favs)) favs = [];

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

  // ------------------------------------------------------------------ tiles
  const all = [];
  SECTIONS.forEach(s => s.links.forEach(l => all.push(Object.assign({ section: s.title }, l))));
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
  // What kind of thing a tile is: an installable app, a Google Site, a document, or a web link.
  // Auto-detected from the address; set  type: 'app' | 'site' | 'doc' | 'link'  in links.js to override.
  const TYPES = {
    app:  { label: 'App', pill: '📲 App · Installable', search: 'app apps install pwa' },
    site: { label: 'Google Site', pill: 'Google Site', search: 'site sites google' },
    doc:  { label: 'Document', pill: 'Document', search: 'doc document file drive pdf' },
    link: { label: 'Website', pill: 'Website', search: 'link website portal' }
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
    const on = favs.indexOf(l.url) !== -1;
    const t = typeOf(l);
    return '<a class="ht ' + kind(l) + '" href="' + esc(l.url) + '" target="_blank" rel="noopener">' +
      '<span class="ic">' + esc(l.icon || '🔗') + '</span>' +
      '<span style="min-width:0"><b>' + esc(l.name) + '</b>' + (l.desc ? '<span class="d">' + esc(l.desc) + '</span>' : '') +
      '<span class="meta"><span class="pill ' + t + '">' + TYPES[t].pill + '</span><span class="dom">' + esc(host(l.url)) + ' ↗</span></span></span>' +
      '<button class="star' + (on ? ' on' : '') + '" data-fav="' + esc(l.url) + '" title="' + (on ? 'Unpin' : 'Pin to top') + '" aria-label="' + (on ? 'Unpin' : 'Pin') + ' ' + esc(l.name) + '">' + (on ? '★' : '☆') + '</button></a>';
  }
  function matches(l, q) {
    const f = l.for || ['everyone'];
    // a team filter (Warehouse, Transportation, Managers, HR) also shows the "everyone" tiles
    if (who !== 'all') {
      const team = who !== 'everyone' && who !== 'customers';
      if (f.indexOf(who) === -1 && !(team && f.indexOf('everyone') !== -1)) return false;
    }
    const t = typeOf(l);
    if (show === 'apps' && t !== 'app') return false;
    if (show === 'sites' && t === 'app') return false;
    if (!q) return true;
    return (l.name + ' ' + (l.desc || '') + ' ' + l.section + ' ' + host(l.url) + ' ' + TYPES[t].search).toLowerCase().indexOf(q) !== -1;
  }
  function render() {
    const q = $('#q').value.trim().toLowerCase();
    const favList = favs.map(u => all.find(l => l.url === u)).filter(Boolean).filter(l => matches(l, q));
    $('#favWrap').innerHTML = favList.length
      ? '<div class="sec-title">★ Pinned <span class="n">' + favList.length + '</span></div><div class="tiles-grid">' + favList.map(tile).join('') + '</div>' : '';
    let shown = favList.length;
    $('#sections').innerHTML = SECTIONS.map(s => {
      const ls = s.links.filter(l => matches(Object.assign({ section: s.title }, l), q));
      shown += ls.length;
      if (!ls.length) return '';
      const apps = ls.filter(l => typeOf(l) === 'app'), other = ls.filter(l => typeOf(l) !== 'app');
      const group = (label, sub, list) => list.length ? '<div class="grp"><span class="grp-l">' + label + '</span><span class="grp-s">' + sub + '</span></div><div class="tiles-grid">' + list.map(tile).join('') + '</div>' : '';
      return '<div class="sec-title">' + esc(s.title) + ' <span class="n">' + ls.length + '</span></div>' +
        group('📲 Apps', 'Open here or install on your phone / computer', apps) +
        group('🌐 Sites &amp; Links', 'Google Sites, documents and websites — open in your browser', other);
    }).join('');
    $('#none').hidden = shown > 0;
  }

  $('#q').addEventListener('input', render);
  $('#q').addEventListener('keydown', e => {
    if (e.key === 'Enter') { const first = $('.ht'); if (first) window.open(first.href, '_blank', 'noopener'); }
    if (e.key === 'Escape') { $('#q').value = ''; render(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== $('#q')) { e.preventDefault(); $('#q').focus(); }
  });
  $$('#show .chip').forEach(c => {
    c.classList.toggle('on', c.dataset.s === show);
    c.onclick = () => { show = c.dataset.s; P.store.set(TYPE_KEY, show, true); $$('#show .chip').forEach(x => x.classList.toggle('on', x === c)); render(); };
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
  $$('#who .chip').forEach(c => {
    c.classList.toggle('on', c.dataset.w === who);
    c.onclick = () => { who = c.dataset.w; P.store.set(WHO_KEY, who, true); $$('#who .chip').forEach(x => x.classList.toggle('on', x === c)); render(); };
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-fav]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const u = b.dataset.fav, i = favs.indexOf(u);
    if (i === -1) favs.push(u); else favs.splice(i, 1);
    P.store.set(FAV_KEY, favs, true);
    render();
  });
  render();
})();
