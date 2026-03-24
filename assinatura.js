  // ============================================
  // DATA
  // ============================================
  const plansData = {
    'Mensal': {
      name: 'MENSAL',
      price: 'R$ 29,90/mes',
      total: 'R$ 29,90',
      badge: 'Mensal',
      badgeClass: '',
      features: [
        'Acesso a todo catalogo',
        'Full HD 1080p',
        'Ate 2 telas simultaneas',
        'Cancelamento a qualquer hora'
      ]
    },
    'Semestral': {
      name: 'SEMESTRAL',
      price: 'R$ 22,90/mes · cobrado 6x',
      total: 'R$ 137,40',
      badge: 'Mais Popular',
      badgeClass: 'gold',
      features: [
        'Acesso a todo catalogo',
        '4K Ultra HD + HDR',
        'Ate 4 telas simultaneas',
        'Downloads offline ilimitados',
        '5 perfis de usuario'
      ]
    },
    'Anual': {
      name: 'ANUAL',
      price: 'R$ 18,90/mes · cobrado anualmente',
      total: 'R$ 226,80',
      badge: 'Melhor Valor',
      badgeClass: 'premium',
      features: [
        'Acesso a todo catalogo',
        '4K Ultra HD + Dolby Vision',
        'Telas simultaneas ilimitadas',
        'Downloads offline ilimitados',
        'Perfis ilimitados',
        'Acesso antecipado a estreias'
      ]
    }
  };

  // ============================================
  // STATE
  // ============================================
  let currentPlanIndex = 1;
  let selectedPlan = null;

  // ============================================
  // DOM ELEMENTS (initialized after DOM ready)
  // ============================================
  let cards = null;
  let dots = null;
  let prevBtn = null;
  let nextBtn = null;

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
    
    if (badge) {
      badge.textContent = plan.badge;
      badge.className = 'checkout-plan-badge ' + plan.badgeClass;
    }
    
    if (planNameEl) planNameEl.textContent = plan.name;
    if (planPriceEl) planPriceEl.textContent = plan.price;
    if (totalEl) totalEl.textContent = plan.total;
    
    if (featuresEl) {
      featuresEl.innerHTML = plan.features.map(f => 
        '<li><i class="fa-solid fa-check"></i>' + f + '</li>'
      ).join('');
    }
    
    openCheckout();
  }

  function openCheckout() {
    const overlay = document.getElementById('checkoutOverlay');
    const body = document.getElementById('checkoutBody');
    const success = document.getElementById('successView');
    
    if (overlay) overlay.classList.add('active');
    if (body) body.style.display = 'grid';
    if (success) success.classList.remove('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckout() {
    const overlay = document.getElementById('checkoutOverlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
    
    const form = document.getElementById('checkoutForm');
    if (form) form.reset();
    clearValidation();
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
    
    if (!icon) return;
    
    if (/^4/.test(cleaned)) {
      icon.className = 'fa-brands fa-cc-visa card-brand-icon visa';
    } else if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
      icon.className = 'fa-brands fa-cc-mastercard card-brand-icon mastercard';
    } else if (/^3[47]/.test(cleaned)) {
      icon.className = 'fa-brands fa-cc-amex card-brand-icon amex';
    } else if (/^6(?:011|5)/.test(cleaned)) {
      icon.className = 'fa-brands fa-cc-discover card-brand-icon';
    } else if (/^(606282|3841)/.test(cleaned)) {
      icon.className = 'fa-solid fa-credit-card card-brand-icon elo';
    } else {
      icon.className = 'fa-solid fa-credit-card card-brand-icon';
    }
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
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cleaned[9])) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cleaned[10])) return false;
    
    return true;
  }

  function validateCardNumber(number) {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;
    
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  }

  function validateExpiry(expiry) {
    const parts = expiry.split('/');
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
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
      input.classList.remove('error', 'valid');
    });
  }

  // ============================================
  // PAYMENT PROCESSING
  // ============================================
  function processPayment(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const cpf = document.getElementById('cpf');
    const phone = document.getElementById('phone');
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardCvv = document.getElementById('cardCvv');
    const cardName = document.getElementById('cardName');
    
    let isValid = true;
    
    if (fullName && fullName.value.trim().length < 3) {
      validateField(fullName, false);
      isValid = false;
    } else if (fullName) {
      validateField(fullName, true);
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      validateField(email, false);
      isValid = false;
    } else if (email) {
      validateField(email, true);
    }
    
    if (cpf && !validateCPF(cpf.value)) {
      validateField(cpf, false);
      isValid = false;
    } else if (cpf) {
      validateField(cpf, true);
    }
    
    if (phone && phone.value.replace(/\D/g, '').length < 10) {
      validateField(phone, false);
      isValid = false;
    } else if (phone) {
      validateField(phone, true);
    }
    
    if (cardNumber && !validateCardNumber(cardNumber.value)) {
      validateField(cardNumber, false);
      isValid = false;
    } else if (cardNumber) {
      validateField(cardNumber, true);
    }
    
    if (cardExpiry && !validateExpiry(cardExpiry.value)) {
      validateField(cardExpiry, false);
      isValid = false;
    } else if (cardExpiry) {
      validateField(cardExpiry, true);
    }
    
    if (cardCvv && cardCvv.value.length < 3) {
      validateField(cardCvv, false);
      isValid = false;
    } else if (cardCvv) {
      validateField(cardCvv, true);
    }
    
    if (cardName && cardName.value.trim().length < 3) {
      validateField(cardName, false);
      isValid = false;
    } else if (cardName) {
      validateField(cardName, true);
    }
    
    if (!isValid) {
      return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    }
    
    setTimeout(() => {
      showSuccess();
    }, 2500);
  }

  function showSuccess() {
    const body = document.getElementById('checkoutBody');
    const success = document.getElementById('successView');
    const submitBtn = document.getElementById('submitBtn');
    
    if (body) body.style.display = 'none';
    if (success) success.classList.add('active');
    
    if (submitBtn) {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
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
    
    if (cardNumberEl && successCard) {
      const cardNum = cardNumberEl.value.replace(/\D/g, '');
      successCard.textContent = '**** **** **** ' + cardNum.slice(-4);
    }
  }

  function goToDashboard() {
    closeCheckout();
    alert('Redirecionando para o dashboard do StreamVault...');
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM references
    cards = document.querySelectorAll('.pcard');
    dots = document.getElementById('plansDots');
    prevBtn = document.getElementById('plansPrev');
    nextBtn = document.getElementById('plansNext');
    
    // Setup carousel arrows
    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        plansCarouselMove(-1);
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        plansCarouselMove(1);
      });
    }
    
    // Setup input masks
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
      cpfInput.addEventListener('input', function(e) {
        e.target.value = maskCPF(e.target.value);
      });
    }
    
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', function(e) {
        e.target.value = maskPhone(e.target.value);
      });
    }
    
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
      cardNumberInput.addEventListener('input', function(e) {
        e.target.value = maskCardNumber(e.target.value);
        detectCardBrand(e.target.value);
      });
    }
    
    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
      cardExpiryInput.addEventListener('input', function(e) {
        e.target.value = maskExpiry(e.target.value);
      });
    }
    
    const cardCvvInput = document.getElementById('cardCvv');
    if (cardCvvInput) {
      cardCvvInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
      });
    }
    
    const cardNameInput = document.getElementById('cardName');
    if (cardNameInput) {
      cardNameInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.toUpperCase();
      });
    }
    
    // Close modal on overlay click
    const overlay = document.getElementById('checkoutOverlay');
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          closeCheckout();
        }
      });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeCheckout();
      }
      if (e.key === 'ArrowLeft') {
        plansCarouselMove(-1);
      }
      if (e.key === 'ArrowRight') {
        plansCarouselMove(1);
      }
    });
    
    // Initialize carousel
    updateCarousel();
    
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
        card.style.transition = 'opacity 0.8s ease ' + (i * 0.15) + 's, transform 0.8s ease ' + (i * 0.15) + 's';
        observer.observe(card);
      });
    }
  });