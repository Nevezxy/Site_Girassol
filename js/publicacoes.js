// Mobile Navigation Toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerHeight = document.querySelector('.header').offsetHeight;
      const targetPosition = target.offsetTop - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});


// Header scroll effect
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (window.scrollY > 100) {
    header.style.background = 'rgba(255, 255, 255, 0.95)';
    header.style.backdropFilter = 'blur(10px)';
  } else {
    header.style.background = 'var(--white)';
    header.style.backdropFilter = 'none';
  }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const heroBackground = document.querySelector('.hero-background');

  if (heroBackground) {
    heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
  }
});



// Back to top button
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopBtn.classList.add('show');
  } else {
    backToTopBtn.classList.remove('show');
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});


// Newsletter form handling
const newsletterForm = document.querySelector('.newsletter-form');

newsletterForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = newsletterForm.querySelector('input[type="email"]').value;

  if (!email) {
    alert('Por favor, insira seu e-mail.');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Por favor, insira um e-mail válido.');
    return;
  }

  alert('Obrigado por se inscrever em nossa newsletter!');
  newsletterForm.reset();
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// Loading animation for publication cards
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("loaded")
      observer.unobserve(entry.target)
    }
  })
}, observerOptions)

// Observe publication cards for loading animation
document.addEventListener("DOMContentLoaded", () => {
  const publicationCards = document.querySelectorAll(".publication-card")
  publicationCards.forEach((card, index) => {
    card.classList.add("loading")
    card.style.transitionDelay = `${index * 0.1}s`
    observer.observe(card)
  })
})

// Download tracking (optional)
const downloadButtons = document.querySelectorAll(".btn-download")
downloadButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const publicationTitle = e.target.closest(".publication-card").querySelector(".publication-title").textContent
    console.log(`Download iniciado: ${publicationTitle}`)

    // You can add analytics tracking here
    // gtag('event', 'download', {
    //     'event_category': 'Publications',
    //     'event_label': publicationTitle
    // });
  })
})

// Keyboard navigation for accessibility
document.addEventListener("keydown", (e) => {
  // ESC key closes mobile menu
  if (e.key === "Escape" && navMenu.classList.contains("active")) {
    navMenu.classList.remove("active")
    navToggle.classList.remove("active")
  }
})

// Lazy loading for images (if needed)
const lazyImages = document.querySelectorAll("img[data-src]")
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const img = entry.target
      img.src = img.dataset.src
      img.classList.remove("lazy")
      imageObserver.unobserve(img)
    }
  })
})

lazyImages.forEach((img) => imageObserver.observe(img))

// Form validation (if you add contact forms later)
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Utility function for smooth animations
function animateOnScroll() {
  const elements = document.querySelectorAll(".animate-on-scroll")
  elements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top
    const elementVisible = 150

    if (elementTop < window.innerHeight - elementVisible) {
      element.classList.add("active")
    }
  })
}

window.addEventListener("scroll", animateOnScroll)

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  console.log("IGDS Publications page loaded successfully!")

  // Add any initialization code here
  animateOnScroll()
})
