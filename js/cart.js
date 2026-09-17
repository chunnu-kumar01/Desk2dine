let currentUser = null;
let deliveryLocations = [];

async function init() {
  currentUser = await getCurrentUser();
  renderTopbarUser(currentUser);
  CartManager.updateBadge();

  await loadLocations();
  if (currentUser) {
    await refreshNotifBadge();
  }
  renderCart();

  window.addEventListener("cartUpdated", function() {
    renderCart();
  });
}

async function loadLocations() {
  try {
    deliveryLocations = await api("/api/delivery-locations");
  } catch (e) {
    console.error("Could not load delivery locations", e);
  }
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

function renderCart() {
  const container = document.getElementById("cartContent");
  if (!container) return;

  const items = CartManager.getItemsArray();

  if (items.length === 0) {
    container.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-icon"><span class="material-symbols-outlined">shopping_cart</span></div>' +
        '<div class="big">Your cart is empty</div>' +
        '<p>Looks like you haven\'t added any items yet. Explore our delicious canteen menu!</p>' +
        '<a href="index.html#completeMenuSection" class="btn btn-primary" style="margin-top:16px;">' +
          '<span class="material-symbols-outlined">restaurant_menu</span> Browse Menu' +
        '</a>' +
      '</div>';
    return;
  }

  let subtotal = 0;
  let totalItems = 0;
  const rows = items.map(function(item) {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;
    totalItems += item.quantity;
    const imgSrc = item.img || (typeof getFoodImage === "function" ? getFoodImage(item.name, "") : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=400&fit=crop&q=80");

    return '<div class="cart-page-item" data-id="' + item.id + '">' +
      '<div class="cart-page-item-img">' +
        '<img src="' + imgSrc + '" alt="' + escapeHtml(item.name) + '" onerror="handleImageError(this)">' +
      '</div>' +
      '<div class="cart-page-item-details">' +
        '<div class="cart-page-item-name">' + escapeHtml(item.name) + '</div>' +
        '<div class="cart-page-item-price">' + formatMoney(item.price) + ' each</div>' +
      '</div>' +
      '<div class="cart-page-item-qty">' +
        '<button class="qty-btn" onclick="updateQty(' + item.id + ', -1)">&minus;</button>' +
        '<span class="qty-value">' + item.quantity + '</span>' +
        '<button class="qty-btn" onclick="updateQty(' + item.id + ', 1)">+</button>' +
      '</div>' +
      '<div class="cart-page-item-subtotal">' + formatMoney(lineTotal) + '</div>' +
      '<button class="cart-page-item-remove" onclick="removeItem(' + item.id + ', this)" title="Remove item">' +
        '<span class="material-symbols-outlined">delete_outline</span>' +
      '</button>' +
    '</div>';
  }).join("");

  const locationOptions = deliveryLocations.map(function(loc) {
    return '<option value="' + loc.id + '">' + escapeHtml(loc.name) + (loc.block ? " — " + escapeHtml(loc.block) : "") + '</option>';
  }).join("");

  let checkoutActionHtml = '';
  if (!currentUser) {
    checkoutActionHtml =
      '<div style="background:#eef4ff;border:1px solid #c7d9fd;border-radius:4px;padding:12px;margin:16px 0;">' +
        '<div style="display:flex;align-items:center;gap:6px;font-weight:700;color:var(--fk-blue);font-size:14px;">' +
          '<span class="material-symbols-outlined" style="font-size:20px;">lock</span> Login to Checkout' +
        '</div>' +
        '<p style="font-size:12px;color:#555;margin:4px 0 0;line-height:1.4;">' +
          'Please login with your faculty account to choose your delivery room/cabin and confirm your order.' +
        '</p>' +
      '</div>' +
      '<button class="btn btn-primary btn-block" onclick="startCheckoutAuth()" style="margin-top:10px;padding:12px 16px;font-size:15px;font-weight:700;">' +
        '<span class="material-symbols-outlined">login</span> Proceed to Checkout' +
      '</button>';
  } else {
    checkoutActionHtml =
      '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;padding:10px 12px;margin:14px 0;">' +
        '<div style="font-size:11px;text-transform:uppercase;color:#15803d;font-weight:700;letter-spacing:0.5px;">Ordering as Faculty</div>' +
        '<div style="font-size:14px;font-weight:700;color:#166534;margin-top:2px;">' + escapeHtml(currentUser.fullName) + '</div>' +
        '<div style="font-size:12px;color:#4b5563;">' + escapeHtml(currentUser.email) + '</div>' +
      '</div>' +
      '<div class="field" style="margin-top:14px;">' +
        '<label for="deliveryLocation"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;">location_on</span> Delivery Location</label>' +
        '<select id="deliveryLocation">' +
          (locationOptions || '<option value="">Default Faculty Cabin</option>') +
        '</select>' +
      '</div>' +
      '<button class="btn btn-success btn-block" id="placeOrderBtn" onclick="placeOrder()" style="margin-top:16px;padding:12px 16px;font-size:15px;font-weight:700;">' +
        '<span class="material-symbols-outlined">shopping_cart_checkout</span> Confirm & Place Order' +
      '</button>';
  }

  container.innerHTML =
    '<div class="cart-page-layout">' +
      '<div class="cart-page-items">' +
        '<div class="cart-page-header-row">' +
          '<span>' + totalItems + ' item' + (totalItems > 1 ? 's' : '') + ' in your cart</span>' +
          '<button class="btn-link" onclick="clearCart()">' +
            '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;">delete_sweep</span> Clear Cart' +
          '</button>' +
        '</div>' +
        rows +
      '</div>' +
      '<div class="cart-page-summary">' +
        '<div class="cart-page-summary-card">' +
          '<h3>Price Details</h3>' +
          '<div class="cart-page-summary-row"><span>Price (' + totalItems + ' items)</span><span>' + formatMoney(subtotal) + '</span></div>' +
          '<div class="cart-page-summary-row"><span>Campus Delivery</span><span class="success-text">FREE</span></div>' +
          '<div class="cart-page-summary-row total"><span>Total Payable</span><span>' + formatMoney(subtotal) + '</span></div>' +
          checkoutActionHtml +
          '<a href="index.html" class="btn btn-outline btn-block" style="margin-top:10px;">' +
            '<span class="material-symbols-outlined">add_shopping_cart</span> Add More Items' +
          '</a>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function startCheckoutAuth() {
  showAuthModal({
    title: "Please login to continue with your order",
    subtitle: "Sign in with your faculty account to confirm delivery location and complete your order.",
    onSuccess: async function(user) {
      currentUser = user;
      renderTopbarUser(currentUser);
      await Promise.all([loadLocations(), refreshNotifBadge()]);
      renderCart();
    },
    redirectUrl: "cart.html"
  });
}

function updateQty(id, delta) {
  const item = CartManager.getItem(id);
  if (!item) return;
  const newQty = item.quantity + delta;
  if (newQty <= 0) {
    CartManager.removeItem(id);
    showToast("Item removed from cart");
  } else {
    CartManager.setQuantity(id, newQty);
  }
  renderCart();
}

function removeItem(id, btn) {
  const el = btn.closest(".cart-page-item");
  if (el) {
    el.style.animation = "fadeOutRight .25s ease forwards";
    setTimeout(function() {
      CartManager.removeItem(id);
      showToast("Item removed from cart");
      renderCart();
    }, 250);
  } else {
    CartManager.removeItem(id);
    renderCart();
  }
}

function clearCart() {
  CartManager.clear();
  showToast("Cart cleared");
  renderCart();
}

async function placeOrder() {
  if (!currentUser) {
    startCheckoutAuth();
    return;
  }

  const deliveryLocationSelect = document.getElementById("deliveryLocation");
  const deliveryLocationId = deliveryLocationSelect ? deliveryLocationSelect.value : "";
  if (!deliveryLocationId) {
    showToast("Please select a delivery location", true);
    return;
  }

  const items = CartManager.getItemsArray();
  if (items.length === 0) {
    showToast("Your cart is empty", true);
    return;
  }

  const btn = document.getElementById("placeOrderBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Placing order...';

  try {
    const order = await api("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        deliveryLocationId: parseInt(deliveryLocationId, 10),
        items: items.map(function(i) { return { menuItemId: i.id, quantity: i.quantity }; })
      })
    });
    CartManager.clear();
    showToast("Order #" + order.id + " placed successfully!");
    setTimeout(function(){
      window.location.href = "order-details.html?id=" + order.id;
    }, 500);
  } catch (e) {
    showToast(e.message, true);
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">shopping_cart_checkout</span> Confirm & Place Order';
  }
}

init();
