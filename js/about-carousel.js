(function () {
  "use strict";

  var track = document.getElementById("aboutCarouselTrack");
  var dotsEl = document.getElementById("aboutDots");
  var carousel = document.getElementById("aboutCarousel");
  if (!track) return;

  var AUTOPLAY_MS = 4500;
  var slides = [];
  var current = 0;
  var timer = null;

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = String(str == null ? "" : str);
    return div.innerHTML;
  }

  // No real interior/food photos yet (they get uploaded later from
  // admin.html) — show a branded placeholder instead of a stock photo
  // that isn't actually this place.
  var PLACEHOLDER =
    '<div class="about-carousel__placeholder">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
        '<path d="M4 21h16M6 21V9l6-5 6 5v12M10 21v-6h4v6"/>' +
      '</svg>' +
      '<p>Muy pronto, fotos reales del local</p>' +
    '</div>';

  function render(items) {
    slides = items.filter(function (it) { return it && it.image; });

    if (!slides.length) {
      track.innerHTML = PLACEHOLDER;
      dotsEl.innerHTML = "";
      return;
    }

    // No `loading="lazy"` here on purpose: these slides are moved into view
    // with a CSS transform, not real scrolling, so the browser's native
    // lazy-load heuristic (based on initial layout position) never
    // re-triggers for them — on narrow viewports they'd sit permanently
    // "off-screen" and never load at all.
    track.innerHTML = slides.map(function (s) {
      return (
        '<div class="about-carousel__slide">' +
          '<img src="' + escapeHtml(s.image) + '" alt="' + escapeHtml(s.alt || "Smash King") + '" />' +
        '</div>'
      );
    }).join("");

    dotsEl.innerHTML = slides.map(function (_, i) {
      return '<span class="about-carousel__dot' + (i === 0 ? " is-active" : "") + '"></span>';
    }).join("");

    goTo(0);
    if (slides.length > 1) startAutoplay();
  }

  function goTo(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    track.style.transform = "translateX(-" + current * 100 + "%)";
    dotsEl.querySelectorAll(".about-carousel__dot").forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === current);
    });
  }

  function next() { goTo(current + 1); }

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(next, AUTOPLAY_MS);
  }
  function stopAutoplay() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", function () { if (slides.length > 1) startAutoplay(); });

  fetch("about.json", { cache: "no-store" })
    .then(function (res) { return res.json(); })
    .then(render)
    .catch(function () { render([]); });
})();
