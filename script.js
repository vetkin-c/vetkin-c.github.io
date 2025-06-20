// Smooth scroll untuk navigasi
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
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

  prevBtn.addEventListener('click', () => {
    current = (current - 1 + images.length) % images.length;
    showImage(current);
  });
  nextBtn.addEventListener('click', () => {
    current = (current + 1) % images.length;
    showImage(current);
  });
}); 