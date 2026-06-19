const revealTargets = document.querySelectorAll("[data-reveal]");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.22 }
);

revealTargets.forEach((target) => revealObserver.observe(target));

const header = document.querySelector(".site-header");
let lastY = window.scrollY;

window.addEventListener(
  "scroll",
  () => {
    const currentY = window.scrollY;
    header?.classList.toggle("is-compact", currentY > 80);
    lastY = currentY;
  },
  { passive: true }
);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
