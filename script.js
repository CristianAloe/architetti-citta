/* ============================================================
   NOI ARCHITETTI DELLA CITTÀ – script.js
   ============================================================ */

/* ---------- NAV: scroll sticky + mobile toggle ---------- */
(function () {
  const nav       = document.querySelector('.nav');
  const toggle    = document.getElementById('navToggle');
  const links     = document.getElementById('navLinks');
  const navAnchors = links.querySelectorAll('a');

  // Sticky nav on scroll
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Mobile hamburger toggle
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu when a link is clicked
  navAnchors.forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });

  // Close if clicking outside
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && links.classList.contains('open')) {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    }
  });
})();


/* ---------- SCROLL ANIMATIONS (IntersectionObserver) ---------- */
(function () {
  const targets = document.querySelectorAll('[data-aos]');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-visible');
        observer.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
})();


/* ---------- LIGHTBOX ---------- */
(function () {
  const lightbox   = document.getElementById('lightbox');
  const lbImg      = document.getElementById('lightboxImg');
  const lbCaption  = document.getElementById('lightboxCaption');
  const lbClose    = document.getElementById('lightboxClose');
  const lbPrev     = document.getElementById('lightboxPrev');
  const lbNext     = document.getElementById('lightboxNext');

  const items = Array.from(document.querySelectorAll('.gallery-item'));
  let currentIndex = 0;

  // Open lightbox
  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  // Close lightbox
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    // Return focus to the triggering element
    if (items[currentIndex]) items[currentIndex].focus();
  }

  // Update image and caption
  function updateLightbox() {
    const item = items[currentIndex];
    if (!item) return;
    const src     = item.getAttribute('data-src');
    const caption = item.getAttribute('data-caption') || '';
    lbImg.src     = src;
    lbImg.alt     = caption;
    lbCaption.textContent = caption;
  }

  // Navigate
  function navigate(dir) {
    currentIndex = (currentIndex + dir + items.length) % items.length;
    updateLightbox();
  }

  // Bind gallery item clicks
  items.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });

  // Controls
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => navigate(-1));
  lbNext.addEventListener('click', () => navigate(+1));

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(+1);
  });

  // Click outside image to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Touch / swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
  });
})();


/* ---------- SMOOTH SCROLL (fallback for older browsers) ---------- */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80; // nav height compensation
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ---------- VIDEO CARD: prevent navigation to placeholder URLs ---------- */
(function () {
  const PLACEHOLDER_PREFIXES = ['VIDEO_GRUPPO_'];

  document.querySelectorAll('.video-card .btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const href = this.getAttribute('href') || '';
      const isPlaceholder = PLACEHOLDER_PREFIXES.some(p => href.startsWith(p));
      if (isPlaceholder) {
        e.preventDefault();
        showToast('🎬 Video non ancora disponibile.\nSostituisci l\'URL nel file HTML!');
      }
    });
  });

  document.querySelectorAll('.contact-card').forEach(card => {
    card.addEventListener('click', function (e) {
      const href = this.getAttribute('href') || '';
      if (href.includes('PLACEHOLDER') || href.includes('NUMERO_') || href.includes('PROFILO_')) {
        e.preventDefault();
        showToast('📩 Contatto non ancora configurato.\nSostituisci i link nel file HTML!');
      }
    });
  });

  function showToast(msg) {
    // Remove existing toast
    const existing = document.getElementById('site-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'site-toast';
    toast.textContent = msg;
    Object.assign(toast.style, {
      position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(10,25,45,.96)', color: '#fff', padding: '16px 28px',
      borderRadius: '12px', fontSize: '.9rem', lineHeight: '1.5',
      boxShadow: '0 8px 32px rgba(0,0,0,.4)', zIndex: '2000',
      backdropFilter: 'blur(12px)', border: '1px solid rgba(76,175,80,.3)',
      whiteSpace: 'pre-line', textAlign: 'center',
      animation: 'toastIn .3s ease',
    });

    // Inject keyframe once
    if (!document.getElementById('toast-style')) {
      const s = document.createElement('style');
      s.id = 'toast-style';
      s.textContent = '@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
      document.head.appendChild(s);
    }

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity .4s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }
})();


/* ---------- ACTIVE NAV LINK on scroll ---------- */
(function () {
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav__links a');

  function onScroll() {
    const scrollY = window.scrollY + 120;
    let current = '';

    sections.forEach(section => {
      if (scrollY >= section.offsetTop) current = section.id;
    });

    navLinks.forEach(link => {
      link.style.color = link.getAttribute('href') === '#' + current
        ? 'var(--green-light)'
        : '';
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();
