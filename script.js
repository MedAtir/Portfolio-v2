const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function initYear() {
  const year = new Date().getFullYear();
  const el = $("#year");
  if (el) el.textContent = String(year);
}

function initMobileNav() {
  const topbar = $(".topbar");
  const btn = $(".nav-toggle");
  const nav = $("#nav");
  if (!topbar || !btn || !nav) return;

  const setOpen = (open) => {
    topbar.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    const sr = btn.querySelector(".sr-only");
    if (sr) sr.textContent = open ? "Fermer le menu" : "Ouvrir le menu";
  };

  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    setOpen(!open);
  });

  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

function initScrollProgress() {
  const bar = $("#progressBar");
  if (!bar) return;

  const onScroll = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop || 0;
    const max = (doc.scrollHeight || 0) - (doc.clientHeight || 0);
    const pct = max <= 0 ? 0 : (scrollTop / max) * 100;
    bar.style.width = `${clamp(pct, 0, 100)}%`;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initReveal() {
  const els = $$(".reveal");
  if (!els.length) return;

  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    for (const el of els) el.classList.add("is-visible");
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
  );

  for (const el of els) io.observe(el);
}

function initSkillsAnimation() {
  const root = $("#skills");
  if (!root) return;

  const skills = $$(".skill", root);
  const fills = skills.map((s) => $(".skill__fill", s)).filter(Boolean);
  if (!fills.length) return;

  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    for (const s of skills) {
      const fill = $(".skill__fill", s);
      const level = Number(s.dataset.level || 0);
      if (fill) fill.style.width = `${clamp(level, 0, 100)}%`;
    }
    return;
  }

  let animated = false;
  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((e) => e.isIntersecting);
      if (!visible || animated) return;
      animated = true;

      for (const s of skills) {
        const fill = $(".skill__fill", s);
        const level = Number(s.dataset.level || 0);
        if (!fill) continue;

        fill.animate(
          [{ width: "0%" }, { width: `${clamp(level, 0, 100)}%` }],
          { duration: 900, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" },
        );
      }

      io.disconnect();
    },
    { threshold: 0.25 },
  );

  io.observe(root);
}

function initActiveNav() {
  const links = $$(".nav__link");
  const sections = links
    .map((a) => {
      const id = a.getAttribute("href");
      if (!id || !id.startsWith("#")) return null;
      const el = $(id);
      return el ? { a, el } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  const setActive = (active) => {
    for (const { a } of sections) a.classList.toggle("is-active", a === active);
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const match = sections.find((s) => s.el === visible.target);
      if (match) setActive(match.a);
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: [0.1, 0.2, 0.3, 0.5, 0.8] },
  );

  for (const { el } of sections) io.observe(el);
}

function initContactForm() {
  const form = $("#contactForm");
  const hint = $("#formHint");
  if (!form) return;

  const emailTo = "smo.atir@gmail.com";

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const nom = String(data.get("nom") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    const subject = encodeURIComponent(`Candidature — Message via CV en ligne (${nom || "Contact"})`);
    const body = encodeURIComponent(`Nom: ${nom}\nE-mail: ${email}\n\n${message}\n`);

    const url = `mailto:${emailTo}?subject=${subject}&body=${body}`;
    window.location.href = url;

    if (hint) {
      hint.textContent =
        "Ouverture de votre application e‑mail… Si rien ne s’ouvre, copiez l’adresse ci‑dessus et contactez‑moi directement.";
    }
  });
}

initYear();
initMobileNav();
initScrollProgress();
initReveal();
initSkillsAnimation();
initActiveNav();
initContactForm();

