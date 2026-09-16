/* ==========================================================================
   GENIOUS IAS — SCHOOL OF HUMANITIES
   Main Script: js/script.js  (Vanilla JavaScript only)
   --------------------------------------------------------------------------
   MODULES
   01. Helpers
   02. Preloader
   03. Sticky Navbar (scroll styling)
   04. Mobile Menu (hamburger + overlay)
   05. Dropdown Menus (click/touch support, keyboard accessible)
   06. Active Navigation (auto-detect current page)
   07. Smooth Scrolling (same-page anchors)
   08. Scroll Reveal (Intersection Observer)
   09. Animated Counters
   10. Accordions (course details + FAQ)
   11. Gallery Lightbox (images: prev/next, keyboard)
   12. Video Behaviour (pause others when one plays)
   13. Gallery Filters
   14. Result Filters
   15. Contact / Registration Form Validation
   16. Back To Top
   17. Footer Year
   ========================================================================== */

(function () {
  'use strict';

  /* ============================== 01. HELPERS ============================= */
  const $ = (selector, ctx = document) => ctx.querySelector(selector);
  const $$ = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));

  /* ============================== 02. PRELOADER =========================== */
  function initPreloader() {
    const preloader = $('#preloader');
    if (!preloader) return;

    const hide = () => preloader.classList.add('loaded');

    if (document.readyState === 'complete') {
      setTimeout(hide, 400);
    } else {
      window.addEventListener('load', () => setTimeout(hide, 400));
      /* Safety fallback so the page is never blocked */
      setTimeout(hide, 3500);
    }
  }

  /* ============================== 03. STICKY NAVBAR ======================= */
  function initNavbarScroll() {
    const header = $('#siteHeader');
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============================== 04. MOBILE MENU ========================= */
  function initMobileMenu() {
    const hamburger = $('#hamburger');
    const menu = $('#navMenu');
    const overlay = $('#mobileOverlay');
    if (!hamburger || !menu || !overlay) return;

    const setState = (open) => {
      menu.classList.toggle('open', open);
      overlay.classList.toggle('show', open);
      hamburger.classList.toggle('active', open);
      hamburger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };

    hamburger.addEventListener('click', () => setState(!menu.classList.contains('open')));
    overlay.addEventListener('click', () => setState(false));

    /* Close when a navigation link inside the panel is clicked */
    $$('a', menu).forEach((link) => {
      link.addEventListener('click', () => setState(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        setState(false);
        hamburger.focus();
      }
    });

    /* Reset state if viewport crosses back to desktop */
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1080) setState(false);
    });
  }

  /* ============================== 05. DROPDOWNS ============================ */
  function initDropdowns() {
    $$('.dropdown').forEach((dropdown) => {
      const toggle = $('.dropdown-toggle', dropdown);

      if (!toggle) return;

      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');

        /* Close siblings first */
        $$('.dropdown.open').forEach((d) => {
          d.classList.remove('open');
          const t = $('.dropdown-toggle', d);
          if (t) t.setAttribute('aria-expanded', 'false');
        });

        dropdown.classList.toggle('open', !isOpen);
        toggle.setAttribute('aria-expanded', String(!isOpen));
      });

      dropdown.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdown.classList.contains('open')) {
          dropdown.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.focus();
        }
      });
    });

    /* Close dropdowns when clicking elsewhere on desktop */
    document.addEventListener('click', () => {
      $$('.dropdown.open').forEach((d) => {
        d.classList.remove('open');
        const t = $('.dropdown-toggle', d);
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ============================== 06. ACTIVE NAVIGATION ==================== */
  function initActiveNav() {
    const page = document.body.dataset.page;
    if (!page) return;

    $$('.nav-link[href]').forEach((link) => {
      const href = link.getAttribute('href') || '';
      const target = href.replace('./', '').split('#')[0];
      if (target && target === page) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');

        /* Highlight parent dropdown toggle too */
        const parentLi = link.closest('.dropdown');
        if (parentLi) {
          const toggle = $('.dropdown-toggle', parentLi);
          if (toggle) toggle.classList.add('active');
        }
      }
    });

    /* Mark dropdown items and highlight their parent toggle */
    $$('.dropdown').forEach((dropdown) => {
      const items = $$('.dropdown-menu a', dropdown);
      const match = items.find((a) => (a.getAttribute('href') || '').replace('./', '') === page);
      if (!match) return;
      match.classList.add('active');
      match.setAttribute('aria-current', 'page');
      const toggle = $('.dropdown-toggle', dropdown);
      if (toggle) toggle.classList.add('active');
    });

    /* Also mark footer quick links */
    $$('.footer-links a').forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (href.replace('./', '') === page) link.classList.add('active-footer');
    });
  }

  /* ============================== 07. SMOOTH SCROLLING ===================== */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (id.length < 2) return;
        const target = $(id);
        if (!target) return;

        e.preventDefault();
        const headerH = ($('#siteHeader') || {}).offsetHeight || 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 16;

        window.scrollTo({ top, behavior: 'smooth' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ============================== 08. SCROLL REVEAL ======================== */
  function initReveal() {
    const items = $$('.reveal, .reveal-left, .reveal-right, .reveal-zoom');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.dataset.delay || 0);
          setTimeout(() => el.classList.add('visible'), delay);
          obs.unobserve(el);
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ============================== 09. ANIMATED COUNTERS ==================== */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || '0');
    const decimals = Number(el.dataset.decimals || 0);
    const prefix = el.dataset.prefix || '';
    const suffixEl = $('.suffix', el); // suffix kept as styled child span
    const duration = 1900;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const value = (target * eased).toFixed(decimals);
      el.firstChild.nodeValue = prefix + value;

      if (progress < 1) requestAnimationFrame(tick);
      else el.firstChild.nodeValue = prefix + target.toFixed(decimals);
    };

    el.firstChild.nodeValue = prefix + (0).toFixed(decimals);
    requestAnimationFrame(tick);

    if (suffixEl) suffixEl.style.display = ''; // ensure visible once done
  }

  function initCounters() {
    const counters = $$('.counter');
    if (!counters.length) return;

    const run = (el) => animateCounter(el);

    if (!('IntersectionObserver' in window)) {
      counters.forEach(run);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  /* ============================== 10. ACCORDIONS =========================== */
  function initAccordions() {
    /* Generic pattern: button[aria-expanded] controls next .accordion-body */
    const toggles = $$('.course-toggle, .faq-question');
    if (!toggles.length) return;

    toggles.forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.course-card, .faq-item');
        if (!item) return;
        const body = $('.course-details, .faq-answer', item);
        if (!body) return;

        const expanded = btn.getAttribute('aria-expanded') === 'true';

        /* Close others of the same group for a tidy accordion feel */
        const group = item.parentElement;
        $$('.faq-item.active, .course-card.expanded', group).forEach((other) => {
          if (other === item) return;
          other.classList.remove('active', 'expanded');
          const ob = $('.course-details, .faq-answer', other);
          const obtn = $('.course-toggle, .faq-question', other);
          if (ob) ob.style.maxHeight = '';
          if (obtn) obtn.setAttribute('aria-expanded', 'false');
        });

        btn.setAttribute('aria-expanded', String(!expanded));
        body.style.maxHeight = expanded ? '' : body.scrollHeight + 'px';
        item.classList.toggle('expanded', !expanded);
        item.classList.toggle('active', !expanded);
      });
    });
  }

  /* ============================== 11. GALLERY LIGHTBOX ===================== */
  function initLightbox() {
    const lightbox = $('#lightbox');
    const lbImg = $('#lightboxImg');
    const lbCaption = $('#lightboxCaption');
    const lbCounter = $('#lightboxCounter');
    if (!lightbox || !lbImg) return;

    const images = $$('.gallery-item img').filter(
      (img) => img.closest('.gallery-item') && !img.closest('.video-item')
    );
    let index = 0;
    let lastFocused = null;

    const render = () => {
      const img = images[index];
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || 'Gallery image';
      lbCaption.textContent = img.alt || '';
      if (lbCounter) lbCounter.textContent = (index + 1) + ' / ' + images.length;
    };

    const open = (i) => {
      index = i;
      lastFocused = document.activeElement;
      render();
      lightbox.classList.add('open');
      lightbox.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      $('.lb-close', lightbox).focus();
    };

    const close = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
      setTimeout(() => lightbox.setAttribute('hidden', ''), 350);
    };

    const step = (dir) => {
      index = (index + dir + images.length) % images.length;
      render();
    };

    images.forEach((img, i) => {
      const holder = img.closest('.gallery-item');
      holder.addEventListener('click', () => open(i));
      holder.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(i);
        }
      });
      holder.setAttribute('tabindex', '0');
      holder.setAttribute('role', 'button');
      holder.setAttribute('aria-label', 'Open image: ' + (img.alt || 'gallery photo'));
    });

    $('.lb-close', lightbox).addEventListener('click', close);
    $('.lb-prev', lightbox).addEventListener('click', () => step(-1));
    $('.lb-next', lightbox).addEventListener('click', () => step(1));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  /* ============================== 12. VIDEO BEHAVIOUR ====================== */
  function initVideos() {
    const videos = $$('video');
    if (videos.length < 2) return;

    videos.forEach((video) => {
      video.addEventListener('play', () => {
        videos.forEach((other) => {
          if (other !== video && !other.paused) other.pause();
        });
      });
    });
  }

  /* ============================== 13. GALLERY FILTERS ====================== */
  function initGalleryFilters() {
    const chips = $$('.filter-chip[data-filter]');
    const items = $$('.gallery-item');
    if (!chips.length || !items.length) return;

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');

        const filter = chip.dataset.filter;
        items.forEach((item) => {
          const type = item.dataset.type || 'image';
          const show = filter === 'all' || filter === type;
          item.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ============================== 14. RESULT FILTERS ======================= */
  function initResultFilters() {
    const chips = $$('.filter-chip[data-result-filter]');
    const cards = $$('.result-card[data-category]');
    if (!chips.length || !cards.length) return;

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');

        const filter = chip.dataset.resultFilter;
        cards.forEach((card) => {
          const cats = card.dataset.category.split(' ');
          const show = filter === 'all' || cats.includes(filter);
          card.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  /* ============================== 15. FORM VALIDATION ====================== */
  function initContactForm() {
    const form = $('#registrationForm');
    if (!form) return;

    const alertBox = $('#formAlert');
    const submitBtn = $('#formSubmit');

    const rules = {
      fullName: {
        validate: (v) => /^[A-Za-z][A-Za-z\s.'-]{2,49}$/.test(v),
        message: 'Please enter your full name (3–50 letters).'
      },
      mobile: {
        validate: (v) => /^[6-9]\d{9}$/.test(v.replace(/^(\+91|0)?\s*/, '').replace(/\s/g, '')),
        message: 'Enter a valid Indian mobile number (10 digits, starts 6–9).'
      },
      email: {
        validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 100,
        message: 'Enter a valid email address (max 100 characters).'
      },
      course: { validate: (v) => v !== '', message: 'Please select a course.' },
      branch: { validate: (v) => v !== '', message: 'Please choose a branch.' },
      qualification: { validate: (v) => v !== '', message: 'Please select your qualification.' },
      city: {
        validate: (v) => v.trim().length >= 2 && v.trim().length <= 40,
        message: 'City must be between 2 and 40 characters.'
      },
      mode: { validate: (v) => v !== '', message: 'Please select your preferred mode.' },
      message: {
        validate: (v) => v.trim().length <= 500,
        message: 'Message cannot exceed 500 characters.'
      }
    };

    const setError = (field, hasError, msg) => {
      const group = field.closest('.form-group');
      if (!group) return;
      const errEl = $('.field-error', group);
      group.classList.toggle('has-error', hasError);
      if (errEl) {
        errEl.textContent = msg || '';
        errEl.classList.toggle('visible', hasError);
      }
      field.setAttribute('aria-invalid', String(hasError));
    };

    const validateField = (field) => {
      const name = field.name;
      const rule = rules[name];
      if (!rule) return true;
      const ok = rule.validate(field.value || '');
      setError(field, !ok, rule.message);
      return ok;
    };

    /* Live validation feedback once a field was touched */
    Object.keys(rules).forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.closest('.form-group').classList.contains('has-error')) {
          validateField(field);
        }
      });
    });

    const showAlert = (type, html) => {
      alertBox.className = 'form-alert show ' + type;
      alertBox.innerHTML = html;
      alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    const hideAlert = () => {
      alertBox.className = 'form-alert';
      alertBox.innerHTML = '';
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      hideAlert();

      let firstInvalid = null;
      Object.keys(rules).forEach((name) => {
        const field = form.elements[name];
        if (!field) return;
        if (!validateField(field) && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        showAlert(
          'error',
          '<i class="fa-solid fa-circle-exclamation"></i><span>Please correct the highlighted fields and try again.</span>'
        );
        firstInvalid.focus();
        return;
      }

      /* Simulated frontend submission (no backend — honest demo interaction) */
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fa-solid fa-circle-notch fa-spin"></i> Submitting…';

      setTimeout(() => {
        const name = form.elements.fullName.value.trim().split(/\s+/)[0];
        showAlert(
          'success',
          '<i class="fa-solid fa-circle-check"></i><span><strong>Thank you, ' +
            name +
            '!</strong> Your enquiry has been validated and submitted successfully. Our admissions team will contact you shortly. For immediate assistance, call <a href="tel:+917027222123"><strong>+91 70272 22123</strong></a>.</span>'
        );
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML =
          '<i class="fa-solid fa-paper-plane"></i> Submit Registration';
        $$('.has-error', form).forEach((g) => g.classList.remove('has-error'));
        $$('.field-error.visible', form).forEach((el) => el.classList.remove('visible'));
      }, 1100);
    });

    /* Character counter for message */
    const msg = form.elements.message;
    const counter = $('#msgCount');
    if (msg && counter) {
      msg.addEventListener('input', () => {
        counter.textContent = msg.value.length + ' / 500';
      });
    }

    /* Pre-select course when arriving via "Enquire Now" links
       e.g. contact.html?course=CLAT%20Coaching */
    try {
      const wanted = new URLSearchParams(window.location.search).get('course');
      const select = form.elements.course;
      if (wanted && select) {
        const match = $$('option', select).find((o) => o.value === wanted);
        if (match) select.value = wanted;
      }
    } catch (err) {
      /* URLSearchParams unsupported — silently skip pre-selection */
    }
  }

  /* ============================== 16. BACK TO TOP ========================== */
  function initBackToTop() {
    const btn = $('#backToTop');
    if (!btn) return;

    const onScroll = () => {
      btn.classList.toggle('visible', window.scrollY > 560);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================== 17. FOOTER YEAR ========================== */
  function initYear() {
    const el = $('#year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ============================== BOOTSTRAP ================================ */
  document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initNavbarScroll();
    initMobileMenu();
    initDropdowns();
    initActiveNav();
    initSmoothScroll();
    initReveal();
    initCounters();
    initAccordions();
    initLightbox();
    initVideos();
    initGalleryFilters();
    initResultFilters();
    initContactForm();
    initBackToTop();
    initYear();
  });
})();
