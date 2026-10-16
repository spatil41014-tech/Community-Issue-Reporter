/* CivicFix — shared light/dark toggle. Add to EVERY page: <script src="theme-toggle.js"></script> */
(function () {
  var KEY = "theme", root = document.documentElement;
  function get() { try { return localStorage.getItem(KEY) || "light"; } catch (e) { return "light"; } }
  function apply(t) { root.setAttribute("data-theme", t); root.style.colorScheme = t; }
  apply(get()); // apply immediately to avoid a flash

  var css = ".cf-theme{position:fixed;right:20px;bottom:20px;z-index:9999;width:48px;height:48px;border-radius:50%;"
    + "border:1px solid rgba(128,128,128,.35);cursor:pointer;font-size:22px;line-height:1;display:flex;align-items:center;justify-content:center;"
    + "background:#fff;color:#0f2542;box-shadow:0 8px 24px rgba(0,0,0,.18);transition:transform .25s,background .25s}"
    + ".cf-theme:hover{transform:scale(1.1) rotate(15deg)}"
    + "[data-theme='dark'] .cf-theme{background:#1b2a41;color:#ffd666}";

  function init() {
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var b = document.createElement("button");
    b.type = "button"; b.className = "cf-theme"; b.id = "themeToggleBtn";
    function paint() {
      var dark = get() === "dark";
      b.textContent = dark ? "\u2600\uFE0F" : "\uD83C\uDF19";
      b.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      b.title = b.getAttribute("aria-label");
    }
    b.addEventListener("click", function () {
      var next = get() === "dark" ? "light" : "dark";
      try { localStorage.setItem(KEY, next); } catch (e) {}
      apply(next); paint();
    });
    window.addEventListener("storage", function (e) { if (e.key === KEY) { apply(get()); paint(); } });
    paint(); document.body.appendChild(b);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
