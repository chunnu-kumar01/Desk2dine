let currentPage = 0;
const PAGE_SIZE = 10;

function renderSubnav(role) {
  const subnav = document.getElementById("subnav");
  var cartIcon = document.getElementById("cartIcon");
  document.getElementById("portalLabel").textContent = role === "ADMIN" ? "Admin" : "Faculty";
  if (cartIcon) cartIcon.style.display = role === "ADMIN" ? "none" : "";
  if (role === "ADMIN") {
    subnav.innerHTML = '<a href="admin.html"><span class="material-symbols-outlined">dashboard</span> Dashboard</a>' +
      '<a href="notifications.html" class="active"><span class="material-symbols-outlined">notifications</span> Notifications</a>';
  } else {
    subnav.innerHTML =
      '<a href="faculty.html"><span class="material-symbols-outlined">shopping_cart</span> Place Order</a>' +
      '<a href="menu.html"><span class="material-symbols-outlined">restaurant_menu</span> Browse Menu</a>' +
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

async function loadNotifications() {
  try {
    const result = await api("/api/notifications?page=" + currentPage + "&size=" + PAGE_SIZE);
    renderList(result.content);
    renderPagination(document.getElementById("pagination"), result.page, result.totalPages, function(p) { currentPage = p; loadNotifications(); });
  } catch (e) {
    showToast(e.message, true);
  }
}

function renderList(items) {
  const list = document.getElementById("notifList");
  if (!items.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-icon"><span class="material-symbols-outlined">notifications_off</span></div><div class="big">No notifications</div><p>Updates about your orders will show up here.</p></div>';
    return;
  }
  list.innerHTML = items.map(function(n) {
    const icon = n.read ? "notifications" : "notifications_active";
    const color = n.read ? "#94a3b8" : "#ff6b35";
    return '<div class="notif-item ' + (n.read ? "read" : "unread") + '" onclick="markRead(' + n.id + ', this)">' +
      '<div class="notif-icon"><span class="material-symbols-outlined" style="font-size:22px;color:' + color + ';">' + icon + '</span></div>' +
      '<div class="notif-content">' +
        '<div class="notif-title">' + escapeHtml(n.title) + '</div>' +
        '<div class="notif-message">' + escapeHtml(n.message) + '</div>' +
        '<div class="notif-time"><span class="material-symbols-outlined" style="font-size:12px;vertical-align:middle;">schedule</span> ' + formatDateTime(n.createdAt) + '</div>' +
      '</div>' +
    '</div>';
  }).join("");
}

async function markRead(id, el) {
  try {
    await api("/api/notifications/" + id + "/read", { method: "PATCH" });
    el.classList.remove("unread");
    el.classList.add("read");
  } catch (e) { /* non-critical */ }
}

async function markAllRead() {
  try {
    await api("/api/notifications/read-all", { method: "PATCH" });
    showToast("All notifications marked as read");
    loadNotifications();
  } catch (e) {
    showToast(e.message, true);
  }
}

(async function() {
  const user = await requireAuth();
  if (!user) return;
  renderSubnav(user.role);
  renderMobileNav(user.role);
  await loadNotifications();
})();
