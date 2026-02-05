
gsap.from(".navbar", {
  y: -20,
  opacity: 0,
  duration: 0.6,
  ease: "power2.out"
});

gsap.from(".hero-title", {
  y: 30,
  opacity: 0,
  duration: 0.8,
  delay: 0.2
});

gsap.from(".hero-subtitle", {
  y: 20,
  opacity: 0,
  duration: 0.6,
  delay: 0.4
});

gsap.from(".planner-box", {
  y: 20,
  opacity: 0,
  duration: 0.6,
  delay: 0.6
});

gsap.from(".hero-trust", {
  opacity: 0,
  duration: 0.5,
  delay: 0.8
});

gsap.from(".hero-illustration", {
  scale: 0.95,
  opacity: 0,
  duration: 0.8,
  delay: 0.5
});

const btn = document.getElementById("generateBtn");
btn.addEventListener("mouseenter", () => {
  gsap.to(btn, { scale: 1.03, duration: 0.2 });
});
btn.addEventListener("mouseleave", () => {
  gsap.to(btn, { scale: 1, duration: 0.2 });
});

gsap.from(".feature-card", {
  opacity: 0,
  y: 20,
  duration: 0.6,
  stagger: 0.15,
  ease: "power2.out",
});

gsap.from(".how-card", {
  opacity: 0,
  y: 20,
  duration: 0.6,
  stagger: 0.15,
});

gsap.from(".india-list li", {
  opacity: 0,
  x: -20,
  duration: 0.4,
  stagger: 0.15,
});

const cards = document.querySelectorAll(".day-card");
if (cards.length) {
  gsap.from(cards, {
    opacity: 0,
    y: 24,
    duration: 0.45,
    stagger: 0.12,
    ease: "power2.out"
  });
}
