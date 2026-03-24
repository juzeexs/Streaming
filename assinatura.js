// ============================================
// DATA — Preços atualizados (premium)
// ============================================
const plansData = {
  'Mensal': {
    name: 'MENSAL',
    price: 'R$ 49,90/mês · renovação automática',
    total: 'R$ 49,90',
    badge: 'Mensal',
    badgeClass: '',
    savings: '',
    features: [
      'Acesso a todo catálogo',
      'Full HD 1080p',
      'Até 2 telas simultâneas',
      'Cancelamento a qualquer hora',
      '7 dias grátis incluídos'
    ]
  },
  'Semestral': {
    name: 'SEMESTRAL',
    price: 'R$ 39,90/mês · cobrado R$ 239,40 a cada 6 meses',
    total: 'R$ 239,40',
    badge: 'Mais Popular',
    badgeClass: 'gold',
    savings: 'Economize R$ 120,00 no semestre',
    features: [
      'Acesso a todo catálogo',
      '4K Ultra HD + HDR10+',
      'Até 4 telas simultâneas',
      'Downloads offline ilimitados',
      '5 perfis personalizados',
      '7 dias grátis incluídos'
    ]
  },
  'Anual': {
    name: 'ANUAL',
    price: 'R$ 29,90/mês · cobrado R$ 358,80 ao ano',
    total: 'R$ 358,80',
    badge: 'Melhor Valor',
    badgeClass: 'premium',
    savings: 'Economize R$ 240,00 no ano',
    features: [
      'Acesso a todo catálogo',
      '4K Ultra HD + Dolby Vision',
      'Telas simultâneas ilimitadas',
      'Downloads offline ilimitados',
      'Perfis ilimitados',
      'Estreias antecipadas exclusivas',
      'Suporte prioritário VIP 24h'
    ]
  }
};

// ============================================
// STATE
// ============================================
let currentPlanIndex = 1;
let selectedPlan = null;
let currentPaymentMethod = 'card';

// ============================================
// DOM ELEMENTS
// ============================================
let cards = null;
let dots = null;
let prevBtn = null;
let nextBtn = null;

// ============================================
// URGENCY COUNTDOWN
// ============================================
function startUrgencyTimer() {
  const timerEl = document.getElementById('urgencyTimer');
  if (!timerEl) return;

  // Salva no sessionStorage para manter o tempo entre recarregamentos
  let endTime = sessionStorage.getItem('svEndTime');
  if (!endTime) {
    endTime = Date.now() + (23 * 3600 + 47 * 60 + 12) * 1000;
    sessionStorage.setItem('svEndTime', endTime);
  }

  function tick() {
    const remaining = Math.max(0, endTime - Date.now());
    const h = Math.floor(remaining / 3600000).toString().padStart(2, '0');
    const m = Math.floor((remaining % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
    timerEl.textContent = `${h}:${m}:${s}`;
    if (remaining > 0) setTimeout(tick, 1000);
  }

  tick();
}

// ============================================
// 3D CAROUSEL
// ============================================
function updateCarousel() {
  if (!cards) return;

  cards.forEach((card, i) => {
    card.classList.remove('side-card', 'left', 'right', 'center-card');

    if (i === currentPlanIndex) {
      card.classList.add('center-card');
    } else if (i < currentPlanIndex) {
      card.classList.add('side-card', 'left');
    } else {
      card.classList.add('side-card', 'right');
    }
  });

  updateDots();
  updateArrows();
}

function plansCarouselMove(dir) {
  const newIndex = currentPlanIndex + dir;
  if (newIndex >= 0 && newIndex < 3) {
    currentPlanIndex = newIndex;
    updateCarousel();
  }
}

function plansCarouselGoto(index) {
  currentPlanIndex = index;
  updateCarousel();
}

function updateDots() {
  if (!dots) return;
  const allDots = dots.querySelectorAll('.plans-dot');
  allDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentPlanIndex);
  });
}

function updateArrows() {
  if (!prevBtn || !nextBtn) return;
  prevBtn.disabled = currentPlanIndex === 0;
  nextBtn.disabled = currentPlanIndex === 2;
}

// ============================================
// PAYMENT METHOD SWITCH
// ============================================
function switchPayment(method, btn) {
  currentPaymentMethod = method;

  // Update tabs
  document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  // Show/hide sections
  const cardSection = document.getElementById('cardPaymentSection');
  const pixSection = document.getElementById('pixPaymentSection');
  const boletoSection = document.getElementById('boletoPaymentSection');
  const installmentsGroup = document.getElementById('installmentsGroup');

  if (cardSection) cardSection.style.display = method === 'card' ? 'block' : 'none';
  if (pixSection) pixSection.style.display = method === 'pix' ? 'block' : 'none';
  if (boletoSection) boletoSection.style.display = method === 'boleto' ? 'block' : 'none';

  // Update submit label
  const btnText = document.querySelector('.btn-text');
  if (btnText) {
    if (method === 'pix') btnText.textContent = 'GERAR PIX';
    else if (method === 'boleto') btnText.textContent = 'GERAR BOLETO';
    else btnText.textContent = 'CONFIRMAR ASSINATURA';
  }

  // Card fields required only for card method
  const cardInputs = ['cardNumber', 'cardExpiry', 'cardCvv', 'cardName'];
  cardInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.required = method === 'card';
  });
}

// ============================================
// CHECKOUT
// ============================================
function selectPlan(planName) {
  selectedPlan = planName;
  const plan = plansData[planName];

  const badge = document.getElementById('checkoutBadge');
  const planNameEl = document.getElementById('checkoutPlanName');
  const planPriceEl = document.getElementById('checkoutPlanPrice');
  const featuresEl = document.getElementById('checkoutFeatures');
  const totalEl = document.getElementById('checkoutTotal');
  const highlight = document.getElementById('checkoutHighlight');
  const savingsEl = document.getElementById('checkoutSavings');

  if (badge) {
    badge.textContent = plan.badge;
    badge.className = 'checkout-plan-badge ' + plan.badgeClass;
  }

  if (planNameEl) planNameEl.textContent = plan.name;
  if (planPriceEl) planPriceEl.textContent = plan.price;
  if (totalEl) totalEl.textContent = plan.total;

  if (highlight) {
    if (plan.savings) {
      highlight.style.display = 'flex';
      if (savingsEl) savingsEl.textContent = plan.savings;
    } else {
      highlight.style.display = 'none';
    }
  }

  if (featuresEl) {
    featuresEl.innerHTML = plan.features.map(f =>
      `<li><i class="fa-solid fa-check"></i>${f}</li>`
    ).join('');
  }

  openCheckout();
}

function openCheckout() {
  const overlay = document.getElementById('checkoutOverlay');
  const body = document.getElementById('checkoutBody');
  const success = document.getElementById('successView');
  const form = document.getElementById('checkoutForm');

  if (overlay) overlay.classList.add('active');
  if (body) body.style.display = 'grid';
  if (success) success.classList.remove('active');
  if (form) form.reset();
  clearValidation();
  resetVirtualCard();
  document.body.style.overflow = 'hidden';

  // Reset to card payment
  const cardTab = document.querySelector('.payment-tab');
  if (cardTab) switchPayment('card', cardTab);
}

function closeCheckout() {
  const overlay = document.getElementById('checkoutOverlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
  clearValidation();
}

// ============================================
// VIRTUAL CARD PREVIEW
// ============================================
function resetVirtualCard() {
  const vcNumber = document.getElementById('vcNumber');
  const vcName = document.getElementById('vcName');
  const vcExpiry = document.getElementById('vcExpiry');
  const vcBrand = document.getElementById('vcBrand');
  if (vcNumber) vcNumber.textContent = '•••• •••• •••• ••••';
  if (vcName) vcName.textContent = 'SEU NOME';
  if (vcExpiry) vcExpiry.textContent = 'MM/AA';
  if (vcBrand) vcBrand.innerHTML = '<i class="fa-solid fa-credit-card"></i>';
}

function updateVirtualCard() {
  const cardNumber = document.getElementById('cardNumber');
  const cardName = document.getElementById('cardName');
  const cardExpiry = document.getElementById('cardExpiry');

  const vcNumber = document.getElementById('vcNumber');
  const vcName = document.getElementById('vcName');
  const vcExpiry = document.getElementById('vcExpiry');

  if (cardNumber && vcNumber) {
    const num = cardNumber.value.replace(/\s/g, '');
    const groups = [];
    for (let i = 0; i < 16; i += 4) {
      const chunk = num.substring(i, i + 4);
      groups.push(chunk ? chunk.padEnd(4, '•') : '••••');
    }
    vcNumber.textContent = groups.join(' ');
  }

  if (cardName && vcName) {
    vcName.textContent = cardName.value.trim().toUpperCase() || 'SEU NOME';
  }

  if (cardExpiry && vcExpiry) {
    vcExpiry.textContent = cardExpiry.value || 'MM/AA';
  }
}

// ============================================
// INPUT MASKING
// ============================================
function maskCPF(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

function maskPhone(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
}

function maskCardNumber(value) {
  const cleaned = value.replace(/\D/g, '');
  const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  return formatted.substring(0, 19);
}

function maskExpiry(value) {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
  }
  return cleaned;
}

// ============================================
// CARD BRAND DETECTION
// ============================================
function detectCardBrand(number) {
  const cleaned = number.replace(/\D/g, '');
  const icon = document.getElementById('cardBrandIcon');
  const vcBrand = document.getElementById('vcBrand');

  if (!icon) return;

  let brandClass = 'fa-solid fa-credit-card card-brand-icon';
  let vcIcon = '<i class="fa-solid fa-credit-card"></i>';

  if (/^4/.test(cleaned)) {
    brandClass = 'fa-brands fa-cc-visa card-brand-icon visa';
    vcIcon = '<i class="fa-brands fa-cc-visa" style="color:#1a1f71"></i>';
  } else if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
    brandClass = 'fa-brands fa-cc-mastercard card-brand-icon mastercard';
    vcIcon = '<i class="fa-brands fa-cc-mastercard" style="color:#eb001b"></i>';
  } else if (/^3[47]/.test(cleaned)) {
    brandClass = 'fa-brands fa-cc-amex card-brand-icon amex';
    vcIcon = '<i class="fa-brands fa-cc-amex" style="color:#006fcf"></i>';
  } else if (/^6(?:011|5)/.test(cleaned)) {
    brandClass = 'fa-brands fa-cc-discover card-brand-icon';
  } else if (/^(606282|3841)/.test(cleaned)) {
    brandClass = 'fa-solid fa-credit-card card-brand-icon elo';
  }

  icon.className = brandClass;
  if (vcBrand) vcBrand.innerHTML = vcIcon;
}

// ============================================
// VALIDATION
// ============================================
function validateField(field, isValid) {
  if (!field) return;
  field.classList.remove('error', 'valid');
  if (isValid) {
    field.classList.add('valid');
  } else if (field.value) {
    field.classList.add('error');
  }
}

function validateCPF(cpf) {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned[10])) return false;

  return true;
}

function validateCardNumber(number) {
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function validateExpiry(value) {
  if (!value || value.length < 5) return false;
  const parts = value.split('/');
  if (parts.length !== 2) return false;

  const month = parseInt(parts[0]);
  const year = parseInt('20' + parts[1]);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

function clearValidation() {
  document.querySelectorAll('.form-input').forEach(input => {
    input.classList.remove('error', 'valid');
  });
}

// ============================================
// PAYMENT PROCESSING
// ============================================
function processPayment(e) {
  e.preventDefault();

  // Validate personal info (always)
  const fullName = document.getElementById('fullName');
  const email = document.getElementById('email');
  const cpf = document.getElementById('cpf');
  const phone = document.getElementById('phone');

  let isValid = true;

  if (fullName && fullName.value.trim().length < 3) {
    validateField(fullName, false); isValid = false;
  } else validateField(fullName, true);

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    validateField(email, false); isValid = false;
  } else validateField(email, true);

  if (cpf && !validateCPF(cpf.value)) {
    validateField(cpf, false); isValid = false;
  } else validateField(cpf, true);

  if (phone && phone.value.replace(/\D/g, '').length < 10) {
    validateField(phone, false); isValid = false;
  } else validateField(phone, true);

  // Validate card fields only if paying by card
  if (currentPaymentMethod === 'card') {
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardCvv = document.getElementById('cardCvv');
    const cardName = document.getElementById('cardName');

    if (cardNumber && !validateCardNumber(cardNumber.value)) {
      validateField(cardNumber, false); isValid = false;
    } else validateField(cardNumber, true);

    if (cardExpiry && !validateExpiry(cardExpiry.value)) {
      validateField(cardExpiry, false); isValid = false;
    } else validateField(cardExpiry, true);

    if (cardCvv && cardCvv.value.length < 3) {
      validateField(cardCvv, false); isValid = false;
    } else validateField(cardCvv, true);

    if (cardName && cardName.value.trim().length < 3) {
      validateField(cardName, false); isValid = false;
    } else validateField(cardName, true);
  }

  if (!isValid) return;

  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
  }

  const delay = currentPaymentMethod === 'card' ? 2500 : 1800;
  setTimeout(() => showSuccess(), delay);
}

// ============================================
// SUCCESS
// ============================================
function showSuccess() {
  const body = document.getElementById('checkoutBody');
  const success = document.getElementById('successView');
  const submitBtn = document.getElementById('submitBtn');
  const progress = document.getElementById('checkoutProgress');

  if (body) body.style.display = 'none';
  if (success) success.classList.add('active');

  if (submitBtn) {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }

  // Update progress to step 3
  if (progress) {
    progress.querySelectorAll('.checkout-progress-step').forEach((step, i) => {
      step.classList.toggle('active', i === 2);
      step.classList.toggle('done', i < 2);
    });
  }

  const plan = plansData[selectedPlan];
  const cardNumberEl = document.getElementById('cardNumber');

  const successPlan = document.getElementById('successPlan');
  const successValue = document.getElementById('successValue');
  const successFirstCharge = document.getElementById('successFirstCharge');
  const successCard = document.getElementById('successCard');

  if (successPlan) successPlan.textContent = plan ? plan.name : '-';
  if (successValue) successValue.textContent = plan ? plan.total : '-';

  const firstCharge = new Date();
  firstCharge.setDate(firstCharge.getDate() + 7);
  if (successFirstCharge) {
    successFirstCharge.textContent = firstCharge.toLocaleDateString('pt-BR');
  }

  if (currentPaymentMethod === 'card' && cardNumberEl && successCard) {
    const cardNum = cardNumberEl.value.replace(/\D/g, '');
    successCard.textContent = '**** **** **** ' + (cardNum.slice(-4) || '????');
  } else if (successCard) {
    successCard.textContent = currentPaymentMethod === 'pix' ? 'Via Pix' : 'Via Boleto';
  }

  launchConfetti();
}

// ============================================
// CONFETTI
// ============================================
function launchConfetti() {
  const container = document.getElementById('successConfetti');
  if (!container) return;

  const colors = ['#cc0000', '#d4af37', '#ffffff', '#ff6b6b', '#ffd700'];
  const count = 60;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.style.cssText = `
      position: absolute;
      width: ${Math.random() * 8 + 4}px;
      height: ${Math.random() * 8 + 4}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      left: ${Math.random() * 100}%;
      top: -10px;
      opacity: 1;
      animation: confettiFall ${Math.random() * 2 + 1.5}s ease-out ${Math.random() * 0.8}s forwards;
      transform: rotate(${Math.random() * 360}deg);
    `;
    container.appendChild(piece);
  }

  // Add confetti keyframes dynamically
  if (!document.getElementById('confettiStyle')) {
    const style = document.createElement('style');
    style.id = 'confettiStyle';
    style.textContent = `
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => { container.innerHTML = ''; }, 4000);
}

function goToDashboard() {
  closeCheckout();
  alert('Redirecionando para o dashboard do StreamVault... 🎬');
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function () {
  // DOM references
  cards = document.querySelectorAll('.pcard');
  dots = document.getElementById('plansDots');
  prevBtn = document.getElementById('plansPrev');
  nextBtn = document.getElementById('plansNext');

  // Carousel arrows
  if (prevBtn) prevBtn.addEventListener('click', () => plansCarouselMove(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => plansCarouselMove(1));

  // Input masks
  const cpfInput = document.getElementById('cpf');
  if (cpfInput) cpfInput.addEventListener('input', e => { e.target.value = maskCPF(e.target.value); });

  const phoneInput = document.getElementById('phone');
  if (phoneInput) phoneInput.addEventListener('input', e => { e.target.value = maskPhone(e.target.value); });

  const cardNumberInput = document.getElementById('cardNumber');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', e => {
      e.target.value = maskCardNumber(e.target.value);
      detectCardBrand(e.target.value);
      updateVirtualCard();
    });
  }

  const cardExpiryInput = document.getElementById('cardExpiry');
  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', e => {
      e.target.value = maskExpiry(e.target.value);
      updateVirtualCard();
    });
  }

  const cardCvvInput = document.getElementById('cardCvv');
  if (cardCvvInput) {
    cardCvvInput.addEventListener('input', e => {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    });
  }

  const cardNameInput = document.getElementById('cardName');
  if (cardNameInput) {
    cardNameInput.addEventListener('input', e => {
      e.target.value = e.target.value.toUpperCase();
      updateVirtualCard();
    });
  }

  // Close on overlay click
  const overlay = document.getElementById('checkoutOverlay');
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeCheckout();
    });
  }

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCheckout();
    if (e.key === 'ArrowLeft') plansCarouselMove(-1);
    if (e.key === 'ArrowRight') plansCarouselMove(1);
  });

  // Swipe support for mobile
  let touchStartX = 0;
  const stage = document.getElementById('plansStage');
  if (stage) {
    stage.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) plansCarouselMove(diff > 0 ? 1 : -1);
    }, { passive: true });
  }

  // Init carousel
  updateCarousel();

  // Urgency timer
  startUrgencyTimer();

  // Entrance animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  if (cards) {
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px)';
      card.style.transition = `opacity 0.8s ease ${i * 0.15}s, transform 0.8s ease ${i * 0.15}s`;
      observer.observe(card);
    });
  }
});