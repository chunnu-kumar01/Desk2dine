function renderSubnav(role) {
  var subnav = document.getElementById("subnav");
  var portalLabel = document.getElementById("portalLabel");
  var cartIcon = document.getElementById("cartIcon");
  if (portalLabel) portalLabel.textContent = role === "ADMIN" ? "Admin" : "Faculty";
  if (cartIcon) cartIcon.style.display = role === "ADMIN" ? "none" : "";
  if (role === "ADMIN") {
    subnav.innerHTML = '<a href="admin.html"><span class="material-symbols-outlined">dashboard</span> Dashboard</a>' +
      '<a href="menu.html"><span class="material-symbols-outlined">restaurant_menu</span> Browse Menu</a>' +
      '<a href="profile.html"><span class="material-symbols-outlined">person</span> Profile</a>';
  } else {
    subnav.innerHTML = '<a href="faculty.html"><span class="material-symbols-outlined">shopping_cart</span> Place Order</a>' +
      '<a href="menu.html"><span class="material-symbols-outlined">restaurant_menu</span> Browse Menu</a>' +
      '<a href="favourites.html" class="active"><span class="material-symbols-outlined">favorite</span> Favourites</a>' +
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
      '<a href="menu.html" class="mobile-nav-item"><span class="material-symbols-outlined">restaurant_menu</span><span>Menu</span></a>' +
      '<a href="profile.html" class="mobile-nav-item"><span class="material-symbols-outlined">person</span><span>Profile</span></a>' +
      '</div>';
  } else {
    nav.innerHTML = '<div class="mobile-nav-inner">' +
      '<a href="faculty.html" class="mobile-nav-item"><span class="material-symbols-outlined">shopping_cart</span><span>Order</span></a>' +
      '<a href="menu.html" class="mobile-nav-item"><span class="material-symbols-outlined">restaurant_menu</span><span>Menu</span></a>' +
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
  await refreshNotifBadge();
  await loadFavourites();
}

async function refreshNotifBadge() {
  try {
    const result = await api("/api/notifications/unread-count");
    const badge = document.getElementById("notifBadge");
    if (result.unread > 0) { badge.style.display = "flex"; badge.textContent = result.unread > 9 ? "9+" : result.unread; }
  } catch (e) { /* non-critical */ }
}

async function loadFavourites() {
  try {
    const items = await api("/api/favourites");
    renderList(items);
  } catch (e) {
    showToast(e.message, true);
  }
}

function renderList(items) {
  const list = document.getElementById("favList");
  if (!items.length) {
    list.innerHTML = '<div class="empty-state">' +
      '<div class="empty-icon"><span class="material-symbols-outlined">favorite_border</span></div>' +
      '<div class="big">No favourites yet</div>' +
      '<p>Star items on the <a href="menu.html">menu page</a> to save them here for quick reordering.</p>' +
      '<a href="menu.html" class="btn btn-primary" style="margin-top:16px;">' +
        '<span class="material-symbols-outlined">restaurant_menu</span> Browse Menu' +
      '</a>' +
    '</div>';
    return;
  }
  list.innerHTML = items.map(function(item) {
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
        '<button class="food-card-fav active" onclick="removeFavourite(' + item.id + ')" title="Remove from favourites">' +
          '<span class="material-symbols-outlined">favorite</span>' +
        '</button>' +
      '</div>' +
      '<div class="food-card-body">' +
        '<div class="food-card-name">' + escapeHtml(item.name) + '</div>' +
        '<div class="food-card-rating">' + starsHtml + '<span class="rating-text">' + rating + '</span></div>' +
        '<div class="food-card-price">' + formatMoney(item.price) + '</div>' +
      '</div>' +
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
      '</div>' +
    '</div>';
  }).join("");
  setTimeout(initScrollAnimations, 100);
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
    setTimeout(function() { loadFavourites(); }, 500);
  }, 400);
}

function changeQty(id, delta) {
  CartManager.changeQty(id, delta);
  loadFavourites();
}

async function removeFavourite(menuItemId) {
  try {
    await api("/api/favourites/" + menuItemId, { method: "DELETE" });
    showToast("Removed from favourites");
    loadFavourites();
  } catch (e) {
    showToast(e.message, true);
  }
}

init();
