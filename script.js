'use strict';

// modal variables
const modal = document.querySelector('[data-modal]');
const modalCloseBtn = document.querySelector('[data-modal-close]');
const modalCloseOverlay = document.querySelector('[data-modal-overlay]');

// modal function
const modalCloseFunc = function () { modal.classList.add('closed') }

// modal eventListener
modalCloseOverlay.addEventListener('click', modalCloseFunc);
modalCloseBtn.addEventListener('click', modalCloseFunc);





// notification toast variables
const notificationToast = document.querySelector('[data-toast]');
const toastCloseBtn = document.querySelector('[data-toast-close]');

// notification toast eventListener
toastCloseBtn.addEventListener('click', function () {
  notificationToast.classList.add('closed');
});





// mobile menu variables
const mobileMenuOpenBtn = document.querySelectorAll('[data-mobile-menu-open-btn]');
const mobileMenu = document.querySelectorAll('[data-mobile-menu]');
const mobileMenuCloseBtn = document.querySelectorAll('[data-mobile-menu-close-btn]');
const overlay = document.querySelector('[data-overlay]');

for (let i = 0; i < mobileMenuOpenBtn.length; i++) {

  // mobile menu function
  const mobileMenuCloseFunc = function () {
    mobileMenu[i].classList.remove('active');
    overlay.classList.remove('active');
  }

  mobileMenuOpenBtn[i].addEventListener('click', function () {
    mobileMenu[i].classList.add('active');
    overlay.classList.add('active');
  });

  mobileMenuCloseBtn[i].addEventListener('click', mobileMenuCloseFunc);
  overlay.addEventListener('click', mobileMenuCloseFunc);

}





// accordion variables
const accordionBtn = document.querySelectorAll('[data-accordion-btn]');
const accordion = document.querySelectorAll('[data-accordion]');

for (let i = 0; i < accordionBtn.length; i++) {

  accordionBtn[i].addEventListener('click', function () {

    const clickedBtn = this.nextElementSibling.classList.contains('active');

    for (let i = 0; i < accordion.length; i++) {

      if (clickedBtn) break;

      if (accordion[i].classList.contains('active')) {

        accordion[i].classList.remove('active');
        accordionBtn[i].classList.remove('active');

      }

    }

    this.nextElementSibling.classList.toggle('active');
    this.classList.toggle('active');

  });

}

// === CART FUNCTIONALITY ===

// Utility: Get all cart count spans (desktop & mobile)
function getCartCountSpans() {
  return Array.from(document.querySelectorAll('.header-user-actions .count, .mobile-bottom-navigation .count'))
    .filter((el, idx) => {
      // Only keep those next to bag-handle-outline icons
      const btn = el.closest('button');
      if (!btn) return false;
      const icon = btn.querySelector('ion-icon[name="bag-handle-outline"]');
      return !!icon;
    });
}

// Utility: Get cart from localStorage
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
}

// Utility: Save cart to localStorage
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart count in all relevant places
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  getCartCountSpans().forEach(span => {
    span.textContent = count;
  });
}

// Extract product info from DOM
function extractProductInfo(btn) {
  // Find the closest .showcase-content or .showcase
  let showcase = btn.closest('.showcase-content');
  if (!showcase) showcase = btn.closest('.showcase');
  if (!showcase) return null;

  // Title
  let title = showcase.querySelector('.showcase-title');
  if (title) title = title.textContent.trim();
  else title = 'Product';

  // Price
  let price = showcase.querySelector('.price');
  if (price) price = price.textContent.replace(/[^\d.]/g, '');
  else price = '0';

  // Image
  let img = btn.closest('.showcase').querySelector('img');
  let imgSrc = img ? img.getAttribute('src') : '';

  return { title, price: parseFloat(price), img: imgSrc };
}

// Add to cart handler
function handleAddToCart(e) {
  const btn = e.currentTarget;
  const product = extractProductInfo(btn);
  if (!product) return;
  let cart = getCart();
  // Check if already in cart (by title)
  const idx = cart.findIndex(item => item.title === product.title);
  if (idx !== -1) {
    cart[idx].qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  updateCartCount();
}

// Attach event listeners to all add-to-cart buttons
function setupCartButtons() {
  document.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.removeEventListener('click', handleAddToCart); // avoid duplicate
    btn.addEventListener('click', handleAddToCart);
  });
}

// === CART MODAL FUNCTIONALITY ===

const cartModal = document.getElementById('cartModal');
const cartModalOverlay = document.getElementById('cartModalOverlay');
const cartModalCloseBtn = document.getElementById('cartModalCloseBtn');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotal = document.getElementById('cartTotal');

// Open cart modal
function openCartModal() {
  cartModal.classList.remove('closed');
  renderCartItems();
}
// Close cart modal
function closeCartModal() {
  cartModal.classList.add('closed');
}
if (cartModalOverlay && cartModalCloseBtn) {
  cartModalOverlay.addEventListener('click', closeCartModal);
  cartModalCloseBtn.addEventListener('click', closeCartModal);
}

// Attach openCartModal to cart icon buttons
function setupCartIconButtons() {
  // Use unique IDs for header and mobile cart icons
  const headerBtn = document.getElementById('cartIconBtn');
  const mobileBtn = document.getElementById('cartIconBtnMobile');
  if (headerBtn) headerBtn.addEventListener('click', openCartModal);
  if (mobileBtn) mobileBtn.addEventListener('click', openCartModal);
}

// Render cart items in modal
function renderCartItems() {
  const cart = getCart();
  cartItemsContainer.innerHTML = '';
  let total = 0;
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p style="text-align:center;color:#888;">Your cart is empty.</p>';
    cartTotal.textContent = '';
    return;
  }
  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.img}" alt="${item.title}" width="50" height="50" style="object-fit:cover;vertical-align:middle;border-radius:6px;">
      <span class="cart-item-title">${item.title}</span>
      <span class="cart-item-qty">x${item.qty}</span>
      <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
      <button class="cart-item-remove" data-idx="${idx}" style="margin-left:10px;">Remove</button>
    `;
    cartItemsContainer.appendChild(div);
  });
  cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  // Remove handlers
  cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = parseInt(this.getAttribute('data-idx'));
      let cart = getCart();
      cart.splice(idx, 1);
      saveCart(cart);
      updateCartCount();
      renderCartItems();
    });
  });
}

// On page load
window.addEventListener('DOMContentLoaded', function() {
  setupCartButtons();
  updateCartCount();
  setupCartIconButtons();
});