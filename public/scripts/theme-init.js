(function () {
  try {
    var saved = localStorage.getItem("elhusseiny_theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      document.documentElement.classList.add("dark");
    }
    var lang = localStorage.getItem("elhusseiny_lang");
    if (lang === "en") {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    }
  } catch (e) {}
})();
