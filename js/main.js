window.KORA_SITE_CONFIG = {
  apiBaseUrl: "https://kora-agent.grubtok.com",
  businessId: "11907d88-11c2-4e01-a417-b06e9368d9ed",
  recaptchaSiteKey: "6LcsdJYsAAAAAAur-h7cYlZuGJTmijNHmOi5kFH7",
};

/* ===========================================================================
   Marchant Farm — site behaviour
   Vanilla JS, no dependencies. Everything degrades to working HTML if this
   file fails to load.

   ---------------------------------------------------------------------------
   OWNER: the two lists below are the only things you need to edit regularly.
   --------------------------------------------------------------------------- */

/* 1. HORSE SHOW DATES ------------------------------------------------------
   Add the next season's dates here and the homepage banner, the "next show"
   line and the calendar all update themselves. Format: "YYYY-MM-DD". */
var SHOW_DATES = [
  '2026-04-26',
  '2026-05-10',
  '2026-06-28',
  '2026-07-19',
  '2026-09-27',
  '2026-10-11'
];

/* 2. THIS WEEK AT THE FARM -------------------------------------------------
   Update `updated` every time you change the list, and the page will show how
   fresh it is. If it goes more than 14 days without an update the page quietly
   falls back to an evergreen message instead of showing stale produce. */
var THIS_WEEK = {
  updated: '2026-08-10',
  note: 'Late-summer harvest. The stand is open daily, 9:00am–5:30pm.',
  items: [
    { name: 'Raw wildflower honey', price: '$14.00', note: '8 oz jar, from our own hives' },
    { name: 'Free-range eggs', price: '$5.00', note: 'By the dozen' },
    { name: 'Seasonal vegetables', price: 'Market price', note: 'Picked from the kitchen garden' },
    { name: 'Seasonal fruit', price: 'Market price', note: 'Whatever the orchard is giving' },
    { name: 'Firewood by the bag', price: '$10.00', note: 'Seasoned, ready to burn' },
    { name: 'Firewood by the pallet', price: 'Enquire', note: 'Stock up before winter' }
  ]
};

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---- Header: transparent over a hero, solid once scrolled ------------- */
  function initHeader() {
    var header = $('.site-header');
    if (!header) return;
    var overlay = document.body.hasAttribute('data-hero-overlay');
    var threshold = 40;

    function sync() {
      var scrolled = window.scrollY > threshold;
      header.classList.toggle('site-header--solid', scrolled || !overlay);
      header.classList.toggle('site-header--over', overlay && !scrolled);
    }
    sync();
    window.addEventListener('scroll', sync, { passive: true });
  }

  /* ---- Desktop dropdowns: hover, click and keyboard all work ------------ */
  function initNav() {
    var items = $$('.nav__item[data-dropdown]');
    if (!items.length) return;

    function close(item) {
      item.setAttribute('data-open', 'false');
      var btn = $('.nav__link', item);
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
    function open(item) {
      items.forEach(function (other) { if (other !== item) close(other); });
      item.setAttribute('data-open', 'true');
      var btn = $('.nav__link', item);
      if (btn) btn.setAttribute('aria-expanded', 'true');
    }

    items.forEach(function (item) {
      var btn = $('.nav__link', item);
      item.addEventListener('mouseenter', function () { open(item); });
      item.addEventListener('mouseleave', function () { close(item); });
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          item.getAttribute('data-open') === 'true' ? close(item) : open(item);
        });
      }
      item.addEventListener('focusout', function (e) {
        if (!item.contains(e.relatedTarget)) close(item);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') items.forEach(close);
    });
  }

  /* ---- Mobile drawer ---------------------------------------------------- */
  function initDrawer() {
    var toggle = $('.nav-toggle');
    var drawer = $('.drawer');
    if (!toggle || !drawer) return;

    var header = $('.site-header');

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('data-open', String(open));
      document.documentElement.style.overflow = open ? 'hidden' : '';
      // The drawer is a light surface, so the header must drop its reversed
      // (over-photo) treatment or the cream logo vanishes into it.
      if (header) {
        header.classList.toggle('site-header--solid', open || !document.body.hasAttribute('data-hero-overlay'));
        header.classList.toggle('site-header--over', !open && document.body.hasAttribute('data-hero-overlay') && window.scrollY <= 40);
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1184) setOpen(false);
    });
  }

  /* ---- Hero rotation ----------------------------------------------------
     Four messages for four audiences (weddings, corporate, horse shows,
     the market). Pauses when the tab is hidden or the pointer is on it. */
  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) return;
    var slides = $$('.hero__slide', hero);
    var dots = $$('.hero__dot', hero);
    var panels = $$('[data-hero-panel]', hero);
    if (slides.length < 2) return;

    var index = 0;
    var timer = null;
    var DWELL = 7000;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.setAttribute('data-active', String(i === index)); });
      panels.forEach(function (p, i) { p.hidden = i !== index; });
      dots.forEach(function (d, i) {
        d.setAttribute('aria-selected', String(i === index));
        d.setAttribute('tabindex', i === index ? '0' : '-1');
      });
    }
    function start() { if (!reduceMotion) { stop(); timer = setInterval(function () { show(index + 1); }, DWELL); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); start(); });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });

    show(0);
    start();
  }

  /* ---- Reveal on scroll -------------------------------------------------- */
  function initReveal() {
    var targets = $$('.reveal');
    if (!targets.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var group = entry.target.parentElement ? $$('.reveal', entry.target.parentElement) : [];
        var i = Math.max(0, group.indexOf(entry.target));
        entry.target.style.setProperty('--delay', Math.min(i, 6) * 70 + 'ms');
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---- The wall lays itself, left to right ------------------------------ */
  function initStoneCourse() {
    if (reduceMotion) return;
    $$('.stone-course--lay').forEach(function (course) {
      $$('path', course).slice(1).forEach(function (stone, i) {
        stone.style.animationDelay = i * 26 + 'ms';
      });
    });
  }

  /* ---- Dates ------------------------------------------------------------- */
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  function parseISO(iso) {
    var p = String(iso).split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }
  function today() {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function formatLong(d) { return MONTHS[d.getMonth()] + ' ' + d.getDate(); }

  function nextShow() {
    var now = today();
    var upcoming = SHOW_DATES.map(parseISO)
      .filter(function (d) { return d >= now; })
      .sort(function (a, b) { return a - b; });
    return upcoming.length ? upcoming[0] : null;
  }

  /* Keeps the horse-show banner and any "next show" line honest. A hard-coded
     date goes stale within weeks and makes the whole site look abandoned. */
  function initNextShow() {
    var slots = $$('[data-next-show]');
    if (!slots.length) return;
    var next = nextShow();
    slots.forEach(function (slot) {
      var mode = slot.getAttribute('data-next-show');
      if (!next) {
        slot.textContent = mode === 'headline'
          ? 'Next Season’s Show Schedule'
          : 'The 2027 schedule is being set — check back soon.';
        return;
      }
      var label = formatLong(next);
      slot.textContent = mode === 'headline'
        ? 'Upcoming Horse Show ' + label
        : label + ', ' + next.getFullYear();
    });
  }

  /* Dims dates that have already passed rather than pretending they haven't. */
  function initCalendar() {
    var entries = $$('[data-date]');
    if (!entries.length) return;
    var now = today();
    entries.forEach(function (entry) {
      if (parseISO(entry.getAttribute('data-date')) < now) {
        entry.classList.add('entry--past');
        var tag = $('[data-past-label]', entry);
        if (tag) tag.textContent = 'Past';
      }
    });
  }

  /* ---- This Week at the Farm -------------------------------------------- */
  function initThisWeek() {
    var host = $('[data-this-week]');
    if (!host) return;
    var list = $('[data-this-week-list]', host);
    var stamp = $('[data-this-week-stamp]', host);
    var note = $('[data-this-week-note]', host);

    var updated = parseISO(THIS_WEEK.updated);
    var days = Math.floor((today() - updated) / 86400000);
    var stale = days > 14;

    if (stamp) {
      stamp.textContent = stale
        ? 'Between updates — call for today’s stock'
        : 'Updated ' + formatLong(updated) + ', ' + updated.getFullYear();
    }
    if (note) {
      note.textContent = stale
        ? 'The stand is open daily, 9:00am–5:30pm. Honey, eggs and firewood are stocked year round; produce follows the season.'
        : THIS_WEEK.note;
    }
    if (!list || stale) return;

    list.innerHTML = '';
    THIS_WEEK.items.forEach(function (item) {
      var li = document.createElement('li');
      var name = document.createElement('span');
      name.className = 'in-season__name';
      name.textContent = item.name;
      var dots = document.createElement('span');
      dots.className = 'in-season__dots';
      dots.setAttribute('aria-hidden', 'true');
      var price = document.createElement('span');
      price.className = 'in-season__price';
      price.textContent = item.price;
      li.appendChild(name);
      li.appendChild(dots);
      li.appendChild(price);
      if (item.note) {
        var small = document.createElement('small');
        small.className = 'in-season__note';
        small.textContent = item.note;
        name.appendChild(small);
      }
      list.appendChild(li);
    });
  }

  /* ---- Kora public forms API ---------------------------------------------
     POST {apiBaseUrl}/api/v1/public/forms/submit with reCAPTCHA v2.
     Works with form[data-enquiry] and [data-contact-form] / #contact-form. */
  var recaptchaScriptPromise = null;
  var RECAPTCHA_W = 304;
  var RECAPTCHA_H = 78;
  var responsiveRecaptchaBoxes = [];

  function setFormStatus(form, text, kind) {
    var statusEl = form.querySelector('.form-status, [data-form-status]');
    if (!statusEl) return;
    statusEl.textContent = text || '';
    statusEl.classList.toggle('is-visible', Boolean(text));
    statusEl.removeAttribute('data-state');
    statusEl.classList.remove(
      'form-status--error', 'form-status--success', 'form-status--neutral',
      'is-error', 'is-success'
    );
    if (kind === 'error') {
      statusEl.setAttribute('data-state', 'error');
      statusEl.classList.add('form-status--error', 'is-error');
    } else if (kind === 'success') {
      statusEl.setAttribute('data-state', 'ok');
      statusEl.classList.add('form-status--success', 'is-success');
    } else if (kind) {
      statusEl.classList.add('form-status--neutral');
    }
  }

  function setSubmittingState(form, isSubmitting, busyLabel) {
    var submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;
    if (isSubmitting) {
      submitBtn.dataset.originalText = submitBtn.textContent || 'Submit';
      submitBtn.textContent = busyLabel || 'Sending...';
      submitBtn.disabled = true;
      return;
    }
    submitBtn.textContent = submitBtn.dataset.originalText || 'Submit';
    submitBtn.disabled = false;
  }

  function parseApiError(data, fallback) {
    var detail = data && data.detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
    if (Array.isArray(detail)) {
      var joined = detail.map(function (d) { return d.msg || d.message || ''; }).filter(Boolean).join(' ');
      if (joined) return joined;
    }
    if (data && typeof data.message === 'string' && data.message.trim()) return data.message;
    return fallback;
  }

  function scaleRecaptcha(box) {
    var wrap = box.parentElement;
    if (!wrap || !wrap.classList.contains('g-recaptcha-scale')) return;
    var available = wrap.clientWidth;
    if (!available) return;
    var scale = Math.min(1, available / RECAPTCHA_W);
    box.style.transform = scale < 1 ? 'scale(' + scale.toFixed(4) + ')' : 'none';
    wrap.style.height = Math.ceil(RECAPTCHA_H * scale) + 'px';
  }

  function makeRecaptchaResponsive(box) {
    if (!box || box.dataset.koraRecaptchaResponsive === 'true') return;
    box.dataset.koraRecaptchaResponsive = 'true';
    var wrap = box.parentElement;
    if (!wrap || !wrap.classList.contains('g-recaptcha-scale')) {
      wrap = document.createElement('div');
      wrap.className = 'g-recaptcha-scale';
      box.parentNode.insertBefore(wrap, box);
      wrap.appendChild(box);
    }
    scaleRecaptcha(box);
    var observer = new MutationObserver(function () { scaleRecaptcha(box); });
    observer.observe(box, { childList: true, subtree: true });
    responsiveRecaptchaBoxes.push(box);
  }

  var recaptchaResizeTimer = null;
  window.addEventListener('resize', function () {
    window.clearTimeout(recaptchaResizeTimer);
    recaptchaResizeTimer = window.setTimeout(function () {
      responsiveRecaptchaBoxes.forEach(scaleRecaptcha);
    }, 150);
  });

  function ensureRecaptchaScript(siteKey) {
    if (!siteKey) return Promise.resolve();
    if (typeof window.grecaptcha !== 'undefined') return Promise.resolve();
    if (recaptchaScriptPromise) return recaptchaScriptPromise;
    recaptchaScriptPromise = new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-kora-recaptcha="true"]');
      if (existing) {
        existing.addEventListener('load', function () { resolve(); });
        existing.addEventListener('error', function () { reject(new Error('reCAPTCHA failed to load')); });
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js';
      script.async = true;
      script.defer = true;
      script.dataset.koraRecaptcha = 'true';
      script.onload = function () { resolve(); };
      script.onerror = function () { reject(new Error('reCAPTCHA failed to load')); };
      document.head.appendChild(script);
    });
    return recaptchaScriptPromise;
  }

  function getRecaptchaToken(form) {
    if (typeof window.grecaptcha === 'undefined') return '';
    var recaptchaEl = form.querySelector('.g-recaptcha');
    if (!recaptchaEl) return '';
    return window.grecaptcha.getResponse() || '';
  }

  function resetRecaptcha(form) {
    if (typeof window.grecaptcha === 'undefined') return;
    if (form.querySelector('.g-recaptcha')) window.grecaptcha.reset();
  }

  function fieldValue(form, names) {
    for (var i = 0; i < names.length; i++) {
      var el = form.querySelector('[name="' + names[i] + '"]');
      if (el && String(el.value || '').trim()) return String(el.value).trim();
    }
    return '';
  }

  function buildEnquiryPayload(form) {
    var name = fieldValue(form, ['name', 'Name']);
    var email = fieldValue(form, ['email', 'Email']);
    var phone = fieldValue(form, ['phone', 'Phone']);
    var topic = fieldValue(form, ['topic', 'Event type', 'Subject']);
    var details = fieldValue(form, ['message', 'Details', 'Message']);
    var preferredDate = fieldValue(form, ['Preferred date', 'preferred_date']);
    var guestCount = fieldValue(form, ['Guest count', 'guest_count']);
    var subject = form.getAttribute('data-subject') || '';

    var messageParts = [];
    if (subject) messageParts.push(subject);
    if (topic) messageParts.push('Topic: ' + topic);
    if (preferredDate) messageParts.push('Preferred date: ' + preferredDate);
    if (guestCount) messageParts.push('Guest count: ' + guestCount);
    if (details) messageParts.push(details);
    var message = messageParts.join('\n').trim();

    var formData = {
      name: name,
      email: email,
      message: message || details || topic || subject || 'Website enquiry'
    };
    if (phone) formData.phone = phone;
    if (topic) formData.topic = topic;
    if (preferredDate) formData.preferred_date = preferredDate;
    if (guestCount) formData.guest_count = guestCount;
    return { name: name, email: email, phone: phone, topic: topic, message: formData.message, formData: formData };
  }

  function bindKoraForm(form) {
    if (!form || form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    var config = window.KORA_SITE_CONFIG || {};
    var apiBaseUrl = String(config.apiBaseUrl || '').replace(/\/+$/, '');
    var businessId = config.businessId || '';
    var recaptchaSiteKey = String(config.recaptchaSiteKey || '').trim();
    var recaptchaEl = form.querySelector('.g-recaptcha');

    if (recaptchaEl && recaptchaSiteKey) {
      recaptchaEl.setAttribute('data-sitekey', recaptchaSiteKey);
      makeRecaptchaResponsive(recaptchaEl);
      form.addEventListener('focusin', function () {
        ensureRecaptchaScript(recaptchaSiteKey).catch(function () {
          setFormStatus(form, 'Security check failed to load. Please refresh and try again.', 'error');
        });
      }, { once: true });
    } else if (recaptchaEl && !recaptchaSiteKey) {
      recaptchaEl.style.display = 'none';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;

      var payload = buildEnquiryPayload(form);
      if (!payload.name || !payload.email || !payload.message) {
        setFormStatus(form, 'Please fill in your name, email, and message.', 'error');
        return;
      }
      if (!businessId || !apiBaseUrl) {
        setFormStatus(form, 'Form submission is not configured for this site.', 'error');
        return;
      }
      if (recaptchaEl && !recaptchaSiteKey) {
        setFormStatus(form, 'Form temporarily unavailable.', 'error');
        return;
      }

      var runSubmit = function (captchaToken) {
        setSubmittingState(form, true, 'Sending...');
        setFormStatus(form, 'Sending...', 'neutral');
        fetch(apiBaseUrl + '/api/v1/public/forms/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            business_id: businessId,
            form_type: 'contact',
            form_data: payload.formData,
            submitter_email: payload.email,
            captcha_token: captchaToken || ''
          })
        })
          .then(function (response) {
            return response.json().catch(function () { return {}; }).then(function (data) {
              if (!response.ok) {
                throw new Error(parseApiError(
                  data,
                  'Something went wrong. Please try again or call (917) 376-2008.'
                ));
              }
              return data;
            });
          })
          .then(function (data) {
            form.reset();
            resetRecaptcha(form);
            setFormStatus(form, data.message || 'Thank you! Your message has been received.', 'success');
          })
          .catch(function (error) {
            resetRecaptcha(form);
            setFormStatus(
              form,
              (error && error.message) || 'Something went wrong. Please try again or call (917) 376-2008.',
              'error'
            );
          })
          .then(function () {
            setSubmittingState(form, false);
          });
      };

      if (recaptchaEl && recaptchaSiteKey) {
        ensureRecaptchaScript(recaptchaSiteKey)
          .then(function () {
            var captchaCheck = getRecaptchaToken(form);
            if (!captchaCheck) {
              setFormStatus(form, 'Please complete the security check.', 'error');
              return;
            }
            runSubmit(captchaCheck);
          })
          .catch(function () {
            setFormStatus(form, 'Security check failed to load. Please refresh and try again.', 'error');
          });
        return;
      }
      runSubmit('');
    });
  }

  function initForms() {
    $$('form[data-enquiry], form[data-contact-form], #contact-form').forEach(bindKoraForm);
  }

  /* ---- Current year in the footer --------------------------------------- */
  function initYear() {
    $$('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function boot() {
    initHeader();
    initNav();
    initDrawer();
    initHero();
    initReveal();
    initStoneCourse();
    initNextShow();
    initCalendar();
    initThisWeek();
    initForms();
    initYear();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();
