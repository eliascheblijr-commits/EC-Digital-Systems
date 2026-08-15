// ============ HEADER SCROLL STATE ============
const header = document.querySelector('.site-header');
const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ============ MOBILE MENU ============
const toggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

const closeMobileMenu = () => {
  mobileMenu?.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
};

toggle?.addEventListener('click', (e) => {
  e.stopPropagation();
  const open = mobileMenu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

mobileMenu?.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', closeMobileMenu)
);

document.addEventListener('click', (e) => {
  if (mobileMenu?.classList.contains('open') && !e.target.closest('.mobile-menu') && !e.target.closest('.menu-toggle')) {
    closeMobileMenu();
  }
});

// ============ REVEAL ON SCROLL WITH STAGGER ============
const revealElements = document.querySelectorAll('.reveal');
let revealIndex = 0;

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const delay = (revealIndex % 3) * 0.08; // Stagger effect for groups
        e.target.style.transitionDelay = `${delay}s`;
        e.target.classList.add('in');
        io.unobserve(e.target);
        revealIndex++;
      }
    });
  },
  { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
);

revealElements.forEach((el) => {
  io.observe(el);
});

// ============ PARALLAX EFFECT FOR HERO VISUAL ============
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const parallaxSpeed = 0.3;
    heroVisual.style.transform = `translateY(${scrollY * parallaxSpeed}px)`;
  }, { passive: true });
}

// ============ SMOOTH PAGE TRANSITIONS ============
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="/"]');
  if (link && link.target !== '_blank' && !link.href.includes('#')) {
    // Check if it's an internal link (not external, not hash, not new tab)
    const href = link.getAttribute('href');
    if (href && href.startsWith('/') && !href.includes('mailto')) {
      // Allow natural navigation but could add fade effect here if needed
    }
  }
});

// ============ ACTIVE NAV HIGHLIGHT ============
const pathParts = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
const currentNav = pathParts.length === 0 ? 'home' : pathParts[0].replace('.html', '');

document.querySelectorAll('[data-nav]').forEach((a) => {
  if (a.getAttribute('data-nav') === currentNav) {
    a.classList.add('active');
  }
});

// ============ ENHANCED CONTACT FORM ============
const form = document.querySelector('#contact-form');
const msg = document.querySelector('#contact-msg');

if (form) {
  // Real-time validation feedback
  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach((input) => {
    input.addEventListener('blur', () => {
      const value = input.value.trim();
      if (!value && input.hasAttribute('required')) {
        input.style.borderColor = 'rgba(255, 80, 80, 0.5)';
      } else {
        input.style.borderColor = '';
      }
    });

    input.addEventListener('focus', () => {
      input.style.borderColor = '';
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const company = (data.get('company') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();

    // Validation
    if (!name || !email || !message) {
      msg.className = 'form-msg err';
      msg.textContent = '✕ Please fill in every field.';
      msg.style.animation = 'slideInRight 0.4s ease';
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      msg.className = 'form-msg err';
      msg.textContent = '✕ Please enter a valid email address.';
      msg.style.animation = 'slideInRight 0.4s ease';
      return;
    }

    // Show loading state
    msg.className = 'form-msg ok';
    msg.textContent = '⏳ Sending your message…';
    msg.style.animation = 'slideInRight 0.4s ease';
    
    try {
      await fetch('https://formcarry.com/s/of4ugfMDoCJ', {
        method: 'POST',
        body: new FormData(form),
      });

      msg.className = 'form-msg ok';
      msg.textContent = '✓ Message sent, we will contact you shortly.';
      msg.style.animation = 'slideInRight 0.4s ease';
      
      form.reset();
      inputs.forEach((input) => input.style.borderColor = '');
    } catch (error) {
      console.error('Form submission error:', error);
      msg.className = 'form-msg err';
      msg.textContent = '✕ Failed to send message. Please try again or email us directly.';
      msg.style.animation = 'slideInRight 0.4s ease';
    }
  });
}

// ============ FOOTER YEAR ============
const y = document.querySelector('#year');
if (y) y.textContent = new Date().getFullYear();

// ============ ENHANCED BUTTON HOVER EFFECTS ============
document.querySelectorAll('.btn').forEach((btn) => {
  btn.addEventListener('mouseenter', function() {
    this.style.transitionTimingFunction = 'cubic-bezier(0.22, 1, 0.36, 1)';
  });
});

// ============ SMOOTH SCROLL FOR HASH LINKS ============
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ============ PRODUCT STATUS LOADER ============
const liveStatuses = new Set(['complete', 'beta']);
const statusLabels = {
  complete: 'Live',
  development: 'In Development',
  upcoming: 'Upcoming',
  planning: 'Planning',
  custom: 'Custom',
  beta: 'Beta Release'
};

const loadProducts = async () => {
  const productsContainer = document.getElementById('products-container');
  const upcomingContainer = document.getElementById('upcoming-container');
  if (!productsContainer || !upcomingContainer) return;

  try {
    const response = await fetch('/products/registry.json');
    if (!response.ok) throw new Error('Failed to load product registry');
    const data = await response.json();
    const products = Array.isArray(data.products) ? data.products : [];

    productsContainer.innerHTML = '';
    upcomingContainer.innerHTML = '';

    const liveProducts = products.filter((product) => liveStatuses.has(product.status));
    const upcomingProducts = products.filter((product) => !liveStatuses.has(product.status));

    if (liveProducts.length === 0) {
      productsContainer.appendChild(createEmptyCard('No current products available yet.', 'We are building our product catalog and will publish live offerings soon.'));
    } else {
      liveProducts.forEach((product, index) => {
        productsContainer.appendChild(createProductCard(product, index));
      });
    }

    if (upcomingProducts.length === 0) {
      upcomingContainer.appendChild(createEmptyCard('No upcoming products listed.', 'Check back later for new product launches and roadmap updates.'));
    } else {
      upcomingProducts.forEach((product, index) => {
        upcomingContainer.appendChild(createUpcomingCard(product, index));
      });
    }

    document.querySelectorAll('.card.reveal').forEach((card) => {
      if (!card.classList.contains('in')) {
        io.observe(card);
      }
    });
  } catch (error) {
    console.error('Product loading error:', error);
    const errorCard = document.createElement('div');
    errorCard.className = 'card card-error reveal';
    errorCard.innerHTML = `
      <div class="icon"><i class="ph ph-warning"></i></div>
      <h4>Unable to load products</h4>
      <p>We encountered an error loading our product catalog. Please refresh the page or contact support.</p>
    `;
    productsContainer.innerHTML = '';
    upcomingContainer.innerHTML = '';
    productsContainer.appendChild(errorCard);
    upcomingContainer.appendChild(errorCard.cloneNode(true));
  }
};

const createCardMeta = (product) => {
  const status = statusLabels[product.status] || 'Upcoming';
  const statusClass = `badge-status ${product.status || 'upcoming'}`;
  const typeMarkup = product.type ? `<span class="badge badge-type">${product.type}</span>` : '';

  return `
    <div class="card-meta">
      <span class="badge ${statusClass}">${status}</span>
      ${typeMarkup}
    </div>
  `;
};

const createProductCard = (product, index) => {
  const card = document.createElement('a');
  card.href = product.slug ? `/products/${product.slug}/` : '#';
  card.className = 'card card-link reveal';
  card.style.transitionDelay = `${index * 0.08}s`;
  card.innerHTML = `
    <div class="icon"><i class="ph ph-${product.icon}"></i></div>
    <h4>${product.name}</h4>
    <p>${product.shortDescription}</p>
    ${createCardMeta(product)}
    ${product.featured ? '<span class="badge badge-featured">Featured</span>' : ''}
    ${product.openSource ? '<span class="badge badge-opensource">Open Source</span>' : ''}
  `;
  return card;
};

const createUpcomingCard = (product, index) => {
  const card = document.createElement('div');
  card.className = 'card card-muted reveal';
  card.style.transitionDelay = `${index * 0.08}s`;
  card.innerHTML = `
    <div class="icon"><i class="ph ph-${product.icon}"></i></div>
    <h4>${product.name}</h4>
    <p>${product.shortDescription}</p>
    ${createCardMeta(product)}
  `;
  return card;
};

const createEmptyCard = (title, message) => {
  const card = document.createElement('div');
  card.className = 'card card-muted reveal';
  card.innerHTML = `
    <div class="icon"><i class="ph ph-calendar"></i></div>
    <h4>${title}</h4>
    <p>${message}</p>
  `;
  return card;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProducts);
} else {
  loadProducts();
}
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Activate the reveal state by appending a single class
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    // Observe all elements with the 'reveal' class
    document.querySelectorAll('.reveal').forEach(section => {
        observer.observe(section);
    });
});

// Service Worker Registration for Offline PWA Support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // The leading slash is critical. It tells the browser to look at the root directory
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Gym Guardian ServiceWorker successfully registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Gym Guardian ServiceWorker registration failed:', error);
            });
    });
}