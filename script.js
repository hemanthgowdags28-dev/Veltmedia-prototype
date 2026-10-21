/* =====================================================================
   VELT MEDIA — Minimal 3D Fluid Glass, WhatsApp Slot Builder & UX
   ===================================================================== */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

(function () {
  'use strict';

  const html = document.documentElement;
  const body = document.body;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  const WHATSAPP_NUMBER = '918088425328';

  function buildWhatsAppUrl(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  /* ============================================================
     1. HEADER SCROLL & MOBILE NAVIGATION
     ============================================================ */
  const header = document.getElementById('header');
  if (header) {
    let headerTicking = false;
    const updateHeader = () => {
      header.classList.toggle('scrolled', window.scrollY > 36);
      headerTicking = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!headerTicking) {
          requestAnimationFrame(updateHeader);
          headerTicking = true;
        }
      },
      { passive: true }
    );
    updateHeader();
  }

  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  const navBackdrop = document.getElementById('navBackdrop');
  const navLinks = document.querySelectorAll('.nav__link');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('nav--open');
    if (navToggle) {
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    body.classList.remove('no-scroll');
    if (navBackdrop) navBackdrop.classList.remove('active');
  }

  function toggleNav() {
    if (!nav) return;
    const isOpen = nav.classList.toggle('nav--open');
    if (navToggle) {
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    }
    body.classList.toggle('no-scroll', isOpen);
    if (navBackdrop) navBackdrop.classList.toggle('active', isOpen);
  }

  if (navToggle) navToggle.addEventListener('click', toggleNav);
  if (navBackdrop) navBackdrop.addEventListener('click', closeNav);
  navLinks.forEach((link) => link.addEventListener('click', closeNav));

  /* ============================================================
     2. ACTIVE NAVIGATION SPY
     ============================================================ */
  const sections = document.querySelectorAll('main section[id]');
  if ('IntersectionObserver' in window && sections.length) {
    const navMap = new Map();
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        navMap.set(href.substring(1), link);
      }
    });

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const activeLink = navMap.get(entry.target.id);
          if (!activeLink) return;
          navLinks.forEach((l) => l.classList.remove('active'));
          activeLink.classList.add('active');
        });
      },
      { rootMargin: '-42% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((s) => sectionObserver.observe(s));
  }

  /* ============================================================
     3. WHATSAPP PRE-FILLED MESSAGE CUSTOMIZER & REDIRECT REPAIR
     ============================================================ */
  const slotChips = document.querySelectorAll('.slot-chip');
  const waMessagePreview = document.getElementById('waMessagePreview');
  const mainWaBookingBtn = document.getElementById('mainWaBookingBtn');
  const globalWaLinks = document.querySelectorAll('[data-wa-link]');

  function updateWhatsAppMessage(projectType) {
    const message = `Hi VELT MEDIA! I’d like to book a 48-hour post-production slot for a ${projectType}. Please let me know your availability and next steps!`;
    const url = buildWhatsAppUrl(message);

    if (waMessagePreview) {
      waMessagePreview.textContent = `“${message}”`;
    }
    if (mainWaBookingBtn) {
      mainWaBookingBtn.setAttribute('href', url);
    }
    globalWaLinks.forEach((link) => {
      link.setAttribute('href', url);
    });
  }

  if (slotChips.length) {
    slotChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        slotChips.forEach((c) => c.classList.toggle('active', c === chip));
        const selectedType = chip.getAttribute('data-slot-type') || 'video project';
        updateWhatsAppMessage(selectedType);
      });
    });
  }

  /* ============================================================
     4. COPY TO CLIPBOARD & TOAST NOTIFICATION
     ============================================================ */
  const copyToast = document.getElementById('copyToast');
  const copyToastText = document.getElementById('copyToastText');
  let toastTimer = null;

  function showToast(text) {
    if (!copyToast || !copyToastText) return;
    copyToastText.textContent = text;
    copyToast.classList.add('visible');
    copyToast.setAttribute('aria-hidden', 'false');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      copyToast.classList.remove('visible');
      copyToast.setAttribute('aria-hidden', 'true');
    }, 2400);
  }

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const val = btn.getAttribute('data-copy');
      if (!val) return;
      try {
        await navigator.clipboard.writeText(val);
        showToast(`Copied: ${val}`);
      } catch {
        showToast(`Contact: ${val}`);
      }
    });
  });

  /* ============================================================
     5. ANIMATED STAT COUNTERS
     ============================================================ */
  const statEls = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1200;
    let startTime = null;

    function frame(timestamp) {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (statEls.length) {
    if (prefersReducedMotion) {
      statEls.forEach((el) => {
        el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
      });
    } else if ('IntersectionObserver' in window) {
      const statObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCount(entry.target);
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.5 }
      );
      statEls.forEach((el) => statObserver.observe(el));
    }
  }

  /* ============================================================
     6. INTERACTIVE COLOR GRADE COMPARATOR
     ============================================================ */
  const gradeRange = document.getElementById('gradeRange');
  const gradeRawLayer = document.getElementById('gradeRawLayer');
  const gradeHandle = document.getElementById('gradeHandle');

  if (gradeRange && gradeRawLayer && gradeHandle) {
    const updateComparator = (val) => {
      const pct = Math.max(5, Math.min(95, Number(val)));
      gradeRawLayer.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      gradeHandle.style.left = `${pct}%`;
    };
    gradeRange.addEventListener('input', (e) => updateComparator(e.target.value));
    updateComparator(gradeRange.value);
  }

  /* ============================================================
     7. INTERACTIVE WORK GALLERY FILTERING
     ============================================================ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryGrid = document.getElementById('galleryGrid');

  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');

        filterBtns.forEach((b) => {
          const active = b === btn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-selected', String(active));
        });

        if (galleryGrid) {
          galleryGrid.style.gridTemplateRows = filter === 'all' ? '' : 'auto';
        }

        galleryItems.forEach((item) => {
          const cat = item.getAttribute('data-category');
          const matches = filter === 'all' || cat === filter;
          item.classList.toggle('is-hidden', !matches);

          if (matches && typeof window.gsap !== 'undefined' && !prefersReducedMotion) {
            window.gsap.fromTo(
              item,
              { opacity: 0, y: 16, scale: 0.98 },
              { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' }
            );
          }
        });
      });
    });
  }

  /* ============================================================
     8. FLUID GLASS CARD TILT & MAGNETIC BUTTONS (DESKTOP)
     ============================================================ */
  if (!prefersReducedMotion && finePointer) {
    const tiltCards = document.querySelectorAll('[data-tilt-card]');
    tiltCards.forEach((card) => {
      let rafId = null;
      let mx = 0;
      let my = 0;
      let rect = null;

      const renderCardTilt = () => {
        rafId = null;
        if (!rect) rect = card.getBoundingClientRect();
        const x = mx - rect.left;
        const y = my - rect.top;
        const px = Math.max(0, Math.min(1, x / rect.width));
        const py = Math.max(0, Math.min(1, y / rect.height));

        const maxTilt = card.classList.contains('gallery-item') ? 2.0 : 3.0;
        const rotX = (py - 0.5) * -maxTilt;
        const rotY = (px - 0.5) * maxTilt;

        card.style.transform = `perspective(900px) translate3d(0, -4px, 0) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
        card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      };

      card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect();
      });

      card.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        if (!rafId) rafId = requestAnimationFrame(renderCardTilt);
      });

      card.addEventListener('mouseleave', () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        rect = null;
        card.style.transform = '';
      });
    });

    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.16;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.16;
        btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ============================================================
     9. CURSOR GLOW
     ============================================================ */
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && !prefersReducedMotion && finePointer) {
    let glowX = 0;
    let glowY = 0;
    let targetX = 0;
    let targetY = 0;
    let glowRunning = false;

    const animateGlow = () => {
      const dx = targetX - glowX;
      const dy = targetY - glowY;
      glowX += dx * 0.14;
      glowY += dy * 0.14;
      cursorGlow.style.transform = `translate3d(${(glowX - 170).toFixed(1)}px, ${(glowY - 170).toFixed(1)}px, 0)`;

      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        requestAnimationFrame(animateGlow);
      } else {
        glowRunning = false;
      }
    };

    window.addEventListener(
      'mousemove',
      (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        cursorGlow.style.opacity = '1';
        if (!glowRunning) {
          glowRunning = true;
          requestAnimationFrame(animateGlow);
        }
      },
      { passive: true }
    );
  } else if (cursorGlow) {
    cursorGlow.style.display = 'none';
  }

  /* ============================================================
     10. COLLAPSIBLE BOTTOM CONTROL DOCK
     ============================================================ */
  const bottomDock = document.getElementById('bottomDock');
  const dockToggle = document.getElementById('dockToggle');
  const dockToggleLabel = document.getElementById('dockToggleLabel');

  function toggleDock() {
    if (!bottomDock) return;
    const collapsed = bottomDock.classList.toggle('is-collapsed');
    if (dockToggle) dockToggle.setAttribute('aria-expanded', String(!collapsed));
    if (dockToggleLabel) {
      dockToggleLabel.textContent = collapsed ? '▴ Optics' : '▾ Optics';
    }
  }

  if (dockToggle) {
    dockToggle.addEventListener('click', toggleDock);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'h' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      toggleDock();
    }
  });

  /* ============================================================
     11. THREE.JS MINIMAL 3D FLUID GLASS SCULPTURE
     ============================================================ */
  function initThreeFluidGlassScene() {
    const mount = document.getElementById('webgl-mount');
    if (!mount) return;

    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070709, 0.08);

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.6);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const hemiLight = new THREE.HemisphereLight(0xdde4ff, 0x160a0e, 0.8);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff2e6, 2.1);
    keyLight.position.set(4.5, 5.5, 5.0);
    scene.add(keyLight);

    const crimsonRimLight = new THREE.PointLight(0xe50914, 6.0, 15);
    crimsonRimLight.position.set(-3.2, -1.6, 2.8);
    scene.add(crimsonRimLight);

    // Composite 6-Part Minimal 3D Fluid Glass & Cinema Ring Assembly
    const rigGroup = new THREE.Group();
    scene.add(rigGroup);

    const shaderUniforms = {
      uTime: { value: 0 },
    };

    // Part 1: Refractive Fluid Glass Torus-Knot
    const fluidGeo = new THREE.TorusKnotGeometry(1.02, 0.28, isSoftwareGl ? 96 : 150, isSoftwareGl ? 24 : 32, 2, 3);
    const fluidMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffffff),
      roughness: 0.08,
      metalness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.94,
      transparent: true,
      opacity: isSoftwareGl ? 0.42 : 1.0,
      ior: 1.58,
      thickness: 1.7,
      attenuationColor: new THREE.Color(0xe50914),
      attenuationDistance: 2.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      iridescence: 0.45,
      iridescenceIOR: 1.32,
    });

    fluidMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = shaderUniforms.uTime;
      shader.vertexShader =
        'uniform float uTime;\n' +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>
          float wave = sin(position.x * 2.8 + uTime * 1.2) * cos(position.y * 2.4 + uTime * 1.0) * 0.035;
          transformed += normal * wave;
          `
        );
    };

    const fluidGlassMesh = new THREE.Mesh(fluidGeo, fluidMat);
    rigGroup.add(fluidGlassMesh);

    // Part 2: Inner Crimson Core Sphere
    const coreGeo = new THREE.SphereGeometry(0.54, 32, 32);
    coreGeo.scale(1, 1, 0.65);
    const coreMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1f0407),
      emissive: new THREE.Color(0xe50914),
      emissiveIntensity: 0.28,
      roughness: 0.16,
      metalness: 0.82,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rigGroup.add(coreMesh);

    // Part 3: Brushed Titanium Outer Focus Ring
    const outerRingMesh = new THREE.Mesh(
      new THREE.TorusGeometry(1.58, 0.022, 18, 100),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xd0d0dc),
        metalness: 0.92,
        roughness: 0.18,
      })
    );
    rigGroup.add(outerRingMesh);

    // Part 4: Anodized Crimson Aperture Ring
    const crimsonRingMesh = new THREE.Mesh(
      new THREE.TorusGeometry(1.32, 0.016, 16, 90),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xe50914),
        emissive: new THREE.Color(0xe50914),
        emissiveIntensity: 0.22,
        metalness: 0.78,
        roughness: 0.24,
      })
    );
    rigGroup.add(crimsonRingMesh);

    // Part 5: Contact Grounding Soft Glow Plane
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const gCtx = glowCanvas.getContext('2d');
    if (gCtx) {
      const grad = gCtx.createRadialGradient(64, 64, 4, 64, 64, 60);
      grad.addColorStop(0, 'rgba(229, 9, 20, 0.28)');
      grad.addColorStop(0.5, 'rgba(229, 9, 20, 0.06)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      gCtx.fillStyle = grad;
      gCtx.fillRect(0, 0, 128, 128);
    }
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    glowTex.colorSpace = THREE.SRGBColorSpace;
    const contactPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 4.2),
      new THREE.MeshBasicMaterial({
        map: glowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
      })
    );
    contactPlane.position.set(0, -2.0, -0.8);
    contactPlane.rotation.x = -Math.PI * 0.42;
    rigGroup.add(contactPlane);

    // Part 6: 24 Subtle Orbiting Micro-Shards (InstancedMesh)
    const shardCount = 24;
    const shardGeo = new THREE.OctahedronGeometry(0.048, 0);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.85,
      roughness: 0.16,
    });
    const shardInstanced = new THREE.InstancedMesh(shardGeo, shardMat, shardCount);
    const dummyMatrix = new THREE.Matrix4();
    const dummyPos = new THREE.Vector3();
    const dummyQuat = new THREE.Quaternion();
    const dummyScale = new THREE.Vector3();
    const dummyEuler = new THREE.Euler();
    const shardColor = new THREE.Color();
    const shardData = [];

    for (let i = 0; i < shardCount; i++) {
      const angle = (i / shardCount) * Math.PI * 2;
      const radius = 2.0 + (i % 4) * 0.25;
      const yOffset = ((i % 5) - 2) * 0.45;
      const scaleVal = 0.8 + (i % 3) * 0.12;

      dummyPos.set(Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius);
      dummyEuler.set(i * 0.4, i * 0.7, 0);
      dummyQuat.setFromEuler(dummyEuler);
      dummyScale.setScalar(scaleVal);
      dummyMatrix.compose(dummyPos, dummyQuat, dummyScale);
      shardInstanced.setMatrixAt(i, dummyMatrix);

      shardColor.setHex(i % 3 === 0 ? 0xe50914 : 0xd8d8e4);
      shardInstanced.setColorAt(i, shardColor);
      shardData.push({ angle, radius, yOffset, scaleVal, speed: 0.14 + (i % 4) * 0.03 });
    }
    shardInstanced.instanceMatrix.needsUpdate = true;
    if (shardInstanced.instanceColor) shardInstanced.instanceColor.needsUpdate = true;
    shardInstanced.computeBoundingSphere();
    rigGroup.add(shardInstanced);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const state = {
      scrollProgress: 0,
      pointerX: 0,
      pointerY: 0,
      explodeCurrent: 0,
      explodeTarget: 0,
      crimsonCurrent: 0.28,
      crimsonTarget: 0.28,
      posXCurrent: window.innerWidth > 900 ? 1.75 : 0.45,
      posYCurrent: window.innerWidth > 900 ? 0.1 : 0.25,
      scaleCurrent: window.innerWidth > 900 ? 0.92 : 0.62,
    };

    // Wire Bottom Dock Mode Buttons
    const dockBtns = document.querySelectorAll('[data-lens-mode]');
    dockBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-lens-mode');
        dockBtns.forEach((b) => b.classList.toggle('active', b === btn));

        if (mode === 'calm') {
          state.explodeTarget = 0;
          state.crimsonTarget = 0.28;
        } else if (mode === 'exploded') {
          state.explodeTarget = 0.95;
          state.crimsonTarget = 0.45;
        } else if (mode === 'crimson') {
          state.explodeTarget = 0.3;
          state.crimsonTarget = 1.2;
        }
      });
    });

    window.addEventListener(
      'pointermove',
      (e) => {
        state.pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
        state.pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );

    const updateScrollState = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      state.scrollProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    };
    window.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    let frameId = 0;
    function afterDraw(cb) {
      const gl = renderer.getContext();
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (status === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    const clock = new THREE.Clock();

    function tick() {
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();
      shaderUniforms.uTime.value = elapsed;

      state.explodeCurrent = THREE.MathUtils.damp(state.explodeCurrent, state.explodeTarget, 5, dt);
      state.crimsonCurrent = THREE.MathUtils.damp(state.crimsonCurrent, state.crimsonTarget, 5, dt);

      const isDesktop = window.innerWidth > 900;
      const sp = state.scrollProgress;
      const heroWeight = Math.max(0, 1 - sp * 3.8);

      const scrollWaveX = isDesktop
        ? Math.sin(sp * Math.PI * 2.2) * 1.35
        : Math.sin(sp * Math.PI * 1.8) * 0.35;
      const targetX = isDesktop
        ? heroWeight * 1.75 + (1 - heroWeight) * scrollWaveX
        : heroWeight * 0.45 + (1 - heroWeight) * scrollWaveX;
      const targetY = isDesktop
        ? heroWeight * 0.1 + (1 - heroWeight) * Math.cos(sp * Math.PI * 2) * 0.3
        : heroWeight * 0.28 + (1 - heroWeight) * 0.05;
      const targetScale = isDesktop
        ? 0.92 - (1 - heroWeight) * 0.12
        : 0.62 - (1 - heroWeight) * 0.08;

      state.posXCurrent = THREE.MathUtils.damp(state.posXCurrent, targetX, 4, dt);
      state.posYCurrent = THREE.MathUtils.damp(state.posYCurrent, targetY, 4, dt);
      state.scaleCurrent = THREE.MathUtils.damp(state.scaleCurrent, targetScale, 4, dt);

      rigGroup.position.set(state.posXCurrent, state.posYCurrent, 0);
      rigGroup.scale.setScalar(state.scaleCurrent);

      const targetRotY = elapsed * 0.18 + sp * Math.PI * 2.6 + state.pointerX * 0.25;
      const targetRotX = Math.sin(elapsed * 0.32) * 0.14 + sp * Math.PI * 0.9 + state.pointerY * 0.18;

      rigGroup.rotation.y = THREE.MathUtils.damp(rigGroup.rotation.y, targetRotY, 5, dt);
      rigGroup.rotation.x = THREE.MathUtils.damp(rigGroup.rotation.x, targetRotX, 5, dt);

      const exp = state.explodeCurrent + Math.sin(sp * Math.PI) * 0.32;
      fluidGlassMesh.rotation.z = -elapsed * 0.14;
      outerRingMesh.position.z = exp * 0.55;
      outerRingMesh.rotation.x = elapsed * 0.24 + exp * 0.4;
      crimsonRingMesh.position.z = exp * 0.3;
      crimsonRingMesh.rotation.y = -elapsed * 0.32;

      coreMat.emissiveIntensity = state.crimsonCurrent;
      crimsonRimLight.intensity = 5.5 + state.crimsonCurrent * 6.0;

      if (!prefersReducedMotion) {
        for (let i = 0; i < shardCount; i++) {
          const d = shardData[i];
          const a = d.angle + elapsed * d.speed * 0.3;
          const r = d.radius + exp * 0.35;
          dummyPos.set(
            Math.cos(a) * r,
            d.yOffset + Math.sin(elapsed * 0.6 + i) * 0.1,
            Math.sin(a) * r
          );
          dummyEuler.set(elapsed * 0.3 + i, elapsed * 0.5 + i, 0);
          dummyQuat.setFromEuler(dummyEuler);
          dummyScale.setScalar(d.scaleVal);
          dummyMatrix.compose(dummyPos, dummyQuat, dummyScale);
          shardInstanced.setMatrixAt(i, dummyMatrix);
        }
        shardInstanced.instanceMatrix.needsUpdate = true;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();
  }

  initThreeFluidGlassScene();

  /* ============================================================
     12. GSAP SCROLL REVEALS
     ============================================================ */
  function initScrollAnimations() {
    if (
      prefersReducedMotion ||
      typeof window.gsap === 'undefined' ||
      typeof window.ScrollTrigger === 'undefined'
    ) {
      return;
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    html.classList.add('gsap-ready');
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('[data-reveal]').forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        }
      );
    });

    document.querySelectorAll('[data-reveal-group]').forEach((group) => {
      gsap.fromTo(
        group.children,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: {
            trigger: group,
            start: 'top 88%',
            once: true,
          },
        }
      );
    });
  }

  initScrollAnimations();
})();
