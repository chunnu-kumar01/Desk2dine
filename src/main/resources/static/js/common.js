/* ==========================================================================
   Desk2Dine — shared frontend utilities.
   Loaded on every page before the page-specific script.
   ========================================================================== */

// ---------- Food Image Mapping (High-Quality Unsplash) ----------
const FOOD_IMAGES = {
  // Breakfast
  "idli": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&h=400&fit=crop&q=80",
  "dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&h=400&fit=crop&q=80",
  "vada": "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=500&h=400&fit=crop&q=80",
  "upma": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&h=400&fit=crop&q=80",
  "poha": "https://images.unsplash.com/photo-1606491956689-2ea866880049?w=500&h=400&fit=crop&q=80",
  "uttapam": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&h=400&fit=crop&q=80",
  "paratha": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=400&fit=crop&q=80",
  "poori": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&h=400&fit=crop&q=80",
  "masala dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&h=400&fit=crop&q=80",
  "rava dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&h=400&fit=crop&q=80",

  // Rice & Biryani
  "biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&h=400&fit=crop&q=80",
  "chicken biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&h=400&fit=crop&q=80",
  "veg biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&h=400&fit=crop&q=80",
  "fried rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=400&fit=crop&q=80",
  "jeera rice": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&h=400&fit=crop&q=80",
  "steamed rice": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&h=400&fit=crop&q=80",
  "rice": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&h=400&fit=crop&q=80",
  "pulao": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&h=400&fit=crop&q=80",

  // Curries & Gravies
  "paneer butter masala": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&h=400&fit=crop&q=80",
  "butter chicken": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&h=400&fit=crop&q=80",
  "chicken curry": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&h=400&fit=crop&q=80",
  "palak paneer": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&h=400&fit=crop&q=80",
  "dal makhani": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=400&fit=crop&q=80",
  "dal fry": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=400&fit=crop&q=80",
  "dal": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=400&fit=crop&q=80",
  "sambar": "https://images.unsplash.com/photo-1574484284002-952d92456975?w=500&h=400&fit=crop&q=80",
  "aloo gobi": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=400&fit=crop&q=80",
  "chana masala": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=400&fit=crop&q=80",
  "paneer": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&h=400&fit=crop&q=80",
  "chicken": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&h=400&fit=crop&q=80",
  "egg curry": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&h=400&fit=crop&q=80",

  // Snacks
  "samosa": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=400&fit=crop&q=80",
  "pakora": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=400&fit=crop&q=80",
  "bajji": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=400&fit=crop&q=80",
  "cutlet": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&h=400&fit=crop&q=80",
  "bonda": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=400&fit=crop&q=80",
  "chips": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&h=400&fit=crop&q=80",
  "noodles": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=400&fit=crop&q=80",
  "manchurian": "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&h=400&fit=crop&q=80",
  "burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=400&fit=crop&q=80",
  "pizza": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=400&fit=crop&q=80",
  "sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&h=400&fit=crop&q=80",
  "chaat": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=400&fit=crop&q=80",

  // Breads
  "roti": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=400&fit=crop&q=80",
  "naan": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=400&fit=crop&q=80",
  "chapati": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=400&fit=crop&q=80",
  "kulcha": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=400&fit=crop&q=80",
  "butter naan": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=400&fit=crop&q=80",

  // Beverages
  "tea": "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=500&h=400&fit=crop&q=80",
  "chai": "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=500&h=400&fit=crop&q=80",
  "coffee": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&h=400&fit=crop&q=80",
  "juice": "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500&h=400&fit=crop&q=80",
  "lassi": "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500&h=400&fit=crop&q=80",
  "milkshake": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&h=400&fit=crop&q=80",
  "cold drink": "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500&h=400&fit=crop&q=80",
  "water": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500&h=400&fit=crop&q=80",

  // Desserts
  "gulab jamun": "https://images.unsplash.com/photo-1666190464994-4911405b2e68?w=500&h=400&fit=crop&q=80",
  "jalebi": "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?w=500&h=400&fit=crop&q=80",
  "halwa": "https://images.unsplash.com/photo-1666190464994-4911405b2e68?w=500&h=400&fit=crop&q=80",
  "kheer": "https://images.unsplash.com/photo-1571006046853-61c6c3e28e4f?w=500&h=400&fit=crop&q=80",
  "ice cream": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=500&h=400&fit=crop&q=80",
  "cake": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=400&fit=crop&q=80",
  "dessert": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&h=400&fit=crop&q=80",

  // Combos & Thali
  "thali": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=400&fit=crop&q=80",
  "combo": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=400&fit=crop&q=80",
  "south indian": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&h=400&fit=crop&q=80",
  "north indian": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=400&fit=crop&q=80",
  "chinese": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=400&fit=crop&q=80",
  "tiffin": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&h=400&fit=crop&q=80",
};

// Fallback image for items not in the map
const FOOD_IMAGE_FALLBACK = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=400&fit=crop&q=80";

function getFoodImage(itemName, categoryName) {
  const name = (itemName || "").toLowerCase().trim();
  const cat = (categoryName || "").toLowerCase().trim();
  // Try exact name match first
  if (FOOD_IMAGES[name]) return FOOD_IMAGES[name];
  // Try partial match in name
  for (var key in FOOD_IMAGES) {
    if (name.indexOf(key) !== -1 || key.indexOf(name) !== -1) return FOOD_IMAGES[key];
  }
  // Try category match
  if (FOOD_IMAGES[cat]) return FOOD_IMAGES[cat];
  for (var key in FOOD_IMAGES) {
    if (cat.indexOf(key) !== -1 || key.indexOf(cat) !== -1) return FOOD_IMAGES[key];
  }
  return FOOD_IMAGE_FALLBACK;
}

function handleImageError(img) {
  img.onerror = null;
  img.src = FOOD_IMAGE_FALLBACK;
}

// ---------- Page Transition ----------
(function(){
  var main = document.querySelector('main');
  if(main) main.classList.add('page-enter');
})();

// ---------- Toast notifications ----------
function showToast(message, isError) {
  var toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  var iconName = isError ? 'error' : 'check_circle';
  toast.innerHTML = '<span class="material-symbols-outlined">' + iconName + '</span>' + escapeHtml(message);
  toast.className = "toast show" + (isError ? " error" : "");
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(function(){ toast.className = "toast"; }, 3500);
}

// ---------- Loading overlay ----------
function showLoading(show) {
  var overlay = document.getElementById("loadingOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "loadingOverlay";
    overlay.className = "loading-overlay";
    overlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(overlay);
  }
  overlay.classList.toggle("show", !!show);
}

/**
 * Every fetch() call in the app goes through this wrapper.
 */
async function api(path, options) {
  const opts = Object.assign({ credentials: "same-origin" }, options);
  opts.headers = Object.assign({ "Content-Type": "application/json" }, options && options.headers);

  let res;
  try {
    res = await fetch(path, opts);
  } catch (networkError) {
    throw new Error("Could not reach the server. Please check your connection.");
  }

  if (res.status === 401) {
    if (!opts.skipAuthRedirect) {
      window.location.href = "login.html?expired=1";
    }
    throw new Error("Session expired");
  }

  const body = await res.json().catch(function(){ return {}; });
  if (!res.ok || body.success === false) {
    throw new Error(body.message || "Something went wrong");
  }
  return body.data;
}

/** Call at the top of every protected page to redirect guests to login. */
async function requireAuth(allowedRoles) {
  try {
    const user = await api("/api/auth/me", { skipAuthRedirect: true });
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      window.location.href = user.role === "ADMIN" ? "admin.html" : "faculty.html";
      return null;
    }
    renderTopbarUser(user);
    return user;
  } catch (e) {
    window.location.href = "login.html";
    return null;
  }
}

function renderTopbarUser(user) {
  const el = document.getElementById("topbarUserName");
  if (el) el.textContent = user.fullName;
}

async function logout() {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch (e) {
    // even if the call fails, still send the user back to login
  }
  window.location.href = "login.html";
}

// ---------- Formatting ----------
function formatMoney(amount) {
  return "\u20B9" + Number(amount || 0).toFixed(2);
}

function formatDateTime(isoString) {
  if (!isoString) return "\u2014";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "\u2014";
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return day + "-" + month + "-" + year + " " + hours + ":" + mins;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

// ---------- Simple client-side field validation helpers ----------
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}
function isValidMobile(mobile) {
  return /^(?:\+91|91|0)?[6-9]\d{9}$/.test((mobile || "").trim());
}
function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!_\-]).{8,}$/.test(password || "");
}

function setFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.classList.add("field-error");
  let msgEl = input.parentElement.querySelector(".error-message");
  if (!msgEl) {
    msgEl = document.createElement("div");
    msgEl.className = "error-message";
    input.parentElement.appendChild(msgEl);
  }
  msgEl.textContent = message;
}

function clearFieldErrors(formEl) {
  formEl.querySelectorAll(".field-error").forEach(function(el){ el.classList.remove("field-error"); });
  formEl.querySelectorAll(".error-message").forEach(function(el){ el.remove(); });
}

// ---------- Skeleton Generators ----------
function renderFoodSkeletons(container, count) {
  var html = '';
  for (var i = 0; i < (count || 8); i++) {
    html += '<div class="skeleton-food-card">' +
      '<div class="skel-img skeleton"></div>' +
      '<div class="skel-body">' +
        '<div class="skel-line w70 skeleton"></div>' +
        '<div class="skel-line w50 skeleton"></div>' +
        '<div class="skel-line w30 skeleton"></div>' +
        '<div class="skel-btn skeleton"></div>' +
      '</div>' +
    '</div>';
  }
  container.innerHTML = html;
}

function renderOrderSkeletons(container, count) {
  var html = '';
  for (var i = 0; i < (count || 3); i++) {
    html += '<div class="skeleton-card" style="margin-bottom:16px;">' +
      '<div class="skeleton-body">' +
        '<div class="skeleton-title skeleton"></div>' +
        '<div class="skeleton-text skeleton"></div>' +
        '<div class="skeleton-text skeleton" style="width:40%"></div>' +
      '</div>' +
    '</div>';
  }
  container.innerHTML = html;
}

// ---------- Intersection Observer for scroll animations ----------
function initScrollAnimations() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.food-card, .order-card, .stat-card, .profile-stat-card').forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.5s cubic-bezier(.4,0,.2,1)';
    observer.observe(el);
  });
}

// ---------- Cart Manager (localStorage) ----------
var CartManager = {
  STORAGE_KEY: "desk2dine_cart",

  _read: function() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {}; }
    catch(e) { return {}; }
  },

  _write: function(cart) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    this.updateBadge();
  },

  getAll: function() { return this._read(); },

  getCount: function() {
    var cart = this._read();
    var count = 0;
    for (var k in cart) count += cart[k].quantity;
    return count;
  },

  getTotal: function() {
    var cart = this._read();
    var total = 0;
    for (var k in cart) total += cart[k].quantity * cart[k].price;
    return total;
  },

  getItem: function(id) { return this._read()[id] || null; },

  addItem: function(id, name, price, img, quantity) {
    var cart = this._read();
    if (cart[id]) {
      cart[id].quantity += (quantity || 1);
    } else {
      cart[id] = { name: name, price: price, img: img || "", quantity: quantity || 1 };
    }
    this._write(cart);
    return cart[id];
  },

  setQuantity: function(id, qty) {
    var cart = this._read();
    if (!cart[id]) return;
    if (qty <= 0) { delete cart[id]; }
    else { cart[id].quantity = qty; }
    this._write(cart);
  },

  changeQty: function(id, delta) {
    var cart = this._read();
    if (!cart[id]) return;
    cart[id].quantity += delta;
    if (cart[id].quantity <= 0) delete cart[id];
    this._write(cart);
  },

  removeItem: function(id) {
    var cart = this._read();
    delete cart[id];
    this._write(cart);
  },

  clear: function() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.updateBadge();
  },

  updateBadge: function() {
    var count = this.getCount();
    var badges = document.querySelectorAll(".cart-badge .badge-count, .topbar-cart-count");
    badges.forEach(function(el) {
      el.textContent = count;
      el.style.display = count > 0 ? "flex" : "none";
      el.classList.remove("badge-bounce");
      void el.offsetWidth;
      el.classList.add("badge-bounce");
    });
  },

  getItemsArray: function() {
    var cart = this._read();
    var arr = [];
    for (var k in cart) {
      var item = cart[k];
      arr.push({ id: parseInt(k, 10), name: item.name, price: item.price, img: item.img, quantity: item.quantity });
    }
    return arr;
  }
};

// Update cart badge on every page load
document.addEventListener("DOMContentLoaded", function() { CartManager.updateBadge(); });

/** Simple pagination control renderer */
function renderPagination(containerEl, page, totalPages, onPage) {
  if (totalPages <= 1) {
    containerEl.innerHTML = "";
    return;
  }
  var html = '<div class="pagination">';
  html += '<button class="page-btn" ' + (page === 0 ? "disabled" : "") + ' data-page="' + (page - 1) + '">&larr; Prev</button>';
  html += '<span class="page-info">Page ' + (page + 1) + ' of ' + totalPages + '</span>';
  html += '<button class="page-btn" ' + (page >= totalPages - 1 ? "disabled" : "") + ' data-page="' + (page + 1) + '">Next &rarr;</button>';
  html += "</div>";
  containerEl.innerHTML = html;
  containerEl.querySelectorAll(".page-btn").forEach(function(btn) {
    btn.addEventListener("click", function(){ onPage(parseInt(btn.dataset.page, 10)); });
  });
}
