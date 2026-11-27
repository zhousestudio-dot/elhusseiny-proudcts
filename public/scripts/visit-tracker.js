(function () {
  if (window.location.pathname.startsWith("/admin")) return;
  try {
    if (sessionStorage.getItem("eh_visited")) return;
    sessionStorage.setItem("eh_visited", "1");
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track-visit");
    } else {
      fetch("/api/track-visit", { method: "POST", keepalive: true }).catch(function () {});
    }
  } catch {}
})();
