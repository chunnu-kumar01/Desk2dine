let currentUser = null;

function getOrderIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

function renderSubnav(role) {
  const subnav = document.getElementById("subnav");
  document.getElementById("portalLabel").textContent = role === "ADMIN" ? "Admin" : "Faculty";
  if (role === "ADMIN") {
    subnav.innerHTML =
      '<a href="admin.html"><span class="material-symbols-outlined">dashboard</span> Dashboard</a>' +
      '<a href="my-orders.html"><span class="material-symbols-outlined">receipt_long</span> Back to Orders</a>';
  } else {
    subnav.innerHTML =
      '<a href="faculty.html"><span class="material-symbols-outlined">shopping_cart</span> Place Order</a>' +
      '<a href="menu.html"><span class="material-symbols-outlined">restaurant_menu</span> Browse Menu</a>' +
      '<a href="favourites.html"><span class="material-symbols-outlined">favorite</span> Favourites</a>' +
      '<a href="cart.html"><span class="material-symbols-outlined">shopping_cart</span> Cart</a>' +
      '<a href="my-orders.html" class="active"><span class="material-symbols-outlined">receipt_long</span> My Orders</a>' +
      '<a href="profile.html"><span class="material-symbols-outlined">person</span> Profile</a>';
  }
}

function getStatusTimeline(status) {
  const steps = [
    { key: "PLACED", label: "Order Placed", icon: "shopping_cart" },
    { key: "DELIVERED", label: "Delivered", icon: "local_shipping" },
    { key: "RECEIVED", label: "Received", icon: "done_all" },
    { key: "BILLED", label: "Bill Generated", icon: "receipt" },
    { key: "PAID", label: "Payment Done", icon: "payments" },
    { key: "COMPLETED", label: "Completed", icon: "check_circle" }
  ];
  const statusOrder = ["PLACED", "DELIVERED", "RECEIVED", "BILLED", "PAID", "COMPLETED"];
  const currentIdx = statusOrder.indexOf(status);
  
  return '<div class="timeline">' + steps.map(function(step, i) {
    let stepClass = "";
    if (i < currentIdx) stepClass = "completed";
    else if (i === currentIdx) stepClass = "active";
    return '<div class="timeline-step ' + stepClass + '">' +
      '<div class="timeline-dot"><span class="material-symbols-outlined" style="font-size:16px;">' + step.icon + '</span></div>' +
      '<div class="timeline-content">' +
        '<div class="timeline-title">' + step.label + '</div>' +
      '</div>' +
    '</div>';
  }).join("") + '</div>';
}

function itemsTableHtml(order) {
  const rows = order.items.map(function(item) {
    const imgSrc = getFoodImage(item.itemName, "");
    return '<tr>' +
      '<td style="display:flex;align-items:center;gap:12px;">' +
        '<img src="' + imgSrc + '" alt="' + escapeHtml(item.itemName) + '" style="width:44px;height:44px;border-radius:10px;object-fit:cover;" onerror="handleImageError(this)">' +
        '<span style="font-weight:600;">' + escapeHtml(item.itemName) + '</span>' +
      '</td>' +
      '<td>' + formatMoney(item.unitPrice) + '</td>' +
      '<td>' + item.quantity + '</td>' +
      '<td style="font-weight:700;color:var(--primary);">' + formatMoney(item.amount) + '</td>' +
    '</tr>';
  }).join("");

  return '<div class="panel" style="padding:0;">' +
      '<h2 style="padding:24px 28px 0;"><span class="material-symbols-outlined" style="font-size:20px;vertical-align:middle;">shopping_bag</span> Ordered Items</h2>' +
      '<div class="table-wrap" style="box-shadow:none;margin-top:16px;">' +
        '<table>' +
          '<thead><tr><th>Item</th><th>Price</th><th>Quantity</th><th>Amount</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>' +
    '</div>';
}

function billSummaryHtml(order, role) {
  const status = order.status;
  let extra = "";

  if (status === "BILLED") {
    extra = '<p><b>Bill Number :</b> ' + order.billNumber + '</p>';
    if (role !== "ADMIN") {
      extra += '<div style="margin-top:16px;"><button class="btn btn-success" onclick="payNow(' + order.id + ')" id="payBtn"><span class="material-symbols-outlined">payment</span> Pay Now</button></div>';
    } else {
      extra += '<p class="bill-note">Waiting for faculty to pay.</p>';
    }
  } else if (status === "PAID") {
    extra = '<p><b>Bill Number :</b> ' + order.billNumber + ' &nbsp; <b>Payment Date &amp; Time :</b> ' + formatDateTime(order.paidTime) + '</p>';
    if (role === "ADMIN") {
      extra += '<div style="margin-top:16px;"><button class="btn btn-success" onclick="markCompleted(' + order.id + ')"><span class="material-symbols-outlined">check_circle</span> Mark Completed</button></div>';
    } else {
      extra += '<p class="bill-note">Waiting for the canteen to close this order.</p>';
    }
  } else if (status === "COMPLETED") {
    extra = '<p><b>Bill Number :</b> ' + order.billNumber + ' &nbsp; <b>Payment Date &amp; Time :</b> ' + formatDateTime(order.paidTime) + '</p>' +
             '<p class="bill-note">This order is complete. Thanks!</p>';
  } else {
    extra = '<p class="bill-note">The bill will be generated by the canteen once your order is received.</p>';
    if (role === "ADMIN" && status === "RECEIVED") {
      extra = '<div style="margin-top:8px;"><button class="btn btn-success" onclick="generateBill(' + order.id + ')"><span class="material-symbols-outlined">receipt</span> Generate Bill</button></div>';
    }
  }

  return '<div class="panel bill-summary">' +
      '<h2 style="margin-top:0;"><span class="material-symbols-outlined" style="font-size:20px;vertical-align:middle;">summarize</span> Bill Summary</h2>' +
      '<p><b>Total Amount :</b> ' + formatMoney(order.totalAmount) + '</p>' +
      extra +
    '</div>';
}

function adminActionsHtml(order) {
  if (order.status === "PLACED") {
    return '<div class="panel"><button class="btn btn-primary" onclick="markDelivered(' + order.id + ')"><span class="material-symbols-outlined">local_shipping</span> Mark Delivered</button></div>';
  }
  if (order.status === "DELIVERED") {
    return '<div class="panel"><button class="btn btn-outline" onclick="markReceived(' + order.id + ')"><span class="material-symbols-outlined">done_all</span> Mark Received</button></div>';
  }
  return "";
}

function renderOrder(order, role) {
  const content = document.getElementById("content");
  content.innerHTML =
    '<div class="panel">' +
      '<div class="detail-line"><b>Order ID :</b> #' + order.id + '</div>' +
      '<div class="detail-line"><b>Order Time :</b> ' + formatDateTime(order.orderTime) + '</div>' +
      (role === "ADMIN" ? '<div class="detail-line"><b>Faculty :</b> ' + escapeHtml(order.facultyName) + '</div>' : "") +
      '<div class="detail-line"><b>Delivery Location :</b> ' + escapeHtml(order.deliveryLocationName) + '</div>' +
      '<div class="detail-line"><b>Status :</b> <span class="status-pill ' + order.status + '">' + order.status + '</span></div>' +
    '</div>' +
    '<div class="panel">' +
      '<h2 style="margin-top:0;"><span class="material-symbols-outlined" style="font-size:20px;vertical-align:middle;">timeline</span> Order Progress</h2>' +
      getStatusTimeline(order.status) +
    '</div>' +
    (role === "ADMIN" ? adminActionsHtml(order) : "") +
    itemsTableHtml(order) +
    billSummaryHtml(order, role);
}

async function loadOrder() {
  const id = getOrderIdFromUrl();
  if (!id) {
    document.getElementById("content").innerHTML = '<div class="empty-state"><div class="empty-icon"><span class="material-symbols-outlined">search_off</span></div><div class="big">No order specified</div></div>';
    return;
  }
  try {
    const order = await api("/api/orders/" + id);
    renderOrder(order, currentUser.role);
  } catch (e) {
    showToast(e.message, true);
  }
}

async function payNow(id) {
  const btn = document.getElementById("payBtn");
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Processing...'; }
  try {
    await api("/api/orders/" + id + "/pay", { method: "PATCH" });
    showToast("Payment confirmed");
    loadOrder();
  } catch (e) {
    showToast(e.message, true);
    if (btn) { btn.disabled = false; btn.innerHTML = '<span class="material-symbols-outlined">payment</span> Pay Now'; }
  }
}

async function markDelivered(id) {
  try {
    await api("/api/orders/" + id + "/deliver", { method: "PATCH" });
    showToast("Marked as delivered");
    loadOrder();
  } catch (e) { showToast(e.message, true); }
}

async function markReceived(id) {
  try {
    await api("/api/orders/" + id + "/receive", { method: "PATCH" });
    showToast("Marked as received");
    loadOrder();
  } catch (e) { showToast(e.message, true); }
}

async function generateBill(id) {
  try {
    await api("/api/orders/" + id + "/bill", { method: "PATCH" });
    showToast("Bill generated");
    loadOrder();
  } catch (e) { showToast(e.message, true); }
}

async function markCompleted(id) {
  try {
    await api("/api/orders/" + id + "/complete", { method: "PATCH" });
    showToast("Order completed");
    loadOrder();
  } catch (e) { showToast(e.message, true); }
}

(async function() {
  currentUser = await requireAuth();
  if (!currentUser) return;
  renderSubnav(currentUser.role);
  await loadOrder();
})();
