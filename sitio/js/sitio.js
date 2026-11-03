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
    note.textContent = 'Listo. Se abrió tu correo con la solicitud para enviarla.';
    note.classList.add('is-ok');
  });

  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
