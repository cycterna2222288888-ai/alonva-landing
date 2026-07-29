/* main.js — UI behavior: mobile nav, reveal-on-scroll, stats tabs. */
(function () {
  "use strict";

  /* ---------- logo: scroll to top instead of navigating (avoids a bare "#" showing up in the URL) ---------- */
  var logoLink = document.querySelector(".logo[href]");
  if (logoLink) {
    logoLink.addEventListener("click", function (e) {
      if (logoLink.pathname === window.location.pathname) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  /* ---------- section nav links: let the hash jump/scroll happen natively (keeps
     back/forward working), then wipe the #hash from the address bar right after ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    if (a.getAttribute("href").length < 2) return;
    a.addEventListener("click", function () {
      window.setTimeout(function () {
        history.pushState(null, null, window.location.pathname + window.location.search);
      }, 0);
    });
  });

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById("burger");
  var navMobile = document.getElementById("navMobile");
  if (burger && navMobile) {
    burger.addEventListener("click", function () {
      burger.classList.toggle("open");
      navMobile.classList.toggle("open");
    });
    navMobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        burger.classList.remove("open");
        navMobile.classList.remove("open");
      });
    });
  }

  /* ---------- reveal-on-scroll: entrance only, plays once ---------- */
  try {
    var revealTargets = document.querySelectorAll(".r");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("on");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.07 });
      revealTargets.forEach(function (el) { io.observe(el); });
    } else {
      revealTargets.forEach(function (el) { el.classList.add("on"); });
    }
  } catch (e) {}

  /* ---------- stats tabs ---------- */
  try {
    var tabsEl = document.getElementById("statsTabs");
    var pill = document.getElementById("tabPill");
    var tabButtons = document.querySelectorAll(".tab");
    var panels = document.querySelectorAll(".stat-panel");

    function movePill(btn) {
      if (!pill || !tabsEl) return;
      var tabsRect = tabsEl.getBoundingClientRect();
      var btnRect = btn.getBoundingClientRect();
      pill.style.width = btnRect.width + "px";
      pill.style.transform = "translateX(" + (btnRect.left - tabsRect.left) + "px)";
    }

    tabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-tab");
        tabButtons.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
        panels.forEach(function (p) { p.classList.toggle("is-active", p.getAttribute("data-panel") === target); });
        movePill(btn);
      });
    });

    var activeTab = document.querySelector(".tab.is-active");
    if (activeTab) {
      // measure after layout/fonts settle so the pill starts aligned
      requestAnimationFrame(function () { movePill(activeTab); });
      window.addEventListener("resize", function () {
        var current = document.querySelector(".tab.is-active");
        if (current) movePill(current);
      });
    }
  } catch (e) {}

  /* ---------- footer year (copyright text itself is localized per-page in HTML) ---------- */
  var footYearNum = document.getElementById("footYearNum");
  if (footYearNum) footYearNum.textContent = new Date().getFullYear();
})();
