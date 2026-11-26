(function () {
  var btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", function () {
    var isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("elhusseiny_theme", isDark ? "dark" : "light");
    } catch (e) {}
  });
})();
