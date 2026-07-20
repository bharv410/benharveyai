/* Money IQ — landing motion. Dependency-free. Everything degrades gracefully and respects
   prefers-reduced-motion. Ported/simplified from benharveyfit-ai's web/landing.js: the hero
   chat self-types a station-aware exchange; sections reveal on scroll. No gallery/video/
   web-app-login logic — Money IQ's web scaffold is marketing-only (App Store CTA), not a
   second client. */
(function () {
  'use strict';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── sticky nav shadow on scroll ───────────────────────────── */
  var nav = document.getElementById('nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── mobile hamburger ──────────────────────────────────────── */
  var burger = document.getElementById('nav-burger');
  if (burger && nav) {
    var closeNav = function () { nav.classList.remove('nav-open'); burger.setAttribute('aria-expanded', 'false'); };
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('.nav-links a').forEach(function (a) { a.addEventListener('click', closeNav); });
  }

  /* ── hero chat script — a station-aware exchange (Money IQ's core pitch: one question,
     a different answer per person) ── */
  var SCRIPT = [
    { who: 'coach', text: "Linked your bank. You're netting $1,340/mo — what's your job?" },
    { who: 'me',    text: "software engineer, mid-level" },
    { who: 'coach', text: "You're under-market. This week: apply to 3 Senior roles — that's a bigger lever than any budget cut." },
    { who: 'me',    text: "how do I make more money?" },
    { who: 'coach', text: "Same question, different answer for everyone — that's the whole point. For you: negotiate or jump, then monetize what you already know." }
  ];

  /* ── scroll reveal ─────────────────────────────────────────── */
  var seen = new WeakSet();
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || seen.has(e.target)) return;
        seen.add(e.target);
        e.target.classList.add('in');
        if (e.target.id === 'hero-chat') runHeroChat();
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px 8% 0px' });

    document.querySelectorAll('.reveal, #hero-chat').forEach(function (el) { io.observe(el); });

    window.addEventListener('load', function () {
      setTimeout(function () {
        document.querySelectorAll('.reveal:not(.in)').forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
        });
      }, 2600);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    runHeroChat(true);
  }

  /* ── hero self-typing coach chat ─────────────────────────────── */
  function bubble(who, text) {
    var b = document.createElement('div');
    b.className = 'bub ' + who;
    b.textContent = text;
    return b;
  }

  var heroStarted = false;
  function runHeroChat(instant) {
    var chat = document.getElementById('hero-chat');
    if (!chat || heroStarted) return;
    heroStarted = true;

    // The HTML seeds SCRIPT[0] so the phone never paints blank on load.
    var seeded = chat.children.length > 0;
    var start = seeded ? 1 : 0;

    if (instant || reduced) {
      SCRIPT.slice(start).forEach(function (m) { chat.appendChild(bubble(m.who, m.text)); });
      trimOverflow(chat);
      return;
    }

    var i = start;
    function next() {
      if (i >= SCRIPT.length) { setTimeout(function () { resetAndLoop(chat); }, 4200); return; }
      var m = SCRIPT[i++];
      chat.appendChild(bubble(m.who, m.text));
      trimOverflow(chat);
      setTimeout(next, m.who === 'coach' ? 1400 : 780);
    }
    setTimeout(next, 500);
  }

  function resetAndLoop(chat) {
    chat.style.transition = 'opacity .5s ease';
    chat.style.opacity = '0';
    setTimeout(function () {
      chat.innerHTML = '';
      chat.appendChild(bubble('coach', SCRIPT[0].text));
      chat.style.opacity = '1';
      heroStarted = false;
      runHeroChat();
    }, 520);
  }

  // keep the most recent bubbles visible inside the fixed-height phone
  function trimOverflow(chat) {
    var guard = 0;
    while (chat.scrollHeight > chat.clientHeight + 4 && chat.children.length > 2 && guard < 20) {
      chat.removeChild(chat.firstChild); guard++;
    }
  }
})();
