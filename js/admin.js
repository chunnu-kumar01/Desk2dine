/* ==========================================================================
   Tab switching
   ========================================================================== */
const tabs = ["orders", "menu", "categories", "locations", "users", "audit"];
let categoriesCache = [];

document.querySelectorAll(".tab-btn").forEach(function(btn) {
  btn.addEventListener("click", function(){ switchTab(btn.dataset.tab); });
});

function switchTab(tab) {
  document.querySelectorAll(".tab-btn").forEach(function(b){ b.classList.toggle("active", b.dataset.tab === tab); });
  tabs.forEach(function(t) {
    document.getElementById("tab-" + t).style.display = t === tab ? "block" : "none";
  });
  if (tab === "orders") loadOrders();
  if (tab === "menu") loadMenuItems();
  if (tab === "categories") loadCategories();
  if (tab === "locations") loadLocations();
  if (tab === "users") loadUsers();
  if (tab === "audit") loadAuditLogs();
}

/* ==========================================================================
   ORDERS
   ========================================================================== */
let orderPage = 0;
const ORDER_PAGE_SIZE = 10;

async function loadOrders() {
  const status = document.getElementById("orderStatusFilter").value;
  try {
    const result = await api("/api/orders?status=" + status + "&page=" + orderPage + "&size=" + ORDER_PAGE_SIZE);
    renderOrders(result.content);
    renderPagination(document.getElementById("ordersPagination"), result.page, result.totalPages, function(p) { orderPage = p; loadOrders(); });
    loadAdminStats();
  } catch (e) { showToast(e.message, true); }
}

async function loadAdminStats() {
  try {
    const allOrders = await api("/api/orders?status=&page=0&size=1");
    const placed = await api("/api/orders?status=PLACED&page=0&size=1");
    const completed = await api("/api/orders?status=COMPLETED&page=0&size=1");
    document.getElementById("statTotal").textContent = allOrders.totalElements || 0;
    document.getElementById("statPlaced").textContent = placed.totalElements || 0;
    document.getElementById("statCompleted").textContent = completed.totalElements || 0;
    document.getElementById("statRevenue").textContent = "₹" + (allOrders.totalElements * 150 || 0);
  } catch (e) { /* non-critical */ }
}

function itemsSummary(order) {
  return order.items.map(function(i){ return escapeHtml(i.itemName) + " ×" + i.quantity; }).join(", ");
}

function renderOrders(orders) {
  const wrap = document.getElementById("ordersWrap");
  if (!orders.length) {
    wrap.innerHTML = '<div class="empty"><span class="material-symbols-outlined">receipt_long</span><div class="big">No orders</div></div>';
    return;
  }
  const rows = orders.map(function(order) {
    var actionBtn = "";
    if (order.status === "PLACED") actionBtn = '<button class="btn btn-primary btn-sm" onclick="markDelivered(' + order.id + ')"><span class="material-symbols-outlined">local_shipping</span> Deliver</button>';
    else if (order.status === "DELIVERED") actionBtn = '<button class="btn btn-outline btn-sm" onclick="markReceived(' + order.id + ')"><span class="material-symbols-outlined">done_all</span> Receive</button>';
    else if (order.status === "RECEIVED") actionBtn = '<button class="btn btn-success btn-sm" onclick="generateBill(' + order.id + ')"><span class="material-symbols-outlined">receipt</span> Generate Bill</button>';
    else if (order.status === "PAID") actionBtn = '<button class="btn btn-primary btn-sm" onclick="markCompleted(' + order.id + ')"><span class="material-symbols-outlined">check_circle</span> Complete</button>';
    return '<tr>' +
        '<td>#' + order.id + '</td>' +
        '<td>' + escapeHtml(order.facultyName) + '</td>' +
        '<td>' + itemsSummary(order) + '</td>' +
        '<td>' + escapeHtml(order.deliveryLocationName) + '</td>' +
        '<td>' + formatMoney(order.totalAmount) + '</td>' +
        '<td><span class="status-pill ' + order.status + '">' + order.status + '</span></td>' +
        '<td class="actions-cell">' +
          '<a class="btn btn-outline btn-sm" href="order-details.html?id=' + order.id + '"><span class="material-symbols-outlined">visibility</span> View</a>' +
          actionBtn +
        '</td>' +
      '</tr>';
  }).join("");
  wrap.innerHTML = '<div class="table-wrap"><table>' +
      '<thead><tr><th>ID</th><th>Faculty</th><th>Items</th><th>Location</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
}

async function markDelivered(id) { await runOrderAction("/api/orders/" + id + "/deliver", "Marked as delivered"); }
async function markReceived(id) { await runOrderAction("/api/orders/" + id + "/receive", "Marked as received"); }
async function generateBill(id) { await runOrderAction("/api/orders/" + id + "/bill", "Bill generated"); }
async function markCompleted(id) { await runOrderAction("/api/orders/" + id + "/complete", "Order completed"); }

async function runOrderAction(path, successMessage) {
  try {
    await api(path, { method: "PATCH" });
    showToast(successMessage);
    loadOrders();
  } catch (e) { showToast(e.message, true); }
}

document.getElementById("orderStatusFilter").addEventListener("change", function() { orderPage = 0; loadOrders(); });

/* ==========================================================================
   MENU ITEMS
   ========================================================================== */
let menuPage = 0;
const MENU_PAGE_SIZE = 10;

async function loadCategoriesIntoSelects() {
  try {
    categoriesCache = await api("/api/categories");
    var filterSelect = document.getElementById("menuCategoryFilter");
    filterSelect.innerHTML = '<option value="">All</option>' +
        categoriesCache.map(function(c){ return '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>'; }).join("");
    var formSelect = document.getElementById("miCategory");
    formSelect.innerHTML = categoriesCache.map(function(c){ return '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>'; }).join("");
  } catch (e) { showToast(e.message, true); }
}

async function loadMenuItems() {
  if (categoriesCache.length === 0) await loadCategoriesIntoSelects();
  var search = document.getElementById("menuSearch").value.trim();
  var categoryId = document.getElementById("menuCategoryFilter").value;
  try {
    var result = await api("/api/menu-items?search=" + encodeURIComponent(search) + "&categoryId=" + categoryId + "&page=" + menuPage + "&size=" + MENU_PAGE_SIZE);
    renderMenuItems(result.content);
    renderPagination(document.getElementById("menuItemsPagination"), result.page, result.totalPages, function(p) { menuPage = p; loadMenuItems(); });
  } catch (e) { showToast(e.message, true); }
}

function renderMenuItems(items) {
  var wrap = document.getElementById("menuItemsWrap");
  if (!items.length) {
    wrap.innerHTML = '<div class="empty"><span class="material-symbols-outlined">restaurant_menu</span><div class="big">No menu items</div></div>';
    return;
  }
  var rows = items.map(function(item) {
    return '<tr>' +
      '<td>' + escapeHtml(item.name) + '</td>' +
      '<td>' + escapeHtml(item.categoryName) + '</td>' +
      '<td>' + formatMoney(item.price) + '</td>' +
      '<td>' + (item.available ? "Yes" : "No") + '</td>' +
      '<td class="actions-cell">' +
        '<button class="btn btn-outline btn-sm" onclick="editMenuItem(' + JSON.stringify(item).replace(/'/g, "&apos;") + ')"><span class="material-symbols-outlined">edit</span> Edit</button>' +
        '<button class="btn btn-danger btn-sm" onclick="deleteMenuItem(' + item.id + ')"><span class="material-symbols-outlined">delete</span> Delete</button>' +
      '</td>' +
    '</tr>';
  }).join("");
  wrap.innerHTML = '<div class="table-wrap"><table>' +
      '<thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Available</th><th>Action</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
}

function openMenuItemForm() {
  document.getElementById("menuItemFormTitle").textContent = "Add Menu Item";
  document.getElementById("menuItemForm").reset();
  document.getElementById("menuItemId").value = "";
  document.getElementById("menuItemFormPanel").style.display = "block";
  setTimeout(function(){ document.getElementById("menuItemFormPanel").scrollIntoView({ behavior: "smooth" }); }, 100);
}

function editMenuItem(item) {
  document.getElementById("menuItemFormTitle").textContent = "Edit Menu Item";
  document.getElementById("menuItemId").value = item.id;
  document.getElementById("miName").value = item.name;
  document.getElementById("miCategory").value = item.categoryId;
  document.getElementById("miPrice").value = item.price;
  document.getElementById("miAvailable").value = String(item.available);
  document.getElementById("miDescription").value = item.description || "";
  document.getElementById("menuItemFormPanel").style.display = "block";
  document.getElementById("menuItemFormPanel").scrollIntoView({ behavior: "smooth" });
}

function closeMenuItemForm() {
  document.getElementById("menuItemFormPanel").style.display = "none";
}

document.getElementById("menuItemForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  var id = document.getElementById("menuItemId").value;
  var payload = {
    categoryId: parseInt(document.getElementById("miCategory").value, 10),
    name: document.getElementById("miName").value.trim(),
    description: document.getElementById("miDescription").value.trim(),
    price: parseFloat(document.getElementById("miPrice").value),
    available: document.getElementById("miAvailable").value === "true"
  };
  if (!payload.name || !payload.price || payload.price <= 0) {
    showToast("Please enter a valid name and price", true);
    return;
  }
  var btn = document.getElementById("menuItemSaveBtn");
  btn.disabled = true;
  try {
    if (id) {
      await api("/api/menu-items/" + id, { method: "PUT", body: JSON.stringify(payload) });
      showToast("Menu item updated");
    } else {
      await api("/api/menu-items", { method: "POST", body: JSON.stringify(payload) });
      showToast("Menu item created");
    }
    closeMenuItemForm();
    loadMenuItems();
  } catch (e) { showToast(e.message, true); }
  finally { btn.disabled = false; }
});

async function deleteMenuItem(id) {
  if (!confirm("Delete this menu item? This cannot be undone.")) return;
  try {
    await api("/api/menu-items/" + id, { method: "DELETE" });
    showToast("Menu item deleted");
    loadMenuItems();
  } catch (e) { showToast(e.message, true); }
}

document.getElementById("menuSearch").addEventListener("input", debounce(function() { menuPage = 0; loadMenuItems(); }, 350));
document.getElementById("menuCategoryFilter").addEventListener("change", function() { menuPage = 0; loadMenuItems(); });

function debounce(fn, delay) {
  var timer;
  return function(){ clearTimeout(timer); timer = setTimeout(function(){ fn(); }, delay); };
}

/* ==========================================================================
   CATEGORIES
   ========================================================================== */
async function loadCategories() {
  try {
    var categories = await api("/api/categories");
    categoriesCache = categories;
    renderCategories(categories);
  } catch (e) { showToast(e.message, true); }
}

function renderCategories(categories) {
  var wrap = document.getElementById("categoriesWrap");
  if (!categories.length) {
    wrap.innerHTML = '<div class="empty"><span class="material-symbols-outlined">category</span><div class="big">No categories yet</div></div>';
    return;
  }
  var rows = categories.map(function(c) {
    return '<tr>' +
      '<td>' + escapeHtml(c.name) + '</td>' +
      '<td>' + escapeHtml(c.description || "") + '</td>' +
      '<td class="actions-cell">' +
        '<button class="btn btn-outline btn-sm" onclick="editCategory(' + JSON.stringify(c).replace(/'/g, "&apos;") + ')"><span class="material-symbols-outlined">edit</span> Edit</button>' +
        '<button class="btn btn-danger btn-sm" onclick="deleteCategory(' + c.id + ')"><span class="material-symbols-outlined">delete</span> Delete</button>' +
      '</td>' +
    '</tr>';
  }).join("");
  wrap.innerHTML = '<div class="table-wrap"><table>' +
      '<thead><tr><th>Name</th><th>Description</th><th>Action</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
}

function openCategoryForm() {
  document.getElementById("categoryFormTitle").textContent = "Add Category";
  document.getElementById("categoryForm").reset();
  document.getElementById("categoryId").value = "";
  document.getElementById("categoryFormPanel").style.display = "block";
}
function editCategory(c) {
  document.getElementById("categoryFormTitle").textContent = "Edit Category";
  document.getElementById("categoryId").value = c.id;
  document.getElementById("catName").value = c.name;
  document.getElementById("catDescription").value = c.description || "";
  document.getElementById("categoryFormPanel").style.display = "block";
  document.getElementById("categoryFormPanel").scrollIntoView({ behavior: "smooth" });
}
function closeCategoryForm() { document.getElementById("categoryFormPanel").style.display = "none"; }

document.getElementById("categoryForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  var id = document.getElementById("categoryId").value;
  var payload = {
    name: document.getElementById("catName").value.trim(),
    description: document.getElementById("catDescription").value.trim()
  };
  if (!payload.name) { showToast("Category name is required", true); return; }
  try {
    if (id) {
      await api("/api/categories/" + id, { method: "PUT", body: JSON.stringify(payload) });
      showToast("Category updated");
    } else {
      await api("/api/categories", { method: "POST", body: JSON.stringify(payload) });
      showToast("Category created");
    }
    closeCategoryForm();
    loadCategories();
  } catch (e) { showToast(e.message, true); }
});

async function deleteCategory(id) {
  if (!confirm("Delete this category? Menu items using it must be removed first.")) return;
  try {
    await api("/api/categories/" + id, { method: "DELETE" });
    showToast("Category deleted");
    loadCategories();
  } catch (e) { showToast(e.message, true); }
}

/* ==========================================================================
   DELIVERY LOCATIONS
   ========================================================================== */
async function loadLocations() {
  try {
    var locations = await api("/api/delivery-locations?includeInactive=true");
    renderLocations(locations);
  } catch (e) { showToast(e.message, true); }
}

function renderLocations(locations) {
  var wrap = document.getElementById("locationsWrap");
  if (!locations.length) {
    wrap.innerHTML = '<div class="empty"><span class="material-symbols-outlined">location_on</span><div class="big">No delivery locations yet</div></div>';
    return;
  }
  var rows = locations.map(function(loc) {
    return '<tr>' +
      '<td>' + escapeHtml(loc.name) + '</td>' +
      '<td>' + escapeHtml(loc.block || "") + '</td>' +
      '<td>' + escapeHtml(loc.floor || "") + '</td>' +
      '<td class="actions-cell">' +
        '<button class="btn btn-outline btn-sm" onclick="editLocation(' + JSON.stringify(loc).replace(/'/g, "&apos;") + ')"><span class="material-symbols-outlined">edit</span> Edit</button>' +
        '<button class="btn btn-danger btn-sm" onclick="deleteLocation(' + loc.id + ')"><span class="material-symbols-outlined">delete</span> Delete</button>' +
      '</td>' +
    '</tr>';
  }).join("");
  wrap.innerHTML = '<div class="table-wrap"><table>' +
      '<thead><tr><th>Name</th><th>Block</th><th>Floor</th><th>Action</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
}

function openLocationForm() {
  document.getElementById("locationFormTitle").textContent = "Add Location";
  document.getElementById("locationForm").reset();
  document.getElementById("locationId").value = "";
  document.getElementById("locationFormPanel").style.display = "block";
}
function editLocation(loc) {
  document.getElementById("locationFormTitle").textContent = "Edit Location";
  document.getElementById("locationId").value = loc.id;
  document.getElementById("locName").value = loc.name;
  document.getElementById("locBlock").value = loc.block || "";
  document.getElementById("locFloor").value = loc.floor || "";
  document.getElementById("locationFormPanel").style.display = "block";
  document.getElementById("locationFormPanel").scrollIntoView({ behavior: "smooth" });
}
function closeLocationForm() { document.getElementById("locationFormPanel").style.display = "none"; }

document.getElementById("locationForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  var id = document.getElementById("locationId").value;
  var payload = {
    name: document.getElementById("locName").value.trim(),
    block: document.getElementById("locBlock").value.trim(),
    floor: document.getElementById("locFloor").value.trim()
  };
  if (!payload.name) { showToast("Location name is required", true); return; }
  try {
    if (id) {
      await api("/api/delivery-locations/" + id, { method: "PUT", body: JSON.stringify(payload) });
      showToast("Location updated");
    } else {
      await api("/api/delivery-locations", { method: "POST", body: JSON.stringify(payload) });
      showToast("Location created");
    }
    closeLocationForm();
    loadLocations();
  } catch (e) { showToast(e.message, true); }
});

async function deleteLocation(id) {
  if (!confirm("Delete this delivery location?")) return;
  try {
    await api("/api/delivery-locations/" + id, { method: "DELETE" });
    showToast("Location deleted");
    loadLocations();
  } catch (e) { showToast(e.message, true); }
}

/* ==========================================================================
   USERS (read-only browse)
   ========================================================================== */
let userPage = 0;
const USER_PAGE_SIZE = 10;

async function loadUsers() {
  var search = document.getElementById("userSearch").value.trim();
  var role = document.getElementById("userRoleFilter").value;
  try {
    var result = await api("/api/admin/users?search=" + encodeURIComponent(search) + "&role=" + role + "&page=" + userPage + "&size=" + USER_PAGE_SIZE);
    renderUsers(result.content);
    renderPagination(document.getElementById("usersPagination"), result.page, result.totalPages, function(p) { userPage = p; loadUsers(); });
  } catch (e) { showToast(e.message, true); }
}

function renderUsers(users) {
  var wrap = document.getElementById("usersWrap");
  if (!users.length) {
    wrap.innerHTML = '<div class="empty"><span class="material-symbols-outlined">group</span><div class="big">No users found</div></div>';
    return;
  }
  var rows = users.map(function(u) {
    return '<tr>' +
      '<td>' + escapeHtml(u.fullName) + '</td>' +
      '<td>' + escapeHtml(u.email) + '</td>' +
      '<td>' + escapeHtml(u.mobileNumber) + '</td>' +
      '<td><span class="status-pill" style="background:' + (u.role === "ADMIN" ? "linear-gradient(135deg,#8b5cf6,#7c3aed)" : "linear-gradient(135deg,#4f6ef7,#6366f1)") + ';">' + u.role + '</span></td>' +
      '<td>' + formatDateTime(u.createdAt) + '</td>' +
    '</tr>';
  }).join("");
  wrap.innerHTML = '<div class="table-wrap"><table>' +
      '<thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Role</th><th>Joined</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
}

document.getElementById("userSearch").addEventListener("input", debounce(function() { userPage = 0; loadUsers(); }, 350));
document.getElementById("userRoleFilter").addEventListener("change", function() { userPage = 0; loadUsers(); });

/* ==========================================================================
   AUDIT LOGS (read-only)
   ========================================================================== */
let auditPage = 0;
const AUDIT_PAGE_SIZE = 15;

async function loadAuditLogs() {
  var action = document.getElementById("auditActionFilter").value;
  try {
    var result = await api("/api/audit-logs?action=" + action + "&page=" + auditPage + "&size=" + AUDIT_PAGE_SIZE);
    renderAuditLogs(result.content);
    renderPagination(document.getElementById("auditPagination"), result.page, result.totalPages, function(p) { auditPage = p; loadAuditLogs(); });
  } catch (e) { showToast(e.message, true); }
}

function renderAuditLogs(logs) {
  var wrap = document.getElementById("auditWrap");
  if (!logs.length) {
    wrap.innerHTML = '<div class="empty"><span class="material-symbols-outlined">history</span><div class="big">No audit entries</div></div>';
    return;
  }
  var rows = logs.map(function(l) {
    return '<tr>' +
      '<td>' + formatDateTime(l.createdAt) + '</td>' +
      '<td>' + escapeHtml(l.userName || "system") + '</td>' +
      '<td><span class="status-pill">' + escapeHtml(l.action) + '</span></td>' +
      '<td>' + escapeHtml(l.entityType || "") + (l.entityId ? " #" + l.entityId : "") + '</td>' +
      '<td>' + escapeHtml(l.details || "") + '</td>' +
    '</tr>';
  }).join("");
  wrap.innerHTML = '<div class="table-wrap"><table>' +
      '<thead><tr><th>When</th><th>User</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
}

document.getElementById("auditActionFilter").addEventListener("change", function() { auditPage = 0; loadAuditLogs(); });

/* ==========================================================================
   Init
   ========================================================================== */
async function refreshNotifBadge() {
  try {
    var result = await api("/api/notifications/unread-count");
    var badge = document.getElementById("notifBadge");
    if (result.unread > 0) { badge.style.display = "flex"; badge.textContent = result.unread > 9 ? "9+" : result.unread; }
  } catch (e) { /* non-critical */ }
}

(async function() {
  var user = await requireAuth(["ADMIN"]);
  if (!user) return;
  await refreshNotifBadge();
  await loadOrders();
})();
