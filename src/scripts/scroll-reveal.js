const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));

// Hero parallax
const heroImg = document.querySelector('.hero-parallax');
if (heroImg) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          heroImg.style.transform = `translate3d(0, ${y * 0.3}px, 0) scale(1.1)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}
