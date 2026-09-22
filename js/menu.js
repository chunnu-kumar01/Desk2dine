let currentUser = null;
let currentPage = 0;
const PAGE_SIZE = 8;
let favouriteIds = new Set();
let categories = [];

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
  } else if (role === "FACULTY") {
    subnav.innerHTML = '<a href="index.html"><span class="material-symbols-outlined">home</span> Home</a>' +
      '<a href="menu.html" class="active"><span class="material-symbols-outlined">restaurant_menu</span> Browse Menu</a>' +
      '<a href="favourites.html"><span class="material-symbols-outlined">favorite</span> Favourites</a>' +
      '<a href="cart.html"><span class="material-symbols-outlined">shopping_cart</span> Cart</a>' +
      '<a href="my-orders.html"><span class="material-symbols-outlined">receipt_long</span> My Orders</a>' +
      '<a href="profile.html"><span class="material-symbols-outlined">person</span> Profile</a>';
  } else {
    subnav.innerHTML = '<a href="index.html"><span class="material-symbols-outlined">home</span> Home</a>' +
      '<a href="menu.html" class="active"><span class="material-symbols-outlined">restaurant_menu</span> Browse Menu</a>' +
      '<a href="cart.html"><span class="material-symbols-outlined">shopping_cart</span> Cart</a>' +
      '<a href="login.html" onclick="if(window.showAuthModal){event.preventDefault();showAuthModal();}"><span class="material-symbols-outlined">login</span> Login</a>';
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
      '<a href="index.html" class="mobile-nav-item"><span class="material-symbols-outlined">home</span><span>Home</span></a>' +
      '<a href="menu.html" class="mobile-nav-item active"><span class="material-symbols-outlined">restaurant_menu</span><span>Menu</span></a>' +
      '<a href="cart.html" class="mobile-nav-item"><span class="material-symbols-outlined">shopping_cart</span><span>Cart</span></a>' +
      '<a href="my-orders.html" class="mobile-nav-item"><span class="material-symbols-outlined">receipt_long</span><span>Orders</span></a>' +
      '<a href="profile.html" class="mobile-nav-item"><span class="material-symbols-outlined">person</span><span>Profile</span></a>' +
      '</div>';
  }
}

async function init() {
  currentUser = await getCurrentUser();
  renderTopbarUser(currentUser);
  CartManager.updateBadge();

  renderSubnav(currentUser ? currentUser.role : null);
  renderMobileNav(currentUser ? currentUser.role : null);

  // Show skeletons while loading
  renderFoodSkeletons(document.getElementById("menuList"), 8);

  const promises = [loadCategories()];
  if (currentUser) {
    promises.push(loadFavourites(), refreshNotifBadge());
  }
  await Promise.all(promises);
  await loadMenu();

  // Wire search inputs
  const topbarSearch = document.getElementById("topbarSearchInput");
  const topbarClear = document.getElementById("topbarSearchClear");
  const mainSearch = document.getElementById("searchInput");

  if (topbarSearch) {
    topbarSearch.addEventListener("input", debounce(function(e) {
      if (topbarClear) topbarClear.style.display = e.target.value ? "flex" : "none";
      if (mainSearch) mainSearch.value = e.target.value;
      currentPage = 0;
      loadMenu();
    }, 350));
  }

  if (topbarClear && topbarSearch) {
    topbarClear.addEventListener("click", function() {
      topbarSearch.value = "";
      topbarClear.style.display = "none";
      if (mainSearch) mainSearch.value = "";
      currentPage = 0;
      loadMenu();
    });
  }

  if (mainSearch) {
    mainSearch.addEventListener("input", debounce(function(e) {
      if (topbarSearch) topbarSearch.value = e.target.value;
      if (topbarClear) topbarClear.style.display = e.target.value ? "flex" : "none";
      currentPage = 0;
      loadMenu();
    }, 350));
  }

  ["categoryFilter", "sortBy", "sortDir"].forEach(function(id){
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", function(){ currentPage = 0; loadMenu(); });
  });

  window.addEventListener("cartUpdated", function() {
    loadMenu();
  });
}

function debounce(fn, delay) {
  let timer;
  return function(){
    clearTimeout(timer);
    const args = arguments;
    timer = setTimeout(function(){ fn.apply(null, args); }, delay);
  };
}

async function loadCategories() {
  try {
    categories = await api("/api/categories");
    const select = document.getElementById("categoryFilter");
    if (select) {
      select.innerHTML = '<option value="">All categories</option>' +
          categories.map(function(c){ return '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>'; }).join("");
    }
  } catch (e) { console.error(e); }
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
    if (badge && result.unread > 0) {
      badge.style.display = "flex";
      badge.textContent = result.unread > 9 ? "9+" : result.unread;
    } else if (badge) {
      badge.style.display = "none";
    }
  } catch (e) { /* non-critical */ }
}

async function loadMenu() {
  const searchInput = document.getElementById("searchInput");
  const topbarSearch = document.getElementById("topbarSearchInput");
  const search = (searchInput ? searchInput.value : "") || (topbarSearch ? topbarSearch.value : "");
  const catFilter = document.getElementById("categoryFilter");
  const categoryId = catFilter ? catFilter.value : "";
  const sortByEl = document.getElementById("sortBy");
  const sortBy = sortByEl ? sortByEl.value : "name";
  const sortDirEl = document.getElementById("sortDir");
  const sortDir = sortDirEl ? sortDirEl.value : "asc";

  try {
    const result = await api("/api/menu-items?search=" + encodeURIComponent(search.trim()) +
      "&categoryId=" + encodeURIComponent(categoryId) +
      "&sortBy=" + encodeURIComponent(sortBy) +
      "&sortDir=" + encodeURIComponent(sortDir) +
      "&page=" + currentPage + "&size=" + PAGE_SIZE);

    renderMenu(result.content);
    renderPagination(document.getElementById("pagination"), result.page, result.totalPages, function(p) {
      currentPage = p;
      loadMenu();
    });
    setTimeout(initScrollAnimations, 100);
  } catch (e) {
    showToast(e.message, true);
  }
}

function renderMenu(items) {
  const list = document.getElementById("menuList");
  if (!list) return;

  if (!items || items.length === 0) {
    list.innerHTML =
      '<div class="empty-state" style="grid-column: 1 / -1;">' +
        '<div class="empty-icon"><span class="material-symbols-outlined">search_off</span></div>' +
        '<div class="big">No items found</div>' +
        '<p>Try a different search or category.</p>' +
      '</div>';
    return;
  }

  const cart = CartManager.getAll();
  list.innerHTML = items.map(function(item) {
    return renderFoodCardHtml(item, cart, { showFav: true, favouriteIds: favouriteIds });
  }).join("");
}

function openCardModal(itemObj) {
  showFoodDetailsModal(itemObj);
}

function addToCart(id, name, price, img, btn) {
  handleCardAddToCart(id, name, price, img, btn);
}

function changeQty(id, delta) {
  handleCardQtyChange(id, delta);
}

async function toggleFavourite(menuItemId, btn) {
  if (!currentUser) {
    showAuthModal({
      title: "Login to save favourites",
      subtitle: "Sign in with your faculty account to favorite items."
    });
    return;
  }
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
