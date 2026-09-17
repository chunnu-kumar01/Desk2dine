/* ==========================================================================
   Desk2Dine — Home Page Controller (Public E-Commerce Flow)
   ========================================================================== */

let currentUser = null;
let currentPage = 0;
const PAGE_SIZE = 8;
let categories = [];
let allMenuItems = [];

async function initHome() {
  // Check if logged in (does NOT force redirect)
  currentUser = await getCurrentUser();
  renderTopbarUser(currentUser);
  CartManager.updateBadge();

  // Show skeleton loading states
  renderFoodSkeletons(document.getElementById("popularList"), 4);
  renderFoodSkeletons(document.getElementById("recommendedList"), 4);
  renderFoodSkeletons(document.getElementById("menuList"), 8);

  // Load categories and initial menu
  await loadCategories();
  await loadFeaturedAndMenu();

  // Setup search input listeners (both topbar search and in-page search)
  const topbarSearch = document.getElementById("topbarSearchInput");
  const topbarClear = document.getElementById("topbarSearchClear");
  const mainSearch = document.getElementById("searchInput");

  if (topbarSearch) {
    topbarSearch.addEventListener("input", debounce(function(e) {
      const val = e.target.value;
      if (topbarClear) topbarClear.style.display = val ? "flex" : "none";
      if (mainSearch) mainSearch.value = val;
      currentPage = 0;
      loadMenu(true);
    }, 300));
  }

  if (topbarClear && topbarSearch) {
    topbarClear.addEventListener("click", function() {
      topbarSearch.value = "";
      topbarClear.style.display = "none";
      if (mainSearch) mainSearch.value = "";
      currentPage = 0;
      loadMenu(false);
    });
  }

  if (mainSearch) {
    mainSearch.addEventListener("input", debounce(function(e) {
      if (topbarSearch) topbarSearch.value = e.target.value;
      if (topbarClear) topbarClear.style.display = e.target.value ? "flex" : "none";
      currentPage = 0;
      loadMenu(false);
    }, 300));
  }

  const catFilter = document.getElementById("categoryFilter");
  if (catFilter) {
    catFilter.addEventListener("change", function() {
      currentPage = 0;
      loadMenu(false);
    });
  }

  const sortBy = document.getElementById("sortBy");
  const sortDir = document.getElementById("sortDir");
  if (sortBy) sortBy.addEventListener("change", function(){ currentPage = 0; loadMenu(false); });
  if (sortDir) sortDir.addEventListener("change", function(){ currentPage = 0; loadMenu(false); });

  // Listen to CartManager updates to keep all button states synced
  window.addEventListener("cartUpdated", function() {
    renderPopularItems();
    renderRecommendedItems();
    updateMenuCardQuantities();
  });
}

function debounce(fn, delay) {
  let timer;
  return function() {
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function(){ fn.apply(null, args); }, delay);
  };
}

async function loadCategories() {
  try {
    categories = await api("/api/categories");
    const filterSelect = document.getElementById("categoryFilter");
    if (filterSelect) {
      filterSelect.innerHTML = '<option value="">All categories</option>' +
        categories.map(function(c){
          return '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>';
        }).join("");
    }
    renderCategoryChips();
  } catch (e) {
    console.error("Could not load categories", e);
  }
}

function renderCategoryChips() {
  const container = document.getElementById("categoryChips");
  if (!container) return;

  let html = '<div class="category-chip active" data-cat-id="" onclick="filterByCategory(\'\', this)">' +
    '<div class="category-chip-icon"><img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=200&h=200&fit=crop&q=80" alt="All"></div>' +
    '<div class="category-chip-label">All</div></div>';

  categories.forEach(function(c) {
    const img = (typeof getCategoryImage === "function") ? getCategoryImage(c.name) : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop&q=80";
    html += '<div class="category-chip" data-cat-id="' + c.id + '" onclick="filterByCategory(' + c.id + ', this)">' +
      '<div class="category-chip-icon"><img src="' + img + '" alt="' + escapeHtml(c.name) + '" onerror="this.src=\'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=200&h=200&fit=crop&q=80\'"></div>' +
      '<div class="category-chip-label">' + escapeHtml(c.name) + '</div></div>';
  });

  container.innerHTML = html;
}

function filterByCategory(catId, chipEl) {
  document.querySelectorAll('.category-chip').forEach(function(c){ c.classList.remove('active'); });
  if (chipEl) chipEl.classList.add('active');

  const catFilter = document.getElementById("categoryFilter");
  if (catFilter) catFilter.value = catId || "";

  currentPage = 0;
  loadMenu(true);
}

async function loadFeaturedAndMenu() {
  try {
    // Fetch available items to populate popular, recommended, and initial menu
    const result = await api("/api/menu-items?onlyAvailable=true&page=0&size=30");
    allMenuItems = result.content || [];

    renderPopularItems();
    renderRecommendedItems();
    renderMenuList(allMenuItems.slice(0, PAGE_SIZE));
    renderPagination(document.getElementById("pagination"), 0, Math.ceil(allMenuItems.length / PAGE_SIZE), function(p) {
      currentPage = p;
      renderMenuList(allMenuItems.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE));
    });

    setTimeout(initScrollAnimations, 100);
  } catch (e) {
    console.error("Could not load menu items", e);
    loadMenu(false);
  }
}

function renderPopularItems() {
  const container = document.getElementById("popularList");
  if (!container) return;

  const popular = allMenuItems.slice(0, 6);
  if (!popular.length) {
    container.innerHTML = '<p style="color:#888;padding:12px;">No popular items at the moment.</p>';
    return;
  }

  const cart = CartManager.getAll();
  container.innerHTML = popular.map(function(item) {
    return createFoodCardHtml(item, cart, "popular");
  }).join("");
}

function renderRecommendedItems() {
  const container = document.getElementById("recommendedList");
  if (!container) return;

  const recommended = allMenuItems.slice(3, 9);
  if (!recommended.length) {
    container.innerHTML = '<p style="color:#888;padding:12px;">No recommended items at the moment.</p>';
    return;
  }

  const cart = CartManager.getAll();
  container.innerHTML = recommended.map(function(item) {
    return createFoodCardHtml(item, cart, "recommended");
  }).join("");
}

async function loadMenu(scrollToMenu) {
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
    const query = "/api/menu-items?search=" + encodeURIComponent(search.trim()) +
      "&categoryId=" + encodeURIComponent(categoryId) +
      "&onlyAvailable=false&sortBy=" + encodeURIComponent(sortBy) +
      "&sortDir=" + encodeURIComponent(sortDir) +
      "&page=" + currentPage + "&size=" + PAGE_SIZE;

    const result = await api(query);
    renderMenuList(result.content);
    renderPagination(document.getElementById("pagination"), result.page, result.totalPages, function(p) {
      currentPage = p;
      loadMenu(true);
    });

    if (scrollToMenu) {
      const menuSection = document.getElementById("completeMenuSection");
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  } catch (e) {
    showToast(e.message, true);
  }
}

function renderMenuList(items) {
  const list = document.getElementById("menuList");
  if (!list) return;

  if (!items || items.length === 0) {
    list.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-icon"><span class="material-symbols-outlined">search_off</span></div>' +
        '<div class="big">No food items found</div>' +
        '<p>Try searching with another keyword or pick a different category.</p>' +
      '</div>';
    return;
  }

  const cart = CartManager.getAll();
  list.innerHTML = items.map(function(item) {
    return createFoodCardHtml(item, cart, "menu");
  }).join("");

  setTimeout(initScrollAnimations, 100);
}

function createFoodCardHtml(item, cart, prefix) {
  const qty = cart[item.id] ? cart[item.id].quantity : 0;
  const imgSrc = item.imageUrl || getFoodImage(item.name, item.categoryName);
  const isAvailable = item.available !== false;
  const itemJson = escapeHtml(JSON.stringify({
    id: item.id,
    name: item.name,
    categoryName: item.categoryName || "",
    price: item.price,
    imageUrl: imgSrc,
    description: item.description || "",
    available: isAvailable
  }));

  return '<div class="food-card" data-item-id="' + item.id + '">' +
    '<div class="food-card-img-wrap" onclick=\'openCardModal(' + itemJson + ')\'>' +
      '<img class="food-card-img" src="' + imgSrc + '" alt="' + escapeHtml(item.name) + '" loading="lazy" onerror="handleImageError(this)">' +
      (!isAvailable ? '<span class="food-card-unavailable">Unavailable</span>' : '') +
    '</div>' +
    '<div class="food-card-body">' +
      '<div class="food-card-name" onclick=\'openCardModal(' + itemJson + ')\'>' + escapeHtml(item.name) + '</div>' +
      (item.description ? '<div class="food-card-desc">' + escapeHtml(item.description) + '</div>' : '') +
      '<div class="food-card-price">' + formatMoney(item.price) + '</div>' +
    '</div>' +
    (isAvailable ?
      '<div class="food-card-footer">' +
        (qty > 0
          ? '<div class="qty-control">' +
              '<button class="qty-btn" onclick="handleCardQtyChange(' + item.id + ', -1)">&minus;</button>' +
              '<span class="qty-value">' + qty + '</span>' +
              '<button class="qty-btn" onclick="handleCardQtyChange(' + item.id + ', 1)">+</button>' +
            '</div>'
          : '<button class="btn-add-item" onclick="handleCardAddToCart(' + item.id + ', \'' + escapeJs(item.name) + '\', ' + item.price + ', \'' + imgSrc + '\', this)">' +
              '<span class="material-symbols-outlined">add_shopping_cart</span> ADD' +
            '</button>'
        ) +
      '</div>'
    : '<div class="food-card-footer"><span style="font-size:12px;color:var(--fk-red);font-weight:600;">Out of Stock</span></div>') +
  '</div>';
}

function openCardModal(itemObj) {
  showFoodDetailsModal(itemObj);
}

function handleCardAddToCart(id, name, price, img, btn) {
  btn.classList.add("adding");
  btn.innerHTML = '<span class="spinner"></span>';
  setTimeout(function() {
    CartManager.addItem(id, name, price, img, 1);
    btn.classList.remove("adding");
    btn.classList.add("added");
    btn.innerHTML = '<span class="material-symbols-outlined">check</span> ADDED';
    showToast(name + " added to cart");
  }, 250);
}

function handleCardQtyChange(id, delta) {
  CartManager.changeQty(id, delta);
}

function updateMenuCardQuantities() {
  const cart = CartManager.getAll();
  document.querySelectorAll(".food-card").forEach(function(card) {
    const id = card.dataset.itemId;
    if (!id) return;
    const qty = cart[id] ? cart[id].quantity : 0;
    const footer = card.querySelector(".food-card-footer");
    if (!footer) return;

    if (card.querySelector(".food-card-unavailable")) return;

    const nameEl = card.querySelector(".food-card-name");
    const name = nameEl ? nameEl.textContent : "Item";
    const imgEl = card.querySelector(".food-card-img");
    const imgSrc = imgEl ? imgEl.src : "";
    const priceEl = card.querySelector(".food-card-price");
    const price = priceEl ? parseFloat(priceEl.textContent.replace(/[^\d.]/g, "")) || 0 : 0;

    if (qty > 0) {
      footer.innerHTML =
        '<div class="qty-control">' +
          '<button class="qty-btn" onclick="handleCardQtyChange(' + id + ', -1)">&minus;</button>' +
          '<span class="qty-value">' + qty + '</span>' +
          '<button class="qty-btn" onclick="handleCardQtyChange(' + id + ', 1)">+</button>' +
        '</div>';
    } else {
      footer.innerHTML =
        '<button class="btn-add-item" onclick="handleCardAddToCart(' + id + ', \'' + escapeJs(name) + '\', ' + price + ', \'' + imgSrc + '\', this)">' +
          '<span class="material-symbols-outlined">add_shopping_cart</span> ADD' +
        '</button>';
    }
  });
}

function escapeJs(str) {
  return String(str).replace(/'/g, "\\'").replace(/\\/g, '\\\\');
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", initHome);
