/* ============================================================
   VELT MEDIA — PERFORMANCE OPTIMIZED SCRIPT
   Keeps the existing front-end look and animations,
   while reducing unnecessary browser work.
   ============================================================ */

(function () {

  'use strict';


  /* ------------------------------------------------------------
     GLOBAL SETTINGS
     ------------------------------------------------------------ */

  var html = document.documentElement;
  var body = document.body;

  var prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var finePointer =
    window.matchMedia('(pointer: fine)').matches;


  /* ============================================================
     HEADER SCROLL EFFECT
     ============================================================ */

  var header = document.getElementById('header');

  if (header) {

    var headerTicking = false;

    function updateHeader() {

      header.classList.toggle(
        'scrolled',
        window.scrollY > 40
      );

      headerTicking = false;
    }

    document.addEventListener(
      'scroll',
      function () {

        if (!headerTicking) {

          requestAnimationFrame(updateHeader);

          headerTicking = true;
        }

      },
      { passive: true }
    );

    updateHeader();
  }


  /* ============================================================
     MOBILE NAVIGATION
     ============================================================ */

  var navToggle =
    document.getElementById('navToggle');

  var nav =
    document.getElementById('nav');

  var navBackdrop =
    document.getElementById('navBackdrop');

  var navLinks =
    document.querySelectorAll('.nav__link');


  function closeNav() {

    if (!nav) return;

    nav.classList.remove('nav--open');

    if (navToggle) {

      navToggle.classList.remove('active');

      navToggle.setAttribute(
        'aria-expanded',
        'false'
      );
    }

    body.classList.remove('no-scroll');

    if (navBackdrop) {
      navBackdrop.classList.remove('active');
    }
  }


  function toggleNav() {

    if (!nav) return;

    var isOpen =
      nav.classList.toggle('nav--open');


    if (navToggle) {

      navToggle.classList.toggle(
        'active',
        isOpen
      );

      navToggle.setAttribute(
        'aria-expanded',
        String(isOpen)
      );
    }


    body.classList.toggle(
      'no-scroll',
      isOpen
    );


    if (navBackdrop) {

      navBackdrop.classList.toggle(
        'active',
        isOpen
      );
    }
  }


  if (navToggle) {

    navToggle.addEventListener(
      'click',
      toggleNav
    );
  }


  if (navBackdrop) {

    navBackdrop.addEventListener(
      'click',
      closeNav
    );
  }


  navLinks.forEach(function (link) {

    link.addEventListener(
      'click',
      closeNav
    );

  });


  /* ============================================================
     ACTIVE NAV LINK
     ============================================================ */

  var sections =
    document.querySelectorAll(
      'main section[id]'
    );


  if (
    'IntersectionObserver' in window &&
    sections.length
  ) {

    var navMap = new Map();


    navLinks.forEach(function (link) {

      var href =
        link.getAttribute('href');


      if (
        !href ||
        href.charAt(0) !== '#'
      ) {
        return;
      }


      navMap.set(
        href.substring(1),
        link
      );

    });


    var sectionObserver =
      new IntersectionObserver(

        function (entries) {

          entries.forEach(function (entry) {

            if (!entry.isIntersecting) {
              return;
            }


            var activeLink =
              navMap.get(
                entry.target.id
              );


            if (!activeLink) {
              return;
            }


            navLinks.forEach(function (link) {

              link.classList.remove(
                'active'
              );

            });


            activeLink.classList.add(
              'active'
            );

          });

        },

        {
          rootMargin:
            '-45% 0px -50% 0px',

          threshold: 0
        }

      );


    sections.forEach(function (section) {

      sectionObserver.observe(
        section
      );

    });

  }


  /* ============================================================
     STAT COUNTERS
     ============================================================ */

  var statEls =
    document.querySelectorAll(
      '[data-count]'
    );


  function animateCount(el) {

    var target =
      parseFloat(
        el.getAttribute(
          'data-count'
        )
      );


    var suffix =
      el.getAttribute(
        'data-suffix'
      ) || '';


    var duration = 1200;

    var startTime = null;


    function frame(timestamp) {

      if (startTime === null) {
        startTime = timestamp;
      }


      var progress =
        Math.min(
          (timestamp - startTime) /
          duration,
          1
        );


      var eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );


      el.textContent =
        Math.round(
          target * eased
        ) + suffix;


      if (progress < 1) {

        requestAnimationFrame(
          frame
        );

      }

    }


    requestAnimationFrame(frame);
  }


  if (statEls.length) {

    if (prefersReducedMotion) {

      statEls.forEach(function (el) {

        el.textContent =
          el.getAttribute(
            'data-count'
          ) +
          (
            el.getAttribute(
              'data-suffix'
            ) || ''
          );

      });

    }

    else if (
      'IntersectionObserver' in window
    ) {

      var statObserver =
        new IntersectionObserver(

          function (
            entries,
            observer
          ) {

            entries.forEach(function (entry) {

              if (
                !entry.isIntersecting
              ) {
                return;
              }


              animateCount(
                entry.target
              );


              observer.unobserve(
                entry.target
              );

            });

          },

          {
            threshold: 0.6
          }

        );


      statEls.forEach(function (el) {

        statObserver.observe(el);

      });

    }

  }


  /* ============================================================
     CARD TILT
     Smooth + GPU friendly
     ============================================================ */

  if (
    !prefersReducedMotion &&
    finePointer
  ) {

    var tiltCards =
      document.querySelectorAll(
        '.service-card, .branch-card'
      );


    tiltCards.forEach(function (card) {

      var animationFrame = null;

      var mouseX = 0;
      var mouseY = 0;

      var cardRect = null;


      function renderTilt() {

        animationFrame = null;


        if (!cardRect) {

          cardRect =
            card.getBoundingClientRect();

        }


        var x =
          mouseX - cardRect.left;

        var y =
          mouseY - cardRect.top;


        var percentX =
          x / cardRect.width;

        var percentY =
          y / cardRect.height;


        var maxTilt =
          card.classList.contains(
            'service-card'
          )
            ? 3
            : 2;


        var rotateX =
          (percentY - 0.5) *
          -maxTilt;


        var rotateY =
          (percentX - 0.5) *
          maxTilt;


        card.style.transform =
          'translate3d(0,-4px,0)' +
          'rotateX(' +
          rotateX +
          'deg) ' +
          'rotateY(' +
          rotateY +
          'deg)';


        card.style.setProperty(
          '--mx',
          (percentX * 100) + '%'
        );


        card.style.setProperty(
          '--my',
          (percentY * 100) + '%'
        );
      }


      card.addEventListener(
        'mouseenter',
        function () {

          cardRect =
            card.getBoundingClientRect();

          card.style.willChange =
            'transform';
        }
      );


      card.addEventListener(
        'mousemove',
        function (event) {

          mouseX =
            event.clientX;

          mouseY =
            event.clientY;


          if (!animationFrame) {

            animationFrame =
              requestAnimationFrame(
                renderTilt
              );

          }

        }
      );


      card.addEventListener(
        'mouseleave',
        function () {

          if (animationFrame) {

            cancelAnimationFrame(
              animationFrame
            );

            animationFrame = null;
          }


          cardRect = null;


          card.style.transform =
            '';

          card.style.willChange =
            'auto';
        }
      );

    });

  }


  /* ============================================================
     CURSOR GLOW
     Only animates while mouse is moving
     ============================================================ */

  var cursorGlow =
    document.querySelector(
      '.cursor-glow'
    );


  if (
    cursorGlow &&
    !prefersReducedMotion &&
    finePointer
  ) {

    var glowX = 0;
    var glowY = 0;

    var targetX = 0;
    var targetY = 0;

    var glowAnimationRunning =
      false;


    function animateGlow() {

      var deltaX =
        targetX - glowX;

      var deltaY =
        targetY - glowY;


      glowX +=
        deltaX * 0.12;

      glowY +=
        deltaY * 0.12;


      cursorGlow.style.transform =
        'translate3d(' +
        (glowX - 170) +
        'px,' +
        (glowY - 170) +
        'px,0)';


      if (
        Math.abs(deltaX) > 0.5 ||
        Math.abs(deltaY) > 0.5
      ) {

        requestAnimationFrame(
          animateGlow
        );

      }

      else {

        glowAnimationRunning =
          false;

      }
    }


    window.addEventListener(
      'mousemove',
      function (event) {

        targetX =
          event.clientX;

        targetY =
          event.clientY;


        cursorGlow.style.opacity =
          '1';


        if (!glowAnimationRunning) {

          glowAnimationRunning =
            true;

          requestAnimationFrame(
            animateGlow
          );

        }

      },
      { passive: true }
    );

  }

  else if (cursorGlow) {

    cursorGlow.style.display =
      'none';
  }


  /* ============================================================
     GSAP SCROLL REVEALS
     ============================================================ */

  function initScrollAnimations() {

    if (
      typeof window.gsap ===
      'undefined' ||

      typeof window.ScrollTrigger ===
      'undefined'
    ) {
      return;
    }


    html.classList.add(
      'gsap-ready'
    );


    gsap.registerPlugin(
      ScrollTrigger
    );


    /* Individual elements */

    document
      .querySelectorAll(
        '[data-reveal]'
      )
      .forEach(function (element) {

        gsap.fromTo(

          element,

          {
            opacity: 0,
            y: 30
          },

          {
            opacity: 1,
            y: 0,

            duration: 0.8,

            ease:
              'power3.out',

            scrollTrigger: {

              trigger:
                element,

              start:
                'top 88%',

              once: true
            }

          }

        );

      });


    /* Groups */

    document
      .querySelectorAll(
        '[data-reveal-group]'
      )
      .forEach(function (group) {

        gsap.fromTo(

          group.children,

          {
            opacity: 0,
            y: 26
          },

          {
            opacity: 1,
            y: 0,

            duration: 0.75,

            ease:
              'power3.out',

            stagger:
              0.1,

            scrollTrigger: {

              trigger:
                group,

              start:
                'top 88%',

              once: true
            }

          }

        );

      });

  }


  /* ============================================================
     START ANIMATIONS
     ============================================================ */

  if (
    !prefersReducedMotion &&
    typeof window.gsap !== 'undefined' &&
    typeof window.ScrollTrigger !== 'undefined'
  ) {

    initScrollAnimations();

  }


})();