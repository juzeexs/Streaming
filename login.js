// Initialize all variables first
const loginCard = document.getElementById('loginCard');
const glowEffect = document.getElementById('glowEffect');
const loginForm = document.getElementById('loginForm');
const successMessage = document.getElementById('successMessage');
const submitBtn = document.getElementById('submitBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const eyeIcon = document.getElementById('eyeIcon');
const particlesContainer = document.getElementById('particles');

// Create particles
function createParticles() {
  const particleCount = 15;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 20 + 15) + 's';
    particle.style.animationDelay = (Math.random() * 10) + 's';
    particle.style.opacity = Math.random() * 0.5 + 0.2;
    particlesContainer.appendChild(particle);
  }
}
createParticles();

// Glow effect follows mouse
loginCard.addEventListener('mousemove', (e) => {
  const rect = loginCard.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  glowEffect.style.left = x + 'px';
  glowEffect.style.top = y + 'px';
});

// Touch support for glow
loginCard.addEventListener('touchmove', (e) => {
  const rect = loginCard.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  glowEffect.style.left = x + 'px';
  glowEffect.style.top = y + 'px';
  glowEffect.style.opacity = '0.4';
});

loginCard.addEventListener('touchend', () => {
  glowEffect.style.opacity = '0';
});

// Toggle password visibility
let passwordVisible = false;

function togglePassword() {
  passwordVisible = !passwordVisible;
  passwordInput.type = passwordVisible ? 'text' : 'password';
  
  if (passwordVisible) {
    eyeIcon.innerHTML = `
      <path d="M10.733 5.076a10.744 10.744 0 0 1 1.267-.076c5.352 0 9.858 3.222 12 8-1.072 2.348-2.808 4.26-4.972 5.5"/>
      <path d="M14.48 14.48a3.5 3.5 0 0 1-4.96-4.96"/>
      <path d="M2 2l20 20"/>
    `;
  } else {
    eyeIcon.innerHTML = `
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    `;
  }
}

// Form validation
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(input) {
  input.classList.add('error');
  setTimeout(() => input.classList.remove('error'), 400);
}

// Handle form submission
function handleSubmit(e) {
  e.preventDefault();
  
  const email = emailInput.value;
  const password = passwordInput.value;
  
  if (!validateEmail(email)) {
    showError(emailInput);
    return;
  }
  
  if (password.length < 1) {
    showError(passwordInput);
    return;
  }
  
  submitBtn.classList.add('loading');
  
  setTimeout(() => {
    submitBtn.classList.remove('loading');
    loginForm.style.display = 'none';
    successMessage.style.display = 'block';
    
    setTimeout(() => {
      console.log('Login successful:', { 
        email, 
        remember: document.getElementById('remember').checked 
      });
    }, 2000);
  }, 1500);
}

// Keyboard accessibility for social buttons
document.querySelectorAll('.social-btn').forEach(btn => {
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });
});