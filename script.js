document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // ==========================================
  // 0. PENGATURAN PERANGKAT & AKSESIBILITAS
  // ==========================================

  const isTouchDevice =
    window.matchMedia("(pointer: coarse)").matches ||
    "ontouchstart" in window;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const canUseMotion = !isTouchDevice && !prefersReducedMotion;

  if (isTouchDevice) {
    document.documentElement.classList.add("touch-device");
  }

  function revealOnce(elements, className, options = {}) {
    if (elements.length === 0) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add(className));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(className);
          obs.unobserve(entry.target);
        }
      });
    }, options);

    elements.forEach((el) => observer.observe(el));
  }


  // ==========================================
  // 1. TAHUN OTOMATIS DI FOOTER
  // ==========================================

  const currentYear = document.getElementById("currentYear");
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }


  // ==========================================
  // 2. MENU DYNAMIC ISLAND & OVERLAY
  // ==========================================

  const island = document.getElementById("dynamic-island");
  const islandCompact = document.getElementById("islandCompact");
  const overlay = document.getElementById("page-overlay");

  function setIslandState(isOpen) {
    island.classList.toggle("active", isOpen);
    overlay.classList.toggle("active", isOpen);
    islandCompact.setAttribute("aria-expanded", String(isOpen));
  }

  function openIsland() {
    setIslandState(true);
    const firstLink = island.querySelector(".nav-links-expanded a");
    if (firstLink) firstLink.focus();
  }

  function closeIsland() {
    if (!island.classList.contains("active")) return;

    const focusWasInside = island.contains(document.activeElement);
    setIslandState(false);

    if (focusWasInside) {
      islandCompact.focus();
    }
  }

  if (island && overlay && islandCompact) {
    island.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        setTimeout(closeIsland, 250);
        return;
      }

      if (island.classList.contains("active")) return;
      openIsland();
    });

    overlay.addEventListener("click", closeIsland);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeIsland();
    });
  }


  // ==========================================
  // 3. PARALLAX JUDUL HERO
  // ==========================================

  const heroTitles = document.querySelectorAll(".hero-poster .title");

  if (canUseMotion && heroTitles.length > 0) {
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;

        requestAnimationFrame(() => {
          const scroll = window.scrollY;

          if (scroll < window.innerHeight) {
            if (heroTitles[0]) {
              heroTitles[0].style.translate = `0 ${scroll * 0.35}px`;
            }
            if (heroTitles[1]) {
              heroTitles[1].style.translate = `0 ${scroll * 0.2}px`;
            }
          }

          ticking = false;
        });
      },
      { passive: true }
    );
  }


  // ==========================================
  // 4. EFEK MAGNETIK SAAT HOVER
  // ==========================================

  if (canUseMotion) {
    document.querySelectorAll(".magnetic").forEach((magnet) => {
      magnet.addEventListener("mousemove", (event) => {
        const rect = magnet.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        magnet.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.02)`;
      });

      magnet.addEventListener("mouseleave", () => {
        magnet.style.transform = "";
      });
    });
  }


  // ==========================================
  // 5. ANIMASI SCROLL REVEAL
  // ==========================================

  revealOnce(
    Array.from(document.querySelectorAll(".reveal")),
    "in-view",
    { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
  );


  // ==========================================
  // 6. EFEK MENGETIK (HERO)
  // ==========================================

  const typeTarget = document.querySelector(".auto-type");

  if (typeTarget) {
    const textToType = typeTarget.dataset.text || "";

    if (prefersReducedMotion) {
      typeTarget.textContent = textToType;
      typeTarget.classList.remove("typing-cursor");
    } else {
      typeTarget.style.minHeight = `${typeTarget.offsetHeight}px`;
      typeTarget.setAttribute("aria-label", textToType);
      typeTarget.textContent = "";

      let index = 0;

      setTimeout(() => {
        const typingInterval = setInterval(() => {
          if (index < textToType.length) {
            typeTarget.textContent += textToType.charAt(index);
            index++;
          } else {
            clearInterval(typingInterval);
            typeTarget.classList.remove("typing-cursor");
          }
        }, 60);
      }, 500);
    }
  }


  // ==========================================
  // 7. FAQ EKSKLUSIF (FALLBACK)
  // ==========================================

  const faqItems = document.querySelectorAll(".faq-item[name='faq-group']");

  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });


  // ==========================================
  // 8. GALERI SLIDER
  // ==========================================

  const track = document.getElementById("sliderTrack");
  const sliderContainer = document.getElementById("sliderContainer");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const dotsContainer = document.getElementById("dotsContainer");

  if (track && sliderContainer && dotsContainer) {
    const slides = Array.from(track.children);
    const autoPlayDelay = 4000;
    const swipeThreshold = 40;

    let currentIndex = 0;
    let autoPlayTimer = null;
    let isHovered = false;
    let isFocused = false;
    let touchStartX = 0;
    let touchStartY = 0;

    sliderContainer.setAttribute("tabindex", "0");
    sliderContainer.setAttribute("aria-roledescription", "carousel");
    sliderContainer.setAttribute("aria-label", "Galeri karya dan hasil proyek");

    dotsContainer.innerHTML = "";

    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot";
      dot.setAttribute("aria-label", `Slide ${index + 1}`);

      dot.addEventListener("click", () => {
        goToSlide(index);
        resetAutoPlay();
      });

      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    function goToSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === currentIndex;
        dot.classList.toggle("active", isActive);
        dot.setAttribute("aria-current", String(isActive));
      });
    }

    function stopAutoPlay() {
      if (autoPlayTimer !== null) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    function startAutoPlay() {
      if (
        prefersReducedMotion ||
        document.hidden ||
        isHovered ||
        isFocused ||
        autoPlayTimer !== null ||
        slides.length < 2
      ) {
        return;
      }

      autoPlayTimer = setInterval(() => {
        goToSlide(currentIndex + 1);
      }, autoPlayDelay);
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    prevBtn?.addEventListener("click", () => {
      goToSlide(currentIndex - 1);
      resetAutoPlay();
    });

    nextBtn?.addEventListener("click", () => {
      goToSlide(currentIndex + 1);
      resetAutoPlay();
    });

    sliderContainer.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToSlide(currentIndex - 1);
        resetAutoPlay();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goToSlide(currentIndex + 1);
        resetAutoPlay();
      }
    });

    sliderContainer.addEventListener("mouseenter", () => {
      isHovered = true;
      stopAutoPlay();
    });

    sliderContainer.addEventListener("mouseleave", () => {
      isHovered = false;
      startAutoPlay();
    });

    sliderContainer.addEventListener("focusin", () => {
      isFocused = true;
      stopAutoPlay();
    });

    sliderContainer.addEventListener("focusout", (event) => {
      if (!sliderContainer.contains(event.relatedTarget)) {
        isFocused = false;
        startAutoPlay();
      }
    });

    track.addEventListener(
      "touchstart",
      (event) => {
        touchStartX = event.changedTouches[0].clientX;
        touchStartY = event.changedTouches[0].clientY;
        stopAutoPlay();
      },
      { passive: true }
    );

    track.addEventListener(
      "touchend",
      (event) => {
        const diffX = touchStartX - event.changedTouches[0].clientX;
        const diffY = touchStartY - event.changedTouches[0].clientY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
          goToSlide(diffX > 0 ? currentIndex + 1 : currentIndex - 1);
        }

        startAutoPlay();
      },
      { passive: true }
    );

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    });

    goToSlide(0);
    startAutoPlay();
  }


  // ==========================================
  // 9. VIDEO DEMO YOUTUBE
  // ==========================================

  const playTrigger = document.getElementById("playTrigger");
  const videoFrame = document.getElementById("videoFrame");
  const youtubePlayer = document.getElementById("mainYoutubePlayer");

  if (playTrigger && videoFrame && youtubePlayer) {
    const rawSrc = youtubePlayer.dataset.src?.trim();

    if (!rawSrc) {
      console.warn(
        "Video demo belum dikonfigurasi. Isi atribut data-src pada #mainYoutubePlayer."
      );
    } else {
      let finalSrc = rawSrc;

      try {
        const url = new URL(rawSrc);
        url.searchParams.set("autoplay", "1");
        url.searchParams.set("rel", "0");
        finalSrc = url.toString();
      } catch {
        console.warn("Format data-src video tidak valid:", rawSrc);
      }

      playTrigger.addEventListener("click", () => {
        if (videoFrame.classList.contains("is-playing")) return;

        youtubePlayer.src = finalSrc;
        videoFrame.classList.add("is-playing");
        playTrigger.setAttribute("aria-hidden", "true");
        playTrigger.tabIndex = -1;
      });
    }
  }


  // ==========================================
  // 10. ANIMASI PROGRESS BAR TECH STACK
  // ==========================================

  revealOnce(
    Array.from(document.querySelectorAll(".tech-progress-card")),
    "is-visible",
    { threshold: 0.3 }
  );


  // ==========================================
  // 11. TOMBOL KEMBALI KE ATAS
  // ==========================================

  const backToTop = document.getElementById("backToTop");

  if (backToTop) {
    const toggleBackToTop = () => {
      backToTop.classList.toggle("show", window.scrollY > 600);
    };

    window.addEventListener("scroll", toggleBackToTop, { passive: true });

    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });

    toggleBackToTop();
  }


  // ==========================================
  // 12. SECTION 3D DNA DOUBLE HELIX INTERAKTIF
  // ==========================================

  (function initInteractiveDNA() {
    const container = document.getElementById("canvas-3d-container");
    const colorBtn = document.getElementById("change-color-btn");
    const badgeText = document.querySelector(".badge-3d");

    if (!container || typeof THREE === "undefined") return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 7.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const themes = [
      { strandA: 0x00f2fe, strandB: 0x3b82f6, css: "#00f2fe", grad: "linear-gradient(135deg, #00f2fe, #4facfe)" },
      { strandA: 0xf43f5e, strandB: 0xf59e0b, css: "#f43f5e", grad: "linear-gradient(135deg, #f43f5e, #fb923c)" },
      { strandA: 0xa855f7, strandB: 0xec4899, css: "#a855f7", grad: "linear-gradient(135deg, #a855f7, #ec4899)" },
      { strandA: 0x10b981, strandB: 0x06b6d4, css: "#10b981", grad: "linear-gradient(135deg, #10b981, #34d399)" }
    ];
    let themeIndex = 0;

    const dnaWrapper = new THREE.Group();
    dnaWrapper.rotation.z = Math.PI / 7;
    scene.add(dnaWrapper);

    const dnaHelix = new THREE.Group();
    dnaWrapper.add(dnaHelix);

    const matStrandA = new THREE.MeshStandardMaterial({
      color: themes[0].strandA,
      roughness: 0.25,
      metalness: 0.6,
      emissive: themes[0].strandA,
      emissiveIntensity: 0.25
    });

    const matStrandB = new THREE.MeshStandardMaterial({
      color: themes[0].strandB,
      roughness: 0.25,
      metalness: 0.6,
      emissive: themes[0].strandB,
      emissiveIntensity: 0.25
    });

    const matBridge = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.3,
      transparent: true,
      opacity: 0.55
    });

    const nodeGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const radius = 1.25;
    const pairsCount = 28;
    const verticalSpacing = 0.22;
    const twistAngle = 0.34;

    const bridgeGeo = new THREE.CylinderGeometry(0.03, 0.03, radius * 2, 8);
    bridgeGeo.rotateZ(Math.PI / 2);

    const totalHeight = (pairsCount - 1) * verticalSpacing;
    for (let i = 0; i < pairsCount; i++) {
      const y = i * verticalSpacing - totalHeight / 2;
      const angle = i * twistAngle;

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const nodeA = new THREE.Mesh(nodeGeo, matStrandA);
      nodeA.position.set(x, y, z);
      dnaHelix.add(nodeA);

      const nodeB = new THREE.Mesh(nodeGeo, matStrandB);
      nodeB.position.set(-x, y, -z);
      dnaHelix.add(nodeB);

      const bridge = new THREE.Mesh(bridgeGeo, matBridge);
      bridge.position.set(0, y, 0);
      bridge.rotation.y = -angle;
      dnaHelix.add(bridge);
    }

    // Partikel mikro di sekitar DNA
    const particleCount = 160;
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      particlePos[i] = (Math.random() - 0.5) * 9;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      color: themes[0].strandA,
      transparent: true,
      opacity: 0.7
    });
    const particlesMesh = new THREE.Points(particleGeo, particleMat);
    scene.add(particlesMesh);

    // Pencahayaan
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const frontLight = new THREE.PointLight(0xffffff, 1.5, 25);
    frontLight.position.set(4, 4, 6);
    scene.add(frontLight);

    const accentLight = new THREE.PointLight(themes[0].strandA, 2.2, 20);
    accentLight.position.set(-3, -2, 3);
    scene.add(accentLight);

    // Tombol Ubah Spektrum Warna DNA
    if (colorBtn) {
      colorBtn.addEventListener("click", () => {
        themeIndex = (themeIndex + 1) % themes.length;
        const active = themes[themeIndex];

        matStrandA.color.setHex(active.strandA);
        matStrandA.emissive.setHex(active.strandA);
        matStrandB.color.setHex(active.strandB);
        matStrandB.emissive.setHex(active.strandB);
        particleMat.color.setHex(active.strandA);
        accentLight.color.setHex(active.strandA);

        colorBtn.style.background = active.grad;
        colorBtn.style.boxShadow = `0 0 22px ${active.css}88`;
        if (badgeText) {
          badgeText.style.color = active.css;
          badgeText.style.borderColor = `${active.css}55`;
        }

        if (prefersReducedMotion) {
          renderer.render(scene, camera);
        }
      });
    }

    // Interaksi Drag & Hover
    const baseSpinSpeed = prefersReducedMotion ? 0 : 0.012;
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velocityY = baseSpinSpeed;
    let targetTiltX = 0;

    const onPointerDown = (clientX, clientY) => {
      isDragging = true;
      prevX = clientX;
      prevY = clientY;
    };

    const onPointerMove = (clientX, clientY) => {
      if (isDragging) {
        const deltaX = clientX - prevX;
        const deltaY = clientY - prevY;

        dnaHelix.rotation.y += deltaX * 0.012;
        dnaWrapper.rotation.x += deltaY * 0.008;
        dnaWrapper.rotation.x = Math.max(-0.6, Math.min(0.6, dnaWrapper.rotation.x));

        velocityY = deltaX * 0.004;
        prevX = clientX;
        prevY = clientY;

        if (prefersReducedMotion) {
          renderer.render(scene, camera);
        }
      } else if (!prefersReducedMotion) {
        const rect = container.getBoundingClientRect();
        const normY = -((clientY - rect.top) / rect.height) * 2 + 1;
        targetTiltX = normY * 0.25;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", (e) => onPointerDown(e.clientX, e.clientY));
    window.addEventListener("mousemove", (e) => onPointerMove(e.clientX, e.clientY));
    window.addEventListener("mouseup", onPointerUp);

    container.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    container.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    container.addEventListener("touchend", onPointerUp);

    window.addEventListener("resize", () => {
      if (!container.clientWidth || !container.clientHeight) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      if (prefersReducedMotion) renderer.render(scene, camera);
    });

    // Hemat GPU: jeda render saat section DNA tidak terlihat di viewport
    let isSectionVisible = true;
    if ("IntersectionObserver" in window) {
      const dnaObserver = new IntersectionObserver(
        (entries) => {
          isSectionVisible = entries[0].isIntersecting;
        },
        { threshold: 0.05 }
      );
      dnaObserver.observe(container);
    }

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);

      if (document.hidden || !isSectionVisible) return;

      const elapsedTime = clock.getElapsedTime();

      if (!isDragging) {
        velocityY += (baseSpinSpeed - velocityY) * 0.05;
        dnaHelix.rotation.y += velocityY;
        dnaWrapper.rotation.x += (targetTiltX - dnaWrapper.rotation.x) * 0.05;
      }

      if (!prefersReducedMotion) {
        dnaWrapper.position.y = Math.sin(elapsedTime * 1.4) * 0.15;
        particlesMesh.rotation.y = elapsedTime * 0.04;
      }

      renderer.render(scene, camera);
    }

    renderer.render(scene, camera);
    animate();
  })();


  // ==========================================
  // 13. BACKGROUND LUAR ANGKASA 3D (STARFIELD & NEBULA)
  // ==========================================

  (function initSpaceBackground() {
    const canvas = document.getElementById("space-bg-canvas");
    if (!canvas || typeof THREE === "undefined") return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    function createStarTexture() {
      const texCanvas = document.createElement("canvas");
      texCanvas.width = 32;
      texCanvas.height = 32;
      const ctx = texCanvas.getContext("2d");

      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.25, "rgba(220, 240, 255, 0.8)");
      gradient.addColorStop(0.5, "rgba(120, 180, 255, 0.2)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);

      return new THREE.CanvasTexture(texCanvas);
    }

    const starTexture = createStarTexture();

    // Lapisan Bintang Utama (2.500 Bintang)
    const starCount = 2500;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xa5f3fc),
      new THREE.Color(0xc4b5fd),
      new THREE.Color(0xfde68a)
    ];

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      starPositions[i3] = (Math.random() - 0.5) * 40;
      starPositions[i3 + 1] = (Math.random() - 0.5) * 40;
      starPositions[i3 + 2] = (Math.random() - 0.5) * 35;

      const color = palette[Math.floor(Math.random() * palette.length)];
      starColors[i3] = color.r;
      starColors[i3 + 1] = color.g;
      starColors[i3 + 2] = color.b;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.14,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Efek Nebula / Debu Galaksi Halus
    const nebulaCount = 45;
    const nebulaPos = new Float32Array(nebulaCount * 3);
    const nebulaColors = new Float32Array(nebulaCount * 3);

    const nebulaPalette = [
      new THREE.Color(0x1e3a8a),
      new THREE.Color(0x4c1d95),
      new THREE.Color(0x0f766e)
    ];

    for (let i = 0; i < nebulaCount; i++) {
      const i3 = i * 3;
      nebulaPos[i3] = (Math.random() - 0.5) * 28;
      nebulaPos[i3 + 1] = (Math.random() - 0.5) * 18;
      nebulaPos[i3 + 2] = -8 - Math.random() * 10;

      const nColor = nebulaPalette[Math.floor(Math.random() * nebulaPalette.length)];
      nebulaColors[i3] = nColor.r;
      nebulaColors[i3 + 1] = nColor.g;
      nebulaColors[i3 + 2] = nColor.b;
    }

    const nebulaGeo = new THREE.BufferGeometry();
    nebulaGeo.setAttribute("position", new THREE.BufferAttribute(nebulaPos, 3));
    nebulaGeo.setAttribute("color", new THREE.BufferAttribute(nebulaColors, 3));

    const nebulaMat = new THREE.PointsMaterial({
      size: 6.5,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const nebulaField = new THREE.Points(nebulaGeo, nebulaMat);
    scene.add(nebulaField);

    // Render statis saja jika user mengaktifkan Reduced Motion
    if (prefersReducedMotion) {
      renderer.render(scene, camera);
      window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);
      });
      return;
    }

    let mouseX = 0;
    let mouseY = 0;
    let scrollY = window.scrollY;

    window.addEventListener("mousemove", (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.4;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
    });

    window.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) {
        mouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 0.25;
        mouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 0.25;
      }
    }, { passive: true });

    window.addEventListener("scroll", () => {
      scrollY = window.scrollY;
    }, { passive: true });

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();
    function animateSpace() {
      requestAnimationFrame(animateSpace);

      if (document.hidden) return;

      const elapsed = clock.getElapsedTime();

      starField.rotation.y = elapsed * 0.015;
      starField.rotation.x = elapsed * 0.006;
      nebulaField.rotation.z = elapsed * 0.01;

      camera.position.x += (mouseX - camera.position.x) * 0.03;
      camera.position.y += (-mouseY - scrollY * 0.0015 - camera.position.y) * 0.04;

      renderer.render(scene, camera);
    }

    animateSpace();
  })();
});