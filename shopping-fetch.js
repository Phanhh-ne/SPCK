import { db } from "./firebase.js";
import { collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const CART_KEY = 'pa_cart_v1';

const popcornListEl = document.getElementById('popcornList');
const snackListEl = document.getElementById('snackList');
const drinkListEl = document.getElementById('drinkList');

const cartCountEl = document.getElementById('cartCount');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCartBtn');
const cartModalEl = document.getElementById('cartModal');

const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModalEl = document.getElementById('checkoutModal');
const checkoutSummaryEl = document.getElementById('checkoutSummary');
const checkoutTotalEl = document.getElementById('checkoutTotal');
const checkoutForm = document.getElementById('checkoutForm');

let PRODUCTS_MAP = new Map();

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function parsePriceToNumber(priceRaw) {
  if (typeof priceRaw === 'number') return priceRaw;
  const s = String(priceRaw || '').trim();
  const numOnly = (s.match(/[0-9.,]+/g) || []).join('');
  const normalized = numOnly.replaceAll('.', '').replaceAll(',', '');
  const n = Number.parseInt(normalized || '0', 10);
  return Number.isFinite(n) ? n : 0;
}

function formatVnd(n) {
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  } catch {
    return `${n}₫`;
  }
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartCount(cart) {
  return Object.values(cart).reduce((sum, item) => sum + (item.qty || 0), 0);
}

function getCartTotal(cart) {
  return Object.values(cart).reduce((sum, item) => sum + (item.qty || 0) * (item.price || 0), 0);
}

function updateCartBadge() {
  const cart = loadCart();
  const count = getCartCount(cart);
  if (cartCountEl) cartCountEl.textContent = String(count);
}

function renderProductSection(sectionName, products, targetEl) {
  if (!targetEl) return;

  if (!Array.isArray(products) || products.length === 0) {
    targetEl.innerHTML = '<p class="text-muted">Chưa có sản phẩm.</p>';
    return;
  }

  const cardsHtml = products
    .map((p) => {
      const sku = `${sectionName}-${p.id}`;
      const title = escapeHtml(p.name ?? p.title ?? '');
      const image = escapeHtml(p.image ?? '');
      const desc = escapeHtml(p.description ?? '');
      const priceNum = parsePriceToNumber(p.price);

      PRODUCTS_MAP.set(sku, {
        sku,
        section: sectionName,
        id: p.id,
        title: p.name ?? p.title ?? '',
        image: p.image ?? '',
        description: p.description ?? '',
        price: priceNum,
      });

      return `
        <div class="card" style="width: 18rem;">
          <div class="card__img">
            <img src="${image}" class="card-img-top" alt="${title}">
          </div>
          <div class="card-body">
            <div class="card-2t">
              <h5 class="card-title">${title}</h5>
              <p class="card-text price"><ion-icon name="pricetags-outline"></ion-icon>${formatVnd(priceNum)}</p>
              <p class="card-text short shoppingcard-text">Mô tả: ${desc}</p>
            </div>
            <div class="d-flex gap-2 align-items-center">
              <button class="btn btn-primary add-to-cart" data-sku="${escapeHtml(sku)}">Thêm</button>
              <button type="button" class="btn btn-outline-secondary btn-sm read-more-btn">Xem thêm</button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  targetEl.innerHTML = `<div class="d-flex flex-wrap gap-3 justify-content-center">${cardsHtml}</div>`;
}

async function fetchAndRender() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    PRODUCTS_MAP = new Map();

    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ ...doc.data(), id: doc.id });
    });

    const popcornItems = products.filter((p) => p.category === 'Góc bắp rang');
    const snackItems = products.filter((p) => p.category === 'Góc ăn vặt');
    const drinkItems = products.filter((p) => p.category === 'Góc giải khát');

    renderProductSection('Popcorn', popcornItems, popcornListEl);
    renderProductSection('Snack', snackItems, snackListEl);
    renderProductSection('Drinks', drinkItems, drinkListEl);
  } catch (err) {
    const msg = `Không lấy được sản phẩm từ Firestore. Hãy kiểm tra kết nối Firebase và sản phẩm đã được thêm.`;
    [popcornListEl, snackListEl, drinkListEl].forEach((el) => {
      if (el) el.innerHTML = `<p class="text-danger">${escapeHtml(msg)}</p>`;
    });
    console.error(err);
  }
}

function addToCartBySku(sku) {
  const p = PRODUCTS_MAP.get(sku);
  if (!p) return;

  const cart = loadCart();

  if (!cart[sku]) {
    cart[sku] = {
      sku: p.sku,
      title: p.title,
      image: p.image,
      price: p.price,
      qty: 1,
    };
  } else {
    cart[sku].qty += 1;
  }

  saveCart(cart);
  updateCartBadge();
}

function changeQty(sku, delta) {
  const cart = loadCart();
  if (!cart[sku]) return;

  cart[sku].qty = (cart[sku].qty || 0) + delta;
  if (cart[sku].qty <= 0) delete cart[sku];

  saveCart(cart);
  updateCartBadge();
}

function removeItem(sku) {
  const cart = loadCart();
  if (!cart[sku]) return;

  delete cart[sku];
  saveCart(cart);
  updateCartBadge();
}

function clearCart() {
  saveCart({});
  updateCartBadge();
}

function buildCartItemHtml(item, options = {}) {
  const { showControls = false } = options;
  const title = escapeHtml(item.title);
  const img = escapeHtml(item.image);
  const qty = Number(item.qty || 0);
  const price = Number(item.price || 0);
  const line = qty * price;
  const sku = escapeHtml(item.sku);

  const controlsHtml = showControls
    ? `
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-secondary btn-sm cart-decrease" type="button">-</button>
        <span class="fw-semibold" style="min-width: 24px; text-align:center;">${qty}</span>
        <button class="btn btn-outline-secondary btn-sm cart-increase" type="button">+</button>
      </div>
      <button class="btn btn-outline-danger btn-sm cart-remove" type="button">Xoá</button>
    `
    : `<span class="badge bg-secondary">x${qty}</span>`;

  return `
    <div class="d-flex align-items-center gap-3 border rounded p-2" data-sku="${sku}">
      <img src="${img}" alt="${title}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;" />
      <div class="flex-grow-1">
        <div class="fw-semibold">${title}</div>
        <div class="small text-muted">${formatVnd(price)} / món</div>
        <div class="small"><strong>${formatVnd(line)}</strong></div>
      </div>
      ${controlsHtml}
    </div>
  `;
}

function renderCartModal() {
  const cart = loadCart();
  const items = Object.values(cart);

  if (!cartItemsEl || !cartTotalEl) return;

  if (items.length === 0) {
    cartItemsEl.innerHTML = '<p class="text-muted mb-0">Giỏ hàng đang trống.</p>';
    cartTotalEl.textContent = formatVnd(0);
    return;
  }

  cartItemsEl.innerHTML = items
    .map((item) => buildCartItemHtml(item, { showControls: true }))
    .join('');

  cartTotalEl.textContent = formatVnd(getCartTotal(cart));
}

function renderCheckoutSummary() {
  const cart = loadCart();
  const items = Object.values(cart);

  if (!checkoutSummaryEl || !checkoutTotalEl) return;

  if (items.length === 0) {
    checkoutSummaryEl.innerHTML = '<p class="text-muted mb-0">Giỏ hàng đang trống.</p>';
    checkoutTotalEl.textContent = formatVnd(0);
    return;
  }

  checkoutSummaryEl.innerHTML = items
    .map((item) => buildCartItemHtml(item, { showControls: false }))
    .join('');

  checkoutTotalEl.textContent = formatVnd(getCartTotal(cart));
}

document.addEventListener('click', (e) => {
  const rmBtn = e.target.closest('.read-more-btn');
  if (rmBtn) {
    const desc = rmBtn.closest('.card-body')?.querySelector('.card-text.short');
    if (desc) {
      const expanded = desc.classList.toggle('expanded');
      rmBtn.textContent = expanded ? 'Thu gọn' : 'Xem thêm';
    }
    return;
  }

  document.dispatchEvent(new CustomEvent('shopping-click-forward', { detail: { originalEvent: e } }));
});

document.addEventListener('shopping-click-forward', (evt) => {
  const e = evt.detail.originalEvent;

  const addBtn = e.target.closest('.add-to-cart');
  if (addBtn) {
    const sku = addBtn.getAttribute('data-sku');
    if (sku) addToCartBySku(sku);
    return;
  }

  const row = e.target.closest('[data-sku]');
  if (!row) return;

  const sku = row.getAttribute('data-sku');
  if (!sku) return;

  if (e.target.closest('.cart-increase')) {
    changeQty(sku, 1);
    renderCartModal();
  } else if (e.target.closest('.cart-decrease')) {
    changeQty(sku, -1);
    renderCartModal();
  } else if (e.target.closest('.cart-remove')) {
    removeItem(sku);
    renderCartModal();
  }
});

if (clearCartBtn) {
  clearCartBtn.addEventListener('click', () => {
    clearCart();
    renderCartModal();
  });
}

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    const cart = loadCart();
    if (Object.values(cart).length === 0) {
      alert('Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
      return;
    }

    const cartModal = bootstrap.Modal.getInstance(cartModalEl);
    if (cartModal) cartModal.hide();

    renderCheckoutSummary();

    const checkoutModal = bootstrap.Modal.getOrCreateInstance(checkoutModalEl);
    checkoutModal.show();
  });
}

if (checkoutForm) {
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('shipName').value.trim();
    const phone = document.getElementById('shipPhone').value.trim();
    const address = document.getElementById('shipAddress').value.trim();

    if (!name || !phone || !address) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng.');
      return;
    }

    const cart = loadCart();
    const items = Object.values(cart);

    if (items.length === 0) {
      alert('Giỏ hàng đang trống.');
      return;
    }

    const orderData = {
      customer: { name, phone, address },
      items: items.map((item) => ({
        sku: item.sku,
        title: item.title,
        image: item.image,
        price: item.price,
        qty: item.qty,
        lineTotal: (item.qty || 0) * (item.price || 0)
      })),
      total: getCartTotal(cart),
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'order'), orderData);

      alert('Đã thanh toán');

      clearCart();
      renderCartModal();
      checkoutForm.reset();

      const checkoutModal = bootstrap.Modal.getInstance(checkoutModalEl);
      if (checkoutModal) checkoutModal.hide();

      updateCartBadge();
    } catch (error) {
      console.error('Lỗi lưu đơn hàng:', error);
      alert('Không lưu được đơn hàng: ' + error.message);
    }
  });
}

if (cartModalEl) {
  cartModalEl.addEventListener('show.bs.modal', () => {
    renderCartModal();
  });
}

updateCartBadge();
fetchAndRender();