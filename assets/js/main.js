// Nick Festas — prévia. Sem dependências. O HTML funciona sem este arquivo.
const doc = document;
const root = doc.documentElement;
root.classList.add('js');

const WHATSAPP = '5548991585879';
const waURL = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t) => t * t * t;
const smoothstep = (a, b, t) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };

/* ---------- WhatsApp: mensagem por ocasião ---------- */
doc.querySelectorAll('[data-wa]').forEach((a) => {
  const text = a.getAttribute('data-wa');
  if (text) a.href = waURL(text);
});

/* ---------- Cabeçalho ---------- */
const header = doc.querySelector('[data-header]');
const updateHeader = () => header && header.classList.toggle('is-solid', window.scrollY > 24);
updateHeader();

/* ---------- Menu (celular) ---------- */
const toggle = doc.querySelector('[data-menu-toggle]');
const menu = doc.querySelector('[data-menu]');
function setMenu(open, moveFocus) {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
  root.classList.toggle('menu-open', open);
  if (moveFocus) (open ? menu.querySelector('a') : toggle)?.focus();
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true', true));
menu?.addEventListener('click', (e) => {
  if (e.target.closest('a') && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, false);
});
doc.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') setMenu(false, true);
});
matchMedia('(min-width: 960px)').addEventListener('change', (e) => { if (e.matches) setMenu(false, false); });

/* ---------- Revelações ao entrar na tela ---------- */
function whenVisible(el, cb, threshold = 0.3) {
  if (!el) return;
  if (reduceMQ.matches || !('IntersectionObserver' in window)) { cb(); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { cb(); io.disconnect(); }
  }, { threshold });
  io.observe(el);
}
const checklist = doc.querySelector('[data-checklist]');
if (checklist) {
  [...checklist.children].forEach((li, i) => li.style.setProperty('--d', `${i * 170}ms`));
  whenVisible(checklist, () => checklist.classList.add('is-on'), 0.35);
}
const steps = doc.querySelector('[data-steps]');
whenVisible(steps, () => steps.classList.add('is-on'), 0.4);
doc.querySelectorAll('.detail').forEach((d) => whenVisible(d, () => d.classList.add('is-in'), 0.2));

const orcamento = doc.getElementById('orcamento');
if (orcamento && 'IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => root.classList.toggle('form-in', e.isIntersecting), { threshold: 0.15 }).observe(orcamento);
}
menu?.addEventListener('focusout', (e) => {
  if (toggle?.getAttribute('aria-expanded') === 'true' && !menu.contains(e.relatedTarget) && e.relatedTarget !== toggle) setMenu(false, false);
});

const footer = doc.querySelector('.site-footer');
if (footer && 'IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => root.classList.toggle('footer-in', e.isIntersecting)).observe(footer);
}

/* ---------- CTA magnético (só ponteiro fino) ---------- */
if (finePointer.matches && !reduceMQ.matches) {
  doc.querySelectorAll('[data-magnetic]').forEach((btn) => {
    let box = null;
    btn.addEventListener('pointerenter', () => { box = btn.getBoundingClientRect(); });
    btn.addEventListener('pointermove', (e) => {
      box = box || btn.getBoundingClientRect();
      const x = (e.clientX - (box.left + box.width / 2)) / box.width;
      const y = (e.clientY - (box.top + box.height / 2)) / box.height;
      btn.style.transform = `translate(${(x * 8).toFixed(1)}px, ${(y * 6).toFixed(1)}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; box = null; });
  });
}

/* ---------- Formulário: monta a mensagem e abre o WhatsApp ---------- */
const form = doc.querySelector('[data-form]');
if (form) {
  const fields = form.elements;
  const tipo = fields.namedItem('tipo');
  const erro = doc.getElementById('f-tipo-erro');
  const status = form.querySelector('[data-status]');
  const clearError = () => { tipo.removeAttribute('aria-invalid'); erro.hidden = true; };
  tipo.addEventListener('change', () => { if (tipo.value) clearError(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!tipo.value) {
      tipo.setAttribute('aria-invalid', 'true');
      erro.hidden = false;
      status.textContent = '';
      tipo.focus();
      return;
    }
    clearError();
    const value = (name) => (fields.namedItem(name)?.value || '').trim();
    const lines = ['Olá, Nick Festas! Quero um orçamento.', `• Tipo de festa: ${tipo.value}`, `• Local: ${value('local') || 'Ainda não sei'}`];
    if (value('data')) lines.push(`• Data aproximada: ${value('data')}`);
    if (value('convidados')) lines.push(`• Convidados (aprox.): ${value('convidados')}`);
    if (value('tema')) lines.push(`• Tema ou ideia: ${value('tema')}`);
    const link = doc.createElement('a');
    link.href = waURL(lines.join('\n'));
    link.target = '_blank';
    link.rel = 'noopener';
    link.click();
    status.textContent = 'O WhatsApp abriu em outra aba com a sua mensagem pronta. Revise e envie por lá.';
  });
}

/* ---------- Troca de cenário ---------- */
function initStage() {
  const stage = doc.querySelector('.stage');
  if (!stage) return;
  const sticky = stage.querySelector('.stage__sticky');
  const scenes = [...stage.querySelectorAll('.scene')];
  const imgs = scenes.map((s) => s.querySelector('img'));
  const caps = scenes.map((s) => s.querySelector('figcaption span')?.textContent || '');
  const words = [...stage.querySelectorAll('[data-words] span')];
  const chips = [...stage.querySelectorAll('.chip')];
  const chipRow = stage.querySelector('.chips');
  const countEl = stage.querySelector('[data-count]');
  const capEl = stage.querySelector('[data-cap]');
  const svg = stage.querySelector('[data-balloons]');
  const N = scenes.length;
  const HOLD = 0.26;   // parte de cada trecho em que a cena fica parada
  const TRANS = 0.62;  // parte do trecho ocupada pela troca

  // x, y final (frações da tela), raio inicial (fração da diagonal), atraso
  const BALLOONS = [
    [0.42, 0.58, 0.060, 0.00], [0.18, 0.30, 0.050, 0.05], [0.68, 0.34, 0.055, 0.03],
    [0.86, 0.64, 0.050, 0.10], [0.30, 0.82, 0.045, 0.14], [0.56, 0.18, 0.048, 0.12],
    [0.78, 0.86, 0.046, 0.18], [0.07, 0.70, 0.044, 0.20], [0.95, 0.20, 0.042, 0.16],
  ];
  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs) => { const n = doc.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
  const nodes = BALLOONS.map(() => {
    const g = make('g', { opacity: '0' });
    const string = make('path', { fill: 'none', 'stroke-width': '1.5', 'stroke-linecap': 'round' });
    const body = make('circle', {});
    const ring = make('circle', { fill: 'none', 'stroke-width': '2.5' });
    const shine = make('ellipse', { fill: '#FFFFFF' });
    g.append(string, body, ring, shine);
    svg.append(g);
    return { g, string, body, ring, shine };
  });

  const mix = (hex, to, amt) => {
    const a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16);
    const ch = (s) => Math.round(((a >> s) & 255) * (1 - amt) + ((b >> s) & 255) * amt);
    return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
  };
  const palettes = scenes.map((s) => {
    const accent = s.dataset.accent || '#C29459';
    return [accent, mix(accent, '#F5EEE6', 0.4), '#E3C79B'];
  });

  let on = false, raf = 0, vw = 0, vh = 0, diag = 0, active = -1, lastKey = '';

  function measure() {
    vw = sticky.clientWidth;
    vh = sticky.clientHeight;
    diag = Math.hypot(vw, vh);
    svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
  }

  function geometry(t) {
    return BALLOONS.map(([x, yEnd, r0, delay]) => {
      const u = clamp((t - delay) / (1 - delay));
      const rise = easeOutCubic(clamp(u / 0.55));
      return {
        u,
        cx: x * vw,
        cy: (yEnd + 0.8 * (1 - rise)) * vh,
        r: Math.max(0.5, r0 * diag * (1 + 13 * easeInCubic(u))),
      };
    });
  }

  function drawBalloons(geo, target) {
    const pal = palettes[target];
    geo.forEach((b, i) => {
      const n = nodes[i];
      const fill = 1 - smoothstep(0.22, 0.58, b.u);
      const ring = 1 - smoothstep(0.42, 0.72, b.u);
      n.g.setAttribute('opacity', (b.u > 0 ? smoothstep(0, 0.06, b.u) : 0).toFixed(3));
      n.body.setAttribute('cx', b.cx.toFixed(1)); n.body.setAttribute('cy', b.cy.toFixed(1)); n.body.setAttribute('r', b.r.toFixed(1));
      n.body.setAttribute('fill', pal[i % 3]); n.body.setAttribute('fill-opacity', fill.toFixed(3));
      n.ring.setAttribute('cx', b.cx.toFixed(1)); n.ring.setAttribute('cy', b.cy.toFixed(1)); n.ring.setAttribute('r', b.r.toFixed(1));
      n.ring.setAttribute('stroke', pal[(i + 1) % 3]); n.ring.setAttribute('stroke-opacity', ring.toFixed(3));
      n.shine.setAttribute('cx', (b.cx - b.r * 0.36).toFixed(1)); n.shine.setAttribute('cy', (b.cy - b.r * 0.42).toFixed(1));
      n.shine.setAttribute('rx', (b.r * 0.16).toFixed(1)); n.shine.setAttribute('ry', (b.r * 0.24).toFixed(1));
      n.shine.setAttribute('opacity', (0.4 * fill).toFixed(3));
      const y0 = b.cy + b.r;
      n.string.setAttribute('d', `M${b.cx.toFixed(1)} ${y0.toFixed(1)} q ${(-b.r * 0.12).toFixed(1)} ${(b.r * 0.5).toFixed(1)} 0 ${(b.r * 1).toFixed(1)} t 0 ${(b.r * 1).toFixed(1)}`);
      n.string.setAttribute('stroke', pal[i % 3]);
      n.string.setAttribute('stroke-opacity', (0.8 * fill).toFixed(3));
    });
  }
  const hideBalloons = () => nodes.forEach((n) => n.g.setAttribute('opacity', '0'));

  function setMask(el, value) { el.style.webkitMaskImage = value; el.style.maskImage = value; }

  function setActive(i) {
    if (i === active) return;
    active = i;
    words.forEach((w, j) => { w.classList.toggle('is-on', j === i); w.classList.toggle('is-before', j < i); });
    chips.forEach((c, j) => { if (j === i) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current'); });
    if (countEl) countEl.textContent = String(i + 1).padStart(2, '0');
    if (capEl) capEl.textContent = caps[i];
    const chip = chips[i];
    if (chip && chipRow && chipRow.scrollWidth > chipRow.clientWidth) {
      chipRow.scrollTo({ left: chip.offsetLeft - chipRow.clientWidth / 2 + chip.offsetWidth / 2, behavior: 'smooth' });
    }
  }

  function render() {
    raf = 0;
    if (!on) return;
    const rect = stage.getBoundingClientRect();
    const total = Math.max(1, rect.height - vh);
    const p = clamp(-rect.top / total);
    const s = p * (N - 1);
    const k = Math.min(N - 2, Math.floor(s));
    const t = clamp((s - k - HOLD) / TRANS);
    const key = `${k}:${t.toFixed(4)}:${vw}x${vh}`;
    if (key === lastKey) return;
    lastKey = key;

    scenes.forEach((sc, i) => {
      const visible = i === k || (i === k + 1 && t > 0);
      sc.classList.toggle('is-visible', visible);
      sc.classList.toggle('is-entering', i === k + 1 && t > 0 && t < 1);
      if (i !== k + 1 && sc.style.maskImage) setMask(sc, '');
      if (i !== k && i !== k + 1) imgs[i].style.transform = '';
    });

    const next = scenes[k + 1];
    if (t > 0 && t < 1) {
      const geo = geometry(t);
      const mask = geo.filter((b) => b.u > 0)
        .map((b) => `radial-gradient(circle ${b.r.toFixed(1)}px at ${b.cx.toFixed(1)}px ${b.cy.toFixed(1)}px, #000 98%, transparent 100%)`)
        .join(', ');
      setMask(next, mask || 'linear-gradient(transparent, transparent)');
      drawBalloons(geo, k + 1);
    } else {
      setMask(next, '');
      hideBalloons();
    }
    imgs[k].style.transform = `scale(${(1 + 0.025 * t).toFixed(4)})`;
    imgs[k + 1].style.transform = t > 0 ? `scale(${(1.08 - 0.08 * easeOutCubic(t)).toFixed(4)})` : '';
    setActive(t >= 0.5 ? k + 1 : k);
  }

  const schedule = () => { if (on && !raf) raf = requestAnimationFrame(render); };

  function enable() {
    if (on) return;
    on = true;
    root.classList.add('is-stage');
    measure();
    lastKey = '';
    render();
  }
  function disable() {
    if (!on) return;
    on = false;
    cancelAnimationFrame(raf); raf = 0;
    root.classList.remove('is-stage');
    scenes.forEach((s) => { s.classList.remove('is-visible', 'is-entering'); setMask(s, ''); });
    imgs.forEach((im) => { im.style.transform = ''; });
    hideBalloons();
  }

  chips.forEach((chip, i) => chip.addEventListener('click', (e) => {
    if (!on) return;
    e.preventDefault();
    const top = window.scrollY + stage.getBoundingClientRect().top;
    const total = stage.offsetHeight - vh;
    const s = i === 0 ? 0 : Math.min(N - 1, i + 0.08);
    window.scrollTo({ top: top + (s / (N - 1)) * total, behavior: 'smooth' });
  }));

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => { if (!on) return; measure(); lastKey = ''; schedule(); });
  const decide = () => (reduceMQ.matches ? disable() : enable());
  reduceMQ.addEventListener('change', decide);
  decide();
}

window.addEventListener('scroll', updateHeader, { passive: true });
initStage();
