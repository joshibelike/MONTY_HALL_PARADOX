(() => {
  function initReveal() {
    const targets = document.querySelectorAll('[data-reveal]');

    if (!('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 },
    );

    targets.forEach((target) => observer.observe(target));
  }

  function initGlassGlow() {
    document.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;

      const glass = event.target.closest('.glass');
      if (!glass) return;

      const rect = glass.getBoundingClientRect();
      glass.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      glass.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  }

  initReveal();
  initGlassGlow();
})();
