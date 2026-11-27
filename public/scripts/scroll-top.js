(function () {
  var btn = document.getElementById("scroll-top-btn");
  if (!btn) return;

  function updateVisibility() {
    if (window.scrollY > 420) {
      btn.classList.remove("opacity-0", "pointer-events-none", "translate-y-3");
      btn.classList.add("opacity-100", "translate-y-0");
    } else {
      btn.classList.add("opacity-0", "pointer-events-none", "translate-y-3");
      btn.classList.remove("opacity-100", "translate-y-0");
    }
  }

  window.addEventListener("scroll", updateVisibility, { passive: true });
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  updateVisibility();
})();
