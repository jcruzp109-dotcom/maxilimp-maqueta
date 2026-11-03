(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Menú (celular)
  const top = document.querySelector('[data-top]');
  const button = document.querySelector('[data-menu]');
  const menu = document.getElementById('menu');
  const setMenu = open => {
    button.setAttribute('aria-expanded', String(open));
    button.querySelector('.sr').textContent = open ? 'Cerrar menú' : 'Abrir menú';
    menu.classList.toggle('is-open', open);
  };
  button.addEventListener('click', () => setMenu(button.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // Desplazamiento: línea bajo el encabezado y parallax suave
  const bubbles = [...document.querySelectorAll('[data-depth]')];
  const strip = document.querySelector('[data-parallax]');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY;
    top.classList.toggle('is-scrolled', y > 8);
    if (reduce) return;
    if (y < innerHeight * 1.2) bubbles.forEach(b => b.style.setProperty('--py', `${(-y * b.dataset.depth).toFixed(1)}px`));
    if (strip) {
      const r = strip.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        strip.style.transform = `translate3d(0,${(p * -60).toFixed(1)}px,0)`;
      }
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Formulario de cotización (maqueta): arma un correo con los datos.
  const form = document.querySelector('[data-form]');
  const note = document.querySelector('[data-form-note]');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(input => {
      const bad = !input.value.trim();
      input.setAttribute('aria-invalid', String(bad));
      if (bad && ok) { input.focus(); ok = false; }
    });
    if (!ok) { note.textContent = 'Escribe tu nombre y teléfono para poder contactarte.'; note.classList.remove('is-ok'); return; }
    const d = new FormData(form);
    const body = [
      `Nombre: ${d.get('nombre')}`,
      `Empresa: ${d.get('empresa') || '—'}`,
      `Teléfono: ${d.get('telefono')}`,
      `Sector: ${d.get('sector')}`,
      `Interés: ${d.getAll('interes').join(', ') || '—'}`,
      '', d.get('mensaje') || ''
    ].join('\n');
    location.href = `mailto:angelica_maxilimp@hotmail.com?subject=${encodeURIComponent('Solicitud de cotización')}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Se abrió tu correo con la solicitud lista para enviar.';
    note.classList.add('is-ok');
  });

  // ---- Animaciones de entrada ----
  if (!reduce && 'IntersectionObserver' in window) {
    const groups = {
      rv: ['.head h2', '.head p', '.statement-in p', '.product h3', '.product > p', '.product .tags', '.more',
           '.about-text h2', '.story li', '.quality h2', '.chain li', '.place-text > *', '.allies-head > *', '.logos li',
           '.contact-text > h2', '.contact-text > p', '.contact-list li', '.form', '.foot-in > div'],
      'rv-img': ['.tile', '.product figure', '.sector-row li', '.about-img', '.quality-img', '.place-a', '.place-b', '.contact-img']
    };
    const els = [];
    document.querySelectorAll('.head h2, .about-text h2, .quality h2, .place-text h2, .allies-head h2, .contact-text h2').forEach(el => el.classList.add('rv-blur'));
    Object.entries(groups).forEach(([cls, sels]) => {
      document.querySelectorAll(sels.join(',')).forEach(el => { el.classList.add(cls); els.push(el); });
    });
    // Escalonado: cada elemento espera un poco más que su hermano anterior.
    const seen = new Map();
    els.forEach(el => {
      const key = el.parentElement;
      const n = seen.get(key) || 0; seen.set(key, n + 1);
      el.style.setProperty('--d', `${Math.min(n, 8) * 0.09}s`);
    });
    // Frase destacada palabra por palabra.
    const quote = document.querySelector('.quote');
    const qp = quote?.querySelector('p');
    if (qp) {
      qp.setAttribute('aria-label', qp.textContent);
      qp.innerHTML = qp.textContent.trim().split(/\s+/).map((w, i) => `<span class="w" style="--i:${i}" aria-hidden="true">${w}</span>`).join(' ');
    }
    // Se revisa la posición en cada scroll (getBoundingClientRect no se confunde con
    // elementos ocultos y no se salta nada aunque el scroll sea muy rápido).
    let pending = [...els, quote, document.querySelector('.foot')].filter(Boolean);
    const check = () => {
      const limit = innerHeight * 0.92;
      pending = pending.filter(el => {
        const r = el.getBoundingClientRect();
        if (r.top < limit && r.bottom > -innerHeight) { el.classList.add('in'); return false; }
        if (r.bottom <= 0) { el.classList.add('in'); return false; }
        return true;
      });
      if (!pending.length) removeEventListener('scroll', onCheck);
    };
    let checking = false;
    const onCheck = () => { if (!checking) { checking = true; requestAnimationFrame(() => { checking = false; check(); }); } };
    addEventListener('scroll', onCheck, { passive: true });
    addEventListener('resize', onCheck);
    requestAnimationFrame(check);

    // Pausar los íconos animados cuando la portada sale de la pantalla.
    const hero = document.querySelector('.hero');
    if (hero) new IntersectionObserver(([e]) => hero.classList.toggle('is-off', !e.isIntersecting)).observe(hero);

    // Contadores de la portada.
    document.querySelectorAll('[data-count]').forEach((el, i) => {
      const end = +el.dataset.count, pre = el.dataset.prefix || '';
      el.textContent = pre + '0';
      const start = performance.now() + 600 + i * 150, dur = 1400;
      const tick = now => {
        const p = Math.min(1, Math.max(0, (now - start) / dur));
        el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
