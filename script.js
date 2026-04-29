/* ─── PARTICLE / NETWORK CANVAS ─── */
  const canvas = document.getElementById('canvas-bg');
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  const COUNT = 90;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function initParticles() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: rand(0, W),
        y: rand(0, H),
        vx: rand(-0.18, 0.18),
        vy: rand(-0.18, 0.18),
        r: rand(1, 2.2),
        opacity: rand(0.15, 0.45)
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    const isLight = window._canvasLight;

    // Radial gradient overlay for depth
    const grad = ctx.createRadialGradient(W * 0.45, H * 0.4, 0, W * 0.45, H * 0.4, H * 0.75);
    grad.addColorStop(0, isLight ? 'rgba(180,220,180,0.14)' : 'rgba(20,50,30,0.18)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.strokeStyle = isLight
            ? `rgba(60,130,60,${0.1 * (1 - dist / 130)})`
            : `rgba(100,180,120,${0.07 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Dots
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = isLight
        ? `rgba(60,140,80,${p.opacity * 0.8})`
        : `rgba(150,210,170,${p.opacity})`;
      ctx.fill();
    }
  }

  function update() {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    }
  }

  function loop() {
    update();
    drawParticles();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  resize();
  initParticles();
  loop();

  /* ─── PARALLAX MOUSE EFFECT ─── */
  document.addEventListener('mousemove', (e) => {
    const mx = (e.clientX / window.innerWidth - 0.5) * 0.15;
    const my = (e.clientY / window.innerHeight - 0.5) * 0.15;
    for (const p of particles) {
      p.vx += mx * 0.002;
      p.vy += my * 0.002;
      // Clamp velocity
      p.vx = Math.max(-0.4, Math.min(0.4, p.vx));
      p.vy = Math.max(-0.4, Math.min(0.4, p.vy));
    }
  });

  /* ─── FADE IN ON SCROLL ─── */
  const fadeEls = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), 80 * (entry.target.dataset.delay || 0));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  fadeEls.forEach((el, i) => {
    el.dataset.delay = i % 4;
    observer.observe(el);
  });

  /* ─── COUNTER ANIMATION ─── */
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = +el.dataset.target;
        let current = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = Math.floor(current);
        }, 22);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  /* ─── NAV SCROLL STYLE ─── */
  function updateNavBg() {
    const nav = document.querySelector('nav');
    const isLight = document.documentElement.dataset.theme === 'light';
    nav.style.background = window.scrollY > 40
      ? (isLight ? 'rgba(212,219,212,0.99)' : 'rgba(5,10,8,0.97)')
      : (isLight ? 'rgba(212,219,212,0.90)' : 'rgba(5,10,8,0.85)');
  }
  window.addEventListener('scroll', updateNavBg);

  /* ─── THEME DROPDOWN ─── */
  const themeDropdownWrap = document.getElementById('themeDropdownWrap');
  const themeDropdownBtn  = document.getElementById('themeDropdownBtn');
  const themeMenu         = document.getElementById('themeMenu');
  const themeIcon         = document.getElementById('themeIcon');
  const themeLabel        = document.getElementById('themeLabel');
  const themeOptions      = document.querySelectorAll('.theme-option');

  const themes = {
    dark:  { icon: '🌙', label: 'Dark' },
    light: { icon: '☀️', label: 'Light' }
  };

  function applyTheme(name) {
    document.documentElement.dataset.theme = name === 'dark' ? '' : name;
    localStorage.setItem('aethers-theme', name);
    themeIcon.textContent  = themes[name].icon;
    themeLabel.textContent = themes[name].label;
    themeOptions.forEach(o => o.classList.toggle('active', o.dataset.theme === name));
    window._canvasLight = name === 'light';
    updateNavBg();
  }

  themeDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = themeDropdownWrap.classList.toggle('open');
    themeDropdownBtn.setAttribute('aria-expanded', isOpen);
  });

  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      applyTheme(option.dataset.theme);
      themeDropdownWrap.classList.remove('open');
      themeDropdownBtn.setAttribute('aria-expanded', false);
    });
  });

  document.addEventListener('click', () => {
    themeDropdownWrap.classList.remove('open');
    themeDropdownBtn.setAttribute('aria-expanded', false);
  });

  // Restore saved theme
  const savedTheme = localStorage.getItem('aethers-theme') || 'dark';
  applyTheme(savedTheme);

  function updateCanvasColors() { window._canvasLight = document.documentElement.dataset.theme === 'light'; }

  /* ─── EMAILJS CONTACT FORM ─── */
  emailjs.init('mEWt5UGvndb6dCW3T');

  const submitBtn    = document.getElementById('submitBtn');
  const submitText   = document.getElementById('submitText');
  const submitSpinner = document.getElementById('submitSpinner');
  const formToast    = document.getElementById('formToast');

  function showToast(message, type) {
    formToast.textContent = message;
    formToast.className = 'form-toast form-toast--' + type;
    formToast.style.display = 'block';
    setTimeout(() => { formToast.style.display = 'none'; }, 5000);
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitText.style.display  = loading ? 'none'   : 'inline';
    submitSpinner.style.display = loading ? 'inline' : 'none';
  }

  submitBtn.addEventListener('click', () => {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName  = document.getElementById('lastName').value.trim();
    const workEmail = document.getElementById('workEmail').value.trim();
    const company   = document.getElementById('company').value.trim();
    const service   = document.getElementById('service').value;
    const message   = document.getElementById('message').value.trim();

    // Basic validation
    if (!firstName || !lastName || !workEmail || !message) {
      showToast('⚠ Please fill in all required fields.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail)) {
      showToast('⚠ Please enter a valid email address.', 'error');
      return;
    }

    setLoading(true);

    const templateParams = {
      name:     firstName + ' ' + lastName,
      email:    workEmail,
      company:  company || 'N/A',
      service:  service || 'Not specified',
      message:  message,
      time:     new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    };

    emailjs.send('service_9tujwrx', 'template_ttpqeob', templateParams)
      .then(() => {
        setLoading(false);
        showToast('✓ Message sent! We\'ll be in touch soon.', 'success');
        // Clear form
        document.getElementById('firstName').value = '';
        document.getElementById('lastName').value  = '';
        document.getElementById('workEmail').value = '';
        document.getElementById('company').value   = '';
        document.getElementById('service').value   = '';
        document.getElementById('message').value   = '';
      })
      .catch((err) => {
        setLoading(false);
        showToast('✗ Something went wrong. Please try again.', 'error');
        console.error('EmailJS error:', err);
      });
  });
/* ─── MOBILE NAV HAMBURGER ─── */
const navHamburger = document.getElementById('navHamburger');
const navLinks     = document.getElementById('navLinks');

if (navHamburger && navLinks) {
  navHamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.toggle('open');
    navHamburger.classList.toggle('active', isOpen);
    navHamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navHamburger.classList.remove('active');
      navHamburger.setAttribute('aria-expanded', false);
    });
  });

  // Close menu on outside click
  document.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navHamburger.classList.remove('active');
    navHamburger.setAttribute('aria-expanded', false);
  });
}
