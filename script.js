/* =====================================================================
   VELT MEDIA — script.js
   Nav behaviour, scroll-driven reveals (GSAP + ScrollTrigger), stat
   counters, and card tilt/glow micro-interactions.
   ===================================================================== */
(function(){
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var html   = document.documentElement;
  var header = document.getElementById('header');
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  var navBackdrop = document.getElementById('navBackdrop');
  var navLinks = document.querySelectorAll('.nav__link');
  var sections = document.querySelectorAll('main section[id]');

  /* ---------------------------------------------------------------
     Header state on scroll (rAF-throttled)
  --------------------------------------------------------------- */
  var scrollTicking = false;
  function updateHeader(){
    if(window.scrollY > 40){ header.classList.add('scrolled'); }
    else{ header.classList.remove('scrolled'); }
    scrollTicking = false;
  }
  document.addEventListener('scroll', function(){
    if(!scrollTicking){
      requestAnimationFrame(updateHeader);
      scrollTicking = true;
    }
  }, { passive:true });
  updateHeader();

  /* ---------------------------------------------------------------
     Mobile navigation
  --------------------------------------------------------------- */
  function closeNav(){
    nav.classList.remove('nav--open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded','false');
    document.body.classList.remove('no-scroll');
    if(navBackdrop){ navBackdrop.classList.remove('active'); }
  }
  function toggleNav(){
    var isOpen = nav.classList.toggle('nav--open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('no-scroll', isOpen);
    if(navBackdrop){ navBackdrop.classList.toggle('active', isOpen); }
  }
  if(navToggle){ navToggle.addEventListener('click', toggleNav); }
  if(navBackdrop){ navBackdrop.addEventListener('click', closeNav); }
  navLinks.forEach(function(link){ link.addEventListener('click', closeNav); });

  /* ---------------------------------------------------------------
     Active nav link tracking
  --------------------------------------------------------------- */
  if('IntersectionObserver' in window && sections.length){
    var navMap = new Map();
    navLinks.forEach(function(link){
      navMap.set(link.getAttribute('href').slice(1), link);
    });
    var sectionObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var link = navMap.get(entry.target.id);
        if(!link || !entry.isIntersecting) return;
        navLinks.forEach(function(l){ l.classList.remove('active'); });
        link.classList.add('active');
      });
    }, { rootMargin:'-45% 0px -50% 0px', threshold:0 });
    sections.forEach(function(s){ sectionObserver.observe(s); });
  }

  /* ---------------------------------------------------------------
     Stat counters (48H / 100%)
  --------------------------------------------------------------- */
  var statEls = document.querySelectorAll('[data-count]');
  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1500;
    var start = null;
    function step(ts){
      if(start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if(progress < 1){ requestAnimationFrame(step); }
    }
    requestAnimationFrame(step);
  }
  if(statEls.length){
    if(prefersReducedMotion){
      statEls.forEach(function(el){
        el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
      });
    } else if('IntersectionObserver' in window){
      var statObserver = new IntersectionObserver(function(entries, obs){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold:0.6 });
      statEls.forEach(function(el){ statObserver.observe(el); });
    }
  }

  /* ---------------------------------------------------------------
     Card tilt + cursor-tracked glow (Services & Branches)
  --------------------------------------------------------------- */
  if(!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches){
    var tiltCards = document.querySelectorAll('.service-card, .branch-card');
    tiltCards.forEach(function(card){
      var maxTilt = card.classList.contains('service-card') ? 5 : 3;
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        card.style.setProperty('--mx', (x / r.width * 100) + '%');
        card.style.setProperty('--my', (y / r.height * 100) + '%');
        var rx = ((y / r.height) - 0.5) * -maxTilt;
        var ry = ((x / r.width) - 0.5) * maxTilt;
        card.style.transform = 'translateY(-6px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      });
      card.addEventListener('mouseenter', function(){ card.style.willChange = 'transform'; });
      card.addEventListener('mouseleave', function(){
        card.style.transform = '';
        card.style.willChange = 'auto';
      });
    });
  }

  /* ---------------------------------------------------------------
     Ambient cursor glow (desktop, fine-pointer only)
  --------------------------------------------------------------- */
  var cursorGlow = document.querySelector('.cursor-glow');
  if(cursorGlow){
    if(!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches){
      var cx = 0, cy = 0, tx = 0, ty = 0, glowActive = false;
      window.addEventListener('mousemove', function(e){
        tx = e.clientX; ty = e.clientY;
        if(!glowActive){ cursorGlow.style.opacity = '1'; glowActive = true; }
      });
      (function raf(){
        cx += (tx - cx) * 0.14;
        cy += (ty - cy) * 0.14;
        cursorGlow.style.transform = 'translate(' + (cx - 210) + 'px,' + (cy - 210) + 'px)';
        requestAnimationFrame(raf);
      })();
    } else {
      cursorGlow.style.display = 'none';
    }
  }

  /* ---------------------------------------------------------------
     Scroll-driven reveals — GSAP + ScrollTrigger
     Elements only ever hide via CSS once `.gsap-ready` is present
     on <html>, and that class is only added here, after GSAP has
     confirmed it's loaded. If the CDN fails, content stays visible.
  --------------------------------------------------------------- */
  function initScrollAnimations(){
    html.classList.add('gsap-ready');
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('[data-reveal]').forEach(function(el){
      gsap.to(el, {
        opacity:1, y:0, duration:0.9, ease:'power3.out',
        scrollTrigger:{ trigger:el, start:'top 88%' }
      });
    });

    document.querySelectorAll('[data-reveal-group]').forEach(function(group){
      gsap.to(group.children, {
        opacity:1, y:0, duration:0.8, ease:'power3.out', stagger:0.12,
        scrollTrigger:{ trigger:group, start:'top 88%' }
      });
    });
  }

  var gsapAvailable = (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined');
  if(gsapAvailable && !prefersReducedMotion){
    initScrollAnimations();
  }
  /* If GSAP didn't load, or the person prefers reduced motion, we
     simply never add `.gsap-ready` — the base CSS already renders
     every [data-reveal] element at full opacity, so nothing breaks. */

})();
