// =========================
// PHẦN 1: CÀI ĐẶT CƠ BẢN
// =========================

// Đường dẫn tới file chứa danh sách sản phẩm (giống như “bảng hàng”)
const PRODUCTS_URL = 'https://phanhh-ne.github.io/SPCK/product.json';

// Tên “ngăn lưu giỏ hàng” trong máy (để F5 vẫn còn giỏ)
const CART_KEY = 'pa_cart_v1';


// =========================
// PHẦN 2: LẤY CÁC CHỖ TRÊN HTML ĐỂ ĐỔ DỮ LIỆU VÀO
// =========================

// 3 nơi hiển thị sản phẩm theo từng khu
const popcornListEl = document.getElementById('popcornList');
const snackListEl = document.getElementById('snackList');
const drinkListEl = document.getElementById('drinkList');

// Chỗ hiện số lượng sản phẩm trong giỏ (ví dụ số nhỏ ở icon giỏ hàng)
const cartCountEl = document.getElementById('cartCount');

// Các phần trong cửa sổ giỏ hàng (modal)
const cartItemsEl = document.getElementById('cartItems');     // nơi list sản phẩm trong giỏ
const cartTotalEl = document.getElementById('cartTotal');     // nơi hiện tổng tiền
const clearCartBtn = document.getElementById('clearCartBtn'); // nút xoá hết giỏ
const cartModalEl = document.getElementById('cartModal');     // “cửa sổ” giỏ hàng


// =========================
// PHẦN 3: BẢNG GHI NHỚ SẢN PHẨM ĐỂ THÊM VÀO GIỎ CHO NHANH
// =========================

// Map là 1 kiểu “danh bạ”:
// - khóa (key) là sku
// - giá trị (value) là thông tin sản phẩm
//
// sku = `${section}-${id}`
// Ví dụ: "Popcorn-1", "Snack-1"
// Mục đích: tránh bị trùng id giữa các khu (vì Popcorn cũng có id=1, Snack cũng có id=1)
let PRODUCTS_MAP = new Map();


// =========================
// PHẦN 4: HÀM LÀM SẠCH CHỮ (TRÁNH LỖI HIỂN THỊ)
// =========================

// Nếu title/description có ký tự đặc biệt như < > & thì đổi sang dạng an toàn
// để khi hiện lên trang không bị lỗi
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}


// =========================
// PHẦN 5: CHUYỂN GIÁ TIỀN VỀ DẠNG SỐ
// =========================

// Trong JSON giá có thể là: "10.000₫", "10.000$", "10000", hoặc 10000
// Hàm này giúp đổi về số 10000 để dễ tính tổng tiền
function parsePriceToNumber(priceRaw) {
  // Nếu đã là số thì trả về luôn
  if (typeof priceRaw === 'number') return priceRaw;

  // Đổi thành chuỗi và bỏ khoảng trắng
  const s = String(priceRaw || '').trim();

  // Lấy phần số (có thể có dấu chấm/phẩy)
  // ví dụ "10.000₫" -> "10.000"
  const numOnly = (s.match(/[0-9.,]+/g) || []).join('');

  // Bỏ dấu chấm/phẩy để ra số thật
  // "10.000" -> "10000"
  const normalized = numOnly.replaceAll('.', '').replaceAll(',', '');

  // Chuyển sang số nguyên
  const n = Number.parseInt(normalized || '0', 10);

  // Nếu ra số hợp lệ thì dùng, không thì trả 0
  return Number.isFinite(n) ? n : 0;
}


// =========================
// PHẦN 6: HIỂN THỊ TIỀN ĐẸP THEO VND
// =========================

// Ví dụ 10000 -> 10.000 ₫
function formatVnd(n) {
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  } catch {
    // Nếu trình duyệt lỗi thì dùng cách đơn giản
    return `${n}₫`;
  }
}


// =========================
// PHẦN 7: ĐỌC / GHI GIỎ HÀNG TRONG MÁY (localStorage)
// =========================

// loadCart: lấy giỏ hàng từ máy ra
// Giỏ hàng được lưu dạng object như:
// {
//   "Popcorn-1": { sku, title, price, qty, ... },
//   "Snack-2":   { ... }
// }
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return {}; // chưa có gì => giỏ trống
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    // Nếu dữ liệu bị lỗi thì coi như giỏ trống
    return {};
  }
}

// saveCart: lưu giỏ hàng vào máy
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}


// =========================
// PHẦN 8: TÍNH SỐ LƯỢNG VÀ TỔNG TIỀN TRONG GIỎ
// =========================

// getCartCount: cộng tất cả qty để ra tổng số món
function getCartCount(cart) {
  return Object.values(cart).reduce((sum, item) => sum + (item.qty || 0), 0);
}

// getCartTotal: tính tổng tiền = sum(qty * price)
function getCartTotal(cart) {
  return Object.values(cart).reduce((sum, item) => sum + (item.qty || 0) * (item.price || 0), 0);
}

// updateCartBadge: cập nhật số món trên icon giỏ
function updateCartBadge() {
  const cart = loadCart();
  const count = getCartCount(cart);
  if (cartCountEl) cartCountEl.textContent = String(count);
}


// =========================
// PHẦN 9: HIỂN THỊ SẢN PHẨM RA TỪNG KHU (POPORN/SNACK/DRINK)
// =========================

// sectionName: tên khu (Popcorn/Snack/Drinks)
// products: mảng sản phẩm của khu đó
// targetEl: nơi để “đổ” ra HTML
function renderProductSection(sectionName, products, targetEl) {
  if (!targetEl) return;

  // Nếu khu này chưa có sản phẩm
  if (!Array.isArray(products) || products.length === 0) {
    targetEl.innerHTML = '<p class="text-muted">Chưa có sản phẩm.</p>';
    return;
  }

  // Tạo HTML cho từng sản phẩm
  const cardsHtml = products
    .map((p) => {
      // tạo mã sku riêng để không trùng
      const sku = `${sectionName}-${p.id}`;

      // lấy dữ liệu và làm sạch chữ
      const title = escapeHtml(p.title ?? '');
      const image = escapeHtml(p.image ?? '');
      const desc = escapeHtml(p.description ?? '');

      // đổi giá về số
      const priceNum = parsePriceToNumber(p.price);

      // Lưu sản phẩm vào PRODUCTS_MAP để bấm "Thêm" là biết món nào ngay
      PRODUCTS_MAP.set(sku, {
        sku,
        section: sectionName,
        id: p.id,
        title: p.title ?? '',
        image: p.image ?? '',
        description: p.description ?? '',
        price: priceNum,
      });

      // Trả về 1 cái “thẻ sản phẩm”
      // data-sku để lát bấm nút "Thêm" biết phải thêm món nào
      return `
        <div class="card" style="width: 18rem;">
          <div class="card__img">
            <img src="${image}" class="card-img-top" alt="${title}">
          </div>
          <div class="card-body">
            <div class="card-2t">
              <h5 class="card-title">${title}</h5>
              <p class="card-text price"><ion-icon name="pricetags-outline"></ion-icon>${formatVnd(priceNum)}</p>
              <p class="shoppingcard-text">Mô tả: ${desc}</p>
            </div>
            <button class="btn btn-primary add-to-cart" data-sku="${escapeHtml(sku)}">Thêm</button>
          </div>
        </div>
      `;
    })
    .join('');

  // Đổ tất cả card vào targetEl (có d-flex để nó tự dàn đều)
  targetEl.innerHTML = `<div class="d-flex flex-wrap gap-3 justify-content-center">${cardsHtml}</div>`;
}


// =========================
// PHẦN 10: LẤY DỮ LIỆU TỪ product.json RỒI HIỂN THỊ
// =========================

async function fetchAndRender() {
  try {
    // Lấy dữ liệu từ file JSON
    // cache: 'no-store' để mỗi lần load lại sẽ lấy dữ liệu mới nhất
    const res = await fetch(PRODUCTS_URL, { cache: 'no-store' });

    // Nếu không lấy được (ví dụ lỗi 404) thì báo lỗi
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // Chuyển dữ liệu thành object JS
    const data = await res.json();

    // reset bảng ghi nhớ sản phẩm (tránh còn dữ liệu cũ)
    PRODUCTS_MAP = new Map();

    // Render 3 khu theo cấu trúc JSON
    renderProductSection('Popcorn', data.Popcorn, popcornListEl);
    renderProductSection('Snack', data.Snack, snackListEl);
    renderProductSection('Drinks', data.Drinks, drinkListEl);

  } catch (err) {
    // Nếu fetch bị lỗi: thường do bạn mở file kiểu file://
    // => phải chạy Live Server để có http://
    const msg = `Không fetch được product.json. Bạn hãy chạy bằng Live Server (http://...) và kiểm tra file product.json nằm cùng thư mục shopping.html.`;

    // In lỗi ra 3 khu sản phẩm
    [popcornListEl, snackListEl, drinkListEl].forEach((el) => {
      if (el) el.innerHTML = `<p class="text-danger">${escapeHtml(msg)}</p>`;
    });

    console.error(err);
  }
}


// =========================
// PHẦN 11: THÊM SẢN PHẨM VÀO GIỎ (BẰNG sku)
// =========================

function addToCartBySku(sku) {
  // Tìm thông tin sản phẩm trong PRODUCTS_MAP
  const p = PRODUCTS_MAP.get(sku);
  if (!p) return;

  // Lấy giỏ hiện tại từ máy
  const cart = loadCart();

  // Nếu trong giỏ chưa có món này => tạo mới qty = 1
  if (!cart[sku]) {
    cart[sku] = {
      sku: p.sku,
      title: p.title,
      image: p.image,
      price: p.price,
      qty: 1,
    };
  } else {
    // Nếu đã có => tăng số lượng lên 1
    cart[sku].qty += 1;
  }

  // Lưu lại giỏ vào máy + cập nhật số trên icon giỏ
  saveCart(cart);
  updateCartBadge();
}


// =========================
// PHẦN 12: TĂNG/GIẢM/XOÁ MÓN TRONG GIỎ
// =========================

// changeQty: thay đổi số lượng (delta = +1 hoặc -1)
function changeQty(sku, delta) {
  const cart = loadCart();
  if (!cart[sku]) return;

  // tăng/giảm qty
  cart[sku].qty = (cart[sku].qty || 0) + delta;

  // nếu qty <= 0 thì xoá luôn món đó
  if (cart[sku].qty <= 0) delete cart[sku];

  saveCart(cart);
  updateCartBadge();
}

// removeItem: xoá hẳn 1 món
function removeItem(sku) {
  const cart = loadCart();
  if (!cart[sku]) return;

  delete cart[sku];

  saveCart(cart);
  updateCartBadge();
}

// clearCart: xoá hết giỏ
function clearCart() {
  saveCart({});
  updateCartBadge();
}


// =========================
// PHẦN 13: HIỂN THỊ GIỎ HÀNG TRONG MODAL
// =========================

function renderCartModal() {
  const cart = loadCart();
  const items = Object.values(cart);

  if (!cartItemsEl || !cartTotalEl) return;

  // Nếu giỏ trống
  if (items.length === 0) {
    cartItemsEl.innerHTML = '<p class="text-muted mb-0">Giỏ hàng đang trống.</p>';
    cartTotalEl.textContent = formatVnd(0);
    return;
  }

  // Render từng món trong giỏ thành 1 dòng
  cartItemsEl.innerHTML = items
    .map((item) => {
      const title = escapeHtml(item.title);
      const img = escapeHtml(item.image);

      const qty = Number(item.qty || 0);
      const price = Number(item.price || 0);

      // tiền của món đó = số lượng * giá
      const line = qty * price;

      const sku = escapeHtml(item.sku);

      // data-sku để biết dòng này là của món nào
      // Nút - + Xoá sẽ dùng sku này để xử lý
      return `
        <div class="d-flex align-items-center gap-3 border rounded p-2" data-sku="${sku}">
          <img src="${img}" alt="${title}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;" />
          <div class="flex-grow-1">
            <div class="fw-semibold">${title}</div>
            <div class="small text-muted">${formatVnd(price)} / món</div>
            <div class="small"><strong>${formatVnd(line)}</strong></div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-outline-secondary btn-sm cart-decrease" type="button">-</button>
            <span class="fw-semibold" style="min-width: 24px; text-align:center;">${qty}</span>
            <button class="btn btn-outline-secondary btn-sm cart-increase" type="button">+</button>
          </div>
          <button class="btn btn-outline-danger btn-sm cart-remove" type="button">Xoá</button>
        </div>
      `;
    })
    .join('');

  // Hiện tổng tiền của cả giỏ
  cartTotalEl.textContent = formatVnd(getCartTotal(cart));
}


// =========================
// PHẦN 14: BẮT SỰ KIỆN CLICK (THÊM, TĂNG, GIẢM, XOÁ)
// =========================

// Bắt click toàn trang để xử lý các nút được tạo ra sau khi render
document.addEventListener('click', (e) => {

  // Nếu bấm nút "Thêm" trên card sản phẩm
  const addBtn = e.target.closest('.add-to-cart');
  if (addBtn) {
    const sku = addBtn.getAttribute('data-sku');
    if (sku) addToCartBySku(sku);
    return;
  }

  // Nếu bấm trong giỏ hàng, tìm dòng chứa data-sku
  const row = e.target.closest('[data-sku]');
  if (!row) return;

  const sku = row.getAttribute('data-sku');
  if (!sku) return;

  // bấm + thì tăng số lượng
  if (e.target.closest('.cart-increase')) {
    changeQty(sku, 1);
    renderCartModal(); // vẽ lại giỏ để cập nhật số và tiền

  // bấm - thì giảm số lượng
  } else if (e.target.closest('.cart-decrease')) {
    changeQty(sku, -1);
    renderCartModal();

  // bấm "Xoá" thì xoá món đó
  } else if (e.target.closest('.cart-remove')) {
    removeItem(sku);
    renderCartModal();
  }
});


// Nút xoá hết giỏ
if (clearCartBtn) {
  clearCartBtn.addEventListener('click', () => {
    clearCart();
    renderCartModal();
  });
}


// Khi mở cửa sổ giỏ hàng lên, luôn vẽ lại giỏ để đúng dữ liệu mới nhất
if (cartModalEl) {
  cartModalEl.addEventListener('show.bs.modal', () => {
    renderCartModal();
  });
}


// =========================
// PHẦN 15: CHẠY NGAY KHI VỪA MỞ TRANG
// =========================

// 1) cập nhật số trên icon giỏ (lấy từ máy)
// 2) lấy dữ liệu product.json và hiển thị sản phẩm
updateCartBadge();
fetchAndRender();
