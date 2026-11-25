// Copy BibTeX + play comparison videos only while they are on screen.

document.addEventListener('DOMContentLoaded', () => {
  const copyBtn = document.querySelector('.copy-bibtex');
  const code = document.getElementById('bibtex-code');
  if (copyBtn && code) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.innerText);
        copyBtn.textContent = 'Copied ✓';
      } catch (e) {
        const range = document.createRange();
        range.selectNodeContents(code);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        copyBtn.textContent = 'Press Ctrl+C';
      }
      setTimeout(() => { copyBtn.textContent = 'Copy BibTeX'; }, 1800);
    });
  }

  // hero teaser: auto-advancing carousel with a cross-fade between clips.
  // Two stacked <video> elements: the hidden one is preloaded, then faded in while the
  // visible one fades out. Each clip remembers where it stopped, so returning to it resumes.
  const stage = document.getElementById('hero-stage');
  const pills = Array.from(document.querySelectorAll('.scene-thumb'));
  if (stage && pills.length) {
    const AUTO_MS = 5000;
    const FADE_MS = 1050;
    const clips = Array.from(stage.querySelectorAll('.hero-clip'));
    let front = clips[0];
    let back = clips[1];
    const savedTime = new Map();          // data-src -> seconds
    let current = pills.find((b) => b.classList.contains('is-active')) || pills[0];
    let timer = null;

    const startTimer = () => {
      clearInterval(timer);
      timer = setInterval(() => show(pills[(pills.indexOf(current) + 1) % pills.length]), AUTO_MS);
    };

    const show = (btn, { fromUser = false } = {}) => {
      if (btn === current && front.dataset.srcKey === btn.dataset.src) {
        if (fromUser) startTimer();
        return;
      }
      if (front.dataset.srcKey) savedTime.set(front.dataset.srcKey, front.currentTime || 0);
      current = btn;
      pills.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });

      const src = btn.dataset.src;
      back.dataset.srcKey = src;
      back.poster = btn.dataset.poster || '';
      const startAt = savedTime.get(src) || 0;
      const onReady = () => {
        if (startAt > 0.1) {
          const limit = (isFinite(back.duration) ? back.duration : startAt) - 0.05;
          try { back.currentTime = Math.min(startAt, Math.max(limit, 0)); } catch (e) { /* ignore */ }
        }
        back.play().catch(() => {});
        requestAnimationFrame(() => {
          const outgoing = front;                 // capture before swapping
          // new clip slides in from the right by 35% while fading in on top
          back.style.zIndex = '3';
          outgoing.style.zIndex = '2';
          back.style.transition = 'none';
          back.style.transform = 'translateX(35%)';
          back.style.opacity = '0';
          void back.offsetWidth;                  // force reflow so the start state sticks
          back.style.transition = '';
          back.style.transform = 'translateX(0)';
          back.style.opacity = '1';
          outgoing.style.transform = 'translateX(0)';
          outgoing.style.opacity = '0';
          setTimeout(() => {
            outgoing.pause();
            outgoing.style.transition = 'none';
            outgoing.style.opacity = '0';
            outgoing.style.transform = 'translateX(0)';
            outgoing.style.zIndex = '1';
          }, FADE_MS + 80);
          front = back;
          back = outgoing;
        });
      };
      if (back.getAttribute('src') === src && back.readyState >= 1) onReady();
      else {
        back.addEventListener('loadedmetadata', onReady, { once: true });
        back.src = src;
      }
      if (fromUser) startTimer();
    };

    pills.forEach((btn) => {
      btn.addEventListener('click', () => {
        show(btn, { fromUser: true });
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
      btn.addEventListener('pointerenter', () => {
        if (btn.dataset.warmed) return;
        btn.dataset.warmed = '1';
        const pre = document.createElement('link');
        pre.rel = 'prefetch'; pre.as = 'video'; pre.href = btn.dataset.src;
        document.head.appendChild(pre);
      });
    });

    startTimer();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearInterval(timer);
      else startTimer();
    });
  }

  // hero teaser filmstrip: horizontal scroll + arrows
  const strip = document.getElementById('scene-strip');
  const switchBox = document.querySelector('.scene-switch');
  if (strip && switchBox) {
    const sync = () => {
      const scrollable = strip.scrollWidth - strip.clientWidth > 4;
      switchBox.classList.toggle('can-scroll', scrollable);
      strip.classList.toggle('is-scroll', scrollable);
      const max = strip.scrollWidth - strip.clientWidth;
      switchBox.classList.toggle('at-start', strip.scrollLeft <= 4);
      switchBox.classList.toggle('at-end', strip.scrollLeft >= max - 4);
    };
    sync();
    strip.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    if ('ResizeObserver' in window) new ResizeObserver(sync).observe(strip);
    const step = () => Math.max(220, Math.round(strip.clientWidth * 0.45));
    const nl = switchBox.querySelector('.scene-nav.l');
    const nr = switchBox.querySelector('.scene-nav.r');
    if (nl) nl.addEventListener('click', () => strip.scrollBy({ left: -step(), behavior: 'smooth' }));
    if (nr) nr.addEventListener('click', () => strip.scrollBy({ left: step(), behavior: 'smooth' }));
  }

  // related-work cards: show / hide their BibTeX
  document.querySelectorAll('.cite-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.related-card');
      const bib = card && card.querySelector('.related-bib');
      if (!bib) return;
      const open = bib.hasAttribute('hidden');
      if (open) bib.removeAttribute('hidden'); else bib.setAttribute('hidden', '');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Hide BibTeX' : 'Cite';
      const grid = card.closest('.related-grid');
      if (grid) {
        card.classList.toggle('is-open', open);
        const anyOpen = !!grid.querySelector('.related-card.is-open');
        grid.classList.toggle('has-open', anyOpen);
      }
    });
  });

  const videos = Array.from(document.querySelectorAll('video.lazy-loop'));
  if (!videos.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const v = entry.target;
      if (entry.isIntersecting) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.35 });
  videos.forEach((v) => io.observe(v));
});
