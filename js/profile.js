function renderSubnav(role) {
  const subnav = document.getElementById("subnav");
  var cartIcon = document.getElementById("cartIcon");
  document.getElementById("portalLabel").textContent = role === "ADMIN" ? "Admin" : "Faculty";
  if (cartIcon) cartIcon.style.display = role === "ADMIN" ? "none" : "";
  if (role === "ADMIN") {
    subnav.innerHTML = '<a href="admin.html"><span class="material-symbols-outlined">dashboard</span> Dashboard</a>' +
      '<a href="profile.html" class="active"><span class="material-symbols-outlined">person</span> Profile</a>';
  } else {
    subnav.innerHTML =
      '<a href="faculty.html"><span class="material-symbols-outlined">shopping_cart</span> Place Order</a>' +
      '<a href="menu.html"><span class="material-symbols-outlined">restaurant_menu</span> Browse Menu</a>' +
      '<a href="favourites.html"><span class="material-symbols-outlined">favorite</span> Favourites</a>' +
      '<a href="cart.html"><span class="material-symbols-outlined">shopping_cart</span> Cart</a>' +
      '<a href="my-orders.html"><span class="material-symbols-outlined">receipt_long</span> My Orders</a>' +
      '<a href="profile.html" class="active"><span class="material-symbols-outlined">person</span> Profile</a>';
  }
}

function renderMobileNav(role) {
  var nav = document.getElementById("mobileNav");
  if (!nav) return;
  if (role === "ADMIN") {
    nav.innerHTML = '<div class="mobile-nav-inner">' +
      '<a href="admin.html" class="mobile-nav-item"><span class="material-symbols-outlined">dashboard</span><span>Dashboard</span></a>' +
      '<a href="menu.html" class="mobile-nav-item"><span class="material-symbols-outlined">restaurant_menu</span><span>Menu</span></a>' +
      '<a href="profile.html" class="mobile-nav-item active"><span class="material-symbols-outlined">person</span><span>Profile</span></a>' +
      '</div>';
  } else {
    nav.innerHTML = '<div class="mobile-nav-inner">' +
      '<a href="faculty.html" class="mobile-nav-item"><span class="material-symbols-outlined">shopping_cart</span><span>Order</span></a>' +
      '<a href="menu.html" class="mobile-nav-item"><span class="material-symbols-outlined">restaurant_menu</span><span>Menu</span></a>' +
      '<a href="cart.html" class="mobile-nav-item"><span class="material-symbols-outlined">shopping_cart</span><span>Cart</span></a>' +
      '<a href="my-orders.html" class="mobile-nav-item"><span class="material-symbols-outlined">receipt_long</span><span>Orders</span></a>' +
      '<a href="profile.html" class="mobile-nav-item active"><span class="material-symbols-outlined">person</span><span>Profile</span></a>' +
      '</div>';
  }
}

function renderProfileMenu(role) {
  var menu = document.getElementById("profileMenu");
  if (!menu) return;
  var html = '';
  if (role === "FACULTY") {
    html += '<a href="my-orders.html" class="profile-menu-item"><div class="menu-icon blue"><span class="material-symbols-outlined">receipt_long</span></div><div class="menu-text"><div class="menu-title">My Orders</div><div class="menu-desc">View order history and tracking</div></div><span class="material-symbols-outlined menu-arrow">chevron_right</span></a>';
    html += '<a href="favourites.html" class="profile-menu-item"><div class="menu-icon orange"><span class="material-symbols-outlined">favorite</span></div><div class="menu-text"><div class="menu-title">Favourites</div><div class="menu-desc">Your saved food items</div></div><span class="material-symbols-outlined menu-arrow">chevron_right</span></a>';
    html += '<a href="menu.html" class="profile-menu-item"><div class="menu-icon purple"><span class="material-symbols-outlined">restaurant_menu</span></div><div class="menu-text"><div class="menu-title">Browse Menu</div><div class="menu-desc">Explore canteen food items</div></div><span class="material-symbols-outlined menu-arrow">chevron_right</span></a>';
  } else {
    html += '<a href="admin.html" class="profile-menu-item"><div class="menu-icon blue"><span class="material-symbols-outlined">dashboard</span></div><div class="menu-text"><div class="menu-title">Admin Dashboard</div><div class="menu-desc">Manage orders, menu, and users</div></div><span class="material-symbols-outlined menu-arrow">chevron_right</span></a>';
  }
  html += '<a href="notifications.html" class="profile-menu-item"><div class="menu-icon green"><span class="material-symbols-outlined">notifications</span></div><div class="menu-text"><div class="menu-title">Notifications</div><div class="menu-desc">Order updates and alerts</div></div><span class="material-symbols-outlined menu-arrow">chevron_right</span></a>';
  html += '<div class="profile-menu-item" onclick="openEditModal()"><div class="menu-icon blue"><span class="material-symbols-outlined">person</span></div><div class="menu-text"><div class="menu-title">Personal Information</div><div class="menu-desc">Update your name and phone</div></div><span class="material-symbols-outlined menu-arrow">chevron_right</span></div>';
  html += '<div class="profile-menu-item" onclick="document.getElementById(\'passwordSection\').scrollIntoView({behavior:\'smooth\'})"><div class="menu-icon green"><span class="material-symbols-outlined">lock</span></div><div class="menu-text"><div class="menu-title">Security</div><div class="menu-desc">Change your password</div></div><span class="material-symbols-outlined menu-arrow">chevron_right</span></div>';
  html += '<div class="profile-menu-item" onclick="logout()"><div class="menu-icon red"><span class="material-symbols-outlined">logout</span></div><div class="menu-text"><div class="menu-title">Log Out</div><div class="menu-desc">Sign out of your account</div></div><span class="material-symbols-outlined menu-arrow">chevron_right</span></div>';
  menu.innerHTML = html;
}

async function loadProfile() {
  try {
    const user = await api("/api/profile");
    document.getElementById("profileName").textContent = user.fullName;
    document.getElementById("profileEmail").textContent = user.email;
    document.getElementById("profileRole").innerHTML =
      '<span class="material-symbols-outlined" style="font-size:14px;">badge</span> ' + user.role;
    document.getElementById("fullName").value = user.fullName;
    document.getElementById("email").value = user.email;
    document.getElementById("mobileNumber").value = user.mobileNumber;
    document.getElementById("role").value = user.role;
    document.getElementById("topbarUserName").textContent = user.fullName;
    loadStats();
  } catch (e) {
    showToast(e.message, true);
  }
}

async function loadStats() {
  try {
    const all = await api("/api/orders/mine?status=&page=0&size=1");
    const completed = await api("/api/orders/mine?status=COMPLETED&page=0&size=1");
    const pending = await api("/api/orders/mine?status=PLACED&page=0&size=1");
    const paid = await api("/api/orders/mine?status=PAID&page=0&size=1");

    animateCounter("statTotalOrders", all.totalElements || 0);
    animateCounter("statCompleted", completed.totalElements || 0);
    animateCounter("statPending", (pending.totalElements || 0) + (paid.totalElements || 0));
    document.getElementById("statSpending").textContent = "₹" + ((all.totalElements || 0) * 120);
  } catch (e) { /* non-critical */ }
}

function animateCounter(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 20));
  const interval = setInterval(function() {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    el.textContent = current;
  }, 30);
}

async function refreshNotifBadge() {
  try {
    const result = await api("/api/notifications/unread-count");
    const badge = document.getElementById("notifBadge");
    if (result.unread > 0) { badge.style.display = "flex"; badge.textContent = result.unread > 9 ? "9+" : result.unread; }
  } catch (e) { /* non-critical */ }
}

function openEditModal() {
  document.getElementById("editModal").classList.add("show");
}

function closeEditModal() {
  document.getElementById("editModal").classList.remove("show");
}

async function saveProfile() {
  const fullName = document.getElementById("fullName").value.trim();
  const mobileNumber = document.getElementById("mobileNumber").value.trim();

  if (!fullName) { showToast("Full name is required", true); return; }
  if (!isValidMobile(mobileNumber)) { showToast("Enter a valid mobile number", true); return; }

  const btn = document.getElementById("saveProfileBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving...';
  try {
    await api("/api/profile", { method: "PUT", body: JSON.stringify({ fullName: fullName, mobileNumber: mobileNumber }) });
    showToast("Profile updated successfully");
    document.getElementById("topbarUserName").textContent = fullName;
    document.getElementById("profileName").textContent = fullName;
    closeEditModal();
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">save</span> Save Changes';
  }
}

document.getElementById("passwordForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const form = e.target;
  clearFieldErrors(form);

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  let hasError = false;
  if (!currentPassword) { setFieldError("currentPassword", "Current password is required"); hasError = true; }
  if (!isStrongPassword(newPassword)) {
    setFieldError("newPassword", "Min 8 chars with upper, lower, number & special character");
    hasError = true;
  }
  if (newPassword !== confirmPassword) { setFieldError("confirmPassword", "Passwords do not match"); hasError = true; }
  if (hasError) return;

  const btn = document.getElementById("changePasswordBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Updating...';
  try {
    await api("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword, confirmPassword: confirmPassword })
    });
    showToast("Password changed successfully");
    form.reset();
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">key</span> Change Password';
  }
});

document.getElementById("editModal").addEventListener("click", function(e) {
  if (e.target === this) closeEditModal();
});

(async function() {
  const user = await requireAuth();
  if (!user) return;
  renderSubnav(user.role);
  renderMobileNav(user.role);
  renderProfileMenu(user.role);
  await loadProfile();
  await refreshNotifBadge();
})();
