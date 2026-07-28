/* main.js — UI behavior: mobile nav, reveal-on-scroll, stats tabs, contact form. */
(function () {
  "use strict";

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

  /* ---------- contact form (no backend wired yet — simulated submit) ---------- */
  try {
    var form = document.getElementById("contactForm");
    var fields = document.getElementById("formFields");
    var success = document.getElementById("formSuccess");
    var errorEl = document.getElementById("formError");
    var btn = document.getElementById("formBtn");
    var btnLabel = document.getElementById("formBtnLabel");
    var nameInput = document.getElementById("fieldName");
    var contactInput = document.getElementById("fieldContact");

    if (form && fields && success && btn) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var nameOk = nameInput.value.trim().length >= 2;
        var contactOk = contactInput.value.trim().length >= 5;
        if (!nameOk || !contactOk) {
          if (errorEl) errorEl.hidden = false;
          return;
        }
        if (errorEl) errorEl.hidden = true;

        btn.disabled = true;
        if (btnLabel) btnLabel.textContent = "Отправляем…";

        setTimeout(function () {
          fields.hidden = true;
          success.hidden = false;
        }, 900);
      });
    }
  } catch (e) {}

  /* ---------- footer year ---------- */
  var footYear = document.getElementById("footYear");
  if (footYear) footYear.textContent = "© " + new Date().getFullYear() + " Alonva. Технологии для спорта.";
})();
