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
    subnav.innerHTML = '<a href="index.html"><span class="material-symbols-outlined">home</span> Home</a>' +
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
      '<a href="index.html" class="mobile-nav-item"><span class="material-symbols-outlined">home</span><span>Home</span></a>' +
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
  const cart = CartManager.getAll();
  const favouriteIds = new Set(items.map(function(i) { return i.id; }));
  list.innerHTML = items.map(function(item) {
    return renderFoodCardHtml(item, cart, { showFav: true, favouriteIds: favouriteIds, isFavActive: true, onRemoveFav: 'removeFavourite(' + item.id + ')' });
  }).join("");
  setTimeout(initScrollAnimations, 100);
  /* Sync favourite remove buttons */
  list.querySelectorAll('.food-card-fav').forEach(function(btn) {
    btn.classList.add('active');
  });
}

function addToCart(id, name, price, img, btn) {
  handleCardAddToCart(id, name, price, img, btn);
}

function changeQty(id, delta) {
  handleCardQtyChange(id, delta);
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
