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

// ---------- GitHub Pages / Offline Demo Mock Fallback ----------
const DEMO_CATEGORIES = [
  { id: 1, name: "Beverages", description: "Hot and cold drinks" },
  { id: 2, name: "Snacks", description: "Light bites and quick snacks" },
  { id: 3, name: "Meals", description: "Full plates and heavier items" },
  { id: 4, name: "Desserts", description: "Something sweet to finish" }
];

const DEMO_MENU_ITEMS = [
  { id: 1, categoryId: 1, categoryName: "Beverages", name: "Tea", description: "Classic Indian masala chai", price: 10.00, available: true, isAvailable: true },
  { id: 2, categoryId: 1, categoryName: "Beverages", name: "Coffee", description: "Filter coffee, hot", price: 20.00, available: true, isAvailable: true },
  { id: 3, categoryId: 1, categoryName: "Beverages", name: "Cold Coffee", description: "Iced coffee with milk", price: 40.00, available: true, isAvailable: true },
  { id: 4, categoryId: 2, categoryName: "Snacks", name: "Samosa", description: "Deep-fried pastry with spiced filling", price: 15.00, available: true, isAvailable: true },
  { id: 5, categoryId: 2, categoryName: "Snacks", name: "Vada Pav", description: "Spiced potato fritter in a bun", price: 25.00, available: true, isAvailable: true },
  { id: 6, categoryId: 2, categoryName: "Snacks", name: "Sandwich", description: "Grilled vegetable sandwich", price: 35.00, available: true, isAvailable: true },
  { id: 7, categoryId: 3, categoryName: "Meals", name: "Veg Thali", description: "Full vegetarian meal with rice, dal, and sabzi", price: 90.00, available: true, isAvailable: true },
  { id: 8, categoryId: 3, categoryName: "Meals", name: "Burger", description: "Veg burger with fries", price: 50.00, available: true, isAvailable: true },
  { id: 9, categoryId: 3, categoryName: "Meals", name: "Fried Rice", description: "Vegetable fried rice", price: 60.00, available: true, isAvailable: true },
  { id: 10, categoryId: 4, categoryName: "Desserts", name: "Gulab Jamun (2 pcs)", description: "Deep-fried milk balls in sugar syrup", price: 30.00, available: true, isAvailable: true }
];

const DEMO_LOCATIONS = [
  { id: 1, name: "F-204, CSE Block", block: "CSE Block", floor: "2nd Floor" },
  { id: 2, name: "S-101, Staff Room", block: "Main Block", floor: "1st Floor" },
  { id: 3, name: "Principal Office", block: "Admin Block", floor: "Ground Floor" },
  { id: 4, name: "Library Reading Room", block: "Library Block", floor: "1st Floor" },
  { id: 5, name: "Conference Hall", block: "Main Block", floor: "3rd Floor" }
];

function handleStaticMock(path, opts) {
  const method = (opts && opts.method ? opts.method.toUpperCase() : "GET");
  const cleanPath = path.split("?")[0];
  const queryString = path.indexOf("?") !== -1 ? path.split("?")[1] : "";
  const params = new URLSearchParams(queryString);

  if (cleanPath === "/api/categories") {
    return DEMO_CATEGORIES;
  }
  if (cleanPath === "/api/delivery-locations") {
    return DEMO_LOCATIONS;
  }
  if (cleanPath === "/api/auth/me") {
    const raw = localStorage.getItem("desk2dine_mock_user");
    if (raw) {
      try { return JSON.parse(raw); } catch(e){}
    }
    return null;
  }
  if (cleanPath === "/api/auth/login" || cleanPath === "/api/auth/signup") {
    let body = {};
    try { body = JSON.parse(opts.body); } catch(e){}
    const mockUser = {
      id: 1,
      fullName: body.fullName || "Faculty Member",
      name: body.fullName || "Faculty Member",
      email: body.email || "faculty@desk2dine.com",
      role: body.role || "FACULTY"
    };
    localStorage.setItem("desk2dine_mock_user", JSON.stringify(mockUser));
    return mockUser;
  }
  if (cleanPath === "/api/auth/logout") {
    localStorage.removeItem("desk2dine_mock_user");
    return true;
  }
  if (cleanPath === "/api/orders" && method === "POST") {
    let body = {};
    try { body = JSON.parse(opts.body); } catch(e){}
    const orderId = Math.floor(Math.random() * 9000) + 1000;
    const newOrder = {
      id: orderId,
      status: "PLACED",
      deliveryLocationName: "Campus Location",
      totalAmount: 120,
      createdAt: new Date().toISOString()
    };
    const stored = JSON.parse(localStorage.getItem("desk2dine_mock_orders") || "[]");
    stored.unshift(newOrder);
    localStorage.setItem("desk2dine_mock_orders", JSON.stringify(stored));
    return newOrder;
  }
  if (cleanPath === "/api/orders" && method === "GET") {
    const stored = JSON.parse(localStorage.getItem("desk2dine_mock_orders") || "[]");
    return { content: stored, totalElements: stored.length, totalPages: 1 };
  }
  if (cleanPath === "/api/menu-items") {
    let items = [...DEMO_MENU_ITEMS];
    const catId = params.get("categoryId");
    if (catId) {
      items = items.filter(function(it) { return String(it.categoryId) === String(catId); });
    }
    const search = params.get("search");
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(function(it) {
        return it.name.toLowerCase().includes(q) || it.description.toLowerCase().includes(q);
      });
    }
    const page = parseInt(params.get("page") || "0", 10);
    const size = parseInt(params.get("size") || "20", 10);
    const start = page * size;
    const pageItems = items.slice(start, start + size);
    return {
      content: pageItems,
      totalElements: items.length,
      totalPages: Math.ceil(items.length / size) || 1,
      currentPage: page
    };
  }
  if (cleanPath.startsWith("/api/menu-items/")) {
    const idStr = cleanPath.replace("/api/menu-items/", "");
    const found = DEMO_MENU_ITEMS.find(function(it) { return String(it.id) === idStr; });
    if (found) return found;
    return DEMO_MENU_ITEMS[0];
  }

  return [];
}

/**
 * Every fetch() call in the app goes through this wrapper.
 */
async function api(path, options) {
  const isGithubPages = window.location.hostname.endsWith("github.io");

  // On GitHub Pages static host, route to mock demo data automatically
  if (isGithubPages) {
    try {
      return handleStaticMock(path, options);
    } catch(mockErr) {
      console.warn("Mock API handler error:", mockErr);
    }
  }

  const opts = Object.assign({ credentials: "same-origin" }, options);
  opts.headers = Object.assign({ "Content-Type": "application/json" }, options && options.headers);

  let res;
  try {
    res = await fetch(path, opts);
  } catch (networkError) {
    // If backend cannot be reached, fall back to mock demo data so UI stays interactive
    return handleStaticMock(path, options);
  }

  if (res.status === 401) {
    if (!opts.skipAuthRedirect) {
      window.location.href = "login.html?expired=1";
    }
    throw new Error("Session expired");
  }

  if (res.status === 404) {
    return handleStaticMock(path, options);
  }

  const body = await res.json().catch(function(){ return {}; });
  if (!res.ok || body.success === false) {
    throw new Error(body.message || "Something went wrong");
  }
  return body.data;
}

/** Safe check for current session without forcing redirect */
async function getCurrentUser() {
  try {
    const user = await api("/api/auth/me", { skipAuthRedirect: true });
    return user;
  } catch (e) {
    return null;
  }
}

/** Call at the top of protected pages to redirect guests to login with redirect param. */
async function requireAuth(allowedRoles) {
  try {
    const user = await api("/api/auth/me", { skipAuthRedirect: true });
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      window.location.href = user.role === "ADMIN" ? "admin.html" : "index.html";
      return null;
    }
    renderTopbarUser(user);
    return user;
  } catch (e) {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const returnUrl = encodeURIComponent(currentPage + window.location.search);
    window.location.href = "login.html?redirect=" + returnUrl;
    return null;
  }
}

function renderTopbarUser(user) {
  const el = document.getElementById("topbarUserName");
  const logoutBtn = document.querySelector(".logout-btn");
  const notifBtn = document.getElementById("notifBtn");
  const topbarRight = document.querySelector(".topbar-right");

  if (!topbarRight) return;

  const existingLoginBtn = document.getElementById("topbarLoginBtn");
  if (existingLoginBtn) existingLoginBtn.remove();
  const existingDropdown = document.getElementById("topbarUserDropdown");
  if (existingDropdown) existingDropdown.remove();

  if (user) {
    if (el) {
      el.textContent = user.fullName;
      el.style.display = "inline-block";
    }
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    if (notifBtn) notifBtn.style.display = "inline-flex";
  } else {
    if (el) {
      el.textContent = "";
      el.style.display = "none";
    }
    if (logoutBtn) logoutBtn.style.display = "none";
    if (notifBtn) notifBtn.style.display = "none";

    const loginBtn = document.createElement("button");
    loginBtn.id = "topbarLoginBtn";
    loginBtn.className = "topbar-login-btn";
    loginBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">login</span> Login';
    loginBtn.onclick = function() {
      const currentPage = window.location.pathname.split("/").pop() || "index.html";
      const returnUrl = currentPage + window.location.search;
      showAuthModal({
        title: "Welcome to Desk2Dine",
        subtitle: "Log in to place orders, track delivery & manage your account",
        redirectUrl: returnUrl
      });
    };
    topbarRight.appendChild(loginBtn);
  }
}

async function logout() {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch (e) {
    // even if the call fails, still clear session
  }
  window.location.href = "index.html";
}

// ---------- Auth Modal (Flipkart-style "Login to Continue") ----------
function showAuthModal(options) {
  options = options || {};
  let modal = document.getElementById("authModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "authModal";
    modal.className = "modal-backdrop";
    document.body.appendChild(modal);
  }

  const title = options.title || "Login to continue";
  const subtitle = options.subtitle || "Please sign in to proceed with your order";
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const redirectUrl = options.redirectUrl || (currentPage + window.location.search);

  modal.innerHTML =
    '<div class="modal-card auth-modal-card">' +
      '<button class="modal-close" onclick="closeAuthModal()" title="Close">&times;</button>' +
      '<div class="auth-modal-header">' +
        '<div class="auth-modal-brand"><span class="material-symbols-outlined">restaurant</span> Desk2Dine</div>' +
        '<h2>' + escapeHtml(title) + '</h2>' +
        '<p>' + escapeHtml(subtitle) + '</p>' +
      '</div>' +
      '<div class="auth-modal-tabs">' +
        '<button class="auth-tab active" id="authTabLogin" onclick="switchAuthTab(\'login\')">Login</button>' +
        '<button class="auth-tab" id="authTabSignup" onclick="switchAuthTab(\'signup\')">Create Account</button>' +
      '</div>' +
      '<div class="auth-modal-body">' +
        '<form id="modalLoginForm">' +
          '<div class="field">' +
            '<label for="modalLoginEmail">Email</label>' +
            '<input type="email" id="modalLoginEmail" placeholder="you@college.edu" autocomplete="username" required>' +
          '</div>' +
          '<div class="field">' +
            '<label for="modalLoginPassword">Password</label>' +
            '<input type="password" id="modalLoginPassword" placeholder="Your password" autocomplete="current-password" required>' +
          '</div>' +
          '<div style="text-align:right; margin:-6px 0 14px;">' +
            '<a href="forgot-password.html" style="font-size:13px;color:var(--fk-blue);">Forgot password?</a>' +
          '</div>' +
          '<button type="submit" class="btn btn-primary btn-block" id="modalLoginBtn">' +
            '<span class="material-symbols-outlined">login</span> Log In' +
          '</button>' +
        '</form>' +
        '<form id="modalSignupForm" style="display:none;">' +
          '<div class="field">' +
            '<label for="modalSignupName">Full Name</label>' +
            '<input type="text" id="modalSignupName" placeholder="Dr. John Doe" required>' +
          '</div>' +
          '<div class="field">' +
            '<label for="modalSignupEmail">Email</label>' +
            '<input type="email" id="modalSignupEmail" placeholder="you@college.edu" required>' +
          '</div>' +
          '<div class="field">' +
            '<label for="modalSignupMobile">Mobile Number</label>' +
            '<input type="tel" id="modalSignupMobile" placeholder="10-digit mobile" required>' +
          '</div>' +
          '<div class="field">' +
            '<label for="modalSignupPassword">Password</label>' +
            '<input type="password" id="modalSignupPassword" placeholder="Min 8 chars with upper, lower, num & special" required>' +
          '</div>' +
          '<div class="field">' +
            '<label for="modalSignupConfirmPassword">Confirm Password</label>' +
            '<input type="password" id="modalSignupConfirmPassword" placeholder="Re-enter password" required>' +
          '</div>' +
          '<button type="submit" class="btn btn-primary btn-block" id="modalSignupBtn">' +
            '<span class="material-symbols-outlined">person_add</span> Create Account' +
          '</button>' +
        '</form>' +
      '</div>' +
      '<div class="auth-modal-footer">' +
        '<button type="button" class="btn-link" onclick="closeAuthModal()">Continue browsing as Guest</button>' +
      '</div>' +
    '</div>';

  modal.classList.add("show");

  const loginForm = document.getElementById("modalLoginForm");
  loginForm.onsubmit = async function(e) {
    e.preventDefault();
    const email = document.getElementById("modalLoginEmail").value.trim();
    const password = document.getElementById("modalLoginPassword").value;
    const btn = document.getElementById("modalLoginBtn");
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Logging in...';
    try {
      const user = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email, password: password })
      });
      showToast("Welcome back, " + user.fullName + "!");
      closeAuthModal();
      renderTopbarUser(user);
      if (typeof options.onSuccess === "function") {
        options.onSuccess(user);
      } else if (user.role === "ADMIN") {
        window.location.href = "admin.html";
      } else if (redirectUrl && redirectUrl !== "login.html") {
        window.location.href = redirectUrl;
      } else {
        window.location.reload();
      }
    } catch (err) {
      showToast(err.message, true);
      btn.disabled = false;
      btn.innerHTML = '<span class="material-symbols-outlined">login</span> Log In';
    }
  };

  const signupForm = document.getElementById("modalSignupForm");
  signupForm.onsubmit = async function(e) {
    e.preventDefault();
    const fullName = document.getElementById("modalSignupName").value.trim();
    const email = document.getElementById("modalSignupEmail").value.trim();
    const mobileNumber = document.getElementById("modalSignupMobile").value.trim();
    const password = document.getElementById("modalSignupPassword").value;
    const confirmPassword = document.getElementById("modalSignupConfirmPassword").value;
    const btn = document.getElementById("modalSignupBtn");

    if (!isValidEmail(email)) { showToast("Enter a valid email address", true); return; }
    if (!isValidMobile(mobileNumber)) { showToast("Enter a valid 10-digit mobile number", true); return; }
    if (!isStrongPassword(password)) { showToast("Password needs upper, lower, number & symbol (min 8 chars)", true); return; }
    if (password !== confirmPassword) { showToast("Passwords do not match", true); return; }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Creating account...';
    try {
      await api("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName,
          email: email,
          mobileNumber: mobileNumber,
          password: password,
          confirmPassword: confirmPassword,
          role: "FACULTY"
        })
      });
      showToast("Account created! Logging you in...");
      const user = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email, password: password })
      });
      closeAuthModal();
      renderTopbarUser(user);
      if (typeof options.onSuccess === "function") {
        options.onSuccess(user);
      } else if (redirectUrl && redirectUrl !== "signup.html") {
        window.location.href = redirectUrl;
      } else {
        window.location.reload();
      }
    } catch (err) {
      showToast(err.message, true);
      btn.disabled = false;
      btn.innerHTML = '<span class="material-symbols-outlined">person_add</span> Create Account';
    }
  };
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.remove("show");
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById("modalLoginForm");
  const signupForm = document.getElementById("modalSignupForm");
  const tabLogin = document.getElementById("authTabLogin");
  const tabSignup = document.getElementById("authTabSignup");
  if (!loginForm || !signupForm) return;
  if (tab === "signup") {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
    tabLogin.classList.remove("active");
    tabSignup.classList.add("active");
  } else {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
    tabSignup.classList.remove("active");
    tabLogin.classList.add("active");
  }
}

// ---------- Food Details Modal (Public) ----------
function showFoodDetailsModal(item) {
  if (!item) return;
  let modal = document.getElementById("foodDetailsModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "foodDetailsModal";
    modal.className = "modal-backdrop";
    document.body.appendChild(modal);
  }

  const imgSrc = item.imageUrl || getFoodImage(item.name, item.categoryName);
  const cart = CartManager.getAll();
  const currentCartQty = cart[item.id] ? cart[item.id].quantity : 0;
  let selectedQty = currentCartQty > 0 ? currentCartQty : 1;
  const isAvailable = item.available !== false;

  modal.innerHTML =
    '<div class="modal-card food-details-card">' +
      '<button class="modal-close" onclick="closeFoodDetailsModal()" title="Close">&times;</button>' +
      '<div class="food-details-grid">' +
        '<div class="food-details-media">' +
          '<img src="' + imgSrc + '" alt="' + escapeHtml(item.name) + '" onerror="handleImageError(this)">' +
          (!isAvailable ? '<span class="food-card-unavailable">Currently Unavailable</span>' : '') +
        '</div>' +
        '<div class="food-details-info">' +
          '<div class="food-details-category">' + escapeHtml(item.categoryName || "Canteen Fresh") + '</div>' +
          '<h2 class="food-details-title">' + escapeHtml(item.name) + '</h2>' +
          '<div class="food-details-price">' + formatMoney(item.price) + '</div>' +
          '<div class="food-details-status ' + (isAvailable ? 'in-stock' : 'out-of-stock') + '">' +
            '<span class="material-symbols-outlined" style="font-size:18px;">' + (isAvailable ? 'check_circle' : 'cancel') + '</span> ' +
            (isAvailable ? 'In Stock & Ready to Order' : 'Currently Unavailable') +
          '</div>' +
          '<div class="food-details-desc">' +
            (item.description ? escapeHtml(item.description) : 'Freshly prepared at the faculty canteen with quality ingredients. Hygienic, fast, and delivered right to your desk or department.') +
          '</div>' +
          (isAvailable ?
            '<div class="food-details-stepper-row">' +
              '<span style="font-weight:500;font-size:14px;color:var(--fk-text-light);">Quantity:</span>' +
              '<div class="qty-control details-qty-control">' +
                '<button class="qty-btn" id="modalQtyMinus">&minus;</button>' +
                '<span class="qty-value" id="modalQtyValue">' + selectedQty + '</span>' +
                '<button class="qty-btn" id="modalQtyPlus">+</button>' +
              '</div>' +
            '</div>' +
            '<div class="food-details-actions">' +
              '<button class="btn btn-primary" id="modalAddToCartBtn">' +
                '<span class="material-symbols-outlined">add_shopping_cart</span> Add to Cart' +
              '</button>' +
              '<button class="btn btn-success" id="modalBuyNowBtn">' +
                '<span class="material-symbols-outlined">bolt</span> Order Now' +
              '</button>' +
            '</div>'
          : '<p style="color:var(--fk-red);font-weight:500;margin-top:16px;">This item is currently out of stock. Please check back later.</p>') +
        '</div>' +
      '</div>' +
    '</div>';

  modal.classList.add("show");

  if (isAvailable) {
    const minusBtn = document.getElementById("modalQtyMinus");
    const plusBtn = document.getElementById("modalQtyPlus");
    const qtyVal = document.getElementById("modalQtyValue");
    const addBtn = document.getElementById("modalAddToCartBtn");
    const buyBtn = document.getElementById("modalBuyNowBtn");

    minusBtn.onclick = function() {
      if (selectedQty > 1) {
        selectedQty--;
        qtyVal.textContent = selectedQty;
      }
    };
    plusBtn.onclick = function() {
      selectedQty++;
      qtyVal.textContent = selectedQty;
    };

    addBtn.onclick = function() {
      CartManager.addItem(item.id, item.name, item.price, imgSrc, selectedQty);
      showToast(item.name + " added to cart!");
      closeFoodDetailsModal();
      if (typeof loadMenu === "function") loadMenu();
      if (typeof renderCart === "function") renderCart();
      if (typeof renderPopularItems === "function") renderPopularItems();
      if (typeof renderRecommendedItems === "function") renderRecommendedItems();
    };

    buyBtn.onclick = function() {
      CartManager.addItem(item.id, item.name, item.price, imgSrc, selectedQty);
      closeFoodDetailsModal();
      window.location.href = "cart.html";
    };
  }
}

function closeFoodDetailsModal() {
  const modal = document.getElementById("foodDetailsModal");
  if (modal) modal.classList.remove("show");
}

// Global modal backdrop and key listeners
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    closeAuthModal();
    closeFoodDetailsModal();
  }
});
document.addEventListener("click", function(e) {
  if (e.target.classList && e.target.classList.contains("modal-backdrop")) {
    e.target.classList.remove("show");
  }
});

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
    var badges = document.querySelectorAll(".cart-badge .badge-count, .topbar-cart-count, .mobile-cart-badge, [data-cart-count]");
    badges.forEach(function(el) {
      el.textContent = count;
      el.style.display = count > 0 ? "flex" : "none";
      el.classList.remove("badge-bounce");
      void el.offsetWidth;
      el.classList.add("badge-bounce");
    });
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { count: count } }));
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
