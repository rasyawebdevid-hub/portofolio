
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // ==========================================
  // 0. DEVICE & ACCESSIBILITY SETTINGS
  // ==========================================

  const isTouchDevice =
    window.matchMedia("(pointer: coarse)").matches ||
    "ontouchstart" in window;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  // ==========================================
  // 1. DYNAMIC ISLAND & PAGE OVERLAY
  // ==========================================

  const island = document.getElementById("dynamic-island");
  const overlay = document.getElementById("page-overlay");

  function closeIsland() {
    if (!island || !overlay) return;

    island.classList.remove("active");
    overlay.classList.remove("active");
    island.setAttribute("aria-expanded", "false");
  }

  function toggleIsland() {
    if (!island || !overlay) return;

    const isActive = island.classList.toggle("active");

    overlay.classList.toggle("active");
    island.setAttribute("aria-expanded", String(isActive));
  }

  if (island && overlay) {
    island.addEventListener("click", (event) => {
      const clickedLink = event.target.closest("a");

      if (clickedLink) {
        setTimeout(closeIsland, 250);
        return;
      }

      toggleIsland();
    });

    overlay.addEventListener("click", closeIsland);

    document.addEventListener("click", (event) => {
      if (
        island.classList.contains("active") &&
        !island.contains(event.target) &&
        !overlay.contains(event.target)
      ) {
        closeIsland();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeIsland();
      }
    });
  }


  // ==========================================
  // 2. HERO PARALLAX SCROLL EFFECT
  // ==========================================

  const titles = document.querySelectorAll(".title");

  if (!isTouchDevice && !prefersReducedMotion && titles.length > 0) {
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;

        ticking = true;

        requestAnimationFrame(() => {
          const scroll = window.scrollY;

          if (scroll < window.innerHeight) {
            if (titles[0]) {
              titles[0].style.transform =
                `translateY(${scroll * 0.35}px)`;
            }

            if (titles[1]) {
              titles[1].style.transform =
                `translateY(${scroll * 0.2}px)`;
            }
          }

          ticking = false;
        });
      },
      { passive: true }
    );
  }


  // ==========================================
  // 3. MAGNETIC HOVER EFFECT
  // ==========================================

  if (!isTouchDevice && !prefersReducedMotion) {
    const magnets = document.querySelectorAll(".magnetic");

    magnets.forEach((magnet) => {
      magnet.addEventListener("mousemove", (event) => {
        const rect = magnet.getBoundingClientRect();

        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        magnet.style.transform =
          `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.02)`;
      });

      magnet.addEventListener("mouseleave", () => {
        magnet.style.transform = "translate(0, 0) scale(1)";
      });
    });
  }


  // ==========================================
  // 4. SCROLL REVEAL ANIMATION
  // ==========================================

  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("in-view");
    });
  }


  // ==========================================
  // 5. AUTO TYPING EFFECT
  // ==========================================

  const typeTarget = document.querySelector(".auto-type");

  if (typeTarget) {
    const textToType =
      typeTarget.getAttribute("data-text") || "";

    if (prefersReducedMotion) {
      typeTarget.textContent = textToType;
      typeTarget.classList.remove("typing-cursor");
    } else {
      typeTarget.textContent = "";

      let index = 0;

      const typingDelay = 60;

      setTimeout(() => {
        const typingInterval = setInterval(() => {
          if (index < textToType.length) {
            typeTarget.textContent += textToType.charAt(index);
            index++;
          } else {
            clearInterval(typingInterval);
            typeTarget.classList.remove("typing-cursor");
          }
        }, typingDelay);
      }, 500);
    }
  }


  // ==========================================
  // 6. LANDSCAPE IMAGE SLIDER
  // ==========================================

  const track = document.getElementById("sliderTrack");

  if (track) {
    const slides = Array.from(track.children);

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const dotsContainer = document.getElementById("dotsContainer");
    const sliderContainer = document.getElementById("sliderContainer");

    if (slides.length > 0 && dotsContainer) {
      let currentIndex = 0;
      let autoPlayTimer = null;

      const autoPlayDelay = 4000;

      // Buat navigasi dots
      dotsContainer.innerHTML = "";

      slides.forEach((_, index) => {
        const dot = document.createElement("button");

        dot.type = "button";
        dot.className = `dot${index === 0 ? " active" : ""}`;

        dot.setAttribute("aria-label", `Slide ${index + 1}`);
        dot.setAttribute(
          "aria-current",
          index === 0 ? "true" : "false"
        );

        dot.addEventListener("click", () => {
          goToSlide(index);
          resetAutoPlay();
        });

        dotsContainer.appendChild(dot);
      });

      const dots = Array.from(dotsContainer.children);

      // Pindah slide
      function goToSlide(index) {
        currentIndex = (index + slides.length) % slides.length;

        track.style.transform =
          `translateX(-${currentIndex * 100}%)`;

        dots.forEach((dot, dotIndex) => {
          const active = dotIndex === currentIndex;

          dot.classList.toggle("active", active);
          dot.setAttribute("aria-current", String(active));
        });
      }

      // Hentikan autoplay
      function stopAutoPlay() {
        if (autoPlayTimer !== null) {
          clearInterval(autoPlayTimer);
          autoPlayTimer = null;
        }
      }

      // Jalankan autoplay
      function startAutoPlay() {
        if (
          prefersReducedMotion ||
          document.hidden ||
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

      // Tombol berikutnya
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          goToSlide(currentIndex + 1);
          resetAutoPlay();
        });
      }

      // Tombol sebelumnya
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          goToSlide(currentIndex - 1);
          resetAutoPlay();
        });
      }

      // Interaksi mouse dan keyboard
      if (sliderContainer) {
        sliderContainer.addEventListener("mouseenter", stopAutoPlay);
        sliderContainer.addEventListener("mouseleave", startAutoPlay);
        sliderContainer.addEventListener("focusin", stopAutoPlay);
        sliderContainer.addEventListener("focusout", startAutoPlay);
      }

      // Hentikan ketika tab tidak aktif
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          stopAutoPlay();
        } else {
          startAutoPlay();
        }
      });

      startAutoPlay();
    }
  }


  // ==========================================
  // 7. YOUTUBE VIDEO SHOWCASE
  // ==========================================

  const playTrigger = document.getElementById("playTrigger");
  const videoFrame = document.getElementById("videoFrame");
  const mainYoutubePlayer = document.getElementById("mainYoutubePlayer");

  // Ganti dengan ID video YouTube milikmu.
  const youtubeVideoId = "dQw4w9WgXcQ";

  if (playTrigger && mainYoutubePlayer && videoFrame) {
    playTrigger.addEventListener("click", () => {
      if (videoFrame.classList.contains("is-playing")) return;

      mainYoutubePlayer.src =
        `https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&rel=0`;

      videoFrame.classList.add("is-playing");

      playTrigger.setAttribute(
        "aria-label",
        "Video sedang diputar"
      );
    });
  }


  // ==========================================
  // 8. MOBILE TOUCH OPTIMIZATION
  // ==========================================

  if (isTouchDevice) {
    document.documentElement.classList.add("touch-device");
  }

});
