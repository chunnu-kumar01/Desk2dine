/* ==========================================================================
   Desk2Dine — Home Page Controller (Public E-Commerce Flow)
   ========================================================================== */

let currentUser = null;
let currentPage = 0;
const PAGE_SIZE = 8;
let categories = [];
let allMenuItems = [];

// Carousel State
let currentSlide = 0;
let carouselTimer = null;
const totalSlides = 3;

async function initHome() {
  // Check if logged in (does NOT force redirect)
  currentUser = await getCurrentUser();
  renderTopbarUser(currentUser);
  CartManager.updateBadge();

  // Initialize Hero Carousel
  initHeroCarousel();

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

  // Wire mobile search input → same pipeline
  const mobileInput = document.getElementById("mobileSearchInput");
  if (mobileInput) {
    mobileInput.addEventListener("input", debounce(function(e) {
      const val = e.target.value;
      if (topbarSearch) topbarSearch.value = val;
      if (mainSearch) mainSearch.value = val;
      if (topbarClear) topbarClear.style.display = val ? "flex" : "none";
      currentPage = 0;
      loadMenu(val.length > 0 || true);
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

  // Listen to CartManager updates to keep card steppers synced
  window.addEventListener("cartUpdated", function() {
    syncAllCardQuantities();
  });
}

// ---------- Mobile Search Toggle ----------
function toggleMobileSearch() {
  const bar = document.getElementById("mobileSearchBar");
  const input = document.getElementById("mobileSearchInput");
  if (!bar) return;
  const isOpen = bar.classList.contains("open");
  if (isOpen) {
    bar.classList.remove("open");
    bar.setAttribute("aria-hidden", "true");
    if (input) input.blur();
  } else {
    bar.classList.add("open");
    bar.setAttribute("aria-hidden", "false");
    if (input) { input.focus(); }
  }
}

// ---------- Hero Carousel Controller ----------
function initHeroCarousel() {
  const slides = document.getElementById("heroSlides");
  const dots = document.querySelectorAll(".hero-carousel-dot");
  const prevBtn = document.getElementById("heroPrevBtn");
  const nextBtn = document.getElementById("heroNextBtn");
  const carousel = document.getElementById("heroCarousel");
  if (!slides || !dots.length) return;

  function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    slides.style.transform = "translateX(-" + (currentSlide * 100) + "%)";
    dots.forEach(function(dot, i) {
      dot.classList.toggle("active", i === currentSlide);
    });
  }

  if (prevBtn) prevBtn.onclick = function() { goToSlide(currentSlide - 1); };
  if (nextBtn) nextBtn.onclick = function() { goToSlide(currentSlide + 1); };

  dots.forEach(function(dot, i) {
    dot.onclick = function() { goToSlide(i); };
  });

  function startAutoSlide() {
    stopAutoSlide();
    carouselTimer = setInterval(function() {
      goToSlide(currentSlide + 1);
    }, 5000);
  }

  function stopAutoSlide() {
    if (carouselTimer) {
      clearInterval(carouselTimer);
      carouselTimer = null;
    }
  }

  if (carousel) {
    carousel.addEventListener("mouseenter", stopAutoSlide);
    carousel.addEventListener("mouseleave", startAutoSlide);
  }

  startAutoSlide();
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
  if (chipEl) {
    chipEl.classList.add('active');
  } else if (catId !== undefined && catId !== "") {
    const match = document.querySelector('.category-chip[data-cat-id="' + catId + '"]');
    if (match) match.classList.add('active');
  } else {
    const allChip = document.querySelector('.category-chip[data-cat-id=""]');
    if (allChip) allChip.classList.add('active');
  }

  const catFilter = document.getElementById("categoryFilter");
  if (catFilter) catFilter.value = catId || "";

  currentPage = 0;
  loadMenu(true);
}

async function loadFeaturedAndMenu() {
  try {
    const result = await api("/api/menu-items?page=0&size=30");
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
    return renderFoodCardHtml(item, cart, { showFav: false });
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
    return renderFoodCardHtml(item, cart, { showFav: false });
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
      "&sortBy=" + encodeURIComponent(sortBy) +
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
      '<div class="empty-state" style="grid-column: 1 / -1;">' +
        '<div class="empty-icon"><span class="material-symbols-outlined">search_off</span></div>' +
        '<div class="big">No food items found</div>' +
        '<p>Try searching with another keyword or pick a different category.</p>' +
      '</div>';
    return;
  }

  const cart = CartManager.getAll();
  list.innerHTML = items.map(function(item) {
    return renderFoodCardHtml(item, cart, { showFav: false });
  }).join("");

  setTimeout(initScrollAnimations, 100);
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", initHome);
