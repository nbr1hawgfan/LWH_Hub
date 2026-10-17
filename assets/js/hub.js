/* ==========================================================================
   LWH HUB — page logic (tiles come from links.js)
   ========================================================================== */
(function () {
  'use strict';
  const P = window.PTO, $ = P.$, $$ = P.$$, esc = P.esc;
  const SECTIONS = (window.HUB_SECTIONS || []).map(s => Object.assign({}, s, { links: (s.links || []).filter(l => l && l.name && l.url) }));
  const FAV_KEY = 'lwhhub_favs', WHO_KEY = 'lwhhub_who';
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
    if (f.indexOf('office') !== -1) return 'off';
    if (f.indexOf('customers') !== -1) return 'cust';
    return '';
  };
  function tile(l) {
    const on = favs.indexOf(l.url) !== -1;
    return '<a class="ht ' + kind(l) + '" href="' + esc(l.url) + '" target="_blank" rel="noopener">' +
      '<span class="ic">' + esc(l.icon || '🔗') + '</span>' +
      '<span style="min-width:0"><b>' + esc(l.name) + '</b>' + (l.desc ? '<span class="d">' + esc(l.desc) + '</span>' : '') +
      '<span class="dom">' + esc(host(l.url)) + ' ↗</span></span>' +
      '<button class="star' + (on ? ' on' : '') + '" data-fav="' + esc(l.url) + '" title="' + (on ? 'Unpin' : 'Pin to top') + '" aria-label="' + (on ? 'Unpin' : 'Pin') + ' ' + esc(l.name) + '">' + (on ? '★' : '☆') + '</button></a>';
  }
  function matches(l, q) {
    if (who !== 'all' && (l.for || ['everyone']).indexOf(who) === -1) return false;
    if (!q) return true;
    return (l.name + ' ' + (l.desc || '') + ' ' + l.section + ' ' + host(l.url)).toLowerCase().indexOf(q) !== -1;
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
      return '<div class="sec-title">' + esc(s.title) + ' <span class="n">' + ls.length + '</span></div><div class="tiles-grid">' + ls.map(tile).join('') + '</div>';
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
