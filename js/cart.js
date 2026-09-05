let currentUser = null;
let deliveryLocations = [];

async function init() {
  currentUser = await requireAuth(["FACULTY"]);
  if (!currentUser) return;
  await Promise.all([loadLocations(), refreshNotifBadge()]);
  renderCart();
}

async function loadLocations() {
  try {
    deliveryLocations = await api("/api/delivery-locations");
  } catch (e) { showToast(e.message, true); }
}

async function refreshNotifBadge() {
  try {
    const result = await api("/api/notifications/unread-count");
    const badge = document.getElementById("notifBadge");
    if (result.unread > 0) {
      badge.style.display = "flex";
      badge.textContent = result.unread > 9 ? "9+" : result.unread;
    }
  } catch (e) { /* non-critical */ }
}

function renderCart() {
  const container = document.getElementById("cartContent");
  const items = CartManager.getItemsArray();

  if (items.length === 0) {
    container.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-icon"><span class="material-symbols-outlined">shopping_cart</span></div>' +
        '<div class="big">Your cart is empty</div>' +
        '<p>Looks like you haven\'t added any items yet. Explore our delicious menu!</p>' +
        '<a href="faculty.html" class="btn btn-primary" style="margin-top:16px;">' +
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
    return '<div class="cart-page-item" data-id="' + item.id + '">' +
      '<div class="cart-page-item-img">' +
        '<img src="' + (item.img || FOOD_IMAGE_FALLBACK) + '" alt="' + escapeHtml(item.name) + '" onerror="handleImageError(this)">' +
      '</div>' +
      '<div class="cart-page-item-details">' +
        '<div class="cart-page-item-name">' + escapeHtml(item.name) + '</div>' +
        '<div class="cart-page-item-price">' + formatMoney(item.price) + ' each</div>' +
      '</div>' +
      '<div class="cart-page-item-qty">' +
        '<button class="qty-btn" onclick="updateQty(' + item.id + ', -1)">' +
          '<span class="material-symbols-outlined">remove</span>' +
        '</button>' +
        '<span class="qty-value">' + item.quantity + '</span>' +
        '<button class="qty-btn" onclick="updateQty(' + item.id + ', 1)">' +
          '<span class="material-symbols-outlined">add</span>' +
        '</button>' +
      '</div>' +
      '<div class="cart-page-item-subtotal">' + formatMoney(lineTotal) + '</div>' +
      '<button class="cart-page-item-remove" onclick="removeItem(' + item.id + ', this)" title="Remove">' +
        '<span class="material-symbols-outlined">delete_outline</span>' +
      '</button>' +
    '</div>';
  }).join("");

  const locationOptions = deliveryLocations.map(function(loc) {
    return '<option value="' + loc.id + '">' + escapeHtml(loc.name) + (loc.block ? " — " + escapeHtml(loc.block) : "") + '</option>';
  }).join("");

  container.innerHTML =
    '<div class="cart-page-layout">' +
      '<div class="cart-page-items">' +
        '<div class="cart-page-header-row">' +
          '<span>' + totalItems + ' item' + (totalItems > 1 ? 's' : '') + ' in cart</span>' +
          '<button class="btn-link" onclick="clearCart()"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;">delete_sweep</span> Clear Cart</button>' +
        '</div>' +
        rows +
      '</div>' +
      '<div class="cart-page-summary">' +
        '<div class="cart-page-summary-card">' +
          '<h3>Order Summary</h3>' +
          '<div class="cart-page-summary-row"><span>Subtotal (' + totalItems + ' items)</span><span>' + formatMoney(subtotal) + '</span></div>' +
          '<div class="cart-page-summary-row"><span>Delivery</span><span class="success-text">Free</span></div>' +
          '<div class="cart-page-summary-row total"><span>Total</span><span>' + formatMoney(subtotal) + '</span></div>' +
          '<div class="field" style="margin-top:16px;">' +
            '<label for="deliveryLocation"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;">location_on</span> Delivery Location</label>' +
            '<select id="deliveryLocation">' + locationOptions + '</select>' +
          '</div>' +
          '<button class="btn btn-success btn-block" id="placeOrderBtn" onclick="placeOrder()" style="margin-top:16px;">' +
            '<span class="material-symbols-outlined">shopping_cart_checkout</span> Place Order' +
          '</button>' +
          '<a href="faculty.html" class="btn btn-outline btn-block" style="margin-top:8px;">' +
            '<span class="material-symbols-outlined">add_shopping_cart</span> Add More Items' +
          '</a>' +
        '</div>' +
      '</div>' +
    '</div>';
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
    el.style.animation = "fadeOutRight .3s ease forwards";
    setTimeout(function() {
      CartManager.removeItem(id);
      showToast("Item removed from cart");
      renderCart();
    }, 300);
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
  const deliveryLocationId = document.getElementById("deliveryLocation").value;
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
    showToast("Order placed successfully!");
    setTimeout(function(){ window.location.href = "order-details.html?id=" + order.id; }, 600);
  } catch (e) {
    showToast(e.message, true);
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">shopping_cart_checkout</span> Place Order';
  }
}

init();
