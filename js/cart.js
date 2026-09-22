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
    return '<option value="' + loc.id + '">' + escapeHtml(loc.name) + (loc.block ? " \u2014 " + escapeHtml(loc.block) : "") + '</option>';
  }).join("");

  const savingsAmt = subtotal * 0.05;

  container.innerHTML =
    '<div class="cart-layout">' +
      '<div class="cart-main-col">' +

        /* Items card */
        '<div class="cart-card">' +
          '<div class="cart-card-header">' +
            '<span class="material-symbols-outlined" style="color:var(--fk-blue);">shopping_cart</span>' +
            '<span>' + totalItems + ' item' + (totalItems > 1 ? 's' : '') + ' in your cart</span>' +
            '<button class="btn-link" onclick="clearCart()" style="margin-left:auto;font-size:13px;">' +
              '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;">delete_sweep</span> Clear All' +
            '</button>' +
          '</div>' +
          '<div class="cart-card-body" style="padding:0;">' +
            rows +
          '</div>' +
        '</div>' +

        /* Delivery location card — only shown when logged in */
        (currentUser ?
          '<div class="cart-card">' +
            '<div class="cart-card-header">' +
              '<span class="material-symbols-outlined" style="color:var(--fk-blue);">location_on</span> Delivery Location' +
            '</div>' +
            '<div class="cart-card-body">' +
              '<div class="field">' +
                '<select id="deliveryLocation">' +
                  (locationOptions || '<option value="">Default Faculty Cabin</option>') +
                '</select>' +
              '</div>' +
              '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 14px;margin-top:14px;">' +
                '<div style="font-size:11px;text-transform:uppercase;color:#15803d;font-weight:700;letter-spacing:0.5px;">Ordering as</div>' +
                '<div style="font-size:14px;font-weight:700;color:#166534;margin-top:2px;">' + escapeHtml(currentUser.fullName) + '</div>' +
                '<div style="font-size:12px;color:#4b5563;">' + escapeHtml(currentUser.email) + '</div>' +
              '</div>' +
            '</div>' +
          '</div>'
        : '') +

      '</div>' + /* end cart-main-col */

      /* Sticky price summary sidebar */
      '<div class="cart-sidebar-col">' +
        '<div class="price-details-card">' +
          '<div class="price-details-title">Price Details</div>' +
          '<div class="price-row"><span>Price (' + totalItems + ' item' + (totalItems > 1 ? 's' : '') + ')</span><span>' + formatMoney(subtotal) + '</span></div>' +
          '<div class="price-row discount-row"><span>Campus Discount (5%)</span><span>&minus;' + formatMoney(savingsAmt) + '</span></div>' +
          '<div class="price-row delivery-row"><span>Delivery Charges</span><span class="free-tag">FREE</span></div>' +
          '<div class="price-row total-row"><span>Total Payable</span><span>' + formatMoney(subtotal - savingsAmt) + '</span></div>' +
          '<div class="savings-banner">' +
            '<span class="material-symbols-outlined" style="font-size:18px;">savings</span>' +
            'You will save ' + formatMoney(savingsAmt) + ' on this order!' +
          '</div>' +
          (!currentUser ?
            '<div style="background:#eef4ff;border:1px solid #c7d9fd;border-radius:8px;padding:14px;margin:16px 0;">' +
              '<div style="display:flex;align-items:center;gap:6px;font-weight:700;color:var(--fk-blue);font-size:13px;">' +
                '<span class="material-symbols-outlined" style="font-size:18px;">lock</span> Login required' +
              '</div>' +
              '<p style="font-size:12px;color:#555;margin:6px 0 0;line-height:1.4;">Sign in with your faculty account to confirm delivery and place your order.</p>' +
            '</div>' +
            '<button class="cart-checkout-btn" onclick="startCheckoutAuth()">' +
              '<span class="material-symbols-outlined">login</span> Proceed to Checkout' +
            '</button>'
          :
            '<button class="cart-checkout-btn" id="placeOrderBtn" onclick="placeOrder()">' +
              '<span class="material-symbols-outlined">shopping_cart_checkout</span> Place Order' +
            '</button>'
          ) +
          '<a href="index.html" style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:12px;font-size:13px;color:var(--fk-blue);font-weight:600;text-decoration:none;">' +
            '<span class="material-symbols-outlined" style="font-size:16px;">add_shopping_cart</span> Add More Items' +
          '</a>' +
        '</div>' +
      '</div>' +

    '</div>'; /* end cart-layout */
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
