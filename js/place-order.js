let currentUser = null;
let currentPage = 0;
const PAGE_SIZE = 8;
let favouriteIds = new Set();
let categories = [];

const CATEGORY_IMAGES = {
  "breakfast": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&h=200&fit=crop&q=80",
  "lunch": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop&q=80",
  "dinner": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop&q=80",
  "snacks": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200&h=200&fit=crop&q=80",
  "beverages": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop&q=80",
  "desserts": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&h=200&fit=crop&q=80",
  "rice": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200&h=200&fit=crop&q=80",
  "bread": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop&q=80",
  "curry": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop&q=80",
  "south indian": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200&h=200&fit=crop&q=80",
  "north indian": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop&q=80",
  "chinese": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop&q=80",
  "thali": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=200&fit=crop&q=80",
  "combo": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop&q=80",
  "tiffin": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200&h=200&fit=crop&q=80",
};
const CATEGORY_FALLBACK = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=200&h=200&fit=crop&q=80";

function getCategoryImage(catName) {
  const name = (catName || "").toLowerCase().trim();
  if (CATEGORY_IMAGES[name]) return CATEGORY_IMAGES[name];
  for (var key in CATEGORY_IMAGES) {
    if (name.indexOf(key) !== -1 || key.indexOf(name) !== -1) return CATEGORY_IMAGES[key];
  }
  return CATEGORY_FALLBACK;
}

function generateStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  let html = '';
  for (let i = 0; i < full; i++) html += '<span class="material-symbols-outlined star">star</span>';
  if (half) html += '<span class="material-symbols-outlined star">star_half</span>';
  for (let i = 0; i < empty; i++) html += '<span class="material-symbols-outlined star empty">star</span>';
  return html;
}

async function init() {
  currentUser = null;

  // Show skeletons while loading
  renderFoodSkeletons(document.getElementById("menuList"), 8);

  await Promise.all([loadLocations(), loadCategories(), loadFavourites(), refreshNotifBadge()]);
  await loadMenu();
  document.getElementById("searchInput").addEventListener("input", debounce(function(){ currentPage = 0; loadMenu(); }, 350));
  document.getElementById("categoryFilter").addEventListener("change", function(){ currentPage = 0; loadMenu(); });
  document.getElementById("placeOrderBtn").addEventListener("click", placeOrder);
}

function debounce(fn, delay) {
  let timer;
  return function(){ clearTimeout(timer); timer = setTimeout(function(){ fn(); }, delay); };
}

async function loadLocations() {
  try {
    const locations = await api("/api/delivery-locations");
    const select = document.getElementById("deliveryLocation");
    select.innerHTML = locations.map(function(loc){
      return '<option value="' + loc.id + '">' + escapeHtml(loc.name) + (loc.block ? " — " + escapeHtml(loc.block) : "") + '</option>';
    }).join("");
  } catch (e) { showToast(e.message, true); }
}

async function loadCategories() {
  try {
    categories = await api("/api/categories");
    const select = document.getElementById("categoryFilter");
    select.innerHTML = '<option value="">All categories</option>' +
        categories.map(function(c){ return '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>'; }).join("");
    renderCategoryChips();
  } catch (e) { showToast(e.message, true); }
}

function renderCategoryChips() {
  const container = document.getElementById("categoryChips");
  if (!container) return;
  let html = '<div class="category-chip active" onclick="filterByCategory(null, this)">' +
    '<div class="category-chip-icon"><img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=200&h=200&fit=crop&q=80" alt="All"></div>' +
    '<div class="category-chip-label">All</div></div>';
  categories.forEach(function(c) {
    const img = getCategoryImage(c.name);
    html += '<div class="category-chip" data-cat-id="' + c.id + '" onclick="filterByCategory(' + c.id + ', this)">' +
      '<div class="category-chip-icon"><img src="' + img + '" alt="' + escapeHtml(c.name) + '" onerror="this.src=\'' + CATEGORY_FALLBACK + '\'"></div>' +
      '<div class="category-chip-label">' + escapeHtml(c.name) + '</div></div>';
  });
  container.innerHTML = html;
}

function filterByCategory(catId, chipEl) {
  document.querySelectorAll('.category-chip').forEach(function(c){ c.classList.remove('active'); });
  chipEl.classList.add('active');
  document.getElementById("categoryFilter").value = catId || "";
  currentPage = 0;
  loadMenu();
}

async function loadFavourites() {
  try {
    const favs = await api("/api/favourites");
    favouriteIds = new Set(favs.map(function(f){ return f.id; }));
  } catch (e) { /* non-critical */ }
}

async function refreshNotifBadge() {
  try {
    const result = await api("/api/notifications/unread-count");
    const badge = document.getElementById("notifBadge");
    if (result.unread > 0) {
      badge.style.display = "flex";
      badge.textContent = result.unread > 9 ? "9+" : result.unread;
    } else {
      badge.style.display = "none";
    }
  } catch (e) { /* non-critical */ }
}

async function loadMenu() {
  const search = document.getElementById("searchInput").value.trim();
  const categoryId = document.getElementById("categoryFilter").value;
  try {
    const result = await api("/api/menu-items?search=" + encodeURIComponent(search) +
        "&categoryId=" + categoryId + "&onlyAvailable=true&page=" + currentPage + "&size=" + PAGE_SIZE);
    renderMenu(result.content);
    renderPagination(document.getElementById("pagination"), result.page, result.totalPages, function(p) {
      currentPage = p;
      loadMenu();
    });
    // Init scroll animations after rendering
    setTimeout(initScrollAnimations, 100);
  } catch (e) { showToast(e.message, true); }
}

function renderMenu(items) {
  const list = document.getElementById("menuList");
  if (!items.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-icon"><span class="material-symbols-outlined">search_off</span></div><div class="big">No items found</div><p>Try a different search or category.</p></div>';
    return;
  }
  const cart = CartManager.getAll();
  list.innerHTML = items.map(function(item) {
    const qty = cart[item.id] ? cart[item.id].quantity : 0;
    const isFav = favouriteIds.has(item.id);
    const imgSrc = getFoodImage(item.name, item.categoryName);
    const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
    return '<div class="food-card">' +
        '<div class="food-card-img-wrap">' +
          '<img class="food-card-img" src="' + imgSrc + '" alt="' + escapeHtml(item.name) + '" loading="lazy" onerror="handleImageError(this)">' +
          '<button class="food-card-fav ' + (isFav ? "active" : "") + '" onclick="toggleFavourite(' + item.id + ', this)" title="Favourite">' +
            '<span class="material-symbols-outlined">' + (isFav ? 'favorite' : 'favorite_border') + '</span>' +
          '</button>' +
        '</div>' +
        '<div class="food-card-body">' +
          '<div class="food-card-name">' + escapeHtml(item.name) + '</div>' +
          '<div class="food-card-rating">' + generateStars(parseFloat(rating)) + '<span class="rating-text">' + rating + '</span></div>' +
          (item.description ? '<div class="food-card-desc">' + escapeHtml(item.description) + '</div>' : "") +
          '<div class="food-card-price">' + formatMoney(item.price) + '</div>' +
        '</div>' +
        '<div class="food-card-footer">' +
          (qty > 0
            ? '<div class="qty-control">' +
                '<button class="qty-btn" onclick="changeQty(' + item.id + ', \'' + escapeJs(item.name) + '\', ' + item.price + ', \'' + imgSrc + '\', -1)">&minus;</button>' +
                '<span class="qty-value">' + qty + '</span>' +
                '<button class="qty-btn" onclick="changeQty(' + item.id + ', \'' + escapeJs(item.name) + '\', ' + item.price + ', \'' + imgSrc + '\', 1)">+</button>' +
              '</div>'
            : '<button class="btn-add-item" id="addBtn-' + item.id + '" onclick="addToCart(' + item.id + ', \'' + escapeJs(item.name) + '\', ' + item.price + ', \'' + imgSrc + '\', this)">' +
                '<span class="material-symbols-outlined">add_shopping_cart</span> ADD' +
              '</button>'
          ) +
        '</div>' +
      '</div>';
  }).join("");
}

function escapeJs(str) {
  return String(str).replace(/'/g, "\\'").replace(/\\/g, '\\\\');
}

function addToCart(id, name, price, img, btn) {
  btn.classList.add("adding");
  btn.innerHTML = '<span class="spinner"></span>';
  setTimeout(function() {
    CartManager.addItem(id, name, price, img, 1);
    btn.classList.remove("adding");
    btn.classList.add("added");
    btn.innerHTML = '<span class="material-symbols-outlined">check</span> ADDED';
    showToast(name + " added to cart");
    setTimeout(function() { loadMenu(); }, 500);
    updateTotal();
  }, 400);
}

function changeQty(id, name, price, img, delta) {
  CartManager.changeQty(id, delta);
  loadMenu();
  updateTotal();
}

function updateTotal() {
  const total = CartManager.getTotal();
  document.getElementById("estimatedTotal").textContent = formatMoney(total);
}

async function toggleFavourite(menuItemId, btn) {
  try {
    if (favouriteIds.has(menuItemId)) {
      await api("/api/favourites/" + menuItemId, { method: "DELETE" });
      favouriteIds.delete(menuItemId);
      btn.classList.remove("active");
      btn.querySelector('.material-symbols-outlined').textContent = 'favorite_border';
    } else {
      await api("/api/favourites/" + menuItemId, { method: "POST" });
      favouriteIds.add(menuItemId);
      btn.classList.add("active");
      btn.querySelector('.material-symbols-outlined').textContent = 'favorite';
      btn.style.animation = 'starPop .4s ease';
      setTimeout(function(){ btn.style.animation = ''; }, 400);
    }
  } catch (e) { showToast(e.message, true); }
}

async function placeOrder() {
  const deliveryLocationId = document.getElementById("deliveryLocation").value;
  if (!deliveryLocationId) { showToast("Please select a delivery location", true); return; }
  const cartItems = CartManager.getItemsArray();
  if (cartItems.length === 0) { showToast("Add at least one item to your order", true); return; }
  const items = cartItems.map(function(entry) {
    return { menuItemId: entry.id, quantity: entry.quantity };
  });

  const btn = document.getElementById("placeOrderBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Placing order...';

  try {
    const order = await api("/api/orders", {
      method: "POST",
      body: JSON.stringify({ deliveryLocationId: parseInt(deliveryLocationId, 10), items: items })
    });
    CartManager.clear();
    showToast("Order placed successfully!");
    setTimeout(function(){ window.location.href = "order-details.html?id=" + order.id; }, 600);
  } catch (e) {
    showToast(e.message, true);
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">shopping_cart_checkout</span> Place Order';
  }
}

init();
