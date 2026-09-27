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

  /* ---------- URL hash follows the section on screen while scrolling ----------
     history.replaceState, not pushState: pushing on every scroll step would fill
     browser history with one entry per step, and "back" would flip through
     sections instead of leaving the page. Applied on a debounce after the scroll
     settles, so a native anchor jump (html{scroll-behavior:smooth}, above) doesn't
     get its hash overwritten mid-flight by a section it only passed on the way.
     On the very first section (hero, top of page) the hash is cleared entirely —
     that keeps the old "no bare #hero in the address bar" behavior this replaces,
     just driven by scroll position instead of by intercepting every click. */
  try {
    var hashSections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
    if (hashSections.length && "IntersectionObserver" in window) {
      var siteHeader = document.querySelector(".site-header");
      var hashCandidate = null;
      var hashTimer = null;
      var applyHash = function () {
        if (hashCandidate === null) return;
        var isTop = hashCandidate === hashSections[0].id;
        var nextHash = isTop ? "" : "#" + hashCandidate;
        if (window.location.hash !== nextHash) {
          history.replaceState(null, null, window.location.pathname + window.location.search + nextHash);
        }
      };
      var hashObserver = new IntersectionObserver(function (entries) {
        var visible = entries.filter(function (e) { return e.isIntersecting; });
        if (!visible.length) return;
        visible.sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
        hashCandidate = visible[0].target.id;
        window.clearTimeout(hashTimer);
        hashTimer = window.setTimeout(applyHash, 250);
      }, {
        rootMargin: "-" + (siteHeader ? siteHeader.offsetHeight : 0) + "px 0px -60% 0px",
        threshold: 0,
      });
      hashSections.forEach(function (s) { hashObserver.observe(s); });
    }
  } catch (e) {}

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
