let currentPage = 0;
const PAGE_SIZE = 8;
let favouriteIds = new Set();

function renderSubnav(role) {
  var subnav = document.getElementById("subnav");
  var portalLabel = document.getElementById("portalLabel");
  var cartIcon = document.getElementById("cartIcon");
  if (portalLabel) portalLabel.textContent = role === "ADMIN" ? "Admin" : "Faculty";
  if (cartIcon) cartIcon.style.display = role === "ADMIN" ? "none" : "";
  if (role === "ADMIN") {
    subnav.innerHTML = '<a href="admin.html"><span class="material-symbols-outlined">dashboard</span> Dashboard</a>' +
      '<a href="menu.html" class="active"><span class="material-symbols-outlined">restaurant_menu</span> Browse Menu</a>' +
      '<a href="profile.html"><span class="material-symbols-outlined">person</span> Profile</a>';
  } else {
    subnav.innerHTML = '<a href="faculty.html"><span class="material-symbols-outlined">shopping_cart</span> Place Order</a>' +
      '<a href="menu.html" class="active"><span class="material-symbols-outlined">restaurant_menu</span> Browse Menu</a>' +
      '<a href="favourites.html"><span class="material-symbols-outlined">favorite</span> Favourites</a>' +
      '<a href="cart.html"><span class="material-symbols-outlined">shopping_cart</span> Cart</a>' +
      '<a href="my-orders.html"><span class="material-symbols-outlined">receipt_long</span> My Orders</a>' +
      '<a href="profile.html"><span class="material-symbols-outlined">person</span> Profile</a>';
  }
}

function renderMobileNav(role) {
  var nav = document.getElementById("mobileNav");
  if (!nav) return;
  if (role === "ADMIN") {
    nav.innerHTML = '<div class="mobile-nav-inner">' +
      '<a href="admin.html" class="mobile-nav-item"><span class="material-symbols-outlined">dashboard</span><span>Dashboard</span></a>' +
      '<a href="menu.html" class="mobile-nav-item active"><span class="material-symbols-outlined">restaurant_menu</span><span>Menu</span></a>' +
      '<a href="profile.html" class="mobile-nav-item"><span class="material-symbols-outlined">person</span><span>Profile</span></a>' +
      '</div>';
  } else {
    nav.innerHTML = '<div class="mobile-nav-inner">' +
      '<a href="faculty.html" class="mobile-nav-item"><span class="material-symbols-outlined">shopping_cart</span><span>Order</span></a>' +
      '<a href="menu.html" class="mobile-nav-item active"><span class="material-symbols-outlined">restaurant_menu</span><span>Menu</span></a>' +
      '<a href="cart.html" class="mobile-nav-item"><span class="material-symbols-outlined">shopping_cart</span><span>Cart</span></a>' +
      '<a href="my-orders.html" class="mobile-nav-item"><span class="material-symbols-outlined">receipt_long</span><span>Orders</span></a>' +
      '<a href="profile.html" class="mobile-nav-item"><span class="material-symbols-outlined">person</span><span>Profile</span></a>' +
      '</div>';
  }
}

async function init() {
  const user = await requireAuth();
  if (!user) return;
  renderSubnav(user.role);
  renderMobileNav(user.role);

  // Show skeletons while loading
  renderFoodSkeletons(document.getElementById("menuList"), 8);

  await Promise.all([loadCategories(), loadFavourites(), refreshNotifBadge()]);
  await loadMenu();

  ["searchInput"].forEach(function(id){ document.getElementById(id).addEventListener("input", debounce(function(){ currentPage = 0; loadMenu(); }, 350)); });
  ["categoryFilter", "sortBy", "sortDir"].forEach(function(id){ document.getElementById(id).addEventListener("change", function(){ currentPage = 0; loadMenu(); }); });
}

function debounce(fn, delay) {
  let timer;
  return function(){ clearTimeout(timer); timer = setTimeout(function(){ fn(); }, delay); };
}

async function loadCategories() {
  try {
    const categories = await api("/api/categories");
    const select = document.getElementById("categoryFilter");
    select.innerHTML = '<option value="">All categories</option>' +
        categories.map(function(c){ return '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>'; }).join("");
  } catch (e) { showToast(e.message, true); }
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
    if (result.unread > 0) { badge.style.display = "flex"; badge.textContent = result.unread > 9 ? "9+" : result.unread; }
  } catch (e) { /* non-critical */ }
}

async function loadMenu() {
  const search = document.getElementById("searchInput").value.trim();
  const categoryId = document.getElementById("categoryFilter").value;
  const sortBy = document.getElementById("sortBy").value;
  const sortDir = document.getElementById("sortDir").value;

  try {
    const result = await api("/api/menu-items?search=" + encodeURIComponent(search) + "&categoryId=" + categoryId +
        "&sortBy=" + sortBy + "&sortDir=" + sortDir + "&page=" + currentPage + "&size=" + PAGE_SIZE);
    renderMenu(result.content);
    renderPagination(document.getElementById("pagination"), result.page, result.totalPages, function(p) { currentPage = p; loadMenu(); });
    setTimeout(initScrollAnimations, 100);
  } catch (e) {
    showToast(e.message, true);
  }
}

function renderMenu(items) {
  const list = document.getElementById("menuList");
  if (!items.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-icon"><span class="material-symbols-outlined">search_off</span></div><div class="big">No items found</div><p>Try a different search or category.</p></div>';
    return;
  }
  list.innerHTML = items.map(function(item) {
    const isFav = favouriteIds.has(item.id);
    const imgSrc = getFoodImage(item.name, item.categoryName);
    const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
    let starsHtml = '';
    const full = Math.floor(parseFloat(rating));
    const half = parseFloat(rating) % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    for (let i = 0; i < full; i++) starsHtml += '<span class="material-symbols-outlined star">star</span>';
    if (half) starsHtml += '<span class="material-symbols-outlined star">star_half</span>';
    for (let i = 0; i < empty; i++) starsHtml += '<span class="material-symbols-outlined star empty">star</span>';
    const cart = CartManager.getAll();
    const qty = cart[item.id] ? cart[item.id].quantity : 0;
    return '<div class="food-card">' +
        '<div class="food-card-img-wrap">' +
          '<img class="food-card-img" src="' + imgSrc + '" alt="' + escapeHtml(item.name) + '" loading="lazy" onerror="handleImageError(this)">' +
          (item.available === false ? '<span class="food-card-unavailable">Unavailable</span>' : '') +
          '<button class="food-card-fav ' + (isFav ? "active" : "") + '" onclick="toggleFavourite(' + item.id + ', this)" title="Favourite">' +
            '<span class="material-symbols-outlined">' + (isFav ? 'favorite' : 'favorite_border') + '</span>' +
          '</button>' +
        '</div>' +
        '<div class="food-card-body">' +
          '<div class="food-card-name">' + escapeHtml(item.name) + '</div>' +
          '<div class="food-card-rating">' + starsHtml + '<span class="rating-text">' + rating + '</span></div>' +
          (item.description ? '<div class="food-card-desc">' + escapeHtml(item.description) + '</div>' : "") +
          '<div class="food-card-price">' + formatMoney(item.price) + '</div>' +
        '</div>' +
        (item.available !== false ?
          '<div class="food-card-footer">' +
            (qty > 0
              ? '<div class="qty-control">' +
                  '<button class="qty-btn" onclick="changeQty(' + item.id + ', -1)">&minus;</button>' +
                  '<span class="qty-value">' + qty + '</span>' +
                  '<button class="qty-btn" onclick="changeQty(' + item.id + ', 1)">+</button>' +
                '</div>'
              : '<button class="btn-add-item" id="addBtn-' + item.id + '" onclick="addToCart(' + item.id + ', \'' + escapeJs(item.name) + '\', ' + item.price + ', \'' + imgSrc + '\', this)">' +
                  '<span class="material-symbols-outlined">add_shopping_cart</span> ADD' +
                '</button>'
            ) +
          '</div>' : '') +
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
  }, 400);
}

function changeQty(id, delta) {
  CartManager.changeQty(id, delta);
  loadMenu();
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
  } catch (e) {
    showToast(e.message, true);
  }
}

init();
