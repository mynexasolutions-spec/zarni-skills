/* ======================================================
   main.js — Vanilla JS for Zarni Skills Flask Site
   ====================================================== */

/* ---- Navbar scroll effect ---- */
const navInner = document.getElementById('nav-inner');
const navToggle = document.getElementById('nav-toggle');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navInner.classList.add('shadow-[0_4px_24px_rgba(0,0,0,0.12)]');
    navInner.classList.remove('shadow-[0_2px_20px_rgba(0,0,0,0.08)]');
  } else {
    navInner.classList.add('shadow-[0_2px_20px_rgba(0,0,0,0.08)]');
    navInner.classList.remove('shadow-[0_4px_24px_rgba(0,0,0,0.12)]');
  }
});

/* ---- Mobile menu toggle ---- */
navToggle.addEventListener('click', () => {
  window.location.href = '/student/dashboard';
});

/* ---- Hero Slider ---- */
const slides = [
  {
    badge: '40% OFF',
    badgeText: 'LEARN FROM TODAY',
    headline: 'Zarni Skills Leads To A Brighter ',
    highlight: 'Future.',
    desc: 'The future belongs to those who learn more skills and combine them in creative ways.',
    img: 'https://plus.unsplash.com/premium_photo-1683121718643-fb18d2668d53?q=80&w=1632&auto=format&fit=crop',
  },
  {
    badge: 'NEW COURSES',
    badgeText: 'START LEARNING',
    headline: 'The Best Online Learning ',
    highlight: 'Platform.',
    desc: 'The best education in the world is accessible at your fingertips through online learning platforms.',
    img: 'https://images.unsplash.com/photo-1673515335586-f9f662c01482?q=80&w=1170&auto=format&fit=crop',
  },
  {
    badge: 'EXPERT MENTORS',
    badgeText: 'ACHIEVE GOALS',
    headline: 'Master Your Skills With ',
    highlight: 'Experts.',
    desc: 'Join millions of students and professionals learning new skills to advance their careers.',
    img: 'https://images.unsplash.com/photo-1548393488-ae8f117cbc1c?q=80&w=715&auto=format&fit=crop',
  },
];

let currentSlide = 0;
const slideBg       = document.querySelectorAll('.hero-slide');
const slideCircleImg = document.getElementById('slide-circle-img');
const slideBadge    = document.getElementById('slide-badge');
const slideBadgeText = document.getElementById('slide-badge-text');
const slideHeadline = document.getElementById('slide-headline');
const slideHighlight = document.getElementById('slide-highlight');
const slideDesc     = document.getElementById('slide-desc');
const heroDots      = document.querySelectorAll('.hero-dot');

function goToSlide(idx) {
  // Update background
  slideBg.forEach((el, i) => {
    el.style.opacity = i === idx ? '1' : '0';
  });

  // Update content with fade
  const contentEls = document.querySelectorAll('.hero-content');
  contentEls.forEach(el => { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; });

  setTimeout(() => {
    const s = slides[idx];
    slideBadge.textContent    = s.badge;
    slideBadgeText.textContent = s.badgeText;
    slideHeadline.childNodes[0].textContent = s.headline;
    slideHighlight.textContent = s.highlight;
    slideDesc.textContent     = s.desc;
    slideCircleImg.style.opacity = '0';
    setTimeout(() => {
      slideCircleImg.src = s.img;
      slideCircleImg.style.opacity = '1';
    }, 200);

    contentEls.forEach(el => {
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    });
  }, 300);

  // Update dots
  heroDots.forEach((dot, i) => {
    if (i === idx) {
      dot.classList.add('bg-primary');
      dot.classList.remove('bg-primary/30');
    } else {
      dot.classList.remove('bg-primary');
      dot.classList.add('bg-primary/30');
    }
  });

  currentSlide = idx;
}

// Dot navigation
heroDots.forEach(dot => {
  dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.slide)));
});

// Auto-advance
setInterval(() => {
  goToSlide((currentSlide + 1) % slides.length);
}, 5500);

/* ---- Scroll-reveal (Intersection Observer) ---- */
const revealEls = document.querySelectorAll('.reveal-on-scroll');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

/* ---- FAQ Accordion ---- */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach((item, idx) => {
  const btn    = item.querySelector('.faq-btn');
  const answer = item.querySelector('.faq-answer');
  const icon   = item.querySelector('.faq-icon');

  btn.addEventListener('click', () => {
    const isOpen = answer.classList.contains('max-h-96');

    // Close all
    faqItems.forEach(fi => {
      const a = fi.querySelector('.faq-answer');
      const b = fi.querySelector('.faq-btn');
      const ic = fi.querySelector('.faq-icon');
      a.classList.remove('max-h-96');
      a.classList.add('max-h-0');
      b.classList.remove('bg-primary', 'text-white');
      b.classList.add('bg-white', 'text-slate-800', 'hover:bg-slate-50');
      ic.classList.remove('rotate-180', 'text-white');
      ic.classList.add('text-slate-400');
    });

    if (!isOpen) {
      answer.classList.remove('max-h-0');
      answer.classList.add('max-h-96');
      btn.classList.add('bg-primary', 'text-white');
      btn.classList.remove('bg-white', 'text-slate-800', 'hover:bg-slate-50');
      icon.classList.add('rotate-180', 'text-white');
      icon.classList.remove('text-slate-400');
    }
  });
});
