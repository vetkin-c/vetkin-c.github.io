// Mobile Hamburger Menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close menu when clicking on a link
  const navLinksItems = navLinks.querySelectorAll('a');
  navLinksItems.forEach(link => {
    link.addEventListener('click', function() {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    }
  });
}

// Smooth scroll untuk navigasi
const navLinksAll = document.querySelectorAll('.nav-links a');
navLinksAll.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 60,
        behavior: 'smooth'
      });
    }
  });
});

// Animasi fade-in saat scroll
const faders = document.querySelectorAll('section, .portfolio-item');
const appearOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};
const appearOnScroll = new IntersectionObserver(function(entries, observer) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('appear');
    observer.unobserve(entry.target);
  });
}, appearOptions);
faders.forEach(fader => {
  appearOnScroll.observe(fader);
});

// Tambahkan animasi CSS
const style = document.createElement('style');
style.innerHTML = `
  .appear {
    animation: fadeIn 1.2s;
    opacity: 1 !important;
  }
  section, .portfolio-item {
    opacity: 0;
    transition: opacity 0.6s;
  }
`;
document.head.appendChild(style);

// Validasi form kontak sederhana
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const nama = document.getElementById('nama').value;
    const email = document.getElementById('email').value;
    const pesan = document.getElementById('pesan').value;
    if (!nama || !email || !pesan) {
      alert('Mohon lengkapi semua field!');
      return;
    }
    // Ganti nomor berikut dengan nomor WhatsApp tujuan
    const nomor = '6282123432959';
    const text = encodeURIComponent(`Halo, saya ${nama}\nEmail: ${email}\n${pesan}`);
    window.open(`https://wa.me/${nomor}?text=${text}`,'_blank');
  });
}

// Carousel Multi-Item (untuk semua .carousel di halaman)
document.querySelectorAll('.carousel').forEach(carousel => {
  const images = carousel.querySelectorAll('.carousel-img');
  const prevBtn = carousel.querySelector('.carousel-btn.prev');
  const nextBtn = carousel.querySelector('.carousel-btn.next');
  let current = 0;

  function showImage(idx) {
    images.forEach((img, i) => {
      img.classList.toggle('active', i === idx);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      current = (current - 1 + images.length) % images.length;
      showImage(current);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      current = (current + 1) % images.length;
      showImage(current);
    });
  }

  // Touch support for carousel
  let startX = 0;
  let endX = 0;

  carousel.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
  });

  carousel.addEventListener('touchend', function(e) {
    endX = e.changedTouches[0].clientX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = startX - endX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && nextBtn) {
        // Swipe left - next
        nextBtn.click();
      } else if (diff < 0 && prevBtn) {
        // Swipe right - previous
        prevBtn.click();
      }
    }
  }
});

// Prevent zoom on double tap for mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// Add touch feedback for buttons
document.querySelectorAll('button, .see-more-btn, .skills-list li').forEach(element => {
  element.addEventListener('touchstart', function() {
    this.style.transform = 'scale(0.95)';
  });
  
  element.addEventListener('touchend', function() {
    this.style.transform = '';
  });
});

// Auto-hide mobile menu on scroll
let scrollTimeout;
window.addEventListener('scroll', function() {
  if (hamburger && navLinks && hamburger.classList.contains('active')) {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    }, 1000);
  }
}); 