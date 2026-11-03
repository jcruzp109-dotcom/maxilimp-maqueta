(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Menú
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
  document.addEventListener('click', e => { if (!e.target.closest('[data-top]')) setMenu(false); });

  // Portada: al bajar, los elementos flotantes se juntan hacia la foto de la bodega.
  const hero = document.querySelector('[data-hero]');
  const store = hero?.querySelector('.hero-store');
  const items = [...(hero?.querySelectorAll('[data-fl]') || [])];
  if (hero && store && items.length && !reduce) {
    let vectors = [], heroH = 1, ticking = false, visible = true;
    const measure = () => {
      const scroll = scrollY;
      items.forEach(el => { el.style.setProperty('--x', '0px'); el.style.setProperty('--y', '0px'); el.style.setProperty('--s', '1'); });
      const s = store.getBoundingClientRect();
      const target = { x: s.left + s.width / 2, y: s.top + scroll + s.height * .3 };
      vectors = items.map(el => {
        const r = el.getBoundingClientRect();
        const spin = parseFloat(el.dataset.fl.split(',')[2]) || 0;
        return { dx: target.x - (r.left + r.width / 2), dy: target.y - (r.top + scroll + r.height / 2), spin };
      });
      heroH = hero.offsetHeight;
      update();
    };
    const update = () => {
      ticking = false;
      if (!visible) return;
      const p = Math.min(1, Math.max(0, scrollY / (heroH * .75)));
      const e = p * p * (3 - 2 * p);
      items.forEach((el, i) => {
        const v = vectors[i]; if (!v) return;
        el.style.setProperty('--x', `${(v.dx * e * .8).toFixed(1)}px`);
        el.style.setProperty('--y', `${(v.dy * e * .8).toFixed(1)}px`);
        el.style.setProperty('--s', (1 - e * .45).toFixed(3));
        el.style.rotate = `${(v.spin * e).toFixed(2)}deg`;
        el.style.opacity = (1 - Math.max(0, e - .6) * 2.2).toFixed(3);
      });
    };
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) update(); }).observe(hero);
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', measure);
    addEventListener('load', measure);
    measure();
  }

  // Carrusel de productos
  const track = document.querySelector('[data-slides]');
  if (track) {
    const prev = document.querySelector('[data-prev]');
    const next = document.querySelector('[data-next]');
    const step = () => (track.querySelector('.slide')?.offsetWidth || 300) + 16;
    const sync = () => {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
    track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    addEventListener('resize', sync);
    sync();
  }

  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
